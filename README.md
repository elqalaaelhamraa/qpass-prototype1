# QPASS

A responsive React + Vite + Tailwind CSS prototype for discovering and booking Egyptian experiences. Requires Node.js 22.12+ (validated with Node 24).

## Development

```sh
npm ci --cache /tmp/qpass-npm-cache
npm run dev
```

## Validation and production

```sh
npm test
npm run build
npm run preview
```

The interaction test exercises all four Giza Zoo product categories, basket totals, checkout, local booking persistence, digital QR pass, and souvenir navigation. It uses jsdom; browser layout and print previews require a real browser.

## Included

- QPASS discovery homepage: Giza Zoo, Vodafone Stadium, Concerts, Hot Air Balloons.
- Giza Zoo: entry tickets, animal experiences, restaurants, hotel, basket, demo checkout, digital QR pass, and printable souvenir.
- Other destinations are clickable coming-soon cards.
- Quantity controls, visit date, entry-ticket requirement, required guest fields, and demo acknowledgement.
- Local SVG illustrations, bundled fonts, and mocked prices/products. No remote runtime requests, backend, email, or payment service.
- Basket, visit date, and latest completed booking persist in browser localStorage. Clear site data to reset. Only the latest booking is retained; the entered name and email stay on this device.
- QR codes encode a demo booking reference and are explicitly invalid for real admission.
- Save / print opens the browser print dialog; choose Save as PDF for a downloadable keepsake.

Routes use URL hashes, so static hosting requires no server rewrite rules. Fictional availability, operating hours, experiences, hotel, and prices are for demonstration only.
