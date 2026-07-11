import { createMCPClient } from '@ai-sdk/mcp'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_BASE_URL && { baseURL: process.env.OPENAI_BASE_URL }),
})

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

// Allow up to 30 seconds for streaming on Vercel Edge
export const maxDuration = 30
export const runtime = 'nodejs'

// ─── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Bạn là QuickReply AI — trợ lý tư vấn bán hàng thông minh của Phong Vũ (phongvu.vn).

**Vai trò:** Tư vấn sản phẩm điện tử, so sánh, tìm khuyến mãi, kiểm tra tồn kho, thêm vào giỏ hàng.

**Nguyên tắc:**
- Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Giá hiển thị VND có dấu phân cách (VD: 28,290,000đ)
- Link mua: luôn kèm https://phongvu.vn/{canonical}
- Khuyến mãi: highlight bằng emoji hoặc in đậm
- Specs: dùng bullet points, ngắn gọn
- So sánh: dùng bảng markdown
- Sau mỗi trả lời, gợi ý hành động tiếp theo

**Tools có sẵn:**
- search_products: tìm kiếm sản phẩm theo từ khóa, lọc giá/brand/attributes
- get_product_detail: chi tiết sản phẩm theo SKU
- compare_products: so sánh 2-3 sản phẩm
- get_recommendations: sản phẩm gợi ý liên quan
- check_stock: kiểm tra tồn kho
- get_popular_keywords: từ khóa phổ biến
- addToCart: thêm vào giỏ hàng (client-side)
`

// ─── Trace helpers ─────────────────────────────────────────────────────────

async function ensureSession(sessionId: string, userAgent?: string) {
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

  const sid = sessionId ?? crypto.randomUUID()
  const userAgent = req.headers.get('user-agent') ?? undefined
  await ensureSession(sid, userAgent)

  // Get latest user message for trace
  const latestUserMessage =
    [...messages]
      .reverse()
      .find((m) => m.role === 'user')
      ?.parts.filter((p) => p.type === 'text')
      .map((p) => p.text)
      .join(' ') ?? ''

  await saveTrace({ sessionId: sid, role: 'user', content: latestUserMessage })

  // ── Connect to Phong Vũ MCP server ──────────────────────────────────
  const mcpClient = await createMCPClient({
    transport: new StdioClientTransport({
      command: 'node',
      args: ['phongvu-ai-agent/mcp-server/index.js'],
    }),
  })

  const mcpTools = await mcpClient.tools()

  // Stream with Vercel AI SDK v7
  const result = streamText({
    model: openai(AI_MODEL),
    system: buildSystemPrompt(ragContext),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2048,
    maxRetries: 3,

    tools: {
      ...mcpTools,

      // Client-side tool: addToCart (no server execute)
      addToCart: tool({
        description:
          'Thêm một sản phẩm vào giỏ hàng của khách. Chỉ dùng khi khách hàng yêu cầu rõ ràng muốn mua hoặc thêm vào giỏ.',
        inputSchema: z.object({
          productId: z.string().describe('ID sản phẩm'),
          name: z.string().describe('Tên sản phẩm'),
          brand: z.string().describe('Thương hiệu'),
          price: z.number().describe('Giá bán (VND)'),
          image: z.string().optional().default('').describe('URL hình ảnh'),
          quantity: z.number().int().min(1).optional().default(1),
        }),
      }),
    },

    stopWhen: stepCountIs(5),

    onError: ({ error }) => {
      console.error('[chat/route] streamText error:', error)
    },
  })

  const response = result.toUIMessageStreamResponse()
  const latencyMs = Date.now() - startTime

  // Fire-and-forget trace
  saveTrace({
    sessionId: sid,
    role: 'assistant',
    content: '[streaming response]',
    model: AI_MODEL,
    latencyMs,
  }).catch(() => { })

  // Close MCP client after response
  mcpClient.close().catch(() => { })

  return response
}
