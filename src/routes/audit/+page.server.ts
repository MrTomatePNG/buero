import { error, redirect } from "@sveltejs/kit";
import prisma from "@/lib/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucketName, s3Client } from "@/lib/server/s3";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { AuditPost } from "@/lib/types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== "admin") {
    locals.logger.warn({ userId: locals.user?.id }, "Acesso não autorizado.");
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
      const key = new URL(post.mediaUrl).pathname.slice(1);

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
    if (!locals.user || locals.user.role !== "admin") {
      locals.logger.error(
        { userId: locals.user?.id },
        "Tentativa de moderação sem permissão.",
      );
      throw error(403);
    }

    const data = await request.formData();
    const postId = data.get("postId")?.toString();
    const action = data.get("action")?.toString(); // 'approve', 'reject', 'ban'

    if (!postId || !action) {
      locals.logger.warn({ postId, action }, "Dados de moderação incompletos.");
      return { success: false };
    }

    try {
      const post = await prisma.post.findUnique({
        where: { id: BigInt(postId) },
      });

      if (!post) return { success: false };

      let newStatus: any = "pending";
      let newMediaUrl = post.mediaUrl;
      let newThumbUrl = post.thumbUrl;

      const mediaKey = new URL(post.mediaUrl).pathname.slice(1);
      const thumbKey = post.thumbUrl
        ? new URL(post.thumbUrl).pathname.slice(1)
        : null;

      const moveS3 = async (oldKey: string, targetFolder: string, mediaType: string) => {
        if (!oldKey.includes("uploads/pending/")) return oldKey;

        const newKey = oldKey.replace("uploads/pending/", `uploads/${targetFolder}/`);
        
        const isPublic = targetFolder === "public";

        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${oldKey}`,
            Key: newKey,
            // Injetar cache agressivo se for para a pasta pública
            CacheControl: isPublic ? "public, max-age=31536000, immutable" : "no-cache, no-store, must-revalidate",
            ContentDisposition: "inline",
            ContentType: mediaType,
            MetadataDirective: "REPLACE", // Necessário para aplicar o novo CacheControl
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
        const movedMediaKey = await moveS3(mediaKey, "public", post.mediaType);
        newMediaUrl = `https://media.sewercomedy.fun/${movedMediaKey}`;

        if (thumbKey) {
          if (thumbKey === mediaKey) {
            newThumbUrl = newMediaUrl;
          } else {
            const movedThumbKey = await moveS3(thumbKey, "public", "image/jpeg");
            newThumbUrl = `https://media.sewercomedy.fun/${movedThumbKey}`;
          }
        }
      } else if (action === "reject") {
        newStatus = "rejected";
        const movedMediaKey = await moveS3(mediaKey, "rejected", post.mediaType);
        newMediaUrl = `https://media.sewercomedy.fun/${movedMediaKey}`;

        if (thumbKey && thumbKey !== mediaKey) {
          const movedThumbKey = await moveS3(thumbKey, "rejected", "image/jpeg");
          newThumbUrl = `https://media.sewercomedy.fun/${movedThumbKey}`;
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
        where: { id: BigInt(postId) },
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
    } catch (err) {
      locals.logger.error({ err, postId }, "Erro ao processar moderação");
      return { success: false };
    }
  },
};
