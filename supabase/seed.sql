-- ============================================================
-- QuickReply AI - Seed Data
-- RAG knowledge base chunks from help.phongvu.vn/llms-full.txt
-- Run AFTER migrations in the Supabase SQL Editor
-- Embeddings are NULL — generate them via the seeding script
-- ============================================================

-- ============================================================
-- 1. Company Info
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Giới thiệu Phong Vũ',
  'Phong Vũ được thành lập năm 1997 tại TP.HCM, khởi đầu là cửa hàng máy tính nhỏ. Năm 2018, nhận đầu tư chiến lược từ Teko (công ty công nghệ thuộc Vingroup). Hiện có hơn 30 cửa hàng toàn quốc. Tầm nhìn: trở thành hệ thống bán lẻ công nghệ hàng đầu Việt Nam. Sứ mệnh: mang công nghệ đến gần hơn với người Việt. Lĩnh vực kinh doanh: laptop, PC, linh kiện, thiết bị ngoại vi, giải pháp doanh nghiệp. Đối tác chiến lược: ASUS, Dell, HP, Lenovo, Apple, MSI, Samsung, Acer.',
  'company',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Lịch sử phát triển Phong Vũ',
  '1997: Thành lập cửa hàng đầu tiên tại TP.HCM. 2005: Mở rộng ra Hà Nội. 2010: Phát triển kênh bán hàng online. 2018: Nhận đầu tư từ Teko (Vingroup). 2019: Ra mắt mô hình cửa hàng trải nghiệm. 2020: Đẩy mạnh bán hàng trực tuyến during đại dịch. 2022: Hơn 30 cửa hàng trên toàn quốc. 2023: Ra mắt dịch vụ giải pháp doanh nghiệp. 2024: Hợp tác chiến lược với các hãng lớn.',
  'company',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 2. Warranty Policies
