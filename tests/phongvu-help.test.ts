import { describe, it, expect } from 'vitest'
import { parseHelpDocument, rankHelpDocs, categorizeTitle } from '@/lib/phongvu-help'

const SAMPLE_DOC = `# Giới thiệu Phong Vũ

Phong Vũ được thành lập năm 1997 tại TP.HCM.

## Tổ chức

Công ty cổ phần thương mại dịch vụ Phong Vũ.

# Chính sách bảo hành

Laptop bảo hành 12-24 tháng tùy hãng. Đổi mới trong 7 ngày đầu nếu lỗi phần cứng.

# Hủy đơn, đổi trả và hoàn tiền

Khách có thể đổi trả trong 7 ngày nếu sản phẩm còn nguyên seal.
`

describe('categorizeTitle', () => {
  it('maps warranty keywords to warranty category', () => {
    expect(categorizeTitle('Chính sách bảo hành')).toBe('warranty')
  })

  it('maps unknown titles to faq category', () => {
    expect(categorizeTitle('Một tiêu đề bất kỳ')).toBe('faq')
  })
})

describe('parseHelpDocument', () => {
  it('splits raw markdown into one document per H1 section', () => {
    const docs = parseHelpDocument(SAMPLE_DOC)
    expect(docs).toHaveLength(3)
    expect(docs[0].title).toBe('Giới thiệu Phong Vũ')
    expect(docs[1].title).toBe('Chính sách bảo hành')
    expect(docs[2].title).toBe('Hủy đơn, đổi trả và hoàn tiền')
  })

  it('assigns category per section based on title', () => {
    const docs = parseHelpDocument(SAMPLE_DOC)
    expect(docs[1].category).toBe('warranty')
    expect(docs[2].category).toBe('policy')
  })

  it('includes nested H2 content within the parent H1 section', () => {
    const docs = parseHelpDocument(SAMPLE_DOC)
    expect(docs[0].content).toContain('Tổ chức')
    expect(docs[0].content).toContain('thành lập năm 1997')
  })
})

describe('rankHelpDocs', () => {
  const docs = parseHelpDocument(SAMPLE_DOC)

  it('ranks sections matching the query terms above non-matching ones', () => {
    const results = rankHelpDocs(docs, 'bảo hành laptop')
    expect(results[0].title).toBe('Chính sách bảo hành')
  })

  it('filters by category when provided', () => {
    const results = rankHelpDocs(docs, 'đổi trả', { category: 'policy' })
    expect(results.every((d) => d.category === 'policy')).toBe(true)
  })

  it('returns empty array when no section matches the query', () => {
    const results = rankHelpDocs(docs, 'khủng long tuyệt chủng')
    expect(results).toEqual([])
  })

  it('respects maxResults', () => {
    const results = rankHelpDocs(docs, '7 ngày', { maxResults: 1 })
    expect(results).toHaveLength(1)
  })
})
