# Maraki Scroll

A scroll-driven ("scrollytelling") website for Maraki Solutions. A pinned scene follows one example
business, Serenity Spa, from a blank laptop screen to a booked appointment: the website design builds
itself layer by layer, a phone shows it mobile-first, the spa climbs to #1 in a local search, a customer
books in three taps, and an AI receptionist answers a 9pm call and books it. Services, real client
projects, the process and a contact call to action follow.

## Run it

```sh
npm install
npm run dev      # local dev server on http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
npm start        # serve dist/ on $PORT (what Railway runs)
```

## Deploy on Railway

Create a Railway project from this GitHub repo. Railway installs dependencies, runs
`npm run build`, then `npm start`, which serves `dist/` on the port Railway provides.
No extra configuration is needed; Node 22 or newer is required.

## Where things live

- `src/components/SpaStory.tsx` — the pinned scroll story: devices, screens, copy and their timings
- `src/lib/scroll.ts` — the small scroll-timeline engine (keyframes tied to scroll position)
- `src/components/Sections.tsx` — services, work, process and closing sections
- `src/lib/site.ts` — contact email, services, process steps, client projects
- `public/img/` — spa photos, cut-outs and client screenshots (WebP)
- `public/maraki-mark.png` — the logo mark
