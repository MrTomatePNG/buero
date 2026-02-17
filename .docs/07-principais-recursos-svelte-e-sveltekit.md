# 7. Principais Recursos do Svelte e SvelteKit (Svelte 5 - Com Ênfase na Nova Sintaxe)

Este documento serve como uma referência rápida para as funcionalidades mais importantes do Svelte e SvelteKit, focando na sintaxe e nas melhores práticas introduzidas no Svelte 5.

---

### Recursos do Svelte (O Compilador de UI)

O Svelte 5 traz uma nova abordagem para a reatividade e a construção de UI, tornando o código mais explícito e poderoso.

#### 1. Reatividade com Runas

No Svelte 5, a reatividade é gerenciada explicitamente através de "Runas" (funções que começam com `$`). Elas substituem a reatividade implícita de `let` e as declarações `$:` do Svelte 4, oferecendo maior clareza e controle.

*   **`$state(initialValue)`**: Declara uma variável como uma fonte de estado reativo.
    ```svelte
    <script>
    	let count = $state(0);
        function increment() {
            count++;
        }
    </script>
    <button onclick={increment}>Contador: {count}</button>
    ```
    *   **Substitui:** Variáveis `let` no escopo superior do componente.

*   **`$derived(expression)`**: Cria um valor que é derivado de outro(s) estado(s) reativo(s). Ele é recalculado automaticamente sempre que suas dependências mudam.
    ```svelte
    <script>
    	let count = $state(0);
    	let double = $derived(count * 2);
    </script>
    <p>O dobro de {count} é {double}.</p>
    ```
    *   **Substitui:** Declarações reativas `$:` usadas para computações (`$: const double = count * 2;`).

*   **`$effect(() => { ... })`**: Executa um código como um efeito colateral sempre que uma de suas dependências reativas mudar. Útil para interagir com o mundo exterior (ex: `localStorage`, logs, assinaturas, manipulação direta do DOM).
    ```svelte
    <script>
    	let name = $state('Svelte');
        $effect(() => {
            console.log('O nome agora é:', name);
        });
    </script>
    <input type="text" bind:value={name} />
    ```
    *   **Substitui:** Declarações reativas `$:` usadas para efeitos colaterais (`$: if (count > 5) alert(...)`).
    *   **Nota:** Existem também `$effect.pre` (similar a `beforeUpdate`) e `$effect.root` para cenários mais avançados.

