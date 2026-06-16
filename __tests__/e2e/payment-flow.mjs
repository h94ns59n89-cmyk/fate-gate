// E2E Payment Flow Validation Script
// Run: node __tests__/e2e/payment-flow.mjs
// Requires: dev server on localhost:3000
// DB-dependent tests are skipped when PostgreSQL is unavailable

import { createHash, randomBytes } from 'crypto';

const BASE = 'http://localhost:3000/api/v1';
const TIMEOUT = 20000;

function md5(data) { return createHash('md5').update(data).digest('hex').toUpperCase(); }
function buildSignStr(params) {
  return Object.keys(params).filter(k => params[k] !== '' && k !== 'sign').sort()
    .map(k => `${k}=${params[k]}`).join('&');
}
function md5Sign(params, key) { return md5(`${buildSignStr(params)}&key=${key}`); }

function buildNotifyXml(outTradeNo, transactionId, totalFee, openid) {
  const params = { return_code: 'SUCCESS', out_trade_no: outTradeNo, transaction_id: transactionId, total_fee: String(totalFee), openid };
  const sign = md5Sign(params, 'apiKeyForSign');
  return `<?xml version="1.0"?><xml>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <out_trade_no><![CDATA[${outTradeNo}]]></out_trade_no>
  <transaction_id><![CDATA[${transactionId}]]></transaction_id>
  <total_fee>${totalFee}</total_fee>
  <openid><![CDATA[${openid}]]></openid>
  <sign><![CDATA[${sign}]]></sign>
</xml>`;
}

async function api(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(TIMEOUT) });
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('xml')) return { text: await res.text(), status: res.status };
  return { json: await res.json(), status: res.status };
}

let passed = 0, failed = 0, skipped = 0;
function assert(cond, msg) { if (!cond) { failed++; console.error(`  FAIL: ${msg}`); process.exit(1); } passed++; console.log(`  PASS: ${msg}`); }
function skip(msg) { skipped++; console.log(`  SKIP: ${msg}`); }
function log(label) { console.log(`\n=== ${label} ===`); }

function hostJson(data) { return JSON.stringify(data, null, 2).replace(/\n/g, '\n  '); }

async function hasDb() {
  try {
    const r = await api('/users/guest', { method: 'POST' });
    // Ephemeral path uses Date.now() as user_id; real DB uses auto-increment
    return r.json.data?.user_id < 1000000;
  } catch { return false; }
}

async function main() {
  console.log('E2E Payment Flow Validation\n');

  // 1. Guest login → JWT
  log('1. Guest Login');
  const r1 = await api('/users/guest', { method: 'POST' });
  assert(r1.json.code === 0, 'Guest user created');
  const token = r1.json.data.token || null;
  assert(!!token, 'JWT token issued');
  const userId = r1.json.data.user_id || r1.json.data.id;

  // 2. Bazi calculation
  log('2. Bazi Calculation');
  const r2 = await api('/bazi/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ birth_date: '1990-05-15', birth_hour: 14, birth_minute: 30, gender: 1, is_solar_calendar: true, birth_place: '北京市', timezone: 8 }),
  });
  assert(r2.json.code === 0, 'Returns success');
  assert(!!r2.json.data?.bazi, 'Has bazi pillars');
  assert(!!r2.json.data?.day_master, 'Has day_master');
  assert(!!r2.json.data?.personality_tags, 'Has personality_tags');
  assert(!!r2.json.data?.location, 'Has resolved location');

  // 3. Unauthenticated access denied
  log('3. Auth Enforcement');
  const r3a = await api('/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert(r3a.json.code !== 0, 'Orders endpoint rejects unauthenticated');
  const r3b = await api('/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert(r3b.json.code !== 0, 'Reports endpoint rejects unauthenticated');

  // 4. Zod validation enforcement
  log('4. Zod Validation');
  const r4 = await api('/bazi/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birth_date: 'invalid' }),
  });
  assert(r4.json.code === 100101, 'Invalid input rejected with code 100101');
  assert(!!r4.json.message, 'Has error message');

  // 5. AI Report Generation (mock)
  log('5. AI Report Generation');
  const r5 = await api('/reports/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ bazi_data: { dayMaster: '庚', dayMasterElement: 'earth', pillars: {}, fiveElements: {}, shishen: {}, dayun: {} } }),
  });
  assert(r5.json.code === 0, 'Returns success');
  assert(!!r5.json.data?.report, 'Has report content');
  assert(!!r5.json.data.report.cover, 'Has cover section');
  assert(!!r5.json.data.report.personality, 'Has personality section');

  // 6. Notify XML signature (unit-level validation)
  log('6. Notify XML Signing');
  const xml = buildNotifyXml('FG250609TEST', 'mock_txn_001', 990, 'mock_openid');
  assert(xml.includes('SUCCESS'), 'XML contains SUCCESS');
  assert(xml.includes('<sign>'), 'XML contains computed sign');

  // 7. DB-dependent: order creation + payment + status
  log('7. Payment Flow (DB-dependent)');
  const dbOk = await hasDb();
  if (!dbOk) { skip('PostgreSQL not available'); } else {
    // Create report
    const r7a = await api('/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ birth_info_id: 1, report_type: 'paid', idempotency_key: `e2e_r_${Date.now()}` }),
    });
    assert(r7a.json.code === 0 && !!r7a.json.data?.report_id, 'Report created');
    const reportId = r7a.json.data.report_id;

    // Create order
    const r7b = await api('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ report_id: reportId, product_type: 'FULL_REPORT', idempotency_key: `e2e_o_${Date.now()}` }),
    });
    assert(r7b.json.code === 0 && !!r7b.json.data?.order_no, 'Order created');
    assert(r7b.json.data.amount === 990, 'Amount = ¥9.90');
    assert(r7b.json.data.pay_params?.paySign === 'MOCK_SIGN_FOR_DEV', 'Mock paySign');
    const orderNo = r7b.json.data.order_no;

    // Simulate WeChat notify
    const txId = `e2e_txn_${Date.now()}`;
    const xml = buildNotifyXml(orderNo, txId, 990, 'mock_openid');
    const r7c = await api('/orders/notify', { method: 'POST', headers: { 'Content-Type': 'application/xml' }, body: xml });
    assert(r7c.text.includes('SUCCESS'), 'Notify returns SUCCESS');

    // Verify order PAID
    const r7d = await api(`/orders/${orderNo}`);
    assert(r7d.json.data.status === 'paid', `Order status is 'paid'`);
    assert(r7d.json.data.transaction_id === txId, 'TransactionId matches');

    // Verify report PAID
    const r7e = await api(`/reports/${reportId}`);
    assert(r7e.json.data.report_type === 'paid', 'Report type is paid');

    // Nonce replay protection
    const r7f = await api('/orders/notify', { method: 'POST', headers: { 'Content-Type': 'application/xml' }, body: xml });
    assert(r7f.text.includes('SUCCESS'), 'Replay returns SUCCESS (idempotent)');
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (failed > 0) { console.error('SOME TESTS FAILED'); process.exit(1); }
  console.log('ALL TESTS PASSED');
}

main().catch(err => { console.error(`\nFATAL: ${err.message}`); process.exit(1); });
