import { Resend } from 'resend';

const resend = new Resend('re_123456789');

export async function sendEmail (to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error(error);
    throw new Error('Failed to send email');
  }

  return data;
}

