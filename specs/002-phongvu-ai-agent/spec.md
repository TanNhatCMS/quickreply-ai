# Feature Specification: Phong Vu AI Agent (Skills & Tools)

**Feature Branch**: `002-phongvu-ai-agent`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Triển khai AI Agent cho chatbot Phong Vu sử dụng Vercel AI SDK với hệ thống skills và tools. Agent có khả năng tự động hóa các tác vụ bán hàng: tìm kiếm sản phẩm, so sánh, tư vấn, thêm vào giỏ hàng, và quản lý đơn hàng."

## User Scenarios & Testing

### User Story 1 - Agent tự động tìm kiếm sản phẩm theo yêu cầu (Priority: P1)

Người dùng nhập câu hỏi như "Tôi cần mộtaptop gaming dưới 20 triệu" hoặc "Cho tôi xem điện thoại Samsung mới nhất". Agent tự động nhận diện ý định, gọi tool tìm kiếm sản phẩm trong database, và trả về danh sách sản phẩm phù hợp dưới dạng Product Cards được stream trực tiếp vào chat.

**Why this priority & Persona Alignment**: Đây là core value của chatbot — giúp người mua sắm trên Phong Vu tìm được sản phẩm phù hợp nhanh chóng mà không cần duyệt qua hàng trăm sản phẩm. Trực tiếp tăng conversion bằng cách rút ngắn hành trình từ "tìm kiếm" đến "quyết định mua".

**Independent Test**: Có thể test độc lập bằng cách nhập các câu hỏi tìm kiếm khác nhau và verify Agent trả về đúng sản phẩm phù hợp với bộ lọc.

**Acceptance Scenarios**:

1. **Given** người dùng đang ở trang chủ Phong Vu, **When** nhập "tìm laptop ASUS giá dưới 15 triệu", **Then** Agent trả về danh sách laptop ASUS phù hợp với giá hiển thị rõ ràng trên Product Cards
2. **Given** không có sản phẩm nào khớp với tìm kiếm, **When** người dùng yêu cầu, **Then** Agent trả về thông báo "Không tìm thấy sản phẩm phù hợp" và gợi ý sản phẩm liên quan
3. **Given** người dùng hỏi về sản phẩm cụ thể, **When** nhập tên sản phẩm hoặc SKU, **Then** Agent trả về chi tiết sản phẩm bao gồm thông số kỹ thuật và giá

---

### User Story 2 - Agent so sánh sản phẩm và tư vấn thông minh (Priority: P2)

Agent có khả năng so sánh 2-3 sản phẩm theo nhiều tiêu chí (giá, thông số, thương hiệu) và đưa ra gợi ý tư vấn dựa trên nhu cầu cụ thể của người dùng. Ví dụ: "Giữa MacBook Air M3 và Dell XPS 15, cái nào phù hợp cho dân thiết kế?"

**Why this priority & Persona Alignment**: Giúp người mua sắm Phong Vu đưa ra quyết định mua hàng tự tin hơn. Agent đóng vai trò như nhân viên tư vấn giỏi, phân tích đúng nhu cầu và đưa ra gợi ý hợp lý — tăng khả năng chốt đơn.

**Independent Test**: Có thể test bằng cách yêu cầu Agent so sánh 2 sản phẩm cụ thể và verify nó trả về bảng so sánh chi tiết cùng gợi ý.

**Acceptance Scenarios**:

1. **Given** người dùng yêu cầu so sánh, **When** nhập "so sánh iPhone 15 và Samsung S24", **Then** Agent trả về bảng so sánh 2 sản phẩm với các tiêu chí chính (giá, camera, pin, hiệu năng)
2. **Given** người dùng mô tả nhu cầu cụ thể, **When** nhập "tôi cần laptop để chỉnh sửa video", **Then** Agent gợi ý 2-3 sản phẩm phù hợp với lý do chi tiết cho từng gợi ý
3. **Given** người dùng hỏi về sự khác biệt giữa hai sản phẩm, **When** Agent đã có thông tin từ RAG, **Then** Agent trả lời chính xác và trích dẫn nguồn thông tin

---

### User Story 3 - Agent thêm vào giỏ hàng và quản lý đơn hàng (Priority: P3)

Agent có khả năng thêm sản phẩm trực tiếp vào giỏ hàng thông qua tool calling, đồng bộ với Zustand store trên client. Ngoài ra, Agent có thể kiểm tra trạng thái giỏ hàng, gợi ý sản phẩm bổ sung, và hỗ trợ quy trình checkout.

