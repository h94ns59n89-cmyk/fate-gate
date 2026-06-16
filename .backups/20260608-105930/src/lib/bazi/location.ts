import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import { sha256 } from '@/lib/utils';

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

const KNOWN_LOCATIONS: Array<{
  aliases: string[];
  place: string;
  longitude: number;
  latitude: number;
  timezone: number;
}> = [
  { aliases: ['北京', '北京市', 'beijing'], place: '北京', longitude: 116.4074, latitude: 39.9042, timezone: 8 },
  { aliases: ['上海', '上海市', 'shanghai'], place: '上海', longitude: 121.4737, latitude: 31.2304, timezone: 8 },
  { aliases: ['广州', '广州市', 'guangzhou'], place: '广州', longitude: 113.2644, latitude: 23.1291, timezone: 8 },
  { aliases: ['深圳', '深圳市', 'shenzhen'], place: '深圳', longitude: 114.0579, latitude: 22.5431, timezone: 8 },
  { aliases: ['杭州', '杭州市', 'hangzhou'], place: '杭州', longitude: 120.1551, latitude: 30.2741, timezone: 8 },
  { aliases: ['成都', '成都市', 'chengdu'], place: '成都', longitude: 104.0665, latitude: 30.5728, timezone: 8 },
  { aliases: ['重庆', '重庆市', 'chongqing'], place: '重庆', longitude: 106.5516, latitude: 29.563, timezone: 8 },
  { aliases: ['西安', '西安市', 'xian'], place: '西安', longitude: 108.9398, latitude: 34.3416, timezone: 8 },
  { aliases: ['武汉', '武汉市', 'wuhan'], place: '武汉', longitude: 114.3054, latitude: 30.5928, timezone: 8 },
  { aliases: ['南京', '南京市', 'nanjing'], place: '南京', longitude: 118.7969, latitude: 32.0603, timezone: 8 },
  { aliases: ['苏州', '苏州市', 'suzhou'], place: '苏州', longitude: 120.5853, latitude: 31.2989, timezone: 8 },
  { aliases: ['天津', '天津市', 'tianjin'], place: '天津', longitude: 117.3616, latitude: 39.3434, timezone: 8 },
  { aliases: ['长沙', '长沙市', 'changsha'], place: '长沙', longitude: 112.9388, latitude: 28.2282, timezone: 8 },
  { aliases: ['昆明', '昆明市', 'kunming'], place: '昆明', longitude: 102.8329, latitude: 24.8801, timezone: 8 },
  { aliases: ['哈尔滨', '哈尔滨市', 'harbin'], place: '哈尔滨', longitude: 126.5349, latitude: 45.8038, timezone: 8 },
  { aliases: ['沈阳', '沈阳市', 'shenyang'], place: '沈阳', longitude: 123.4315, latitude: 41.8057, timezone: 8 },
  { aliases: ['青岛', '青岛市', 'qingdao'], place: '青岛', longitude: 120.3826, latitude: 36.0671, timezone: 8 },
  { aliases: ['厦门', '厦门市', 'xiamen'], place: '厦门', longitude: 118.0894, latitude: 24.4798, timezone: 8 },
  { aliases: ['乌鲁木齐', '乌鲁木齐市', 'wulumuqi', 'urumqi'], place: '乌鲁木齐', longitude: 87.6168, latitude: 43.8256, timezone: 8 },
  { aliases: ['香港', 'hong kong', 'hongkong'], place: '香港', longitude: 114.1694, latitude: 22.3193, timezone: 8 },
  { aliases: ['澳门', 'macau', 'macao'], place: '澳门', longitude: 113.5439, latitude: 22.1987, timezone: 8 },
  { aliases: ['台北', '台北市', 'taipei'], place: '台北', longitude: 121.5654, latitude: 25.033, timezone: 8 },
];

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

function buildKnownLocation(input: ResolveBirthLocationInput, item: (typeof KNOWN_LOCATIONS)[number]): BirthLocation {
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

  const matched = KNOWN_LOCATIONS.find((location) =>
    location.aliases.some((alias) => {
      const aliasNormalized = normalizePlaceName(alias);
      return (
        normalized === aliasNormalized ||
        normalized.includes(aliasNormalized) ||
        aliasNormalized.includes(normalized)
      );
    }),
  );

  return matched ? buildKnownLocation(input, matched) : null;
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

  const knownLocation = matchKnownLocation(input);
  if (knownLocation) return knownLocation;

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

  const geocoded = await geocodePlace(place);
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
