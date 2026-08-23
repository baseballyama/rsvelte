---
"@rsvelte/compiler": patch
---

Locate the `export` and `class` keywords by the keyword, not by the keyword plus exactly one ASCII space. Phase 3 searched for the literal bytes `"export let"`, `"export "` and `"class "`, so any other separator — a second space, a tab, a line break, or a non-ASCII JS whitespace character such as `U+00A0`, `U+FEFF` or `U+3000` — made the construct invisible to the transform. `export⟨tab⟩let a = 1` then survived verbatim into the component function, where no JS parser accepts it and the prop was never wired to `$$props`; `class⟨tab⟩K { v = $state(1) }` kept `$state` as a free identifier because its class fields were never lowered. The separator is now any run of JS whitespace, tested with the parser's own predicate (Rust's `char::is_whitespace` excludes `U+FEFF`, which JS includes), and the client class lowering takes its header from the shared lexical scan that already refuses a `class ` written inside a comment or a string.
