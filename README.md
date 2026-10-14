# QPASS — Life is better out there

A cinematic React + Vite + Tailwind CSS experience platform prototype. Requires Node.js 22.12+ (validated with Node 24). No backend, payment provider, API keys, or database.

## Run

```sh
npm ci --cache /tmp/qpass-npm-cache
npm run dev
```

Vite listens on all interfaces, default port 5173. Routes use URL hashes and work on static hosting without rewrites.

## Validate

```sh
npm test
npm run build
npm run test:browser
```

- Four jsdom integration tests cover the existing Giza Zoo booking flow, planner, animal directory, persisted favourites, recently viewed, and world selection.
- The browser check builds the production site, starts a temporary preview on port 4173, and runs Chromium via Playwright. `@sparticuz/chromium` supplies the browser binary through npm, avoiding a separate browser download. This helper is intended for Linux x64 cloud environments. On other platforms, adapt the launch to an installed Playwright Chromium.
- It checks 15 routes at 360, 390, 768, and 1440px; detects horizontal overflow and runtime errors; exercises the mobile drawer, quantity controls, checkout, saved booking reload, QR pass, souvenir PDF, animal filters/modal, saved/recent experiences, film dialog, and planner.
- Generated screenshots/PDF go into ignored `test-results/`. These are development checks, not an exhaustive accessibility or cross-browser certification.

## The four worlds

- **Giza Zoo:** deep green, sand, cream, wildlife editorial design. Fully functional mock tickets, animal experiences, restaurants, hotel, basket, checkout, QR pass, souvenir, animal directory, and day planner.
- **Vodafone Stadium:** dark, red sports destination concept with 11 detailed experience previews: match tickets, stadium tour, museum, tunnel, lounges, suites, hotel, commercial strip, restaurants, Al Ahly Store, and El Qalaa El Hamraa engraved bricks/fan keepsakes. Filterable and saveable, not bookable.
- **Concerts:** dark, violet/neon discovery world, coming soon.
- **Hot Air Balloons:** warm sunrise discovery world, coming soon.

## Experience features

- Manually controlled four-world hero carousel; horizontal experience rails with previous/next controls.
- Cinematic photo treatments and user-triggered, bundled nature film (no autoplay download on initial page load).
- Preference-based recommendations for wildlife, family time, and slower days. No tracking or AI service.
- Two-step day planner with editable itinerary. Adds only missing items, preserving existing basket quantities. Dates and guest quantities are set in the basket. Times are suggestions, not reservations.
- Persistent favourites and last eight viewed experiences; only shown when relevant.
- Animal habitat filters, search, educational profiles; illustrative inventory, not confirmed zoo residents.
- Responsive mobile booking drawer, booking progress, reduced-motion support, focus-trapped dialogs, keyboard dismissal, lazy-loaded responsive images, and printable passes.

## Data, privacy, and prototype scope

Product data and all booking calculations run locally. Existing product IDs, prices, hash routes, and localStorage booking keys remain compatible with the original prototype. Visit dates use Cairo's calendar date. No payment details are collected and no emails are sent.

Basket, date, latest booking (including guest name/email), preferences, favourites, and recently viewed items persist in this browser. Clear site storage to reset. Only the latest completed booking is retained. QR codes encode demo references and are invalid for admission. Save/print uses the browser print dialog; choose Save as PDF.

All prices, hours, availability, itineraries, hospitality, and experiences are illustrative. Stadium retail/hospitality is an independent visual concept with no claim of official affiliation.

## Assets and network limitation

The previous cartoon SVG artwork has been removed. Optimized, responsive photography uses the Unsplash CDN; fonts and the CC0 nature video are bundled locally. See [visual credits](public/CREDITS.md).

**This cloud environment blocks `images.unsplash.com`.** Photography could not be downloaded or visually verified here. Images use accessible, layout-preserving colour fallbacks when unavailable. Browser layout and functional checks passed in this blocked-image state; they do not certify the photo crops or remote image responses. Permit that domain in environment settings to inspect/download the actual photos. Visitors also need access to the image CDN. Booking and all other data remain local.

The included film is an atmospheric botanical close-up, not footage of a named venue. No official venue photography, official branding assets, or destination-specific video rights are implied.
