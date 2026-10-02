//! vuelte: a `.svelte` component, with Svelte's meaning, compiled to JavaScript for the Vue
//! runtime.
//!
//! A plugin that registers tasks on another plugin's documents and owns only a translation. The
//! Svelte plugin's artifacts ([`rsvelte_svelte::Parsed`], [`rsvelte_svelte::Normalized`],
//! [`rsvelte_svelte::Resolved`], [`rsvelte_svelte::Analyzed`]) are computed once per document and
//! shared with `svelte.compile` and the other Svelte tasks; this crate turns them into a Vue
//! `<script setup>` program ([`script`]) and a Vue template HIR ([`template`]), and the Vue
//! plugin's [`rsvelte_vue::resolve::resolve`] and [`rsvelte_vue_compile::compile::compile`] turn
//! those into what `@vitejs/plugin-vue` emits for a production build. [`check`] runs once for both
//! targets; [`translate`] builds one module per target (`vuelte.compile/client`, `/server`),
//! because Svelte's client and server runtimes differ where Vue's do not (a client binding is an
//! effect on the element, a server one is markup).
//!
//! There is no upstream compiler to compare with; the oracle is behavioural (`docs/fixtures.md`
//! §12): the official Svelte build's DOM after mount and after each step, and its SSR HTML.
//!
//! # Mapping
//!
//! "Steps" run in the element's function ref, `:ref="($$el) => { if ($$el !== null) { … } … }"`,
//! which Vue calls with the element after every patch of it and with `null` on unmount: where
//! Svelte's render effects and `bind:this` run. The `$$` helpers are in [`helpers`]. Each entry
//! is the Svelte construct, then what both targets emit, then (client / server) where they differ.
//!
//! - `let x = $state(v)`: `const x = $$ref(v)` (`ref`, aliased). Script reads and writes go through
//!   `x.value`; template references stay plain (the template compiler unwraps a setup ref).
//! - `let x = $state.raw(v)`: `const x = $$shallowRef(v)`.
//! - `let x = $derived(e)`, `$derived.by(f)`: `const x = $$computed(() => e)`, `$$computed(f)`.
//! - `let { a, b = 1, c: d } = $props()`: `const $$props = defineProps({ a: {}, b: { default: 1 },
//!   c: {} })`, and every reference to `a`, `b` or `d` reads `$$props.a`, `$$props.b`, `$$props.c`.
//!   No `type`, so no Boolean casting.
//! - `let { …, ...rest } = $props()`: `const $$attrs = $$useAttrs()` (`useAttrs`), the undeclared
//!   attributes, as `rest` holds the undeclared props; `rest` may only be spread in the template.
//! - every component: `defineOptions({ inheritAttrs: false })`, as Svelte passes no undeclared
//!   attribute through.
//! - `import { onMount } from 'svelte'`: `import { onMounted as onMount } from 'vue'` (neither
//!   server runs it).
//! - text, after Svelte's `clean_nodes`: the same text in the Vue HIR, which the Vue compiler does
//!   not condense again.
//! - `{e}` that Svelte evaluates to a constant: the constant's text.
//! - `{e}`: client `` {{ `${e ?? ''}` }} ``, as `set_text` coerces (no `?? ''` inside a larger
//!   chunk when Svelte proves `e` defined), and a lone `{e}` that reads no state is `$$node(e)`,
//!   Svelte's one-time `nodeValue`; server `{{ String(e ?? '') }}`, `escape`'s coercion.
//! - `a="s"`, `a`: the static attribute.
//! - `a={e}` on a text attribute (`id`, `title`, `href`, `aria-*`, `data-*`, …): `:a="$$attr(e)"`,
//!   where `null` and `undefined` remove (`set_attribute` / `attr`); `e` as is when it is a string,
//!   number or boolean by construction.
//! - `a="s{e}t"`: `:a` with a template literal, `?? ''` (client) or `$$stringify` (server) around
//!   each expression Svelte cannot prove a string.
//! - a boolean attribute of its elements (`disabled`, `required`, `controls`, …): client
//!   `:disabled="Boolean(e)"`, as Svelte sets the property; server `$$bool(e)`, where `''` is
//!   present, as `attr(…, true)`.
//! - `class={e}`: `:CLASS="$$class(e)"`, `clsx` then `to_class`, `null` removing the attribute. The
//!   upper-case key keeps Vue's `class` normalisation out; its DOM and SSR paths lower-case the
//!   name.
//! - `class:name={e}` (with or without a `class` attribute): client a step `$$set_class($$el,
//!   value, { name: e })` (`set_class`, which toggles the directives once the value is set); server
//!   `:CLASS="$$to_class(value, { name: e })"`.
//! - `{...e}` on an element: every attribute of the element becomes one object in attribute order,
//!   `{ 'a': v, ...e }`; client a step `$$attributes($$el, obj)` (`set_attributes`: the previous
//!   object, property or attribute per name, events, `class`, `style`), server
//!   `v-bind="$$spread(obj)"` (`attributes`: first name wins, booleans, invalid names dropped),
//!   which the Vue port compiles as compiler-core's object `v-bind`. The `^` key prefix keeps Vue's
//!   SSR attribute filter out. A spread that carries an attachment, or `itemscope` / `scoped` with
//!   a non-empty value on the server (Vue prints them as boolean attributes), throws at runtime
//!   rather than render differently.
//! - `onload` / `onerror` on a load/error element (`<img>`, `<link>`, `<iframe>`, …), or any spread
//!   on one: server `onload="this.__e=event"` and `onerror=…`, Svelte's replay marks.
//! - `value={e}` on `<input>`, `<textarea>`: client a step `$$value($$el, e)` (`set_value`; Vue
//!   would also set the attribute); server `:value="$$attr(e)"`.
//! - `onclick={f}`, for a handler that cannot read `this`: client `@click="f"`; server nothing.
//! - `{#if a}…{:else if b}…{:else}…{/if}`, one element per branch: `v-if` / `v-else-if` / `v-else`
//!   on those elements.
//! - `{#each xs as x, i (k)}`, one element: `v-for="(x, i) in $$each(xs)"`, `:key="k"` when keyed;
//!   `{:else}` adds `v-if="$$each(xs).length"` and a `v-else` element. `$$each` is the client's
//!   conversion or the server's `ensure_array_like`.
//! - `bind:value` on a text-like `<input>` or a `<textarea>`: client `@input` writing
//!   `$event.currentTarget.value` and a step `x !== $$el.value && ($$el.value = x ?? '')`
//!   (`bind_value`'s effect); server `:value="$$attr(x)"`.
//! - `bind:checked` on a checkbox: client `@change`, a first-mount step (`$$once`) that sets a
//!   nullish `x` to the element's state, and a step `$$el.checked = Boolean(x)`; server
//!   `:checked="$$bool(x)"`.
//! - `bind:value` on a `<select>` of static options: client `@change="x =
//!   $$option($event.currentTarget)"` and a step `$$select($$el, x, set)` (`select_option`;
//!   `undefined` on mount adopts the browser's choice); server `:selected="x === 'v'"` on each
//!   option, as the renderer compares.
//! - `bind:this={x}`: client a step `x = $$el`, run on unmount too (`null`); server nothing.
//!
//! # Refusals
//!
//! A construct outside the table is refused with a `vuelte_unsupported` diagnostic, before any
//! output is built, never with an approximation:
//!
//! - a document the Svelte plugin does not parse or resolve (its diagnostic is reported as is:
//!   module scripts, other blocks and directives, …), a `<style>` (the styles would be lost), a
//!   TypeScript instance script, a name declared twice (Svelte reads a redeclared `var` as
//!   reassigned);
//! - an import other than one `onMount` from `svelte`, an export, a `$`-prefixed declaration
//!   (Svelte reserves them, and the translation's own names start with `$$`), a binding that
//!   shadows a global the output calls (`Array`, `Object`, `String`, `Boolean`, `undefined`), a
//!   name the Vue compiler declares (`_ctx`, `_hoisted_1`, `_toDisplayString`, …) or treats as a
//!   macro (`defineProps`, `defineOptions`, …);
//! - any other rune (`$effect`, `$inspect`, `$bindable`, `$props.id`, `$host`, …), and store
//!   subscriptions; the rest prop read, written or mutated other than as a spread attribute; a
//!   `$props()` that is not one object pattern of plain keys with literal defaults; a prop name Vue
//!   reserves (`key`, `ref`, `onVnode*`, …), reads as a template global, or normalises (any
//!   upper-case letter);
//! - writing or mutating a prop, writing a `$derived`;
//! - an `onMount` callback that may return a value (Svelte calls a returned function on destroy,
//!   Vue ignores it), or `onMount` used other than as a top-level call;
//! - a `new` expression (Svelte proxies only plain objects and arrays, Vue every object) and `this`
//!   in the template;
//! - a template global outside Vue's `GLOBALS_ALLOWED` (Vue reads it from the instance);
//! - a template that reads, at render time and through the component's functions, a binding that
//!   changes without being reactive, or `Math.random`, `Date.now`, `performance.now`: Svelte keeps
//!   the value it rendered, a Vue re-render would compute a new one;
//! - components, `svelte:` elements, custom elements, `<slot>`, `<template>`, `<script>`,
//!   `<style>`, `<noscript>`, `<iframe>`, `<object>`, SVG and `MathML`, a `<textarea>` with
//!   children, a `<pre>` whose text starts with a newline (the server's markup loses it);
//! - where the browser's parse of Svelte's client template differs from the elements Vue creates:
//!   `<html>`, `<head>`, `<body>`, a table part outside its parent beside other content, rich
//!   content in `<select>`, `<optgroup>` or `<option>`;
//! - a character reference the shared decoder does not read as Svelte does (named ones other than
//!   `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`, `&nbsp;`, any without `;`, numeric ones Svelte
//!   remaps);
//! - an `{@attach}` tag (Svelte runs it as an effect that tracks its reads and tears down on a
//!   change; a function ref tracks nothing of its own), a duplicate attribute (Svelte's
//!   `attribute_duplicate`), a spread on `<input>`, `<textarea>`, `<select>` or `<option>`, and
//!   beside a spread: a binding other than `bind:this`, an event attribute, an interpolated value,
//!   a `class:` directive;
//! - an `{#if}` branch or an `{#each}` body that is not exactly one element (it would need a
//!   `<template>` fragment), an `{#each}` without a plain item name, an `{#each}` fallback over a
//!   collection that is not a name or a member chain;
//! - an attribute name that is not lower-case letters, digits and `-`, or that Vue or the DOM reads
//!   specially (`key`, `ref`, `is`, `slot`, `autofocus`, `muted`, `defaultvalue`,
//!   `defaultchecked`); a static `class` or `style` with whitespace Svelte collapses; a dynamic
//!   value on any attribute outside the table (`style`, `type`, `checked`, `selected`, `value`
//!   other than on `<input>` and `<textarea>`, …);
//! - an event attribute whose name is not lower-case letters, a capture or passive event (Svelte
//!   registers `touchstart` and `touchmove` as passive), a listener for the event a binding on the
//!   same element listens to, a handler that may read `this` (Svelte binds the element);
//! - any binding not in the table: `bind:value` on a number, range, radio, file or other non-text
//!   input (Svelte coerces numbers), a binding to anything but `$state` or a member of `$state` or
//!   of an `{#each}` item, a `<select>` with `multiple`, a `value` or options that are not static,
//!   and any binding in a component that can reset a form (Svelte's bindings follow a reset, Vue's
//!   state does not);
//! - what the Vue port itself refuses, reported as `the Vue compiler: …`.

pub mod compilation;
pub mod computation;
use compilation::{R, unsupported};
pub use compilation::{Translation, check, compile, helpers, script, template, translate};
pub use computation::{Checked, Compile, register};
