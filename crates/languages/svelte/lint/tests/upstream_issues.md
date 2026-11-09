# Upstream issues

Bugs in eslint-plugin-svelte 3.23.1 (with ESLint 10.14.0 and svelte-eslint-parser 1.10.0) that
this crate does not reproduce. Each is a candidate issue upstream. The cases that show the
difference are in `cases_deviations.json`, with this crate's answer.

## Suggestions of `svelte/no-reactive-literals` that do not parse

Input:

```svelte
<script>
	let a = 0;
	let obj = {};
	$: a += 1;
	$: obj.x = 1;
</script>
```

Upstream suggests replacing the statements with `let a += 1` and `let obj.x = 1`. It writes
`let` before any assignment whose right side is a literal, so the code it suggests is a syntax
error unless the assignment is `name = literal`. This crate reports both statements and suggests
the move only for `=` with a name on the left.

## A cast or `!` hides an assignment from `svelte/no-reactive-reassign`

Input:

```svelte
<script lang="ts">
	let a = 0;
	$: v = a;
	$: obj = { a };
	function f() {
		(v as any) = 2;
		obj!.a = 3;
	}
</script>
```

Upstream reports nothing. Its walk from the reference to the assignment stops at
`TSAsExpression` and `TSNonNullExpression`, which pass the value through unchanged, so both
assignments to reactive values go unreported. This crate reports both.

## An inverted member test in `svelte/prefer-destructured-store-props`

`isExpressionIdentifier` (`utils/ast-utils.ts`) returns `!parent.computed || parent.property !==
node` for a member, and the same for a property key. That is true for the name in `x.name` and
false for the index in `x[index]`, the opposite of what it means. Two inputs show it:

```svelte
{#each items as i}{$s[i]}{/each}
```

The `{#each}` item `i` is not seen, so upstream reports `$s[i]`, which no destructuring outside
the block can replace.

```svelte
{#each items as a}{$s.a}{/each}
```

Upstream takes the property name `a` for the `{#each}` item `a`, so it does not report `$s.a`.
This crate does the opposite in both cases.

## A crash in `svelte/no-reactive-functions` on ESLint 10

Input:

```svelte
<script>
	$: f = () => a;
</script>
```

The rule throws `source.isSpaceBetweenTokens is not a function`, a `SourceCode` method that
ESLint 10 removed, while it builds the report. This crate reports the statement as upstream's
tests expect.
