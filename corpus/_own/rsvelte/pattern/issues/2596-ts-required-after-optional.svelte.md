# `2596-ts-required-after-optional.svelte`

**Issue:** [#2596](https://github.com/baseballyama/rsvelte/pull/2596)

A TypeScript rule OXC enforces while parsing a **complete** AST and the official parser does not — a required parameter after an optional one. Type stripping must not bail on it: unfixed, the client emits `(a: string, …)` and `$.prop($$props, 'n: number', …)`, and the **server drops the entire instance script** while still emitting parseable output — a silent-wrong-output failure no parse gate can see, which is why it is pinned here. The fmt oracle cannot format this file (oxfmt is built on the same parser), so `fmt.mjs` skips it as not-formattable rather than comparing it
