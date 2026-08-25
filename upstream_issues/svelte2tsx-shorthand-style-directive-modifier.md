# svelte2tsx emits the modifier as part of the identifier for a shorthand `style:` directive

`svelte2tsx` (language-tools, `packages/svelte2tsx`) converts a **shorthand**
`style:` directive by slicing the directive's name out of the source and using it
as an expression. When the directive carries a modifier the slice includes it, so
the generated TSX references an identifier that does not exist:

```svelte
<script>
	let color = 'red';
</script>

<div style:color|important>a</div>
```

```ts
{ svelteHTML.createElement("div", { });__sveltets_2_ensureType(String, Number, color|important);  }
```

`color|important` parses as a bitwise-or, so the shadow file now reads a free
identifier `important` and `svelte-check` / the language server report
`Cannot find name 'important'` on a component the Svelte compiler accepts on
every target.

The two neighbouring shapes are both correct:

| directive | emitted expression |
|---|---|
| `style:color` | `color` |
| `style:color={color}` | `color` (the value expression) |
| `style:color\|important` | **`color\|important`** |
| `style:color\|important={color}` | `color` (the value expression) |

So only the shorthand-plus-modifier cell is wrong, and only because the modifier
is not stripped before the name is reused as an expression. The value-carrying
form already ignores the modifier, which is the behaviour the shorthand should
share — the shorthand's meaning is "use the variable named by the property", and
the property is `color`, not `color|important`.

rsvelte's port emits `color`, which is the correct TSX and therefore a
**deliberate byte divergence** from official. Matching official would reproduce
a spurious diagnostic on valid source, so rsvelte retains and regression-tests
the correct output under the project's upstream-defect rule. The shape remains
outside the output-equality corpus until upstream fixes its lowering; otherwise
the parity gate would require the known semantic defect.

Desired upstream behaviour: strip everything from the first `|` before using a
shorthand directive's name as an expression, the same way the value-carrying
branch already disregards it.
