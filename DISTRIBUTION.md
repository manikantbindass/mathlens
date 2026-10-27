# Distribution status

## Native client implementation update

The repository now contains `apps/desktop` (Electron) and `apps/android` (Java WebView). These are experimental **online clients** for https://mathlens-wine.vercel.app. They reuse the deployed web application and hosted computation APIs. They do not bundle an offline Node server or claim offline operation.

`.github/workflows/native-release.yml` runs quality checks, builds a Windows NSIS installer, installs and smoke-tests it, builds a Linux AppImage and tests its packaged executable under Xvfb, then builds a real Android debug APK, runs its emulator test, and verifies its signature/manifest. A publish job requires all platform jobs to succeed and generates SHA256 checksums. The latest actual release/workflow is the authority for build availability.

### Local native builds

- Desktop prerequisites: Node 24, internet for Electron tooling downloads, and a supported Windows or Linux host. Run `npm ci` in `apps/desktop`, followed by `npm run package:win` or `npm run package:linux`. Packages appear in `apps/desktop/dist`. Windows binaries are unsigned. Linux AppImage runtime support varies by distribution.
- Android prerequisites: JDK 17, Android SDK platform/build-tools 35, and Gradle 8.11.1. Run `gradle -p apps/android :app:assembleDebug :app:lintDebug`. The APK appears at `apps/android/app/build/outputs/apk/debug/app-debug.apk`. For repeatable supported-host builds, use the supplied GitHub workflow rather than an unconfigured local SDK.
- Current Android client minimum version: Android 15 (API 35), version 0.2.0-alpha.2 / code 3. The older 0.2.0-alpha.1 release retains its historical Android 8+ package. Debug application ID: `dev.mathlens.app.debug`. Debug signing is for testing only and can change between hosted runners. No production keystore is committed.

### Limits of these clients

Both require the hosted service and internet. No auto-updater or store publication exists. On Android, use the native app menu's **Open in browser** for JSON downloads and email verification/recovery; the app does not intercept blob-file exports or register deep-link callbacks. Local progress is separate in each browser/client. Supabase still requires owner configuration. iOS remains **Coming Soon**.

The Linux CI smoke test uses `--no-sandbox` only under the hosted runner's Xvfb restrictions. The distributed Electron client enables renderer sandboxing and disables Node integration. No local user security setting is changed by the build scripts.

## Availability

| Platform | Build verification | Download |
| --- | --- | --- |
| Web | Runtime build and API tests passed | [Hosted workspace](https://mathlens-wine.vercel.app) |
| Windows x64 | Installer built, installed, and launch/API smoke test passed in CI | [v0.2.0-alpha.1 prerelease](https://github.com/manikantbindass/mathlens/releases/tag/v0.2.0-alpha.1) |
| Linux x86_64 | AppImage built; packaged executable smoke test passed in CI | Same published prerelease |
| Android 15+ | APK build, lint, Android 15 and 16 emulator launch/calculation tests, and signature verification | [Android-specific release](https://github.com/manikantbindass/mathlens/releases/tag/android-v0.2.0-alpha.2) |
| iOS | Coming Soon | None |

Native source, icons, build configuration, and acceptance checks are committed. The initial release passed all three platform jobs and is publicly available. The workflow gates future publication on every required check. [Successful build and publication run](https://github.com/manikantbindass/mathlens/actions/runs/40572776386). No production signing credentials are committed. Android uses temporary debug signing and Windows is unsigned.

## Build requirements and future distribution

The chosen clients use the hosted backend rather than bundling the Node runtime. Desktop builds use Electron and electron-builder; Android uses a Java WebView application with Android Gradle Plugin 8.9.2. This keeps the existing web stack and API behavior intact.

Production distribution still needs stable owner-managed signing, broader device and operating-system verification, an update policy, and appropriate store provisioning. Apple builds require a supported Apple build environment, Xcode, signing and provisioning. No iOS binary, .deb package, or store release is claimed.

## Android 15+ rebuild

The current Android-only workflow is `.github/workflows/android-release.yml`. It requires Android 15+ (minimum SDK 35), compiles and targets SDK 35, and runs installation, hosted UI, and real calculation checks on API 35 and API 36 emulators. Its publication job verifies an anonymous download and compares the downloaded APK byte-for-byte with the built file. [Build and download verification](https://github.com/manikantbindass/mathlens/actions/runs/40579499663).

The Android client has its own version, 0.2.0-alpha.2. The web and desktop versions remain 0.2.0-alpha.1. Use the explicit Android release/download links; GitHub's stable `/releases/latest` endpoint does not select prereleases. [Android installation notes](ANDROID_RELEASE_NOTES.md).
