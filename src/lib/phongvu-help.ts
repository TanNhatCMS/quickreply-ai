/**
 * Phong Vũ help-center document search.
 *
 * Fetches https://help.phongvu.vn/llms-full.txt (the site's full-content
 * markdown export), splits it into H1 sections, and ranks sections against
 * a search query. Cached in-process — the doc changes rarely and the file
 * is ~180KB, not worth re-fetching every request.
 */

export type HelpCategory = 'company' | 'policy' | 'warranty' | 'payment' | 'delivery' | 'faq' | 'service' | 'legal'

export interface HelpDocument {
  title: string
  content: string
  category: HelpCategory
}

const HELP_DOC_URL = 'https://help.phongvu.vn/llms-full.txt'
const FETCH_TIMEOUT_MS = 10_000
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h — content changes rarely
const MAX_CONTENT_CHARS = 2000 // cap per-section content sent to the model

// ─── Categorization ──────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: [HelpCategory, string[]][] = [
  ['warranty', ['bảo hành']],
  ['payment', ['thanh toán', 'trả góp', 'giá cả']],
  ['delivery', ['giao hàng', 'vận chuyển']],
  ['service', ['lắp đặt', 'nâng cấp', 'sửa chữa', 'bảo trì']],
  ['legal', ['dữ liệu cá nhân', 'điều khoản', 'điều kiện giao dịch']],
  ['policy', ['khiếu nại', 'đổi trả', 'hoàn tiền', 'đặt cọc', 'giữ hàng', 'khui hộp', 'giả mạo']],
  ['company', ['giới thiệu', 'tuyển dụng']],
]

export function categorizeTitle(title: string): HelpCategory {
  const normalized = title.toLowerCase()
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => normalized.includes(kw))) return category
  }
  return 'faq'
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

/** Split the raw llms-full.txt markdown into one HelpDocument per H1 section. */
export function parseHelpDocument(raw: string): HelpDocument[] {
  const lines = raw.split('\n')
  const docs: HelpDocument[] = []

  let currentTitle: string | null = null
  let currentLines: string[] = []

  const flush = () => {
    if (currentTitle === null) return
    const content = currentLines.join('\n').trim()
    if (content) {
      docs.push({ title: currentTitle, content, category: categorizeTitle(currentTitle) })
    }
  }

  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)$/)
    if (h1Match) {
      flush()
      currentTitle = h1Match[1].trim()
      currentLines = []
    } else if (currentTitle !== null) {
      currentLines.push(line)
    }
  }
  flush()

  return docs
}

// ─── Ranking (pure — no network) ────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics for loose matching
}

export interface RankHelpDocsOptions {
  category?: HelpCategory
  maxResults?: number
}

/** Rank documents by keyword overlap with the query. Pure function, safe to unit test. */
export function rankHelpDocs(docs: HelpDocument[], query: string, options: RankHelpDocsOptions = {}): HelpDocument[] {
  const { category, maxResults = 5 } = options

  const pool = category ? docs.filter((d) => d.category === category) : docs
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) {
    return pool.slice(0, maxResults).map((d) => ({
      ...d,
      content: d.content.length > MAX_CONTENT_CHARS ? d.content.slice(0, MAX_CONTENT_CHARS) + '…' : d.content,
    }))
  }

  const scored = pool.map((doc) => {
    const title = normalize(doc.title)
    const content = normalize(doc.content)
    let score = 0
    for (const term of terms) {
      if (title.includes(term)) score += 3
      const contentMatches = content.split(term).length - 1
      score += Math.min(contentMatches, 5) // cap per-term contribution
    }
    return { doc, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => ({
      ...s.doc,
      content: s.doc.content.length > MAX_CONTENT_CHARS ? s.doc.content.slice(0, MAX_CONTENT_CHARS) + '…' : s.doc.content,
    }))
}

// ─── Fetch + cache ───────────────────────────────────────────────────────────

let cache: { docs: HelpDocument[]; fetchedAt: number } | null = null

async function fetchHelpDocuments(): Promise<HelpDocument[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.docs
  }

  const response = await fetch(HELP_DOC_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!response.ok) {
    throw new Error(`Failed to fetch help docs: ${response.status} ${response.statusText}`)
  }

  const raw = await response.text()
  const docs = parseHelpDocument(raw)
  cache = { docs, fetchedAt: Date.now() }
  return docs
}

/** Search the Phong Vũ help center for sections matching the query. */
export async function searchHelpDocs(query: string, options: RankHelpDocsOptions = {}): Promise<HelpDocument[]> {
  const docs = await fetchHelpDocuments()
  return rankHelpDocs(docs, query, options)
}
