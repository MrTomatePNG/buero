# Projeto Cauldron: Roteiro Técnico

## 1. Introdução

Este documento delineia o plano de desenvolvimento estratégico para o projeto Cauldron. O objetivo é fornecer uma estrutura de marcos e tarefas sequenciais para a construção de uma plataforma de mídia social. A metodologia foca em entregas incrementais com critérios de aceitação claros para cada fase.

### 1.1. Stack Tecnológica de Referência
*   **Framework:** SvelteKit (Svelte 5)
*   **Autenticação:** Better Auth
*   **Banco de Dados:** PostgreSQL
*   **ORM:** Prisma
*   **Armazenamento de Objetos:** MinIO

## 2. Roteiro de Desenvolvimento

O projeto está segmentado em três marcos principais. Cada marco agrupa um conjunto de tarefas técnicas destinadas a construir uma funcionalidade central e coesa.

### Milestone 1: Infraestrutura de Autenticação e Acesso
**Objetivo:** Estabelecer um sistema de autenticação de usuários robusto, incluindo registro, login, logout e controle de acesso a rotas.
**Tempo Estimado:** 4-6 horas.

| Tarefa ID | Descrição da Tarefa                   | Critérios de Aceitação                                                              | Documento Técnico                                    | Status |
| :-------- | :------------------------------------ | :---------------------------------------------------------------------------------- | :--------------------------------------------------- | :----- |
| **01**    | **Implementação do Core de Autenticação** | O sistema deve ser capaz de validar sessões via hooks do servidor.                  | [TASK-01](./.docs/TASK-01-Autenticacao-Core.md)      | ✅ |
| **02**    | **Desenvolvimento da UI de Autenticação** | Formulários de registro e login devem interagir com a API de autenticação.          | [TASK-02](./.docs/TASK-02-Autenticacao-UI.md)        | ✅ |
| **03**    | **Controle de Acesso e Perfil Básico**    | Rotas protegidas devem redirecionar usuários não autenticados. Usuário logado acessa uma página de perfil. | [TASK-03](./.docs/TASK-03-Controle-Acesso.md)        | ✅ |

### Milestone 2: Gestão de Conteúdo Multimídia
**Objetivo:** Implementar a capacidade dos usuários de criar, publicar e visualizar conteúdo na plataforma.
**Tempo Estimado:** 6-8 horas.

| Tarefa ID | Descrição da Tarefa             | Critérios de Aceitação                                                              | Documento Técnico                                | Status |
| :-------- | :------------------------------ | :---------------------------------------------------------------------------------- | :----------------------------------------------- | :----- |
| **04**    | **Integração com Object Storage** | O serviço de backend deve ser capaz de se conectar e autenticar com o MinIO.        | [TASK-04](./.docs/TASK-04-Integracao-MinIO.md)   | [ ]    |
| **05**    | **Implementação do Fluxo de Upload**  | A UI deve permitir a seleção e envio de arquivos de mídia para o backend.          | [TASK-05](./.docs/TASK-05-Fluxo-Upload.md)       | [ ]    |
| **06**    | **Desenvolvimento do Feed Principal** | Posts publicados devem ser renderizados em uma lista cronológica na página inicial. | [TASK-06](./.docs/TASK-06-Feed-Principal.md)     | [ ]    |

### Milestone 3: Refinamento e Extensibilidade
**Objetivo:** Melhorar a experiência do usuário e a resiliência do sistema, e planejar a expansão de funcionalidades.
**Tempo Estimado:** Aberto.

| Tarefa ID | Descrição da Tarefa           | Critérios de Aceitação                                                              | Documento Técnico                                | Status |
| :-------- | :---------------------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------- | :----- |
| **07**    | **Otimização da Interface (UI/UX)** | Implementação de indicadores de estado (loading, error) e melhoria da transição entre páginas. | [TASK-07](./.docs/TASK-07-Otimizacao-UI.md)      | [ ]    |
| **08**    | **Implementação de Observabilidade** | Logs estruturados devem ser gerados para todas as operações críticas da API.       | [TASK-08](./.docs/TASK-08-Observabilidade.md)    | [ ]    |
| **09**    | **Planejamento de Novas Features**    | Análise e especificação técnica para funcionalidades futuras (e.g., comentários, likes). | [TASK-09](./.docs/TASK-09-Novas-Features.md)     | [ ]    |

---

## 3. Metodologia de Trabalho

Para cada tarefa listada, um documento técnico correspondente detalha o escopo, os requisitos e os critérios para validação. A conclusão de uma tarefa é premissa para iniciar a subsequente dentro de um mesmo marco.
