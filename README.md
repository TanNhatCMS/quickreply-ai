# QuickReply AI — Real-Time AI Sales Agent for E-Commerce

AI-powered conversational sales agent for Phong Vu e-commerce (phongvu.vn). Embeddable chat widget that helps online shoppers search products, compare specs, check live inventory and promotions, and checkout through natural conversation — powered by Vercel AI SDK tool-calling with 7 real-time tools and an on-demand skill system.

## What It Does

- **Real-time product search & comparison** via Phong Vu Discovery API (7 server-side tools)
- **On-demand skill system** — Researcher, Comparator, Advisor, Support loaded dynamically via `loadSkill`
- **Guided checkout** — add to cart and place orders directly in chat
- **Admin dashboard** — conversion rate, AI deflection rate, conversation history, order management
- **MCP server** — standalone tool server (6 tools) compatible with any MCP client
- **Cloudflare Worker proxy** — API security, rate limiting, caching for the Phong Vu API

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **AI / LLM** | Vercel AI SDK v7, OpenAI GPT-4o-mini |
| **MCP Server** | @modelcontextprotocol/sdk, Node.js (stdio transport) |
| **API Proxy** | Cloudflare Workers (rate limiting, caching, CORS) |
| **Database** | Supabase (PostgreSQL) |
| **State Management** | Zustand 5 (persist middleware) |
| **Styling** | Tailwind CSS 4, Lucide React, Material Symbols |
| **Validation** | Zod 4 |
| **Testing** | Vitest, Playwright |
| **Deployment** | Vercel (Edge Runtime + Serverless) |
| **Package Manager** | pnpm |

## Architecture

### System Architecture

```mermaid
graph TB
    User["👤 Customer"] -->|"Chat"| Frontend["📱 Frontend / Chat UI"]
    Frontend -->|"API"| Agent["🤖 AI Agent"]
    
    Agent -->|"Orchestrate"| Skills["📋 Skills Layer"]
    
    Skills --> S1["phongvu-researcher"]
    Skills --> S2["phongvu-comparator"]
    Skills --> S3["phongvu-advisor"]
    Skills --> S4["phongvu-support"]
    
    S1 & S2 & S3 -->|"MCP Tools"| MCPServer["⚙️ MCP Server"]
    S4 -->|"Read"| RAGData["📚 RAG Data"]
    S4 -->|"Fetch"| HelpPV["🌐 help.phongvu.vn"]
    
    MCPServer -->|"POST /v1/search"| Proxy["☁️ Cloudflare Worker"]
    Proxy -->|"Forward"| PVAPI["🔌 Phong Vu API"]
    
    PVAPI -->|"Response"| Proxy
    Proxy -->|"Response"| MCPServer
    MCPServer -->|"Products"| Skills
    Skills -->|"Answer"| Agent
    Agent -->|"Response"| Frontend
```

### Skill Structure

```mermaid
graph LR
    Main["📋 phongvu-sales-agent<br/>Orchestrator"] --> R["🔍 phongvu-researcher<br/>Search & Filter"]
    Main --> C["⚖️ phongvu-comparator<br/>Product Comparison"]
    Main --> A["💡 phongvu-advisor<br/>Sales Advisor"]
    Main --> S["🆘 phongvu-support<br/>Customer Support"]
    
    R & C & A -->|"MCP"| MCP["⚙️ MCP Server<br/>6 tools"]
    S -->|"RAG"| RAG["📚 rag-data/<br/>23 files"]
    S -->|"Fetch"| HELP["🌐 help.phongvu.vn"]
    
    MCP -->|"API"| PV["🔌 Phong Vu API"]
```

### Business Flow — Intent Classification & Routing

