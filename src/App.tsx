import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Nav from '@/components/Nav';
import SpaStory from '@/components/SpaStory';
import { Closing, Process, Services, Work } from '@/components/Sections';

export default function App() {
  // Smooth, inertial wheel/trackpad scrolling. Touch keeps the device's native
  // momentum, and Lenis turns smoothing off for prefers-reduced-motion.
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9, anchors: { offset: -72 }, autoRaf: true, stopInertiaOnNavigate: true });
    return () => lenis.destroy();
  }, []);

  // Desktop pointer niceties: primary buttons lean toward the cursor, and
  // project images tilt in 3D under it.
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    let tilted: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      document.querySelectorAll<HTMLElement>('.btn-primary').forEach((btn) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
        btn.style.translate = near ? `${(dx * 0.22).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px` : '';
      });
      const card = (e.target as Element).closest<HTMLElement>('[data-tilt]');
      if (tilted && tilted !== card) {
        tilted.style.removeProperty('--rx');
        tilted.style.removeProperty('--ry');
      }
      tilted = card;
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <>
      <a href="#services" className="skip-link">Skip the animation</a>
      <Nav />
      <main id="top">
        <SpaStory />
        <Services />
        <Work />
        <Process />
        <Closing />
      </main>
    </>
  );
}
