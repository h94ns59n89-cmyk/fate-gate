import { z } from 'zod';
import { PRODUCT_PRICES } from '@/lib/constants';

export const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/;

export const authWechatSchema = z.object({
  code: z.string().min(1, '缺少必填字段: code'),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  invite_code: z.string().optional(),
});

export const baziCalculateSchema = z.object({
  birth_date: z.string().regex(dateStringRegex, '日期格式错误，应为 YYYY-MM-DD'),
  birth_hour: z.number().int().min(0).max(23).nullish(),
  birth_minute: z.number().int().min(0).max(59).nullish(),
  birth_place: z.string().optional(),
  user_id: z.number().optional(),
  gender: z.union([z.literal(0), z.literal(1)]).optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  timezone: z.number().optional(),
  is_solar_calendar: z.boolean().optional(),
});

const productTypeEnum = z.enum(Object.keys(PRODUCT_PRICES) as [string, ...string[]]);

export const ordersCreateSchema = z.object({
  report_id: z.number().optional(),
  product_type: productTypeEnum,
  idempotency_key: z.string().min(1, '缺少幂等键'),
});

export const ordersNotifySchema = z.object({
  xml: z.string().min(1),
});

export const reportsCreateSchema = z.object({
  birth_info_id: z.number({ required_error: '缺少必填字段: birth_info_id' }),
  report_type: z.enum(['free', 'paid']).optional(),
  idempotency_key: z.string().optional(),
});

export const reportsGenerateSchema = z.object({
  bazi_data: z.record(z.unknown(), { required_error: '缺少 bazi_data' }),
});

export const subscriptionsCreateSchema = z.object({
  user_id: z.number({ required_error: '缺少必填字段: user_id' }),
  plan_type: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
});

export const comparisonsCreateSchema = z.object({
  user_id: z.number().optional(),
  target_bazi: z.record(z.unknown(), { required_error: '缺少 target_bazi' }),
  user_bazi: z.record(z.unknown(), { required_error: '缺少 user_bazi' }),
});

export const shareRecordsSchema = z.object({
  user_id: z.number({ required_error: '缺少必填字段: user_id' }),
  share_type: z.string().min(1, '缺少必填字段: share_type'),
  platform: z.string().optional(),
});

export const analyticsEventsSchema = z.object({
  events: z.array(z.object({
    event: z.string(),
    properties: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    timestamp: z.number().optional(),
  })).optional(),
});
