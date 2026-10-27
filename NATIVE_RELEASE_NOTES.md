# MathLens experimental online clients

These clients open the deployed MathLens workspace at https://mathlens-wine.vercel.app. They require internet access. Computation runs on the hosted API. This is a prerelease for testing, not a stable offline application or app-store release.

## Windows

`MathLens-0.2.0-alpha.1-windows-x64-unsigned.exe` is a real NSIS installer. It is unsigned, so Windows may show publisher/reputation warnings. Do not disable platform protections. The workflow installs it into an isolated Windows runner and verifies the hosted workspace, calculation API and absence of renderer Node access.

## Linux

`MathLens-0.2.0-alpha.1-linux-x86_64.AppImage` is a real x86_64 AppImage. Mark it executable before launching. GTK/NSS and AppImage/FUSE support may be needed. The workflow smoke-tests the packaged Electron executable under Xvfb. That CI-only test uses --no-sandbox because of the hosted runner constraints; the distributed client requests the renderer sandbox by default. A broad Linux distribution matrix is not verified.

## Android

`MathLens-0.2.0-alpha.1-android-debug.apk` is a real, debug-signed APK for Android 8.0 and later with an up-to-date Android System WebView. The debug package ID is dev.mathlens.app.debug. It is intended for direct testing, not Google Play. The workflow verifies its manifest/signature and launches it in an Android 15 emulator. Debug signing is temporary per runner; upgrades across builds may require uninstalling the earlier debug app. No production signing key is committed.

## iOS

Coming Soon. No iOS binary is provided.

## Documentation and checksums

The editable PowerPoint and matching PDF explain the product, mathematical methods, architecture, setup, security boundaries and remaining work. SHA256SUMS.txt covers the actual native packages, documents and Node web-runtime archive. Source code is available in this repository at the release tag.

## Known limitations

Supabase remains dependent on owner environment/redirect/email configuration. Complete email confirmation/recovery in a regular browser; the Android client does not register deep-link callbacks. Android result-file downloads are not integrated: use “Open in browser” from the app menu for exports. Puzzle progress is browser/client-local and does not sync across installations. No offline computation, auto-updater, native notifications, store publishing or signed production distribution is claimed. See DISTRIBUTION.md and REFINEMENT_AUDIT.md.
