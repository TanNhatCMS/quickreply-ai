# API Contract: Chat Streaming Endpoint (`/api/chat`)

This contract defines the request payload, streaming response format, and tool specifications for the Next.js API route that handles Conversational Sales Agent queries.

---

## 1. HTTP Endpoint Specification

* **Path**: `/api/chat`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Show me Apple laptops under 30 million VND"
      }
    ],
    "sessionId": "4a28db94-6b21-4f18-a6b3-de0148466b0a"
  }
  ```

---

## 2. Response Format

The route returns a stream with `Content-Type: text/plain; charset=utf-8` using Vercel AI SDK Core's streaming features. It contains standard textual chunks, tool execution frames, and tool result details that the client-side `@ai-sdk/elements` or custom client handlers decode to render interactive React Server Components.

---

## 3. Function Calling (Tools) Specifications

The LLM is equipped with the following tools to interact with the database and client storefront.

### `queryProducts`
Allows the agent to search the database for products matching specifications or recommendations.

* **Tool Schema**:
  ```json
  {
    "name": "queryProducts",
    "description": "Searches for hardware products matching the user's requirements (e.g. brand, CPU, RAM, price, gaming capability).",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Natural language search query outlining hardware specifications (e.g. 'high RAM', 'RTX 4060')."
        },
        "brand": {
          "type": "string",
          "description": "Optional filter by manufacturer name (ASUS, Dell, Apple, etc.)."
        },
        "maxPrice": {
          "type": "number",
          "description": "Optional filter for maximum price in VND."
        }
      },
      "required": ["query"]
    }
  }
  ```

---

### `queryPromotions`
Allows the agent to lookup current discounts, promotional campaigns, or offers.

* **Tool Schema**:
  ```json
  {
    "name": "queryPromotions",
    "description": "Queries active sales promotions, discount codes, or campaigns for products.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Description of the product/category search for discounts (e.g., 'monitor discounts', 'ASUS laptops code')."
        }
      },
      "required": ["query"]
    }
  }
  ```

---

### `queryWarranty`
Allows the agent to lookup warranty conditions and durations for specific brands.

* **Tool Schema**:
  ```json
  {
    "name": "queryWarranty",
    "description": "Look up official warranty terms, durations, and claim conditions for a specific brand.",
    "parameters": {
      "type": "object",
      "properties": {
        "brand": {
          "type": "string",
          "description": "The brand name to look up policies for (ASUS, Apple, Dell, Acer, etc.)."
        }
      },
      "required": ["brand"]
    }
  }
  ```

---

### `addToCartTrigger`
Allows the agent to directly execute an addition to the shopping cart within the client UI.

* **Tool Schema**:
  ```json
  {
    "name": "addToCartTrigger",
    "description": "Triggers the inclusion of a product into the user's shopping cart.",
    "parameters": {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string",
          "description": "The exact UUID of the product to add."
        },
        "quantity": {
          "type": "integer",
          "description": "The number of units to add (defaults to 1).",
          "minimum": 1
        }
      },
      "required": ["productId"]
    }
  }
  ```
