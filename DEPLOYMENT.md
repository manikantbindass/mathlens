# Deployment

## Vercel

`vercel.json` builds CDN assets with `node scripts/build-vercel.mjs` into `dist/public`. The build copies shared browser mathematics into `/shared/`. A single Node function, `api/index.mjs`, exports the same request handler used locally. `/api/:path*` rewrites explicitly preserve the API route. Vercel uses Node 24.x; no persistent server listener or filesystem writes are required.

The Vercel project is `mathlens` (`prj_TRFTNhZRzKWwEGBtSVrAyDbQxaZK`). Configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in its environment settings, then redeploy. Configure the verified origin and exact `/?auth_callback=1` redirect URL in Supabase. See AUTHENTICATION.md. No service-role secret is needed. Static assets and functions are deployed together; verify health, an actual calculation and auth/config after each deployment.

Per-instance limits are not a shared abuse-control service. Supabase account/email policies and Vercel edge limits remain necessary for wider onboarding. This remains an alpha.

## Development

Use Node 24–26, `npm run dev`, and loopback `http://127.0.0.1:4173`. No installation step, credentials or database. Environment values are documented in `.env.example`. Keep `.env` untracked. To change port in PowerShell: `$env:PORT='4174'` then `npm start`.

## Staging / production candidate

1. Run `npm test`, `npm run check`, and `npm run build` on a clean copy.
2. Run `node dist/server/index.mjs`, or build the Docker image.
3. Terminate HTTPS in a reverse proxy. Add external request/connection quotas, body limits and process supervision. `HOST=0.0.0.0` is needed inside a container; the application defaults to loopback otherwise.
4. Verify `/api/v1/health`, `/api/v1/ready`, a calculation and regression request after deployment.
5. Keep the previous image/source bundle for rollback. Replace the process/image with that version and repeat smoke checks.

The same bundle can be used in staging and production with `NODE_ENV` set appropriately. These are deployment instructions, not evidence of production readiness. No hosting, domain, TLS certificate or monitoring destination has been provisioned.

## Docker

```sh
docker build -t mathlens:alpha .
docker run --rm -p 127.0.0.1:4173:4173 mathlens:alpha
```

Docker is not verified in the current environment. Scan and pin the base image digest in your own release pipeline before public use. No compose stack is needed for a single stateless process.

## Recovery

There is no database or server-side data migration. Preserve the versioned source bundle and container manifest. Users can export local progress via About; browser-local state is not centrally backed up. Do not add database backup claims until persistent backend state exists.

## Rename upstream

A repository administrator can open **Settings → General → Repository name**, enter **MathLens**, and confirm Rename. Update the remote URL and source links after verifying the redirect. The current connection cannot rename or push. No replacement repository was created.
