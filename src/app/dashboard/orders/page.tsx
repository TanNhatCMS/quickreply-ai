'use client'

import { useState, useEffect, useCallback } from 'react'
import OrderTable from '@/components/dashboard/OrderTable'
import ErrorBanner from '@/components/dashboard/ErrorBanner'
import type { Order } from '@/lib/supabase'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (status) params.set('status', status)

      const res = await fetch(`/dashboard/api/orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')

      const data = await res.json()
      setOrders(data.orders)
      setTotalCount(data.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleStatusFilter = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1)
  }

  return (
    <div className="space-y-md">
      <div>
        <h1 className="text-headline-md font-bold text-on-surface">Orders</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Manage and track customer orders
        </p>
      </div>

      {error && (
        <ErrorBanner message={error} onRetry={fetchOrders} />
      )}

      <OrderTable
        orders={orders}
        totalCount={totalCount}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onStatusFilter={handleStatusFilter}
        loading={loading}
        currentStatus={status}
      />
    </div>
  )
}
