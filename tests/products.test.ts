import { describe, it, expect } from 'vitest'
import { homeProducts, homeCategories, type HomeProduct, type HomeCategory } from '@/lib/products'

describe('homeProducts', () => {
  it('has at least one product', () => {
    expect(homeProducts.length).toBeGreaterThan(0)
  })

  it('every product has required fields', () => {
    for (const p of homeProducts) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.brand).toBeTruthy()
      expect(p.category).toBeTruthy()
      expect(p.price).toBeGreaterThan(0)
      expect(p.originalPrice).toBeGreaterThan(0)
      expect(p.discount).toBeTruthy()
      expect(p.image).toBeTruthy()
    }
  })

  it('every product has all spec fields', () => {
    for (const p of homeProducts) {
      expect(p.specs.cpu).toBeTruthy()
      expect(p.specs.gpu).toBeTruthy()
      expect(p.specs.ram).toBeTruthy()
      expect(p.specs.storage).toBeTruthy()
    }
  })

  it('price is less than originalPrice for all products', () => {
    for (const p of homeProducts) {
      expect(p.price).toBeLessThan(p.originalPrice)
    }
  })

  it('has unique ids', () => {
    const ids = homeProducts.map((p) => p.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('has unique names', () => {
    const names = homeProducts.map((p) => p.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('all products are laptops for MVP', () => {
    for (const p of homeProducts) {
      expect(p.category).toBe('laptop')
    }
  })

  it('brands are valid values', () => {
    const validBrands = ['Asus', 'Acer', 'Lenovo', 'HP', 'MSI']
    for (const p of homeProducts) {
      expect(validBrands).toContain(p.brand)
    }
  })
})

describe('homeCategories', () => {
  it('has exactly 7 categories', () => {
    expect(homeCategories).toHaveLength(7)
  })

  it('every category has required fields', () => {
    for (const c of homeCategories) {
      expect(c.name).toBeTruthy()
      expect(c.icon).toBeTruthy()
      expect(c.slug).toBeTruthy()
    }
  })

  it('has unique slugs', () => {
    const slugs = homeCategories.map((c) => c.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('has unique names', () => {
    const names = homeCategories.map((c) => c.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('contains expected categories', () => {
    const slugs = homeCategories.map((c) => c.slug)
    expect(slugs).toContain('laptop')
    expect(slugs).toContain('apple')
    expect(slugs).toContain('pc')
    expect(slugs).toContain('component')
    expect(slugs).toContain('monitor')
    expect(slugs).toContain('accessory')
    expect(slugs).toContain('network')
  })
})

describe('brand filtering', () => {
  it('can filter products by Lenovo brand', () => {
    const lenovo = homeProducts.filter((p) => p.brand === 'Lenovo')
    expect(lenovo.length).toBeGreaterThan(0)
    for (const p of lenovo) {
      expect(p.brand).toBe('Lenovo')
    }
  })

  it('can filter products by Acer brand', () => {
    const acer = homeProducts.filter((p) => p.brand === 'Acer')
    expect(acer.length).toBeGreaterThan(0)
    for (const p of acer) {
      expect(p.brand).toBe('Acer')
    }
  })

  it('can filter products by HP brand', () => {
    const hp = homeProducts.filter((p) => p.brand === 'HP')
    expect(hp.length).toBeGreaterThan(0)
    for (const p of hp) {
      expect(p.brand).toBe('HP')
    }
  })

  it('Lenovo + Acer + HP + MSI covers all products', () => {
    const brands = ['Lenovo', 'Acer', 'HP', 'MSI']
    const covered = homeProducts.filter((p) => brands.includes(p.brand))
    expect(covered).toHaveLength(homeProducts.length)
  })
})

describe('product data format', () => {
  it('prices are integers (VND)', () => {
    for (const p of homeProducts) {
      expect(Number.isInteger(p.price)).toBe(true)
      expect(Number.isInteger(p.originalPrice)).toBe(true)
    }
  })

  it('ram contains "GB RAM"', () => {
    for (const p of homeProducts) {
      expect(p.specs.ram).toMatch(/GB RAM/)
    }
  })

  it('storage contains "GB SSD"', () => {
    for (const p of homeProducts) {
      expect(p.specs.storage).toMatch(/GB SSD/)
    }
  })

  it('image URLs are valid', () => {
    for (const p of homeProducts) {
      expect(p.image).toMatch(/^https?:\/\//)
    }
  })
})
