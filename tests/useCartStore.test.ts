import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, selectCartCount, selectCartTotal } from '@/store/useCartStore'

// Reset store between tests
beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
})

const sampleItem = {
  productId: 'prod-1',
  name: 'ASUS ROG Strix G16',
  brand: 'ASUS',
  price: 32_990_000,
  image: 'https://example.com/rog.jpg',
}

describe('useCartStore', () => {
  it('starts with empty items and closed drawer', () => {
    const state = useCartStore.getState()
    expect(state.items).toEqual([])
    expect(state.isOpen).toBe(false)
  })

  describe('addItem', () => {
    it('adds a new item with quantity 1 by default', () => {
      useCartStore.getState().addItem(sampleItem)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe('prod-1')
      expect(items[0].quantity).toBe(1)
    })

    it('increments quantity when adding the same product', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().addItem(sampleItem, 2)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(3)
    })

    it('adds distinct products separately', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().addItem({ ...sampleItem, productId: 'prod-2', name: 'Dell XPS' })
      expect(useCartStore.getState().items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('removes an item by productId', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().removeItem('prod-1')
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('does nothing when removing non-existent productId', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().removeItem('nonexistent')
      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('sets exact quantity', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().updateQuantity('prod-1', 5)
      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('removes item when quantity <= 0', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().updateQuantity('prod-1', 0)
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('empties all items', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().addItem({ ...sampleItem, productId: 'prod-2' })
      useCartStore.getState().clearCart()
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('toggleDrawer', () => {
    it('toggles isOpen', () => {
      useCartStore.getState().toggleDrawer()
      expect(useCartStore.getState().isOpen).toBe(true)
      useCartStore.getState().toggleDrawer()
      expect(useCartStore.getState().isOpen).toBe(false)
    })

    it('forces open with boolean arg', () => {
      useCartStore.getState().toggleDrawer(true)
      expect(useCartStore.getState().isOpen).toBe(true)
      useCartStore.getState().toggleDrawer(true)
      expect(useCartStore.getState().isOpen).toBe(true)
    })

    it('forces closed with false', () => {
      useCartStore.getState().toggleDrawer(false)
      expect(useCartStore.getState().isOpen).toBe(false)
    })
  })
})

describe('selectors', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
  })

  it('selectCartCount sums quantities', () => {
    useCartStore.getState().addItem(sampleItem, 2)
    useCartStore.getState().addItem({ ...sampleItem, productId: 'prod-2' }, 3)
    expect(selectCartCount(useCartStore.getState())).toBe(5)
  })

  it('selectCartTotal sums price × quantity', () => {
    useCartStore.getState().addItem(sampleItem, 2) // 32_990_000 × 2
    useCartStore.getState().addItem(
      { ...sampleItem, productId: 'prod-2', price: 10_000_000 },
      1,
    )
    expect(selectCartTotal(useCartStore.getState())).toBe(32_990_000 * 2 + 10_000_000)
  })

  it('returns 0 for empty cart', () => {
    expect(selectCartCount(useCartStore.getState())).toBe(0)
    expect(selectCartTotal(useCartStore.getState())).toBe(0)
  })
})
