# Boxing Club — Briefing para agentes de codificação

Este repositório é a base para construir o site **full-stack de produção** da **Boxing Club**, academia de boxe em Ribeirão Preto. A pasta `project/` contém o protótipo HTML/CSS/JS exportado do claude.ai/design — ele é a **referência visual definitiva**, não o código final.

---

## ⚠️ FONTE DE VERDADE

A especificação completa do projeto (stack, schema do banco, endpoints, fluxos de autenticação, integrações, regras de fidelidade visual, ordem de execução e checklist de entrega) está no **prompt principal entregue pelo usuário junto com este repositório**. Sempre que houver conflito entre este README e o prompt, **o prompt prevalece**.

Não tome decisões de arquitetura, escolha de bibliotecas, design de schema ou de fluxos antes de ler o prompt principal por inteiro.

---

## O que construir (visão geral)

- **Frontend:** React 18 + Vite + TypeScript + Tailwind, replicando pixel-perfect o protótipo em `project/`
- **Backend:** Node.js + Fastify + Prisma + PostgreSQL
- **Auth:** JWT com refresh em cookie httpOnly + confirmação de e-mail obrigatória (Resend)
- **Pagamentos:** Mercado Pago (PIX, cartão, boleto, assinaturas via preapproval)
- **Infra:** Docker Compose com containers para `db`, `api` e `web`

Lista completa de páginas, modelos, endpoints e integrações está no prompt principal.

---

## Como ler o protótipo

1. **Comece por `project/Boxing Club.html`** — leia do início ao fim, sem pular nada. Ele é o entry point que carrega todos os scripts.
2. **Siga os imports na ordem em que aparecem no HTML:**
   - `project/logo-data.js`, `project/contact.js`, `project/services/services.js` (este último é o **modelo de dados completo** — catálogo de planos, produtos seed, grade de horários, status de pedido, métodos de pagamento)
   - `project/icons.jsx` (ícones SVG customizados — portar como componentes React, **não substituir por lucide-react ou outra lib**)
   - `project/components/ui.jsx` (primitives: Button, Input, Modal, Drawer, Card, Badge, Skeleton, Avatar, EmptyState, ProductGlyph, Spinner, Select, Textarea)
   - `project/context/contexts.jsx` (Auth, Cart, Toast, Confirm, Router)
   - Demais arquivos em `project/components/`, `project/pages/`, `project/admin/`, `project/app.jsx`

3. **Leia o código HTML/CSS direto.** Não rasterize, não tire screenshots, não abra em browser para inspecionar. Tudo (cores, fontes, espaçamentos, animações, breakpoints) está escrito explicitamente nos arquivos.

---

## Sistema de design extraído do protótipo

São esses valores que devem ir na sua `tailwind.config.js`:

```js
colors: {
  cream:           '#faf7f0',
  ink:             '#0e1410',
  'bc-green':      '#0d6b3a',
  'bc-green-dark': '#0a5530',
  'bc-red':        '#c41e2a',
  'bc-red-dark':   '#8d141e',
},
fontFamily: {
  display: ['"Bebas Neue"', 'sans-serif'],   // títulos e números grandes
  body:    ['Manrope', 'system-ui', 'sans-serif'],
},
```

Fontes do Google: `Bebas Neue` + `Manrope (300,400,500,600,700,800)`.

Animações obrigatórias (todas definidas em `<style>` no `Boxing Club.html`): `reveal-up`, `float`, `spin-slow`, `page-in`, `fade-in`, `modal-in`, `drawer-in`, `dropdown-in`, `mini-in`, `toast-in`. Reproduza com `@keyframes` no seu CSS global ou via `tailwindcss-animate`.

Marca visual recorrente: **faixa horizontal de 1px verde-branco-vermelho** no topo de hero, modais, drawers, cards de auth, e no nav admin. Está em quase toda seção — não esqueça.

---

## Recursos para copiar para o projeto novo

- `project/assets/logo.png` → `apps/web/public/logo.png` (substituir o `window.LOGO_DATA` base64 do protótipo por um `<img src="/logo.png">`)
- `project/assets/schedule-ref.jpeg` → referência visual da grade de horários original da academia (não usar em produção, só para conferir se a grade foi reproduzida correto)

---

## Regra-mestre de fidelidade

O protótipo é a verdade visual. **Não crie páginas, telas, campos ou cores que não existam no protótipo**, com a única exceção das páginas estritamente necessárias para os sistemas pedidos no prompt principal (confirmação de e-mail, esqueci/redefinir senha, checkout do Mercado Pago e telas pós-pagamento) — e mesmo essas devem reaproveitar o layout `AuthShell` ou o layout padrão das páginas existentes.

Quando bater dúvida sobre qualquer detalhe visual, a resposta está no protótipo. Quando bater dúvida sobre arquitetura, integrações ou fluxos de backend, a resposta está no prompt principal.
