# `oxfmt --svelte` leaves source tab indentation on a selector that carries a comment

- **Project**: `oxc-project/oxc` (`oxfmt`, `svelte: true` — the path that formats an embedded `<style>`)
- **Version measured**: `oxfmt@0.64.0`, config `{ "svelte": true, "printWidth": 80, "tabWidth": 2, "useTabs": false }`
- **Filed**: unrecorded
- **rsvelte**: three `compatibility/fmt-oracle-excluded.json` entries, one cause —
  `css/samples/comment-html/input.svelte`,
  `css/samples/comments-after-last-selector/input.svelte`,
  `parser-modern/samples/css-pseudo-classes/input.svelte`

## Summary

With `useTabs: false` and `tabWidth: 2`, `oxfmt --svelte` still emits **tab-indented lines** in an
embedded `<style>` block. The three fixtures below all have the same shape: a selector that
carries a CSS comment keeps its **source** indentation, while the declarations and braces around
it are re-indented with spaces. The result mixes tabs and spaces inside one rule set, under a
configuration that asks for no tabs at all.

Measured tab-bearing output lines (`awk '/\t/{c++} END{print c+0}'`):

| fixture | source | oxfmt output |
|---|---:|---:|
| `css/samples/comment-html` | 4 | **1** |
| `css/samples/comments-after-last-selector` | 5 | **1** |
| `parser-modern/samples/css-pseudo-classes` | 19 | **3** |

## The clearest of the three

`parser-modern/samples/css-pseudo-classes/input.svelte` — source (tabs):

```css
	:is( /*button*/
		button, /*p after h1*/
		h1 + p
		){
		color: red;
	}
```

oxfmt output — the opening line is re-indented to spaces and the three inner lines are not:

```css
  :is( /*button*/
		button, /*p after h1*/
		h1 + p
		) {
    color: red;
  }
```

Every other rule in the same block is fully re-indented to two spaces, so this is not a
"leave the whole `<style>` alone" policy.

## The other two

`comments-after-last-selector` — `.foo,` is re-indented to spaces and the `.bar` continuation
keeps its tab:

```css
  .foo,  /* some comment */
	.bar /* some other comment */ {
    color: red;
  }
```

`comment-html` — the `<!-- /* comment */ -->` line is re-indented to spaces and the `h1 {`
after it keeps its tab, while its own body is re-indented:

```css
  <!-- /* comment */ -->

	h1 {
    color: red;
  }
```

## What is observed and what is not

**Observed**: in all three, the lines that keep source indentation are exactly the lines of a
selector that spans more than one line *or* sits adjacent to a comment; the surrounding
declarations are re-indented. **Not measured**: whether the cause is a verbatim copy of a
comment-bearing selector's source range. That is a candidate, not a claim.

## Reproduction

```sh
mkdir -p /tmp/probe && cp submodules/svelte/packages/svelte/tests/parser-modern/samples/css-pseudo-classes/input.svelte /tmp/probe/
npx oxfmt@0.64.0 /tmp/probe -c scripts/fixtures/fmt-corpus.oxfmtrc.json
awk '/\t/{printf "%d:%s\n",NR,$0}' /tmp/probe/input.svelte
```