**Why this priority & Persona Alignment**: Rút ngắn quá trình mua hàng — người dùng không cần rời khỏi chat để thêm sản phẩm vào giỏ. Giảm friction, tăng conversion rate.

**Independent Test**: Có thể test bằng cách yêu cầu Agent thêm sản phẩm vào giỏ và verify Zustand store cập nhật đúng. Kiểm tra cart drawer hiển thị sản phẩm mới.

**Acceptance Scenarios**:

1. **Given** người dùng đã chọn sản phẩm, **When** nói "thêm vào giỏ hàng", **Then** Agent gọi tool addToCart và sản phẩm xuất hiện trong Zustand store + Cart Drawer
2. **Given** giỏ hàng có sản phẩm, **When** người dùng hỏi "giỏ hàng của tôi có gì", **Then** Agent trả về danh sách sản phẩm trong giỏ với tổng tiền
3. **Given** người dùng muốn mua thêm, **When** Agent thấy giỏ hàng hiện tại, **Then** Agent gợi ý sản phẩm bổ sung (ví dụ: "Bạn đã chọn laptop, có muốn thêm baloProtect không?")

---

### User Story 4 - Agent xử lý thông tin khuyến mãi và chính sách (Priority: P4)

Agent có khả năng trả lời các câu hỏi về chương trình khuyến mãi đang diễn ra, chính sách bảo hành, đổi trả, và giao hàng. Thông tin được truy xuất từ RAG knowledge base.

**Why this priority & Persona Alignment**: Giải đáp thắc mắc nhanh chóng giúp người mua sắm Phong Vu yên tâm hơn khi ra quyết định, giảm tải cho bộ phận CSKH.

**Independent Test**: Có thể test bằng cách hỏi về chính sách bảo hành hoặc khuyến mãi và verify Agent trả lời chính xác từ knowledge base.

**Acceptance Scenarios**:

1. **Given** có chương trình khuyến mãi đang diễn ra, **When** người dùng hỏi "hiện có khuyến mãi gì không", **Then** Agent liệt kê các chương trình khuyến mãi hiện tại với điều kiện và thời hạn
2. **Given** người dùng hỏi về bảo hành, **When** nhập "sản phẩm này bảo hành bao lâu", **Then** Agent trả lời chính sách bảo hành chi tiết cho sản phẩm đó
3. **Given** có thay đổi chính sách, **When** Agent truy vấn RAG, **Then** Agent trả về thông tin mới nhất từ knowledge base

---

### Edge Cases

- Agent không thể truy xuất thông tin sản phẩm từ database (database down hoặc timeout) → Hiển thị thông báo lỗi thân thiện và đề xuất thử lại
- Người dùng nhập câu hỏi ngoài phạm vi (ví dụ: hỏi về thời tiết) → Agent từ chối lịch sự và hướng dẫn về phạm vi hỗ trợ
- Câu hỏi có nhiều sản phẩm phù hợp vượt quá giới hạn trả về → Agent giới hạn kết quả và cung cấp bộ lọc để thu hẹp tìm kiếm
- Người dùng gửi tin nhắn trống hoặc không rõ nghĩa → Agent yêu cầu làm rõ câu hỏi
- Agent gặp lỗi LLM timeout → Thực hiện retry 3 lần im lặng, sau đó hiển thị thông báo lỗi chung

## Technical Implementation Flow

- **Step 1 (Trigger)**: Người dùng nhập tin nhắn vào `<ChatInput>` component trên giao diện storefront
- **Step 2 (API Route)**: Tin nhắn được gửi đến Next.js API Route `/api/chat`, Vercel AI SDK nhận diện và phân tích ý định người dùng
- **Step 3 (Tool Call)**: Agent xác định tool cần gọi (searchProducts, compareProducts, addToCart, getPromotions, getWarrantyInfo) và thực thi tool
- **Step 4 (RAG Query)**: Nếu cần thông tin từ knowledge base, Agent query Supabase pgvector để lấy context liên quan
- **Step 5 (Response)**: Agent tổng hợp kết quả và stream response về client, bao gồm cả text và streamable React components (Product Cards, Comparison Grids, Cart Summary)
- **Step 6 (State Sync)**: Nếu có thay đổi giỏ hàng, Zustand store được cập nhật và broadcast qua custom DOM events để đồng bộ với Cart Drawer

## UI/UX Impact & Streamable React Components

