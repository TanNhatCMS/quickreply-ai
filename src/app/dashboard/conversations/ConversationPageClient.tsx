'use client'

import { useState, useCallback } from 'react'
import type { ConversationSummary } from '@/lib/dashboard'
import ConversationTable from '@/components/dashboard/ConversationTable'
import ErrorBanner from '@/components/dashboard/ErrorBanner'

interface ConversationPageClientProps {
  initialSessions: ConversationSummary[]
  initialTotalCount: number
  initialPage: number
  initialLimit: number
}

export default function ConversationPageClient({
  initialSessions,
  initialTotalCount,
  initialPage,
  initialLimit,
}: ConversationPageClientProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [page, setPage] = useState(initialPage)
  const [limit] = useState(initialLimit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchPage = useCallback(async (targetPage: number, query: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(targetPage), limit: String(limit) })
      if (query) params.set('search', query)
      const res = await fetch(`/dashboard/api/conversations?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setSessions(data.sessions)
      setTotalCount(data.totalCount)
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }, [limit])

  function handlePageChange(newPage: number) {
    fetchPage(newPage, search)
  }

  function handleSearch(query: string) {
    setSearch(query)
    fetchPage(1, query)
  }

  return (
    <div className="space-y-md">
      <div>
        <h1 className="text-headline-md font-bold text-on-surface">Conversations</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Xem và tìm kiếm các cuộc trò chuyện của khách hàng</p>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchPage(page, search)} />}

      <ConversationTable
        sessions={sessions}
        totalCount={totalCount}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        loading={loading}
      />
    </div>
  )
}