*   **[Leia mais sobre Runas na documentação oficial](https://svelte.dev/docs/runes)**

#### 2. Propriedades de Componentes (`$props`)

No Svelte 5, todas as propriedades (props) de um componente são declaradas usando a runa `$props()`, geralmente através de desestruturação. Isso substitui `export let`, tornando a API de props mais consistente com o JavaScript.

*   **Declaração Básica:**
    ```svelte
    <!-- MyComponent.svelte -->
    <script>
    	// Desestrutura as props do $props()
    	let { name, age = 30 } = $props();
    </script>
    <p>Olá, {name}! Você tem {age} anos.</p>
    ```
    ```svelte
    <!-- App.svelte -->
    <script>
        import MyComponent from './MyComponent.svelte';
    </script>
    <MyComponent name="Alice" />
    ```
    *   **Substitui:** `export let name; export let age = 30;`

*   **Renomeação de Props:** Use a sintaxe de renomeação de desestruturação do JavaScript.
    ```svelte
    let { class: className } = $props(); // 'class' é uma palavra reservada
    ```

*   **Props Restantes (Spread):** Colete props não especificados com o operador `...rest`.
    ```svelte
    let { title, ...restProps } = $props(); // 'restProps' conterá todas as outras props
    <h1 {...restProps}>{title}</h1>
    ```

*   **Props Bidirecionais (`$bindable()`):** Para permitir `bind:` em uma propriedade, use a runa `$bindable()`.
    ```svelte
    <!-- Counter.svelte -->
    <script>
        let { count = $bindable(0) } = $props(); // Agora 'count' pode ser bind:count
        function increment() {
            count++;
        }
    </script>
    <button onclick={increment}>Contador: {count}</button>
    ```
    *   **Nota:** Se `$bindable()` tem um valor padrão, um valor não-`undefined` deve ser passado ao usar `bind:` para evitar ambiguidades.

*   **[Leia mais sobre $props na documentação oficial](https://svelte.dev/docs/svelte/$props)**

#### 3. Sintaxe de Template (Markup Básico) e Eventos

A sintaxe de template do Svelte continua a ser uma extensão intuitiva do HTML, com algumas mudanças importantes nos eventos.

*   **Tags:**
    *   Minúsculas (`<div>`) para elementos HTML.
    *   Capitalizadas (`<MyComponent>`) ou notação de ponto (`<my.component>`) para componentes Svelte.
    *   **Novidade:** `<svelte:component this={...}>` não é mais necessário; você pode usar a variável do componente diretamente: `<DynamicComponent />`.

*   **Atributos e Propriedades (Props):**
    *   Funciona como HTML, mas pode incluir expressões JavaScript: `<div class="foo" data-id={itemId}>`.
    *   Atalhos: `{propName}` é equivalente a `propName={propName}`.
    *   Atributos booleanos (`disabled={false}`) são incluídos/excluídos com base no valor.

*   **Atributos Spread (`{...object}`):** Permite passar múltiplos atributos/props de uma vez.
    ```svelte
    <script>
        let commonAttrs = { class: 'btn', type: 'submit' };
    </script>
    <button {...commonAttrs} onclick={handleSubmit}>Enviar</button>
    ```

*   **Eventos (Moderno vs. Legacy):**
    *   **Nova Sintaxe (Svelte 5):** Eventos são tratados como **atributos regulares** (props). A diretiva `on:` (ex: `on:click`) é considerada **legada**.
        ```svelte
        <button onclick={() => console.log('Clicado!')}>
            Clique aqui (Svelte 5)
        </button>
        <input oninput={handleInput} />
        ```
        *   **Substitui:** `on:click={...}`, `on:input={...}`.
        *   **Modificadores (Legacy `|once`, `|preventDefault`):** Foram removidos na nova sintaxe. A lógica deve ser implementada na função do handler (ex: `event.preventDefault()`). Para `capture`, use `onclickcapture`.
    *   **Eventos de Componentes (Callbacks):** A forma recomendada de um componente filho "emitir" um evento para o pai é através de **callback props**. `createEventDispatcher` do Svelte 4 é deprecado.
        ```svelte
        <!-- ChildComponent.svelte -->
        <script>
            let { onMyEvent } = $props(); // Recebe o callback como prop
            function triggerEvent() {
                onMyEvent('dados'); // Chama o callback
            }
        </script>
        <button onclick={triggerEvent}>Disparar evento</button>
        ```
        ```svelte
        <!-- ParentComponent.svelte -->
        <script>
            import ChildComponent from './ChildComponent.svelte';
            function handleChildEvent(data) {
                console.log('Evento do filho recebido:', data);
            }
        </script>
        <ChildComponent onMyEvent={handleChildEvent} />
        ```

*   **Expressões de Texto (`{expressão}`):** Inclui expressões JavaScript como texto. `{@html string}` renderiza HTML não-escapado (use com cautela!).

*   **Comentários (`<!-- comentário -->`):** Comentários HTML padrão. `<!-- svelte-ignore code -->` desabilita avisos específicos.

*   **[Leia mais sobre a Sintaxe de Template na documentação oficial](https://svelte.dev/docs/svelte/basic-markup)**

#### 4. Snippets (Substituindo Slots)

No Svelte 5, `slots` são deprecados e substituídos por `snippets`, que são mais flexíveis e poderosos para passar pedaços de UI para componentes.

*   **`children` prop:** Para o conteúdo padrão (que seria um `<slot />` sem nome no Svelte 4), o Svelte 5 usa uma prop chamada `children`.
    ```svelte
    <!-- MyWrapper.svelte -->
    <script>
        let { children } = $props();
    </script>
    <div class="wrapper">
        {@render children()} {/* Renderiza o conteúdo padrão */}
    </div>
    ```
    ```svelte
    <!-- App.svelte -->
    <script>
        import MyWrapper from './MyWrapper.svelte';
    </script>
    <MyWrapper>
        <p>Este é o conteúdo passado para 'children'.</p>
    </MyWrapper>
    ```

*   **Snippets nomeados:** Para múltiplos placeholders de UI (que seriam `slots` nomeados), você passa snippets como props.
    ```svelte
    <!-- MyLayout.svelte -->
    <script>
        let { header, main, footer } = $props(); // Snippets recebidos como props
    </script>
    <header>{@render header()}</header>
    <main>{@render main()}</main>
    <footer>{@render footer()}</footer>
    ```
    ```svelte
    <!-- App.svelte -->
    <script>
        import MyLayout from './MyLayout.svelte';
    </script>
    <MyLayout>
        {#snippet header()}<h1>Título</h1>{/snippet}
        {#snippet main()}<p>Conteúdo principal.</p>{/snippet}
        {#snippet footer()}<p>Rodapé</p>{/snippet}
    </MyLayout>
    ```

*   **Snippets com dados (`let:` no Svelte 4):** Snippets podem receber dados.
    ```svelte
    <!-- List.svelte -->
    <script>
        let { items, item } = $props();
    </script>
    <ul>
        {#each items as entry}
            <li>{@render item(entry)}</li> {/* Passa 'entry' para o snippet */}
        {/each}
    </ul>
    ```
    ```svelte
    <!-- App.svelte -->
    <script>
        import List from './List.svelte';
    </script>
    <List items={['Maçã', 'Banana']}>
        {#snippet item(text)} {/* 'text' é o dado recebido do snippet */}
            <span>Fruta: {text}</span>
        {/snippet}
    </List>
    ```
*   **[Leia mais sobre Snippets na documentação oficial](https://svelte.dev/docs/svelte/snippets)**

#### 5. Diretivas Especiais (`bind:`, `class:`, `use:`, `transition:`, etc.)

Essas diretivas continuam sendo formas poderosas de adicionar comportamento e controle de fluxo aos elementos.

*   **`bind:property`**: Sincroniza uma variável com uma propriedade de um elemento ou um `$bindable()` de um componente.
*   **`class:name={condition}`**: Adiciona/remove uma classe CSS.
*   **`style:property={value}`**: Aplica estilos CSS dinamicamente.
*   **`transition:fn` / `in:fn` / `out:fn`**: Anima a entrada/saída de elementos.
*   **`animate:fn`**: Animações de movimento em listas (`{#each}`).
*   **`use:action` (Actions):** Anexa lógica JavaScript personalizada a um elemento DOM. A função `action` recebe o nó do DOM. No Svelte 5, `$effect` é frequentemente usado dentro de actions para gerenciar reatividade e limpeza.
    ```svelte
    <script>
      function clickOutside(node, handler) {
        $effect(() => {
          document.addEventListener('click', handler);
          return () => document.removeEventListener('click', handler);
        });
      }
    </script>
    <div use:clickOutside={() => alert('Fora!')}>Conteúdo</div>
    ```
*   **Blocos de Lógica (`{#if ...}`, `{#each ...}`, `{#await ...}`):** Continuam a ser a forma padrão de controle de fluxo no template.
    *   `{#if condição}` / `{:else if condição}` / `{:else}`: Renderização condicional.
    *   `{#each array as item, i (key)}` / `{:else}`: Renderiza listas. A `key` é crucial para performance.
    *   `{#await promise}` / `{:then value}` / `{:catch error}`: Gerencia estados de Promises assíncronas.

*   **[Leia mais sobre Diretivas de Template](https://svelte.dev/docs/svelte/template-syntax)**

---

### Recursos do SvelteKit (O Framework Full-Stack)

O SvelteKit usa o Svelte 5 para construir aplicações completas, com roteamento, renderização no servidor (SSR), hidratação no cliente e muito mais. O modelo mental do SvelteKit permanece em grande parte o mesmo, mas a interação com os dados do Svelte 5 é ajustada.

#### 1. Roteamento Baseado em Arquivos

A estrutura de pastas em `src/routes/` define automaticamente as rotas da sua aplicação.
*   `src/routes/about/+page.svelte` -> `/about`
*   `src/routes/api/posts/+server.ts` -> Endpoint API `/api/posts`
*   **[Leia mais sobre Roteamento](https://kit.svelte.dev/docs/routing)**

#### 2. `load` Functions

Funções `load` são a forma canônica de carregar dados para páginas e layouts. Elas podem rodar no servidor (`+page.server.ts`/`+layout.server.ts`) para SSR ou universalmente (`+page.ts`/`+layout.ts`) para flexibilidade.

*   **Como acessar os dados no Svelte 5:** Os dados retornados pela função `load` são automaticamente injetados no componente da página/layout como uma prop `data`. No Svelte 5, você a acessa usando `$props()`:
    ```svelte
    <!-- +page.svelte -->
    <script lang="ts">
        import type { PageData } from './$types'; // Tipagem gerada pelo SvelteKit
        let { data }: { data: PageData } = $props(); // Acessa os dados do load
        // data.posts estará disponível aqui
    </script>
    ```
*   **[Leia mais sobre Carregamento de Dados](https://kit.svelte.dev/docs/load)**

#### 3. Form Actions

A forma segura e integrada de lidar com submissões de formulários HTML, executando lógica no servidor.

*   **Local:** Funções exportadas de `+page.server.ts` ou `+layout.server.ts`.
*   **Função:** Recebe os dados do formulário, realiza mutações (ex: salvar no banco de dados) e pode retornar dados ou redirecionamentos.
*   **[Leia mais sobre Forms e Actions](https://kit.svelte.dev/docs/form-actions)**

#### 4. Hooks (`hooks.server.ts` e `hooks.client.ts`)

Permitem interceptar e modificar o comportamento de requisições no servidor e o ciclo de vida da aplicação no cliente.

*   **`hooks.server.ts`:** Middleware no servidor para autenticação, logging, manipulação de cookies, etc.
*   **`hooks.client.ts`:** Lógica do lado do cliente para inicialização ou manipulação de eventos globais.
*   **[Leia mais sobre Hooks](https://kit.svelte.dev/docs/hooks)**

---

**Considerações Gerais de Migração para Svelte 5:**

*   **Componentes são funções:** No Svelte 5, componentes são funções (não classes como no Svelte 4). Isso afeta a instanciação manual (`mount`/`hydrate` em vez de `new Component(...)`) e o uso de `bind:this` (que agora retorna exports, não a instância da classe com `$set`/`$on`).
*   **Tipagem mais forte:** O Svelte 5 aprimora a tipagem, especialmente com as runas e o `$props`.
*   **Sintaxe legada ainda funciona (por enquanto):** Você pode misturar e combinar componentes com sintaxe Svelte 4 e Svelte 5 durante a migração, mas o ideal é atualizar.
*   **Script de Migração:** Use `npx sv migrate svelte-5` para automatizar muitas das mudanças.
