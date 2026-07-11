# API Contract: Orders Endpoint (`/api/orders`)

## POST /api/orders

Creates a new order from the storefront cart checkout.

### Request

```
POST /api/orders
Content-Type: application/json
```

```json
{
  "sessionId": "4a28db94-6b21-4f18-a6b3-de0148466b0a",
  "items": [
    {
      "productId": "prod-uuid-1",
      "name": "ASUS ROG Strix G16",
      "brand": "ASUS",
      "price": 32990000,
      "quantity": 1,
      "image": "https://..."
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | `string (uuid)` | No | Associated chat session UUID. If omitted, order is not linked to a session. |
| `items` | `array` | Yes | Array of cart items. Must have at least 1 item. |
| `items[].productId` | `string` | Yes | Product identifier. |
| `items[].name` | `string` | Yes | Product name. |
| `items[].brand` | `string` | Yes | Product brand. |
| `items[].price` | `number` | Yes | Unit price in VND. Must be ≥ 0. |
| `items[].quantity` | `integer` | Yes | Quantity. Must be ≥ 1. |
| `items[].image` | `string` | No | Product image URL. Defaults to `""`. |

### Response — Success (201)

```json
{
  "orderId": "new-uuid",
  "status": "pending",
  "total": 32990000
}
```

### Response — Error (400)

```json
{
  "error": "Items array is required and must not be empty"
}
```

### Response — Error (500)

```json
{
  "error": "Failed to create order"
}
```

---

## GET /api/orders

Returns paginated order list for the dashboard.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `integer` | `1` | Page number (1-indexed). |
| `limit` | `integer` | `20` | Items per page. |
| `status` | `string` | (all) | Filter by order status. |

### Response — Success (200)

```json
{
  "orders": [
    {
      "id": "order-uuid",
      "sessionId": "session-uuid",
      "items": [...],
      "total": 32990000,
      "status": "pending",
      "createdAt": "2026-07-12T10:00:00Z"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "limit": 20
}
```

---

## GET /api/dashboard/metrics

Returns aggregated metrics for the Overview page.

### Response — Success (200)

```json
{
  "totalConversations": 150,
  "avgResponseTimeMs": 2400,
  "aiDeflectionRate": 41.5,
  "conversionRate": 8.2
}
```

---

## GET /api/dashboard/conversations

Returns paginated chat sessions with message counts for the Conversations page.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `integer` | `1` | Page number (1-indexed). |
| `limit` | `integer` | `20` | Items per page. |
| `search` | `string` | (none) | Keyword to search in message content. |

### Response — Success (200)

```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "startedAt": "2026-07-12T10:00:00Z",
      "endedAt": "2026-07-12T10:15:00Z",
      "userAgent": "Mozilla/5.0 ...",
      "messageCount": 12
    }
  ],
  "totalCount": 150,
  "page": 1,
  "limit": 20
}
```

---

## GET /api/dashboard/conversations/[id]

Returns full message thread for a single session.

### Response — Success (200)

```json
{
  "session": {
    "id": "session-uuid",
    "startedAt": "2026-07-12T10:00:00Z",
    "endedAt": null,
    "userAgent": "Mozilla/5.0 ..."
  },
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "Tìm laptop gaming dưới 25tr",
      "toolCalls": [],
      "createdAt": "2026-07-12T10:00:05Z"
    }
  ]
}
```
