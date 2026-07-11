import { getConversations } from '@/lib/dashboard'
import ConversationPageClient from './ConversationPageClient'

export default async function ConversationsPage() {
  const initial = await getConversations(1, 20)

  return (
    <ConversationPageClient
      initialSessions={initial.data}
      initialTotalCount={initial.totalCount}
      initialPage={initial.page}
      initialLimit={initial.limit}
    />
  )
}
