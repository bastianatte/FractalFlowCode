# Fractal Flow Event Ops

## Project Overview

Fractal Flow Event Ops is a static, bilingual landing page for a service-based company working in events and festivals.

The site is designed to feel practical and credible, with a focus on live operations, ticketing support, crowd flow management, pre-event sales reading, post-event reporting, and the details production teams actually need.

## Purpose

The website helps festival organizers, event managers, and production teams quickly understand:

- what the company does
- how the services are organized
- how the bilingual content works
- how to get in touch

## Target Audience

- Festival organizers
- Event managers
- Production teams

## Structure

The page is a single landing page with these sections in order:

1. Hero
2. What we do
3. Services
4. Case study
5. Contact

The header also contains:

- the brand name
- a minimal anchor navigation
- a language switch for Italian and English

The page ends with a short footer message.

## Bilingual Handling

Italian is the default language.

The language toggle switches all visible text on the page without reloading. The implementation uses lightweight vanilla JavaScript and a single page structure, so the site stays easy to maintain.

## Files

- `index.html` - page structure, bilingual copy, and metadata
- `style.css` - layout, typography, spacing, color system, and responsiveness
- `script.js` - language toggle, active navigation state, and language-aware labels
- `docs/README.md` - project overview and editing notes
- `docs/CONTENT.md` - all copy in Italian and English
- `docs/SETUP.md` - deployment, domain, and content update steps

## Editing Content

To update the text:

1. Open `docs/CONTENT.md`
2. Edit the Italian and English versions of the same section
3. Copy the updated text into `index.html`
4. Keep both languages aligned in meaning and section order

For contact details, also update:

- the Contact section in `index.html`
- the footer text if needed
- the meta description and Open Graph tags in the `<head>`

If you adjust the sales-reading wording, keep the same idea across:

- the Hero lead
- the What we do supporting copy
- the Ticketing support service card
- the Case study intro, if relevant

## Deployment

This project is ready for GitHub Pages or any other static host.

1. Create a GitHub repository.
2. Upload the files to the repository root.
3. Open the repository settings.
4. Go to Pages.
5. Select the publishing branch.
6. Set the root folder as the source.
7. Save and wait for the public URL.

## Notes

- No build step is required.
- No external dependencies are used.
- No backend is required.
- The site should remain short, concrete, and operational in tone.
