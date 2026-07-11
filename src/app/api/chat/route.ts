import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { retrieveContext, formatContextForPrompt, queryDocuments } from '@/lib/rag'
import { supabase } from '@/lib/supabase'

// Allow up to 30 seconds for streaming on Vercel Edge
export const maxDuration = 30
export const runtime = 'edge'

// ─── System prompt factory ─────────────────────────────────────────────────

function buildSystemPrompt(ragContext: string): string {
  return `Bạn là QuickReply AI — trợ lý tư vấn bán hàng thông minh của Phong Vũ, chuyên về sản phẩm công nghệ.

**Vai trò của bạn:**
- Tư vấn sản phẩm laptop, máy tính, phụ kiện dựa trên nhu cầu khách hàng
- Cung cấp thông tin chính xác về thông số kỹ thuật, giá cả, khuyến mãi, bảo hành
- Giúp khách hàng so sánh và lựa chọn sản phẩm phù hợp
- Hỗ trợ thêm sản phẩm vào giỏ hàng khi được yêu cầu

**Nguyên tắc:**
- Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Chỉ tư vấn dựa trên thông tin thực tế từ cơ sở dữ liệu
- Khi cần tìm thông tin, gọi tool \`searchKnowledge\` để tra cứu
- Khi khách muốn thêm giỏ hàng, gọi tool \`addToCart\`
- Không bịa đặt thông tin

**Dữ liệu ngữ cảnh liên quan đến yêu cầu hiện tại:**
${ragContext}
`
}

// ─── Trace helpers ─────────────────────────────────────────────────────────

async function ensureSession(sessionId: string, userAgent?: string) {
  // Upsert session — create if not exists
  await supabase.from('chat_sessions').upsert(
    { id: sessionId, user_agent: userAgent ?? null },
    { onConflict: 'id', ignoreDuplicates: true },
  )
}

async function saveTrace(params: {
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: unknown[]
  tokensUsed?: number
  latencyMs?: number
  model?: string
}) {
  try {
    await supabase.from('chat_messages').insert({
      session_id: params.sessionId,
      role: params.role,
      content: params.content,
      tool_calls: params.toolCalls ?? [],
      tokens_used: params.tokensUsed ?? null,
      latency_ms: params.latencyMs ?? null,
      model: params.model ?? null,
    })
  } catch (err) {
    console.warn('[chat/route] trace save failed:', err)
  }
}

// ─── POST /api/chat ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const startTime = Date.now()
  const body = await req.json()
  const { messages, sessionId } = body as {
    messages: UIMessage[]
    sessionId?: string
  }

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Ensure session exists for trace
  const sid = sessionId ?? crypto.randomUUID()
  const userAgent = req.headers.get('user-agent') ?? undefined
  await ensureSession(sid, userAgent)

  // Get the latest user message text for RAG retrieval
  const latestUserMessage =
    [...messages]
      .reverse()
      .find((m) => m.role === 'user')
      ?.parts.filter((p) => p.type === 'text')
      .map((p) => p.text)
      .join(' ') ?? ''

  // Save user message trace
  await saveTrace({ sessionId: sid, role: 'user', content: latestUserMessage })

  // Retrieve relevant context from Supabase
  let ragContext = ''
  try {
    const ctx = await retrieveContext(latestUserMessage)
    ragContext = formatContextForPrompt(ctx)
  } catch (err) {
    console.warn('[chat/route] RAG retrieval failed, continuing without context:', err)
    ragContext = 'Không thể tải thông tin lúc này.'
  }

  // Stream with Vercel AI SDK v7
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: buildSystemPrompt(ragContext),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
    maxRetries: 3,

    // ── Tool definitions ────────────────────────────────────────────────
    tools: {
      /**
       * searchKnowledge — search the RAG knowledge base for relevant information.
       * Covers products, policies, warranty, payment, delivery, promotions, FAQ.
       */
      searchKnowledge: tool({
        description:
          'Tìm kiếm thông tin từ cơ sở dữ liệu kiến thức. Dùng khi khách hỏi về sản phẩm, chính sách, bảo hành, khuyến mãi, giao hàng, thanh toán, hoặc bất kỳ thông tin nào về Phong Vũ.',
        inputSchema: z.object({
          query: z.string().describe('Câu hỏi hoặc từ khóa tìm kiếm (tiếng Việt)'),
          category: z
            .enum(['company', 'policy', 'warranty', 'payment', 'delivery', 'faq', 'service', 'legal'])
            .optional()
            .describe('Lọc theo danh mục (tùy chọn)'),
          maxResults: z
            .number()
            .int()
            .min(1)
            .max(10)
            .optional()
            .default(5)
            .describe('Số lượng kết quả tối đa'),
        }),
        execute: async ({ query, category, maxResults }) => {
          const docs = await queryDocuments(query, {
            matchCount: maxResults,
            category,
          })
          return {
            documents: docs.map((d) => ({
              title: d.title,
              content: d.content,
              category: d.category,
            })),
          }
        },
      }),

      /**
       * addToCart — client-side tool: no server execute().
       * ChatWidget handles via onToolCall + addToolOutput.
       */
      addToCart: tool({
        description:
          'Thêm một sản phẩm vào giỏ hàng của khách. Chỉ dùng khi khách hàng yêu cầu rõ ràng muốn mua hoặc thêm vào giỏ.',
        inputSchema: z.object({
          productId: z.string().describe('ID sản phẩm (UUID từ database)'),
          name: z.string().describe('Tên sản phẩm'),
          brand: z.string().describe('Thương hiệu'),
          price: z.number().describe('Giá bán (VND)'),
          image: z.string().optional().default('').describe('URL hình ảnh sản phẩm'),
          quantity: z.number().int().min(1).optional().default(1),
        }),
      }),
    },

    // Allow LLM to call tools for up to 3 steps before final response
    stopWhen: stepCountIs(3),

    // Silent retry handled via maxRetries above + Vercel edge
    onError: ({ error }) => {
      console.error('[chat/route] streamText error:', error)
    },
  })

  // Save assistant trace after stream completes (fire-and-forget)
  const responsePromise = result.toUIMessageStreamResponse()
  const latencyMs = Date.now() - startTime

  // Fire-and-forget trace save
  saveTrace({
    sessionId: sid,
    role: 'assistant',
    content: '[streaming response]',
    model: 'gpt-4o-mini',
    latencyMs,
  }).catch(() => {})

  return responsePromise
}
