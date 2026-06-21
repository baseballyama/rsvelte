---
"@rsvelte/compiler": patch
---

Phase-3 server: switch SSR code generation to a pure oxc-AST + `rsvelte_esrap`
pipeline (`server/ast/`) by default, replacing the text-based
`ServerCodeGenerator` (now retained only behind `RSVELTE_SERVER_TEXT=1` as a
transitional opt-out, slated for deletion). The new pipeline matches the official
Svelte compiler byte-for-byte across the entire runtime suite (runtime-runes
993/993, runtime-legacy 1205/1205, hydration 77/77), the byte-exact
`compiler_fixtures` / `ssr` snapshots, and 100% of every compatibility-report
category (SSR 97/97, snapshot 29/29, …). This completes the server side of the
Phase-3 AST refactor (`docs/phase3-server-ast-remaining-work.md`). SSR output is
equal-or-closer to the official compiler; the corpus baseline should be
re-verified post-merge.
