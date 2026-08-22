---
"@rsvelte/compiler": patch
---

Report a template slot's JS failure the way the official compiler does, in the five slots that never classified it. Upstream parses ONE maximal expression and hands what is left to `eat('}', true)`, so leftover input is `expected_token` and a broken expression is `js_parse_error`; the `{#await}` head, `{@debug}`, `{@const}`, `{@render}` and the `read_pattern` positions (`{#each … as p}`, its index, `{:then}` / `{:catch}`) each answered that question themselves or not at all. `{#await a b}`, `{#each a as b c}`, `{#each a as b, i j}`, `{#await p}{:then v w}{/await}`, `{@debug a b}` and `{@const a}` compiled with the extra token silently dropped, and `{@render s(a +)}` / `{@const a = a1 +}` reported a syntax error as a later-phase *placement* rule with no span.