-- ============================================================
INSERT INTO documents (title, content, category, metadata, source_url) VALUES
(
  'Chính sách bảo hành chung',
  'Bảo hành áp dụng cho sản phẩm mua tại Phong Vũ. Điều kiện: còn trong thời hạn bảo hành, lỗi do nhà sản xuất, có hóa đơn mua hàng. Không bảo hành: hư hỏng do người dùng (rơi vỡ, nước, cháy nổ), sản phẩm đã sửa chữa tại nơi khác, hao mòn tự nhiên (pin, bàn phím). Quy trình: mang sản phẩm đến cửa hàng hoặc gửi qua dịch vụ. Thời gian xử lý: 3-7 ngày làm việc.',
  'warranty',
  '{"brand": "general"}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Bảo hành ASUS',
  'Bảo hành chính hãng ASUS tại Việt Nam 24 tháng kể từ ngày mua. Bao gồm lỗi phần cứng do nhà sản xuất. Không bao gồm hư hại vật lý, hư hỏng do chất lỏng, hoặc sửa chữa trái phép. Trung tâm bảo hành: Hà Nội, TP.HCM, Đà Nẵng. Hotline: 1800 599 913.',
  'warranty',
  '{"brand": "ASUS", "duration_months": 24}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Bảo hành Dell',
  'Bảo hành Dell ProSupport 12 tháng tại Việt Nam. Hỗ trợ kỹ thuật 24/7 qua điện thoại. Dịch vụ sửa chữa tại chỗ hoặc gửi máy về trung tâm. Không bảo hành màn hình vỡ hoặc hư hỏng vật lý. Gia hạn lên 36 tháng với phí bổ sung. Hotline: 1800 599 804.',
  'warranty',
  '{"brand": "Dell", "duration_months": 12}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Bảo hành Apple',
  'Bảo hành Apple Care 12 tháng tiêu chuẩn. Hỗ trợ qua Apple Store và AASP (Apple Authorized Service Provider). Nâng cấp lên AppleCare+ 36 tháng bao gồm vô ý làm hỏng (phí sửa chữa áp dụng). Không bảo hành pin đã hao mòn dưới 80% dung lượng sau 1 năm. Trung tâm: FPT Service, Viettel Store.',
  'warranty',
  '{"brand": "Apple", "duration_months": 12}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Bảo hành HP',
  'Bảo hành HP Standard 12 tháng. Dịch vụ mang máy đến trung tâm dịch vụ. Hỗ trợ kỹ thuật miễn phí trong thời gian bảo hành. Có thể gia hạn lên 24-36 tháng với HP Care Pack. Không bảo hành pin, vỏ máy hư hỏng do tác động bên ngoài. Hotline: 1800 599 972.',
  'warranty',
  '{"brand": "HP", "duration_months": 12}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Bảo hành Lenovo',
  'Bảo hành Lenovo Depot 24 tháng. Gửi máy về depot sửa chữa trong 5-7 ngày làm việc. Bảo hành bao gồm lỗi kỹ thuật, lỗi phần cứng. Không bảo hành màn hình bị pixel chết dưới 5 điểm. ThinkPad có tùy chọn On-Site 3 năm. Hotline: 1800 588 867.',
  'warranty',
  '{"brand": "Lenovo", "duration_months": 24}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Bảo hành MSI',
  'Bảo hành MSI Gaming 24 tháng. Hỗ trợ ưu tiên cho dòng gaming. Card đồ họa NVIDIA tích hợp được bảo hành theo nhà sản xuất GPU. Dịch vụ mang máy đến trung tâm. Không bảo hành màn hình quá nhiệt do overclock. Hotline: 1800 599 977.',
  'warranty',
  '{"brand": "MSI", "duration_months": 24}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Bảo hành Samsung',
  'Bảo hành Samsung 12 tháng toàn quốc. Trung tâm bảo hành trên toàn quốc với 200+ điểm dịch vụ. Màn hình OLED được bảo hành riêng 6 tháng cho lỗi burn-in. Không bảo hành hư hỏng do nước, rơi vỡ. Hotline: 1800 588 889.',
  'warranty',
  '{"brand": "Samsung", "duration_months": 12}',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 3. Payment Policies
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Hình thức thanh toán',
  'Phong Vũ chấp nhận các hình thức thanh toán: 1) Tiền mặt khi nhận hàng (COD). 2) Chuyển khoản ngân hàng. 3) Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB). 4) Ví điện tử (MoMo, ZaloPay, VNPay, ShopeePay). 5) Trả góp qua thẻ tín dụng (0% lãi suất 6-12 tháng). 6) Trả góp qua công ty tài chính (Home Credit, FE Credit). Giá niêm yết đã bao gồm VAT. Hóa đơn điện tử được gửi qua email.',
  'payment',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Chính sách bảo mật thanh toán',
  'Phong Vũ không lưu trữ thông tin thẻ tín dụng của khách hàng. Thanh toán được xử lý qua cổng thanh toán an toàn (VNPay, Stripe). Dữ liệu thanh toán được mã hóa SSL/TLS. Khách hàng không chia sẻ mã OTP cho bất kỳ ai. Phong Vũ không yêu cầu khách hàng cung cấp mật khẩu ngân hàng qua điện thoại.',
  'payment',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 4. Delivery Policies
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Chính sách giao hàng',
  'Giao hàng miễn phí trong bán kính 20km từ cửa hàng cho đơn hàng trên 500.000đ. Giao hàng toàn quốc: 2-5 ngày làm việc (đơn hàng nội thành TP.HCM, Hà Nội: 1-2 ngày). Phí giao hàng: tính theo khoảng cách và trọng lượng. Hỗ trợ kỹ thuật tận nơi miễn phí cho đơn hàng trên 5 triệu (lắp đặt, cài đặt). Kiểm tra hàng trước khi thanh toán (COD). Đổi trả trong 7 ngày nếu lỗi nhà sản xuất.',
  'delivery',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Dịch vụ giao hàng và hỗ trợ kỹ thuật tận nơi',
  'Áp dụng cho sản phẩm ICT (laptop, PC, linh kiện): miễn phí giao hàng + lắp đặt trong 20km. Tivi, thiết bị gia dụng: phí lắp đặt riêng. Hỗ trợ cài đặt Windows, driver, phần mềm cơ bản. Thời gian hỗ trợ: 8h-20h hàng ngày. Đặt lịch hẹn trước 24h. Khu vực hỗ trợ: TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ.',
  'delivery',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 5. Return & Exchange Policies
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Chính sách đổi trả và hoàn tiền',
  'Đổi trả trong 7 ngày kể từ ngày mua. Điều kiện: sản phẩm lỗi do nhà sản xuất, còn nguyên hộp, phụ kiện đầy đủ. Không đổi trả: sản phẩm đã qua sử dụng, hư hỏng do người dùng, phần mềm đã kích hoạt. Hoàn tiền: trong 3-5 ngày làm việc (chuyển khoản) hoặc ngay (tiền mặt tại cửa hàng). Sản phẩm Apple: đổi mới 1-1 nếu lỗi trong 30 ngày đầu.',
  'policy',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Chính sách khui hộp sản phẩm Apple',
  'Bắt buộc khui hộp tại cửa hàng khi mua sản phẩm Apple. Kiểm tra ngoại quan ngay tại chỗ. Kích hoạt thiết bị trước khi rời cửa hàng. Nếu phát hiện lỗi ngoại quan, đổi mới ngay. Không hỗ trợ đổi trả nếu đã rời cửa hàng mà không khui hộp. Áp dụng cho: iPhone, iPad, MacBook, Apple Watch, AirPods.',
  'policy',
  '{"brand": "Apple"}',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 6. Services
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Dịch vụ lắp đặt và nâng cấp PC, laptop',
  'Nâng cấp RAM: 50.000đ/lần. Nâng cấp SSD: 80.000đ/lần (bao gồm clone dữ liệu). Cài đặt Windows: 100.000đ. Cài đặt phần mềm Office: 50.000đ. Lắp ráp PC hoàn chỉnh: 200.000đ. Vệ sinh laptop: 150.000đ (bảo dưỡng quạt, thay keo tản nhiệt). Ép xung GPU/CPU: 300.000đ (có bảo hành). Dịch vụ thực hiện tại showroom, thời gian 30-120 phút tùy loại.',
  'service',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 7. Legal & Trading Terms
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Điều khoản giao dịch chung',
  'Áp dụng cho mọi giao dịch tại Phong Vũ (trực tuyến và tại cửa hàng). Giá niêm yết là giá cuối cùng (đã bao gồm VAT). Đơn hàng được xác nhận qua email/SMS. Phong Vũ có quyền từ chối đơn hàng nếu phát hiện lỗi giá hoặc hết hàng. Khách hàng chịu trách nhiệm cung cấp thông tin chính xác. Mọi tranh chấp được giải quyết theo pháp luật Việt Nam.',
  'legal',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Chính sách bảo vệ dữ liệu cá nhân',
  'Phong Vũ thu thập: họ tên, email, số điện thoại, địa chỉ giao hàng. Mục đích: xử lý đơn hàng, chăm sóc khách hàng, gửi thông tin khuyến mãi (nếu đồng ý). Dữ liệu được lưu trữ an toàn, không chia sẻ cho bên thứ ba trừ đối tác giao hàng. Khách hàng có quyền yêu cầu xóa dữ liệu. Liên hệ: privacy@phongvu.vn.',
  'legal',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 8. FAQ / How-to
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Hướng dẫn mua hàng online',
  'Cách 1: Gọi hotline 1800 588 867 để đặt hàng. Cách 2: Chat với nhân viên tư vấn trên website. Cách 3: Đặt hàng trực tiếp trên website phongvu.vn — chọn sản phẩm, thêm vào giỏ, điền thông tin, chọn phương thức thanh toán, xác nhận đơn. Đơn hàng được xác nhận qua email trong 15 phút. Theo dõi đơn hàng tại mục "Đơn hàng của tôi".',
  'faq',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Cảnh báo giả mạo nhân viên giao hàng',
  'Cảnh giác với cuộc gọi/tin nhắn tự xưng nhân viên Phong Vũ yêu cầu chuyển tiền hoặc cung cấp OTP. Nhân viên giao hàng thật: mặc đồng phục, có thẻ nhân viên, không yêu cầu chuyển khoản trước. Nếu nghi ngờ, gọi hotline 1800 588 867 để xác nhận. Không click vào link lạ từ SMS/email tự xưng Phong Vũ.',
  'faq',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 9. Promotions (current)
-- ============================================================
INSERT INTO documents (title, content, category, metadata, source_url) VALUES
(
  'Khuyến mãi: Mùa Hè Công Nghệ 2025',
  'Giảm giá 10% toàn bộ laptop ASUS và Lenovo. Áp dụng khi mua trực tiếp tại cửa hàng hoặc đặt hàng trực tuyến. Thời gian: 01/06/2025 - 31/08/2025. Không áp dụng đồng thời với ưu đãi khác.',
  'faq',
  '{"type": "promotion", "discount": 10, "brands": ["ASUS", "Lenovo"]}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Khuyến mãi: Back to School 2025',
  'Giảm 5% cho học sinh, sinh viên khi xuất trình thẻ học sinh hoặc bằng chứng nhập học. Áp dụng cho tất cả laptop dưới 20 triệu VND. Thời gian: 15/07/2025 - 15/09/2025.',
  'faq',
  '{"type": "promotion", "discount": 5}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Khuyến mãi: Flash Sale Cuối Tuần',
  'Giảm 15% tất cả laptop Dell trong cuối tuần. Số lượng có hạn, áp dụng cho 50 máy đầu tiên mỗi ngày. Không áp dụng cho Dell XPS. Thời gian: áp dụng mỗi cuối tuần.',
  'faq',
  '{"type": "promotion", "discount": 15, "brands": ["Dell"]}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Khuyến mãi: Apple Education Pricing',
  'Chương trình giá giáo dục Apple - Giảm 8% cho sinh viên và nhà giáo trên toàn bộ dòng MacBook. Xuất trình email giáo dục .edu hoặc thẻ sinh viên. Thời gian: 01/06/2025 - 31/12/2025.',
  'faq',
  '{"type": "promotion", "discount": 8, "brands": ["Apple"]}',
  'https://help.phongvu.vn/llms-full.txt'
),
(
  'Khuyến mãi: Gaming Fest Phong Vũ x MSI',
  'Mua MSI Titan GT77 tặng kèm chuột gaming MSI Clutch GM41 trị giá 1.500.000đ và túi laptop cao cấp. Số lượng quà có hạn. Thời gian: 01/07/2025 - 31/07/2025.',
  'faq',
  '{"type": "promotion", "discount": 0, "brands": ["MSI"], "gift": true}',
  'https://help.phongvu.vn/llms-full.txt'
);

-- ============================================================
-- 10. Complaint Resolution
-- ============================================================
INSERT INTO documents (title, content, category, source_url) VALUES
(
  'Chính sách giải quyết khiếu nại',
  'Bước 1: Liên hệ hotline 1800 588 867 hoặc chat trực tuyến. Bước 2: Gửi khiếu nại qua email: hotro@phongvu.vn (đính kèm hình ảnh, hóa đơn). Bước 3: Phong Vũ phản hồi trong 48h làm việc. Nếu không hài lòng, yêu cầu gặp quản lý cấp cao. Mọi khiếu nại được ghi nhận và xử lý theo quy trình nội bộ.',
  'policy',
  'https://help.phongvu.vn/llms-full.txt'
);
