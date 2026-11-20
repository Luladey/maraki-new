import Nav from '@/components/Nav';
import ScrollStory from '@/components/ScrollStory';
import { Clients, Closing, Process } from '@/components/Sections';

export default function App() {
  return (
    <>
      <a href="#process" className="skip-link">
        Skip the animation
      </a>
      <Nav />
      <main id="top">
        <ScrollStory />
        <Process />
        <Clients />
        <Closing />
      </main>
    </>
  );
}
