export interface BirthLocation {
  place: string;
  longitude: number;
  latitude: number;
  timezone: number;
  source: 'input' | 'city_table';
}

const CITY_COORDINATES: Array<Omit<BirthLocation, 'source'>> = [
  { place: '北京', longitude: 116.4074, latitude: 39.9042, timezone: 8 },
  { place: '上海', longitude: 121.4737, latitude: 31.2304, timezone: 8 },
  { place: '广州', longitude: 113.2644, latitude: 23.1291, timezone: 8 },
  { place: '深圳', longitude: 114.0579, latitude: 22.5431, timezone: 8 },
  { place: '杭州', longitude: 120.1551, latitude: 30.2741, timezone: 8 },
  { place: '南京', longitude: 118.7969, latitude: 32.0603, timezone: 8 },
  { place: '成都', longitude: 104.0665, latitude: 30.5728, timezone: 8 },
  { place: '重庆', longitude: 106.5516, latitude: 29.563, timezone: 8 },
  { place: '武汉', longitude: 114.3054, latitude: 30.5931, timezone: 8 },
  { place: '西安', longitude: 108.9398, latitude: 34.3416, timezone: 8 },
  { place: '天津', longitude: 117.2008, latitude: 39.0842, timezone: 8 },
  { place: '苏州', longitude: 120.5853, latitude: 31.2989, timezone: 8 },
  { place: '青岛', longitude: 120.3826, latitude: 36.0671, timezone: 8 },
  { place: '郑州', longitude: 113.6254, latitude: 34.7466, timezone: 8 },
  { place: '长沙', longitude: 112.9388, latitude: 28.2282, timezone: 8 },
  { place: '厦门', longitude: 118.0894, latitude: 24.4798, timezone: 8 },
  { place: '福州', longitude: 119.2965, latitude: 26.0745, timezone: 8 },
  { place: '哈尔滨', longitude: 126.5349, latitude: 45.8038, timezone: 8 },
  { place: '沈阳', longitude: 123.4315, latitude: 41.8057, timezone: 8 },
  { place: '长春', longitude: 125.3235, latitude: 43.8171, timezone: 8 },
  { place: '济南', longitude: 117.1201, latitude: 36.6512, timezone: 8 },
  { place: '合肥', longitude: 117.2272, latitude: 31.8206, timezone: 8 },
  { place: '南昌', longitude: 115.8579, latitude: 28.682, timezone: 8 },
  { place: '昆明', longitude: 102.8329, latitude: 24.8801, timezone: 8 },
  { place: '贵阳', longitude: 106.6302, latitude: 26.647, timezone: 8 },
  { place: '南宁', longitude: 108.3669, latitude: 22.817, timezone: 8 },
  { place: '海口', longitude: 110.1999, latitude: 20.0442, timezone: 8 },
  { place: '太原', longitude: 112.5489, latitude: 37.8706, timezone: 8 },
  { place: '石家庄', longitude: 114.5149, latitude: 38.0428, timezone: 8 },
  { place: '呼和浩特', longitude: 111.7492, latitude: 40.8426, timezone: 8 },
  { place: '兰州', longitude: 103.8343, latitude: 36.0611, timezone: 8 },
  { place: '银川', longitude: 106.2309, latitude: 38.4872, timezone: 8 },
  { place: '西宁', longitude: 101.7782, latitude: 36.6171, timezone: 8 },
  { place: '乌鲁木齐', longitude: 87.6168, latitude: 43.8256, timezone: 8 },
  { place: '拉萨', longitude: 91.1409, latitude: 29.6456, timezone: 8 },
  { place: '香港', longitude: 114.1694, latitude: 22.3193, timezone: 8 },
  { place: '澳门', longitude: 113.5439, latitude: 22.1987, timezone: 8 },
  { place: '台北', longitude: 121.5654, latitude: 25.033, timezone: 8 },
];

function normalizePlace(place: string): string {
  return place
    .trim()
    .replace(/(市|省|自治区|特别行政区|地区|县|区)$/u, '');
}

export function resolveBirthLocation(params: {
  birthPlace?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  timezone?: number | null;
}): BirthLocation | null {
  const timezone = params.timezone ?? 8;
  const place = params.birthPlace?.trim() ?? '';

  if (
    typeof params.longitude === 'number' &&
    Number.isFinite(params.longitude) &&
    typeof params.latitude === 'number' &&
    Number.isFinite(params.latitude)
  ) {
    return {
      place: place || '手动坐标',
      longitude: params.longitude,
      latitude: params.latitude,
      timezone,
      source: 'input',
    };
  }

  if (!place) return null;

  const normalized = normalizePlace(place);
  const matched = CITY_COORDINATES.find((city) => {
    const cityName = normalizePlace(city.place);
    return normalized === cityName || normalized.includes(cityName) || cityName.includes(normalized);
  });

  return matched ? { ...matched, source: 'city_table' } : null;
}

