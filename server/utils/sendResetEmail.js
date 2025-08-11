import nodemailer from 'nodemailer';

export async function sendResetEmail(email, resetUrl) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === '465', 
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      const mailOptions = {
        from: '"Student Platform" <noreply@studentplatform.com>',
        to: email,
        subject: "Resetare parolă - Student Platform",
        text: `Ai solicitat resetarea parolei. Accesează acest link pentru a-ți seta o parolă nouă: ${resetUrl}. Link-ul este valid pentru 1 oră.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a4a4a;">Resetare parolă</h2>
            <p>Ai solicitat resetarea parolei pentru contul tău Student Platform.</p>
            <p>Click pe butonul de mai jos pentru a seta o nouă parolă:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Resetează Parola
              </a>
            </div>
            
            <p>Sau accesează următorul link:</p>
            <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
            
            <p><strong>Important:</strong> Link-ul este valabil doar pentru 1 oră.</p>
            
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">Dacă nu tu ai solicitat resetarea parolei, poți ignora acest email.</p>
          </div>
        `
      };
      
      return transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending reset email:", error);
      throw error;
    }
  }