# TASK-01: Implementação do Core de Autenticação

## 1. Objetivo

O objetivo desta tarefa é estabelecer a camada fundamental do sistema de autenticação utilizando **Lucia Auth v3**. A implementação se concentrará exclusivamente na lógica de backend. Ao final, o sistema deverá ser capaz de gerenciar e validar sessões de usuários de forma programática, alinhado com as versões de `lucia@3.2.2` e `@sveltejs/kit@2.50.2`.

## 2. Componentes a Implementar

### 2.1. Schema de Dados (`prisma/schema.prisma`)
O schema do Prisma deve ser definido para suportar os modelos exigidos pela Lucia v3. Notavelmente, a tabela `Key` não é mais necessária para autenticação de senha, pois essa lógica foi internalizada.

*   **Requisito:** Os modelos `User` e `Session` devem ser definidos.
*   **Especificação:** O tipo de dado para os campos de ID deve ser `String`. O `id` do usuário deve ter um provedor de função como `cuid()` ou `uuid()`.

    ```prisma
    model User {
      id        String    @id @default(cuid())
      username  String    @unique
      // Atributos para autenticação de senha são gerenciados pela Lucia internamente
      // e não requerem mais um campo de senha explícito no modelo User.
      
      // Relação com Lucia
      sessions  Session[]
    }

    model Session {
      id        String   @id
      expiresAt DateTime
      userId    String
      user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    }
    ```

### 2.2. Singleton de Autenticação (`src/lib/server/auth.ts`)
Um módulo deve ser criado para centralizar a inicialização e configuração da instância da Lucia.
*   **Requisito:** Este arquivo deve exportar uma única instância `lucia`.
*   **Especificação:** O módulo deve utilizar o `PrismaAdapter`. A configuração deve definir os `userAttributes` a serem incluídos no objeto `user` da sessão e garantir que cookies seguros (`secure: true`) sejam utilizados em ambiente de produção.

    ```typescript
    // src/lib/server/auth.ts
    import { Lucia } from "lucia";
    import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
    import { prisma } from "$lib/server/prisma"; // Assumindo a existência deste client
    import { dev } from "$app/environment";

    const adapter = new PrismaAdapter(prisma.session, prisma.user);

    export const lucia = new Lucia(adapter, {
        sessionCookie: {
            attributes: {
                secure: !dev
            }
        },
        getUserAttributes: (attributes) => {
            return {
                username: attributes.username
            };
        }
    });

    declare module "lucia" {
        interface Register {
            Lucia: typeof lucia;
            DatabaseUserAttributes: {
                username: string;
            };
        }
    }
    ```

### 2.3. Hook de Servidor (`src/hooks.server.ts`)
Este middleware é responsável por interceptar todas as requisições e validar a identidade do usuário.
*   **Requisito:** Implementar o hook `handle` para validar a sessão em cada requisição.
*   **Especificação:** O hook deve extrair o `sessionId`, validar a sessão com `lucia.validateSession()`, e popular `event.locals.user` e `event.locals.session`.

## 3. Critérios de Aceitação

*   **CA-1:** O schema do Prisma (`User`, `Session`) foi migrado com sucesso para o banco de dados.
*   **CA-2:** O arquivo `src/lib/server/auth.ts` foi criado e não apresenta erros de compilação.
*   **CA-3:** O arquivo `src/hooks.server.ts` foi criado, e o acesso a qualquer rota do servidor imprime `null` para `locals.user` no console, confirmando a execução do hook.

## 4. Referências Técnicas

*   **Lucia Auth v3 - SvelteKit:** [https://lucia-auth.com/getting-started/sveltekit](https://lucia-auth.com/getting-started/sveltekit)
*   **Lucia Auth v3 - Prisma Adapter:** [https://lucia-auth.com/database/prisma](https://lucia-auth.com/database/prisma)
*   **Svelte 5 - Runas (se aplicável em UI):** [https://svelte.dev/docs/runes](https://svelte.dev/docs/runes)
