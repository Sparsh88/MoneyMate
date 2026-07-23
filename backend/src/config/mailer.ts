import nodemailer from 'nodemailer';

const isMailConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_HOST !== 'localhost' &&
  process.env.SMTP_USER &&
  process.env.SMTP_USER !== 'mock';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  if (!isMailConfigured) {
    console.log('\n================== EMAIL SIMULATOR ==================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------ Content ------------------');
    // Strip HTML tags for clean console output
    console.log(html.replace(/<[^>]*>/g, '').trim());
    console.log('=====================================================\n');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"MoneyMate" <noreply@moneymate.com>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Mailer Error: ${(error as Error).message}`);
    // Do not crash the application, log error and allow flow to proceed
  }
};
