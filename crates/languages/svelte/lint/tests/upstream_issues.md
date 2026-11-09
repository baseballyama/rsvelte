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
