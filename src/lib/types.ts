export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  request_id: string;
  timestamp: number;
  data: T | null;
  detail?: Record<string, unknown>;
}

export interface PaginatedData<T> {
  items: T[];
  page_token?: string;
  next_page_token?: string;
  total: number;
}

export interface Pillar {
  heavenly: string;
  earthly: string;
  hidden_stems: string[];
}

export interface BaziResult {
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  calculation_meta?: BaziCalculationMeta;
}

export interface ElementScore {
  score: number;
  status: '旺' | '偏旺' | '中和' | '偏弱' | '弱';
}

export interface FiveElements {
  wood: ElementScore;
  fire: ElementScore;
  earth: ElementScore;
  metal: ElementScore;
  water: ElementScore;
}

export interface BaziCalculationMeta {
  input_time: string;
  true_solar_time: string;
  true_solar_delta_minutes: number;
  longitude: number | null;
  latitude: number | null;
  timezone: number;
  policy_version: string;
  enabled_true_solar_time: boolean;
}

export interface PersonalityTags {
  personality_tags: string[];
  core_traits: string[];
  life_theme: string;
  five_elements_summary: string;
}

export interface FullReport {
  cover: Record<string, unknown>;
  personality: Record<string, unknown>;
  career: Record<string, unknown>;
  relationships: Record<string, unknown>;
  health: Record<string, unknown>;
  current_year: Record<string, unknown>;
  decade_trend: Record<string, unknown>;
  self_improvement: Record<string, unknown>;
  glossary: Record<string, unknown>;
  footer: Record<string, unknown>;
}

export interface ComparisonResult {
  overall_match: number;
  dimensions: Record<string, number>;
  complementarity: string;
  strengths: string[];
  potential_conflicts: string[];
  advice: string;
  summary_tag: string;
}

export interface TimeGuessResult {
  hour: number;
  label: string;
  element: string;
  confidence: number;
}

export interface WechatPayParams {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

export interface UserProfile {
  id: number;
  nickname: string | null;
  avatar_url: string | null;
  is_new_user: boolean;
  has_report: boolean;
  report_count: number;
}

export interface ReportSummary {
  id: number;
  report_type: string;
  status: string;
  created_at: string;
}

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'unavailable';
  version: string;
  uptime_seconds: number;
  checks: Record<string, { status: string; latency_ms?: number; error?: string }>;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  timestamp: string;
  service: string;
  trace_id?: string;
  message: string;
  [key: string]: unknown;
}
