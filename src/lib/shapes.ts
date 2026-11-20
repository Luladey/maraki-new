/**
 * Builds particle "targets": every shape is drawn onto an offscreen canvas and
 * sampled into exactly `count` points (x, y in -0.5..0.5 of the stage box) with
 * a colour each. The story morphs particle i between shape A's point i and
 * shape B's point i, so all shapes share the same count.
 */

export type Shape = {
  /** interleaved x,y pairs, normalised to the stage box (-0.5..0.5) */
  pos: Float32Array;
  /** interleaved r,g,b (0-255) */
  col: Uint8Array;
};

const SIZE = 420;
const CYAN = '#14bddb';
const ICE = '#d9f6fb';
const MIST = 'rgba(205,225,235,0.9)';

type Draw = (ctx: CanvasRenderingContext2D) => void;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleCanvas(draw: Draw, count: number, seed: number): Shape {
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  draw(ctx);
  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

  // Collect candidate pixels on a 2px grid to keep this fast.
  const cand: number[] = [];
  for (let y = 0; y < SIZE; y += 2) {
    for (let x = 0; x < SIZE; x += 2) {
      const i = (y * SIZE + x) * 4;
      if (data[i + 3] > 110) cand.push(i);
    }
  }

  const rand = rng(seed);
  const pos = new Float32Array(count * 2);
  const col = new Uint8Array(count * 3);
  for (let k = 0; k < count; k++) {
    const i = cand[Math.floor(rand() * cand.length)] ?? 0;
    const p = i / 4;
    const x = p % SIZE;
    const y = Math.floor(p / SIZE);
    pos[k * 2] = (x + rand() * 2) / SIZE - 0.5;
    pos[k * 2 + 1] = (y + rand() * 2) / SIZE - 0.5;
    col[k * 3] = data[i];
    col[k * 3 + 1] = data[i + 1];
    col[k * 3 + 2] = data[i + 2];
  }
  return { pos, col };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Scene 0 — a loose field of "people searching nearby". */
function field(count: number, seed: number): Shape {
  const rand = rng(seed);
  const pos = new Float32Array(count * 2);
  const col = new Uint8Array(count * 3);
  for (let k = 0; k < count; k++) {
    // A wide, soft galaxy: denser in the middle, drifting outward.
    const a = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 0.55) * 0.78;
    pos[k * 2] = Math.cos(a) * r * 1.15;
    pos[k * 2 + 1] = Math.sin(a) * r * 0.82;
    const cyan = rand() < 0.28;
    col[k * 3] = cyan ? 20 : 190;
    col[k * 3 + 1] = cyan ? 189 : 214;
    col[k * 3 + 2] = cyan ? 219 : 226;
  }
  return { pos, col };
}

