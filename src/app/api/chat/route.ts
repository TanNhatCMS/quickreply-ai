import { createOpenAI } from '@ai-sdk/openai'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_BASE_URL && { baseURL: process.env.OPENAI_BASE_URL }),
})

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { retrieveContext, formatContextForPrompt } from '@/lib/rag'
import { phongvuTools } from '@/lib/phongvu-tools'

// Allow up to 30 seconds for streaming on Vercel Edge
export const maxDuration = 30
export const runtime = 'nodejs'

// ─── Skill Discovery ──────────────────────────────────────────────────────

interface SkillMetadata {
  name: string
  description: string
  path: string
}

function parseFrontmatter(content: string): { name: string; description: string } | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const yaml = match[1]
  const nameMatch = yaml.match(/^name:\s*(.+)$/m)
  const descMatch = yaml.match(/^description:\s*>?\s*\n?([\s\S]*?)(?=\n[a-z]|\nmetadata:|$)/m)
  if (!nameMatch) return null
  return {
    name: nameMatch[1].trim(),
    description: descMatch ? descMatch[1].replace(/\n\s*/g, ' ').trim() : '',
  }
}

async function discoverSkills(dirs: string[]): Promise<SkillMetadata[]> {
  const skills: SkillMetadata[] = []
  const seen = new Set<string>()

  for (const dir of dirs) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const skillDir = join(dir, entry.name)
        const skillFile = join(skillDir, 'SKILL.md')
        try {
          const content = await readFile(skillFile, 'utf-8')
          const fm = parseFrontmatter(content)
          if (!fm || seen.has(fm.name)) continue
          seen.add(fm.name)
          skills.push({ name: fm.name, description: fm.description, path: skillDir })
        } catch { continue }
      }
    } catch { continue }
  }
  return skills
}

function buildSkillsPrompt(skills: SkillMetadata[]): string {
  if (!skills.length) return ''
  const list = skills.map(s => `- **${s.name}**: ${s.description}`).join('\n')
  return `\n## Skills (load on-demand)\n\nDùng tool \`loadSkill\` để load skill khi yêu cầu khớp mô tả. KHÔNG load tự động — chỉ khi cần.\n\nAvailable:\n${list}`
}

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

**Tools có sẵn (BẮT BUỘC sử dụng khi tìm kiếm sản phẩm):**
- search_products: tìm kiếm sản phẩm theo từ khóa, lọc giá/brand/attributes
- get_product_detail: chi tiết sản phẩm theo SKU
- compare_products: so sánh 2-3 sản phẩm
- get_recommendations: sản phẩm gợi ý liên quan
- check_stock: kiểm tra tồn kho
- get_popular_keywords: từ khóa phổ biến
- addToCart: thêm vào giỏ hàng (client-side)

**Quy tắc bắt buộc:**
- Khi khách hàng hỏi về sản phẩm, giá, khuyến mãi, hoặc muốn mua hàng → PHẢI gọi search_products hoặc get_product_detail
- KHÔNG BAO GIỜ nói "không thể truy cập cơ sở dữ liệu" — luôn dùng tools để tìm kiếm
- Nếu tìm không thấy, thử lại với từ khóa khác hoặc gợi ý sản phẩm tương tự
`

// ─── Build system prompt with RAG context ──────────────────────────────────

function buildSystemPrompt(ragContext: string, skills: SkillMetadata[]) {
  let prompt = SYSTEM_PROMPT + buildSkillsPrompt(skills)
  if (ragContext) {
    prompt += `\n\n**Thông tin tham khảo (RAG):**\n${ragContext}`
  }
  return prompt
}

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

  // ── RAG context for policy/warranty/FAQ ──────────────────────────────
  let ragContext = ''
  try {
    const ctx = await retrieveContext(latestUserMessage)
    ragContext = formatContextForPrompt(ctx)
  } catch (err) {
    console.warn('[chat/route] RAG retrieval failed:', err)
  }

  // ── Discover skills ───────────────────────────────────────────────────
  const skills = await discoverSkills([
    'src/skills/phongvu-sales-agent',
  ])

  // Stream with Vercel AI SDK v7
  const result = streamText({
    model: openai(AI_MODEL),
    system: buildSystemPrompt(ragContext, skills),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2048,
    maxRetries: 3,

    tools: {
      ...phongvuTools,

      // Skill loader — loads full SKILL.md instructions on demand
      loadSkill: tool({
        description: 'Load a skill to get specialized instructions for a specific task (research, compare, advise, support).',
        inputSchema: z.object({
          name: z.string().describe('Skill name: phongvu-researcher, phongvu-comparator, phongvu-advisor, phongvu-support'),
        }),
        execute: async ({ name }) => {
          const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase())
          if (!skill) return { error: `Skill '${name}' not found. Available: ${skills.map(s => s.name).join(', ')}` }
          try {
            const content = await readFile(join(skill.path, 'SKILL.md'), 'utf-8')
            const stripped = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim()
            return { skill: skill.name, instructions: stripped }
          } catch {
            return { error: `Failed to load skill '${name}'` }
          }
        },
      }),

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

    toolChoice: 'auto',
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

  return response
}
