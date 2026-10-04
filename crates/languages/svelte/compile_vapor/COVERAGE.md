# Svelte documentation coverage

This compiler does not yet implement every feature in the
[Svelte overview](https://svelte.dev/docs/svelte/overview).
`Partial` means the listed forms work, while the remaining forms still need work.
Handwritten cases live in `tests/fixtures/`. External JavaScript imports are preserved.
Component imports, member names and local references support client and server rendering.

| Documentation topic | Status | Implemented forms | Remaining work |
|---|---|---|---|
| `$state` | Partial | Variables in instance and module scripts and nested functions, object and array patterns, defaults and rest, raw state, plain object and array proxies, snapshots, synchronous eager reads, public and private class fields, first constructor assignments | Async eager scheduling and ownership checks |
| `$derived` | Partial | Expressions and `.by` callbacks in scripts and nested functions, object and array patterns, defaults, rest, computed keys, class fields, constructor assignments and overrides | Full pattern and override scheduling parity |
| `$effect` | Partial | Effects, `.pre`, `.root`, `.tracking`, `.pending`, cleanup | Complete scheduling parity |
| `$props` | Partial | Whole prop objects, destructuring, literal and complex defaults, rest properties and spreads, names containing uppercase letters, local scalar overrides, bindable props, `.id` through Vue component IDs | Reserved names, full write scheduling parity, hydration |
| `$bindable` | Partial | Literal and complex fallbacks, aliases, local writes, parent bindings and element bindings | Ownership checks, initialization edge cases |
| `$inspect` | Partial | Production removal, `.with`, `.trace` in scripts | Development output and tracing |
| `$host` | Partial | Captured host access, host events, native shadow slots and light DOM fallbacks, custom element registration, typed props, reflection and extended constructors | Pre-upgrade properties and full lifecycle parity |
| Basic markup | Partial | HTML, SVG, MathML, foreign objects, text, named and numeric character references, static and reactive textarea contents, nested HTML template contents, preformatted whitespace, grouped updates for nonreactive reads, cached calls in text, attributes and directives with attribute-before-child evaluation before DOM writes, normal attributes including `key` and `ref`, static class/style whitespace, boolean properties, `hidden="until-found"`, initial autofocus, event handlers, spreads with ordered event overrides, components with reactive props, member names and local references, exported constants, functions and classes, module scripts with shared state, registered custom element setters, custom element spreads, unregistered object properties and namespace-aware spread attributes, type-only TypeScript syntax | Export aliases, module rune value exports and runtime imports, attribute name casing and namespace edge cases |
| `{#if}` | Partial | Multiple elements, text, else-if, else and awaited conditions | Hydration |
| `{#each}` | Partial | Item and index names, omitted item names, keys, nesting, arbitrary empty-list fallback expressions, object and array patterns | Pattern writes and full initialization parity |
| `{#key}` | Partial | Recreate a block when its key changes | Hydration |
| `{#await}` | Partial | Pending, then, catch, non-promises, stale result cancellation, server pending output, destructured branch values | Boundary integration |
| `{#snippet}` | Partial | Plain and destructured parameters, defaults, omitted arguments, nested and recursive declarations, component snippet props and implicit children | Exports, full initialization parity |
| `{@render}` | Partial | Local and component snippets, reactive arguments, optional calls and awaited arguments | Full initialization parity |
| `{@html}` | Partial | Replace raw HTML and dispose old blocks | Full parsing context parity |
| `{@attach}` | Partial | Functions, reactive reads, identity changes, cleanup, nested effects, spread symbols, component forwarding and action adapters | Full scheduling parity |
| `{@const}` | Partial | Identifier, object and array bindings, defaults, rest patterns, nested dependencies | Full initialization parity |
| `{@debug}` | Partial | Production removal | Development logging and debugger statements |
| `{let/const}` | Partial | Identifiers and destructured plain values, state and derived patterns, lexical shadowing | Mixed legacy declarations and full initialization parity |
| `bind:` | Partial | Text, number, range, checkbox, single and multiple selects, function bindings, checkbox and radio groups with dynamic values and local scopes and member targets, indeterminate checkboxes, details, file inputs, image sizes, focus, contenteditable, element references in plain variables and object properties, component and global bindings, form reset, default attributes, media events and all eight dimension bindings | Real media playback tests |
| `use:` | Partial | Mount, parameter updates, destruction | All parameter and lifecycle edge cases |
| `transition:` | Partial | CSS, ticks, start and end events, grouped removal, reversal, deferred functions, crossfade and local/global scope | Full block and scheduling parity |
| `in:` and `out:` | Partial | Separate transitions, concurrent intro and outro, delayed removal | Complete cancellation and block parity |
| `animate:` | Partial | Keyed move measurement, CSS animation, parameters, index updates and const scopes | Interrupted moves, outgoing position fixes and full scheduling parity |
| `style:` | Partial | Property updates, removal, interpolation, important modifiers, dynamic style attributes and spreads combined with directives, ordered overrides of base properties | Complete CSS shorthand parity |
| `class` | Partial | Strings, arrays, objects, class directives beside spreads, interpolated class values, scoped hashes | Complete whitespace and coercion parity |
| `await` expressions | Partial | Top-level script awaits, async derived values, text and attributes, class/style directives, async component props, branches and lists, dynamic elements, raw HTML, head content and snippet arguments, reads after await, stale result cancellation, pending boundaries and async SSR; diagnostics for awaits in actions, attachments, transitions, animations and bindings | Shared update batching, complete context and scheduling parity |
| Scoped styles | Partial | Shared Svelte selector analysis, CSS output and injected styles | Full CSS oracle comparison |
| Global styles | Partial | Shared Svelte CSS lowering and injected styles | Full CSS oracle comparison |
| Custom properties | Partial | Static and reactive component CSS properties, HTML wrappers and SVG groups | Browser inheritance and layout parity |
| Nested style elements | Partial | Static global CSS in nested style nodes | Full browser stylesheet tests |
| `<svelte:boundary>` | Partial | Render and effect errors, async errors, failed and pending snippets, reset, nested propagation and cleanup | Server error transforms and complete lifecycle parity |
| `<svelte:window>` | Partial | Events, size, online, scroll reads and writes | Complete binding validation and scroll scheduling edge cases |
| `<svelte:document>` | Partial | Events and document property reads | Complete binding validation |
| `<svelte:body>` | Partial | Events and disposal | Complete directive validation |
| `<svelte:head>` | Partial | Reactive and awaited head content, server head output, disposal | Existing titles, nested components and head ordering |
| `<svelte:element>` | Partial | HTML tag changes, dynamic SVG roots, null tags, attributes and disposal | Full namespace inference, invalid tags, void-element validation |
| `<svelte:options>` | Partial | Namespace, whitespace preservation, explicit runes mode, injected CSS, custom element tags, open and closed shadow settings, light DOM, native slots and fallbacks, typed prop options and reflection, extended constructors | Full initialization and lifecycle parity |
| Lifecycle hooks | Partial | `onMount` with cleanup, client and server `onDestroy`, `tick`, `untrack`, import aliases | Other runtime APIs and full scheduling parity |

Run the snapshots and the runtime comparisons:

```sh
cargo test -p rsvelte_svelte_compile_vapor
mise exec -- node --test tools/fixtures/test/behaviour*.test.ts tools/fixtures/test/vapor-browser.test.ts
```

Runtime comparisons include mount, user actions, head output, and explicit
unmount where a case requests them. Positive controls change an update, remove server head output, and change an SVG
namespace. Browser tests compare dimension updates, observer disposal, window scrolling, custom element host events, shadow modes, injected CSS, transitions and keyed move animations in Chrome.
Positive controls change a dimension, omit observer cleanup, remove a component reference, accept stale async results, coerce a normal attribute to a boolean, freeze a nonreactive attribute, reflect `checked`, omit autofocus, preserve a static preformatted newline, change attribute whitespace, delay a template call until after a DOM write, omit a deferred transition resolver, stringify a custom element property, normalize a custom element spread as an ordinary element, lowercase a namespaced spread attribute, and omit custom element prop reflection. Each must produce a mismatch. Full corpus parity, hydration,
and performance are **UNMEASURED**.
