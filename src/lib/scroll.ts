/**
 * A tiny scroll-timeline engine.
 *
 * The pinned story has a global position P (0..TOTAL, one unit ≈ one screen of
 * scrolling). Elements register keyframe tracks: "between P=a and P=b, animate
 * these properties from → to". For each property the engine uses the latest
 * track that has started, so an element can fade in with one track and out
 * with a later one. Everything is written straight to the DOM each frame.
 */

export type Range = [number, number];
export type Props = {
  o?: Range; // opacity
  x?: Range; // translateX, px (or % when `unit` is '%')
  y?: Range; // translateY, px
  s?: Range; // scale
  r?: Range; // rotate, deg
  clipR?: Range; // clip from the right, % hidden (100 → 0 reveals left-to-right)
  clipT?: Range; // clip from the top, % hidden
  w?: Range; // width, %
  b?: Range; // blur, px
};
export type Track = [number, number, Props, Ease?];
type Ease = (t: number) => number;
/** P: story time in keyframe units; raw: 0..1 progress through the pinned section. */
export type Ctx = { P: number; raw: number; mobile: boolean; reduce: boolean };
export type Fn = (el: HTMLElement, ctx: Ctx) => void;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeInOut: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Local 0..1 progress of P through [a, b]. */
export const span = (P: number, a: number, b: number, ease: Ease = easeInOut) => ease(clamp((P - a) / (b - a)));

const KEYS = ['o', 'x', 'y', 's', 'r', 'clipR', 'clipT', 'w', 'b'] as const;

type Entry = { tracks: Track[]; unit: string };

export class Timeline {
  private entries = new Map<HTMLElement, Entry>();
  private fns = new Map<HTMLElement, Fn>();

  /** ref callback: <div ref={tl.keys([[1, 1.3, { o: [0, 1] }]])} /> */
  keys = (tracks: Track[], unit = 'px') => (el: HTMLElement | null) => {
    if (el) this.entries.set(el, { tracks: [...tracks].sort((p, q) => p[0] - q[0]), unit });
  };

  /** ref callback running a custom function every frame. */
  fn = (f: Fn) => (el: HTMLElement | null) => {
    if (el) this.fns.set(el, f);
  };

  apply(ctx: Ctx) {
    const { P } = ctx;
    this.entries.forEach(({ tracks, unit }, el) => {
      const v: Partial<Record<(typeof KEYS)[number], number>> = {};
      for (const key of KEYS) {
        let chosen: Track | undefined;
        for (const t of tracks) {
          if (!t[2][key]) continue;
          if (!chosen || t[0] <= P) chosen = t;
        }
        if (!chosen) continue;
        const [a, b, props, ease] = chosen;
        const [from, to] = props[key]!;
        v[key] = lerp(from, to, span(P, a, b, ease));
      }
      if (v.o !== undefined) {
        el.style.opacity = v.o.toFixed(3);
        el.style.visibility = v.o < 0.005 ? 'hidden' : '';
      }
      if (v.x !== undefined || v.y !== undefined || v.s !== undefined || v.r !== undefined) {
        el.style.transform = `translate3d(${(v.x ?? 0).toFixed(2)}${unit}, ${(v.y ?? 0).toFixed(2)}px, 0) scale(${(v.s ?? 1).toFixed(4)}) rotate(${(v.r ?? 0).toFixed(2)}deg)`;
      }
      if (v.clipR !== undefined || v.clipT !== undefined) {
        el.style.clipPath = `inset(${(v.clipT ?? 0).toFixed(2)}% ${(v.clipR ?? 0).toFixed(2)}% 0 0)`;
      }
      if (v.w !== undefined) el.style.width = `${v.w.toFixed(2)}%`;
      if (v.b !== undefined) el.style.filter = v.b < 0.05 ? '' : `blur(${v.b.toFixed(2)}px)`;
    });
    this.fns.forEach((f, el) => f(el, ctx));
  }
}

/**
 * Piecewise-linear time warp: maps scroll position (x) to story time (y).
 * Lets the keyframes stay in their original units while the scroll gets
 * shorter, and lets slow stretches (holds) be squeezed independently.
 */
export const warp = (knots: [number, number][]) => (x: number) => {
  if (x <= knots[0][0]) return knots[0][1];
  for (let i = 1; i < knots.length; i++) {
    const [x1, y1] = knots[i];
    const [x0, y0] = knots[i - 1];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return knots[knots.length - 1][1];
};

/** Fade in over [a, a+d], optionally fade out over [b, b+d]. */
export const show = (a: number, b?: number, extra: Props = {}, d = 0.12): Track[] => {
  const t: Track[] = [[a, a + d, { o: [0, 1], ...extra }]];
  if (b !== undefined) t.push([b, b + d, { o: [1, 0] }]);
  return t;
};
