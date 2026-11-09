# Upstream issues

Bugs in eslint-plugin-svelte 3.23.1 (with ESLint 10.14.0 and svelte-eslint-parser 1.10.0) that
this crate does not reproduce. Each is a candidate issue upstream. The cases that show the
difference are in `cases_deviations.json`, with this crate's answer.

## svelte/no-reactive-literals: a suggestion that does not parse

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

## svelte/no-reactive-functions: crashes on ESLint 10 when it reports

Input:

```svelte
<script>
	$: f = () => a;
</script>
```

The rule throws `source.isSpaceBetweenTokens is not a function`, a `SourceCode` method that
ESLint 10 removed, while it builds the report. This crate reports the statement as upstream's
tests expect.
