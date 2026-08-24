# `bind:group` on an unresolvable identifier throws a bare `Error`, not a compile error

Oracle: `submodules/svelte` @ **5.56.9**.

## Repro

```svelte
<script>
	let rows = $state([{ picked: [] }]);
</script>

<input type="checkbox" value={1} bind:group={row.picked} />
{#each rows as row, i}
	<input type="checkbox" value={i} bind:group={row.picked} />
{/each}
```

The first `<input>` is outside the `{#each}` that declares `row`, so `row` there
is an unresolved reference. `compile()` rejects the file with

```
Error: Cannot find declaration for bind:group
```

and the thrown value carries **no `code`, no `start`/`end`, no `frame`** — it is
a `new Error(...)`, not one of the `e.*` diagnostics:

```js
// phases/2-analyze/visitors/BindDirective.js:210-213
if (node.name === 'group') {
    if (!binding) {
        throw new Error('Cannot find declaration for bind:group');
    }
```

Every sibling condition in the same function reports through `e.…`
(`e.bind_invalid_value`, `e.bind_group_invalid_snippet_parameter`,
`e.bind_invalid_expression`), each of which produces a positioned
`CompileError`. Only this one escapes as an internal assertion, so a tool that
surfaces `err.code` and `err.start` — an editor, a bundler overlay,
`svelte-check` — gets nothing to point at, and the message reads as a compiler
bug rather than as a mistake in the source.

Two smaller notes on the same line:

* The reference is what is unresolvable, so the natural diagnostic already
  exists in spirit next door — `bind_invalid_expression` is raised for the other
  "this expression cannot be a bind target" shapes and carries the node.
* `bind:value={row.picked}` in the identical position does **not** throw; it
  compiles, because only the `group` arm dereferences `binding`. So the same
  unresolved reference is fatal or fine depending on the directive name.

## Suggested fix

Report it as a positioned diagnostic on `node.expression` instead of throwing:

```js
if (!binding) {
    e.bind_invalid_expression(node.expression);
}
```

Found while measuring a 125-cell `bind:group` grid for rsvelte's own
group-naming defect; 26 of the cells reach this throw.
