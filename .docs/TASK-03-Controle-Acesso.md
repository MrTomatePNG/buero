# TASK-03: Controle de Acesso e Perfil Básico

## 1. Objetivo

Implementar a lógica de proteção de rotas e a página de perfil, integrando o estado da sessão do **Better Auth** com o ciclo de vida do SvelteKit.

## 2. Componentes a Implementar

### 2.1. Proteção de Rota via `load` (`src/routes/profile/+page.server.ts`)
Verificar a existência de uma sessão ativa antes de renderizar a página.
*   **Requisito:** Impedir acesso de usuários anônimos.
*   **Especificação:**
    *   Utilizar `event.locals.session` (populado pelo hook) para verificar a autenticação.
    *   Caso nulo, redirecionar: `throw redirect(302, "/login")`.
    *   Retornar o objeto `user` para a página.

### 2.2. Interface de Perfil (`src/routes/profile/+page.svelte`)
Exibir informações do usuário autenticado utilizando padrões do Svelte 5.
*   **Requisito:** Renderizar nome e e-mail.
*   **Especificação:**
    *   Acessar os dados via `$props()`: `let { data } = $props();`.
    *   Renderizar: `data.user.name` e `data.user.email`.

### 2.3. Funcionalidade de Logout
Encerrar a sessão do usuário.
*   **Requisito:** Botão de logout funcional.
*   **Especificação:**
    *   Utilizar o método `authClient.signOut()` no cliente ou uma `form action` que invoque o encerramento da sessão no servidor.

## 3. Critérios de Aceitação

*   **CA-1:** Tentativas de acesso à rota `/profile` sem login resultam em redirecionamento para `/login`.
*   **CA-2:** A página de perfil exibe os dados corretos do usuário logado.
*   **CA-3:** O logout remove a sessão do banco de dados e limpa os cookies do navegador.
*   **CA-4:** O componente de UI utiliza a sintaxe de Runas (`$props`) para recebimento de dados.

## 4. Referências Técnicas

*   **Better Auth - Session Management:** [https://www.better-auth.com/docs/concepts/session-management](https://www.better-auth.com/docs/concepts/session-management)
*   **Svelte 5 - $props:** [https://svelte.dev/docs/svelte/$props](https://svelte.dev/docs/svelte/$props)
