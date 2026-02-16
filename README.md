# Cauldron - Plataforma de Mídia Social

**Cauldron** é uma moderna plataforma de rede social para compartilhamento de mídia (imagens e vídeos), construída com **SvelteKit**, **Prisma** e **TypeScript**. O projeto foi concebido para ser uma Single-Page Application (SPA) altamente interativa e reativa, com foco na experiência do usuário e na agilidade do desenvolvimento.

A arquitetura aproveita o poder do SvelteKit para renderização no servidor (SSR), geração de sites estáticos (SSG) e uma navegação fluida no lado do cliente, garantindo performance e ótima SEO.

## 📚 Arquitetura e Documentação

Toda a arquitetura, conceitos e decisões de design do projeto estão detalhados na documentação. Para entender como o sistema funciona, comece por aqui:

*   [**01 - Visão Geral do Projeto**](./.docs/01-visao-geral-do-projeto.md)
*   [**02 - Arquitetura de Dados**](./.docs/02-arquitetura-de-dados.md)
*   [**03 - Fluxo de Upload Simplificado**](./.docs/03-fluxo-de-upload-simplificado.md)
*   [**04 - Organização do Código**](./.docs/04-organizacao-do-codigo.md)
*   [**05 - Observabilidade**](./.docs/05-observabilidade.md)
*   [**06 - Princípios e Fundamentos Arquitetônicos**](./.docs/06-principios-e-fundamentos-arquitetonicos.md)

---

## 🛠️ Stack Tecnológica

*   **Framework Full-Stack:** [SvelteKit](https://kit.svelte.dev/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **ORM:** [Prisma](https://www.prisma.io/) para interação com o banco de dados.
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
*   **Armazenamento de Mídia:** Serviço de Object Storage compatível com API S3 (Ex: Minio, AWS S3, Cloudflare R2).
*   **Estilização:** [SCSS](https://sass-lang.com/) com pré-processamento do Svelte.
*   **UI/Componentes:** A ser definido (ex: `shadcn-svelte`, `bits-ui`).
