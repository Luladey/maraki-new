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
