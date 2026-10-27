# Supabase email authentication

Login, signup, password recovery, PKCE confirmation, password update, refresh, account identity and sign-out are implemented. Mathematical tools remain accessible without an account. Sign-in is unavailable until the owner supplies a real Supabase project.

## Configure

1. In the Vercel **MathLens** project, add `SUPABASE_URL` (your HTTPS project URL) and `SUPABASE_PUBLISHABLE_KEY` (the public publishable key, or legacy public anon key) to Production. Set Preview separately if needed. Never use a service-role or `sb_secret_…` key.
2. Redeploy after adding variables. Local development uses the same names from `.env.example` with `node --env-file=.env server/index.mjs`.
3. In Supabase Authentication → URL Configuration, set Site URL to the verified production origin. Add the exact redirect URL `https://YOUR-VERIFIED-DOMAIN/?auth_callback=1` to the redirect allowlist. Add `http://127.0.0.1:4173/?auth_callback=1` only for local testing. Keep verification links in the same browser used for the request.
4. Keep email confirmation enabled. Configure a production SMTP provider and appropriate Supabase email/password/rate policies before opening registration to the public. Default Supabase email delivery is limited and may only permit project-team recipients; no email delivery has been verified here.
5. Verify signup → actual email confirmation → account, invalid login, session refresh, sign-out and recovery → actual email → new password with a test account you control.

## Security design

Passwords go over same-origin HTTPS to the server, then over HTTPS to Supabase Auth. Supabase verifies/hashes credentials; this application never stores passwords. No password, token, body, email, verifier or callback code is logged. Access/refresh tokens are server-managed HttpOnly, SameSite=Lax cookies, with Secure on Vercel/production. Tokens are not returned in JSON or placed in localStorage. The server verifies identity through Supabase `/user` instead of decoding untrusted JWT claims.

Signup and recovery create a random code verifier in an HttpOnly cookie and send its S256 challenge to Supabase. A one-use callback code is exchanged server-side using that verifier. Callback query parameters are removed from browser history; referrer policy is no-referrer. The verifier expires after one hour. Multiple requests replace the pending verifier, and cross-device confirmation cannot complete; request a fresh link in that browser if needed.

POST requires same-origin Origin when supplied, application/json and a bounded body. Signup/recovery require a browser Origin. Authentication is limited to 15 attempts per address/minute per process, separately from mathematical computations. Vercel instances do not share quota state; use platform/provider abuse controls for production.

## Verification and limitations

Tests use an injected fake provider to exercise request shapes, identity validation, PKCE, cookie flags, failed credentials, provider outages, password updates and quota checks. They do not send email or prove a live Supabase project works. A live flow remains **blocked by owner configuration** until the two variables, redirect allowlist and email service are configured.

No account synchronization of puzzles/bookmarks, MFA, self-service account deletion or account-data export is implemented. The owner must provide a private support process for data requests before broad account onboarding. Sign-out clears this browser and attempts provider token revocation; already-issued access tokens may remain valid until expiry under provider semantics. A password update clears this browser session and asks the user to sign in again.

Official references: [password authentication](https://supabase.com/docs/guides/auth/passwords), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls), [Supabase auth client implementation](https://github.com/supabase/auth-js/blob/master/src/GoTrueClient.ts).
