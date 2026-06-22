import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 - 星隅测试',
};

export default function PrivacyPage() {
  return (
    <div className="px-4">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-base font-semibold text-[#1F1D2B]">隐私政策</h1>
        <p className="text-xs text-[#6B6778]">最后更新：2026 年 6 月</p>
      </div>

      <div className="vscode-card space-y-4 text-sm text-[#1F1D2B]/80">
        <section className="space-y-2">
          <h2 className="font-semibold text-[#1F1D2B]">1. 信息收集</h2>
          <p>我们收集以下类型的信息以提供服务：</p>
          <p>1.1 <strong>出生信息</strong>：出生日期、时辰、出生地点，用于八字排盘计算。</p>
          <p>1.2 <strong>微信信息</strong>：当您使用微信登录时，我们获取您的微信昵称、头像和 OpenID。</p>
          <p>1.3 <strong>使用数据</strong>：页面访问、功能使用情况等匿名统计数据，用于改善服务体验。</p>
          <p>1.4 <strong>设备信息</strong>：IP 地址、浏览器类型等基本信息，用于安全防滥用。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#1F1D2B]">2. 信息使用</h2>
          <p>您的信息仅用于以下目的：</p>
          <p>2.1 提供八字排盘和 AI 人格分析服务。</p>
          <p>2.2 处理支付事务。</p>
          <p>2.3 改善和优化服务算法。</p>
          <p>2.4 防止滥用和保障系统安全。</p>
          <p>我们不会将您的个人信息用于任何与上述目的无关的用途。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#1F1D2B]">3. 信息存储与保护</h2>
          <p>3.1 您的数据存储于安全的云服务器上，采用行业标准的加密措施保护数据传输和存储。</p>
          <p>3.2 我们仅在提供服务所需的期限内保留您的数据。您删除账户后，相关数据将在 30 天内清除。</p>
          <p>3.3 游客模式下生成的报告仅保存在本地设备，我们不会在服务器端存储。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#1F1D2B]">4. 信息共享</h2>
          <p>4.1 我们不会将您的个人信息出售给第三方。</p>
          <p>4.2 我们可能会与以下类型的服务提供商共享必要的信息：微信支付（处理支付）、云服务提供商（托管数据）。</p>
          <p>4.3 在法律要求或保护合法权益必要时，我们可能会披露您的信息。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#1F1D2B]">5. 您的权利</h2>
          <p>5.1 您有权查看、修改您的个人信息。</p>
          <p>5.2 您有权要求删除您的账户及相关数据。</p>
          <p>5.3 您有权拒绝我们将您的数据用于分析改进，但这可能影响服务体验。</p>
          <p>5.4 您可以通过应用内设置或联系我们来行使上述权利。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#1F1D2B]">6. 政策更新</h2>
          <p>我们可能会不定期更新本隐私政策。重大变更将通过在应用内通知的方式告知您。</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-[#1F1D2B]">7. 联系方式</h2>
          <p>如您对隐私政策有任何疑问或顾虑，请通过应用内的反馈渠道联系我们。</p>
        </section>
      </div>
    </div>
  );
}
