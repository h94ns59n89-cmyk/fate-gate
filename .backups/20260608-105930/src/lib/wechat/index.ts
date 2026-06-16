import { createHash, createHmac } from 'crypto';
import { getEnv } from '@/lib/env';

interface WechatLoginResult {
  openid: string;
  unionid?: string;
  session_key: string;
}

export async function wechatCode2Session(code: string): Promise<WechatLoginResult> {
  const env = getEnv();
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', env.wechat.appId);
  url.searchParams.set('secret', env.wechat.appSecret);
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg} (${data.errcode})`);
  }

  return {
    openid: data.openid,
    unionid: data.unionid,
    session_key: data.session_key,
  };
}

export function generatePaySign(params: Record<string, string>): string {
  const env = getEnv();
  const sortedKeys = Object.keys(params).sort();
  const stringA = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
  const stringSignTemp = `${stringA}&key=${env.wechat.apiKey}`;
  return createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}

export function verifyPaySign(xml: string, sign: string): boolean {
  const env = getEnv();
  const stringSignTemp = `${xml}&key=${env.wechat.apiKey}`;
  const calculated = createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  return calculated === sign;
}

export function generateNonceStr(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function verifySignature(
  method: string,
  path: string,
  body: string,
  timestamp: string,
  nonce: string,
  sign: string,
  secret: string,
): boolean {
  const message = `${method.toUpperCase()}${path}${body}${timestamp}${nonce}`;
  const expected = createHmac('sha256', secret).update(message).digest('hex');
  return expected === sign;
}
