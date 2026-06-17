# esrap port — upstream-relevant findings

Notes gathered while porting the upstream [esrap](https://github.com/sveltejs/esrap)
printer and its full test suite to `crates/rsvelte_esrap` (pinned to esrap
`v2.2.11`, vendored at `submodules/esrap`). These are observations about the
**upstream** projects (esrap, oxc) — not rsvelte bugs — recorded so they can be
acted on upstream if desired.

## 1. oxc JS parser does not expose comment `loc` (oxc#13285)

esrap's own sample suite (`test/esrap.test.js`) runs every sample through two
parsers — acorn (baseline) and `oxc-parser` — but **skips the snapshot and
sourcemap assertions for the oxc parser** with this comment:

> `oxc-parser` currently still does not provide `loc` information for comments
> (https://github.com/oxc-project/oxc/pull/13285), so running the tests for oxc
> parser results in about 20 test failures.

This is purely a limitation of the **JavaScript** `oxc-parser` package's comment
output. The **Rust** `oxc_parser` crate *does* surface comment spans, so this
port (`rsvelte_esrap`, parsing with Rust oxc) reproduces every esrap sample
**byte-for-byte — 97/97**, including the comment-heavy samples the JS oxc path
has to skip.

**Upstream opportunity (oxc):** finishing oxc#13285 (comment `loc`/positions in
the JS parser output) would let esrap drop the `skipSnapshot`/`skipMap` flags on
its oxc parser path and assert full parity there too — exactly the parity this
Rust port already demonstrates is achievable from the same AST + comment data.

## 2. oxc preserves parentheses; acorn (esrap's baseline) elides them

esrap parses with acorn, which by default does **not** emit `ParenthesizedExpression`
nodes — so esrap never sees explicit parens and recomputes every parenthesis from
operator precedence in `needs_parens`. oxc instead preserves explicit parens as
`ParenthesizedExpression` nodes.

This is not a bug in either project, but it is the one **behavioural gotcha** for
anyone printing an oxc AST with an esrap-faithful printer: to match esrap's output
byte-for-byte you must unwrap `ParenthesizedExpression` and let precedence re-add
only the grammar-required parens (see `unparen` + `needs_parens` in
`crates/rsvelte_esrap/src/printer.rs`). The one exception is a paren span that
contains a comment, which must be preserved so the comment can't escape the
expression (`return (/* c */ x)`). Documented here so future oxc-based esrap
ports don't rediscover it the hard way.

## 3. esrap's string `quote()` does not escape tabs (intentional)

esrap's `quote()` escapes only `\`, the active quote character, `\n`, and `\r`;
a literal tab is emitted verbatim. This port matches that exactly. Noted only
because a naive escaper (escaping `\t` as well) diverges from esrap on
synthesized string literals that lack a preserved `raw`.

---

_No defect requiring an upstream code change was found in esrap itself; its
behaviour was matched faithfully. The actionable upstream item is oxc#13285
(item 1)._
