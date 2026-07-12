/**
 * Phong Vũ Discovery API client
 *
 * Ported from phongvu-ai-agent/mcp-server/index.js (reference implementation).
 * Calls the Phong Vũ product API directly over HTTP — no MCP/subprocess involved.
 */

const BASE_URL = 'https://phongvu-api-proxy.tannhatcms.io.vn'
const TERMINAL_CODE = 'phongvu'
const FETCH_TIMEOUT_MS = 10_000

const SORT_MAP: Record<string, string> = {
  new: 'SORT_BY_PUBLISH_AT',
  bestPrice: 'SORT_BY_PRICE',
  discountPercent: 'SORT_BY_DISCOUNT_PERCENT',
  'view.last_3_day': 'SORT_BY_MOST_VIEW',
  'view.last_7_day': 'SORT_BY_MOST_VIEW_7_DAYS',
  'view.last_30_day': 'SORT_BY_MOST_VIEW_30_DAYS',
  'quantity.last_3_day': 'SORT_BY_TOP_SALE_QUANTITY',
  'quantity.last_1_week': 'SORT_BY_TOP_SALE_QUANTITY_7_DAYS',
  'quantity.last_1_month': 'SORT_BY_TOP_SALE_QUANTITY_30_DAYS',
}

const ORDER_MAP: Record<string, string> = {
  asc: 'ORDER_BY_ASCENDING',
  desc: 'ORDER_BY_DESCENDING',
}

// ─── Low-level fetch helper ─────────────────────────────────────────────────

