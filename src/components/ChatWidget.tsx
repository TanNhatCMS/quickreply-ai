'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageSquare, X, Send, Loader2, Bot, User, GitCompare, Check } from 'lucide-react'
import { getSessionId } from '@/lib/session'
import { useCartStore } from '@/store/useCartStore'
import ReactMarkdown from 'react-markdown'
// ─── Types ───────────────────────────────────────────────────────────────────

interface KnowledgeDoc {
  title: string
  content: string
  category: string
}

interface SearchKnowledgeResult {
  documents: KnowledgeDoc[]
}

interface MCPProduct {
  sku: string
  name: string
  brand: string
  url: string
  priceCurrent: number | null
  priceFormatted: string
  inStock: boolean
  image: string
  discount: number
}

interface SearchProductsResult {
  query: string
  total: number
  products: MCPProduct[]
}

interface CompareProductsResult {
  comparison: MCPProduct[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract all text content from a UIMessage's parts array */
function getTextContent(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

// ─── ChatWidget ───────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId] = useState<string | null>(() => getSessionId())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [compareList, setCompareList] = useState<MCPProduct[]>([])
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const addItem = useCartStore((s) => s.addItem)
  const toggleDrawer = useCartStore((s) => s.toggleDrawer)

  // ── Compare helpers ────────────────────────────────────────────────────────
  const toggleCompare = useCallback((product: MCPProduct) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.sku === product.sku)
      if (exists) return prev.filter((p) => p.sku !== product.sku)
      if (prev.length >= 2) return prev // max 2
      return [...prev, product]
    })
  }, [])


  // ── Vercel AI SDK v7 useChat ──────────────────────────────────────────────
  const { messages, sendMessage, status, error } =
    useChat({
      transport: new DefaultChatTransport({
        api: '/api/chat',
        // Attach anonymous session ID to every request (T012)
        body: { sessionId },
      }),

      // ── Client-side tool execution handler ──────────────────────────
      onToolCall: ({ toolCall }) => {
        if (toolCall.toolName === 'addToCart') {
          const args = toolCall.input as {
            productId: string
            name: string
            brand: string
            price: number
            image?: string
            quantity?: number
          }
          addItem(
            {
              productId: args.productId,
              name: args.name,
              brand: args.brand,
              price: args.price,
              image: args.image ?? '',
            },
            args.quantity ?? 1,
          )
          // Open the cart drawer to confirm
          toggleDrawer(true)
        }
      },

      // ── Silent retry (3x) on error ───────────────────────────────────
      onError: (err) => {
        console.error('[ChatWidget] stream error:', err.message)
      },
    })

  const isLoading = status === 'streaming' || status === 'submitted'

  const sendCompare = useCallback(() => {
    if (compareList.length !== 2) return
    const [a, b] = compareList
    sendMessage({
      text: `So sánh ${a.name} với ${b.name}`,
    })
    setCompareList([])
  }, [compareList, sendMessage])

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const text = inputValue.trim()
      if (!text || isLoading) return
      sendMessage({ text })
      setInputValue('')
    },
    [inputValue, isLoading, sendMessage],
  )

  // ── Render tool results as React components ──────────────────────────
  const renderToolOutput = useCallback(
    (toolName: string, output: unknown, toolCallId?: string) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      // search_products → Product cards (collapsible)
      if (toolName === 'search_products') {
        const { products, total } = output as SearchProductsResult
        if (!products?.length) return <p className="text-sm text-outline">Không tìm thấy sản phẩm phù hợp.</p>

        const VISIBLE_COUNT = 3
        const isExpanded = toolCallId ? expandedProducts.has(toolCallId) : false
        const visibleProducts = isExpanded ? products : products.slice(0, VISIBLE_COUNT)
        const hiddenCount = products.length - VISIBLE_COUNT

        return (
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-outline">{total} sản phẩm tìm thấy</p>
              <p className="text-[10px] text-outline">Chọn 2 máy để so sánh</p>
            </div>
            {visibleProducts.map((p) => {
              const isSelected = compareList.some((c) => c.sku === p.sku)
              const isDisabled = compareList.length >= 2 && !isSelected
              return (
                <div
                  key={p.sku}
                  className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${
                    isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant/30'
                  }`}
                >
                  <div className="p-3 flex gap-3">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-contain bg-surface rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">{p.brand}</p>
                      <p className="text-xs font-semibold text-on-surface line-clamp-2 leading-snug mt-0.5">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-error">{p.priceFormatted}</span>
                        {p.discount > 0 && (
                          <span className="text-[10px] font-bold bg-error/10 text-error px-1.5 py-0.5 rounded-full">
                            -{p.discount}%
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] mt-0.5 font-medium ${p.inStock ? 'text-success-green' : 'text-error'}`}>
                        {p.inStock ? '● Còn hàng' : '○ Hết hàng'}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 pb-3 flex gap-2">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 text-center text-xs font-semibold border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      Xem chi tiết
                    </a>
                    <button
                      onClick={() => {
                        addItem({ productId: p.sku, name: p.name, brand: p.brand, price: p.priceCurrent ?? 0, image: p.image }, 1)
                        toggleDrawer(true)
                      }}
                      disabled={!p.inStock}
                      className="flex-1 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Thêm giỏ
                    </button>
                    <button
                      onClick={() => toggleCompare(p)}
                      disabled={isDisabled}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'border border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary'
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                      title={isSelected ? 'Bỏ chọn' : 'Chọn để so sánh'}
                    >
                      {isSelected ? <Check size={12} /> : <GitCompare size={12} />}
                    </button>
                  </div>
                </div>
              )
            })}
            {hiddenCount > 0 && (
              <button
                onClick={() =>
                  setExpandedProducts((prev) => {
                    const next = new Set(prev)
                    if (next.has(toolCallId!)) next.delete(toolCallId!)
                    else next.add(toolCallId!)
                    return next
                  })
                }
                className="w-full py-2 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
              >
                {isExpanded ? 'Thu gọn' : `Xem thêm ${hiddenCount} sản phẩm`}
              </button>
            )}
          </div>
        )
      }

      // MCP: compare_products → Comparison grid
      if (toolName === 'compare_products') {
        const { comparison } = output as CompareProductsResult
        if (!comparison?.length) return <p className="text-sm text-gray-400">Không thể so sánh sản phẩm.</p>

        return (
          <div className="comparison-grid">
            {comparison.map((p) => (
              <div key={p.sku} className="comparison-column">
                {p.image && <img src={p.image} alt={p.name} className="comparison-img" />}
                <p className="comparison-brand">{p.brand}</p>
                <p className="comparison-name">{p.name}</p>
                <p className="comparison-price">{p.priceFormatted}</p>
                <p className={`comparison-stock ${p.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {p.inStock ? 'Còn hàng' : 'Hết hàng'}
                </p>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="comparison-link">
                  Xem chi tiết
                </a>
              </div>
            ))}
          </div>
        )
      }

      // RAG: searchKnowledge → Knowledge cards (policy/warranty/FAQ)
      if (toolName === 'searchKnowledge') {
        const { documents } = output as SearchKnowledgeResult
        if (!documents?.length) return <p className="text-sm text-gray-400">Không tìm thấy thông tin phù hợp.</p>

        const categoryLabels: Record<string, string> = {
          company: '🏢 Công ty', policy: '📋 Chính sách', warranty: '🛡️ Bảo hành',
          payment: '💳 Thanh toán', delivery: '🚚 Giao hàng', service: '🔧 Dịch vụ',
          legal: '⚖️ Pháp lý', faq: '❓ FAQ',
        }

        return (
          <div className="flex flex-col gap-2 mt-1">
            {documents.map((doc, i) => (
              <div key={i} className="knowledge-card">
                <div className="knowledge-card-header">
                  <span className="knowledge-category">{categoryLabels[doc.category] ?? doc.category}</span>
                  <span className="knowledge-title">{doc.title}</span>
                </div>
                <p className="knowledge-content">{doc.content.length > 200 ? doc.content.slice(0, 200) + '...' : doc.content}</p>
              </div>
            ))}
          </div>
        )
      }

      return null
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compareList, addItem, toggleDrawer, toggleCompare],
  )

  // ── Chat bubble toggle button ────────────────────────────────────────
  const ChatToggleButton = () => (
    <button
      onClick={() => setIsOpen((v) => !v)}
      aria-label={isOpen ? 'Đóng chat' : 'Mở chat tư vấn'}
      className="chat-toggle-btn"
    >
      {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
    </button>
  )

  return (
    <>
      {/* Floating toggle */}
      <ChatToggleButton />

      {/* Chat panel */}
      {isOpen && (
        <div className="chat-panel" role="dialog" aria-label="Chat tư vấn QuickReply AI">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="relative">
                <Bot size={24} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-green border-2 border-primary rounded-full"></span>
              </div>
              <div>
                <p className="font-bold text-base leading-tight">QuickReply AI</p>
                <p className="text-[10px] opacity-80 uppercase tracking-wider">Đang trực tuyến</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="chat-close-btn" aria-label="Đóng">
              <X size={20} />
            </button>
          </div>

          {/* Message list */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <Bot size={32} className="text-primary mb-2" />
                <p className="font-semibold text-on-surface mb-1">Xin chào! 👋</p>
                <p className="text-sm text-on-surface-variant">
                  Tôi có thể giúp bạn tìm laptop, so sánh thông số, xem khuyến mãi và chính sách bảo hành.
                </p>
                <div className="chat-suggestions">
                  {[
                    'Tư vấn laptop dưới 20 triệu',
                    'Bảo hành ASUS bao lâu?',
                    'Khuyến mãi đang có gì?',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        sendMessage({ text: s })
                      }}
                      className="chat-suggestion-chip"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="chat-message-avatar">
                  {msg.role === 'user' ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>

                <div className="chat-message-body">
                  {/* Text content */}
                  {getTextContent(msg) && (
                    <div className="chat-bubble chat-bubble-md"><ReactMarkdown>{getTextContent(msg)}</ReactMarkdown></div>
                  )}

                  {/* Tool invocations (rendered as React components) */}
                  {msg.parts
                    .filter((p) => p.type.startsWith('tool-'))
                    .map((part) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const tp = part as any
                      const toolName = tp.type.replace('tool-', '')
                      if (tp.state === 'output-available') {
                        const rendered = renderToolOutput(toolName, tp.output)
                        return rendered ? (
                          <div key={tp.toolCallId}>{rendered}</div>
                        ) : null
                      }
                      // Tool is still being called
                      if (tp.state === 'input-streaming' || tp.state === 'input-available') {
                        return (
                          <div key={tp.toolCallId} className="chat-tool-loading">
                            <Loader2 size={12} className="animate-spin" />
                            <span className="text-xs text-outline">Đang tìm kiếm...</span>
                          </div>
                        )
                      }
                      return null
                    })}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="chat-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble chat-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="chat-error">
                <p className="text-xs">⚠️ Có lỗi xảy ra. Vui lòng thử lại.</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Compare floating bar */}
          {compareList.length > 0 && (
            <div className="px-4 py-2.5 bg-primary/5 border-t border-primary/20 flex items-center gap-2">
              <GitCompare size={14} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary leading-tight">
                  {compareList.length === 1
                    ? `Đã chọn: ${compareList[0].name.slice(0, 24)}…`
                    : `So sánh ${compareList.length}/2 sản phẩm`}
                </p>
                {compareList.length === 1 && (
                  <p className="text-[10px] text-outline">Chọn thêm 1 máy nữa</p>
                )}
              </div>
              {compareList.length === 2 && (
                <button
                  onClick={sendCompare}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  So sánh ngay
                </button>
              )}
              <button
                onClick={() => setCompareList([])}
                className="text-outline hover:text-error transition-colors flex-shrink-0"
                title="Xóa lựa chọn"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface p-0 placeholder:text-outline outline-none"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="text-primary hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-transparent border-none"
                aria-label="Gửi"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
