# P1 — the native Vite binding detects musl packages that are never shipped

Category: platform compatibility / packaging

Evidence: the loader resolves `linux-x64-musl` and `linux-arm64-musl` on Alpine-like systems (`apps/npm/vite-plugin-svelte-native/index.cjs:14-26`). The package declares only GNU Linux optional dependencies (`apps/npm/vite-plugin-svelte-native/package.json:31-36`), and no musl package exists under `apps/npm`.

Impact: supported-looking detection deterministically ends in “Couldn't load native binding” on Alpine and musl-based distroless images, preventing the Vite plugin from starting.

Remediation: add x64/arm64 musl packages and release jobs, or explicitly reject musl before constructing a nonexistent package name and document it as unsupported.

Acceptance: in Alpine containers for both architectures, installing the published package and compiling a minimal component succeeds; the release manifest verifies every loader triple has an artifact.
