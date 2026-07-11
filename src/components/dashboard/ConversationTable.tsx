'use client'

import { useState } from 'react'
import type { ConversationSummary, ConversationDetail } from '@/lib/dashboard'

interface ConversationTableProps {
  sessions: ConversationSummary[]
  totalCount: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  loading: boolean
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDate(value: string | null): string {
  if (!value) return '—'
  return dateFormatter.format(new Date(value))
}

function truncateId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) + '...' : id
}

const ROLE_BADGE: Record<string, string> = {
  user: 'bg-primary text-on-primary',
  assistant: 'bg-surface-container-high text-on-surface',
  system: 'bg-secondary-container text-on-secondary-container',
  tool: 'bg-tertiary-container text-on-tertiary-container',
}

export default function ConversationTable({
  sessions,
  totalCount,
  page,
  limit,
  onPageChange,
  onSearch,
  loading,
}: ConversationTableProps) {
  const [searchInput, setSearchInput] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  async function handleRowClick(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setDetail(null)
      return
    }
    setExpandedId(id)
    setDetailLoading(true)
    try {
      const res = await fetch(`/dashboard/api/conversations/${id}`)
      const data = await res.json()
      if (res.ok) {
        setDetail(data as ConversationDetail)
      }
    } finally {
      setDetailLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(searchInput)
  }

  if (!loading && sessions.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant">
        <form onSubmit={handleSubmit} className="p-sm border-b border-outline-variant">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant rounded-lg text-label-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
            />
          </div>
        </form>
        <div className="flex flex-col items-center justify-center py-xl gap-sm">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            forum
          </span>
          <p className="text-body-md text-on-surface-variant">Chưa có cuộc trò chuyện nào</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant">
      <form onSubmit={handleSubmit} className="p-sm border-b border-outline-variant">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="w-full pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant rounded-lg text-label-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left px-sm py-xs text-label-sm font-medium text-on-surface-variant">Session ID</th>
              <th className="text-left px-sm py-xs text-label-sm font-medium text-on-surface-variant">Bắt đầu</th>
              <th className="text-left px-sm py-xs text-label-sm font-medium text-on-surface-variant">Kết thúc</th>
              <th className="text-left px-sm py-xs text-label-sm font-medium text-on-surface-variant">Tin nhắn</th>
              <th className="text-left px-sm py-xs text-label-sm font-medium text-on-surface-variant">User Agent</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-sm py-sm">
                        <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : sessions.map((s) => (
                  <>
                    <tr
                      key={s.id}
                      onClick={() => handleRowClick(s.id)}
                      className="border-b border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors"
                    >
                      <td className="px-sm py-xs text-label-md text-primary font-mono">{truncateId(s.id)}</td>
                      <td className="px-sm py-xs text-label-md text-on-surface">{formatDate(s.started_at)}</td>
                      <td className="px-sm py-xs text-label-md text-on-surface">{formatDate(s.ended_at)}</td>
                      <td className="px-sm py-xs text-label-md text-on-surface">{s.message_count}</td>
                      <td className="px-sm py-xs text-label-md text-on-surface-variant max-w-[200px] truncate">{s.user_agent ?? '—'}</td>
                    </tr>
                    {expandedId === s.id && (
                      <tr key={`${s.id}-detail`}>
                        <td colSpan={5} className="bg-surface-container-low px-sm py-sm">
                          {detailLoading ? (
                            <div className="flex items-center gap-xs py-sm">
                              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                              <span className="text-label-md text-on-surface-variant">Đang tải...</span>
                            </div>
                          ) : detail ? (
                            <div className="space-y-xs max-h-80 overflow-y-auto">
                              {detail.messages.map((msg) => (
                                <div key={msg.id} className="flex items-start gap-xs py-xs">
                                  <span className={`inline-block px-xs py-[2px] rounded text-label-sm font-medium shrink-0 ${ROLE_BADGE[msg.role] ?? 'bg-surface-container-high text-on-surface'}`}>
                                    {msg.role}
                                  </span>
                                  <p className="text-label-md text-on-surface flex-1 whitespace-pre-wrap break-words">{msg.content}</p>
                                  <span className="text-label-sm text-on-surface-variant shrink-0">{formatDate(msg.created_at)}</span>
                                </div>
                              ))}
                              {detail.messages.length === 0 && (
                                <p className="text-label-md text-on-surface-variant py-sm">Không có tin nhắn</p>
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-sm py-xs border-t border-outline-variant">
        <span className="text-label-sm text-on-surface-variant">
          Trang {page} / {totalPages} — {totalCount} kết quả
        </span>
        <div className="flex gap-xs">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-sm py-[2px] text-label-md border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-sm py-[2px] text-label-md border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  )
}
