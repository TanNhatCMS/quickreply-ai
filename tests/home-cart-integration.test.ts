import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, selectCartCount, selectCartTotal } from '@/store/useCartStore'
import { homeProducts } from '@/lib/products'

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
})

describe('cart integration with home products', () => {
  it('can add a home product to cart', () => {
    const p = homeProducts[0]
    useCartStore.getState().addItem({
      productId: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.image,
    })
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe(p.id)
    expect(items[0].name).toBe(p.name)
    expect(items[0].brand).toBe(p.brand)
    expect(items[0].price).toBe(p.price)
    expect(items[0].quantity).toBe(1)
  })

  it('adding same home product twice increments quantity', () => {
    const p = homeProducts[0]
    const addItem = useCartStore.getState().addItem
    addItem({ productId: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image })
    addItem({ productId: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image })
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it('adding different home products creates separate entries', () => {
    const addItem = useCartStore.getState().addItem
    for (const p of homeProducts) {
      addItem({ productId: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image })
    }
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(homeProducts.length)
  })

  it('cart count matches number of items added', () => {
    const addItem = useCartStore.getState().addItem
    addItem({ productId: homeProducts[0].id, name: homeProducts[0].name, brand: homeProducts[0].brand, price: homeProducts[0].price, image: homeProducts[0].image })
    addItem({ productId: homeProducts[1].id, name: homeProducts[1].name, brand: homeProducts[1].brand, price: homeProducts[1].price, image: homeProducts[1].image })
    expect(selectCartCount(useCartStore.getState())).toBe(2)
  })

  it('cart total matches sum of product prices', () => {
    const addItem = useCartStore.getState().addItem
    addItem({ productId: homeProducts[0].id, name: homeProducts[0].name, brand: homeProducts[0].brand, price: homeProducts[0].price, image: homeProducts[0].image })
    addItem({ productId: homeProducts[1].id, name: homeProducts[1].name, brand: homeProducts[1].brand, price: homeProducts[1].price, image: homeProducts[1].image })
    const expected = homeProducts[0].price + homeProducts[1].price
    expect(selectCartTotal(useCartStore.getState())).toBe(expected)
  })

  it('removing a home product clears it from cart', () => {
    const p = homeProducts[0]
    useCartStore.getState().addItem({ productId: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image })
    useCartStore.getState().removeItem(p.id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clearing cart removes all home products', () => {
    const addItem = useCartStore.getState().addItem
    for (const p of homeProducts) {
      addItem({ productId: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image })
    }
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
