# Privacy

MathLens has no analytics, external AI provider or advertising. Numeric CSV data go to the MathLens Node process (local or hosted) for a calculation, then exist in the browser result. The server does not persist them. Application request logs contain method, status, duration and a random request ID only. Hosting infrastructure may have its own request logs and retention.

Optional email/password accounts use Supabase. Email addresses and passwords are transmitted over HTTPS to Supabase through the MathLens backend; Supabase manages credential hashing and identity storage. Passwords are never stored by MathLens. Access/refresh tokens use HttpOnly, SameSite=Lax cookies with Secure on hosted production. PKCE verification uses short-lived HttpOnly cookies. No auth tokens are placed in localStorage, JSON results or application logs. See AUTHENTICATION.md for provider setup and verification limits. Account data export/deletion currently requires the project owner; no automated support channel or regulatory compliance claim is provided.

Progress and bookmarked record IDs are saved under `mathlens-puzzles` and `mathlens-bookmarks` in browser localStorage. Documentation & About provides local export and clear controls. Browser storage is not encrypted or suitable for secrets. Exported JSON files are managed by the user’s browser and operating system; clearing localStorage does not delete downloaded files.

Fonts are bundled locally. Reference links open external institutional sites only when followed; those sites have their own policies. A future hosted operator may have infrastructure logs and must disclose retention and processing before collecting personal data. No claim of legal certification or regulatory compliance is made.

## Refinement additions

Experiment metadata (not raw uploaded rows) and bookmarked arXiv source records can now be stored in browser localStorage under mathlens-experiments and mathlens-feed-bookmarks. About exports and clears them alongside puzzle progress. Explicit result downloads may include raw numeric rows; these files remain under your control. The live research endpoint sends only a selected category and page to the fixed arXiv API, never your math expressions, uploads or account data. ArXiv feed cache is temporary and process-local.
