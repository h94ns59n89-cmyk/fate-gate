import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import { sha256 } from '@/lib/utils';
import { CHINESE_CITIES, type CityEntry } from '@/data/chinese-cities';

export interface BirthLocation {
  place: string;
  longitude: number;
  latitude: number;
  timezone: number;
  source: 'manual' | 'known-city' | 'geocoder';
  provider: string;
}

interface ResolveBirthLocationInput {
  birthPlace?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  timezone?: number | null;
}

interface GeocodeResult {
  place: string;
  longitude: number;
  latitude: number;
  provider: string;
}

const GEOCODE_TIMEOUT_MS = 5000;
const TIMEZONE_TIMEOUT_MS = 3500;

function normalizePlaceName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[，,。．·•\s]+/g, '')
    .replace(/(市|省|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区|地区|盟|自治州|县|区)$/g, '');
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseTimezoneOffset(value: unknown): number | null {
  if (isFiniteNumber(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return null;

  const normalized = value.trim().replace(/^UTC/i, '').replace(/^GMT/i, '');
  if (normalized === 'Z' || normalized === '+00:00' || normalized === '-00:00') return 0;

  const match = normalized.match(/^([+-]?)(\d{1,2})(?::?(\d{2}))?(?::?(\d{2}))?$/);
  if (!match) return null;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }
  return sign * (hours + minutes / 60 + seconds / 3600);
}

function deriveTimezoneFromLongitude(longitude: number): number {
  const offset = Math.round(longitude / 15);
  return Math.max(-12, Math.min(14, offset));
}

function formatLocationLabel(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

function buildKnownLocation(input: ResolveBirthLocationInput, item: CityEntry): BirthLocation {
  return {
    place: input.birthPlace?.trim() || item.place,
    longitude: item.longitude,
    latitude: item.latitude,
    timezone: isFiniteNumber(input.timezone) ? input.timezone : item.timezone,
    source: 'known-city',
    provider: 'static-table',
  };
}

function matchKnownLocation(input: ResolveBirthLocationInput): BirthLocation | null {
  const place = input.birthPlace?.trim();
  if (!place) return null;

  const normalized = normalizePlaceName(place);
  if (!normalized) return null;

  interface ScoredMatch {
    entry: CityEntry;
    aliasNormalized: string;
    matchIndex: number;
  }

  const scored: ScoredMatch[] = [];
  for (const entry of CHINESE_CITIES) {
    for (const alias of entry.aliases) {
      const aliasNormalized = normalizePlaceName(alias);
      if (!aliasNormalized) continue;

      if (normalized === aliasNormalized) {
        scored.push({ entry, aliasNormalized, matchIndex: 0 });
      } else if (normalized.includes(aliasNormalized)) {
        scored.push({ entry, aliasNormalized, matchIndex: normalized.indexOf(aliasNormalized) });
      } else if (aliasNormalized.includes(normalized)) {
        scored.push({ entry, aliasNormalized, matchIndex: 0 });
      }
    }
  }

  if (scored.length === 0) return null;

  // Pick the best match: later matchIndex = more specific (e.g. 涟源 inside 娄底),
  // tie-break by longer alias = more specific
  scored.sort((a, b) => {
    if (a.matchIndex !== b.matchIndex) return b.matchIndex - a.matchIndex;
    return b.aliasNormalized.length - a.aliasNormalized.length;
  });

  const best = scored[0];
  if (!best) return null;
  return buildKnownLocation(input, best.entry);
}

function buildProgressiveQueries(place: string): string[] {
  const queries: string[] = [place];
  const separators = /(省|市|区|县|镇|乡|街道|村)/g;
  const positions: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = separators.exec(place)) !== null) {
    positions.push(match.index + match[0].length);
  }
  for (let i = positions.length - 1; i >= 0; i--) {
    const truncated = place.substring(0, positions[i]);
    if (truncated !== queries[queries.length - 1]) {
      queries.push(truncated);
    }
  }
  return queries;
}

