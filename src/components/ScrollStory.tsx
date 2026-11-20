import { useEffect, useRef } from 'react';
import { ArrowRight, Search, FileText, CalendarCheck, MessageCircle } from 'lucide-react';
import { buildShapes, type Shape } from '@/lib/shapes';
import { BOOK_HREF, LOGO_SRC } from '@/lib/site';

type Scene = {
  label: string;
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  points?: string[];
};

const SCENES: Scene[] = [
  {
    label: 'Start',
    eyebrow: 'Websites · Local SEO · AI receptionists',
    title: 'Your business,',
    accent: 'booked while you work.',
    body: 'Somewhere near you, someone is searching for exactly what you do. Scroll to follow them from the first search to a booked job.',
  },
  {
    label: 'Found',
    eyebrow: '01 — Get found',
    title: 'Show up when they',
    accent: 'search nearby.',
    body: 'Be there when someone nearby searches “painter near me” or “salon in Herndon.”',
    points: [
      'Google Business Profile setup and upkeep',
      'Local SEO pages for every town you serve',
      'Review requests that run on autopilot',
    ],
  },
  {
    label: 'Chosen',
    eyebrow: '02 — Win the customer',
    title: 'A website that',
    accent: 'actually sells.',
    body: 'Websites designed around how your customers book, call, and buy.',
    points: [
      'Mobile-first design built on modern technology',
      'Online booking, quote forms, and photo galleries',
      'Fast, secure hosting, fully managed for you',
    ],
  },
  {
    label: 'Booked',
    eyebrow: '03 — Book the job',
    title: 'Answered at 9pm.',
    accent: 'Booked by 9:01.',
    body: 'An AI receptionist trained on your services, prices and hours. It answers, books and follows up around the clock.',
    points: [
      'Answers calls after hours and on busy days',
      'Website chat that books, not just replies',
      'Every conversation summarized for you',
    ],
  },
  {
    label: 'Maraki',
    eyebrow: 'Maraki Solutions',
    title: 'Found. Chosen.',
    accent: 'Booked.',
    body: 'Three things, done properly — so the phone rings, the calendar fills, and you keep doing the work you’re good at.',
  },
];

const LAST = SCENES.length - 1;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** How visible scene k is at story position s (1 at its stop, 0 halfway to the next). */
const presence = (s: number, k: number) => clamp(1 - Math.abs(s - k) / 0.42);

