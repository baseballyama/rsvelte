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

- The checker places an unused name of a destructured `for…of` binding elsewhere.

  ```ts
  export function f() {
    for (let { x } of [{ x: 1 }]) {
    }
    for (let [p, q] of [[1, 2]]) {
    }
  }
  ```

  Under `noUnusedLocals`, TypeScript 6.0.3 reports TS6133 for `x` at 2:12, the `{`, and TS6133
  for `p` and `q` at 4:13 and 4:16. TypeScript 7.1 reports TS6133 for `x` at 2:14, and one TS6198
  `All destructured elements are unused.` at 4:12. An `{#each}` item `{ x }`, `{ x = 2 }` or
  `[p, q]` gives the same pair, because svelte2tsx writes the item as the binding of a `for…of`.

- Test: `typecheck_prints_what_typescript_7_prints` in the command line crate's
  `tests/cli/typecheck_checker.rs`.
- The report is [#5254](https://github.com/baseballyama/rsvelte/issues/5254).

## A component with a lone carriage return

In svelte-check 4.7.8, a carriage return with no line feed breaks the positions of a component.
For the first finding after one in the script, the checker counts it as a line. Visual Studio Code
and the rsvelte language server count it so too. The checker then places later findings on a wrong
line and column, or drops them. It reports TS2322 at 3:12 and 4:1 in this component:

```svelte
<script lang="ts">
  /* a<CR>b */ const a: string = 1;
  const b: string = 2;
</script>
```

A template literal that holds a carriage return does the same.

The cause is that the checker and the source map count lines differently. The checker finds the
generated line of a finding with `getLineOffsets`, which ends a line at a lone `\r`
([`utils.ts`](https://github.com/sveltejs/language-tools/blob/e7826d325d734e6be6bfd7694acc3804ea264a1e/packages/language-server/src/lib/documents/utils.ts#L276)). It then looks that line up in the map of svelte2tsx
([`DocumentMapper.ts`](https://github.com/sveltejs/language-tools/blob/e7826d325d734e6be6bfd7694acc3804ea264a1e/packages/language-server/src/lib/documents/DocumentMapper.ts#L152-L155)). The map comes from magic-string 0.30.11, which writes it
with lines that end at `\n` only ([`Mappings.js`](https://github.com/Rich-Harris/magic-string/blob/bde9d7e35da4663ead63a9c81130e7a0752c7a9f/src/utils/Mappings.js#L16)). So after a lone carriage return the
lookup reads a line of the map that holds other code. The report is
[#5350](https://github.com/baseballyama/rsvelte/issues/5350).

rsvelte reports the lines that end at `\n`, as in a component without a carriage return. So it
also moves the first finding off the editor's line, to 2:18, and reports the second at 3:8
(`reported_lines` in the TypeScript check crate's
[`findings.rs`](../../typescript/check/src/check/findings.rs)).

- Test: `typecheck_reports_a_component_s_findings_after_a_lone_carriage_return` in the command line
  crate's `tests/cli/typecheck_line_ends.rs`.

## A `let:` before a comment that ends the start tag

In svelte-check 4.7.8, a `let:` of a component without slots gets no TS18046 when a comment follows
the last `let:` at the end of the start tag:

```svelte
<Leaf label="x" let:x /* t */>{x}</Leaf>
```

The projection of svelte2tsx 0.7.63 copies the comment with the `let:` and writes a line break after it. The read of
`$$slot_def` then starts a line whose first mapping comes after the read, so svelte-check finds no
source position and drops the finding. Without the comment svelte-check reports it.

The finding stays in rsvelte, at the last character svelte2tsx copies of the `let:` itself
(`last_let_read` in the projection crate's `lower/start_tag.rs`).

- Test: `typecheck_reports_a_let_before_a_comment_that_ends_the_tag` in the command line crate's
  `tests/cli/typecheck_slots.rs`.

## A `let:` whose name ends in an astral character

In svelte-check 4.7.8, the TS18046 of `<Leaf label="x" let:𝒜>` is at column 22, the second UTF-16
unit of `𝒜`, which is no character position. rsvelte reports it at column 21, the start of `𝒜`.

- Test: `typecheck_reports_a_let_whose_name_ends_in_an_astral_character_at_its_start` in the
  command line crate's `tests/cli/typecheck_slots.rs`.

## A store read of a type-only namespace import

In svelte-check 4.7.8, `$tns` in this component is TS2304 `Cannot find name '$tns'.` at 5:2:

```svelte
<script lang="ts">
  import type * as tns from './s';
</script>

{$tns}
```

rsvelte reports TS2552 `Cannot find name '$tns'. Did you mean 'tns'?` there. svelte2tsx 0.7.63
declares no `$tns`, and neither does rsvelte. TypeScript 6.0.3, TypeScript 7.1 and svelte-check
itself give TS2552 for the same read in a `.ts` file. That holds at the top level, and inside an
`async` arrow in a function, as the projection has it. svelte2tsx writes the same projection with
svelte-check's options. The cause is not found.