/** Scene 1 — a map pin with ripples: "found nearby". */
const drawPin: Draw = (ctx) => {
  const cx = SIZE / 2;
  // ripples under the pin
  ctx.strokeStyle = MIST;
  ctx.lineWidth = 3;
  for (const [rx, ry] of [
    [70, 16],
    [125, 30],
    [180, 44],
  ]) {
    ctx.beginPath();
    ctx.ellipse(cx, 330, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // teardrop pin
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.arc(cx, 150, 92, Math.PI * 0.82, Math.PI * 2.18);
  ctx.lineTo(cx, 330);
  ctx.closePath();
  ctx.fill();
  // hollow centre
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, 148, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // star in the centre (top-rated)
  ctx.fillStyle = ICE;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 9 : 22;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(a) * r, 150 + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
};

/** Scene 2 — a website that sells. */
const drawBrowser: Draw = (ctx) => {
  ctx.strokeStyle = MIST;
  ctx.lineWidth = 4;
  roundRect(ctx, 30, 70, 360, 270, 16);
  ctx.stroke();
  // toolbar
  ctx.beginPath();
  ctx.moveTo(30, 104);
  ctx.lineTo(390, 104);
  ctx.stroke();
  ctx.fillStyle = MIST;
  for (const x of [52, 70, 88]) {
    ctx.beginPath();
    ctx.arc(x, 87, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  roundRect(ctx, 130, 80, 200, 14, 7);
  ctx.lineWidth = 2;
  ctx.stroke();
  // headline + copy
  ctx.fillStyle = ICE;
  roundRect(ctx, 58, 140, 160, 16, 8);
  ctx.fill();
  roundRect(ctx, 58, 166, 120, 16, 8);
  ctx.fill();
  ctx.fillStyle = MIST;
  for (const [y, w] of [
    [200, 150],
    [214, 130],
    [228, 140],
  ]) {
    roundRect(ctx, 58, y, w, 5, 3);
    ctx.fill();
  }
  // CTA button
  ctx.fillStyle = CYAN;
  roundRect(ctx, 58, 256, 110, 30, 15);
  ctx.fill();
  // hero image with a mountain glyph
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 3;
  roundRect(ctx, 236, 132, 130, 160, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(250, 270);
  ctx.lineTo(290, 215);
  ctx.lineTo(315, 245);
  ctx.lineTo(333, 225);
  ctx.lineTo(354, 270);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(335, 168, 12, 0, Math.PI * 2);
  ctx.stroke();
  // reviews row
  ctx.fillStyle = CYAN;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(64 + i * 18, 312, 5, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** Scene 3 — the AI receptionist answers and books. */
const drawPhone: Draw = (ctx) => {
  ctx.strokeStyle = MIST;
  ctx.lineWidth = 5;
  roundRect(ctx, 125, 20, 170, 380, 30);
  ctx.stroke();
  ctx.fillStyle = MIST;
  roundRect(ctx, 185, 34, 50, 8, 4);
  ctx.fill();
  // incoming message (left)
  ctx.fillStyle = ICE;
  roundRect(ctx, 142, 76, 100, 34, 14);
  ctx.fill();
  // AI reply (right)
  ctx.fillStyle = CYAN;
  roundRect(ctx, 176, 124, 102, 48, 14);
  ctx.fill();
  ctx.fillStyle = ICE;
  roundRect(ctx, 142, 186, 74, 30, 14);
  ctx.fill();
  // booking card with a check
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 4;
  roundRect(ctx, 146, 240, 128, 118, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(146, 270);
  ctx.lineTo(274, 270);
  ctx.stroke();
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(184, 314);
  ctx.lineTo(204, 334);
  ctx.lineTo(240, 292);
  ctx.stroke();
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Scene 4 — the real Maraki "M" mark, sampled from the logo image. */
async function logoShape(src: string, count: number, seed: number): Promise<Shape> {
  const img = await loadImage(src);
  return sampleCanvas(
    (ctx) => {
      const scale = Math.min((SIZE * 0.92) / img.width, (SIZE * 0.92) / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
      // Lift the dark-grey M so it reads on navy, keep the cyan check vivid.
      const d = ctx.getImageData(0, 0, SIZE, SIZE);
      for (let i = 0; i < d.data.length; i += 4) {
        const [r, g, b] = [d.data[i], d.data[i + 1], d.data[i + 2]];
        if (b - r < 40) {
          const v = Math.min(255, 120 + (r + g + b) / 3);
          d.data[i] = v;
          d.data[i + 1] = v + 6;
          d.data[i + 2] = v + 12;
        }
      }
      ctx.putImageData(d, 0, 0);
    },
    count,
    seed,
  );
}

export async function buildShapes(count: number, logoSrc: string): Promise<Shape[]> {
  const shapes = [
    field(count, 11),
    sampleCanvas(drawPin, count, 22),
    sampleCanvas(drawBrowser, count, 33),
    sampleCanvas(drawPhone, count, 44),
  ];
  try {
    shapes.push(await logoShape(logoSrc, count, 55));
  } catch {
    shapes.push(field(count, 66)); // logo missing: end on a calm field
  }
  return shapes;
}
