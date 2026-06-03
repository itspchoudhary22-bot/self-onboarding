import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set('sales_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Sales logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
