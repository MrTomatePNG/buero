import { Resend } from "resend";
import { RESEND_API_KEY } from "$env/static/private";
import { baseLogger } from "./logger";

const resend = new Resend(RESEND_API_KEY);

export const sendVerificationEmail = async (to: string, url: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Sewer Comedy <no-reply@sewercomedy.fun>",
      to: [to],
      subject: "Verifique sua entrada no esgoto",
      html: `
                <div style="font-family: sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 10px;">
                    <h1 style="color: #a3ff00;">Sewer Comedy 🔥</h1>
                    <p>Você está a um passo de poder entrar no esgoto.</p>
                    <p>Clique no botão abaixo para confirmar seu e-mail:</p>
                    <a href="${url}" style="display: inline-block; background: #a3ff00; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">Verificar E-mail</a>
                    <p style="margin-top: 30px; font-size: 0.8rem; color: #888;">Se você não solicitou isso, apenas ignore. O link expira em breve.</p>
                </div>
            `,
    });

    if (error) {
      baseLogger.error({ error }, "Falha ao enviar e-mail via Resend");
      return { success: false, error };
    }

    return { success: true, data };
  } catch (e) {
    baseLogger.error({ err: e }, "Erro inesperado no envio de e-mail");
    return { success: false, error: e };
  }
};
