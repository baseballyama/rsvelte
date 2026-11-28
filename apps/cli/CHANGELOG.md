# @rsvelte/cli

## 0.8.0

### Minor Changes

- f38d283: The `svelte.compile.sourcemap/client` and `svelte.compile.sourcemap/server` tasks write a component's module with its source map, `js.map`.
- 2603cc8: `rsvelte lsp` now also reports type errors: after each change, the errors `rsvelte typecheck` run in the workspace folder finds in every file of the project, with the editor's unsaved texts.
- 0d0511e: `rsvelte lsp` now offers TypeScript's features in Svelte components, such as hover and completion, from the TypeScript 7.1 that `rsvelte typecheck` runs. `--no-typescript` turns them off. The Visual Studio Code extension leaves them to the Svelte extension where you install that one, unless `rsvelte.typescript` says otherwise.

### Patch Changes

- a612427: `rsvelte typecheck` resolves an import of a component that svelte2tsx rejects even where it checks no other component of the project, as svelte-check does. Before, the import reported TS2307.
- 6d2736d: The compiler now rejects the attributes svelte rejects. An element's attribute name such as `3aa` or `+` fails with `attribute_invalid_name`. An unquoted value with text and an expression, such as `title=a{b}`, fails with `attribute_unquoted_sequence`. A script fails on a reserved attribute such as `server`, on `module` with a value, and on a `context` other than `"module"`.
- 9f0f531: `rsvelte compile` of a TypeScript file writes the second dot after a number where TypeScript does. That includes a byte order mark, a next line character or a zero width space before the dot.
- 9a35ba1: TypeScript emit now writes the second dot TypeScript writes after an integer that a property access follows, as in `1..toString()`.
- 8dbb177: `rsvelte typecheck` types a `let:` value that a component forwards from a generic component by the generics' constraints, as svelte-check does. Before, the value was `any`.
- bf61e27: `compileModule` now leaves an undeclared `$name` in a `.svelte.js` or `.svelte.ts` module alone, as svelte does, instead of reading it as a store subscription. `promise.then($DONE)` no longer becomes `promise.then($DONE())`.
- eccdc13: `rsvelte typecheck` reports nothing for a component that declares its `$$Slots` interface inside a function, as svelte-check does. Before, it reported a `check_unmapped` error.
- 8d329d3: `typecheck` reads a component that svelte2tsx rejects as its instance script, else its module script, as svelte-check does. An import of the component now reports a missing default export and the types of the script's exports, instead of TS2306. A script that neither imports nor exports declares no names for the rest of the project, unlike in svelte-check.
- b68da07: `rsvelte typecheck` reports a `<slot>` that misses a required slot prop at the slot's tag. Before, it reported a `check_unmapped` error at the start of the file.
- 17ebcea: `rsvelte compile` of a TypeScript file keeps the parentheses TypeScript keeps. Those are the source's, except around a type assertion, plus the ones TypeScript adds at the start of a statement, an arrow body or a default export.
- 9e3f302: `rsvelte typecheck` types a component's untyped `$props()` as svelte-check does, as `$$ComponentProps`. A missing or unknown prop now gets the error and message that svelte-check reports, in both JavaScript and TypeScript components.
- 6d33d0a: The TypeScript compile writes the `"use strict"` prologue TypeScript writes at the top of a file that is not a module.
- a1d6180: The Vue Vapor translation now reports the error svelte reports for a component svelte rejects, such as `<svelte:element />`, instead of panicking.
- 88df103: `vuelte.compile` imports `shallowRef` once for a component with an `{#await}` block and a prop that keeps its own cell, where its client output imported it twice and did not parse.
- 0befc5f: `vuelte.compile` erases the TypeScript declarations at the top level of a script, which it used to print into its JavaScript: `type`, `interface`, `declare` and namespaces of types. It refuses the TypeScript that Svelte refuses.

## 0.7.6

### Patch Changes

- 286660a: Under `declaration` or `composite`, `typecheck` now reports the errors TypeScript finds while it builds the declarations, such as TS4094. It reports them in modules and in components, as `tsc` and svelte-check do.
- fb93e4a: `compile`, `check` and `lint` now report a JavaScript syntax error (`js_parse_error`) with oxc's message and position. They no longer try to copy acorn's, which Svelte uses. rsvelte still rejects the same sources as Svelte does and still raises the same Svelte errors around them.
- 1c3b310: Fold a string with a lone surrogate, such as `{'\uD800'}`, as svelte does, instead of crashing on the client and writing `\\ud800` into a server attribute.
- 87e988b: `rsvelte lint` reports what typescript-eslint throws for an optional rest element in an arrow function's parameters, such as `([...a?]) => {}`: "Expression expected." at the token after the `?`. Before, it ran the rules on the script as if it parsed.
- 385bcbe: Writing a source map reserves its text once instead of growing it.
- 4b9fb64: `ts.compile` erases a `declare enum` as TypeScript's emit does, instead of refusing it, and a `.svelte.ts` module keeps a namespace that holds one.
- cc52ea4: `typecheck` starts fewer type checker processes and opens the project fewer times. It no longer runs `--version` first, and the process that lists the files goes on to check them. It adds a process only where that process would check for as long as it takes to open the project. In a project with no component, it checks in the same snapshot that listed the files, so it builds the program once.
- a4be90a: `typecheck` reads fewer paths and files from the disk. It takes a file's real path only where a replaced file may be behind it. It no longer reads every file twice to check a project with no component.

