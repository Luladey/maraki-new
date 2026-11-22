/**
 * Particle text: glowing particles that fly in and assemble into words,
 * scatter away from the pointer, and burst apart as the story scrolls on.
 * Drawn on a <canvas> that lives inside the 3D scene (design-pixel space).
 */

const rnd = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export class ParticleText {
  private n = 0;
  private tx!: Float32Array; // target (letter) positions
  private ty!: Float32Array;
  private sx!: Float32Array; // start positions (scattered)
  private sy!: Float32Array;
  private ox!: Float32Array; // pointer push offsets (springy)
  private oy!: Float32Array;
  private vx!: Float32Array;
  private vy!: Float32Array;
  private seed!: Float32Array; // per-particle randoms: delay, size, hue, burst angle
  private born = 0;
  private ctx: CanvasRenderingContext2D;
  /** pointer in design px, or null when away */
  pointer: { x: number; y: number } | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private size: number, // square, design px
    private lines: string[],
    count: number,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.build(count);
  }

  private build(count: number) {
    const S = this.size;
    const off = document.createElement('canvas');
    off.width = S;
    off.height = S;
    const g = off.getContext('2d', { willReadFrequently: true })!;
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const fs = Math.round(S * 0.094);
    g.font = `800 ${fs}px Inter, system-ui, sans-serif`;
    const lh = fs * 1.32;
    const top = S / 2 - ((this.lines.length - 1) * lh) / 2;
    this.lines.forEach((line, i) => {
      // squeeze long lines so every line fits inside the circle
      const maxW = S * 0.78;
      const w = g.measureText(line).width;
      g.save();
      g.translate(S / 2, top + i * lh);
      if (w > maxW) g.scale(maxW / w, 1);
      g.fillText(line, 0, 0);
      g.restore();
    });
    const data = g.getImageData(0, 0, S, S).data;
    const cand: number[] = [];
    for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (data[(y * S + x) * 4 + 3] > 128) cand.push(y * S + x);

    const r = rnd(7);
    this.n = count;
    this.tx = new Float32Array(count);
    this.ty = new Float32Array(count);
    this.sx = new Float32Array(count);
    this.sy = new Float32Array(count);
    this.ox = new Float32Array(count);
    this.oy = new Float32Array(count);
    this.vx = new Float32Array(count);
    this.vy = new Float32Array(count);
    this.seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const c = cand[Math.floor(r() * cand.length)] ?? 0;
      this.tx[i] = (c % S) + r() * 2;
      this.ty[i] = Math.floor(c / S) + r() * 2;
      const a = r() * Math.PI * 2;
      const d = S * (0.55 + r() * 0.9);
      this.sx[i] = S / 2 + Math.cos(a) * d;
      this.sy[i] = S / 2 + Math.sin(a) * d * 0.8;
      for (let k = 0; k < 4; k++) this.seed[i * 4 + k] = r();
    }
    this.born = performance.now();
  }

  private k = 1;

  resize(k: number, dpr: number) {
    this.k = k;
    this.canvas.width = Math.round(this.size * k * dpr);
    this.canvas.height = Math.round(this.size * k * dpr);
    this.ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
  }

  /** burst: 0 (assembled) → 1 (blown apart and faded), driven by scroll */
  draw(now: number, burst: number, reduce: boolean) {
    const { ctx, size: S } = this;
    ctx.clearRect(0, 0, S, S);
    if (burst >= 1) return;
    const life = (now - this.born) / 1000;
    const p = this.pointer;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.n; i++) {
      const s0 = this.seed[i * 4];
      const s1 = this.seed[i * 4 + 1];
      const s2 = this.seed[i * 4 + 2];
      const s3 = this.seed[i * 4 + 3];
      // assemble: each particle flies in over ~1.4s after a small random delay
      let t = reduce ? 1 : Math.min(1, Math.max(0, (life - 0.15 - s0 * 0.9) / 1.4));
      t = 1 - Math.pow(1 - t, 4);
      let x = this.sx[i] + (this.tx[i] - this.sx[i]) * t;
      let y = this.sy[i] + (this.ty[i] - this.sy[i]) * t;

      // pointer: push away within a radius, spring back when it leaves
      if (!reduce) {
        let fx = -this.ox[i] * 0.06;
        let fy = -this.oy[i] * 0.06;
        if (p) {
          const dx = x + this.ox[i] - p.x;
          const dy = y + this.oy[i] - p.y;
          const d2 = dx * dx + dy * dy;
          const R = 70;
          if (d2 < R * R && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) * 2.6;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        this.vx[i] = (this.vx[i] + fx) * 0.82;
        this.vy[i] = (this.vy[i] + fy) * 0.82;
        this.ox[i] += this.vx[i];
        this.oy[i] += this.vy[i];
        x += this.ox[i] + Math.sin(now / 900 + s2 * 20) * 0.6;
        y += this.oy[i] + Math.cos(now / 1100 + s1 * 20) * 0.6;
      }

      // burst: fly outward and fade
      if (burst > 0) {
        const a = s3 * Math.PI * 2;
        const dist = burst * burst * (120 + s2 * 260);
        x += Math.cos(a) * dist;
        y += Math.sin(a) * dist - burst * 40;
      }
      const alpha = (0.7 + s1 * 0.3) * (1 - burst) * (0.25 + t * 0.75);
      // keep particles ~1.5–2.8 screen px whatever the scene scale, so words stay legible
      const sz = (1.5 + s2 * 1.3) / Math.max(this.k, 0.35);
      const warm = s0 > 0.62;
      ctx.fillStyle = warm ? `rgba(242,140,40,${alpha.toFixed(3)})` : `rgba(255,232,205,${alpha.toFixed(3)})`;
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
