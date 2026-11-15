# Mind Shift Collective website

Source for mindshiftcollective.net. Built with Astro, hosted on Netlify (auto-deploys from `main`).

## Edit content
- Members: `src/data/members.json` (one entry per approved member; set `"sample": false`)
- Events: `src/data/events.json`
- Presenter Series talks: `src/pages/presenter-series.astro` (`talks` list)

## Forms (Phase 1)
Netlify Forms: `newsletter`, `deadline-reminder`, `join-request`, `advisory-brief`, `presenter-pitch`.
Each sets an email subject tag ([MSC Join], [MSC Brief], ...) so notifications to hello@mindshiftcollective.net can be filtered.

## Launch checklist
- Point mindshiftcollective.net (GoDaddy) to Netlify; leave MX records alone
- Set `PUBLIC_SITE_LIVE=true` in Netlify and remove the noindex header in `netlify.toml`
- Swap the newsletter form for the Kit form

## Local
`npm install && npm run dev`
