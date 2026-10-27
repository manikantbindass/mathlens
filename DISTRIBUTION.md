# Distribution status

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
