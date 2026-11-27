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
    for (let { a: renamed } of [{ a: 1 }]) {
    }
  }
  ```

  Under `noUnusedLocals`, TypeScript 6.0.3 reports TS6133 for `x` at 2:12, the `{`, and TS6133
  for `p` and `q` at 4:13 and 4:16. TypeScript 7.1 reports TS6133 for `x` at 2:14, and one TS6198
  `All destructured elements are unused.` at 4:12. For `renamed`, TypeScript 6.0.3 reports
  TS6133 at 6:12, the `{`, and TypeScript 7.1 at 6:17, the name. An `{#each}` item `{ x }`,
  `{ x = 2 }`, `{ a: renamed }` or `[p, q]` gives the same pair, because svelte2tsx writes the
  item as the binding of a `for…of`. An index does not change it: with `[p, q], i` and `i` used,
  svelte-check reports TS6133 at `p` and at `q`, and we report one TS6198 at the `[`.

- A union prints its members in another order. A component tag whose value is `5` gets TS2345
  against svelte2tsx's constraint, which TypeScript 6.0.3 prints as
  `'ConstructorOfATypedSvelteComponent | Component<any, any, any> | null | undefined'` and
  TypeScript 7.1 as `'Component<any, any, any> | ConstructorOfATypedSvelteComponent | null |
  undefined'`. A plain `.ts` file with the same constraint gives the same pair.

- The parameters of an untyped JavaScript function are not optional. Take this plain `.js` file,
  with `checkJs` and `strict`:

  ```js
  /** @type {(p: { foo?: () => void }) => void} */
  const call = (p) => {};
  call({ foo: (q) => {} });
  ```

  TypeScript 6.0.3 reports only TS7006 for `q` at 3:14. TypeScript 7.1 also reports TS2322
  `Type '(q: any) => void' is not assignable to type '() => void'.` at 3:8, with `Target signature
  provides too few arguments.` When the object also lacks a required property, TypeScript 6.0.3
  reports that property as missing, and TypeScript 7.1 reports the TS2322 in its place. The
  TypeScript 7 changelog names the change:
  ``And because Corsa uses the same rule for optional parameters, it fixes subtle Strada bugs with `"strict": true` in JavaScript.``
  ([`tsc/CHANGES.md:8`](https://github.com/microsoft/typescript-go/blob/6161772c1370bdd4a82f808e6823bd755eb1870d/tsc/CHANGES.md?plain=1#L8)
  at the commit `7.1.0-dev.20261102.1` names as its `gitHead`). In a JavaScript component, a
  snippet `{#snippet foo(q)}` passed for `foo?: Snippet` gives the same pair, and so does a
  callback with one parameter more than its type: `onpick={(n, x) => {}}` for
  `(n: number) => void`, and `onclick={(e, x) => {}}` or `on:click={(e, x) => {}}` on a
  `<button>`. In a TypeScript component, both checkers report the TS2322.

- Test: `typecheck_prints_what_typescript_7_prints` and
  `typecheck_checks_a_javascript_snippet_s_parameters_as_typescript_7_does` in the command line
  crate's `tests/cli/typecheck_checker.rs`.
- The reports are [#5254](https://github.com/baseballyama/rsvelte/issues/5254) and
  [#5319](https://github.com/baseballyama/rsvelte/issues/5319).

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

## A component whose value has no component shape

svelte2tsx constructs a component with `new $$_P0C({ target, props })`. rsvelte calls it with
`__rsvelte_component(P)(internals, props)`, so that a generic component infers its generics from the
props (`component_call` in the projection crate's
[`call.rs`](../typescript_projection/src/lower/call.rs)). For `null` or `undefined`, both give
`never`. Then svelte-check 4.7.8 reports TS2351 `This expression is not constructable.` at the tag's
name. rsvelte reports TS2349 `This expression is not callable.` there. For
`<svelte:component this={P}>`, svelte-check reports it one column after the start of `P`, and
rsvelte at the start.

A function that returns no object, such as `() => 1`, is `never` in svelte2tsx too, and svelte-check
reports the same TS2351. rsvelte calls the function itself: `() => 1` gets TS2554 `Expected 0
arguments, but got 2.` and `(a, b) => {}` gets nothing. Upstream's test reads the props, the exports
and the bindings off `Component<…>`. That test also turns some generic components of the projection
into `never`, such as one with `generics="T, Key = T extends Map<infer K, unknown> ? K : keyof T"`.

- Test: `typecheck_reports_a_value_that_is_no_component_at_its_tag` in the command line crate's
  `tests/cli/typecheck_component_values.rs`.

## The script of a component svelte2tsx rejects

When svelte2tsx throws, svelte-check reads the component as its instance script, else its module
script (the `catch` in the language server's `preprocessSvelteFile`). A script that neither imports
nor exports is then a global script. Every file of the project reads its top-level names, with
or without `allowJs`. An import of the component reports TS2306 `File '…' is not a module.` The
expected output of a unit can then depend on the broken units beside it. The corpus skips such
units for `svelte.check` with the reason "svelte-check adds the script of a component
that does not parse to the project as a global script" in
[`units.toml`](../../../../corpus/_registry/units.toml).

rsvelte reads such a script as an empty file, which is not a module either and declares nothing
(`unprojected` in the projection crate's [`lib.rs`](../typescript_projection/src/lib.rs)). An
import still reports TS2306, but another file that reads one of the script's names reports TS2304
`Cannot find name`. rsvelte reads a script that imports or exports unchanged, with `export {};`
after it.

A script is a module where TypeScript's `isExternalModule` says so. That takes a top-level import
or export declaration other than `export as namespace`, an `import … = require(…)`, or an
`import.meta` anywhere. A top-level `await` alone does not make one. The statements come from
oxc's parse. A script oxc cannot parse reads as an empty file, where TypeScript's recovery can
still find an import or export. `let = ;` before an `export` is such a script: svelte-check
reports TS1192 for a default import of its component, and rsvelte TS2306. No script is ever read
as a global script.

Before this, every component whose Svelte parse failed read as an empty file. An import of one
then matched svelte-check where TypeScript reads the script as a global script, only by accident.
A bare trailing `export` or `import` is such a script, and so is an `import` inside an `if`.

- Tests: `a_thrown_stand_in_is_a_module_where_typescript_reads_the_script_as_one` in the
  projection crate's `src/tests/stand_in.rs`, and
  `typecheck_reads_a_rejected_component_as_its_script` and
  `typecheck_declares_no_global_for_a_rejected_component_s_script` in the command line crate's
  `tests/cli/typecheck_rejected.rs`.

## A named import of a JavaScript component without `allowJs`

Without `allowJs`, svelte-check 4.7.8 reads a JavaScript component as a `.js` file that TypeScript
does not load. Each import of it reports TS7016, and every name it imports is `any`. rsvelte reports
the same TS7016 and types the default import as `any` (`untyped.rs` in the TypeScript check
crate's `src/check/run/`). A named or namespace import keeps the types of the component's generated
text. So a use of such a name can report an error that svelte-check does not, and an import of a
name the component does not export reports TS2614 or TS2339.

rsvelte cannot make these names `any` from outside. TypeScript 7 loads and types every file a
content mapper maps, whatever the extension of its generated text, and `allowJs` does not change
that. The rule is
[`ResolvedUsingExtraExtensions`](https://github.com/microsoft/TypeScript/blob/6161772c1370bdd4a82f808e6823bd755eb1870d/tsc/internal/module/util.go#L161-L163)
at the pinned build of TypeScript 7. Item 185 of the
[upstream bug list](https://github.com/baseballyama/rsvelte/issues/4939) records it.

- Test: `typecheck_types_a_named_import_of_a_javascript_component` in the command line crate's
  `tests/cli/typecheck_untyped.rs`.
