export const EMAIL = 'Hello@MarakiSolutions.com';
export const BOOK_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Free consultation request')}`;
export const LOGO_SRC = `${import.meta.env.BASE_URL}maraki-mark.png`;

export const STEPS = [
  {
    title: 'Free review',
    description:
      'We take a proper look at your current website and online presence, then talk through what’s working and what could work harder.',
  },
  {
    title: 'Plan of design',
    description: 'We agree on the goals, structure, and look of your new site before a line of code is written.',
  },
  {
    title: 'Build & launch',
    description: 'We design, write, and build your site, then make sure every detail is ready for customers.',
  },
  {
    title: 'Grow',
    description: 'After launch, we help more of the right people find you and keep improving what’s working.',
  },
];

/** Real client sites, as listed on the main Maraki Solutions site. */
export const CLIENTS = [
  { name: 'Erica Salon & Spa', url: 'ericasalonandspa.com' },
  { name: 'DMV Paint Pro', url: 'dmvpaintpro.com' },
  { name: 'Herndon Phone Repair', url: '911ifix.com' },
  { name: 'Solace Arts', url: 'solacearts.com' },
  { name: 'Melarooms', url: 'melarooms.com' },
  { name: 'LocateAgents.ai', url: 'locateagents.ai' },
  { name: 'Lula Leads', url: 'lulaleads.com' },
];

export const BUSINESS_TYPES = [
  'Salons & spas',
  'Painters',
  'Landscapers',
  'Cleaning services',
  'Photographers',
  'Real estate agents',
  'Contractors',
];
