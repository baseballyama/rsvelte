# Upstream issues

Bugs in eslint-plugin-svelte 3.23.1 (with ESLint 10.14.0 and svelte-eslint-parser 1.10.0) that
this crate does not reproduce. Each is a candidate issue upstream. The cases that show the
difference are in `cases_deviations.json`, with this crate's answer.

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
