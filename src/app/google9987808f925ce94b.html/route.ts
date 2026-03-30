import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('google-site-verification: google9987808f925ce94b', {
    headers: { 'Content-Type': 'text/html' },
  })
}
