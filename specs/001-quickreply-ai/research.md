# Research: Architectural Decisions for QuickReply AI

This document summarizes the architectural research, alternatives considered, and final decisions for the QuickReply AI MVP storefront Conversational Sales Agent.

---

## 1. Cart State Management

### Decision
Use a client-side **Zustand** store persisted to **LocalStorage** and synchronized across widgets/storefront elements via custom DOM events.

### Rationale
- **Decoupled Architecture**: Next.js React Server Components (RSC) render the shell page while Client Components manage the chat widget and the cart drawer. A client-side Zustand store allows instant, low-latency updates (<200ms) without hitting a remote database on every button click.
- **Session Continuity**: Persisting the store in `localStorage` ensures that if a user refreshes the page, their shopping cart remains intact.
- **Cross-Component Events**: Custom DOM events (e.g. `cart-sync`) will be dispatched by the Zustand store middleware to notify other elements on the storefront, keeping the UI completely in sync.

### Alternatives Considered
- **Shared React Context**: Rejected because it does not support persistence across full page refreshes without extra boilerplate, and can cause unnecessary re-renders in deep component trees.
- **Database-Persisted Cart with Server Actions**: Rejected for the MVP because it adds latency (remote network roundtrip on every cart change) and increases server load unnecessarily before checkout.

---

## 2. Vector Database for RAG

### Decision
Use **PostgreSQL with `pgvector` extension** hosted on **Supabase**.

### Rationale
- **Unified Stack**: Supabase already provides a PostgreSQL database, user authentication (if needed later), and client-side SDKs. Enabling the `pgvector` extension allows us to store product embeddings alongside relational product metadata (stock, price) in a single database.
- **Hybrid Search**: We can write standard SQL queries combining semantic search (similarity distance) with metadata filters (e.g., brand, price ranges, in-stock status) in a single query.
- **Cost & Simplicity**: Supabase provides a generous free tier which is sufficient for hosting the ~100 product specs and warranty policies for the MVP.

### Alternatives Considered
- **Pinecone / Serverless Vector DB**: Rejected because it requires managing multiple database providers, API keys, and complicates querying when joining vector scores with relational database constraints (like stock level or discounts).
- **Local In-memory Vector Search (Orama/Minisearch)**: Rejected because embeddings would need to be either computed client-side (extremely heavy/slow) or loaded as a massive pre-computed JSON bundle on page load, which hurts performance.

---

## 3. API Rate-Limiting & Cost Protection

### Decision
Defer API rate-limiting to the hosting platform (**Vercel deployment configurations**).

### Rationale
- **MVP Simplicity**: For the initial MVP, adding Redis instances (like Upstash) for rate-limiting introduces third-party overhead. Standard platform DDoS protection and function limits on Vercel are sufficient to protect the backend from runaway loops.
- **LLM Token Budgets**: Cost limits will be controlled at the API provider level (e.g., OpenAI usage limits) rather than custom middleware.

### Alternatives Considered
- **Upstash Redis edge rate-limiting**: Highly recommended for production, but rejected for the MVP to reduce structural complexity.
- **In-Memory Middleware Limiter**: Rejected because serverless edge functions are stateless; in-memory tracking is reset on spin-down, making it ineffective.

---

## 4. Customer Authentication & Session Identity

### Decision
Track users via **Anonymous Session UUIDs** generated on first load and stored in cookies/localStorage.

### Rationale
- **Low Friction**: Sales assistants must be immediately available. Requiring user sign-up or login to query products creates high churn.
- **History Retrieval**: The session UUID serves as a partition key in the Supabase database to fetch previous chat history, maintaining state across page reloads.

### Alternatives Considered
- **NextAuth/Auth.js Integration**: Deferred to post-MVP phase.
- **Temporary In-memory Session State**: Rejected because refreshing the page would wipe out the chat conversation, harming user experience.

---

## 5. RAG & LLM Failure Handling

### Decision
Implement **silent retries (up to 3 times)** at the API router level, then display a generic user-facing error message if the service remains down.

### Rationale
- **Robustness**: Serverless API calls to LLM providers can occasionally time out or hit temporary rate limits. Implementing a silent retry loop (with exponential backoff) resolves transient errors transparently.
- **Clean UI Boundaries**: If retries fail, returning a standard generic error code allows the client-side ChatWidget to render a polite "System busy" card, preventing the widget from hanging indefinitely.

### Alternatives Considered
- **Fallback to standard SQL keyword search**: Rejected because if the database or API routing is down, keyword queries will also fail. It is safer to retry the request and provide a clear error message.
