import { useEffect, useState } from 'react';
import { BOOK_HREF, LOGO_SRC } from '@/lib/site';

export default function Nav() {
  // Solid backdrop once the page scrolls, so the bar stays readable over cream sections.
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? 'nav-solid' : ''}`}>
      <nav aria-label="Main" className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-2.5 sm:px-8 lg:px-12">
        <a href="#top" className="flex min-h-11 items-center gap-3" aria-label="Maraki Solutions, back to top">
          <img src={LOGO_SRC} alt="" width={36} height={29} className="h-8 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-[0.3em] text-white">MARAKI</span>
            <span className="mt-1 text-[8px] font-medium tracking-[0.5em] text-[#f2a65a]">SOLUTIONS</span>
          </span>
        </a>
        <div className="flex items-center gap-2 text-[14px] text-white/80 md:gap-3">
          <a href="#services" className="hidden min-h-11 items-center px-2 hover:text-white md:inline-flex">Services</a>
          <a href="#work" className="hidden min-h-11 items-center px-2 hover:text-white md:inline-flex">Work</a>
          <a href="#process" className="hidden min-h-11 items-center px-2 hover:text-white md:inline-flex">Process</a>
          <a href={BOOK_HREF} className="ml-2 inline-flex min-h-11 items-center rounded-full border border-[#f28c28] bg-black/30 px-5 text-white backdrop-blur-md transition-colors hover:bg-[#f28c28] hover:text-[#1a1006]">
            Contact us
          </a>
        </div>
      </nav>
    </header>
  );
}