## 0.7.5

### Patch Changes

- 7d8094f: Report the error acorn raises while it reads a token before the place the parser fails. Such tokens include a legacy octal number or escape in strict code, an `@`, and a `#` with no name after it.
- efb3991: In a component's TypeScript script, `compile` refuses a reserved word as a name in an ambient context, such as `declare let static: number`, as Svelte does. It also refuses a class named by a TypeScript keyword, such as `class type {}`. A class field's value in an ambient context, or on an abstract field, is now reported at its `=`. The error for an abstract field names its key as Svelte does. A bundler erases the types of a `.svelte.ts` module before Svelte reads it, so these rules no longer apply there, and neither do the rules for `override` and `export declare global`.
- c230874: `rsvelte typecheck` checks a component's value against svelte2tsx's constraint. A value that is no component now gives one finding at its tag, as svelte-check does, where it gave a second one about `never`.
- d418d89: A directive with an escape, such as `"it\'s"`, keeps its value in a compiled module and in a
  component's module script. A `.svelte.ts` script that spells `"use strict"` with an escape no
  longer gets a second one, as in TypeScript's emit.
- 5c129ba: `rsvelte typecheck` writes an `{#each}` block as svelte2tsx does, with the index declared in the loop's body. Under `noUnusedLocals`, an unused item or index is now TS6133 at its name, as in svelte-check, instead of TS6198 at the block.
- 45b6705: `rsvelte typecheck` reads `$store` in a JavaScript component as svelte-check does. It reports a value that is no store at each read, and types an untyped custom store's value as `any`.
- 569f9e4: `compile` now drops an ambient `enum` declaration, such as `declare enum E { A }`, from a `.svelte.ts` module before it analyzes the module, as TypeScript's emit does. A name the module declares again beside it no longer fails as declared twice.
- c8b1e52: `compileModule` no longer fails on a syntax error in the types of a `.svelte.ts` module, such as `declare class C { x = 1 }`. TypeScript's emit drops that code before Svelte reads it.
- 6c28995: `rsvelte typecheck` no longer reads `$ns` of a namespace import `ns` as a store, as svelte-check does. It reports that it cannot find `$ns`, where it reported TS2769 or nothing.
- a2c7a86: `compile` prints a number from the source in its source spelling, such as `0x10` or `1_000`, as Svelte does. For a number the compiler makes itself, it prints what `String(value)` gives.
- e31102d: `rsvelte typecheck` adds svelte-check's "Possible causes" note to an argument that is not assignable to `ConstructorOfATypedSvelteComponent`.
- 9212e8f: Report a binary, octal or hex number such as `0b12` after an expression where acorn's parser fails, at the start of the number. acorn reads it as `0b1` and then `2`.
- 2e4e9f1: Writing a source map reads each copied line fewer times.
- 96c2f81: `rsvelte typecheck` drops a finding in the code it generates to declare `$store` and a component's snippets, as svelte-check does. A type-only store no longer gives an error at its import, and a store that refers to itself no longer refuses the component.
- 514f7d8: `rsvelte typecheck` counts the columns of a file's first line from after a byte order mark, as svelte-check does. A finding there was one column to the right.

## 0.7.4

### Patch Changes

- 0f4aa70: Report an `await` inside a target that no one can assign to, such as `(() => await x) = 1`, with Svelte's message and position again. The linter now also reads the variables inside such a target, so it no longer calls them unused.

## 0.7.3

### Patch Changes

- b510037: The `js.map` of `compile` for a component with `\r\n` line ends keeps the mapping of its last line, which it dropped.
- 637d050: A `.svelte.js` or `.svelte.ts` module keeps its leading directives, such as `"use strict"`, after
  the runtime import, as `compileModule` does.
- 2f8a593: rsvelte now erases the types of a `.svelte.ts` module before it analyzes it. A name that only a dropped `import A = require("x")` or a type binds no longer exists, and rsvelte drops `export =` too.
- b510037: `typecheck` reports a `let:` on a component without slots, such as a runes component, as svelte-check does: its slots read as `unknown`. It also reports the `children` of a component's content at the column svelte-check uses when the start tag has a directive.
- 575fe48: `compile` drops an `import A = require("x")` from a `.svelte.ts` module, as TypeScript's emit for an ES module does.
- ce18e42: A number that JavaScript does not allow, such as `1_`, `08x` or `0x`, is now reported with Svelte's message and position.
- aaf08ee: Report an `await` in a class static block where svelte does when the assignment target around it also fails. `class A { static { (await x) = 1; } }` now fails at the `await`.
- e46069e: `typecheck` places a finding in a file with `\r\n`, `\r`, U+2028 or U+2029 line ends at svelte-check's line and column, instead of `check_unmapped` at 1:1 or a wrong line.
- 82f2393: `rsvelte typecheck` now reports an unknown slot name on every child that fills a slot, with or without `let:` and inside blocks, as svelte-check does.

