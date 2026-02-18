# TASK-01: Implementação do Core de Autenticação (Better Auth)

## 1. Objetivo

Estabelecer a infraestrutura de autenticação utilizando **Better Auth**. O objetivo é configurar o servidor de autenticação, integrar com o Prisma e habilitar a gestão de sessões via middleware do SvelteKit.

## 2. Componentes a Implementar

### 2.1. Definição do Schema Prisma (`prisma/schema.prisma`)
O Better Auth requer modelos específicos para gerenciar usuários, sessões e contas.
*   **Requisito:** Implementar os modelos `User`, `Session`, `Account` e `Verification`.
*   **Especificação:** Utilizar identificadores de string (`String @id`) para compatibilidade e segurança.

    ```prisma
    model User {
      id            String    @id
      name          String
      email         String    @unique
      emailVerified Boolean
      image         String?
      createdAt     DateTime
      updatedAt     DateTime
      sessions      Session[]
      accounts      Account[]

      @@map("user")
    }

    model Session {
      id        String   @id
      expiresAt DateTime
      token     String
      createdAt DateTime
      updatedAt DateTime
      ipAddress String?
      userAgent String?
      userId    String
      user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

      @@map("session")
    }

    model Account {
      id                    String    @id
      accountId             String
      providerId            String
      userId                String
      user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
      accessToken           String?
      refreshToken          String?
      idToken               String?
      accessTokenExpiresAt  DateTime?
      refreshTokenExpiresAt DateTime?
      scope                 String?
      password              String?
      createdAt             DateTime
      updatedAt             DateTime

      @@map("account")
    }

    model Verification {
      id         String    @id
      identifier String
      value      String
      expiresAt  DateTime
      createdAt  DateTime?
      updatedAt  DateTime?

      @@map("verification")
    }
    ```

### 2.2. Configuração do Servidor de Autenticação (`src/lib/server/auth.ts`)
Inicializar a instância do Better Auth com o adaptador Prisma.
*   **Requisito:** Exportar a instância `auth`.
*   **Especificação:** Configurar o `database` com o cliente Prisma e definir a estratégia de e-mail e senha.

    ```typescript
    import { betterAuth } from "better-auth";
    import { prismaAdapter } from "better-auth/adapters/prisma";
    import { prisma } from "$lib/server/prisma";

    export const auth = betterAuth({
        database: prismaAdapter(prisma, {
            provider: "postgresql",
        }),
        emailAndPassword: {
            enabled: true
        }
    });
    ```

### 2.3. Integração com Middleware (`src/hooks.server.ts`)
Configurar o SvelteKit para processar requisições de autenticação e injetar a sessão.
*   **Requisito:** Implementar o handle para converter requisições do Better Auth.
*   **Especificação:** Utilizar `svelteKitHandler` para rotear as chamadas de API internas do Better Auth.

## 3. Critérios de Aceitação

*   **CA-1:** O banco de dados foi atualizado com os novos modelos via `npx prisma migrate dev`.
*   **CA-2:** O arquivo `src/lib/server/auth.ts` exporta a instância `auth` configurada.
*   **CA-3:** As rotas automáticas de autenticação (e.g., `/api/auth/...`) respondem corretamente conforme a documentação do Better Auth.

## 4. Referências Técnicas

*   **Better Auth - SvelteKit Integration:** [https://www.better-auth.com/docs/installation/sveltekit](https://www.better-auth.com/docs/installation/sveltekit)
*   **Better Auth - Prisma Adapter:** [https://www.better-auth.com/docs/adapters/prisma](https://www.better-auth.com/docs/adapters/prisma)
