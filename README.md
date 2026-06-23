# 🥊 Boxing Club

Sistema full-stack de gestão para academias de boxe — cadastro de alunos, planos de assinatura e pagamentos recorrentes integrados ao Mercado Pago.

> 💼 **Recrutador(a)?** A seção abaixo explica o projeto sem termos técnicos. Para detalhes de instalação e arquitetura, veja [Documentação Técnica](#documentação-técnica).

---

## 📋 Sobre o projeto

O Boxing Club é uma plataforma criada para academias de luta gerenciarem alunos e assinaturas de forma simples: o aluno se cadastra no site, escolhe um plano e paga diretamente pelo Mercado Pago — sem precisar de planilhas ou controle manual.

Desenvolvi o projeto sozinho, do zero, cobrindo todas as camadas de um sistema real:

| Camada | O que faz | Tecnologias |
|---|---|---|
| 🎨 **Frontend** | Telas que o usuário vê e usa | React, TypeScript, Tailwind CSS |
| ⚙️ **Backend** | Regras de negócio e segurança | Fastify (Node.js), Prisma |
| 🗄️ **Banco de dados** | Armazena alunos, planos e pagamentos | PostgreSQL |
| 💳 **Pagamentos** | Cobrança recorrente automática | Mercado Pago |
| 📦 **Infraestrutura** | Ambiente padronizado e replicável | Docker |


🔗 **Versão online para teste:** [em breve — link do deploy]

## ✅ O que esse projeto demonstra na prática

- Construção de um sistema completo, do banco de dados à interface — não apenas uma tela estática
- Integração com gateway de pagamento real (Mercado Pago), incluindo confirmação automática via webhook
- Organização de código profissional (monorepo, variáveis de ambiente separadas, ambiente Docker)
- Boas práticas de segurança: nenhuma credencial sensível fica exposta no código

---

## 🛠️ Documentação Técnica

> A partir daqui, conteúdo voltado para desenvolvedores que queiram rodar ou avaliar o código localmente.

### Stack completa

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Fastify + Prisma ORM
- **Banco de dados:** PostgreSQL
- **Pagamentos:** Mercado Pago (assinaturas recorrentes via `preapproval_plan`)
- **Infraestrutura:** Docker + Docker Compose (dev e produção)
- **Gerenciador de pacotes:** pnpm (monorepo)

### Pré-requisitos

- [Docker](https://www.docker.com/) + Docker Compose v2
- [pnpm](https://pnpm.io/) ≥ 9 (opcional, para desenvolvimento local sem Docker)

### Setup

```bash
# 1. Clone e configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais reais

# 2. Suba os serviços
docker compose up -d

# 3. Execute as migrations
docker compose exec api pnpm prisma migrate deploy

# 4. Popule o banco com dados iniciais
docker compose exec api pnpm prisma db seed
```

### URLs

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| Health check | http://localhost:3001/health |


### Comandos Makefile

```
make up        # Sobe todos os serviços em background
make down      # Para todos os serviços
make logs      # Stream de logs de todos os serviços
make migrate   # Executa migrations pendentes
make seed      # Popula o banco com seed
make reset     # Reseta o banco e re-executa migrations (CUIDADO: destrói dados)
make shell-api # Shell interativo no container da API
make shell-db  # psql no container do PostgreSQL
```

### Produção

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Estrutura do projeto

```
boxing-club/
├── frontend/             # React + Vite + TypeScript + Tailwind
├── backend/              # Fastify + Prisma + PostgreSQL
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── Makefile
```

---

📫 Desenvolvido por **Rafael Vetrano Cairo** — [GitHub](https://github.com/RafaelVetrano) · [LinkedIn](https://www.linkedin.com/in/rafael-vetrano-37a833232/)
