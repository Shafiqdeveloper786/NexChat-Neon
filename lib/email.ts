import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type OtpMode = "verify" | "login" | "reset";

const TITLES: Record<OtpMode, string> = {
  verify: "Email Verification",
  login:  "Login Authentication",
  reset:  "Password Reset",
};

const SUBTITLES: Record<OtpMode, string> = {
  verify: "Your account verification code",
  login:  "Your 2-factor authentication code",
  reset:  "Your password reset code",
};

export async function sendOtpEmail(to: string, otp: string, mode: OtpMode) {
  await transporter.sendMail({
    from: `"NexChat Neon" <${process.env.SMTP_USER}>`,
    to,
    subject: `NexChat Neon — ${TITLES[mode]} Code`,
    html: buildHtml(otp, TITLES[mode], SUBTITLES[mode]),
  });
}

function buildHtml(otp: string, title: string, subtitle: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(0,242,255,0.2);border-radius:16px;overflow:hidden;box-shadow:0 0 60px rgba(0,242,255,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <div style="font-size:20px;font-weight:800;letter-spacing:5px;color:#00F2FF;text-shadow:0 0 20px rgba(0,242,255,0.6);">
                NEXCHAT NEON
              </div>
              <div style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:3px;margin-top:6px;text-transform:uppercase;">
                Secure Communication Layer
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <div style="color:rgba(0,242,255,0.7);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">${title}</div>
              <div style="color:#f1f5f9;font-size:17px;font-weight:600;margin-bottom:28px;">${subtitle}</div>

              <!-- OTP Box -->
              <div style="background:rgba(0,242,255,0.04);border:1px solid rgba(0,242,255,0.3);border-radius:12px;padding:28px 20px;text-align:center;margin-bottom:28px;box-shadow:0 0 30px rgba(0,242,255,0.06);">
                <div style="color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">Verification Code</div>
                <div style="font-size:44px;font-weight:700;letter-spacing:14px;color:#00F2FF;text-shadow:0 0 24px rgba(0,242,255,0.7);padding-left:14px;">${otp}</div>
              </div>

              <div style="color:rgba(255,255,255,0.3);font-size:12px;line-height:1.8;">
                <span style="color:rgba(255,100,100,0.8);">&#9888;</span>
                Expires in <span style="color:#00F2FF;">10 minutes</span>. Never share this code — NexChat Neon will never ask for it by email or phone.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <div style="color:rgba(255,255,255,0.15);font-size:11px;">
                &copy; 2026 NexChat Neon &nbsp;&middot;&nbsp; Encrypted &nbsp;&middot;&nbsp; Secure
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