async function fetchApi(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  method: 'GET' | 'POST' = 'GET',
  body: unknown = null,
): Promise<any> {
  const url = new URL(`${BASE_URL}${endpoint}`)

  if (method === 'GET') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  const response = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    ...(method === 'POST' && body ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

// ─── Formatting helpers ─────────────────────────────────────────────────────

function safeParsePrice(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const parsed = parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export interface ProductSummary {
  sku: string
  name: string
  brand: string
  url: string
  priceCurrent: number | null
  priceOriginal: number | null
  discount: number
  priceFormatted: string
  inStock: boolean
  warranty: string | null
  shortDescription: string
  categories: string[]
  image: string
}

function summarizeProduct(product: any): ProductSummary {
  const info = product.productInfo
  const price = product.prices?.[0]
  const detail = product.productDetail

  const priceCurrent = safeParsePrice(price?.latestPrice)
  const priceOriginal = safeParsePrice(price?.supplierRetailPrice)

  return {
    sku: info.sku,
    name: info.name || info.displayName,
    brand: info.brand?.name || '',
    url: `https://phongvu.vn/${info.canonical}`,
    priceCurrent,
    priceOriginal,
    discount: price?.discountPercent || 0,
    priceFormatted: priceCurrent !== null ? formatPrice(priceCurrent) : 'Liên hệ',
    inStock: product.status?.sellable || false,
    warranty: info.warranty?.months ? `${info.warranty.months} tháng` : null,
    shortDescription: detail?.shortDescription || '',
    categories: info.categories?.map((c: any) => c.name) || [],
    image: info.imageUrl,
  }
}

interface FilterOptions {
  brands?: { code: string; name: string }[]
  priceRange?: { min: number; max: number }
  attributes?: {
    code: string
    name: string
    options: { optionId: string; value: string; count: number }[]
  }[]
  clearanceTypes?: unknown
}

function summarizeFilters(filterData: any): FilterOptions | null {
  if (!filterData) return null

  const result: FilterOptions = {}

  if (filterData.brands?.length) {
    result.brands = filterData.brands.map((b: any) => ({ code: b.code, name: b.name }))
  }

  if (filterData.priceGte || filterData.priceLte) {
    result.priceRange = {
      min: parseInt(filterData.priceGte) || 0,
      max: parseInt(filterData.priceLte) || 0,
    }
  }

  if (filterData.attributes?.length) {
    result.attributes = filterData.attributes.map((attr: any) => ({
      code: attr.code,
      name: attr.name,
      options: attr.values?.map((v: any) => ({ optionId: v.optionId, value: v.value, count: v.count })) || [],
    }))
  }

  if (filterData.clearanceTypes?.length) {
    result.clearanceTypes = filterData.clearanceTypes
  }

  return result
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface SearchProductsInput {
  query: string
  page?: number
  limit?: number
  price_lte?: number
  price_gte?: number
  has_promotions?: boolean
  brands?: string[]
  attributes?: Record<string, string>
  sort?:
    | 'new'
    | 'bestPrice'
    | 'discountPercent'
    | 'view.last_3_day'
    | 'view.last_7_day'
    | 'view.last_30_day'
    | 'quantity.last_1_week'
    | 'quantity.last_1_month'
  order?: 'asc' | 'desc'
  return_filterable?: boolean
}

export async function searchProducts(input: SearchProductsInput) {
  const { query, page = 1, limit = 5, price_lte, price_gte, has_promotions, brands, attributes, sort, order, return_filterable } = input

  const body: any = { query, terminalCode: TERMINAL_CODE, page, limit }

  if (return_filterable) {
    body.returnFilterable = ['FILTER_TYPE_BRAND', 'FILTER_TYPE_PRICE', 'FILTER_TYPE_ATTRIBUTE', 'FILTER_TYPE_CLEARANCE']
  }

  const filter: any = {}
  if (price_lte !== undefined) filter.priceLte = price_lte
  if (price_gte !== undefined) filter.priceGte = price_gte
  if (has_promotions !== undefined) filter.hasPromotions = has_promotions
  if (brands !== undefined && brands.length > 0) filter.brands = brands

  if (attributes !== undefined && Object.keys(attributes).length > 0) {
    filter.attributes = Object.entries(attributes).map(([code, ids]) => ({
      code,
      optionIds: typeof ids === 'string' ? ids.split(',') : ids,
    }))
  }

  if (Object.keys(filter).length > 0) body.filter = filter

  if (sort !== undefined) {
    body.sorting = { sort: SORT_MAP[sort] || sort }
    if (order !== undefined) body.sorting.order = ORDER_MAP[order] || order.toUpperCase()
  }

  const result = await fetchApi('/v1/search', {}, 'POST', body)

  if (result.code !== '0') {
    throw new Error(result.message || 'search_products failed')
  }

  const products = result.result.products.map(summarizeProduct)
  const pagination = result.pagination

  const response: any = {
    query,
    total: pagination.totalItems,
    totalPages: pagination.totalPages,
    currentPage: page,
    products,
  }

  if (return_filterable && result.result.filter) {
    response.filter_options = summarizeFilters(result.result.filter)
  }

  return response
}

export async function getProductDetail(sku: string) {
  const result = await fetchApi('/v1/product', { sku, terminalCode: TERMINAL_CODE })

  if (result.code !== '0') {
    throw new Error(result.message || 'get_product_detail failed')
  }

  const product = result.result.product
  const summary = summarizeProduct(product)

  return {
    ...summary,
    fullDescription: product.productDetail?.description || '',
    images: product.productDetail?.images || [],
  }
}

export async function compareProducts(skus: string[]) {
  const results = await Promise.all(
    skus.map(async (sku) => {
      try {
        const result = await fetchApi('/v1/product', { sku, terminalCode: TERMINAL_CODE })
        return result.code === '0' ? { sku, product: result.result.product } : { sku, error: result.message }
      } catch (err) {
        return { sku, error: err instanceof Error ? err.message : String(err) }
      }
    }),
  )

  const valid = results.filter((r): r is { sku: string; product: any } => !('error' in r))
  const failed = results.filter((r): r is { sku: string; error: string } => 'error' in r)

  if (valid.length < 2) {
    const failMsg = failed.map((f) => `${f.sku}: ${f.error}`).join('; ')
    throw new Error(`Không tìm đủ sản phẩm để so sánh. Lỗi: ${failMsg}`)
  }

  const response: any = { comparison: valid.map((v) => summarizeProduct(v.product)) }
  if (failed.length > 0) {
    response.warnings = failed.map((f) => `SKU ${f.sku}: ${f.error}`)
  }

  return response
}

export async function getPopularKeywords(limit = 10) {
  const result = await fetchApi('/v1/recommended-search-terms', { limit, terminalCode: TERMINAL_CODE })

  if (result.code !== undefined && result.code !== '0') {
    throw new Error(result.message || 'get_popular_keywords failed')
  }

  return { popularKeywords: result.result?.terms || [] }
}

export async function getRecommendations(sku: string) {
  const result = await fetchApi(`/v1/products/${sku}/recommendations`, { terminalCode: TERMINAL_CODE })

  if (result.code !== undefined && result.code !== '0') {
    throw new Error(result.message || 'get_recommendations failed')
  }

  const recommendations = result?.result?.productSets?.[0]?.products?.map(summarizeProduct) || []

  return { sku, recommendations }
}

export async function checkStock(sku: string) {
  const result = await fetchApi('/v1/product', { sku, terminalCode: TERMINAL_CODE })

  if (result.code !== '0') {
    throw new Error(result.message || 'check_stock failed')
  }

  const product = result.result.product
  const price = product.prices?.[0]
  const priceCurrent = safeParsePrice(price?.latestPrice)

  return {
    sku,
    name: product.productInfo.name,
    sellable: product.status?.sellable || false,
    currentPrice: priceCurrent !== null ? formatPrice(priceCurrent) : 'N/A',
    promotions: product.promotions || [],
  }
}
