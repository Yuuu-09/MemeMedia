import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { isAdmin } from '@/lib/admin-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') || headersList.get('x-matched-path') || ''
  
  // 登录页不需要鉴权
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return <>{children}</>
  }
  
  const authorized = await isAdmin()
  if (!authorized) {
    redirect('/admin/login')
  }
  return <>{children}</>
}
