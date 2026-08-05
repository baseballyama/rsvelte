# @rsvelte/language-server-darwin-x64

## 0.4.0

### Minor Changes

- 3c25cd9: Ship the native Rust `rsvelte-language-server` as per-platform npm packages and prefer it from the `@rsvelte/language-server` launcher.

  The launcher's `rsvelte-language-server` bin now resolves the prebuilt binary from the optional `@rsvelte/language-server-<triple>` dependency and execs it, falling back to the bundled JS server when no platform package is installed. `RSVELTE_LANGUAGE_SERVER_BIN` overrides the binary path and `RSVELTE_LANGUAGE_SERVER_JS=1` forces the JS fallback.
