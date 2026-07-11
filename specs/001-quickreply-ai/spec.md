# Feature Specification: QuickReply AI Conversational Sales Agent

**Feature Branch**: `001-quickreply-ai`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "Build an interactive AI Chat Widget embedded into a mockup storefront. Use RAG architecture to query official Phong Vu hardware specs, active promotions, and warranty policies. Implement Function Calling (Tools) and Streamable UI to dynamically inject interactive React components (Product Cards, 'Add to Cart' triggers) directly into the chat stream based on user intent."

## Clarifications

### Session 2026-07-11

- Q: How should the shopping cart state be synchronized between the Next.js storefront and the AI Chat Widget? → A: LocalStorage/Zustand client-side state store synchronized via local storage and custom events (Option C).
- Q: Which Vector Database or search mechanism should be used for RAG? → A: PostgreSQL with pgvector via Supabase (Option A).
- Q: How should API rate-limiting and abuse protection for the LLM chat widget endpoint be handled? → A: No rate-limiting for MVP, deferred to Vercel deployment settings (Option C).
- Q: How are users/sessions identified to maintain their respective chat history and cart? → A: Anonymous session cookies/UUIDs generated on first load (no login required for MVP) (Option A).
- Q: What is the fallback behavior when the RAG database search fails or the LLM is unavailable? → A: Silently retry the request up to 3 times before displaying a generic error message (Option C).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - RAG Hardware & Spec Querying (Priority: P1)

As a customer on the Phong Vu mockup storefront, I want to ask the AI assistant about hardware specifications, active promotions, and warranty policies so that I can make informed buying decisions.

**Why this priority**: Core functionality of the Conversational Sales Agent, enabling users to get accurate hardware and promotion details instantly.

**Independent Test**: User opens the chat widget, types "What is the warranty policy for ASUS laptops?", and receives a correct answer sourced from the warranty policies.

**Acceptance Scenarios**:

1. **Given** the customer is on the storefront and opens the AI Chat Widget, **When** they ask "What are the specs of the ASUS TUF Gaming A15?", **Then** the system queries the RAG database and returns the correct official specifications.
2. **Given** the customer is in chat, **When** they ask "Are there any active discounts on monitors?", **Then** the system retrieves active monitor promotions and lists them in the response.

---

### User Story 2 - Dynamic Product Card Injection (Priority: P2)

As a customer, I want the AI to show me interactive product cards directly in the chat when I ask for recommendations, so that I can visually compare products and interact with them.

**Why this priority**: High user engagement. Injects streamable, interactive React components directly into the conversation stream instead of plain text.

**Independent Test**: User asks "Show me laptops under 20 million VND", and the system responds by rendering custom product cards with pictures, pricing, and key specs.

**Acceptance Scenarios**:

1. **Given** the user requests laptop recommendations, **When** the AI matches the recommendation tool, **Then** it streams a React Product Card component containing the laptop details into the chat window.

---

### User Story 3 - Add to Cart Trigger from Chat (Priority: P3)

As a customer, I want to be able to add a recommended product to my shopping cart directly from the chat product card or via a text command, so that I can checkout seamlessly.

**Why this priority**: Critical conversion step. Bridges the chat experience with the storefront's ecommerce state.

**Independent Test**: User clicks "Add to Cart" on a streamed product card, and the storefront shopping cart icon count increments immediately.

**Acceptance Scenarios**:

1. **Given** an interactive Product Card in the chat window, **When** the customer clicks the "Add to Cart" button inside the card, **Then** the storefront cart state is updated and the item is added.

---

### Edge Cases

- What happens when a recommended product is out of stock?
- How does the system handle network latency during RAG queries to prevent UI freezing?
- What happens when the user clicks "Add to Cart" multiple times or adjusts quantities from the chat card?
- What happens when the RAG database search fails or the LLM is unavailable? → The system will silently retry the request up to 3 times before displaying a generic error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST embed an interactive AI Chat Widget into a mockup storefront webpage.
- **FR-002**: System MUST use RAG architecture with PostgreSQL and pgvector (via Supabase) to query hardware specs, promotions, and warranties.
- **FR-003**: System MUST implement tool calling using Vercel AI SDK Core.
- **FR-004**: System MUST use @ai-sdk/elements or custom UI components to stream interactive React components (Product Cards, Add to Cart buttons) into the chat stream.
- **FR-005**: System MUST sync the shopping cart state between the chat widget and the storefront UI using a client-side Zustand store persisted in LocalStorage and synchronized via custom events.
- **FR-006**: System MUST track user chat history and session cart state using an anonymous session UUID stored in cookies/localStorage.
- **FR-007**: System MUST retry failed RAG searches or LLM requests up to 3 times silently before returning a generic user-facing error message.

### Key Entities

- **Product**: Represents hardware items sold, with attributes like ID, Name, Brand, Specifications, Price, and Stock Status.
- **Cart**: Represents the customer's active shopping cart, managed client-side using Zustand and persisted in LocalStorage, containing items, quantities, and total price.
- **Session**: Represents an anonymous user session tracked via a client-generated UUID cookie or local storage key.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI response generation (first token) starts in under 1.5 seconds for RAG queries.
- **SC-002**: The shopping cart updates in real-time (< 200ms) when an item is added from the chat widget.
- **SC-003**: Streamed React components render correctly without layout shifts.

## Assumptions

- Storefront mockup uses Next.js App Router for frontend layout.
- RAG knowledge base data is static or updated periodically.
- API rate-limiting on the LLM/chat endpoints is out of scope for the MVP and deferred to Vercel deployment/platform-level settings.
