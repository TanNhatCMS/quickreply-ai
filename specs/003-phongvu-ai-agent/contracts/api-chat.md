# API Contract: POST /api/chat

**Feature**: 003-phongvu-ai-agent

## Request

```http
POST /api/chat
Content-Type: application/json
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | `UIMessage[]` | Yes | Chat history (AI SDK v7 format) |
| `sessionId` | `string` | No | Anonymous session UUID |

## Response

Returns SSE stream (`text/event-stream`) with UI message chunks.

### Error Responses

| Status | Body | When |
|--------|------|------|
| 400 | `{ "error": "No messages provided" }` | Empty messages |
| 500 | Stream error event | LLM/MCP failure after 3 retries |

## Tools

| Tool | Type | Description |
|------|------|-------------|
| `search_products` | MCP | Search Phong Vũ products |
| `get_product_detail` | MCP | Product details by SKU |
| `compare_products` | MCP | Compare 2-3 products |
| `get_recommendations` | MCP | Related products |
| `check_stock` | MCP | Stock status |
| `get_popular_keywords` | MCP | Popular search terms |
| `addToCart` | Client | Add to Zustand cart |

## Side Effects

- Upserts `chat_sessions` row
- Inserts `chat_messages` trace rows
- Spawns MCP subprocess
