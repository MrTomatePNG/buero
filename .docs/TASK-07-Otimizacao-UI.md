# TASK-07: Otimização da Interface (UI/UX)

## 1. Objetivo

O objetivo desta tarefa é refinar a experiência do usuário (UX) através da implementação de feedback visual para ações assíncronas e estados da aplicação. Isso inclui adicionar indicadores de carregamento (`loading`) e tratamento de erros de forma explícita na interface.

## 2. Componentes a Implementar

### 2.1. Indicadores de Carregamento em Ações de Formulário
Melhorar os formulários de login, registro e upload para fornecer feedback durante a submissão.
*   **Requisito:** O usuário deve receber feedback visual imediato de que sua submissão está sendo processada.
*   **Especificação:**
    *   Utilizar o módulo `$app/forms` do SvelteKit, especificamente a store `enhancing`.
    *   Dentro dos componentes de formulário (`+page.svelte` ou `UploadModal.svelte`), usar `import { enhance } from '$app/forms';` e aplicar `use:enhance` no elemento `<form>`.
    *   A store `$enhancing` (uma store legível derivada de `enhance`) se tornará `true` durante a submissão do formulário.
    *   Utilizar o valor de `$enhancing` para:
        *   Desabilitar o botão de `submit` para prevenir submissões duplicadas.
        *   Exibir um ícone de "spinner" ou uma mensagem de "Carregando...".

### 2.2. Indicadores de Navegação de Página
Fornecer um feedback global de que a navegação entre páginas está ocorrendo.
*   **Requisito:** O usuário deve ver um indicador de carregamento durante a transição entre páginas, especialmente em conexões lentas.
*   **Especificação:**
    *   Utilizar o módulo `$app/navigation` do SvelteKit.
    *   Importar a store `navigating` em um componente de layout global (e.g., `src/routes/+layout.svelte`).
    *   A store `$navigating` contém informações sobre a transição de rota. Ela é nula quando não há navegação, e contém objetos `from` e `to` durante uma navegação.
    *   Usar `{#if $navigating}` para condicionalmente renderizar um indicador de carregamento global, como uma barra de progresso no topo da página.

### 2.3. Tratamento de Erros da API
Exibir mensagens de erro retornadas pelas `Form Actions` de forma clara.
*   **Requisito:** Erros de validação ou falhas na API devem ser exibidos ao usuário.
*   **Especificação (Svelte 5):**
    *   As `Form Actions` devem retornar objetos com o estado do erro.
    *   No componente Svelte, acessar a propriedade `form` via `$props()`: `let { form } = $props();`.
    *   Utilizar lógica condicional para exibir `form?.error` próximo aos campos correspondentes.

## 3. Critérios de Aceitação

*   **CA-1:** Ao submeter um formulário (login, registro, upload), o botão de submit é desabilitado e um indicador de carregamento é exibido até que a resposta do servidor chegue.
*   **CA-2:** Durante a navegação entre páginas que possuem uma função `load` no servidor, um indicador de carregamento global (e.g., barra de progresso) é visível.
*   **CA-3:** Falhas de validação em qualquer `Form Action` (e.g., email inválido, senha incorreta) resultam em uma mensagem de erro clara sendo exibida na UI, perto do formulário correspondente, sem recarregar a página.

## 4. Referências Técnicas

*   **SvelteKit - `$app/forms` (enhancing):** [https://kit.svelte.dev/docs/modules#app-forms-enhance](https://kit.svelte.dev/docs/modules#app-forms-enhance)
*   **SvelteKit - `$app/navigation` (navigating):** [https://kit.svelte.dev/docs/modules#app-navigation-navigating](https://kit.svelte.dev/docs/modules#app-navigation-navigating)
*   **SvelteKit - `form` property:** [https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action-post-request](https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action-post-request) (Ver seção sobre o objeto `form`).