## 0.7.2

### Patch Changes

- 04a61db: `compile` reads a component's class without its abstract methods, as svelte does.
- 8316c62: `typecheck` no longer reports TS7016 when `allowJs` is on for a component without `<script>` that a linked package's own files import by a relative path. TypeScript loads such a component, as svelte-check does, even though the search of `node_modules` found the package.
- f146718: On Windows, `rsvelte typecheck` hands the type checker every filename in TypeScript's form, with forward slashes.
- fa96fcf: `rsvelte typecheck` reports a finding in a slot prop once, at the `<slot>`, as svelte-check does, instead of refusing the component over the copy in the render function's return.
- 3660690: `typecheck` now types the `args` of a `@storybook/addon-svelte-csf` story's `template` snippet by the props of the story's component, as svelte-check does. In 0.7.0 they were `{ [x: string]: any }`, so `typecheck` reported a required prop as missing where a component took them as a spread.

## 0.7.1

### Patch Changes

- 52a6ba8: `compile` now reports a character ECMAScript does not allow inside the module reference of an `import type` alias, such as U+0085, before the alias error, as Svelte does.
- 530da27: `typecheck` now types the untyped `$props()` of a JavaScript route component, such as `+page.svelte`, from the route's `./$types` in `JSDoc`, as svelte2tsx does. Where `./$types` is missing, it reports the import, as svelte-check does.
- a6853db: `compile` no longer prints a `.svelte.ts` module's `declare const` as `const g;`, and reads a class's overloads and `declare` fields the way svelte does.
- 804a752: `rsvelte lint` and `rsvelte format` follow oxlint 1.95 and its oxfmt. `rsvelte format` keeps the parentheses of `(a < b) > c`, which TypeScript would otherwise read as a call of `a<b>`.
- ab7def8: `compile` now reports `expected_token` for a digit a binary or octal number does not take in a template expression, such as `{0b12}`, where svelte does.
- a46b6cc: `typecheck` reads the language of a component svelte2tsx rejects, such as one with a template expression error, off its script elements, as svelte-check does. Before, it read every such component as JavaScript.
- e92fa0c: `typecheck` now reads `${configDir}` in `tsconfig.json` as the directory of the checked `tsconfig.json`, as `tsc` does, also when an extended one has it. Before, `typecheck` still checked a file that such an `exclude` pattern removes.
- e8ce62c: `typecheck` now reports TS7016 for an import of a JavaScript component it does not check, such as one with a legacy `export let`, as svelte-check does for any JavaScript component.
- 07d2c54: `rsvelte typecheck` on Windows names a file as TypeScript does, with forward slashes. That fixes two problems: a component's precomputed projection was not found, and its TS7016 message did not match svelte-check's.

## 0.7.0

### Minor Changes

- 4496c0e: `rsvelte lsp` serves an editor over the Language Server Protocol: the problems `rsvelte lint` finds in the text in the editor, their fixes, and formatting as `rsvelte format` does. A Visual Studio Code extension runs it.

### Patch Changes

- ed7da1b: `typecheck` no longer reports TS7016 for an import of an untyped component when an ambient module's pattern, such as `declare module '*.svelte'`, matches its specifier. TypeScript reads that module instead, as svelte-check does.
- 84b9cd6: Type check a generic component's slot props as svelte-check does: `let:` on it reads the slots of the generics its props infer. A component that fills a named slot and has its own `on:` or `let:` now reads its parent's slot, not its own.
- 567bd0f: `compile` reports `import type` on an import alias with acorn-typescript's message, at the module reference, as svelte does.
- f1be923: `compile` now reports acorn's "Identifier directly after number" for a name right after a number, and "Unexpected token" for a stray digit as in `0b12`, where svelte does.
- b6f17d1: Report an assignment target whose left edge is in parentheses where svelte does. `(a)?.b = x` and `(f)() = 1` now fail at the opening parenthesis, which starts the node acorn rejects, instead of at the name inside it.

  An `await` outside an async function that comes before another syntax error is now reported with svelte's wording and position, instead of the later error.

- 7df6e2d: `typecheck` now types a `<slot>` prop that reads an `{#each}` item, an `{#await}` value or a component's `let:` name, as svelte-check does. A parent's `let:` of that prop was `any` before.
- 7355888: `typecheck` runs on Windows again. rsvelte now gives TypeScript, the content mapper and its output each real path as `C:\…`, where it gave the `\\?\C:\…` form that TypeScript 7 refuses as a network path. `lint` and `format` read real paths the same way.

## 0.6.0

### Minor Changes

