---
"@rsvelte/svelte-check": patch
---

Fix `--tsgo`/`svelte-check` false `implicit any` on SvelteKit hooks written as
`export const handleFetch = async ({ request, fetch, event }) => {...}`
(the `const` + arrow/function-expression form). Only the function-declaration
form (`export function handleFetch(...) {...}`) was augmented with parameter
and return types before; the `const` form now gets the same treatment.

Also wrap every kit-file type injection (hooks, `load`, `actions`, params,
route methods) in the same `Ωignore` markers the official implementation
uses, so a diagnostic the injected type itself provokes (e.g. an async
hook's `ReturnType<HandleFetch>` tripping TS1064, since `HandleFetch`
returns `MaybePromise<Response>` rather than a literal `Promise<T>`) is
dropped instead of surfacing as a false positive — matching official
svelte-check's `isInGeneratedCode` allowlist.

The arrow form's return type is anchored on the `=>` token, matching the
official implementation's `equalsGreaterThanToken.getStart()` byte-for-byte,
and a parenthesis-less arrow parameter (`export const handleError = e => ...`)
gets wrapped in parentheses so the annotation is syntactically valid.

Fixes #1886.
