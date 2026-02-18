# TASK-02: Desenvolvimento da UI de Autenticação (Better Auth Client)

## 1. Objetivo

Implementar os formulários de registro e login utilizando o cliente oficial do **Better Auth** para Svelte. O objetivo é garantir uma integração fluida com a reatividade do Svelte 5 e processar credenciais de forma segura.

## 2. Componentes a Implementar

### 2.1. Cliente de Autenticação (`src/lib/auth-client.ts`)
Configurar a instância do cliente para uso no navegador.
*   **Requisito:** Exportar o `authClient`.
*   **Especificação:** Utilizar `createAuthClient` do pacote `better-auth/svelte`.

    ```typescript
    import { createAuthClient } from "better-auth/svelte";
    export const authClient = createAuthClient({
        baseURL: process.env.BETTER_AUTH_URL // URL base da aplicação
    });
    ```

### 2.2. Formulário de Registro (`src/routes/register/+page.svelte`)
Desenvolver a interface para criação de novos usuários.
*   **Requisito:** Campo de nome, e-mail e senha.
*   **Especificação:** Utilizar o método `authClient.signUp.email()` para processar o registro.
    *   Gerenciar estados de erro e carregamento utilizando as runas do Svelte 5 (`$state`).

### 2.3. Formulário de Login (`src/routes/login/+page.svelte`)
Desenvolver a interface para autenticação de usuários existentes.
*   **Requisito:** Campo de e-mail e senha.
*   **Especificação:** Utilizar o método `authClient.signIn.email()` para realizar o login.
    *   Em caso de sucesso, redirecionar programaticamente para a rota protegida.

## 3. Critérios de Aceitação

*   **CA-1:** O formulário de registro cria um novo usuário e redireciona para a página inicial após o sucesso.
*   **CA-2:** O formulário de login valida credenciais contra o banco de dados e estabelece uma sessão ativa no navegador.
*   **CA-3:** Erros de autenticação (e.g., senha incorreta, e-mail inexistente) são exibidos de forma clara ao usuário através de estados reativos do Svelte 5.
*   **CA-4:** O componente utiliza `$props` para receber dados e `$state` para controle interno, conforme padrões do Svelte 5.

## 4. Referências Técnicas

*   **Better Auth - Svelte Client:** [https://www.better-auth.com/docs/clients/svelte](https://www.better-auth.com/docs/clients/svelte)
*   **Better Auth - Email & Password Sign In:** [https://www.better-auth.com/docs/authentication/email-password](https://www.better-auth.com/docs/authentication/email-password)
