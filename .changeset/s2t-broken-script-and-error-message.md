---
"@rsvelte/svelte2tsx": patch
---

Keep applying the script transforms when a component's instance script does not parse, which is the state a file is in while it is being typed. Official's transform is TypeScript-based and error-tolerant; oxc discards the AST on a fatal error, so `export` was left unblanked (the prop missing from `props`, `bindings` and the `__sveltets_2_partial` list) and a `$:` block was not wrapped in `;() => { … }`. rsvelte now repairs an unterminated statement — writing the line break the source omits, in place, so every span still lines up — and re-parses. svelte2tsx errors also no longer carry a `Parse error: ` / `Template error: ` / `Script error: ` prefix or the raw error code: upstream throws the svelte compiler's own message, and anything that surfaces the string (`rsvelte-check`, the language server, an editor's problems pane) showed a sentence the official tooling never produces.
