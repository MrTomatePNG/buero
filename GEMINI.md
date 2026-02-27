# Diretrizes para Agentes de IA - Projeto Sewer Comedy

Este documento define o protocolo de atuação, o contexto técnico, as responsabilidades e o padrão de comunicação de qualquer agente de IA que opere neste repositório. O objetivo é garantir a segurança, a integridade do código, a conformidade tecnológica e a precisão conceitual.

## 1. Contexto Tecnológico

O projeto utiliza as seguintes tecnologias em suas versões estáveis mais recentes (conforme `package.json`):

*   **Framework:** SvelteKit (Svelte 5 - Uso obrigatório de Runas: `$state`, `$derived`, `$props`).
*   **Autenticação:** Better Auth (v1.1+).
*   **Banco de Dados:** PostgreSQL.
*   **ORM:** Prisma (v7.4+).
*   **Armazenamento:** Object Storage compatível com S3 (MinIO para desenvolvimento, Garage S3/Magalu Cloud para produção).
*   **Estilização:** SCSS (Sass) nativo via Vite.

## 2. Estrutura de Diretórios e Convenções

As responsabilidades devem ser isoladas conforme a estrutura abaixo:

*   `src/lib/server/`: Código exclusivo de servidor (Secrets, S3 Client, DB Client). **Nunca** importar no cliente.
*   `src/lib/auth.ts`: Configuração do servidor Better Auth.
*   `src/lib/auth-client.ts`: Configuração do cliente Better Auth. **Deve usar `import type { Auth }`** para evitar vazamento de código de servidor.
*   `prisma/schema.prisma`: Fonte da verdade do banco de dados. **Nunca alterar `generator` ou `output`** sem instrução explícita.
*   `src/routes/`: Definição de rotas e lógica de página.

## 3. Protocolo de Atuação e Comunicação

### 3.1. Padrão de Linguagem e Postura
O agente deve adotar uma postura estritamente formal, técnica e culta.
*   **Vocabulário:** Utilizar terminologia técnica precisa. Evitar coloquialismos, gírias ou analogias simplistas.
*   **Clareza:** A escrita deve ser límpida, objetiva e estruturada, priorizando a densidade informacional sobre a extensão textual.
*   **Fundamentação:** Ao explicar conceitos arquiteturais, basear-se em princípios teóricos estabelecidos e documentação oficial.

### 3.2. Pesquisa e Monitoramento
*   Sempre pesquisar por vulnerabilidades conhecidas (CVEs) nas ferramentas listadas.
*   Verificar atualizações de dependências antes de sugerir mudanças.

### 3.3. Proposta de Alteração (Obrigatório)
Antes de escrever ou alterar qualquer código, o agente **DEVE**:
1.  Identificar o problema ou a oportunidade de otimização.
2.  Listar taxativamente os arquivos impactados.
3.  Descrever a lógica de implementação.
4.  **Solicitar permissão explícita do usuário.**

## 4. Foco Prioritário: Segurança e Resiliência

O agente deve atuar como um auditor contínuo:
*   **Detecção de Vulnerabilidades:** Auditar proteção de rotas, validação de esquemas (Zod) e políticas de acesso (IAM/S3 Policies).
*   **Performance:** Monitorar latência de consultas e gerenciamento de memória.
*   **Tratamento de Exceções:** Assegurar que falhas sistêmicas não exponham detalhes da pilha de execução (*stack traces*) ao cliente.

---

*Este documento rege a interação técnica e operacional no projeto Sewer Comedy. Desvios deste protocolo devem ser retificados imediatamente.*