- 8b7a9cc: `rsvelte lint` is oxlint with a built-in Svelte linter. It takes oxlint's options and reads `.oxlintrc.json`, where it configures Svelte rules under the `svelte/` prefix with oxlint's categories. `rsvelte.config` no longer configures lint, so it has no `svelte.lint` and `typescript.lint` any more. `@rsvelte/eslint-plugin` now turns off only the rules rsvelte adds to oxlint, to use beside `eslint-plugin-oxlint`, and gains `buildFromOxlintConfig` and `buildFromOxlintConfigFile`.

### Patch Changes

- 1a88d20: In a component's script, `compile` now refuses a namespace that holds a statement in an ambient context, as svelte does. It reports an implementation there only for a function declaration, at its start.
- 570a9f8: `compile` refuses `eval` and `arguments` as the name of an ambient declaration or parameter, and a `declare` variable's value that svelte refuses, with acorn's message and position.
- 7715867: `typecheck` now checks JavaScript modules as `tsconfig.json` says, as svelte-check does: `checkJs` checks each one, and `allowJs` checks a module that starts with `// @ts-check`. A JavaScript route, hooks or `params` file of SvelteKit gets its types from a `JSDoc` comment, as svelte2tsx writes them.
- 2e28ee8: The compiler hashes the CSS of a component without a filename from its stylesheet, as svelte does.
- 46ee17a: `rsvelte lint` follows `eslint-plugin-svelte` 3.24.1 and `svelte-eslint-parser` 1.10.1.

  - `svelte/valid-compile` and `svelte/no-unused-svelte-ignore` compile a component with the `compilerOptions.runes` of its `svelte.config.js`, so they report the warnings of runes mode in a component that relies on that option.
  - `svelte/no-unused-svelte-ignore` no longer reports a `svelte-ignore` comment for a runtime warning, such as `ownership_invalid_binding`, which the compiler never reports.
  - `svelte/valid-compile` and `svelte/no-unused-svelte-ignore` read a `svelte-ignore` comment before a node inside a statement, such as an object property or a call argument, as Svelte 5 does. A comment at the end of the line before a node no longer ignores warnings of that node.
  - `svelte/indent` accepts a comment before a closing bracket when the comment has the indentation of the line above it.
  - `svelte/sort-attributes` no longer reports or moves a shorthand attribute or a directive across a spread attribute.
  - `svelte/prefer-svelte-reactivity` no longer reports in a component that is not in runes mode.
  - `svelte/prefer-const` and `no-unused-vars` read the `$bindable()` props of `$props() as T`, `$props()!` and `$props() satisfies T` as those of `$props()`.

- 6ac2227: `typecheck` now reads a file that only an import reaches as `tsc` does, such as a file of a package linked into `node_modules`. It made every such file a root of the project before, so with `outDir` set it reported TS6059 for a linked package's file, which `tsc` does not.
- 46ee17a: `rsvelte format` now puts an element's content on its own lines instead of hugging `>` and `</`, as `prettier-plugin-svelte` 4.2.0 does.
  Elements whose edge whitespace Svelte keeps still hug their content: in `<pre>` or `<textarea>`, a `<title>` in `<svelte:head>`, and a component with `preserveWhitespace`.
  `htmlWhitespaceSensitivity: "strict"` keeps hugging as before.
  `rsvelte format` now formats `<menu>` as a block element.
  `rsvelte format` now keeps an empty `{:catch}` in an `{#await}` block.
  `rsvelte format` now prints a string in `<svelte:element this={...}>` with the quotes `singleQuote` picks.
  `rsvelte format` now keeps a comment in an opening tag without attributes, and one after the last attribute that holds a `>`.
  `rsvelte format` now formats a `<script>` that has a `break` or `continue` without a target, as Prettier 3.10 does.
- 8112215: `typecheck` now prints a path inside the project as an absolute path in TypeScript's messages, such as TS7016's, as svelte-check does. It printed that path from the project's root before.
- 455719b: `typecheck` now reads a JavaScript component that a package import reaches as untyped when `allowJs` is on, as svelte-check does. TypeScript loads such a component only within `maxNodeModuleJsDepth`, so beyond it the import reports TS7016, its props are not typed, and the component itself is not checked.

## 0.5.2

### Patch Changes

- ffc3018: `rsvelte check` now reports a finding on an `animate:` directive's movement where svelte-check does. That is the name's last character when the start tag's `>` directly follows the name, and the name's end otherwise.
- 44c2249: `rsvelte check` now reports an event key that svelte2tsx cannot name, as svelte-check does. A
  key in brackets names an event only through a top-level variable that holds a string. Any other
  key in `$$Events` or in a typed `createEventDispatcher` gets that report.
- 52504bd: `compile` now accepts a class expression, type parameter or signature parameter named `eval` or `arguments`, and reports a class expression named `arguments` as svelte does.
- bf43bad: The output of a `.svelte.js` or `.svelte.ts` module starts with the
  `/* <file> generated by Svelte v<version> */` line that `compileModule` writes.
