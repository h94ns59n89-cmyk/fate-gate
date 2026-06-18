import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '免责声明 - 星隅测试',
};

export default function DisclaimerPage() {
  return (
    <div className="px-4">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-base font-semibold text-[#d4d4d4]">免责声明</h1>
        <p className="text-xs text-[#858585]">最后更新：2026 年 6 月</p>
      </div>

      <div className="vscode-card space-y-4 text-sm text-[#d4d4d4]/80">
        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">1. 内容性质</h2>
          <p>星隅测试提供的所有分析报告、人格标签、五行分析等内容均由 AI 模型基于传统八字命理学算法自动生成，仅供娱乐参考。报告内容不构成任何形式的专业建议。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">2. 非专业建议</h2>
          <p>本服务的报告不应被作为医疗、心理、法律、投资或职业决策的依据。如果您需要专业建议，请咨询相关领域的合格专业人士。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">3. 准确性免责</h2>
          <p>3.1 八字命理学是一门传统学问，其理论和方法存在多种流派解读。我们不对报告的准确性、完整性或适用性做任何保证。</p>
          <p>3.2 AI 生成的内容可能存在偏差或不准确的情况，您应当理性看待分析结果。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">4. 个人责任</h2>
          <p>您理解并同意，使用本服务所产生的任何决策和行动完全属于个人行为，由您自行承担所有风险和后果。我们不对因使用本服务而导致的任何直接或间接损失承担责任。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">5. 第三方内容</h2>
          <p>本服务可能包含第三方平台（如微信）的链接或功能。我们对第三方的内容、服务或隐私实践不承担责任。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">6. 适用法律</h2>
          <p>本免责声明适用中华人民共和国法律。任何争议应通过友好协商解决，协商不成的，提交服务运营方所在地有管辖权的人民法院诉讼解决。</p>
        </section>
      </div>
    </div>
  );
}
