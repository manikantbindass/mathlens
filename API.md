# MathLens API v1

## Refined analysis endpoints

All use the existing JSON/body/rate limits. Uploaded rows are numeric pairs; no uploaded code executes.

| POST path | Request bounds | Result |
| --- | --- | --- |
| `/classify` | optional rows 10–1,000, x numeric / y in {0,1}; each class ≥3; testFraction .2/.3/.4; threshold .05–.95; iterations 50–1,500; rate .01–1; l2 0–1 | Stratified held-out metrics, confusion, probabilities, ROC, training objective, standardized weights and raw rows |
| `/cluster` | optional rows 6–300 pairs; k 2–6, maxIterations 1–200, standardize boolean | Five-initialization K-means centroids, assignments, inertia, silhouette, iterations/convergence |
| `/pca` | optional rows 3–1,000 pairs; standardize boolean | Sample covariance, eigenvectors/eigenvalues, scores, variance ratios, rank-one reconstruction |
| `/compare` | optional regression rows and testFraction | Linear/quadratic/cubic test metrics on identical seeded split; test-selection caution |
| `/matrix` | a and optional b as JSON matrices, each ≤6×6; operation determinant/inverse/multiply/transpose/solve | Numerical result, pivoting steps and residual for inverse/solve |
| `/root` | polynomial expression; left/right in ±100 with left < right and sign change; tolerance 1e−12–.01; maxIterations 1–200 | Bisection approximation, residual, interval error bound, convergence flag and trace |
| `/integral` | polynomial expression, left/right in ±100 | Definite polynomial integral approximation with method note |
| `/statistics` | rows 2–1,000 numeric pairs | Sample variance/std, interpolated quartiles, ranges, means, medians and Pearson r (null for constant feature) |
| `/research` | category math/math.NT/math.AG/math.AP/math.PR/math.OC/stat.ML/cs.LG; page 0–9 | Bounded Atom XML, source/retrieval metadata, cache/stale/availability status; no claim of paper correctness |

Synthetic teaching samples are explicit defaults for model endpoints only. PCA/clustering are descriptive in-sample analyses, not held-out accuracy estimates. Matrix near-singularity uses a relative floating-point tolerance, not exact symbolic rank. Bisection requires continuity (guaranteed for accepted polynomials), and its interval bound measures parameter error rather than residual error. Research errors degrade to availability:false instead of failing unrelated tools.

Authentication endpoint details and provider setup are in AUTHENTICATION.md. No auth token is returned in JSON.

Base URL: `http://127.0.0.1:4173/api/v1`. All POST requests require `Content-Type: application/json`. Send a JSON object, not an array or null. No credentials or paid provider needed. Endpoint errors are JSON with `error`; validation errors include a request ID.

| Method | Path | Request / result |
| --- | --- | --- |
| GET | `/health` | Process health, version and deterministic mode |
| GET | `/ready` | Same-process readiness; no external dependencies |
| POST | `/calculate` | `expression`, `operation`; returns result, steps, coefficients, sampled original function and arithmetic note |
| POST | `/train` | Optional rows, degree, testFraction; returns model, standardized coefficients, split metadata, test predictions, metrics, original rows and sampled curve |
| POST | `/gradient` | Optional rate, initial, iterations; returns objective, update, points, final parameter, loss and convergence condition |

## Polynomial calculation

```json
{"expression":"x^2 - 4*x + 3","operation":"solve"}
```

Operations: `simplify`, `differentiate`, `integrate`, `solve`. Expressions contain sums of constants and powers of x, optionally using `*` between a coefficient and x. No parentheses, functions, division, scientific notation, arbitrary equations or program expressions. Degree ≤8; solve degree ≤2; coefficients ≤1,000,000 in magnitude; length ≤200. Roots are real numerical approximations. Integration adds C. Values are IEEE-754 floating point, not exact rational symbolic objects.

## Regression

```json
{"degree":2,"testFraction":0.2}
```

Omit rows to use the explicitly synthetic sample. Otherwise rows are an array of `[x,y]` pairs, 10–1,000 rows, finite numeric values within ±10⁶. Degrees: 1, 2, 3. Test fractions: 0.2, 0.3, 0.4. Seed 42 fixes the shuffle. The server computes training-only mean/scale, fits least squares, then evaluates test rows. It rejects zero variation and singular systems.

Metrics: MAE, MSE, RMSE and R². R² is null for a constant test target. Coefficients use z=(x−mean)/scale. Residual = actual−prediction. This single split is a teaching aid, not robust model selection or evidence of causation. No classification, categorical columns or missing-value imputation.

## Gradient descent

```json
{"rate":0.1,"initial":4,"iterations":20}
```

Bounds: rate 0.01–1.1, initial −5 to 5, integer iterations 1–60. Objective θ², update θ←θ−2ηθ. Points contain `[iteration, parameter, loss]`, including iteration zero. Convergence field describes the learning-rate regime; an initial value of zero stays at the minimum even for other regimes.

## Errors & limits

400 malformed JSON/object; 403 cross-origin; 404 unknown endpoint; 405 wrong method; 413 request >120 KB; 415 wrong content type; 422 mathematical/schema validation; 429 after 60 computational requests per address/minute. 429 includes Retry-After: 60. Requests and headers have 10-second timeouts. Browser transport also aborts after 10 seconds. Rate limits reset on process restart and are not distributed. No client-supplied forwarding address is trusted.
