import nodemailer from "nodemailer";

// Gmail 앱 비밀번호 방식으로 알림 메일을 보낸다 (CLAUDE.md "기술 스택" 참고).
// GMAIL_USER: 보내는 계정, GMAIL_APP_PASSWORD: Google 계정에서 발급한 앱 비밀번호(일반 로그인 비밀번호 아님).
export async function sendNotificationEmail(subject: string, text: string) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const notifyTo = process.env.NOTIFY_TO_EMAIL;

  if (!gmailUser || !gmailAppPassword || !notifyTo) {
    throw new Error(
      "GMAIL_USER / GMAIL_APP_PASSWORD / NOTIFY_TO_EMAIL이 .env에 설정되어 있지 않습니다."
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  await transporter.sendMail({
    from: gmailUser,
    to: notifyTo,
    subject,
    text,
  });
}
