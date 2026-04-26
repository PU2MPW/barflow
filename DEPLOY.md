# Deploy BarFlow no GitHub + Vercel

## Passo 1: Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `barflow` ou `sistema-bar-restaurante`
3. Selecione **Private** (se preferir)
4. NÃO marque "Add README" (já temos arquivos)
5. Clique **"Create repository"**

## Passo 2: No terminal (PowerShell ou CMD)

```bash
# Entrar na pasta
cd C:\Dev\Bar-Restaurante

# Inicializar git (se já não fez)
git init

# Adicionar todos arquivos
git add .

# Commit inicial
git commit -m "Sistema BarFlow - Gestão completa para bares e restaurantes"

# Renomear branch para main
git branch -M main

# Adicionar remote (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/barflow.git

# Enviar para GitHub
git push -u origin main
```

## Passo 3: Conectar ao Vercel

1. Acesse https://vercel.com/new
2. Clique **"Import Git Repository"**
3. Selecione o repositório `barflow`
4. Clique **"Deploy"**
5. Aguarde ~1 minuto

## Passo 4: Deploy automático

A cada push no GitHub, o Vercel faz deploy automático!

```bash
# Após fazer alterações
git add .
git commit -m "Descrição da mudança"
git push
```

## URLs

- **GitHub:** https://github.com/SEU-USUARIO/barflow
- **Vercel:** https://barflow.vercel.app

---

## Comandos úteis

```bash
# Ver status
git status

# Ver alterações
git diff

# Ver commits
git log --oneline

# Atualizar código
git pull origin main

# Criar branch
git checkout -b nova-funcionalidade
```

---

## Estrutura do Projeto

```
barflow/
├── api/              # Serverless Functions (Vercel)
│   ├── _db.js        # Conexão SQLite
│   ├── produtos.js    # CRUD Produtos
│   ├── pedidos.js    # CRUD Pedidos
│   ├── mesas.js      # CRUD Mesas
│   ├── clientes.js   # CRM
│   ├── cupons.js    # Cupons desconto
│   ├── entregadores.js # Motoboys
│   ├── entregas.js  # Delivery
│   ├── reservas.js  # Reservas
│   ├── caixa.js     # Fluxo de caixa
│   └── dashboard.js  # Métricas
├── *.html            # Frontend (13 páginas)
├── vercel.json      # Config Vercel
├── package.json     # Dependências
└── README.md         # Documentação
```

---

## Funcionalidades Implementadas

### Backend (API REST)
- Produtos e Categorias
- Pedidos e Mesas
- CRM e Fidelidade
- Cupons de desconto
- Entregadores e Entregas
- Reservas
- Fluxo de Caixa
- Dashboard e Métricas

### Frontend
- PDV (Frente de Caixa)
- KDS (Cozinha)
- Mesas
- Delivery Hub
- App Garçom
- Cardápio Digital (QR Code)
- Reservas
- Dashboard BI
- CRM e Fidelidade
- Estoque
- Configurações

---

## Problemas?

### Git não instalado
```powershell
# Instalar Git no Windows
# Baixe em: https://git-scm.com/download/win
```

### Erro de push
```bash
# Forçar push
git push -f origin main
```

### Deploy falhou no Vercel
1. Verificar logs em https://vercel.com/dashboard
2. Verificar package.json
3. Criar issues em https://github.com/anomalyco/opencode/issues

---

**Desenvolvido por 4dotcom**