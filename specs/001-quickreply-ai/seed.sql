-- ============================================================
-- QuickReply AI - Seed Data (T005)
-- Run AFTER schema.sql in the Supabase SQL Editor
-- This uses pre-computed placeholder embeddings (all zeros)
-- Replace embeddings with real values using the seeding script
-- ============================================================

-- ============================================================
-- 1. Seed: warranty_policies
-- ============================================================
INSERT INTO warranty_policies (brand, policy_details, duration_months) VALUES
(
  'ASUS',
  'Bảo hành chính hãng ASUS tại Việt Nam 24 tháng kể từ ngày mua. Bao gồm lỗi phần cứng do nhà sản xuất. Không bao gồm hư hại vật lý, hư hỏng do chất lỏng, hoặc sửa chữa trái phép. Trung tâm bảo hành: Hà Nội, TP.HCM, Đà Nẵng. Hotline: 1800 599 913.',
  24
),
(
  'Dell',
  'Bảo hành Dell ProSupport 12 tháng tại Việt Nam. Hỗ trợ kỹ thuật 24/7 qua điện thoại. Dịch vụ sửa chữa tại chỗ hoặc gửi máy về trung tâm. Không bảo hành màn hình vỡ hoặc hư hỏng vật lý. Gia hạn lên 36 tháng với phí bổ sung. Hotline: 1800 599 804.',
  12
),
(
  'Apple',
  'Bảo hành Apple Care 12 tháng tiêu chuẩn. Hỗ trợ qua Apple Store và AASP (Apple Authorized Service Provider). Nâng cấp lên AppleCare+ 36 tháng bao gồm vô ý làm hỏng (phí sửa chữa áp dụng). Không bảo hành pin đã hao mòn dưới 80% dung lượng sau 1 năm. Trung tâm: FPT Service, Viettel Store.',
  12
),
(
  'HP',
  'Bảo hành HP Standard 12 tháng. Dịch vụ mang máy đến trung tâm dịch vụ. Hỗ trợ kỹ thuật miễn phí trong thời gian bảo hành. Có thể gia hạn lên 24-36 tháng với HP Care Pack. Không bảo hành pin, vỏ máy hư hỏng do tác động bên ngoài. Hotline: 1800 599 972.',
  12
),
(
  'Lenovo',
  'Bảo hành Lenovo Depot 24 tháng. Gửi máy về depot sửa chữa trong 5-7 ngày làm việc. Bảo hành bao gồm lỗi kỹ thuật, lỗi phần cứng. Không bảo hành màn hình bị pixel chết dưới 5 điểm. ThinkPad có tùy chọn On-Site 3 năm. Hotline: 1800 588 867.',
  24
),
(
  'Samsung',
  'Bảo hành Samsung 12 tháng toàn quốc. Trung tâm bảo hành trên toàn quốc với 200+ điểm dịch vụ. Màn hình OLED được bảo hành riêng 6 tháng cho lỗi burn-in. Không bảo hành hư hỏng do nước, rơi vỡ. Hotline: 1800 588 889.',
  12
),
(
  'MSI',
  'Bảo hành MSI Gaming 24 tháng. Hỗ trợ ưu tiên cho dòng gaming. Card đồ họa NVIDIA tích hợp được bảo hành theo nhà sản xuất GPU. Dịch vụ mang máy đến trung tâm. Không bảo hành màn hình quá nhiệt do overclock. Hotline: 1800 599 977.',
  24
)
ON CONFLICT (brand) DO UPDATE SET
  policy_details = EXCLUDED.policy_details,
  duration_months = EXCLUDED.duration_months;

