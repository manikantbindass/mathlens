# Refinement audit — 2026-10-27

This inventory supersedes the initial alpha inventory where functionality has changed. **The full 22-phase master brief is not complete.**

## Second-pass capabilities

| Area | Actual implementation and evidence |
| --- | --- |
| Regression | Householder QR replaces normal equations. Independent coefficient recovery, large-offset and rank-deficient fixtures pass. Training-only scaling is preserved. Dataset preview and held-out residual plot added |
| Classification | One-feature binary logistic regression; stratified seeded split; training-only scaling; bounded gradient descent and L2 penalty; test accuracy, precision, recall, F1, ROC-AUC, Brier, log-loss, baseline, confusion matrix, probability/ROC/training curves and exports. Independent metric and input fixtures pass |
| Clustering | Two-feature K-means, five deterministic initializations, bounded iterations, centroids, assignments, inertia and silhouette. Inertia/means independently recomputed; separated/singleton/invalid fixtures pass |
| PCA | Two-feature covariance eigenanalysis, scores, explained variance and rank-one reconstruction. Orthogonality, eigenvector identities, full reconstruction and constant-feature fixtures pass |
| Comparison | Three regression degrees on identical seeded split; no misleading winner badge; explicit warning about selecting models from test scores |
| Numerical tools | Matrices up to 6×6: determinant, inverse, multiply, transpose and AX=B; bracketed polynomial roots with error bounds; definite integrals; sample statistics and Pearson correlation. Independent fixtures and invalid-input tests pass |
| Research | Official arXiv Atom API, category/page filters, bounded retrieval/cache/cooldown, retrieval dates, source abstracts, bookmarks, citation export and graceful stale/unavailable states. Adapter tests pass; one actual API request returned 16,619 XML characters |
| Learning | Nine worked-example lessons and ten validated puzzle categories. Total generated puzzle fixtures: 3,000 across all difficulty ranges |
| Notebook | Up to 20 browser-local metadata records, no raw data persistence. Explicit JSON exports and local data clearing |
| Security | Privileged Supabase key rejection, bounded local storage reads, own-property route checks and stale-route result guards |

## Verification limits

- Expanded suite: **49/49 tests passed**; final checks are recorded in TESTING.md.
- Earlier published GitHub CI runs on Windows/Linux and security scan passed for fe5e8e1 and 1432a1f.
- Initial production deployment READY: https://mathlens-wine.vercel.app. HTTPS health, calculation and static shared module checks passed.
- Supabase config remains absent; live signup, actual email delivery and recovery are blocked by owner provider/environment configuration.
- Browser use is disabled in Work settings. New layouts and interactions are **implemented but not visually verified**. Earlier responsive checks cover the initial screens only. No browser pass or screenshots are fabricated.

## Remaining master-brief work

| Requirement | Current gap |
| --- | --- |
| Repository rebrand | Rename pending explicit approval after automatic review rejection; source/homepage already published; history and visibility preserved |
| Design/accessibility | Retained Modern Dark, labels, focus and reduced motion; new viewport/keyboard/zoom/assistive-tech checks pending; no compliance certification |
| Models | Trees, forests, boosting, neural networks, general multifeature pipelines, SHAP, permutation importance, PDP and justified uncertainty remain planned |
| Mathematics | General safe CAS, transcendental functions, arbitrary nonlinear systems and full derivation engine remain planned |
| Historical/learning corpus | Cross-cultural selection and nine lessons are partial; no comprehensive archive or advanced model-evolution studio |
| Architecture/storage | Stateless versioned APIs and bounded memory cache; no DB, migrations, durable jobs, shared cache or account progress sync introduced |
| Accounts/privacy | Supabase adapter implemented; live provider setup, self-service account export/deletion and owner private support channel incomplete |
| Testing/security | Math/API/provider tests; browser e2e/axe, independent security review, concurrent load and native clean-install tests pending |
| Observability | Structured request ID/status/duration logs; no external error tracker or distributed metrics |
| Deployment | Working Vercel web alpha; no verified Docker build, staging promotion policy or rollback drill |
| Native/release | No Windows/Linux/Android project or artifact; iOS Coming Soon. No stable release, fake download links or dummy binaries |
| Research intelligence | Live arXiv and curated references; no durable multi-source discovery graph, verified-breakthrough monitoring, moderation or recommendations |
| Awards/problems | Small sourced collection; comprehensive awards archive and detailed research histories remain partial |
| Community/i18n | Docs/templates exist; owner license and reporting channel required; strict TypeScript and complete string localization not implemented |

## Next dependency order

1. Enable browser use and inspect the expanded flows at desktop/tablet/mobile, keyboard and zoom.
2. Configure Supabase variables, exact callback allowlist and email service; verify a real user-owned test account lifecycle.
3. Add strict types, browser CI, shared provider/cache quotas and load testing before wider use.
4. Extend algorithms/safe CAS with independent correctness fixtures and execution limits.
5. Add cloud state, migrations, authorization and account export/deletion together when synchronization is built.
6. Design native runtime/backend packaging; build, sign and test real artifacts on supported runners before a stable release claim.
