import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import FounderShell from '@/components/layout/FounderShell'
import MobileNav from '@/components/shared/MobileNav'

export default async function FounderLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  return (
    <>
      <FounderShell>{children}</FounderShell>
      <MobileNav />
    </>
  )
}
