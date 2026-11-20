const BASE = import.meta.env.BASE_URL;

export const EMAIL = 'Hello@MarakiSolutions.com';
export const BOOK_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Free consultation request')}`;
export const LOGO_SRC = `${BASE}maraki-mark.png`;
export const img = (name: string) => `${BASE}img/${name}`;

export const SERVICES = [
  {
    title: 'Custom websites',
    body: 'Websites designed around how your customers book, call, and buy.',
    points: ['Mobile-first, modern design', 'Online booking, quote forms and galleries', 'Fast, secure hosting, fully managed'],
  },
  {
    title: 'Local SEO',
    body: 'Show up when someone nearby searches for exactly what you do.',
    points: ['Google Business Profile setup and upkeep', 'Local pages for every town you serve', 'Review requests on autopilot'],
  },
  {
    title: 'AI receptionist',
    body: 'A voice and chat agent trained on your services, prices and hours.',
    points: ['Answers after hours and on busy days', 'Books straight into your calendar', 'Every conversation summarized for you'],
  },
];

export const STEPS = [
  { title: 'Free review', body: 'We look properly at your website and online presence, and talk through what could work harder.' },
  { title: 'Plan', body: 'We agree on the goals, structure and look before a line of code is written.' },
  { title: 'Build & launch', body: 'We design, write and build your site, and make sure every detail is ready for customers.' },
  { title: 'Grow', body: 'After launch we help more of the right people find you, and keep improving what works.' },
];

/** Real client sites, as listed on the main Maraki Solutions site. */
export const PROJECTS = [
  { name: 'Erica Salon & Spa', kind: 'Salon & spa website', tags: ['Web design', 'Online booking'], url: 'ericasalonandspa.com', image: 'client-erica.webp' },
  { name: 'DMV Paint Pro', kind: 'Painting & handyman website', tags: ['Web design', 'Local SEO'], url: 'dmvpaintpro.com', image: 'client-dmv.webp' },
  { name: 'Herndon Phone Repair', kind: 'Local business website', tags: ['Web design', 'SEO'], url: '911ifix.com', image: 'client-phone.webp' },
  { name: 'Solace Arts', kind: 'E-commerce website', tags: ['Web design', 'E-commerce'], url: 'solacearts.com', image: 'client-solace.webp' },
];
