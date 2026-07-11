export default function HomeFooter() {
  return (
    <footer className="bg-surface-container-lowest w-full mt-stack-lg border-t border-outline-variant">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter px-margin-edge py-stack-lg max-w-container-max mx-auto">
        <div>
          <span className="text-xl font-bold text-primary">Phong Vu</span>
          <p className="mt-3 text-body-sm text-on-surface-variant">
            © 2024 Phong Vu Computer. High-Tech Hardware Solutions.
          </p>
        </div>

        <div>
          <h3 className="font-title-md text-title-md text-primary font-bold mb-4">
            Về Phong Vũ
          </h3>
          <ul className="space-y-2">
            {['Về Chúng Tôi', 'Tuyển Dụng', 'Hệ Thống Cửa Hàng'].map(
              (label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-title-md text-title-md text-primary font-bold mb-4">
            Chính sách
          </h3>
          <ul className="space-y-2">
            {['Chính Sách Bảo Hành', 'Chính Sách Bảo Mật', 'Đổi Trả'].map(
              (label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-title-md text-title-md text-primary font-bold mb-4">
            Liên hệ
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                call
              </span>
              <span className="text-body-sm text-on-surface-variant">
                18006867
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                mail
              </span>
              <span className="text-body-sm text-on-surface-variant">
                cskh@phongvu.vn
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
