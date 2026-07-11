'use client'

import { useState } from 'react'
import CategoryBar from '@/components/home/CategoryBar'

export default function CategoryBarWrapper() {
  const [selected, setSelected] = useState<string | null>(null)
  return <CategoryBar selectedSlug={selected} onCategoryChange={setSelected} />
}
