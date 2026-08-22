# lint-adversarial-suggest-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-suggest.mjs` compares, per finding
position, the **ordered list of `{desc, text produced by applying that one
suggestion}`** for every pattern under `compatibility/lint-adversarial/`, with
the real `eslint-plugin-svelte` as oracle and native `rsvelte-lint` as subject.

A suggestion is an editor-offered code action that `--fix` never applies, so it
appears in no other comparison this project runs: `lint-adversarial.mjs` and
`lint-verify.mjs` key on `(ruleId, line, column, message)`, and
`lint-adversarial-fix.mjs` compares the text `--fix` produces — which by
definition excludes every suggestion. The comparison is on the resulting TEXT
rather than the edit range, because ESLint's ranges are UTF-16 code units into a
JS string and rsvelte's are UTF-8 byte offsets, so equal edits have unequal
coordinates.

An entry needs a reason that is *not* "rsvelte is wrong here".
`lint-adversarial-suggest-known-failures.json` currently holds 3 entries.

## Accepted entries

### `no-add-event-listener/06-comment-as-decoy.svelte` `svelte/no-add-event-listener 3:3`
### `no-add-event-listener/13-optional-and-computed.svelte` `svelte/no-add-event-listener 6:3`

Upstream offers a suggestion whose result is broken code; rsvelte offers none.
Both are the same upstream defect, reported in
[`upstream_issues/eslint-plugin-svelte-no-add-event-listener-suggestion.md`](../upstream_issues/eslint-plugin-svelte-no-add-event-listener-suggestion.md).

**Mechanism.** `no-add-event-listener.ts:46-58` builds its fix from
`const openParen = context.sourceCode.getTokenAfter(callee)` and then
`fixer.insertTextAfter(openParen, `${target}, `)`. `getTokenAfter` returns
whatever token follows the callee; the variable is only *named* `openParen` and
the guard tests it for `null`, never for `(`. When some other token sits there,
the argument list is inserted in the wrong place.

**What upstream produces**, reproduced through ESLint's `Linter.verify` with the
pinned plugin and each suggestion's single range applied:

| pattern | token after the callee | suggested output |
|---|---|---|
| `06-comment-as-decoy` 3:3 | the `)` closing the parenthesised callee | `(on /* alias as any */)handlers, ('x', () => {});` |
| `13-optional-and-computed` 6:3 | `?.` | `on?.el, ('a', () => {});` |

**Positive control that this is the token and not the rule.** Two other calls in
`13-optional-and-computed` get correct suggestions and are byte-identical on both
sides — 8:3 `el[addEventListener]('c', …)` → `on(el, 'c', …)` and 10:3
`new EventTarget().addEventListener('e', …)` → `on(new EventTarget(), 'e', …)`.
rsvelte declines exactly on the two shapes where upstream's assumption fails, and
nowhere else.

**Why we do not reproduce it.** The precedent for reproducing an upstream defect
(#2990, `client/dead_comments.rs`) is about a *compiler output byte*, where
reproducing costs the user nothing and buys byte parity. A suggestion is an edit
a human applies in their editor, so reproducing it means shipping a quick-fix
that breaks the file — and this project already refuses to treat "text no JS
parser accepts" as one more mismatch, which is why the shape-matrix gate has an
`output-unparseable` verdict of its own rather than folding it into
`js-mismatch`.

`13-optional-and-computed` is the **stronger** half of that argument, not the
weaker. `on?.el, ('a', () => {})` parses: it is a sequence expression that
evaluates `on?.el`, discards it, evaluates `('a', () => {})`, discards that, and
never registers a listener. No parse gate anywhere would catch it.

Neither shape occurs in published code: `lint-verify.mjs` over 6,788 real-world
sources reports zero instances.

**What rsvelte does instead.** `find_open_paren`
(`crates/rsvelte_lint/src/rules/no_add_event_listener.rs`) returns `None` unless
the next token is `(`, and no suggestion is offered. It does skip both `/* … */`
and `// …` comments on the way, because `getTokenAfter` skips comments and a `//`
between a callee and its `(` is legal — the `(` continues the expression, so ASI
does not fire. `no-add-event-listener/17-line-comment-before-paren.svelte` is the
pattern for that half, and both compilers agree on it.

### `html-closing-bracket-new-line/05-script-style-tags.svelte` `svelte/block-lang 7:1`

Not an independent divergence: it restates the report-level entry of the same
name in
[`lint-adversarial-known-failures.md`](lint-adversarial-known-failures.md).
`svelte-eslint-parser` builds no `SvelteStyleElement` for a `</style⏎⏎>` end
tag, so upstream's rule never runs and offers no suggestion, while rsvelte's
parser recognises the block and reports it — with the suggestion its
`enforceStylePresent` arm carries. The comparison key starts with the finding
position, so a finding only one side reports lands here as an empty list against
a one-element list.

It is listed rather than skipped because the alternative — comparing suggestions
only where the *report* already matches — would silently drop this whole class,
and the class contains real cases: a rule that reports correctly but attaches a
suggestion upstream does not attach would look identical to a rule that does not
report at all. Expect this entry to disappear if the report-level entry is ever
resolved; the ratchet is two-sided, so it will fail rather than rot.
