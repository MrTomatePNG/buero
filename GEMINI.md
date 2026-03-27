# AI Agent Guidelines — Buero Project

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit + Svelte 5 (`$state`, `$derived`, `$props` required) |
| Auth | Better Auth v1.1+ |
| Database | PostgreSQL via Prisma v7.4+ |
| Storage | S3-compatible (MinIO dev / Garage S3 prod) |
| Styling | SCSS via Vite |

## 2. Structure & Restrictions

- `src/lib/server/` — server-only. **Never import on the client.**
- `src/lib/auth-client.ts` — **must use `import type { Auth }`** to prevent server code leakage.
- `prisma/schema.prisma` — source of truth. **Never modify `generator` or `output`** without explicit instruction.

## 3. Code Change Protocol

Before writing or modifying any code, you **must**:

1. Identify the problem or opportunity.
2. List all impacted files.
3. Describe the implementation logic.
4. **Wait for explicit user approval.**

## 4. Security

Continuously audit:

- Route protection and schema validation (Zod).
- IAM/S3 access policies.
- Stack traces: **never expose to the client.**

## 5. CVE & Dependency Monitoring

Before suggesting any dependency change or addition:

- Check for known CVEs against all packages in the stack.
- Verify the latest stable version and its changelog for breaking changes.
- Flag any vulnerability found, even if not directly related to the current task.

## 6. Communication Style

- Use precise technical language. No colloquialisms or filler phrases.
- Be direct: state what is wrong, why, and what the fix is.
- Prioritize information density over response length.
