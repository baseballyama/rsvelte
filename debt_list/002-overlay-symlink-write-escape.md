# P1 — svelte-check overlay follows symlinks outside the workspace

Category: security / filesystem

Evidence: `materialize_overlay_with` constructs `.svelte-check/svelte` by joining paths and immediately creates/writes beneath it (`crates/rsvelte_check/src/svelte_check/overlay.rs:458-469,585-600,678-690`). It neither rejects an existing symlink nor revalidates canonicalized output paths against the workspace/cache root.

Impact: a repository containing `.svelte-check/svelte` as a symlink can make a user, CI job, or editor write generated TSX, declarations, and maps to an arbitrary writable location outside that repository, potentially overwriting existing files.

Remediation: reject symlinks in every cache path component, create the cache with no-follow semantics, canonicalize the final parent, and enforce confinement before every write. Prefer atomic create-and-rename.

Acceptance: a fixture whose cache directory and a nested output directory are symlinks must fail safely and must not create or change any file outside the workspace.
