# Boxing Club

Site full-stack da academia de boxe Boxing Club — Ribeirão Preto / SP.

## Pré-requisitos

- [Docker](https://www.docker.com/) + Docker Compose v2
- [pnpm](https://pnpm.io/) ≥ 9 (opcional, para desenvolvimento local sem Docker)

## Setup

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

## URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| Health check | http://localhost:3001/health |

## Credenciais padrão

| Campo | Valor |
|-------|-------|
| Email | admin@boxingclub.com |
| Senha | admin123 |

## Comandos Makefile

```bash
make up        # Sobe todos os serviços em background
make down      # Para todos os serviços
make logs      # Stream de logs de todos os serviços
make migrate   # Executa migrations pendentes
make seed      # Popula o banco com seed
make reset     # Reseta o banco e re-executa migrations (CUIDADO: destrói dados)
make shell-api # Shell interativo no container da API
make shell-db  # psql no container do PostgreSQL
```

## Desenvolvimento com Mercado Pago

### 1. Variáveis de ambiente necessárias

```env
# backend/.env
MP_ACCESS_TOKEN=TEST-...
MP_WEBHOOK_SECRET=seu-webhook-secret

# frontend/.env
VITE_MP_PUBLIC_KEY=TEST-...
```

### 2. Webhooks locais com ngrok

Para receber webhooks do MP localmente, exponha a porta 3001:

```bash
ngrok http 3001
# Copie a URL HTTPS gerada (ex: https://abc123.ngrok.io)
```

Atualize o `.env`:

```env
API_URL=https://abc123.ngrok.io
MP_WEBHOOK_SECRET=segredo-do-painel-mp
```

Configure a URL `https://abc123.ngrok.io/payments/webhook/mercadopago` no painel do Mercado Pago → Suas integrações → Webhooks.

### 3. Sincronizar planos de assinatura no MP

Após subir a API e popular o banco (seed), execute:

```bash
curl -X POST http://localhost:3001/admin/plans/sync-mp \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

Isso cria os `preapproval_plan` no MP e salva os `mpPlanId` no banco.

### 4. Cartões de teste

| Cartão | Número | CVV | Vencimento | Resultado |
|--------|--------|-----|------------|-----------|
| Visa aprovado | 4509 9535 6623 3704 | 123 | qualquer futura | APROVADO |
| Visa recusado | 4000 0000 0000 0002 | 123 | qualquer futura | RECUSADO |
| Mastercard aprovado | 5031 7557 3453 0604 | 123 | 11/25 | APROVADO |

**CPF para testes:** 12345678909

## Produção

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Estrutura

```
boxing-club/
├── frontend/             # React + Vite + TypeScript + Tailwind
├── backend/              # Fastify + Prisma + PostgreSQL
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── Makefile
```
