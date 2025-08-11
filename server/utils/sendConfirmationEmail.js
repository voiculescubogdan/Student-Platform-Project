import nodemailer from 'nodemailer';

export async function sendConfirmationEmail(email, confirmUrl) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const mailOptions = {
    from: '"Student Platform" <no-reply@studentplatform.com>',
    to: email,
    subject: "Confirmă adresa de email",
    html: `
      <h1>Bine ai venit pe platforma noastră!</h1>
      <p>Te rugăm să confirmi adresa de email făcând click pe link-ul de mai jos:</p>
      <a href="${confirmUrl}" style="padding: 10px 20px; background-color: #D93900; color: white; text-decoration: none; border-radius: 4px;">
        Confirmă email-ul
      </a>
      <p>Link-ul este valid pentru 24 de ore.</p>
      <p>Dacă nu tu ai creat acest cont, te rugăm să ignori acest email.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
}