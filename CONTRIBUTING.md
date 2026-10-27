# Contributing

This local alpha is not yet pushed to upstream. Before contributing externally, confirm that the owner has selected a project license and opened contribution access.

Use Node 24–26. Keep math changes in `shared/`, HTTP concerns in `server/`, and UI/content in `public/`. Avoid external services for deterministic local functionality. Add independent numerical fixtures and invalid-input cases for changes to mathematics. Preserve labeled controls, focus outlines, reading order, reduced-motion handling and honest capability descriptions.

Run `npm test`, `npm run check`, `npm run build`; inspect modified views at desktop and mobile widths. Never commit .env, user datasets, signing keys or dummy release artifacts. Reference primary sources for mathematical statements and record what was actually verified. Report bugs using the issue template; report vulnerabilities privately as described in SECURITY.md.
