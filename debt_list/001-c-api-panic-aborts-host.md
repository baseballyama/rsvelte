# P0 — C ABI compiler panics abort the embedding process

Category: security / availability / FFI

Evidence: the release profile sets `panic = "abort"` (`Cargo.toml:25-31`), and both C API release workflows build `rsvelte_capi` with `--release` (`.github/workflows/capi.yml:116-122`, `.github/workflows/release-capi.yml:105-110`). The exported functions call compiler code directly (`crates/rsvelte_capi/src/lib.rs:243-264`) with no panic boundary. Unlike N-API, lint, and LSP, no unwind-enabled C API profile exists.

Impact: any reachable compiler panic terminates every host process using the shared/static library. Untrusted Svelte input can therefore turn a compiler defect into denial of service in a server, editor, build daemon, or language binding.

Remediation: add a `dist-capi` profile with `panic = "unwind"`, wrap every exported operation in `catch_unwind`, translate the payload into the documented error envelope, and build releases with that profile.

Acceptance: a test-only forced panic through each exported entry point returns an error envelope and leaves the foreign-process smoke test alive on Linux, macOS, and Windows.
