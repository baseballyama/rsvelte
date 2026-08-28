# lint-adversarial-fix-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-fix.mjs` compares, per pattern under
`compatibility/lint-adversarial/`, the **text `--fix` produces** with only the
rule its directory names enabled — the real `eslint-plugin-svelte` as oracle,
native `rsvelte-lint` as subject, both working on copies.

A fix appears in no other comparison this project runs. `lint-adversarial.mjs`
and `lint-verify.mjs` key on `(ruleId, line, column, message)`, which cannot see
an edit at all: a rule can report at exactly the right position and still write
the wrong replacement text, or write correct text over the wrong range.
`lint-adversarial-suggest.mjs` compares suggestions, which by definition are the
edits `--fix` never applies. Upstream's own fixtures gate this only for the
shapes upstream ships (`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`,
`*-output.svelte`).

Fixes are compared one rule at a time rather than with the whole universe
enabled, because ESLint resolves overlapping fixes *across* rules by a
scheduling policy that belongs to ESLint's driver rather than to any rule's
port. Within a rule both sides multi-pass to a fixpoint (10 passes, ESLint's
`Linter.verifyAndFix` bound; `runner.rs::fix_all` mirrors it), so an entry here
can be a difference in what a *later* pass sees rather than in any single edit —
and the remaining cause below is exactly that.

An entry needs a reason that is *not* "rsvelte is wrong here".

`lint-adversarial-fix-known-failures.json` holds **1 entry**.

Partition of `lint-adversarial-fix-known-failures.json` by cause: `1`

| cause | entries |
|---|---|
| upstream autofix defect we decline to reproduce | 1 |

The gate found one defect no other lint gate could have: a rule's *fix* path and
its *report* path had two different notions of whitespace.
`prefer-class-directive` reported through `js_whitespace` (JS semantics, U+FEFF
included) but trimmed through Rust's `str::trim*` (Unicode `White_Space`, U+FEFF
excluded), so a `class` value padded with U+FEFF was reported at the same
position on both sides and rewritten differently. That split is invisible to
every gate keyed on `(ruleId, line, column, message)` by construction. Both paths
now go through `js_trim` / `js_trim_start` / `js_trim_end`.

## Accepted entries

### `shorthand-directive/16-never-mode-modifiers.svelte` `svelte/shorthand-directive`

**Upstream's fix corrupts the file, and rsvelte's does not.** Reported in
[`upstream_issues/eslint-plugin-svelte-shorthand-directive-modifier.md`](../upstream_issues/eslint-plugin-svelte-shorthand-directive-modifier.md).

**Mechanism.** `shorthand-directive.ts:51-61` expands a shorthand directive with
`fixer.insertTextAfter(node.key.name, '={' + node.key.name.name + '}')`. A
directive key is name **plus modifiers**, and `node.key.name` is only the name,
so on `style:color|important` the insertion lands between the two. From
`svelte-eslint-parser` on `<div style:color|important>`:

| node | range | text |
|---|---|---|
| the directive / `node.key` | `[5, 26]` | `style:color\|important` |
| `node.key.name` | `[11, 16]` | `color` |

so the value goes in at 16:

```svelte
<div style:color|important>…</div>
<!-- upstream --fix → --> <div style:color={color}|important>…</div>
<!-- rsvelte  --fix → --> <div style:color|important={color}>…</div>
```

**Evidence that upstream's output is the broken one.** Checking that it parses
is not enough — it does, which is what makes it dangerous. `svelte/compiler`
`parse(src, { modern: true })` gives the fixed element a single `StyleDirective`
named `color` with `modifiers: []`: the `|important` text has been absorbed into
the directive's *value*. `compile(..., { generate: 'client' })` on the two:

| source | generated |
|---|---|
| `<div style:color\|important>` | `$.set_style(div, '', {}, [{}, { color }]);` |
| `<div style:color={color}\|important>` | `$.set_style(div, '', {}, { color: 'red\|important' });` |

The first sets `color` in the `!important` bucket. After upstream's fix the
declaration is no longer important *and* its value is the invalid CSS token
`red|important`, which the browser drops. A `type: 'layout'` autofix has changed
what the component renders, silently.

**Positive control.** The failure is the range, not the rule or its
`prefer: "never"` arm. The same file's `<input bind:value />` →
`bind:value={value}` and `<div class:active>` → `class:active={active}` are
byte-identical on both sides; only the line whose key carries a modifier
diverges.

**Why we do not reproduce it.** The precedent for reproducing an upstream defect
(#2990, `client/dead_comments.rs`) is about a *compiler output byte*, where
reproducing costs the user nothing and buys byte parity. This is a `--fix`,
which rewrites the user's source in place, and the damage is invisible: the file
still parses, the linter goes quiet, and a style declaration stops applying. It
is the same call this branch already made for
`svelte/no-add-event-listener`'s suggestion
([`lint-adversarial-suggest-known-failures.md`](lint-adversarial-suggest-known-failures.md)),
and for the same reason — text that parses and is wrong is worse than text that
does not parse, because nothing downstream catches it.

**Reach.** Across the 6,788 real-world sources `lint-verify.mjs` grades, exactly
one file contains a shorthand `style:` directive with a modifier
(`svelte-eslint-parser`'s own `style-directive03-input.svelte`), and it is not
linted with `prefer: "never"` — the rule defaults to `off` and, when enabled,
to `prefer: "always"`, whose arm removes from the `=` onwards and leaves
modifiers untouched. Only a generated adversarial pattern reaches this arm.
