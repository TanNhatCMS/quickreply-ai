import { supabase, type ChatSession, type ChatMessage, type Order } from './supabase'

export interface PaginatedResult<T> {
  data: T[]
  totalCount: number
  page: number
  limit: number
}

export interface ConversationSummary {
  id: string
  started_at: string
  ended_at: string | null
  user_agent: string | null
  message_count: number
}

export interface ConversationDetail {
  session: ChatSession
  messages: ChatMessage[]
}

export interface DashboardMetrics {
  totalConversations: number
  avgResponseTimeMs: number
  aiDeflectionRate: number
  conversionRate: number
}

export async function getConversations(
  page: number = 1,
  limit: number = 20,
  search?: string,
): Promise<PaginatedResult<ConversationSummary>> {
  const offset = (page - 1) * limit

  if (search) {
    const { data: matchingSessionIds } = await supabase
      .from('chat_messages')
      .select('session_id')
      .ilike('content', `%${search}%`)
      .limit(500)

    const sessionIds = [
      ...new Set((matchingSessionIds ?? []).map((m) => m.session_id)),
    ]

    if (sessionIds.length === 0) {
      return { data: [], totalCount: 0, page, limit }
    }

    const { data, count } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact' })
      .in('id', sessionIds)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const sessions = data ?? []
    const sessionIds2 = sessions.map((s) => s.id)

    const { data: msgCounts } = await supabase
      .from('chat_messages')
      .select('session_id')
      .in('session_id', sessionIds2)

    const countMap = new Map<string, number>()
    ;(msgCounts ?? []).forEach((m) => {
      countMap.set(m.session_id, (countMap.get(m.session_id) ?? 0) + 1)
    })

    const result: ConversationSummary[] = sessions.map((s) => ({
      id: s.id,
      started_at: s.started_at,
      ended_at: s.ended_at,
      user_agent: s.user_agent,
      message_count: countMap.get(s.id) ?? 0,
    }))

    return { data: result, totalCount: count ?? 0, page, limit }
  }

  const { data: sessions, count } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact' })
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const sessionList = sessions ?? []
  const sessionIds = sessionList.map((s) => s.id)

  let countMap = new Map<string, number>()
  if (sessionIds.length > 0) {
    const { data: msgCounts } = await supabase
      .from('chat_messages')
      .select('session_id')
      .in('session_id', sessionIds)

    ;(msgCounts ?? []).forEach((m) => {
      countMap.set(m.session_id, (countMap.get(m.session_id) ?? 0) + 1)
    })
  }

  const result: ConversationSummary[] = sessionList.map((s) => ({
    id: s.id,
    started_at: s.started_at,
    ended_at: s.ended_at,
    user_agent: s.user_agent,
    message_count: countMap.get(s.id) ?? 0,
  }))

  return { data: result, totalCount: count ?? 0, page, limit }
}

export async function getConversationDetail(
  sessionId: string,
): Promise<ConversationDetail | null> {
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) return null

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return {
    session,
    messages: (messages ?? []) as ChatMessage[],
  }
}

export async function getOrders(
  page: number = 1,
  limit: number = 20,
  status?: string,
): Promise<PaginatedResult<Order>> {
  const offset = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count } = await query

  return {
    data: (data ?? []) as Order[],
    totalCount: count ?? 0,
    page,
    limit,
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { count: totalConversations } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })

  const { data: avgData } = await supabase
    .from('chat_messages')
    .select('latency_ms')
    .eq('role', 'assistant')
    .not('latency_ms', 'is', null)
    .limit(1000)

  const latencies = (avgData ?? [])
    .map((m) => m.latency_ms as number)
    .filter((n) => n > 0)
  const avgResponseTimeMs =
    latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0

  const { data: userMsgCounts } = await supabase
    .from('chat_messages')
    .select('session_id, role')
    .eq('role', 'user')
    .limit(5000)

  const sessionUserCounts = new Map<string, number>()
  ;(userMsgCounts ?? []).forEach((m) => {
    sessionUserCounts.set(
      m.session_id,
      (sessionUserCounts.get(m.session_id) ?? 0) + 1,
    )
  })

  const totalSessions = sessionUserCounts.size
  const deflectedSessions = [...sessionUserCounts.values()].filter(
    (count) => count <= 2,
  ).length
  const aiDeflectionRate =
    totalSessions > 0
      ? Math.round((deflectedSessions / totalSessions) * 100 * 10) / 10
      : 0

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const conversionRate =
    (totalConversations ?? 0) > 0
      ? Math.round(
          ((totalOrders ?? 0) / (totalConversations ?? 1)) * 100 * 10,
        ) / 10
      : 0

  return {
    totalConversations: totalConversations ?? 0,
    avgResponseTimeMs,
    aiDeflectionRate,
    conversionRate,
  }
}
