import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Mail, MapPin, MonitorSmartphone, PhoneCall, Search, Lightbulb, Layers, TrendingUp } from 'lucide-react';
import { BOOK_HREF, EMAIL, LOGO_SRC, PROJECTS, SERVICES, STEPS, img } from '@/lib/site';

/** Fades `.reveal` children in as they enter the viewport. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    root.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

const SERVICE_ICONS = [MonitorSmartphone, MapPin, PhoneCall];
const STEP_ICONS = [Search, Lightbulb, Layers, TrendingUp];

export function Services() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="services" className="cream relative px-4 py-24 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-12 text-center">
          <p className="eyebrow-dark">Our services</p>
          <h2 className="section-title mx-auto max-w-3xl">Everything you need to get found, chosen and <em>booked.</em></h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <article key={s.title} className="reveal card p-7" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-[#f6e3cc] text-[#9a4f0a]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="font-serif text-[26px] leading-tight">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5c4d3f]">{s.body}</p>
                <ul className="mt-5 grid gap-2 text-[14px] text-[#3c3128]">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-[#e07a12]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Work() {
  const ref = useReveal<HTMLElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // On phones the grid becomes a swipeable carousel; track which card is centred.
  const onScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    const cards = [...t.children] as HTMLElement[];
    const mid = t.scrollLeft + t.clientWidth / 2;
    let best = 0;
    cards.forEach((c, i) => {
      if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i;
    });
    setActive(best);
  };
  const go = (i: number) => {
    const t = trackRef.current;
    const c = t?.children[i] as HTMLElement | undefined;
    if (t && c) t.scrollTo({ left: c.offsetLeft - (t.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  };

  return (
    <section ref={ref} id="work" className="cream-2 relative overflow-hidden px-4 py-24 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-10">
          <p className="eyebrow-dark">Our work</p>
          <h2 className="section-title">Real local businesses, <em>live online.</em></h2>
        </div>
        <div
          ref={trackRef}
          onScroll={onScroll}
          role="region"
          aria-label="Client projects"
          className="carousel -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {PROJECTS.map((p, i) => (
            <a
              key={p.url}
              href={`https://${p.url}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`${p.name}, ${i + 1} of ${PROJECTS.length}`}
              className="reveal card project group block w-[84%] shrink-0 snap-center overflow-hidden sm:w-auto"
              style={{ transitionDelay: `${(i % 2) * 90}ms` }}
            >
              <div className="overflow-hidden bg-[#efe8de]">
                <img src={img(p.image)} alt={`${p.name} website on laptop and phone`} loading="lazy" className="aspect-[1080/700] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
              <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div>
                  <h3 className="font-serif text-[22px] leading-tight">{p.name}</h3>
                  <p className="mt-1 text-[14px] text-[#5c4d3f]">{p.kind}</p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a5a2b]">{p.tags.join(' · ')}</p>
                </div>
                <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e4dccf] text-[#9a4f0a] transition-colors group-hover:border-[#e07a12] group-hover:bg-[#e07a12] group-hover:text-white">
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Visit {p.url} (opens in a new tab)</span>
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-1 sm:hidden">
          {PROJECTS.map((p, i) => (
            <button
              key={p.url}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${p.name}`}
              aria-current={active === i}
              className="grid h-11 min-w-11 place-items-center px-1"
            >
              <span className="dot" aria-current={active === i} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="process" className="cream relative overflow-hidden px-4 py-24 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-14">
          <p className="eyebrow-dark">Our process</p>
          <h2 className="section-title">A simple, <em>proven</em> process.</h2>
        </div>
        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden="true" className="steps-line" />
          {STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <li key={s.title} className="reveal relative pl-16 md:pl-0 md:pt-20 md:text-center" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="step-dot"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                <h3 className="font-serif text-[22px]">{i + 1}. {s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5c4d3f]">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Closing() {
  const ref = useReveal<HTMLElement>();
  const year = new Date().getFullYear();
  return (
    <section ref={ref} id="contact" className="closing relative overflow-hidden text-white">
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-8 md:pt-32">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div className="reveal">
            <div className="agency-shot relative">
              <span aria-hidden="true" className="agency-glow" />
              <img
                src={img('agency-laptop.webp')}
                alt="A client website designed by Maraki Solutions, shown on a laptop"
                width={725}
                height={613}
                loading="lazy"
                className="relative w-full"
              />
            </div>
          </div>
          <div className="reveal">
            <h2 className="section-title">Ready to be found, chosen <em>and booked?</em></h2>
            <p className="mt-5 text-[16px] leading-7 text-white/75">Start with a free 1:1 review of your website and online presence. No obligation, just a clear plan.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={BOOK_HREF} className="btn-primary">Book a free consultation <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
              <a href={`mailto:${EMAIL}`} className="btn-ghost"><Mail aria-hidden="true" className="h-4 w-4" /> {EMAIL}</a>
            </div>
          </div>
        </div>
        <footer className="mt-28 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[12px] text-white/55 sm:flex-row">
          <span className="flex items-center gap-2.5">
            <img src={LOGO_SRC} alt="" className="h-6 w-auto" />
            &copy; {year} Maraki Solutions
          </span>
          <span>Websites · Local SEO · AI receptionists</span>
        </footer>
      </div>
    </section>
  );
}
