# Architecture

## Vercel and Supabase update

The shared `createRequestHandler` runs both in the local Node server and the Vercel `api/index.mjs` function. CDN assets are built into `dist/public`, including the shared browser math module. `server/auth.mjs` isolates a server-only Supabase GoTrue REST adapter; `public/auth.mjs` owns account views. Authentication sends credentials to the configured HTTPS provider and keeps tokens in HttpOnly cookies. Browser identity always comes from a provider-verified user call. No local auth database is introduced, and progress remains browser-local. The initial architecture sections below remain accurate for mathematical computation; statements about absent identity are superseded by this optional provider integration.

## Current system

MathLens has a modular, dependency-free browser frontend and a Node.js HTTP backend. Native ES modules run without a transpiler. JSDoc describes selected interfaces; strict TypeScript typing is **not implemented**. This choice makes local setup reproducible in the empty repository, but trades compile-time guarantees for a smaller runtime.

`public/app.mjs` handles navigation and feature views; `ui.mjs` holds shared UI primitives and API transport; `content.mjs` contains editorial reference records. `shared/math.mjs` isolates mathematical logic. `server/index.mjs` owns request parsing, bounded computation, response errors, headers and logging.

## Computation pipeline

1. Browser form validates required values and upload size.
2. Same-origin JSON POST reaches a versioned endpoint.
3. Server checks method, content type, origin, per-address quota and body size.
4. Math service validates schema, ranges, expression grammar and data dimensions.
5. Bounded synchronous computation returns values plus a deterministic explanation.
6. Browser renders results and plots without injecting user HTML.

The expression grammar accepts sums of signed numeric polynomial terms only. It never invokes eval, Function or a symbolic engine. Limits: 200 characters, degree 8, coefficient magnitude 10⁶. Regression: 10–1,000 rows, one numeric feature, degrees 1–3; training statistics are fitted after a seeded shuffle split. A pivoted normal-equation solver operates on standardized inputs. Near-singular systems are rejected; QR/SVD would be preferable for a future general-purpose solver.

## AI and explanations

There is no external inference provider. The app trains a small least-squares model. Explanations describe coefficients and assumptions, not SHAP values or generated reasoning. There are no unverified AI proof claims.

## Research verification

Reference metadata is version-controlled and sourced. Three research/award records have explicit types and checked dates. Open-problem statuses reference Clay. Historical links are further-reading pointers; they are not represented as continuously verified sources. There is no ingestion worker, personalization engine, live status update, or freshness guarantee.

## State, storage and caching

Numeric data exist only for a request and its browser result. Browser localStorage stores progress and bookmarks. No database is required; therefore no migrations, connection pool, backup service, user identity or account authorization is introduced. HTTP assets use no-cache, and API results use no-store. Math-result caching and background jobs are planned only if actual cost warrants them.

## Security boundaries

The default listener is loopback. Bounded work, expression allowlisting, strict DOM escaping, JSON responses, CSP, no third-party scripts, origin checks and process-local rate limiting reduce attack surface. This is not a hardened multi-tenant service. See SECURITY.md for residual risks and production requirements.

## Deployment and failure recovery

One Node process serves assets and APIs. A container can run behind an HTTPS reverse proxy. Health and readiness report process reachability; there are no downstream services to check. Restarting discards quotas and no user uploads need recovery. Rolling back means running the previous tested image or source bundle.

## Scaling

Before public horizontal scaling: add shared abuse controls at the edge, bounded worker pools for any expensive symbolic work, observability, deployment smoke tests, and access controls if private server state is introduced. Do not add queues, databases or orchestration for the current bounded local workload. The master brief’s distributed jobs, caches and inference pipeline remain planned.

## Numerical and feed refinement

shared/linear-algebra.mjs isolates Householder QR. shared/advanced.mjs implements bounded one-feature logistic classification, two-feature clustering/PCA, matrix operations and numerical/statistical tools. public/advanced.mjs owns their forms and plots. server/research.mjs retrieves only fixed-host arXiv Atom feeds with category/page allowlists, bounded response streaming, an eight-second timeout, per-instance cache/cooldown and outage backoff. public/research.mjs parses Atom with browser DOMParser, rejects DTD/entities, escapes text and allowlists source links. No provider URLs are accepted from clients. No account or dataset is sent to arXiv. Shared distributed quotas remain an explicit production gap.