export default function ScrollStory() {
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = storyRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    let size = 0;
    let shapes: Shape[] | null = null;
    let count = 0;
    let seeds: Float32Array;
    let target = 0;
    let s = 0;
    let raf = 0;
    let alive = true;
    const chips = Array.from(stage.querySelectorAll<HTMLElement>('[data-scene]'));

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = stage.clientWidth;
      h = stage.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (w >= 1024) {
        cx = w * 0.68;
        cy = h * 0.52;
        size = Math.min(w * 0.4, h * 0.7);
      } else {
        cx = w / 2;
        cy = h * 0.3;
        size = Math.min(w * 0.8, h * 0.36);
      }
      stage.style.setProperty('--cx', `${cx}px`);
      stage.style.setProperty('--cy', `${cy}px`);
      stage.style.setProperty('--s', `${size}px`);
    };

    const readScroll = () => {
      const rect = story.getBoundingClientRect();
      const total = story.offsetHeight - window.innerHeight;
      target = clamp(-rect.top / Math.max(total, 1)) * LAST;
    };

    const updateOverlay = () => {
      SCENES.forEach((_, k) => {
        const v = presence(s, k);
        const panel = panelRefs.current[k];
        if (panel) {
          panel.style.opacity = String(v);
          panel.style.transform = `translate3d(0, ${(k - s) * 40}px, 0)`;
          panel.style.visibility = v > 0.01 ? 'visible' : 'hidden';
          panel.setAttribute('aria-hidden', v > 0.5 ? 'false' : 'true');
        }
      });
      chips.forEach((chip) => {
        // chips land a beat after their shape has formed
        const v = presence(s, Number(chip.dataset.scene));
        const c = clamp((v - 0.55) / 0.45);
        chip.style.opacity = String(c);
        chip.style.transform = `translate3d(0, ${(1 - c) * 14}px, 0) scale(${0.96 + c * 0.04})`;
      });
      if (logoRef.current) {
        const v = Math.pow(presence(s, LAST), 3);
        logoRef.current.style.opacity = String(v * 0.9);
        logoRef.current.style.transform = `translate(-50%, -50%) scale(${0.94 + v * 0.06})`;
      }
      if (railRef.current) railRef.current.style.setProperty('--p', String(s / LAST));
      if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - s * 4));
    };

    const draw = (time: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!shapes) return;

      const i = Math.min(Math.floor(s), LAST - 1);
      const f = s - i;
      // hold each shape for a while, morph in the middle of the segment
      const t = smooth(clamp((f - 0.18) / 0.64));
      const bump = Math.sin(Math.PI * t);
      const dir = i % 2 ? -1 : 1;
      const A = shapes[i];
      const B = shapes[i + 1];
      const sec = time / 1000;

      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < count; k++) {
        const r1 = seeds[k * 3];
        const r2 = seeds[k * 3 + 1];
        const r3 = seeds[k * 3 + 2];

        let x = A.pos[k * 2] + (B.pos[k * 2] - A.pos[k * 2]) * t;
        let y = A.pos[k * 2 + 1] + (B.pos[k * 2 + 1] - A.pos[k * 2 + 1]) * t;

        if (!reduce) {
          // vortex: particles orbit the centre and billow out mid-morph
          const ang = bump * dir * (0.7 + r1 * 1.4);
          const grow = 1 + bump * (0.15 + r2 * 0.45);
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          const nx = (x * ca - y * sa) * grow;
          const ny = (x * sa + y * ca) * grow;
          x = nx + Math.sin(sec * (0.6 + r1) + r3 * 6.28) * 0.0045;
          y = ny + Math.cos(sec * (0.5 + r2) + r1 * 6.28) * 0.0045;
        }

        const rr = A.col[k * 3] + (B.col[k * 3] - A.col[k * 3]) * t;
        const gg = A.col[k * 3 + 1] + (B.col[k * 3 + 1] - A.col[k * 3 + 1]) * t;
        const bb = A.col[k * 3 + 2] + (B.col[k * 3 + 2] - A.col[k * 3 + 2]) * t;
        const twinkle = reduce ? 1 : 0.75 + 0.25 * Math.sin(sec * (1 + r2 * 2) + r1 * 9);
        const alpha = (0.55 + r3 * 0.45) * twinkle;
        const sz = (1.1 + r2 * 1.6) * (1 + bump * 0.7);

        ctx.fillStyle = `rgba(${rr | 0},${gg | 0},${bb | 0},${alpha.toFixed(2)})`;
        ctx.fillRect(cx + x * size - sz / 2, cy + y * size - sz / 2, sz, sz);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const frame = (time: number) => {
      if (!alive) return;
      readScroll();
      s = reduce ? target : s + (target - s) * 0.11;
      if (Math.abs(target - s) < 0.0005) s = target;
      // Only paint while the pinned stage is on screen.
      const rect = story.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        updateOverlay();
        draw(time);
      }
      raf = requestAnimationFrame(frame);
    };

    layout();
    count = w < 640 ? 2000 : 3800;
    seeds = new Float32Array(count * 3);
    for (let k = 0; k < seeds.length; k++) seeds[k] = Math.random();

    buildShapes(count, LOGO_SRC).then((built) => {
      if (alive) shapes = built;
    });

    readScroll();
    s = target;
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <section
      ref={storyRef}
      aria-label="How Maraki Solutions helps local businesses"
      className="relative"
      style={{ height: `${SCENES.length * 125}vh` }}
    >
      <div ref={stageRef} className="stage sticky top-0 h-[100svh] w-full overflow-hidden">
        <div aria-hidden="true" className="stage-glow absolute inset-0" />
        <img ref={logoRef} src={LOGO_SRC} alt="" aria-hidden="true" className="stage-logo" />
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        {/* Floating UI chips anchored to the particle shape */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div data-scene="1" className="chip chip-1">
            <Search className="h-3.5 w-3.5 text-cyan" /> “painter near me”
          </div>
          <div data-scene="2" className="chip chip-2">
            <FileText className="h-3.5 w-3.5 text-cyan" /> New quote request
            <span className="text-white/45">· just now</span>
          </div>
          <div data-scene="3" className="chip chip-3">
            <MessageCircle className="h-3.5 w-3.5 text-cyan" /> “Can you come Saturday?”
          </div>
          <div data-scene="3" className="chip chip-4 chip-strong">
            <CalendarCheck className="h-3.5 w-3.5" /> Booked · Sat 10:00 AM
          </div>
        </div>

        {/* Copy for each scene */}
        {SCENES.map((scene, k) => {
          const Heading = k === 0 ? 'h1' : 'h2';
          return (
            <div
              key={scene.label}
              ref={(el) => { panelRefs.current[k] = el; }}
              className="panel"
              style={{ opacity: k === 0 ? 1 : 0, visibility: k === 0 ? 'visible' : 'hidden' }}
            >
              <p className="eyebrow">{scene.eyebrow}</p>
              <Heading className="headline">
                <span className="block">{scene.title}</span>
                <span className="block italic text-cyan">{scene.accent}</span>
              </Heading>
              <p className="body-copy">{scene.body}</p>
              {scene.points && (
                <ul className="points">
                  {scene.points.map((pt) => (
                    <li key={pt}>
                      <span aria-hidden="true" className="diamond" />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
              {(k === 0 || k === LAST) && (
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a href={BOOK_HREF} className="btn-primary">
                    Book a free consultation <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                  {k === LAST && (
                    <a href="#process" className="btn-ghost max-sm:hidden">
                      How it works
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Progress rail */}
        <div ref={railRef} aria-hidden="true" className="rail">
          <div className="rail-track">
            <div className="rail-fill" />
          </div>
          <ol>
            {SCENES.map((scene) => (
              <li key={scene.label}>{scene.label}</li>
            ))}
          </ol>
        </div>

        <div ref={hintRef} aria-hidden="true" className="scroll-hint">
          <span>Scroll</span>
          <span className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
