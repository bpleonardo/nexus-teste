# Nexus - Carteira Cripto Simplificada

## Descrição

Isso é uma API REST de uma carteira digital de criptomoedas desenvolvida como parte de um teste prático de desenvolvimento backend. A aplicação permite que usuários se cadastrem, gerenciem suas carteiras e realizem trocas entre tokens e saques, com um sistema completo de auditoria através de um ledger de movimentações.

---

## Funcionalidades Implementadas

### 1. **Autenticação**
- [x] Cadastro de usuário (email + senha com hash via argon2)
- [x] Login com geração de JWT (access token + refresh token)
- [x] Rotas protegidas por middleware de autenticação
- [x] Revogação de refresh tokens e access tokens
- [x] Controle de sessões

### 2. **Carteira e Saldos**
- [x] Criação automática de carteira ao cadastro com saldo zero
- [x] Suporte para 3 tokens: **BRL**, **BTC**, **ETH**
- [x] Saldos armazenados no banco com modelo de ledger virtual
- [x] Endpoint para consultar saldos da carteira

### 3. **Depósito via Webhook**
- [x] Endpoint `POST /webhooks/deposit` para simular depósitos externos
- [x] Payload: `{ userId, token, amount, idempotencyKey }`
- [x] Validação de `idempotencyKey` para evitar depósitos duplicados

### 4. **Swap - Conversão entre Tokens**
- [x] Endpoint de cotação: simula conversão entre tokens
  - Integração com API pública (CoinGecko)
  - Taxa fixa de 1,5% sobre o valor
  - Retorna: quantidade de destino, taxa cobrada, cotação usada
- [x] Endpoint de execução do swap
  - Validação de saldo suficiente (incluindo taxa)
  - Débito do token de origem + taxa
  - Crédito do token de destino
  - Registro de transação completo
- [x] Cache de cotações com Redis (reduz chamadas à API externa)

### 5. **Saque**
- [x] Endpoint para solicitar saque de um token
- [x] Validação de saldo suficiente
- [x] Débito do saldo (transferência é mock)
- [x] Registro de transação de saque

### 6. **Ledger de Movimentações**
- [x] Todo débito/crédito gera registro de movimentação
- [x] Tipos de movimentação: `DEPOSIT`, `SWAP_IN`, `SWAP_OUT`, `SWAP_FEE`, `WITHDRAW`
- [x] Rastreamento: tipo, token, valor, saldo anterior, saldo novo, data/hora
- [x] Auditabilidade: saldo pode ser reconstruído a partir das movimentações
- [x] Endpoint de extrato com paginação

### 7. **Histórico de Transações**
- [x] Endpoint para listar transações do usuário
- [x] Registro detalhado: tipo, tokens envolvidos, valores, taxa, data/hora
- [x] Suporte a paginação

### 8. **Diferenciais Implementados**
- [x] **Redis para cache** de cotações (evita chamadas repetidas à CoinGecko) e operações (evita estresse no banco)
- [x] **Docker e Docker Compose** para ambiente containerizado
- [x] **Estrutura modular** com separação clara de responsabilidades

---

## Stack Técnico

### Obrigatório
- **Node.js** com **TypeScript**
- **PostgreSQL** com **Prisma** (ORM)
- **Git**

### Escolhido
- **NestJS** - Framework robustos para estrutura modular e escalável
- **Zod** - Validação de dados em tempo de compilação
- **Redis** - Cache distribuído para cotações
- **JWT** - Autenticação stateless
- **Argon2** - Hash seguro de senhas

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Docker** - Deploy do Postgres e Redis

---

## Arquitetura e Estrutura do Projeto

### Organização do Código

```
src/
├─ main.ts                      # Entrypoint do servidor
├─ config.ts                    # Definições de configurações
├─ constants.ts                 # Constantes não configuráveis
├─ utils.ts                     # Funções e tipos utilitários
├─ app.module.ts                # Módulo raiz
├─ pipes/
│  ├─ allowed-values.pipe.ts    # Pipe para limitar valores
│  ├─ parse-float.pipe.ts       # Pipe para converter string -> float
│  ├─ parse-int.pipe.ts         # Pipe para converter string -> int
│  ├─ zod-validation.pipe.ts    # Pipe para validar um esquema zod
├─ auth/                        # Módulo auth/
│  ├─ dtos/                     # Definições de esquemas zod e tipos
│  ├─ auth.module.ts            # Módulo
│  ├─ auth.controller.ts        # Controller do módulo
│  ├─ auth.service.ts           # Service do módulo
│  ├─ auth.guard.ts             # Guard global para validar a autenticação
├─ wallet/                      # Módulo wallet/
│  ├─ <mesma estrutura>
├─ webhooks/                    # Módulo webhooks/
│  ├─ <mesma estrutura>
├─ database/                  
│  ├─ database.module.ts        # Módulo de database para importação
│  ├─ database.service.ts       # Definição da classe DatabaseService
├─ redis/
│  ├─ redis.module.ts           # Módulo redis para importação
│  ├─ redis.ts                  # Definição do provider REDIS_CLIENT

```

> Gerado com https://ascii-tree-generator.com/

### Módulos Principais

