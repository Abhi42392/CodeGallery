// Simplified test version - app/api/send/route.js
import EmailTemplate from '@/app/components/EmailTemplate';
import { generateOTP, storeOTP } from '@/app/lib/otp/otp';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email } = await request.json();
    
    // First, just test if the endpoint works
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'API key not found. Check .env.local' },
        { status: 500 }
      );
    }
    const otp=generateOTP();
    storeOTP(email)
    // Try sending a simple HTML email
    const { data, error } = await resend.emails.send({
      from: 'Onboarding <onboarding@resend.dev>',
      to: ["abhinavbasa427@gmail.com"],
      subject: 'Test Email',
      react: EmailTemplate({ 
        firstName: name,
        otp: otp,
        email: email 
      })
    });

    if (error) {
      console.error('Resend error details:', error);
      return NextResponse.json(
        { success: false, message: error.message, details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Caught error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}