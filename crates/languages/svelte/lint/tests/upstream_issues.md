# Upstream issues

Behaviour of eslint-plugin-svelte 3.23.1 that this crate does not reproduce. Each entry is a
candidate issue for eslint-plugin-svelte. The upstream output was taken with ESLint and
svelte-eslint-parser (`oracle lint-cases`). The decoded values come from `svelte/compiler`'s
`parse`. The test that holds this crate's behaviour is named in each entry.

## svelte/no-useless-mustaches: the fix decodes to another string

| Input                    | Upstream fix          | Compiler reads input as | Compiler reads fix as |
| ------------------------ | --------------------- | ----------------------- | --------------------- |
| `<p>{'&amp;'}</p>`       | `<p>&amp;</p>`        | `&amp;`                 | `&`                   |
| `<p title={'&amp;'}>`    | `<p title="&amp;">`   | `&amp;`                 | `&`                   |
| `<p title="x{'&lt;'}">`  | `<p title="x&lt;">`   | `x&lt;`                 | `x<`                  |
| `<p>&am{'p;'}</p>`       | `<p>&amp;</p>`        | `&amp;`                 | `&`                   |
| `<p>{'&am'}{'p;'}</p>`   | `<p>&amp;</p>`        | `&amp;`                 | `&`                   |
| `<p>{'\0'}</p>`          | `<p>0</p>`            | U+0000                  | `0`                   |

The fix writes the literal's text into markup, and markup decodes character references. A fix
should not change the value. This crate withholds such a fix and keeps the report. For a reference
split across two mustaches, it fixes only the second one.
Test: `no_useless_mustaches::tests::a_fix_that_would_decode_differently_is_withheld` and
`a_reference_split_between_mustaches_keeps_its_first_half`.

## svelte/no-useless-mustaches: `ignoreStringEscape` does not see `\0`

With `[{ "ignoreStringEscape": true }]`, upstream reports `<p>{'\0'}</p>` and fixes it to `0`.
The escape list (`nrvtbfux`) leaves out `\0`, the one digit escape that strict code allows. This
crate counts `\0` as an escape and does not report it.
Test: `no_useless_mustaches::tests::a_digit_escape_is_a_string_escape`.

## svelte/shorthand-attribute: the fix writes a shorthand that does not compile

| Input                 | Upstream fix       | `svelte/compiler` on the fix |
| --------------------- | ------------------ | ---------------------------- |
| `<div a={(a)}></div>` | `<div {(a)}></div>` | `attribute_empty_shorthand`  |
| `<div a={/*x*/a}>`    | `<div {/*x*/a}>`   | `attribute_empty_shorthand`  |

A shorthand holds a name and nothing else, apart from whitespace. This crate reports these
attributes and writes no fix.
Test: `shorthand_attribute::tests::a_shorthand_that_would_not_compile_is_not_written`.