- a06b54d: Type check a component's events as svelte-check does. Events from `createEventDispatcher` and from a bare `on:` keep their own types, and `strictEvents` limits a component to them.
- 9247ecd: `compile` now refuses a `declare` namespace, module or `global` block that holds a value, as svelte does.
- 5024339: Report a name that a typed `createEventDispatcher` cannot resolve once, at the type argument, as svelte-check does, without a second finding that has no source range.
- 4e311b8: Type check a generic component's events as svelte-check does. `on:` on it checks the events it dispatches and forwards, typed by the generics its props infer.
- 1e552ef: `rsvelte lint` now knows the globals that ESLint 10.15.0 knows from `globals` 16.5.0, such as `DigitalCredential`. As in eslint-plugin-svelte, `svelte/no-top-level-browser-globals` no longer reports `localStorage`, `sessionStorage` and `ErrorEvent`, which are now also globals in `node`.
- 0246df2: `typecheck` no longer reports a text `slot` attribute as an unknown prop on a component that fills a slot of its parent component, as svelte-check does. Inside a snippet or a plain element, `slot` stays a prop.
- 2439699: Without a `command`, `rsvelte typecheck` starts the native executable of `typescript` or `@typescript/native-preview` directly instead of through `node`. It saves about 100 ms on each run.
- 3d2714c: Without a `command`, `rsvelte typecheck` also starts `tsrs`'s native executable directly instead of through `node`, or the program `TSRS_BINARY` names.
- 0f84ead: The `typecheck` command reports TS7016 at an import of a JavaScript component, as svelte-check does, also through a package or from a `.ts` file. It no longer reports the findings of a JavaScript component that only such an import reaches.

## 0.5.1

### Patch Changes

- 5c7fece: Report `arguments` in a class field or a class static block with the same error as Svelte.
- 008f2f6: `rsvelte check` no longer skips a component that has a `use:`, transition, `animate:` or `style:` directive on a child component. The compiler rejects those directives, and `rsvelte check` now types their expressions as svelte2tsx does, with any value standing for the node.
- ee9878f: `rsvelte check` no longer skips a component whose instance script has an `export default`. Like svelte2tsx, it removes the `export` of a default function or class, reports the `default` left in its place, and exports a named one by its name. It leaves an interface or an expression as written.
- c90cc27: `rsvelte check` no longer skips a component that has a directive on a `<slot>`. The compiler rejects them, and `rsvelte check` now types them as svelte2tsx does. `use:`, transition and `animate:` take the slot as their element, `on:` and an unfilled `let:` are properties of the slot, and `bind:this` reads the slot as `Record<string, any>`.
- 59a972b: `rsvelte format` prints the files it cannot format in the same order on every run, sorted by path.
- d50923c: The README says that `rsvelte format` refuses `experimentalTernaries`, as oxfmt does.
- 27daac6: `compile` now reports an error in an arrow function's expression body before a clash between its parameter names, as svelte does.
- 0ee77f9: A string statement in a component script no longer becomes a directive in the compiled output. Before, `let { x } = $props(); "use strict";` could print `"use strict";` first in the component function, where it turned on strict mode. It now prints in parentheses, as Svelte does. The compiler also reads an optional property's `?:` in a template type annotation, as in `{#each items as item: { a?: string }}` or `{@const first: { a?: string } = row[0]}`, and an arrow type in a snippet's type parameters, as in `{#snippet s<T extends () => void>(x: T)}`.
- d026f45: Follow Svelte 5.59.1. The client output imports `svelte/internal/init-operations`, which Svelte 5.59 needs to mount a component. The server output renders `<title>` after the rest of `<svelte:head>`. It also drops the comments inside removed `$effect` and `$inspect.trace` statements.
- 64e3921: `compile` now refuses a TypeScript `enum` with a repeated member as svelte does, with `typescript_invalid_feature`, instead of reporting the repeated name.

## 0.5.0

### Minor Changes

- 1c04c06: `format` reads `oxfmt.config.ts` with `node`. It formats Svelte files with every value that oxfmt takes for `quoteProps`, `trailingComma` and `bracketSpacing`. The same holds for `objectWrap`, `arrowParens` and `experimentalOperatorPosition`.

### Patch Changes

- b119ed1: `rsvelte check` no longer types a component as `void` when a stray `}` in its script closes the render function before its return. Like svelte2tsx, it types that component by the export helper's constraints, so an importer can pass any prop.
- 717f866: `compile` now reports the first JavaScript error in the document, as svelte does, when the template and the scripts both carry one.
- 4d94e22: `rsvelte typecheck` reads the `generics` attribute of a JavaScript component, as svelte-check does, instead of reporting `Cannot find name` for its type parameters.
- e949791: Report a parenthesized element of a destructuring pattern at its parenthesis, before any element's own error, as Svelte does.
- 268efc7: `compile` now raises what svelte raises for a TypeScript class member or block function declared again, instead of oxc's TypeScript errors.
- 0855204: `compile` now accepts two parameters of one name in a TypeScript signature or a function without a body, as svelte does.

## 0.4.0

### Minor Changes

