# AI 命理人格系统生产级闭环设计

## 目标

把当前 MVP 从“可验证内测”推进到“可小流量真实收费”的准生产状态。

核心验收标准：

> 用户完成支付后，系统能稳定、可追踪、不可串单地生成并展示属于该用户的正确报告。

## 一期范围

一期只交付 `FULL_REPORT` 完整报告闭环，不扩展合盘付费、订阅、优惠券、运营后台和 PDF 导出。

保留：

- 首页出生信息输入。
- 免费人格摘要。
- 完整报告付费解锁。
- AI 生成摘要和完整报告。
- local/internal 环境下的 mock AI 与 mock pay。

暂缓：

- 合盘商业化。
- 流年订阅。
- 多模型 A/B。
- 运营数据看板。
- 专业版报告。

## 核心业务链路

```text
Guest/User
  -> BirthInfo
  -> BaziCalculation
  -> Free PersonalityReport
  -> Order
  -> Payment Callback
  -> Report Entitlement
  -> Full PersonalityReport
```

任何生产级优化都必须服务于这条链路的稳定性和可追踪性。

## 时间规则决策：启用真太阳时

### 决策

MVP 准生产版本启用真太阳时。

用户输入出生日期、出生时辰、出生地点后，系统应将用户输入的标准时间修正为真太阳时，再进入四柱排盘计算。

### 原因

- PRD 的核心差异化是“精确排盘引擎 + AI 解读分离”。
- 真太阳时是用户感知“专业”和“可信”的关键点之一。
- 早期直接明确计算口径，可以避免后续报告结果大规模变化。

### 计算口径

一期采用：

```text
真太阳时 = 标准时间 + 经度修正 + 均时差修正
```

其中：

- 经度修正：`(出生地经度 - 时区中央经线) * 4 分钟`
- 中国大陆默认时区：`UTC+8`
- UTC+8 中央经线：`120E`
- 均时差：按日期计算 Equation of Time

### 输入要求

生产级链路中，出生地点不再只是展示字段，而是参与计算的必要信息。

最小可行方案：

- 用户输入城市/地点。
- 系统优先解析地名，未命中时再走地理编码和经纬度补录。
- 生产口径不再限定少量城市，所有可解析地点都应支持。

### 数据保存要求

`BirthInfo` 需要保存：

- `birthDate`
- `birthHour`
- `birthMinute`
- `birthPlace`
- `longitude`
- `latitude`
- `timezone`
- `isSolarCalendar`
- `trueSolarTime`
- `trueSolarTimeDeltaMinutes`
- `calculationPolicyVersion`

如果短期不调整数据库结构，至少需要在 `baziJson` 或 `summaryJson` 中保存上述计算元数据。

### 报告展示要求

免费摘要和完整报告中应保留轻量说明：

```text
本报告已根据出生地经度换算真太阳时后排盘。
```

如地点缺失或无法识别：

```text
本次按 UTC+8 标准时间排盘，未启用出生地真太阳时修正。
```

生产收费版本不建议静默降级。若无法启用真太阳时，应阻止付费报告生成或要求用户补充地点。

### 缓存 Key 要求

排盘和报告缓存 key 必须包含真太阳时相关字段：

```text
birthDate
birthHour
birthMinute
longitude
latitude
timezone
isSolarCalendar
gender
trueSolarTimePolicyVersion
promptVersion
```

禁止只使用 `birth_date + birth_hour` 作为生产缓存 key。

### 验收样本

一期准生产至少需要 30 个命理验收样本：

| 样本类型 | 数量 | 关注点 |
| --- | --- | --- |
| 普通日期 | 10 | 四柱基础正确 |
| 节气边界 | 5 | 月柱切换正确 |
| 子时边界 | 5 | 真太阳时修正后是否跨日 |
| 不同经度地点 | 5 | 北京、上海、乌鲁木齐、拉萨、哈尔滨及海外地点差异 |
| 未知时辰 | 5 | 问卷结果与真太阳时策略不冲突 |

每个样本记录：

- 用户输入时间。
- 出生地点和经纬度。
- 真太阳时。
- 修正分钟数。
- 系统四柱。
- 人工参考四柱。
- 是否一致。
- 差异说明。

### Go / No-Go 标准

真太阳时相关严重错误包括：

