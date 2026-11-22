# @rsvelte/cli

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
