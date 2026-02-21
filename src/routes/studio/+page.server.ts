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
		},
	};
};

export const actions: Actions = {
	upload: async ({ locals, request }) => {
		if (!locals.user) redirect(302, "/login");

		const formData = await request.formData();
		const comment = formData.get("comment")?.toString();
		const media = formData.get("media");

		if (!(media instanceof File)) {
			return fail(400, { message: "Arquivo inválido." });
		}

		// 1. Validações de Tamanho e Tipo
		const MAX_SIZE = 10 * 1024 * 1024; // 10MB
		if (media.size > MAX_SIZE) return fail(400, { message: "Arquivo excede o limite de 10MB." });

		const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
		if (!ALLOWED_MIME_TYPES.includes(media.type)) {
			return fail(400, { message: "Tipo de arquivo não permitido." });
		}

		try {
			// 2. Preparar Key Segura (ignora nome original para evitar injeção)
			const buffer = Buffer.from(await media.arrayBuffer());
			const extension = media.type.split("/")[1]; // Pega a extensão do MIME type real
			const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
			const fileKey = `uploads/${locals.user.id}/${fileName}`;

			// 3. Upload para S3 com metadados de segurança
			await s3Client.send(new PutObjectCommand({
				Bucket: bucketName,
				Key: fileKey,
				Body: buffer,
				ContentType: media.type,
				Metadata: {
					originalName: encodeURIComponent(media.name),
					userId: locals.user.id
				}
			}));

			// 4. Construir URL
			const mediaUrl = `${S3_ENDPOINT}/${bucketName}/${fileKey}`;

			// 5. Persistir no Banco
			await prisma.post.create({
				data: {
					userId: locals.user.id,
					comment: comment?.slice(0, 500) || "", // Limita tamanho da legenda
					mediaUrl: mediaUrl,
					mediaType: media.type.startsWith("video") ? "video" : "image",
					status: "pending",
				}
			});

			return { success: true };
		} catch (err) {
			console.error("Erro crítico no upload:", err);
			return fail(500, { message: "Falha ao processar arquivo. Tente novamente." });
		}
	},
};
