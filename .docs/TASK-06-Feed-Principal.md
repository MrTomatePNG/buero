# TASK-06: Desenvolvimento do Feed Principal

## 1. Objetivo

O objetivo desta tarefa é exibir os posts criados pelos usuários em um feed cronológico na página principal da aplicação. A implementação focará em carregar os dados do banco e renderizá-los em componentes Svelte.

## 2. Componentes a Implementar

### 2.1. Carregamento de Dados do Feed (`src/routes/+page.server.ts`)
Implementar a função `load` na rota principal para buscar os dados dos posts no banco de dados.
*   **Requisito:** A função `load` deve buscar uma lista de posts.
*   **Especificação:**
    *   Utilizar `prisma.post.findMany()` para buscar os registros.
    *   Ordenar os resultados em ordem cronológica decrescente (posts mais recentes primeiro) usando a opção `orderBy: { createdAt: 'desc' }`.
    *   Para exibir o nome e o avatar do autor de cada post, utilizar a funcionalidade `include` do Prisma para trazer os dados do `User` relacionado: `include: { author: true }`.
    *   Retornar o array de posts para o componente da página.

### 2.2. Componente de Post (`src/components/Post.svelte`)
Criar um componente Svelte reutilizável para exibir um único post.
*   **Requisito:** O componente deve receber os dados de um post como propriedade.
*   **Especificação (Svelte 5):**
    *   Utilizar `$props()` para receber o objeto `post`: `let { post } = $props();`.
    *   Renderizar o cabeçalho do post, incluindo o avatar e o nome de usuário do autor.
    *   Renderizar a mídia do post (tag `<img>` para imagens).
    *   Renderizar a legenda e a data de criação.

### 2.3. Montagem do Feed (`src/routes/+page.svelte`)
Utilizar o componente `Post.svelte` para renderizar a lista de posts na página principal.
*   **Requisito:** A página deve iterar sobre os dados carregados pela função `load` e renderizar um componente `Post` para cada item.
*   **Especificação:**
    *   O componente da página receberá a `prop` `data`, contendo a lista de posts.
    *   Utilizar um bloco `{#each data.posts as post (post.id)}` para iterar sobre a lista. O uso de `(post.id)` como chave (`key`) é crucial para a performance de renderização do Svelte.
    *   Dentro do bloco `each`, renderizar o componente `<Post post={post} />`, passando os dados de cada post para o componente filho.

## 3. Critérios de Aceitação

*   **CA-1:** Ao acessar a página inicial, a função `load` busca os posts do banco de dados, incluindo os dados do autor.
*   **CA-2:** A página inicial exibe uma lista de posts em ordem cronológica inversa (o mais recente no topo).
*   **CA-3:** Cada post no feed exibe corretamente a mídia (imagem), a legenda, o nome e o avatar do autor.
*   **CA-4:** Se não houver posts no banco de dados, o feed simplesmente aparece vazio, sem causar erros.

## 4. Referências Técnicas

*   **Prisma - `findMany` e `include`:** [https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#include](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#include)
*   **Prisma - Ordenação:** [https://www.prisma.io/docs/concepts/components/prisma-client/sorting](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)
*   **Svelte - Bloco `{#each}`:** [https://svelte.dev/docs#template-syntax-each](https://svelte.dev/docs#template-syntax-each)
*   **Svelte - Passando Propriedades para Componentes:** [https://svelte.dev/docs#template-syntax-component-props](https://svelte.dev/docs#template-syntax-component-props)