-- ============================================================
-- 2. Seed: products
-- ============================================================
INSERT INTO products (name, brand, price, specifications, stock, image_url) VALUES
(
  'ASUS VivoBook 15 X1504VA',
  'ASUS',
  15990000,
  '{"cpu": "Intel Core i5-1335U", "ram": "8GB DDR4", "storage": "512GB SSD NVMe", "gpu": "Intel Iris Xe Graphics", "screen": "15.6 inch FHD IPS 60Hz", "battery": "42WHr", "weight": "1.7kg", "os": "Windows 11 Home"}',
  25,
  '/images/asus-vivobook-15.jpg'
),
(
  'ASUS ZenBook 14 UX3402VA',
  'ASUS',
  24990000,
  '{"cpu": "Intel Core i5-1340P", "ram": "16GB LPDDR5", "storage": "512GB SSD PCIe 4.0", "gpu": "Intel Iris Xe Graphics", "screen": "14 inch 2.8K OLED 90Hz", "battery": "75WHr", "weight": "1.37kg", "os": "Windows 11 Home"}',
  12,
  '/images/asus-zenbook-14.jpg'
),
(
  'ASUS ROG Strix G16 G614JU',
  'ASUS',
  32990000,
  '{"cpu": "Intel Core i7-13650HX", "ram": "16GB DDR5", "storage": "1TB SSD NVMe", "gpu": "NVIDIA GeForce RTX 4060 8GB", "screen": "16 inch FHD IPS 165Hz", "battery": "90WHr", "weight": "2.5kg", "os": "Windows 11 Home"}',
  8,
  '/images/asus-rog-strix-g16.jpg'
),
(
  'Dell Inspiron 15 3530',
  'Dell',
  14490000,
  '{"cpu": "Intel Core i5-1335U", "ram": "8GB DDR4", "storage": "512GB SSD", "gpu": "Intel Iris Xe Graphics", "screen": "15.6 inch FHD WVA 120Hz", "battery": "54WHr", "weight": "1.73kg", "os": "Windows 11 Home"}',
  30,
  '/images/dell-inspiron-15-3530.jpg'
),
(
  'Dell XPS 15 9530',
  'Dell',
  45990000,
  '{"cpu": "Intel Core i7-13700H", "ram": "16GB LPDDR5", "storage": "512GB SSD PCIe 4.0", "gpu": "NVIDIA GeForce RTX 4060 8GB", "screen": "15.6 inch FHD+ OLED 60Hz", "battery": "86WHr", "weight": "1.86kg", "os": "Windows 11 Home"}',
  5,
  '/images/dell-xps-15-9530.jpg'
),
(
  'Apple MacBook Air M2 2022',
  'Apple',
  27990000,
  '{"cpu": "Apple M2 8-core CPU", "ram": "8GB Unified Memory", "storage": "256GB SSD", "gpu": "Apple M2 8-core GPU", "screen": "13.6 inch Liquid Retina 60Hz", "battery": "52.6WHr (18hr)", "weight": "1.24kg", "os": "macOS Ventura"}',
  15,
  '/images/apple-macbook-air-m2.jpg'
),
(
  'Apple MacBook Pro 14 M3 Pro',
  'Apple',
  54990000,
  '{"cpu": "Apple M3 Pro 11-core CPU", "ram": "18GB Unified Memory", "storage": "512GB SSD", "gpu": "Apple M3 Pro 14-core GPU", "screen": "14.2 inch Liquid Retina XDR 120Hz ProMotion", "battery": "72WHr (18hr)", "weight": "1.61kg", "os": "macOS Sonoma"}',
  6,
  '/images/apple-macbook-pro-14-m3.jpg'
),
(
  'Lenovo ThinkPad X1 Carbon Gen 11',
  'Lenovo',
  42990000,
  '{"cpu": "Intel Core i7-1365U", "ram": "16GB LPDDR5", "storage": "512GB SSD PCIe 4.0", "gpu": "Intel Iris Xe Graphics", "screen": "14 inch WUXGA IPS Anti-glare 60Hz", "battery": "57WHr (15hr)", "weight": "1.12kg", "os": "Windows 11 Pro"}',
  4,
  '/images/lenovo-thinkpad-x1-carbon.jpg'
),
(
  'Lenovo IdeaPad Gaming 3 15IAH7',
  'Lenovo',
  18990000,
  '{"cpu": "Intel Core i5-12500H", "ram": "8GB DDR5", "storage": "512GB SSD NVMe", "gpu": "NVIDIA GeForce RTX 3050 4GB", "screen": "15.6 inch FHD IPS 120Hz", "battery": "45WHr", "weight": "2.2kg", "os": "Windows 11 Home"}',
  20,
  '/images/lenovo-ideapad-gaming-3.jpg'
),
(
  'HP Pavilion 15-eg3038TX',
  'HP',
  16990000,
  '{"cpu": "Intel Core i5-1335U", "ram": "8GB DDR4", "storage": "512GB SSD", "gpu": "NVIDIA GeForce MX570 2GB", "screen": "15.6 inch FHD IPS 60Hz", "battery": "43WHr", "weight": "1.75kg", "os": "Windows 11 Home"}',
  18,
  '/images/hp-pavilion-15.jpg'
),
(
  'HP Spectre x360 14-ef2007TU',
  'HP',
  38990000,
  '{"cpu": "Intel Core i7-1355U", "ram": "16GB LPDDR5", "storage": "1TB SSD PCIe 4.0", "gpu": "Intel Iris Xe Graphics", "screen": "14 inch 2.8K OLED Touch 60Hz", "battery": "66WHr (17hr)", "weight": "1.41kg", "os": "Windows 11 Home"}',
  7,
  '/images/hp-spectre-x360.jpg'
),
(
  'MSI Titan GT77 HX 13VI',
  'MSI',
  79990000,
  '{"cpu": "Intel Core i9-13980HX", "ram": "64GB DDR5", "storage": "2TB SSD NVMe RAID 0", "gpu": "NVIDIA GeForce RTX 4090 16GB", "screen": "17.3 inch UHD+ IPS 144Hz", "battery": "99.9WHr", "weight": "3.5kg", "os": "Windows 11 Pro"}',
  2,
  '/images/msi-titan-gt77.jpg'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. Seed: promotions
-- ============================================================
INSERT INTO promotions (title, description, discount_percentage, start_date, end_date) VALUES
(
  'Mùa Hè Công Nghệ 2025',
  'Giảm giá 10% toàn bộ laptop ASUS và Lenovo. Áp dụng khi mua trực tiếp tại cửa hàng hoặc đặt hàng trực tuyến. Không áp dụng đồng thời với ưu đãi khác.',
  10.00,
  '2025-06-01 00:00:00+07',
  '2025-08-31 23:59:59+07'
),
(
  'Back to School - Trở Lại Trường',
  'Giảm 5% cho học sinh, sinh viên khi xuất trình thẻ học sinh hoặc bằng chứng nhập học. Áp dụng cho tất cả laptop dưới 20 triệu VND.',
  5.00,
  '2025-07-15 00:00:00+07',
  '2025-09-15 23:59:59+07'
),
(
  'Flash Sale Cuối Tuần',
  'Giảm 15% tất cả laptop Dell trong cuối tuần này. Số lượng có hạn, áp dụng cho 50 máy đầu tiên mỗi ngày. Không áp dụng cho Dell XPS.',
  15.00,
  '2025-07-11 00:00:00+07',
  '2025-07-13 23:59:59+07'
),
(
  'Apple Education Pricing',
  'Chương trình giá giáo dục Apple - Giảm 8% cho sinh viên và nhà giáo trên toàn bộ dòng MacBook. Xuất trình email giáo dục .edu hoặc thẻ sinh viên.',
  8.00,
  '2025-06-01 00:00:00+07',
  '2025-12-31 23:59:59+07'
),
(
  'Gaming Fest - Phong Vũ x MSI',
  'Mua MSI Titan GT77 tặng kèm chuột gaming MSI Clutch GM41 trị giá 1.500.000đ và túi laptop cao cấp. Số lượng quà có hạn.',
  0.00,
  '2025-07-01 00:00:00+07',
  '2025-07-31 23:59:59+07'
)
ON CONFLICT DO NOTHING;
