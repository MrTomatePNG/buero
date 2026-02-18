# TASK-02: Desenvolvimento da UI de Autenticação

## 1. Objetivo

O objetivo desta tarefa é desenvolver os componentes de interface de usuário (UI) e a lógica de servidor para o registro e login de usuários, utilizando as `Form Actions` do SvelteKit e as APIs do **Lucia Auth v3**.

## 2. Componentes a Implementar

### 2.1. Lógica de Servidor (`src/routes/login/+page.server.ts`, etc.)
Implementar as `Form Actions` que processarão os dados dos formulários de registro e login.

*   **Ação `register`:**
    1.  Receber `username` e `password` do formulário.
    2.  Validar os dados (e.g., complexidade da senha).
    3.  Utilizar `lucia.createUser()` para criar um novo usuário. Este método gerencia o hashing da senha e a criação do usuário em uma única operação.
        *   **Parâmetros para `createUser`:** O `userId` (que pode ser gerado com `cuid()`), e os `key` (credenciais, no caso, `providerId: 'username'`, `providerUserId: username.toLowerCase()`, `password`).
    4.  Após a criação, criar a sessão com `lucia.createSession()` e definir o cookie na resposta.
    5.  Redirecionar o usuário para a página de perfil ou feed.

*   **Ação `login`:**
    1.  Receber `username` e `password`.
    2.  Utilizar `lucia.useKey('username', username.toLowerCase(), password)` para validar as credenciais.
    3.  Se a chave for validada com sucesso, criar uma sessão com `lucia.createSession()` e definir o cookie.
    4.  Redirecionar para a página de destino.
    5.  Em caso de falha, retornar um erro para o formulário.

### 2.2. Componentes de Formulário (e.g., `src/routes/login/+page.svelte`)
Desenvolver os formulários Svelte.
*   **Requisito:** Criar formulários HTML para login e registro.
*   **Especificação (Svelte 5):**
    *   Acessar os dados do formulário e erros via `let { form } = $props();`.
    *   Utilizar `{#if form?.error}` para exibir mensagens de erro retornadas pelas `actions`.
    *   Para feedback de carregamento, pode-se usar a store `$navigating` do módulo `$app/navigation`.

## 3. Critérios de Aceitação

*   **CA-1:** Um usuário pode se registrar através do formulário, o que resulta na criação de um `User` no banco de dados.
*   **CA-2:** Um usuário registrado pode fazer login, o que cria um registro na tabela `Session` e define um cookie de sessão no navegador.
*   **CA-3:** Tentativas de login com credenciais incorretas resultam em uma mensagem de erro na UI.
*   **CA-4:** A UI utiliza paradigmas do Svelte 5 para manipulação de estado e propriedades (e.g., `$props`).

## 4. Referências Técnicas

*   **Lucia Auth v3 - Username and Password:** [https://lucia-auth.com/tutorials/username-and-password/sveltekit](https://lucia-auth.com/tutorials/username-and-password/sveltekit)
*   **SvelteKit - Form Actions:** [https://kit.svelte.dev/docs/form-actions](https://kit.svelte.dev/docs/form-actions)
*   **Svelte 5 - `$props`:** [https://svelte.dev/docs/svelte-components#script-props](https://svelte.dev/docs/svelte-components#script-props)