- 6e69490: Add `rsvelte help <command>` and `rsvelte <command> --help`, which print what `lint` and `typecheck` read and print, how to configure them and their exit codes. For `format`, they print oxfmt's help.
- 8927eb6: Run `lint`, `format` and `typecheck` in one command, as `rsvelte format lint typecheck --check`. `format` runs first, and the run exits with the worst exit code of its commands.
- 01752cb: Add `rsvelte version`. For each command, it names the official tools and versions whose output the tests compare with. It also names the oxfmt and oxc inside rsvelte and the type checker that `typecheck` would run.
- ad32b26: `format` sorts the imports and formats the `/** */` comments of a Svelte file's scripts when the configuration sets `sortImports` or `jsdoc`, as oxfmt does, instead of reporting an error. It also formats the `svelte` code blocks of a Markdown file.
- fcd7c8e: `format` sorts the Tailwind CSS classes of a Svelte file with `sortTailwindcss`, as oxfmt does with prettier-plugin-svelte. It sorts `class` and the attributes `sortTailwindcss` names, the functions it names in the scripts, and `@apply`. It runs the `prettier-plugin-tailwindcss` installed in the file's project with `node`.
- c224d76: `format` sorts Tailwind CSS classes with `sortTailwindcss`, as oxfmt does, in each file other than a Svelte file. It runs the `prettier-plugin-tailwindcss` installed in the file's project with `node`, and reports an error for each file whose classes it cannot sort.

### Patch Changes

- c974c57: Report a `$` catch parameter that a `var` in its clause declares again at the parameter, as Svelte does.
- 2bcf59b: In `typecheck`, a bindable prop with a numeric or `BigInt` key now has the name the compiled component gives it. For example, `0x10` is `16` and `10n` is `10`.
- 221b441: `rsvelte check` types a component outside runes mode, or one with `$$Events` or slots, as svelte2tsx's isomorphic component, so messages that print its type match svelte-check. A template `await` puts a component in runes mode, and an import can name a JavaScript component as a type.
- ad518d8: `rsvelte check` types a JavaScript component's props by the `JSDoc` comment before `$props()`, as svelte2tsx does. It now reports a wrong prop from an importer and a default of the wrong type.
- 2eeaef2: In `typecheck`, a regular expression with no closing slash now ends where TypeScript ends it, at the first unbalanced bracket of its line. The statements after it on that line, such as `$props()`, stay in the component.
- 79bddb2: Read `<!-->` as an open HTML comment and `/*/` in a tag as an open block comment, as Svelte does, instead of panicking.
- b592719: `compile` and `compileModule` now report acorn's error for `await` or `yield` as an arrow function's parameter, such as `(await) => 1`.
- 39d95b2: The compiler now reports a keyword used as a name, or written with an escape, in the official compiler's words. For example, `let await = 1` gives "Cannot use keyword 'await' outside an async function".
- 3069dfa: Reject a `$` name that a `var` declares again over a parameter, and report a `var` declared twice inside a function at its last declaration, as Svelte does.
- 4491a40: Format a block pattern with a `BigInt` key, such as `{#each xs as { 10n: a }}`, as prettier-plugin-svelte does, instead of refusing the file.
- 5a8666c: `format` sorts the classes of the Svelte attributes that `sortTailwindcss` names by a regular expression, as `prettier-plugin-tailwindcss` matches them, instead of reporting an error.
- 67333ae: Format a file with a typed `{@const}` that spans more than one line, keeping the tag as written, instead of refusing the file.
- f2a3985: Report a JavaScript error in a template expression such as `{delete x}` before an error the parser raises later in the component, as Svelte does.
- a3df8af: `svelte/no-dom-manipulating`, `svelte/require-store-reactive-access` and the rules that skip components now tell a component from an HTML element as Svelte does: `<Foo-bar>` is an HTML element, and `<Ärger>` and `<Foo.>` are components.
- a773ed0: Report an optional chain as the target of an assignment in Svelte's words: "Optional chaining cannot appear in left-hand side".
- c197977: `compile` and `compileModule` now name and place the identifier, as acorn does, when a `var` declares again a name a function declared, such as `function a() {} var { a } = {}`.
- 55ca8bc: The Svelte formatter no longer takes Prettier's `rangeStart` and `rangeEnd`, which oxfmt does not have either. `rsvelte format` never passed them on, so its output does not change.
- 15b4a10: `rsvelte format` formats Svelte files with `semi: false` and `singleQuote: true` instead of reporting an error.
- 689a5fa: Vue: an attribute name with a non-ASCII character no longer crashes the parser, and compiling it leaves the object key bare as `@vue/compiler-sfc` does (`ä: "1"`, not `"ä": "1"`).

## 0.3.0

### Minor Changes

- 0b08084: `format` is now oxfmt with a built-in Svelte formatter. It formats each file type that oxfmt formats in Rust, and it takes the options and the `.oxfmtrc.json` of oxfmt. It no longer reads `.prettierrc`, the `prettier` field of `package.json`, or the `svelte.format` and `typescript.format` options of `rsvelte.config`.
- aaf6775: New package `@rsvelte/eslint-plugin`, the counterpart of `eslint-plugin-oxlint`: it turns off each ESLint rule that `rsvelte lint` runs, so a project can run both. Each rule now has one of oxlint's categories.

