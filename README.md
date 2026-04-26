# BarFlow - Sistema de Gestão para Bares e Restaurantes

![BarFlow Banner](https://img.shields.io/badge/BarFlow-Gestao%20Restaurante-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![SQLite](https://img.shields.io/badge/Database-SQLite-orange)

Sistema completo para gestão de bares e restaurantes, com PDV, KDS, Delivery, CRM e muito mais.

---

## Descrição

BarFlow é um sistema moderno e intuitivo para gestão completa de bares e restaurantes. Desenvolvido com foco em usabilidade, performance e escalabilidade.

---

## Funcionalidades

### Módulos Implementados

- [x] **PDV Touch** - Ponto de venda com interface touch intuitiva
- [x] **Gestão de Mesas** - Controle completo de mesas e comandas
- [x] **Delivery Hub** - Gestão de pedidos delivery com entregadores
- [x] **Card��pio Digital** - Categorias e produtos com ícones
- [x] **CRM e Fidelidade** - Sistema de cupons e pontos
- [x] **Gestão de Caixa** - Fluxo de caixa e eventos
- [x] **Dashboard** - Visão geral do negócio
- [x] **Reservas** - Sistema de reservas

### Módulos em Desenvolvimento

- [ ] **KDS Cozinha** - Kitchen Display System
- [ ] **App Garçom** - Aplicativo para garçons
- [ ] **Dashboard BI** - Business Intelligence
- [ ] **Estoque** - Controle de estoque
- [ ] **iFood Hub** - Integração com iFood
- [ ] **NFC-e** - Emissão fiscal

---

## Tech Stack

| Tecnologia | Descrição |
|------------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (better-sqlite3) |
| **Deploy** | Vercel (serverless) |

---

## Estrutura do Projeto

```
Bar-Restaurante/
├── api/                    # API Routes (Vercel Functions)
│   ├── _db.js              # Configuração do banco SQLite
│   ├── seed.js             # Script de dados iniciais
│   ├── categorias.js       # CRUD Categorias
│   ├── produtos.js         # CRUD Produtos
│   ├── mesas.js            # CRUD Mesas
│   ├── pedidos.js          # CRUD Pedidos
│   ├── pedidoitens.js      # Itens de pedido
│   ├── entregadores.js     # CRUD Entregadores
│   ├── entregas.js         # CRUD Entregas
│   ├── cupons.js           # CRUD Cupons
│   ├── clientes.js         # CRUD Clientes
│   ├── reservas.js         # CRUD Reservas
│   ├── caixa.js            # Gestão de caixa
│   ├── dashboard.js        # Dados para dashboard
│   └── index.js            # Health check
├── public/                  # Arquivos públicos
│   ├── index.html          # PDV Touch
│   ├── cardapio.html       # Cardápio Digital
│   ├── reservas.html       # Sistema de Reservas
│   ├── dashboard.html       # Dashboard BI
│   ├── admin.html          # Painel Admin
│   └── api.js              # Cliente API
├── data/                    # Dados SQLite (git ignored)
├── package.json
└── README.md
```

---

## API Endpoints

### Health Check
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api` | Status da API |

### Categorias
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categorias` | Lista todas |
| POST | `/api/categorias` | Cria nova |
| PUT | `/api/categorias?id=X` | Atualiza |
| DELETE | `/api/categorias?id=X` | Deleta |

### Produtos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/produtos` | Lista todos |
| GET | `/api/produtos?categoria=X` | Por categoria |
| POST | `/api/produtos` | Cria novo |
| PUT | `/api/produtos?id=X` | Atualiza |
| DELETE | `/api/produtos?id=X` | Deleta |

### Mesas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/mesas` | Lista todas |
| GET | `/api/mesas?status=X` | Por status |
| POST | `/api/mesas` | Cria nova |
| PUT | `/api/mesas?id=X` | Atualiza |
| DELETE | `/api/mesas?id=X` | Deleta |

### Pedidos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pedidos` | Lista todos |
| GET | `/api/pedidos?mesa=X` | Por mesa |
| GET | `/api/pedidos?tipo=X` | Por tipo |
| GET | `/api/pedidos?status=X` | Por status |
| POST | `/api/pedidos` | Cria novo |
| PUT | `/api/pedidos?id=X` | Atualiza status |
| DELETE | `/api/pedidos?id=X` | Cancela |

### Itens do Pedido
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pedidositens?pedido=X` | Por pedido |
| POST | `/api/pedidositens` | Adiciona item |
| DELETE | `/api/pedidositens?id=X` | Remove item |

### Entregadores
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/entregadores` | Lista todos |
| POST | `/api/entregadores` | Cadastra |
| PUT | `/api/entregadores?id=X` | Atualiza |
| DELETE | `/api/entregadores?id=X` | Remove |

### Entregas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/entregas` | Lista todas |
| POST | `/api/entregas` | Cria entrega |
| PUT | `/api/entregas?id=X` | Atualiza status |

### Cupons
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/cupons` | Lista todos |
| POST | `/api/cupons` | Cria cupom |
| POST | `/api/cupons/validar?codigo=X` | Valida cupom |
| PUT | `/api/cupons?id=X` | Atualiza |
| DELETE | `/api/cupons?id=X` | Remove |

### Clientes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clientes` | Lista todos |
| GET | `/api/clientes?telefone=X` | Busca por telefone |
| POST | `/api/clientes` | Cadastra |
| PUT | `/api/clientes?id=X` | Atualiza |

### Reservas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/reservas` | Lista todas |
| POST | `/api/reservas` | Cria reserva |
| PUT | `/api/reservas?id=X` | Atualiza |
| DELETE | `/api/reservas?id=X` | Cancela |

### Caixa
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/caixa` | Lista eventos |
| POST | `/api/caixa` | Registra movimento |

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard` | Dados consolidado |

### Seed
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/seed` | Popula banco inicial |

---

## Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <repo-url>
cd Bar-Restaurante
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente (opcional)**
```bash
cp .env.example .env
```

4. **Rode o seed (dados iniciais)**
```bash
# Acesse no navegador
GET /api/seed
# ou clique no botão "Executar Seed" no admin
```

5. **Inicie o servidor**
```bash
npm start
# ou para desenvolvimento
npm run dev
```

6. **Acesse a aplicação**
- PDV: http://localhost:3000
- Cardápio: http://localhost:3000/cardapio.html
- Admin: http://localhost:3000/admin.html
- Dashboard: http://localhost:3000/dashboard.html
- Reservas: http://localhost:3000/reservas.html

---

## Deploy no Vercel

### Deploy Rápido

1. Faça push para um repositório Git
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Deploy automático!

### Deploy Manual

```bash
npm i -g vercel
vercel
```

### Configurações Vercel

O projeto já está configurado com `vercel.json` otimizado para serverless.

---

## Dados Iniciais (Seed)

Ao executar `/api/seed`, os seguintes dados são inseridos:

### Categorias (6)
| Ícone | Nome |
|-------|------|
| 🥤 | Bebidas |
| 🍔 | Lanches |
| 🍟 | Porções |
| 🍰 | Sobremesas |
| 🍺 | Alcoólicas |
| ☕ | Cafés |

### Produtos (20)
| Produto | Categoria | Preço |
|---------|-----------|-------|
| Café Pequeno | Bebidas | R$ 5,90 |
| Café Médio | Bebidas | R$ 7,90 |
| Refrigerante | Bebidas | R$ 6,90 |
| Suco Natural | Bebidas | R$ 8,90 |
| Água | Bebidas | R$ 4,90 |
| Hambúrguer | Lanches | R$ 19,90 |
| X-Burger | Lanches | R$ 17,90 |
| X-Bacon | Lanches | R$ 21,90 |
| Hot Dog | Lanches | R$ 15,90 |
| Batata Frita | Porções | R$ 15,90 |
| Batata Rústica | Porções | R$ 19,90 |
| Onion Rings | Porções | R$ 16,90 |
| Pudim | Sobremesas | R$ 10,90 |
| Sorvete | Sobremesas | R$ 12,90 |
| Brownie | Sobremesas | R$ 13,90 |
| Cerveja Lata | Alcoólicas | R$ 7,90 |
| Cerveja Long | Alcoólicas | R$ 10,90 |
| Caipirinha | Alcoólicas | R$ 16,90 |
| Cappuccino | Cafés | R$ 8,90 |
| Latte | Cafés | R$ 9,90 |

### Mesas (10)
- Mesa 01 a 10 (Capacidade: 4 pessoas cada)

### Entregadores (3)
| Nome | Veículo |
|------|----------|
| João Silva | Moto |
| Maria Santos | Bike |
| Pedro Oliveira | Carro |

### Cupons (5)
| Código | Tipo | Valor |
|--------|------|-------|
| PRIMEIRACOMPRA | % | 10% |
| FIDELIDADE | % | 5% |
| PROMO15 | % | 15% |
| BARFLOW | R$ | R$ 10,00 |
| VIP | % | 20% |

### Empresa
- Nome: BarFlow Bar e Restaurante
- CNPJ: 12.345.678/0001-90
- Telefone: (11) 99999-9999

---

## Screenshots

### PDV Touch
Interface moderna para criação de pedidos com suporte a mesas, delivery e balcão.

### Cardápio Digital
Visualização elegante do cardápio com ícones e categorias.

### Dashboard
Gráficos e métricas em tempo real do negócio.

---

## Segurança

- Validação de entrada em todas as APIs
- SQL injection prevention (parametrized queries)
- CORS configurado
- rate limiting recomendado para produção

---

## Contributing

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Autor

Desenvolvido por **4dotcom**

[![GitHub](https://img.shields.io/badge/GitHub-4dotcom-333?style=flat-square)](https://github.com/4dotcom)

---

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.