1. **AuthModule** - Gerencia autenticação, registro e login
2. **WalletModule** - Gerencia carteiras, saldos, swaps e saques
3. **WebhooksModule** - Recebe depósitos externos
4. **DatabaseModule** - Integração com Prisma e PostgreSQL
5. **RedisModule** - Gerencia cache distribuído

---

## Modelagem do Banco de Dados

### Diagrama

![Diagrama](https://raw.githubusercontent.com/bpleonardo/nexus-teste/refs/heads/main/resources/db-schema.png)

> Gerado com https://dbdiagram.io/
---

##  Como Executar Localmente

### Pré-requisitos
- Node.js >= 20.x
- Yarn ou npm
- Docker e Docker Compose (opcional, mas recomendado)
- PostgreSQL (se não usar Docker)
- Redis (se não usar Docker)

### Instalação com Docker (Recomendado)

1. **Clone o repositório:**
```bash
git clone https://github.com/bpleonardo/nexus-teste
cd nexus-teste
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Preencha o arquivo `.env` com suas credenciais:
```env
# Banco de dados PostgreSQL
DB_URL=postgresql://postgres:<SUA_SENHA_AQUI>@postgres:5432/public
DB_USERNAME=postgres
DB_PASSWORD=<SUA_SENHA_AQUI>

# Redis (deixe vazio se não usar autenticação)
REDIS_URL=redis://redis:6379
REDIS_USERNAME=
REDIS_PASSWORD=

# JWT
JWT_SECRET=sua_chave_super_secreta_aqui
```

3. **Inicie os containers:**
```bash
docker-compose up
```

4. **A API estará disponível em `http://localhost/api`**

### Instalação Local (Sem Docker)

1. **Clone e entre no diretório:**
```bash
git clone https://github.com/bpleonardo/nexus-teste.git
cd nexus-teste
```

2. **Instale as dependências:**
```bash
yarn install
```

3. **Configure o banco de dados e Redis:**
   - PostgreSQL: `postgresql://user:password@localhost:5432/public`
   - Redis: `redis://localhost:6379`

4. **Configure variáveis de ambiente:**
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

5. **Execute as migrações:**
```bash
yarn prisma migrate deploy
```

6. **Inicie o servidor:**
```bash
yarn start
```

7. **A API estará em `http://localhost:3000`**

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login e obter tokens
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Invalidar sessão (todas ou somente a atual)
- `GET /auth/me` - Informações do usuário logado

### Carteira
- `GET /wallet/quote/:from` - Obter cotação de conversão. 
- `GET /wallet/balance` - Obter saldo do usuário
- `GET /wallet/movements` - Obter movimentações individuais do usuário
- `GET /wallet/transactions` - Obter transações individuais do usuário
- `POST /wallet/withdraw` - Realizar o saque de um token
- `POST /wallet/swap` - Realizar a troca entre dois tokens

### Webhooks
- `POST /webhooks/deposit` - Receber depósito externo (com validação de idempotencyKey)

---

## Decisões de Segurança

1. **Senha:** Hash com Argon2 (resistente a ataques de força bruta)
2. **Autenticação:** JWT com access token de curta-vida e refresh token de longa-vida
3. **Refresh Token:** Armazenado em banco com possível revocação
4. **Validação:** Zod para tipagem e validação de entrada
6. **Idempotência:** Webhooks protegidos contra duplicação

---

## Decisões Técnicas

### Por que NestJS?
- Estrutura modular nativa com decoradores
- Injeção de dependência integrada
- Documentação excelente
- Similaridade com ASP.NET do C#

### Por que Prisma?
- ORM focada em Typescript
- Migrações automáticas
- Queries integradas com o editor (typescript)

### Por que Redis?
- Reduz latência e carga na API externa e banco de dados
- Suporte a TTL para expiração automática
  
### Por que Zod?
- Validação de schemas em tempo de runtime
- Parsing automático com inferência de tipos TypeScript
- Mensagens de erros descritivas
- Ótimo para utilização com DTOs

### Modelo de Resposta Consistente
Todas as respostas seguem um padrão:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Descrição do erro",
  "data": { ... }
}
```

### Por que Ledger de Movimentações?
- Auditoria completa de todos os movimentos
- Saldo sempre pode ser recalculado
- 
---

## Checklist de Requisitos

- [x] Autenticação (registro, login, JWT, refresh token)
- [x] Carteira com 3 tokens (BRL, BTC, ETH)
- [x] Depósito via webhook com idempotencyKey
- [x] Swap com cotação real e taxa 1,5%
- [x] Saque com validação de saldo
- [x] Ledger de movimentações completo
- [x] Histórico de transações com paginação
- [x] README com decisões técnicas
- [x] Redis para cache de cotações
- [x] TypeScript com tipagem forte
- [x] Validação com Zod
- [x] Tratamento de erros e casos de borda
- [x] Auditoria via ledger

---

## Tratamento de Casos de Borda

1. **Depósito duplicado:** Validado via `idempotencyKey`
2. **Saldo insuficiente:** Erro antes de debitar
3. **Usuário/token não existente:** Erro apropriado
4. **Precisão de valores:** Decimal(20,8) para moedas cripto
5. **Race conditions:** Transações atômicas no banco
6. **Token expirado:** Refresh automático via refresh token
7. **Taxa de câmbio desatualizada:** Cache com TTL curto
