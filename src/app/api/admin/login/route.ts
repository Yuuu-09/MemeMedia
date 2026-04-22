import { NextResponse } from 'next/server'
import { loginAdmin, getAdminCookie } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    console.log('[API Login] Received request')
    const { password } = await request.json()
    console.log('[API Login] Password length:', password?.length)

    if (!loginAdmin(password)) {
      console.log('[API Login] Invalid password')
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    console.log('[API Login] Password valid, setting cookie')
    const response = NextResponse.json({ success: true })
    const cookie = getAdminCookie()
    console.log('[API Login] Cookie config:', { name: cookie.name, valueLength: cookie.value.length, path: cookie.path, sameSite: cookie.sameSite })
    response.cookies.set(cookie)

    return response
  } catch (err) {
    console.error('[API Login] Error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
