import type { PublicSession, PublicUser } from "$lib/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	// Se não houver sessão, retornamos undefined para ambos
	if (!locals.user || !locals.session) {
		return {
			user: undefined as PublicUser | undefined,
			session: undefined as PublicSession | undefined,
		};
	}

	// 1. Sanitizar dados do Usuário (remover campos sensíveis/desnecessários no front)
	const { createdAt, updatedAt, emailVerified, ...safeUser } = locals.user;

	// 2. Sanitizar dados da Sessão (remover token, ip, etc.)
	const { token, ipAddress, userAgent, userId, ...safeSession } = locals.session;

	// O TypeScript agora garantirá que 'user' e 'session' no front-end 
	// sigam estritamente os tipos PublicUser e PublicSession definidos.
	return {
		user: safeUser as PublicUser,
		session: safeSession as PublicSession,
	};
};
