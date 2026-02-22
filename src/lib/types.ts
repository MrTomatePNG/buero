import type { auth } from "./auth";
import type { MediaType, PostStatus, Role } from "$lib/genereted/prisma/enums";
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

export type PublicUser = Omit<User, "createdAt" | "updatedAt">;

export type PublicSession = Omit<
  Session,
  "token" | "ipAddress" | "userAgent" | "userId"
>;

export type AuditPost = {
  id: string;
  auditUrl: string;
  mediaUrl: string;
  thumbUrl: string;
  mediaType: MediaType;
  status: PostStatus;
  comment: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    username: string;
    displayUsername: string | null;
    image: string | null;
    bio: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  };
};