```mermaid
flowchart TD
    Start(["👤 Customer asks"]) --> Classify{"📋 Classify intent"}
    
    Classify -->|"Product search"| Search["🔍 Search Products"]
    Classify -->|"Compare"| Compare["⚖️ Compare Products"]
    Classify -->|"Advice"| Advise["💡 Advisor Pipeline"]
    Classify -->|"Support"| Support["🆘 Support Agent"]
    Classify -->|"Simple"| Direct["📝 Direct answer"]
    
    Search --> BudgetCheck{"💰 Has budget?"}
    BudgetCheck -->|"Yes"| AddPriceFilter["➕ Add price_lte/price_gte"]
    BudgetCheck -->|"No"| BasicSearch["🔎 Basic search"]
    
    AddPriceFilter --> BrandCheck{"🏷️ Has brand?"}
    BasicSearch --> BrandCheck
    BrandCheck -->|"Yes"| AddBrand["➕ Add brands filter"]
    BrandCheck -->|"No"| AttrCheck{"📊 Has usage need?"}
    AddBrand --> AttrCheck
    AttrCheck -->|"Yes"| AddAttr["➕ Add attributes filter"]
    AttrCheck -->|"No"| DoSearch["🚀 Call API"]
    AddAttr --> DoSearch
    
    DoSearch --> HasResults{"✅ Has results?"}
    HasResults -->|"Yes"| Present["📋 Present products"]
    HasResults -->|"No"| Suggest["💡 Suggest alternatives"]
    
    Present --> NextAction{"👉 Customer wants?"}
    NextAction -->|"Detail"| Detail["📖 Get Product Detail"]
    NextAction -->|"Compare"| Compare
    NextAction -->|"Buy"| Buy["🛒 Add to cart / Checkout"]
    NextAction -->|"Other"| Start
    
    Compare --> GetDetails["📖 Get 2-3 SKU details"]
    GetDetails --> BuildTable["📊 Build comparison table"]
    BuildTable --> Recommend["💡 Recommend best"]
    
    Advise --> A1["🔍 Researcher: Find products"]
    A1 --> A2["⚖️ Comparator: Compare top 3"]
    A2 --> A3["💡 Advisor: Synthesize"]
    A3 --> A4["🎁 Suggest accessories"]
    A4 --> FinalAdvice["📋 Complete advice"]
    
    Support --> SRAG{"📚 Found in RAG?"}
    SRAG -->|"Yes"| AnswerRAG["✅ Answer from RAG"]
    SRAG -->|"No"| FetchHelp["🌐 Fetch help.phongvu.vn"]
    FetchHelp --> AnswerHelp["✅ Answer from web"]
```

### Sequence Diagram — Product Search

```mermaid
sequenceDiagram
    actor User as 👤 Customer
    participant Agent as 🤖 AI Agent
    participant Researcher as 🔍 Researcher
    participant MCP as ⚙️ MCP Server
    participant Proxy as ☁️ CF Worker
    participant API as 🔌 PV API

    User->>Agent: "Find laptop under 20M VND"
    
    Agent->>Agent: Analyze: query=laptop, price_lte=20000000
    
    Agent->>Researcher: Spawn phongvu-researcher
    activate Researcher
    
    Researcher->>MCP: search_products(query, price_lte, return_filterable)
    activate MCP
    
    MCP->>Proxy: POST /v1/search {filter: {priceLte: 20000000}}
    activate Proxy
    Proxy->>API: Forward request
    activate API
    API-->>Proxy: Products + Filter Options
    deactivate API
    Proxy-->>Proxy: Map response
    Proxy-->>MCP: Response
    deactivate Proxy
    
    MCP->>MCP: summarizeProduct() + summarizeFilters()
    MCP-->>Researcher: {products, filter_options}
    deactivate MCP
    
    Researcher->>Researcher: Filter & rank by relevance
    Researcher-->>Agent: Laptop list under 20M
    deactivate Researcher
    
    Agent->>Agent: Format response (VND price, links, promotions)
    Agent-->User: 📋 Top 5 laptops under 20M + purchase links
```

### Sequence Diagram — Full Advisor Pipeline

