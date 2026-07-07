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

export interface PastTendency {
  summary: string;
  detail?: string;
}

export interface PersonalityTags {
  personality_tags: string[];
  core_traits: string[];
  life_theme: string;
  five_elements_summary: string;
  past_tendencies?: string[];
}

export interface CoverSection {
  title: string;
  subtitle: string;
  day_master: string;
  life_theme: string;
  generated_at: string;
}

export interface PersonalitySection {
  day_master: string;
  wang_shuai: string;
  yong_shen: string;
  ji_shen: string;
  type: string;
  core_traits: string[];
  five_elements: string;
  strengths: string[];
  growth_areas: string[];
  past_tendency: string;
}

export interface CareerSection {
  suitable_directions: string[];
  avoid_directions: string[];
  advice: string;
  past_tendency: string;
}

export interface RelationshipsSection {
  communication_style: string;
  compatibility: string[];
  advice: string;
  past_tendency: string;
}

export interface HealthSection {
  focus_areas: string[];
  advice: string;
  past_tendency: string;
}

export interface CurrentYearSection {
  overall: string;
  career: string;
  wealth: string;
  relationships: string;
  health: string;
  advice: string;
  lucky_aspects: string[];
}

export interface DecadeTrendSection {
  age_range: string;
  gan_zhi: string;
  element: string;
  focus: string;
  advice: string;
}

export interface SelfImprovementSection {
  directions: string[];
  focus_star: string;
  mindset_shift: string;
  book_suggestions: string[];
}

export interface GlossaryEntry {
  meaning: string;
  your_chart: string;
  why_it_matters: string;
}

export interface FooterSection {
  disclaimer: string;
  version: string;
}

export interface FullReport {
  cover: CoverSection;
  personality: PersonalitySection;
  career: CareerSection;
  relationships: RelationshipsSection;
  health: HealthSection;
  current_year: CurrentYearSection;
  decade_trend: DecadeTrendSection;
  self_improvement: SelfImprovementSection;
  glossary: Record<string, GlossaryEntry>;
  footer: FooterSection;
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
