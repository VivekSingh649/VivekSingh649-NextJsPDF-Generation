import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  let body: { to?: string; subject?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const to = 'fridy17a@gmail.com' //|| body.to || process.env.SMTP_USER!;
  const subject = body.subject || "Test Email";

  try {
    const info = await transporter.sendMail({
      from: `"Mela Artisans" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fdf7f1;border-radius:8px;">
          <div style="background:#ff4f33;height:4px;border-radius:4px;margin-bottom:28px;"></div>
          <h1 style="font-size:22px;color:#111;margin:0 0 8px;">Test Email</h1>
          <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 24px;">
            This is a test email from your Next.js PDF catalog app.<br/>
            SMTP is configured and working correctly.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
            <tr style="background:#f0e8de;">
              <th style="text-align:left;padding:8px 12px;">Key</th>
              <th style="text-align:left;padding:8px 12px;">Value</th>
            </tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid #efe8e0;">To</td><td style="padding:8px 12px;border-bottom:1px solid #efe8e0;">${to}</td></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid #efe8e0;">Subject</td><td style="padding:8px 12px;border-bottom:1px solid #efe8e0;">${subject}</td></tr>
            <tr><td style="padding:8px 12px;">Sent at</td><td style="padding:8px 12px;">${new Date().toISOString()}</td></tr>
          </table>
          <p style="font-size:12px;color:#999;margin:0;">Mela Artisans · www.melaartisans.com</p>
        </div>
      `,
    });

    return Response.json({ ok: true, messageId: info.messageId, info });
  } catch (err: any) {
    console.error("[send-email] failed:", err);
    return Response.json(
      {
        error: "Failed to send email",
        detail: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
