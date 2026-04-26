import nodemailer from "nodemailer";

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: port === 465,
  };
}

export function isMailerConfigured() {
  return Boolean(getMailerConfig());
}

export async function sendOtpEmail({
  to,
  code,
  portal,
  expiresInMinutes,
}: {
  to: string;
  code: string;
  portal: "user" | "admin";
  expiresInMinutes: number;
}) {
  const config = getMailerConfig();

  if (!config) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[DEV OTP] ${portal.toUpperCase()} ${to}: ${code}`);
      return { delivered: false, developmentCode: code };
    }

    throw new Error(
      "Email OTP belum aktif. Isi SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, dan SMTP_FROM.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Kode OTP Login Cerita Kita",
    text: `Kode OTP login Anda adalah ${code}. Kode ini berlaku ${expiresInMinutes} menit.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #5e2041;">
        <p style="font-size: 12px; letter-spacing: 0.32em; text-transform: uppercase; color: #d05f8e;">Verifikasi 2 Langkah</p>
        <h1 style="font-size: 32px; margin-bottom: 12px;">Kode OTP Login Anda</h1>
        <p style="font-size: 16px; line-height: 1.8;">
          Gunakan kode berikut untuk menyelesaikan login ${portal === "admin" ? "admin" : "user"}.
        </p>
        <div style="margin: 24px 0; padding: 18px 24px; border-radius: 18px; background: linear-gradient(135deg, #f7adc7, #d694aa); color: white; font-size: 32px; font-weight: 700; letter-spacing: 0.32em; text-align: center;">
          ${code}
        </div>
        <p style="font-size: 15px; line-height: 1.8;">
          Kode ini berlaku selama ${expiresInMinutes} menit. Jangan bagikan kode ini kepada siapa pun.
        </p>
      </div>
    `,
  });

  return { delivered: true as const };
}