- **Component Name**: ProductCard (streamed into chat)
  - **Interactive State**: Hiển thị tên sản phẩm, hình ảnh, giá, nút "Thêm vào giỏ". Click "Thêm vào giỏ" gọi tool addToCart ngay lập tức.
  - **Layout Description**: Card với border rounded-lg, shadow-sm, hover:shadow-md transition. Layout: hình ảnh bên trái, thông tin bên phải.

- **Component Name**: ComparisonGrid (streamed into chat)
  - **Interactive State**: Bảng so sánh 2-3 sản phẩm. Nút "Chọn mua" ở mỗi cột để thêm vào giỏ.
  - **Layout Description**: Grid 2-3 cột responsive, header là tên sản phẩm, rows là các tiêu chí so sánh.

- **Component Name**: CartSummary (streamed into chat)
  - **Interactive State**: Hiển thị tổng quan giỏ hàng hiện tại. Nút "Tiến hành thanh toán" dẫn đến checkout.
  - **Layout Description**: Compact card với danh sách sản phẩm, tổng tiền, và nút action.

- **Component Name**: PromotionBanner (streamed into chat)
  - **Interactive State**: Hiển thị thông tin khuyến mãi. Nút "Xem chi tiết" mở modal hoặc redirect.
  - **Layout Description**: Banner với nền gradient, icon khuyến mãi, thông tin tóm tắt.

## Requirements

### Functional Requirements

- **FR-001**: Agent MUST tự động nhận diện ý định người dùng từ tin nhắn tự nhiên (natural language intent recognition)
- **FR-002**: Agent MUST hỗ trợ tối thiểu 5 tool chính: searchProducts, compareProducts, addToCart, getPromotions, getWarrantyInfo
- **FR-003**: Agent MUST stream response real-time về client sử dụng Vercel AI SDK streaming
- **FR-004**: Agent MUST render React components (Product Cards, Comparison Grids) trực tiếp trong chat stream thông qua tool calling
- **FR-005**: Agent MUST đồng bộ giỏ hàng với Zustand store và broadcast cập nhật qua custom DOM events
- **FR-006**: Agent MUST trả lời câu hỏi từ RAG knowledge base với thông tin chính xác nhất
- **FR-007**: Agent MUST thực hiện retry 3 lần im lặng khi gặp lỗi LLM hoặc database, sau đó hiển thị thông báo lỗi chung
- **FR-008**: Agent MUST từ chối lịch sự các câu hỏi ngoài phạm vi hỗ trợ và hướng dẫn người dùng
- **FR-009**: Agent MUST ghi lại tất cả tin nhắn (user, assistant, tool) vào database chat_messages để phục vụ dashboard trace
- **FR-010**: Agent MUST hoạt động trên cả desktop và mobile với responsive layout

### Key Entities

- **ChatSession**: Phiên làm việc AI với khách hàng. Bao gồm user_agent, thời gian bắt đầu/kết thúc, metadata.
- **ChatMessage**: Mỗi tin nhắn trong phiên. Bao gồm role (user/assistant/system/tool), nội dung, tool_calls, tokens_used, latency_ms.
- **Document**: Knowledge base chunks cho RAG. Bao gồm title, content, category, embedding vector.
- **CartItem** (client-side): Sản phẩm trong giỏ hàng. Bao gồm productId, name, price, brand, quantity, image.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 90% câu hỏi tìm kiếm sản phẩm được Agent trả lời trong vòng 3 giây
- **SC-002**: Agent tự động nhận diện đúng ý định người dùng trong 95% trường hợp
- **SC-003**: Tỷ lệ thêm sản phẩm vào giỏ hàng thành công qua Agent đạt 100%
- **SC-004**: Tất cả streamable React components render trong vòng 2 giây sau khi trigger
- **SC-005**: Agent xử lý lỗi timeout/retry im lặng mà người dùng không nhận thấy (trừ lỗi hiển thị cuối cùng)
- **SC-006**: Hỗ trợ đa thiết bị: mobile, tablet, desktop với trải nghiệm nhất quán

## Assumptions

- Knowledge base RAG đã được seed dữ liệu từ `help.phongvu.vn/llms-full.txt` vào Supabase pgvector
- OpenAI API key (hoặc LLM provider khác) đã được cấu hình trong environment variables
- Supabase project đã được cấu hình với pgvector extension và các migration đã chạy
- Frontend đang sử dụng Next.js App Router với React 18+
- Zustand store hiện tại đã có cấu hình persist middleware với localStorage
- Người dùng đã có session UUID trong cookie/localStorage
- Mockup storefront Phong Vu đã có sẵn và hoạt động
