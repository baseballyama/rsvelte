---
'@rsvelte/language-server': minor
'@rsvelte/language-server-darwin-arm64': minor
'@rsvelte/language-server-darwin-x64': minor
'@rsvelte/language-server-linux-arm64-gnu': minor
'@rsvelte/language-server-linux-x64-gnu': minor
'@rsvelte/language-server-win32-x64-msvc': minor
---

Ship the native Rust `rsvelte-language-server` as per-platform npm packages and prefer it from the `@rsvelte/language-server` launcher.

The launcher's `rsvelte-language-server` bin now resolves the prebuilt binary from the optional `@rsvelte/language-server-<triple>` dependency and execs it, falling back to the bundled JS server when no platform package is installed. `RSVELTE_LANGUAGE_SERVER_BIN` overrides the binary path and `RSVELTE_LANGUAGE_SERVER_JS=1` forces the JS fallback.
