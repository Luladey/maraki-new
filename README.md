# Maraki Scroll

A scroll-driven ("scrollytelling") website for Maraki Solutions. As you scroll, a pinned particle
animation morphs from a field of nearby searchers into a map pin (get found), a website (win the
customer), a phone with an AI receptionist booking (book the job), and finally the Maraki logo.
After the story come the process steps, real client sites, and a contact call to action.

## Run it

```sh
npm install
npm run dev      # local dev server on http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

On Replit, press **Run**; deploy as a static site (build output: `dist/`).

## Where things live

- `src/components/ScrollStory.tsx` — the pinned scroll story: scene copy, scroll mapping, particle renderer
- `src/lib/shapes.ts` — the shapes the particles form (drawn off-screen and sampled into points)
- `src/components/Sections.tsx` — process, clients and closing sections
- `src/lib/site.ts` — contact email, process steps, client list
- `public/maraki-mark.png` — the logo mark (also sampled for the final particle shape)
