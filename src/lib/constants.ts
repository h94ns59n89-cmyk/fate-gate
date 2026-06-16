export const PRODUCT_PRICES = {
  FULL_REPORT: 990,
  COMPARISON: 990,
  SUBSCRIPTION_MONTHLY: 1990,
  SUBSCRIPTION_YEARLY: 4990,
  PROFESSIONAL: 9900,
} as const;

export const CACHE_TTL = {
  BAZI: 86400 * 7,
  REPORT_FREE: 86400 * 7,
  REPORT_FULL: 86400 * 7,
  OG_IMAGE: 86400 * 30,
  IDEMPOTENT: 3600,
  NONCE: 300,
  LOCK: 10,
} as const;

export const RATE_LIMITS = {
  GLOBAL: { window: 60, max: 5000 },
  IP: { window: 60, max: 60 },
  USER: { window: 60, max: 120 },
  API: {
    AUTH: { window: 60, max: 30 },
    BAZI: { window: 60, max: 30 },
    REPORT: { window: 60, max: 10 },
    ORDER: { window: 60, max: 5 },
  },
} as const;

export const ERROR_CODES = {
  VALIDATION: {
    DATE_FORMAT: { code: 100101, message: '日期格式错误，应为 YYYY-MM-DD' },
    HOUR_RANGE: { code: 100102, message: '时辰超出 0-23 范围' },
    PLACE_NOT_FOUND: { code: 100103, message: '地点不存在' },
    MISSING_FIELD: { code: 100104, message: '缺少必填字段' },
    DATE_RANGE: { code: 100201, message: '出生日期超出范围 (1900-2100)' },
  },
  AUTH: {
    TOKEN_EXPIRED: { code: 200101, message: 'Token 已过期' },
    TOKEN_INVALID: { code: 200102, message: 'Token 无效' },
    FORBIDDEN: { code: 200201, message: '无权操作' },
  },
  RESOURCE: {
    GENERATING: { code: 300101, message: '报告正在生成中' },
    NOT_FOUND: { code: 300102, message: '报告不存在' },
    CONFLICT: { code: 300201, message: '操作冲突，请刷新重试' },
  },
  PAYMENT: {
    ORDER_EXPIRED: { code: 400101, message: '订单已过期' },
    PAY_FAILED: { code: 400102, message: '支付失败' },
    AMOUNT_ERROR: { code: 400103, message: '金额异常' },
  },
  SYSTEM: {
    BAZI_ERROR: { code: 500101, message: '排盘引擎异常' },
    AI_ERROR: { code: 500102, message: 'AI 解读服务不可用' },
    CARD_ERROR: { code: 500103, message: '卡片生成失败' },
    UNKNOWN: { code: 500999, message: '未知系统错误' },
  },
  EXTERNAL: {
    AI_TIMEOUT: { code: 600101, message: 'AI 服务超时' },
    WECHAT_ERROR: { code: 600201, message: '微信 API 异常' },
    RATE_LIMITED: { code: 600301, message: '外部接口限流' },
  },
} as const;

export const HOUR_LABELS = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const;

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

export const EARTHLY_BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const;

export const FIVE_ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
