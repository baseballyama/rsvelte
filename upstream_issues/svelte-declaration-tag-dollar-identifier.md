# `{var$x}` is rejected as a declaration tag, but `var$x` is a legal identifier

Oracle: `submodules/svelte` @ `5.56.9`.

`phases/1-parse/state/tag.js` routes a `{…}` to the declaration reader with three
literal sticky regexes:

```js
const regex_supported_declaration = /(?:let|const)\b/y;
const regex_unsupported_declaration = /(?:var|interface|enum)\b/y;
const regex_maybe_type_declaration = /type\b/y;
```

JavaScript's `\b` is defined against the word class `[A-Za-z0-9_]`. **`$` is not in
it**, so `/var\b/y` matches the first three characters of `var$x` — while `var$x` is
a perfectly legal JavaScript identifier, because `$` is an `IdentifierPart`.

`read_declaration` therefore throws before anything is parsed:

```js
const unsupported = parser.match_regex(regex_unsupported_declaration);
if (unsupported) {
	e.declaration_tag_invalid_type({ start, end: start + unsupported.length });
}
```

## Repro

```svelte
<script>
	const var$x = 1;
</script>

{var$x}
```

```
declaration_tag_invalid_type: Declaration tags can only contain `let` or `const`
variable declarations
```

## The asymmetry that names the cause

Only the three **unsupported** keywords are affected, because the supported and
`type` regexes are consulted after that throw — so an identifier beginning with
`let`, `const` or `type` is fine and one beginning with `var`, `enum` or
`interface` is not:

| source | 5.56.9 |
|---|---|
| `{let$x}` | compiles |
| `{const$x}` | compiles |
| `{type$x}` | compiles |
| `{var$x}` | **`declaration_tag_invalid_type`** |
| `{enum$x}` | **`declaration_tag_invalid_type`** |
| `{interface$x}` | **`declaration_tag_invalid_type`** |
| `{var_x}` | compiles (`_` *is* a word char, so `\b` does not match) |

`{var_x}` is the control: change the one character `\b` disagrees about and the
error goes away.

## Suggested fix

Spell the boundary against the JavaScript identifier class rather than the regex
word class — e.g. `/(?:var|interface|enum)(?![\p{ID_Continue}$‌‍])/uy`,
matching what `acorn` would accept as an identifier. The same applies to the
`let|const` and `type` regexes, which are correct today only because they are
consulted second.

## Status in rsvelte

rsvelte currently accepts all six spellings, which is the behaviour this report
argues is right. Because the project's gate is byte-for-byte parity with the
official compiler, rsvelte reproduces the upstream verdict and links here, so
the divergence is recorded rather than silently "fixed" in one direction.
