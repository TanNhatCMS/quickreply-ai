'use client'

import { useState } from 'react'
import type { Order } from '@/lib/supabase'

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled']

interface OrderTableProps {
  orders: Order[]
  totalCount: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onStatusFilter: (status: string) => void
  loading: boolean
  currentStatus: string
}

export default function OrderTable({
  orders,
  totalCount,
  page,
  limit,
  onPageChange,
  onStatusFilter,
  loading,
  currentStatus,
}: OrderTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="flex items-center justify-between p-sm border-b border-outline-variant">
        <p className="text-label-md text-on-surface-variant">
          {totalCount} đơn hàng
        </p>
        <select
          value={currentStatus}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="text-label-md bg-surface-container border border-outline-variant rounded-lg px-sm py-xs text-on-surface outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt === 'All' ? '' : opt.toLowerCase()}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-xl">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] text-outline mb-sm">
            shopping_cart
          </span>
          <p className="text-body-md">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container">
                <th className="text-left text-label-sm text-on-surface-variant font-medium px-sm py-xs">
                  Order ID
                </th>
                <th className="text-left text-label-sm text-on-surface-variant font-medium px-sm py-xs">
                  Session ID
                </th>
                <th className="text-left text-label-sm text-on-surface-variant font-medium px-sm py-xs">
                  Items
                </th>
                <th className="text-right text-label-sm text-on-surface-variant font-medium px-sm py-xs">
                  Total
                </th>
                <th className="text-center text-label-sm text-on-surface-variant font-medium px-sm py-xs">
                  Status
                </th>
                <th className="text-right text-label-sm text-on-surface-variant font-medium px-sm py-xs">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isExpanded = expandedRow === order.id
                return (
                  <>
                    <tr
                      key={order.id}
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : order.id)
                      }
                      className="border-t border-outline-variant cursor-pointer hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-sm py-xs text-label-md text-on-surface font-mono">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-sm py-xs text-label-md text-on-surface-variant font-mono">
                        {order.session_id?.slice(0, 8) ?? 'N/A'}
                      </td>
                      <td className="px-sm py-xs text-label-md text-on-surface">
                        {order.items.length}
                      </td>
                      <td className="px-sm py-xs text-label-md text-on-surface font-semibold text-right">
                        {formatVND(order.total)}
                      </td>
                      <td className="px-sm py-xs text-center">
                        <span
                          className={`inline-block px-xs py-[2px] rounded-full text-label-sm font-medium ${
                            STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-sm py-xs text-label-md text-on-surface-variant text-right">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={6} className="bg-surface-container-low px-md py-sm">
                          <div className="space-y-xs">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-label-md"
                              >
                                <span className="text-on-surface">
                                  {item.name}
                                </span>
                                <span className="text-on-surface-variant">
                                  x{item.quantity} &middot; {formatVND(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalCount > limit && (
        <div className="flex items-center justify-between p-sm border-t border-outline-variant">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-sm py-xs text-label-md bg-surface-container border border-outline-variant rounded-lg text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
          >
            Previous
          </button>
          <span className="text-label-md text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-sm py-xs text-label-md bg-surface-container border border-outline-variant rounded-lg text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
