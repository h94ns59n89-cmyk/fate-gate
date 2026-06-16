import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户协议 - 星隅测试',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 pb-[60px] pt-14">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-base font-semibold text-[#d4d4d4]">用户协议</h1>
        <p className="text-xs text-[#858585]">最后更新：2026 年 6 月</p>
      </div>

      <div className="vscode-card space-y-4 text-sm text-[#d4d4d4]/80">
        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">1. 服务说明</h2>
          <p>
            星隅测试（以下简称「本服务」）是一款基于中国传统八字命理学的 AI 分析工具。用户输入出生信息后，系统通过算法计算并生成个性化的人格分析报告。本服务由 AI 模型辅助生成内容，所有结果仅供参考。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">2. 用户账户</h2>
          <p>2.1 您可以通过微信授权或游客模式使用本服务。游客模式下，您的数据将仅保存在本地设备上。</p>
          <p>2.2 您需确保提供的出生信息真实准确。因信息错误导致的分析偏差，本服务不承担责任。</p>
          <p>2.3 每个用户在同一时间只能拥有一个活跃账户。禁止重复注册或滥用服务。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">3. 付费服务</h2>
          <p>3.1 部分高级报告为付费内容，付费后永久可查。当前定价为：完整报告 ¥9.9，合盘对比 ¥9.9，月度订阅 ¥19.9，年度订阅 ¥49.9。</p>
          <p>3.2 支付通过微信支付完成。成功支付后不支持退款，除非因服务方原因导致无法查看报告。</p>
          <p>3.3 订阅服务将在到期后自动续费，您可随时在个人中心取消自动续费。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">4. 用户行为规范</h2>
          <p>4.1 您承诺不会利用本服务进行任何违法活动，包括但不限于传播色情、暴力、赌博等违法信息。</p>
          <p>4.2 禁止对本服务进行逆向工程、抓取、攻击或干扰系统正常运行。</p>
          <p>4.3 违反本协议可能导致账户被封禁，已支付的费用不予退还。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">5. 免责声明</h2>
          <p>5.1 本服务生成的报告内容由 AI 模型辅助生成，仅供娱乐参考，不构成任何专业建议（包括但不限于医疗、法律、投资建议）。</p>
          <p>5.2 本服务不对报告的准确性、完整性或适用性做任何明示或暗示的保证。</p>
          <p>5.3 因不可抗力因素导致的服务中断，本服务不承担责任。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">6. 知识产权</h2>
          <p>6.1 本服务相关的软件、算法、设计、内容的全部知识产权归运营方所有。</p>
          <p>6.2 未经书面许可，禁止复制、修改、传播本服务的任何内容。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">7. 协议变更</h2>
          <p>我们有权根据需要修改本协议。修改后的协议将在页面公示后生效。如您继续使用本服务，视为接受修改后的协议。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#d4d4d4]">8. 联系我们</h2>
          <p>如您对本协议有任何疑问，请通过应用内的反馈渠道联系我们。</p>
        </section>
      </div>
    </div>
  );
}
