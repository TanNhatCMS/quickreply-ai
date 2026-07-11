import { describe, it, expect } from 'vitest'
import { formatContextForPrompt, type RAGContext } from '@/lib/rag'

describe('formatContextForPrompt', () => {
  const emptyCtx: RAGContext = { documents: [] }

  it('returns fallback message for empty context', () => {
    expect(formatContextForPrompt(emptyCtx)).toBe('Không tìm thấy thông tin liên quan.')
  })

  it('formats single document', () => {
    const ctx: RAGContext = {
      documents: [
        {
          id: 'd1',
          title: 'Bảo hành ASUS',
          content: 'Bảo hành chính hãng ASUS 24 tháng.',
          category: 'warranty',
          source_url: null,
          metadata: {},
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
    }
    const result = formatContextForPrompt(ctx)
    expect(result).toContain('## Thông tin liên quan từ cơ sở dữ liệu')
    expect(result).toContain('### Bảo hành ASUS [warranty]')
    expect(result).toContain('Bảo hành chính hãng ASUS 24 tháng.')
  })

  it('formats multiple documents with different categories', () => {
    const ctx: RAGContext = {
      documents: [
        {
          id: 'd1',
          title: 'Giới thiệu Phong Vũ',
          content: 'Phong Vũ được thành lập năm 1997.',
          category: 'company',
          source_url: null,
          metadata: {},
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'd2',
          title: 'Chính sách đổi trả',
          content: 'Đổi trả trong 7 ngày.',
          category: 'policy',
          source_url: null,
          metadata: {},
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'd3',
          title: 'Khuyến mãi mùa hè',
          content: 'Giảm 10% laptop ASUS.',
          category: 'faq',
          source_url: null,
          metadata: { type: 'promotion', discount: 10 },
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
    }
    const result = formatContextForPrompt(ctx)
    expect(result).toContain('### Giới thiệu Phong Vũ [company]')
    expect(result).toContain('### Chính sách đổi trả [policy]')
    expect(result).toContain('### Khuyến mãi mùa hè [faq]')
  })
})
