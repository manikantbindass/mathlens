# Security policy

## Refinement boundaries

New models use bounded observations and fixed algorithms; no user scripts, URLs or arbitrary expressions are executed. Classification is capped at 1,500 iterations/1,000 rows, K-means at 300 rows/200 iterations/five initializations, matrix dimensions at 6×6, and bisection at 200 iterations. The arXiv endpoint accepts only allowlisted categories/pages and calls a fixed HTTPS host with redirects rejected, streaming size cap 500 KB, eight-second timeout, bounded cache and provider cooldown. Browser Atom parsing rejects DTD/entities, escapes text and only links to arxiv.org abstracts. Arbitrary feed URLs and user data are never sent to the provider. Coordinating quotas across instances and independent security review remain open work.

Supabase configuration refuses `sb_secret_` and legacy JWT service-role keys, even if mistakenly placed in the publishable-key environment field. API results from an earlier route no longer replace a newer route’s view.

This alpha is intended for local use. It has not undergone an independent security assessment. Do not put confidential datasets into a public deployment without completing the production controls below.

**Hosted/auth update:** Vercel deployment now has an explicit serverless adapter. Optional Supabase email accounts use server-verified identity, HttpOnly Secure SameSite cookies, PKCE email verification, 15 auth requests/minute/instance and no password/token logging. See AUTHENTICATION.md and PRIVACY.md. Older references below to absent accounts describe the initial alpha; accounts remain unavailable until the owner configures Supabase. Application quotas are not distributed, and provider SMTP/abuse controls still need owner configuration.

## Implemented controls

- No execution of uploaded files or arbitrary expression code; polynomial grammar is allowlisted.
- Numeric input and upload shape/range/size validation on browser and server.
- At most 120 KB per request; 1,000 regression rows; bounded polynomial degree and iteration count.
- Same-origin checks for browser requests; JSON content-type requirement; no server-side account or session cookies.
- Content Security Policy restricting scripts, fonts and connections to the local origin; no inline scripts or event handlers.
- Escaping of dynamic strings inserted in HTML; user errors use textContent.
- Request IDs, status/method/duration logs; no bodies, expressions, filenames, IPs, secrets or dataset rows logged.
- Process-local rate limit, 10-second transport timeouts, no remote dependency calls.
- No production dependencies or embedded secrets. Third-party fonts include licenses.

## Threat model

| Threat | Boundary / mitigation | Remaining exposure |
| --- | --- | --- |
| Expression code injection | Narrow polynomial grammar; no eval | Parser correctness still needs ongoing regression tests |
| Cost exhaustion | Body, degree, row and iteration limits | Synchronous work; no distributed defense; connection flooding belongs at reverse proxy |
| Stored/reflected XSS | Escaped strings, no server persistence, CSP | Future rich content must preserve these boundaries |
| Cross-site calculation | Origin check, JSON requirement, no credentials | Not an authentication mechanism; non-browser clients can call reachable APIs |
| Dataset disclosure | Loopback default, no persistence/body logs | Results/exports exist in browser memory and download folders; HTTPS required remotely |
| Supply-chain changes | No npm dependencies; licensed vendored fonts | Node/container/actions still need maintained versions and scanning |
| Private account data | Accounts are absent | Future accounts require authorization, session/CSRF controls and deletion/export workflows |

## Reporting

Do not post exploit payloads or private data in public issues. Use the repository’s GitHub private vulnerability reporting feature **if enabled**. Otherwise contact the maintainer through a private channel they publish; no verified security mailbox is available. The owner must enable private reporting and define response targets before a public release. No email address or response SLA is invented.

## Required before public production

Terminate TLS, configure a trusted proxy and edge quotas, cap connections and request body buffering at the proxy, scan Node/container/actions, add independent accessibility/security reviews, and benchmark concurrent load. For expensive future operations use isolated workers with enforced CPU/memory deadlines. The current timeout does not interrupt synchronous JS math. Native distribution and authentication are not security-reviewed or implemented.
