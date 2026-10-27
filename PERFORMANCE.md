# Performance

Measured locally on 2026-10-27 with Node v24.14.1, Windows x64. Reproduce with `node scripts/benchmark.mjs`. Ten warmup calls precede each fixture. Values below measure pure computation and fixture allocation, not HTTP, network, browser rendering or concurrent load.

| Fixture | Runs | Median ms | p95 ms |
| --- | ---: | ---: | ---: |
| Degree-8 derivative + 161 samples | 1,000 | 0.0705 | 0.3952 |
| Cubic regression, 1,000 rows | 100 | 3.8232 | 14.6172 |
| Gradient descent, 60 steps | 1,000 | 0.0027 | 0.0200 |

These observations are not an SLA. A provisional local objective is p95 <50ms per maximum-size regression operation on comparable hardware. There is no end-to-end latency or concurrency objective until those are measured.

Current bounded workloads are synchronous. Regression uses standardized normal equations with pivoting; QR/SVD is the first numerical robustness improvement. All frontend route code currently loads in one module; route code splitting is planned if payload size becomes material. Static fonts are local; no external scripts block startup. SVG samples are bounded.

Structured logs measure response duration and status with request IDs. There is no metrics collector, dashboard, AI-usage tracking, error-tracking integration or circuit breaker because there are no external provider calls. Transport timeouts do not preempt synchronous calculations. Production priorities: concurrent-load tests, edge connection limits, HTTP measurements, asset compression and caching, then worker isolation for any expensive new operation.

## Refined bounded models

Measured on the same Node 24.14.1 / Windows x64 runtime, one warmup followed by 20 runs. Logistic regression at 1,000 rows/1,500 steps: median 93.59 ms, max 194.38 ms. K-means at 300 rows with the 200-step cap (converged earlier): median 6.99 ms, max 11.29 ms. Two-feature PCA at 1,000 rows: median 1.69 ms, max 4.54 ms. These are single-process pure-compute observations, not HTTP/production/concurrency guarantees. Live arXiv retrieval is asynchronous with an eight-second timeout. Shared retrieval quotas across serverless instances remain planned.
