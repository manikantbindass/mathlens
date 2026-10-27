# Distribution status

## Native client implementation update

The repository now contains `apps/desktop` (Electron) and `apps/android` (Java WebView). These are experimental **online clients** for https://mathlens-wine.vercel.app. They reuse the deployed web application and hosted computation APIs. They do not bundle an offline Node server or claim offline operation.

`.github/workflows/native-release.yml` runs quality checks, builds a Windows NSIS installer, installs and smoke-tests it, builds a Linux AppImage and tests its packaged executable under Xvfb, then builds a real Android debug APK, runs its emulator test, and verifies its signature/manifest. A publish job requires all platform jobs to succeed and generates SHA256 checksums. The latest actual release/workflow is the authority for build availability.

### Local native builds

- Desktop prerequisites: Node 24, internet for Electron tooling downloads, and a supported Windows or Linux host. Run `npm ci` in `apps/desktop`, followed by `npm run package:win` or `npm run package:linux`. Packages appear in `apps/desktop/dist`. Windows binaries are unsigned. Linux AppImage runtime support varies by distribution.
- Android prerequisites: JDK 17, Android SDK platform/build-tools 35, and Gradle 8.11.1. Run `gradle -p apps/android :app:assembleDebug :app:lintDebug`. The APK appears at `apps/android/app/build/outputs/apk/debug/app-debug.apk`. For repeatable supported-host builds, use the supplied GitHub workflow rather than an unconfigured local SDK.
- Android minimum version: Android 8.0 (API 26). Debug application ID: `dev.mathlens.app.debug`. Debug signing is for testing only and can change between hosted runners. No production keystore is committed.

### Limits of these clients

Both require the hosted service and internet. No auto-updater or store publication exists. On Android, use the native app menu's **Open in browser** for JSON downloads and email verification/recovery; the app does not intercept blob-file exports or register deep-link callbacks. Local progress is separate in each browser/client. Supabase still requires owner configuration. iOS remains **Coming Soon**.

The Linux CI smoke test uses `--no-sandbox` only under the hosted runner's Xvfb restrictions. The distributed Electron client enables renderer sandboxing and disables Node integration. No local user security setting is changed by the build scripts.

## Availability

| Platform | Build verification | Download |
| --- | --- | --- |
| Web | Runtime build and API tests passed | [Hosted workspace](https://mathlens-wine.vercel.app) |
| Windows x64 | Installer built, installed, and launch/API smoke test passed in CI | [v0.2.0-alpha.1 prerelease](https://github.com/manikantbindass/MathInsightAI-Explainable-Math-AI-Model-Analyzer/releases/tag/v0.2.0-alpha.1) |
| Linux x86_64 | AppImage built; packaged executable smoke test passed in CI | Same published prerelease |
| Android 8+ | APK build, lint, Android 15 emulator test, and signature verification passed | Same published prerelease |
| iOS | Coming Soon | None |

Native source, icons, build configuration, and acceptance checks are committed. The initial release passed all three platform jobs and is publicly available. The workflow gates future publication on every required check. [Successful build and publication run](https://github.com/manikantbindass/MathInsightAI-Explainable-Math-AI-Model-Analyzer/actions/runs/40572776386). No production signing credentials are committed. Android uses temporary debug signing and Windows is unsigned.

## Build requirements and future distribution

The chosen clients use the hosted backend rather than bundling the Node runtime. Desktop builds use Electron and electron-builder; Android uses a Java WebView application with Android Gradle Plugin 8.9.2. This keeps the existing web stack and API behavior intact.

Production distribution still needs stable owner-managed signing, broader device and operating-system verification, an update policy, and appropriate store provisioning. Apple builds require a supported Apple build environment, Xcode, signing and provisioning. No iOS binary, .deb package, or store release is claimed.