### Patch Changes

- 0f52a42: `rsvelte typecheck` now checks a component whose script has a syntax error with its props and default export, as svelte-check does, instead of reporting "has no default export" at each import of it. A dependency component the check cannot project now reads its module script's exports, as a project component does.
- 176499f: A `10n` key in a `$props()` pattern no longer panics the client compiler. It names the prop by its decimal digits, as Svelte does.
- 997f3f9: Compile a snippet whose name starts with `$`, such as `{#snippet $s()}`, which panicked.

## 0.2.5

### Patch Changes

- 6fb6b25: `rsvelte typecheck` now checks a component whose script only TypeScript reads, such as a plain `<script>` declaring `let { n }: { n: number } = $props()`, with its props and default export, as svelte-check does.
- b468347: `compile` and `svelte/valid-compile` raise `props_illegal_name` for a `$$` key of `$props()` and a `$$` member of a rest prop, such as `rest.$$slots`, as Svelte does.
- 8410329: A content binding such as `bind:innerHTML` without a static `contenteditable` now raises `attribute_contenteditable_missing` or `attribute_contenteditable_dynamic` as Svelte does. The compiler used to refuse it as unsupported.
- 52a741c: `rsvelte format` names the `.editorconfig` property it refuses, such as `indent_size` or `max_line_length`, instead of the formatter option it maps to.
- 9150665: The suggestion of `svelte/no-add-event-listener` now finds the arguments after a `//` comment that a carriage return or a line separator ends, and after a byte order mark, as ESLint does.
- accd4b0: `svelte/no-useless-mustaches` now fixes a string literal that starts or ends with U+0085, as ESLint does.
  Numeric `svelte.config.js` keys such as `1e21` or `1e-7` now get the names JavaScript gives them.
- 9150665: `svelte/infinite-reactive-loop` and `svelte/no-immutable-reactive-statements` now read the `$:` statements of a component in source order, as ESLint does. When a `<script module>` with a `$:` statement came after the instance `<script>`, the first rule missed reports and the second reported statements that are reactive.
- 8b23a89: A number key in a `$props()` pattern with a rest element is now excluded from the rest as a number, as Svelte does, so the rest keeps that prop.
- 0eb266c: Name a reserved word written with escapes by its value, `The keyword 'let' is reserved`, as Svelte does.
- 017107d: Reject a `$` or `$`-prefixed name that a declaration tag or a declaration inside a template expression declares in runes mode, as Svelte does.

## 0.2.4

### Patch Changes

- 6b20383: `rsvelte format` now loads each option value as its formatter loads it, from a configuration or from `.editorconfig`. It leaves the files of a value the formatter refuses, such as `endOfLine: "auto"` under oxfmt. It refuses a `printWidth` or `tabWidth` out of range before writing any file.
- 209b3ca: Do not warn `element_implicitly_closed` about an element closed by an end tag that names the element a start tag closed before, as Svelte does.
- d217e69: The server output now renders a binding named after an inherited property, such as `bind:toString` on a `<div>`, as the attribute Svelte renders.
- 26a5293: A rest prop member that an assignment writes directly, such as the setter of `bind:checked={rest.c}`, now stays `rest.c` as Svelte compiles it instead of becoming `$$props.c`.
- 22f9760: `rsvelte typecheck` reports every file of the TypeScript program that svelte-check reports. This includes a file outside `include` that the project imports, such as a component of a workspace package linked into `node_modules`. It honors `skipLibCheck` as svelte-check does and prints a file outside the current directory with `../` as `tsc` does.

## 0.2.3

### Patch Changes

- fb3b328: Read `{let$: 1}`, `{constñ: 1}` and `{typeñ: 1}` as declaration tags of the wrong type, as Svelte does: a declaration keyword ends where an ASCII word ends.
- 4ed91f3: `rsvelte format` now formats the other files when it cannot read or honor one configuration. It leaves the files of that configuration, names it, and exits with 2.
- 8a3c481: A binding named after an inherited object property, such as `bind:toString` on a `<select>` with a dynamic `multiple`, now gets the same checks as any binding.
- 318cb91: A binding on an `<input>` whose `type` is not static text now raises `attribute_invalid_type` as Svelte does. The compiler used to refuse it as unsupported.
- 3c5a684: Lint reads `/* global */` and `/* globals */` comments, so `no-undef` and the rules that track globals see the names they declare or turn off.
- 89b4ef4: `svelte/no-immutable-reactive-statements` reads the type references of a reactive statement, so an undeclared type or a `typeof` of a reassigned variable makes the statement reactive as in eslint-plugin-svelte.
- a411f92: `rsvelte lint` prints the line and column `ESLint` prints for a file that starts with a byte order mark or uses `\r`, U+2028 or U+2029 line breaks. It prints a Svelte syntax error as `ESLint` does: the 0-based column and a `Parsing error: ` message with no rule.
- 0b5746f: Svelte constant folding converts strings such as `"0x+1"`, long hex strings and large `ToInt32` inputs as JavaScript does.

