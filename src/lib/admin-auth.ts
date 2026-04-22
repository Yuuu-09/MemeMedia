import { cookies } from 'next/headers'

const COOKIE_NAME = 'mememedia_admin'
const COOKIE_VALUE = process.env.ADMIN_PASS || 'mememedia2026'

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

export function loginAdmin(pass: string): boolean {
  return pass === (process.env.ADMIN_PASS || 'mememedia2026')
}

export function getAdminCookie() {
  return {
    name: COOKIE_NAME,
    value: COOKIE_VALUE,
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }
}