function parseCoordinateText(value: string): { latitude: number; longitude: number } | null {
  const normalized = value.trim().replace(/[，]/g, ',');
  const match = normalized.match(
    /^([+-]?\d{1,2}(?:\.\d+)?)\s*,\s*([+-]?\d{1,3}(?:\.\d+)?)$/,
  );
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  return { latitude, longitude };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function buildGeocodeUrl(query: string): string {
  const configured = process.env.BIRTH_LOCATION_GEOCODE_URL?.trim();
  if (configured) {
    if (configured.includes('{query}')) {
      return configured.replace('{query}', encodeURIComponent(query));
    }
    const delimiter = configured.includes('?') ? '&' : '?';
    return `${configured}${delimiter}q=${encodeURIComponent(query)}`;
  }

  return `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&accept-language=zh-CN&q=${encodeURIComponent(query)}`;
}

function buildTimezoneUrl(latitude: number, longitude: number): string | null {
  const configured = process.env.BIRTH_LOCATION_TIMEZONE_URL?.trim();
  if (configured) {
    if (configured.includes('{latitude}') || configured.includes('{longitude}')) {
      return configured
        .replace('{latitude}', encodeURIComponent(String(latitude)))
        .replace('{longitude}', encodeURIComponent(String(longitude)));
    }
    const delimiter = configured.includes('?') ? '&' : '?';
    return `${configured}${delimiter}latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}`;
  }

  return `https://timeapi.io/api/TimeZone/coordinate?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}`;
}

async function resolveTimezoneByCoordinate(latitude: number, longitude: number): Promise<number | null> {
  const url = buildTimezoneUrl(latitude, longitude);
  if (!url) return null;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'fate-gate/1.0 (true-solar-time resolver)',
        },
      },
      TIMEZONE_TIMEOUT_MS,
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as Record<string, unknown>;
    const candidates = [
      payload.currentUtcOffset,
      payload.standardUtcOffset,
      payload.utcOffset,
      payload.timeZoneOffset,
      payload.offset,
    ];

    for (const candidate of candidates) {
      const parsed = parseTimezoneOffset(candidate);
      if (parsed !== null) return parsed;
    }

    if (typeof payload.timeZone === 'string') {
      const parsed = parseTimezoneOffset(payload.timeZone);
      if (parsed !== null) return parsed;
    }
  } catch {
    // Fall back to longitude-based estimation below.
  }

  return deriveTimezoneFromLongitude(longitude);
}

async function geocodePlace(place: string): Promise<GeocodeResult | null> {
  const cacheKey = cache.buildKey('BAZI', 'location', sha256(place));
  const cached = await cache.get<GeocodeResult | null>(cacheKey);
  if (cached) return cached;

  const url = buildGeocodeUrl(place);
  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'fate-gate/1.0 (true-solar-time resolver)',
        },
      },
      GEOCODE_TIMEOUT_MS,
    );

    if (!response.ok) return null;

    const payload = await response.json();
    const first = Array.isArray(payload) ? payload[0] : null;
    if (!first) return null;

    const longitude = Number(first.lon ?? first.longitude);
    const latitude = Number(first.lat ?? first.latitude);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

    const address = first.address as Record<string, unknown> | undefined;
    const shortName =
      (typeof address?.city === 'string' && address.city) ||
      (typeof address?.town === 'string' && address.town) ||
      (typeof address?.village === 'string' && address.village) ||
      (typeof address?.county === 'string' && address.county) ||
      (typeof address?.state === 'string' && address.state) ||
      (typeof first.name === 'string' && first.name) ||
      (typeof first.display_name === 'string' && first.display_name) ||
      place;

    const result = {
      place: shortName,
      longitude,
      latitude,
      provider: 'geocoder:nominatim',
    };
    await cache.set(cacheKey, result, CACHE_TTL.BAZI);
    return result;
  } catch {
    return null;
  }
}

async function buildLocationFromCoordinates(
  input: ResolveBirthLocationInput,
  latitude: number,
  longitude: number,
  source: BirthLocation['source'],
  provider: string,
): Promise<BirthLocation> {
  const resolvedTimezone =
    isFiniteNumber(input.timezone) ? input.timezone : await resolveTimezoneByCoordinate(latitude, longitude);

  return {
    place: input.birthPlace?.trim() || formatLocationLabel(latitude, longitude),
    longitude,
    latitude,
    timezone: resolvedTimezone ?? deriveTimezoneFromLongitude(longitude),
    source,
    provider,
  };
}

export async function resolveBirthLocation(
  input: ResolveBirthLocationInput,
): Promise<BirthLocation | null> {
  const latitude = isFiniteNumber(input.latitude) ? input.latitude : null;
  const longitude = isFiniteNumber(input.longitude) ? input.longitude : null;

  if (latitude !== null && longitude !== null) {
    return buildLocationFromCoordinates(input, latitude, longitude, 'manual', 'direct-coordinates');
  }

  const place = input.birthPlace?.trim();
  if (!place) return null;

  const coordinateText = parseCoordinateText(place);
  if (coordinateText) {
    return buildLocationFromCoordinates(
      input,
      coordinateText.latitude,
      coordinateText.longitude,
      'manual',
      'parsed-coordinates',
    );
  }

  // Phase 1: Try static city table first (instant, no API call)
  const knownLocation = matchKnownLocation(input);
  if (knownLocation) return knownLocation;

  // Phase 2: Progressive geocoding (Nominatim or configured provider)
  const queries = buildProgressiveQueries(place);
  let geocoded: GeocodeResult | null = null;
  for (const query of queries) {
    geocoded = await geocodePlace(query);
    if (geocoded) break;
  }

  if (!geocoded) return null;

  const resolvedTimezone =
    isFiniteNumber(input.timezone)
      ? input.timezone
      : await resolveTimezoneByCoordinate(geocoded.latitude, geocoded.longitude);

  return {
    place: geocoded.place,
    longitude: geocoded.longitude,
    latitude: geocoded.latitude,
    timezone: resolvedTimezone ?? deriveTimezoneFromLongitude(geocoded.longitude),
    source: 'geocoder',
    provider: geocoded.provider,
  };
}
