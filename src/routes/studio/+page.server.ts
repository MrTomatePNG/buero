import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { s3Client, bucketName } from "$lib/server/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "$lib/prisma";
import { fileTypeFromBuffer } from "file-type";
export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) redirect(302, "/login");

  return {
    user: {
      id: locals.user.id,
      name: locals.user.name,
      emailVerified: locals.user.emailVerified,
    },
  };
};

export const actions: Actions = {
  upload: async ({ locals, request }) => {
    if (!locals.user) redirect(302, "/login");

    // Segurança: Bloquear se não estiver verificado
    if (!locals.user.emailVerified) {
      locals.logger.warn(
        { userId: locals.user.id },
        "Tentativa de upload sem e-mail verificado.",
      );
      return fail(403, {
        message: "Verifique seu e-mail para poder postar no esgoto.",
      });
    }

    const formData = await request.formData();
    const comment = formData.get("comment")?.toString();
    const media = formData.get("media");
    const thumbnail = formData.get("thumbnail") as File | null;

    if (!(media instanceof File)) {
      return fail(400, { message: "Arquivo inválido." });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (media.size > MAX_SIZE)
      return fail(400, { message: "Arquivo excede o limite de 10MB." });

    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
    ];
    if (!ALLOWED_MIME_TYPES.includes(media.type)) {
      return fail(400, { message: "Tipo de arquivo não permitido." });
    }

    // Consumir o buffer uma única vez
    const buffer = Buffer.from(await media.arrayBuffer());
    const detect = await fileTypeFromBuffer(buffer);

    if (!detect || detect.mime !== media.type) {
      return fail(400, { message: "Arquivo corrompido ou tipo inválido." });
    }

    try {
      const extension = media.type.split("/")[1];
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const fileKey = `uploads/pending/${locals.user.id}/${fileName}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: buffer,
          ContentType: media.type,
          ContentDisposition: "inline",
          Metadata: { userId: locals.user.id },
        }),
      );

      const mediaUrl = `https://media.sewercomedy.fun/${fileKey}`;

      let thumbUrl: string | null = null;
      if (thumbnail instanceof File) {
        const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
        const thumbKey = `uploads/pending/${locals.user.id}/thumb-${Date.now()}.jpg`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbKey,
            Body: thumbBuffer,
            ContentDisposition: "inline",
            ContentType: "image/jpeg",
          }),
        );
        thumbUrl = `https://media.sewercomedy.fun/${thumbKey}`;
      } else {
        thumbUrl = mediaUrl;
      }

      const post = await prisma.post.create({
        data: {
          userId: locals.user.id,
          comment: comment?.slice(0, 500) || "",
          mediaUrl: mediaUrl,
          mediaType: media.type.startsWith("video") ? "video" : "image",
          thumbUrl: thumbUrl,
          status: "pending",
        },
      });

      locals.logger.info(
        { userId: locals.user.id, postId: post.id.toString(), fileKey },
        "Upload realizado com sucesso.",
      );
      
      return { success: true };
    } catch (err: any) {
      locals.logger.error({ 
        message: err.message, 
        stack: err.stack,
        userId: locals.user.id 
      }, "Erro crítico no upload");
      return fail(500, { message: "Falha ao processar arquivo." });
    }
  },
};
