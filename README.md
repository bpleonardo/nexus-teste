# Nexus - Carteira Cripto Simplificada

## Descrição

A **Carteira Nexus** é uma aplicação full-stack de carteira digital de criptomoedas desenvolvida inicialmente como parte de um teste prático de desenvolvimento backend e posteriormente expandida com uma interface web para consumo da API.

A aplicação permite que usuários se cadastrem, realizem autenticação, acompanhem seus saldos, executem swaps entre moedas, solicitem saques e consultem o histórico completo de movimentações através de uma interface amigável integrada à API.

---

## Funcionalidades Implementadas

### 1. **Autenticação**

* [x] Cadastro de usuário (email + senha com hash via Argon2)
* [x] Login com geração de JWT (access token + refresh token)
* [x] Rotas protegidas por middleware de autenticação
* [x] Revogação de refresh tokens e access tokens
* [x] Controle de sessões
* [x] Renovação automática de sessão no frontend

### 2. **Carteira e Saldos**

* [x] Criação automática de carteira ao cadastro com saldo zero
* [x] Suporte para 3 tokens: **BRL**, **BTC**, **ETH**
* [x] Saldos armazenados no banco com modelo de ledger virtual
* [x] Consulta de saldos através da API e interface web

### 3. **Depósito via Webhook**

* [x] Endpoint `POST /webhooks/deposit` para simular depósitos externos
* [x] Payload: `{ userId, token, amount, idempotencyKey }`
* [x] Validação de `idempotencyKey` para evitar depósitos duplicados

### 4. **Swap - Conversão entre Tokens**

* [x] Endpoint de cotação com integração à CoinGecko
* [x] Taxa fixa de 1,5% sobre o valor
* [x] Simulação de conversão antes da execução
* [x] Execução do swap com registro completo
* [x] Cache de cotações com Redis

### 5. **Saque**

* [x] Endpoint para solicitação de saque
* [x] Validação de saldo suficiente
* [x] Registro de transação de saque
* [x] Interface gráfica para solicitação de saques

### 6. **Ledger de Movimentações**

* [x] Todo débito/crédito gera registro de movimentação
* [x] Tipos de movimentação:

  * `DEPOSIT`
  * `SWAP_IN`
  * `SWAP_OUT`
  * `SWAP_FEE`
  * `WITHDRAW`
* [x] Auditoria completa das operações
* [x] Extrato paginado

### 7. **Histórico de Transações**

* [x] Listagem das transações do usuário
* [x] Registro detalhado das operações
* [x] Paginação
* [x] Visualização através do frontend como scroll infinito.

### 8. **Interface Web**

* [x] Tela de login
* [x] Tela de cadastro
* [x] Dashboard da carteira
* [x] Visualização de saldos
* [x] Realização de swaps
* [x] Solicitação de saques
* [x] Consulta do histórico de transações

### 9. **Diferenciais Implementados**

* [x] Redis para cache de cotações
* [x] Docker e Docker Compose
* [x] Estrutura modular
* [x] Renovação automática de tokens
* [x] Nginx como proxy reverso

---

## Stack Técnico

### Backend

* Node.js
* TypeScript
* NestJS
* PostgreSQL
* Prisma
* Redis
* JWT
* Argon2
* Zod

### Frontend

* Next.js
* React
* TypeScript
* Mantine
* API Fetch

### Infraestrutura

* Docker
* Docker Compose
* Nginx

### Ferramentas de Desenvolvimento

* ESLint
* Prettier
* Git

---

## Arquitetura e Estrutura do Projeto

### Organização do Código

```text
nexus-teste/
├─ backend/
│  ├─ src/
│  │  ├─ auth/
│  │  ├─ wallet/
│  │  ├─ webhooks/
│  │  ├─ database/
│  │  ├─ redis/
│  │  ├─ pipes/
│  │  └─ ...
│  ├─ prisma/
│  ├─ Dockerfile
│  └─ ...
├─ frontend/
│  ├─ app/
│  │  ├─ login/
│  │  ├─ register/
│  │  ├─ transactions/
│  │  ├─ wallet/
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ lib/
│  │  ├─ api/
│  │  │  ├─ auth.ts
│  │  │  ├─ request.ts
│  │  │  └─ wallet.ts
│  │  ├─ components/
│  │  │  ├─ BalanceModule.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ SwapModule.tsx
│  │  │  ├─ Transaction.tsx
│  │  │  ├─ TransactionsModule.tsx
│  │  │  └─ WithdrawModule.tsx
│  │  ├─ constants.ts
│  │  ├─ errors.ts
│  │  ├─ methods.ts
│  │  └─ validators.ts
│  ├─ public/
│  ├─ Dockerfile
│  └─ ...
├─ nginx/
│  ├─ nginx.conf
│  └─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

### Módulos Principais do Backend

1. **AuthModule** - Gerencia autenticação e sessões
2. **WalletModule** - Gerencia carteiras, saldos e operações
3. **WebhooksModule** - Recebe depósitos externos
4. **DatabaseModule** - Integração com PostgreSQL
5. **RedisModule** - Gerenciamento do cache distribuído

### Responsabilidades do Frontend

* Gerenciamento da navegação
* Consumo da API
* Exibição dos dados da carteira
* Controle da sessão autenticada
* Interação do usuário com as funcionalidades do sistema

---

## Modelagem do Banco de Dados

### Diagrama

![Diagrama](https://raw.githubusercontent.com/bpleonardo/nexus-teste/refs/heads/main/resources/db-schema.png)

> Gerado com https://dbdiagram.io/

---

## Como Executar Localmente

### Pré-requisitos

* Docker e Docker Compose
* Node.js >= 20.x (caso não utilize Docker)
* Yarn

---

### Instalação com Docker (Recomendado)

1. Clone o repositório:

```bash
git clone https://github.com/bpleonardo/nexus-teste.git
cd nexus-teste
```

2. Configure os arquivos `.env` conforme os exemplos disponibilizados no projeto.

3. Execute:

```bash
docker compose up
```

Esse comando inicializará:

* Frontend (Next.js)
* Backend (NestJS)
* PostgreSQL
* Redis
* Nginx

Após a inicialização:

* Aplicação: `http://localhost`
* API: `http://localhost/api`

