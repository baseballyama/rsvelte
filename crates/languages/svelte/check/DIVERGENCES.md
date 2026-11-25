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

## A `let:` before a comment that ends the start tag

svelte-check 4.7.8 reports no TS18046 for a `let:` of a component without slots when a comment
follows the last `let:` at the end of the start tag:

```svelte
<Leaf label="x" let:x /* t */>{x}</Leaf>
```

svelte2tsx 0.7.63 copies the comment with the `let:` and writes a line break after it. The read of
`$$slot_def` then starts a line whose first mapping comes after the read, so svelte-check finds no
source position and drops the finding. Without the comment svelte-check reports it.

rsvelte reports it at the last character svelte2tsx copies of the `let:` itself (`last_let_read` in
the projection crate's `lower/start_tag.rs`).

- Test: `typecheck_reports_a_let_before_a_comment_that_ends_the_tag` in the command line crate's
  `tests/cli/typecheck_slots.rs`.
