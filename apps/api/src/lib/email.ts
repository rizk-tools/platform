import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail (to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: 'Noreply <hello@rizk.tools>',
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

