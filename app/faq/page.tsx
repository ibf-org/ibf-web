import Link from 'next/link'

export const metadata = {
  title: 'FAQ — IBF',
  description: 'Frequently asked questions about IBF — Innovators Bridge Foundry.',
}

const FAQS = [
  { q: 'Is IBF really free?', a: 'Yes! IBF MVP is 100% free for both founders and students. No subscriptions, no payment methods required. We want to focus on proving the core product works before thinking about monetization.' },
  { q: 'Who is IBF for?', a: 'IBF has two primary users: startup founders who need to build or grow their teams, and students/recent grads who want real-world startup experience. If you\'re a founder with a project, or a student with skills to offer, IBF is for you.' },
  { q: 'How does applying to a role work?', a: 'Students browse projects on the Discover page, filter by skills and categories, and click "Apply Now" on any open role. You can write an optional cover note (up to 500 characters), then submit. The founder receives an email notification and reviews applications in their inbox.' },
  { q: 'What happens when a founder accepts my application?', a: 'You\'ll receive an email notification and an in-app notification. You\'ll be added to the project\'s team, and a private chat channel will be created for the team automatically through IBF\'s community chat.' },
  { q: 'How many projects can a founder post?', a: 'In the MVP, founders can post multiple projects. Each project can have up to 5 open roles. There is no hard cap on the number of projects in the MVP.' },
  { q: 'Can I apply to multiple roles?', a: 'Yes, but you can have a maximum of 10 active (pending or reviewing) applications at any time. This keeps the quality of applications high and ensures you\'re thoughtful about which roles you apply to.' },
  { q: 'Is there a mobile app?', a: 'Not yet. IBF is currently a responsive web application that works well on both desktop and mobile browsers. A dedicated mobile app is planned for a future version.' },
  { q: 'How does the community chat work?', a: 'IBF uses Stream Chat to power real-time messaging. Once you sign in, you can access the chat from the navigation bar. Project-specific channels are automatically created when a student is accepted to a role.' },
  { q: 'What if I have a bug or feature request?', a: 'We\'re in MVP mode, so feedback is gold! Reach out through the community chat or email us directly. Every piece of feedback goes straight to the team.' },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-ibf-bg font-['Bricolage_Grotesque',sans-serif]">
      <nav className="flex items-center justify-between border-b border-ibf-border px-10 py-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-cyan-500 text-sm">⚡</div>
          <span className="bg-gradient-to-br from-violet-600 to-cyan-500 bg-clip-text font-display text-lg font-bold text-transparent">IBF</span>
        </Link>
        <Link href="/sign-up" className="btn-primary px-4 py-2 text-sm">Get Started</Link>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-2 font-display text-4xl font-extrabold text-[#f0f0ff]">
          Frequently Asked Questions
        </h1>
        <p className="mb-12 text-base text-ibf-hint">Everything you need to know about IBF.</p>

        <div className="flex flex-col gap-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-ibf-border bg-[#0d0d1a] px-6 py-5">
              <h3 className="mb-2 flex items-start gap-2 font-display text-base font-bold text-[#f0f0ff]">
                <span className="shrink-0 text-violet-600">Q.</span> {faq.q}
              </h3>
              <p className="m-0 pl-[22px] text-sm leading-relaxed text-ibf-muted">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-ibf-border bg-[#0d0d1a] p-8 text-center">
          <h2 className="mb-2 font-display text-2xl font-bold text-[#f0f0ff]">Still have questions?</h2>
          <p className="mb-5 text-sm text-ibf-hint">Join the platform and ask in the community chat — we respond fast.</p>
          <Link href="/sign-up" className="btn-primary px-7 py-3 text-base">
            Join IBF Free
          </Link>
        </div>
      </div>
    </div>
  )
}
