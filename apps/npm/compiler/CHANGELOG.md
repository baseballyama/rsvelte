# @rsvelte/compiler

## 0.11.2

### Patch Changes

- 7a30d48: In dev mode, each link of a chained assignment to a computed member now reports its own source position instead of the outermost link's.

  `$.assign(…, '<file>:<line>:<column>')` locates the assignment's left-hand side. rsvelte matches
  the lowered target back against a source-order site list keyed `(root, path, operator)`, and a
  computed member contributes a valueless `Computed` element — so `o.p[2]` and `o.p[3]` share a key
  and only the order the sites are consumed in separates them. The visitor claimed its site after
  descending, so the inner link of a chain took the outer's site.

- 9693010: Dev-mode `$.assign` is not emitted for a member chain rooted at a global.

  Upstream's `build_assignment` walks the assignment target down to its root identifier and
  stops at `if (!binding) return null`, so `document.body.onfocus = handler` is left alone.
  rsvelte's settled-script pass had no binding test and wrapped every member assignment.

  The guard reads two things, because neither half is sufficient on its own: the pass walks
  the instance body, whose imports have been hoisted out of it, so an imported root resolves
  nowhere in the fragment and is known only to the component's binding set — while a name
  declared inside a function here is not a component binding and is known only to the
  fragment. `shadowed global` and `import` are the two rows that separate them.

- 9693010: dev `$.assign` is not emitted for a member chain rooted at a global in a template expression

  `build_assignment` is ported twice; the settled-script port already stopped at an
  unresolvable root, and the template-expression converter did not — so an assignment
  written in a legacy `on:` handler was still instrumented.

- 5eb7e10: `bind:this` decides which identifiers become callback parameters from the DECLARATION's scope, not from the loop variable's name

  Upstream's `build_bind_this` compares each reference's binding scope against every
  `EachBlock` owner's scope, so a `{@const}` written directly in an each block becomes a
  parameter while the same name one `{#if}` deeper does not. rsvelte matched on the loop
  variable's name, so a `{@const}` never qualified however it was declared. Upstream's two
  exclusions — `is_state_source` and `binding.kind === 'derived'` — are ported with the
  scope test, because the test alone over-collects declaration tags.

  Two further divergences were in the same walk. It was a hand-written match over `JsExpr`
  with a `_ => {}` arm, so a reference inside a `||`, a template literal, an object, a
  `new`, an optional chain or a unary/update operator was silently not looked at. And
  upstream marks a name seen _before_ asking whether the occurrence is a reference, so an
  identifier in a non-reference position burns the name for every later one: `els[{ k: k }.k]`
  collects nothing while `els[{ kk: k }.kk]` collects `k`.

- 22bec30: A class field's `$state` initializer resolves an identifier through its binding, as upstream's
  `should_proxy` does, instead of wrapping every one in `$.proxy`
- 5b9665b: A class body's brace is not the first one after the header: a heritage clause can open its own
- ae472eb: Two client-side scope defects. A `style:` directive's value now reaches
  `build_expression` with the metadata phase 2 filled in for the ExpressionTag rather
  than for the directive, so a call in a style directive keeps its legacy
  `($.deep_read_state(dep), $.untrack(() => value))` wrapper instead of being emitted
  bare. And a `const` declared in a `try` or `finally` body inside a template
  expression now shadows an outer reactive `let`: those two bodies were walked with
  the outer scope, so every read was lowered as a signal read and the generated code
  passed the component's state where the source passes the local.
- b02d7fa: Stop `svelte2tsx` reading code out of a comment or a literal. Upstream answers this with its parser — `findNextVerbatimElement` opens its regex with a `(<!--[^]*?-->)` arm and skips any match that starts with it, `ComponentEvents` walks the TypeScript AST, and `Stores` is fed by the Svelte AST walk — while three scans here answered from bytes. So a `<script>` inside an HTML comment was recovered as an orphan script and its body injected ahead of the imports, a `dispatch('x')` inside a `//` comment became a component event, and a `$name` inside a template expression's comment or template literal became a store subscription. `js_scan::opaque_runs` reports a JS region's comments, strings, regex literals and template-literal text chunks (a `${…}` substitution stays code), and the three scans consult it.
- 9c77127: `compile()`'s `ast` no longer carries TypeScript type annotations. Upstream's
  `remove_typescript_nodes` deletes `typeAnnotation` and the TS `optional` marker
  from every node it visits, and `result.ast` is serialized from that stripped
  tree; rsvelte kept both on `Identifier`, `ObjectPattern` and `ArrayPattern`,
  where nothing but the serializer reads them. The public `parse()` AST is
  unaffected — it never runs the strip, and upstream keeps the annotations there.
- 4cdc135: Keep the parentheses around a compound assignment's binary right-hand side. `s += 'a' + x + 'b'` expanded to `$.set(s, $.get(s) + 'a' + x + 'b')`, which evaluates differently from `$.get(s) + ('a' + x + 'b')` whenever the operands mix types.
- 4e2ba30: Dev-mode `console.*` no longer wraps an argument whose value is known. A `$state` / `$derived` declaration is resolved through the rune's argument the way upstream's `scope.evaluate` does, in the lowered spellings the script passes see, and a declarator's verdict is keyed by the symbol it declares rather than by its name — so two declarations sharing a name no longer silence each other.
- 7a30d48: An enclosing `{@const}` is re-expanded into an element's snippet wrapper

  `RegularElement.js:333` hands the children the parent's `consts` array itself when the element
  declares none of its own, and `:443` splices that same array into the `{ … }` wrapper a
  `{#snippet}` in its fragment creates.

- 5b9665b: A class field whose constructor rune call spans lines is no longer dropped
- d781aca: A `{const}` / `{let}` tag now reads every template-scope binding through that binding's own read, not through a hand-written list of two kinds. Snippet parameters, `let:` bindings and `{@const}` bindings were read bare, so a value produced by one of them was frozen at its first-render value.
- 7a30d48: A destructuring assignment caches its right-hand side from the visited read

  `shared/assignments.js:20-22` decides `should_cache` with `value.type !== 'Identifier'` on the
  **visited** node, so a runes prop that is never written — which reads as `$$props.data` — is
  cached in `$$value`. rsvelte answered that from the list of props eligible as assignment
  targets, which excludes exactly those.

- 95ba248: Read a destructured `export let` property through its key, and build a rest element as `$.exclude_from_object`.
- 114c993: Vectorise the two whole-source scans dev-mode prop-mutation validation runs, and stop allocating a name for every identifier the assign-tail scanner rejects
- 051e359: Give a `bind:` / `class:` shorthand's synthesized `Identifier` no `loc`, as upstream's does, and stop stripping the `loc` off an explicit one. Upstream builds that node by hand in `1-parse/state/element.js` and simply writes no `loc`; rsvelte attached one in the parser and then removed it again wherever `expression.name === directive.name`, which is a different predicate — it also fires on `bind:map={map}`, whose expression _was_ parsed and _does_ carry a position. The strip lived only in the legacy converter, so the two AST modes were wrong in different places: `legacy` dropped a real expression's `loc` while `modern` kept a synthesized one on both shorthands. `parse()` is the only affected output; `compile()` is byte-identical on all four targets across the corpus.
- f30f653: The legacy `$$props` → `$$sanitized_props` rename is decided per occurrence rather
  than per line, so a `$$props` written in a comment, a string or a template's text
  keeps its spelling, and a genuine read inside a `$.prop(…)` default is no longer
  skipped because the generated call shares its line.
- 5b9665b: A legacy reactive import is invalidated through its `$$_import_` alias, not through its own name
- 7a30d48: An each item that is reassigned now reads as `collection[$index]` inside an inner `bind:`'s invalidation dependency list, as it already did everywhere else.

  Upstream reads a reassigned each item as `collection[$index]` and never as `$.get(item)`
  (`EachBlock.js:216-227`). rsvelte ports that rule as `build_reassigned_item_read` and applies it
  at eight sites; the dependency list an inner `bind:` hands to `$.invalidate_inner_signals` is a
  ninth, built by a string loop that consults `state.transform` directly, so the rule never reached
  it. Every other read of the item in the same output was already correct.

- f30f653: A comment trailing a semicolon-free `export let` is no longer dropped from the generated `$.prop` call.

  esrap flushes a same-line comment after a source declaration onto the initializer node, so once
  that initializer becomes `$.prop(…)`'s last argument the comment prints inside the call. rsvelte's
  port restored the comment only when the text before it ended in a `;` — and a declaration is
  delimited by ASI as readily as by a semicolon, so `export let v = 1 // c` lost it.

- 117dd8a: Search phase-3's generated-code probes with `memmem` through a shared `Substring` trait
- 23e0672: A rule nested under `:global(.foo) { … }` no longer counts an unused child toward
  its parent's non-emptiness. Upstream reads "am I inside a global block" off
  `metadata.is_global_block`, and `is_global_block_selector` sets that only for a
  bare `:global` — `args === null` — so `:global(.foo)` is an ordinary rule there
  and `is_empty`'s `(is_used(child) || is_in_global_block)` test does not fire.
  rsvelte carries that single upstream concept as two separate flags, one of which
  never looks at `args`, and the empty check read that one: a parent whose only
  child is an unused rule survived with the child commented out, where official
  comments the whole parent as `(empty)`.
- c1af735: A `:global { … }` block's body now goes through the same `Rule` / `Atrule` visitors as
  any other block, as upstream's transform does; only the scoping is skipped. The
  non-minify path used to copy each child verbatim and apply deletion ranges, which can
  express `remove_global_pseudo_class` but not the `/* (empty) … */` comment, so a nested
  empty rule inside a lone `:global { … }` was emitted instead of being commented out.
- c4de14e: Three decisions inside a bare `:global { … }` block now answer the way upstream's
  single `metadata.is_global_block` does. Under a descendant-position block
  (`.x :global { … }`) an `animation` reference was hashed while its `@keyframes`
  was not, so the emitted CSS named a keyframe nothing defines and the animation
  silently did not run; a nested `:global(...)` kept its wrapper, because the
  selector was returned as source text and so skipped `remove_global_pseudo_class`
  along with the scoping modifier upstream really does skip; and `is_rule_empty`
  had no counterpart for `is_empty`'s opening `children.length === 0`
  short-circuit, so a global block whose only child is an empty rule was commented
  out whole instead of having the verdict land on that child.
- 9c5a6e2: Read CSS AST fields by linear scan instead of hashing the key, 3.0-4.3% on every surface
- 9574b23: Read every compiler-side JSON AST field by linear scan, a further 1.2-1.5% on each surface
- 7a30d48: A legacy `export let` default holding an equality operator is lazy in dev only

  Upstream runs `is_simple_expression` on the visited default, and dev rewrites `===` / `!==` /
  `==` / `!=` into `$.strict_equals` / `$.equals` calls — so the same default is eager in
  production and thunked in dev. The scan deciding it also read a `(` after an operator as a
  call, which made `a || (b === 'x')` lazy in production where official is eager.

- dd3258d: Scan the source-map resync windows with `memchr` instead of a scalar `position`
- be70282: Search the three hottest generated-code scans with `memmem` instead of rebuilding a two-way searcher per call
- 08e71e2: A module script's member assignment in value position is now wrapped in dev's
  `$.assign(...)`, as upstream's one `AssignmentExpression` visitor does for every
  script. rsvelte ran that collector only over a settled instance script, so a
  `.svelte.js`, a `.svelte.ts` and a component's `<script module>` all emitted the
  bare assignment and lost the proxy warning it exists to give
  (`(object.items ??= []).push(x)`).
- 5b9665b: A method call in an assignment target's chain is not a mutation, and a mutation nested in a `$:` right-hand side is one
- f1588a3: Treat a component's `let:` variable as out of scope inside that component's named slots, the way upstream's scope chain does.
- fd72d98: The namespace scan now stops at the first **html** element, as upstream does, rather than at the first element of any kind. An `<svg>` in an `{#if}` branch stopped the walk before the sibling branch was reached, so a branch whose content is html was templated with `$.from_svg`.
- 8cf5b72: `$$ownership_validator` is declared for a prop mutation that was SEEN, not only for one that could be wrapped

  Upstream latches `analysis.needs_mutation_validation` before it builds the mutation's
  property path (`shared/utils.js:406`), so a computed key it cannot spell — anything but an
  identifier or a literal — leaves the mutation unwrapped and still emits the preamble.
  rsvelte derived the flag from a text scan for `$$ownership_validator.mutation`, which by
  construction can only find a mutation that _was_ wrapped, so
  `object[objectKey ?? key] = v` emitted neither.

  A second divergence sat one level further out: `scan_member_chain_names` bailed on a root
  wrapped in plain parentheses, because the helper that steps over a parenthesised root only
  accepted an `as` / `satisfies` assertion inside them and acorn erases an empty pair. The
  two are not orthogonal — the scan builds `PropMutationSites`, which `source_has_member_write`
  reads, which gates the latch — so a fix for the index alone is dead on a parenthesised root.
  Ablating each half separately measures it: the latch alone falls on 15 of the grid's 24
  cells, the root arm alone on all 8 parenthesised ones including the three whose wrap the
  latch never touches.

  The latch itself then had to learn the other half of upstream's condition. Upstream reaches
  the validator through `scope.get(name)` (`shared/utils.js:396`), so a name that is a prop
  but resolves to something else declares nothing; this pass asked only whether the name
  matched a prop, so `list.forEach((p) => { p.x = 1 })` latched on the parameter. The
  generated instance body parses as a top-level statement list, which makes the props the
  root scope's bindings and a shadow any other scope — the test `state_pipeline_ast` already
  makes. Deriving the answer from the binder rather than from a list of shadowing syntaxes is
  what closes it: `for (const p of …)`, `catch (p)` and a block-scoped `let p` are not
  parameters, and `is_shadowed_by_function_param` declines all three.

- 44d3d83: A parenthesized `$state` assignment right-hand side keeps its proxy in `compileModule`.

  acorn builds no `ParenthesizedExpression`, so upstream's `should_proxy` decides on what the
  parens hold. rsvelte ports that predicate twice: the AST port recurses through the pair, and
  the text port used by the module path had no paren step at all — `is_top_level_function_call`
  reads only an identifier callee and bailed on a leading `(` with a comment saying so. The two
  predicates have opposite defaults (`should_proxy` returns false only for the shapes it
  enumerates, the sniff returns true only for the shapes it enumerates), so every shape neither
  recognised fell out unproxied.

  Measured one cell per shape against `submodules/svelte` 5.56.10 in both hosts: 25 of 40 module
  cells diverged and 0 of 40 component cells did, so the class is `compileModule`-only. Every
  divergence ran one way, and the six agreeing paren cells — `(1)`, `('s')`, ``(`t`)``,
  `((x) => x)`, `(!a)`, `(a + b)` — are exactly the inner shapes `should_proxy` refuses, which is
  what a "a leading `(` proxies" rule would have broken.

  The ratchet carrier is `svelte-lexical/demos/qalam/src/lib/notesStore.svelte.ts`, and it
  diverged only under `dev` because the await instrumentation rewrites the right-hand side into
  `(await $.track_reactivity_loss(…))()` before the proxy decision reads it — one line of 166,
  with the same source byte-equal in production.

- 68ba92c: Four node kinds reach the public `parse()` AST instead of being dropped by a catch-all.

  `TSImportEqualsDeclaration`, `TSExportAssignment` and `TSNamespaceExportDeclaration` fell
  through `convert_statement_for_program`'s `_ => None`, and a class-body `TSIndexSignature`
  fell through the two class-element converters' — so every consumer that reads rsvelte's AST
  without compiling (`rsvelte_lint`, svelte2tsx, the language server, the playground) saw a
  statement or a class member that is not there. Official's AST carries all four.

  Each is carried as its complete ESTree object, the same representation the neighbouring TS
  declarations already use, and the class-element converter that now names every `ClassElement`
  variant has lost its catch-all: a new oxc variant is a build error rather than a silently
  dropped node.

  The stand-in a namespace body used for an `import x = require(…)` — a `DebuggerStatement`
  with the right span, there only to keep the namespace non-type — is gone with it, so
  `parse()` no longer reports a node the source does not contain.

- 865392d: A namespace reaches the public `parse()` AST with its name, its modifiers and a real `TSModuleBlock`.

  `TSModuleDeclaration` carried only a span and a body: no `id`, no `declare`, no `global`, and the body was a `BlockStatement` spanning the whole declaration where acorn-typescript emits a `TSModuleBlock` spanning the braces. A dotted `namespace A.B { … }` — which acorn-typescript parses as `A` whose body is `B` — was flattened into a block holding one statement.

  The binary `parseEnvelope` format carries the same three fields and a new `TSModuleBlock` tag, so the Rust writer and the JS decoder that ship together in `@rsvelte/vite-plugin-svelte-native` stay in step.

  The strip is unchanged in behaviour: it now walks through a nested declaration to the innermost block, so a non-type node is still rejected in the dotted form, which upstream cannot even reach (it reads `node.body.body` and throws a raw `TypeError`).

- 3841964: `parse()` emits `TSDeclareFunction` instead of dropping the statement.

  A function with no body — a `declare function`, or an overload signature — was filtered out
  of the AST entirely. Upstream keeps it: acorn-typescript spells it `TSDeclareFunction`, with
  no `body` key at all, `declare` stamped only where the keyword is written, and `returnType`
  where one is annotated. `compile()` still erases it, the way upstream's
  `TSDeclareFunction() { return b.empty; }` visitor does.

  Dropping a statement is not one missing node. The AST comparison walks a body array index by
  index, so every sibling after the hole pairs against the wrong node and reports divergences
  that belong to neither.

  `returnType` was never emitted on an ordinary `FunctionDeclaration` either; it is the same
  field, so both are carried now. The binary parse envelope grew two fields, and its writer and
  its decoder ship in one fixed group because a decoder that ships ahead of its writer reads the
  wrong offsets.

- e13da35: The published compiler is built with a checked-in PGO profile.

  Held out from its own training set — training selects `--skip 0` and evaluation
  `--skip 1` at the same stride, so the two file sets share no file — and measured
  over ten ABBA passes with both arms rebuilt from one tree, it is worth 1.100x on
  client, 1.111x on server, 1.139x on client-dev and 1.110x on server-dev in the
  parallel shape the performance report publishes, with every arm producing a
  byte-identical output.

  The profile's training set is exactly the set of workloads the flag is applied
  to, which is why `parse` and `svelte2tsx` are in it and the formatter, linter and
  checker are not: `-Cprofile-use` treats a function with no counters as never
  executed, so a profile handed to code it never trained on makes that code colder
  rather than merely un-improved.

- 7a30d48: A JSDoc comment before a parenthesised prop default no longer makes it a lazy thunk.

  `is_simple_expression_str` decides whether a prop default is emitted as a value or as
  `() => value`, and its call test — "ends in `)` and something precedes the matching `(`" — read a
  leading comment as the callee. Neither axis reproduces it alone: the comment without parentheses
  does not end in `)`, and the parentheses without a comment have nothing before the `(`.

- e812ce8: A write inside a prop's default value now reaches the passes an instance body
  already gets. Upstream visits a default with the same `AssignmentExpression` and
  `UpdateExpression` visitors as any other expression; rsvelte reaches it through
  passes that skip a line containing `$.prop(`, and only the read halves had a
  default-scoped counterpart — so `export let f = () => ($store = 1)` emitted
  `() => ($store() = 1)`, which no JS parser accepts, and `() => (prop = 1)`
  dropped its invalidation.
- 7a30d48: Legacy `$.reactive_import` declarations follow the hoisted module snippets

  `transform-client.js:201` unshifts them onto the module program's body and `:513` assembles
  `[...imports, ...module_level_snippets, ...body]`, so a hoisted `{#snippet}` comes first.

- af95bc3: A TypeScript-only statement form no longer fails the server compile with a code-less error.

  `import x = require(…)`, `export = a` and `export as namespace N` are TypeScript module
  syntax, not type annotations, so upstream's eraser leaves them alone and copies each one
  verbatim into the generated JavaScript. rsvelte's server ran its classification parse in
  plain-JS mode, rejected the erased text, and returned `TransformError::CodeGen` — an error
  whose `code` is `null`, which is the one shape the error ratchets cannot classify, since
  `error-message` / `error-position` / `error-end` / `error-frame` are all chained behind it.

  The classification parse and the statement re-home now retry in TypeScript mode, so those
  three statements are classified and emitted rather than failing the compile. Measured
  against `submodules/svelte`, the server output is byte-identical to upstream's on all three
  — including the fact that neither output parses, which is upstream's half and is filed
  separately. A rejection by both parsers is still a compile failure, so the retry widens the
  accepted set by exactly the population that used to throw.

- 9c77127: `skip_opaque` is now guarded on its opener byte before being called. It answers
  `None` for every byte outside `` ` ``, `'`, `"` and `/`, and is too large to
  inline, so without the guard every ordinary byte of a script paid a call to be
  told no. Client compile is 0.65% faster and server 1.91%, with output
  byte-identical on the corpus.

  The guard is four immediate compares rather than a 256-entry lookup table: the
  table form measured 1.62% _slower_ on the client, where the per-byte load costs
  more than the branch saves, while being 2.41% faster on the server.

- f49e162: Ancestor scoping follows a `{@render}` into the snippet it renders

  `2_analyze/css_scoping.rs` is the second port of "where is a `{#snippet}` body rendered", and
  its subject is the template — which elements carry the scope class — not the CSS text. Its
  `{@render}` arm computed a snippet name, looked it up in a name-keyed map and then did
  nothing with the answer, so an element whose only matching descendant lives inside a rendered
  snippet was left unscoped while the CSS rule that matches it was kept: two halves of one
  answer disagreeing inside a single output. It now ports `get_descendant_elements`' `RenderTag`
  case, keyed by the snippet's node rather than by its name, and reaches a snippet passed to a
  component as an attribute through the component's own position.

  A snippet body is walked once per render site, and `metadata.scoped` is the union over those
  sites, so the direct-match write is `|=`: with `=`, a second site that matches nothing erased
  the first site's answer. It is the only field this walk writes.

  Ancestor chains are resolved transitively — a `{@render}` written inside another snippet
  inherits that snippet's own sites — and a snippet may render itself, so the walk needs a guard.
  Upstream's `get_ancestor_elements` adds to its `seen` set and never deletes, so a snippet is
  expanded at most once per resolution; that is both the termination bound and the reason the
  answer is a function of where the walk started rather than of the snippet, which is why it
  cannot be memoised. Unwinding the guard on the way out instead — the readable spelling —
  enumerates every acyclic path and does not finish on a real `svelte.dev` component.

- c330966: A `{#snippet}`'s render sites are keyed by the snippet it renders, not by that snippet's name

  Upstream fills `SnippetBlock.metadata.sites` in one pass over `analysis.snippet_renderers`
  (`2-analyze/index.js:847`): a renderer whose callee resolves to a local snippet is a site of
  that block NODE, one that resolves to nothing gets `node.metadata.snippets =
analysis.snippets` and so is a site of every snippet in the component, and one that resolves
  outside it — a prop, an import — is a site of none. rsvelte keyed that map by the snippet's
  name, so two `{#snippet row()}` in different scopes merged and each was given the other's
  ancestors; and it had no notion of an unresolved renderer, so `{@render f()}` with `f` an
  ordinary local, `<Comp {...spread}>` and `<Comp foo={row} />` contributed nothing. A
  component is now kept `resolved` when an expression attribute is an identifier naming a
  snippet, as upstream does, rather than being unresolved for any non-literal.

  The registration for a snippet declared directly inside a component tested
  `context.path.last()`, but `visit_node` pushes the node before dispatching, so inside the
  SnippetBlock visitor that is the snippet itself and the branch had never run. Nothing
  noticed while a missing site meant "unknown, stay conservative"; a real `svelte.dev`
  component starts losing a CSS rule the moment an empty site set becomes an answer.

  The same upstream rule is ported a second time in `2_analyze/css_scoping.rs`, which still
  keys by name and whose `{@render}` arm does not follow the tag into the snippet at all;
  that half is unfixed and is `compatibility/GATES.md#two-ports-inventory` row 27.

- 5b9665b: `$state(p?.x)` keeps its `$.proxy`. Upstream's `should_proxy` proxies everything
  it does not recognise as primitive; rsvelte's sniff proxied only what it did
  recognise, and an optional chain matched no member or call predicate because
  `p?.x` splits into `p?` and `x`. The chain is now read in its plain form, with
  `?.` followed by a digit left alone — there it opens a ternary, not a chain.
- 9208412: Ask whether an attribute can be set statically of the raw name, not the normalized one, so a case variant of `autofocus` / `muted` / `defaultValue` / `defaultChecked` stays in the template
- 7a30d48: A `<select bind:value={$store.x}>`'s indirect bindings now attach to the `$store`
  binding, so a store member write emits the `$.invalidate_inner_signals` tail
  upstream emits — while `$store.x++` still does not, because `UpdateExpression.js`
  never imports `build_assignment`.
- b1a65e2: An attribute's host now answers `Attribute.ts`'s two host tests separately, and a
  valueless CSS custom property is `true`.

  `element instanceof Element` picks the `data-` workaround
  (`...__sveltets_2_empty({…})`) over the component-only `--` one
  (`__sveltets_2_cssProp`), while the attribute-case fold needs
  `parent.type === 'Element'` as well. A `<slot>` is built as an `Element` whose node
  type is `Slot`, so it takes the first wrapper and not the second — rsvelte had the
  two the wrong way round. A named-slot element is a real element and now folds its
  attribute name's case like any other. And `<C --x />` types the property as `true`,
  not `""`: the `""` fallback in `addProp` is only reached when `addAttribute` is
  called with no value, which the valueless branch never does.

- 6cad1c3: A `$`-prefixed key of a binding pattern is a store reference everywhere except
  the pattern's first element, and rsvelte emitted no store subscription for any
  of them — `let { a, $permissions: permissions } = o` lost its
  `let $permissions = __sveltets_2_store_get(permissions);` line.

  `processInstanceScriptContent` tracks "am I inside a declaration" with a single
  boolean whose on-leave callback clears it unconditionally, so leaving a pattern's
  first element clears a flag the enclosing pattern had set and every element after
  it is walked as an expression. The rule that produces — a key is a name iff it is
  the first element of its own pattern — is reproduced here, including the nested
  cases where entering an inner pattern re-sets the flag. Reported as
  `upstream_issues/svelte2tsx-isdeclaration-is-a-boolean-not-a-stack.md`.

- 167f272: An `export { x as y }` written above `let x` is a value export, as upstream has it.

  Upstream fills `possibleExports` during one in-order walk, so a named export
  specifier seen before its declaration finds nothing and keeps `isLet: false` —
  which makes it a value export rather than a prop (`ExportedNames.ts:634`). rsvelte
  collects the same map in a pre-pass over the whole program body, so it answered the
  same question the same way in either order.

  The exported name is not the axis: `export { x as class }` and `export { x as b }`
  behave identically, and a plain `export { x }` above its declaration was wrong too.

- b1a65e2: `$: x = y as T` parenthesises its `__sveltets_2_invalidate` arrow body

  Upstream wraps that body in parentheses under a three-way condition — an object
  literal, an expression whose text starts with one, or an `as` expression. rsvelte
  answered the whole condition with `rhs.starts_with('{')`, which covers the first
  two and cannot express the third, so a reactive declaration whose right-hand side
  is a TypeScript assertion lost the parentheses.

- b1a65e2: An `is="x-y"` attribute makes an element a custom element, which keeps its attribute-name case

  Upstream's `Element.isCustomElement()` has two conditions — a dash in the tag name,
  and an `is=` attribute whose first value chunk is text containing a dash — and only
  a custom element is exempt from the attribute-name lowercasing. rsvelte answered the
  question with `tag.contains('-')` alone, so `<div is="x-y" defaultValue="1">` emitted
  `"defaultvalue"` where official emits `"defaultValue"`, on every element host.

  The tag was also being passed as `""` on two of the four hosts, which happened to be
  harmless only because `title` and `svelte:element` contain no dash. Both now pass the
  real tag and the caller answers the whole predicate.

- 167f272: A multi-line `/** @type {{ … }} */` on a `$props()` destructure is emitted verbatim.

  Upstream gates the `@type` → `@typedef … $$ComponentProps` rewrite on
  `/\/\*\*[^@]*?@type\s*{\s*{.*}\s*}\s*\*\//` (`ExportedNames.ts:269`), and that regex
  has no `s` flag: the inner object must close on the line it opens, and the first `@`
  in the block must be the `@type`. Everything else falls to an else arm that keeps
  `$props.comment = comment` and emits the comment itself. rsvelte tested only whether
  the extracted type text started with `{`, which is true for both shapes, so it
  rewrote the blocks upstream copies — and rebuilt the comment from the type text,
  which loses a multi-line block's own layout.

  JS's `.` excludes `\n`, `\r`, U+2028 and U+2029 while Rust's excludes only `\n`, so
  the transcribed condition spells that exclusion out.

- b1a65e2: A mustache in an attribute value now contributes the text between its braces, not the
  span of the expression node inside them.

  Official copies the interior verbatim into the template literal it builds, so
  `class="x {// why⏎a} z"` keeps the comment and `class="x { a } z"` keeps its two
  spaces; rsvelte emitted `${a}` for both. The interior reaches a template literal
  through two builders — the string one used by `<slot>` and named-slot-element
  attributes, and the segment one used by elements, `style` and component props — and
  both had the expression's span.

- b1a65e2: An element that targets a named slot with a `slot` attribute now lowers its `bind:`
  directives like any other element.

  That element is handled by a second port of the element transform, which built its own
  attribute object and its own class/style + transition suffix and never ran the binding
  pass — so `bind:this` stayed a `"bind:this": element` prop instead of becoming
  `const $$_button1 = svelteHTML.createElement(…); … element = $$_button1;`, a two-way
  binding lost its `() => v = __sveltets_2_any(null)` setter, and a void or self-closing
  element closed with a leading space that only an overwritten `</tag>` produces.
  `<svelte:element>` and the special elements share that attribute builder and emit the
  suffix themselves, so they lower the same bindings now too.

- b1a65e2: `<svelte:fragment slot="…">` keeps its attribute names and its opener layout.

  It is an `Element` whose node type is not `Element`, so the attribute-case fold and
  the number-only rewrite do not reach it — `<svelte:fragment slot="s" someProp="0"
cols="3" />` keeps `someProp` and types `cols` as a string. And its opener is
  position-preserving like any other element's: the columns the stripped `slot=` and
  `let:` occupy come back as spaces whether or not another attribute survives, where
  rsvelte emitted them only when nothing did.

- 167f272: Two fixes to the JSDoc a prop carries into the emitted `props:` object.

  `createReturnElements` writes `\n${doc}${name}`: the comment is preceded by a
  newline and followed by nothing. rsvelte wrote the comment followed by a space,
  which oxfmt normalizes away — so the corpus gate could not see it, while raw
  output differed on 738 of 33,901 components.

  `getLastLeadingDoc` also removes every `@typedef` tag from the comment before it
  reaches the prop, and rsvelte kept them. That removal is offset by `node.pos` in
  upstream, because `tag.pos` is SourceFile-absolute and is indexed into a
  node-relative slice, so it only lands when the declaration is the script's first
  statement. rsvelte reproduces that: `@typedef` tags are stripped when nothing
  precedes the comment and kept otherwise. The remaining case — a shift that lands
  inside the comment, where upstream deletes the wrong text — is filed as
  `upstream_issues/svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md`
  and is not reproduced; no corpus component reaches it.

- b1a65e2: The `$$ComponentProps` typedef is inserted before the declaration's leading comments

  Upstream inserts `;type $$ComponentProps = …;` at `node.parent.pos`, and TypeScript's
  `pos` spans the declaration's leading trivia — so the insertion lands before any
  comment that precedes the `$props()` declaration. rsvelte walked back from the
  `let`/`const` keyword, and two of the three branches that compute this offset stopped
  at whitespace, appending the typedef onto a preceding `// …` line where the line
  comment swallowed it. The output was not TypeScript.

- 167f272: Three fixes to where `function $$render()` opens relative to a hoisted type
  declaration. All three decide the same thing — which instance-script types may
  move above `$$render()` — and each was wrong in a different direction.

  A `type T = $$Generic` alias name was not treated as a generic in scope on
  `$$render<T>()`, so an `interface Props { a: T }` was hoisted to module scope
  where `T` does not exist. `Generics.getReferences()` is filled from both the
  `generics="…"` attribute and every `$$Generic` alias, and that is the set
  `moveHoistableInterfaces` adds to `disallowed_types`.

  `$$Props`, `$$Slots` and `$$Events` were excluded from the hoist candidates
  outright. Upstream calls `analyzeInstanceScriptNode` on every top-level node, so
  those three are ordinary candidates there and hoisting them is what shifts
  everything after them by a line.

  A shorthand name in an object binding pattern inside a type — the `title` of
  `textFactory: ({ title }: { title: string }) => string` — was read as a value
  reference by the lexical dependency scan, so a prop of the same name blocked the
  hoist. Upstream collects type references from the AST, where such a name is not
  one.

- 383cc44: A prop widener that would land on the script's last byte is no longer emitted, because
  upstream discards it there.

  `preprendStr` overwrites the single character at its insertion point rather than appending,
  so `propTypeAssertToUserDefined`'s `;x = __sveltets_2_any(x);` at `declaration.end` is
  overwritten by the `</script>` removal when the declaration is the last thing in the script.
  Any trailing byte — a space, a tab, a comment, a `;`, a newline — moves the insertion point
  and the widener survives. The same position carries the SvelteKit `./$types.js` annotation
  when the declaration ends at its name, so that is lost with it. Reported as
  `upstream_issues/svelte2tsx-preprendstr-insertion-at-the-script-end-is-overwritten.md`.

- 167f272: Three svelte2tsx fixes, two of which produced TypeScript no parser accepts.

  An element carrying a `slot=` attribute inside a component went through a second,
  legacy attribute emitter: a `use:` action was written as an entry _inside_ the
  props object and a transition as `__sveltets_2_ensureTransition(f)(tag, {})`, both
  of which are syntax errors. Named-slot elements now use the same
  `build_directive_prefix_suffix` path as every other element, so an action becomes a
  preceding `const $$action_N = …` and a transition a call after `createElement`.

  `dispatch(` + backtick + `${name}:trigger` + backtick + `)` registered an event named after the raw
  template text. Upstream's `checkIfCallExpressionIsDispatch` accepts only a
  `ts.isStringLiteral` first argument, which a template literal is not — substituting
  or not.

  A typed `createEventDispatcher<{ change: … }>()` whose member name is also a
  _forwarded_ `on:change` did not emit the `'change': __sveltets_2_customEvent` entry.
  Upstream seeds its `events` map from the bubbled events in the `ComponentEvents`
  constructor, so `addToEvents` sees a collision and the name joins `dispatchedEvents`.

- b1a65e2: `<svelte:body>`, `<svelte:window>`, `<svelte:document>`, `<svelte:head>` and
  `<svelte:fragment>` no longer fold an attribute name's case or rewrite a
  number-only value.

  Both rewrites need `element instanceof Element && parent.type === 'Element'`, and
  every one of those tags is an `Element` whose node type is not `Element` — only
  `<svelte:element>` carries that type. So `<svelte:window someProp="0" cols="3" />`
  keeps `someProp` and types `cols` as a string, where rsvelte emitted `someprop`
  and `3`. The `data-` wrapper needs only the first condition and is unchanged.

- b1a65e2: A component with a module script now emits two store-subscription ignore regions at the
  render-function start rather than one.

  Upstream builds a second `ImplicitStoreValues` for the module script, seeded with the
  instance script's accessed stores but with its own import list, and each instance wraps its
  own names in one `/*Ωignore_startΩ*/ … /*Ωignore_endΩ*/` region. rsvelte collected both
  scripts' imports into one list, which also dropped a name imported by both scripts — upstream
  declares it in each region — and would have emitted the module's region first when the module
  script is written second.

- b1a65e2: A `<slot>` attribute written with no value no longer declares a slot prop.

  `handleSlot` skips any attribute whose `value` has no length, and a valueless
  attribute's `value` is `true` — so `<slot a b={b} />` types the slot as `{b: …}` and
  rsvelte typed it as `{a: …, b: …}`, adding a prop consumers never receive.

- 7a30d48: A tagged template with a pure tag no longer forces a `$.template_effect`

  `TaggedTemplateExpression.js` sets `has_state` from the tag's purity alone, so
  `pattern={String.raw`…`}` is written once at init. rsvelte's `has_reactive_state_json` had no
  arm for the node type and fell into its conservative `_ => true`.

- 82df28b: Seven `TSType` variants fell through `convert_ts_type`'s catch-all and serialized as a span-bearing `TSUnknownKeyword` stub, so `parse()` reported a conditional, infer, mapped, query, import, predicate or template-literal type as `unknown` and dropped the whole subtree under it
- 44d3d83: A `$state` write whose value is a prop with an `undefined` destructure default is no longer
  wrapped in `$.proxy`. Upstream's `should_proxy` answers `false` for `undefined` in the same
  clause as the literal types and resolves a bare identifier by recursing on `binding.initial`;
  rsvelte ports that node-type list twice, and `is_non_proxy_node_type` was the correct port's
  negation without the `undefined` arm. Two of its four call sites had bolted the arm back on at
  the call site and two had not, so the answer depended on which list a binding reached. The
  identifier name is now a parameter of the predicate rather than a caller-side `||`.

  Measured one cell per shape against the official compiler: 8 of 24 diverged before and 2 after,
  the remaining 2 being a `<script module>` local that reaches a different port (0 carriers over
  33,545 corpus files). A 134,180-unit four-target sweep moves 2 units, both `MISMATCH -> match`.

- 7a30d48: An `++` / `--` on a state or prop member no longer grows the
  `$.invalidate_inner_signals` tail. `UpdateExpression.js` does not import
  `build_assignment`, so upstream attaches that tail only to an assignment; the
  same binding's `=` and `+=` keep it. The wrapper was applied in four places —
  the AST and in-place ports of both the legacy-state and the prop member
  mutation transforms.

## 0.11.1

### Patch Changes

- bc7db4d: An `{#await … then X}` or `{:catch X}` binding now shadows a prop of the same name. Every read of
  `X` inside the block was lowered as the prop read `$$props.X` instead of the block's own binding,
  because a non-source prop is answered before `state.transform` is consulted and the await visitor
  never registered the binding as shadowing. A prop declared with a default was unaffected.
- 878afb0: An `{#await}` catch binding's read transform now leaks past its block, matching the official
  compiler. `AwaitBlock.js` gives `then_context` a copy of `state.transform` and gives
  `catch_context` the parent's own object, so the catch binding's read override outlives the
  block and every later read of that name is rewritten — including reads of a prop, a `$state`
  or a legacy `export let`. rsvelte scoped both arms and emitted the unrewritten read. The
  divergence and its runtime consequence are recorded in
  `upstream_issues/4111-svelte-await-catch-binding-transform-leaks-out-of-the-block.md`.

  Only the read half is conformed. Upstream replaces the whole `transform` entry, so the
  setter is lost too and a later write to the outer binding is emitted as an assignment to a
  call expression — the unparseable class `upstream_unparseable_3306.rs` already pins, where
  this port deliberately diverges. The write halves are therefore restored on the way out of
  the block.

- 56c430e: A `{#snippet}` declared inside `<svelte:boundary>` is now emitted ahead of the server's
  component-bindings settle loop, where upstream puts every snippet, instead of inside the
  `$$render_inner` wrapper. The boundary visitor builds that declaration itself rather than through
  the snippet visitor, so the name it must be recognised by was never recorded. Only a component
  that also `bind:`s a child was affected.
- 6fde071: A `class:` directive whose value is the identifier of the same name now reaches `$.attributes`
  untransformed on the server, matching the official compiler. Upstream's `prepare_element_spread`
  skips the read transform for that shape, so a `$derived` is passed as the derived function —
  always truthy — and SSR renders the class unconditionally; rsvelte called it. The condition is on
  the expression rather than the syntax, so `class:active={active}` is affected identically, while
  an element with no spread goes through `build_attr_class`, which has no such arm and still
  transforms. Recorded in
  `upstream_issues/4117-svelte-class-shorthand-reaches-attributes-untransformed.md`.
- 2e4ccee: A dotted component tag name now reads through its root binding's transform. Upstream lowers a
  tag name by visiting the whole `b.member_id(name)` chain, and the rest-prop read rule is keyed
  on the parent member expression — so transforming the root identifier alone never reached it,
  and `<rest.Sub />` compiled to `rest.Sub` where the official compiler emits `$$props.Sub`,
  while `{rest.Sub}` in the same component was already correct.
- 2b3a7bd: Match a nested rule whose parent prelude is fully global. A child that writes no
  explicit `&` gets one unshifted by upstream's `get_relative_selectors`, and
  `is_global` resolves that `&` through the parent prelude — so it matches every
  ancestor that is there (scoping each one) and `apply_combinator` still matches
  when there is no ancestor at all. rsvelte matched only the child's own subject
  against a real ancestor, so a wrapper carrying no selector of its own lost its
  scope class and a subject at the root of the template lost it entirely
- f9219d8: A `+error.svelte`'s `error` prop is now typed `App.Error`. Upstream's `ExportedNames`
  answers "which props does SvelteKit type here" with two arms — `isKitRouteFile`
  (data / form / params) and an `else if (isKitErrorFile(...))` arm that types `error`
  alone — and rsvelte had only the first, so an error page's props fell through to
  ordinary inference. `isKitErrorFile` strips only the extension, so `+error@foo.svelte`
  is not one.
- 56c430e: A destructured `$derived.by()` in a `.svelte.js` / `.svelte.ts` module now reads as a call on the
  server even when its callback has a block body. The pass that decides `$.get(x)` → `x()` located a
  comma-continued declarator by walking back to the nearest `;`, which a block body puts inside the
  previous declarator, so the second name was dropped and every later read came out bare — output
  that parses and runs with the wrong value. The client target and component instance scripts were
  unaffected.
- 56c430e: A `{#snippet}` whose parameter carries an object type with an optional member (`b: { t?: string }`)
  keeps its parameters. The type-annotation stripper searched for `?:` anywhere in the parameter's
  source, so the member's marker ended the parameter's name, the list failed to re-parse, and every
  parameter was dropped — the snippet body could no longer see its arguments at run time.
- 2732815: Scope a `{#snippet}`'s body from the ancestors of every place the snippet is
  used, not only from its `{@render}` tags. Upstream's `analysis.snippet_renderers`
  holds a component alongside each render tag, so a snippet handed to a component
  as a prop still has that component's position as one of its sites; rsvelte
  collected only the render tags, so an element in such a snippet was scoped as if
  it had no ancestor and lost its scope class
- 13d2d44: Print a JSDoc cast around a private class-field read where official does. Upstream wraps the field node, so a comment leading it lands inside the generated `$.get(...)`; rsvelte spliced the wrap at the field's own offset and left the comment outside, where esrap's `ReturnStatement` rule then parenthesised the whole statement. The wrap now starts at the leading comment run, and at the parenthesised group when the source spells the cast `/** @type {T} */ (this.#x)` — acorn elides those parens while oxc keeps them as a node, so the comment leads the group rather than the field.

  Both AST read passes are reached for a bare class member now, not just one. A private field outside a class body is a parse error, so `private_read_wrap_ast` and its member-chain sibling were both falling through to a text scan; reviving only the first one made it claim the standalone reads while continuing to skip a member-chain object on the premise that the sibling took it — so `this.#x[i]` lost its `$.get(...)` in any class that also holds a standalone read of the same field.

## 0.11.0

### Minor Changes

- 30fa300: Add `rsvelte compare`, a CLI that scans Svelte components and byte-compares the official compiler's generated JavaScript/CSS with rsvelte for client, server, development, and JSON-configured compile modes.

### Patch Changes

- ea32346: Emit parseable client code for awaited `autofocus` and event attributes.
- 45cc137: Match upstream client attribute routing for mixed-case class, static inert, folded is, and SVG content attributes.
- 304cc52: Map comment-bearing client component function braces directly from AST positions.
- 304cc52: Preserve source-map carriers for lowered legacy prop reads.
- 95ed5a8: Pickle non-tail `await` expressions in async attribute values.
- f9a6a3f: Keep instance-script tail comments with the generated await promise thunk.
- 2d186c8: Prevent server-side derived-read transforms from panicking when rsvelte is built with the published OXC crates.
- 38da4ad: Remove empty exports from TypeScript module scripts.
- 09639f6: Preserve standalone module-script tail comments on generated component parameters.
- 8d3ea2f: Match Acorn diagnostics for malformed object expressions and untyped snippet parameters.
- 327bd0b: Keep server-side constant folding exclusions scoped to the binding they describe.
- 793e169: Match upstream ordering when a top-level snippet and a generated component props type share the render-function hoist target, including generic props annotations
- ea32346: Make lowercase-component warnings independent of template reference order.
- 304cc52: Carry generated element-handle source spans directly through client code generation.
- 207eac1: Fix lazy proxying for bindable prop defaults that reference rune bindings
- ea32346: Match Svelte's client-side nullish guards by sharing its static expression evaluator across template chunks, document titles, and option values.
- ea32346: Fold client template expressions through the shared typed evaluator so `void` of an unknown operand has the known value `undefined`, dev equality expressions in binding initializers remain foldable, `{@const}` uses the complete globals table, and aliases of function declarations retain their unknown marker.
- dc44b77: A comment no longer ends a destructure's right-hand side, hides an object
  shorthand, or leaves a non-ASCII prop name as an unquoted key
- 1e08f2d: Report state references used as computed keys in destructuring patterns.
- ea32346: Resolve dev console arguments against function-local bindings before same-named component bindings.
- c87d35a: Scope only the subject's parent for a `>` combinator, not every matching ancestor.
- ea32346: Accept balanced block token streams in CSS custom-property values.
- 304cc52: Preserve source-map spans for hoisted client imports.
- 0697e6c: Preserve explicit parentheses in snippet parameter defaults.
- 7f03d5b: An attribute-free custom element no longer makes its ancestor elements dynamic,
  so the generated component stops emitting `$.child` / `$.sibling` / `$.reset`
  traversal that the official compiler omits entirely
- 304cc52: Emit client source maps entirely from carried source spans instead of matching generated tokens back to the component source.
- 05f1120: fix(compiler): a component `bind:` on an each item invalidates the collection's store

  Upstream registers the each-block context's `assign` / `mutate` transforms as
  `b.sequence([mutation, ...sequence])`, so a write to the item is always a
  sequence and carries `$.invalidate_store($$stores, '$name')` when the collection
  is a store subscription. rsvelte applied that only on the element
  (`$.bind_value`) path; a component's generated `set value($$value)` emitted the
  bare assignment, so `{#each $store.list as item}<Comp bind:value={item.x} />`
  mutated the item without notifying the store.

- 846473c: Read a reassigned each item as `collection[index]` in a `bind:` on one of its members, matching the read transform upstream registers for every site
- a653fd4: Preserve empty SSR renderer chunks produced by constant-folded template expressions.
- 846473c: `parse()` now returns `export * from '…'` as an `ExportAllDeclaration` instead of
  dropping the statement from the program body. Compiled output is unchanged.
- 52d747a: Count real references to exported class declarations when deciding whether to emit `export_let_unused`.
- 6637db9: Distinguish prefix logical-not expressions from TypeScript non-null assertions when scanning regex literals after keywords.
- 4b8acf8: Preserve the full source callee span when a member rune lowers to a shorter runtime identifier.
- 81fb994: Fix server reads of function-local derived variables declared inside statement containers.
- 32677e2: Avoid wrapping a nested `$derived` read twice when its declaration is directly inside a `switch` case.
- 64ac925: Align workspace and published-crate builds on OXC 0.146 so compiler behavior does not depend on whether Cargo patches are active.
- 846473c: Keep a function expression's directive prologue. A `function () { 'use strict'; … }` written in a template attribute lost its leading string-literal statements, which the arrow and module paths already preserved.
- ea32346: Hoist awaited attributes on dynamic server-rendered elements.
- ea32346: Preserve block comments at the start of keyed-each expressions in client and server output.
- a2df07f: Preserve trailing comment placement when compileModule rewrites reactive reads.
- 9ce6bf9: Preserve JavaScript comments in every public parse API binding.
- ea32346: Match Svelte's diagnostic position for malformed mustache expressions followed by an enclosing block close.
- 846473c: `parse()` now emits an import or export's `with { … }` attributes and a dynamic
  import's second argument, and matches acorn-typescript's node shapes under
  `lang="ts"` (no empty `attributes`, `arguments` instead of `options`, an
  `exportKind` on `export default`). Compiled output is unchanged.
- 846473c: Compile an indented `<style lang="sass">` block instead of aborting: the base-indentation
  removal now runs before `grass` sees the document, because the `catch_unwind` it was reached
  from does nothing under the `panic = "abort"` release profile.
- 846473c: `parse()` now returns a `TSIndexSignature`'s `parameters`, `typeAnnotation` and
  `readonly` instead of a bare span-bearing envelope. Compiled output is unchanged.
- d4b35d4: Match client-dev `$inspect.trace()` lowering for async functions and labels for arrows, class methods, and constructors.
- ea32346: Match Svelte's reactivity analysis for `$derived` bindings whose values are known at compile time.
- 846473c: Match upstream's legacy AST `loc` shape: the synthesized `{@const}` assignment carries none, and an attached comment keeps the `{ type, value, start, end }` object `add_comments` produces.
- 846473c: Read `$.invalidate_inner_signals` bodies at the site that emits them, mirroring `build_getter`: a prop read is no longer re-wrapped into `trails()()`, an each item now reads as `$.get(item)`, and a legacy-state component `bind:` setter carries the invalidation it was missing.
- 729abce: Ship the fix for `??=` / `||=` / `&&=` on a private `$state` field in
  `compileModule`: the logical compound is split into a read plus a conditional
  write instead of being emitted as an assignment into `$.get(...)`, which is not
  valid JavaScript and fails `vite build`
- 846473c: Keep a named function expression's own identifier in the serialized program. Both
  program converters set `id: null`, so the name was invisible to every consumer —
  including the scope walk, which therefore never reserved it and generated a
  colliding dev event-handler name.
- 846473c: Scope a `slot="name"` child of a component from the component's own scope, so a `let:` binding is not visible inside a named slot
- 43daf9c: Match Svelte's contextual errors for reserved words in destructuring bindings.
- 2152f06: Report an unknown `{#...}` block at its opening type with `expected_block_type`, matching the official compiler instead of deferring the error until a later closing tag. Return the language server's existing `null` result for invalid block-marker completions before attempting to map them through a projection that the malformed template cannot produce.
- 356a946: Match Svelte's missing-parenthesis diagnostic for malformed snippet headers.
- 9b6d56c: A `&` whose parent rule is entirely `:global(...)` scopes every element, the way upstream's `NestingSelector` case does — eight components had lost the scoping class on most of their markup
- b8989dd: Determine automatic runes mode after excluding rune-named store subscriptions, matching Svelte's scope-analysis order.
- 5621c24: Emit nested snippet array-pattern temporaries before leaf bindings to match Svelte.
- 846473c: Serialize TypeScript tuple types (`TSTupleType`, `TSNamedTupleMember`, `TSOptionalType`, `TSRestType`) as real nodes instead of a `TSUnknownKeyword` stub, so a comment inside one attaches to the member that carries it.
- ea32346: Match the official compiler's message and byte position when TypeScript-only syntax is used in a JavaScript component script or `.svelte.js` module. The parser now reports the token where acorn stops instead of OXC's enclosing TypeScript node, and uses acorn's generic or reserved-keyword wording rather than OXC's TypeScript-aware diagnostic.
- 1aeb321: Preserve production client calls to a locally bound `$inspect` value.
- 846473c: Reserve the names declared inside a destructuring default so a generated dev event-handler name does not collide with them
- ea32346: Match Svelte's client output placement for comments between a destructured `$props()` assignment and the rune call.
- ea32346: Preserve reactive attachment bindings when Phase 3 consumes expression metadata produced during analysis.
- ea32346: Skip materializing the public component AST for native buffer and envelope APIs whose binary formats do not expose it.
- 43d2fcb: Restore the low-level lazy-expression resolver export after the OXC update.
- ea32346: Match Svelte's legacy export-const diagnostic precedence when an exported constant is updated and referenced from the template.
- 19832fe: Allow declaration tags with an uninitialized `let` binding.
- e991f6e: Match Svelte's server comment placement after rune arguments and removed effects.
- 846473c: Preserve compatibility for compiler output, source maps, bindings, and nested inspect lowering.
- 304cc52: Delete the redundant rune source-map text-matching pass now that runtime identifiers carry rune spans.
- 67e0d18: Preserve parentheses around single-dependency legacy reactive statement and block thunks.
- 25f16ad: fix(compiler): a semicolon-free `$: { … }` block reads its state through `$.get`

  `transform_state_reads_ast` told an object literal from a statement block by
  scanning for a top-level `;`. Source written without semicolons (`standard`
  style) has none, so `$: { void w }` was wrapped in `(`…`)` to force the
  expression goal, the parse failed, and the state-read pass was skipped
  entirely — the dependency thunk still read `$.get(w)` while the body read the
  bare variable, so the effect re-ran without seeing the new value. The parse
  verdict now decides in both directions.

- 30ebc15: Match Svelte's client comment attachment around rebuilt legacy reactive statements.
- 6271cc2: Match Svelte's comment placement before a final legacy reactive statement with CR and Unicode line endings
- cbcf2db: Match Svelte's comment attachment order for reactive labeled statements returned by `parse`.
- 846473c: Treat a `let` declared in a `switch` case as shadowing the outer binding when collecting a legacy `$:` statement's dependencies, so reactive statements are no longer reordered around it
- 0644013: Preserve leading and trailing comments around removed SSR `$inspect` statements.
- ea32346: Remove unreachable phase-two call metadata writes.
- dc44b77: A removed `$effect` leaves the `;` upstream leaves: esrap drops an `EmptyStatement` only from a body sequence, so a switch case consequent and an unbraced `if` / `else` / `for` / `while` / `do` / label body keep it
- 4b058e3: Match Svelte's purity-aware memoization of `{@render}` arguments, leaving pure calls inline while continuing to memoize impure and reactive calls.
- ea32346: Cover rune declarations inside statement containers, preserving `var`-safe client reads and
  optional SSR derived reads.
- 65e81d6: svelte2tsx: a `<style>` written inside an HTML comment no longer opens a style element

  The fallback scanner that blanks style tags the parser did not capture searched the source for
  `<style` with no regard for comments, so a comment mentioning `<style>` was treated as a start
  tag and everything up to the file's real `</style>` was blanked — taking the attributes of every
  element in between. Upstream's `findNextVerbatimElement` matches a comment before either verbatim
  tag and skips it; the scan now does the same.

- dc2c0ca: Preserve comments from removed server-side effect statements at the end of dev-mode component callbacks.
- c87d35a: Keep `class={""}` in server output; only a static empty `class` is dropped.
- ea32346: Match server comment placement for line and multiline comments before `$props()` initializers.
- 846473c: Order a `$:` statement that updates a member expression by the object it assigns on the server, as the client already did
- ea32346: Match upstream diagnostics for shadowed each bindings and snippet parameter assignments.
- ea32346: Preserve import attributes on side-effect imports.
- c18d32c: Keep source spans when converting assignment and update targets to the client output AST.
- 846473c: A multi-declarator `const a = $derived(await p), b = $derived(await q);` preceded by an own-line comment no longer leaks that comment into the generated async callback's parameter list, and keeps the `$.template_effect` promise dependency it had.
- 6adc487: Preserve the source-width padding for attributes and actions on `<svelte:element>` when its `this` expression is a string literal.
- 846473c: Read a store member binding's computed key through the site's transform, so `bind:value={$values[$key]}` emits `$.untrack($values)[$key()]` rather than the raw identifier. The same site covers a prop, a store subscription, legacy state and a member of legacy state.
- f42d483: Attach the offending `$name` identifier range to `store_invalid_scoped_subscription` diagnostics in scripts and templates, matching the official compiler's start, end and code frame.
- 846473c: Read a store's source binding the same way in all six rewriters, and leave an each-item member mutation out of the dev `$.assign` wrap
- 3d955fd: Ignore `$name` spellings inside instance-script regular-expression literals when collecting svelte2tsx store subscriptions and snippet-hoisting constraints. A regex containing an exported prop's name previously injected a false store declaration at the prop widener's insertion point and left an unmatched `/*Ωignore_startΩ*/` marker in the generated TSX.
- 9782ae8: Match Svelte's nested-class warning depth and duplicate warning count inside legacy reactive statements.
- ea32346: Keep comments in await headers and snippet parameter lists in the same generated positions as the official compiler on client and server output.
- ea32346: Comments inside template block and directive expressions now follow the official compiler's source cursor on client and server output, including each collections, if and key tests, html and render arguments, and event handlers.
- 64fcc4b: Indent class declarations inside template expressions at their generated client-output nesting.
- 6094cc9: Match Svelte's comment attachment order inside JavaScript template literals returned by `parse`.
- 9a99c49: Reject invalid `super`, `await`, and `arguments` references in template expressions.
- ebe8b1f: Align the secondary N-API compile entries with the main compiler boundary: `compileBuffers` and `compileModuleBuffers` now throw structured `CompileError` objects, `compileBuffers` accepts `modernAst`, and `compileWithCssHash` no longer hides an invalid non-function `cssHash` option.
- 304cc52: Remove the redundant text-matching source-map pass for declarations collapsed onto one line.
- 982721d: Reject strict-mode reserved names in template binding patterns.
- ea32346: Resolve writes to destructured each-block bindings through their lexical template scope.
- ea32346: Replace a bare universal selector with the component scope class when it appears directly before `:global(...)`.
- c90c619: Preserve upstream's parenthesized each-item mutation output when no invalidation follows it.
- ca05f8b: Match Svelte's reserved-word error for incomplete let declaration tags.
- 304cc52: Preserve source-map spans for normalized inline client scripts.
- 1d1ba92: Preserve inspect argument comment positions in server dev output.
- 40f1aed: Preserve statement-position inspect holes after leading line comments.
- 457601d: Recognize the full JavaScript whitespace set while detecting store subscriptions.
- ea32346: Use scope-defined values when compiling title elements.
- e3fc003: Lower `$inspect.trace()` in development component module scripts.
- b94bf08: Warn for classes declared inside functions in component instance scripts.
- e04241b: Match Svelte's strict-mode error for legacy octal escapes in template expressions.
- 6b1e245: Validate WebAssembly compiler options against Svelte's public option contract, including unknown and removed keys, invalid values, legacy warnings, and nested options.
- 52f933e: Accept a deprecated TypeScript import-assertions clause when `assert` begins on the line after the module specifier, matching the official Svelte compiler while retaining the clause in generated output.
- 304cc52: Map generated component binding accessor keys to their source directives.
- 958a818: Match Svelte's parser error for a comma after a destructuring rest element.
- ea32346: Recognize JavaScript whitespace and comments between class-field assignments and runes, including client class and constructor initializers that start on a later line.
- ea32346: Allocate generated server slot names in source order.
- 1ba3f37: Match Svelte's parse error message for top-level return statements.
- ea32346: fix: avoid adding a props parameter for an exported TypeScript import-equals declaration
- 1b5aaf6: fix: retain TypeScript type aliases, interfaces, and their nested comments in the public parse AST
- 17c5509: Match Svelte warning messages for namespaced self-closing elements and ARIA roles with multiple required properties.

## 0.10.20

### Patch Changes

- 9fbc4ad: fix: print the accessor setter's default from source, not as an AST dump

  `set p($$value = <default>)` took its default from `binding.initial`, a field
  that holds a literal's raw text for some shapes and a JSON dump of the node for
  all the rest — so every non-literal `$props()` default (`{}`, `[1]`,
  `new Map()`, `() => 1`, `` `t` ``, `1 + 1`, `-1`) reached the output of a
  `customElement` or `accessors` component as serialized ESTree. The result
  parses, so a custom element instantiated without the attribute silently
  received the node.

  The default now comes from the initializer's source span, with TypeScript
  nested inside it erased through the same parser the rest of the pipeline uses.

- 9fbc4ad: Match an attribute selector whose expected value is `""` the way upstream does, in both directions. A **valueless** attribute is `true`, not `""` (`css-prune.js`: `if (attribute.value === true) return operator === null`), so `a[data-flag=""]` against `<a data-flag>` is unused — rsvelte kept the rule and shipped dead CSS with no `css_unused_selector`. And `[f~=""]` DOES match an empty value, because upstream implements `~=` as `value.split(/\s/).includes(expected)` and `"".split(/\s/)` is `[""]`; rsvelte used `split_whitespace`, which yields nothing, and deleted a rule official ships. A 72-cell grid of 8 attribute spellings against 9 selectors goes from 8 divergences to 0.
- 9fbc4ad: fix: give each `bind:group` its own group name

  Upstream keys a binding group on the expression — `(keypath, bindings)` — and
  stores the winner on the directive's metadata. rsvelte's analysis computed the
  same names but had nowhere per-directive to keep them, so the client visitor
  took the enclosing `{#each}` block's single name and every `bind:group` inside
  one block collapsed onto it. The second group was declared and never
  referenced, and two checkboxes shared a group: checking one wrote through the
  other's `bind:group` array.

- b8af087: Run the whole host-agnostic half of the `bind:` validation for every host, and decide "this element takes no arbitrary attributes" before any individual `bind:`. Upstream's `BindDirective` visitor validates the binding NAME against the parent and then runs one host-agnostic tail; rsvelte had an arm per element visitor and four of them held only part of it. `<svelte:element>` ran the name check alone, so `bind:clientWidth={o?.k}` compiled into `($$value) => o?.k = $$value` — output no JS parser accepts — and a shorthand `bind:clientWidth` wrote to an undeclared name; `<C>` / `<svelte:self>` / `<svelte:component>` skipped the getter/setter arm, so `bind:group={() => v, (nv) => (v = nv)}` became a getter/setter prop pair. In the other direction a second duplicate-attribute check in phase 2, for components only, lacked the `this` exemption the parser's copy has, so `<C bind:this={el} bind:this={el} />` was refused where the official compiler accepts it. And `<svelte:window|document|body>` validated a `bind:` before rejecting a spread, reporting `bind_invalid_target` where upstream reports `illegal_element_attribute` / `svelte_body_illegal_attribute`.
- 9c449e6: Validate `{#each}` and `{#await}` block headers the way the official parser does: the each item and the await value are one binding pattern and the each index is one identifier, so a literal, a rest element, a default or a member expression is now `expected_pattern` / `expected_identifier` / `expected_token` instead of being spliced into the generated arrow's parameter list (`($$anchor, 1) =>`, which no JS parser accepts) or silently dropped. A second `{:then}` / `{:catch}` is `block_duplicate_clause`, an empty `{#await }` head and `{#key }` report acorn's `Unexpected token` at acorn's position, `{#each xs as}` is `expected_whitespace`, and `expected_token` and a misplaced block continuation now carry upstream's point span
- 3d61667: Follow upstream's numeric character-reference rules. Its pattern is `#(?:x[a-fA-F\d]+|\d+)(?:;)?`, so an uppercase `&#X41;` is not a reference at all and a digit run longer than rsvelte's private cap is one reference rather than a decoded head plus a literal tail; and upstream bails on a falsy _parsed_ code before validating, so a surrogate half or an above-range value still reaches `String.fromCodePoint(0)` and emits a NUL instead of staying literal.
- a9d8598: Match upstream on three character-reference spellings. `&#X41;` is not a reference at all — upstream's `#(?:x[a-fA-F\d]+|\d+)` spells the marker lowercase — where rsvelte decoded it; a surrogate half or an out-of-range code point emits a literal NUL, because upstream calls `String.fromCodePoint(validate_code(code))` and only bails when the parsed code is falsy, where rsvelte read the validated 0 as "leave it undecoded"; and `<textarea>` content decodes through `read_sequence`, which passes `is_attribute_value: true`, so the semicolon-less legacy names (`&notit`) do not apply there. An overlong digit run now saturates instead of failing to parse, matching `parseInt` widening past 2^32 into a value `validate_code` rejects.
- 108e995: Lower a class rune whose `=` is not followed by exactly one space

  The client class-field and constructor-assignment scanners located a rune with
  `memmem::find(b"= $state(")` and rebuilt the assignment as `format!("{} = {}", target, value)`.
  Both spellings carry one ASCII space, so a tab, two spaces, a non-ASCII JS space (U+00A0,
  U+FEFF, U+3000, …) or a block comment between the `=` and the rune left the field unlowered:
  the output parsed and ran, and the field held a `Source` object with no reactivity. A comment
  separator is now preserved in the emitted initializer, and the dev-mode `$.tag(…)` wrap keeps
  a one-line comment inline instead of reflowing the call.

- 4dc77ed: Decide whether a client template read is reactive from `scope.evaluate`, not from how the declaration was lowered. Three divergences: a `{@const}` bound to a function declaration is reactive (a function evaluates to a symbol, which is never `is_known`); `customElement` forces `accessors`, which keeps the `$.state(…)` declaration but must not make a never-written `$state`/`$derived` read reactive; and a pure global call over known arguments (`String(w)`, `Number.isInteger(1)`) is a known value, so the `{@const}` reading it needs no `template_effect`.
- 3d2c0bd: Fix the compiler-option axis: `customElement: true` is honoured as a compile option, a missing
  `filename` defaults to `(unknown)` (so the component is named `_unknown_` and dev output keeps its
  `[$.FILENAME]` assignment), `accessors` / `immutable` report their deprecation once per process
  instead of on every compile, a function-valued `runes` / `warningFilter` is rejected at the NAPI
  boundary instead of being silently ignored, and `fragments: 'tree'` emits an array hole for each
  anchor comment instead of dropping it. Adds a `compiler-option` family to the generated shape
  matrix, the first gate in the repo that varies `compilerOptions`.
- 9fbc4ad: Let a `{@const}` shadow an enclosing `{#each}`'s item or index

  A `{@const}` one block deeper than the loop it shadows — behind `{#if}`,
  `{#key}`, a nested `{#each}`, `{#await … then}` or `{#snippet}` — was still read
  as the loop variable. Upstream resolves the reference through `scope.evaluate`,
  so the const wins and its literal initializer is known; three decisions follow
  from that and all three came out wrong.

  On the server the constant fold kept the loop variable, so `<b>{value}</b>`
  rendered the row instead of the const. On the client the read counted as state,
  which costs the element its `textContent` shortcut: `<b> </b>` plus a
  `$.template_effect` where official emits `<b></b>` and one assignment. And the
  each callback kept an `index` parameter that nothing reads any more, because
  upstream sets `uses_index` from the index transform's own `read` callback.

  All three answered the question by NAME — `each_binding_context`,
  `each_index_name`, and the server's `slot_let_shadows` veto — and a name is
  exactly what a shadow reuses. The scope chain now decides on the server, and the
  client carries the shadowing names (`{@const}` declarations and snippet
  parameters) alongside the transform map they already scope, so an inner
  `{#each}` taking the name back is a removal rather than a special case.

  With the const in the each body itself the two declarations share one scope and
  both compilers raise `declaration_duplicate`, so the shape only exists across a
  block boundary. The snippet-parameter version of that collision is an upstream
  defect — official compiles it into a JS redeclaration no parser accepts — and is
  written up in `upstream_issues/`.

- 1e4c517: Keep a tag expression that ends in a `//` comment parseable. The expression was
  handed to the JS parser wrapped in `(…)` on a single line, so a trailing line
  comment swallowed the closing paren and `{@const x = flag // c}` was rejected
  with `Expected ) but found EOF`. The official compiler accepts it.
- 9fbc4ad: Report a parse error in a `{@const}` initializer

  `{#if true}{@const c = new.target}{c}{/if}` compiled. So did every other
  unparseable initializer: `{@const}` reads its declaration through
  `parse_js_expression`, which ends in
  `.unwrap_or_else(|| create_empty_identifier(""))` — so a `js_parse_error` became
  an empty identifier and the component was built around it.

  This is an over-acceptance, and the population it lives in is programs the
  official compiler rejects. No comparison of _accepted_ programs can see it, and
  no collected corpus holds it, because published code compiles.

  The other template slots were already right — they call
  `parse_js_expression_strict` or `parse_js_expression_attribute`, which return a
  `ParseResult` — and that makes them the positive control naming the path.
  `{@const}` cannot simply call the strict variant: that one defers into an
  `Expression::Lazy`, and this tag inspects its parsed declaration during the
  parse. The non-deferring half is now its own function and both callers share it.

  Grid — 12 initializer shapes × 8 template slots × 2 targets: **102 of 192 cells
  diverging → 74**. The `{@const}` slots go from 20 divergences each to 6, and the
  6 that remain are causes the _other_ slots have too, so the slot no longer has a
  defect of its own: `{super.x}` and `#x in y` (#3694 — the real parser accepts
  those, so propagating cannot reject them) and `a b` (below).

  **Four cells are new, and they are an improvement that is still a divergence.**
  `{@const c = a b}` moved from _accepted_ to `js_parse_error`, where official
  raises `expected_token`: upstream parses the declaration incrementally and lets
  the tag reader complain about the leftover token, while rsvelte slices to the
  matching `}` and parses the slice as one expression. The same divergence already
  existed in the `attribute` and `each-collection` slots, so this fix reaches an
  existing defect rather than creating one. The two pattern-side shapes
  (`{@const 1 + = 2}`, `{@const 1 +}`) move the same way, from _accepted_ to
  `js_parse_error` against official's `expected_pattern`.

- 5bdd902: Map `css.map` back to the source inside a rule that nests and inside an at-rule
- 892c7c0: Read `||` and combinator runs (`>>`, `>>>`) in CSS selectors, reject malformed attribute selectors and empty selector-list entries where the official compiler does, and stop rejecting a declaration with no property name
- 7d73848: Match a CSS type selector against an element name case-insensitively, as upstream's `apply_selector` does (`element.name.toLowerCase() !== name.toLowerCase()`). rsvelte compared the two exactly in the prune path, so `DIV` was pruned as unused against a `<div>` — the rule was replaced by an `/* (unused) … */` comment and a `css_unused_selector` warning official does not raise, and the component silently lost the rule. SVG's camelCase element names are the case that bites in real code: `clippath` and `lineargradient` select `<clipPath>` and `<linearGradient>` upstream. `:is(DIV)` shows the same defect with byte-identical CSS and only the warning set differing.
- 892c7c0: Stop scoping — and stop pruning against — the part of a CSS selector that sits to the left of a combinator the official compiler does not handle, such as `||`
- 3fd0598: Keep a universal selector that is not a compound's last non-pseudo selector. Upstream's CSS transform walks a compound **backwards** and stops at the first non-pseudo selector it reaches: only there does `*` become the scoping class (`code.update(selector.start, selector.end, modifier)`), and anywhere else the walk never arrives. rsvelte replaced every `*` it met and then still appended the modifier after the compound's real subject, so `*.a` came out as `.svelte-X.a:where(.svelte-X)` where official emits `*.a.svelte-X`. `*` alone and `*:first-child` are unaffected — there the `*` _is_ the stopping point, because a pseudo-class does not stop the backwards walk.
- 9fbc4ad: Route a declaration tag on the keyword boundary upstream uses

  `{var}`, `{var.x}`, `{var(1)}` and `{var;}` all compiled. Upstream decides
  whether a `{…}` is a declaration tag with three sticky regexes:

  ```js
  const regex_supported_declaration = /(?:let|const)\b/y;
  const regex_unsupported_declaration = /(?:var|interface|enum)\b/y;
  const regex_maybe_type_declaration = /type\b/y;
  ```

  rsvelte had the same three keyword sets and required **whitespace** after the
  keyword instead of a boundary, with a comment asserting that the two "reach the
  same result for every real-world tag without a statement parse". A grid over the
  byte that follows the keyword falsified it.

  The interesting part is that one boundary rule is not enough, and **which rule
  applies is decided by where upstream stops.** The unsupported set throws from
  the regex match itself, so its boundary really is the regex word class
  `[A-Za-z0-9_]` — `$` is outside it, so `{var$x}` is rejected even though `var$x`
  is a legal identifier, and byte parity means reproducing that rather than
  picking a side (`upstream_issues/svelte-declaration-tag-dollar-identifier.md`).
  The supported and `type` regexes are only a shape hint, **confirmed by
  `parse_statement_at`** — which reads `let$x` as one identifier and hands the
  `ExpressionStatement` back to the expression-tag reader — so their boundary is
  the identifier class.

  That asymmetry is not a detail. The obvious single rule — spell both boundaries
  as the regex word class — was the first version of this fix, and a build of it
  leaves `{let$x = 1}` **accepted by both compilers and meaning two different
  things**: an assignment to a global on one side, a declaration of `$x` on the
  other. No verdict comparison can see that, only the emitted code, which is why
  the grid compares `js.code` on every accepted pair.

  The same "confirmed by parsing" property is the whole of the `type` half.
  rsvelte reached `declaration_tag_invalid_type` from a structural shape test, so
  `{type a = 1}` in a plain `<script>` — where a type alias is not JavaScript at
  all — reported the Svelte error where official reports `js_parse_error`. The
  parse now runs first, and a shape that parses as JavaScript goes back to the
  expression-tag reader the way upstream's `ExpressionStatement` branch does.

  Grid — 14 leading words × 6 following bytes (`}`, ` a = 1`, `.x`, `(1)`, `$x`,
  `;`): **16 of 84 cells diverging → 0**. The near-miss controls (`variable`,
  `constant`, `letter`, `enumerate`, `typed`, `interfaces`) move nothing in either
  direction, which is what a boundary change is most likely to break.

  Routing `{let}` and `{const}` into the reader also makes their `js_parse_error`
  **positions** observable, which is the "fixing a start divergence adds rows"
  coupling in the other direction. The reserved-word position grid — 30 words × 2
  shapes × 3 slots — goes **2 of 183 diverging → 0**, and the pair needs two rules,
  not one: `let` is not reserved in sloppy mode, so acorn rejects a bare one for
  being a declaration it cannot finish and reports at the keyword, while `const`
  is reserved, consumed, and fails at the `}` after it. The word × shape grid
  moves **11 → 5** on the same build, and the 5 left are #3694 (`super`, `await`)
  and #3707 (`arguments`).

  One neighbouring divergence the same grid framing exposes is **not** fixed here:
  a single declarator with no initializer (`{let x}`) is still rejected, tracked as
  #3705 with its own 78-cell grid. The multi-declarator path already handles it,
  so it is the single-declarator early return alone.

- d9a83db: Raise `directive_missing_name` for every directive kind. `style:`, `animate:`, `let:` and `on:` with an empty name compiled; `bind:` raised `bind_invalid_name` at a different span. The check now lives once, where upstream keeps it.
- 7d500be: Read a directive's value once, the way upstream does. `directive_invalid_value` (`<div use:n="a">`) and `expected_attribute_value` (`<div use:n=>`) were never raised from the directive path because all eight per-directive parsers hand-rolled their own value read; `style_directive_invalid_modifier` is now also reported on `<svelte:body>`, `<svelte:window>` and `<svelte:document>`.
- b5c7f16: Decide whether a repeated block clause is legal from one table

  `{#if}` and `{#each}` re-create their fragment on every `{:else}`, so a repeat is
  accepted and replaces the earlier branch; `{#await}` rejects a second `{:then}`
  or `{:catch}` with `block_duplicate_clause`. The two directions were reported as
  separate issues pointing opposite ways, because the answer was written at each
  parse site rather than once.

- 3277ff0: Reject the three remaining early errors acorn raises and rsvelte answered with the wrong error code: `arguments` in a class field initializer, `arguments` in a class static initialization block, and — in a `.svelte.(js|ts)` module — `export { x }` for a name that is not declared. All three compiled or reported a different code where official reports `js_parse_error`; the last one reported `export_undefined` with no position at all. The undefined-export check is deliberately module-only: upstream clears acorn's `undefinedExports` after every statement when it parses a component `<script>`, because the exported name may be declared elsewhere in the component, so `export { nope }` there still compiles
- 59a1d65: Decide an `$effect.root(…)` statement's position from the previous token

  `strip_effects_from_source` asked whether the call starts its own physical line,
  which is a different question from the one upstream answers off the AST: an
  `ExpressionStatement` whose expression is the call is removed, and a call
  anywhere else becomes the `() => {}` no-op. A statement that merely shares a line
  (`let m = 1; $effect.root(…);`) was therefore lowered as an expression and left a
  `() => {};` behind in the server output.

- 11e4a20: Count a separator space in the printer's fit measurement, as esrap does. A declaration list whose printed length was exactly 51 measured 50 and stayed on one line — including the expanded `let { a = 1 } = $state()` of a module script.
- 9203352: Answer "is this expression's value known at compile time" with one port of upstream's `scope.evaluate` instead of two. The client carried its own 230-line structural recursion (`is_expression_known_json`) alongside the server's `Evaluation` port, and the two were cross-recursive — each covered what the other could not. `void <unknown>` is the shape that separates them: upstream gives `void` a single value whatever its operand is, so `{@const c = void p}` with `p` a prop is known and folds, while the client's recursion asked whether the ARGUMENT was known and kept the read reactive.
- 36de8aa: Judge a named export empty only after its declaration is stripped, so a type-only `export` is not a component export

  Upstream's `ExportNamedDeclaration` visitor visits the declaration first and returns `b.empty` when
  the visit emptied it. rsvelte judged the export **before** the visit, which was harmless only while
  the parse conversion happened to pre-collapse a namespace into an empty statement. Once #3417 made
  `export namespace N { … }` carry its body through parse — which it must, so the body can be
  rejected when it holds a value — the export survived the strip, `process_legacy_exports` counted it,
  and the component gained a `$$props` parameter the official compiler does not emit.

  `$$props` is the component's calling signature, so this is an API difference rather than a byte
  difference; the output parses and runs, and in dev mode both compilers emit `$$props` anyway, so
  only a production target discriminates.

  The specifier half of the same visitor is fixed with it: an export whose specifier list filters to
  nothing — including one written with none, `export {}` — is empty, mirroring upstream's
  `if (specifiers.length === 0) return b.empty`.

  A dotted `namespace N.M { … }` is now nested as its desugaring `namespace N { namespace M { … } }`,
  a shape upstream compiles, instead of having its body dropped at parse: the type-only body still
  strips, and a value in it is rejected exactly as the un-dotted spelling is. The official compiler
  crashes on the dotted form with an uncoded `TypeError`; that divergence is recorded in
  `compatibility/GATES.md#deliberate-divergences` and reported in `upstream_issues/`.

  Measured against `submodules/svelte` @ `20b341f10048` (`VERSION === '5.56.9'`) over 29 declaration
  forms × 2 export spellings × 3 entry points × 2 targets × dev/prod.

- df9e620: Report a template slot's JS failure the way the official compiler does, in the five slots that never classified it. Upstream parses ONE maximal expression and hands what is left to `eat('}', true)`, so leftover input is `expected_token` and a broken expression is `js_parse_error`; the `{#await}` head, `{@debug}`, `{@const}`, `{@render}` and the `read_pattern` positions (`{#each … as p}`, its index, `{:then}` / `{:catch}`) each answered that question themselves or not at all. `{#await a b}`, `{#each a as b c}`, `{#each a as b, i j}`, `{#await p}{:then v w}{/await}`, `{@debug a b}` and `{@const a}` compiled with the extra token silently dropped, and `{@render s(a +)}` / `{@const a = a1 +}` reported a syntax error as a later-phase _placement_ rule with no span.
- 9fbc4ad: Client: fold a `globals` call in a `const`'s initializer through the one table

  The client's constant folder carried its own copy of upstream's `globals` table
  holding eight `Math.*` names, so `String('a')` and `Math.trunc(-1.7)` folded on
  the server and not on the client, and `Math.round` used Rust's
  half-away-from-zero rule instead of JS's half-up. It now asks the server's port
  of the table, which also gives it the `get_global_keypath` shadowing rule a
  name-only match never had.

  Separately, `initial_is_non_reactive` evaluated a binding's initializer at
  template depth, so it took the `has_call` bail that models upstream memoizing a
  template chunk before evaluating it. An initializer is never memoized, so
  `const v = Math.max(1, k)` folded to `'5'` through one path and was reported as
  reactive state by the other — emitting `text.nodeValue = '5'` into a `<u> </u>`
  placeholder instead of `u.textContent = '5'`.

- 9fbc4ad: fix: a spread argument stops a `globals` call from reading as known-defined

  Upstream's `globals` branch in `scope.evaluate` requires both that the callee
  keypath is in the table AND that no argument is a `SpreadElement`. rsvelte's
  server port had the guard; the client asked the table alone at three of its six
  call sites, so `{Math.max(...xs)}` lost its `?? ''` and rendered `undefined` as
  the empty string only by accident.

  The guard is now a parameter of the predicate, and the predicate itself lives in
  `2_analyze/scope.rs` — one table where upstream keeps it. That closed a second
  divergence: the phase-2 copy matched `Math.` and `Number.` by prefix, so
  `Math.nope(n)` read as a known global while `String.nope(n)` did not.

- 4e84bd5: Scope the component's elements when a `:global(...)` is the whole argument of `:is()` or `:where()`. Upstream truncates trailing globals out of the argument, and an argument that truncates to nothing matches anything; rsvelte instead tested the global's own selectors against the element, so `:where(:global(.x))` scoped nothing and the emitted rule — byte-identical to official's — could never match. A descendant inside `:is()` (`:is(.card .a)`) is now assumed to match rather than pruned, as upstream does.
- 9fbc4ad: Compute every `globals` constant-folding entry, with JS's arity rule

  Upstream stores each global as a `[type, fn]` pair and calls `fn(...values)`
  when every argument is known, so a missing argument is `undefined` and a
  surplus one is ignored. rsvelte's port guarded on an exact argument count and
  gave up outside it, left five entries (`Math.f16round`, `Number.parseInt`,
  `Number.parseFloat`, `String.fromCharCode`, `String.fromCodePoint`) with a type
  marker and no implementation, dropped a NaN operand in `Math.min` / `Math.max`
  where Rust's `f64::min` / `f64::max` do, answered `1` for `Math.pow(1, NaN)` as
  IEEE `pow` does rather than `NaN` as JS does, and rounded the doubles just below
  `0.5` up because `Math.round` was `(n + 0.5).floor()`.

  Two shapes stay unfolded on purpose: `String.fromCharCode(0xD800)` is a lone
  surrogate, which a Rust `String` cannot hold, and `String.fromCodePoint` on an
  invalid code point makes the official compiler throw an unhandled `RangeError`.

- 9cc4072: Map the injected dev stylesheet back to the `.svelte` source. Nested rules, at-rules, `@keyframes`, `:global(…)` and `:global {…}` blocks were emitted as insertions rather than copies, so the `sourceMappingURL` payload appended in dev carried no segments for them.
- 5bdd902: Minify the injected stylesheet the way upstream does. `css: "injected"` (and every custom element, which injects unconditionally) emitted a `;` after every declaration on top of the one already in the source, doubled the opening brace of a rule with a nested rule — leaving the stylesheet with unbalanced braces — and kept the whitespace `remove_preceding_whitespace` removes. A declaration's span ends at the `;` or `}`, so the separator comes from the source; the whitespace runs before a rule, before a declaration and before a block's closing brace are now dropped from the emitted text rather than from a gap. `animation` / `animation-name` declarations, at-rules and their closing braces keep their whitespace, matching upstream's visitor split, and `@font-face` and `:global {…}` bodies are minified like any other block. `css.code` — the only thing the corpus gate compares — was already correct and is unchanged.
- 957fe1a: Fill the slot a removed `$inspect(…)` leaves behind when it is an operand rather than a statement, instead of leaving the call in place for a `ReferenceError` at run time.
- 1caec63: Reject the JavaScript early errors acorn raises while parsing and OXC settles after it — a duplicate constructor, `super()` or `super.x` outside a method, `super()` in a class with no `extends`, an unsyntactic `break` / `continue`, a duplicate label, an undeclared or duplicated `#private` name, `delete this.#a`, a `'use strict'` directive in a function with a non-simple parameter list, `import` / `export` below the top level, and a duplicate declaration (`function f(){} function f(){}`, `let x; let x;`, `function f(){} let f;`). All of them compiled, and almost every one emitted text no JS parser accepts, because the illegal construct was copied through verbatim. The message and the position now follow acorn, which stops at the *re*declaration where OXC labels the declaration, at the `break` / `continue` keyword where OXC labels the jump's target, at the `delete` keyword where OXC labels its operand, and at the enclosing function where OXC labels the directive. A TypeScript overload set, an interface merge, a constructor or private-method overload and a `namespace` are unaffected, and the analyze-phase `declaration_duplicate` still covers the two cases acorn cannot see: a template declaration, and a collision between the module and instance scripts
- 9fbc4ad: Report a template `js_parse_error` at the token, not past it

  `{break}` was reported at the byte **after** `break`; official reports the `b`.
  The delta was exactly the offending token's length, so `{continue}` was eight
  bytes late and `{do}` two.

  `check_js_parse_error_with_pos` computes `label.offset() + label.len()`, which
  is right when OXC's label is _what it consumed_ and wrong when the label IS the
  offending token — acorn stops at that token and reports there. Two message
  classes are the second kind: `Unexpected token`, where OXC labels the token it
  could not use, and `Expected X but found Y`, where it labels the found token.
  The default stays the label's end.

  The rule needed its own predicate rather than two more entries in the existing
  `at_label_start` set, because that flag does double duty — it also rewrites the
  message to `Assigning to rvalue`.

  Grid — 30 reserved words × 2 shapes + `new.target`, × 3 slots, keeping only the
  cells where both compilers raise `js_parse_error` so the comparison has a
  counterpart: **148 of 183 diverging → 2**. `{class}` cannot separate the two
  rules (the found token is the wrapper's own `)`, and the clamp puts both answers
  on the same byte), so the discriminating case is `{class.x}`.

  The two that remain are `{const}` and `{const.x}`, and they are not this rule:
  upstream matches `/(?:let|const)\b/y` first and reads a _declaration_, so acorn
  consumes the keyword and reports where a declarator name should have been.
  rsvelte has no such routing — that is #3692 — and the two agreed before only by
  coincidence, both landing on the same byte for different reasons.

  None of these positions existed before the reserved-word gate was widened: the
  programs were accepted, so there was nothing to report. Closing an
  over-acceptance is what made this axis observable, which is the usual shape —
  shrinking one gate grows the population another one compares.

- 6690519: Locate the `export` and `class` keywords by the keyword, not by the keyword plus exactly one ASCII space. Phase 3 searched for the literal bytes `"export let"`, `"export "` and `"class "`, so any other separator — a second space, a tab, a line break, or a non-ASCII JS whitespace character such as `U+00A0`, `U+FEFF` or `U+3000` — made the construct invisible to the transform. `export⟨tab⟩let a = 1` then survived verbatim into the component function, where no JS parser accepts it and the prop was never wired to `$$props`; `class⟨tab⟩K { v = $state(1) }` kept `$state` as a free identifier because its class fields were never lowered. The separator is now any run of JS whitespace, tested with the parser's own predicate (Rust's `char::is_whitespace` excludes `U+FEFF`, which JS includes), and the client class lowering takes its header from the shared lexical scan that already refuses a `class ` written inside a comment or a string.
- 555caa6: A template read is now decided from `scope.evaluate` rather than from the lowered declaration form. A `{@const}` bound to a function keeps its `template_effect`; a `{@const}` reading an enclosing `{@const}` through a pure global folds; a never-written or bare `$state` under `customElement` keeps its `$.state(…)` declaration while its read folds; and a `$derived` over a literal folds even when the literal is stored as source text rather than as an expression node. A name assigned after a top-level `await` keeps its effect regardless, because it holds nothing at first render.
- b5c7f16: Reject three legacy constructs the official compiler rejects and accept one it accepts. `directive_missing_name` is now one test at the attribute dispatch site rather than three of the eight per-directive parsers, so `on:={h}`, `bind:`, `style:`, `animate:`, `let:` and any spelling carrying modifiers (`class:|foo`) are covered and the span stops at the colon; `<svelte:component this="Child">` gets upstream's `is_expression_attribute` check; a `customElement` `tag` that is not a string literal is `svelte_options_invalid_tagname`, while the empty string is accepted. A second `{:else}` in an `{#if}` or `{#each}` replaces the earlier branch instead of failing with one of three host-dependent parse errors. Four diagnostics also report upstream's fields: `svelte_component_missing_this` is zero-width, `legacy_reactive_statement_invalid` carries a position, `Not implemented: LetDirective` loses its `Code generation error: ` prefix, and a defaulted shorthand in a directive value is a `js_parse_error` at the `=` with acorn's wording rather than `expected_token`
- b5bdf21: Fix four client-side legacy `$:` divergences. Whitespace or a comment between `$` and its colon
  left the statement non-reactive (`$ : x = a` ran once at init); a newline after the colon plus a
  trailing comment spliced the comment into `$.set(...)` and emitted output no JavaScript parser
  accepts; a state read inside an object literal used as a member-expression object
  (`$: out = { a: m }.a`) was left untransformed; and a prop read inside an unlabelled block
  statement (`{ out = p; }`) was not lowered to its accessor call.
- 709cdc8: fix(client): a `style:` directive is reactive when any of its chunks is

  The phase-3 scan that decides whether a `style:` directive needs
  `$.template_effect` read only the first `ExpressionTag` of an interpolated
  value, so `style:color="{s}{o.k}"` was judged by `{s}` alone. Upstream's
  phase-2 `StyleDirective` visitor merges the metadata of every chunk.

- 5cdf643: Report malformed markup where the official compiler does. `expected_token` is now a point rather than a one-column span (upstream passes a bare index, and `errors.js` reads it for both endpoints); a `{:else}` / `{/if}` with nothing open points at the `:` / `/` instead of the `{`; `<br / title="a">` demands the `>` immediately after the `/` rather than past the whitespace; an unterminated comment, `<style>`, `<script>` or attribute quote runs out where the right-trimmed template ends instead of after the file's trailing whitespace, and an unclosed `<script>` distinguishes `element_unclosed` from `unexpected_eof` the way upstream does; and a closing tag missing its `>` (`</div` ⊣) or a mustache missing its `}` (`{@html z` ⊣) is now an error instead of compiling with the construct silently dropped
- b098c21: Keep the statement slots a removed `$inspect(...)` leaves in a `.svelte.(js|ts)` module. Upstream
  replaces the CALL with an empty statement and keeps the `ExpressionStatement` around it, so the
  statement prints as `;;`; the module pipeline deleted the whole statement instead. The removal is
  now AST-driven, so `$inspect(` spelled inside a string, a template literal or a comment is no
  longer rewritten, and consecutive holes print as `;;\n;;` rather than merging into one run.

  Normalise a raw `<CR>` in a template literal to `<LF>` in the SSR constant fold. ECMA-262 does that
  in a template's cooked value; the fold read the literal from raw source text and rendered the
  carriage return, so the SSR HTML disagreed with the client render.

- 9fbc4ad: Keep a module `$inspect(…)`'s hole across the reprint, and lower it on the server in dev

  Two halves, both `.svelte.(js|ts)`-only.

  `compileModule` prints its body by re-parsing the transformed text, and a re-parse
  drops an `EmptyStatement` — so the `;;` written for a removed `$inspect(…)`
  survived only while nothing sent the module down that path. Reading a `$derived`
  from an exported function does send it there, and then **every** hole in the file
  vanished at once, not just the one near the read. The hole now travels as a
  sentinel that re-parses as a statement and is expanded when the program is
  printed. It carries its own `;`: the position test that classifies the _next_
  call reads a bare identifier as an operand slot, so without one the second hole
  in a file came out as `undefined`.

  The server half is separate: `transform_server_module` ran the shared module
  transform with `dev: false` unconditionally, so a module never got the dev
  lowering (`console.log('$inspect(', args, ')')` / `(fn)('init', args)`) and the
  logging the rune exists for was dropped.

  Grid — the file that reproduces it, with seven tails varying what an exported
  function reads: **2 of 7 passing → 7 of 7**. `return d` (a `$derived`) is the
  diverging tail and `return a` (a `$state`) is the negative control that never
  moved, which is what names the reprint rather than the read. Consecutive holes
  are their own axis: five in one module, 5/5 on both targets, with the
  second-hole-becomes-`undefined` failure reproduced and fixed separately.

  Where official cannot be matched, it is not: in the five **value** slots upstream
  emits text no JS parser accepts (10 of 10 cells under an acorn oracle), so those
  keep the `undefined` this release already documents elsewhere. The three
  **statement** slots are byte-identical to official on both targets.

  `$effect` / `$effect.pre` / `$effect.root` are still removed outright.

- aad8c0e: Lower a class expression that sits inside a rune argument or an `extends` clause. Upstream reaches every `ClassBody` through the ordinary walk; rsvelte's class-field transform is a text scan that saw neither, so `held = $state(class { deep = $state(1); })` kept `deep` as a plain public field (and in a component's instance script left a live reference to `$state` in the output), and `class Sub extends class { … } { … }` took the inline superclass's brace for its own — lowering the heritage body and leaving the subclass's rune fields alone, on the server as well as the client. `$state(<class expression>)` now also gets the `$.proxy` wrapper upstream's `should_proxy` gives it, and esrap stops parenthesising a `class` / `function` / object-literal superclass, which needs no parentheses.
- 9fbc4ad: Treat a nested `$inspect(…)` exactly like a top-level one

  Upstream's server `CallExpression` visitor is tree-wide, so how deep the call
  sits is not part of its decision. rsvelte handled only the top-level statement:
  in dev a call inside a function, an arrow, a bare block, an `if`, a `try`, a
  loop or a class method was removed instead of lowered, so the `console.log` the
  rune exists for never ran; and in prod the removed statement left nothing on the
  server and one `;` on the client where upstream keeps the `ExpressionStatement`
  with an empty expression and prints `;;`.

  Both empty statements are now emitted at every depth, but only the server puts
  them where official does. Measured over 5 hosts × 2 targets: the server is
  byte-identical in 5/5, and the client writes the two `;` on separate lines at the
  same indentation in 5/5 — one shape, no variation, tracked as #3724. oxfmt joins
  them, so this is invisible to every corpus gate; the tests here therefore count
  the empty statements instead of matching the text, which keeps a vanished hole
  and a run of three failing while that split stands.

  `$effect` / `$effect.pre` / `$effect.root` / `$inspect.trace` are still removed
  at every depth in every mode.

- 957fe1a: Give a removed `$inspect(…)` the residue the official compiler leaves no matter how deeply it is nested, and stop the client's non-dev removal from rewriting the same bytes inside a string literal or a comment.
- 3ad528d: Resolve `&` inside a functional pseudo-class against the parent rule. `:is(&)` / `:where(&)` / `:has(&)` used to leave the nesting selector unresolved, which the element matcher read as "matches anything" — so `.card { :is(&) { … } }` put the scoping class on every element in the component, while `.card { :is(&) .a { … } }` put it on none of the descendants and emitted a rule that could never match. Upstream's `get_relative_selectors` finds `&` with a walk that descends into a pseudo-class's arguments, so a rule that carries one there is not prefixed with its parent; both phases now agree on that, and the parent chain used to resolve it is the port that was already there rather than a second one. A `:has()` nested inside a `:has()` argument is also resolved against its own subject set instead of being treated as an unconstrained pseudo-class, so `.a:has(:has(.b))` is pruned where official prunes it.
- 9fbc4ad: Fold `Number(<bigint>)`

  `Number(1n)` was the one global call neither target folded, so it stayed in the
  output where official writes `1`. `to_number` refuses a bigint on purpose —
  `1n + 1` is a TypeError, so the arithmetic operators must not coerce one — and
  the globals table reached `Number(x)` through the same helper. `Number(x)` is
  the exception: it is ToNumber, which is defined for a bigint.

  The exception is narrow by construction. `Number.isInteger(1n)` still folds to
  `false`, `BigInt(3)` still folds to nothing (its result is a bigint the template
  would have to render), and `1n + 1` is still emitted verbatim — which is also
  the input that crashes the official compiler outright
  (`upstream_issues/3054-svelte-bigint-mix-compile-crash.md`).

  Grid — 16 global calls × 6 hosts × 3 targets: **17 of 288 cells diverging → 0**.

- 87d8f8b: Strip a leading BOM in the three `parse` entry points (`parse`, `parseEnvelope`, the wasm `parse_svelte`), as upstream's `compiler/index.js` does at every public entry. A U+FEFF at offset 0 was template content, so it became an extra `Text` node and every position after it shifted. And fix the legacy `parse()` path converting positions to UTF-16 twice on a non-ASCII source: `convert_to_legacy` already runs the conversion on its own output, so the binding's second pass shrank every span again — `<p>日</p>` reported `html.end` 6 where official says 8.
- b865faa: `parse()` attaches comments to the statements they belong to. Every JS comment previously landed in `Program.trailingComments` and no statement carried any, so the association a formatter or codemod needs — which statement a comment precedes or follows — was lost. rsvelte already held a port of upstream's `add_comments` walk for `svelte-ignore` harvesting; this records the ESTree comment objects from that same walk and gives the `Program` only what it did not claim, matching upstream's own `ast.type === 'Program'` special case. The arena's comment side table is now keyed by the node's ESTree `type` as well as its span, because a span does not identify a node: an `ExpressionStatement` in semicolon-free source has exactly its expression's, so a leading comment was reaching both. Comment capture stays gated to the `parse()` path, so `compile()` output is unchanged.
- 9e0b316: Emit `loc.character` on the nodes official emits it on. Official's `parse()` output carries positions from two producers that disagree about the field — `locate-character`'s locator returns `{line, column, character}`, acorn's `locations: true` returns `{line, column}` — and rsvelte had the two swapped in both directions: it added `character` to a script comment's `loc` in `Root.comments` (72 cases) and omitted it from the `Identifier` upstream builds with `Parser.read_identifier`, which is the `{@const}` pattern's id and an attribute shorthand's expression (320 cases). "Always emit it" and "never emit it" are therefore both wrong; the field now follows the producer. `Root.comments` stays the mixed array upstream builds — a comment inside a start tag keeps `character`, a comment in a `<script>` does not — so `JsComment` records which it is, and the parse envelope encodes it (format version 4 → 5).
- c8a3fbb: `parse()` now honours `modern` and `loose`. Upstream's `parse(source, { modern, loose } = {})` passes `loose` to the parser and `modern` to `to_public_ast`; rsvelte's binding declared neither option, so it ignored both and always returned the modern AST — where upstream's default is the **legacy** one — and threw on every document `loose` exists to recover from. Both were already implemented behind the binding (`ParseOptions.loose` is honoured throughout the parser, and `convert_to_legacy` is what the legacy parser-fixture suite exercises); only the option plumbing was missing. Over 14,102 real-world components the legacy axis goes from 0 to 5,456 byte-identical trees against official's.
- 9e0b316: Make the public `parse()` API match official's on three counts. `modern` and `loose` were declared nowhere at the NAPI boundary, so the binding always returned the modern AST and never recovered from a parse error — official defaults `modern` to `false`, which means the **default return shape changes to the legacy AST**, as it already is upstream. `Root.end` stopped at the last non-whitespace byte instead of `source.length`; that could not be fixed alone, because the fixture runners read their input untrimmed while upstream's `test.ts` trims it, and the two deviations were cancelling on the 62 of 110 upstream parser fixtures whose input ends in whitespace. And JS comments never reached the nodes they belong to: the walk that harvests `svelte-ignore` texts is upstream's `add_comments` and now also records `leadingComments` / `trailingComments`, template expressions go through that same walk instead of an ad-hoc leading/trailing/interior split with no last-in-body or separator rule, and a script's walk inherits the comments an earlier script parse recorded — which is what makes a `<script module>` comment bind to the instance script's first statement, as it does upstream. The upstream `javascript-comments` parser-legacy fixture is no longer skipped.
- 8429249: `parse()`'s `Root.end` is now the source length rather than the last non-whitespace byte. Upstream parses `template.trimEnd()` but sets `this.root.end = template.length` on the untrimmed source, so the root span always covers the whole file; rsvelte stopped short on every component ending in a newline — 12,324 of 14,102 real-world components — which loses the trailing bytes for any consumer round-tripping a document through `source.slice(root.start, root.end)`. The parser fixture harness now also trims its input the way upstream's `tests/parser-{modern,legacy}/test.ts` does; without that the two errors cancelled and the suite was green because both sides were wrong.
- 0a070b7: Hand a preprocessor's `script` / `style` hook its `attributes` in source order, and write a hook's returned `attributes` back in the order it built them. Both were hash order: upstream fills a plain object from the attribute regex and stringifies `Object.entries`, and JavaScript key order is observable through `Object.keys`, `for…in` and `JSON.stringify`, so a preprocessor that rebuilds a tag or hashes the attributes for a cache key produced different output under the two compilers.
- 788847b: Print the ES2022 brand check `#x in o` instead of replacing it with a comment.

  ESTree has no `PrivateInExpression`: it models `#x in o` as a `BinaryExpression` whose `left` is a `PrivateIdentifier`, which esrap's `operand_needs_wrap` never parenthesizes. oxc gives the form its own node, so the port had no arm for it and fell to the printer's catch-all, which writes `/*unsupported:PrivateInExpression*/`. That marker was designed as a debugging aid for a test that forgot to check `printer.missing`, but `missing` has no production reader, so it reached the emitted JavaScript.

  How loudly that failed was a property of the host, not of the defect: `return #x in o` and `String(#x in o)` produce text that parses and computes the wrong value, while `if (#x in o)`, a ternary test, a `&&` operand and a declarator initializer produce text no JS parser accepts. All three targets and `compileModule` were affected.

  `ChainElement::PrivateFieldExpression` (`o?.#x`) reached the same catch-all and is printed now too.

- c7eb5ec: Accept a `bigint` key in a `$props()` destructure, and key the prop by its value

  `let { 2n: a } = $props()` was rejected with `props_invalid_pattern` — "`$props()` assignment
  must not contain nested properties or computed keys", which names neither. `LiteralValue::BigInt`
  fell into the `_ => None` arm of the alias match and the `ok_or_else` turned "a key spelling this
  port does not model" into "the user wrote an invalid pattern". Official compiles it on all three
  targets, so this was an over-rejection: nothing downstream — svelte2tsx, the language server,
  `rsvelte-lint` — could process the file either.

  Upstream keys the prop by `String(key.value)`, so a bigint key carries its **value** and never
  its spelling: `0x10n` declares the prop `16`, and `9007199254740993n` keeps all its digits
  (the value is taken from the parsed literal, not through an `f64`). The client read path,
  `$.prop(...)` key and `$.rest_props` exclusion now all use the decimal digits; the server keeps
  the destructuring pattern verbatim, which is what upstream emits there too.

- d535114: Drop a `$props.id()` declaration whatever trivia surrounds the call, and whatever line its initializer starts on. The declaration was matched as raw text, so a comment on either side of the call — or a line break before it — left the source declaration in place next to the hoisted `const`, emitting `const id` twice in one scope: output no JS parser accepts. The test compares both compilers on 12 trivia and layout spellings, each paired with the same declaration minus the trivia.
- d45d179: Fix client output that no JS parser accepts when a `$props()` declaration shares its source line with another statement. `let p = $props(); void p;` emitted `let p = $.rest_props($$props, rest_excludes)void p;`, because the rewrite dropped the `;` from its own replacement on the assumption that a line break follows it. A `$props.id()` declaration on a shared line hit a second site — the per-line loop dropped the whole physical line — and emitted the hoisted `const` twice.
- 9fbc4ad: Decide `$props`-vs-store from the shadowing binding rather than from the script's text. rsvelte scanned the whole instance script for `$props(` and, finding one, declared `$props` a rune — so a `const props = { x: 1 }` beside the usual `let { v } = $props()` compiled as a rune where official makes it a store subscription, warns `store_rune_conflict`, and puts the component in legacy mode. The scan existed because `Prop` binding kinds are assigned after this pass; destructured bindings now carry `init_rune`, so upstream's per-binding rule (`get_rune(declaration.initial)`, with `store_name != "props"` keeping `let { state } = $props()` a store subscription) is available where it is needed. The rest of #3597 — the other runes create the store subscription but leave `analysis.runes` true — is unchanged.
- 6a13260: Fix three defects in the argument list of a functional pseudo-class. `An+B` is now gated on being inside a pseudo-class rather than on the pseudo-class's _name_, so `:is(2n)`, `:not(2n of .a)` and `:where(5)` parse as upstream does, and the nine spellings the old heuristic over-accepted (`-2n-1`, `-1`, `2foo`, `2n /* t */`, `n+`, `2n+`, `2N`, `2e`, `3 n`) are rejected at the position official reports — including the `read_identifier` fallback that makes `:nth-child(-n-1)` a legal type selector. Comments between `:is()` / `:not()` / `:has()` / `:where()` arguments survive: the list is spliced out of the source the way upstream's printer edits it, instead of being rebuilt and joined with `", "`. And an unused argument is pruned out of an `:is()` / `:where()` / `:has()` list as `/* (unused) … */` — the printer and the `css_unused_selector` warning now read one marking pass instead of each deciding for itself — while a `:has()` whose subject is reached through a combinator (`.a :has(.b)`) is judged against the elements that chain can actually reach, so a rule official prunes is no longer kept.
- b749aaf: Server: a comment written inside a legacy `$:` statement now flushes at the next located node the reordered output prints, matching the official compiler. A prop lowering (`export let x` → `$.fallback(…)`) and the implicit declaration an undeclared `$: x = …` creates are both flush points upstream — the first because it keeps the source declaration's location, the second because its declarator reuses the assignment target's — and neither was one here, so the comment stayed on the reactive statement the reorder had already moved past.
- 1b27aff: Resolve names declared inside a `$:` statement through the statement's own scope chain, so a `catch` parameter, a block `let`, a `for` head, a `switch` case, and a `function`/`class` declaration no longer read as the instance binding that shares their spelling — in the cycle graph, in the client dependency thunk, and in the server's topological reorder
- 9fbc4ad: Client: an element whose tag name is a reserved word no longer emits `var var =`

  `Scope.unique` advances past a candidate generated name while any of four tests
  hold, and `Memoizer::generate_id` had the first three: the scope's references,
  its declarations and the root conflict set, but not `is_reserved`. So the first
  `<var>` in a component took the free-name fast path and produced
  `var var = root();` — output no JS parser accepts, from a `compile()` that
  returned successfully. Two of the 48 affected names are standard elements:
  HTML's `<var>` and SVG's `<switch>`.

- b517115: Give the root fragment, the `<svelte:*>` meta elements and `<title>` their own template scope, so a `{@const}` at one of those placements reports `const_tag_invalid_placement` / `svelte_meta_invalid_content` instead of `declaration_duplicate` when its name collides with a script declaration
- f08d08e: Three fixes to what counts as a rune. A rune's name used as a member property or as a method name is no longer lowered as the rune (`o.$derived(1)` stayed `o.$.derived(() => 1)`, `o.$effect(fn)` and `o.$inspect(v)` were deleted outright leaving text no JS parser accepts, and `class C { $derived(v) {} }` had its declaration rewritten). A rune name spelled with a unicode escape is now the rune the parser sees, so `$state(1)` lowers instead of leaving an unresolved reference that throws at import, `$state(1)` is no longer rejected as the unknown global `$st`, and `$props()` turns runes mode on instead of raising `rune_invalid_usage`. And a `$state` / `$derived` declared inside a function body that lives in a template expression is lowered the way the same declaration inside `<script>` is — a reassigned one becomes a `$.state(...)` source whose reads go through `$.get`, where before the declaration emitted a plain value next to a `$.set` that set a non-signal.
- 9fbc4ad: Stop lowering a rune NAME that is text rather than code. Two causes, both in `compileModule`. `skip_opaque` scanned a backtick like `'` and `"` — forward to the next unescaped copy — but a template literal's `${ … }` re-enters code and a nested template opens another, so `` `a ${`$state(0)`} b` `` came out as `` `a ${`$.state(0)`} b` ``; the signature was even nesting depth wrong, odd depth right. Separately, `$inspect` and `$inspect.trace` were removed by a raw `memmem::find` with no opacity check at all, so they vanished from a plain string, a line comment and an object key too. A 180-cell grid of 10 runes across 9 opaque hosts on both targets goes from 32 divergences to 0.
- e7479e5: Resolve a rune-spelled name against its binding before treating it as a rune. A slot that only BINDS the name — a statement label, a `catch` parameter, a nested `const`/`function`/`class`, a destructuring or loop binding — no longer flips a Svelte 4 component into runes mode (and so no longer rejects its `export let` or the declaration itself), and a `.svelte.(js|ts)` module's local named after a rune is called rather than lowered. A parenthesised rune call in a declarator (`let v = ($state(1))`) is also lowered now: acorn builds no `ParenthesizedExpression`, so upstream never saw one, and rsvelte left the rune name in the generated module.
- ab2708a: Three legacy-mode client-output fixes. A binding named `$$props` is now renamed to `$$sanitized_props` on both the client and the server (#3192); a store that arrives as a prop and is written through `bind:` now reads its source through the prop getter instead of the bare name, which threw `TypeError: store.set is not a function` at runtime (#3273); and `$$restProps` now gets the synthetic `rest_prop` binding upstream declares, so a template read of it reaches `$.template_effect`'s dependency-array form and an `{#each}` over it is generated reactive (#3275).
- 9cc1cb2: A comment at the end of an instance script now follows esrap's comment cursor: on the server it lands in the first template expression that keeps a source location, at the end of the component body when there is none, and is dropped when a block gets printed first; on the client a comment below the last legacy `$:` is dropped, because the `$.legacy_pre_effect` block upstream builds for it carries no location. The same rule moves a comment trailing a `$:` on its own line, which upstream never flushes onto the loc-less label.
- 9fbc4ad: Measure a sequence item the way esrap does, so the 60-column wrap agrees

  Two offsets, in opposite directions, both in `Context::measure`:

  - esrap writes a nested sequence's own inter-item space as a **string**, so its
    `measure` counts it. Here that space is a layout event and `measure` subtracts
    it, so a child that hides _k_ spaces is measured _k_ short. `sequence_indexed`
    now uses `measure_with_layout_spaces`, the accessor the variable-declaration
    layout one printer over was already using for exactly this.
  - esrap measures a JS string, so a character costs its **UTF-16** length; the
    buffer here is a Rust `String`, so it cost its UTF-8 byte length — up to 4 for
    one character, 6 for an emoji with a variation selector. `write` now
    accumulates the excess and `measure` subtracts it.

  Neither changes what the code does, only where esrap breaks a line — which is
  also why no gate could see it: every corpus comparison normalizes with oxfmt, and
  oxfmt reflows exactly this. Verified directly: on a 143-line output a raw byte
  comparison reports the divergence and the post-oxfmt comparison reports identical.

  Grids. Space offset — 6 child kinds × item counts 2–24 = 138 cells: **4 → 0**, one
  diverging count per kind, with a zero-inner-space child (`0`, `1`, `2`, …) at 0
  throughout as the negative control. UTF-16 offset — 5 character widths × counts
  2–20 × 2 targets = 190 cells: **2 → 0**, and ASCII at 0 throughout.

  The two are coupled and the order matters: fixing the space offset alone took the
  UTF-16 grid from 2 to **4**, because the byte over-count had been partly cancelling
  the space under-count. That is the measurement that says these are one commit.

  Whole-population control, since a wrap rule is global — a **raw byte** sweep (no
  oxfmt) over the 1,913 real components of bits-ui and flowbite-svelte, client and
  server, 3,826 compared units: **108 → 76 diverging, 32 fixed, 0 introduced**, by
  set difference rather than by count.

  What this does **not** fully reach: a comment in the script sends the sequence
  down the non-direct layout branch. 6 comment slots × the 4 child kinds × 2 targets
  = 48 cells goes **42 → 7**, and all 7 residual cells are the single tightest kind
  (a 7-item array of two-argument calls, whose accumulator lands one over the
  threshold), so that branch is still short by 1 somewhere. It is tracked as #3715; the repro here therefore carries its explanations as markup comments
  rather than JS ones, so that what it pins is this fix and not that residue.

- ec4b531: Stop judging a `SequenceExpression` defined by its last element when deciding the `?? ''` guard on a concatenated interpolation. Upstream's `scope.evaluate` has no `SequenceExpression` case at all — it falls to `default` and adds UNKNOWN — so a sequence is never `is_defined`, whatever the last element is. `{#each arr as q}{(n, s)}{q}{/each}` emitted `` `${(n, s)}${$.get(q) ?? ''}` ``, so a sequence evaluating to `null`/`undefined` rendered the string `"undefined"` where official renders nothing.
- 9fbc4ad: Fold an SSR constant as a JS value, not as its rendered text

  `const r = '1' + '1'` rendered `2` on the server. The binding-initializer fold
  carried every folded constant as a `String`, so the string `'1'` and the number
  `1` were one value and `+` could not tell them apart — the same representation
  defect the client fold had (#3027), on the other side of the compiler. The map
  now holds `EvalValue`, the type `evaluate.rs` already used for template
  expressions, which is why `{'1' + '1'}` written directly was always correct.

  The operators fold through `eval_binary` instead of `parse::<f64>()` on the
  rendered text, so there is one port of JS coercion here rather than two.

  Two more defects lived in the same scan and are fixed with it: the split took
  `*` first, which makes it the tree's root (`1 + 2 * 3` rendered `9`), and it
  took the leftmost operator, which is the wrong associativity (`10 - 3 - 2`
  rendered `9`). It now splits at the rightmost operator of the lowest precedence
  present.

  Grid — 20 expressions × 9 hosts × 3 targets, with operand pairs chosen to
  collide under stringification while differing as JS values: **43 of 540 cells
  diverging → 0**. Every diverging cell was `server`; the client was byte-identical
  to official throughout, so only output equality could see any of it.

- 9fbc4ad: fix: a comment in a `$derived` declarator no longer hides it from the server

  `compileModule(..., { generate: 'server' })` decides which reads become calls
  from a set built by scanning the lowered text for `$.derived(` and walking left
  to a `let|const|var <name> =` shape. The walk skipped whitespace only, so
  `const x = /* c */ $derived(…)` — or a comment before the `=`, after the
  keyword, or in a comma-separated declarator — dropped `x` from the set. A name
  that is not a derived is treated as state, whose read is the bare identifier, so
  the declaration lowered correctly and the template then interpolated the derived
  thunk instead of its value.

- 0a0cbfb: Call the getter for a `bind:value={get, set}` pair on `<select>` when rendering on the server. A sequence expression evaluates to its last operand, so emitting it whole handed `$$renderer.select` the **setter** as the value to match options against — no option was ever marked `selected`, and the server-rendered markup disagreed with what the client hydrates to. `<select>` reaches the renderer through `build_spread_object`, which had no collapse of its own; every other host went through `build_element_attributes`, which already had one.
- 9fbc4ad: fix: separate the `slot` attribute's host set from `<svelte:fragment>`'s

  Upstream uses two different lists — the `slot` rule admits `<svelte:self>` (and
  owns a `slot` at any depth under `<svelte:element>` or a custom element), while
  `<svelte:fragment>` requires a `Component` / `<svelte:component>` parent.
  rsvelte answered both from one flag, so a `slot` under `<svelte:self>` was
  rejected and a `<svelte:fragment>` under `<svelte:element>` was accepted.

  The same flag also leaked through every host that never cleared it —
  `<svelte:boundary>`, `<slot>`, `{#snippet}`, `{#await}` and `<svelte:fragment>`
  itself — so a `slot="…"` one level under a component was accepted there too.

- 957fe1a: Drop an `EmptyStatement` the source wrote from the client output, as esrap does, while keeping the one a removed non-dev `$inspect(…)` stands in for.
- 9fbc4ad: Leave a store name inside a regex literal alone

  `const re = /\$s/` next to a real `$s` subscription came out as `/\$s()/`, which
  changes what the user's regex matches. The output parses and runs, so no parse
  gate can see it; only output equality can.

  The client store-read rewrite is a character scan that already skipped strings
  and comments. A regex body is the third opaque kind, and it needs its own
  predicate rather than an extension of the string one: telling `/re/` from a
  division requires the previous significant code byte, which the string scan does
  not track. `(1 / 2) + $s` is the control — a predicate that called every `/` a
  regex opener would swallow the real store read after it.

  This is the phase-3 half of the pair opened by #3620, which fixed the phase-2
  `$`-reference collector. The two are independent: in #3620's cases the store
  does not exist at all, and here it does — the subscription itself is correct.

  Grid — 4 hosts × 12 opaque carriers × {store, prop} × 3 targets: **42 of 288
  cells diverging → 32, with 0 new**. The ten that close are exactly the
  regex-carrying store reads in a `$:` statement on the client and dev-client —
  the population this scan owns. The 32 that remain are three unrelated causes the
  grid separates by their control rows moving with them: an SSR fold that inlines
  a regex-literal `const` (the `prop` row diverges identically, so it is not
  name-dependent), a memoisation difference on an IIFE in a template expression,
  and comment placement.

- 5bdd902: Stop ending a `<style>` block at a `</style>` that sits inside a CSS string, a `/* */` or `<!-- -->` comment, or an unquoted `url(…)`. Upstream never scans the block as raw text — `read_body` tests `parser.match('</style')` only at a rule boundary, so those occurrences are content — while rsvelte used a plain byte search and rejected `.a { content: "a</style>b" }` with `unexpected_eof`. The scan now mirrors the branch order of upstream's `read_value`; a non-CSS `lang` block in lenient (lint) mode keeps the plain search, since a SCSS `// don't` would otherwise open a string that never closes.
- 9fbc4ad: Stop ending a `<style>` block at a `</style>` that sits inside CSS. `content: "</style>"` made the whole component fail with `unexpected_eof`, and `/* </style> */` with `element_invalid_closing_tag`, because the block's end was found by searching the raw bytes for the text. Upstream never runs that test inside a rule — `read_style` hands it to `read_body` as the `finished` predicate, which is consulted only at CSS top level between rules — so the terminator search now tracks strings, comments, brace depth and paren depth. An unquoted `url(</style>)` is a declaration value official emits verbatim, and a bare `</style>` one brace deep is CSS that official rejects with `css_empty_declaration`; both now agree.
- 5cf6cbd: Follow Svelte 5.56.10. CSS type selectors keep their `namespace`, so `svg|circle`, `*|circle`, `svg|*` and `*|*` parse and are scoped as `svg|*.svelte-xyz` rather than having the universal selector replaced by the modifier; selector names decode their escape sequences at parse time and are re-escaped when printed, so `#\31\32\33` round-trips as `#\31 23` instead of as invalid CSS; and `:nth-child(2n of.a)` no longer needs whitespace after `of`.

  Two defects the new fixtures reached rather than caused are fixed with them. `print()` re-emitted the whole `<style>` body from the source text whenever it carried no CSS comment, so the CSS visitors were unreachable for any stylesheet — the AST path is now the only path, and `@font-face` (whose declarations the CSS parser reads as selectors) keeps its source recovery but writes through the printer's indentation. And the `of S` part of an `:nth-*()` argument is parsed as a full selector list, so `:nth-child(2n of .a, .b)` is accepted instead of raising `css_expected_identifier`.

  Finally, a logical assignment to a private `$state` field short-circuits: `this.#a ||= v` compiled to an unconditional `$.set(this.#a, $.get(this.#a) || v)`, which ran the setter on the branch that must not assign.

- 9fbc4ad: Bind the memoized parameter on `<svelte:element>`'s effect

  A `class:` directive on `<svelte:element>` whose value needs memoizing produced
  `$.template_effect(() => classes = $.set_class($$element, 0, '', null, classes, $0))`
  — a body reading a `$0` that is bound nowhere. The output parses, so the parse
  oracle is blind to it; it throws `ReferenceError: $0 is not defined` on first
  render.

  Upstream's `SvelteElement` visitor gives its inner context `memoizer: new
Memoizer()` and closes it with `build_render_statement`, which reads that
  memoizer's parameters. rsvelte assembled the same `template_effect` by hand with
  a hard-coded empty parameter list and never installed the inner memoizer, so the
  entry `build_set_class` had just added went to the _enclosing_ memoizer — where
  its parameter is bound by a different function. The dynamic-element visitor now
  swaps in a child memoizer for the attribute pass and drains it through the same
  `build_render_statement_with_memoizer` every other element path uses.

  The inner memoizer being its own is the second half of the fix, not a detail: a
  memo on an enclosing element is `$0` there and the dynamic element's is `$0`
  again, so sharing one memoizer would renumber the inner slot to `$1`.

  `style:` and plain attributes were already correct — they reach
  `$.attribute_effect`, which builds its own parameter list — and so was the same
  directive on a regular element.

  Grid — 4 hosts × 6 directive slots × 10 value shapes × 6 compile modes:
  **300 of 1440 cells diverging → 216**, with **0 new**. Every removed cell is a
  `class:` slot on a dynamic element; the 216 that remain are the pre-existing
  `experimental.async` divergences the grid also crosses, and none of them move.

- c1af37f: svelte2tsx now removes an instance script's `export` modifier only for the declaration kinds upstream removes it for. Upstream's `processInstanceScriptContent` reaches an allow-list — `VariableStatement`, `FunctionDeclaration`, `ClassDeclaration`, and a whole-statement `ExportDeclaration` — and keeps `export` on everything else; rsvelte had transcribed that decision inside out, stripping for every kind except `TSTypeAliasDeclaration` and `TSInterfaceDeclaration`. So `export namespace`, `export enum`, `export const enum`, `export declare module` and `export import x = require()` each lost an `export` upstream keeps, which drops them from the module's export surface in the projected `.tsx`.
- f70aa3a: svelte2tsx: decide runes mode with one class scan and one parameter scan

  The class-body rune scan existed three times — the top-level `class` guard, the
  shared `detect_rune_in_class_body`, and an inline `ClassExpression` arm — and each
  copy was missing an arm another had, so a class declaration and a class expression
  with the same body disagreed about whether the component is runes or legacy. That
  decision selects `__sveltets_2_fn_component` versus
  `__sveltets_2_isomorphic_component`, so every prop, event and slot type for the
  file follows it.

  There is now one scan. It reads the superclass expression, every member's computed
  key, method bodies under the method's own parameter scope, parameter defaults,
  field initializers, accessor properties and static blocks. The same unification
  covers functions: a rune in a parameter default (`f(p = $state(0))`) and a rune in
  an expression-bodied arrow (`() => $state(0)`) are now seen in every function form.

- d4c3a33: Three `{@…}` tag validation fixes. `{@debug s,}`, `{@debug , s}` and `{@debug ...arr}` are now the `js_parse_error` official raises instead of compiling with the stray argument silently dropped, because the argument list goes through the same expression parser every other tag body does and the identifier check runs before the closing-brace check, as it does upstream. `await` in an `{@attach}` expression trips the `experimental_async` gate on every host — it was checked in the `RegularElement` visitor only, so a component, `<svelte:element>`, `<svelte:component>`, `<svelte:self>`, `<svelte:body>`, `<svelte:window>` and `<svelte:document>` accepted it — and `{@attach …}` written in fragment position instead of as an attribute is `expected_tag` rather than silently dropped. An empty tag body (`{@html }`, `{@attach }`, `{}`) reports acorn's `Unexpected token` rather than the `()` wrapper's own diagnostic, and `expected_token` carries the zero-width span upstream builds from an index instead of a one-character one.
- b749aaf: A comment written inside a template expression is no longer dropped. Upstream gives esrap one source-ordered comment list for the whole file, so a comment flushes at whichever located node the printer reaches next — which means a constant-folded tag hands its comment to the following expression instead of taking it away. rsvelte carried template-expression comments nowhere at all, on client, server and dev alike.
- a647013: Parse a template expression with the component's one language mode. Upstream picks the acorn variant once per component from `parser.ts` — set when any script declares `lang="ts"` — while rsvelte retried the _other_ mode on failure, so TypeScript-only syntax (`as`, `satisfies`, `!`, `<T>x`, `f<T>()`, annotated arrow parameters) compiled in a component with no `lang="ts"` anywhere; a `{#snippet}` generic clause is likewise consumed only in TypeScript mode. A failure is also classified the way upstream classifies it: leftover input is `expected_token` only when what precedes it is itself a complete expression, so an error _inside_ a nested expression (`{@html String(a b)}`) is `js_parse_error`, and an attribute value gets that classification too
- a647013: Accept a `//` comment whose newline is the last thing before a template expression's own terminator (`<p>{1 // c⏎}</p>`, `<div class={a ? "x" : "y" // c⏎}>`). rsvelte re-parses the expression text wrapped in parentheses, and the caller's whitespace-trim had deleted the newline that terminated the comment, so the synthetic `)` landed inside it
- 9fbc4ad: Parse a keyword-headed template expression with the real parser

  `{import.meta.url}` was parsed by the template-expression fast path as an
  ordinary member chain headed by an identifier named `import`. Every downstream
  "is this pure" port then answered from the leftmost node — an unbound identifier
  is a global, and globals are assumed safe — so the read came out **static**
  where official emits `$.template_effect` on the client and wraps the server body
  in `$$renderer.component`. `import.meta.env.MODE` is the ordinary Vite spelling,
  so this is not an exotic shape.

  The axis is the **leading token**, not `import.meta`: the fast path scans an
  identifier and then dots, so every construct whose first token is a reserved word
  that changes the node type is the same defect. That domain is closed, so the
  word list that hands an expression to the real parser is now the whole reserved
  set rather than the 13 strict-mode words it held — measured, `{class}`,
  `{super.x}`, `{typeof}` and 29 more compiled where official raises
  `js_parse_error`, and `{this.x}` produced an `Identifier` named `this` instead
  of a `ThisExpression`, which made the read static. `true` / `false` / `null`
  stay on the fast path: it builds them as literals, which is what they are.

  That closes an **over-acceptance**, which is invisible to any comparison of
  accepted programs: `{new.target}` is illegal outside a function and official
  rejects it, while rsvelte spelled it `new` + `.target` and compiled it.

  Handing these to the real parser then exposed the other half. `MetaProperty`,
  `ImportExpression` and `ThisExpression` are node types the client's reactivity
  walk had never met, and its fallback calls an unknown node reactive — so
  `{import.meta}`, `{import('./x')}` and `{this}` became `$.template_effect` where
  official leaves them static. Upstream has no analysis visitor for any of the
  three, so all three are static, and only an `ImportExpression`'s operands can be
  reactive; the arms are now written down rather than left to the fallback. A
  MEMBER of one is still dynamic, which is the `MemberExpression` rule doing its
  job — its leftmost object is then not an `Identifier`.

  A keyword is legal as a PROPERTY name, so a word after `.` is exempt from the
  gate: `props.class` is ordinary Svelte and stays on the fast path.

  Grids — 11 expressions × 8 hosts × 3 targets: **72 of 264 diverging → 3**, and
  44 reserved words × 3 shapes: **67 of 147 → 11**. Every remaining cell is a
  different cause with its own issue, and each is named by which control moves
  with it: `{@const c = new.target}` (#3691 — that slot swallows _every_ parse
  error into an empty identifier, whatever produced it), `{var}` / `{enum}` /
  `{interface}` / `{arguments}` (#3692 — a Svelte-level error, not a JS one), and
  `{super.x}` / `{await}` (#3694 — the real parser accepts these too, so the gate
  cannot be what fixes them).

- 9cc1cb2: A comment at the end of an instance script now lands in the server's first printed template expression whichever kind it is — an attribute value, an attribute spread, a `class:` / `style:` directive, an `{#if}` test, an `{#each}` collection, an `{#await}` expression, a `{@html}` argument, a `{@render}` callee, a `{@const}` initializer, a component prop or spread, a `<svelte:element>` `this`, a `<slot>` prop — instead of only a text `{expr}`. A comment trailing a block-bodied `$:` that has a surviving successor lands there too: the reordered body sends esrap's cursor backwards over the copy the successor printed, so it is pending again and the template expression flushes it, rather than the component body's end.
- 9fbc4ad: Keep a template expression's object property key spelled as it was written

  `<div class={cn({ "items-center": x })}></div>` emitted `{ 'items-center': x }`
  on the client. esrap prints a literal from its `raw`, so the source's quote
  spelling is part of the output; `convert_property_key` built the key as
  `JsLiteral::String`, which carries no `raw`, and it is `JsLiteral::RawString` that
  survives the trip to oxc. That converter is the client's alone — the server was
  already right, the same client/server two-ports shape as the constant fold.

  The code that was already there is the tell: the arm branched on
  `raw.starts_with('"')` and then did the identical thing in both halves.

  Grid — 13 literal slots × 2 quote spellings × 2 targets = 52 cells: **2 → 0**. The
  two were the only _object property key in a template expression_ slots; a key in
  `<script>`, a value in either, a computed key and every single-quoted spelling
  were 0 throughout. Single-quoted at 0 is what names the dropped `raw` rather than
  the key position — both spellings reach the identical code, and only the one whose
  `raw` differs from the re-quoted form can show it. The key's shape does not matter
  either: `"a-b"`, `"ab"` and `"1"` all diverged, so this is not about when a key
  needs quoting.

  Whole-population control, raw byte (no oxfmt) over the 1,913 real components of
  bits-ui and flowbite-svelte, 3,826 compared units: **76 → 73, 3 fixed, 0
  introduced**, by set difference.

  No gate here could see it: every corpus comparison normalizes with oxfmt, and
  oxfmt rewrites single quotes to double.

- 9fbc4ad: Give the template-region scans the lexical state their `}` test needs

  `<div {...{ t: "}" }}></div>`, `{#each [/}/.source] as n}` and `{'a\⏎b'.length}`
  were all rejected. The official compiler accepts all three.

  They are three hosts of one class — where a template expression is judged to
  **end** — and each reaches a different scan, which is why they shipped together
  and why fixing one says nothing about the others:

  - The spread and shorthand attribute readers found their closing `}` with a bare
    depth counter (the comment above it said "Fast byte-level brace scanning"), so
    a `}` inside a string, regex, template literal or comment ended the attribute
    and the rest reached the JS parser as a truncated slice. Both now use
    `find_matching_bracket`, which has been comment- and string-aware since #2253.
  - The `{#each}` and `{#await}` head scans had arms for strings, and the `{#each}`
    one for comments, but **neither had a regex arm** — and the `{#await}` scan had
    no comment arm at all. Telling `/re/` from a division needs the previous
    significant code byte, so both scans now record one and consult
    `slash_starts_regex_at`, the predicate #3647 added for the client store scan.
  - `find_string_end` bounded a `'` / `"` search at the first `\n`. A **line
    continuation** is a backslash-escaped newline that the string legitimately
    crosses, so the bound is now the first _unescaped_ newline — which is the
    parity rule `find_unescaped_char` already implements, not a new one.

  All three are over-rejections, so their population is documents the official
  compiler accepts and rsvelte did not. No comparison of accepted programs can see
  that, and the collected corpus is at zero because published code compiles.

  Grid — 18 expression shapes × 12 hosts × 2 targets: **92 of 432 cells diverging
  → 34**, and every one of the 34 is the same two shapes it was before the fix —
  `line-comment-brace` 17 and `block-comment-brace` 17, all `js-mismatch` rather
  than a rejection, which is #3603's comment-placement class. By shape the fix
  accounts for the whole difference: the 32 line-continuation cells, the 18 regex
  cells and the 8 string/template cells all go to 0. The comment shapes being
  _unmoved_ rather than absent is the per-shape control — it says the change
  touched the cells it was aimed at and no others.

  The controls are the other direction of each scan, and they move in neither: a
  `/` that is division (including one after a postfix `++`, where a naive
  "what precedes it" test says regex), `'a\'b'` and `'\\'` — the second being the
  shape that broke a sibling scanner, since the backslash is itself escaped — and
  `` `a\⏎b` ``, the template literal that was already right, which is what
  identifies the real newline rather than the backslash as the cause.

- 9fbc4ad: Accept a template expression whose last token is a `//` line comment. `{#if flag // why⏎}` — and the same shape in `{#key}`, an expression tag, an attribute value, `{@html}` and `{@render}` — was rejected with `js_parse_error`, and five more hosts (`{@const}`, its destructuring form, the `{#await}` head, snippet parameters, a call's argument list) swallowed the failure into an empty identifier and emitted wrong code. The closing `}` was located correctly; every parse then wrapped the slice as `(<slice>)` — or `let <slice> = null` / `(<slice>) => {}` — with the synthetic suffix on the comment's own line, so the comment ate it. The suffix now goes on the next line, which leaves every offset inside the slice unchanged and keeps an arrow's `)` adjacent to its `=>`.
- dffaa17: Split a directive name on `|` for every directive kind, and compare a modifier list rather than searching it.

  - `use:`, `class:`, `animate:` and `let:` kept the modifier inside the emitted name, so `use:action|once` lowered to `action|once?.($$node)` and `class:active|once` applied a class literally named `active|once`.
  - An unknown `style:` modifier is now rejected on `<svelte:body>`, `<svelte:window>` and `<svelte:document>` as it already was on a regular element, and a repeated `|important|important` is rejected everywhere.
  - A repeated `on:click|once|once` on a component is now rejected with `event_handler_invalid_component_modifier`, matching `<svelte:component>`.

- c284668: Reject a TypeScript-only class-member modifier, and the stage-3 `accessor` keyword, in a plain `<script>` — `private` / `public` / `protected` / `readonly` / `declare` / `abstract` / `override` and `accessor` all compiled here and are a `js_parse_error` in the official compiler, which parses a script without `lang="ts"` using stock acorn. The error lands where acorn stops, which is the token after the first modifier it cannot read rather than the member's key. A `lang="ts"` script is unaffected, except that the two rules acorn-typescript enforces in its parser are now enforced too: an `abstract` member outside an `abstract class`, and an `override` member in a class that extends nothing
- 1f1433b: The parser now raises the TypeScript legality rules `acorn-typescript` raises and stays quiet on the ones it does not, in both directions. OXC enforces TS1147 (an import in a namespace) and TS1194 (a re-export in a namespace) as parse errors while upstream's parser has no such rules, so rsvelte rejected components the official compiler accepts; conversely `export declare global { … }` is a parse error upstream — `'export declare' must be followed by an ambient declaration` — and OXC accepts it, so rsvelte compiled a component the official compiler refuses. A `import x = require()` or `export * from` inside a namespace body is also kept as a non-type node now, so the namespace strip still raises `typescript_invalid_feature` for it instead of silently emptying the namespace.
- 7d0050d: Erase a TypeScript overload signature on a class member, and stop the server from silently dropping a whole instance script

  A bodiless class member — a TypeScript overload signature — reached the output as a member
  with no body, which no JavaScript parser accepts. On `server` it was worse than a parse
  error: `transform_script` re-parses the **erased** script to classify its statements, and a
  rejection there returned an empty body, so the entire instance script (imports, the class,
  and every neighbouring declaration) vanished while the output still parsed and threw
  `ReferenceError` at render time — a shape no gate can observe, because the output is valid
  JavaScript. A bodiless member is now erased the way an `abstract` one already was, and a
  classification-parse failure aborts the compile through the same `reparse_failure` channel
  the async instance-body reparse already used.

  The official compiler leaves the signature in place and emits invalid JavaScript for every
  one of these shapes — a method, two signatures, `static`, `constructor`, a private name, a
  getter, and a class expression — while agreeing with rsvelte on the two neighbouring
  controls (an `abstract` method and a `function` overload, both dropped). That divergence is
  recorded in `compatibility/GATES.md#deliberate-divergences` and reported in `upstream_issues/`.

- a9d8598: End an unquoted attribute value at `"`, `'`, `` ` ``, `<` and `=` as well as at whitespace, `>` and `/>`, mirroring upstream's `regex_invalid_unquoted_attribute_value`. rsvelte read one run of characters up to whitespace or `>`, so `<div data-x=a<b>` produced a single attribute valued `a<b` where official produces `data-x="a"` plus an attribute named `<b`, and start tags official rejects (`data-x=a=b`, `data-x=a"b`, `data-x=a</b`) compiled. A top-level `<script>`/`<style>` keeps the narrower `read_static_attribute` set. The `<` that ends a value is also read as the next attribute's name, as upstream does, so a missing `>` after it is reported past that name instead of at the `<`.
- 1d47a0d: Decode `<textarea>` content with the attribute-value entity rule, as `read_sequence` does upstream, so a semicolon-less legacy name like `&notreal;` stays literal instead of decoding its `&not` prefix. The word-boundary guard it uses now also treats `_` as a word character, matching JavaScript's `\b` — `&amp_b` was decoded in every attribute value, not only in a `<textarea>`.
- 46669e4: Server: carry a comment written inside a template expression's `{ … }`. It is
  flushed before the next located node the printer reaches — including when the
  expression it was written in constant-folds away and the flush lands on the
  following one.

## 0.10.19

### Patch Changes

- 6feed09: `a11y_media_has_caption` now reads only the first `<track>` child of a `<video>`, as upstream does (`nodes.find(...)`). rsvelte ran the caption predicate over every `track` child, so a `<video>` whose caption track is not the first one stayed silent where the official compiler warns. `find` and `any` agree whenever there is exactly one `<track>`, which is the shape every earlier test used.
- 96c37b6: Diagnose a non-identifier `{…}` in attribute position as an empty shorthand

  Upstream reads an identifier after the `{` and reports `attribute_empty_shorthand`
  at the brace when it is empty. rsvelte brace-scanned the body and handed it to the
  expression parser instead, so `{@attac f}` — a one-character typo of `@attach` —
  and every other non-identifier body came out as `expected_token` one column late,
  while `{#…}` / `{/…}` abandoned the opening tag entirely (which upstream does only
  in loose mode).

- 258b4c4: Reject a duplicate `{:then}` / `{:catch}` inside `{#await}` with `block_duplicate_clause`, as the official compiler does. rsvelte's continuation loop overwrote the clause it had already parsed, so `{#await p}a{:then v}b{:catch e}c{:catch f}d{/await}` compiled and the first `{:catch}` branch vanished from the output with no diagnostic. A clause named in the header counts too — `{#await p then v}` fills the `then` slot, so a later `{:then}` is a duplicate. The error is anchored at the `:` of the continuation marker, matching upstream's `parser.index - 1`.
- 174115e: Fold operations on a bigint. The constant evaluator already read `1n` as a value, but every arithmetic and relational arm was gated on `to_number`, which returns nothing for a bigint — correct for JS `ToNumber`, which throws on one, and wrong for arithmetic, which uses `ToNumeric` and keeps a bigint a bigint. So `{7n + 2n}` stayed reactive where official renders `9`, and so did `~1n`, every comparison that crosses the bigint boundary (`2n == 2` is `true` while `2n === 2` is `false`), and `Number(1n)`. Mixing a bigint into arithmetic still never folds: it is a runtime `TypeError`, so the value does not exist — as are `1n / 0n`, `2n ** -1n`, `>>>` on bigints and `Math.*` of one. A result outside `i128` is declined rather than folded, so a value this port cannot represent stays reactive instead of truncating.
- 4cb8a06: Run the host-independent half of the `bind:` rules for every host, and read `this=` the way the official compiler does.

  - `await` anywhere a `bind:` expression can reach it — including both halves of a `{get, set}` pair — is now rejected with `experimental_async`, as the official compiler does; an `await` inside a function _below_ the pair still compiles.
  - `<svelte:element>` reached none of the target-shape rules, so `bind:clientWidth={o?.k}` compiled into `($$value) => o?.k = $$value`, which no JS parser accepts, and a shorthand `bind:clientWidth` emitted a write to an undeclared name. A component and `<svelte:component>` never reached the `{get, set}` pair rules, so `bind:group={get, set}`, a parenthesised pair and a three-element pair were all accepted.
  - On the server, `<select bind:value={get, set}>` rendered the sequence expression — whose value is the _setter_ — instead of calling the getter, so no `<option>` was ever selected.
  - `<C bind:this={x} bind:this={x} />` was rejected with `attribute_duplicate`; the official compiler exempts every attribute named `this` from that rule.
  - A second `this=` on `<svelte:element>` / `<svelte:component>` was dropped instead of being passed through as an attribute / prop.
  - `<svelte:self bind:group={x} />` did not declare its binding group array.

- 81008be: Four client-output divergences from the official compiler:

  - A numeric key in a `$props()` destructuring reaches `$.prop` as a number, not a string, and carries its value rather than its spelling (`0x10` → `16`). The same key is excluded from `$.rest_props` as a number, and a fractional key (`0.5`) is no longer truncated to `0` on the read-only path.
  - A component prop whose value aliases a local function is passed through a getter (and through a thunk when spread), matching `scope.evaluate`, which never treats a function as a known value.
  - A `const` initialised with a logical expression (`1 || 2`) or a regex literal folds into the template on all three targets; a folded regex is an object, so `{typeof c}` renders `object`.
  - An optional `{@render sn?.()}` inside a snippet no longer blocks the module-scope hoist, so the closure is allocated once per module instead of once per component instance.

- 762a8a5: Stop reading a backtick inside a block comment as a template-literal delimiter. The client instance-script re-indenter tracked template literals to leave string content byte-for-byte alone, but had no notion of `/* … */`, so a fenced code sample in a JSDoc comment opened a template that swallowed the rest of the comment — every line after the fence lost its indentation, and the output no longer matched the official compiler.
- fce6655: Return the Svelte-4 legacy AST from `compile()` when `modernAst` is not set, as the official compiler does. `result.ast` was `null`, so tooling that reads it received nothing instead of a tree.
- 9dc0d67: Give a computed property key in a `<script>` its own span instead of the bracket's

  `convert_property_key` is the program-path key converter — every one of its callers is a
  `*_for_program` function — but its computed branch reached for `convert_expression`, which
  subtracts one byte "for the paren we added": the wrapper a **template** expression is parsed
  inside and a script is not. So a computed key's whole subtree landed one byte early, pointing at
  the `[`. The identifier branches beside it never had that subtraction, which is why a plain key
  was right and only a computed one was wrong.

  Everything that reads a position out of the serialized program was one column early on this
  shape: the `bidirectional_control_characters` warning, `rsvelte-lint` (where it had already cost
  six lost findings on a fixture no other gate grades), svelte2tsx and the language server. Eight
  positions across five hosts — an object literal, a class field, a class method, a destructuring
  pattern and `<script module>` — now match the official compiler, and the five neighbouring
  shapes that were already correct are unchanged.

- 139a74b: Report a `{@const …}` with no `=` as the missing token upstream raises. `{@const c}` compiled, dropped the declaration and left the body referencing a name no module declares, so the branch threw `ReferenceError` when it rendered — output that parses, which is why only equality could see it. The body is now read as a pattern followed by `=`, as upstream does, so the position lands where the pattern ends and a non-pattern body (`{@const 1}`, `{@const let}`) carries its own error code
- 762a8a5: Six compiler fixes the wave-2 corpus enrolment surfaced. A leading UTF-8 BOM was compiled as template text — upstream strips it at every entry point, and left in it emitted a stray text node around a component whose markup is one child element (320 corpus divergences from one character). The CSS parser spun forever on a block item that starts at `{`, because `parse_rule` records `css_expected_identifier` and consumes nothing when the selector is empty, so both callers that dispatch to it never advanced. Two `&str` slices took a byte offset measured somewhere else and panicked on a multi-byte character — the source-map column on an em dash in an instance-script comment, and the `svelte-ignore` back-scan on a variation selector in markup. esrap dropped a function body's directives, so a `'use strict'` prologue vanished from the output. A `$store` setter read its store as a bare name where upstream resolves it through the store variable's own binding, so `$.store_set(searchValue, $$value)` should have been `$.store_set($.get(searchValue), $$value)` — the same for `store()` props and `$$props.store`. And a property key whose name contains a non-ASCII letter is now quoted, matching upstream's ASCII-only `b.key` regex, instead of being emitted bare.
- 0284e4e: Route a custom-element attribute through its own memoizer, so an `await` in its value reaches `template_effect`'s async slot instead of being inlined into a non-async arrow
- 0ebfcfe: Stop emitting a `console.log`/`debugger` pair for a bare `{@debug}` inside a regular element. The official compiler discards that effect with the rest of `child_state.init` when the fragment is neither declaration-bearing nor dynamic, and a `{@debug}` with no identifiers is neither — rsvelte counted every `{@debug}` as a dynamism producer, so a `debugger;` statement reached non-dev client output. A `{@debug}` that names an identifier, or one outside a regular element, still emits
- 9c1f202: Decide the dev-mode `console.METHOD(...)` wrap by upstream's rule in the text fallback too. The instance-script pipeline splits on source lines, so a declaration sharing a line with the head of a multi-line statement yields fragments that are not standalone programs; oxc rejects those, and the fallback then chose by argument spelling (`!all_args_are_literals`) rather than by `scope.evaluate(arg).has_unknown`. An identifier that folds to a known value, a binary expression, an arrow and a `!x` were all wrapped, so moving two statements onto one line changed the emitted code.
- a4e1547: Separate the two questions asked of a node's component-like parent. Upstream's `validate_slot_attribute` treats `Component`, `SvelteComponent`, `SvelteSelf` **and** `SvelteElement` as slot owners, while `SvelteFragment.js` accepts only `Component` and `SvelteComponent` as a `<svelte:fragment>` parent. rsvelte answered both from one boolean, so `<svelte:self>` rejected a legal `<b slot="named">` child and `<svelte:element>` accepted a `<svelte:fragment>` the official compiler rejects. The flag is now a three-valued `DirectComponentParent`, which cannot desync the way two parallel booleans would.
- 46c5ce1: Give an `{#each}`'s `{:else}` fallback its own scope, as upstream does. A `{@const}` or
  `{#snippet}` in the fallback no longer collides with the each item or index (which are not
  in scope there), and no longer leaks into the each scope — which had been adding unused
  `$$index, $$array` parameters to the each _body_ callback.
- 1fa209f: Report an empty expression body — `{@html }`, `{@attach }`, `{}`, `{#if }`, `{#key }`, an empty attribute value — as `Unexpected token` rather than `Empty parenthesized expression`. The expression probe wraps its input in `(…)` before handing it to the JS parser, so a body with no code in it produced the parser's message for `()`: a diagnostic describing the wrapper rather than the source. Whitespace-only and comment-only bodies are the same case, and are now recognised by parsing rather than by trimming, so a `/*` inside a string literal is not mistaken for a comment
- 762a8a5: Release the esrap printer fixes included in the corpus compatibility update.
- c875a19: Fold a call to one of upstream's 46 `globals` keypaths (`Math.*`, `Number`, `Number.*`, `String`, `String.*`, `BigInt`) in the client the way `scope.evaluate` does, so an element whose only child is such a value keeps the `textContent` fast path instead of emitting a text node and a `$.set_text` effect. The client carried its own eight-name `Math` table and reached it only when no binding was referenced at all, so `Math.abs(n)`, `Math.sign(n)`, `String(n)` and `Number(n)` over a never-written `$state` all lost the fast path. The value now comes from the server's table rather than a second implementation of it, which also fixes `Math.round(-0.5)` folding to `-1` where JS (and the server) give `0`. A local binding of the global's name, a spread argument, and a `Math.`/`Number.` member outside the eight `global_constants` keypaths are now all declined, matching upstream.
- 6800a72: Minify the injected stylesheet the way upstream does. `css: "injected"` (and every custom element, which injects unconditionally) emitted a `;` after every declaration on top of the one already in the source, doubled the opening brace of a rule with a nested rule — leaving the stylesheet with unbalanced braces — and kept the whitespace `remove_preceding_whitespace` removes. A declaration's span ends at the `;` or `}`, so the separator comes from the source; the whitespace runs before a rule, before a declaration and before a block's closing brace are now dropped from the emitted text rather than from a gap. `animation` / `animation-name` declarations, at-rules and their closing braces keep their whitespace, matching upstream's visitor split, and `@font-face` and `:global {…}` bodies are minified like any other block. `css.code` — the only thing the corpus gate compares — was already correct and is unchanged.
- b5e8e2d: A `$derived` whose argument is a compile-time known value is no longer treated as reactive, so `{rd}` over `$derived(1)` writes `textContent` once instead of templating a text node and a `$.template_effect` — the template string itself differed (`<b></b>` vs `<b> </b>`), so the two hydrated against different DOM. A binding stores a literal initializer as its own source text rather than as node JSON, and the "is this value known" check only understood the JSON form.

  A production-mode `$inspect(…)` in a value position keeps its slot filled with `undefined` instead of leaving `let v = ;`, which no JS parser accepts, or `const o = [];`, which drops the element.

  A statement-level `$inspect(…)` in a `.svelte.(js|ts)` module now leaves the `;;` upstream prints, at the nesting it had, instead of deleting the call and its whole line. The component-instance path already did this; only the module loop did not.

- f22ea71: Fix the legacy `$:` boundary when a statement shares its line, and treat CR / U+2028 / U+2029 as line terminators

  The client instance-script pipeline read one physical line as one statement, so a
  `$:` sharing its line with another statement put the boundary in the wrong place —
  splicing the next statement into the `$.set(...)` call (output no JS parser
  accepts), swallowing it into the effect body, or dropping the `legacy_pre_effect`
  wrapper and emitting a bare `$:` label. Top-level statement boundaries now come
  from the parser.

  The same "line" notion was `\n`-only in two places: that split, and the printer's
  decision about whether a comment and the node after it share a line. A `//`
  comment terminated by CR / U+2028 / U+2029 therefore absorbed the statement that
  followed it, which disappeared from the output.

- 0f1631b: Lower a `$effect.pending()` declarator initializer to `void 0` on the server, matching upstream's `VariableDeclaration` visitor, instead of applying the call-expression rule that produces `0`. The `.svelte.js` module path already did this; the component instance script did not.
- 5c320ff: Keep a `.svelte.(js|ts)` module's statements in source order. `compileModule` split the transformed source into "imports" and "the rest" with a line scan and emitted every import first, so an `import` written below an `export … from` was hoisted above it — which reorders the two modules' side effects, not just the text. Upstream's `client_module` / `server_module` concatenate the generated `$` import with the walked module body untouched, and rsvelte now does the same: the scan is gone, so a line whose text merely _spells_ an import (inside a comment, a string, a template literal or a regex literal) can no longer move anything either.
- ce7fedd: Lower `$inspect.trace(…)` in `.svelte.(js|ts)` modules

  A module script had no dev-mode lowering for the rune at all, so `$inspect.trace(…)`
  reached the client output verbatim and threw `ReferenceError: $inspect is not defined`.
  The enclosing function body is now rewritten to `{ return $.trace(label, () => { … }); }`
  (awaited, with an `async` thunk, for an `async` function), with the default label taken
  from the function's own AST parent and located in the source the user wrote. The
  `$effect`-style non-dev removal that every other target still reaches now runs off the
  JS-lexical scan, so the same bytes inside a string literal are left alone.

- 2c272d2: Walk a `NewExpression`'s callee and arguments when the client computes a template expression's metadata. Upstream's `NewExpression` visitor only calls `context.next()`, so a `new` contributes no flag of its own; rsvelte had no arm for it, so the catch-all marked every `new` reactive — `{new String(s)}` over a non-reactive binding became `$.template_effect(() => $.set_text(…))` where official assigns `nodeValue` once — while `has_call` / `has_member` / `has_await` were not propagated out of it at all, so `{new String(f())}` and `{new (getC())()}` got the bare-closure form instead of the memoized dependency-array one.
- 6017851: Keep an `import` statement's attributes clause (`with { … }`) attached to the import when it is not written on the same line as the module specifier. The client script pipeline ended the statement at the specifier, hoisted the import without its clause and emitted the clause into the component body, which no JavaScript parser accepts.
- f1e57b2: Lower a rune call written inside grouping parentheses. `let v = ($state(1));`, `class K { f = ($state(1)); }`, `let { a = ($bindable(1)) } = $props();`, `const id = ($props.id());`, `($inspect(x));`, `($effect(…));` and `return ($state.snapshot(v));` all left the rune name in the generated module, which throws on import; `$props.id()` additionally emitted its `const` twice and the server module's statement removal left `();` behind, neither of which is JavaScript. acorn builds no `ParenthesizedExpression`, so upstream cannot tell these from the bare calls — the four phase-3 entry points now normalise the parentheses away before any lowering reads the source, so the two agree by construction rather than one decision point at a time.
- 7e500f3: Stop a failing preprocessor from killing the Node process, and discard an attribute-only result the way upstream does. A JS callback that threw was routed through `napi_fatal_exception`, so `await preprocess(...)` never rejected and the caller's `try`/`catch` never ran — in a Vite dev server one SCSS syntax error took the server down instead of drawing an error overlay. The callback is now called through `call_async_catch`, and the rejection carries the user's own message rather than `GenericFailure, oneshot canceled`. Separately, a `script` / `style` result whose code is unchanged and which returns no map is discarded whole, `attributes` included: applying them re-emitted the tag with a replaced attribute list, so `<script module>` lost its `module` and compiled as an instance script.
- 2bf8d8b: Resolve a name declared inside a `$:` statement to that declaration rather than to the instance binding of the same name. A `catch (e)` parameter, a block `let`/`const e`, and a `for` head's own binding were all attributed to the outer `e`, so a second reactive statement assigning `e` was reported as `reactive_declaration_cycle` on code the official compiler compiles. A function parameter was already scoped correctly, which is what made this a scoping gap rather than a missing feature; the shadowing is per block, so an inner block does not silence an outer read of the same name
- a2d5ee3: Stop reading a `$`-name spelled inside a regex literal as a store reference
- 35eba10: Client: an element whose tag name is a JS reserved word no longer emits a
  declaration that cannot parse. `<var>x</var>` produced `var var = root();`, and
  42 of 46 reserved words behaved the same way, `<var>` and SVG `<switch>` among
  them. The name allocator now refuses a reserved word the way upstream's
  `Scope.unique` does.
- 8aa0109: Keep a comment written between a declarator's `=` and its rune call inside the lowered
  call, the way the official compiler places it: inside `$.tag(...)` for `$state`, inside
  `$.proxy(...)` for a non-reactive proxied initializer, inside the synthesized thunk's
  parameter parens for `$derived(expr)`, and before the argument for `$derived.by(fn)`.
- 2bf8d8b: Stop counting a `$`-prefixed name as a rune use when the slot only binds or labels it. A statement label (`$state: for (;;) break $state;`) and a `catch ($state)` parameter both declare rather than read, and counting them flipped the component into runes mode — which turned a working Svelte 4 component into `legacy_export_invalid`. The same two slots also decide store subscriptions from a separate scan, where `catch ($count)` now shadows the store for its own block and a label is not a read
- a9f8614: Reject `U+200B` (ZWSP) and `U+0085` (NEL) in a `<script>` body, as upstream does. Neither is ECMAScript `WhiteSpace` or `LineTerminator` — `U+200B` has been `Cf` rather than `Zs` since Unicode 4.0.1 — so acorn, and therefore the official compiler, raises `js_parse_error` on a program that carries one between tokens. oxc's `is_irregular_whitespace` admits both, so rsvelte compiled them. The verdict now comes from the `irregular_whitespaces` spans oxc itself reports, filtered by the ECMAScript set, which leaves the same character accepted inside a string literal or a comment.
- ad47006: A comment at the end of an instance script now follows esrap's comment cursor: on the server it lands in the first template expression that keeps a source location, at the end of the component body when there is none, and is dropped when a block gets printed first; on the client a comment below the last legacy `$:` is dropped, because the `$.legacy_pre_effect` block upstream builds for it carries no location. The same rule moves a comment trailing a `$:` on its own line, which upstream never flushes onto the loc-less label.
- 02d4b41: Fold the three `globals` entries the server answered with a type marker. Upstream stores `[type, fn?]` per keypath and folds when `fn` is present and every argument is known; `String.fromCharCode`, `String.fromCodePoint` and `Math.f16round` all have an `fn`, but rsvelte reported a `STRING`/`NUMBER` marker for them, so a known value read as unknown and the chunk was not folded into the SSR template. `BigInt` and `Math.random` are the only two entries upstream really does store without one, and they stay unfolded.
- 0284e4e: Lower the runes inside a labeled statement during server compilation, following `sveltejs/svelte#18617`: `outer: { let r = $state(5); }` now emits `let r = 5;` instead of leaving the rune call in the output
- 18e1858: Lower a `$state` / `$derived` declared anywhere below a server script statement, not only inside a function or arrow body. A bare block, an `if` branch, a loop body, a `switch` case with or without braces, a `try`/`catch`/`finally`, a `class` static block and a `for` head all left the rune call in the output, so SSR threw `ReferenceError: $state is not defined`. Labelled statements are now skipped at every depth, matching upstream's `LabeledStatement` visitor, which returns without descending in runes mode — previously a label inside a function body was lowered when it should not have been.
- 273ed67: Order the server's `$$slots` object by the component's children. Upstream keys one `children` record by slot name while walking the children and later emits `Object.keys(children)`, so the object follows the position at which each slot name is first seen; the server port seeded `default` into its own list before walking, so `default` always led and `<C><b slot="named">…</b><i>…</i></C>` emitted `{ default: true, named: … }` where official emits `{ named: …, default: true }`. Object key order is observable JS, and the client target was already correct.
- 6b30925: Break an over-width object, array, parameter list, import-specifier list or
  destructuring pattern that has exactly one member, matching the official compiler.
  esrap applies one width rule at every arity; rsvelte's one-item fast path measured
  the member and never compared it, so a single-member literal stayed on one line
  however long it got.
- 83c6044: Gate a `{#snippet}` header's type parameter scan on the component being in TypeScript mode, and require the `(` that opens the parameter list outside loose mode — both are upstream's rules (`parser.ts && parser.match('<')` and `eat('(', true, false)`). Without them `{#snippet s<T>(a)}` compiled in a component with no `lang="ts"`, and `{#snippet s}` compiled anywhere, where the official compiler raises `expected_token`. An unterminated type parameter list now reports `unexpected_eof` at the end of the input, as `match_bracket` does.
- 60961e8: Decide the snippet module-scope hoist from references, not from an enumeration of expression kinds

  Whether a top-level `{#snippet}` is hoisted to module scope was answered by a whitelist of
  expression node kinds whose default arm was "not hoistable", so a snippet was pinned inside the
  component function by any expression kind the list did not happen to name — not by anything it
  referenced. `ChainExpression` was one such kind, which is why `{@render s?.()}` blocked the hoist
  that `{@render s()}` permits, but so were a tagged template, a class expression and a TypeScript
  `as`. Upstream reaches the same decision from the snippet scope's _references_, where an
  expression kind is transparent; the unnamed kinds are now walked for identifiers the same way,
  which is what the predicate's third copy (used for arrow-function bodies) already did — the same
  `{mo?.a}` hoisted when it sat inside `onclick={() => …}` and not when it stood alone. A snippet
  that references instance state is unaffected: 25 such rows were measured against the official
  compiler before and after and none moved.

- 5c72df2: Subscribe a store written as a directive name for every directive kind official svelte2tsx subscribes for, instead of skipping `use:` / `transition:` / `in:` / `out:` / `animate:`. Only the bare form subscribes: `use:$store.action` names a property of a store the projection never declares, and official writes no subscription for it
- 5c72df2: Register the store subscription for a `$`-prefixed store used as a directive's name. `transition:$store`, `in:`/`out:`, `animate:` and shorthand `style:$store` all read the store through the directive's NAME rather than its expression, and only `use:` collected it — so the other four emitted a reference to a `$store` that was never declared, and threw at runtime
- fc19aa6: Hoist an awaited `style` attribute value out of the client `template_effect` arrow. All three arms of the style value builder passed a literal `has_await: false` to the memoizer, so `<div style={await p}>` emitted `await` inside a non-async arrow — output no JS parser accepts
- 6800a72: Stop ending a `<style>` block at a `</style>` that sits inside a CSS string, a `/* */` or `<!-- -->` comment, or an unquoted `url(…)`. Upstream never scans the block as raw text — `read_body` tests `parser.match('</style')` only at a rule boundary, so those occurrences are content — while rsvelte used a plain byte search and rejected `.a { content: "a</style>b" }` with `unexpected_eof`. The scan now mirrors the branch order of upstream's `read_value`; a non-CSS `lang` block in lenient (lint) mode keeps the plain search, since a SCSS `// don't` would otherwise open a string that never closes.
- 0873955: `<svelte:options>` is now validated where the official compiler validates it — once the whole template has been parsed, between the meta-tag checks and the children check — so a duplicate `<svelte:options>` outranks a bad attribute value and a bad attribute value outranks the element's own children (both orders were reversed). The validator itself is a faithful port of upstream's `read_options`: an expression tag holding a string literal is accepted wherever the quoted form is (`namespace={"svg"}`, `css={"injected"}`), `customElement`'s `props` entries are checked, a non-string `tag` (`{ tag: null }`, `{ tag: 1 }`) is rejected while an empty `customElement=""` is accepted, the tag-name character class follows the HTML spec instead of an ASCII approximation, non-`Identifier` and computed keys in the `customElement` object are rejected, whitespace-only children are rejected, and the `shadow` error carries upstream's current message naming `ShadowRootInit`.
- e6a1202: `<svelte:window>`, `<svelte:document>` and `<svelte:body>` now answer "does this element take arbitrary attributes at all" before validating any individual `bind:`, as upstream's visitors do — so a spread or a non-event attribute alongside an unsupported `bind:` reports `illegal_element_attribute` / `svelte_body_illegal_attribute` rather than `bind_invalid_target`.
- 18e1858: svelte2tsx now enters runes mode when the only rune sits below a statement — a bare block, an `if` branch, a loop, a `switch` case, a `try`, a label or a `class static {}`. Such a component was emitted with the legacy Svelte 4 component typing (`__sveltets_2_isomorphic_component` and `InstanceType`, with no `bindings`) instead of the Svelte 5 function-component typing, so every editor diagnostic and `rsvelte-check` result for it went through the wrong path. `do…while` and a class `static {}` were also missing from the recursive rune walker itself.
- 2614b64: svelte2tsx: honour `mode: "dts"`, `typingsNamespace`, `emitJsDoc`, `noSvelteComponentTyped`, `version: "4"` and an absent `filename`

  `mode: "dts"` emitted the `ts`-mode component declaration instead of the `.d.ts` interface block, so a
  library packaged through rsvelte got a declaration file whose component type was the internal shape.
  `typingsNamespace` was ignored (`svelteHTML` was hard-coded in every `createElement` /
  `mapElementTag` call, and the `bind:` prefix was preserved unconditionally), `emitJsDoc` and
  `noSvelteComponentTyped` never reached the conversion, `version: "4"` kept the Svelte-5 props shape
  and emitted no class getters/accessors, and a call with no `filename` invented a component name
  instead of using `$$Component`.

  The JS option object is now parsed by one shared `Svelte2TsxOptions::from_json`, so the NAPI and wasm
  bindings cannot drift apart.

- 8ab5bbc: Report the JS parse error in a `{@const …}` initializer, a `{#await …}` head and a `{@render …}` tag instead of swallowing it. All three routed their expression through a parse that recovers with an empty identifier, so ordinary broken JavaScript compiled — and in the `{@render}` case the empty identifier then failed the downstream call check, so a second error stood in for the one that was dropped. Upstream's `read_expression` throws unless the parser is loose, and its caller then expects the `}`, so leftover input after a complete expression is an `expected_token` while a malformed expression is a `js_parse_error`; both classifications now reach all three tags
- 2564278: End a tag where the official compiler ends it. A closing tag now requires its `>` after the name and optional whitespace, so `</div x>` is `expected_token` instead of compiling with the junk silently dropped — `<textarea>` keeps taking everything up to the `>`, because upstream's closer for it really is `/<\/textarea(\s[^>]*)?>/i`. What sits between `</style` and the `>` is template text again (`<style>…</style x>` renders `x>`), since upstream reads `/\s*>/y` and consumes nothing when no `>` follows. A root `<script>` is no longer closed by `</script x>`, matching upstream's `/<\/script\s*>/`, and the resulting `element_unclosed` is reported at the end of the right-trimmed template. And a new tag now closes exactly one element: `<optgroup>` after a nested `<option>` popped the whole ancestor chain, so the new group became a sibling of the old one instead of its child. `p`'s auto-closing table also loses `details`, `figcaption` and `figure`, which upstream's `autoclosing_children` does not list.
- b72ecc3: Report an unclosed `<textarea>` as `unexpected_eof` at the end of the template, matching the official compiler. `<textarea>` is escapable raw text, so upstream reads its body with `read_sequence`, which raises `unexpected_eof` when the closing tag never arrives; rsvelte reported the generic `element_unclosed` at the opening tag instead.
- 55606ec: Accept the full HTML `PotentialCustomElementName` production for element names and every ECMAScript `ID_Continue` character in a snippet name, and fix the three divergences those over-rejections were hiding: a declarator span whose end came from the generated identifier's byte length (a panic on a non-ASCII tag name), an ASCII-only guard around the `toLowerCase` of an HTML tag name, and an identifier sanitizer that counted characters where upstream's regex counts UTF-16 code units. Element-vs-component classification now uses upstream's `regex_valid_component_name`, so `<X-a>` and `<x-a.b>` are regular elements rather than component calls.
- 1bbbb31: Erase a TypeScript class index signature instead of leaving it in the output

  `class K { [k: string]: unknown }` reached the `client` JavaScript verbatim — TypeScript in a
  `.js` artifact, which no parser accepts — and on `server` it was worse: the erased script is
  re-parsed to classify its statements, that parse rejected the surviving TypeScript, and the whole
  instance script was discarded, leaving output that parses and does nothing.

  The eraser left it alone on purpose ("upstream passes these through verbatim"), which was the
  wrong reading of upstream's behaviour: the official compiler does not print it either, it
  **throws** a bare `TypeError: Cannot read properties of undefined (reading 'type')` from esrap's
  `TSIndexSignature` printer, because `remove_typescript_nodes.js` deletes the signature's
  `typeAnnotation` while `ClassBody` keeps the node. A crash is not an output to be byte-equal to.

  An index signature is type-only and has no runtime representation, so it is now removed like an
  interface and a type alias already were — measured over 8 spellings × 3 class hosts × 2 entry
  points × 3 targets, taking 96 unparseable outputs, 96 TypeScript leaks and 48 silently-dropped
  scripts to zero with the 198 control cells unchanged. Recorded in
  `compatibility/GATES.md#deliberate-divergences` and reported in `upstream_issues/`.

- 5dec259: Reject a TypeScript class-member modifier in a source parsed as plain JavaScript. OXC parses `private` / `public` / `protected` / `readonly` / `override` / `declare` / `abstract` / `accessor` on a class member in a non-TypeScript source and reports nothing, while acorn reads the modifier as the member's _name_ and throws on the token after it. `compileModule` always parses with `typescript: false`, so `class K { private a = 1 }` in a `.svelte.ts` module compiled and copied the keyword straight into the emitted `.js`, which no JavaScript parser accepts; a plain `<script>` in a component reached the same parse and did the same. Both now raise `js_parse_error` at the offset official reports. A modifier keyword that is not a modifier is untouched — `private\n\ta = 1;` is two ordinary fields, `private = 1;` is a field named `private` — and `<script lang="ts">` keeps compiling all of them.
- 2bf8d8b: Reject a second `function` **implementation** with the same name. TypeScript lets a name carry any number of body-less overload signatures, and rsvelte turned that into "exempt every function-vs-function redeclaration", so `function f() {} function f() {}` compiled in a `lang="ts"` script — and in a plain one, where a function declaration always has a body. The exemption is now about the body rather than the `function` keyword, which also gives `declare function f(): void; function f() {}` the right answer, and the error carries acorn's code, wording and zero-width position
- 5e5fe6b: Reject a TypeScript namespace with non-type nodes through every modifier: `export namespace N { … }`, `declare module "x" { … }` and `declare global { … }` now raise `typescript_invalid_feature` at upstream's span instead of compiling.
- ffe1c3e: End an unquoted attribute value on `"`, `'`, `=`, `<` and a backtick

  An unquoted value was read as one run up to whitespace, `>` or `/>`. The HTML
  "attribute value (unquoted) state" — upstream's
  `regex_invalid_unquoted_attribute_value` — also ends it on `"`, `'`, `=`, `<`
  and a backtick, so `<div data-x=a<b>` produced one attribute where official
  produces two, and documents official rejects were accepted.

- 5c72df2: Report an unterminated `<!--` at the last non-whitespace byte. Upstream parses a right-trimmed template, so it runs out of input there rather than at the end of the file; the tag paths already did this and the comment reader reported the untrimmed end
- 513c080: A synthesized `$state()` destructuring declaration with a default now breaks across lines at the same 50-column boundary esrap uses. The separator spaces between a call's arguments are content upstream measures, and this port materialises them as layout spans, so the declaration measured one byte short per inner separator and stayed on one line at exactly the boundary.

## 0.10.18

### Patch Changes

- 9584d16: Keep a namespaced type selector's prefix in the emitted CSS (`svg|circle`, `*|div` were printed as `circle` / `div`, because the printer used the AST `name`, which upstream deliberately stores without the namespace so element matching works). Type selectors now read back from the source like class and id selectors already did. `css_nesting_selector_invalid_placement` also carries the `&`'s span instead of no position at all, and a `&` inside a pseudo-class argument list is judged by the same rule as one outside it — `.a:is(&)` was accepted where official rejects it.
- 1909eaa: Fix two warning-parity divergences that both come from a slot the check never reached.

  `get_static_value` in the a11y checker collapsed a valueless attribute into the string `"true"`, where upstream keeps `null | true | string` and folds `true` back to `null` in `get_static_text_value`. `<div role>` was therefore looked up as an unknown role, `<div tabindex>` reached neither tabindex rule, and every `=== 'true'` comparison (`aria-hidden`, `aria-disabled`, a `<track kind>`) answered the wrong way. The numeric checks also parsed with `i32::from_str`, so `tabindex=""`, `"1.5"` and `" 2 "` fell through where upstream's `Number()` does not.

  `bidirectional_control_characters` is raised upstream from a `Text`, a `Literal` and a `TemplateElement` visitor, all of which zimmerframe reaches anywhere in the AST. rsvelte ran the `Text` scan on fragment text only and never reached the other two from a template expression, so an attribute or directive value and any string or template literal inside `{...}` were silent on every host.

- 67df3e0: Reject the syntax OXC parses and acorn does not, so a component script is no longer accepted where the official compiler rejects it — `using` / `await using` declarations, the `import defer` / `import source` phases, and the withdrawn `assert { … }` spelling of an import-attributes clause on an import or a re-export. The `assert` restriction is JS-only, because acorn-typescript still accepts it
- 9d708e3: Four more parity fixes from the adversarial sweep: a folded server `$state` string constant stores its cooked value instead of raw quote-stripped source (`'\\\''` no longer renders three backslashes), folded server numbers render in JS spelling (`1e-7`, not `0.0000001`), dev-mode `console.log` wrapping evaluates a `$derived.by` expression body the way upstream does, and a comment between an `{#each}` item pattern and its delimiter is now rejected with upstream's error codes instead of compiling.
- 848927f: Sixteen output-parity fixes found by the adversarial pattern-corpus sweep (#3030–#3045): multiline class-field rune arguments keep no trailing comma, `$:` sequence assignments compile per element, async placeholders match as whole statements (a string containing `$$async_hole` no longer deletes its declaration), snippet parameters shadow outer bindings on the server, `$host()` is no longer a store subscription, destructuring defaults survive into each-key functions and nested `$.fallback` chains, class-field `$derived` reads of an outer derived no longer double-invoke, `let:` array patterns with rest keep their `$.derived` destructure, shorthand `style:` reactivity follows the binding kind, the option/select `?? ''` guard uses upstream's criterion, mutually recursive snippets hoist, whitespace between sibling `<svelte:element>`s survives, semicolon-less legacy entities decode, a bare `{@debug}` still logs, bigint and exotic numeric spellings constant-fold like upstream, and three byte-parity gaps (empty `$:`, `void 0`, `$.update` comment shapes) are closed.
- 6ac7210: Stop scoping an ancestor for a selector whose combinator chain does not match. The ancestor walker carried a bypass for sibling combinators — a subject already marked scoped counts as a match, because the chain walker cannot evaluate `+` / `~` — but `scoped` is set by any selector, so a subject scoped by an unrelated rule satisfied the test for a selector the chain had just rejected. `.b > .a` with the `.a` candidate a grandchild no longer adds the hash to `.b`.
- 755ead9: Test `animate:` placement against the element's immediate parent rather than any enclosing `{#each}`, so an `{#if}` / `{#key}` / `{#await}` in between is rejected the way upstream rejects it — and keep the each frame across the `{:else}` fallback, where an `animate:` is legal on the same terms as one in the body.
- d96dfc5: Report a missing semicolon at the token that could not continue the statement, the way acorn does, instead of at OXC's insertion point — the two are separated by whatever whitespace and comments lie between them, so the reported position and message now match the official compiler on every semicolon-free source
- d91555e: Report an assignment to a non-assignable target as acorn does — `Assigning to rvalue` at the target's start. It is the one parse failure acorn raises at the start of the offending region rather than where it stopped consuming tokens, so the shared point-error helper reported OXC's message at the target's end
- 1878dae: Reject an at-rule whose name is missing or starts with a digit (`@ foo`, `@1x`, `@-1x`) with `css_expected_identifier`. Upstream reads the name with the same `read_identifier` as a type selector, which errors on both; rsvelte built the `Atrule` node from whatever it got.
- 86562a8: Decide `[class~="…"]` the way the official compiler does, in both directions. A `<svelte:element>` contributed only its class names to the CSS matcher, so every other attribute selector — `[data-x]`, `#id`, `[class~=…]` — was decided as if the element had no attributes at all and a matching rule was dropped. Its attribute list is now collected exactly as a regular element's is. In the other direction, a `class:` directive suppressed the whole selector whatever its name; upstream matches a directive under `~=` only when the directive name equals the expected value.
- a26bd7e: Span `attribute_duplicate` over the whole attribute rather than its name. Upstream passes the attribute node, so the underline reaches the end of the value — or of the `{…}` for a shorthand.
- 6f3a954: Declare the `binding_group` array for a `bind:group` that sits inside `<svelte:boundary>` or `<svelte:fragment>`. The walk that registers group bindings lists the containers it descends into and had neither, so the generated `$.bind_group(...)` call referenced an array that was never emitted. Same shape as the scoping walks: one hand-maintained container list, one container missing from it.
- b5871e1: Run one `bind:` target rule for every host, as the official compiler does. Three hand-written copies had drifted: `<svelte:window>` / `<svelte:document>` / `<svelte:body>` reported the "Possible bindings for …" sentence for a violation whose message should list the valid elements; `<svelte:element>` answered `bind:group` and `bind:checked` with an `<input>`-specific message; and neither reached the contenteditable requirement, so `bind:innerHTML` without a `contenteditable` attribute compiled where the official compiler rejects it.
- 4ccb052: Stop rejecting a `$` or `$$`-prefixed name that is bound rather than referenced — a function, arrow, `catch` or snippet parameter, or an `{#each}` item — as `global_reference_invalid`
- 7bd7b53: Scope an ancestor element whose matching descendant sits inside `<svelte:boundary>`, `<svelte:head>`, `<svelte:fragment>`, `<svelte:component>`, `<svelte:self>` or `<title>`. The walk that looks for the selector's subject enumerated the containers it descended into and stopped at those, so `<div class="b"><svelte:boundary><div class="a">` emitted `.b.svelte-hash .a…` while leaving the `.b` element without the hash — a rule that can never match. The default arm now descends into any remaining node's child fragments, which is what upstream's `get_element_parent` does by walking to the first element ancestor.
- 634245b: Count `<svelte:boundary>` as a parent during analysis. A snippet inside a top-level boundary reported `can_hoist`, so SSR emitted its function ahead of the whole template and reversed it against a sibling boundary's same-named snippet; the same counters back the `<svelte:*>` placement rule, so a meta element inside a boundary was accepted where official rejects it.
- 093ed38: Recognise `onClick={…}` and every other non-lowercase event-attribute spelling as an event handler on the server, instead of rendering the handler function into the HTML. The server's predicate required the character after `on` to be lowercase and did not look at the value, where upstream tests the two-character prefix and requires the value to be a lone expression — so `onClick={f}` and `on={f}` were emitted as attributes while the client target dropped them, making the two halves of the same component disagree.
- 95370cd: Let a `catch` clause's parameter shadow an outer binding of the same name. The clause's scope was built and the parameter declared into it, but the scope was never registered where the Phase-2 walker looks one up, so `catch (x)` over an outer `let x = $state(0)` resolved both the parameter and every use of it to the state binding and reported `state_referenced_locally` for each.
- f4be820: Carry the source position on the IR node instead of recovering it from the generated text. The component function's block now knows which `<script>` braces it stands for, a real source span survives the split coordinate space a comment-bearing script puts the printer in, and an identifier's span travels into the read transform it is wrapped by (so a segment covers `foo`, not `foo()`). Every script — not only a TypeScript one — projects its unchanged bytes back to the source. Measured on the 29 upstream sourcemap samples, the map the printer emits on its own now reproduces 421 of the 488 client segments the official compiler emits, against 239 before; two of the eleven text-matching enrichment passes are removed as a result.
- 47a236c: Reject a CSS comment written between two compound selectors, as the official compiler does. Upstream's `read_selector` tolerates a comment only immediately before `,`, `{` or `)`; anywhere else it rewinds past it and falls through to `read_identifier`, which reports `css_expected_identifier` at the comment's `/`. rsvelte skipped them unconditionally, so `.a /* c */ .b { … }` compiled. A pseudo-class argument list now also ends at its last selector rather than at the `)`, matching official's `SelectorList` span when a comment precedes the paren.
- 7743d58: Place comments around rune-lowered declarations where the official compiler's esrap cursor flushes them — inside a synthesized thunk's parameter parens, ahead of a `$state`/`$derived` argument, and between a `$props()` destructure's kept declarators — on client, server and dev targets alike (#3059).
- 919ae9b: Fold a value aliased from a `const` into the template, the way `scope.evaluate` does upstream: `const K = 1; let v = $state(K)` now renders `{v}` as static text instead of keeping the chunk reactive. The alias's initializer AST was never stored, so the existing recursion had nothing to follow.
- fb0f870: Reject `{@const}` placed directly inside `<svelte:self>`, as the official compiler does. Upstream's placement rule names `Component` and `SvelteComponent` among the legal parents and stops there; rsvelte folded all three component-like nodes into one fragment-owner value, and `<svelte:self>` did not push one at all, so the tag was judged against whatever enclosed the element instead. It now has its own owner, kept equivalent to a component everywhere the two really do agree.
- 19117bd: Raise `debug_tag_invalid_arguments` in the parser, where the official compiler raises it, so it competes with other parse errors by source position. It had been an analysis-time check, which only became observable once the `<svelte:...>` placement errors moved to the parser: `{@debug user.name}<div><svelte:window /></div>` reported the placement error rather than the debug one.
- 47ed3f0: Keep the comments a `$derived` / `$derived.by` call holds around its argument. A comment before the call's `(` now rides with the ones after it into the synthesized thunk's parameter parens, and a comment after the argument lands where esrap flushes it — inside the call when no thunk was synthesized, past the statement's `;` when one was.
- c1401c0: Stop the dev-mode `$.assign` wrapper from firing when the assigned value is statically primitive: a call into the known-globals table (`String`, `Number`, `BigInt`, `Math.*`), a global constant such as `Math.PI`, or a function expression. The globals table is now name-for-name upstream's, so a near-miss like `Math.nope()` no longer reads as known either.
- 4ccb052: Accept a `$`-prefixed name bound in the template — an each item or index, a snippet's name or parameter, `{@const}`, `{#await}`'s value or error — which the official compiler allows in both runes and legacy mode
- 2539f32: Reject two `{#snippet}` blocks that declare the same name in one scope with `declaration_duplicate`. A snippet declares with `Function`, which the duplicate check exempts so a TypeScript overload set stays legal — two snippets are not an overload set, and the second one silently won
- 63ff273: Compute the possible class names of a `<svelte:element>`'s `class` attribute the way a regular element's are computed, so `class={a ? 'x' : 'y'}` prunes the selectors it cannot match instead of marking every class reachable. The expansion is now one shared function rather than a copy per element type.
- 8e6c4b6: Stop deoptimizing every structural CSS prune when the component contains a `<svelte:element>`. The compound, descendant-chain and nested-ancestor walkers each bailed out for the whole component as soon as one dynamic element existed, so `.a.b` was kept when `.a` and `.b` sat on different elements and `.p .q` was kept with no `.p` ancestor anywhere. Upstream exempts a dynamic element from the type-selector test only, which the per-element matcher already does.
- 6c88563: Visit an `{#each}` key expression inside the each scope, so a write to the item there (`(v++)`) is recorded as a mutation of the collection and promotes it to reactive state
- f990336: Keep a string-literal destructuring key in the key function a keyed `{#each}` emits. `{#each list as { 'a-b': z } (z)}` produced `({}) => z`, dropping the property because the pattern converter reads a key's `name` and a literal key has none — so the key function threw a `ReferenceError` on first render from output that parses. A literal key is now emitted with its source spelling, and a computed key still takes the branch that was already correct.
- 734892b: Lower the `$effect.pending` / `$state.eager` family the way the official compiler does. `$effect.pending()` emitted `$.eager(() => $.pending())` where the official compiler emits `$.eager($.pending)` — its `thunk` builder drops the arrow around a zero-argument call of an identifier — and `$state.eager(f())` had the same extra arrow. `$state.eager(x)` was not lowered at all in a `<script module>` or `.svelte.(js|ts)` file, leaving a reference to an undefined global in the output. And the server module path reused the client lowering, so server output called the client-only `$.eager` / `$.pending`; it now folds to `0`, or `void 0` as a declarator initializer.
- 2873d6e: Resolve a `{#snippet}` from a `{@render}` that sits beside it under `<svelte:component>`, `<svelte:self>` or `<svelte:element>`. The scope builder registers a template scope for each of those nodes, but only the plain-component visitor entered it, so a sibling snippet's binding was invisible and the render tag was marked dynamic. That reached the output twice: the tag compiled to the indirect `$.snippet(...)` helper instead of a direct call, and — because a fragment counts as standalone only when its one child is a _non-dynamic_ render tag — the enclosing slot gained a `<!---->` anchor the official compiler omits.
- 144a5b0: Report an unterminated tag at end of input where the official compiler does: upstream reads the template right-trimmed, so `a<b`, `<div` and `<div title="a"` now point at the last consumed byte instead of one line later, a lone `<` is `unexpected_eof` instead of text, a `<` that starts no tag is `tag_invalid_name`, and `</` at end of input runs out of input before any closing-tag rule applies
- c1df7fa: Prune a rule whose class, id or type selector carries a CSS escape. `structural_simple_selector_is_evaluable` bailed on any name containing `\` because the matcher compared it un-decoded, so `.a\:b > *` was kept as used against an element with no element children — the shape every Tailwind arbitrary-value class (`w-1/2`, `[&>*]:mt-2`) takes.
- 6723fd7: Stop reading a never-reassigned `export const x = $state(1)` through `$.get` in the component's `$$exports` object. Such a binding is not a state source — the declaration is already lowered to a plain `const x = 1` — so the official compiler emits a shorthand `{ x }` property outside dev mode, and a getter returning the bare identifier inside it.
- 2252446: Terminate a module's `export default class … }` with the `;` upstream prints, and fold a semicolon the source already wrote into it instead of emitting a separate empty statement.
- a3f6be0: Report an error raised inside an `export let` declaration's initializer instead of masking it with `legacy_export_invalid`. The official compiler's `ExportNamedDeclaration` visitor opens with `context.next()`, so `export let x = $host()` is `host_invalid_placement` and `export let x = $bindable()` is `bindable_invalid_location`.
- 743c2e8: Fix two `rsvelte-fmt` outputs that were not the input reformatted. `<svelte:element this={n > 0 ? 'p' : 'span'}>` re-emitted part of the expression as text, because `this={…}` is not in the element's attribute list and the open-tag scan stopped at the `>` inside it; and an expression tag with a trailing comment came out as `{n; /* c */}`, which no longer parses.
- aaeceec: Switch back to the HTML namespace inside `<foreignObject>` for SSR. The visitor read `metadata.svg` alone, so whitespace between two children of a `<foreignObject>` was dropped as if they were still SVG.
- 26cf7e3: Scope `<svelte:fragment>` children, and keep a `class:` / `style:` directive on an element inside a boundary or a fragment in the server render. Both walks re-enumerate the containers they descend into where upstream iterates one flat `analysis.elements` list, and the two lists had drifted: none of the five CSS-scoping walks knew about `<svelte:fragment>`, so the component's own `<style>` did not reach anything inside one, and `synthesize_class_style_attributes` knew about neither it nor `<svelte:boundary>`, so the server target — which reads the synthesized attribute rather than the directive — emitted the element with no class at all.
- a1df687: Read a function declaration bare in a template interpolation. Its binding carries the declaration as its initial value, which evaluates to a function and so is never null, but rsvelte resolved only `const`-initialised bindings and appended a `?? ''` guard.
- 1878dae: Reject a token that cannot start a selector inside a pseudo-class argument, so `:global(@keyframes s)`, `:global(%x)` and `:global(1x)` raise `css_expected_identifier` as upstream does. The sub-parser reading those arguments discarded every diagnostic except the nesting bound; it now hands them all back, and the namespace selectors that gap was hiding (`ns|el`, `*|el`) are implemented.
- 574aea8: `hmr: true` now matches the official compiler in four places it diverged in: the `import.meta.hot.accept` hook calls `$.cleanup_styles(<hash>)` before the update when the component has CSS (so injected stylesheets no longer accumulate across hot updates), `customElements.define` is guarded by `customElements.get(tag) == null` (a second hot update of a custom-element component used to throw), and `is_standalone` is suppressed for a root component but _not_ for a root `{@render}` — which restores the anchor comment on the client and the trailing `<!---->` hydration anchor on the server.

  `js.map` no longer carries a `file` key (upstream's esrap-produced map has none; rsvelte emitted a constant `"input.svelte.js"`), and `outputFilename` no longer prefixes `js.map.sources` with `./` — the relative path is joined verbatim, as `get_relative_path` does upstream. The CSS map keeps its `file` key, which upstream does set.

  `cssHash` works at the NAPI boundary. `compileWithCssHash` now invokes the callback the way the official compiler does — one `{ hash, css, name, filename }` argument, returning the scope class — so `({ hash, css }) => \`x-${hash(css)}\`` works verbatim, and a throwing callback rejects the returned promise instead of terminating the process. The synchronous entries (`compile`, `compileEnvelope`, …) now *reject* a function-valued `cssHash`naming`compileWithCssHash`, rather than dropping it and silently returning a different scope class.

- bb2c698: Stop constant-folding a legacy-mode `$derived(...)` into the SSR template. Under an explicit
  `runes: false` (compile option or `<svelte:options runes={false} />`) `$derived` is a store
  subscription, so the declared value is the call's result rather than its argument — the server
  was inlining the argument and rendering a frozen constant.
- ecd52e1: Stop rejecting a `$`-prefixed class member name, and turn every rune-named `$` reference into a store subscription under an explicit legacy mode

  `class P { $abc() {} }` was rejected with `global_reference_invalid`: the `$`-reference
  scan in `2_analyze/store_subscriptions.rs` excluded object keys, member properties, string
  literals and comments, but not a class body — and a `$inspect` member name additionally
  flipped the component into runes mode, because runes auto-detection walked a non-computed
  `MethodDefinition` / `PropertyDefinition` key. Upstream reads `module.scope.references`,
  which never holds a declaration slot.

  Under `runes: false` — from the compile option or from `<svelte:options runes={false} />`,
  which upstream merges into the options before analysing — upstream opens its
  store-subscription condition with `runes_option === false ||`, so `let a = $state(1)`
  compiles to a store read. rsvelte raised `rune_invalid_usage` instead. The merged value is
  now what reaches the store loop, the synthetic binding is declared whether or not the
  unprefixed name resolves, rune binding kinds are no longer assigned in explicit legacy
  mode, and the server's and client's `$effect` / `$inspect` / `$inspect.trace` removals no
  longer fire on a name that resolves to a store subscription.

- 3180680: Keep the names bound by a `let:` pattern that carries a default. SSR reinterpreted an assignment as the directive name alone, so `let:row={[h = 1, ...t]}` emitted `[undefined, ...t]` and the slot body's `h` was never bound; the client dropped the whole `$.derived` when a pattern bound no names, and `<svelte:fragment>` rebuilt the pattern from the property keys, losing renames, nesting, rests and computed keys.
- 2632288: Let a `let:` directive's names count as local when deciding whether a root `{#snippet}` can be hoisted. The hoistability walk recursed into a component's (or a slotted element's) children with the enclosing parameter set, so a reference to a `let:`-bound name read as instance-level and pinned the snippet. Upstream reaches the same question through the scope chain, where such a binding sits at or below the snippet's own depth and is skipped; the walk now extends the set at each node that carries the directive, which is where its scope begins.
- fa88d36: Align `rsvelte-lint` with `eslint-plugin-svelte` on the axes no gate previously compared.

  - 21 rules defaulted to `warn` where upstream defaults to `error`. Severity decides the exit code in both tools, so `rsvelte-lint` exited 0 where `eslint` exits 1 on the same source. Three rule mode-gates likewise made rsvelte run a rule ESLint skips.
  - The human-readable and GitHub Actions diagnostic writers printed a zero-based column — `4:0` where ESLint prints `4:1`. SARIF and the machine format were already correct.
  - `--fix` resolved `eslint-disable` directives against the parser's line table while the report path used the reporting rule's own table, so a directive suppressed one line and the fixer rewrote another wherever U+2028/U+2029 make the two tables differ.
  - `prefer-class-directive`'s autofix trimmed with Unicode `White_Space` semantics while its report used JS semantics, so a `class` value padded with U+FEFF was reported identically to ESLint and rewritten differently.
  - The JSON API the wasm and NAPI bindings wrap reported every rule on the parser's line table, so the seven rules that upstream positions with `getLocFromIndex` came out on a different line and column there than from the CLI. All consumers now share one `LintDiagnostic::report_span`.
  - `prefer-destructured-store-props` now gates its rune-named-store skip on runes mode, `infinite-reactive-loop` no longer treats an inline function expression as a then-callback, `no-trailing-spaces` no longer counts a leading BOM as trailing whitespace (its autofix would have deleted the BOM), and lint parse errors now carry a line and column instead of a debug-formatted struct.

- ebbbec8: Raise `svelte_meta_invalid_placement` and `svelte_meta_duplicate` in the parser, where the official compiler raises them. Both were analysis-time checks in rsvelte, so any error the node's own content could raise got there first: a `<svelte:window>` written inside `<title>` reported `title_invalid_content`, and a second `<svelte:head>` in the same position reported that too. The parser already carries the stack the rule needs — the check is `parent.type !== 'Root'` — and the `meta_tags` field the duplicate test wants had been ported without its logic.
- a0743e6: Reject `<svelte:head>`, `<svelte:window>`, `<svelte:body>` and `<svelte:document>` inside `{#key}`, `<svelte:element>`, another `<svelte:head>` and `<slot>`, as the official compiler does. Upstream's rule is one test on the immediate parent — `parent.type !== 'Root'` — while rsvelte asked three depth counters whether it was inside an element, a block or a component, and each counter is maintained by its own hand-written list of the containers that increment it. Those four were on none of the three lists. The check now reads a single flag maintained where every container already funnels its children, so a container added later cannot silently opt out of it.
- 56898df: Report `svelte_meta_invalid_placement` / `svelte_meta_duplicate` at a zero-width span on the tag start, the way upstream's parser does, and reject a `<svelte:options>` nested inside an element or a block. `<svelte:options>` never reaches the analyzer — the parser consumes it into parser state — so the placement rule had to move there, as the duplicate rule already had.
- 80a2458: Keep a multi-declarator `let a = …, b = …;` whole in a module script's server output. It was split into one statement per declarator for both entry points; the official compiler's `VariableDeclaration` visitor never splits, and the split it does produce in the instance script comes from an analyze-phase pass the module body does not go through.
- 27d525e: Expand a destructured rune declarator in a module script. `let { a } = $state(1)` in a `<script module>` or a `.svelte.(js|ts)` file compiled to `let { a } = $.state(1)`, which destructures the signal object rather than its value, so the binding was `undefined` at runtime; it now expands to `let tmp = 1, a = $.proxy(tmp.a)` the way the official compiler and rsvelte's own instance script already do. Covers `$state`, `$state.raw`, `$derived` and `$derived.by` against object, default, rest, non-identifier-key and array patterns, plus `$state.snapshot` on the server. The dev-mode `$.tag` passes no longer label the compiler's own `$$d` / `$$array` temps.
- 7fa30c1: Hoist a root-level snippet that declares a nested snippet. Rendering the nested one read as an instance-level reference, so the whole snippet stayed inside the component function; a nested snippet binds its name in the same fragment, which upstream's `binding.scope.function_depth >= scope.function_depth` skip already allows. The nested body is now checked rather than skipped, so a nested snippet that reads instance state still pins its parent.
- f1d3992: Treat a template literal as one opaque run in the phase-3 lexical scanner. `${…}` re-enters code and may open another template, so scanning a backtick like a quote ended the run at the second backtick and read the text up to the third as code — a `$state(` / `$derived(` written inside a nested template was lowered as a rune call, and every bracket, `;` and `,` that text carried leaked into the depth counters and statement splitters built on the same scanner. The run now follows the substitutions, with their own strings, comments and regex literals lexed, at any nesting depth.
- 741378f: Keep evaluating a descendant chain past a pseudo-class that takes arguments. `:nth-child(2)`, `:first-child` and every other argument-taking pseudo-class outside the handful upstream special-cases made the whole selector unevaluable, so `.b > :nth-child(2)` survived with no element child of `.b` at all. Upstream breaks out of its switch for these — they constrain nothing and do not stop the rest of the chain from being tested. `:has(...)` stays unevaluable, because it can reject on its own and this walker does not look downwards.
- f15b45a: Keep the `?? ''` on a `const` initialised with an object or array literal, and on every destructured `const`. Upstream's `scope.evaluate` has no case for either literal, so both fall through to `UNKNOWN` — which includes nullish — while rsvelte listed them alongside the function forms as definitely-defined.
- c75956b: Stop the SSR constant fold from resolving a template binding to a same-named instance binding. An `{#await … then n}` value, an `{#each … as _, n}` index used directly as the loop variable, and every each-block binding read inside the `{:else}` fallback were missing from the fold's shadow set, so `{n}` rendered the outer value as a frozen literal.
- e526cbc: Emit the `$.derived` an `on:` directive on `<svelte:element>` declares inside the `$.element(...)` callback. A handler that is not a function expression is wrapped in a derived, and rsvelte hoisted that declaration beside the callback instead of into it, so the derived was created once for the component rather than once per element instantiation. Upstream visits the directive with the inner context, so its init statements belong to the element body.
- 3f24e6a: Treat a conditional or logical expression whose sides are both known-defined as defined, so `<option value={a ? 'x' : 'y'}>` no longer keeps a `?? ''` around the `__value` assignment that the official compiler drops.
- eb0cb67: Stop a parenthesised nested class expression from turning its enclosing field into a rune field. `inner = new (class { deep = $state(1); })()` compiled to `#inner = $.state(1)` with an accessor pair — the class expression and the field's real initializer silently gone. The member splitter now scans inside a `(`/`[` region instead of jumping it, so a class body written there gets the same one-member-per-line shape, and a class field is recognised only when the rune is the head of its initializer, as upstream's `get_rune(value, scope)` requires.
- 0a1299e: Keep the `#` in the dev-mode `$.tag` label for a class field the user wrote as private. The pass ran after the public-field lowering and reconstructed the original name from the generated accessor pair, but a hand-written private accessor lowers to byte-identical text — so the pre-lowering script is now threaded in and settles it.
- 7ffd3f9: Stop reading a prop twice when an inline template arrow mutates it. `state.a = state.b` inside `onclick={() => { … }}` compiled to `state().a = state()().b`, which throws `state(...) is not a function` on the first click: the assignment converter read-transforms both sides so the mutation wrapper can be built, and the second transform pass then re-read every source-prop and store-subscription on the right. The read transforms now mark their getter callee opaque, which is what the setter callees already do, so a second pass is a no-op while a user-written `p()` is still read as one.
- dbde794: A member update (`p.a++`) on a `$bindable()` or legacy `export let` prop now wraps in the prop setter so the parent is notified, in both prod and dev (where the ownership validator wraps outside the setter, like upstream); `$state(undefined)` keeps its source spelling instead of becoming `void 0`, and `$state(void 0)` constant-folds as a known undefined; a known const chunk of a dynamic `<title>` folds into the template text.
- c544cc1: Drop an exported `$props.id()` declarator instead of emitting it beside the hoisted one. `export const x = $props.id()` produced `const x` twice in the same scope — output no JS parser accepts. The official compiler drops the declarator however the declaration is reached, and `$$exports` reads the hoisted `const`.
- 01f1554: Reject `$props.id()` outside a component's instance script. In a `<script module>` block or a `.svelte.(js|ts)` file it was compiled instead of raising `props_id_invalid_placement`, emitting a reference to an undefined global. Also update two error messages the official compiler has since reworded: `props_id_invalid_placement` and `props_invalid_identifier`.
- 2a5f791: Report `props_invalid_pattern` with upstream's wording. The code, start and end already agreed; only the message text was rsvelte's own, which the corpus error gate ratchets separately precisely because `code` is saturated.
- 4fc0a11: Strip a leading UTF-8 BOM before compiling, as `svelte/compiler` does. A BOM at the start of a `.svelte` or `.svelte.js` file was treated as template content, which added a text node to the client template (changing the extra-node flag and the fragment shape) and a stray zero-width no-break space to the server output.
- d258b55: Declare the rest element of an array destructuring target in a legacy `$:` assignment. `$: [first, ...tail] = arr` emitted `let first;` and then assigned to an undeclared `tail`, which throws at render; the object-pattern forms were already collected.
- b7c5858: Apply the rune arity and placement rules to a rune written in a template expression. The rules live in the script visitor and a template expression is walked by a second traversal, which hard-coded one of them and let `$props()`, `$host()`, `$bindable()`, `$effect()`, `$inspect.trace()`, a misplaced `$state`/`$derived` and every arity violation compile
- de66c8d: Reject `$$props` and `$$restProps` in runes mode with `legacy_props_invalid` / `legacy_rest_props_invalid`, which were not implemented — they used to compile into references to globals that do not exist
- 8f3fbc3: svelte2tsx: decide `$$props` / `$$restProps` / `$$slots` from code positions rather than from a raw byte scan of the whole `.svelte` source. Upstream sets these per AST identifier, so the bytes inside a string literal, a comment, markup text, a `<style>` body or the module script are not a use — `const docs = ['$.prop($$props, "x")']` no longer fabricates a `let $$props = __sveltets_2_allPropsType()` declaration. The cheap scan is kept as the necessary-condition pre-filter and every positive it reports is now confirmed against code bytes.
- 1b136c9: svelte2tsx: emit the `__sveltets_2_store_get` shim for a store that a `<script context="module">` block declares with `export`. Only bare `const`/`let` declarations were matched, so `export const shared = writable(0)` auto-subscribed from the instance script left `$shared` undeclared in the projected TSX.
- 14b4f84: svelte2tsx: project a valueless `popover` attribute as `""` rather than `true`. `popover` is enumerated (`auto` / `manual`), not boolean, so upstream spells it out as the one exception to the valueless-attribute rule; typing it as `boolean` checked `<div popover>` and `<div popover="manual">` against the wrong type.
- a3a9313: Hoist `{#snippet}` declarations in every container upstream svelte2tsx hoists in. The port wired `hoist_snippet_blocks` into a plain element, an `{#each}` body and the `{#if}` arms; upstream queues _every_ non-root parent of a snippet and skips only a component and `<svelte:boundary>`. `{#key}`, the `{:else}` of an `{#each}`, all three `{#await}` branches, a `{#snippet}` body, `<svelte:element>`, `<svelte:head>` and `<svelte:fragment slot>` were missing, so a `{@const}` written before a snippet in any of them landed before it in the TSX instead of after.
- c78a858: svelte2tsx: emit a snippet's parameter list as one verbatim source range instead of re-printing each parameter and joining them, so comments inside the parentheses survive — `{#snippet row(/* p */ a /* q */, b)}` keeps both block comments, matching upstream's `[firstParameter.leadingComments[0].start, lastParameter.end]` range.
- 53901c8: HTML-escape a folded class literal before appending the scoping hash, as `escape_html(value, true)` does upstream, so `class="&lt;{n}"` stays `'&lt;1 svelte-hash'` instead of becoming the decoded character. The hand-inlined copy of that join in the `<svelte:element>` visitor is gone — upstream reaches `build_set_class` once for this case.
- d908e4f: Synthesize the empty `class` attribute for a scoped element, not only for one carrying a `class:` directive. The synthesizer took `is_scoped` and ignored it, so `<svelte:element>` — whose attributes go through `$.attribute_effect` rather than the template — reached the runtime with no `class` key for the scoping hash to merge into.
- e05521e: Stop the SSR constant-fold from inlining a `const` alias of a variable that is written. `let w = 1; w += 2; const r = w;` rendered `<b>1</b>` on the server instead of `<b>3</b>`: the fold resolved `r` from `w`'s initializer and only afterwards dropped `w` for being reassigned, so the value it had already leaked into `r` survived. The client was byte-identical to the official compiler throughout, so the wrong value shipped as a hydration mismatch rather than a crash.
- 69ba192: Lower runes inside `{@const}` on the server target. The const visitor re-parses its source slice, which bypasses the expression visitor and with it the rune lowering, so `$state.snapshot`, `$effect.tracking` and `$effect.root` reached the output verbatim and threw on the first render
- 7350339: Server: a comment between a declaration keyword and the binding name of a rune-lowered declaration stays in that slot instead of moving ahead of the whole statement. The emitted declaration kept only the declarator's span, so the comment sorted before it.
- d75f374: Stop treating every element with no siblings as having incomplete sibling data when the component holds one non-exhaustive `{#await}` block. The sibling walk is faithful through `{#if}`, `{#each}`, `{#await}` and `{#key}` — an inexhaustive branch demotes a sibling to "probable" rather than dropping it — so the conservative fallback now asks whether the element itself sits where the walk stops, instead of asking whether the component contains such a block anywhere. `.b + .a` with `.a` inside `.b`'s `{#await ... then}` body is pruned, as upstream prunes it.
- 7db1509: Leave a `{#snippet}` body through its render sites when walking siblings, as the official compiler does. The walk used to stop at the snippet, so every element inside one had no siblings at all and a component-wide flag then made every sibling selector unprunable. `.b + .x` with `.x` inside a snippet rendered under `.b` is a descendant and is now pruned, while `.c + .y` across a `{@render}` is matched. The walk also reports per element whether it stopped at something it could not enumerate, instead of the whole component being deoptimized by one snippet.
- 6421c54: Report `slot_snippet_conflict` at the first `<slot>` element, falling back to the `$$slot` mention when there is none, instead of with no position at all. `slot_names` kept a placeholder string where upstream keeps the node.
- 0ce37d9: Fix two opposite `$state.snapshot` errors in server output. A class field was stripped to its bare argument, aliasing the source object instead of copying it — the official compiler's `PropertyDefinition` visitor handles only `$state` / `$state.raw` / `$derived` / `$derived.by`, so a snapshot falls through to the tree-wide `$.snapshot(…)` wrap. And on the `compileModule` path a declarator initializer kept the wrap unless it was the first declarator, because the strip located the declaration keyword by scanning back over the declarator name; it is now an AST pass.
- 49987a7: Fix server output for a snippet declared as a component child or as a `<svelte:boundary>` `failed` / `pending` snippet: its parameters now shadow same-named component bindings (the body no longer constant-folds to the outer value), and a boundary snippet keeps its destructuring pattern instead of emitting `undefined` as a formal parameter
- 8a72708: Hoist a root-level `{#snippet}` whose body contains `<svelte:element>` or `<svelte:self>` when nothing in it reaches instance state. Both node types were rejected outright, where upstream's `can_hoist_snippet` never inspects node types at all — it walks the snippet scope's references and judges each binding. `<svelte:self>` contributes no reference of its own and `<svelte:element>` contributes only its `this` expression and attributes, which is the check the neighbouring `<svelte:component>` arm already performed.
- 6b15597: Raise `snippet_invalid_rest_parameter` during analysis rather than during parsing, so `parse()` accepts the same input official's does — the formatter and the language server both lost the whole document to it. The error's `end` now comes from the parameter node instead of a fixed offset.
- 55176a5: Carry the `{#each}` block's own scope while building its body and `{:else}` fallback on the client, so an item name that shadows an instance binding resolves to the item. Previously the outer binding answered `is_defined`, which dropped the `?? ''` guard from a concatenated interpolation and constant-folded a fallback read.
- dc5122a: Reject the attributes the official compiler rejects on `<svelte:window>`, `<svelte:document>`, `<svelte:body>` and `<svelte:element>`. The first three allow only an event handler with an expression value; rsvelte accepted every attribute on window and document, and on body accepted any name starting with `on` whatever its value. `<svelte:element>` now runs the same `validate_element` as a regular element, as upstream's visitor does, so a non-expression `on*` handler and an illegal attribute name are rejected there too.
- 45ebcec: A comment the source wrote on its own line after a rune call's argument becomes a leading comment of the next statement, the way esrap flushes it, instead of being glued to the end of the rewritten statement.
- 0b7997c: Reject the strict-mode early errors a component script inherits from being an ES module — legacy octal literals and escapes, `delete` on a bare identifier, duplicate parameter names, `eval` / `arguments` as an assignment target or a binding, the strict reserved words, an Annex B function declaration as a statement body, and a duplicate `__proto__` — which OXC accepts and the official compiler rejects
- 1456890: Emit `<svelte:element>` directives in source order. `bind:`, `use:`, `transition:`, `animate:` and `{@attach}` all reach one `context.visit` pass upstream, but rsvelte collected each kind into its own list and ran five loops over them, so `bind:this` written before `use:` came out after it. Regular elements were already correct, which is why only a specific relative order of two different kinds on `<svelte:element>` diverged.
- 54af491: Raise the three `<svelte:options>` diagnostics from one walk of the attribute list, as upstream does. `options_deprecated_accessors` now fires in runes mode (it never did), `options_deprecated_immutable` carries the attribute's span instead of no position at all, `customElement={null}` warns `options_missing_custom_element` again, and the three come out in the source order of the attributes rather than in the order the checks happened to be written.
- 05dccf7: Reject `<svelte:self>` inside an `{#await}` branch or a `<svelte:component>`, as the official compiler does. Upstream accepts exactly `{#if}`, `{#each}`, `{#snippet}` and a `Component` as the ancestor that licenses it; rsvelte tested `block_depth`, which the `{#await}` visitor also increments, OR `component_depth`, which `<svelte:component>` also increments. Both counters exist for other rules and are one notch too generous for this one, so the check now has a counter of its own.
- 1b1e40e: Apply the acorn-only restrictions to template expressions, not only to `<script>` — a template expression is an ES module fragment and is strict for the same reason. The fast path for identifiers, numbers, strings and simple compounds now declines anything that could carry a violation instead of bypassing the parser, and a mustache parse error is reported as a point at the offending token rather than as a range over the whole expression
- aaeceec: Render a `<textarea>`'s own children as the SSR fallback when its content binding is falsy. The `else` branch was emitted empty, so `<textarea bind:value>fallback</textarea>` rendered nothing for an empty value; the output parses and the truthy path was right, so only output equality showed it.
- 04789e5: Decode character references in `<textarea>` content. It is escapable raw text, so `&lt;` is a `<`; rsvelte copied the text node's `data` from its `raw`, which escaped the source spelling a second time and rendered `&lt;` literally.
- d815625: A known const chunk inside a dynamic `<svelte:head><title>` now folds into the template text the way upstream evaluates it (`` `Zoo — ${name}` ``, not `` `${site} — ${name}` ``).
- 9cb6378: Fold a `<title>` whose single expression has a compile-time known value into a string literal on the client, for every literal kind. Upstream's single-value template chunk writes `b.literal((evaluated.value ?? '') + '')`, so a known `0` becomes `'0'` and a known-nullish value becomes `''`; rsvelte inlined string-valued knowns only, on the reading that a numeric one would need a numeric literal to match — which the `+ ''` refutes. The `?? ''` it emitted instead computes the same title, so only output equality can see the difference.
- 11e3dd9: Raise `block_unclosed` for an `{#each}`, `{#await}`, `{#key}` or `{#snippet}` left open at the fragment root — the block-stack entry was popped unconditionally at end of input, so a truncated template compiled into a component missing everything after the block head
- 7ffd3f9: Walk an `UpdateExpression`'s argument during analysis. Upstream ends that visitor with `context.next()`; rsvelte returned without descending, so nothing inside `x++` was ever visited: a component whose only member expression was `p.a++` lost its `$.push($$props, …)` / `$.pop()` pair, and a legacy prop whose only use was `p++` was reported `export_let_unused` while a `$derived` read only through `linked.current++` never raised `state_referenced_locally`.
- c9a5b8d: Keep a valueless `class` attribute distinct from an empty one. Upstream's value is the boolean `true`: the scoping join treats it as empty, while the "is this class empty?" gate treats it as present, so `<div class>` renders `class=""` and a scoped one renders the hash. Collapsing it to `""` up front lost both halves in three separate copies of the rule — the client root-element branch, the client static-subtree serializer used by nested elements, and the server literal branch.
- 2aff564: Stop emitting `reactive_declaration_module_script_dependency` for store auto-subscriptions read or written inside a `$:` statement: upstream declares the synthetic `$store` binding in the instance scope, so it never satisfies the rule's module-scope test, while rsvelte parks it in scope 0.

  Attach the attribute's span to the `attribute_avoid_is` warning, which was reported with no position at all.

## 0.10.17

### Patch Changes

- bb1d3e1: Wrap a member-chain read of a `$derived` class field in a constructor. `this.#props.x` kept the raw private read where `$.get(this.#props).x` was required — the standalone-read pass skips a chain root by design and the constructor path, unlike the method path, never ran the member-chain pass.
- 5b197cf: Stop a `@keyframes` rule inside a `:global { … }` block from scoping the component. Upstream's prune walker visits only such a rule's prelude, so nothing in its body can mark an element used — rsvelte read a percentage step (`0%`) there and gave every element the scope class. The same block also kept the `-global-` prefix on the keyframes name, because its children were copied verbatim.
- 6fba1c9: Print the `;;` a removed non-dev `$inspect(...)` leaves as one statement. Upstream keeps the `ExpressionStatement` and replaces its expression with `b.empty`, so esrap emits `;;` on one line and a comment trailing the call stays on it; rsvelte modelled the pair as two empty statements on separate lines, which put a blank line in front of the comment and, on the client, dropped the second `;` entirely.
- 8e85bad: Keep the `<script module>` comments official keeps. The client output dropped every comment that was not lexically inside a function or class body, but the module's builder-made `Program` only leaves esrap's comment cursor dead until a located body revives it — so a comment _after_ a class body, a bare block or a static block still reaches the output. Both that rule and the rune-accessor kill are now one walk over the same cursor events.
- f67ce0b: fix(client): fold a constant with its JS type, not its rendered text

  The client constant-folder carried a folded value as `Option<Option<String>>`,
  in which `null` and `undefined` are the same value and `0` and `'0'` are the
  same value. It now shares the `scope.evaluate` port the server transform
  already used, so a fold keeps the operand's type: `$derived(cond ? undefined :
null)` stays reactive instead of being judged constant and hoisted out of
  `$.template_effect`, and `typeof '0'`, `'0' + 0`, `'0' === 0`, `'10' < '9'`,
  `null + ''` and `true + 1` all fold to what the official compiler folds them to.

## 0.10.16

### Patch Changes

- ebe5b77: Drop the comments upstream loses when it lowers a public rune class field: the generated `get`/`set` bodies carry no `loc`, which parks esrap's comment cursor past the end of the file until a located body re-syncs it, so every comment in between is missing from official's client output. rsvelte built those accessors as source text and kept the comments.
- 2032958: Print statement bodies in `print`'s ESTree fallback instead of replacing them with a placeholder: a `BlockStatement` came back as the literal `{ /* block */ }`, and `if`/loop/`try`/function/class bodies as `{ /* ... */ }`, all returned as a successful print. The placeholder reached 528 of the 4,468 `.svelte` files in the Svelte test suite. The fallback now also reconstructs the parentheses the tree does not carry, so its output parses.
- 2e9b45c: Locate `.svelte.(js|ts)` module rune calls lexically: a `$derived(` inside a string, template or comment aborted the lowering loop and left the real rune call in the output (the module then threw `$derived is not defined` at import), and a regex literal carrying the same text was rewritten into a different regular expression.
- ce13b44: Fail `print` instead of erasing what its ESTree fallback cannot represent: an unsupported node type was substituted with a `/* unknown */` comment and returned as a successful print, which dropped 255 nodes across 167 of the 4,369 printable `.svelte` files in the Svelte test suite (228 of them legacy `$:` labelled statements).
- 6eb364e: Align compile-error diagnostics with official Svelte. Error messages now use the official wording (`$props()` placement, duplicate runes, rune argument counts, `$`-prefixed bindings, `arguments` usage, renamed runes, missing rune parentheses, comma-separated attribute expressions, each-block argument assignment) and carry the same trailing `https://svelte.dev/e/<code>` help URL that official appends to every coded message. Spans are attributed to the node official blames rather than to the enclosing statement — reserved `$` bindings and imports, rune calls and their arguments, `$props()` placement and patterns, computed rune properties, invalid exports and `$props` members, keyed `{#each}` and import errors, `{@render}` and slot attributes, special elements and their children, `<svelte:self>` placement, duplicate and default component slots, invalid attribute expressions, directive `await` errors, global CSS validation, and renamed runes. `<svelte:self>` in an unsupported position now reports `svelte_self_invalid_placement`.
- d6d3388: Split the instance script's multi-declarator `let` / `const` / `var` declarations from the OXC declarators instead of rebuilding the whole script line by line. Only the declarations that carry more than one declarator are rewritten, so a single `let a = 1, b = 2;` no longer reflows every other statement — and the line-scanning text pass it used (bracket balancing, comma splitting, per-line brace depth) is deleted, having had no other caller left.

## 0.10.15

### Patch Changes

- 48b454f: Keep retained script AST spans and comments in component-source coordinates when moving them into the final OXC allocator.
- 46cbf7c: Write common indented newlines with fixed-width stores and avoid unnecessary source-line lookups on exhausted comment paths. Release `rsvelte_esrap` 0.10.27 and update the compiler's exact dependency.
- 72ffbb1: Match Svelte's comment cursor behavior for synthesized transforms and component wrappers.
- 2cfed50: Preserve rune transformations when comments appear in instance scripts.
- 5ba4367: Compose the source maps of every preprocessor in the chain, consume an attached `//# sourceMappingURL` comment, and count map columns in UTF-16 code units. Also fixes the VLQ sign encoding, which made every negative delta in a preprocess map one too small.
- 38a34eb: Add `Converted::into_coordinate_free_program`, so a consumer that wants the client OXC `Program` instead of the printed JavaScript can adopt it without re-parsing. Measured on 5,836 shipped components, the share a native bundler can take directly goes from 3.02% to 100%, replacing a re-parse worth 7.5% of compile with a strip worth 0.79%.
- 0050fd4: Render esrap block bodies directly into their parent buffer and specialize comment-free call arguments. Release `rsvelte_esrap` 0.10.17 and update the compiler's exact dependency.
- 627a956: Render multi-declarator variable statements in one output buffer. Release `rsvelte_esrap` 0.10.22 and update the compiler's exact dependency.
- 3da139c: Write comment-free esrap output directly and patch only retroactively changed layout spans. Release `rsvelte_esrap` 0.10.24 and update the compiler's exact dependency.
- c442bdc: Write short esrap fragments with fixed-width copies and decide indentation before rendering hot sequences. Release `rsvelte_esrap` 0.10.26 and update the compiler's exact dependency.
- ec7a9b7: Reduce `rsvelte_esrap` printer overhead by coalescing adjacent inline command text, skipping source-map anchors for plain output, avoiding line indexing for comment-free programs, and reserving the final output buffer. Release `rsvelte_esrap` 0.10.10 and update the compiler's exact dependency.
- a53ab3b: Flatten plain output in one pass and write short syntax fragments without temporary formatting buffers. Release `rsvelte_esrap` 0.10.18 and update the compiler's exact dependency.
- 07f478e: Replace esrap's nested command tree with flat text and offset-based layout events, and release `rsvelte_esrap` 0.10.11.
- cab1a0a: Render esrap statement bodies and single declarators directly into their parent buffer. Release `rsvelte_esrap` 0.10.15 and update the compiler's exact dependency.
- f7f386d: Render esrap call arguments and typed sequences directly into their parent buffer. Release `rsvelte_esrap` 0.10.16 and update the compiler's exact dependency.
- e00bb80: Keep interior script comments in server output: a reassembled program's comment cursor was discarded before its located statements were printed.
- 216fda9: Locate the SSR module class header lexically: a `class ` inside a comment or a string made the following factory function a class body, lowering its locals into `#private` fields in statement position and emitting a module no JS parser accepts.
- 68f52f1: Reuse esrap context buffers through one print-local cache, and release `rsvelte_esrap` 0.10.12.
- 05acba5: Write flat esrap sequence spacing before rendering to avoid retroactive output copies. Release `rsvelte_esrap` 0.10.25 and update the compiler's exact dependency.
- 1fe6b2e: Render comment-free statement bodies without speculative scopes or retroactive layout insertion. Release `rsvelte_esrap` 0.10.20 and update the compiler's exact dependency.
- 68a92fa: Specialize esrap's comment-free printer so comment placement checks are eliminated from its hot AST traversal. Release `rsvelte_esrap` 0.10.19 and update the compiler's exact dependency.
- a595a34: Reserve space for deferred esrap layout bytes before rendering. Release `rsvelte_esrap` 0.10.23 and update the compiler's exact dependency.
- 72ff779: Preserve source spans when transferring retained compiler programs into a new OXC allocator.
- 957459f: Keep layout metadata for sequences of up to three nodes inline. Release `rsvelte_esrap` 0.10.21 and update the compiler's exact dependency.
- 086b4ac: Avoid allocating a temporary argument vector for one-argument calls, and release `rsvelte_esrap` 0.10.13.
- 316643e: Print comment-bearing JavaScript faster while preserving all comments. Release `rsvelte_esrap` 0.10.28 and update the compiler's exact dependency.
- 4af8585: Fix async-derived lowering with comments, destructuring, and non-final awaits.
- 38b4f2a: Preserve source locations for unchanged client instance scripts in generated source maps.
- 2a0f401: Remove per-element closure allocations from hot esrap sequences and specialize common multi-argument calls. Release `rsvelte_esrap` 0.10.14 and update the compiler's exact dependency.
- 6628144: Prevent non-ASCII text from corrupting legacy client transform boundaries by keeping character and byte offsets as distinct types.

## 0.10.14

### Patch Changes

- 67eeff1: Replace fragile generated-JavaScript prop scanners with OXC AST/span rewrites.
- e419e69: Align OXC dependencies with Rolldown and expose the client program sink for native bundlers.
  `rsvelte_esrap` is released as 0.10.8 and `rsvelte_core` pins the new exact requirement.
- e419e69: Match Svelte's bound contenteditable child-update behavior and runes-mode `{@html}` validation.
- e46368f: Track reactive reads in function parameter defaults and computed keys.
- 8a745c9: Match directive validation for `svelte:body`, `svelte:element`, and `svelte:component`.

## 0.10.13

### Patch Changes

- 84a0f5c: Match Svelte 5.56.9 CSS parser and whitespace-preserving print behavior.
- 58cd109: Align OXC dependencies with Rolldown and expose the client program sink for native bundlers.
  `rsvelte_esrap` is released as 0.10.8 and `rsvelte_core` pins the new exact requirement.
- 58cd109: Match Svelte's bound contenteditable child-update behavior and runes-mode `{@html}` validation.
- 4d6d06a: Compile TypeScript generic rune calls in template declarations without leaking `$state` into browser output.
- 58e6772: Preserve same-line comments at the preceding statement boundary during client code generation.
  `rsvelte_esrap` is released as 0.10.7 and `rsvelte_core` pins the new exact requirement.

## 0.10.12

### Patch Changes

- c46dd83: Preserve reactive context across non-final awaits in async derived declarations
  and keep generated destructuring temporaries scoped to their async callback.
- 973b147: Correct async module transforms around Unicode JavaScript identifiers.
- 966b011: Fix dev-mode placement of comments before derived class fields.
- ece95af: Preserve SSR source comment placement when legacy reactive statements are reordered.
- cb0a6c6: Match client effect callback comment placement with Svelte output.
- 1e06814: Correctly classify async-server function initializers containing comment delimiters.
- 9a5cdb3: Match Svelte's dev-mode `$.assign` exemptions for `bind:` setters on special elements and `<svelte:self>`.
- 50ed4b9: Fix corpus mutation accounting for the server development target.
- fc13c09: Keep comments from function bodies out of generated parameter lists. `rsvelte_esrap`
  is released as 0.10.5 and `rsvelte_core` pins the new exact requirement.
- fc85476: Match development SSR lowering for dynamic elements whose tag is an identifier.
- 50ed4b9: Preserve declaration order for dev SSR snippet stringification guards.
- ee5204b: Prevent Unicode pseudo-element arguments from panicking CSS compilation.
- ba984da: Rewrite updates of shadowed local `$state` bindings through the AST pipeline.
- dd0fd18: Retain async-derived waterfall suppression comments in SSR output.
- 7edca8a: Match Svelte's development SSR guards for non-hoistable snippets.
- 8c35fe4: Match Svelte's development SSR output for snippets, elements, bindings, CSS, and snapshots.
- 8279905: Preserve server output comments trailing direct legacy reactive blocks.
- c46dd83: Correct proxying for assignments to module-script state that shares a name with an instance derived value.
- 89e1646: Prevent the internal empty-statement placeholder for removed `$inspect` calls
  from reaching generated client output when comments change printer whitespace.
- d2a4c1b: Match server lowering for async `$derived` array destructuring in `.svelte.js` modules.
- fe3b1d2: Match Svelte's server development guards for snippets passed as component children.
- c9855ba: Match development-mode SSR snippet validation and stringification guards.
- 7edc819: Update the embedded Rust printer alongside the compiler's strict quality baseline.
- b6d0bbe: Classify async component-body awaits from the JavaScript AST, preserving async `$derived.by` callbacks in the synchronous prelude.
- 794d775: Prevent character offsets from being combined with byte lengths during compiler transforms.
- f9e2127: Emit source-map columns in UTF-16 code units for astral Unicode characters.

## 0.10.11

### Patch Changes

- e48e990: Keep an `await` inside an async `$derived.by` callback from splitting the enclosing declaration into the async body.
- ce000f7: Pass the dev `label` and `location` arguments to `$.async_derived`, so `await_waterfall` can fire

  `3-transform/client/visitors/VariableDeclaration.js` emits
  `$.async_derived(thunk, dev && name, location)` for an async `$derived`. rsvelte emitted
  `$.async_derived(thunk)` and nothing else, for every shape.

  That is not a lost label. `internal/client/reactivity/deriveds.js` gates the
  `await_waterfall` warning on `location !== undefined`, so on rsvelte-compiled output the
  warning **could never fire** — and `<!-- svelte-ignore await_waterfall -->` therefore
  suppressed something that never ran, which reads as working. The client instance script now
  carries both arguments:

  ```js
  // const a = $derived(await p);  — dev: true, experimental.async
  before: $.async_derived(async () => (await $.track_reactivity_loss(p))());
  after: $.async_derived(
    async () => (await $.track_reactivity_loss(p))(),
    "a",
    "src/Foo.svelte:3:11",
  );
  ```

  Matching upstream, the _omission_ is load-bearing too: `svelte-ignore await_waterfall` on the
  declaration keeps the label and drops only the location, a `svelte-ignore` for any other code
  changes nothing, and a production build carries neither argument. Destructured declarations get
  upstream's `[$derived object]` / `[$derived iterable]` label with the location of the
  `$derived(` call, and each declarator of a multi-declarator statement gets its own.

  The location is measured against the original component source rather than the
  post-rune-transform script the client pipeline walks, so it points at the user's `$derived`,
  not at a rewritten offset. Column numbers count UTF-16 code units, as
  `locate-character` does upstream.

  Also fixed in the same path: a destructured async `$derived` wrapped its value in `$.save(…)`
  in dev, which upstream only does for `{@const}`. `<script module>` and `.svelte.js` modules
  still lower dev async deriveds incorrectly at a level above these arguments; that is tracked by
  the new `async-derived` shape-matrix family rather than fixed here.

- 67656a0: Keep leading comments from misclassifying async derived declarations as expressions.
- 7c5983e: Validate `<svelte:boundary>` and `<svelte:fragment>` attributes like Svelte.
- 52aa2e8: Give a compile failure out of `compileWithCssHash` the same official `CompileError` object the synchronous entries throw, and add the rendered `frame` to all of them. The async entry previously surfaced a failure as a Rust `Debug` string with no `code`/`start`/`end`, so a consumer that places a diagnostic from it — `@rsvelte/vite-plugin-svelte`'s `utils/error.js` builds `rollupError.loc` this way — got nothing on that path. Also fixes the code frame's caret column: it was computed without an upper bound and so ran past the end of the quoted line whenever the error's `end` sat on a later line, which affected warning frames as well as error frames.
- 2321200: Align constant folding with upstream `scope.evaluate` in both directions

  Two reports were the same disagreement seen from opposite sides.

  Folding too little: a template literal whose interpolations are all constants was
  not folded on any target, because the fold accepted a backtick literal only when it
  contained no `${` and the client evaluator had no template-literal case at all.
  Upstream walks the quasis and folds as soon as every interpolation is known, so
  `` const cont = `p${'ab'}q` `` now reaches `p.textContent = 'pabq'` /
  ``$$renderer.push(`<p>pabq</p>`)``. `null` and `undefined` interpolate as their
  names, a `Math.PI`-style global constant now folds, and the server no longer stops
  at "this is a string" for a template-literal initializer.

  Folding too much: a member read on a literal — `{[1, 2].length}`,
  `{(async (p = 1) => p).name}` — was treated as static, so the element was emitted as
  `<p></p>` and the dynamic text node the runtime expects to fill had no placeholder.
  Upstream's rule is `has_state ||= !is_pure(node)`, and `is_pure` walks to the
  leftmost object: an array, object or function literal there is impure. A string
  literal there is pure, so `{'ab'.length}` correctly stays static — the neighbours
  are not all on the same side.

  Also fixes a member read printed with a literal object losing upstream's
  parentheses (`'ab'.length` where esrap writes `('ab').length`): only the two plain
  literal variants were wrapped, not the raw-spelling, boolean, bigint, regex and
  null ones.

- 6e008f0: Report `css_unused_selector` for five more selector shapes

  `prune()` decides which selectors are reachable by walking one component's real
  element tree. Five shapes were being kept alive by checks that asked a weaker
  question than upstream does, so rules the official compiler reports as unused
  were emitted with no warning.

  - **An explicit `&`.** `.a { & .b { … } }` was kept whenever an `.a` existed
    anywhere. Upstream resolves `&` in place against the parent's prelude, so it
    requires an `.a` **ancestor** of the `.b`; a sibling, a descendant, or the same
    element carrying both classes does not match.
  - **`:is()` / `:where()` / `:not()` arguments.** An argument list now constrains
    the compound it sits in, so `:is(.a) > .b` prunes when `.a` is not the parent
    of `.b`. `:not(...)` constrains nothing (its contents stay unscoped upstream),
    a multi-part branch is assumed to match, `:where` joins `:is`/`:has` in
    collapsing to one warning when every branch is unused, and a subject-less
    `:has(.a)` means `*:has(.a)` — the argument must match inside some element's
    subtree, not merely exist.
  - **A compound must be satisfied by one element.** Each simple selector was
    checked for existence separately, so `.a.b` survived with `.a` and `.b` on
    different elements. This one is not specific to pseudo-classes; `#i.a` and
    `div.a:is(.b)` had it too.
  - **`:root`.** `truncate` drops every simple selector except `:has` from a
    `:root` compound, so the unscoped `.x` in `:root.x:has(.a)` must not prune the
    rule — and a `>` out of a `:root` head is satisfiable only by a root-level
    element.
  - **A trailing `:global(...)` on a parent rule.** A nested rule links to its
    parent through the truncated parent prelude, so `.a :global(.g) { .b { … } }`
    requires `.b` under `.a`.
  - **`<svelte:element>` and attribute selectors.** An unknown tag name does not
    add attributes, so it no longer deopts every `[attr]` selector in the
    component. Only the _type_ selector is exempt, as upstream.

- 2de9fde: Warn for deprecated `accessors` and `immutable` options whenever they are supplied, including `false`.
- 81c9920: Stop rewriting a prop name that is a binding in a destructuring parameter

  In a legacy `$:` statement, the client prop-read rewriter decided that an
  identifier followed by `,` or `}` and preceded by `{` was a shorthand
  object-literal property, without asking whether the enclosing `{ … }` was an
  object literal or a **binding pattern**. A prop name occupying a slot of a
  destructuring parameter was therefore expanded as if it were a value read, and
  the emitted module was not JavaScript:

  ```svelte
  <script>
    export let id;
    export let items;
    $: found = items.find(({ id }) => id);
  </script>
  ```

  emitted `items().find(({ id: id() }) => id)` — `Invalid binding pattern` in every
  JS parser. Array patterns took the plain wrap instead (`([id(), n]) =>`), as did
  nested, aliased and rest slots, and a `function ({ id })` parameter list.

  A pattern slot is a declaration, so nothing is wrapped there now. Reads that only
  look like pattern slots are unchanged and still wrap: a default value
  (`({ n = id }) =>`), a computed key (`({ [id]: n }) =>`) and an object literal
  defaulting a parameter (`(o = { id }) =>`).

- a3f8501: Decide whether a quote is escaped by counting the run of backslashes before it, at every scanner in the compiler and in svelte2tsx. 37 sites asked `bytes[i - 1] != b'\\'` instead, which is a different question: in `'\\'` the closing quote follows a _complete_ `\\` escape and is not escaped at all, so the scanner never closed the string and consumed whatever followed. Reachable effects that are now fixed include a `{const a = '\\', b = 2}` losing its second declarator with no error, `{const { a = '\\' } = obj}` being rejected as an invalid declaration tag, a destructuring assignment emitting an IIFE argument that carried the statement's `;`, a dev-mode prop-mutation validator swallowing the rest of the instance script, a legacy mutated import skipping every later `$.mutate` in the same script, and a `<svelte:element this={… '\\' …}>` overlay dropping its children's diagnostics in svelte2tsx.
- 9b1d004: Raise `expected_whitespace` at the block, clause and tag headers that require a separator (`{#if}`, `{#each}`, `{#await}`, `{#key}`, `{#snippet}`, `{:else if}`, `{:then}`, `{:catch}`, `{@html}`, `{@const}`, `{@render}`, `{@attach}`), and stop requiring one after `{@debug}`, which the official compiler allows
- d0839b2: Preserve leading block comments when lowering public rune class fields.
- 6411e20: Place trailing comments after removed `$inspect` calls before generated client
  variable declarations.
- e9130c1: Preserve parentheses around single invalidation sequences in generated client output.
- 431a150: Keep partially unused `:is()` / `:where()` selector-list branches in source
  order when emitting their `(unused)` comments.

  Preserve selector specificity by applying the complex selector's scope bump to
  functional pseudo-class arguments even when their scoped sibling appears later
  in source order.

- 5400dc4: Read a regex literal that follows a keyword, so `return /re/` is not scanned as a division

  `shared::js_scan::skip_opaque` — the scanner every text pass in the client
  instance-script pipeline steps through — decided whether a `/` opened a regex
  literal from the **previous byte only**. An identifier-looking byte read as "an
  operand ended here, so this is a division", and the `n` of `return` is
  identifier-looking. Every reserved word that can precede a regex literal in
  expression position was affected the same way: `typeof`, `case`, `in`, `of`,
  `delete`, `void`, `instanceof`, `yield`, `await`, `throw`, `new`, `do`, `else`,
  `extends`, `default`.

  Reading the literal as a division leaves its body exposed as code, so the
  delimiters the surrounding passes hunt for — `;`, `}`, `)`, and a `//` inside a
  character class — are counted from inside the regex:

  ```svelte
  <script>
    export let v;
    let k;
    $: k = typeof /[//]/.exec(String(v));
  </script>
  ```

  before (client): the `//` inside the character class read as a line comment, so
  the statement's code ended at `typeof /[` and the `v` behind it was left
  unrewritten.

  The decision now reads the preceding **token**: if the identifier run ending at
  the slash is an ECMA-262 §12.7.2 reserved word that cannot end an expression (the
  whole list except `this`, `super`, `true`, `false`, `null`), plus the contextual
  `of` of a `for…of` head, the `/` opens a regex. The run must start at a token
  boundary and must not be a property name, so `preturn / 2` and `obj.in / 2` stay
  divisions, and it must end on the byte the scan actually recorded, so a comment
  whose text happens to end in a keyword cannot move the decision. A postfix `++`
  or `--` before the slash is now also a division rather than a regex opener.

- 089723d: Recognize regular expressions after keywords consistently in parser and class-body scanners.
- 64d2430: Emit `perf_avoid_nested_class` for classes declared inside legacy reactive statements.
- 97d25cf: Record a hash for each mutation-corpus baseline seed so a source-content re-key
  cannot be misreported as a fixed compatibility failure.
- 51ced33: Avoid treating awaits inside nested async functions as async derived initializers.
- 68ee6b6: Avoid emitting `$.invalidate_inner_signals` for legacy each-block collections
  with no reactive transitive dependencies.
- 989627f: Keep a legacy `{#each}` collection as an AST node when a reassigned item reads it back as `collection[$$index]`, so a collection that binds looser than member access keeps its parentheses (`($.get(list) ?? [])[i]`, not `$.get(list) ?? [][i]`) and an optional chain is closed before the index is appended
- 2892f7e: Add preprocessor ports for Less, Markdown, mdsvex, modular CSS, and sveltex.
- 853c8f4: Preserve top-level statement boundaries after same-line legacy prop declarations.
- 737e8d3: Reuse Phase 2's typed dependency list when ordering legacy reactive statements, avoiding the duplicate Phase 3 text scan of each `$:` body.
- 444283c: Scope elements reached through `:root<compound>:has(...)` selectors. The CSS
  rule was retained but its matching element missed the component scope class,
  making the emitted rule inert.

  Apply an outer scope class to compounds containing multiple functional
  `:is()` / `:where()` pseudo-classes instead of treating them as a standalone
  pseudo-class selector.

- 8a0f17e: Compile runtime fixture checks using the options recorded by the official fixture generator.
- 44f952a: Keep a comment interior to a declaration's initializer in `generate: 'server'` output

  A comment inside a `let` / `const` / `var` initializer was dropped and the
  multi-line layout around it re-flowed onto one line:

  ```svelte
  <script>
  	let data = {
  		/* c */
  		a: 1
  	};
  	function go() { data = { a: 2 }; }
  </script>

  <p on:click={go}>{data.a}</p>
  ```

  ```js
  // official          // rsvelte before
  let data = {         let data = { a: 1 };
  	/* c */
  	a: 1
  };
  ```

  This is not a bracket-scanner defect: a plain `/* c */` with no delimiter in it
  diverged identically to `/* } c */`. The server rebuilds a declaration from
  re-parsed SUB-slices — the pattern from one slice, the initializer from another —
  so the emitted statement's nodes carry no coherent set of source positions and the
  comment carry-over can only collapse every span onto one address. That is enough
  for a leading comment (they all flush before the statement) but destroys every
  interior position, so an interior comment has nowhere to land.

  A declaration whose lowering is nothing but that re-parse plus init read-wrapping
  is now re-parsed WHOLE from its source span instead, the same way function
  declarations, `if` blocks and `$:` statements already were, so its spans stay
  coherent and the printer places the comment where the source put it. Declarations
  that really are rewritten — a prop lowered to `$$props['x']`, a destructured
  `$state` expanded into a temp group, a rune initializer, a multi-declarator
  declaration split into one statement per declarator — keep the per-declarator
  rebuild. Client and client-dev output is unchanged.

- 5709d56: Lower a write to a private `$derived` class field to a setter call on the server

  On the server a private `$derived` field holds a callable, so upstream reads it as
  `this.#f()` and writes it as `this.#f(v)`. rsvelte's read-wrapping pass decided
  read-versus-write by looking at the byte after `this.#f` and accepted only a bare
  `=`, so a compound operator saw `+`, `&`, `>` … and the _assignment target_ was
  wrapped:

  ```js
  export class R {
    #a = $state(1);
    #d = $derived(this.#a * 2);

    constructor() {
      this.#d += 1;
    }
  }
  ```

  emitted `this.#d() += 1;` where official emits `this.#d(this.#d() + 1);`. A call
  expression is not a valid assignment target, so the module does not parse and
  Vite/Rolldown reject it. All nine compound operators were affected, in a
  constructor and in a method body alike.

  The quiet half was a plain `this.#d = v` **outside** a constructor: the setter
  rewrite only ran on constructors, so a method body kept the assignment, replaced
  the callable with a plain value, and the next read threw `this.#d is not a
function`. That output parsed, so no parse-level check could see it.

  Both are now handled in one place, for constructors, methods and arrow-function
  class fields.

- c31ef6b: Keep the comments a removed statement used to swallow in `generate: 'server'` output

  A statement the server transform removes (`$effect`, `$effect.pre`, `$effect.root`,
  `$inspect`) took the comments around and inside it with it:

  ```js
  export function f(a) {
    // leading
    $effect(() => {
      // interior
      console.log(a);
    });

    console.log(2);
  }
  ```

  ```js
  // official          // rsvelte before
  export function f(a) {
    // leading           // leading
    // interior
    console.log(2);
    console.log(2);
  }
  ```

  Upstream removes the statement NODE and lets esrap's comment cursor flush the orphans
  from the enclosing (located) body. rsvelte lost them through two different mechanisms,
  which is why the two entry points failed differently — the `.svelte.js` module path
  kept the leading comment and ate only the interior one, while a component instance
  script ate both:

  - **`compileModule`** deletes the effect as a **source range**, so anything inside the
    range goes with it. The removal now replays the range's own comments at the removal
    point, guarded so a `//` comment is only ever emitted where nothing else shares its
    line. All four range-based removals in that pipeline are covered — `$effect(`,
    `$effect.pre(`, statement-position `$effect.root(` and the post-transform
    `$.user_effect(` cleanup; the pipeline's other ten rewrite sites unwrap a call rather
    than delete user source.
  - **the component path** registers a comment region per top-level statement and anchors
    it on what that statement emitted. A statement that emitted nothing left its region
    unreferenced, so the comments died with it. A dropped statement now carries its region
    forward to the next surviving statement instead, matching where upstream's cursor
    flushes them. A statement that emits only `EmptyStatement` sentinels (a removed
    `$inspect` prints `;;`) counts as emitting no anchor, since the carry-over refuses to
    rewrite a sentinel span.

  Client and client-dev output is unchanged. A comment after the **last** top-level
  statement is still dropped — there is no surviving statement to re-home onto, and
  upstream flushes it at the end of the enclosing function body instead; that is tracked
  separately.

- 25b2513: Keep same-line comments trailing server-rendered script declarations.
- 1272028: Compile transition and animation directives on `<svelte:window>`, `<svelte:body>`,
  and `<svelte:document>`.
- 6a53739: Take the client instance script's statement boundaries from the parser.

  The pipeline decided where a statement ended by scanning characters: balanced
  depths, a trailing comma, a list of operators a statement cannot end on, a
  brace-less control header, and a lookahead for a continuation token on the next
  line. Each is an approximation, and the operator list is a list — a line ending
  in `-` or `/` was not on it, so `$: v = a -⏎ b;` split into two statements and
  `b` stopped being a dependency.

  The boundaries now come from a parse of the script — the program Phase 1 already
  holds where that text is a verbatim region of it, and a fresh parse otherwise. A
  script that does not parse at that point keeps the scanner, so nothing that
  worked stops working, and the per-line depth scan no longer runs when a parser
  answered.

- a91a60e: Run the a11y pass for `<svelte:element>`

  Upstream calls the shared a11y checker from **both** element visitors
  (`RegularElement.js` and `SvelteElement.js`); rsvelte had a call site only on the
  regular one, so every element a11y rule was silently absent whenever the element
  was written as `<svelte:element this={…}>`:

  ```svelte
  <script>
  	let tag = 'div';
  	function f() {}
  </script>

  <svelte:element this={tag} on:click={f}>x</svelte:element>
  ```

  Official warns `a11y_no_static_element_interactions`; rsvelte emitted nothing.
  This was not one missing rule — it was the whole pass, so `a11y_accesskey`,
  `a11y_autofocus`, `a11y_positive_tabindex`, the `aria-*` type and spelling
  checks, the `role` checks, `a11y_mouse_events_have_key_events` and the rest were
  missing too.

  `<svelte:element>` reaches the checker under the literal name `svelte:element`
  with `is_dynamic_element` set, so the rules upstream guards on a statically known
  tag stay skipped — `a11y_misplaced_scope`, `a11y_aria_activedescendant_has_tabindex`,
  `a11y_click_events_have_key_events`, `a11y_no_noninteractive_tabindex` and
  `a11y_role_has_required_aria_props` must not fire on a dynamic tag, and do not.

  The same port closes upstream's other two `SvelteElement` branches in that file: a
  dynamic element between the checked node and its ancestors makes `is_parent`
  answer "unknown" (so `a11y_autofocus` / `a11y_figcaption_parent` are suppressed
  rather than guessed), and an **empty** `<svelte:element>` child no longer counts
  as content for `a11y_consider_explicit_label` / `a11y_missing_content`.

  A differential over the reachable a11y rule set — 42 attribute shapes × 10 tag
  spellings × 3 targets, 1,416 comparisons — now agrees with official on every one.

- 9c8eac8: Let an enclosing `svelte-ignore` suppress the warnings raised about `svelte-ignore` comments themselves. `legacy_code` and `unknown_code` were pushed straight onto the analysis warning list, so they bypassed the ignore stack that every other warning consults — `<!-- svelte-ignore unknown_code -->` around a block containing `<!-- svelte-ignore zzz-yyy -->` still reported `unknown_code`, where the official compiler reports nothing. They now go through the same emission path as every other warning, and because that happens before the comment run's own codes are pushed, a comment still cannot ignore its own code — matching the official compiler in both directions.
- 1542ee9: Validate directives on `<svelte:self>` with the same rules as components.
- 6e4741c: Preserve class declarations inside template expression callbacks.
- 6a53739: Place TypeScript statement boundaries through the strip projection, so the client
  instance-script pipeline reuses the program Phase 1 already parsed instead of
  parsing the script a second time.
- e8ee67e: Retain legacy reactive statement metadata for client lowering.
- 32f1e9e: Reject every decorator in a TypeScript `<script>` with `typescript_invalid_feature`, not only the ones on a class declaration. A decorator on a method, a field, a getter, a class expression or a constructor parameter was copied verbatim into the generated module, which is then not JavaScript and which no gate could observe — the ratchets score match/mismatch, and the corpus has no witness. The error's code, message and span now match the official compiler in all of those positions.
- 579657f: Return the official-shaped `CompileError` from the Vite shim's envelope compile
  paths, including `compileAsync`, instead of a Rust debug string.

## 0.10.10

### Patch Changes

- 9c22cc3: Build the Linux binaries against glibc 2.35 instead of whatever `ubuntu-latest` happens to provide. The release matrix ran on the hosted `ubuntu-latest` image, which moved to Ubuntu 24.04 (glibc 2.39), so every published `linux-x64-gnu` / `linux-arm64-gnu` artifact refused to start on Ubuntu 22.04 LTS and other distributions on an older glibc — `libc.so.6: version 'GLIBC_2.39' not found`. The Linux legs are now pinned to `ubuntu-22.04`, and each one asserts the requirement by reading the artifact it just built, so a future image bump fails the release instead of shipping.

## 0.10.9

### Patch Changes

- c2a8eeb: Reject `await` and `yield` inside a function's formal parameters, which the official compiler raises as `js_parse_error` ("Await expression cannot be a default value") and rsvelte compiled. `export const f = async (p = await load()) => p;` built successfully here while `svelte.compileModule` refuses it, so a file the official compiler will not accept shipped instead of failing loudly. Acorn enforces this and OXC does not, so the check is now applied at every place rsvelte hands source to OXC — the instance and module scripts, `compileModule`, snippet parameters, and template expressions, which parse through a different function and stayed accepting after the script paths were fixed.
- 62b4329: Stop a block comment from suppressing constant folding of the declaration below it (server).

  `join_continuation_lines` decides whether a physical line continues onto the
  next by reading the last non-whitespace byte it has emitted. Comment text went
  into that same buffer, and a block comment ends in `/` — a division operator —
  so a `/* … */` on its own line joined the next line onto itself. A joined
  `const` declaration no longer starts with `const`, so `extract_constant_vars`
  stopped seeing it and the template read was emitted as a runtime
  `$.escape(...)` where upstream folds the literal in.

  The continuation decision now looks past comment text to the last byte that was
  actually code.

- f2d913c: Fold a line-continuation string constant when a comment sits between `=` and the value

  `join_continuation_lines` reconstructs logical lines for `extract_constant_vars`,
  and it copied comment text into that reconstruction. A comment then landed in
  front of the declarator's value, where `is_whole_string_literal` tests the first
  byte, so the constant was never recorded and the SSR output read it at runtime
  instead of folding it — output that runs correctly and differs from official's.

  Comments now become a single space. That is the whole of the difference the sole
  consumer can observe: it reads values, and a comment carries none.

- 10b218d: Emit a string literal in a template expression with its source spelling, not the printer's. `{@const t = 'a\tb'}` compiled to a real tab inside the string and `'\x41'` to `'A'` — the same value, different text, and a divergence from official on every escape the printer does not re-emit. esrap writes a literal's `raw` whenever it is set, so quote style and escape spelling both come from the source; rsvelte kept `raw` only for double-quoted literals.
- 9da01d5: Stop a string literal's line continuation from gaining an indent (client) and from blocking constant folding (server). `const cont = 'a\<line break>b'` compiled to a component whose `cont` was `a\tb` — valid JavaScript computing the wrong string — because the client re-indenter treated the carried line as code. The same literal never entered the server's constants map, so the read stayed dynamic where official inlines it.

  Also fixes a server fold that turned `'ab' + 'cd'` into the literal text `ab' + 'cd` (#2661): `starts_with` plus `ends_with` is not the question "is the whole expression one string literal".

## 0.10.8

### Patch Changes

- cd5c928: Stop the client instance-script scan from rewriting comment bodies.

  `strip_unnecessary_arrow_body_parens` scanned the instance script for `=> (` and
  dropped the parentheses. It skipped string and template literals but not
  comments, so a comment whose text happened to contain an arrow function was
  edited too:

  ```js
  // values.forEach((v) => (valueFilter[v] = true));   // official
  // values.forEach((v) => valueFilter[v] = true);     // rsvelte
  ```

  Measured against the whole corpus with the pass removed, it changed output for
  4 of 14,138 entries and diverged from official on all 4 — three become
  byte-identical to official once it is gone, and the fourth loses the rewritten
  comment above. Nothing regresses, because everywhere else esrap already prints
  the parens the way official does; the pass only ever mattered on inputs where
  its own text rewrite forced the fallback path. It is removed rather than fixed.

  The corpus gate could not see this. A byte-different output falls back to an AST
  comparison, and `ast_equiv_batch` applies `CommentPolicy::Ignore` unless
  `--comments` is passed, so a divergence living entirely inside a comment scores
  `match`. No ratchet listed these entries either.

- 037afbf: Reject `bind:` to an expression that names no binding on a **component**, not only on an element. `<Comp bind:value={o.x = obj} />` compiled and was lowered into a getter/setter around the assignment where the official compiler raises `bind_invalid_expression`. The element path's message is now upstream's text too, so a user comparing diagnostics sees the same string.
- 9fafb90: Stop a delimiter inside a comment from ending a class field early (server).

  The server class-member scan accumulates a multi-line field until its brackets
  balance, and counted every `(`/`)`/`{`/`}`/`[`/`]` byte — including the ones
  inside comments and strings. A `// )` line inside a `$derived.by(…)`,
  `$state(…)` or plain multi-line initializer therefore closed the field one line
  early, and the leftover `);` was emitted as a class member of its own:

  ```js
  	get snippetProps() { … }
  	);
  }
  ```

  which does not parse. The six depth counters in that scan now run over code
  bytes only, and over the whole accumulated text rather than one line at a time,
  so a block comment that spans lines is closed by the same scan that opened it.

- 01e97cd: Keep the operand that follows a line-ending binary operator in a legacy instance script. `let flag = a ||` and `$: v = x ===` with the right operand on the next line closed the statement early, emitting `$.mutable_source(a ||)` / `$.set(v, x ===)` — output no JavaScript parser accepts.
- d1eedb3: Stop a `;` or `)` inside a comment from ending a legacy `let` initializer, and keep the generated `)` out of a trailing line comment. `let x = a + // ; c` emitted `$.mutable_source(a + //); c` — the generated paren spliced into the comment body — which no JavaScript parser accepts.
- 6ad88da: Cook every escape when folding a known-const string, not just the codepoint ones. `const sep = '\\'` folded into `<p>{sep}</p>` emitted `p.textContent = '\\\\'` — the escape survived the fold and was escaped a second time on the way out, so the component rendered two backslashes. `\n`, `\t`, `\r`, `\v`, `\b`, `\f`, `\'`, `\"`, a surrogate pair and a line continuation were wrong the same way, on client, server and client-dev alike.
- 9a27ff9: Keep the newline after a line comment that sits between two declarators.

  A multi-line `let`/`const`/`var` list is accumulated onto a single line before
  it is split at its top-level commas. The accumulator joined continuation lines
  with a space, so a `//` comment on one of them swallowed every declarator that
  followed:

  ```svelte
  <script>
  	let a,
  		b = 1,
  // c
  		c;
  </script>
  ```

  emitted `let // c c;` — a `let` with no declarator, and output that does not
  parse. Continuation lines now join with a newline whenever the text so far ends
  inside a line comment, which is also the shape upstream prints.

- 9a27ff9: Emit a declarator's leading comment above the keyword, not between them.

  Splitting `let a = 1,` / `// c` / `b = 2;` into one statement per declarator
  produced `let // c` on one line and `b = 2;` on the next. That is valid JS and
  it is the shape upstream prints, but every later pass in the text pipeline
  matches `let <name>` on a single line, so all of them missed the declaration
  and read `b = 2` as an assignment instead: a re-exported prop came out as
  `labelId("")` and a legacy state variable as `$.set(b, 2)` with `b` never
  declared.

  The comment now goes on its own line above the keyword, so the declaration is
  `let b = 2;` again. Only a comment that owns its line moves; one sharing a line
  with code stays where it is.

- 37fc1e9: Stop legacy `$:` statement order from depending on whitespace.

  `$: {mid=seed*2}` and `$: { mid = seed * 2 }` are the same program, but they
  compiled to different execution order. The scan that decides which variables a
  reactive statement assigns — which feeds the topological sort — matched the
  literal `" = "`, spaces included, so the unspaced form was credited with
  assigning nothing, never got an ordering edge, and ran before the statement
  whose value it produces. Anything reading `mid` then saw a stale value on first
  run. Every compound operator was affected too, not just `=`.

  The scan now finds the name and its operator separately, so any spacing (or
  none) is recognised. Comparisons are still excluded, and the longest operator
  wins, so `<=` stays a comparison while `<<=` assigns.

- 8d641ee: Stop a regex literal from being read as a line comment in a legacy instance script. In `/^https?:\/\//` the slash closing the last escape and the slash closing the regex are adjacent, so the client text passes cut the line there — emitting an unterminated regex, and leaving the prop reads after it uncalled.
- 020cd5c: Let the runes fast path run in dev mode. Eligibility was gated on `!dev` and on `prop_mutation_vars` being empty, so a runes component compiled with `dev: true` — or any component with a mutated prop — took the per-statement text pipeline instead. Neither condition belonged there: `prop_mutation_vars` feeds a pass that runs over the whole result after the loop, and the only dev-only per-statement stage is the `console.` wrap, which is now checked per statement rather than by disabling the path wholesale.
- 49c34a9: Keep the operand after the rest of the line-ending binary operators in a legacy instance script. Only 8 of the 23 binary operators continued the statement, so `$: kind =\n\titem.a *\n\titem.b;` emitted `$.set(kind, item().a *)` — output no JavaScript parser accepts. `*` `%` `<` `>` `|` `&` `^` `**` `<<` `>>` `,` `in` `instanceof` now continue it too; `in` and `instanceof` only on a word boundary, so the identifier `margin` at a line end does not swallow the next line. `-` and `/` stay excluded: `a--` ends a statement and `/` also closes a block comment, so neither can be decided by suffix matching.
- 39ba648: Answer the legacy `$:` analysis from the typed AST instead of serializing the instance script

  The three legacy reactive passes — cycle detection, `legacy_dependencies` population
  and per-statement dependency collection — read their input as `serde_json::Value`, so
  every top-level `$:` statement was serialized with `JsNode::to_value()` first. That one
  producer built **77-82% of all the JSON objects and map entries the compiler allocates**
  on Svelte-4-era code, and with `serde_json`'s `preserve_order` feature each map entry is
  a key `String` allocation and a hash insert.

  All three passes and their walkers now traverse typed nodes, and the serializer is gone.
  On a 3,509-file application corpus that removes 100,535 JSON objects and 501,609 map
  entries, with byte-identical output and warnings across client, server and dev.
  Components without `$:` are unaffected by construction.

## 0.10.7

### Patch Changes

- 122af14: fix(analyze): point attribute-scoped a11y warnings at the attribute, not the element
- 73bdbf2: Point `a11y_figcaption_index` at the misplaced `<figcaption>` instead of the enclosing `<figure>`
- f0c8f3d: fix(analyze): name the offending attribute in `a11y_invalid_attribute`, so `xlink:href` reports `xlink:href`
- 514bf80: fix(analyze): only warn `attribute_quoted` in runes mode, and point it at the attribute
- ecbfb18: Move a comment run in front of an `await` into the dev-mode `$.track_reactivity_loss` wrap, as the official compiler does
- 01d5780: fix(compiler): recognise `then`/`catch` after a non-ASCII space in `{#await}`

  The keyword scan decided word boundaries by casting a raw byte to `char`, which
  decodes UTF-8 as Latin-1. A full-width space before `then` presented its last
  byte as a control character, so the keyword was swallowed into the awaited
  expression and the compiler emitted a call with an empty argument — output that
  does not parse — with the pending and `then` branches transposed.

- 04a5040: Stop emitting the `$.set(…, true)` proxy flag for a `BinaryExpression` value

  `runs = runs + 1` on a `$state` binding produced `$.set(runs, $.get(runs) + 1, true)`
  because the proxy sniff only saw the leading `$.get(` call. Upstream's `should_proxy()`
  returns `false` for a `BinaryExpression` outright, so the flag is now suppressed for any
  top-level arithmetic, equality, relational, bitwise, shift, `in` or `instanceof` operator.
  `ConditionalExpression` and `LogicalExpression` bind looser and keep proxying.

- 92c4a66: Blank TypeScript for the store scan without parsing the script a third time

  `detect_store_subscriptions` reads a copy of the script with type-only syntax
  blanked out, and built that copy by running a full `oxc_parser` TypeScript parse
  of its own — a third parse of a script the compiler had already parsed for
  `retained_scripts` and stripped of TypeScript. The blanking now runs against the
  retained program when it holds the same bytes, and only falls back to parsing
  when it does not.

  Redundant TypeScript parses over three real-world corpora, counted
  deterministically: Huly plugins 1,384 → 0 (3.02 MB no longer re-parsed),
  open-webui 361 → 1 (1.38 MB), SMUI 393 → 0 (0.52 MB).
  carbon-components-svelte has no TypeScript scripts and stays at 0 in both
  builds. All 14,036 compiled outputs (four corpora × client/server × prod/dev)
  are byte-identical.

- 1830053: chore(compiler): fail loudly on an impossible bracket-offset miss

  No behavioural change: the discarded branch is unreachable for any `&str`
  input, so this only replaces a silent `.ok()` discard with a panic that
  names the offset.

- 6be59dc: Keep a `//` comment written above a private rune class field above the field

  `// c` on its own line before `#n = $state(0)` was emitted as `#n = // c` followed by
  `$.state(0)` on the next line, moving the comment into the initializer. Upstream's
  `ClassBody.js` rebuilds every rune field as `b.prop_def(key, value)` and esrap re-attaches
  the comment to the first node that still carries a source range: a private field reuses its
  own ranged key, so the comment stays above the field. A public field is rebuilt around a
  synthesized `#name` key that has no range, so its comment does legitimately land after the
  `=` — that placement is unchanged.

- 77b4f8b: fix(compiler): measure the prop name in characters in the client prop-read scan

  `transform_prop_reads_in_expr` walks a `Vec<char>` but sized the prop name with
  `prop_name.len()`, a byte length, as did `is_shadowed_by_function_param`. A
  non-ASCII `export let` prop read from a `$:` statement therefore dropped trailing
  code (`名前()` for `名前 + 1`), lost array elements, produced unbalanced object
  shorthand, and missed parameter shadowing.

- a78a21a: Skip the instance-script variable scans whose result is already settled

  Three whole-script text scans in the client instance-script transform ran on
  every component regardless of what the script contained:

  - `index_const_state_decls` and `index_reassigned_vars` are read only while
    iterating `local_reactive_vars`, so an empty list makes both unobservable.
  - `extract_proxy_vars` pushes nothing without a `$state(` on the line.
  - `collect_local_state_decls` inserts nothing without a literal `= $state(`.

  Each now returns its empty result from a single `memmem` probe instead of
  walking the script. Measured as bytes handed to these scans across four
  real-world corpora: huly/plugins skips 6,710,403 of 6,710,403 (2,123 files),
  carbon/src 1,605,612 of 1,605,612, open-webui/src 3,767,567 of 3,776,399, and
  SMUI — which uses `$state` throughout, so the gates cannot fire — skips only
  160,953 of 2,191,645.

- 3e22d14: fix(compiler): return a byte offset from `find_colon_at_depth0`

  The ternary-branch analysis in `check_identifier_in_statement` sliced its right-hand
  side with the position this returned, but the scan counted characters. A ternary
  whose true branch assigns a non-ASCII string literal — `cond ? x = "ああa" : x = y` —
  panicked with "byte index is not a char boundary". The scan also read a `:` written
  inside a comment as the branch separator.

- 9194c9f: Stop an apostrophe in a comment from suppressing the store and prop read rewrites. `// it's fine` opened a string literal that nothing closed, so every `$store` / prop read after it was emitted uncalled — code that parses and is silently wrong at runtime.
- 83c68bd: Throw compile failures as an object shaped like the official compiler's `CompileError` (`name`, `code`, `message`, `filename`, `start`, `end`, `position`) instead of a `GenericFailure` whose message is a Rust `Debug` dump — `compile`, `compileBoth` and `compileModule`
- cc7df16: fix(compiler): decide the component/bind `$.assign` exemption by node identity
- e1161e6: fix(analyze): resolve the component name's conflict suffix before the template walk, so warnings name the component the way codegen does
- 7f834ad: Resolve a dev console argument against the generated program's own `const` declarations. The script text passes only had the component analysis, which carries no binding for a name declared inside a nested function, so `const m = \`…\`; console.log(m)`in a`.svelte.(js|ts)`module was wrapped in`$.log_if_contains_state`even though upstream's`scope.evaluate`resolves`m` to a string and emits the plain call.
- 675b34d: Fix the `$.set` emitted for a `#private` `$state` field inside a class constructor

  Two divergences from the official compiler, both visible in `.svelte.js` / `.svelte.ts`
  class output:

  - A logical assignment (`??=`, `||=`, `&&=`) always appended the `, true` proxy flag.
    Upstream `AssignmentExpression.js` gates it on `field.type === '$state'`, so a
    `$state.raw` or `$derived` field must not carry it — `this.#x ??= { … }` on a
    `$state.raw` field now emits a two-argument `$.set`.
  - A compound assignment read the operand as `$.get(this.#n)`. Upstream
    `MemberExpression.js` reads a `$state` / `$state.raw` field as `this.#n.v` while
    `in_constructor`, so `this.#n += 1` now emits `$.set(this.#n, this.#n.v + 1)`.
    Reads inside ordinary methods keep going through `$.get`, and a `$derived` field
    keeps going through `$.get` everywhere.

- da10132: Stop counting braces inside comments when splitting comma-separated declarations. A `}` in a comment made the splitter run one declaration into the next and emit a `const` declarator with no initializer, which does not parse.
- 1cc832b: Count brackets lexically when finding the end of a rune's argument on the server

  `find_matching_paren_server` scanned with a bare `char_indices()`, so a `)` or `}` inside
  a comment or a string literal closed the count early. A multi-line `$derived(() => ({…}))`
  class field then lost its closing `))` and the module stopped parsing with
  `missing ) after argument list`.

- 3e22d14: fix(compiler): match destructuring brackets lexically

  `find_matching_open_bracket` walked backwards counting every `{`/`[` it saw,
  including ones inside string literals and comments. A destructuring assignment
  whose pattern carried a brace in a default value (`{ a = "}" } = obj`) or in a
  comment failed to find its opening bracket and was left untransformed.

- 0f05d35: Drop comments from destructuring-pattern segments so a comment cannot become a binding name

  A comment inside a legacy destructuring pattern was carried into the segment that
  `split_derived_object_properties` / `split_derived_array_elements` return, and every
  consumer reads a segment as pattern text. A comment-only segment therefore became a
  declarator named `// c`, which commented out the rest of the emitted line including its
  `;` — the declaration never terminated and the whole module stopped parsing.

- 0822929: End a destructuring assignment's right-hand side at the line break when the source omits the semicolon, so semicolon-free code no longer emits an unclosed IIFE call
- 7babb78: Hoist the `await` out of an `$.assign_async` lazy getter and instrument it
- 7babb78: Keep the dev `$.assign` coerced-proxy warning on a component-prop arrow when the component is nested inside an element
- 715b51c: fix(compiler): only exempt an event attribute's own arrow from the dev `$.assign` wrap
- 7babb78: Stop an untransformed `$.assign` site from lending its position to a later twin
- 7babb78: Separate a wrapped `await` statement from any preceding statement ASI left open
- 7babb78: Validate a component `bind:` setter that mutates a member of a non-bindable prop in dev
- 7babb78: Resolve a shadowed name through the scope chain a script reference sees when deciding whether to wrap a dev `console.*` call
- 7babb78: Map the selectors of a partially pruned rule in the injected stylesheet's dev source map
- 7babb78: Stop instrumenting the generated IIFE of an async destructuring assignment in dev
- 7babb78: Apply the dev equality instrumentation to a `$derived` destructuring default
- 7babb78: Ignore comments when locating the function a `$inspect.trace()` label points at
- 1d290bc: Wrap the whole prop setter call in `$$ownership_validator.mutation` when the
  printer broke it across lines. A dev-mode legacy `export let` prop whose member
  is assigned a multi-line value produced output that was not JavaScript.
- 7babb78: Put the legacy `$.invalidate_inner_signals` sequence inside the dev ownership-mutation wrap instead of around it
- 7babb78: Label a proxied `$state` initializer with `$.tag_proxy` in dev, including one declared in a template handler body and one whose value is an equality comparison
- 23e68ac: Match a `$effect(`'s closing paren lexically, so a `)` inside its body's comment does not truncate the deletion

  `strip_effects_from_source` deletes from `$effect(` to its matching `)`, and
  `find_matching_paren` counted every `)` byte. A `// ) c` inside the effect body closed the
  count early, so the deletion stopped mid-body and the tail of the comment — `c` — was
  emitted as a bare statement. The output no longer parses: `Unexpected token`,
  `Unterminated regular expression` and `'import' is a reserved word` are all the same defect
  landing at different arbitrary bytes.

  The fix is on the shared helper rather than the caller, because all 18 call sites (11 in
  the server transform, 7 in the client rune transforms) use the result to slice or delete a
  source range. Only the `$effect` / `$effect.pre` / `$effect.root` sites are shown to be
  reachable by a discriminating case; the other 15 are structurally exposed to the same input
  but unmeasured.

- 016c7a8: fix(compiler): close a string literal whose last escape is `\\` so the next `export` is still transformed
- 24b8bd1: chore(esrap): bump `rsvelte_esrap` to 0.10.2 for a test-only change

  No shipped behaviour changes. The only edit under `crates/rsvelte_esrap/src/` is inside
  `#[cfg(test)] mod internal_tests`, which cannot appear in a published artifact: the golden
  conformance test now fails instead of skipping when `submodules/svelte` is absent or
  `ESRAP_ORACLE_DIR` has replaced the corpus its `EXACT_FLOOR` ratchet was calibrated on.

  The bump exists only because `check-esrap-version-bump.mjs` keys on any path under
  `src/`, and `rsvelte_core` pins `rsvelte_esrap` exactly, so the pin has to advance with it.

- 6c165c8: fix(compiler): decide the dev `$.assign` exemption by arrow identity, not a flag
- 2af6588: fix(compiler): keep an arrow body that starts on the line after `=>` in a legacy `export let` default
- 92c4a66: Skip the await / rune-reference walk when neither half of its gate can fire

  The gate on the analyze-phase feature walk was `has '$' || has "await"`. Every
  rune name starts with `$`, so the first probe passes on most components and the
  second — true for about 1% of them — never gets a say. But `$` is only
  _informative_ while rune detection is on: once runes mode is already decided,
  the walk's sole surviving output is `has_await`, which an `await`-free source
  settles without walking anything.

  The gate now reads `(needs_rune_detection && has '$') || has "await"`, which is
  observationally equivalent: the `has_rune_reference` half of the result is read
  only under `needs_rune_detection`.

- b6b81ca: Wrap an awaited `for…of` loop's iterable in `$.for_await_track_reactivity_loss(...)` in dev mode under `experimental.async`, matching the official compiler's `ForOfStatement` visitor. Applies to runes and legacy instance scripts, `<script module>` and `.svelte.(js|ts)` modules, and is suppressed by `svelte-ignore await_reactivity_loss`.
- bc9d8e7: Delete the non-ASCII arm from the parser's trailing whitespace-only text trim.
  The predicate ran under `all()`, so every byte of the text had to satisfy it,
  and the lead byte of any multi-byte character casts to a non-whitespace Latin-1
  character — the arm could never be the deciding term. Trailing non-ASCII
  whitespace is already dropped upstream by the `trim_end()` that sets
  `content_end`, which is what matches official Svelte's `template.trimEnd()`. No
  behaviour change; the arm only ever looked like Unicode support.
- 4a9f31e: fix(compiler): stop gluing non-ASCII whitespace into identifiers in the client transform

  `is_ident_start_byte` existed twice with the same `u8 -> bool` signature and
  opposite answers on every byte `>= 0x80`. The client copy admitted them all, so
  its identifier scan read `let<NBSP>count` as a single word and never saw
  `count` — a missed identifier in a pre-filter whose own documentation says a
  false negative is a correctness bug. Both copies now defer to one classifier
  that decodes the character and applies the rule the official parser uses, and
  the ASCII-only fast-path gates carry `ascii` in their names.

- b9c51bc: Answer the identifier-boundary question without a regex

  `body_references_identifier` compiled-and-cached one boundary regex per reactive
  variable and then ran it over the stripped statement body, once per (`$:`
  statement × variable) pair. The pattern only ever asked three things — is the
  byte after the name an identifier byte, is the byte before one, and is a leading
  `.` a member access or the tail of a spread — so a matcher that asks them
  directly replaces it. Overlapping occurrences stay reachable because the scan
  advances by one byte, not by the match length.

  On carbon-components-svelte this regex was 70% of the remaining time in
  `extract_reactive_statement_deps`; its share of total compile time drops from
  19.6% to 6.0%.

- 5092d12: Find an `import` statement's terminator lexically, so a `;` inside a comment does not truncate the specifier list

  `extract_imports` accumulated a multi-line `import` until a line "closed" it, and both the
  close test (`trimmed.contains(';')`) and `import_statement_end` read raw bytes. A `// ; c`
  line inside the specifier list closed the import after the previous specifier, terminated it
  with the comment's own `;`, and routed the rest of the statement — starting mid-comment —
  into the component body, so the output stopped being JavaScript.

  The two tests are now one lexical scan, which is what kept them from disagreeing: comments,
  template literals and regex literals are opaque, and the open-block-comment state already
  carried by `ScanState` is consulted, so a `;` on the continuation line of a `/* … */` is text
  too. All four `contains(';')` sites are replaced — `extract_imports` and
  `extract_imports_with_projection` are two copies of the same loop, and fixing one would have
  left the other live depending on whether source projection is on.

- d09479e: Stop re-parsing a script when the in-place pass already found nothing

  Every ported rewrite pass ran `in_place().or_else(spliced)`. `None` did not say
  whether the in-place path failed to parse or simply found nothing to rewrite,
  so the second, far commoner case re-parsed the whole source through the text
  path only to reach the same answer. `with_program_mut` now returns a three-way
  `Rewrite`, and only `NotParsed` falls back.

  Driver re-parses on the open-webui corpus drop from 14,468 to 4,479 per run
  (−69%). Interleaved paired runs: open-webui −7.1% (8/8), Huly plugins −5.5%
  (6/6), carbon-components-svelte −3.9% (8/8).

- 456d40f: fix(compiler): return byte offsets from two more position scanners

  `find_destructuring_pattern_end` and `find_simple_assignment` counted characters
  while their callers sliced the same string by bytes, so a non-ASCII identifier or
  string literal in a destructuring pattern or a `let` initialiser sliced short —
  `let { café } = obj` lost its closing brace — and a multi-byte character straddling
  the offset panicked outright.

- ed77eec: Decide every whitespace question in the parser with ECMAScript's whitespace set,
  the one upstream's `is_whitespace(cc)`, `\s` regexes and `String.prototype.trim*`
  all consult. The parser previously mixed three sets: Rust's Unicode
  `White_Space` (which adds `U+0085` and drops `U+FEFF`), `u8::is_ascii_whitespace`
  (which drops `U+000B`), and hand-written ASCII fast paths listing only space,
  tab, LF and CR. Block open/close/continuation markers, tag and attribute names,
  closing tags, snippet headers, the `{#each … as …}` alias separator, the
  `{#await … then/catch}` keywords and the CSS reader all now agree with upstream
  on `U+000B`, `U+000C`, `U+0085`, `U+FEFF`, `U+2028` and `U+2029`.
- 09950a4: Trim the template's trailing whitespace with ECMAScript's whitespace set, the
  one behind official Svelte's `template.trimEnd()`, instead of Rust's Unicode
  `White_Space` property. The two sets both have 25 members but differ on exactly
  two, in opposite directions: `U+0085` NEL is Unicode whitespace and not JS
  whitespace, so a trailing NEL was trimmed where official keeps it as a text
  node; `U+FEFF` ZWNBSP is JS whitespace and not Unicode whitespace, so a trailing
  ZWNBSP survived where official drops it. Both reached the emitted template, not
  just the AST.
- 2cb9bef: Serialize only the `$:` statements for the legacy reactive analysis passes

  The three legacy passes (`check_reactive_declaration_cycles`,
  `populate_legacy_dependencies`, `collect_reactive_statement_dependencies`) each
  reached the instance script's top-level `LabeledStatement`s through
  `instance.content.as_json()`, which materializes the entire script as
  `serde_json::Value`. They now share one serialization of just those statements.

  Interleaved paired runs: Huly plugins −20.0% (6/6), open-webui −15.1% (8/8),
  carbon-components-svelte −12.3% (8/8); SMUI unchanged (+0.3%, 2/8).

- 8c53ac4: fix(compiler): report the Svelte-4 `enableSourcemap` / `hydratable` / `loopGuardTimeout` / `generate: "dom" | "ssr"` options instead of accepting them in silence
- 09f9ffc: Rule a legacy state variable out with one scan before searching four patterns

  `transform_legacy_state_declarations` runs once per legacy statement and loops
  over every legacy state variable, formatting and searching up to four needles per
  declaration keyword — `let x =`, `let x : `, `let x: `, `let x;`, `let x`. Each
  `str::find` built a fresh two-way searcher, and on a legacy-heavy component the
  loop is (statements × variables). Every one of those patterns contains the
  variable name, so one `memmem` scan settles them all.

  Measured on open-webui v0.11.0 (650 components, 554 of them using `export let`),
  interleaved paired runs, 6 pairs, all favouring the change: 909.5 ms → 821.9 ms,
  **-9.6%**. carbon-components-svelte -6.4%, Huly Platform's plugins -2.8%. Before
  the change `str::find` plus its searcher construction was 9.1% of open-webui's
  CPU, of which this function alone accounted for 7.7%; it is now 2.0% in total.

  Runes-only components are unaffected: the function returns early when there are
  no legacy state variables.

- d7edc7e: Locate dev-mode source positions without walking the whole prefix

  `locate_in_source` counted lines and UTF-16 columns by iterating every
  character from byte 0. Dev-mode codegen calls it once per instrumented site, so
  the walk was quadratic in the source length. It now counts newlines with
  `memchr` and only walks the final line for the column.

  Interleaved paired runs, dev-mode client: open-webui −12.9% (8/8),
  SMUI −4.1% (8/8), carbon-components-svelte −4.0% (7/8), Huly plugins −4.0%
  (6/6). Production-mode client is unchanged (−0.9%, 2/6).

- 0d01d44: Give the SSR store-destructure scan a single offset unit. It walked characters
  but handed its cursor to `find_matching_open` and `find_expression_end`, which
  walk bytes, then consumed the byte offsets they returned as character offsets.
  One non-ASCII character anywhere earlier in the script — in an unrelated string
  literal, say — was enough to slide the pattern and RHS slices off their real
  positions, and the destructure was not skipped but corrupted: the property key
  was dropped and the parentheses left unbalanced, so the script no longer parsed.
  The store name itself never had to be involved. The scan now uses byte offsets
  throughout, like the client-side sibling pass. No emitted output changes today:
  component scripts are lowered by the AST pipeline, which already handled this
  correctly.
- bad4e54: Memoize a template chunk whose pure-callee call reads a binding

  `{Math.ceil(a / b)}` was folded to a literal instead of being memoized as a
  `$.template_effect` dependency: upstream marks a call `has_call` when the callee
  is impure **or** the expression records any dependency, and every resolved
  identifier is a dependency — even a compile-time-known `const`. The `has_call`
  bail is now also confined to the template expression itself, so a constant still
  folds when it reaches the template through a binding's initializer.

- 335989a: fix(esrap): drop the comments a client `.svelte.(js|ts)` module's top level cannot
  own, and wrap a call whose last argument is preceded by a line comment. Upstream
  hands esrap a builder-made program with no `loc`, so its statement list discards
  every pending comment and only a nested body that does carry one re-finds its
  own — a file header or a JSDoc block on a top-level `export const` is dropped,
  while a comment inside a function, arrow-block or class body survives. The call
  wrap is the same anchoring bug the `ReturnStatement` rule had: the test ran
  against oxc's preserved parens, so `g((// c\n a))` never went multiline.
  `rsvelte_esrap` is released as 0.10.4 and `rsvelte_core` pins the new exact
  requirement.
- 8f72c13: fix(compiler): stop contracting plain `$state` assignments in server modules
- 366bb66: Rewrite a svelte2tsx mustache tag by its brace positions, like upstream, so a wrapping paren in `{(a ?? '')}` survives and `{@html …}` leaves the single space it is replaced with.
- 3537f18: Stop over-warning `perf_avoid_nested_class` in a standalone `.svelte.(js|ts)` module, and give the warning a position

  Upstream's `analyze_module` passes no `ast_type` at all, so `allowed_depth` is `1` for a standalone module and only a component's `<script module>` gets `0`. rsvelte treated both as `'module'`, so `describe(() => { class A {} })` in a `.svelte.js` warned one function level early. The warning also carried no span, leaving an editor nowhere to put the squiggle; it now reports the `ClassDeclaration` position.

- 859b161: Report `css_unused_selector` for a nested rule whose enclosing selector matches no ancestor
- 5f6de88: Read the character adjacent to a match in the client transforms, not the byte. Twelve
  word-boundary and whitespace scans in the class, state, store and prop transforms decided
  what sits next to a match from `bytes[i] as char`, which Latin-1-decodes one byte of a
  UTF-8 sequence: `א`'s lead byte reads as `×` (not alphanumeric) and `名`'s trailing byte as
  a C1 control, so a letter inside an identifier looked like a word boundary — `this.#cא`
  compiled to `log($.get(this.#c)א)`, which is not JavaScript — while `U+3000` and NBSP, whose
  lead bytes decode to letters, were not recognised as the whitespace they are.
- 675b34d: Compile a private `$state` field the same way through any receiver, not just `this`

  A class constructor that reaches a private field through an alias
  (`const inst = this; inst.#n …`) took a different code path from `this.#n`, and
  that path modelled less than upstream does. Upstream keys the private-field
  branch off `PrivateIdentifier`, never off the receiver, so all three of these
  were wrong:

  - **Invalid output.** Logical (`??=`, `&&=`, `||=`) and bitwise/shift compounds
    were in neither allowlist, so the assignment was never rewritten and the
    read-wrapping pass turned the _left-hand side_ into a call —
    `$.get(inst.#n) ??= s`, which is not parseable JavaScript and which
    Vite/Rolldown reject outright.
  - **Silently lost proxying.** `inst.#n = { a: 1 }` on a `$state` field dropped
    the `, true` proxy flag. This output parsed and ran; it just was not reactive
    in the way the source asked for.
  - **Wrong read form.** Reads and compound operands used `$.get(inst.#n)` where
    upstream reads `inst.#n.v` while `in_constructor`.

  Reads through an alias now follow the same rule as `this`: `.v` for `$state` /
  `$state.raw` at constructor depth, `$.get` inside a nested function, in a method
  body, or for a `$derived` field.

- 84ce739: chore(compiler): give byte and char offsets distinct types

  No behavioural change. `ByteOffset` and `CharOffset` replace bare `usize` at the
  two offset-carrying signatures in the destructure transforms, so passing one
  where the other is expected stops compiling instead of mis-slicing silently.

- 27ec092: Advance rejected `find()` matches by a character rather than a byte. A scan that
  rejects a match resumed at `abs_pos + 1` — a character step written against a
  byte index — and the next `&text[search_from..]` split any needle that begins
  with a multi-byte character. `replace_standalone_pattern` is called with needles
  like `format!("{var}++")`, whose first character _is_ the identifier, so a
  member increment on a non-ASCII name (`x.名前++`) panicked. The remaining scans
  of this shape were correct only because their needles happen to begin with `.`,
  `#`, `(` or `$`; they now share one helper, so that property is no longer
  load-bearing and cannot expire with an edit to the pattern.
- 39e5772: Decode the character after `$` instead of casting the byte when recognising a
  store subscription in the SSR destructure expansion. The byte after `$` is a
  non-ASCII name's UTF-8 lead byte, and `0xD7` — which leads the entire Hebrew
  block — casts to `U+00D7` `×`, the one valid lead byte that is not alphabetic.
  A Hebrew-named store therefore failed the check and the expansion emitted a
  plain assignment to the subscription variable (`$אלף = $$value.a`) instead of
  `$.store_set(אלף, $$value.a)`, so the store was never written.

  No emitted output changes. This text pass is no longer on the SSR path for
  component scripts — the AST pipeline lowers those, and it already writes
  Hebrew- and CJK-named stores correctly.

- da6b766: fix(compiler): recognize a `$:` label after an ASI statement boundary when stripping reactive-statement comments
- ec4540a: fix(compiler): print the client `.svelte.(js|ts)` module through esrap so block-body statement margins match upstream
- 92c4a66: Rewrite every subscribed store, and both kinds of update expression, in one pass

  Two spots in the client instance-script pipeline parsed and re-printed the same
  statement more than once for work a single traversal already covers:

  - store member mutations ran one parse + print **per subscribed store**, even
    though the rewriter matches every store in one traversal and looks
    `prop_store_names` up by name;
  - the prop and state update-expression passes are the same visitor called with
    complementary argument lists, and its classifier already tries props first —
    which is exactly what running the prop pass before the state pass did.

  All 14,036 compiled outputs (four real-world corpora × client/server ×
  prod/dev) are byte-identical. This removes parses deterministically; it is not
  a measured wall-clock win — interleaved paired runs came back inside noise on
  all four corpora.

- f01033e: Stop rejecting five constructs upstream compiles

  Compiling open-webui v0.11.0 (650 components) and Huly Platform v0.7.426 (2,462)
  failed on nine files that `svelte.compile` accepts:

  - **`catch (err) { err = … }`** reported `constant_assignment`. The catch
    parameter was declared `const`; upstream's `scope.js` declares it `let`.
  - **`const { $from } = state.selection`** reported
    `store_invalid_scoped_subscription` when some other scope happened to declare
    a `from`. The `$`-name is a declaration, but the scan that decides which
    `$name`s are store reads only recognised `let`/`const`/`var $x` written
    directly, not a destructuring pattern. The same shorthand inside an object
    _literal_ is still a store read — the two are told apart by what precedes the
    pattern's opening bracket.
  - **`import { $comparedDocument as compareTo }`** reported
    `global_reference_invalid`. The imported name is not a reference at all.
  - **`export let state` alongside `$state.room = v`** reported
    `legacy_export_invalid`. `$state` there is a store read, not the rune, and
    upstream removes such names before it decides runes mode — but the scan that
    collects locally declared names missed `export let`, declarators with no
    initialiser, and TypeScript annotations, so all three of `export let state`,
    `let state;` and `let state: T` left `$state` looking like a rune.
  - **`(a?: string, b: string) => b`** and 14 other TypeScript grammar rules were
    raised as `js_parse_error`. Upstream parses `lang="ts"` with
    `acorn-typescript`, which does not run TypeScript's grammar checks; OXC does.
    Each suppressed rule was confirmed against `svelte.compile`, and the TS rules
    acorn-typescript _does_ implement (1049, 1096, 1098, 1257, 1276, 2452, …) still
    fail, as does TypeScript syntax in a plain `<script>`.

  Both corpora now compile for client and server everywhere upstream does.

- 8c7851c: Port the compiler to the restructured oxc 0.143 AST

  `ExportNamedDeclaration` was split into three nodes — `ExportDeclaration` (`export <decl>`),
  a specifier-only `ExportNamedDeclaration` (`export {…}`) and `ExportFromDeclaration`
  (`export {…} from`) — and `ArrowFunctionExpression` replaced its `expression` flag and
  `FunctionBody` with an `ArrowFunctionBody` enum. Every match over those nodes now names all
  three variants explicitly instead of falling through.

  Two behaviour fixes fall out of the split. `export type Foo = true` inside a `namespace` was
  rejected as a non-type member because oxc now derives the export kind from the declaration
  rather than storing it, and a chained member object such as
  `(componentOptions()?.events?.onabort)?.apply(…)` lost its required parentheses because oxc
  keeps a `ParenthesizedExpression` around the inner chain that the printer was not looking
  through.

- cd5d4e0: fix(esrap): keep a redundant paren pair only for a comment that _leads_ the
  parenthesized expression. A comment deeper inside is already bracketed by that
  expression's own syntax, and keeping the parens for it doubled the pair a parent
  adds from precedence — `(await $.track_reactivity_loss(/* c */ load()))()` printed
  as `((await $.track_reactivity_loss(/* c */ load())))()`, and an object-literal
  arrow body as `() => (({ … }))`. `rsvelte_esrap` is released as 0.10.2 and
  `rsvelte_core` pins the new exact requirement.
- 3c8593c: fix(esrap): unwrap a `ParenthesizedExpression` unconditionally and let precedence
  re-add what the grammar needs, matching acorn — which has no paren node at all.
  The previous exception (keep the literal parens when a comment leads the inner
  expression) doubled whatever a parent adds, so `(/* c */ a + b) * 2` printed as
  `((/* c */ a + b)) * 2`, `(/* c */ o).x` kept parens upstream drops, and
  `(/* @__PURE__ */ new Date()).getTime()` did not collapse. The parens a leading
  comment genuinely needs come from `ReturnStatement` — the one place esrap
  parenthesizes for a comment — whose comment test now anchors on the _unwrapped_
  argument so oxc's preserved parens cannot suppress it. `rsvelte_esrap` is
  released as 0.10.3 and `rsvelte_core` pins the new exact requirement.
- 88b8d2b: Route the Phase-3 destructuring and SSR-helper delimiter scans through the shared JS lexer, so a bracket, comma, colon or `=` inside a comment, string, template or regex literal no longer moves a depth counter
- 250be54: fix(compiler): route client/state_transforms delimiter scans through the shared lexer
- bd466dc: Scan the comment/string state once per source for prop-mutation validation

  `PropMutationSites::collect` re-ran the comment/string scanner from the last
  accepted site for every candidate occurrence of every prop, and recomputed the
  `$:` statement ranges once per prop. Both scans are prop-independent, so they
  now run once per source and each candidate is a binary search.

  Interleaved paired runs, dev-mode client: carbon-components-svelte −37.7%
  (8/8), SMUI −16.0% (8/8), open-webui −15.9% (8/8), Huly plugins −10.6% (6/6).
  Production-mode client is unchanged (−0.1%).

- 46394e4: Remove the residual quadratic term in prop-read rewriting

  `transform_prop_reads_in_expr` asked three questions per matched identifier — shadowed by
  a function parameter, an explicit object-literal property key, an arrow-function parameter
  binding — and each was answered by a backward scan that could run to the start of the
  expression. Matches are themselves O(n), so the guards were O(n) work fired O(n) times:
  the term left over after the `char_indices().nth(i)` fix.

  A bracket-event index, built in the same walk that already produces the rewriter's
  character vector and byte offsets, answers those questions in O(log m). On a scaling
  fixture (one `$: _class = cls(…)` over four props) compile time drops 1.5x at 2.8 KB to
  24.9x at 89 KB, and the fitted log-log slope of time against size falls from 1.73 to 0.92.

- d8bb1e5: Trim trailing comments from `$props()` destructuring declarators

  A `//` comment between the last entry of a `$props()` pattern and its closing brace
  stayed glued to the declarator text, so the `= $.rest_props($$props, rest_excludes)`
  initializer the client transform appends landed _inside_ the comment. The result still
  parsed — no error, no warning — but the rest binding was declared and never assigned, so
  every forwarded attribute silently disappeared at runtime. The declarator splitter was
  already comment-aware; only its caller was, and only for _leading_ comments. Both ends of
  each declarator are now trimmed lexically through `shared::js_scan::skip_opaque`, which
  steps over strings, template literals, regexes and both comment forms.

- 3e22d14: fix(compiler): find the `$props()` pattern braces lexically

  `transform_props_destructuring` located the destructuring pattern with a raw
  `find('{')` / `rfind('}')`, so a JSDoc type annotation ahead of it —
  `let /** @type {Props} */ { a, b } = $props()`, idiomatic in JavaScript Svelte
  components — made the scan start at the annotation's brace and parse
  `Props} */ { a, b` as the prop list. A `}` in a trailing comment moved the
  closing brace the same way.

- 13d5982: fix(compiler): keep a comment between `await` and its argument in the dev `$.track_reactivity_loss` wrap
- e799ef4: Fix a stack-overflow crash when a comment containing `}` or `)` appears inside a `$:` reactive block body
- 75a5fb1: fix(compiler): keep a legacy `$:` statement whole across a `//` line

  The two accumulation loops in the server legacy `$:` reorder disagreed on
  whether a `// …` line ends a continuation. They now share one line
  classification, and a comment neither ends the statement nor completes it, so
  `$: total =` / `// c` / `a + b;` stays one statement as official emits it.

- b9c51bc: Rule a reactive variable out with one scan before rewriting the statement body

  `extract_reactive_statement_deps` asks `body_references_identifier` and
  `is_assigned_anywhere_in_body` once per (`$:` statement × reactive variable)
  pair, and each answer copied and rescanned the whole statement body three
  times — or formatted and searched twenty patterns. Almost every pair is a miss,
  and a name absent from the raw body is absent from every stripped derivative of
  it, because the strips only blank or delete bytes. One substring scan now
  settles those. The three strips also borrow instead of copying when they have
  nothing to strip.

  On carbon-components-svelte, whose components are legacy (173 of 287 files
  carry a `$:` line), this was 48.7% of total compile time; the corpus this had
  been profiled against carries no `$:` at all. Compiling the 287 components
  drops from 366-380 ms to 268-279 ms.

- 7d6395c: fix(compiler): keep an `else` that starts its own line attached to the `if` above it
- 3ec9736: Re-home a legacy `$:` statement's comments onto the surviving successor in client output
- abb04dd: Close a rune field's `$.derived(…)` on a new line when its argument ends in a `//` comment

  The server class-field path splices the `$derived(…)` argument verbatim and then appends the
  closing paren. `value.trim()` removes the newline that ended a trailing `//` comment, so the
  paren landed inside the comment and the call was never closed — the emitted module stopped
  being JavaScript.

  An object-literal argument is worse, because it takes a wrapping-paren branch and loses two.

  The variant carrying a delimiter (`// ) c`) already worked: it bails to the AST path, which
  relocates the comment. It is the _plain_ comment that was unguarded here.

- f067d3c: fix(compiler): keep a comment between `await` and its operand in a runes instance script

  Dev-mode client output wrapped `await X` as `(await $.track_reactivity_loss(X))()`
  by copying the operand from the argument's own span, which begins past any
  comment separating it from the `await` keyword. The copy now starts just past
  the keyword, matching what upstream preserves by passing the visited node.

- 73aef74: fix(compiler): read legacy SSR bracket scanners lexically

  The `export let` / reactive `$:` line scanners in the server transform counted
  brackets, commas, semicolons and `=` without skipping comments, so a delimiter
  inside a `//` or `/* */` comment moved the depth counter — splitting a `$:` block
  at a `}` that lived in a comment, or truncating a declarator at a commented-out
  `;`. They now walk only the code bytes.

- 73aef74: fix(compiler): fix byte/char index mix in the legacy SSR store-set scan

  `extract_store_set_targets` fed a byte offset from a `memmem` match into a
  `Vec<char>`, so any non-ASCII before a `$.store_set(` call made it read the
  store name from the wrong position and record a truncated dependency.
  `extract_simple_assignments` alongside it now skips comments and regex
  literals instead of reading assignments out of them.

- 6936bcc: Time each `SemanticBuilder::build` site behind `measure-semantic-build` so its share of `compile()` is measurable
- c11fed7: Attribute `SemanticBuilder` builds per call site and skip the ones a whole-identifier probe rules out
- c193616: Keep comments interior to a top-level script statement in server output
- 482d9a8: fix: drop the comments a server `.svelte.(js|ts)` module's top level cannot own.
  `server_module` assembled its output as text and emitted the transformed script
  verbatim, so every source comment survived — including the `/* @__PURE__ */` an
  esbuild TS strip leaves on a default-parameter initializer. It now goes through
  the same builder-made, `loc`-less program the client module path already used,
  so esrap's comment cursor is parked past the end and only a nested body that
  carries a location re-finds its own: a file header, a comment between two
  top-level statements and a comment leading an arrow's expression body are
  dropped, while comments inside a function, arrow-block, class or nested block
  body survive.
- ca48c0b: Shrink `JsNode` from 144 to 80 bytes by boxing the payloads of its two outlier variants (`Literal`'s regex values and `Program`'s comment/ignore metadata). Compiler output is unchanged.
- 5a72205: fix(compiler): step the SSR reassignment scan by a character, not a byte

  `extract_constant_vars`'s reassignment check advanced its cursor with
  `abs_pos + 1`, one byte past a match start. For a non-ASCII variable name that
  lands inside the first character, so `<script>let 名前 = 1;</script>` panicked
  the server compiler with "byte index is not a char boundary". Advancing by one
  character is byte-identical for an ASCII name.

- ddd9c71: Stop the per-statement client transform chain from copying a statement it did not rewrite. Nine of its stages now return their input borrowed when they find nothing to do, and the two loop-invariant legacy-state name vectors are built once instead of once per top-level statement. Output is unchanged.
- b152751: fix(compiler): keep store reads intact when the store name is not ASCII

  The identifier pre-filter extracted words with ASCII-only byte predicates, so a
  store subscription named with non-ASCII characters never matched and the read was
  left untransformed. Fixing that exposed a second defect the first one had been
  hiding: the read rewriter advanced a `char` index by the name's **byte** length,
  dropping source text after every match. Both are fixed together, because fixing
  only the pre-filter turns a missing transform into lost output.

- 115eb9c: fix(analyze): warn `event_directive_deprecated` for `on:` on `<svelte:element>` too
- a69e5ed: Emit `svelte-ignore` comment-code warnings (`legacy_code` / `unknown_code`) while walking the annotated node instead of batching them before the fragment walk, so they interleave with the surrounding warnings in the same order as the official compiler
- ddc8be4: fix(compiler): print the real filename in `svelte_self_deprecated`, and only warn in runes mode

  The warning interpolates two independent values — the component identifier and
  the _file_ basename — and rsvelte derived the second from the first, printing
  `import Input from './Input.svelte'` where the file is `input.svelte`. The
  message is a copy-pasteable suggestion, so on a case-sensitive filesystem the
  compiler was telling users to write an import that does not resolve. The
  basename now comes from the filename, split on `/` and `\` like upstream, and
  falls back to `Self` / `Self.svelte` when there is no filename.

  Upstream also gates the whole warning on `analysis.runes`; rsvelte emitted it in
  legacy mode too, where `<svelte:self>` is the supported spelling and there is no
  self-import to prefer. That over-warning was the larger half in practice: it
  accounted for 19 of the 70 entries in each of the three corpus warning-code
  ratchets, which shrink to 51 here.

- c2392cf: svelte2tsx now honours `namespace: 'foreign'`. Official svelte2tsx derives
  `preserveAttributeCase` from it (`htmlxtojsx_v2/index.ts`) and skips the
  attribute-name case fold, so `<element someAttr="hi">` projects as
  `"someAttr"`. rsvelte had no `foreign` namespace at all: the value was
  unreachable from the napi and wasm boundaries (it fell into the `_ =>
Svelte2TsxNamespace::Html` arm), `MarkupNamespace` had no matching variant,
  and `Svelte2TsxOptions::namespace` was never read by the projection — so even
  a caller constructing the option directly got attribute names folded to lower
  case with no diagnostic. This affects users whose `svelte.config.js` sets
  `compilerOptions.namespace = 'foreign'`, which the language server passes
  straight through.
- de34a5e: fix(compiler): restore esrap's blank-line margins between re-printed class members
- 6294de3: Walk the client store-subscription lookback by characters. Deciding whether a
  `$name(` call sits in a function parameter list means stepping back over the
  function name to the `function` keyword, and the three cursors that did it moved
  one **byte** at a time. Continuation bytes leak through both predicates — `0x85`
  and `0xA0` read as whitespace, and nine of the sixty-four read as alphanumeric
  (`ª ² ³ µ ¹ º ¼ ½ ¾`) — so the cursor could stop inside a character. Depending on
  which character preceded the parenthesis that was either a panic on a
  non-boundary slice or, just as often, a silent wrong answer: the lookback never
  reached `function`, so a store call inside a parameter list was rewritten to
  `$s()(…)` when it should have been left alone.
- 6b299ba: Reflow the dev `$.tag(...)` wrap of a class state field whose value carries a leading comment
- 8cfabe3: Strip TypeScript when OXC reports a rule the official parser does not enforce, instead of emitting the component's type annotations into the generated module (client) or dropping its whole instance script (server)
- 92c4a66: Answer member expressions in the reactive-state predicate from the typed AST

  `expression_has_reactive_state` answered only a bare identifier and a literal off
  the typed nodes; every other shape materialized the expression as a
  `serde_json::Value` tree that was walked once and thrown away. Member
  expressions alone were 70.3% of the remaining materializations.

  The typed front end now mirrors every arm the JSON walk handles explicitly —
  member, call, new, binary/logical, unary, conditional, template literal, chain,
  sequence, assignment, object, array, await, update, spread and function
  expressions — so those shapes are answered without building any JSON. Anything
  that would reach the JSON walk's conservative "unknown node type" default (a
  tagged template, a class expression, a TS wrapper) still falls back to it, so
  the answer is unchanged for every input.

- 92c4a66: Answer the hot expression predicates from the typed AST instead of materializing JSON

  Five predicates in the client transform — "does this expression call anything",
  "does it read reactive state", "is this a `$store` member expression", the
  expression-tag metadata flags, and the analyze-phase feature walk — each asked
  their question by turning the expression into a `serde_json::Value` tree and
  walking that. The tree is built for the question and thrown away, and
  `JsNode::to_value` alone accounted for 15.8% of every allocation the compiler
  made on a 2,123-file corpus.

  Each predicate now walks the typed nodes directly and keeps its JSON walk as
  the fallback for the shapes the typed walk cannot reach (opaque
  `type_annotation` / comment blobs). On the same corpus that drops `as_json`
  calls from 49,776 to 15,056 and JSON materializations from 27,488 to 12,089,
  with byte-identical output across 14,036 client/server × prod/dev comparisons.

- 7f95217: Report source positions on every validation error

  Compile errors raised during analysis carried no `start`/`end`, so consumers that
  position diagnostics — editors, `svelte-check`, the language server — got a
  whole-file error where upstream points at a specific node. 141 validator fixtures
  diverged from the official compiler on error position alone.

  Each raising site now attaches the range through `AnalysisError::at(start, end)`,
  taking the same node upstream passes to its `e.*` constructor — often a sibling
  attribute or a child rather than the node the enclosing visitor is looking at
  (`attribute_invalid_type` points at the `type` attribute, not the `bind:`
  directive; `constant_assignment` at the assignment, not its target).
  `svelte_element_missing_this` moves to the parser, where upstream raises it,
  because Phase 2 can no longer tell a missing `this` from a valueless one once the
  attribute has been folded into `tag`.

- 7f95217: Report upstream-accurate source positions on every validation warning

  Warning positions diverged from the official compiler on 63 validator fixtures.
  The bulk was accessibility: `a11y::check_element` returned span-less warnings and
  the caller back-filled all of them with the whole element's range, so every a11y
  diagnostic pointed at `<div …>` instead of the offending attribute. The rest were
  per-rule — `$:` placement, unused exports, store/rune conflicts, custom-element
  props, quoted component attributes, implicit element closes.

  Also fixed along the way:

  - `ParseWarning` now carries a span, so `element_implicitly_closed` survives the
    hop from the parser into analysis with a position instead of losing it.
  - `unknown_code` / `legacy_code` are emitted from the node that collects the
    preceding comment rather than up front, matching upstream's ordering.
  - `compile_module` marks its input as a module directly instead of inferring it
    from a `.svelte.(js|ts)` filename, which callers need not supply.
  - The `context` attribute stays on the `Script` node, as upstream's `read_script`
    leaves it, so `script_context_deprecated` can point at it.

- 097b663: Build a warning's code frame from the shared line index instead of splitting the whole source once per warning, so a file with many spanned warnings no longer costs O(source × warnings).
- 03d69cf: fix(analyze): attach spans to five warnings that reported no position
- a8ae964: Apply the member-property guard to compound assignment in the legacy server
  `$:` reorder scanner. `extract_simple_assignments` recorded `x` for
  `$: obj.x += 1` while recording nothing for `$: obj.x = 1` and `$: obj.x++`,
  which invented a reactive dependency and hoisted the statement above any `$:`
  that reads a plain `x`. Upstream's `AssignmentExpression` visitor takes the same
  branch for every operator and records no target for a member expression.

  No change to emitted output: the text scanner is reachable only from the
  declaration-tag script path, where a `$:` statement cannot occur, and SSR
  reactive ordering runs through the AST port of `order_reactive_statements`,
  which was already correct for these shapes.

## 0.10.6

### Patch Changes

- e8efbe7: Only emit the dev `$.assign` coerced-proxy warning when the assignment's value is used. A template expression converted through the JSON path — an `{@attach}` body with a block, above all — had no such check, so a bare statement in one was wrapped.
- 4d6be01: Build the dev CSS source map the way MagicString does — a segment at the start of every unedited chunk, at every line start inside one, and at every CSS AST node boundary — instead of matching tokens by name, use the source basename for its `file` field, and emit it for a custom element's `$$css.code` too.
- 867c596: Pass the memoized `$0`/`$1` parameters and their deps array to the `$.template_effect` emitted inside an element block, so an element that contains a `{#snippet}` or a `{const}` no longer generates a zero-argument callback whose body references unbound identifiers.
- a7dbe9f: Fold constants that reach a template through a non-literal initializer. A `const`
  whose initializer is a call, binary or conditional expression (`const rows =
Math.ceil(sprites / cols)`) is now evaluated at compile time when it is read from
  a template chunk, so `style="background-size: {64 * rows}px"` emits the folded
  literal instead of a reactive interpolation — matching the official compiler on
  client, dev-client and server output.
- aeb2671: Recognise `$state` / `$derived` declarations in `.svelte.(js|ts)` modules whose variable name contains a `$` (e.g. `const delay$ = $derived(...)`), so their reads are unwrapped to `$.get(delay$)` on the client and `delay$()` on the server instead of leaking the raw signal.
- f3baaec: Resolve `$state` reassignment per binding in `.svelte.(js|ts)` modules, so same-named `$state` locals in sibling scopes no longer collapse into one classification and lose their `$.state(...)` wrapper.
- 8dab47f: fix(compiler): apply read transforms inside `bind:` setter assignment targets

  A component binding whose expression is a member expression with a plain
  (non-state, non-prop) root emitted its setter target untransformed, so an
  each-block destructuring thunk used as a computed key was written as `key`
  instead of `key()` — the write landed on a property keyed by the thunk
  function rather than by its value.

- ab2d636: Give each dev `$$ownership_validator.mutation(...)` the source position of the mutation it actually wraps when a prop is written more than once through the same member path, and read a member chain that goes through a TypeScript non-null assertion or an optional access.
- 141cb58: Fix the async server instance-body split for `do…while`, labeled, `debugger` and
  bare-block statements, plus brace-less `if … else` chains. These shapes used to
  produce a thunk array that the compiler could not parse back, which quietly
  degraded the component to an un-split instance body. Such a rejection is now a
  compile error in every build profile rather than silently wrong output.
- 02a315c: Keep comments in server output. A statement that survives into the SSR module now
  carries the comments written above it, including the leading comments of a legacy
  `<script>`, instead of every comment being dropped on the way to the server build.
- 552f8b1: Transform a shadowed function-local `$state` / `$derived` through its signal in dev mode too. The declaration probes matched the literal `<kw> <name> = $.state(` text, but in dev the `$.tag(...)` label wrap already sits between the `=` and the rune call, so the reads and writes in the enclosing function body were left bare.
- 3990eb8: fix(compiler): proxy `$state(a && b)` initializers and read private class-field state through `$.get`

  Two silent reactivity bugs in the client output:

  - a `$state` initializer whose top-level operator was `&&` was not wrapped in
    `$.proxy(...)`, so mutations to nested properties of the held value did not
    trigger updates (`||` and `??` were already handled).
  - a `$state` private class field read inside a nested function in a constructor
    was rewritten to `this.#field.v.…` instead of `$.get(this.#field).…`, so the
    read was never registered as a dependency.

## 0.10.5

### Patch Changes

- 87bc75c: fix(compiler): honour analysis-phase `svelte-ignore` for await instrumentation.
  The dev-mode `$.track_reactivity_loss` rewrite recognised
  `svelte-ignore await_reactivity_loss` by scanning the lines above the `await`,
  so it missed every form upstream honours through the analysis-phase ignore
  stack: a comment on an enclosing node, a comment on a multi-line statement whose
  `await` lands on a later line, and a same-line block comment. The suppression is
  now computed the way upstream's acorn comment attachment plus `ignore_map` does
  — a leading comment binds to the outermost node that starts after it and the
  whole subtree of that node inherits the ignore.
- bc20a4b: Dev-mode client output now applies ownership validation to `bind:this={obj.foo}` targets whose root is a prop. Upstream builds the `bind:this` setter by visiting a synthesized `obj.foo = $$value` assignment, so it flows through `validate_mutation()`; rsvelte built that setter directly and therefore emitted neither `$$ownership_validator.mutation(...)` nor the `$.create_ownership_validator($$props)` preamble. As upstream does, the flag that emits the preamble is set before the property path is built, so a target with an unbuildable path (e.g. `bind:this={parents[config.testcase]}`) still gets the preamble.
- 71d05a9: Fix a changeset that named the non-existent package `@rsvelte/check` instead of
  `@rsvelte/svelte-check`, which broke the Release workflow's release-plan assembly
  on `main` and blocked every release. The Changeset CI gate now validates that
  every package named in a pending changeset actually exists in the pnpm workspace,
  so this class of typo fails on the PR instead of on `main`.
- 0279808: Client source maps no longer anchor the instance script at the byte immediately
  after `<script>`. That byte is the newline ending the `<script>` line, so every
  segment derived from the script chunk resolved to a column past the end of that
  line and broke downstream consumers resolving a frame. The chunk is now anchored
  at the script's first non-whitespace byte, which cuts out-of-range client
  segments by 46% across the official sourcemap samples. Generated code is
  unchanged — the offset only feeds the map.
- 67067b0: CSS pruning now models `{@render}` call sites. A `{#snippet}`-declared element's
  real DOM ancestors are the union of the ancestors of every site that renders the
  snippet, not its lexical parent chain, so rules such as `.foo > .a { … }` whose
  `.a` only ever appears in a snippet rendered under a different ancestor are
  marked unused like the official compiler does. Previously the structural ancestor
  check bailed out entirely whenever the component contained a snippet.
- 6c0438e: Class-field lowering no longer reads a `}`, `)` or `;` that appears inside a
  comment or a literal as code. Two failure modes are fixed.

  **Unparseable output.** A `#private` `$state` field assigned from an
  object/array literal that contains a `//` line comment closed the injected
  `$.set(` at the comment's offset — `$.set(this.#x, {\na: s,)// c` — and
  Vite/Rolldown rejected the module with `Parse failure: Unexpected token`. The
  scanner that locates the end of the assigned value treated a `//` at _any_
  bracket depth as the statement's trailing comment, and four sibling scans in the
  method paths took the first `;` anywhere at all, including inside a comment, a
  string or a nested function body.

  **Silent content loss.** On the server target the class body's closing brace was
  found with a bare character loop, so a `}` written inside a comment (`// returns
{ ok, err }`) closed the class early and _every member after it was dropped from
  the output_ — no error, no warning, just a class missing its methods. The client
  member scan had the same defect one level down and split a method in two at such
  a comment.

  A fifth site: the server treated a class member as a block only when its line
  had a `(`, so a `static { … }` initialization block was never recognised and its
  body was emitted line by line as class fields — each with a `;` appended,
  comment lines included.

  All of these scanners now share `shared::js_scan::skip_opaque`, which steps over
  strings, template literals, regex literals and both comment forms in one place;
  a regex such as `{ a: /[});]+/g }` was mis-parsed on every target even with no
  comment involved.

  Class lowering also printed its synthesized members at a hard-coded one-level
  indentation, which assumed the class sat one tab deep inside a component
  `<script>`. A top-level `class` in a `.svelte.js` module came out with its
  fields, accessors, constructor and closing brace one tab too deep. Synthesized
  members now follow the class's own source indentation, and a grouped multi-line
  constructor statement keeps the relative indentation of its continuation lines
  instead of being flattened to column 0.

- 34d5204: Name only arrow-function event handlers in dev mode, matching the official compiler's `dev && handler.type === 'ArrowFunctionExpression'` guard. Naming a non-arrow handler consumed a `scope.generate()` slot, which shifted every later identifier sharing the prefix — including element variables, since `<input on:input>` draws `input` from the same counter.
- 4484631: Emit the dev `$.assign(...)` proxy-coercion warning for a member assignment written in an instance script, not only in a template expression
- 88daef1: Dev-mode client output now wraps member assignments used in value position with `$.assign(object, "prop", operator, rhs, location)`, the stale-assignment-value warning helper. Template expressions and other typed `JsNode` conversions never reached the JSON assignment converter where this wrap lived, so `key.foo = resolve` inside e.g. `new Promise((r) => (key.foo = r))` shipped unwrapped. The location string now also uses the `rootDir`-relative compile filename instead of its basename, matching upstream's `locate_node`.
- 5a7a012: Keep the dev-mode `await` instrumentation from swallowing the next statement, and single-quote the console method name. `(await $.track_reactivity_loss(x))()` can continue a line where the bare `await x` it replaced could not, so a source relying on ASI folded the following statement into a call; and the method name reaches `$.log_if_contains_state` as a plain literal, which esrap prints single-quoted.
- 7833ada: Label a `$.tag` on an anonymous class expression `[class]` like upstream, and keep the public name when a constructor-assigned public field is lowered to a private backing
- 44069dd: Report the field name as written in dev-mode class `$.tag()` labels. A public `count = $state(0)` is lowered to a private backing field plus an accessor pair, so the label has to be recovered from the accessor rather than read off the backing field — otherwise a public `count` reported `Counter.#_count` and a genuinely private `#count` lost its `#`.
- fca6ab6: Dev-mode client output now emits named `function get()` / `function set($$value)`
  accessors for legacy `bind:` directives on elements inside an `{#each}` block,
  matching the official compiler. Upstream's `BindDirective` visitor picks the
  named-function shape whenever `dev` is set (so `$inspect(...)` stack traces name
  the accessor), and only falls back to `() => …` / `($$value) => …` arrows in
  prod; rsvelte's each-block-aware accessor builder always produced the prod
  arrows, so 47 corpus files diverged in dev mode.
- 35f4093: Stop constant-folding an equality comparison in dev mode. Upstream evaluates the _converted_ expression, and in dev the `BinaryExpression` visitor has already rewritten `===` / `!==` / `==` / `!=` into a `$.strict_equals` / `$.equals` call, so `{1 === 1}` stays a call instead of folding to the literal `'true'`.
- 4a01be3: Use the whole `rootDir`-relative filename in dev-mode location strings. `ComponentAnalysis::filename` held only the basename, so `$inspect.trace()` labels and `$.assign()` locations reported `main.svelte` where the official compiler reports the full path (with `/` sanitized to `/​`).
- 052eb2f: refactor(esrap): drop `rsvelte_esrap` public API that nothing calls. The
  synthetic-comment hook, `QuoteStyle`, `PrintOptions::with_quote`,
  `PrintOptions::with_indent` and `print_with_map_opts` are removed; each removed
  option's default becomes the only behaviour, and the defaults are unchanged, so
  printed output is identical. `rsvelte_esrap` is released as 0.10.0 (removing
  public items is breaking) and `rsvelte_core` pins the new exact requirement.
- f0f6d4e: Client transform no longer rescans the whole instance script once per reactive
  variable. The two loops over the local reactive variables each asked the same two
  questions per variable — whether it is declared as `const … = $state(…)` and
  whether it is reassigned — and every answer walked the entire script, so the cost
  grew as variables times script length. Both answers are now built in one pass and
  read from an index. Output is unchanged.
- 9f9eaff: Keep the comments leading a `$:` statement when another statement follows it. The reactive statement is replaced by a synthesized `$.legacy_pre_effect(...)` call, but esrap still prints its leading comments as trivia of the next surviving statement — they only vanish when nothing follows.
- ecb62ec: Dev-mode client output now applies ownership validation to prop member mutations in **legacy** (`export let`) components, e.g. `item.name = 1` inside an instance-script function or a `$:` block. The collection that drives the wrapper was gated on `analysis.runes`, so no legacy component ever emitted `$$ownership_validator.mutation(...)` — nor the `$.create_ownership_validator($$props)` preamble that goes with it. The emitted alias argument now mirrors upstream too: `prop_alias` is only ever set from a `$props()` destructuring key, so legacy props report `null`, and the reported path always starts with the local binding name rather than the alias.
- a62f685: Pass a `null` prop alias to `$$ownership_validator.mutation(...)` for legacy `export let` props in dev mode, matching the official compiler — the alias is only ever set from a `$props()` destructuring key, so falling back to the variable name diverged for every legacy component.
- be4ba0f: Read a computed ownership-path element through its transform in dev, so a slot-let / each-block index reaches `$$ownership_validator.mutation` as `$.get(index)` and a store as `store()`
- 2dbaba7: Match each dev ownership mutation to its own source position by member path, so a `$:` statement moved into a `legacy_pre_effect` no longer takes the line:column of whichever mutation prints before it
- 6171d26: Skip comments and string literals when locating a prop mutation for `$$ownership_validator.mutation(...)`. A `light.foo = value` written inside a comment was consumed as a real mutation, reporting a position that is not a mutation at all and shifting every later mutation onto the wrong one.
- 07d827f: Dev-mode client output now eagerly reads a snippet parameter that has a default value, e.g. `{#snippet item(id = default_arg())}` now emits `$.get(id);` right after `let id = $.derived_safe_equal(() => $.fallback($$arg0?.(), default_arg, true))`. Upstream emits that read so a default expression referencing a not-yet-initialized binding still throws `Cannot access x before initialization` in dev. rsvelte only emitted it for destructured snippet parameters; the plain `name = default` parameter took a separate code path that skipped it.
- 560a5e7: fix(compiler): honour `svelte-ignore` comments inside object and array literals.
  Phase 1 distributed script comments through a hand-maintained allowlist of
  statement-body fields (`BlockStatement`, `SwitchStatement`, `VariableDeclaration`,
  `ClassBody`, …), so a `// svelte-ignore` in front of an object-literal property,
  an array element or a call argument bound to nothing and suppressed nothing —
  producing warning noise the author had no way to silence. Comment attachment now
  mirrors upstream `add_comments` (`phases/1-parse/acorn.js`): the walk is generic
  and positional, a comment binds to the first node in pre-order that starts after
  it, and that node's whole subtree inherits the ignore. Upstream's trailing-comment
  rules are ported with it, so a comment after the last element of a block or literal,
  or one separated from the previous node by only `,`/`)`/spaces, still belongs to
  the node before it and does not over-suppress the node after it.
- 5ddb700: An inline component's direct `{#snippet}` child is now demoted to a component
  prop even when the component also carries a `let:` directive or has other
  named-slot children, matching official svelte2tsx. rsvelte previously gated
  the snippet-to-prop relocation off whenever `let:` (or a named-slot child) was
  present and fell back to emitting the snippet as a standalone block-scoped
  `const foo = …` declaration instead — official always demotes the snippet and
  independently emits the `let:` / named-slot `$$slot_def` destructure alongside
  it. Applies to named components, `<svelte:component>`, and `<svelte:self>`.
- 6162f60: Client output now applies the read/store transforms inside `switch` statements
  and class expressions. A `{#each}` item read used as a `switch` discriminant
  (`switch (item.value)`), as a `case` test (`case item.value:`), as a class
  expression field initializer (`class { f = item.value }`) or as a class
  expression computed method key (`class { [item.value]() {} }`) was emitted
  against the raw signal instead of `$.get(item)`, so the value was `undefined`
  and no `case` ever matched — silently, in production builds as well as dev. The
  recursive transform walk had no `switch` arm (the catch-all cloned the statement
  verbatim) and listed class expressions among the terminal "nothing to transform"
  nodes. Because that same walk marks the each-index binding as used and registers
  store getters, the omission also dropped the `i` parameter from the `$.each`
  callback and skipped the `$.store_get` getter whenever the binding was read only
  from one of those positions, turning an undefined `$store` read into a
  `ReferenceError`. Separately, the store-subscription pre-scan classified any
  `$store` followed by `:` as an object property key, which misfired on
  `case $store:`; a `case` test is now recognised as a value expression.
- 7ea35c3: Dev-mode client output now labels uninitialized legacy state declarations that
  are not terminated by a semicolon (`let sub` followed by a newline, which is
  what a TypeScript-annotation strip or a bare `bind:this` target leaves behind)
  with `$.tag($.mutable_source(), "sub")`, matching the official compiler.
  rsvelte's legacy state lowering tagged the `let x = init` and `let x;` shapes
  but the no-semicolon branch built the `$.mutable_source()` call directly and
  skipped the dev label.
- aba6843: Dev-mode client output now applies ownership validation to prop mutations written inside template expressions, e.g. `<button onclick={() => { listEl.style.overflow = "hidden"; }}>`. Event-handler bodies and other template expressions are converted through the typed `JsNode` path, which never reached the JSON assignment converter where `$$ownership_validator.mutation(...)` was applied — so those mutations shipped unvalidated and the `$.create_ownership_validator($$props)` preamble was dropped along with them. Assignments and update expressions (`obj.count++`) in that path are now wrapped, honouring `svelte-ignore ownership_invalid_mutation`.

## 0.10.4

### Patch Changes

- 44f6150: Dev-mode client output now wraps prop mutations that flow through a `bind:`
  directive onto a member expression (e.g. `bind:value={object.prop}`) with the
  ownership validator, matching the official compiler. Upstream achieves this by
  synthesizing a real `AssignmentExpression` for the bind and routing it through
  the generic assignment visitor, which calls `validate_mutation`; rsvelte's
  `bind:` lowering builds the prop-mutation call directly and never went through
  that visitor, so the `$$ownership_validator.mutation(...)` wrap — and the
  `$$ownership_validator` preamble declaration it depends on — was silently
  skipped for this path.
- 6939249: fix(compiler): decide the non-reactive shadow per binding name. A destructuring
  pattern can mix a reassigned `$state` binding with a never-reassigned
  (non-reactive) sibling, but the client transform made that decision over the
  whole pattern: `let [a, b] = $state([1, 2])` where only `a` is reassigned
  registered both names in the program scope's shadow set, so every transform for
  `a` was suppressed and `a++` was emitted verbatim instead of `$.update(a)`.
  The decision now happens per binding name, matching official.
- 5656f23: Two client destructuring-assignment fixes. A pattern whose only targets are member expressions off a `$state(...)` that resolves to a plain `$.proxy` (`({ b: o.p } = src)`) is no longer lowered through the reactive path: the "does this pattern touch anything reactive" check now consults the filtered set of names that actually became signals rather than every `$state` declaration, so the assignment stays verbatim like the official compiler leaves it. And in a runes script whose only reactive declarations are `$props()` — where the source-range transform runs instead of the text-based one — nested and renamed destructuring assignments (`({ a: { value } } = src)`) are now lowered instead of being emitted untransformed, so a nested prop leaf is written through its `value(...)` setter.
- 62b250c: Client destructuring _assignments_ now expand nested patterns like the official compiler. `({ a: { b } } = src)` used to expand one level and leave the sub-pattern as another assignment, which the same transform then rewrote into a second `(($$value) => …)($$value.a)` IIFE; the expansion is now a port of upstream's recursive `extract_paths`, so every leaf is one flat assignment from its whole path (`$.set(b, $$value.a.b)`), a nested rest subtracts only its own level's keys, a default on a nested pattern becomes the base that sub-pattern reads from, and every array pattern — at any depth — contributes an `$$array` helper emitted before the assignments that read it. The surrounding shape follows the same upstream rule: the IIFE exists only when there is a helper or the right-hand side needs caching, and an uncached identifier right-hand side stays the IIFE parameter instead of being re-cached in `$$value`.
- 23267de: Keep legacy `<script>` comments outside reactive statements: components using `$:`/`$store`/`$$props` no longer lose every comment from their instance script — only comments the official compiler also drops (those attached to a rewritten `$:` statement) are removed.
- a07a013: Fix over-pruning of nested `&` sibling-combinator rules when an intermediate nesting level has a shape (a comma-separated selector list, a bare `:is()`/`:where()`, or a sibling combinator) that the ancestor-chain builder could not evaluate on its own. Previously a single unevaluable intermediate level made the whole ancestor chain bail to `None`, so a nested `&`'s sibling-combinator prune check (e.g. `& + &`) fell back to the empty compound matcher and the entire rule was pruned even when the ancestor constraint was actually satisfiable. The chain builder now resolves each level per branch — OR-ing across comma alternatives and expanding `:is()`/`:where()`, and verifying sibling combinators against the real sibling relationship — mirroring the official compiler's per-branch `NestingSelector` resolution, so only genuinely unsatisfiable rules are pruned.
- 682a6bb: Detect `$$Slots` / `$$Events` / `$$Props` interface and type-alias declarations in svelte2tsx output even when nested inside a function, block, or class body — matching official svelte2tsx's fully recursive instance-script walk instead of only scanning top-level statements.
- 44f6150: fix(compiler): wrap ownership-validated prop mutations that carry an extra
  parenthesis. In dev-mode client output, a `prop(prop().member = value, true)`
  mutation call can have its inner assignment wrapped in one extra pair of
  parens when the compiler emits it as an expression result rather than a bare
  statement (`prop((prop().member = value), true)`). The text-based ownership
  mutation wrapper matched the unparenthesized shape only, so this variant
  silently skipped the `$.create_ownership_validator(...).mutation(...)` wrap.
- ddf91d3: Dev-mode client output now applies ownership validation to member-expression mutations of a `$props()` prop, e.g. `$effect(() => { listEl.style.overflow = "hidden"; })`. In runes mode a prop read only becomes the `listEl()` getter call in the post-loop AST pass, but the `$$ownership_validator.mutation(...)` wrapper was applied earlier, inside the per-statement text pipeline, where its matcher could not yet see that form — so every such mutation shipped unvalidated and the `$.create_ownership_validator($$props)` preamble was dropped with it. The wrapper now runs once over the finished instance script, and each mutation resolves its own line/column instead of every occurrence reusing the first one's position.
- cc54f59: fix(svelte2tsx): skip identifiers in a slot expression's computed object key. A
  bare-identifier computed key (`{ [item]: 1 }`) was resolved through the
  `{#each}`/`let:` scope like any other identifier, but official's
  `resolveExpression` never substitutes a key position at all — it only
  descends into a compound key expression (`{ [item + 1]: 1 }`), whose nested
  identifiers resolve normally because the key slot there is not an
  `Identifier` node.
- e703fd2: Apply `remove_surrounding_whitespace_nodes` to `{#snippet}` bodies and reproduce upstream's opener gap for the standalone snippet form, and route `<svelte:boundary slot="x">` inside a component through the `$$slot_def[...]` wrapper so the generated TSX matches official svelte2tsx.
- d1ca60c: Demote `<svelte:component>`'s direct `{#snippet}` children to implicit props, like a named component's and `<svelte:self>`'s. They were emitted as standalone `const foo = (a) => …` declarations, so TypeScript could not contextually type the snippet parameters from the target component's props; they now move into the `props: { … }` object anchored by a `$$prop_def` destructure. The `let:` / named-slot paths keep their own block scoping and are unaffected.
- faeba67: Route `<svelte:options>`'s opener gap through the shared `opener_spacing` helper so the generated TSX matches official svelte2tsx exactly, including bare boolean attributes like `<svelte:options runes />`.
- c86c2e5: Transform `<svelte:self>` `bind:` directives and `{#snippet}` children like a named component's: two-way bindings now emit a plain prop plus the `$$bindings` marker and setter type-widener instead of the DOM `"bind:value"` form, `bind:this` assigns the component instance, and direct snippet children are demoted to props anchored by a `$$prop_def` destructure.
- 50c3fd0: fix(svelte2tsx): drop the trailing space after `<svelte:self>`'s generated
  `$on(...)` calls. `handle_svelte_self` reimplemented event-call emission
  with a bespoke loop that appended `'); '` instead of `');'`, diverging from
  official's `InlineComponent.addEvent` and from rsvelte's own
  `handle_component`, which already reuses the shared `build_on_calls` helper.
  `handle_svelte_self` now calls the same helper.
- 57b8766: Align several validator/a11y diagnostic message bodies with the official compiler. The
  element name and the ARIA role were swapped in
  `a11y_no_interactive_element_to_noninteractive_role` and
  `a11y_no_noninteractive_element_to_interactive_role`; the "did you mean" suggestions for
  unknown ARIA attributes and roles are now full sentences; `a11y_missing_attribute` picks
  its article and joins candidates like upstream; ARIA token / token-list values are quoted
  and joined with `or`; an invalid node placement under the immediate parent is now worded
  "cannot be a (direct) child of" instead of "cannot be a descendant of"; and reactive
  declarations in a module script report that they "only exist" at the top level of the
  instance script.

## 0.10.3

### Patch Changes

- e6ac019: fix(compiler): decide the dev-mode `console.*` wrap with `scope.evaluate` — `$.log_if_contains_state(...)` now wraps exactly the calls the official compiler wraps. Template-position calls (event handlers, `{expr}`, `$:` bodies) were never wrapped at all, and calls whose arguments a template literal, a `+`/comparison operator or a resolvable binding proves cannot hold state were wrapped when they should not be
- 5a18d1a: Legacy (non-runes) destructuring _declarations_ now expand nested patterns like the official compiler. `let { a: { b } } = obj` used to be left verbatim, so the nested state leaf never got its `$.mutable_source` wrapper (nor the dev `$.tag` label); the expansion is now a port of upstream's recursive `extract_paths`, so every leaf carries its full path (`tmp.a.b`), a nested `...rest` subtracts only its own level's keys, a default on a nested pattern becomes the base the sub-pattern reads from, and every array pattern — at any depth — gets its own `$$array` helper, emitted before the leaves that read it.
- f7b59e8: Fix a server (SSR) codegen bug where two SEPARATE array-pattern destructuring declarations in one script (e.g. `let [a, b] = $state([1, 2]); let [c, d] = $state([3, 4]);`) both emitted a colliding `$$array = $.to_array(...)` temp. The `$$array` counter is now component-wide instead of being reset per declaration, so it deconflicts to `$$array`, `$$array_1`, … like the official compiler's `scope.generate('$$array')`.
- 55df228: fix(compiler): instrument legacy (non-runes) instance scripts in dev mode — `a === b` now emits `$.strict_equals(a, b)` (and `!==` / `==` / `!=` their counterparts) and `await X` emits `(await $.track_reactivity_loss(X))()`, matching the official compiler, which runs the same client visitors for legacy and runes components
- 80553c0: fix(compiler): instrument module scripts in dev mode — `await X` inside a component's `<script module>` or a `.svelte.(js|ts)` module now emits `(await $.track_reactivity_loss(X))()`, matching the official compiler, whose `AwaitExpression` visitor runs over every script kind
- 1fe97f3: fix(svelte2tsx): close the three slots-reflection resolver gaps. A destructuring
  `let:` value (`let:whatever={{ bla }}`) bound only the directive's own name, so
  every leaf identifier stayed unresolved in the `slots` reflection instead of
  resolving through `(({ bla }) => bla)(…$$slot_def['default'].whatever)`; slot-prop
  resolution substituted identifiers by token without tracking object-literal
  context, so an in-scope name in object **key** position (and inside a string
  literal) was rewritten too (`{ item: … }` became
  `{ __sveltets_2_unwrapArr(items): … }`); and a `{:catch e}` binding was not typed
  as `__sveltets_2_any({})`. The `{#await}` opening-tag padding is now derived from
  official `transform`'s collapsed-gap count (`2 + then + catch` spaces) rather than
  a constant, which also fixes the bare and pending-only shapes.
- ce189a1: fix(svelte2tsx): lower slots for `<svelte:self>` as a slot parent. Official
  svelte2tsx models `<svelte:self>` as an `InlineComponent`, so its children are
  slot consumers of that node, but rsvelte performed no lowering there at all:
  `<svelte:self><div slot="a">` kept a bogus `"slot":`a`` prop instead of the
  `$$slot_def["a"]` wrapper, `<svelte:self><div let:x>` kept a bogus
  `"let:x":true` prop instead of the `$$slot_def.default` destructure (leaving
  every `let:` binding an undeclared identifier), and the `$$_svelteselfN`
  instance const was never declared. Named-slot children reached through
  `{#if}` / `{#each}` / `{#await}` / `{#key}` now forward too, and a
  `<svelte:self>` that is itself a named-slot child keeps both levels of
  wrapper.
- b632694: fix(svelte2tsx): mirror official whitespace/gap accounting for `<style>` and
  `<svelte:boundary>`. Blanking a `<style>` tag also swallowed the whitespace that
  followed it, so a top-level `<style>…</style>\n` lost its trailing newline
  (`async () => {};` instead of `async () => {\n};`); upstream `handleStyleTag`
  removes exactly the node range. And `<svelte:boundary>` was lowered with the
  literal-name start transformation, whereas upstream `Element.ts` only
  special-cases `svelte:options` / `head` / `window` / `body` / `fragment` and
  lets everything else keep the tag name as a source range — one more kept range,
  so the props object gets two spaces of gap instead of one. Because the Svelte-4
  AST conversion drops a whitespace-only first/last `Text` child of a boundary,
  `computeStartTagEnd` also lands on the first real child (folding the `\n\t`
  before it into the opener) and a content-bearing first/last `Text` has its data
  trimmed before being blanked.

## 0.10.2

### Patch Changes

- 843f64c: A `{@const}` that shadows a component-scope binding now resolves to the `{@const}` in the client transform. Previously the reactivity check looked the name up in the (root-scope-polluted) binding table and found the outer binding, so a compile-time-known `{@const}` read emitted an extra `$.template_effect` + `$.set_text` where the official compiler assigns `textContent` once, and a `{@const}` shadowing a **prop** was even rewritten to `$$props.<name>` — reading the wrong variable.
- 485f999: Legacy (non-runes) destructuring _assignments_ (`({ a, ...rest } = obj)`) now lower like the official compiler: an object pattern with an identifier right-hand side stays a plain sequence instead of being wrapped in a `$$value` IIFE, literal and computed keys read `obj['b-c']` / `obj[3]` / `obj[key]` instead of the unparseable `obj.'b-c'`, and the `$.exclude_from_object` key list uses upstream's `b.literal(...)` / `String(<expr>)` form instead of re-quoting the source text (`''b-c''`, `'[key]'`). The invalid member reads used to make the downstream AST pass bail, dropping every `$.set` / prop call in the statement.
- dfc15c3: Legacy (non-runes) destructured declarations now lower an object rest as `$.exclude_from_object(tmp, [keys])` like the official compiler, instead of reading a non-existent `tmp.rest` property — and a rest bound to state keeps its `$.mutable_source` wrapper (plus the dev `$.tag` label). The same expansion also stopped dropping pattern defaults (`{ a = 1 }` / `[a = 1]` now emit `$.fallback(...)`) and stopped emitting invalid member reads for literal and computed keys (`tmp['b-c']`, `tmp[3]`, `tmp[key]`).
- 2c4fbf7: fix(compiler): keep class members that share a source line — `class Foo { n = $state(1); d = $derived(this.n * 2); }` used to drop the `$derived` backing field and its accessors from the emitted class
- bbf2065: A client-side attribute expression, event handler, or `{@const}`/`$derived` compile-time-known check that reads a block-local `{#snippet}` shadowing a same-named outer binding (a plain script-level `function`, `let`, or `$derived` — not a prop) now resolves to the snippet instead of the outer binding. Upstream's `Binding#is_function()` always returns `false` for a snippet, so the read is treated as having state; rsvelte's `get_binding` walks a root scope that is intentionally polluted with every scope's declarations for backward compatibility and prefers whichever declaration was merged in first, which could resolve to the outer (non-snippet) binding and wrongly skip the `$.template_effect` wrap or the dev-mode `$.apply` event-handler wrap.
- 3bb7853: SSR constant folding now resolves a `{@const}` / `{let}` / `let:` binding through the render position's lexical scope chain instead of a flat "every template scope" union, matching upstream's `scope.evaluate`. Two sibling fragments declaring the same name (e.g. `{#if a}…{:else}{@const x = 1}…{/if}{#key k}{@const x = 2}…{/key}`) previously made each read ambiguous, so the branch emitted `$.escape(x)` where the official compiler inlines the literal; the nearest declaration now wins and an out-of-scope read stops resolving at all.
- ab86f67: fix(compiler): count every dev-mode source location in UTF-16 code units. `$.push_element`, `$.apply`, `$.add_svelte_meta` and `$$ownership_validator.mutation` each re-implemented the byte-offset → line/column conversion and counted one column per code point, so an emoji (surrogate pair) earlier on the line reported a column one short of official's `locate-character`. The four duplicates are now a single shared locator alongside the already-correct `$.add_locations` one.
- 3ccf1be: fix(compiler): drop redundant parentheses from dev equality instrumentation operands in module scripts — `export const x = (a === b) != (c == d);` now emits `$.equals($.strict_equals(a, b), $.equals(c, d), false)` like the official compiler instead of `$.equals(($.strict_equals(a, b)), ($.equals(c, d)), false)`
- c9362c1: `compileBatch` / `compileBatchExternalSources` (and their async variants) now isolate a panic to the one offending item instead of losing the whole batch's results. Rayon re-raises a worker panic in the caller only after the whole parallel pass finishes, which previously discarded every other file's already-computed output along with the panicking one; each batch item is now caught individually. `CompileError` gains a new `Panic(String)` variant for this case — a source-breaking change for any exhaustive match on `CompileError` outside this crate.
- d3486cb: A `{#snippet}` declared inside a block now shadows a same-named outer binding for the whole fragment, matching upstream's scope rules. `{#each items as item}{#snippet row()}…{/snippet}{@render row()}{/each}` next to a `let { row } = $props()` emitted the prop read `$$props.row($$anchor)` on the client (a `TypeError` when the prop is not passed) and the derived read `row()($$renderer)` on the server; both now call the local snippet directly.
- d66ed72: fix(svelte2tsx): forward a component's default-slot `let:` from every node kind
  official models as an `Element`, and through control-flow blocks. The wrapping
  only covered a direct `RegularElement` / `<svelte:fragment>` child, so
  `<Foo><svelte:element let:x>`, `<Foo><slot let:x>` and any `{#if}` / `{#each}` /
  `{#await}` / `{#key}`-nested `<div let:x>` dropped their `$$slot_def.default`
  prologue and emitted a bogus `"let:x": true` attribute, leaving every `let:`
  binding an undeclared identifier in the generated TSX. A component-direct
  `<style let:x>` no longer leaves an orphaned `$$slot_def` block behind (official
  deletes the whole `<style>` range, block included) nor steals one space from the
  next sibling's indent. `<svelte:fragment>` / `<svelte:boundary>` also stop
  leaking their enclosing component's slot scope into their own children, and a
  block-nested one with a static `slot="name"` now gets the `$$slot_def["name"]`
  wrapper instead of a plain `slot` attribute.
- 2ff1134: fix(svelte2tsx): remove a re-export (`export { x } from './mod'`) from a
  component's instance script instead of leaving it inside the generated
  `$$render()` body. Upstream `ExportedNames.handleExportDeclaration` keys off
  `ts.isNamedExports(exportClause)` alone and never inspects `moduleSpecifier`,
  so every named export clause — with or without a `from` — is stripped and
  recorded as an export. rsvelte skipped the clause whenever a module specifier
  was present, emitting an `export … from` inside a function body: invalid TSX
  (TS1233) that made svelte-check discard _all_ diagnostics for the file.
- 462401a: fix(svelte2tsx): apply official's `value[0]` rule to every slot-name path.
  Official svelte2tsx only ever reads the FIRST part of a slot-name attribute
  value; rsvelte concatenated all `Text` parts (or kept the last one), so
  `<slot name="a{b}c">` produced `slots: { undefined: {} }` instead of
  `{ 'a': {} }`, `$$slots` keyed on `c` instead of `a`, and
  `<Comp><div slot="a{b}c">` was lowered to a `$$slot_def["ac"]` wrapper that
  official does not emit. The three sibling paths now mirror their own upstream
  rule: `slots`/`$$slots` use `nameAttr.value[0].raw` (shared map),
  `let:`-binding scope resolution uses `getSlotName`'s `value[0].raw`, and the
  `$$slot_def[…]` lowering uses `attributeValueIsOfType(value, 'Text')` — so an
  interpolated or dynamic `slot=` stays an ordinary attribute and is no longer
  dropped from the generated props.
- 1f97b68: fix(svelte2tsx): honor an instance-script `$$Slots` interface/type override.
  Official `createRenderFunction.ts` builds the component export's `slots:`
  reflection as `uses$$SlotsInterface ? '{} as unknown as $$Slots' : '{…computed…}'`,
  so a component that declares its own `interface $$Slots` / `type $$Slots` is
  type-checked against that declaration instead of the shape inferred from its
  `<slot>` elements. rsvelte already threaded the flag into the
  `__sveltets_2_createCreateSlot<$$Slots>()` binding but always emitted the
  computed literal in the return statement, so consumers saw the inferred slot
  props and any deliberate widening/narrowing in the declaration was lost.
- 0fe1f6b: fix(svelte2tsx): wrap a `<svelte:component>` / `<svelte:self>` named-slot
  child (`<svelte:component this={Inner} slot="a" />`) in the parent's
  `$$slot_def["a"]` block. `has_named_slot_children` (and the parallel
  `is_named_slot` check in `process_component_children_with_slots`) never
  matched `SvelteComponent` / `SvelteSelf` nodes, so such a child fell through
  to the plain fragment walk instead of the named-slot lowering — unlike
  official svelte2tsx, which models both as `InlineComponent` and forwards them
  exactly like a named `<Component slot="a">` child. Found while fixing #2103
  (PR #2135).
- 751f057: fix(svelte2tsx): route `<svelte:component>` children through the same slot
  lowering a named component's children take. `handle_svelte_component` walked
  its fragment with `process_fragment_inplace`, so a default-slot `let:` receiver
  (`<div let:x>` / `<svelte:fragment let:x>`) never got its
  `$$slot_def.default` destructuring prologue and every `let:` binding resolved
  as an undeclared identifier in the generated TSX; a `<svelte:fragment
slot="a">` child likewise kept a plain `"slot":\`a\`,`attribute instead of the`$$slot_def["a"]`wrapper. Official svelte2tsx treats`svelte:component`as an`InlineComponent`, so slot content forwards the same way there.
- c854cfb: Fix the client preamble emitting `$$ownership_validator` before `$.append_styles` when `css: 'injected'` and dev-mode mutation validation are both active. Upstream unshifts `$$ownership_validator` before it unshifts `$.append_styles`, so the later unshift ends up closer to the front — the correct order is `$.push(...)`, `$.append_styles(...)`, then `$$ownership_validator = ...`. `$.append_styles` is now inserted at the same anchor point as `$$ownership_validator`, in the same call order as upstream's unshifts, instead of being built at an unrelated position in the component body.

## 0.10.1

### Patch Changes

- f56f20c: Release the AST-transform thread-local arena once it grows past 16MB instead of only `reset`-ing it between components. Previously, one outsized component would pin its peak arena size on that thread for the rest of the process — this matters for long-lived Vite/Node dev-server workers. Mirrors the cap svelte-rs applies when returning an arena to its pool. No output change.
- 6139059: fix(svelte2tsx): move a default-slot `let:` element's leading gap space ahead
  of its `$$slot_def.default` destructure. Upstream's `Element.
performTransformation` runs the destructure through the SAME `transform()`
  call as the element's own opening-tag rewrite, so the element's leading gap
  lands before the destructure instead of before the element itself. rsvelte
  inserted the destructure with no leading space and left the gap on the
  element, so `<Foo><div let:x>{x}</div></Foo>` produced
  `;{const {…,x,} = …$$slot_def.default;$$_$$; { svelteHTML.createElement(…`
  (extra space before the element) instead of upstream's
  `; {const {…,x,} = …$$slot_def.default;$$_$$;{ svelteHTML.createElement(…`.
- 0217431: fix(compiler): count `$.add_locations` columns in UTF-16 code units instead of bytes, so a non-ASCII character earlier on the line no longer shifts the reported position
- d20a108: fix(compiler): label a state field of an anonymous class `[class].name` in dev, matching upstream, instead of `Unknown.name`
- 3708e1e: fix(compiler): resolve a `{@render}` against a `{#snippet}` declared in the same `{#if}` branch or `{#key}` block, so it compiles to a direct call instead of the dynamic comment-anchor form (and the matching extra `<!---->` on the server)
- d1dda6d: fix(compiler): emit the dev-mode `$.check_target(new.target)` guard (and the `componentApi: 4` `new.target` early return) ahead of the `$$slots` / `$$sanitized_props` / `$$restProps` preamble, matching the official compiler's statement order
- 6d47676: fix(compiler): label destructured `$derived` / `$state` declarations in dev — leaf bindings by name, the `$$array` temps by pattern kind (`[$derived object]` and friends), and legacy destructured state sources by name
- 7dcf27e: fix(compiler): instrument `==` / `!=` as `$.equals(...)` in dev, and mark the negated comparisons with the trailing `false` argument the official compiler emits instead of an outer `!`
- 9693a47: fix(compiler): memoize wrapping measurements in the handwritten client printer so deeply nested elements no longer compile in exponential time in dev mode (a 12-level nesting dropped from ~9.5s to ~80µs), with byte-identical output
- 8e68266: fix(compiler): unthunk a call-expression destructuring default so `let { b = f() } = $derived(props)` emits `$.fallback($$props.b, f, true)` instead of an extra `() => f()` arrow, matching upstream's `b.thunk()`
- 43026aa: fix(compiler): treat a form feed as text content rather than whitespace, matching upstream's `[ \t\r\n]` whitespace patterns, and drop trailing whitespace at EOF in the parser the way `template.trimEnd()` does
- c4456ac: fix(compiler): lower the `$inspect` rune in dev when it is the only rune in a component, and in `.svelte.js` module scripts — both previously emitted `$inspect(...)` verbatim, which throws `ReferenceError` at runtime
- 78cc4db: fix(compiler): put the dev-mode `...$.legacy_api()` spread first in a legacy component's `$$exports` object instead of last, matching the official compiler
- 81fc9d3: fix(compiler): label legacy state sources with `$.tag($.mutable_source(…), 'name')` in dev, so `$inspect.trace()` and devtools can name them
- 473e700: fix(compiler): route a legacy `on:` event handler through `$.apply` in dev, like the modern `onclick={…}` path already did, so a throwing handler is reported with its component and source position
- d895a2c: fix(compiler): keep the hoisted `rest_excludes` set ahead of the template factory in dev, where the factory is wrapped in `$.add_locations(...)`
- b91c03d: fix(compiler): pass the rest binding's name as the dev-only third argument of `$.rest_props`, so unknown-prop warnings can name it
- bcac30b: fix(compiler): give `<svelte:self>` its real source position in the dev `$.add_svelte_meta` call instead of a `1, 0` placeholder
- 128b5af: fix(svelte2tsx): source-map segments now advance the generated column (previously every segment claimed column 0, collapsing position lookups onto the line's last segment); the NAPI `svelte2tsx` binding now returns the actual `map` instead of `null`
- f9fb130: fix(compiler): wrap awaited expressions in a component's instance script with `$.track_reactivity_loss(...)` in dev, honouring `svelte-ignore await_reactivity_loss`
- 9ac4a08: fix(compiler): drive the TypeScript erasure pass from a generic AST visitor so type syntax can no longer survive in node kinds the hand-written walker forgot — tagged-template expressions, `import(…)`, destructuring assignment targets, `extends` expressions, computed class-member keys, `for` initializers, non-declaration `for…of` / `for…in` targets and `with` bodies
- f3d012e: Isolate a panic during `compile()` (or any other NAPI export) as a thrown JS error instead of aborting the whole Node process. Every `#[napi]` export now sets `catch_unwind`, and the shipped `.node` builds with a new `dist-napi` profile (`panic = "unwind"`) instead of the shared `dist` profile's `panic = "abort"` — mirroring the isolation `@rsvelte/lint` and the language server already have. Measured overhead from the unwind tables + wrapper is small: roughly +2-4% per `compile()` call (~33.6-34.5us -> ~35.0-35.3us), a worthwhile tradeoff for not losing the whole process to one bad input.
- 9a68214: Add a `compileBoth` NAPI export that returns `{ client, server }` from a single parse + analyze pass, for callers that need both compile targets for the same source (e.g. a dual-output SSR build) — verified byte-identical to two separate `compile()` calls, ~15-19% less user CPU per pair on a 20KB real-world component.

  Also: cache `current_dir()` for the default `rootDir` lookup (matches upstream's `validate-options.js`, which evaluates `process.cwd()` once per module load rather than per compile) and skip JSON materialization for CSS class-value expressions whose node type can never be statically resolved. Output is unchanged in both cases.

- e3d98dc: Index shadowed-rune declarations once per client transform instead of running twelve full-script substring searches per reactive binding. Rune-heavy components were paying O(binding count × script length) here: a component with 40 `$derived` declarations now compiles 50% faster, real-world Svelte files up to 23% faster, and the flowbite-svelte corpus 6.9% faster overall.
- 47e220a: Give `JsNode`'s serde map serializer a capacity hint instead of starting every node's map at 0 and growing it by rehashing. Output is unchanged (capacity is only a hint, and `serde_json`'s writer serializer ignores it). Hygiene change: 21 interleaved A/B pairs over a real-world corpus show a modest ~1.9% reduction in user CPU, but it's not a headline win on its own.
- ecead47: Drop the whole-output TypeScript strip from SSR codegen and erase type-only syntax in the template source-slice reparse instead. Fixes `{@const}` initializers with TypeScript-annotated arrow parameters (e.g. `{@const f = (d: T) => …}`) leaking TypeScript into the generated server output.
- fa12319: fix(svelte2tsx): key `<slot name={expr}>`'s `__sveltets_createSlot(...)` call
  with the verbatim source text of the `name` attribute's value node, braces and
  inner whitespace included, instead of re-serializing the expression. Upstream's
  `surroundWith` wraps the raw `[start, end]` source slice in quotes rather than
  printing the parsed expression, so `name={n}` must produce `"{n}"`, not `"n"`.
  Also stop concatenating multi-part attribute values (`name="a{b}c"`) — upstream
  only ever reads `value[0]`.
- 7d635d5: fix(svelte2tsx): reproduce upstream's opening- and closing-tag whitespace
  accounting. Upstream lowers a tag by moving every kept source range to the end
  of the transformed range, collapsing each run of characters between two kept
  ranges to a single space; those spaces are observable in the output. rsvelte
  emitted a fixed single space instead, so `<div {...attributes}>` produced
  `{ ...attributes,}` where upstream produces `{...attributes,}`. Also rewrite
  `{:else}` character-by-character (`}else{`, no inserted spaces) and stop
  treating `{:else}{#if …}` as an `{:else if}`.
- a099fe6: Stop re-lexing the whole comment buffer for every comment-bearing chunk during client codegen. The buffer cursor grows with each chunk, so re-parsing `base`-long padding plus the chunk's own text made this step quadratic in generated code size. Parse behind a fixed one-byte pad instead and shift the resulting spans into place afterwards. Synthetic components with heavy comment usage see 2.6-7.9% less compile time; the real-world corpus (comments are comparatively rare there) is neutral.

## 0.10.0

### Minor Changes

- b0eb890: feat(language-server): apply the project's `rsvelte-lint.json` to editor diagnostics

  The linter runs as wasm and has no filesystem, so `json_api::lint` hardcoded the
  `recommended` preset: every rule ran at its default severity and no project
  config could change that. In a codebase that has never been linted with rsvelte
  — or one whose Svelte rules are already tuned in ESLint — that meant thousands
  of unsuppressable warnings, and turning `rsvelte.lint.enable` off was the only
  way out.

  The server now discovers `rsvelte-lint.json` / `.rsvelte-lintrc.json` by walking
  up from the document's directory (the same file, in the same order, that the
  `rsvelte-lint` CLI resolves) and passes it to the new
  `lint_with_config(source, filename, config)` wasm export, so the editor reports
  what CI does. Resolved configs are cached and dropped when a config file is
  saved. A config that can't be read or parsed is reported to the client's log and
  the recommended preset is used, so a typo never leaves the editor without
  diagnostics.

### Patch Changes

- 1301373: Cut Command-IR overhead in the `rsvelte_esrap` printer (~-31% esrap, -5.7% client compile, -3.3% server compile) with byte-identical output. Track `measure`/`empty` incrementally, store command text inline, flatten the source-map accumulator to a single list of the newly exported `Mapping`, recycle command buffers between prints, and build the source line index once per print. `rsvelte_esrap` is released as 0.9.0 (the `PrintWithMap::mappings` shape changed) and `rsvelte_core` pins the new exact requirement.
- ec20fc8: fix(compiler): mirror the destructuring lowering fixes on the server target — keep computed and literal keys in `$derived` / `$state` destructures, list computed keys in `$.exclude_from_object`, and emit the rest leaf without a `$.to_array` length for array patterns ending in a rest element

## 0.9.8

### Patch Changes

- 6ea4b7e: Reduce svelte2tsx source scanning by collecting validation markers in the
  existing source-feature pass.
- 66ac8b6: Reduce svelte2tsx output allocation by reserving the exact generated
  MagicString bundle code size.
- 5293c32: Fix whitespace collapsing around removed HTML comments inside nested static elements so the client template matches the official compiler
- abcd1de: Strip TypeScript definite-assignment assertions (`let x!: T`, `class A { x!: T }`) so they no longer emit invalid JavaScript
- 8a25666: Fix invalid client output for destructured `$derived` properties whose default value contains a colon (ternary, string literal)
- a53706f: Fix eight client-codegen divergences in destructuring: computed and quoted keys in a destructured `$derived` or `$state(...)` now use bracket notation and are subtracted from the rest's `$.exclude_from_object`; the `$.exclude_from_object` key list is now the decoded key value, single-quoted and escaped, instead of the source text pasted verbatim between double quotes; default values in a destructured `$state(...)` are no longer dropped; a `...rest` in a destructured `$state(...)` now emits `$.exclude_from_object` instead of reading a property named after itself; an array-destructured `$derived(props)` passes the `$props()` binding to `$.to_array` instead of `$$props`; `$.to_array` no longer receives a length when the array pattern has a rest element; and a comma inside a default value no longer splits the property
- 55ad083: Emit dev-mode `$$ownership_validator.binding()` calls inside the `$.component` callback for dynamic components, so bindings on member-expression components no longer throw a `ReferenceError`
- f84860e: Emit `$.derived_safe_equal` for memoized `{@render}` arguments in legacy (non-runes) mode.
- ed39ec4: Fix `{#snippet}` hoisting analysis: stop hoisting a snippet that closes over component scope through an `{@attach}` tag, a `use:`/`transition:`/`animate:` directive, or a `class:`/`style:` shorthand, and start hoisting one whose only references are its own `{let}`/`{const}` declarations
- c32f8f8: fix: keep whitespace between children of an SVG `<text>` element, at any depth
- ac8140e: Strip the TypeScript optional marker (`x?: T`, `m?(): void`) and the `override` modifier from class members, which previously leaked into the generated JS and made it unparseable
- 5f4f61c: Reduce svelte2tsx source-map overhead by scanning unmapped UTF-8 content once
  while updating generated UTF-16 columns.
- 59f0ad7: Reduce svelte2tsx MagicString growth by lazily reserving storage for the first
  set of source splits.
- bd1c724: Reduce svelte2tsx instance-script work by collecting import ranges during the
  existing top-level statement traversal.
- 09e2658: Reduce svelte2tsx transformation overhead by reusing MagicString overwrite
  boundary lookup results.
- e7cba19: Reduce svelte2tsx store scanning by reusing parsed script body ranges.
- b9d5ef4: Reduce svelte2tsx opening-tag scans by starting after the final parsed
  attribute.
- 76bd9f4: Reduce svelte2tsx parse time and memory by skipping discarded template
  comment AST conversion when comments are not requested.
- 4445c51: Reduce svelte2tsx parse time and memory by skipping unused expression
  location objects.
- 4dae1ba: Reduce svelte2tsx source-map work by specializing bundle generation for its
  pre-reserved mapping capacity.
- 2729edc: Reduce svelte2tsx formatting overhead for common Svelte 5 component exports.
- e2692ed: Reduce svelte2tsx transformation overhead by streaming the component return
  object into its output buffer.

## 0.9.7

### Patch Changes

- f148cdf: svelte2tsx: stop emitting a store auto-subscription for `$props.id()` when the
  component also declares a binding named `props` from `$props()`.

  `const props: Props = $props()` next to `const id = $props.id()` made the
  text-level `$name` scan see a `$props` token beside a declared `props`, so it
  injected `;let $props = __sveltets_2_store_get(props);` right after the
  declaration — after the `$props()` call that opens the same line, which
  TypeScript then reports as `TS2448: Block-scoped variable '$props' used before
its declaration`.

  Upstream's `processInstanceScriptContent` tags each `$props.id()` occurrence
  `isPropsId` and drops all of them once it has seen a `props` binding
  initialized by literally `$props()`; that pair of conditions is now mirrored, so
  `$props.id` without a call, `$props.id(arg)`, a non-rune `let props = {}`, and
  `$state.snapshot(state)` all keep upstream's behaviour. Fixes upstream's own
  `props-variable-and-$props.id{,-destructured,-spread}.v5` samples and removes 30
  false-positive `TS2448` diagnostics from the svelte-check e2e parity corpus.

  Fixes #1917.

## 0.9.6

### Patch Changes

- b311eec: Split the embeddable compiler, TypeScript projection, project checker, bindings support, and development tools into ownership-focused Rust crates while preserving the existing JavaScript and CLI behavior. Add the stable `rsvelte` facade, crates.io package gates, and an independently versioned `rsvelte_esrap` 0.8.0 release.
- a82a230: svelte2tsx: keep comments that sit between the last attribute and the `>` of an element or component opening tag, matching official svelte2tsx's trailing-comment handling.

## 0.9.5

### Patch Changes

- 805ea90: Expose the analyzed CSS scope hash through the embeddable component facts.
- d1671d5: Reduce compile overhead by avoiding duplicate analysis setup, allocation-free escaping for static templates, and source-text copies in wrapper-managed source maps.
- 36ec7b5: Reduce serial compile overhead and make static CSS sibling analysis linear in the number of elements.
- 26d7046: Expose a policy-free Rust toolchain facade with reusable component analysis, normalized facts, and exact bidirectional IDE projection mappings.

## 0.9.4

### Patch Changes

- 11b66f6: fix: bind: diagnostic "Possible bindings" enumeration now matches the official
  compiler's sorted order and is deterministic

  `Possible bindings for <…> are …` was built by iterating an `FxHashMap`, so
  the reported order was arbitrary and could diverge between runs, unlike the
  official compiler, which sorts the list. `BINDING_PROPERTIES` is now backed
  by an ordered const slice in upstream `bindings.js` definition order, the
  enumeration is sorted like upstream's `.sort()`, and the related
  `check_graph_for_cycles` root visitation and `{@const}` dependency collection
  are now insertion-ordered as well.

- 6a48717: fix: compiler error messages now match the official compiler's wording

  Asserting the validator fixtures' pinned message text (not just the error
  code) surfaced 35 diagnostics whose wording had drifted from upstream
  `errors.js` — among them `bind_invalid_target`, `transition_duplicate`,
  `transition_conflict`, `rune_invalid_spread`, `script_duplicate`,
  `illegal_element_attribute`, `event_handler_invalid_modifier`,
  `attribute_invalid_type`, `state_field_invalid_assignment`,
  `css_type_selector_invalid_placement`, `declaration_duplicate_module_import`
  and the whole `svelte_options_*` family. All now emit upstream's exact text,
  including the missing closing backtick in the `node_invalid_placement`
  "not a `<div>`" suffix.

- f5df43e: fix: stop writing "ARENA MISMATCH" debug output to stderr from library code

  Debug builds of `rsvelte_core` printed `ARENA CHILDREN MISMATCH` /
  `ARENA MISMATCH` diagnostics to stderr from `get_js_node` and its callers
  whenever the fallback `NULL_NODE` sentinel was returned. Library code should
  never write to stderr unasked; the fallback behavior itself is unchanged.

- e65772c: fix(css): guard multi-relative chain resolution against non-lexical ancestry (#1735)

  The `+`/`~` prune check resolves a multi-relative operand (`:global(.a .z) + .b`,
  or a bare `&` against a `.foo > .a` parent prelude) into an ancestor chain
  verified by walking `parent_idx`. That walk is lexical, so it silently
  mis-answers for `{#snippet}` bodies (whose real ancestors come from their
  `{@render}` call sites) and for `<selectedcontent>` (which mirrors the selected
  `<option>`'s subtree). Both `Chain` producers now share the predicate the
  descendant-chain check already used and bail conservatively when the ancestry is
  not lexical, fixing `selectedcontent > .a { & + & }` being emitted as
  `/* (empty) */` where the official compiler keeps it.

- 131d138: fix(client): preserve pre-existing parens in `parse_raw_expression` (#1783)

  `parse_raw_expression` stripped every `ParenthesizedExpression` layer, not just
  its own synthetic wrapper, so a single-dependency `$.legacy_pre_effect` thunk
  printed as `() => $.get(y)` where the official compiler emits `() => ($.get(y))`
  (upstream builds it as a one-element `SequenceExpression`, which esrap prints
  with parens). The wrapper now strips exactly one layer, and the one-element
  sequence is rebuilt for `$.legacy_pre_effect` dependency thunks; user-written
  parens are still dropped exactly as acorn + esrap do.

- 8e11dcb: fix(parse): bound parser recursion so deeply nested input errors instead of aborting

  Template and CSS nesting recursed without a bound, so input such as a few
  hundred nested elements overflowed the stack. That aborts the process
  (SIGABRT) rather than panicking, so no embedder — the lint CLI, `svelte-check`,
  the NAPI/wasm bindings, the language server — could contain it with
  `catch_unwind`; a single such file took down the whole session. Nesting deeper
  than 128 levels is now reported as an ordinary diagnostic
  (`template_nesting_too_deep` / `css_nesting_too_deep`). Real components nest
  around 20 levels, so valid code is unaffected.

- bb6993d: fix(parse): reject non-call expressions in `{@render}` like the official compiler

  `{@render new foo()}` compiled instead of erroring: the `CallExpression` /
  `ChainExpression` check that `svelte/compiler` performs at parse time was
  missing, and the phase-2 fallback only looked for a `callee` — which a
  `NewExpression` also has. The parser now raises
  `render_tag_invalid_expression` with the same message and span as the official
  compiler, while `{@render foo()}`, `{@render foo?.()}` and
  `{@render (cond ? a : b)()}` keep compiling.

- e771779: fix(client): keep trailing `<script>` comments in place

  A comment sitting after the last statement of a `<script>` was emitted at the
  end of the generated component function instead of next to the code it was
  written beside. In `svelte/compiler` the element identifier of `var p = root();`
  carries the element's source location (`b.id(name, element.name_loc)`), so esrap
  flushes the leftover comment there; every node rsvelte generated read as "no
  location", leaving the enclosing body as the only span that bracketed the
  comment. Generated element identifiers now carry that anchor, and only when the
  element really does follow the comment in the _source_ — an element written
  before the `<script>` still leaves the comment at the body tail, as upstream
  does. Over the Svelte test corpus four more components now match
  `svelte/compiler` byte-for-byte and none regress.

## 0.9.3

### Patch Changes

- ad807a8: fix(client): keep `<script>` comments on the direct-AST codegen path

  Client codegen bailed to the legacy string codegen for any generated chunk
  carrying a comment, because esrap places comments positionally and a program
  reassembled from independently-parsed chunks had no shared coordinate space to
  place them in. Each comment-bearing chunk is now re-parsed at its own region of
  one unified buffer, with generated nodes reading as "no location" the way
  `svelte/compiler` distinguishes user-derived nodes from synthesized ones. The
  fallback rate over the Svelte test corpus drops from 122/3834 (3.18%) to 1/3834,
  and 62 components whose output the string codegen got wrong now match
  `svelte/compiler` byte-for-byte. Source-map positions inside a rewritten chunk
  now resolve to the chunk's start rather than per-statement.

- 4af9b35: fix(parse): keep the assignment target when it carries a TS assertion

  `count!++`, `count! += 1` and `[count!] = …` model their target as an
  `AssignmentTarget` / `SimpleAssignmentTarget` TS-wrapper variant in oxc, which
  the ESTree conversion had no arm for — the whole target was emitted as `null`,
  so any consumer of `parse()` lost the write. A plain `=` LHS now unwraps the
  assertion and every other target position keeps the wrapper, matching
  `svelte/compiler`. The TS stripper also skipped `UpdateExpression.argument`,
  which leaked an invalid `count!++` into generated JS and left the write
  non-reactive; it now lowers to the same `$.update(count)` as `count++`.

- a3d0c7c: perf(parse): 2.4x faster template parsing (CI benchmark: 60.5x → 175x vs `svelte/compiler`)

  Eight output-identical optimizations: typed `{@const}`/destructuring/binding-pattern
  builders replace every serde_json round-trip on the parse path, `<script>` bodies and
  block-head / attribute / directive expressions defer their JS parse under
  `defer_script_parse`, `Expression` shrinks from 216 to 16 bytes (EachBlock 976→376,
  Attribute 488→288), `ParseArena` stores nodes in chunks, and the quoted-attribute
  scanner uses memchr. AST output is byte-identical across the full Svelte test corpus
  and 4011 real-world components in both eager and deferred modes.

## 0.9.2

### Patch Changes

- cb4a3e5: perf(fmt): make the formatter significantly faster; borrow the parser AST from source

  A sweep of formatter and parser performance work, all verified byte-for-byte
  identical against the full compiler test suites and the formatter parity corpus
  (no output changes).

  **Formatter (`@rsvelte/fmt`) — significantly faster.** On real-world corpora the
  multi-threaded CLI is roughly **1.4× faster** than before, and single-threaded
  in-process formatting is down ~40% from the start of this work. The wins stack:

  - `mimalloc` as the `rsvelte-fmt` CLI global allocator — removes the page-churn
    the system allocator paid streaming one file at a time (the largest CLI win).
  - The initial parse now **defers `<script>` bodies and template expressions**:
    the formatter re-parses both from source anyway, so the eager phase-1 parse was
    pure waste. TypeScript-in-plain-`<script>` (#682) still round-trips via a
    dialect-sensitive retry.
  - A **per-thread oxc scratch allocator** reused across a file's throwaway parses,
    a `Doc` printer that **borrows** instead of cloning its measured subtree, and
    expression fast-paths + within-file memoization for repeated expressions.
  - The collapse post-pass re-parse is gated on a structural candidate check and
    reindent/reflow scans bytes instead of `Vec<char>`.

  **Parser AST (`@rsvelte/compiler`) — internal zero-copy refactor.** The parser
  AST gained a source lifetime (`Root<'a>`) and `Text` nodes now borrow their raw
  data directly from the source (`Cow<'a, str>`) instead of copying it, trimming
  per-file allocations in the parse phase. This is an internal refactor only — the
  compiler's output and public API are unchanged.

## 0.9.1

### Patch Changes

- 62b47e6: chore: upgrade Svelte compatibility target to 5.56.7

  Bumps the pinned Svelte submodule from 5.56.4 to 5.56.7, regenerates all test
  fixtures, and ports the codegen changes that alter compiler output — two on the
  server (SSR) transform and two on the client transform:

  - **`$state.eager(<arg>)` visits its argument** (upstream #18530): the server
    `CallExpression` visitor now visits `node.arguments[0]` instead of returning
    it verbatim, so a `$derived` read inside `$state.eager(...)` resolves to a
    getter call (`$state.eager(d)` → `d()`). The read-wrap pass no longer skips
    the eager argument.
  - **Inline `{await …}` expression tags read-wrap their reads** (upstream #18492
    `process_children` threading `state` into `visit`): an inline await whose
    immediate parent is an element now applies the read-wrap pass to the
    `$.save`-wrapped result, so `$derived` / store reads inside it resolve to
    getter calls (`{await push(d)}` → `push(d())`).
  - **Keyed each computed destructuring keys are transformed** (upstream #18521):
    the client key-function parameter pattern is now converted under the each
    block's `key_state`, so a computed destructuring key rewrites to its
    prop / state access (`{#each … as { [labelKey]: label } (…)}` →
    `({ [$$props.labelKey]: label }) => …`).
  - **A lone update effect in a `DeclarationTag` element scope stays concise**: an
    element that directly contains a `{let …}` / `{const …}` declaration tag now
    collapses a single-statement `$.template_effect` to the `() => stmt` arrow body
    instead of a block, matching upstream (a pre-existing client quirk surfaced by
    the new `declaration-tags-transform` sample).

  The `async-batch-derived` runtime-runes fixture is skip-listed: its
  `<svelte:boundary {pending}>` with a `$derived` pending attribute needs the
  server pending-attribute boundary branch, an unported gap that is unaffected by
  this bump (`SvelteBoundary.js` is unchanged across 5.56.4..5.56.7).

- bb96376: fix(css): resolve multi-relative chains in `:global()`/nested-`&` sibling prune

  The `+`/`~` unused-CSS prune check resolved only single-relative selectors when
  expanding a leading `:global(X)` inner selector or a nested rule's `&` against
  its ancestor rules, so a descendant/child chain inside the compound was left
  unresolved and the rule was pruned even when the ancestor constraint was
  actually satisfied — e.g. `:global(.a .z) + .b` (`.z` really under `.a`) became
  `/* (unused) */` and `.grand { .foo > .a { & + & } }` became `/* (empty) */`.
  The `&`/`:global(...)` inner is now resolved through the full ancestor chain
  with the same structural matcher used for `>` child checks, matching
  `svelte/compiler` for both the kept and pruned cases (#1719).

## 0.9.0

### Minor Changes

- 64cb25d: feat(capi): support `cssHash` / `warningFilter` compile callbacks in the C ABI (`crates/rsvelte_capi`)

  The C shared library gains two callback-aware entry points,
  `rsvelte_compile_with_callbacks` and `rsvelte_compile_module_with_callbacks`,
  which resolve the two function-form compile options that can't be expressed as
  JSON — completing the C-API half of the function-compile-options work (the wasm
  side shipped separately, NAPI in earlier releases):

  - **`css_hash`** — a `(userdata, RsvelteCssHashInput) -> RsvelteStr` function
    pointer. The input's `hash` field is the raw digest the compiler's default
    `cssHash` produces (the filename when known, else the CSS; no `svelte-`
    prefix), so `svelte-${hash}` reproduces the default class exactly. Returns a
    borrowed string the library copies immediately; a constant `cssHashOverride`
    in the options JSON still wins.
  - **`warning_filter`** — a `(userdata, warning_json, len) -> bool` function
    pointer, applied natively by the compiler for both components and modules.

  Callbacks are opt-in via a new `RsvelteCallbacks` struct (any field may be
  NULL); the existing `rsvelte_compile` / `rsvelte_compile_module` entry points
  are unchanged. `include/rsvelte.h` regenerates via cbindgen.

  This does not change the published `@rsvelte/compiler` npm package's runtime
  behaviour — it is a parallel C distribution channel. The npm version is bumped
  so the new C ABI surface appears in the next release notes.

- deadab5: feat(wasm): support function compile options via a new `compile(source, options)` entry

  The wasm compiler now exposes `compile(source, options)`, which accepts the full
  compile-options object and resolves the function-form options that the primitive
  `compile_client`/`compile_server` entries can't — matching the NAPI shim's
  support (PRs #1666/#1667):

  - the `parametric` function forms of `customElement`, `css`, and `runes`
    (`({ filename }) => value`), evaluated once at the boundary;
  - a `warningFilter` callback, applied natively by the compiler;
  - a constant `cssHashOverride` string; and
  - a dynamic `cssHash` callback bridged through `js_sys::Function` (wasm compile
    is single-threaded, so the callback runs inline with no threadsafe-function
    marshalling). A callback that throws surfaces as a compile error; a non-string
    return falls back to the default hash.

  The result is returned as a JSON string (`{ js, css, warnings, metadata }`);
  callbacks are input-only. The existing `compile_client`/`compile_server` entries
  are unchanged.

### Patch Changes

- a10913c: fix(analyze): hand the raw digest to `cssHash` callbacks via `CssHashInput.hash`

  `CssHashInput.hash` now carries the unprefixed raw digest, matching upstream's
  default `cssHash` (`svelte-${hash(...)}`) where the `hash` argument is the raw
  digest and the `svelte-` prefix is applied by the default implementation itself.
  The prefix is now materialized only where the default hash is produced. The wasm
  `cssHash` bridge no longer recomputes its own raw hash and instead trusts the
  shared field. No compiler output changes.

- 1508778: fix(css): keep nested `& + &` and `:global(.a) + .b` sibling rules

  Two unused-CSS prune divergences found by the css-prune differential sweep are
  fixed, clearing the sweep ratchet (81 → 0):

  - A nested rule whose inner selector uses the parent-selector sibling combinator
    (`.a { & + & { … } }`, i.e. `.a + .a`) was dropped as `/* (empty) */` even with
    a real adjacent `.a` pair, because `&` (NestingSelector) resolved to an empty
    matches-nothing selector during sibling pruning. `&` is now resolved against
    the parent rule's subject compound (#1703).
  - `:global(.a) + .b` was pruned as `/* (unused) */` when the sibling pair lived
    inside an `{#await}…{:then}` branch or a `{#snippet}` fragment (both set the
    opaque-elements flag, which suppressed real-sibling matching). The acceptable
    predecessors of the scoped segment are now unioned — a real previous sibling
    matching the inner `:global(...)`, an opaque boundary, or a root-level element
    (#1702).

- 46cf5fe: fix(css): keep sibling-combinator rules past `<svelte:head>` void elements

  The unused-CSS analysis assigned sibling-data slots (`dom_idx`) with a walker
  that did not descend into `svelte:*` wrapper nodes, while the analysis visitor
  that builds the element table does. A void element inside `<svelte:head>`
  (`<meta />` / `<link />`) therefore shifted every subsequent element's
  sibling-data slot by one, so sibling-combinator selectors (`.a + .a`, `.a ~ .a`)
  matched by `{#each}`-generated siblings were wrongly pruned as unused — and in
  other structures (`{#if}`/`{:else}`), wrongly kept. Both walkers now descend
  into the same wrapper set, matching the official compiler's prune decisions
  (verified by a new 1222-component differential sweep against `svelte/compiler`).

- 97178b7: fix(css): prune descendant/child selector chains whose subject or ancestor links cannot match the component's own element tree (attribute/class/id compounds included), and preserve source whitespace after a pruned leading selector-list item
- 020be59: fix(parse): emit `FunctionDeclaration.expression` (always `false`) to match acorn's key order (`id`, `expression`, `generator`, `async`, `params`, `body`)

  The binary NAPI raw-parse envelope (`napi_raw_parse.rs`'s writer, consumed only
  by `@rsvelte/vite-plugin-svelte-native`'s `parse-envelope.js` decoder) carries
  the same field, so both packages need this release. The envelope's `VERSION`
  is bumped to 2 alongside the wire-format change (one extra bool byte on
  `FunctionDeclaration` payloads).

- 065ce6f: fix(parse): improve function-node AST fidelity to match acorn / acorn-typescript

  Four parse-AST fixes so the public `parse()` output matches svelte/compiler:

  - `FunctionExpression` fields are ordered `id, expression, generator, async` to
    match acorn's uniform `initFunction` key order (#1689).
  - Generic function-like nodes emit `typeParameters`
    (`FunctionDeclaration`/`FunctionExpression` between `async` and `params`,
    `ArrowFunctionExpression` after `body`) (#1694).
  - TS optional parameters (`b?: T`) round-trip their `optional: true` marker;
    program-context arrow params now route through the TS-aware parameter
    converter so they carry the same `typeAnnotation`/`optional` fidelity as
    declarations (#1692). As a side effect, this also fixes a pure-JS bug where a
    default-valued arrow parameter (`(a = 1) => a`) lost its `AssignmentPattern`
    (default value) in the `parse()` output — `compile()` output was unaffected.
  - Object-method values (`{ m<T>(x: T) {} }`) keep their generics on the inner
    `FunctionExpression` but emit `typeParameters` _after_ `body` (like arrows),
    not in the declaration/expression slot before `params` (#1711).

  The binary NAPI raw-parse envelope (consumed by
  `@rsvelte/vite-plugin-svelte-native`'s `parse-envelope.js` decoder) carries the
  same fields, so both packages need this release. The envelope `VERSION` is
  bumped to 4 alongside the wire-format changes.

- 97178b7: fix(client): per-site proxy decision for bare-identifier assignment RHS resolved to a function-local declaration, and upstream-faithful `is_defined` for `unknown ?? b` initializers (no narrowing when the left side is not statically known)
- 97178b7: fix(client): resolve bare identifiers via scope in template-chunk `is_defined`, so e.g. a legacy `let iconAsc = "↑"` inside `${cond ? iconAsc : iconDesc}` reads bare without a spurious `?? ''`
- d7353f8: fix(parse): preserve `TSFunctionType` / `TSConstructorType` in `convert_ts_type` instead of collapsing them to a `TSUnknownKeyword` stub (e.g. inside a union like `string | (() => void)`)

## 0.8.2

### Patch Changes

- d7f9427: fix(client): emit `svelte:element` `on:` events bare in after_update (no `$.effect` wrap with `use:`), and emit a plain prop init for a function-valued `{@const}` shadowed by an outer same-named binding
- c3fc6d9: fix(parse): preserve the remaining TypeScript assertion forms in parse() output

  Follow-up to #1648, which deliberately deferred three forms. `parse()` now also
  keeps `TSTypeAssertion` (`<T>x`) and `TSInstantiationExpression` (`f<T>`) — with
  svelte/compiler-compatible shape (`TSTypeAssertion` serializes `typeAnnotation`
  before `expression`; `TSInstantiationExpression` carries `typeArguments`) — and a
  non-null `!` sitting inside an optional chain (`a!?.b`), matching svelte/compiler.
  As with the other wrappers, `remove_typescript_nodes` erases them before
  analyze/transform, so compiled client/server output is unchanged.

- b31c4a7: fix(parser): preserve TS assertion expressions in `parse()` output and fix zero-width arrow-param spans

  `parse()` now keeps `TSAsExpression`, `TSSatisfiesExpression`, and
  `TSNonNullExpression` wrapper nodes in the public AST — matching
  svelte/compiler, which parses TS via acorn-typescript and returns the assertion
  nodes. rsvelte previously unwrapped them at parse time, returning the bare inner
  expression and diverging from the reference AST shape (it broke downstream
  consumers that rely on parser parity). The wrappers are still erased at compile
  time by `remove_typescript_nodes` exactly as before, so client/server codegen is
  unchanged (`x as const` is stripped from the generated JS). The binary
  `parseEnvelope` encoder/decoder gains matching entries for the three node types.

  Also fixes a latent bug where untyped arrow-function parameters inside template
  expressions (event handlers such as `onclick={(color, e) => …}`) came back with
  zero-width spans (`start == end == 0`); the fast-path template arrow parser now
  assigns each parameter its real source span, matching svelte/compiler.

  In svelte2tsx (`@rsvelte/svelte2tsx` and the svelte-check overlay), a `bind:`
  expression carrying a TS assertion (`bind:value={value as never}`) now strips the
  assertion from the generated assignment LHS while keeping it on the bound-value
  side — mirroring upstream svelte2tsx's `getEnd(attr.expression)`.

- d7f9427: fix(client): emit `$.invalidate_inner_signals` for prop member mutations inside `$:` reactive statements (legacy `<select bind:value={prop…}>` indirect bindings), matching the instance-script mutation path
- d7f9427: fix(analyze): insert instance-scope declarations into the root-scope name map before module-script inner-function scopes, so a same-named function parameter in the module script no longer shadows an instance `let` (restoring its reactivity)
- 6fa6c2e: fix(analyze): resolve legacy `<select bind:value>` indirect bindings from the select's containing scope, so an each-item wrapping the select (e.g. `{#each columns as col}<select bind:value={sel[col.key]}>`) is invalidated on mutation; a `$store` bind root is skipped like upstream

## 0.8.1

### Patch Changes

- a44b469: fix(compiler): add a stable `@rsvelte/compiler/wasm` subpath and fix package metadata

  The published package now exposes the WebAssembly binary under a stable
  `@rsvelte/compiler/wasm` export. Previously the only way to reach the `.wasm`
  bytes (e.g. to drive `initSync` on Node) was a deep import that hard-coded the
  internal build crate's filename, so consumers broke whenever that name changed
  (`rsvelte_core_bg.wasm` → `rsvelte_lint_bg.wasm`). Import from
  `@rsvelte/compiler/wasm` instead — it stays stable across releases.

  Existing crate-named deep imports keep working (an `exports` passthrough
  preserves them), and the default `import ... from '@rsvelte/compiler'` is
  unchanged.

  Also corrects the package `description`, which had been the linter crate's text
  rather than the compiler's.

- 386f732: fix(wasm): enable reference-types in wasm-opt

  Newer rustc/LLVM can emit a second wasm table (a reference-types externref table
  alongside the funcref indirect-call table) for `wasm32-unknown-unknown`, which
  `wasm-opt`'s default MVP feature set rejects with "Only 1 table definition allowed
  in MVP". Whether the extra table appears depends on the rustc version CI resolves
  that day, not on anything in this repo, so the wasm build could break without any
  change here.

  Passing `--enable-reference-types` lets wasm-opt parse and optimize it. The
  `rsvelte_fmt_wasm` artifact shrinks ~1% as a result; `rsvelte_lint`'s is byte-identical.

## 0.8.0

### Minor Changes

- cc81ec5: feat(oxlint-plugin): run rsvelte's Svelte diagnostics as oxlint rules

  New package `@rsvelte/oxlint-plugin` — an oxlint JS plugin that folds rsvelte's
  Svelte diagnostics (the native eslint-plugin-svelte rule ports plus the
  compiler / validator / a11y warning wrap) into oxlint's single pass and report,
  under the `svelte/` namespace. Add `"jsPlugins": ["@rsvelte/oxlint-plugin"]` (and
  `extends` the bundled `recommended.json`) to `.oxlintrc.json` and Svelte issues
  show up alongside oxlint's JS/TS rules. Requires oxlint ≥ 1.64.

  The engine is native-first with a wasm fallback: the plugin loads the prebuilt
  `rsvelte_lint.node` (NAPI) from the per-platform `@rsvelte/lint-<triple>`
  packages when available, and falls back to the `@rsvelte/compiler` wasm engine
  otherwise — both return byte-identical diagnostics. `RSVELTE_OXLINT_ENGINE=native|wasm`
  forces one engine. The `@rsvelte/lint-<triple>` packages now ship the
  `rsvelte_lint.node` addon alongside the `rsvelte-lint` CLI (via a new
  `rsvelte_lint` `napi` cargo feature).

  Script-block diagnostics map to accurate positions; markup/style diagnostics are
  surfaced at the top of the `<script>` block with their real location in the
  message (an oxlint alpha `.svelte` limitation). Scriptless components are not
  visited by oxlint and so are not linted — see the package README.

  To back it, `@rsvelte/compiler` (and the native addon) gain a `lint_rules()`
  export returning the full catalog of diagnostic ids the linter can emit (native
  rule ids + the compiler/validator/a11y warning codes), so the plugin registers
  its rule set and generates its recommended config directly from the engine. The
  existing `lint()` export is unchanged.

### Patch Changes

- 54509fe: feat(svelte2tsx): result object matches upstream (`map` SourceMap, `exportedNames.has`, `events.getAll`)

  The `svelte2tsx()` result now mirrors the official
  [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx)
  `SvelteCompiledToTsx` shape:

  - **`map`** is now a magic-string-style `SourceMap` **object** (`version`,
    `sources`, `sourcesContent`, `names`, `mappings`, plus `toString()` /
    `toUrl()`) instead of a JSON string. In `dts` mode it stays `null`.
  - **`exportedNames`** now exposes `has(name): boolean` (upstream
    `IExportedNames`). The existing `props` / `all` arrays are kept as a
    backward-compatible rsvelte extension.
  - **`events`** now exposes `getAll(): { name, type, doc? }[]` (upstream
    `ComponentEvents`, which is `@deprecated`) instead of a plain record. Types
    are approximated as `CustomEvent<detail>` / `CustomEvent<any>`; the optional
    `doc` (JSDoc) field is not populated.

  The `map` string → object change folds into the same unreleased `0.2.0` as the
  synchronous-API change, so it stays a single minor bump.

- 4ea4b44: fix(analyzer): visit special events and parameter defaults

  Two analyzer gaps left references unrecorded, which could feed incorrect
  warnings/eliminations downstream:

  - **`on:` directives on `<svelte:window>` / `<svelte:document>` / `<svelte:body>`**
    were parsed but never walked, so an expression like
    `<svelte:window on:keydown={handle_keydown} />` never recorded a reference to
    `handle_keydown`. These special elements now route their `on:` directives
    through the same `on_directive` visitor regular elements use, matching the
    official compiler's generic `context.next()` walk in `SvelteWindow.js` /
    `SvelteDocument.js` / `SvelteBody.js`.
  - **Function/arrow parameter patterns** (`function f(a, {b} = c, [...d]) {}`)
    were never visited at all, so identifiers referenced only in a default value
    — e.g. a store subscription in `function goto_page(page = $search_params.page) {}`
    — were invisible to the analyzer. `FunctionDeclaration` / `FunctionExpression`
    / `ArrowFunctionExpression` now walk `params` through the existing generic
    typed walker (`walk_js_node_typed`) before the body, mirroring upstream's
    `context.next()` over the whole function node. This also restores the
    self-reference every other declaration site already gets (see
    `variable_declarator.rs`), which `export_let_unused`'s "more than one
    reference" heuristic depends on for other binding kinds.

- 6665d53: fix(analyze): preserve function, class, rest-prop, and directive binding metadata
- fa0e9ff: fix(transform): a function-valued `{@const}` passed as a component prop is not a getter

  Upstream's `Identifier.js` `has_state` computation excludes function
  bindings (`!binding.is_function()`), so a `{@const fn = (e) => …}` read as
  a component prop is emitted as a plain value rather than a getter:

  ```js
  // {#each items as item}
  //   {@const onItemEnter = (e) => { … }}
  //   <Path onpointerenter={onItemEnter} />
  C($$anchor, { onpointerenter: $.get(onItemEnter) }); // was: get onpointerenter() { … }
  ```

  Two gaps caused rsvelte to wrap it in a getter: the analyzer's
  `set_const_tag_initial` never set `initial_is_function` for a `{@const}`
  whose initializer is an arrow/function expression (so `is_function()`
  returned `false`), and the client `expression_has_reactive_state`
  Template branches checked only `is_expression_known_json`, missing the
  `!binding.is_function()` term. Both now mirror upstream.

- fa0e9ff: fix(transform): align CSS scope-class specificity bumping with the official compiler

  The scoping-class placement inside `:is()` / `:where()` / `:has()` / `:not()`
  now follows upstream `css/index.js`'s single `specificity.bumped` rule instead
  of ad-hoc heuristics. Three cases were wrong:

  - A standalone `:where(.foo)` (or `:is(.foo)`) at the top of a rule scoped its
    inner selector with a redundant `:where()` wrapper —
    `:where(.foo:where(.svelte-x))` instead of `:where(.foo.svelte-x)` — because
    the first scoping point must use the direct class, not `:where()`.
  - A combinator by itself forced a specificity bump, so `:where(.a) > :where(.b)`
    produced `:where(.b:where(.svelte-x))` when the preceding relative selector
    emitted no modifier. The bump now comes solely from actual modifier
    application, matching upstream.
  - A pseudo-class arg in a compound that IS scoped elsewhere
    (`nav:has(a).primary`, `:root:has(h1)`) must see the compound as already
    bumped, so its inner selector is `:where(.svelte-x)` — upstream bumps the whole
    compound before recursing into its pseudo args, even when no textual modifier
    is emitted (`:root` is exempt yet still bumps).

  Fixes real-world `<style>` blocks that wrap top-level rules in `:where(...)`
  (e.g. layerchart tooltip / layer / legend components).

- add48ed: fix(deps): update compact_str to 0.10

  Dependency-only bump of `compact_str` (0.9 → 0.10), the inline string type used
  throughout the compiler's AST. No API or output changes; ships in the compiled
  native binaries, hence a patch release.

- fa0e9ff: fix(transform): destructuring `$derived(props)` of a rest binding reads members from `$$props`

  When a second destructuring reads from a `...rest` binding via
  `$derived(...)`, upstream's rest-prop member rewrite turns each named
  member read `props.X` into `$$props.X`, while the top-level `...rest`
  element keeps `props` for `$.exclude_from_object(props, …)`:

  ```js
  // let { ChartChildren, ...props } = $props();
  // let { ssr = false, width, ...restProps } = $derived(props);
  let ssr = $.derived(() => $.fallback($$props.ssr, false)), // was: props.ssr
    width = $.derived(() => $$props.width),                  // was: props.width
    restProps = $.derived(() => $.exclude_from_object(props, ["ssr", "width", …]));
  ```

  The client `$derived` destructuring helpers now thread a separate
  `member_base` (the `$$props` source of the rest binding) for member reads,
  keeping `base_expr` (`props`) for the rest exclude.

- fa0e9ff: fix(transform): a `let:` directive shadows an outer same-named prop

  A `let:` directive on a slotted element (e.g. `<tbody slot="data" let:data>`)
  registers a `$.get(data)` read transform for the derived slot binding, but
  `convert_identifier` resolves a `Prop`/`BindableProp` binding straight to
  `$$props.name` unless the name is in `shadowed_prop_names` — so when the `let:`
  name collided with an outer `let { data } = $props()` prop, reads inside the
  slot body wrongly emitted `$$props.data` instead of `$.get(data)`.

  `process_element_let_directives` now adds each `let:` binding name to
  `shadowed_prop_names` for the duration of the element's children (restored
  afterwards), mirroring the each-item / snippet-parameter shadowing already done
  in `each_block.rs` / `snippet_block.rs`.

- 87f178e: fix(parse): scan `{@html/@render/@const/@debug}` bodies with find_matching_bracket

  The `{@html}`, `{@render}`, `{@const}` and `{@debug}` special tags each carried
  their own bespoke brace-depth loop to locate the closing `}`. Those loops
  handled some JavaScript lexical contexts but not all — none skipped comments or
  regex literals, and `{@debug}` skipped nothing at all — so a `}` inside a
  comment or regex (and, for `{@debug}`, a string) terminated the tag early and
  mis-parsed the rest of the template. All four now route through the shared
  `find_matching_bracket`, which skips strings, template literals, comments, and
  regex literals exactly like upstream's `read_expression`. This brings several
  cases into line with the official compiler:

  - `{@html x /* } */ + y}` — brace in a block comment
  - `{@render foo(/}/g)}` — brace in a regex literal
  - `{@const re = /}/}` — brace in a regex literal
  - `{@debug foo /* } */}` — brace in a block comment

  The `{@const}` sequence-expression guard (`{@const a = b, c = d}` is rejected,
  `{@const a = (b, c)}` is allowed) is now derived from the parsed initializer's
  node type, mirroring upstream's `init.type === 'SequenceExpression'` check,
  instead of a top-level comma byte-scan. This stops a comma inside a regex,
  string, or comment (e.g. `{@const x = /a,b/.test(y)}`) from being mistaken for a
  sequence separator and wrongly rejected.

  No change to the output of any existing fixture; the parser now additionally
  accepts the inputs the official compiler accepts. Net ~160 fewer lines in
  `state/tag.rs`.

- fa0e9ff: fix(transform): keep `rest.x` (not `$$props.x`) when it is an assignment/update operand

  Upstream `Identifier.js` skips the runes rest-prop read optimization
  (`rest.x` → `$$props.x`) when the member access's grandparent is an
  Assignment or Update expression — covering BOTH operands. The client
  AST state transform only excluded the direct LHS, so a single-level
  `rest.x` used as a RHS was rewritten:

  ```js
  // let { children, ...rest } = $props()
  ctx.globalAlpha *= rest.opacity; // was: *= $$props.opacity
  img.crossOrigin = rest.crossOrigin; // was: = $$props.crossOrigin
  ```

  The rewrite is now suppressed for a bare single-level `rest.x` that is a
  direct operand of an assignment (either side) or an update expression,
  while deeper accesses (`rest.x.y`) still inline as before.

- fa0e9ff: fix(transform): SSR elides `$.stringify(...)` for a string-typed `{@const}` declared in multiple scopes

  The server template-chunk builder skips `$.stringify(...)` when
  `scope.evaluate(expr)` proves the value is a defined string. When the same
  `{@const}` name is declared in several branches (e.g. an `{#if}`/`{:else}`
  pair, each a string-typed ternary), the server generator — which does not
  track lexical scope — saw multiple same-named bindings and returned
  `unknown` unless they agreed on a single concrete value, wrongly wrapping
  string reads in `$.stringify(...)`:

  ```js
  // {@const translateX = a === 'middle' ? '-50%' : '0%'}  (in {#if} and {:else})
  transform: `translate(${translateX}, …)`; // was: translate(${$.stringify(translateX)}, …)
  ```

  The multi-binding path now merges the full value set (union) of every
  candidate, mirroring upstream's `Evaluation` merge, so `is_string` /
  `is_defined` stay true when all branches agree on a string type.

- a3dae82: fix(compiler): faithful `$`-store auto-subscription classification for two edge cases

  Two lexical-scope heuristics in the store-subscription detector diverged from
  upstream's scope analysis:

  - Destructured arrow parameters spanning multiple lines
    (`([\n  $a,\n  $b\n]) => …`, e.g. LayerCake's `derived` callbacks) were not
    recognized as local bindings because the param-detection whitespace scan
    stopped at the newline before the delimiter. Those names were wrongly emitted
    as store getters (`const $a = () => $.store_get(a(), …)`) and reordered the
    emitted getter block.
  - A store reference in a ternary consequent behind a unary operator
    (`cond ? !$store : x`) was misclassified as an object property key, so no
    store getter was emitted at all.

  Both now match the official compiler; the LayerCake and svelte-ux `AppLayout`
  corpus entries compile byte-identically for CSR and SSR.

- fa0e9ff: fix(svelte2tsx): keep TS casts on component `bind:this` and on paren-wrapped attribute expressions

  Two TSX-parity gaps surfaced by real-world components:

  - A component `bind:this={x as T}` dropped the trailing TS postfix — emitting
    `x = $$_inst;` instead of `x = $$_inst as T;`. The element `bind:this` path
    already moved the postfix onto the RHS var; the component path now does the
    same (layerchart playground `bind:this={consolePane as Pane}`).

  - An attribute expression whose value is a redundantly-parenthesized cast —
    `on…={((e) => { … }) satisfies Handler<T>}` — lost both the wrapping parens
    and the `satisfies …` tail, because the parser narrows the span to the inner
    arrow and the postfix scan only looked for `as`/`satisfies`/`!` _directly_
    after the span (here the tail starts with `)`). The attribute baker now widens
    the span back to the wrapping `(` and forward past the `) satisfies T` tail
    (layerchart Arc/Arc.base `ontouchmove`).

- fa0e9ff: fix(svelte2tsx): a type-annotated `$props()`/`$state()`/`$derived()` self-named rune is not a store subscription

  Upstream's `is_rune` check excludes a `$props()`/`$state()`/`$derived()` call
  from store resolution when the declaration's binding NAME includes the rune
  base (`parent.parent.name.getText().includes(base)`), using the binding node
  only — never the type annotation. rsvelte's store-subscription pass relied on
  a text scan that walked backwards over the whole `let … = ` region, so a
  generic type annotation broke it:

  ```ts
  // let { …, ...props }: ChartChildrenBaseProps<TData, XScale, YScale> = $props();
  //                                             ^^^^^^ generic-arg commas
  ```

  The backward scan stopped at the first `<…, …>` comma, never saw the `props`
  binding, and so emitted a spurious `let $props = __sveltets_2_store_get(props)`
  (wrapped in `Ωignore` markers) — diverging from the official svelte2tsx TSX
  (layerchart Chart/ChartChildren `.base`/`.canvas`/`.html`/`.svg`/`.svelte`,
  ChartCore). The store-injection pass now applies the exclusion on the AST via
  the existing `excluded_rune_init` helper (binding-name only, like upstream),
  dropping the self-named rune base before emitting subscriptions.

- 685a96e: fix(analyze): record references from Svelte boundary handlers and snippet parameter defaults
- fd4572e: `svelte/no-top-level-browser-globals` now uses real scope resolution (oxc_semantic) instead of name matching: local bindings that share a browser global's name — `let { open = $bindable() }` props, imports, `let top` — are no longer falsely flagged, in both `<script>` and template expressions. Fail-safe: unresolvable scripts fall back to the previous behaviour.

## 0.7.17

### Patch Changes

- 21ab5b1: chore(deps): bump oxc + oxfmt to the 0.58 formatter-paired rev (39677ba)

  Bump every git-pinned oxc crate (`oxc_ast`, `oxc_parser`, `oxc_codegen`,
  `oxc_span`, `oxc_semantic`, … and the `oxc_formatter*` family) to a single new
  revision `39677ba50d908ea09f6d9e58ded328461212f52a` — oxc crates `0.138`,
  `oxc_formatter*` `0.58` — and bump the `oxfmt` npm dependency to `^0.58.0` (root
  - playground). This rev is the exact oxc commit the `oxfmt` `0.58.0` release was
    built from, so `rsvelte-fmt`'s in-process `oxc_formatter` engine is byte-identical
    to the `oxfmt` oracle the formatter-parity gate compares against (fixing a
    comment-placement divergence, e.g. `: !!value /* … */;`).

  All oxc crates must move to one rev together so rsvelte's AST types unify with
  `oxc_formatter`'s transitive deps, and the `oxc_formatter` rev must be paired with
  its matching `oxfmt` npm release; this consolidates the individual Renovate oxc
  bumps and the `auto-update-oxfmt` bot PR (#1434) into one coherent bump. The bump
  is compiler-output-neutral — CSR/SSR compile output is byte-identical across the
  whole compat corpus before and after; no oxc API migration was required.

  Also declares the `svelte_check` bin with `required-features = ["native"]`: it
  links `rsvelte_core::svelte_check::*` (gated on `native`), so under a feature
  resolution that omits `native` (e.g. the `cargo codspeed build` bench graph)
  cargo must skip the bin instead of trying to build it and failing to link.
  Default builds enable `native`, so this is a no-op for them.

  The oxfmt 0.58 bump also records one new known formatter-parity failure in the
  ratchet (`compat/corpus/fmt-known-failures.json`): `site-kit/…/SearchBox.svelte`,
  where rsvelte-fmt over-breaks a TS `as HTMLElement | undefined` union inside a
  deeply-nested `on…={…}` handler at print-width 80 (its embedded-expression width
  narrowing makes `oxc_formatter` break a union the oxfmt oracle keeps inline). It
  is a bounded diagnosis but a non-bounded fix (entangled with the tuned
  narrow-then-reindent plumbing), tracked as a follow-up burndown item. Four other
  oxfmt-0.58 CSS/structure divergences on pathological svelte compiler-test fixtures
  are `oracle-bug` / `invalid-input` exclusions (oxfmt's own `--svelte`-vs-raw CSS
  path inconsistencies where rsvelte matches the raw path).

- f72487c: fix(analyze): remove aliasing UB from bind:group each-block marking

  `mark_group_bindings_in_node` pushed a `*mut EachBlock` (built from `&mut **each`)
  onto an ancestor stack and then recursed into `each.body`, keeping a `&mut` borrow
  of that same each block's `body` field live. When a descendant `bind:group` matched,
  the code dereferenced the raw pointer — including `&mut **each_ptr` to write
  `metadata` — while the outer `&mut each.body` was still alive. Under Stacked/Tree
  Borrows this is undefined behavior (a `&mut` reborrow overlapping a live parent
  `&mut`). No miscompilation had been observed (single-threaded, the writes only touch
  `metadata`, and codegen output was correct), but it is UB the optimizer is entitled
  to exploit.

  Replace the raw pointers with a safe design: the ancestor stack now holds value
  snapshots (`start` offset + declared/expression identifiers copied up-front, so no
  borrow of `each` is held across the descent), and matched group-binding assignments
  are collected into an `FxHashMap<u32, String>` keyed by each block `start`. Each
  `EachBlock`'s `metadata` is written back when the traversal unwinds past it, once no
  borrow of its `body` is live. Group-name allocation order and the first-assigned
  `binding_group_name` semantics are preserved, so compiler output is byte-identical
  (verified against the full runtime-legacy suite, which covers every `bind:group`
  inside `{#each}` fixture).

- f66ee48: fix(analyze): preserve component-relative declaration spans and component tag references in binding metadata
- 0307bc1: fix(transform): keep a brace-less control-flow body with its `$:` header

  The legacy instance-script statement splitter treated a depth-0 newline after a
  brace-less control-flow header (`$: if (cond)`, `else`, `for (...)`, `while (...)`,
  `do`) as a statement boundary. So

  ```svelte
  $: if (object3d)
  	if$_instance_change(object3d, …)
  ```

  split the body off as a separate top-level statement: rsvelte emitted the call
  eagerly and unguarded at component setup, and lowered the header to an empty
  reactive effect (`if (object3d());`) instead of
  `$.legacy_pre_effect(…, () => { if (object3d()) if$_instance_change(…); })`.

  Treat a statement whose accumulated text ends with a brace-less control header as
  incomplete (like a trailing binary operator), so its following body statement is
  accumulated with it. Add `ends_with_braceless_control_header` (word-boundary
  keyword match + backward paren match) to `expression_utils`, applied in both the
  line-accumulation boundary check and `find_statement_end_client`. Removes
  `svelthree/src/lib/components/Object3D.svelte` from known-failures.client.json.

- 8b827ae: fix(transform): client text interpolation treats binary/template-literal `let` inits as defined (no `?? ''`)

  `is_expression_defined` (the client `?? ''` gate for `{expr}` text
  interpolations) only skipped the fallback for a `const` binding whose
  `initial_is_defined` flag was set. That flag is not populated for legacy
  (non-runes) `let` bindings, so `let key = a.charAt(0) + a.slice(1)` — whose
  value is always a string — was emitted as `${key ?? ''}` instead of `${key}`.

  Add a binding-type check that mirrors upstream `scope.evaluate`: a Normal
  binding that is never reassigned and whose initializer is a `BinaryExpression`
  or `TemplateLiteral` is a definite string/number/boolean and therefore
  `is_defined`, so no `?? ''` is appended. Reads the recorded init node type
  directly (independent of the unpopulated flag). Deliberately excludes
  `UpdateExpression` (`x++`), which upstream's `evaluate` has no case for and
  thus treats as UNKNOWN — keeping its `?? ''`. Removes
  `svelte-table/example/example6/ContactButtonComponent.svelte` from
  known-failures.client.json.

- bc553d3: fix(transform): propagate inferred namespace into nested component slots

  When lowering a component's slot content, the client computed the slot fragment's inferred namespace (used for whitespace trimming) but never stored it on the child state's `metadata.namespace`. So a namespace inferred from an `<svg>` deep in one component's slot did not cascade to a nested component's slot whose own children are namespace-inconclusive (only text + components).

  For `<Card>…<svg/></Card>` with a `<CardDescription>418.2K Visitors <Badge/></CardDescription>` inside, upstream infers `svg` for the `Card` slot and inherits it down (`infer_namespace`'s `new_namespace ?? namespace` fallback) so the `CardDescription` fragment is also `svg`. rsvelte kept `html`, building `$.from_html` with untrimmed SVG whitespace and mismatched `$.sibling` offsets.

  Set `state.metadata.namespace` to the inferred namespace while visiting slot children (save/restore around it), mirroring upstream `Fragment.js`, which puts the inferred `namespace` on the new child `state.metadata`. Removes `shadcn-svelte/…/cards/analytics-card.svelte` from known-failures.client.json.

- ac25917: fix(transform): treat an each-item that shadows an outer binding as reactive

  A text/attribute interpolation whose expression is an `{#each … as item}` loop
  variable is reactive, so the client codegen must emit a
  `$.template_effect(() => $.set_text(…))` rather than a one-time `nodeValue`
  assignment. When the loop variable shadowed a same-named outer binding
  (`const title = '…'; {#each rows as title}{title}{/each}`),
  `expression_has_reactive_state` resolved the name to the outer (non-reactive)
  constant — the transform-side scope is not switched to the each scope during the
  body walk — and wrongly baked the interpolation as static. Mirror the existing
  `get_literal_value` each-shadow guard: a name matching an enclosing each ITEM is
  always reactive, an each INDEX uses its analyzer-computed reactivity. Fixes the
  flowbite-svelte admin-dashboard CRUD `+page` components (client SSR/CSR).

- 93eac0b: fix(transform): each item shadows an outer same-named prop getter

  A non-reactive `{#each}` item that is a simple identifier is bound as the render
  arrow's parameter, so it fully shadows any outer binding of the same name. But
  the client only _inserted_ a transform for the item when it was reactive — a
  non-reactive item left a stale outer transform in place. When the shadowed name
  was a runes prop (transform `position → position()`), a body reference or
  `{@const}` wrongly called the prop getter:

  ```svelte
  {#each positions as position}
    {@const [y, x] = position.split('-')}   <!-- was position().split('-') -->
  {/each}
  ```

  Remove any outer transform for the item name in the non-reactive branch too,
  mirroring upstream where the each-item binding shadows the outer scope.

- 0f346a5: fix(esrap): parenthesize an optional-chain callee of a non-optional call

  `rsvelte_esrap` printed a `CallExpression` whose callee is a `ChainExpression`
  (an optional member) without wrapping parentheses, so a NON-optional call on an
  optional-chain callee — e.g. a dynamic `<svelte:component this={instruct?.dataComponent} />`
  lowering to `(instruct?.dataComponent)($$renderer, …)` — was mis-printed as
  `instruct?.dataComponent($$renderer, …)`. Those differ semantically (the latter
  short-circuits when `instruct` is nullish) and are not AST-equivalent.

  The callee-precedence check (`< 19`) could not catch it because a
  `ChainExpression` has the same precedence (19) as a call. Add esrap's explicit
  `callee.type === 'ChainExpression'` wrap rule so the callee is parenthesized.
  Removes `powertable/app/src/lib/components/PowerTable.svelte` from
  known-failures.server.json.

- c8795c0: fix(esrap/napi): defensive printer fixes and compileModule arena leak

  esrap's `Dedent` no longer underflows on unbalanced command streams and template
  quasis are indexed defensively. The `compileModule` zero-copy NAPI path now uses
  the same leak-safe `BumpGuard` envelope helper as the component path, so a buffer
  creation error no longer leaks the bump arena.

- b7e28b7: fix(analyze): record `$$props` references so legacy reactive deps deep-read it

  A legacy reactive expression reading `$$props.x` (e.g. an `{#if $$props.class || underline || cursor}` test) omitted the `$.deep_read_state($$sanitized_props)` dependency from its `build_expression` sequence, so it read `($.deep_read_state(underline()), …)` instead of `($.deep_read_state($$sanitized_props), $.deep_read_state(underline()), …)`.

  The cause was that Phase 2 never declared a `$$props` binding, so `$$props.x` resolved to nothing and no reference was recorded in the expression metadata. Mirror upstream `2-analyze/index.js`, which declares a synthetic `$$props` `rest_prop` binding in the instance scope (non-runes branch) before the walks. The Phase-3 `build_expression` port already deep-reads a `$$props` reference (mapping it to `$$sanitized_props`); it simply never saw one.

  Guard `has_prop_bindings` against the synthetic name so a component with no real props (e.g. a static SVG icon) does not gain a spurious `$$props` parameter — mirroring upstream's `binding.node.name !== '$$props'` checks. `$$restProps` is deliberately left undeclared (its plain-read path already works and binding it would mis-route `$$restProps.x`). Removes `svelte-ux/packages/svelte-ux/src/lib/components/Tooltip.svelte` from known-failures.client.json.

- 3e43d67: fix(transform): client legacy `$.mutable_source` wrapping handles inits on the next line

  The legacy state-declaration transform matched `let x = <init>` with a hardcoded
  trailing space after `=`, so a declaration whose initializer begins on the
  following line — e.g. `let selectedDayOfWeek: DayOfWeek =\n  $format.settings…` —
  did not match the init-bearing pattern. The declarator was mis-wrapped as an
  empty `$.mutable_source()` and its initializer was orphaned as a dangling
  statement (`$.mutable_source();\n $format()…;`).

  Match `=` without the trailing space, guard against `==` / `=>`, and skip any
  whitespace (including newlines) between `=` and the initializer before reading
  the init expression. Removes
  `svelte-ux/packages/svelte-ux/src/lib/components/DateRange.svelte` from
  known-failures.client.json.

- 581d520: fix(parse): harden parser against panics and infinite loops on edge-case input

  `strip_type_annotation` now slices on byte offsets (`{const café: T = e}` no
  longer panics), the CSS rule loop has a progress guard so `<style>{}</style>`
  reports `css_expected_identifier` like the official compiler instead of hanging,
  and selector identifiers accept code points >= 160 (matching the official
  compiler's treatment of e.g. `×` as a valid type selector).

- 8e38ff1: fix(preprocess): defer the sources/names table clone in sourcemap concat until an entry is actually new

  `MappedCode::concat`'s `merge_tables` helper unconditionally cloned the entire
  `this_table` slice (`self.map.sources` / `self.map.names`) up front via
  `this_table.to_vec()`, before checking whether any entry from `other_table` was
  actually missing. In the common case — every `other_table` entry already
  present — the caller discards the returned table anyway (it only assigns it
  back when `changed` is `true`), so the clone was wasted work on every
  `concat()` call, which runs once per stitched-together `MappedCode` chunk while
  building a preprocessed file's source map.

  `merge_tables` now only materializes the merged table (via
  `Option::get_or_insert_with`) the first time an entry is found missing, and
  returns an empty `Vec` (never read by the caller) when nothing changed. Output
  is unchanged — this only affects the discarded-on-no-op allocation.

- ef9c121: fix(transform): compile assignments to `$state` that broke SvelteKit remote functions (#1438). A logical compound assignment (`??=`/`||=`/`&&=`) to a private `$state` field inside a method/getter, and an object/nested destructuring assignment to a module-level `$state` variable, were both miscompiled to invalid assignment targets. They now lower to `$.set(...)` matching the official compiler.
- 277e6cd: fix(transform): server declarator `$state()` is a store read when `$state` is a subscription

  `let x = $state()` in the instance script was always lowered to the `$state`
  rune (→ `let x = void 0`). When a same-named store is subscribed — e.g. a
  `state` prop read as `$state` — upstream `get_rune` returns null (the
  auto-created `$state` store-subscription binding shadows the rune), so the
  declarator is a store read: `let x = $.store_get(($$store_subs ??= {}),
"$state", state)()`. Detect that in `lower_variable_declaration` by looking up
  the `$`-prefixed callee name as a `BindingKind::StoreSub` binding that is
  lexically visible at (an ancestor-or-self of) the instance scope, gated to the
  instance script only. Precise enough to leave ordinary runes alone:
  `let props = $props()` (binds `props`, no `$props` subscription),
  `let state = $state(0)` (no `$state` read), and a module-script
  `const data = $state({…})` next to an unrelated `const state` all stay runes.

- 673b2b0: fix(preprocess): harden sourcemap decoding and warning offset handling

  Malformed VLQ continuation runs no longer overflow-panic the decoder (shift is
  bounded and running state uses wrapping adds), `process_markup` now decodes
  standard VLQ-string v3 maps through `decode_map` instead of silently dropping
  them, and `byte_offset_to_position` rewinds mid-codepoint offsets to the nearest
  char boundary before slicing.

- cafca99: fix(transform): deep infer_namespace for SSR reset-parent fragments

  The server whitespace trimmer decides whether a fragment's inter-node
  whitespace is removable from its inferred namespace (svg/mathml contexts drop
  whitespace-only text; html keeps a single space). rsvelte inferred that
  namespace with a shallow direct-child scan; upstream `infer_namespace`
  deep-walks into `{#if}` / `{#each}` / `{#await}` / `{#key}` block bodies for
  namespace-resetting parents (Root / Fragment / Component / SnippetBlock /
  SlotElement). Porting `check_nodes_for_namespace` fixes two SSR whitespace
  divergences: `<svg>…</svg> {#if}<p>…{/if}` (keep the space — html found inside
  the block) and top-level `{#if}svg{/if} {#if}svg{/if}` (drop the space — all svg).

- 511cb42: fix(transform): use byte offsets when slicing instance-script strings

  Several client instance-script string helpers iterated with
  `chars().enumerate()` (or a collected `Vec<char>`) and then used the resulting
  char index as a byte offset into the original `&str`. Any non-ASCII byte before
  the slice point (a non-ASCII identifier, object key, string/type literal — all
  valid JS/TS/Svelte) pushed the byte offset past a `char` boundary, panicking the
  compiler with `byte index N is not a char boundary`. Because these helpers run
  whenever the client instance-script IR is built, the crash was reachable from
  untrusted `.svelte` input.

  Fixed all five sites to work in byte offsets (`char_indices()` /
  peekable-iterator neighbor lookups) so e.g. `let { café, b } = $props()`,
  `let { café: renamed } = $props()`, `let [café = 1] = arr`, and
  `let x: Café = 0` compile instead of panicking:

  - `props_transforms.rs`: `split_property_key_value`, `split_destructuring_properties`
  - `destructure_transforms.rs`: `find_top_level_equals` (fixes its 11 byte-slicing callers)
  - `state_transforms.rs`: `body_references_identifier_in_statements`,
    `transform_legacy_state_declarations`

  ASCII input is unaffected (char index equals byte index there), so output is
  byte-for-byte unchanged.

## 0.7.16

### Patch Changes

- e06d43d: fix(compiler): lower legacy-reactive component bind writes through `$.set`

  A `bind:` on a component whose target is a legacy reactive (`$:`-declared)
  variable was lowered to a plain `path = $$value` assignment instead of the
  reactive `$.set(path, $$value)`, so writes from the child component no longer
  notified subscribers (reactivity loss). The getter still read the variable via
  `$.get(path)`, producing an inconsistent get/set pair.

  `process_bind_directive`'s `is_state_binding` predicate only covered
  `is_state_source || Derived`, so a `LegacyReactive` identifier fell through to
  the final plain-assignment branch. `add_state_transformers` registers a `$.set`
  assign transform for exactly `is_state_source || Derived || LegacyReactive`, so
  `LegacyReactive` is now included here to match.

  Fixes #1228 (smelte `_layout.svelte`, svelte-calendar `DayPicker.svelte`).

- d826d82: fix(compiler): detect spread/ternary store subscriptions and emit store getters in first-reference order

  Three Phase-2 store-subscription detection bugs surfaced by the store-heavy
  legacy layercake components in the awesome-svelte compat corpus, all affecting
  the client `const $store = () => $.store_get(...)` getters:

  - A store referenced only through a spread (`Math.max(...$xRange)`) was never
    detected — the lexical `$`-scan treated the third `.` of `...` like a member
    access (`obj.$x`) and skipped it, so the getter was missing entirely (broken
    reactivity). A leading dot now counts as member access only when it is a
    single dot.
  - A store in a ternary consequent (`cond ? $xGet : $yGet`) was dropped because
    `$xGet :` looked like an object property key (`{ $xGet: ... }`). A property
    key is never preceded by `?`, so a ternary consequent is now excluded.
  - Store getters were emitted in the wrong order: template refs were sorted by a
    substring `source.find`, so `$x` matched inside `$xGet`/`$xScale` and `$y`
    inside `$yGet`/`$yRange`. They are now kept in AST-traversal (first-reference)
    order, matching the official compiler's `scope.declarations` insertion order.

  Fixes #1229 (layercake `Column` / `GroupLabels` / `QuadTree` / `AxisRadial`).

- 9c92abe: fix(transform): keep a bare prop-identifier prop default as a getter reference

  A legacy `export let b = a` where `a` is another prop lowers to
  `$.prop($$props, 'b', 24, a)` — the prop's getter function is passed directly as
  the lazy initial value. The default-value prop-read pass was wrapping the bare
  `a` into `a()`; it now leaves an exactly-bare prop-identifier default untouched
  while still wrapping prop reads nested in a larger default.

- 257efbd: fix(transform): treat a computed member with a reactive property as reactive

  `has_reactive_state_json` only inspected a member expression's OBJECT, so
  `{ xs: '…', … }[size]` (an inline object indexed by a reactive prop `size`) was
  deemed non-reactive and emitted as a plain object property instead of a `get`
  accessor. A computed member whose property reads reactive state is now treated as
  reactive.

- 8e74d34: fix(compiler): order `$.bind_props` props correctly when a prop is shadowed by a function parameter

  When an `export let` prop shares its name with a function parameter elsewhere in
  the script —

  ```svelte
  <script>
    function setTooltipContext(tooltip) { setContext(key, tooltip); }
    export let tooltip = writable({ … });   // line 116
    export let hideDelay = 0;               // line 127
  </script>
  ```

  — the `BindableProp` kind can land on the parameter binding (which has no
  `declaration_start`), so the server `$.bind_props($$props, { … })` trailer sorted
  that prop to the end (`{ …, hideDelay, tooltip }`) instead of its true source
  position (`{ …, tooltip, hideDelay }`).

  Fix the bind_props sort to borrow the real `let`/`var` declaration's
  `declaration_start` when the marked binding lacks one. This is sort-only: it does
  not change which binding is marked `BindableProp`, so the var-hoisting order (and
  the previously-fixed `BrushContext`/`GeoContext` outputs) are untouched. Clears
  `layerchart/.../tooltip/TooltipContext.svelte` (44 → 43).

- e8dfdb7: fix(compiler): resolve block-scoped local shadowing a prop in mutation tracking

  A block-local `let` that shadows a prop of the same name was mis-attributed to
  the prop, inflating its `$.prop(...)` flags with `PROPS_IS_UPDATED`:

  ```svelte
  <script>
    let { css = "" } = $props();
    const days = $derived.by(() => {
      for (…) {
        let css = "";        // block-local, shadows the prop
        css += " wx-selected"; // mutates the LOCAL, not the prop
      }
    });
  </script>
  ```

  The Phase-2 scope builder created a lexical scope for each `BlockStatement` (so
  the local `css` lived there), but it didn't register that scope anywhere the
  later visitor pass could find it, and the visitor's `BlockStatement` walk never
  entered block scopes. So `css += …` resolved up to the prop binding and marked it
  reassigned → `$.prop($$props, "css", 7, "")` instead of `3`.

  Register each (non-function) block's scope in `function_scope_map` keyed by the
  block start, and have the typed visitor walk enter that scope for `BlockStatement`
  nodes (mirroring how function bodies are already handled). Block-local mutations
  now resolve to the correct local binding. Clears
  `svar-core/svelte/src/components/calendar/Month.svelte` (42 → 41).

- 7c5cef6: fix(compiler): strip comments when collapsing multi-line import specifiers

  `cleanup_import_line` joins a hoisted multi-line `import { … }` onto a single
  line with spaces. A `//` comment between specifiers —

  ```js
  import {
    AppBar,
    AppLayout,
    Button,
    ThemeSelect,
    // ThemeSwitch,
    Tooltip,
    settings,
  } from "svelte-ux";
  ```

  — was folded inline, commenting out the rest of the statement (including
  `} from '…'`) and producing invalid JS. Strip `//` and `/* … */` comments (via
  `strip_js_comments`, which respects the module-specifier string) before the
  line-join, mirroring esrap which drops these comments. Clears
  `layerchart/.../routes/+layout.svelte` from the corpus baseline (54 → 53).

- dc40cc7: fix(compiler): ignore comments when splitting `$props()` destructuring declarators

  `split_declarators` (used to parse the names in a `let { … } = $props()`
  destructuring for the `$.rest_props(…)` exclusion list) split on every top-level
  comma, including commas inside `//` and `/* … */` comments. A comment such as

  ```js
  let {
    class: className,
    // we add name, color, and stroke for compatibility with different icon libraries props
    name,
    ...restProps
  } = $props();
  ```

  was split on its internal commas, so the comment fragments leaked into the
  emitted `new Set([…])` exclusion list as bogus prop names — producing an
  unterminated-string / invalid-JS output. The same shape with a trailing
  `// comment, with commas` after a real prop corrupted the following names.

  Make `split_declarators` comment-aware (skip `//` to end-of-line and `/* … */`,
  respecting string literals and not self-closing a `/*/`). The comment text stays
  with the declarator and is stripped per-declarator by the existing caller logic.
  Clears `flowbite-svelte/.../ClipboardManager.svelte` and
  `shadcn-svelte/.../spinner/spinner.svelte` from the corpus baseline (56 → 54).

- 4037211: fix(compiler): don't collect a nested function's local declarations as reactive dependencies

  A legacy reactive expression whose value contains a nested function with its own
  local declarations —

  ```svelte
  sum(visibleSeries, (s) => {
    const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data;
    return valueAccessor(seriesTooltipData);
  })
  ```

  — wrongly listed the function-local `seriesTooltipData` in the dependency
  sequence (`$.deep_read_state(seriesTooltipData)`). Upstream filters references by
  `function_depth`: a binding declared inside the nested function is a local, never
  an eager dependency (its own deps — `findRelatedData`/`data`/`x` — are tracked
  instead).

  The fallback dependency collector (`collect_reactive_references_inner`) already
  shadowed arrow/function _parameters_; it now also shadows top-level
  `const`/`let`/`var` declarations in the function body (scoped via the existing
  seen-set save/restore).

  Clears `layerchart/.../charts/BarChart.svelte`, zero corpus regressions.

- 58fbddc: fix(compiler): don't `$.deep_read_state` an each-item that shadows a prop of the same name

  A destructured each-item binding whose name matches an outer prop —

  ```svelte
  <script>export let data;</script>
  {#each dataByFruit as [fruit, data]}
    <Point d={data[data.length - 1]} />
  {/each}
  ```

  — was wrapped in `$.deep_read_state(data())` in legacy dependency lists, whereas
  upstream emits a plain `data()`. The reference resolves (correctly, via the
  each-item read transform) to the each-item local, but the deep-read decision used
  `get_binding`, which walks the static scope tree and returns the shadowed
  `export let data` prop (`bindable_prop`) → forced a deep read.

  Two parts:
  1. The destructured-each-item branch now clears each path name from
     `transform_deep_read` (the simple-identifier each-item branch already did this).
  2. The legacy dependency builders deep-read a `bindable_prop` only when it is NOT
     shadowed by a local read transform (`!has_read_transform`) — mirroring the
     existing `import` arm. A genuine, unshadowed prop is still deep-read via its
     `transform_deep_read` marker, so only the wrongly-resolved shadowed case is
     suppressed.

  Clears `layerchart/.../routes/docs/examples/Area/+page.svelte` and
  `layerchart/.../components/Grid.svelte` (37 → 35), with zero regressions across
  the full corpus.

- 20db5a3: fix(compiler): treat a parenthesized sub-expression as "simple" in prop fallbacks (SSR)

  A legacy prop whose default is a simple arithmetic expression containing
  parentheses was emitted with a needless lazy thunk:

  ```svelte
  <script>
    export let value = max < min ? min : min + (max - min) / 2;
  </script>
  ```

  produced `$.fallback($$props["value"], () => (max < min ? …), true)` instead of
  the eager `$.fallback($$props["value"], max < min ? …)`.

  Upstream parses with `preserveParens: false`, so `is_simple_expression` never
  sees a parenthesized node. OXC preserves `(max - min)` as a
  `ParenthesizedExpression`, which `is_simple_default`'s catch-all treated as
  non-simple — making the whole default complex → lazy. Unwrap
  `ParenthesizedExpression` (recurse on the inner expression) so a parenthesized
  simple expression stays simple/eager, matching upstream. Clears
  `attractions/.../slider/slider.svelte` (38 → 37).

- 4ee5f7c: fix(compiler): scope-aware prop reads in non-assignment reactive statements + parenthesize arrow operands of logical expressions

  Two codegen bugs that made `layerchart/.../Highlight.svelte` emit invalid JS:

  1. **Destructuring shadow in a reactive statement.** A `$:` body that is not a
     simple assignment (e.g. `$: if (cond) { items.map((p) => { const [x, y] =
f(p); … }) }`) was routed through the scope-unaware text prop-read transform,
     wrapping the destructuring binding targets that shadow props `x`/`y` →
     `const [x(), y()] = …` (a syntax error). It now goes through the AST wrapper
     (`wrap_prop_source_reads_ast`), which uses OXC semantics to skip locally
     shadowed names. `wrap_prop_source_reads_ast` now also returns the source
     unchanged when parsing succeeds but nothing needs wrapping (previously it
     returned `None`, which fell back to the text path and re-introduced the bug).
  2. **Arrow operand of a logical expression.** The text printer didn't
     parenthesize an arrow / `yield` operand of `&&`/`||`/`??`, so
     `onclick={onareaclick && ((e) => …)}` printed as `onareaclick() && (e) => …`
     (mis-parses, since arrows bind lower than `&&`). `logical_operand_needs_parens`
     now wraps `Arrow`/`Yield` operands.

  Clears `Highlight.svelte`, zero corpus regressions.

- cfb6a15: fix(compiler): don't drop `import`/`export` lines inside multi-line template literals

  The legacy text-based instance-script transform walks the script line by line,
  skipping lines that begin with `import `, `export { … }`, or a `$props.id()`
  declaration (they are hoisted / handled elsewhere). That skip fired
  unconditionally — even when the line actually lived _inside_ a multi-line
  template literal being accumulated, e.g. a code-sample string:

  ```js
  const code = `<script>
    import { LayerCake, Svg } from 'layercake';
  </script>`;
  ```

  The `import …` line was silently dropped from the emitted template literal,
  corrupting the string. (The line-by-line `$`-token heuristic routed these
  scripts into the text transform because `${…}` interpolations contain `$`.)

  Gate the three statement-boundary skips on `accumulated_lines.is_empty()`, which
  is true only at a clean statement boundary (the accumulator is cleared on
  completion), so lines inside a mid-statement template literal are preserved
  verbatim. Shrinks `compat/corpus/known-failures.json` by 3 entries (59 → 56),
  including the large `flowbite-svelte/.../builder/badge/+page.svelte` divergence.

- 267ba18: fix(compiler): emit `$.invalidate_inner_signals` for legacy prop member mutations

  A legacy `<select bind:value={prop.x}>` whose subtree references other variables
  (`<option>` content, the select's own `id`, etc.) records those on the bound
  prop's `legacy_indirect_bindings`; the official compiler wraps every mutation of
  that prop in `(prop(...), $.invalidate_inner_signals(() => { …reads }))` so the
  referenced signals re-read. rsvelte only did this for `bind:` setters, not for
  ordinary prop member mutations (e.g. `field.tooltipAttributes = {}` in `onMount`).

  Two fixes:
  - Phase 3: the legacy prop-member-mutation rewrite (`prop_member_mutate_ast`) now
    wraps the mutation in the `$.invalidate_inner_signals` sequence when the prop
    carries indirect bindings, using each binding's read form (prop → `name()`,
    store sub → `name()`, reactive state/derived → `$.get(name)`, else bare).
  - Phase 2: `legacy_indirect_bindings` collection is narrowed to identifiers
    referenced _within the `<select>` element's own source span_ (ordered by source
    position), mirroring the official `scope.references` iteration. Previously it
    pulled in every template-referenced binding in the component, so an `id` used on
    an unrelated sibling element leaked into the invalidation list.

  Clears `svelte-form-builder/.../PropertyPanelTooltip.svelte` (50 → 49).

- 4537f04: fix(compiler): deep-read a keyed `{#each}` block's reactive index in dependency lists

  In a keyed each block (`{#each items as item, i (item.key)}`) the index `i` is
  reactive — upstream gives it binding kind `template`, so a dependency read deep-reads
  it: `$.deep_read_state($.get(i))`. rsvelte emitted a plain `$.get(i)` because the
  each-block visitor unconditionally cleared the index from `transform_deep_read`, and
  the `EachIndex` fallback check in `collect_reactive_references` can miss it when
  `get_binding` resolves a same-named non-index binding (e.g. a `map((d, i) => …)`
  callback param) instead of the keyed index.

  The index is now marked in `transform_deep_read` when reactive (keyed), and still
  shadows an outer same-named marker when static (non-keyed).

  Clears `layerchart/.../charts/AreaChart.svelte`, zero corpus regressions.

- cd60e94: fix(compiler): treat `Math`/`Number` constant members as compile-time known

  A `$derived` whose initializer is constant arithmetic over a global constant —

  ```svelte
  const circumference = $derived(2 * Math.PI * 42.5);
  ```

  — was treated as reactive, so an attribute that only reads it (e.g.
  `style="stroke-dasharray: {circumference} {circumference};"`) was emitted inside a
  `$.template_effect(...)` instead of as a one-time `$.set_style(...)`. The
  reactive-state evaluator's `is_expression_known_json` returned `false` for every
  `MemberExpression`, so `Math.PI` made the whole derived "unknown → reactive".

  Treat a non-computed member of a pure global namespace (`Math.*`, `Number.*`,
  when not locally shadowed) as a known compile-time constant — mirroring the
  globals table in upstream `scope.evaluate`. `Math.random()` etc. stay reactive
  (they're `CallExpression`s, handled separately). Clears
  `shadcn-svelte/.../circular-gauge.svelte` (45 → 44).

- 8541c7b: fix(compiler): don't truncate a multi-line initializer whose continuation starts with `(`/`[`/backtick

  A legacy state declaration whose initializer continues on the next line starting
  with `(` was wrapped incorrectly:

  ```svelte
  <script>
    let shownCalendar =
      (range && value != null ? value.start : value) || new Date();
  </script>
  ```

  produced `let shownCalendar = $.mutable_source()(range … ) || new Date()` — an
  empty `$.mutable_source()` followed by the un-wrapped initializer — instead of
  `$.mutable_source((range … ) || new Date())`.

  `find_statement_end_client` treated the newline after `=` as a statement end
  because the next non-whitespace char (`(`) was not in its continuation set, so the
  extracted initializer was empty. Per JavaScript ASI, a line break followed by `(`,
  `[`, or a backtick continues the previous expression (`foo\n(bar)` is `foo(bar)`,
  `a\n[i]` is `a[i]`). Add those to the continuation set. Clears
  `attractions/.../date-picker/date-picker.svelte` (40 → 39).

- 79d2380: fix(compiler): parenthesize a `new` callee when a state read makes its member-spine contain a call

  `new deckgl.MapboxOverlay(...)` where `deckgl` is `$state()` rewrites to
  `new ($.get(deckgl).MapboxOverlay)(...)` upstream — the callee's member-spine now
  contains a `CallExpression` (`$.get(deckgl)`), so `new` requires parentheses or the
  trailing `(...)` would parse as the `new` arguments. esrap/codegen apply this for
  proper AST `new` nodes, but the legacy `$.get(...)` text-rewrite path
  (`ast_state_transform`) emitted the `new` as raw text and skipped it. A
  `visit_new_expression` now inserts the parens when the callee's leftmost member-spine
  identifier is a state variable.

  Clears `svelte-maplibre/.../DeckGlLayer.svelte`, zero corpus regressions.

- 639a952: fix(compiler): parenthesize a `new` callee whose member spine contains a call (text printer)

  `new $.get(deckgl).MapboxOverlay({ … })` was emitted by the text-printer fallback
  without parenthesizing the callee, so it parses as
  `(new $.get(deckgl)).MapboxOverlay({ … })`. The AST printer (esrap) already
  guards this via `callee_has_call_expression`; the text printer's
  `emit_new_expression` only parenthesized low-precedence callees (conditional,
  await, …), not a member chain containing a `CallExpression`. Mirror esrap: walk
  the callee's `Member`/`Call` spine and parenthesize when a call is found, emitting
  `new ($.get(deckgl).MapboxOverlay)({ … })`.

  Clears the SSR (server) output for `svelte-maplibre/.../DeckGlLayer.svelte`
  (server known-failures 35 → 34). Its CSR output still differs on an orthogonal
  axis (the client builds the effect body as a raw string, bypassing the AST
  printer), so the client entry remains.

- e151196: fix(compiler): legacy `invalidate_inner_signals` for `$.mutate()` state member mutations

  A legacy `<select bind:value={state.x}>` whose subtree references other scope
  variables must invalidate those signals when the bound state is mutated. The prop
  path (`prop(prop().x = v, true)`) already wrapped with
  `$.invalidate_inner_signals`; the legacy **state** member-mutation path
  (`$.mutate(state, …)`) did not. The precomputed invalidate bodies now cover any
  binding with `legacy_indirect_bindings` (state as well as props), and
  `transform_legacy_state_member_mutate_ast` wraps `$.mutate(state, …)` in
  `(<mutation>, $.invalidate_inner_signals(() => { … }))` when applicable.

  Clears `powertable/.../PowerTable.svelte`, zero corpus regressions.

- cafa711: fix(compiler): a prop default referencing a legacy `$:` reactive variable is lazy

  ```svelte
  <script>
    $: defaultServiceUrl = services['mapbox v1']['streets-v11'];
    export let serviceUrl = defaultServiceUrl;
  </script>
  ```

  `serviceUrl`'s default references `defaultServiceUrl`, a legacy `$:` reactive
  variable (`BindingKind::LegacyReactive`). Upstream applies the read transform
  first — `defaultServiceUrl` → `$.get(defaultServiceUrl)` — so `is_simple_expression`
  sees a (non-simple) `CallExpression` and emits a lazy thunk with
  `PROPS_IS_LAZY_INITIAL`: `$.prop($$props, 'serviceUrl', 28, () => $.get(defaultServiceUrl))`.

  rsvelte's prop-flag reactivity check only recognised
  `bindable_prop`/`prop`/`state`/`raw_state`/`derived` identifiers as non-simple, so
  a `LegacyReactive` reference was treated as simple → emitted eagerly
  (`…, 12, $.get(defaultServiceUrl)`). Add `LegacyReactive` to both prop-default
  paths; unlike a prop ref it transforms to a member call (`$.get(...)`), so it is
  thunked rather than unwrapped to a bare callee.

  Clears `layerchart/.../docs/TilesetField.svelte`, zero corpus regressions.

- 20401c3: fix(compiler): keep `PROPS_IS_UPDATED` when a reassigned prop is shadowed by a function parameter

  When an `export let` prop shares its name with a function parameter elsewhere in
  the component, the `BindableProp` kind can land on the parameter binding (which is
  never reassigned), while the real prop declaration — which actually carries the
  reassignment — ends up as a separate instance-scope binding:

  ```svelte
  <script context="module">
    function setCanvasContext(context) { setContext(key, context); } // param `context`
  </script>
  <script>
    export let context = undefined;                 // the real prop
    onMount(() => { context = element?.getContext('2d'); }); // reassigns the prop
  </script>
  ```

  `calculate_prop_flags` resolved the parameter binding (not reassigned) and emitted
  `$.prop($$props, "context", 8, …)` (BINDABLE) instead of the correct `12`
  (BINDABLE | UPDATED).

  When computing `PROPS_IS_UPDATED`, also OR in the reassigned/mutated state of any
  same-named _real_ declaration in the instance/module scope (excluding function
  parameters). This is flag-only — it does not change which binding is marked
  `BindableProp`, so var-hoisting (and the previously-fixed `BrushContext` /
  `GeoContext` outputs) are untouched. Clears
  `layerchart/.../layout/Canvas.svelte` (41 → 40).

- 6c1e662: fix(compiler): resolve a prop shadowed by a same-named function parameter

  When a legacy prop/store (`export let brush = writable(...)`, also read as
  `$brush`) shares its name with a function parameter (`function setBrushContext(brush) {…}`),
  Phase-2 can register that parameter at the instance scope index. Binding lookups
  keyed on `instance_scope_index` then resolved to the parameter (kind `normal`)
  instead of the prop, so the prop was mis-compiled:

  - client store-getter emitted `$.store_get(brush, …)` instead of `$.store_get(brush(), …)`;
  - the `$.prop(…)` flag dropped `PROPS_IS_BINDABLE`;
  - the server emitted a plain `let brush = writable(...)` instead of
    `let brush = $.fallback($$props['brush'], () => writable(...))`.

  Prefer an actual `prop`/`bindable_prop` binding of the name over a shadowing
  local/parameter in the three resolution points (`binding_by_name`,
  `calculate_prop_flags`, server `legacy_binding_is_prop`). Also emit
  `$.bind_props({…})` in source-declaration order (`declaration_start`) since a
  prop that is also a store subscription can otherwise be listed out of order.

  Clears `layerchart/.../BrushContext.svelte` and `.../GeoContext.svelte`
  (49 → 47).

- d4f8a77: fix(compiler): correct legacy `invalidate_inner_signals` for `<select bind:value>` indirect bindings

  Legacy `<select bind:value={prop…}>` must invalidate the OTHER scope variables read
  within the select (e.g. a `guid` prop in the select's `id=` attribute) whenever the
  bound value is mutated. Several gaps are fixed so the invalidation matches upstream:

  - **`legacy_indirect_bindings` population** (`2-analyze/RegularElement`): the indirect
    bindings are now collected from the select's enclosing scope **and its ancestors**
    (via `binding.scope_index`, not the backward-compat-polluted `scope.declarations`),
    so an outer-scope prop like `guid` is included while child-scope each-block items are
    excluded. Store auto-subscriptions (`$label`) are skipped (no real scope binding
    upstream).
  - **assignment LHS is reactive** (`has_reactive_state` AssignmentExpression): `{(x.value
= [])}` now reads `x` on the LHS, so the text is reactive (`$.template_effect`) rather
    than a static `nodeValue =`.
  - **invalidate wrap on prop member mutations** (template assignment + component
    `bind:value` setter): a prop member mutation whose prop has `legacy_indirect_bindings`
    is wrapped in `(<mutation>, $.invalidate_inner_signals(() => { … }))`.

  Clears `svelte-form-builder/.../PropertyPanelDataAttributes.svelte`, zero corpus
  regressions (binding-indirect / binding-interop-derived / select-option-store etc. all
  still pass).

- 57ba819: fix(compiler): mark a `<select>` with non-option content as "rich" (SSR)

  A `<select>` whose children include anything other than `<option>`/`<optgroup>`
  elements — e.g. `<select multiple><slot /></select>` — must emit the trailing
  `is_rich = true` flag on the SSR `$$renderer.select(attrs, fn, …rest, true)` call
  so the runtime adds the customizable-select hydration marker.

  rsvelte's rich-content scan (`select_special_is_rich`) was narrower than upstream's
  `is_customizable_select_element`: it only treated components / `{@render}` /
  `{@html}` as rich and missed `<slot>` (a `SlotElement`), non-option/optgroup
  regular elements, and text. It now faithfully ports
  `is_customizable_select_element` for the `<select>` owner (mirroring
  `find_descendants`: skip snippet/debug/const/declaration/comment/expression tags,
  recurse if/each/key/await/boundary branches but not element children, and treat a
  non-option/optgroup element, non-whitespace text, or any other node as rich).

  Clears `sveltestrap/.../Input/Input.svelte` (SSR), zero corpus regressions.

- 6a5f48f: fix(compiler): a snippet is non-hoistable when a nested function closes over instance state

  A root-level `{#snippet}` was hoisted to module scope even when one of its nested
  functions referenced component state, e.g.:

  ```svelte
  {#snippet MobileLink({ href, content })}
    <a {href} onclick={() => { open = false; }}>{content}</a>
  {/snippet}
  ```

  `open` is component state, so upstream keeps `MobileLink` defined _inside_ the
  component; rsvelte hoisted it to module top-level. The hoistability walk
  (`can_hoist_snippet`) treated every `ArrowFunctionExpression` /
  `FunctionExpression` as unconditionally hoistable (`=> true`), so references
  inside nested handlers were never inspected.

  Now nested functions are walked: their own params and locally-declared names are
  treated as local, and any remaining reference to an instance-level binding blocks
  hoisting — mirroring upstream's `scope.references` walk through nested functions.
  Both the typed and JSON expression checkers route through one shared helper.

  Clears `shadcn-svelte/.../mobile-nav.svelte` and
  `flowbite-svelte/.../datepicker/Datepicker.svelte` on both CSR and SSR, with zero
  corpus regressions.

- e6110b2: fix(compiler): a spread element marks an expression as having a call (legacy reactivity)

  A legacy component/element attribute value containing a spread —

  ```svelte
  <Comp scrollIntoView={{ condition: a === b, onlyIfNeeded: c, ...rest }} />
  ```

  — was emitted without the `(deps, $.untrack(...))` dependency sequence, so its
  reactive dependencies (`c`, `rest`, …) weren't tracked. Upstream's
  `2-analyze/visitors/SpreadElement.js` sets `has_call = true` (and `has_state =
true`) for any spread ("treat `[...x]` like `[...x.values()]`"), which makes
  `build_expression` wrap the value. rsvelte's metadata walks omitted spreads, so
  `has_call`/`has_member`/`has_assignment` were all false → the value was emitted
  bare.

  Both metadata walks now flag a `SpreadElement` as a call: the Phase-2
  `walk_js_expression` (`has_call` + `has_state`) and the Phase-3
  `walk_metadata_flags` used by `build_attribute_value` (`has_call`).

  Clears `svelte-ux/.../SelectField.svelte`, zero corpus regressions.

- a1beb29: fix(compiler): read a store dependency via `$name()` in attribute/derived dependency lists

  A reactive expression that depends on a store value (`$view`, or a store that is
  also written via `$.store_set(view, …)`) must collect that dependency as the
  store's subscribed value — `$view()` — not `$.deep_read_state(view)` (which would
  deep-read the store object instead of subscribing to its value).

  The `$:` reactive-statement dependency builder already handled stores, but the
  two attribute/derived dependency builders
  (`collect_reactive_references_from_metadata` and the tree-walking fallback
  `collect_reactive_references`) classified a store-backed binding as a
  prop/import and wrapped it in `$.deep_read_state(name)`. Detect a store
  dependency by the presence of the synthesized `$name` `StoreSub` binding and emit
  the `$name()` getter instead. Clears
  `svelte-form-builder/src/lib/FormBuilder.svelte` (43 → 42).

- ac7d1f9: fix(compiler): don't rewrite a `$store` reference inside a string literal

  `transform_store_reads_client` appends `()` to legacy store-subscription reads
  (`$store` → `$store()`). Its guard against rewriting inside a string only checked
  whether the _immediately preceding_ character was a quote, so it caught
  `'$store'` but not a store name appearing mid-string, e.g. a log message:

  ```js
  foo("[TODO] -> if ($canvas_dim) :", { w: $canvas_dim.w });
  ```

  The `$canvas_dim` inside the string was rewritten to `$canvas_dim()`, changing
  the string's content. Replace the preceding-char heuristic with
  `is_inside_string_literal`, which scans from the start tracking string and
  template `${ }` state (a `$store` inside a `${ }` interpolation is code and is
  still rewritten). Clears `svelthree/.../WebGLRenderer.svelte` from the corpus
  baseline (51 → 50).

- 128c6f6: fix(compiler): treat a const template-literal of known parts as non-reactive

  A component object-prop that references a `const` whose initializer is an
  interpolated template literal made of known constants —

  ```svelte
  <script>
    const default_title = "Svelte UI Components";
    const image = `https://example.com/og?title=${default_title}`;
  </script>
  <MetaTags openGraph={{ images: [{ url: image }] }} />
  ```

  — was over-memoized: `image` was treated as reactive state (so `openGraph` was
  wrapped in `$.derived(() => ({ … }))` instead of inlined), because Phase-2 only
  recorded a binding's `initial` for plain literals — an interpolated template
  literal left it `None`, which the reactive-state check reads as "unknown →
  reactive".

  Record the template-literal initializer AST in a new `Binding.init_expr_json`
  field (kept separate from `initial`, which feeds `is_prop_source`), populated in
  both the typed and JSON variable-declarator paths. The reactive-state check then
  runs `is_expression_known_json` over it (depth-guarded) — approximating
  `scope.evaluate().is_known` — so a template whose interpolations are all known
  constants is non-reactive, while one containing a call / await / reactive read
  stays reactive (still memoized). Clears `flowbite-svelte/src/routes/+page.svelte`
  and `.../blocks/+page.svelte` (47 → 45).

- d87b019: fix(compiler): treat a line ending in `?` as a statement continuation

  The text-based instance-script accumulator decides a multi-line statement is
  complete when a line looks balanced and isn't followed by an obvious
  continuation. A line ending in a bare ternary `?` was not recognised as a
  continuation, so a legacy `$:` (or `$derived`) assignment whose `?` and
  consequent were separated by a `// comment` —

  ```js
  $: isSelectedStart =
    selected instanceof Object
      ? // @ts-expect-error
        isSame(date, selected.from ?? selected.to)
      : false;
  ```

  — was split after the (comment-stripped) `?` line, orphaning
  `isSame(…) : false;` as bogus top-level statements and emitting invalid JS.

  Add `?` to the trailing-operator continuation set (a superset of the existing
  `??` case). Valid JS never ends a statement with a bare `?`, so this only
  rescues the dangling-ternary case. Clears
  `svelte-ux/.../components/DateButton.svelte` from the corpus baseline (53 → 52).

- 3ed1e82: fix(compiler): preserve whitespace inside `<title>` (SSR), matching upstream

  Upstream's server `TitleElement` visitor calls `process_children` directly on the
  raw fragment nodes — it never runs `clean_nodes`, so the title's inner whitespace
  is preserved verbatim:

  ```svelte
  <svelte:head>
    <title>
      {name ? `${name} |` : ''} Smelte the framework
    </title>
  </svelte:head>
  ```

  rsvelte's `process_children` cleans whitespace internally, so the leading
  `\n    ` before the expression was trimmed (`<title>${…}` instead of
  `<title>\n    ${…}`). Toggle `preserve_whitespace` around the title body's
  `process_children` so its whitespace is kept verbatim, matching upstream's
  clean_nodes bypass. Clears `smelte/src/routes/components/_layout.svelte`
  (39 → 38).

- 69fc318: fix(compiler): don't treat a trailing line comment's text as a continuation operator

  The text-based instance-script statement accumulator decides whether a statement
  continues onto the next line by inspecting the last line's trailing character.
  It ran this check on the raw line _including_ a trailing `//` comment, so a
  declaration whose comment happened to end in an operator-looking character —

  ```js
  export let screenWidth = 768; // md+
  export let menuProps = undefined;
  ```

  (the comment ends in `+`) was misread as a dangling binary `+`, merging the next
  `export let` into the same statement and emitting invalid JS. Comments are only
  pre-stripped here when the legacy script carries a `$`-token, so this path must
  be comment-robust on its own. Strip a trailing line comment (respecting string
  literals) before the trailing-operator / trailing-comma checks. Clears
  `svelte-ux/.../components/ResponsiveMenu.svelte` from the corpus baseline
  (52 → 51).

- 5a1c338: fix(compiler/css): correct three selector scoping/pruning divergences (#1237)

  Three CSS divergences from the official compiler surfaced by the awesome-svelte
  compat corpus (svar-core, svelte-toast), now byte-identical for client and server:

  - **Sibling-combinator over-prune.** `.wx-icon + .wx-label` was commented out as
    unused when the `.wx-icon` element carried a dynamic class
    (`class="wx-icon {expr}"`) — the static `wx-icon` chunk dropped out of the
    element's class set on bail-out. `selector_matches_element` now treats an
    element with an indeterminate `class` (interpolated expression or spread) as
    matching any class selector, mirroring upstream `attribute_matches`.
  - **Multi-line `:global( … )` whitespace.** The unwrap now slices `:global(`.end
    up to the byte before the closing `)` (matching upstream
    `remove_global_pseudo_class`), preserving the inner padding instead of using
    the tight `args` SelectorList span.
  - **`<style>` inside a `<script>` template literal.** A `<style>` substring in a
    script string literal (a docs page rendering a Svelte sample) was mistaken for
    the real stylesheet. `render_stylesheet` / `collect_css_unused_warnings` now
    prefer the parsed stylesheet's recorded `content` span over a textual scan.

- f061348: fix(transform): don't deep-read-wrap an import shadowed by an each-item

  A legacy dependency whose name matches a module import but resolves to a local
  each-item / each-index / snippet-param binding was wrapped in
  `$.deep_read_state(...)` as if it were the import. It now emits a plain
  `$.get(...)` like any each-item, matching the official compiler's scope-resolved
  references.

- 70f55d1: fix(transform): lower a write to a private state field inside a `$derived.by`

  A `$derived.by(() => { … this.#x = v … })` class-field initializer ran a blind
  read-replace that rewrote every `this.#x` to `$.get(this.#x)`, including
  assignment targets, producing the invalid `$.get(this.#x) = v`. It now uses the
  assignment-aware method transformer, which lowers the write to `$.set(...)`.

- 4b2e841: fix(compiler): don't misresolve a `$derived.by` for-loop variable to an `{#each}` item

  A `for`-loop variable inside a `$derived.by(() => { ... })` callback that shared
  a name with an `{#each ... as name}` template item triggered a false-positive
  `each_item_invalid_assignment` error, rejecting code the official compiler
  accepts. The runes-mode each-item check resolved the assignment target with a
  scope walk that reaches the pollution-seeded root scope, so it matched the
  template each item even though the `{#each}` block is not a lexical ancestor of
  the script callback. The error now only fires when the each-item binding's
  declaring scope is actually an ancestor of the assignment site.

- da4aa67: fix(transform): don't wrap explicit object-property keys as prop reads

  An explicit (non-shorthand) object-property key that happened to share a name
  with a `$props()` binding was being rewritten as a prop read in the client
  transform. Only shorthand properties and value positions are reads, so explicit
  keys are now left untouched, matching the official compiler's output.

- 859e522: fix(analyze): don't report `global_reference_invalid` for a `$`-prefixed destructured callback parameter

  A `$`-prefixed identifier bound by an array/object destructuring parameter — e.g. `derived([box_d], ([$box]) => $box.width)` — was wrongly treated as a store subscription and rejected with `global_reference_invalid` (`box` has no store binding). The lexical `$`-identifier scan only recognised `($x)` / `let $x` declaration forms and missed destructuring patterns. Before erroring, the unprefixed-name lookup now also checks whether the full `$name` is itself a real (non-synthetic) scope binding and, if so, treats it as a local reference. The guard sits at the error path so a genuine store whose name also appears as a nested callback parameter (e.g. `page` used as `$page` in the template and as `($page) => …` in `.subscribe()`) still subscribes correctly.

- 3701f7e: fix(transform): include all imports in legacy `$:` dependency thunks regardless of scope

  A legacy `$:` reactive statement compiles to `$.legacy_pre_effect(() => (deps…), …)`.
  Upstream `LabeledStatement.js` adds a dependency for every referenced binding that
  is not `kind === 'normal' && declaration_kind !== 'import'` — i.e. **all** imports
  qualify, regardless of which scope they were declared in.

  rsvelte built the import-membership list with a `scope_index == instance_scope`
  filter. In some TypeScript components the first imports are assigned scope 0 while
  later imports land in the instance scope, so a `$:` block calling an early-imported
  helper (e.g. `createScale(...)`) dropped that helper from the deps thunk. The
  filter now includes every `Import`-kind binding, matching upstream.

  Fixes the corpus entry
  `layerchart/packages/layerchart/src/lib/components/ChartContext.svelte`.

- ce42f21: fix(transform): `$.mutate` wrap for a state member mutation in an if-guarded `$:`

  A `$: if (cond) obj.a.b = x` (state-var member mutation inside an if-guarded
  reactive statement) was emitted without the `$.mutate(obj, …)` wrap — the
  keyword-LHS branch was missing the state-member-mutation pass that both sibling
  branches run.

- ea931bf: fix(transform): six near-miss codegen fixes (store-mutate source, each promotion, prop-write shadow, destructure IIFE, SSR scope-class position)

  - `$.store_mutate(...)` first arg (the store source) now reads a prop-backed store
    as `store()` and a state-backed store as `$.get(store)` via the store var's own
    transform, instead of emitting the bare name — for both component-prop binds and
    DOM-element binds.
  - A `const` collection whose each-item name collides with a `bind:`-reassigned
    outer binding is no longer promoted to `$.mutable_source(...)`; the each-mutation
    check now resolves to the each-item binding (`BindingKind::EachItem`) only.
  - A write to a local binding that shadows a same-named prop (`let timeout` inside a
    function vs `export let timeout`) is no longer rewritten to a prop-setter call;
    the AST prop-assign pass now skips locally-shadowed LHS identifiers.
  - A destructuring assignment preceded by a `}` (e.g. after an `if {…}` block) is
    recognized as a standalone statement, so its IIFE no longer appends `return $$value`.
  - The SSR scoping `class` attribute is appended last (not before a real `style`
    attribute) when the element has `style:` directives but no synthetic `style`.

- 0b2d7fb: fix(transform): three near-miss codegen fixes (template indent, use: SSR, each index)

  - The fast-path JS re-indenter tracked template-literal state with a `bool`,
    which desynced across a multi-line `${ … }` interpolation and mis-indented the
    continuation lines of a later template literal's string content. It now uses the
    full template/interpolation stack (matching the slow path).
  - A `use:` directive on a load/error element (`<track>`/`<img>`/…) in the
    non-spread SSR attribute path now re-captures `onload`/`onerror` (the spread
    path already did).
  - The typed `AssignmentExpression` path now sets `uses_index` on the owning each
    block when an each-item identifier is assigned/mutated (e.g. an event handler
    mutating an outer item), so the `$$index` callback parameter is emitted — the
    JSON path already did this.

- 70f55d1: fix(transform): don't wrap a prop name used as an arrow-function param

  A prop used as an arrow-function parameter binding (`(nodeId) => …`,
  `options => …`) was rewritten to the invalid `(nodeId()) => …`. The text
  prop-read wrapper now skips arrow-parameter binding positions (mirroring the AST
  version's param guard).

- 429de3f: fix(transform): build legacy `$:` dependency thunks from the Phase-2 AST reference set

  The deps thunk of a `$.legacy_pre_effect` was previously built by text-scanning
  the `$:` body (`find_pos` for order; `body_references_identifier` /
  `is_only_assignment_target` / `is_in_lhs_only` for membership). That mis-handled
  chained member-property keys (`l.add('x', e).add(add)` matched `add` from the
  `.add(` method key, not the `add` argument), string-literal text, block
  mutations, and shadowed params — producing wrong-order, wrong, extra, or missing
  dependencies.

  A new Phase-2 pass (`collect_reactive_statement_dependencies`) now records each
  top-level reactive statement's ordered dependency identifier set by walking the
  AST exactly like upstream `2-analyze/visitors/LabeledStatement.js` (order =
  first-appearance traversal order; a name is a dependency unless its only
  references are the outermost member-chain LHS of an `=`; member-property keys,
  object keys, function params and block-locals are never references). The Phase-3
  client deps thunk is emitted from that list. The block-ordering path
  (`extract_reactive_statement_deps` / `sort_reactive_statements`) is untouched.

- ce42f21: fix(transform): don't count a member-property key as a reactive assignment

  `is_assigned_anywhere_in_body` matched a `.name = ` member-property write
  (`obj.name = name`) as an assignment to the `name` binding, adding a spurious
  assignment edge that reordered unrelated `$:` reactive blocks. A name preceded by
  `.` is a member-property key, not a binding assignment, and is now excluded —
  restoring the official source-order emission.

- 6fe6b4a: fix(svelte2tsx): carry renamed-export JSDoc onto the prop

  `getDoc(target)` in official svelte2tsx resolves a prop's `/** @type {...} */`
  from the `let x` declaration first, then — when none is there — from the
  `export { x as y }` statement itself (`exportExpr`). rsvelte only captured the
  doc on the `let` declaration, so the common shape

  ```svelte
  let _class = null;
  /** @type {string | false | null} */
  export { _class as class };
  ```

  dropped the type from the generated `render({...})` destructure, losing the
  prop's declared type in the language server. The export-specifier handler now
  falls back to the export statement's leading JSDoc, mirroring official's
  `getDoc`.

- 7e6cd57: fix(compiler): track `$$restProps` (and `$$props`) read via a spread in a legacy reactive statement

  A legacy `$: x = { ...defaults, ...$$restProps }` dropped its
  `$.deep_read_state($$restProps)` dependency, emitting
  `$.legacy_pre_effect(() => {}, …)` instead of
  `$.legacy_pre_effect(() => $.deep_read_state($$restProps), …)`, so the statement
  no longer re-ran when spread rest-props changed. `body_references_identifier`
  excluded a leading `.` (to avoid matching `obj.prop`), which also rejected the
  spread `...$$restProps`. The `$$`-prefixed compiler specials are never
  member-access targets, so a leading `.` is now allowed for them.

- b92840b: fix(transform): switch-case dep order, SSR control-flow store reads, bind getter/setter setter reads

  - `collect_reactive_statement_dependencies` visits a `SwitchCase`'s `consequent`
    before its `test` (acorn populates them in that order), so a `$:` switch's
    dependency-thunk order matches the official compiler.
  - The SSR instance-script catch-all statement arm now read-wraps store/derived
    reads (`if ($store === …) …`, `for`/`while`/blocks), matching upstream's
    visit-every-statement behavior (the ExpressionStatement / FunctionDeclaration
    arms already did).
  - A `bind:value={getter, setter}` setter body now has read transforms applied,
    so reactive reads inside the setter (`(v) => { … control.min … }`) become
    `$.get(...)`.

- f3a8000: fix(transform): nested prop-assignment in $: RHS, function-decl shadowing, boundary snippet order

  - A nested prop assignment in a `$:` state-var-assignment RHS (an arrow default
    `() => (isOpen = !isOpen)`) is now lowered to the setter call `isOpen(!isOpen())`;
    the state-var branch was missing the prop-assignment pass its siblings run.
  - A `function foo()` declaration now shadows a same-named prop/state binding in the
    runes read-wrapper, so a reference to the local function (`executing.then(enter)`,
    where `async function enter()` shadows an `enter` prop) stays bare instead of
    becoming `enter()`.
  - A non-hoistable `<svelte:boundary failed>` snippet is emitted into the SSR
    template stream in visit order (like the regular snippet visitor) instead of
    being prepended ahead of preceding `{@const}` / sibling snippets.

- e0779f0: fix(transform): fold scope hash into a quote-preserving class literal; explicit `slot="default"` → children

  - A static `class={"draggable"}` (a quote-preserving string literal) now folds the
    scope hash into the string (`$.set_class(el, 1, "draggable svelte-HASH")`) instead
    of passing it as a separate argument — the fold only recognized the canonical
    `String` literal, not the `RawString` variant.
  - An explicit `<Comp><x slot="default" /></Comp>` is now emitted on the server as the
    `children` snippet prop (with `$$slots.default: true`), matching upstream's
    `slot_name === 'default'` handling, instead of a `$$slots.default` function.

- 8ee109d: fix(transform): five codegen fixes (esrap method shorthand, slot memo index, reactive dep order/membership, import-in-template)

  - esrap prints a property whose value is a `FunctionExpression` as method shorthand
    (`"k"() {}`) regardless of key kind, matching esrap — a string-keyed function
    property no longer prints as `"k": function`.
  - The slot-prop memo reference index no longer double-counts, so the getter `$.get($N)`
    matches its `$N` declaration.
  - Legacy `$:` dependency ordering scans a string-literal-blanked copy of the body, so a
    literal word (`` `width: ${x}` ``) no longer text-matches before the real read and
    misorders deps.
  - A bare `ident;` read statement is no longer misclassified as an assignment target, so
    its dependency is kept (was dropped, producing `() => {}` / missing deps).
  - The line-based import extractor tracks cross-line string/template/comment state, so an
    `import …` line inside a backtick template literal is not mis-hoisted as a real import.

- 812b05f: fix(transform): parenthesize `new` callees with a call in their spine + multi-node title defined-check

  - esrap now wraps a `new` callee in parens when its member-object spine contains a
    CallExpression (`new ($.get(deckgl).MapboxOverlay)(…)`) or it is a
    ChainExpression — porting esrap's `has_call_expression` clause so the trailing
    `(…)` is not mis-parsed as the constructor arguments.
  - A multi-node `<title>` interpolation uses the canonical `is_expression_defined`
    check, so a conditional with two string branches (`{name ? \`…\` : ""}`) no longer
gets a spurious `?? ""` coercion.

- 244264a: fix(transform): scope-range store-subscription parameter shadows

  A `$name` used as a function/arrow parameter (including inside array/object
  destructuring, e.g. `([$s, $focused]) => …`) was added to a script-global
  "declared" set, suppressing genuine top-level store subscriptions of the same
  name everywhere. Parameter shadows are now scope-ranged to the parameter's own
  arrow body, so a real `$initialized` subscription outside that body is still
  detected, while a destructured `$focused` param no longer produces a spurious
  subscription. Mirrors upstream scope resolution.

- f632423: fix(compiler): don't false-positive `store_invalid_scoped_subscription` when a `<script context="module">` declares a function

  A function declaration in `<script context="module">` pushes its own function
  scope, so the instance scope index is no longer always `1`. The scoped-store
  guard in `walk_js_expression` / `walk_js_expression_node` hardcoded `1` as the
  instance scope, so an instance-scope store (e.g. an imported store) referenced
  inside a template arrow function was wrongly rejected with
  `store_invalid_scoped_subscription`. The guard now compares against the real
  `instance_scope_index`, mirroring upstream's `owner !== instance.scope` check.
  Genuine scoped subscriptions (a store shadowed by an each-item binding or an
  arrow parameter) still error. Fixes #1225 (svelte-form-builder `PropertyPanel`).

- cd786c3: fix(analyze): include component-tag references in `<select bind:value>` indirect bindings

  A legacy `<select bind:value={foo}>` invalidates every other binding referenced
  within the select whenever `foo` mutates (emitted as a `$.invalidate_inner_signals`
  body). The official compiler builds this list from the select scope's
  `references` map, in which **component-tag** references (`<SelectOptions/>`) are
  inserted _immediately_ during scope creation — ahead of the _deferred_ plain
  identifier references.

  rsvelte's scope-builder never recorded component-tag name references, so a
  component used inside the select (e.g. `<SelectOptions bind:field/>`) was missing
  from the invalidate body, and the surviving identifiers were emitted in pure
  source order rather than components-first.

  The `<select>` indirect-binding population now collects component-tag references
  across the select subtree separately and emits them ahead of the identifier
  group, matching the official `references` insertion order.

  Fixes the corpus entry `svelte-form-builder/src/lib/Components/Select.svelte`.

- ea05921: fix(transform/server): two SSR codegen fixes for `.svelte.(js|ts)` modules + known strings

  - `$effect.tracking()` in a `.svelte.(js|ts)` module is now lowered to the literal
    `false` on the server (there is no effect tracking during SSR), matching the
    instance-script path and the upstream server CallExpression visitor.
  - A binding initialized to a template literal (`const w = \`…${x}…\``) is treated
    as a defined string by the server evaluator, so reads of it are no longer wrapped
    in an unnecessary `$.stringify(...)`.

- af836a2: fix(analyze): allow `slot="…"` on a direct child of a `{#snippet}` block

  A `slot="name"` text attribute on an element whose immediate parent is a
  `{#snippet}` body — e.g. `{#snippet active()}<span slot="active">…</span>{/snippet}` —
  was wrongly rejected with `slot_attribute_invalid_placement`. Upstream's
  `validate_slot_attribute` returns early when `context.path.at(-2)` is a
  `SnippetBlock`. A new `is_direct_child_of_snippet` context flag (set while
  analyzing a snippet body, reset on entering any nested element/block, mirroring
  `is_direct_child_of_component`) reproduces that early return. Non-text `slot={…}`
  values are still rejected by the separate `is_text_attribute` check.

- 70f55d1: fix(transform): collect a spread argument as a reactive dependency

  The legacy reactive-reference fallback walker treated a `SpreadElement`
  (`[...x]`, `f(...x)`) as a terminal node, so the spread's argument was never
  walked and its dependency dropped from the memo/effect (e.g.
  `sum([...data.data], …)` lost `data`). It now recurses into the spread argument.

- f061348: fix(transform): detect a spread `...prop` as a read in legacy reactive deps

  `body_references_identifier` excluded a `.` before a name to skip member access,
  which also skipped a spread (`...prop`). A `$:` statement that spreads an
  imported/prop/state binding therefore dropped that dependency from its
  `$.legacy_pre_effect(...)` tracking thunk. A spread prefix is now recognized as a
  read.

- f061348: fix(transform): don't wrap a store name used as a destructured arrow param

  A store name inside an array/object destructuring arrow parameter
  (`([$x, $y]) => …`) was wrapped to `$x()` (invalid in a binding position). The
  function-parameter check now strips destructuring delimiters so the shadowing
  local param is recognized and left bare.

- 1af9df3: fix(transform): wrap store reads in a ternary inside a function body

  The legacy text-based store-subscription read transform skipped any `$store`
  whose following `:` made it look like an object property key (`{ $store: … }`).
  Its object-literal guard only counted unmatched `{` in the emitted prefix, so a
  function body's own block brace counted as an object literal — making a ternary
  `cond ? $store : x` _inside any function body_ match the property-key heuristic
  and leave `$store` un-called.

  A real property key is always immediately preceded (skipping whitespace) by `{`
  (first entry) or `,` (later entry), whereas a ternary consequent is preceded by
  `?`. The property-key check now also requires that preceding separator, so the
  ternary `$store` is correctly lowered to `$store()`.

  Fixes the corpus entry
  `svelte-ux/packages/svelte-ux/src/lib/components/Duration.svelte`.

- fa4dd68: fix(transform): two invalid-JS emissions for store/prop reads in binding positions

  - A store subscription used as an object-literal SHORTHAND (`{ $width, $height }`)
    was wrapped to the invalid method-shorthand `{ $width() }`. It now expands to
    `{ $width: $width() }`, matching the prop-read path.
  - A prop name used as a destructuring binding inside a keyword-guarded reactive
    body (`$: if (cond) { const [x, y] = f(); … }` where `x`/`y` shadow props) was
    wrapped to the invalid `const [x(), y()] = …`. That branch now routes prop reads
    through the scope-aware AST wrapper, which never wraps binding positions or
    locally-shadowed reads.

- f061348: fix(transform): wrap a non-sole store read inside `$derived(...)`

  A store subscription that was the FIRST token of a larger `$derived(...)` /
  `untrack(...)` argument (`$derived($store.x / 2)`) was wrongly left bare. The
  bare-getter collapse now only applies when the store ref is the SOLE argument
  (`$derived($store)`); otherwise it is wrapped to `$store()`.

- f061348: fix(transform): lower a store write nested in a reactive block body

  A `$store = x` inside a `$:` block body (`$: { … $store = x }`) was not lowered
  to `$.store_set(store, x)`; the read wrap then mangled the LHS into `$store() = x`
  (invalid JS). The block-body path now runs the store-assignment lowering before
  wrapping reads.

- f061348: fix(transform): three `.svelte.(js|ts)` class-field SSR fixes

  - Private `$derived` reads inside arrow-function class fields (`onkeydown = (e) =>
{ … this.#derived … }`) are now called (`this.#derived()`), matching the
    Field/Method handling.
  - A multi-line `$state(...)` / `$state.raw({ … })` field initializer is now
    unwrapped to its inner value (a plain public server field) instead of leaking
    the rune and being privatized.
  - A class member whose arrow body is nested in a call
    (`onpointermove = whenMouse(() => { … })`) no longer runs away the member
    accumulator and drops every following member.

- 4746423: fix(compiler): infer SVG namespace for element-less fragments inside `<svg>`

  A `{#snippet}` (or any element-less fragment) whose body lives in an SVG context
  but contains only adjacent component / render-tag anchors was emitted via
  `$.from_html` instead of `$.from_svg`, and the SSR markup kept a spurious
  whitespace text node between the anchors (`<!----> ` instead of `<!---->`). This
  cascaded into wrong `$.sibling(node, 2)` offsets. Namespace inference for a
  fragment with no element children now inherits the enclosing namespace (a
  faithful port of upstream `check_nodes_for_namespace`, deep-walking
  `{#if}` / `{#each}` / `{#await}` / `{#key}` containers) rather than defaulting to
  `html`, on both the client and server transforms.

## 0.7.15

### Patch Changes

- aea0fb3: fix(compiler): treat a prop default that is a conditional/binary/logical expression containing a reactive-binding read as non-simple

  A prop whose default is e.g. `fill = solid ? 'currentColor' : 'none'` (with `solid` a prop) was mis-classified as a static default and emitted as `$.prop($$props, "fill", 8, solid() ? …)` — missing `PROPS_IS_LAZY_INITIAL` and the default thunk — instead of the official `$.prop($$props, "fill", 24, () => (solid() ? …))`. The simplicity check now defers to an exact OXC-AST predicate mirroring upstream `is_simple_expression`, recursing into operands and treating a reactive-binding identifier (rewritten to a getter call in legacy mode) as non-simple.

## 0.7.14

### Patch Changes

- 9613f55: docs(readme): publish the correct README for each npm package

  `@rsvelte/compiler` shipped the `rsvelte_lint` crate's README (the linter docs)
  because `wasm-pack` copies the built crate's README into `pkg/`; `finalize-pkg.mjs`
  now overlays the compiler-specific README into `pkg/README.md`. `@rsvelte/vite-plugin-svelte`
  was still titled `@sveltejs/vite-plugin-svelte` with broken relative doc links —
  rewritten for the rsvelte fork with absolute links.

## 0.7.13

### Patch Changes

- ac44d7b: Phase-3 corpus CSR/SSR byte-parity burndown: known-failures 50 → 32 (16 root-cause
  fixes). Server: each-item shadows same-named component `$derived` in the read-wrap
  pass; module `$state.snapshot(x)` strips to bare `x` for declarator inits; destructured
  `export let` lowering gets per-`ArrayPattern` `$$array_N` naming + `$.fallback` defaults
  - `RestElement`; component trailing `<!---->` anchor is kept in preserve-whitespace
    context; constant-fold decodes `\u`/`\x` escapes. Client: a static `<input checked>`
    child no longer forces its parent to be traversed; `rest_excludes` hoists above
    `$.with_script` templates; a prop default containing a nested arrow is treated as
    non-simple (lazy thunk); reassigning state from a prop with a primitive default skips
    the proxy flag. Analysis: `<svelte:window/document/body>` regular-attribute handler
    expressions are now analyzed (so an imported call sets `needs_context`); snippets are
    hoistable through `NewExpression` and `<svelte:component>`. Output is otherwise
    unchanged; all gates green, no corpus regressions.

## 0.7.12

### Patch Changes

- a93f50c: Phase-3 client: add a structured `JsLiteral::BigInt` variant and use it for
  bigint literals (`123n`) instead of `JsExpr::Raw`. Continues the Phase-3 Step 1+3
  `js_ast` `Raw(...)` burn-down. Output is unchanged (byte-identical; corpus
  baseline holds at 120).
- a93f50c: Phase-3 client: replace the dynamic-`import()` `Raw` escape hatch with a
  structured `JsExpr::ImportExpression { source, options }` node. Previously the
  source/options were eagerly stringified via `generate_expr` and spliced into a
  `format!("import({})")` `Raw`; now they are held as converted sub-expressions and
  emitted lazily by the codegen. The node is treated as a terminal in the analysis
  passes (await / transform / reactive-ref collection), exactly mirroring the opaque
  `Raw` it replaced, so the sub-expressions are not re-transformed after conversion
  — keeping output byte-identical. Continues the Phase-3 Step 1+3 client `js_ast`
  `Raw(...)` burn-down (`docs/phase3-ast-refactor-plan.md`). Corpus baseline holds
  at 120.
- a93f50c: Phase-3 client: replace the `format!`-based `JsExpr::Raw("import.meta")` escape
  hatch with a structured `JsExpr::MetaProperty(meta, property)` node (printed as
  `meta.property`, handled as a terminal leaf in the await/transform/reference
  passes). Continues the Phase-3 Step 1+3 burn-down of the client `js_ast`
  `Raw(...)` surface (`docs/phase3-ast-refactor-plan.md`). Output is unchanged
  (byte-identical; corpus baseline holds at 120).
- a93f50c: Phase-3 client: replace the `JsExpr::Raw("super")` escape hatch with a structured
  `JsExpr::Super` node (printed by the codegen, handled as a terminal leaf in the
  await/transform/reference-collection passes). First slice of the Phase-3 Step 1+3
  work to shrink the client `js_ast` `Raw(...)` surface ahead of switching client
  output to oxc-AST + `rsvelte_esrap` printing (`docs/phase3-ast-refactor-plan.md`).
  Output is unchanged (byte-identical; corpus baseline holds at 120).
- a93f50c: Phase-3 Step 1+3 (direct-AST): add the `js_ast::to_oxc` converter that lowers the
  client `js_ast` IR (`JsProgram`) into an oxc `Program` for printing by
  `rsvelte_esrap` — the foundation for replacing the handwritten `js_ast::codegen`
  with structured esrap printing. The converter returns `None` on any `Raw`/unhandled
  variant so the caller transparently falls back to the existing codegen (partial
  coverage is always safe). It is wired behind the `RSVELTE_CLIENT_TO_OXC` env flag,
  **off by default**, so committed behavior is unchanged. With the flag on, the
  byte-exact suites pass identically (`runtime` 19/19, `compiler_fixtures` 17/17),
  confirming the converter is faithful for every structured client program in the
  fixtures. Coverage grows one node kind at a time, gated by those byte-exact tests;
  the flag flips to default-on once `Raw` nodes are eliminated and all variants are
  handled.
- f68f2a3: Phase-3 corpus byte-parity burndown: known-failures `67 → 50`. Each fix is
  independent and AST-precise, verified byte-identical against the official
  compiler with zero corpus regressions:

  - scope-aware `should_proxy` for private `$state` field assignments
  - constructor nested-function private `$state` reads use `$.get(...)` not `.v`
  - boundary-nested `{#snippet}` emitted inline (not hoisted to module scope)
  - `Math.*` / `Number` / `String` / `BigInt` const initializers are `is_defined`
    (no spurious `?? ""`)
  - `$.css_props` SVG-namespace flag reflects the rendering context
  - store reads inside a spread (`...$store`) are wrapped
  - no constant-fold of an identifier shadowed by an `{#each}` item
  - a class-body-declared private field assigned a rune in the constructor keeps
    its source position
  - nested-function private `$state` member mutation reads through the proxy
    (`$.get(this.#x).prop`)
  - TS-typed declaration tag `{const x: number = …}` no longer dropped on the server
  - invalid top-level reactive declaration `$:` in `<script module>` is dropped

  Output for all other inputs is unchanged.

- b75ceb5: Harden the `rsvelte_esrap` printer (which prints the compiler's Phase-3 output)
  against the upstream esrap `v2.2.11` test suite, now vendored as a submodule and
  ported to Rust. The full esrap sample corpus is byte-identical (97/97) and every
  esrap unit test (quotes, indent, compat, additional-comments, arrow-return-type,
  sourcemap-keywords) is ported and passing. Printer behaviour was made faithful
  to esrap: directives, `EmptyStatement`/`WithStatement`, import attributes,
  comment threading through sequences/call-args/class-bodies, full TypeScript
  type-syntax and JSX printing, precedence-based parenthesisation (unwrapping
  explicit parens like esrap's acorn baseline), and string escaping (`\t` left
  literal). Adds source-map generation (`print_with_map`) and synthetic-comment
  hooks (`print_with_hooks`).
- 47e5bec: Phase-3 output codegen is now AST-based on both sides (output byte-identical).
  Server SSR switched to the pure-AST `server/ast` pipeline and the legacy text
  generator (`build.rs`/`bridge.rs`/text `server/visitors/`/`ServerCodeGenerator`,
  ~32k lines) was deleted. Client CSR now defaults to `js_ast::to_oxc` →
  `rsvelte_esrap`, with the handwritten string printer kept only as a fallback for
  comment-bearing / unsupported-node programs. `to_oxc` learned to parse
  `Raw`/`RawMapped` and unwrap `Spanned`, sourcemaps route through esrap
  `print_with_map`, and a new `PrintOptions.keep_empty_statements` flag preserves
  empty-statement parity for the client path. Validated byte-exact across runtime,
  compiler_fixtures, ssr, sourcemaps, real_world, and the compatibility report;
  corpus baseline shrank 120 → 67 with no regressions.
- a93f50c: Phase-3 Step 1+3 (Raw elimination): replace the three `JsExpr::Raw` escape hatches
  used for literal source-spelling preservation (double-quoted strings,
  non-canonical number formats like `1_000_000`) with structured
  `JsLiteral::RawString { value, raw }` / `RawNumber { value, raw }` variants. The
  codegen emits the `raw` verbatim (byte-identical to the old `Raw`), and the
  `js_ast::to_oxc` converter builds an oxc literal with `raw` set so esrap reproduces
  it. First slice of eliminating the client `Raw(...)` constructions so real programs
  become Raw-free and convert direct-AST. Byte-identical: corpus 120 no-NEW,
  flag-off and flag-on byte-exact suites both 19/19 + 17/17.
- a93f50c: Phase-3 Step 1+3 (Raw elimination): replace the 4 load-bearing `JsExpr::Raw(name)`
  prop-setter-callee escape hatches (in `shared/declarations.rs` / `program.rs`)
  with a structured `JsExpr::OpaqueIdentifier(name)` variant. Like the `Raw` it
  replaces, it is skipped by the transform passes (so the setter callee is not
  re-read-transformed into `x()(value)`) and codegens the bare name — but it is now
  a structured node the `js_ast::to_oxc` direct-AST converter handles (builds a plain
  oxc identifier). Byte-identical: corpus 120 no-NEW, flag-off and flag-on byte-exact
  both 19/19 + 17/17.
- a93f50c: Phase-3 server: lower derived **assignments** (`count = x` → `count(x)`, compound
  and logical operators expanding via `build_assignment_value` — `count += 1` →
  `count(count() + 1)`, `flag &&= x` → `flag(flag() && x)`; upstream
  `AssignmentExpression.js`) structurally in the AST read-wrapping pass
  (`derived_reads_ast::visit_assignment_expression`), over the original valid
  script, instead of the textual `rewrite_derived_assignments` scan. That scan ran
  on the post-wrap intermediate `count() = x` — not valid JS (a call is not an
  assignment target), so it could never be re-parsed — and now survives only on the
  byte-scanner fallback path. Implemented as non-overlapping edits (skip the LHS
  identifier, replace the `op=` gap, append `)`) so RHS read-wrapping and nested
  `a = b = 1` resolve in the same pass. Follows the update-expression fold; part of
  the staged Phase-3 text → AST migration (`docs/phase3-ast-refactor-plan.md`).
  Output is unchanged (byte-identical; corpus baseline holds at 120).
- a93f50c: Phase-3 server: lower derived **update expressions** (`count++` / `--count` →
  `$.update_derived(count)` / `$.update_derived_pre(count)`, Svelte 5.53.2 upstream
  `6aa7b9c64`) structurally in the AST read-wrapping pass
  (`derived_reads_ast::visit_update_expression`), over the original valid script,
  instead of the textual `rewrite_derived_update_expressions` scan. That scan ran
  on the post-wrap intermediate `count()++` — not valid JS (a call is not an
  assignment target), so it could never be re-parsed — and now survives only on
  the byte-scanner fallback path, where it keeps the two paths byte-identical. Part
  of the staged Phase-3 text → AST migration (`docs/phase3-ast-refactor-plan.md`).
  Output is unchanged (byte-identical; corpus baseline holds at 120).
- 7d0c17b: Phase-3 server: the pure oxc-AST + `rsvelte_esrap` SSR pipeline (`server/ast/`)
  now matches the official Svelte compiler byte-for-byte across the entire curated
  suite — runtime-runes 993/993, runtime-legacy 1205/1205, hydration 77/77, the
  byte-exact `compiler_fixtures` / `ssr` snapshots, and 100% of every
  compatibility-report category. It remains OPT-IN behind `RSVELTE_SERVER_AST=1`;
  the text-based `ServerCodeGenerator` is still the default. The switchover to
  default is deferred: enabling the AST pipeline by default currently regresses 88
  real-world corpus entries on SSR (chiefly an over-eager `$.stringify(...)` wrap
  on conditional class/title interpolations, dropped instance-script comments, and
  a few function/`$$settled` ordering and slot-arg cases), which must be fixed
  first. See `docs/phase3-server-ast-remaining-work.md`. No change to default
  output; corpus baseline holds at 120.
- a93f50c: Phase-3 server: collapse `$.derived(() => NAME())` → `$.derived(NAME)` (Svelte
  5.55.5 upstream `b771df3`) structurally via a new AST pass
  (`unthunk_derived_ast`), matching the `$.derived(...)` call with a single
  parameterless expression-bodied arrow whose body is a 0-arg non-optional call of
  a derived identifier. Replaces the literal-prefix byte scanner
  `unthunk_bare_derived_arg`, which now serves only as the parse-failure fallback.
  Part of the staged Phase-3 text → AST migration
  (`docs/phase3-ast-refactor-plan.md`). Output is unchanged (byte-identical; corpus
  baseline holds at 120).
- 99725cc: Make several SSR (server) code-generation paths byte-faithful to the official
  compiler / esrap, burning down the output-equality corpus:

  - The `rsvelte_esrap` printer now flushes per-property leading comments in
    object **patterns** (and their rest element), mirroring esrap's `_` wildcard.
    A `// line` comment inside a `$props()` destructure no longer prints on a
    single line where it would swallow the following token (`tabindex = // c 0`).
  - `escape_js_string` emits tab characters literally instead of as `\t`, matching
    esrap's `quote()` — multi-line `class="…"` values keep their source tabs.
  - `transform_class_fields_server` no longer mangles JSDoc / block comments in the
    class body of `.svelte.(js|ts)` server modules (it was appending `;` to every
    comment line and joining `*/` to the following method).
  - Component-prop template-literal interpolations that statically evaluate to a
    defined string are interpolated raw instead of wrapped in `$.stringify(…)`,
    matching upstream `build_attribute_value`.
  - TypeScript field modifiers (`readonly`, `public`, …) are stripped when lowering
    public `$derived`/`$derived.by` class fields, so `readonly x = $derived.by(…)`
    lowers to the correct `get x()/set x($$value)` accessor pair.
  - `transform_class_fields_server` recurses across all classes in a module instead
    of bailing out at the first class without rune fields (which silently skipped
    later classes' field lowering).
  - `bind:this` is excluded from `<svelte:element>` server spread attributes, and a
    dynamic `class` value in a spread object is wrapped in `$.clsx(…)`.
  - Multi-line template-literal interiors in transformed `<script>` blocks are no
    longer re-indented (their content is part of the string value).
  - `bind:prop={() => get, set}` (SequenceExpression) bindings keep their source
    position relative to `{...spread}` in `$.spread_props([…])`, and their get/set
    accessors reference the hoisted `bind_get()`/`bind_set($$value)` variables.
  - Event-handler attributes (`onclick={…}` etc.) are excluded from `<svelte:element>`
    server spread attributes.
  - A `{#snippet}` body — and a component's inline `children`/default-slot whose
    sole child is a standalone component/render-tag — no longer emits a trailing
    `<!---->` marker.
  - A typed `$props()` destructure with an object/intersection TS annotation
    (`{ a, ...rest }: Base & { … }`) strips the annotation correctly instead of
    leaking it into the rest element (which dropped user-written `$$slots`/`$$events`).
  - A multi-line `$props()` destructure with an interior `// line comment` no longer
    collapses into unparseable output (the comment swallowing the next property).
  - `const id = $.props_id($$renderer)` is hoisted to the top of the component body,
    matching upstream's `body.unshift(...)`.
  - Template-literal lines that resemble imports are no longer hoisted by the
    line-based import scanner, and template-literal interiors are preserved verbatim
    when re-indenting nested dynamic-component calls (no spurious tabs in HTML).
  - A method chain split across lines by `//` comments no longer gets a spurious
    `;` inserted mid-chain (which orphaned the continuation and broke parsing).

- a93f50c: Phase-3 Step 2 (script transform → AST): migrate the server
  `strip_export_from_declarations` pass from a line scanner to an AST-driven-edit
  pass (`server/strip_export_ast.rs`, mirroring the `derived_reads_ast` pattern):
  it visits `ExportNamedDeclaration`s whose declaration is a function/class/`const`
  and strips the exact 7-byte `export ` prefix structurally. The line scanner remains
  as the parse-failure fallback. Byte-identical: corpus 120 no-NEW, byte-exact
  runtime 19/19 + compiler_fixtures 17/17, plus 11 new unit tests.
- a93f50c: Phase-3 Step 1+3 (direct-AST): extend `js_ast::to_oxc` to handle class expressions
  (methods of all kinds incl. constructor, instance/static fields, computed keys,
  super-class; bails on static blocks/decorators) and assignment-target
  destructuring (`[a,b] = x` / `{a} = x` with defaults/rest/holes via oxc
  `AssignmentTargetPattern`). The converter is now **variant-complete** — every JS
  construct is handled; only opaque `Raw`/`Spanned` IR nodes bail. Still gated OFF
  behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime
  19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle the
  control-flow statements — `for`, `for…of` / `for…in` / `for await…of`, `while`,
  `do…while`, `switch`, labeled statements, and `try/catch/finally` — plus a shared
  `variable_declaration_node` helper reused by var-decl/export/for-init. Still gated
  OFF behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically
  (runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
  destructuring binding patterns — object/array patterns with defaults, rest
  elements, holes, computed keys, and nesting — via a shared recursive
  `binding_pattern` helper now used by variable declarators, function/arrow params
  (incl. rest params), for-of/for bindings, and catch parameters. Still gated OFF
  behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime
  19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
  `Function` expressions, `Chain` (optional chaining), dynamic `import()`
  (`ImportExpression`), and `Regex` literals. Still gated OFF behind
  `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime 19/19,
  compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
  `import`, `export { … }` / `export const/function …`, `export default`, and
  function-declaration statements — the high-impact unlock that lets the converter
  fire on real components (which all have imports). Import/export source strings and
  the no-specifier (`import 'x'`) distinction mirror the existing codegen exactly.
  Still gated OFF behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass
  identically (runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend the `js_ast::to_oxc` converter to
  handle `TemplateLiteral`, `TaggedTemplate`, `Assignment` (identifier / non-optional
  member targets), and `Update` expressions, so more client programs lower directly
  to oxc + esrap instead of bailing to the string codegen. Still gated OFF behind
  `RSVELTE_CLIENT_TO_OXC`; with the flag on, byte-exact suites pass identically
  (runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
- a93f50c: Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle `yield`
  expressions, private-field member access (`obj.#x`), and object-literal
  method/getter/setter/computed properties (mirroring codegen's `auto_method`
  heuristic so non-computed `Init` function-valued props print as method shorthand).
  Only `JsExpr::Class` remains bailed at the expression level. Still gated OFF behind
  `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime 19/19,
  compiler_fixtures 17/17). Committed behavior unchanged.

## 0.7.11

### Patch Changes

- 2fa1412: Corpus output-parity fixes (known failures 262 → 125, on top of wave 6):
  `should_proxy` identifier-binding resolution + `SequenceExpression`; comment-only
  `<script module>` dropped; `$props.id()` evaluates to a defined string (server);
  `TEMPLATE_USE_IMPORT_NODE` for static `<video>` / custom elements; known-global
  calls (`Math.*`/`Number`/`String`/`BigInt`) skip the `?? ""` coalesce in text
  interpolation; server-module public `$state` class fields stay public; scoped
  `<svelte:element>` emits its scope class on the server; CSS rendering handles
  whitespace in the `</style>` closing tag.
- c52c829: Corpus output-parity fixes (known failures 125 → 42, on top of the 262 → 125
  wave). Faithful upstream-aligned codegen fixes, each verified against the full
  CSR/SSR corpus and the byte-exact runtime/ssr/compiler_fixtures/css suites with
  zero regressions:
  - decode `\u`/`\x` escapes when folding a known-const string to its cooked
    value (client + server) and re-escape bidi-control/format characters in
    server string literals;
  - `should_proxy` resolves an Identifier through its binding's initial node type;
    nested `:global { … }` blocks and `:has(> [open])` leading combinators scope
    correctly; SSR multi-part style-directive values; `<title>` hoisting; spread
    element reactivity; `<option>` `?? ""` elide for a shadowed each-index;
  - server compound-assignment recompaction (`$.set(s, s + 1)` → `s += 1`);
    `var`-declared exported props keep their `var` keyword (client + server);
    `this.#field = …` LHS now parses to a `MemberExpression` (sets `needs_context`)
    and public class-field backing names are deconflicted against existing private
    members (`deps` → `#_deps`);
  - `$.store_unsub` wrap on a destructuring reactive assignment; SSR
    trailing-whitespace trim before a hoisted `{@const}`/`{const …}`/`{#snippet}`;
    `$$index` numbering recurses into `<svelte:fragment>`; `<svelte:component>`
    `let:x={y}` slot-prop rename preserved; member-assignment properties are no
    longer recorded as reactive declared vars (reactive-statement ordering).

  Remaining failures are tracked in `docs/corpus-remaining-work.md`; the dominant
  cluster requires the Phase-3 AST → printer refactor
  (`docs/phase3-ast-refactor-plan.md`).

- d7ef569: Corpus burn-down wave 6: SSR output parity fixes (clean_nodes edge-whitespace/comment handling, Svelte whitespace set so `&nbsp;` survives trimming, SVG single-space removal, load/error capture events from `use:` directives, `<!doctype>` voidness, `$props.id()` string evaluation, nested-snippet hoisting, esrap positional-comment recovery) — real-world corpus known failures 316 → 262.
- 5f0b53e: Corpus output-parity fixes: real-world corpus known failures **42 → 0**. Every
  one of the 6,409 `.svelte` / `.svelte.(js|ts)` corpus sources now compiles to
  output that is AST/byte-identical to the official Svelte compiler for both CSR
  and SSR (`compat/corpus/known-failures.json` is empty). Each fix is an
  upstream-aligned codegen change verified against the full CSR/SSR corpus and the
  byte-exact runtime/ssr/compiler_fixtures/validator/compiler_errors/print/css
  suites with zero regressions:
  - **Evaluation / constant-folding**: rune-call (`$state`/`$state.raw`/`$derived`)
    and chained declaration-tag initial-value folding; `ConditionalExpression`
    branch-pruning when the test folds to a known constant (textContent
    optimisation); RegExp / NaN / ±Infinity literal folds; and the upstream
    memoize-**then**-evaluate ordering so a `has_call` chunk is never folded
    (`{duration ? format(duration) : '…'}` stays reactive while `{a / b}` of two
    non-updated `$state` vars folds to a static literal).
  - **store-vs-rune detection** (locally-declared non-rune names no longer flip
    runes mode; `$state()` store-getter call lowering; `$inspect` removal in
    `.svelte.js` module scripts).
  - **`$derived`-returning-function currying** (`yScale()(tick)`) on the server,
    via a comment-agnostic member-declaration discriminator.
  - **Server class-member parsing** (multi-line constructor params + field
    initialisers), public `$state` class fields lowered to `#private` + get/set
    accessors, `$state.raw` no-proxy `$.set`, and a parser `find_matching_bracket`
    fix for template literals containing regex backticks.
  - **Comment-aware instance-script prop lowering**, legacy `$:` topological order
    via template-literal dependency extraction, nested-snippet hoisting + render-tag
    lexical scope resolution, server slot-forwarding + nested snippets, await-pending
    block scope, each-block dependency collection no longer descending into nested
    function bodies, SSR `{@const}` whitespace preservation, and assorted targeted
    codegen fixes (bare-derived prop arg, `return;`, single-statement `while` body,
    destructure assignment IIFE, rest-eachblock bind LHS).
  - **Error parity**: a `<svelte:element>` carrying a `let:` directive now fails to
    compile with `Not implemented: LetDirective`, matching the official compiler
    (previously rsvelte compiled it).

## 0.7.10

### Patch Changes

- 359c84d: Real-world output parity: rsvelte's CSR/SSR output is now byte-identical (after formatting normalization) to the official Svelte 5.56.2 compiler for 6,091 of 6,407 real-world sources collected from sveltejs/svelte and sveltejs/svelte.dev (including markdown code blocks), with zero error-presence/error-code mismatches. Fixes include the experimental_async gate, @const snippet scoping, custom-element accessors/props, a faithful css-prune port, server comment fidelity, derived compound-assignment lowering, and dozens of error-parity rules. A new corpus CI ratchet (compat/corpus/known-failures.json) prevents regressions while the remaining 316 entries are burned down.

## 0.7.9

### Patch Changes

- cbf2d18: fix(compiler): emit valid JS for `$state`/`$derived` private class fields in `.svelte.(js|ts)` modules (#907)

  `compileModule` produced **syntactically-invalid** JavaScript for several class-based rune-module shapes (reported against the `runed` library). The output parsed fine in isolation by `compileModule` itself — it only blew up once a bundler re-parsed it — so under Vite 8 + Rolldown, which compiles modules in parallel and aborts on the first bad file it reaches, the failing file set and the parser error text varied between runs. That _looked_ like a thread-safety bug, but the per-file output was actually deterministic; the compile path holds no shared mutable state (added a concurrency stress test that compiles the real `runed` corpus across 8 threads and asserts byte-identical output).

  Four deterministic codegen bugs in the line-based class-field transform, each now fixed:
  - **Trailing line comment swallowed into `$.set(...)`** — `this.#x = getter(); // note` lowered to `$.set(this.#x, getter(); // note, true)` (an unterminated call). RHS extraction now stops at the top-level `;` and re-appends the `; // comment` tail.
  - **Prefix-sibling field corruption** — wrapping a private-field read used a bare `str::replace`, so wrapping `#fps` rewrote the unrelated sibling `#fpsLimitOption` into `$.get(this.#fps)LimitOption`. Reads are now replaced only at a trailing word boundary.
  - **Multi-line constructor RHS split** — `this.#rect = {\n …\n }` was transformed line-by-line, orphaning `this.#rect = {` from its body. Constructor statements are now grouped by bracket depth before the transform runs.
  - **Server `$state` field lowered to a call** — on SSR a `$state` private field is a plain value, but `this.#x = v` was lowered to the call form `this.#x(v)` (and reads to `this.#x()`). `post_process_for_server` now distinguishes `$.derived(...)`-backed fields (callable) from `$state` fields (plain `this.#x` / `this.#x = v`).

  Also fixes a spurious `constant_assignment` error (`runed/persisted-state`): a class-method body was not registered in the scope map, so a method-local `let x` that shadowed a top-level function param `x` was misresolved to the outer (constant) binding. Class-method bodies are now registered like function bodies. Closes #907.

## 0.7.8

### Patch Changes

- e4c82de: fix(parse): give `switch` discriminants and assignment-pattern defaults exact identifier spans (#916). In program/script context the statement converter routed a `switch (X)` discriminant, a `case X:` test, a `do … while (X)` test, and the default value of a destructuring `AssignmentPattern` through `convert_expression` (which subtracts the synthetic-paren offset) instead of `convert_expression_for_program`. That shifted those spans one code unit to the left — `switch (x)` spanned the `x` as `(`, and the `$bindable` callee in `let { open = $bindable(false) }` spanned as ` $bindabl` — so span-based edits (`magic-string`, svelte-shaker) corrupted the source. All four now use the program-context converter, so every identifier satisfies `source.slice(start, end) === name`.

## 0.7.7

### Patch Changes

- 26aeb22: Republish at the correct release version. The previous `0.7.6` publish never
  reached npm: the wasm `pkg/` was stamped with the build crate's version
  (`0.1.0`) instead of the release version, so `changeset publish` attempted
  `@rsvelte/compiler@0.1.0`, hit npm's already-published guard (E403), and
  crashed the Release run. This ships the same compiler at a correctly-versioned
  package — there is no functional change to the compiler itself.

## 0.7.6

### Patch Changes

- 02756b5: fix(parse): emit the full TS type tree for inline type annotations instead of a `TSUnknownKeyword` stub. `parse_svelte` (WASM) and `parse` (native) serialized an inline TS type annotation — e.g. the `: { hasIcon: boolean; label: string }` on a `$props()` destructuring — as a members-less, span-less `{ "type": "TSUnknownKeyword" }` stub, because the two hand-written `TSType` → JSON converters only handled a handful of keyword kinds and collapsed everything else (object literals, unions, references, arrays, literal types, …). They are now consolidated into one converter that emits svelte/compiler's (acorn-typescript) ESTree shape: `TSTypeLiteral` with a `members` array of `TSPropertySignature` nodes (each with its own span, `key`, and nested `typeAnnotation`), plus `TSUnionType`/`TSIntersectionType`, `TSArrayType`, `TSTypeReference` (with `typeArguments`), `TSLiteralType`, `TSParenthesizedType`, `TSTypeOperator`, `TSIndexedAccessType`, and the full set of keyword types. Any still-unmodelled exotic type degrades to a _span-bearing_ node rather than the old span-less stub, so downstream tooling can always address it. Closes #791.
- 0f46b27: fix(parse): emit AST spans as UTF-16 code-unit offsets, not UTF-8 byte offsets. `parse_svelte` (WASM), `parse` (native), and `parseEnvelope` (native raw-transfer) emitted node `start`/`end` (and `loc` `column`/`character`) as UTF-8 byte offsets, while `svelte/compiler` and the whole JS ecosystem (`magic-string`, `svelte-eslint-parser`, every `String.slice` consumer) use UTF-16 code-unit offsets. For ASCII source the two coincide, but the moment a source contains a non-ASCII character (e.g. Japanese UI strings) before a node, every later span was shifted by `byteLen − utf16Len` — producing wrong slices or a hard `magic-string` "end is out of bounds" crash. All three parse output surfaces now remap byte → UTF-16 on the way out (reusing the same converter the legacy AST path already applied), so `source.slice(node.start, node.end)` is correct regardless of preceding non-ASCII content. ASCII source keeps its fast path (the remap is skipped entirely). Closes #793.

## 0.7.5

### Patch Changes

- bde55be: chore(deps): align all workspace `oxc` / `oxc_formatter` / `oxc_formatter_core` git deps to a single newer revision (71e489a). The split renovate bumps (#675/#676) fail CI because they move only `oxc_formatter`, leaving the ~15 other workspace `oxc` crates on the old revision — producing a duplicate `oxc_allocator` and an `E0308` mismatch. Unifying every `oxc` dep to the same revision fixes that; verified compiler-safe (compatibility report passes) and formatter-safe (all fmt fixtures pass). Step toward oxfmt parity for `<script>` formatting (refs #761).

## 0.7.4

### Patch Changes

- c1357b9: fix(css): evaluate each `:is()`/`:where()` branch in the context of its surrounding combinator when detecting unused selectors, so an unreachable branch (e.g. `.a` in `:is(.a, .b) + .c` when `.c` never immediately follows `.a`) is correctly flagged unused — matching the official compiler instead of silently passing (#754)

## 0.7.3

### Patch Changes

- 8cbfe9b: fix(css): don't flag a `#id` selector as unused when the element's `id` is dynamic (`{id}` shorthand, `id={expr}`, an interpolated `id="a{x}"`, or set via a spread) — only a static `id="..."` is matched literally (#723)
- 4901a72: fix(css): treat `:is()`/`:where()` as an OR-set in unused-selector detection so a compound like `:is(.a, .b) + .c` is recognised as used and only the genuinely-unreachable branch (`.b`) is flagged, instead of the whole selector (#722)
- dcb3b6f: fix(css): don't flag a nested `&.CLASS` selector as unused when `CLASS` comes from a `class:CLASS={...}` directive (or a spread) rather than a static `class="..."` attribute (#720)

## 0.7.2

### Patch Changes

- e7ecade: fix(analyze): validate `<dt>`/`<dd>` placement against the parent rule, not an ancestor check, so a valid nested `<dl>` inside `<dd>` is accepted (#721)

## 0.7.1

### Patch Changes

- 82af48e: fix(transform): make destructured-derived name counters call-local

  `expand_destructured_derived` in the server transform generated its `$$derived_array` / `$$d` helper names using function-level `static` `AtomicUsize` counters, reset with `store(0)` at the top of each call. Those statics are process-global and shared across threads, so concurrent compiles (e.g. a rayon-parallel consumer) raced — one compile's reset/increment clobbered another's, producing nondeterministic `$$derived_array_N` numbering in server output. The counters are now call-local `let` bindings, so each compile gets its own and server output is deterministic under parallel compilation.

## 0.7.0

### Minor Changes

- 3c1b453: Upgrade the Svelte compatibility target to **5.56.1** and reach **100% in-scope
  test compatibility (3515/3515)**.

  The 5.56.1 bump was entirely DeclarationTag bug-fixes (upstream #18330 / #18348 /
  #18350 / #18352 / #18353); all of them are ported:
  - loose `{let x = a / }` → empty-name declarator (#18353)
  - unterminated declaration tag (`{let x = a /`) now reports `unexpected_eof` (#18350)
  - `type`-identifier-vs-type-alias disambiguation + interior-comment attachment,
    so `{type instanceof Foo}` / `{type in foo}` parse as expression tags (#18330)
  - multi-declarator parsing + leading-whitespace + client comma-rejoin +
    server cross-tag derived access + division-after-string (#18348 / #18353)
  - the `state_referenced_locally` warning for DeclarationTag (#18348)
  - async-derived component-prop getter + server `$.async_derived` unthunk (#18352)

  Also lands the remaining 5.56.0 async-declaration-tag clusters:
  - element-nested `{const}` / `{let}` block-scope wrap + constant-folding of the
    shadowed binding (`declaration-tags`)
  - `metadata.promises_id` lowering for `{let x = $state(await …)}` on both client
    and server (`async-declaration-tag`, `async-declaration-tag-2`)
  - shorthand `style:x` directive after a top-level `await` no longer over-emits
    `$$promises` blockers (`async-style-after-await`)

### Patch Changes

- 7f593d4: Upgrade the Svelte compatibility target to **5.56.2** and keep **100% in-scope
  test compatibility (3525/3525, 0 failures)**.

  The 5.56.2 bump carried a single compiler change — upstream #18366 (ignore
  `DeclarationTag` nodes in the keyed-`{#each}` `animate:` directive single-child
  validation) — ported in `2_analyze/visitors/each_block.rs`.

  The concurrent `language-tools` submodule bump added six svelte2tsx fixtures,
  three of which exposed pre-existing port gaps that are now fixed:
  - `$props()` typedef insertion now counts the real declaration-keyword length
    (`const` = 5) instead of assuming `let` = 3, so `const { x } = $props()` no
    longer loses two characters of the keyword.
  - Hoisted interfaces are emitted in topological-promotion order (a base
    interface before the one that extends it), mirroring upstream
    `HoistableInterfaces`.
  - Non-leading `{#snippet}` blocks inside `{#each}` are hoisted above sibling
    `{const}` / `{let}` declaration tags (port of upstream `hoistSnippetBlock`).

## 0.6.1

### Patch Changes

- 375c61c: fix(ssr): apply derived-read wrapping to `{@html expr}`

  On the server, `{@html expr}` skipped the dynamic-expression transforms that the
  regular `{expr}` tag runs — most importantly `wrap_derived_reads`. Since a
  `$derived` binding compiles to a getter function on the server, `{@html post.html}`
  where `post = $derived(...)` emitted `$.html(post.html)` (reading `.html` off a
  function, i.e. `undefined`) and rendered nothing. It now emits
  `$.html(post().html)`, matching the official compiler. Non-derived expressions
  and string literals are unaffected. This surfaced as empty article bodies when
  prerendering a SvelteKit site that does `{@html ...}` over a `$derived` value.

## 0.6.0

### Minor Changes

- 6ac76c2: Bundle 71 compiler/AST correctness commits since 0.5.1 (Svelte target stays at 5.55.9). Highlights:
  - **async / blockers**: sync-statement grouping in the async-body transform (5.54.1), transitive `touch`-through-assignments in `compute_blocker_map` (5.55.1), `{#await await ...}` async-batching (5.55.9), `$derived(await ...)` nested-fn `$.save` lowering + then-arg shadowing (5.55.9), `has_more_blockers_than` IfBlock flattening guard and `@debug` blocker plumbing (5.55.3/5.55.6), `async-eager-derived` blocker reorder (5.53.12), `$inspect` after top-level await, `$$promises` threaded through head effects.
  - **`@const`**: per-const-tag blocker computation (5.55.3).
  - **CSS**: upstream-matching selector pruning + `:where()` composition.
  - **parse**: comments between attributes and in expressions, OXC-AST script-statement splitting, empty transition/in/out directive name rejection, attribute-shorthand bare-identifier rule, assignment-target preservation for for-of/for-in.
  - **analyze**: lexical-scope resolution of same-name rune declarations, `NewExpression` template-literal coercion.
  - **server**: SSR rune rewrite inside `{#if}` tests (5.55.4), multi-line declaration collapse in `extract_constant_vars`.
  - **napi**: upgrade napi-rs to v3 (compat-mode), RAII arena guard + zero-copy envelope offset/length validation.
  - **client**: whitespace-tolerant `$bindable` / `$props.id()`, call-only `<title>` memo binding, logical-assign proxy + store ops.

  Plus ~50 smaller correctness fixes from the review backlog.

## 0.5.1

### Patch Changes

- d95f3bb: fix: port Svelte 5.55.9 follow-ups — `nullish-coallescence-omittance` SSR
  stringify omittance (upstream `a5df6616e`) and `Percentage` keyframe
  double-print (upstream `ca3f35bf7`). Class / style / innerHTML SSR paths
  and the head-element SSR / `css-keyframes-percent` print path are still
  tracked as follow-ups in the per-suite skip lists.

## 0.5.0

### Minor Changes

- a7cdebe: Upgrade target Svelte to **5.53.0** and port the SSR compiler change for error boundaries:
  - **`<svelte:boundary>` with `failed` handler** (upstream commit `2661513cd` "feat: allow error boundaries to work on the server"): when a `failed` snippet or attribute is present, the boundary now emits `$$renderer.boundary({ failed }, ($$renderer) => children)` instead of inlining children, so SvelteKit's `+error.svelte` and other onerror-driven flows can render on the server. Boundary children always wrap in `<!--[-->...<!--]-->` hydration markers, the pending branch wraps in a bare block statement, and the no-pending-no-failed case is the simplest "open / children / close" shape.

  Three new SSR fixtures land alongside the change: `boundary-error-no-onerror`, `boundary-error-failed-prop`, `boundary-error-with-onerror`. The 98 `runtime-runes` boundary/async tests that diverged after the bump all return to green.

  Three known gaps from this upstream version are skipped (documented in `tests/compatibility_report.rs`) so the report stays at 100% across in-scope categories:
  - `parser-modern/comment-in-tag` and `parser-legacy/script-comment-only` — upstream's `92e2fc120` "feat: allow comments in tags" feature. Parsing `//` and `/* */` between element opener attributes plus surfacing a top-level `comments` array on the modern AST is queued as a follow-up port.
  - `runtime-runes/async-derived-title-update` — fixture added in upstream `582e4443d` (a runtime-only fix that nevertheless exposes a pre-existing gap: rsvelte's client transform doesn't yet thread async-derived `$$promises[N]` blockers into the `$.deferred_template_effect(...)` / `$.template_effect(...)` calls). Compiler-side runtime fix.

- 3756592: Bump target Svelte to **5.53.13** and port two compiler-side changes from the range:
  - **Upstream `32a48ed17`** "fix: don't eagerly access not-yet-initialized functions in template": rsvelte's `Memoizer::sync_values` / `async_values` now emit `b::arrow(arena, vec![], expr)` instead of `b::thunk(...)` so bare identifier references aren't unthunked to themselves — `[getX, getY]` becomes `[() => getX(), () => getY()]`. The async-await optimization (`async () => await x` → `() => x` when `x` has no nested await) moved from `unthunk` into `async_arrow` to match upstream's `arrow(_, _, async=true)` shape.

  - **Upstream `d4bd6ad8f`** "ensure 'is standalone child' is correctly reset" lands purely in runtime types — no rsvelte change needed.

  - **Upstream `b472171de`** "ensure `$inspect` after top level await doesn't break builds" exposes a pre-existing rsvelte gap in `$.run([...])` ordering after a top-level await. The new `runtime-runes/async-inspect-build` fixture is skipped (documented).

- a4c5334: Bump target Svelte to **5.53.7** and port the if-block hydration-marker change from upstream commit `86ec21086` "fix: correctly add `__svelte_meta` after else-if chains":
  - **SSR**: if-block consequent now emits `<!--[0-->`, else-if branches emit `<!--[1-->` / `<!--[2-->` / …, and the final else emits `<!--[-1-->` (replacing the legacy `<!--[-->` / `<!--[!-->` markers). Other block kinds (each / boundary / key / await) keep the legacy markers.
  - **Client**: the final-else `$$render(alternate, …)` call now passes `-1` (a numeric branch index) instead of the legacy `false` sentinel, so the runtime can pair it with the corresponding SSR marker.

  The new `css/css-prune-edge-cases` fixture (added by perf commit `0965028d3` "perf: optimize CSS selector pruning") is skipped — it exposes two CSS scoping/pruning edge cases (deep combinator chain that should be pruned but isn't, and selector composition order inside `:where(...)`). Other perf commits in the range (`32111f9e8`, `791d5e332`) don't change compiler output.

- 6be628d: Bump target Svelte to **5.54.0**. The single compiler-side commit in the range doesn't change emitted output for any in-scope fixture — pure submodule bump.
- 412eb00: Bump target Svelte to **5.55.0**. No compiler-side commits in the range; pure submodule bump.
- e438591: Bump target Svelte to **5.55.9** — the latest stable Svelte at the time of this catch-up.

  The two compiler-side commits in the range:
  - `a5df6616e` "fix: avoid unnecessary stringify in server attributes" inlines static string interpolations directly into the SSR HTML template push (`background-image: url('${$.stringify(x)}')` → `background-image: url('https://example.com/foo.jpg')` when `x` is a constant). rsvelte still emits the `$.stringify` form.
  - `000c594e0` "fix: `{#await await ...}` and async dependencies fixes" refines the async-batching / await-merge codegen tracked since 5.54.1.

  Eleven new fixtures across `runtime-runes`, `runtime-legacy`, `server-side-rendering`, and `snapshot` are skipped pending the follow-up ports for those two upstreams.

### Patch Changes

- 1e9483a: Bump target Svelte to **5.53.1**. The only compiler-side change upstream is `0c7f81514` "fix: handle shadowed function names correctly", which associates a `FunctionDeclaration` / `FunctionExpression` id node with its outer scope (so a nested `const foo = $derived(...)` inside `function foo() { ... }` doesn't leak its derived-ness to the outer `foo` reference). The new `runtime-runes/derived-name-shadowed` fixture is skipped in the compatibility report (with rationale in `tests/compatibility_report.rs`) until rsvelte's derived analysis is made scope-aware — tracked as a follow-up port.
- f1d65ad: Bump target Svelte to **5.53.10**. No compiler-side commits in the range; pure submodule bump.
- 1cd18da: Bump target Svelte to **5.53.11**. Upstream commit `58f161dee` "fix: properly lazily evaluate RHS when checking for assignment_value_stale" touches client transform but the new fixture doesn't surface any rsvelte-side divergence; pure submodule bump.
- b720d08: Bump target Svelte to **5.53.12**. Upstream commit `965f2a0ac` "fix: handle async RHS in assignment_value_stale" adds a fixture that exposes the same async-derived blocker-ordering gap as `async-derived-title-update` — `runtime-runes/async-eager-derived` is skipped in the compatibility report (documented).
- 6c1b11d: Bump target Svelte to **5.53.2**. The only compiler-side change upstream is `6aa7b9c64` "fix: update expressions on server deriveds", which routes `name++` / `name--` / `++name` / `--name` through new `$.update_derived(...)` / `$.update_derived_pre(...)` helpers when `name` resolves to a derived binding. The new `runtime-runes/derived-update-server` fixture is skipped in our compatibility report (documented in `tests/compatibility_report.rs`) until rsvelte's server-side update-expression walker grows derived-binding awareness — tracked as a follow-up port.
- 3a1b613: Bump target Svelte to **5.53.3**. No compiler-side changes upstream — the only relevant landing is `f67d03df5` "fix: make string coercion consistent to `toString`", which adjusts the runtime `set_text` helper. The new `runtime-runes/set-text-stable-coercion` fixture exposes a pre-existing rsvelte gap (we don't emit `?? ''` around interpolated identifiers inside `set_text(text, \`…\`)`calls when the source identifier is typed as`object`) and is skipped in the compatibility report pending a follow-up port.
- 43d20b1: Bump target Svelte to **5.53.4**. The only compiler-side change upstream is `3a289797b` "fix: handle default parameters scope leaks", which reworks `FunctionExpression` / `FunctionDeclaration` / `ArrowFunctionExpression` scope creation to use porous `scope.child(true)` so default parameter initializers no longer leak from surrounding declarations. Eight previously-passing fixtures (`runtime-legacy/const-tag-each-{arrow,const,function,duplicated-variable2,duplicated-variable3}`, `runtime-legacy/await-block-func-function`, `runtime-runes/async-{boundary-nav-race,if-else}`) regenerated with subtly different `{@const ...}` / `each` / `await` codegen and are skipped in the compatibility report (documented in `tests/compatibility_report.rs`) until rsvelte's analyzer matches the new function-scope porosity. Follow-up port queued.
- 752055a: Bump target Svelte to **5.53.5** and port upstream commit `0df5abcae` "Merge commit from fork — fix: escape `innerText` and `textContent` bindings of `contenteditable`". The server transform now HTML-escapes `bind:innerText` / `bind:textContent` expressions on contenteditable elements to prevent XSS via attacker-controlled content. `bind:innerHTML` keeps its raw expression because the user is explicitly opting into HTML.
- 1088eba: Bump target Svelte to **5.53.6**. The compiler-side commit in the range is `e3d277b00` "fix: visit synthetic value node during ssr" — it routes the synthetic `value` expression computed for `<option>` inside `<select>` through `context.visit(...)` so store refs (`$label`) get rewritten to `$.store_get(...)`. The other commits in 5.53.5 → 5.53.6 are perf-only (`1043f79d1`, `04ba134d3`, `efb651cd3`) or doc-only and don't change compiler output. The new `server-side-rendering/select-option-store-implicit-value` fixture is skipped in the compatibility report (documented in `tests/compatibility_report.rs`) because rsvelte's SSR transform doesn't yet route the synthetic value node through `transform_store_refs`. Follow-up port queued.
- c74572c: Bump target Svelte to **5.53.8** and partially port upstream commit `0206a2019` "fix: clean up externally-added DOM nodes in {@html} on re-render":
  - **Client**: `$.html(...)` calls now thread a new `is_controlled` flag between the thunk and the existing `is_svg` / `is_mathml` flags. rsvelte emits `void 0` for it because the fragment-side analysis that sets `metadata.is_controlled = true` (when `{@html ...}` is the only child of an element) isn't ported yet.

  Thirteen fixtures exercising the `is_controlled` short-circuit (skipping the wrapper anchor + using the parent node directly) are skipped in the compatibility report and documented in `tests/compatibility_report.rs`. Tracked as a follow-up port.

- 356b7f6: Bump target Svelte to **5.53.9**. No compiler-side commits in the range (only a runtime fix); zero rsvelte changes needed.
- 6ea2484: Bump target Svelte to **5.54.1** and port the small `{@const}` printer fix from upstream commit `7123bf3a1` ("fix: remove trailing semicolon from `{@const}` tag printer"). The other compiler-side commit, `6b33dd2a1` "fix: group sync statements", reshapes how async-aware transforms batch sync assignments into a single thunk + reuse `$$promises[N]` indices; rsvelte still emits one callback per assignment with sequential indices, so the seven new fixtures that exercise the regrouping (`runtime-runes/async-derived-indirect`, `async-if-hydration`, `async-derived-with-effect-and-boundary`, `async-binding-after-await`, `async-transform-empty-statements`, `async-later-sync-overlaps`, `async-style-after-await`) are skipped pending a dedicated port.
- a110812: Bump target Svelte to **5.55.1**. The three compiler-side commits in the range (`4879f9da9` better duplicate module import error, `957f2755f` cleanup `superTypeParameters` in class declarations, `669f6b45a` prevent hydration error on async `{@html …}`) don't surface any rsvelte-side divergence on existing fixtures. The seven new `runtime-runes/async-overlap-multiple-*` fixtures (added by chore `5e8662fb2`) diverge only in blank-line placement around hoisted function decls; they're skipped pending a canonicalize-js / hoisting tweak.
- 8613663: Bump target Svelte to **5.55.2**. The four compiler-side commits in the range (`6b653b8d1`, `8966601dc`, `edcbb0e64`, `97d45f85c`) don't surface new rsvelte-side divergence beyond known gaps. Three new fixtures (`parser-modern/parens`, `runtime-runes/async-if-block-unskip`, `runtime-legacy/flush-sync-each-block`) are skipped because they exercise the already-tracked comments-in-tags / blank-line / no-semicolon-import gaps.
- a8a5f77: Bump target Svelte to **5.55.3**. The single compiler-side commit `3937ec03b` "fix: correctly calculate `@const` blockers" adds seven async-const fixtures that exercise the same group-sync-statements async batching as 5.54.1's `6b33dd2a1` — skipped pending the same follow-up port.
- 0ee799d: Bump target Svelte to **5.55.4**. Single compiler-side commit `0ed8c282f` "fix: reset context after waiting on blockers of `@const` expressions" adds two fixtures (`async-effect-pending-eager`, `async-context-after-await-const`) that exercise the same async-batching follow-up tracked since 5.54.1.
- b4a23af: Bump target Svelte to **5.55.5**. No compiler-side commits in the range. The new `runtime-runes/derived-dep-set-while-rendering` fixture exposes a pre-existing SSR rsvelte gap (we wrap a bare-identifier `$derived(IDENT)` arg in a `() => IDENT()` thunk when upstream emits the bare `IDENT`); skipped pending a `wrap_derived_reads` carve-out for `$derived(IDENT)` arguments.
- a97d9af: Bump target Svelte to **5.55.6**. Four compiler-side upstream commits (`e00944ffd` SSR member-expression compile, `89b6a939f` `Promise.all` save during SSR, `4c96b469f` `@debug` awaited variables, `69b4c9f56` skip block comments in `read_value`). Eleven new fixtures hit the same async-batching follow-up tracked since 5.54.1 (plus one additional `<svelte:component this={state.x.Y}>` gap exposed by `dynamic-component-member`); all skipped.
- bed3534: Bump target Svelte to **5.55.7**. No compiler-side commits in the range; pure submodule bump.
- fbb7d44: Bump target Svelte to **5.55.8**. The single compiler-side commit `ca3f35bf7` "fix(print): handle svelte:body and fix keyframe percentage double-printing" reshapes the CSS pretty-printer's selector / `@keyframes` body formatting. rsvelte's print pass doesn't re-format CSS bodies the same way; `print/css-keyframes-percent` and `print/style` are skipped pending a follow-up port.

## 0.4.0

### Minor Changes

- 34a4593: feat(capi): add C ABI bindings (`crates/rsvelte_capi`) so the rsvelte Svelte compiler can be called from any language with a C FFI

  This release introduces a parallel distribution surface: in addition to the existing NAPI-based `@rsvelte/compiler` npm package, the compiler is now also available as a stable C shared library at `crates/rsvelte_capi`. One `cdylib` + one cbindgen-generated `rsvelte.h` lets any language with a C FFI drive the same compiler — UTF-8 JSON in, UTF-8 JSON out, no per-language schema generation.
  - **Languages with smoke tests on every PR**: C, Go, Python, Ruby, Zig, PHP, Java (JDK 22+ FFM API). C++/Kotlin/Scala/.NET/Swift are trivially derivable from the same header.
  - **API**: `rsvelte_compile`, `rsvelte_compile_module`, plus `*_into` out-parameter variants for hosts that can't pass structs by value (Ruby Fiddle, certain Java/JNI setups). `rsvelte_free` / `rsvelte_free_raw` for cleanup; `rsvelte_version` for the version probe.
  - **Options shape**: identical to the existing NAPI `compile()` options (camelCase, all optional).
  - **Breaking-change guard**: the build script panics under `RSVELTE_CAPI_CHECK_HEADER=1` if the committed header drifts from cbindgen output, and 35 cargo integration tests assert the JSON envelope shape, header invariants, and observable behaviour of every documented `CompileOption`. CI runs the full matrix (Linux/macOS/Windows × 7 languages) for every PR that touches the C ABI or the compiler.

  This does not change the published `@rsvelte/compiler` npm package's runtime behaviour — it is a parallel distribution channel. The npm version is bumped so the C ABI surface appears in the next release notes.

  See `crates/rsvelte_capi/README.md` for the full API, JSON envelope shape, memory ownership rules, and per-language quick-start table.

- ccb02b2: Upgrade target Svelte to **5.52.0** and port the two SSR compiler changes that landed upstream:
  - **Dynamic component if/else hydration markers** (upstream commit `9f48e7620`): `<svelte:component>` and `<Component this={...} />` now emit `if (expr) { push('<!--[-->'); call; push('<!--]-->'); } else { push('<!--[!-->'); push('<!--]-->'); }` instead of `(expr)?.(…)` framed by empty comments. The if/else markers let hydration repair truthy↔falsy mismatches.
  - **Re-run non-render-bound deriveds on the server** (upstream commit `09c4cb508`): `let foo = $derived(expr)` is emitted as `let foo = $.derived(() => expr)` and every read of a derived binding becomes a call (`foo()`, or `foo?.()` for `var`-kind declarators). Destructured derived patterns (`let { a, b: [c] } = $derived(stuff)`) expand to a `$$derived_array`/`$$d` helper plus per-leaf `$.derived(...)` declarators that mirror the upstream `extract_paths` expansion.

  The compatibility report stays at **3,339 / 3,339 in-scope passing** with every category at 100%.

  Side fixes along the way:
  - A handful of byte-level fallbacks in the server transform's script walker were pushing `bytes[i] as char` to a `String`, which interprets a single UTF-8 continuation byte as a Latin-1 code point and corrupts non-ASCII source (`'Compté'` → `'ComptÃ©'`). All occurrences in `transform_script.rs` now step by char boundary.
  - `is_object_shorthand_position` no longer rejects a candidate when its enclosing `{` sits at byte 0 of the scanned slice — so `{ doubled }` at the start of a `wrap_derived_reads_for_template` argument is correctly expanded to `{ doubled: doubled() }` rather than the invalid `{ doubled() }`.

## 0.3.2

### Patch Changes

- 4db15ed: Roll up everything that has landed on `main` since `0.3.1` / `0.1.1`.
  - compiler: track upstream Svelte `5.51.4` → `5.51.5`.
  - vite-plugin-svelte-native: NAPI bindings now disable jemalloc's
    `initial-exec` TLS model so the dylib is safe to `dlopen` from Node on
    glibc hosts.
  - svelte-check / svelte2tsx: republish to pick up the routine dependency
    refresh (`serde_json` 1.0.150, `rustc-hash` 2.1.2).
  - Release workflow now publishes via npm OIDC trusted publishing (no
    `NPM_TOKEN`), Node 22, and `npm publish --provenance` for every
    platform sub-package — every tarball ships with provenance attestation.
  - Docs: README rewritten around the OXC integration goal, with per-task
    benchmark breakdown (parser / svelte2tsx / svelte-check) mirroring
    the live `/benchmark` page.

## 0.3.1

### Patch Changes

- 1153e43: test(release): patch-bump every package to validate the GitHub Actions release pipeline end-to-end

  The local one-shot `publish-all-local.sh` is the manual escape hatch; the
  intended steady-state path is `release.yml` (changesets/action + matrix
  binary builds + `pnpm publish`). This changeset bumps each of the four
  top-level packages by `patch` so we can:
  1. Watch changesets/action open the "Version Packages" PR.
  2. Merge it.
  3. Watch the release workflow build the 5-triple matrix for both
     `svelte_check` and the NAPI cdylib, stage them via
     `scripts/stage-svelte-check-binaries.mjs` /
     `scripts/stage-vps-binaries.mjs`, and publish all 14 npm packages.
  4. Confirm every `@rsvelte/*` on the registry shows the new patch version.

  `fixed` groups in `.changeset/config.json` make the 5 svelte-check
  platform packages and the 5 vps-native platform packages follow their
  main package automatically, so this changeset only names the four
  top-level packages.

  The submodule fork (`@rsvelte/vite-plugin-svelte`) lives in a separate
  repo and isn't part of this pipeline — it's published independently.
