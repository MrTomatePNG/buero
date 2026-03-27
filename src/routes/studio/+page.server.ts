import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { s3Client, bucketName, cdnUrl } from "$lib/server/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "$lib/prisma";
import { fileTypeFromBuffer } from "file-type";
import { mediaQueue } from "$lib/server/queue";
import { z } from "zod";

const uploadSchema = z.object({
  comment: z
    .string()
    .max(500)
    .nullable()
    .transform((v) => v || ""),
  media: z.instanceof(File, {
    message: "Arquivo de mídia inválido ou ausente.",
  }),
  thumbnail: z.instanceof(File).nullable().optional(),
});

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

    // Validação com Zod
    const result = uploadSchema.safeParse({
      comment: formData.get("comment"),
      media: formData.get("media"),
      thumbnail: formData.get("thumbnail"),
    });

    if (!result.success) {
      return fail(400, {
        message: result.error.issues[0].message,
      });
    }

    const { comment, media, thumbnail } = result.data;

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
      return fail(400, {
        message:
          "Arquivo corrompido ou tipo inválido (falsificação de extensão).",
      });
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
          CacheControl: "no-cache, no-store, must-revalidate",
          Metadata: { userId: locals.user.id },
        }),
      );

      const mediaUrl = `${cdnUrl}/${fileKey}`;

      let thumbUrl: string | null = null;
      if (thumbnail) {
        const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
        const thumbKey = `uploads/pending/${locals.user.id}/thumb-${Date.now()}.jpg`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbKey,
            Body: thumbBuffer,
            ContentDisposition: "inline",
            ContentType: "image/jpeg",
            CacheControl: "no-cache, no-store, must-revalidate",
          }),
        );
        thumbUrl = `${cdnUrl}/${thumbKey}`;
      } else {
        thumbUrl = mediaUrl;
      }

      const post = await prisma.post.create({
        data: {
          userId: locals.user.id,
          comment: comment,
          mediaUrl: mediaUrl,
          mediaType: media.type.startsWith("video") ? "video" : "image",
          mimeType: media.type,
          thumbUrl: thumbUrl,
          status: "processing",
        },
      });

      try {
        await mediaQueue.add("process-upload", {
          postId: post.id.toString(),
          userId: locals.user.id,
          fileKey: fileKey,
          mimeType: media.type,
        });
        locals.logger.info(
          { postId: post.id.toString(), queue: "media-processing" },
          "Job enviado para a fila de processamento",
        );
      } catch (queueError) {
        locals.logger.error({ err: queueError }, "Falha ao adicionar à fila");
      }

      locals.logger.info(
        { userId: locals.user.id, postId: post.id.toString(), fileKey },
        "Upload realizado com sucesso.",
      );

      return { success: true };
    } catch (err: any) {
      locals.logger.error(
        {
          userId: locals.user.id,
          error: err.message,
        },
        "Erro crítico no upload (detalhes omitidos do cliente)",
      );
      return fail(500, { message: "Falha interna ao processar arquivo." });
    }
  },
};