```mermaid
sequenceDiagram
    actor User as 👤 Customer
    participant Agent as 🤖 AI Agent
    participant R as 🔍 Researcher
    participant C as ⚙️ Comparator
    participant A as 💡 Advisor
    participant MCP as ⚙️ MCP Server

    User->>Agent: "Recommend laptop for students, budget 20M"
    
    Agent->>Agent: Analyze: purpose=student, budget=20M
    
    rect rgb(232, 245, 233)
        Note over Agent,R: Phase 1: Research
        Agent->>R: Spawn researcher
        R->>MCP: search_products("laptop", price_lte=20000000, attributes={nhucausudung: "26699"})
        MCP-->>R: 10 products + filter_options
        R->>R: Filter top 5 for students
        R-->>Agent: Top 5 laptops
    end
    
    rect rgb(227, 242, 253)
        Note over Agent,C: Phase 2: Compare
        Agent->>C: Spawn comparator (top 3 SKUs)
        C->>MCP: compare_products(skus)
        MCP-->>C: 3 product details
        C->>C: Build comparison table
        C-->>Agent: Specs comparison table
    end
    
    rect rgb(255, 243, 224)
        Note over Agent,A: Phase 3: Advise
        Agent->>A: Spawn advisor
        A->>MCP: check_stock(sku) + get_recommendations(sku)
        MCP-->>A: Stock + accessories
        A->>A: Synthesize advice
        A-->>Agent: Recommendation + accessories
    end
    
    Agent->>Agent: Format complete response
    Agent-->User: 💡 Advice: Laptop X + reasons + accessories + purchase link
```

### Sequence Diagram — Customer Support

```mermaid
sequenceDiagram
    actor User as 👤 Customer
    participant Agent as 🤖 AI Agent
    participant Support as 🆘 Support Agent
    participant RAG as 📚 RAG Data
    participant WebFetch as 🌐 webfetch

    User->>Agent: "I bought a laptop 3 days ago and it's defective, can I return it?"
    
    Agent->>Agent: Analyze: return policy question → support
    Agent->>Support: Spawn phongvu-support
    
    rect rgb(232, 245, 233)
        Note over Support,RAG: Priority 1: Local RAG
        Support->>RAG: Read 12-doi-tra-hoan-tien.md
        RAG-->>Support: Return policy content
    end
    
    Support->>Support: Find 7-day return conditions
    
    alt Found in RAG
        Support-->>Agent: Policy + conditions + process
    else Not found
        rect rgb(255, 243, 224)
            Note over Support,WebFetch: Priority 2: Fetch web
            Support->>WebFetch: webfetch("https://help.phongvu.vn/llms-full.txt")
            WebFetch-->>Support: Latest content
        end
        Support-->>Agent: Info from web
    end
    
    Agent-->User: ✅ Returnable within 7 days if manufacturer defect. Process: ...
```

### Sequence Diagram — Chat API Request Flow

```mermaid
sequenceDiagram
    participant Browser as 🌐 Browser
    participant ChatRoute as ⚡ /api/chat
    participant Supabase as 🗄️ Supabase
    participant OpenAI as 🤖 OpenAI
    participant Tools as 🔧 Tools

    Browser->>ChatRoute: POST {messages, sessionId}
    
    ChatRoute->>Supabase: Upsert chat session
    ChatRoute->>Supabase: Save user message (fire-and-forget)
    
    ChatRoute->>ChatRoute: Extract latest user message
    
    ChatRoute->>OpenAI: Generate embedding (text-embedding-3-small)
    OpenAI-->>ChatRoute: Query embedding (1536 dims)
    
    ChatRoute->>Supabase: match_documents(embedding, threshold=0.4, count=5)
    Supabase-->>ChatRoute: RAG context documents
    
    ChatRoute->>ChatRoute: Discover skills from src/skills/
    ChatRoute->>ChatRoute: Build system prompt + RAG context
    
    ChatRoute->>OpenAI: streamText(model, messages, tools, system)
    
    loop Up to 5 tool-calling steps
        OpenAI-->>ChatRoute: Tool call (e.g., search_products)
        ChatRoute->>Tools: Execute tool
        Tools-->>ChatRoute: Tool result
        ChatRoute->>OpenAI: Send tool result
    end
    
    OpenAI-->>ChatRoute: Streamed response
    
    ChatRoute->>Supabase: Save assistant message (fire-and-forget)
    ChatRoute-->>Browser: toUIMessageStreamResponse()
```

### Cart Sync Flow