## 0.2.2

### Patch Changes

- 8a99b42: Read `as`, `then` and `catch` in a block tag as a prefix, so `{#each items asx}` reports `expected_whitespace` as Svelte does.
- f022127: Report `each_key_without_as` for a keyed `{#each}` block without `as` instead of crashing, and read an `{#each}` key with its types erased, as Svelte does.
- aacdd5a: Report `element_invalid_closing_tag_autoclosed` for an end tag of an element that a start tag already closed, as Svelte does.
- 9810d15: `rsvelte format` resolves the formatter options of each file as Prettier and oxfmt do: from the nearest configuration and `.editorconfig`. It ignores an unknown option with a warning, and an option that `rsvelte.config` gives a plugin replaces the project's.
- 507e702: `rsvelte lint` reads `compilerOptions.experimental.async` from `svelte.config.js`, so `svelte/valid-compile` no longer reports `experimental_async` for top-level `await` when the option is on.
- 5a1f605: Report a repeated attribute in a Vue template at the repeated attribute instead of at 1:1.

## 0.2.1

### Patch Changes

- c8116c2: Compile `bind:group` beside a `value` made of text and expressions, such as `value="{a}-{b}"`, instead of refusing it.
- ea61e22: `rsvelte typecheck` no longer reports a false "has no default export" at an import of a component whose script only TypeScript reads, such as a plain `<script>` with TypeScript syntax.
- 1db7820: An `{#each}` block without `as` now ends its expression where Svelte does, so a comment or a closing parenthesis after the expression is an error.
- c9c88b5: `rsvelte format` now takes the options of the nearest oxfmt or Prettier configuration, as the 0.2.0 notes announced; 0.2.0 shipped without this change and formatted with Prettier's defaults.
- cf93141: Inside a Git repository, `rsvelte lint` and `rsvelte format` read `.gitignore` files only up to the repository root, so an enclosing repository's no longer skip a nested project's files. Outside Git, `.gitignore` files still apply.
- 9893576: Compile `bind:focused` on `<svelte:window>` and `<svelte:document>` as Svelte does.
- cce073d: `svelte/no-navigation-without-resolve` accepts a link whose `href` an `{#each}` item takes from `resolve()` in a constant array or object literal.
- 050637e: `rsvelte lint` supports the `no-undef` rule for Svelte components.
- 4e358aa: Report `attribute_invalid_multiple` for a binding on a `<select>` with a dynamic `multiple` attribute, as Svelte does.
- dc51a86: The README says that `on:click`, `<slot>` and `createEventDispatcher` work as in the official compiler's runes mode, and that `typecheck` reports `$$props` and `$$restProps` as unknown names.
- d6270b1: The README states that rsvelte supports only Svelte 5 components in runes mode, and what each command does on a legacy component.
- e2b3c65: `rsvelte typecheck` reports the errors of the project's `tsconfig.json` and exits 1, as svelte-check does. Examples are an `include` that matches no file, an empty `files` and an unknown compiler option.
- 7154a25: A `<svelte:options>`, `<svelte:head>`, component or `<slot>` left open at the end of a file now raises `block_unclosed` like Svelte does. A regular element left open raises `element_unclosed`.

## 0.2.0

### Minor Changes

- 1b50998: `rsvelte format` takes the options of the nearest oxfmt or Prettier configuration unless `rsvelte.config` names them. It refuses a configuration it cannot honor and writes nothing. When the Svelte formatter cannot print an option yet, it leaves the Svelte files and exits with 2.
- 1b50998: `rsvelte lint` and `rsvelte format` skip the files that `.gitignore`, `.git/info/exclude` and `.ignore` exclude. `rsvelte format` also skips what `.prettierignore` lists. A `.gitignore` counts only inside a Git repository, and a file named on the command line is still read.

### Patch Changes

- 4f3a68e: `rsvelte typecheck` accepts `bind:this` on a generic component, as svelte-check does.
- afb93f4: `rsvelte typecheck` types the `load` functions and endpoints of SvelteKit files as svelte-check does, so their untyped parameters are no longer implicitly `any`. It also types form actions and the hooks files.
- 1b50998: `rsvelte typecheck` passes over a TypeScript older than 7.1 instead of stopping at it. When it finds no type checker, it prints the command that installs tsrs with the project's package manager.
- 656fa37: `rsvelte typecheck` no longer reports every file as outside `rootDir` (TS6059) in a project that sets `outDir` but not `rootDir`.
- c162947: `rsvelte lint` reports `@typescript-eslint/no-unused-vars` in TypeScript files as typescript-eslint does. Signature parameters, parameter properties and what an ambient context declares count as used, and a `typeof` does not.

## 0.1.0

- The first release: `rsvelte lint`, `rsvelte format` and `rsvelte typecheck`.
