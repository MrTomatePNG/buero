import prisma from "@/lib/prisma";
import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, "/login");

	// Carregar todos os posts que foram aprovados pela auditoria
	const posts = await prisma.post.findMany({
		where: {
			status: "completed",
		},
		include: {
			user: {
				select: {
					username: true,
					image: true,
				},
			},
			_count: {
				select: { likes: true },
			},
			likes: {
				where: {
					userId: locals.user.id,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	// Mapear para facilitar o uso no frontend e resolver serialização do BigInt
	const sanitizedPosts = posts.map((post) => ({
		...post,
		id: post.id.toString(), // Conversão vital para JSON/SvelteKit
		likesCount: post._count.likes,
		isLiked: post.likes.length > 0,
	}));

	return {
		posts: sanitizedPosts,
	};
};

export const actions: Actions = {
	like: async ({ locals, request }) => {
		if (!locals.user) {
			locals.logger.warn("Tentativa de like sem login.");
			redirect(302, "/login");
		}

		const data = await request.formData();
		const postId = data.get("postId")?.toString();

		if (!postId) return fail(400, { message: "ID do post não fornecido." });

		try {
			const id = BigInt(postId);
			const userId = locals.user.id;

			const post = await prisma.post.findUnique({
				where: { id },
				select: { id: true },
			});

			if (!post) {
				locals.logger.warn({ postId }, "Tentativa de like em post inexistente.");
				return fail(404, { message: "Post não encontrado." });
			}

			const existingLike = await prisma.like.findUnique({
				where: {
					userId_postId: { userId, postId: id },
				},
			});

			if (existingLike) {
				await prisma.like.delete({
					where: {
						userId_postId: { userId, postId: id },
					},
				});
				locals.logger.info({ userId, postId: id.toString() }, "Post unliked");
			} else {
				await prisma.like.create({
					data: { userId, postId: id },
				});
				locals.logger.info({ userId, postId: id.toString() }, "Post liked");
			}

			return { success: true };
		} catch (err) {
			locals.logger.error({ err, postId }, "Erro na action de Like");
			return fail(500, { message: "Falha ao processar interação." });
		}
	},
};
