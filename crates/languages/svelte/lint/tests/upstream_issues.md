# Upstream bugs this crate does not reproduce

Each entry is a candidate issue for eslint-plugin-svelte: the rule, an input, what upstream
reports, and why that is wrong. A case of an upstream fixture that one of these changes is also
listed in `upstream_deviations.json`.

## svelte/indent: a snippet without parameters takes a `(` from its body

eslint-plugin-svelte 3.23.1, default options.

```svelte
<div>
  {#snippet foo()}
    <p>
      {@render baz()
          }
    </p>
  {/snippet}
</div>
```

Upstream reports line 5: `Expected indentation of 2 spaces but found 10 spaces.` Its fix moves
the `}` of `{@render baz()}` to column 2.

For a snippet with no parameters, `src/rules/indent-helpers/svelte.ts` looks for the `(` of the
parameter list by searching back from the end of the whole `{#snippet}` block. It finds the last
`(` in the body, here the one of `baz()`, and lays out the tokens after it as the snippet's
parameters. With one parameter (`{#snippet foo(a)}`) the same body reports nothing. The `(` is the
first one after the snippet's name.

## svelte/indent and svelte/max-lines-per-block: U+2028 and U+2029 do not end a line

eslint-plugin-svelte 3.23.1. Take each input below with every `\n` replaced by U+2028 (or
U+2029):

```svelte
<script>
let a;
let b;
let c;
</script>
```

```svelte
<div>
<p>x</p>
</div>
<script>
let a;
</script>
```

With `max-lines-per-block` set to `{ "script": 2 }`, upstream reports nothing for the first input.
With `\n`, `\r\n` or a lone `\r` it reports `<script> block has too many lines (3). Maximum allowed
is 2.` With default options, `indent` reports nothing for the second input. With the other
terminators it reports lines 2 and 5.

ESLint's `sourceCode.lines` splits at all five ECMAScript line terminators. The node locations
from svelte-eslint-parser count `\r\n`, `\r` and `\n` but not U+2028 or U+2029, so the rules see
the whole file as one line. This crate ends a line at every ECMAScript line terminator.
