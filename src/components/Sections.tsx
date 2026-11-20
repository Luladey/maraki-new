import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import { BOOK_HREF, BUSINESS_TYPES, CLIENTS, EMAIL, LOGO_SRC, STEPS } from '@/lib/site';

/** Fades children in as they enter the viewport. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -12% 0px' },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Process() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="process" className="relative bg-ink-2 px-4 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-14 grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="section-title">
              From first call
              <br />
              <span className="italic text-cyan">to launch.</span>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-7 text-mute md:justify-self-end">
            The process is comfortable and straightforward. You stay in the loop, and we take care of the details.
          </p>
        </div>

        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-8">
          <span aria-hidden="true" className="steps-line" />
          {STEPS.map((step, i) => (
            <li key={step.title} className="reveal relative pl-14 md:pl-0 md:pt-16" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="step-dot">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mb-3 font-serif text-2xl tracking-[-0.02em] text-white">{step.title}</h3>
              <p className="text-[14px] leading-6 text-mute">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Clients() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="clients" className="relative overflow-hidden bg-ink px-4 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="reveal">
          <p className="eyebrow">Real client sites</p>
          <h2 className="section-title max-w-2xl">
            Local businesses,
            <br />
            <span className="italic text-cyan">booked solid.</span>
          </h2>
        </div>

        <ul className="mt-12 border-t border-white/10">
          {CLIENTS.map((c, i) => (
            <li key={c.url} className="reveal" style={{ transitionDelay: `${i * 50}ms` }}>
              <a
                href={`https://${c.url}`}
                target="_blank"
                rel="noreferrer"
                className="client-row group flex items-center justify-between gap-4 border-b border-white/10 py-5 sm:py-6"
              >
                <span className="font-serif text-[clamp(1.4rem,4vw,2.4rem)] leading-tight tracking-[-0.02em] text-white transition-colors group-hover:text-cyan">
                  {c.name}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[13px] text-mute">
                  <span className="hidden sm:inline">{c.url}</span>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="reveal mt-14">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-mute">Built for local businesses like</p>
          <ul className="flex flex-wrap gap-2" aria-label="Types of local businesses we serve">
            {BUSINESS_TYPES.map((b) => (
              <li key={b} className="rounded-full border border-cyan/60 bg-white/[0.02] px-4 py-2 text-[13px] text-white/85">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  const ref = useReveal<HTMLElement>();
  const year = new Date().getFullYear();
  return (
    <section ref={ref} id="contact" className="closing relative overflow-hidden px-4 pt-28 sm:px-8 md:pt-36">
      <div className="reveal relative mx-auto max-w-3xl text-center">
        <img src={LOGO_SRC} alt="" width={84} height={70} className="mx-auto mb-8 h-16 w-auto drop-shadow-[0_0_30px_rgba(20,189,219,.35)]" />
        <h2 className="section-title">
          Ready to be found,
          <br />
          <span className="italic text-cyan">chosen and booked?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-[16px] leading-7 text-white/70">
          Start with a free 1:1 review of your website and online presence. No obligation — just a clear plan.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={BOOK_HREF} className="btn-primary">
            Book a free consultation <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
          <a href={`mailto:${EMAIL}`} className="btn-ghost">
            <Mail aria-hidden="true" className="h-4 w-4" /> {EMAIL}
          </a>
        </div>
      </div>

      <footer className="relative mx-auto mt-28 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 py-8 text-[12px] text-white/45 sm:flex-row">
        <p>&copy; {year} Maraki Solutions. All rights reserved.</p>
        <p>Websites · Local SEO · AI receptionists</p>
      </footer>
    </section>
  );
}
