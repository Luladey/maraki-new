import { BOOK_HREF, LOGO_SRC } from '@/lib/site';

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12"
      >
        <a href="#top" className="flex items-center gap-2.5" aria-label="Maraki Solutions, back to top">
          <img src={LOGO_SRC} alt="" width={34} height={28} className="h-7 w-auto" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/90">
            Maraki
            <span className="hidden text-cyan sm:inline"> Solutions</span>
          </span>
        </a>
        <div className="flex items-center gap-6 text-[13px] font-medium text-white/70">
          <a href="#process" className="hidden hover:text-white md:inline">
            Process
          </a>
          <a href="#clients" className="hidden hover:text-white md:inline">
            Clients
          </a>
          <a
            href={BOOK_HREF}
            className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-2 text-white backdrop-blur-md transition-colors hover:border-cyan hover:text-cyan"
          >
            Free consultation
          </a>
        </div>
      </nav>
    </header>
  );
}
