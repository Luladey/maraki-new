import { BOOK_HREF, LOGO_SRC } from '@/lib/site';

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <nav aria-label="Main" className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <a href="#top" className="flex items-center gap-3" aria-label="Maraki Solutions, back to top">
          <img src={LOGO_SRC} alt="" width={36} height={29} className="h-8 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-[0.3em] text-white">MARAKI</span>
            <span className="mt-1 text-[8px] font-medium tracking-[0.5em] text-[#f2a65a]">SOLUTIONS</span>
          </span>
        </a>
        <div className="flex items-center gap-7 text-[14px] text-white/75">
          <a href="#services" className="hidden hover:text-white md:inline">Services</a>
          <a href="#work" className="hidden hover:text-white md:inline">Work</a>
          <a href="#process" className="hidden hover:text-white md:inline">Process</a>
          <a href={BOOK_HREF} className="rounded-full border border-[#f28c28] bg-black/30 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-[#f28c28] hover:text-[#1a1006]">
            Contact us
          </a>
        </div>
      </nav>
    </header>
  );
}
