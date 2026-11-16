---
'@rsvelte/lint': patch
'@rsvelte/language-server': patch
'@rsvelte/svelte-check': patch
---

rsvelte-lint compiles each component with its project's Svelte `compilerOptions` (`experimental.async`, `runes`), read the way rsvelte-check reads them: from the nearest `svelte.config.*` / `vite.config.*` above the file, including inline `svelte({ compilerOptions })` / `sveltekit({ compilerOptions })` options. Top-level `await` in a project that enables `experimental.async` is no longer an `experimental_async` error, and the compiler's other warnings (a11y and the rest) for such a component are reported again. The language server lints with the same options. rsvelte-check's reader moved into a shared crate; its behaviour is unchanged.
