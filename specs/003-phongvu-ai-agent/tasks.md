# Tasks: Phong Vu AI Agent (Skills & Tools)

**Input**: Design documents from `/specs/003-phongvu-ai-agent/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-chat.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and MCP integration

- [x] T001 Initialize git submodule `phongvu-ai-agent` and verify MCP server runs (`node phongvu-ai-agent/mcp-server/index.js`)
- [x] T002 Install dependencies: `@ai-sdk/mcp`, `@modelcontextprotocol/sdk` in package.json
- [x] T003 [P] Update `runtime` in `src/app/api/chat/route.ts` from `'edge'` to `'nodejs'` (MCP requires subprocess)
- [x] T004 [P] Verify Supabase tables exist: `chat_sessions`, `chat_messages`, `documents` via `supabase/migrations/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: MCP client integration + chat trace — blocks all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Refactor `src/app/api/chat/route.ts`: replace `searchKnowledge` tool with MCP client (`createMCPClient` + `StdioClientTransport` connecting to `phongvu-ai-agent/mcp-server/index.js`)
- [x] T006 Merge MCP tools into `streamText` tools object: spread `mcpTools` from `mcpClient.tools()` alongside `addToCart` client-side tool
- [x] T007 Update system prompt in `src/app/api/chat/route.ts` to describe MCP tools (search_products, get_product_detail, compare_products, get_recommendations, check_stock, get_popular_keywords)
- [x] T008 Implement chat trace: save user message to `chat_messages` before stream, save assistant trace after stream (fire-and-forget)
- [x] T009 Implement session management: upsert `chat_sessions` on each request, use `sessionId` from request body or generate UUID
- [x] T010 Close MCP client after response (`mcpClient.close()`) to clean up subprocess
- [x] T011 Update `src/components/ChatWidget.tsx`: remove `searchKnowledge` tool rendering, add rendering for MCP tool results (product cards from `search_products`, comparison table from `compare_products`)

**Checkpoint**: MCP integration working — Agent can search products via Phong Vũ API

---

## Phase 3: User Story 1 — Product Search (Priority: P1) 🎯 MVP

**Goal**: User asks for products, Agent searches via MCP and returns product cards

**Independent Test**: Type "tìm laptop gaming dưới 20 triệu" → Agent returns product cards with prices

### Implementation for User Story 1

- [x] T012 [P] [US1] Create `src/components/ProductCard.tsx` component: displays product name, brand, price (VND formatted), image, stock status, "Thêm vào giỏ" button
- [x] T013 [US1] Implement product card rendering in `ChatWidget.tsx`: when `search_products` tool returns results, render `ProductCard` components in chat stream
- [x] T014 [US1] Handle empty search results: display "Không tìm thấy sản phẩm phù hợp" message
- [x] T015 [US1] Add price filter parsing in system prompt: "dưới 20 triệu" → `price_lte: 20000000`, "trên 10 triệu" → `price_gte: 10000000`

**Checkpoint**: Product search working end-to-end via MCP

---

## Phase 4: User Story 2 — Product Comparison (Priority: P2)

**Goal**: User asks to compare products, Agent returns comparison table

**Independent Test**: Type "so sánh MacBook Air và Dell XPS" → Agent returns comparison grid

### Implementation for User Story 2

- [x] T016 [P] [US2] Create `src/components/ComparisonGrid.tsx` component: displays 2-3 products in columns with specs as rows
- [x] T017 [US2] Implement comparison rendering in `ChatWidget.tsx`: when `compare_products` tool returns results, render `ComparisonGrid`
- [x] T018 [US2] Add "Chọn mua" button per column in `ComparisonGrid` that calls `addToCart`

**Checkpoint**: Product comparison working

---

## Phase 5: User Story 3 — Add to Cart (Priority: P3)

**Goal**: User adds products to cart from chat, cart syncs with storefront

**Independent Test**: Click "Thêm vào giỏ" on product card → cart count increments in header

### Implementation for User Story 3

- [x] T019 [US3] Connect `ProductCard` "Thêm vào giỏ" button to `useCartStore.addItem()`
- [x] T020 [US3] Connect `ComparisonGrid` "Chọn mua" button to `useCartStore.addItem()`
- [x] T021 [US3] Implement `addToCart` client-side tool in `ChatWidget.tsx`: on `onToolCall`, call `addItem` + `toggleDrawer(true)`
- [x] T022 [US3] Add cart summary rendering: when user asks "giỏ hàng có gì", Agent reads cart state and responds

**Checkpoint**: Cart sync working from chat widget

---

## Phase 6: User Story 4 — Warranty/Policy via RAG (Priority: P4)

**Goal**: User asks about warranty, policies, FAQ → Agent answers from RAG knowledge base

**Independent Test**: Type "bảo hành ASUS bao lâu?" → Agent returns correct warranty info

### Implementation for User Story 4

- [x] T023 [US4] Update system prompt to include RAG context injection: when user asks about warranty/policy/FAQ, retrieve from `documents` table via `queryDocuments()`
- [x] T024 [US4] Add RAG context to system prompt in `route.ts`: call `retrieveContext()` + `formatContextForPrompt()` and inject into system message
- [x] T025 [US4] Test RAG queries with sample warranty/policy questions

**Checkpoint**: Warranty/policy questions answered via RAG

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, testing, documentation

- [x] T026 Update `specs/003-phongvu-ai-agent/spec.md` to align with MCP-based architecture
- [x] T027 Update `CLAUDE.md` data model section to reflect MCP + RAG hybrid approach
- [x] T028 Run `quickstart.md` validation scenarios end-to-end
- [x] T029 Verify TypeScript build: `pnpm exec tsc --noEmit` → 0 errors
- [x] T030 Verify tests pass: `pnpm test` → all green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP target
- **US2 (Phase 4)**: Depends on Phase 2 — can parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2 — can parallel with US1/US2
- **US4 (Phase 6)**: Depends on Phase 2 — can parallel with US1/US2/US3
- **Polish (Phase 7)**: Depends on all user stories complete

### Parallel Opportunities

- T003, T004 can run in parallel (different files)
- T012, T016 can run in parallel (different components)
- US1, US2, US3, US4 can all run in parallel after Phase 2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T011) — MCP integration
3. Complete Phase 3: US1 Product Search (T012-T015)
4. **STOP and VALIDATE**: Test product search end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → MCP working
2. + US1 → Product search (MVP!)
3. + US2 → Product comparison
4. + US3 → Cart integration
5. + US4 → Warranty/policy via RAG
6. Polish → Production ready

---

## Notes

- MCP server spawned as subprocess per request via `StdioClientTransport`
- Runtime must be `nodejs` (not `edge`) for subprocess support
- Chat trace is fire-and-forget (don't block response)
- RAG only for policy/warranty/FAQ (not products)
- `addToCart` is client-side tool (no server execute)
