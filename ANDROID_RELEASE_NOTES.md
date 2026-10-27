# MathLens Android 15+ testing release

Download **MathLens-0.2.0-alpha.2-android15plus-debug.apk** from this release's Assets. Use the direct APK link rather than GitHub's `/releases/latest/download/` route: this is a prerelease.

## Requirements and installation

- Android 15 or newer (minimum SDK 35), an updated Android System WebView, and internet access.
- Download the `.apk` file itself using a regular browser. GitHub's source-code ZIP is not an Android installer.
- Open the downloaded APK using Android's package installer and follow its normal prompts. This is debug-signed testing software, not a Google Play or production-signed release.
- If Android reports a signature conflict with the earlier alpha, the old runner-generated debug certificate differs. Export any needed browser-local data before uninstalling the earlier `dev.mathlens.app.debug` test app; uninstalling removes its local data. Then install this APK. Never disable Play Protect or other platform protections.

## Changes and verification

The Android package now requires Android 15+, uses version code 3, and preserves the existing hosted MathLens workspace. The build runs lint, installs and launches the actual APK on Android 15 and Android 16 emulators, checks the hosted overview, verifies a real calculation API response, and checks that there is no native JavaScript bridge. APK signature and manifest checks verify the package identity, version, minimum SDK, and target SDK. Publication requires both emulator jobs. A final anonymous HTTPS download is byte-compared against the built APK and its SHA256 checksum.

## Limits

This is an online WebView client for https://mathlens-wine.vercel.app, not an offline mathematics engine. Account sign-in still depends on owner Supabase configuration. Use the app's **Open in browser** menu for email verification and result-file exports. Progress remains local to each client. Windows and Linux packages remain in the earlier cross-platform release. The debug signing certificate can differ between builds; stable upgrade signing and store publication are future work.

SHA256SUMS.txt identifies the APK. android-manifest.txt records its package and SDK metadata.
