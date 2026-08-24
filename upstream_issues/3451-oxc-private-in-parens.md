# oxc_formatter drops parentheses that a `PrivateInExpression` needs

- **Upstream**: [oxc-project/oxc](https://github.com/oxc-project/oxc), `oxc_formatter`
- **Observed at**: rev `b6f1458dece6bbd7f934d1d26c049d0d0c2bd68c` (the rev this repo pins), reproduced with the published `oxfmt` 0.63.0
- **rsvelte issue**: [#3451](https://github.com/baseballyama/rsvelte/issues/3451)
- **Severity**: the formatted output is a **different program**

## Repro

No rsvelte code is involved — plain `oxfmt` on a `.js` file:

```js
class C {
  static #value;
  static a(o) { return #value in (o || {}); }
  static b(o) { return "k" in (o || {}); }
  static c(o) { return #value in (o ?? {}); }
}
```

```js
// oxfmt --config {"printWidth":80,"tabWidth":2,"useTabs":false}
  static a(o) { return #value in o || {}; }   // ((#value in o) || {})  <- different
  static b(o) { return "k" in (o || {}); }    // correct
  static c(o) { return #value in o ?? {}; }   // ((#value in o) ?? {})  <- different
```

`in` binds tighter than `||`, so `a` now returns `true` or `{}` where the source
returns `true`/`false`.

## Cause

`crates/oxc_formatter/src/parentheses/expression.rs`, `binary_like_needs_parens`
(~L974) maps a binary-like **parent** to `BinaryLikeExpression`:

```rust
AstNodes::BinaryExpression(binary) => BinaryLikeExpression::BinaryExpression(binary),
AstNodes::LogicalExpression(logical) => BinaryLikeExpression::LogicalExpression(logical),
parent if parent.is_call_like_callee_span(binary_like.span()) => return true,
_ => return false,
```

`BinaryLikeExpression` (`crates/oxc_formatter/src/print/binary_like_expression.rs:56`)
has only those two variants, and oxc models `#x in o` as its own
`PrivateInExpression` rather than as a `BinaryExpression` with a
`PrivateIdentifier` left operand (which is how ESTree models it). So a
`PrivateInExpression` parent reaches `_ => return false` and its child is told no
parentheses are needed.

The other direction is the same omission seen from the node itself
(`expression.rs:506`):

```rust
impl NeedsParentheses<'_> for AstNode<'_, PrivateInExpression<'_>> {
    fn needs_parentheses(&self, f: &JsFormatter<'_, '_>) -> bool {
        // ...
        is_class_extends(self.span, self.parent())
            || matches!(self.parent(), AstNodes::UnaryExpression(_))
    }
}
```

A `BinaryExpression` in that position consults `binary_like_needs_parens` and
compares precedences; `PrivateInExpression` checks only `extends` and a unary
parent, so it loses its own parentheses under any tighter operator.

`"k" in (…)` is the discriminating control throughout: identical operator,
identical right operand, but a real `BinaryExpression`, which **is** in the match.

## Measured scope

48 cells — 24 shapes × {`#x in …`, `"k" in …`} — formatted by `oxfmt` and then
re-parsed with acorn, comparing the fully-parenthesised rendering of the parsed
tree rather than the text. **12 changed, all of them private; 0 of the 24
controls changed.**

Right operand of the brand check (`#x in (RIGHT)`):

| RIGHT | printed | re-parses as |
|---|---|---|
| `o \|\| {}` | `#x in o \|\| {}` | `(#x in o) \|\| {}` |
| `o && p` | `#x in o && p` | `(#x in o) && p` |
| `o ?? {}` | `#x in o ?? {}` | `(#x in o) ?? {}` |
| `a ? b : c` | `#x in a ? b : c` | `(#x in a) ? b : c` |
| `o < p` | `#x in o < p` | `(#x in o) < p` |
| `o instanceof P` | `#x in o instanceof P` | `(#x in o) instanceof P` |
| `o \| p` | `#x in o \| p` | `(#x in o) \| p` |
| `o === p` | `#x in o === p` | `(#x in o) === p` |

The brand check as a child (`WRAP((#x in o))`):

| WRAP | printed | re-parses as |
|---|---|---|
| `E * 2` | `#x in o * 2` | `#x in (o * 2)` |
| `E + 1` | `#x in o + 1` | `#x in (o + 1)` |
| `E ** 2` | `#x in o ** 2` | `#x in (o ** 2)` |
| `E.toString()` | `#x in o.toString()` | `#x in o.toString()` |

Correctly left alone: `o = p` and `(o, p)` as right operands (assignment and
sequence are special-cased elsewhere), `o + p` / `o.p` / `o ** p` as right
operands (genuinely redundant parentheses), and `-E`, `E ? a : b`, `E ?? d`,
`E || d`, `E < 1`, `[...E]`, `E in q` as wrappers.

## Suggested fix

Give `BinaryLikeExpression` a `PrivateInExpression` variant (operator `in`,
precedence `Relational`) and add the arm to `binary_like_needs_parens`, so both
directions fall out of the existing precedence comparison.

## What rsvelte does meanwhile

`@rsvelte/fmt` ships `oxc_formatter`, so it inherited this. Because the
formatter-parity corpus uses **oxfmt as its oracle**, a defect inside oxfmt is
reproduced identically on both sides and scores as a match by construction — the
formatter analogue of comparing two ports of one function. No gate could have
seen it, and a brand check appears nowhere in svelte.dev.

`crates/rsvelte_formatter/src/private_in_guard.rs` records the kind of every
brand check's right operand, and `script.rs`'s `print_program_guarded` re-parses
the formatted text and keeps the input when the record changed. It verifies
rather than predicts, so it does not re-implement oxc's precedence rules, and a
program with no brand check takes an empty-record fast path that never
re-parses. Remove it when the oxc rev is bumped past the fix.
