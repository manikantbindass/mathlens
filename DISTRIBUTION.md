# Distribution status

## Native client implementation update

The repository now contains `apps/desktop` (Electron) and `apps/android` (Java WebView). These are experimental **online clients** for https://mathlens-wine.vercel.app. They reuse the deployed web application and hosted computation APIs. They do not bundle an offline Node server or claim offline operation.

`.github/workflows/native-release.yml` runs quality checks, builds a Windows NSIS installer, installs and smoke-tests it, builds a Linux AppImage and tests its packaged executable under Xvfb, then builds a real Android debug APK, runs its emulator test, and verifies its signature/manifest. A publish job requires all platform jobs to succeed and generates SHA256 checksums. The latest actual release/workflow is the authority for build availability; the earlier table below describes the initial state before this implementation.

### Local native builds

- Desktop prerequisites: Node 24, internet for Electron tooling downloads, and a supported Windows or Linux host. Run `npm ci` in `apps/desktop`, followed by `npm run package:win` or `npm run package:linux`. Packages appear in `apps/desktop/dist`. Windows binaries are unsigned. Linux AppImage runtime support varies by distribution.
- Android prerequisites: JDK 17, Android SDK platform/build-tools 35, and Gradle 8.11.1. Run `gradle -p apps/android :app:assembleDebug :app:lintDebug`. The APK appears at `apps/android/app/build/outputs/apk/debug/app-debug.apk`. For repeatable supported-host builds, use the supplied GitHub workflow rather than an unconfigured local SDK.
- Android minimum version: Android 8.0 (API 26). Debug application ID: `dev.mathlens.app.debug`. Debug signing is for testing only and can change between hosted runners. No production keystore is committed.

### Limits of these clients

Both require the hosted service and internet. No auto-updater or store publication exists. On Android, use the native app menu's **Open in browser** for JSON downloads and email verification/recovery; the app does not intercept blob-file exports or register deep-link callbacks. Local progress is separate in each browser/client. Supabase still requires owner configuration. iOS remains **Coming Soon**.

The Linux CI smoke test uses `--no-sandbox` only under the hosted runner's Xvfb restrictions. The distributed Electron client enables renderer sandboxing and disables Node integration. No local user security setting is changed by the build scripts.

| Platform | Status | Artifact |
| --- | --- | --- |
| Web | Local runtime bundle, build verified | `dist/` after npm run build |
| Windows | Planned | None |
| Linux | Planned | None |
| Android | Planned | None |
| iOS | Coming Soon | None |

No installer, APK, AppImage, .deb or signed application exists. No fake download links or placeholder binaries are included.

## Packaging evaluation

A shared web UI is appropriate, but the Node computation server is not automatically available inside a Tauri mobile shell. A future implementation must either move bounded computations behind a shared adapter that works locally in the webview, or connect the shell to a secured backend. CSP and navigation policies must be reviewed for the chosen runtime. Do not simply point native packaging at `dist/`, which contains a Node server rather than static native assets.

Tauri 2 is a candidate, not an installed dependency. Consult the [official distribution documentation](https://v2.tauri.app/distribute/) at implementation time. Windows requires a supported Rust/WebView2 toolchain and installer verification on a clean machine. Linux needs native GTK/WebKit dependencies and platform package checks. Android needs the supported Android SDK/NDK, JDK, emulator/device tests and explicit debug/release signing. Apple platforms require a supported Apple build environment, Xcode and signing/provisioning.

No Rust, Android or Apple project has been generated or tested here. Signing keys must remain outside source control. Release configuration currently packages the actual web source bundle only; native matrix jobs should be added once their source configuration and acceptance tests exist.