```mermaid
sequenceDiagram
    participant Chat as 💬 ChatWidget
    participant Store as 📦 Zustand Store
    participant LS as 💾 localStorage
    participant Home as 🏠 Storefront
    participant Cart as 🛒 CartDrawer
    participant API as ⚡ /api/orders

    Chat->>Store: addToCart(product)
    Store->>LS: Persist (phongvu-cart-store)
    Store-->>Chat: State updated
    
    Chat->>Home: Dispatch 'cart:add' DOM event
    Home->>Store: addItem(product)
    Store-->>Home: Badge count updated
    
    Home->>Cart: Toggle drawer
    Cart->>Store: selectCartItems, selectCartTotal
    Store-->>Cart: Render cart items
    
    Cart->>Cart: User clicks Checkout
    Cart->>API: POST /api/orders {items, sessionId}
    API->>API: Validate & compute total
    API-->>Cart: {orderId, status, total}
    Cart->>Store: clearCart()
    Cart->>LS: Persist empty cart
    Cart-->>Cart: Show success state
```

### MCP Server Tool Flow

```mermaid
graph LR
    Client["🤖 MCP Client"] -->|"JSON-RPC"| Server["⚙️ MCP Server<br/>stdio transport"]
    
    Server --> T1["search_products"]
    Server --> T2["get_product_detail"]
    Server --> T3["compare_products"]
    Server --> T4["get_popular_keywords"]
    Server --> T5["get_recommendations"]
    Server --> T6["check_stock"]
    
    T1 & T2 & T3 & T4 & T5 & T6 -->|"HTTP"| Proxy["☁️ Cloudflare Worker"]
    Proxy -->|"Forward"| API["🔌 Phong Vu API"]
    
    API -->|"Raw response"| Proxy
    Proxy -->|"Response"| Server
    Server -->|"summarizeProduct()"| T1
    Server -->|"JSON text"| Client
```

- **Chat API**: `/api/chat` — Edge Runtime, Vercel AI SDK `streamText`, 7 tools + skill loader
- **Tool calling**: Up to 5 chained steps per turn — `search_products`, `get_product_detail`, `compare_products`, `get_recommendations`, `check_stock`, `get_popular_keywords`, `searchKnowledge`
- **Cart sync**: Zustand store persisted to localStorage, broadcast via custom DOM events between ChatWidget and Storefront
- **Sessions**: Anonymous UUID in localStorage (key `qr_session_id`), no auth for MVP
- **MCP server**: Standalone `phongvu-ai-agent/` submodule exposing 6 tools over stdio transport

## Prerequisites

- Node.js v18+
- pnpm
- Supabase account (or local Supabase CLI)
- OpenAI API key

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Initialize database**

   Option A — Supabase CLI:
   ```bash
   npx supabase db push      # apply migrations from supabase/migrations/
   npx supabase db seed      # seed data from supabase/seed.sql
   ```

   Option B — Supabase SQL Editor:
   ```bash
   # 1. Create tables: supabase/migrations/20260711000000_initial_schema.sql
   # 2. Add orders table: supabase/migrations/20260712000000_add_orders.sql
   # 3. Seed data: supabase/seed.sql
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm lint` | Run ESLint |

## Project Structure

