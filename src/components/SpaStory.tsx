import { useLayoutEffect, useMemo, useRef } from 'react';
import { ArrowRight, CalendarCheck, MapPin, Phone, Search } from 'lucide-react';
import { Timeline, clamp, show, span, warp, type Ctx } from '@/lib/scroll';
import { BOOK_HREF, LOGO_SRC, img } from '@/lib/site';

/** Scroll length of the story, in screens. */
const SCREENS = 4.2;
/**
 * Scroll position (in screens) → story time (keyframe units). Holds are short
 * and the old mobile step is folded into a quick glide, so the whole story
 * takes about four screens of scrolling.
 */
const toStory = warp([
  [0, 0],
  [0.22, 0.5], // opening: brief hold
  [0.45, 1.0], // screen wakes straight into the grid
  [1.25, 2.25], // the design builds itself
  [1.5, 3.1], // phone glides in
  [2.3, 4.3], // local search
  [3.1, 5.5], // booking
  [3.9, 6.6], // AI receptionist
  [4.2, 7.0], // finale
]);

const CHAPTERS = [
  { label: 'Design', at: 0.85 },
  { label: 'Found', at: 3.15 },
  { label: 'Booked', at: 4.35 },
  { label: 'Answered', at: 5.55 },
];

function Lotus({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M12 14C9 11 9 6 12 2c3 4 3 9 0 12Z" />
      <path d="M12 14C8 13 5 10 4 6c4 0 7 3 8 8Z" />
      <path d="M12 14c4-1 7-4 8-8-4 0-7 3-8 8Z" />
      <path d="M3 14h18" />
    </svg>
  );
}

function Stars() {
  return <span className="tracking-[0.12em]">★★★★★</span>;
}

