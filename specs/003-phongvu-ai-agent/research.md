# Research: Phong Vu AI Agent

**Date**: 2026-07-12 | **Feature**: 003-phongvu-ai-agent

## Decision 1: Product Data Source

**Decision**: Use MCP tools querying Phong Vũ Discovery API realtime

**Rationale**: 
- No need to maintain local product database
- Always-fresh data (prices, stock, promotions)
- MCP server already built in submodule `phongvu-ai-agent/mcp-server`
- Vercel AI SDK v7 has native MCP client support (`@ai-sdk/mcp`)

**Alternatives considered**:
- Local Supabase product catalog (rejected: data staleness, maintenance burden)
- Direct HTTP calls to Phong Vũ API (rejected: no tool schema auto-discovery)

## Decision 2: MCP Transport

**Decision**: `StdioClientTransport` — spawn MCP server as subprocess

**Rationale**:
- MCP server is a standalone Node.js script using `@modelcontextprotocol/sdk`
- `@ai-sdk/mcp` `MCPTransportConfig` only supports `sse`/`http`, but `MCPTransport` interface accepts custom transports
- `StdioClientTransport` from `@modelcontextprotocol/sdk/client/stdio.js` works directly
- No need to run MCP server as separate HTTP service

**Alternatives considered**:
- SSE transport (rejected: requires running MCP server as HTTP service)
- Wrap MCP API calls as manual AI SDK tools (rejected: loses auto tool discovery)

## Decision 3: RAG for Policy/Warranty/FAQ

**Decision**: Keep Supabase `documents` table with `match_documents` RPC for non-product queries

**Rationale**:
- Policy, warranty, FAQ data not available via Phong Vũ Discovery API
- Already implemented in `src/lib/rag.ts` and `supabase/migrations/`
- RAG context injected into system prompt for relevant queries

**Alternatives considered**:
- All data via MCP (rejected: API doesn't expose policy/warranty data)
- Remove RAG entirely (rejected: loses policy/warranty answering capability)

## Decision 4: Chat Trace Storage

**Decision**: Supabase `chat_sessions` + `chat_messages` tables

**Rationale**:
- Dashboard needs ordered session replay
- Trace metadata (tokens, latency, model) for performance monitoring
- Fire-and-forget writes (don't block response)

**Alternatives considered**:
- Client-side only (rejected: no dashboard access)
- Vercel Analytics (rejected: not granular enough for per-message trace)

## Decision 5: Runtime

**Decision**: `runtime = 'nodejs'` (not `edge`)

**Rationale**:
- MCP client spawns subprocess (`StdioClientTransport`) — not supported on Edge Runtime
- `@modelcontextprotocol/sdk` uses Node.js APIs
- Tradeoff: slightly higher cold start vs Edge, but required for MCP

**Alternatives considered**:
- Edge Runtime (rejected: can't spawn subprocess)
- Separate MCP service on Edge (rejected: adds complexity for MVP)
