# Divergences

Where `svelte.check` gives a different result from svelte-check on purpose. Each entry says what
svelte-check does, what rsvelte does instead, and the code that does it. Behavior rsvelte has not
built yet is not listed here.

## The TypeScript 7 checker

The checker of svelte-check 4.7.8 is TypeScript 6.0.3. rsvelte checks with TypeScript 7.1
(`7.1.0-dev.20261102.1` in the corpus): the API that the content mapper and the batch check need
exists from 7.1 on. `CONTRACT` and the version test in the TypeScript check crate's
[`type_checker.rs`](../../typescript/check/src/type_checker.rs) require it.

The two checkers print some types and messages differently, so the same projection gives a
different message. A plain `.ts` file, with no Svelte in it, shows that the checker makes the
difference and not the projection:

- A spread of two object types keeps a different property order.

  ```ts
  declare function t<T>(): { [K in keyof T]: T[K] };
  const events = { ...t<{ a: number }>(), ...t<{ b: string }>() };
  export const n: number = events;
  ```

  TypeScript 6.0.3 reports `Type '{ b: string; a: number; }'` at 3:14, and TypeScript 7.1
  reports `Type '{ a: number; b: string; }'`. A component with two typed event dispatchers
  shows the same order in its `SvelteComponent` type, and a type cut short ends in `& { ...; }`
  in one and `& ...` in the other.

- A call that matches no overload lists the last overload only.

  ```ts
  declare function f(x: string): void;
  declare function f(x: string | null): void;
  f(1);
  ```

  TypeScript 6.0.3 lists each overload under `No overload matches this call.` at 3:3, as
  `Overload 1 of 2, '(x: string): void', gave the following error.` and so on. TypeScript 7.1
  gives one line, `The last overload gave the following error.` The store read `{$n}` of a
  `const n = 1` gives the same pair.

- Test: `typecheck_prints_what_typescript_7_prints` in the command line crate's
  `tests/cli/typecheck_checker.rs`.
- The report is [#5254](https://github.com/baseballyama/rsvelte/issues/5254).

## A component with a lone carriage return

In svelte-check 4.7.8, a carriage return with no line feed breaks the positions of a component. The
checker drops a finding after one, or places it on a wrong line and column. It reports TS2322 at
3:1 in

```svelte
<script lang="ts">
	/* c<CR>d */ let b: string = 2;
</script>
```

The finding stays in rsvelte, at 2:16 in this example. The lines are those that end at `\n`, as in a
component without a carriage return (`reported_lines` in the TypeScript check crate's
[`findings.rs`](../../typescript/check/src/check/findings.rs)).

- Test: `typecheck_reports_a_component_s_findings_after_a_lone_carriage_return` in the command line
  crate's `tests/cli/typecheck_line_ends.rs`.
