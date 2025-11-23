# DIT Admin

Sistema de administração para gerenciamento de cursos, instrutores, questões e manuais.

## Tecnologias

- Next.js 16
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth.js (Discord OAuth)
- Tailwind CSS

## Setup Local

1. Clone o repositório:
```bash
git clone https://github.com/EduardoPrSo/dit-admin.git
cd dit-admin
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
- `DATABASE_URL`: String de conexão PostgreSQL
- `NEXTAUTH_URL`: URL da aplicação (http://localhost:3000 para desenvolvimento)
- `NEXTAUTH_SECRET`: Gere com `openssl rand -base64 32`
- `DISCORD_CLIENT_ID` e `DISCORD_CLIENT_SECRET`: Credenciais OAuth do Discord

4. Execute as migrações do Prisma:
```bash
npx prisma migrate deploy
npx prisma generate
```

5. (Opcional) Popule o banco com dados iniciais:
```bash
npm run seed
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

### Variáveis de Ambiente Necessárias

Configure estas variáveis no painel da Vercel:

```
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="seu-secret-aqui"
DISCORD_CLIENT_ID="seu-client-id"
DISCORD_CLIENT_SECRET="seu-client-secret"
```

### Passos para Deploy

1. Faça push do código para o GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente
4. A Vercel irá automaticamente:
   - Instalar dependências
   - Gerar o Prisma Client
   - Executar migrações
   - Fazer o build do Next.js

### Importante

- Certifique-se de que o banco de dados PostgreSQL está acessível
- O `DATABASE_URL` deve usar `?sslmode=require` para conexões seguras
- Adicione a URL da Vercel nas configurações de OAuth do Discord

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o ESLint

## Estrutura do Projeto

```
├── app/                    # Rotas e páginas Next.js
│   ├── api/               # Endpoints da API
│   ├── admin/             # Painel admin
│   ├── courses/           # Gerenciamento de cursos
│   ├── instructors/       # Gerenciamento de instrutores
│   ├── manuals/           # Gerenciamento de manuais
│   └── questions/         # Gerenciamento de questões
├── components/            # Componentes React reutilizáveis
├── lib/                   # Configurações e utilitários
├── prisma/               # Schema e migrações do Prisma
└── types/                # Definições de tipos TypeScript
```

## Autenticação

O sistema usa Discord OAuth para autenticação. Apenas usuários autenticados podem acessar o painel admin.

## Licença

MIT

