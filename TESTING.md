# Testing

## Second refinement pass

The suite now passes **49/49** tests, adding independent QR/logistic/clustering/PCA/matrix/bisection/integral/statistics fixtures, comparison configuration, 2,100 new puzzle instances, privileged-key rejection and bounded research retrieval/cache/outage tests. Together with the original 900 puzzle instances, 3,000 generated category/range cases are checked. Earlier coverage percentages below belong to the initial code and are not asserted for the expanded modules.

Final refined commit `0438c4b` passed GitHub Actions run 40554155853 on Ubuntu and Windows (Node 24) and its security scan. Production HTTPS smoke tests passed all nine new/refined model/math endpoints, health version 0.2.0-alpha.1, required assets and real arXiv retrieval. Auth config remains false. These are API/source checks, not browser screenshots or interaction verification.

One actual official arXiv API request succeeded (16,619 XML characters). Initial remote GitHub CI runs passed on Windows and Linux plus the security scan. Browser use is disabled in Work settings; new rendered views, XML-to-card rendering, notebook buttons and responsive controls are implemented but not visually verified. API tests are not presented as a substitute for those UI checks.

## Authentication / deployment adapter update

The expanded suite passes **27/27 tests**. Ten new tests cover unconfigured auth, provider password verification, secure HttpOnly cookie flags, omission of tokens/private metadata from JSON, invalid credentials, provider outages, verified identity, S256 PKCE signup/recovery and callback exchange, refresh rotation, password updates/logout, auth quotas/cross-origin rejection and Vercel parsed-body/rewrite compatibility. A fake provider is injected; no real account or email was created. Live Supabase verification remains pending owner configuration. The earlier coverage percentages below apply to the initial 17-test suite, not the new authentication module.

## Commands

```sh
npm test
npm run test:coverage
npm run check
npm run build
node scripts/benchmark.mjs
```

No test dependencies need installation. Tests use Node’s built-in runner. API integration opens an ephemeral loopback server; restrictive sandboxes must permit both listening and connecting. A first sandboxed API run failed with EACCES; it was rerun with loopback permission and all tests passed. This was an environment restriction, not a passing test result.

## Automated results

17 tests passed on Node 24.14.1 / Windows x64. The final coverage run reported 100% line coverage, 92.45% branch coverage and 93.75% function coverage across **server and shared math only**, not browser UI. Compact multi-statement lines inflate line coverage; this is not evidence of exhaustive behavior coverage. Tests include independent linear/quadratic fixtures, finite-difference derivative checks, derivative/integral invariants, real-root substitution, stable quadratic root behavior, constant-target R², training-only preprocessing, deterministic splits, invalid expressions and CSVs, gradient convergence/divergence, and 900 generated puzzle instances across 3 categories and 3 difficulty ranges.

HTTP integration checks health/readiness, assets, request IDs/CSP, real math responses, unsupported operations, malformed JSON, null bodies, cross-origin requests, body-size limits, wrong content types/methods, unknown endpoints and rate limits.

## Browser checks performed

Using the actual local app in Chromium’s in-app browser:

- Desktop 1440×1000: overview composition, equation root result `x = 1, 3`, unsafe-expression error, linear and quadratic regression with actual held-out metrics.
- Mobile 390×844: puzzle labels and touch controls, navigation drawer, hidden-drawer keyboard exclusion, research search/type controls, bookmarks and global search.
- All ten routes rendered without horizontal document overflow at 390px. Tablet 1024×900 overview inspected; the hero object stayed clear of copy. Skip link kept the route intact.
- Puzzle equivalent answer `6/2` accepted for x=3; repeating the same puzzle does not award duplicate points.
- Optimization learning rate 1.1 produces labeled divergence and a complete numerical trace.
- UI fixes from checks: named mobile search, inert collapsed navigation, explicit drawer close, safe skip link, captured export inputs and repeat scoring.

Additional final responsive and route checks are recorded in COMPLETION_REPORT.md. There is no checked-in browser automation harness, axe audit, screen-reader certification, clean-install native verification or completed cross-browser matrix. Native UI semantics and manual checks are not a claim of WCAG certification.

## Release readiness checklist

- [x] Bounded core mathematics and invalid-input fixtures
- [x] API integration tests
- [x] Syntax check and runnable web bundle
- [x] Representative rendered desktop/mobile states
- [ ] Independent accessibility and security assessment
- [ ] Cross-browser and zoom matrix
- [ ] Concurrent load test and production proxy validation
- [ ] CI workflow executed on actual GitHub runners
- [ ] Project license and security reporting channel selected by owner
- [ ] Native packaging, signing and clean-device installation checks
- [ ] Production infrastructure and rollback drill

Bug reproduction template: `.github/ISSUE_TEMPLATE/bug_report.md`. Do not attach private data. Test-result claims must match an executed command; future workflows are not evidence that checks have run remotely.
