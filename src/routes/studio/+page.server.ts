import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { s3Client, bucketName } from "$lib/server/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "$lib/prisma";
import { S3_ENDPOINT } from "$env/static/private";

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
			locals.logger.warn({ userId: locals.user.id }, "Tentativa de upload sem e-mail verificado.");
			return fail(403, { message: "Verifique seu e-mail para poder postar no esgoto." });
		}

		const formData = await request.formData();
		const comment = formData.get("comment")?.toString();
		const media = formData.get("media");

		if (!(media instanceof File)) {
			return fail(400, { message: "Arquivo inválido." });
		}

		const MAX_SIZE = 10 * 1024 * 1024;
		if (media.size > MAX_SIZE) return fail(400, { message: "Arquivo excede o limite de 10MB." });

		const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
		if (!ALLOWED_MIME_TYPES.includes(media.type)) {
			return fail(400, { message: "Tipo de arquivo não permitido." });
		}

		try {
			const buffer = Buffer.from(await media.arrayBuffer());
			const extension = media.type.split("/")[1];
			const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
			const fileKey = `uploads/${locals.user.id}/${fileName}`;

			await s3Client.send(new PutObjectCommand({
				Bucket: bucketName,
				Key: fileKey,
				Body: buffer,
				ContentType: media.type,
				Metadata: { userId: locals.user.id }
			}));

			const mediaUrl = `https://media.sewercomedy.fun/${fileKey}`;

			await prisma.post.create({
				data: {
					userId: locals.user.id,
					comment: comment?.slice(0, 500) || "",
					mediaUrl: mediaUrl,
					mediaType: media.type.startsWith("video") ? "video" : "image",
					status: "pending",
				}
			});

			locals.logger.info({ userId: locals.user.id, fileKey }, "Upload realizado com sucesso.");
			return { success: true };
		} catch (err) {
			locals.logger.error({ err }, "Erro crítico no upload");
			return fail(500, { message: "Falha ao processar arquivo." });
		}
	},
};