```
quickreply-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # LLM streaming, tool calling (Edge Runtime)
│   │   │   └── orders/route.ts      # Order creation API
│   │   ├── dashboard/               # Admin dashboard
│   │   │   ├── api/                 # Dashboard API routes (metrics, conversations, orders)
│   │   │   ├── conversations/       # Conversation history page
│   │   │   ├── orders/              # Order management page
│   │   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   │   └── page.tsx             # Dashboard overview (KPIs, charts)
│   │   ├── globals.css              # Tailwind + design tokens
│   │   ├── layout.tsx               # Root layout (Vietnamese metadata)
│   │   └── page.tsx                 # Storefront homepage
│   ├── components/
│   │   ├── ChatWidget.tsx           # AI chat panel with useChat hook
│   │   ├── CartDrawer.tsx           # Slide-out shopping cart
│   │   ├── ProductCard.tsx          # Product card for chat tool output
│   │   ├── home/                    # Storefront components
│   │   │   ├── TopNavBar.tsx        # Sticky header with search + cart
│   │   │   ├── HeroSection.tsx      # Hero banner
│   │   │   ├── CategoryBar.tsx      # Horizontal category icons
│   │   │   ├── ProductGrid.tsx      # Product grid with filtering
│   │   │   └── HomeFooter.tsx       # Footer
│   │   └── dashboard/               # Dashboard UI components
│   │       ├── MetricCard.tsx       # KPI metric cards
│   │       ├── FunnelChart.tsx      # Conversion funnel
│   │       ├── ConversationTable.tsx # Chat session table
│   │       └── OrderTable.tsx       # Orders table
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client + DB types
│   │   ├── rag.ts                   # OpenAI embeddings + pgvector RPC
│   │   ├── session.ts               # Anonymous UUID in localStorage
│   │   ├── phongvu-api.ts           # Phong Vu Discovery API client
│   │   ├── phongvu-help.ts          # help.phongvu.vn document fetcher + ranker
│   │   ├── phongvu-tools.ts         # AI SDK tool definitions (7 tools)
│   │   ├── products.ts              # Static home page product data
│   │   └── dashboard.ts             # Dashboard data access layer
│   ├── store/
│   │   └── useCartStore.ts          # Zustand cart store with persist
│   └── skills/                      # On-demand AI skills
│       └── phongvu-sales-agent/
│           ├── SKILL.md             # Main sales agent skill
│           ├── phongvu-researcher/  # Product search & filtering
│           ├── phongvu-comparator/  # Product comparison
│           └── phongvu-advisor/     # Sales advisory
├── phongvu-ai-agent/                # Git submodule — MCP server + Cloudflare Worker
│   ├── mcp-server/                  # MCP server (6 tools, stdio transport)
│   ├── cloudflare-worker/           # API proxy (rate limit, cache, CORS)
│   ├── rag-data/                    # 23 help center documents
│   └── skills/                      # MCP-native skill definitions
├── supabase/
│   ├── config.toml                  # Supabase local dev config
│   ├── migrations/                  # Database schema + orders table
│   └── seed.sql                     # RAG knowledge base (23 documents)
├── tests/                           # Vitest test suite
│   ├── rag.test.ts                  # RAG context formatting
│   ├── useCartStore.test.ts         # Cart store unit tests
│   ├── products.test.ts             # Product data validation
│   ├── phongvu-help.test.ts         # Help document parsing + ranking
│   └── home-cart-integration.test.ts # Cart + product integration
└── specs/                           # Spec-driven development artifacts
```

## MCP Server (phongvu-ai-agent)

The `phongvu-ai-agent/` directory is a standalone MCP (Model Context Protocol) server that exposes 6 product tools via `@modelcontextprotocol/sdk` over stdio transport. It connects to the Phong Vu Discovery API through a Cloudflare Worker proxy.

**Tools exposed:**

| Tool | Description |
|------|-------------|
| `search_products` | Search with filters (price, brand, attributes, sort) |
| `get_product_detail` | Full product details by SKU |
| `compare_products` | Side-by-side comparison of 2–3 products |
| `get_popular_keywords` | Trending search terms |
| `get_recommendations` | Related product suggestions |
| `check_stock` | Inventory status and promotions |

**Quick start:**
```bash
cd phongvu-ai-agent/mcp-server
npm install
npm start
```

See [phongvu-ai-agent/README.md](phongvu-ai-agent/README.md) for full documentation.

## Skills System

The on-demand skill system loads specialized markdown instructions dynamically via the `loadSkill` tool. Skills define *how* the AI should approach different customer scenarios:

| Skill | Purpose | Allowed Tools |
|-------|---------|---------------|
| **phongvu-sales-agent** | Main orchestrator — routes intent to sub-skills | All |
| **phongvu-researcher** | Product search & filtering by budget, brand, usage | search_products, get_product_detail, get_popular_keywords |
| **phongvu-comparator** | Side-by-side product comparison with markdown tables | compare_products, get_product_detail, search_products |
| **phongvu-advisor** | Sales synthesis, accessory recommendations, stock check | get_product_detail, get_recommendations, check_stock |
| **phongvu-support** | Customer support via RAG data from help center | webfetch, read, glob, grep |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_BASE_URL` | No | Custom OpenAI base URL (proxy/gateway) |
| `OPENAI_MODEL` | No | LLM model (default: `gpt-4o-mini`) |


Video demo https://youtu.be/JEn_Yp6mLxE

## License

MIT
