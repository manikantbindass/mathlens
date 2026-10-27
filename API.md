# MathLens API v1

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
