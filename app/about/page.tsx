import Link from 'next/link'

export const metadata = {
  title: 'About — IBF',
  description: 'IBF (Innovators Bridge Foundry) connects startup founders with talented students. Learn more about our mission.',
}

export default function AboutPage() {
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
        <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight text-[#f0f0ff]">
          About <span className="bg-gradient-to-br from-violet-600 to-cyan-500 bg-clip-text text-transparent">IBF</span>
        </h1>
        <p className="mb-12 text-lg leading-relaxed text-ibf-muted">
          Whether you&apos;re a student looking for an exciting new challenge or a founder searching for your missing puzzle piece, 
          IBF gives you the tools to succeed.
        </p>

        {[
          { title: 'Our Mission', body: 'IBF exists to bridge the gap between ambitious startup founders who need talent and talented students who crave real-world experience. We believe the best way to learn is by building — and the best startups are built by diverse, motivated teams.' },
          { title: 'Why IBF?', body: 'Hiring is broken for early-stage startups, and internships are often inaccessible for students outside top universities. IBF removes both barriers. Founders can post open roles and get matched with skilled students instantly. Students can discover exciting projects filtered by their exact skills and apply in seconds.' },
          { title: 'MVP Philosophy', body: 'IBF v1.0 is 100% free — no subscriptions, no paywalls. Our goal is to validate the core product loop: Founder posts project → Student discovers and applies → Founder accepts → Team builds together. Get on the platform, find your team, and build something great.' },
          { title: 'The Three Spaces', body: 'IBF has three purpose-built areas: Founder Space for posting projects and managing applications, Student Space for discovering opportunities and tracking applications, and Community Chat powered by Stream for real-time collaboration across the platform.' },
        ].map(s => (
          <div key={s.title} className="mb-10">
            <h2 className="mb-3 font-display text-2xl font-bold text-[#f0f0ff]">{s.title}</h2>
            <p className="m-0 text-base leading-relaxed text-ibf-muted">{s.body}</p>
          </div>
        ))}

        <div className="mt-12 text-center">
          <Link href="/sign-up" className="btn-primary px-8 py-3.5 text-base">
            Join IBF — It&apos;s Free
          </Link>
        </div>
      </div>
    </div>
  )
}
