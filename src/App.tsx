import Nav from '@/components/Nav';
import SpaStory from '@/components/SpaStory';
import { Closing, Process, Services, Work } from '@/components/Sections';

export default function App() {
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
