/**
 * AI SDK tool definitions for the Phong Vũ Discovery API.
 *
 * Ported from phongvu-ai-agent/mcp-server/index.js (reference implementation) —
 * same input schemas, but executed in-process via fetch instead of an MCP
 * stdio subprocess.
 */

import { tool } from 'ai'
import { z } from 'zod'
import {
  searchProducts,
  getProductDetail,
  compareProducts,
  getPopularKeywords,
  getRecommendations,
  checkStock,
} from './phongvu-api'
import { searchHelpDocs } from './phongvu-help'

const searchProductsTool = tool({
  description:
    'Tìm kiếm sản phẩm trên Phong Vũ theo từ khóa. Hỗ trợ lọc theo giá, khuyến mãi, thương hiệu, attributes và sắp xếp. Có thể trả về danh sách filter options (brands, attributes, price range) khi set return_filterable=true.',
  inputSchema: z.object({
    query: z.string().describe("Từ khóa tìm kiếm (VD: 'laptop', 'M.2 SSD', 'tai nghe')"),
    page: z.number().int().min(1).optional().default(1).describe('Số trang'),
    limit: z.number().int().min(1).max(50).optional().default(5).describe('Số sản phẩm mỗi trang (max 50)'),
    price_lte: z.number().optional().describe('Giá tối đa (VND). Chỉ thêm khi người dùng set giá cao nhất. VD: 20000000'),
    price_gte: z.number().optional().describe('Giá tối thiểu (VND). Chỉ thêm khi người dùng set giá thấp nhất. VD: 10000000'),
    has_promotions: z.boolean().optional().describe("Chỉ sản phẩm có khuyến mãi. Thêm khi khách hỏi 'có KM không', 'đang giảm giá'"),
    brands: z.array(z.string()).optional().describe("Lọc theo thương hiệu (VD: ['lenovo', 'asus', 'hp']). Mã brand viết thường, không dấu"),
    attributes: z
      .record(z.string(), z.string())
      .optional()
      .describe("Lọc theo attributes dạng {code: 'id1,id2,...'}. VD: {'nhucausudung': '26695,26696'}. Lấy code và optionId từ filter_options"),
    sort: z
      .enum([
        'new',
        'bestPrice',
        'discountPercent',
        'view.last_3_day',
        'view.last_7_day',
        'view.last_30_day',
        'quantity.last_1_week',
        'quantity.last_1_month',
      ])
      .optional()
      .describe('Sắp xếp: new=mới nhất, bestPrice=giá thấp, discountPercent=KM cao, view.*=xem nhiều, quantity.*=bán chạy'),
    order: z.enum(['asc', 'desc']).optional().describe('Thứ tự: asc=tăng dần, desc=giảm dần. Mặc định desc'),
    return_filterable: z
      .boolean()
      .optional()
      .default(false)
      .describe('true để trả về danh sách filter options (brands, attributes, price range) cùng kết quả. Dùng cho lần search đầu tiên.'),
  }),
  execute: async (input) => {
    try { return await searchProducts(input) }
    catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  },
})

const getProductDetailTool = tool({
  description: 'Lấy thông tin chi tiết sản phẩm theo SKU. Bao gồm mô tả, thông số kỹ thuật, giá, khuyến mãi, tồn kho.',
  inputSchema: z.object({
    sku: z.string().describe("Mã SKU sản phẩm (VD: '250512246')"),
  }),
  execute: async ({ sku }) => {
    try { return await getProductDetail(sku) }
    catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  },
})

const compareProductsTool = tool({
  description: 'So sánh cấu hình 2-3 sản phẩm theo SKU. Hữu ích khi khách hàng muốn đối chiếu trước khi mua.',
  inputSchema: z.object({
    skus: z.array(z.string()).min(2).max(3).describe('Danh sách SKU cần so sánh (2-3 sản phẩm)'),
  }),
  execute: async ({ skus }) => {
    try { return await compareProducts(skus) }
    catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  },
})

const getRecommendationsTool = tool({
  description: 'Lấy sản phẩm gợi ý liên quan đến một sản phẩm cụ thể.',
  inputSchema: z.object({
    sku: z.string().describe('Mã SKU sản phẩm'),
  }),
  execute: async ({ sku }) => {
    try { return await getRecommendations(sku) }
    catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  },
})

const checkStockTool = tool({
  description: 'Kiểm tra tồn kho và trạng thái bán hàng của sản phẩm.',
  inputSchema: z.object({
    sku: z.string().describe('Mã SKU sản phẩm'),
  }),
  execute: async ({ sku }) => {
    try { return await checkStock(sku) }
    catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  },
})

const getPopularKeywordsTool = tool({
  description: 'Lấy danh sách từ khóa tìm kiếm phổ biến. Gợi ý cho khách hàng khi chưa biết tìm gì.',
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe('Số lượng từ khóa'),
  }),
  execute: async ({ limit }) => {
    try { return await getPopularKeywords(limit) }
    catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  },
})

const searchKnowledgeTool = tool({
  description:
    'Tìm kiếm thông tin từ trung tâm hỗ trợ Phong Vũ (help.phongvu.vn). Dùng khi khách hỏi về chính sách, bảo hành, đổi trả, thanh toán, giao hàng, lắp đặt, hoặc thông tin công ty.',
  inputSchema: z.object({
    query: z.string().describe('Câu hỏi hoặc từ khóa tìm kiếm (tiếng Việt)'),
    category: z
      .enum(['company', 'policy', 'warranty', 'payment', 'delivery', 'faq', 'service', 'legal'])
      .optional()
      .describe('Lọc theo danh mục (tùy chọn)'),
    maxResults: z.number().int().min(1).max(10).optional().default(5).describe('Số lượng kết quả tối đa'),
  }),
  execute: async ({ query, category, maxResults }) => {
    try {
      const documents = await searchHelpDocs(query, { category, maxResults })
      return { documents }
    } catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  },
})

export const phongvuTools = {
  search_products: searchProductsTool,
  get_product_detail: getProductDetailTool,
  compare_products: compareProductsTool,
  get_recommendations: getRecommendationsTool,
  check_stock: checkStockTool,
  get_popular_keywords: getPopularKeywordsTool,
  searchKnowledge: searchKnowledgeTool,
}
