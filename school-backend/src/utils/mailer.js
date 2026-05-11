import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ Mailer config error:", err.message);
  else     console.log("✅ Mailer ready");
});

export const sendResetOTPEmail = async (to, name, otp) => {
  await transporter.sendMail({
    from: `"KJS English School" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Password Reset OTP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;
                  border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">

        <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:28px 32px">
          <h2 style="color:#fff;margin:0;font-size:20px">Kid's Joyland School</h2>
          <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:13px">
            Smart English School
          </p>
        </div>

        <div style="padding:32px">
          <p style="color:#334155;margin:0 0 8px">Hi <strong>${name}</strong>,</p>
          <p style="color:#64748b;margin:0 0 24px;line-height:1.6">
            We received a request to reset your password.
            Use the OTP below — it expires in <strong>10 minutes</strong>.
          </p>

          <div style="background:#f1f5f9;border-radius:10px;padding:24px;text-align:center;
                      margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;
                      letter-spacing:0.1em;text-transform:uppercase">
              Your OTP
            </p>
            <div style="font-size:40px;font-weight:700;letter-spacing:14px;
                        color:#2563eb;font-family:monospace">
              ${otp}
            </div>
          </div>

          <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not change.
          </p>
        </div>

        <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center">
            KJS School Management · This is an automated email, do not reply.
          </p>
        </div>
      </div>
    `,
  });
};