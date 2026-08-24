---
"@rsvelte/compiler": patch
---

Follow Svelte 5.56.10. CSS type selectors keep their `namespace`, so `svg|circle`, `*|circle`, `svg|*` and `*|*` parse and are scoped as `svg|*.svelte-xyz` rather than having the universal selector replaced by the modifier; selector names decode their escape sequences at parse time and are re-escaped when printed, so `#\31\32\33` round-trips as `#\31 23` instead of as invalid CSS; and `:nth-child(2n of.a)` no longer needs whitespace after `of`.

Two defects the new fixtures reached rather than caused are fixed with them. `print()` re-emitted the whole `<style>` body from the source text whenever it carried no CSS comment, so the CSS visitors were unreachable for any stylesheet — the AST path is now the only path, and `@font-face` (whose declarations the CSS parser reads as selectors) keeps its source recovery but writes through the printer's indentation. And the `of S` part of an `:nth-*()` argument is parsed as a full selector list, so `:nth-child(2n of .a, .b)` is accepted instead of raising `css_expected_identifier`.

Finally, a logical assignment to a private `$state` field short-circuits: `this.#a ||= v` compiled to an unconditional `$.set(this.#a, $.get(this.#a) || v)`, which ran the setter on the branch that must not assign.
