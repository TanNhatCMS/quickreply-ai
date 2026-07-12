# Quickstart: Phong Vu AI Agent

**Date**: 2026-07-12 | **Feature**: 003-phongvu-ai-agent

## Prerequisites

- Node.js v18+, pnpm
- Supabase project with tables migrated
- OpenAI API key
- Git submodule initialized

## Setup

```bash
pnpm install
git submodule update --init
# Configure .env.local with SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY
pnpm dev
```

## Validation Scenarios

### Scenario 1: Product Search (P1)
1. Open http://localhost:3000 → click chat widget
2. Type "tìm laptop gaming dưới 20 triệu"
3. **Expected**: Agent calls `search_products` via MCP, returns product cards with prices

### Scenario 2: Product Comparison (P2)
1. Type "so sánh MacBook Air và Dell XPS"
2. **Expected**: Agent returns comparison table

### Scenario 3: Add to Cart (P3)
1. Click "Thêm vào giỏ" on product card
2. **Expected**: Cart drawer updates, count increments

### Scenario 4: Warranty/Policy (P4)
1. Type "bảo hành ASUS bao lâu?"
2. **Expected**: Agent queries RAG knowledge base, returns warranty info

### Scenario 5: Chat Trace
1. Complete a conversation
2. Check Supabase `chat_sessions` and `chat_messages`
3. **Expected**: Session created, messages saved with metadata

## Verify Build

```bash
pnpm exec tsc --noEmit    # 0 errors
pnpm test                  # all pass
```
