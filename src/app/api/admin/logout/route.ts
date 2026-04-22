import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('mememedia_admin', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
  })
  return response
}
