import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0C0F14] px-4 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2.5 no-underline">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500">
          <Zap size={22} color="white" fill="white" />
        </div>
        <span className="bg-gradient-to-br from-violet-500 to-cyan-400 bg-clip-text font-display text-2xl font-bold text-transparent">
          IBF
        </span>
      </Link>

      {children}

      <p className="mt-10 text-xs text-gray-600">
        © 2026 Innovators Bridge Foundry · Free forever
      </p>
    </div>
  )
}
