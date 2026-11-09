# Upstream issue candidates

Bugs in eslint-plugin-svelte or svelte-eslint-parser that this crate does not reproduce. The
user files them; each entry says what upstream reports, what is correct and why.

## U+2028 and U+2029 do not end a line in node locations

- Rules: `svelte/max-attributes-per-line`, `svelte/html-closing-bracket-new-line`,
  `svelte/first-attribute-linebreak`, and every rule that compares the lines of template nodes.
- Measured with eslint-plugin-svelte 3.23.1 and svelte-eslint-parser 1.10.0.
- Cause: svelte-eslint-parser's `LinesAndColumns` (`lib/context/index.js`) ends lines at `\r\n`,
  `\r` and `\n` only. ESLint's `SourceCode` also ends lines at U+2028 and U+2029, as ECMAScript
  does. A rule that compares `node.loc` lines therefore treats a tag as one line, while the same
  report's position and `sourceCode.lines` (for example in `no-trailing-spaces`) treat it as two.
- Case: `<div d="1"` U+2028 `e="2" f="3"></div>` with `svelte/max-attributes-per-line`.
  Upstream reports `'e' should be on a new line.` at 1:12, as if `d` and `e` were on one line.
  ESLint itself ends that line before `e`. Likewise, `<div` U+2028 `b="1"></div>` with
  `svelte/html-closing-bracket-new-line` reports nothing upstream, but the tag spans two lines,
  so a line break before `>` is expected.
- Correct: count node lines with ECMAScript's line terminators, as ESLint does. This crate counts
  lines once, with ECMAScript's terminators (`LineBreaks::Ecmascript`).
