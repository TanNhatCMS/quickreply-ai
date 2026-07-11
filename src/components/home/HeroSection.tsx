export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-[var(--spacing-gutter)] h-auto md:h-[400px]">
      <div className="bg-gradient-to-br from-primary-container to-secondary rounded-xl p-8 flex flex-col justify-center relative overflow-hidden md:col-span-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold uppercase tracking-wider text-white w-fit mb-4">
          Khuyến Mãi Độc Quyền
        </span>
        <h1 className="font-[family-name:var(--font-headline-xl)] text-[length:var(--text-headline-xl)] font-bold text-white whitespace-pre-line">
          {'Thế Hệ AI\nSức Mạnh Mới'}
        </h1>
        <p className="mt-3 text-white/90 max-w-md">
          Khám phá bộ sưuaptop AI mới nhất với hiệu suất đỉnh cao, ưu đãi hấp
          dẫn dành riêng cho bạn.
        </p>
        <button className="mt-4 bg-white text-primary font-semibold py-3 px-8 rounded-full hover:bg-surface-blue transition-colors w-fit">
          Mua Ngay
        </button>
      </div>

      <div className="flex flex-col gap-[var(--spacing-gutter)] md:col-span-1">
        <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-4 flex flex-col justify-center items-center text-center group cursor-pointer hover:shadow-md">
          <span className="material-symbols-outlined text-4xl text-promo-orange mb-2">
            flash_on
          </span>
          <p className="font-semibold text-on-surface">Flash Sale</p>
          <p className="text-sm text-error font-bold mt-1">Giảm đến 50%</p>
        </div>
        <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-4 flex flex-col justify-center items-center text-center group cursor-pointer hover:shadow-md">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">
            school
          </span>
          <p className="font-semibold text-on-surface">Tựu Trường</p>
          <p className="text-sm text-primary-container font-bold mt-1">
            Ưu đãi sinh viên
          </p>
        </div>
      </div>
    </section>
  )
}
