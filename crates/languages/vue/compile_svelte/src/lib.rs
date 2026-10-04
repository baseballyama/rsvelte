//! svue: a `.vue` component, with Vue's meaning, compiled to JavaScript for the Svelte runtime.
//!
//! svue reads the Vue plugin's artifacts ([`rsvelte_vue::Parsed`], [`rsvelte_vue::Lowered`],
//! [`rsvelte_vue::Resolved`]) and writes what the Svelte compiler reads: a runes instance program
//! and a Svelte HIR ([`Translation`]). [`rsvelte_svelte_compile::compile`] then lowers
//! it, so the module has the shape `svelte/compiler` emits and imports only `svelte`, `svelte/*`,
//! `vue` and `@vue/*`. The tasks are `svue.compile/client` and `svue.compile/server`, on `.vue`
//! documents; the oracle is the component's DOM under Vue itself (`tools/fixtures/src/behaviour`).
//!
//! What a translation cannot reproduce exactly it refuses with a `compile_unsupported`
//! diagnostic, never an approximation, and it never panics.
//!
//! # Mapping
//!
//! The script (`<script setup>` becomes the instance script):
//! - `const x = ref(v)`: `let x = $state(v)`, and `x.value` reads and writes `x`. Only a primitive,
//!   a literal or a primitive prop: `$state` proxies what `reactive` would.
//! - `const x = reactive({…})` or `reactive([…])`: `let x = $state({…})`; both proxy the literal
//!   deeply.
//! - `const x = computed(() => e)`: `let x = $derived.by(() => e)`.
//! - `onMounted(fn)`: `onMount(() => { fn(); })`, since Vue does not take the callback's return
//!   value for a cleanup.
//! - `defineProps([…])` or `defineProps({…})`, literal defaults only: a destructuring of
//!   `$props()`, `{ k = default, ...rest }`, and `props.k` (or `k` in the template) reads the
//!   prop's variable.
//! - A `Boolean` prop: a `$derived.by` of runtime-core's `resolvePropValue` over the rest (absent
//!   is `false`; `''` and the hyphenated name are `true`).
//!
//! The template (text nodes carry Vue's condensed text, as
//! [`rsvelte_svelte::compilation::compiler_syntax_tree::spelled_text`], and the Svelte compiler
//! runs with `preserveWhitespace` so that it does not condense it again):
//! - `{{ e }}`: `{toDisplayString(e)}`, Vue's display rules, from `vue`.
//! - `v-if` / `v-else-if` / `v-else`: `{#if}` / `{:else if}` / `{:else}`; a `<template>` carrying
//!   one, or `v-for`, is the block without an element.
//! - `v-for="(a, i) in src" :key="k"`: `{#each renderList(src, …) as entry (k)}`; `renderList`
//!   iterates numbers, strings, objects and iterables as Vue does.
//! - `@event="handler"`: `onevent={handler}`, for a declared function, an arrow, or an inline
//!   statement over `$event`. `.stop`, `.prevent`, `.self`, `.ctrl`, `.shift`, `.alt`, `.meta` and
//!   `.exact` wrap it in `withModifiers`, and key modifiers on `keyup`, `keydown` and `keypress` in
//!   `withKeys`, both from `vue`.
//! - `v-model` on the client: an `{@attach}` that runs Vue's own `vModelText`, `vModelCheckbox`,
//!   `vModelRadio` or `vModelSelect` hooks, `.lazy`, `.number` and `.trim` included.
//! - `v-model` on the server: the attribute compiler-ssr's `ssrTransformModel` renders, and
//!   `selected` on the `<option>`s of a bound `<select>`, through `ssrLooseEqual`,
//!   `ssrLooseContain` and `ssrIncludeBooleanAttr` from `vue/server-renderer`.
//! - `:class` beside a static `class`: `class={normalizeClass([static, dynamic])}`, from `vue`.
//! - `:attr="e"`: `attr={e}`; on the server, a value Vue does not render (`isRenderableAttrValue`)
//!   is `undefined`. A boolean attribute is `includeBooleanAttr(e) ? '' : undefined`.
//! - Undeclared attributes on a single-element root: `{...attrs}` on the root, with `class` merged
//!   as `mergeProps` does; the `Boolean` props, the reserved keys and `onVnode*` are removed from
//!   them.
//!
//! # Refusals
//!
//! The script:
//! - `<style>` (Vue scopes it with `data-v-` attributes, Svelte by its own rules), and a TypeScript
//!   construct with a runtime value.
//! - An import from a module other than `vue`, or from `vue` other than `ref`, `computed`,
//!   `reactive` and `onMounted`; an export; a top-level `await`; `this`.
//! - A ref, computed, reactive or props object not declared as `const name`; one of the four APIs
//!   used as a value; a ref used other than through `.value`; more than one argument.
//! - `ref` of a value created elsewhere; `reactive` of anything but an object or array literal;
//!   `computed` of anything but a getter without parameters; `onMounted` of anything but a function
//!   literal.
//! - A type-based `defineProps`, one beside other variables, or one other than an array or object
//!   literal; a prop declared twice; a name that is not a lowercase identifier, is reserved by
//!   JavaScript or Vue, or starts with `on`; a type other than a constructor name; a default other
//!   than a literal; any other option (`validator`, `required`, …).
//! - The props object used other than as `props.<declared prop>`; a write to a prop or a computed.
//!
//! The template:
//! - A component, `<slot>`, `<template>` other than as a `v-if`/`v-for` fragment, an attribute on
//!   such a fragment, a spelled or uppercase tag name, and a `<pre>` whose text starts with a line
//!   break.
//! - A name the component does not declare, other than the globals Vue's template allows; reading a
//!   script variable that Vue unwraps or re-reads on every render.
//! - `v-else` without `v-if`; `v-if` and `v-for` on one element; a `v-for` modifier, a missing
//!   value, no alias or more than three, a destructuring alias, or a write to an alias; a
//!   destructuring assignment.
//! - A directive without a value; a `v-bind` modifier; `:key` outside `v-for`, `:ref`, `:is`,
//!   `:style`, `:hidden`, `:autofocus`; `:value` other than on an `<input>` without `v-model`; a
//!   static or bound attribute Vue sets as a DOM property that does not reflect it as written; a
//!   value on a boolean attribute; an attribute written twice; an attribute name with uppercase
//!   letters; `style` on an element attributes fall through to.
//! - An event name other than lowercase letters; two listeners for one event; a `function`
//!   expression, a member expression, or a name other than a declared function as a handler; the
//!   modifiers `.once`, `.passive`, `.capture`, `.left`, `.right`, `.middle`, `.native`.
//! - `v-model` other than on `<input>` (not `file`) and `<select>`; beside a `value`; with an
//!   argument, a modifier other than `.lazy`, `.number` and `.trim`, or a bound `type`,
//!   `true-value` or `false-value`; two on one element; on anything but a ref or a variable, or on
//!   a prop or a computed; a composition listener beside it.
//!
//! The Svelte compiler then refuses what its own port does not lower; the module is never written
//! with an approximation.
//!
//! # Known differences the oracle cannot see
//!
//! - `v-model`'s `beforeUpdate`/`updated` hooks run when the bound value changes, not on every
//!   render of the component.
//! - An empty class renders `class=""` under Vue and no attribute under Svelte.
//! - A listener that falls through replaces the root's own listener for that event instead of being
//!   merged with it.

pub mod compilation;
pub mod computation;
pub use compilation::{Translation, translate};
pub(crate) use compilation::{context, script, template};
pub use computation::{
    Analyzed, Client, Compile, PLUGIN, Resolved, Server, Side, Translated, register,
};
