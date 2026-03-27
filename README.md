# 📢 [POC] Buero Aberto 🕳️: Prova de Conceito & Estudo

⚠️ **AVISO:** Este repositório é formalmente uma **Prova de Conceito (POC)** e foi desenvolvido para fins de **estudo**.

Este projeto serviu como um excelente exemplo técnico de como implementar uma plataforma de mídia social utilizando **Svelte 5 (Runas)**, **Better Auth (v1.1)**, **Prisma (v7.4)** e integração com **S3-compatible (MinIO/Garage)**. Ele demonstra padrões reais de arquitetura, fluxos de upload de multimídia e moderação de conteúdo.

---

## 1. Introdução

Este documento delineia o plano de desenvolvimento estratégico para o projeto **Buero**. O objetivo inicial foi fornecer uma estrutura de marcos e tarefas sequenciais para a construção de uma plataforma de mídia social.

### 1.1. Status do Projeto
*   **Tipo:** Prova de Conceito (POC) / Estudo
*   **Versão Final:** `v0.1.0-alpha`
*   **Status Geral:** Concluído como exemplo técnico. Core funcional, feed interativo e moderação ativos.

### 1.2. Stack Tecnológica
*   **Framework:** SvelteKit (Svelte 5 - Runas)
*   **Autenticação:** Better Auth + Resend (E-mail Verification)
*   **Banco de Dados:** PostgreSQL + Prisma ORM
*   **Armazenamento:** S3 Compatible + Caddy Cache (Edge)
*   **Observabilidade:** Pino Structured Logging

## 2. Roteiro de Desenvolvimento

### Milestone 1: Infraestrutura de Autenticação e Acesso
**Status:** 100% ✅

| ID | Tarefa | Critérios de Aceitação | Status |
| :-- | :--- | :--- | :--- |
| 01 | Core de Autenticação | Better Auth integrado ao Prisma. | ✅ |
| 02 | UI de Autenticação | Login/Cadastro minimalista em Svelte 5. | ✅ |
| 03 | Controle de Acesso | Redirecionamentos e Moderação funcional. | ✅ |

### Milestone 2: Gestão de Conteúdo Multimídia
**Status:** 100% ✅

| ID | Tarefa | Critérios de Aceitação | Status |
| :-- | :--- | :--- | :--- |
| 04 | Object Storage | Integração S3 (MinIO/Magalu) com Caddy Cache. | ✅ |
| 05 | Fluxo de Upload | Studio com preview e validação MIME/Size. | ✅ |
| 06 | Feed Principal | Navegação tátil/mouse/teclado fluida. | ✅ |

### Milestone 3: Refinamento e Observabilidade (Fase Alpha)
**Status:** 100% ✅

| ID | Tarefa | Critérios de Aceitação | Status |
| :-- | :--- | :--- | :--- |
| 07 | Otimização UI/UX | Feedbacks de loading e transições de estado. | ✅ |
| 08 | Observabilidade | Logs estruturados (Pino) e Request Tracking. | ✅ |
| 09 | Verificação de E-mail | Fluxo obrigatório via Resend para uploads. | ✅ |

### Milestone 4: Engajamento e Comunidade (Fase Beta)
**Status:** 100% ✅ (Mecanismos Básicos)

| ID | Tarefa | Critérios de Aceitação | Status |
| :-- | :--- | :--- | :--- |
| 10 | Sistema de Likes | Curtir/Descurtir posts com persistência. | ✅ |
| 11 | Comentários | Discussão em cada post. | [ ] |
| 12 | Seguidores | Rede de conexões entre usuários. | [ ] |
| 13 | Notificações | Avisos de interações em tempo real. | [ ] |

