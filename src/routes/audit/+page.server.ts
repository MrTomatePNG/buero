import { error, redirect } from "@sveltejs/kit";
import prisma from "@/lib/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucketName, s3Client, cdnUrl } from "@/lib/server/s3";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { AuditPost } from "@/lib/types";
import { z } from "zod";

const moderateSchema = z.object({
  postId: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => BigInt(v)),
  action: z.enum(["approve", "reject", "ban"]),
});

export const load: PageServerLoad = async ({ locals }) => {
  // A proteção centralizada no hooks.server.ts já garante que locals.user é admin aqui.
  // Mas mantemos como redundância (defense in depth)
  if (!locals.user || locals.user.role !== "admin") {
    redirect(302, "/");
  }

  const posts = await prisma.post.findMany({
    where: { status: "pending" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const queue: AuditPost[] = await Promise.all(
    posts.map(async (post) => {
      // Extração segura da key removendo a URL do CDN
      const key = post.mediaUrl.replace(`${cdnUrl}/`, "");

      const auditUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: bucketName, Key: key }),
        { expiresIn: 600 },
      );

      return {
        ...post,
        id: post.id.toString(),
        auditUrl,
      };
    }),
  );

  return { queue: queue };
};

export const actions: Actions = {
  moderate: async ({ request, locals }) => {
    // A proteção centralizada no hooks.server.ts já trata isso.
    if (!locals.user || locals.user.role !== "admin") throw error(403);

    const formData = await request.formData();
    const result = moderateSchema.safeParse({
      postId: formData.get("postId"),
      action: formData.get("action"),
    });

    if (!result.success) {
      locals.logger.warn(
        { errors: result.error.issues },
        "Tentativa de moderação com dados inválidos",
      );
      return { success: false, message: "Dados inválidos." };
    }

    const { postId, action } = result.data;

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) return { success: false, message: "Post não encontrado." };

      let newStatus: any = "pending";
      let newMediaUrl = post.mediaUrl;
      let newThumbUrl = post.thumbUrl;

      const mediaKey = post.mediaUrl.replace(`${cdnUrl}/`, "");
      const thumbKey = post.thumbUrl
        ? post.thumbUrl.replace(`${cdnUrl}/`, "")
        : null;

      const moveS3 = async (
        oldKey: string,
        targetFolder: string,
        contentType: string,
      ) => {
        if (!oldKey.includes("uploads/pending/")) return oldKey;

        const newKey = oldKey.replace(
          "uploads/pending/",
          `uploads/${targetFolder}/`,
        );

        const isPublic = targetFolder === "public";

        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${oldKey}`,
            Key: newKey,
            CacheControl: isPublic
              ? "public, max-age=31536000, immutable"
              : "no-cache, no-store, must-revalidate",
            ContentDisposition: "inline",
            ContentType: contentType,
            MetadataDirective: "REPLACE",
          }),
        );
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldKey,
          }),
        );
        return newKey;
      };

      const deleteS3 = async (key: string) => {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          }),
        );
      };

      if (action === "approve") {
        newStatus = "completed";
        const movedMediaKey = await moveS3(mediaKey, "public", post.mimeType);
        newMediaUrl = `${cdnUrl}/${movedMediaKey}`;

        if (thumbKey) {
          if (thumbKey === mediaKey) {
            newThumbUrl = newMediaUrl;
          } else {
            const movedThumbKey = await moveS3(
              thumbKey,
              "public",
              "image/jpeg",
            );
            newThumbUrl = `${cdnUrl}/${movedThumbKey}`;
          }
        }
      } else if (action === "reject") {
        newStatus = "rejected";
        const movedMediaKey = await moveS3(mediaKey, "rejected", post.mimeType);
        newMediaUrl = `${cdnUrl}/${movedMediaKey}`;

        if (thumbKey && thumbKey !== mediaKey) {
          const movedThumbKey = await moveS3(
            thumbKey,
            "rejected",
            "image/jpeg",
          );
          newThumbUrl = `${cdnUrl}/${movedThumbKey}`;
        } else if (thumbKey === mediaKey) {
          newThumbUrl = newMediaUrl;
        }
      } else if (action === "ban") {
        newStatus = "banned";
        await deleteS3(mediaKey);
        if (thumbKey && thumbKey !== mediaKey) {
          await deleteS3(thumbKey);
        }
      }

      const updated = await prisma.post.update({
        where: { id: postId },
        data: {
          status: newStatus,
          mediaUrl: newMediaUrl,
          thumbUrl: newThumbUrl,
        },
      });

      locals.logger.info(
        {
          auditorId: locals.user.id,
          postId: updated.id.toString(),
          action,
          newStatus,
        },
        "Post moderado com sucesso",
      );

      return { success: true };
    } catch (err: any) {
      locals.logger.error(
        { error: err.message, postId: postId.toString() },
        "Erro ao processar moderação",
      );
      return { success: false, message: "Erro interno no servidor." };
    }
  },
};