---

### Execução Local (Sem Docker)

#### Backend

```bash
cd backend

yarn install

yarn prisma migrate deploy

yarn start
```

A API estará disponível em:

```text
http://localhost:8080
```

---

#### Frontend

```bash
cd frontend

yarn install

yarn start
```

O frontend estará disponível em:

```text
http://localhost:3000
```

---

## Endpoints Principais

### Autenticação

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/refresh`
* `POST /auth/logout`
* `GET /auth/me`

### Carteira

* `GET /wallet/quote/:from`
* `GET /wallet/balance`
* `GET /wallet/movements`
* `GET /wallet/transactions`
* `POST /wallet/withdraw`
* `POST /wallet/swap`

### Webhooks

* `POST /webhooks/deposit`

---

## Decisões de Segurança

### Senhas com Argon2

As senhas são armazenadas utilizando Argon2, algoritmo moderno e resistente a ataques de força bruta.

### JWT com Refresh Token

A autenticação utiliza access tokens de curta duração e refresh tokens de longa duração.

### Revogação de Sessões

Refresh tokens podem ser invalidados, permitindo encerramento seguro das sessões.

### Idempotência em Webhooks

Depósitos externos utilizam `idempotencyKey` para evitar duplicidade.

### Validação de Entrada

As entradas do backend são validadas utilizando Zod.

---

## Decisões Técnicas

### Por que NestJS?

* Estrutura modular nativa
* Injeção de dependência integrada
* Excelente documentação
* Similaridade com ASP.NET Core

### Por que Prisma?

* ORM voltada para TypeScript
* Migrações automatizadas
* Excelente experiência de desenvolvimento

### Por que Redis?

* Reduz chamadas repetidas para APIs externas
* Diminui carga sobre o banco de dados
* TTL nativo para expiração automática

### Por que Next.js?

* Estrutura moderna baseada em React
* Roteamento baseado em arquivos
* Boa experiência de desenvolvimento
* Recursos que favorecem SEO quando necessário

### Por que Mantine?

* Grande quantidade de componentes prontos
* Redução significativa do tempo gasto com estilização
* Consistência visual entre as páginas
* Permite focar nas regras de negócio da aplicação

### Por que Fetch API?

* API nativa do navegador
* Elimina dependências desnecessárias
* Atende completamente às necessidades atuais do projeto

### Por que armazenar o token no LocalStorage?

O armazenamento do token no LocalStorage simplifica o gerenciamento da sessão e permite acesso rápido às informações necessárias para autenticação das requisições.

Para minimizar impactos da expiração do token, foi implementado um mecanismo automático de renovação:

1. O token é anexado às requisições.
2. Caso a API retorne `INVALID_TOKEN`, o frontend solicita um novo access token.
3. A requisição original é executada novamente.
4. Caso a renovação falhe, o usuário é redirecionado para realizar novo login.

### Modelo de Resposta Consistente

Todas as respostas seguem o padrão:

**Sucesso**

```json
{
  "success": true,
  "data": {}
}
```

**Erro**

```json
{
  "success": false,
  "message": "Descrição do erro",
  "data"?: {}
}
```

### Por que Ledger de Movimentações?

* Auditoria completa
* Reconstrução do saldo a partir do histórico
* Maior rastreabilidade das operações financeiras

---

## Checklist de Requisitos

* [x] Autenticação com JWT e refresh token
* [x] Controle de sessões
* [x] Carteira com BRL, BTC e ETH
* [x] Depósito via webhook com idempotência
* [x] Swap com cotação real e taxa de 1,5%
* [x] Saque com validação de saldo
* [x] Ledger completo de movimentações
* [x] Histórico de transações paginado
* [x] Redis para cache
* [x] Docker e Docker Compose
* [x] TypeScript
* [x] Validação com Zod
* [x] Tratamento de erros
* [x] Auditoria financeira via ledger
* [x] Frontend para interação com a API
* [x] Renovação automática de tokens no cliente

---

## Tratamento de Casos de Borda

1. Depósito duplicado via webhook
2. Saldo insuficiente para saque ou swap
3. Usuário inexistente
4. Token inválido ou expirado
5. Precisão de valores utilizando `Decimal(20,8)`
6. Race conditions mitigadas através de transações atômicas
7. Taxas de câmbio desatualizadas mitigadas com cache de curta duração
8. Renovação automática da sessão em caso de expiração do access token

---
