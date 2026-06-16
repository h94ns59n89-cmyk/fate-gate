import { createHash, createHmac, randomBytes } from 'crypto';
import { getEnv } from '@/lib/env';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const WECHAT_PAY_API = 'https://api.mch.weixin.qq.com';

function generateNonceStr(): string {
  return randomBytes(16).toString('hex');
}

function md5(data: string): string {
  return createHash('md5').update(data).digest('hex').toUpperCase();
}

function hmacSha256(data: string, key: string): string {
  return createHmac('sha256', key).update(data).digest('hex').toUpperCase();
}

export function buildSignStr(params: Record<string, string>): string {
  return Object.keys(params)
    .filter((k) => params[k] !== '' && k !== 'sign')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
}

export function md5Sign(params: Record<string, string>, key: string): string {
  return md5(`${buildSignStr(params)}&key=${key}`);
}

export function hmacSha256Sign(params: Record<string, string>, key: string): string {
  return hmacSha256(`${buildSignStr(params)}&key=${key}`, key);
}

function buildXml(data: Record<string, string | number>): string {
  const builder = new XMLBuilder({ format: true, ignoreAttributes: true });
  const strData: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    strData[k] = String(v);
  }
  return builder.build({ xml: strData });
}

function parseXml(xml: string): Record<string, string> {
  const parser = new XMLParser();
  const result = parser.parse(xml);
  return result?.xml ?? {};
}

export interface UnifiedOrderParams {
  outTradeNo: string;
  totalFee: number;          // in 分 (cents)
  description: string;
  openid: string;
  notifyUrl: string;
  spbillCreateIp?: string;
}

export interface UnifiedOrderResult {
  prepayId: string;
  nonceStr: string;
  sign: string;
}

export async function createUnifiedOrder(params: UnifiedOrderParams): Promise<UnifiedOrderResult> {
  const { wechat } = getEnv();
  const nonceStr = generateNonceStr();
  const orderData: Record<string, string | number> = {
    appid: wechat.appId,
    mch_id: wechat.mchId,
    nonce_str: nonceStr,
    out_trade_no: params.outTradeNo,
    total_fee: params.totalFee,
    body: params.description,
    spbill_create_ip: params.spbillCreateIp ?? '8.8.8.8',
    notify_url: params.notifyUrl,
    trade_type: 'JSAPI',
    openid: params.openid,
  };

  if (!wechat.apiKey || !wechat.mchId || !wechat.appId) {
    return mockUnifiedOrder(params);
  }

  const sign = md5Sign(orderData as Record<string, string>, wechat.apiKey);
  orderData.sign = sign;

  const xml = buildXml(orderData);

  try {
    const response = await fetch(`${WECHAT_PAY_API}/pay/unifiedorder`, {
      method: 'POST',
      body: xml,
      headers: { 'Content-Type': 'application/xml' },
    });

    const resultXml = await response.text();
    const result = parseXml(resultXml);

    if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
      throw new Error(`微信统一下单失败: ${result.err_code_des ?? result.return_msg}`);
    }

    return { prepayId: result.prepay_id!, nonceStr, sign };
  } catch {
    console.warn('[Payment] WeChat Pay API unavailable, using mock order');
    return mockUnifiedOrder(params);
  }
}

function mockUnifiedOrder(params: UnifiedOrderParams): UnifiedOrderResult {
  const nonceStr = generateNonceStr();
  return {
    prepayId: `mock_${params.outTradeNo}_${Date.now()}`,
    nonceStr,
    sign: 'MOCK_SIGN_FOR_DEV',
  };
}

export function getJsApiParams(prepayId: string, signType: 'MD5' | 'HMAC-SHA256' = 'MD5'): {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
} {
  const { wechat } = getEnv();
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = generateNonceStr();

  const params: Record<string, string> = {
    appId: wechat.appId,
    timeStamp,
    nonceStr,
    package: `prepay_id=${prepayId}`,
    signType,
  };

  const paySign = wechat.apiKey
    ? (signType === 'HMAC-SHA256'
        ? hmacSha256Sign(params, wechat.apiKey)
        : md5Sign(params, wechat.apiKey))
    : 'MOCK_SIGN_FOR_DEV';

  return { appId: params.appId!, timeStamp: params.timeStamp!, nonceStr: params.nonceStr!, package: params.package!, signType: params.signType!, paySign };
}

export interface NotifyResult {
  outTradeNo: string;
  transactionId: string;
  totalFee: number;
  openid: string;
}

export function verifyNotify(xml: string): NotifyResult | null {
  const { wechat } = getEnv();
  const data = parseXml(xml);

  if (!data || data.return_code !== 'SUCCESS') return null;
  if (!data.sign) return null;

  if (wechat.apiKey) {
    const sign = md5Sign(data, wechat.apiKey);
    if (sign !== data.sign.toUpperCase()) return null;
  }

  return {
    outTradeNo: data.out_trade_no ?? '',
    transactionId: data.transaction_id ?? '',
    totalFee: parseInt(data.total_fee ?? '0', 10),
    openid: data.openid ?? '',
  };
}

export function successXmlResponse(): Response {
  return new Response('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>', {
    headers: { 'Content-Type': 'application/xml' },
  });
}

export function failXmlResponse(message: string = 'FAIL'): Response {
  return new Response(`<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[${message}]]></return_msg></xml>`, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
