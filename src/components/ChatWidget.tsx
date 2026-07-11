'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react'
import { getSessionId } from '@/lib/session'
import { useCartStore } from '@/store/useCartStore'
// ─── Types ───────────────────────────────────────────────────────────────────

interface KnowledgeDoc {
  title: string
  content: string
  category: string
}

interface SearchKnowledgeResult {
  documents: KnowledgeDoc[]
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

  const addItem = useCartStore((s) => s.addItem)
  const toggleDrawer = useCartStore((s) => s.toggleDrawer)

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
    (toolName: string, output: unknown) => {
      if (toolName === 'searchKnowledge') {
        const { documents } = output as SearchKnowledgeResult
        if (!documents?.length) return <p className="text-sm text-gray-400">Không tìm thấy thông tin phù hợp.</p>

        const categoryLabels: Record<string, string> = {
          company: '🏢 Công ty',
          policy: '📋 Chính sách',
          warranty: '🛡️ Bảo hành',
          payment: '💳 Thanh toán',
          delivery: '🚚 Giao hàng',
          service: '🔧 Dịch vụ',
          legal: '⚖️ Pháp lý',
          faq: '❓ FAQ',
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
    [],
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
                    <div className="chat-bubble">{getTextContent(msg)}</div>
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

          {/* Input bar */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <div className="chat-input-container">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="chat-input"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="chat-send-btn"
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
