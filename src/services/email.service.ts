import { Resend } from 'resend';

// Use a fallback key or dummy if not available in env
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_just_for_local');

export const EmailService = {
  async sendOTP(email: string, otp: string) {
    console.log(`[EmailService] Sending OTP ${otp} to ${email}`);
    
    // In local development or if using dummy key, we just log it
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EmailService] SKIPPED: No RESEND_API_KEY found in env.`);
      return { id: 'mock-id' };
    }

    try {
      const data = await resend.emails.send({
        from: 'Barber Express <onboarding@resend.dev>',
        to: email,
        subject: 'Kode Verifikasi Anda - Barber Express',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #b45309; text-align: center;">Verifikasi Akun Anda</h2>
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar di Barber Express. Silakan masukkan kode berikut untuk memverifikasi alamat email Anda:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <h1 style="letter-spacing: 5px; margin: 0; color: #1f2937;">${otp}</h1>
            </div>
            <p>Kode ini berlaku selama 15 menit.</p>
            <p>Jika Anda tidak merasa mendaftar di Barber Express, abaikan email ini.</p>
          </div>
        `,
      });
      return data;
    } catch (error) {
      console.error("[EmailService] Failed to send email via Resend:", error);
      throw error;
    }
  }
};
