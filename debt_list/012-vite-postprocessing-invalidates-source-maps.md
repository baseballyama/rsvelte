# P1 — Vite plugin mutates compiled JavaScript without updating its map

Category: source maps / Vite compatibility

Evidence: HMR partial accept replaces generated call text (`apps/npm/vite-plugin-svelte/src/utils/compile.js:110-117`), and emitted CSS appends an import to `compiled.js.code` while a TODO acknowledges the map is not updated (`:135-142`). Map normalization occurs after the HMR replacement but no mapping edit accompanies either mutation.

Impact: dev-server diagnostics, breakpoints, and chained Vite transforms receive a map whose generated coordinates no longer describe the returned code.

Remediation: express both edits through a mapping-aware string editor or emit them as a separate Vite transform with a composed map; avoid matching compiler output text for HMR semantics.

Acceptance: decoded mappings after both features point to the same original tokens as a no-postprocess compile, including lines after the injected code.
