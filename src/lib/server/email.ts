import { Resend } from "resend";
import nodemailer from "nodemailer";
import { env } from "$env/dynamic/private";
import { baseLogger } from "./logger";

const isProd = env.NODE_ENV === "production";

// Transportador SMTP para Mailpit (Local/Dev)
const transporter = nodemailer.createTransport({
  host: "mailpit", // Nome do serviço no docker-compose
  port: 1025,
});

const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationEmail = async (to: string, url: string) => {
  const emailOptions = {
    from: "App <no-reply@buero.fun>",
    to: [to],
    subject: "Verifique seu e-mail",
    html: `
                <div style="font-family: sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 10px;">
                    <h1 style="color: #a3ff00;">App</h1>
                    <p>Você está a um passo de começar.</p>
                    <p>Clique no botão abaixo para confirmar seu e-mail:</p>
                    <a href="${url}" style="display: inline-block; background: #a3ff00; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">Verificar E-mail</a>
                    <p style="margin-top: 30px; font-size: 0.8rem; color: #888;">Se você não solicitou isso, apenas ignore. O link expira em breve.</p>
                </div>
            `,
  };

  try {
    if (isProd) {
      const { data, error } = await resend.emails.send(emailOptions);
      if (error) {
        baseLogger.error({ error }, "Falha ao enviar e-mail via Resend");
        return { success: false, error };
      }
      return { success: true, data };
    } else {
      // Envio via SMTP (Mailpit)
      const info = await transporter.sendMail({
        ...emailOptions,
        to: to, // Nodemailer prefere string para 'to' em vez de array de strings se for único
      });
      baseLogger.info(
        { messageId: info.messageId },
        "E-mail capturado pelo Mailpit",
      );
      return { success: true, data: info };
    }
  } catch (e) {
    baseLogger.error({ err: e }, "Erro inesperado no envio de e-mail");
    return { success: false, error: e };
  }
};
