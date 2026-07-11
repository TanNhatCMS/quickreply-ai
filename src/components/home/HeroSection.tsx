export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter h-auto md:h-[400px]">
      <div className="md:col-span-3 bg-gradient-to-br from-primary-container to-secondary rounded-xl overflow-hidden relative shadow-sm p-8 flex flex-col justify-center">
        <div className="z-10 text-white max-w-[32rem] space-y-4">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold uppercase tracking-wider">
            Khuyến Mãi Độc Quyền
          </span>
          <h1 className="font-headline-xl text-headline-xl text-white drop-shadow-sm font-bold leading-[1.15] tracking-tight">
            Thế Hệ AI<br />Sức Mạnh Mới
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 leading-relaxed">
            Khám phá dải sản phẩm laptop AI thế hệ mới với hiệu năng vượt trội, tối ưu cho mọi tác vụ công việc và giải trí.
          </p>
          <button className="mt-4 bg-white text-primary font-semibold py-3 px-8 rounded-full hover:bg-surface-blue transition-colors w-fit">
            Mua Ngay
          </button>
        </div>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.4) 0%, transparent 40%)' }} />
      </div>

      <div className="flex flex-col gap-gutter">
        <button className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-4 flex flex-col justify-center items-center text-center group cursor-pointer hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-4xl text-promo-orange mb-2 group-hover:scale-110 transition-transform">
            flash_on
          </span>
          <h3 className="font-title-md text-title-md text-on-surface">
            Flash Sale
          </h3>
          <p className="font-label-spec text-label-spec text-error mt-1">
            Giảm đến 50%
          </p>
        </button>
        <button className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-4 flex flex-col justify-center items-center text-center group cursor-pointer hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-4xl text-primary mb-2 group-hover:scale-110 transition-transform">
            school
          </span>
          <h3 className="font-title-md text-title-md text-on-surface">
            Tựu Trường
          </h3>
          <p className="font-label-spec text-label-spec text-primary-container mt-1">
            Ưu đãi sinh viên
          </p>
        </button>
      </div>
    </section>
  )
}