export default function SpaStory() {
  const tl = useMemo(() => new Timeline(), []);
  const k = tl.keys;
  const f = tl.fn;
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const story = storyRef.current!;
    const stage = stageRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx: Ctx = { P: 0, raw: 0, mobile: false, reduce };
    let pos = 0; // smoothed scroll position, in screens
    let last = performance.now();
    let target = 0;
    let raf = 0;

    const layout = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      // stacked (portrait phones/tablets) vs side-by-side (desktop, landscape)
      ctx.mobile = w < 900 && h >= w * 0.9;
      stage.dataset.layout = ctx.mobile ? 'stack' : 'side';
      let kk: number;
      let rx: number;
      let ry: number;
      if (!ctx.mobile) {
        const areaL = w * 0.4;
        const areaW = w * 0.5;
        kk = Math.min(areaW / 820, (h * 0.78) / 560);
        rx = areaL + (areaW - 820 * kk) / 2;
        ry = (h - 560 * kk) / 2 + h * 0.03;
      } else {
        // phones: size the rig to the laptop and let the rest overflow
        // text sits on top; the devices fill the space underneath. The phone
        // grows upward by up to 140 design px when it takes centre stage.
        const top = h * 0.43;
        kk = Math.min(w / 700, (h - top - 12) / 700);
        rx = w / 2 - 340 * kk;
        ry = top + 140 * kk + Math.max(0, (h - top - 700 * kk) / 2);
      }
      stage.style.setProperty('--k', String(kk));
      stage.style.setProperty('--rx', `${rx}px`);
      stage.style.setProperty('--ry', `${ry}px`);
    };

    const read = () => {
      const rect = story.getBoundingClientRect();
      const total = story.offsetHeight - window.innerHeight;
      target = clamp(-rect.top / Math.max(total, 1)) * SCREENS;
    };

    const frame = (now: number) => {
      read();
      // frame-rate independent easing toward the scroll position (same feel at 60 or 120 Hz)
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      pos = reduce ? target : pos + (target - pos) * (1 - Math.exp(-dt * 7.5));
      if (Math.abs(target - pos) < 0.0003) pos = target;
      ctx.raw = pos / SCREENS;
      ctx.P = toStory(pos);
      const rect = story.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) tl.apply(ctx);
      raf = requestAnimationFrame(frame);
    };

    layout();
    read();
    pos = target;
    ctx.raw = pos / SCREENS;
    ctx.P = toStory(pos);
    tl.apply(ctx);
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(layout);
    ro.observe(stage);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tl]);

  /* ---------- device motion (depends on screen size) ---------- */
  const laptopFn = f((el, { P, mobile }) => {
    const dim = span(P, 3.1, 3.4) - span(P, 6.55, 6.85);
    const away = span(P, 5.45, 5.6) - span(P, 6.55, 6.85);
    const o = mobile ? 1 - dim : 1 - dim * 0.72 - away * 0.28;
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate3d(${(-dim * 30).toFixed(1)}px, 0, 0) scale(${(1 - dim * 0.08).toFixed(4)})`;
  });
  const phoneFn = f((el, { P, mobile }) => {
    const enter = span(P, 2.35, 2.8);
    const focus = span(P, 3.1, 3.45) - span(P, 6.55, 6.85);
    const dx = (1 - enter) * 260 + (mobile ? -150 * enter - 218 * focus : -380 * focus);
    const dy = focus * (mobile ? -140 : -6);
    const s = 1 + focus * (mobile ? 0.75 : 0.32);
    el.style.opacity = enter.toFixed(3);
    el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
  });
  const typing = f((el, { P }) => {
    const q = 'spa near me';
    const n = Math.round(clamp((P - 3.4) / 0.3) * q.length);
    el.textContent = q.slice(0, n);
  });
  const checkDraw = f((el, { P }) => {
    el.style.strokeDashoffset = String(40 * (1 - span(P, 5.3, 5.45)));
  });
  const railFn = f((el, { P, raw }) => {
    el.style.setProperty('--p', String(clamp(raw / 0.95)));
    el.querySelectorAll<HTMLElement>('[data-at]').forEach((li, i) => {
      const at = Number(li.dataset.at);
      const next = CHAPTERS[i + 1]?.at ?? 6.6;
      li.dataset.active = P >= at - 0.05 && P < next - 0.05 ? 'true' : 'false';
    });
  });
  const parallax = (depth: number, spin = 0) =>
    f((el, { P, reduce }) => {
      if (reduce) return;
      el.style.transform = `translate3d(0, ${(-P * 34 * depth).toFixed(1)}px, 0) rotate(${(P * spin).toFixed(2)}deg)`;
    });

  const panel = (a: number, b?: number) => k(show(a, b, { y: [22, 0] }, 0.1));

  return (
    <section ref={storyRef} aria-label="How Maraki takes a spa from blank screen to booked" className="relative" style={{ height: `${(SCREENS + 1) * 100}vh` }}>
      <div ref={stageRef} data-layout="side" className="stage sticky top-0 h-[100svh] w-full overflow-hidden">
        <div aria-hidden="true" className="stage-glow absolute inset-0" />
        <div aria-hidden="true" ref={k([[5.45, 5.65, { o: [0, 1] }], [6.5, 6.7, { o: [1, 0] }]])} className="night absolute inset-0" />

        {/* parallax cut-outs */}
        <div
          aria-hidden="true"
          className="design-cursor"
          ref={k([
            [-1, -0.9, { o: [0, 1] }],
            [0.95, 1.45, { x: [0, -250], y: [0, 150] }],
            [1.45, 1.85, { x: [-250, -170], y: [150, 60] }],
            [1.85, 2.2, { x: [-170, -330], y: [60, 190] }],
            [2.35, 2.55, { o: [1, 0] }],
          ])}
        >
          <div className="design-cursor-inner">
            <svg viewBox="0 0 24 24" className="h-7 w-7"><path d="M4 2.5 20 11l-7.2 1.9L9.6 20Z" fill="#f28c28" stroke="#1a1006" strokeWidth="1.2" strokeLinejoin="round" /></svg>
            <span>Maraki</span>
          </div>
        </div>
        <img aria-hidden="true" alt="" src={img('cut-plumeria.webp')} ref={parallax(0.2, -6)} className="cut cut-plumeria" />
        <img aria-hidden="true" alt="" src={img('cut-candle.webp')} ref={parallax(0.15)} className="cut cut-candle" />

        {/* ---------------- device rig (820 × 560 design px) ---------------- */}
        <div aria-hidden="true" className="rig">
          <div className="ring" ref={k([[3.1, 3.4, { o: [1, 0.35] }], [6.55, 6.85, { o: [0.35, 1] }]])} />
          <div className="desk" />

          {/* laptop */}
          <div className="laptop" ref={laptopFn}>
            <div className="lap-bezel">
              <div className="lap-screen">
                <div className="layer bg-[#1a130e]" />
                <div className="layer grid-layer" ref={k([...show(0.6, 1.55, {}, 0.3)])} />
                {/* wireframe */}
                <div className="layer" ref={k([[1.6, 1.75, { o: [1, 0] }]])}>
                  <div className="wf" style={{ left: 24, top: 18, width: 568, height: 22 }} ref={k([[1.05, 1.15, { o: [0, 1], y: [12, 0] }]])} />
                  <div className="wf" style={{ left: 40, top: 110, width: 220, height: 30 }} ref={k([[1.12, 1.22, { o: [0, 1], y: [12, 0] }]])} />
                  <div className="wf" style={{ left: 40, top: 150, width: 180, height: 30 }} ref={k([[1.17, 1.27, { o: [0, 1], y: [12, 0] }]])} />
                  <div className="wf" style={{ left: 40, top: 200, width: 200, height: 10 }} ref={k([[1.22, 1.32, { o: [0, 1], y: [12, 0] }]])} />
                  <div className="wf" style={{ left: 40, top: 240, width: 130, height: 30, borderRadius: 99 }} ref={k([[1.27, 1.37, { o: [0, 1], y: [12, 0] }]])} />
                  <div className="wf" style={{ left: 300, top: 60, width: 292, height: 300 }} ref={k([[1.32, 1.45, { o: [0, 1], y: [12, 0] }]])} />
                </div>
                {/* colour + photo */}
                <div className="layer bg-[#2a1d14]" ref={k(show(1.45, undefined, {}, 0.2))} />
                <div className="layer" ref={k([[1.55, 1.85, { clipR: [100, 0] }], ...show(1.55, undefined, {}, 0.05)])}>
                  <img src={img('hero-desktop.webp')} alt="" className="h-full w-full object-cover" style={{ objectPosition: '70% 35%' }} />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,#1b120c_0%,rgba(27,18,12,.86)_34%,rgba(27,18,12,.1)_70%)]" />
                </div>
                {/* site chrome + copy */}
                <div className="site-nav" ref={k(show(1.75))}>
                  <span className="flex items-center gap-1.5 font-serif text-[13px] text-[#f2c48d]"><Lotus className="h-3.5 w-4" />Serenity Spa</span>
                  <span className="flex items-center gap-4 text-[9px] text-white/75">
                    <span>Treatments</span><span>About</span><span>Contact</span>
                    <span className="rounded-full bg-[#f2c48d] px-2.5 py-1 font-semibold text-[#1a1006]">Book now</span>
                  </span>
                </div>
                <div className="absolute left-[40px] top-[108px] w-[260px] text-white">
                  <p className="mb-2 text-[8px] font-semibold tracking-[0.3em] text-[#f2c48d]" ref={k(show(1.8))}>DAY SPA &amp; WELLNESS</p>
                  <p className="font-serif text-[38px] italic leading-[1.02]">
                    <span className="block" ref={k([[1.85, 2.0, { clipR: [100, 0] }]])}>Relax.</span>
                    <span className="block" ref={k([[1.92, 2.07, { clipR: [100, 0] }]])}>Renew.</span>
                    <span className="block" ref={k([[1.99, 2.14, { clipR: [100, 0] }]])}>Rebalance.</span>
                  </p>
                  <p className="mt-3 text-[10px] text-white/75" ref={k(show(2.05))}>Massage · Facial · Body treatments</p>
                  <span className="mt-4 inline-block rounded-full bg-[#f2c48d] px-4 py-2 text-[10px] font-semibold text-[#1a1006]" ref={k([[2.1, 2.22, { o: [0, 1], s: [0.6, 1] }]])}>
                    Book your appointment →
                  </span>
                </div>
                <div className="toast" ref={k(show(6.75, undefined, { y: [-12, 0] }))}>
                  <CalendarCheck className="h-3.5 w-3.5 text-[#f28c28]" /> New booking · Sat 10:00 AM
                </div>
                {/* screen off */}
                <div className="layer screen-off" ref={k([[0.55, 0.9, { o: [1, 0] }]])}>
                  <img src={LOGO_SRC} alt="" />
                  <span>Let’s build</span>
                </div>
              </div>
            </div>
            <div className="lap-base" />
          </div>

          {/* phone */}
          <div className="phone" ref={phoneFn}>
            <div className="phone-screen">
              {/* mobile site */}
              <div className="layer bg-[#2a1d14] text-white">
                <img src={img('hero-mobile.webp')} alt="" className="h-[58%] w-full object-cover" style={{ objectPosition: '50% 20%' }} />
                <div className="px-3.5 pt-3">
                  <span className="flex items-center gap-1 font-serif text-[9px] text-[#f2c48d]"><Lotus className="h-2.5 w-3" />Serenity Spa</span>
                  <p className="mt-1.5 font-serif text-[19px] italic leading-[1.05]">Relax. Renew. Rebalance.</p>
                  <span className="mt-2.5 inline-block rounded-full bg-[#f2c48d] px-3 py-1.5 text-[8px] font-semibold text-[#1a1006]">Book now</span>
                </div>
              </div>

              {/* search */}
              <div className="layer bg-[#faf7f2] text-[#1a1410]" ref={k(show(3.25, 4.32, {}, 0.12))}>
                <div className="px-2.5 pt-3">
                  <div className="flex h-7 items-center gap-1.5 rounded-full border border-[#ded5c8] bg-white px-2.5 text-[10px]">
                    <Search className="h-3 w-3 text-[#6b5a49]" />
                    <span ref={typing} />
                    <span className="caret" />
                  </div>
                </div>
                <div className="map">
                  <span className="pin-grey" style={{ left: 30, top: 34 }} ref={k(show(3.62, undefined, { s: [0.3, 1] }, 0.06))} />
                  <span className="pin-grey" style={{ left: 140, top: 90 }} ref={k(show(3.67, undefined, { s: [0.3, 1] }, 0.06))} />
                  <span className="pin-grey" style={{ left: 150, top: 24 }} ref={k(show(3.72, undefined, { s: [0.3, 1] }, 0.06))} />
                  <span className="absolute left-[76px] top-[30px]" ref={k([[3.8, 3.95, { o: [0, 1], y: [-36, 0] }]])}>
                    <MapPin className="h-7 w-7 fill-[#f28c28] text-[#1a1006] drop-shadow-[0_4px_8px_rgba(242,140,40,.7)]" strokeWidth={1.5} />
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 px-2.5 pt-2">
                  <div className="rounded-lg border-2 border-[#f28c28] bg-[#fff6ec] px-2.5 py-2" ref={k([[3.9, 4.1, { o: [0, 1], y: [90, 0] }]])}>
                    <div className="flex justify-between text-[11px] font-semibold"><span>Serenity Spa</span><span className="text-[#9a4f0a]">#1</span></div>
                    <div className="relative mt-0.5 inline-block text-[9px] text-[#d8cdbf]">
                      <Stars />
                      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-[#e07a12]" ref={k([[4.0, 4.2, { w: [0, 100] }]])}><Stars /></span>
                    </div>
                    <p className="text-[8px] text-[#5c4d3f]">Open now · 0.6 mi · Online booking</p>
                    <div className="mt-1 flex gap-1 text-[7px] font-semibold">
                      <span className="rounded-full bg-[#f28c28] px-2 py-0.5 text-[#1a1006]">Book</span>
                      <span className="rounded-full border border-[#ded5c8] px-2 py-0.5">Call</span>
                      <span className="rounded-full border border-[#ded5c8] px-2 py-0.5">Directions</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#e4dccf] px-2.5 py-2" ref={k([[3.95, 4.1, { o: [1, 0.45] }]])}>
                    <p className="text-[10px] font-semibold">Another spa</p>
                    <p className="text-[8px] text-[#5c4d3f]">2.4 mi · Closes soon</p>
                  </div>
                  <div className="rounded-lg border border-[#e4dccf] px-2.5 py-2" ref={k([[3.95, 4.1, { o: [1, 0.3] }]])}>
                    <p className="text-[10px] font-semibold">Another spa</p>
                    <p className="text-[8px] text-[#5c4d3f]">3.1 mi</p>
                  </div>
                </div>
              </div>

              {/* booking */}
              <div className="layer overflow-hidden bg-[#faf7f2] text-[#1a1410]" ref={k(show(4.35, 5.5, {}, 0.12))}>
                <div className="px-3 pt-4">
                  <p className="font-serif text-[14px]">Choose a treatment</p>
                  <div className="relative mt-2.5 rounded-lg border border-[#e4dccf] px-2.5 py-2 text-[10px]">
                    <div className="absolute inset-0 rounded-lg border-2 border-[#f28c28] bg-[#fff6ec]" ref={k(show(4.62, undefined, {}, 0.08))} />
                    <div className="relative flex justify-between"><span><b>Massage</b><br /><span className="text-[#5c4d3f]">60 min</span></span><span className="text-[#5c4d3f]">[price]</span></div>
                    <span className="ripple" ref={k([[4.56, 4.6, { o: [0, 0.55] }], [4.6, 4.76, { o: [0.55, 0], s: [0.2, 2.4] }]])} />
                  </div>
                  <div className="mt-1.5 flex justify-between rounded-lg border border-[#e4dccf] px-2.5 py-2 text-[10px]"><span><b>Facial</b><br /><span className="text-[#5c4d3f]">45 min</span></span><span className="text-[#5c4d3f]">[price]</span></div>
                  <div className="mt-1.5 flex justify-between rounded-lg border border-[#e4dccf] px-2.5 py-2 text-[10px]"><span><b>Body treatment</b><br /><span className="text-[#5c4d3f]">75 min</span></span><span className="text-[#5c4d3f]">[price]</span></div>
                </div>

                <div className="layer bg-[#faf7f2] px-3 pt-4" ref={k([[4.8, 4.96, { x: [100, 0] }]], '%')}>
                  <p className="font-serif text-[14px]">Pick a time</p>
                  <div className="mt-2.5 grid grid-cols-4 gap-1 text-center text-[8px]">
                    <span className="rounded border border-[#e4dccf] py-1.5">Thu</span>
                    <span className="rounded border border-[#e4dccf] py-1.5">Fri</span>
                    <span className="relative rounded border border-[#e4dccf] py-1.5">
                      <span className="absolute inset-0 rounded bg-[#1a1410]" ref={k(show(5.0, undefined, {}, 0.05))} />
                      <span className="relative mix-blend-difference text-white">Sat</span>
                    </span>
                    <span className="rounded border border-[#e4dccf] py-1.5">Sun</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-center text-[10px]">
                    <span className="rounded-md border border-[#e4dccf] py-2">9:00</span>
                    <span className="relative rounded-md border border-[#e4dccf] py-2">
                      <span className="absolute inset-0 rounded-md bg-[#f28c28]" ref={k(show(5.1, undefined, {}, 0.05))} />
                      <span className="relative font-semibold">10:00</span>
                    </span>
                    <span className="rounded-md border border-[#e4dccf] py-2">11:30</span>
                    <span className="rounded-md border border-[#e4dccf] py-2 text-[#b8aa98] line-through">1:00</span>
                    <span className="rounded-md border border-[#e4dccf] py-2">2:30</span>
                    <span className="rounded-md border border-[#e4dccf] py-2">4:00</span>
                  </div>
                  <span className="mt-5 block rounded-full bg-[#1a1410] py-2.5 text-center text-[10px] font-semibold text-white" ref={k([[5.17, 5.2, { s: [1, 0.92] }], [5.2, 5.24, { s: [0.92, 1] }]])}>
                    Confirm booking
                  </span>
                </div>

                <div className="layer flex flex-col items-center justify-center gap-2 bg-[#faf7f2] text-center" ref={k(show(5.25, undefined, {}, 0.08))}>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f28c28]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#1a1006" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5 9-10" strokeDasharray="40" ref={checkDraw as unknown as React.Ref<SVGPathElement>} />
                    </svg>
                  </span>
                  <p className="font-serif text-[17px]">You’re booked</p>
                  <p className="text-[9px] leading-relaxed text-[#5c4d3f]">Massage · 60 min<br />Saturday, 10:00 AM<br />Serenity Spa</p>
                  <p className="text-[8px] text-[#5c4d3f]">Reminder sent by text</p>
                </div>
              </div>

              {/* AI receptionist call */}
              <div className="layer flex flex-col gap-1.5 bg-[#1d1510] px-2.5 pt-3 text-white" ref={k(show(5.55, 6.55, {}, 0.12))}>
                <div className="flex flex-col items-center gap-0.5 border-b border-[#3a2e24] pb-2">
                  <span className="ringing grid h-7 w-7 place-items-center rounded-full bg-[#f28c28]"><Phone className="h-3.5 w-3.5 text-[#1a1006]" /></span>
                  <span className="mt-1 text-[7px] tracking-[0.16em] text-[#f28c28]">INCOMING CALL · 9:02 PM</span>
                  <span className="font-serif text-[12px]">Serenity Spa</span>
                  <span className="text-[7px] text-[#b9aa98]">Answered by AI receptionist</span>
                </div>
                <p className="bubble-in" ref={k(show(5.72, undefined, { y: [10, 0] }, 0.08))}>Hi, do you have anything for a massage this Saturday morning?</p>
                <p className="bubble-ai" ref={k(show(5.86, undefined, { y: [10, 0] }, 0.08))}>Yes! I have 10:00 or 11:30 for a 60-minute massage. Which works?</p>
                <p className="bubble-in" ref={k(show(6.0, undefined, { y: [10, 0] }, 0.08))}>10 please.</p>
                <p className="bubble-ai" ref={k(show(6.1, undefined, { y: [10, 0] }, 0.08))}>Done. You’re booked for Saturday at 10:00. I’ve texted you a confirmation.</p>
                <div className="mt-auto mb-3 flex items-center justify-center gap-1.5 text-[7px] text-[#b9aa98]">
                  <span className="wave"><i /><i /><i /><i /><i /></span>
                  <span ref={k(show(6.2, undefined, {}, 0.06))}>Call ended · 1m 48s</span>
                </div>
              </div>
            </div>
          </div>

          {/* owner summary */}
          <div className="summary-pos">
          <div className="summary" ref={k([[6.18, 6.38, { o: [0, 1], x: [60, 0] }], [6.52, 6.64, { o: [1, 0] }]])}>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9a4f0a]">SENT TO THE OWNER · 9:04 PM</p>
            <p className="mt-1 font-serif text-[22px]">New booking</p>
            <div className="mt-2 text-[13px] leading-[1.75] text-[#3c3128]">
              <div><b>Who:</b> [Caller name], [phone]</div>
              <div><b>What:</b> Massage · 60 min</div>
              <div><b>When:</b> Saturday, 10:00 AM</div>
              <div><b>Notes:</b> First visit, prefers a quiet room</div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1a1410] px-3 py-1.5 text-[12px] font-semibold text-white">
              <CalendarCheck className="h-3.5 w-3.5" /> Added to calendar
            </span>
          </div>
          </div>
        </div>

        {/* ---------------- copy ---------------- */}
        <div className="panel" ref={k([[-1, -0.9, { o: [0, 1] }], [0.62, 0.72, { o: [1, 0], y: [0, -20] }]])}>
          <p className="eyebrow">Websites · Local SEO · AI receptionists</p>
          <h1 className="headline">Digital experiences that <em>grow</em> your business.</h1>
          <p className="lede">Follow one spa from a blank screen to a booked appointment. Scroll to watch it happen.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={BOOK_HREF} className="btn-primary">Book a free consultation <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
            <a href="#work" className="btn-ghost max-sm:hidden">See our work</a>
          </div>
        </div>
        <div className="panel" ref={panel(0.72, 2.62)}>
          <p className="eyebrow">01 · Website design</p>
          <h2 className="headline">Watch it <em>come together.</em></h2>
          <p className="lede">Custom, high-performing websites built around how your customers book, call and buy.</p>
        </div>
        <div className="panel" ref={panel(2.72, 4.15)}>
          <p className="eyebrow">02 · Local SEO</p>
          <h2 className="headline">Found first, <em>nearby.</em></h2>
          <p className="lede">Be the business people see when they search close by, on Google and in AI search tools.</p>
          <ul className="points">
            <li>Google Business Profile setup and upkeep</li>
            <li>Local pages for every town you serve</li>
            <li>Review requests on autopilot</li>
          </ul>
        </div>
        <div className="panel" ref={panel(4.25, 5.35)}>
          <p className="eyebrow">03 · Online booking</p>
          <h2 className="headline">Three taps to <em>booked.</em></h2>
          <p className="lede">Customers book the moment they decide, day or night, without a phone call.</p>
        </div>
        <div className="panel" ref={panel(5.45, 6.45)}>
          <p className="eyebrow">04 · AI receptionist</p>
          <h2 className="headline">Answered at 9pm. <em>Booked by 9:04.</em></h2>
          <p className="lede">A voice and chat agent trained on your services, prices and hours. It answers, books and follows up around the clock.</p>
          <ul className="points">
            <li>Answers after hours and on busy days</li>
            <li>Books straight into your calendar</li>
            <li>Every conversation summarized for you</li>
          </ul>
        </div>
        <div className="panel" ref={panel(6.55)}>
          <p className="eyebrow">Maraki Solutions</p>
          <h2 className="headline">Found. Chosen. <em>Booked.</em></h2>
          <p className="lede">That’s what we build for local businesses. Let’s do it for yours.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={BOOK_HREF} className="btn-primary">Book a free consultation <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </div>

        {/* progress rail */}
        <div aria-hidden="true" className="rail" ref={railFn}>
          <div className="rail-track"><div className="rail-fill" /></div>
          <ol>
            {CHAPTERS.map((c) => (
              <li key={c.label} data-at={c.at}>{c.label}</li>
            ))}
          </ol>
        </div>
        <div aria-hidden="true" className="scroll-hint" ref={k([[0.05, 0.3, { o: [1, 0] }]])}>
          <span className="mouse"><span className="mouse-wheel" /></span>
          <span>Scroll</span>
        </div>
      </div>
    </section>
  );
}