- 未使用出生地经度却标记为已启用真太阳时。
- 修正后跨时辰但系统仍按原时辰排盘。
- 修正后跨日期但系统未处理日柱边界。
- 缓存命中错误导致不同地点得到同一排盘结果。

准生产 Go 标准：

- 30 个样本全部有计算元数据。
- 严重错误为 0。
- 非严重差异有解释，且经命理顾问确认可接受。

## P0 闭环设计

### 1. 用户身份闭环

目标：

- 所有报告、订单、出生信息必须归属于明确用户。
- 游客可体验，但游客也必须有稳定 `guestUserId`。
- 微信登录后可把游客数据绑定到正式 openid 用户。

关键规则：

- `requireAuth` 不得返回固定用户。
- API 必须从 token/session 中解析真实 `userId`。
- 查询报告、订单、出生信息时必须校验归属。

### 2. 出生信息闭环

目标：

```text
BirthForm
  -> BirthInfo
  -> BaziResult
  -> Free Report
  -> Full Report
```

关键规则：

- `birthInfoId` 禁止写死。
- 每次排盘必须关联真实 `BirthInfo`。
- 同一用户可有多个出生信息，但只有一个当前出生信息。
- 出生信息变更后新建记录，不覆盖历史报告所引用的数据。

### 3. 支付与权益闭环

目标：

```text
Create Order
  -> WeChat Unified Order
  -> Pay Callback
  -> Verify Sign + Amount
  -> Mark Order Paid
  -> Unlock Report Entitlement
```

关键规则：

- 生产环境禁止 mock pay fallback。
- 微信回调必须校验签名、订单号、金额、商品类型、用户归属和订单状态。
- 回调必须幂等。
- 支付成功后必须明确解锁对应报告权益。

建议新增权益概念：

```text
ReportEntitlement
- userId
- reportId
- orderId
- productType
- status
- unlockedAt
```

### 4. 报告生成闭环

目标：

```text
Paid Order
  -> Report PENDING
  -> Generate AI Report
  -> COMPLETED / FAILED
  -> User Polling
```

关键规则：

- 不使用请求内临时异步任务作为生产方案。
- 报告生成状态必须落库。
- 失败必须可重试。
- 用户刷新页面不能丢失生成状态。

一期轻量方案：

```text
POST /reports
  创建 PENDING report

POST /reports/[id]/generate
  校验用户 + 权益
  如果 PENDING/FAILED 则生成
  成功写 COMPLETED
  失败写 FAILED + errorMessage

GET /reports/[id]/status
  前端轮询
```

## P1 工程保障

### Redis

生产必须使用 Redis 处理：

- 限流。
- 幂等。
- nonce 防重放。
- 报告缓存。
- 任务锁。

内存缓存仅允许作为 local fallback。

### 环境隔离

建议环境：

```text
local       本地开发，可 mock
internal    内测，可 mock pay，可真实 AI
staging     预发，真实支付沙箱或低风险配置
production  生产，禁止 mock
```

生产环境启动校验：

- 缺少微信支付配置时启动失败。
- 缺少 JWT secret 时启动失败。
- `NEXT_PUBLIC_ENABLE_MOCK=true` 时启动失败。
- 真太阳时策略版本为空时启动失败。

### 日志与追踪

关键日志字段：

```text
requestId
userId
birthInfoId
reportId
orderNo
transactionId
aiProvider
latencyMs
status
trueSolarTime
trueSolarTimeDeltaMinutes
calculationPolicyVersion
```

## 生产验证门禁

建议新增：

```bash
npm run verify:production
```

包含：

- TypeScript typecheck。
- Vitest 单元测试。
- Next production build。
- 支付签名单测。
- 订单幂等测试。
- 报告归属测试。
- 真太阳时样本测试。
- 报告生成状态机测试。

## 推荐执行顺序

1. 真太阳时规则和样本验收文档。
2. BirthInfo 与报告归属修正。
3. 用户身份闭环。
4. 支付与权益闭环。
5. 报告生成状态机。
6. Redis 与生产幂等。
7. 生产门禁。
8. 分享增长与合盘扩展。

## 当前决策记录

| 日期 | 决策 | 说明 |
| --- | --- | --- |
| 2026-05-27 | MVP 准生产启用真太阳时 | 出生地经纬度参与排盘，缓存和报告需记录计算元数据 |
