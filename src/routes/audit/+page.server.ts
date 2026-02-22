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

      if (!post) return { sucess: false };

      let newStatus: any = "pending";
      let newMediaUrl = post.mediaUrl;
      let newThumbUrl = post.thumbUrl;

      if (action === "approve") {
        newStatus = "complete";

        const oldKey = new URL(post.mediaUrl).pathname.slice(1);
        const newKey = oldKey.replace("uploads/pending/", "uploads/public");

        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${oldKey}`,
            Key: newKey,
          }),
        );
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldKey,
          }),
        );

        newMediaUrl = `https://media.sewercomedy.fun/${newKey}`;

        if (post.mediaType == "video" && post.thumbUrl) {
          const oldThumb = new URL(post.thumbUrl).pathname.slice(1);
          const newThumb = oldThumb.replace(
            "uploads/pending/",
            "uploads/public/",
          );
          await s3Client.send(
            new CopyObjectCommand({
              Bucket: bucketName,
              CopySource: `${bucketName}/${oldThumb}`,
              Key: newThumb,
            }),
          );
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: oldThumb,
            }),
          );
          newThumbUrl = `https://media.sewercomedy.fun/${newThumb}`;
        }
      }
      if (action === "reject") newStatus = "rejected";
      if (action === "ban") newStatus = "banned";

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
