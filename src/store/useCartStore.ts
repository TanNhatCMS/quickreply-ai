import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Maps to products.id in Supabase */
  productId: string
  name: string
  brand: string
  /** Selling price in VND */
  price: number
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  /** Whether the cart drawer is visible */
  isOpen: boolean

  // ── Actions ──────────────────────────────────────────────────────────────
  /**
   * Add a product to the cart. If the product already exists,
   * its quantity is incremented by `quantity` (default 1).
   */
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void
  /** Remove a product entirely from the cart */
  removeItem: (productId: string) => void
  /** Set an exact quantity for a product (removes if quantity <= 0) */
  updateQuantity: (productId: string, quantity: number) => void
  /** Empty the cart */
  clearCart: () => void
  /** Open/close the cart drawer; pass a boolean to force a state */
  toggleDrawer: (open?: boolean) => void

  // ── Derived helpers (computed outside of Zustand for simplicity) ──────────
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.productId,
          )

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }

          return { items: [...state.items, { ...product, quantity }] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            }
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
          }
        }),

      clearCart: () => set({ items: [] }),

      toggleDrawer: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
    }),
    {
      name: 'phongvu-cart-store',
      // Only persist items — drawer state resets on page load
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

// ─── Selector helpers ─────────────────────────────────────────────────────────

/** Total number of items (sum of quantities) */
export const selectCartCount = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

/** Total cart value in VND */
export const selectCartTotal = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
