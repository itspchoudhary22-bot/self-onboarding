import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import SalesConfig from '@/models/SalesConfig';
import cfg from '@/lib/config';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    await connectDB();

    let config = await SalesConfig.findOne({ key: 'main' });

    // Auto-create from ENV password on first login attempt
    if (!config) {
      const hash = await bcrypt.hash(cfg.salesPortalPassword, 12);
      config = await SalesConfig.create({ key: 'main', passwordHash: hash });
    }

    const isMatch = await bcrypt.compare(password, config.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Create JWT using jose
    const secret = new TextEncoder().encode(cfg.salesJwtSecret);
    const token = await new SignJWT({ role: 'sales' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(`${cfg.salesSessionHours}h`)
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set('sales_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cfg.salesSessionHours * 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sales login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
