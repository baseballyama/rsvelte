//! svue: a `.vue` component, with Vue's meaning, compiled to JavaScript for the Svelte runtime.
//!
//! svue reads the Vue plugin's artifacts ([`rsvelte_vue::Parsed`], [`rsvelte_vue::Lowered`],
//! [`rsvelte_vue::Resolved`]) and writes what the Svelte compiler reads: a runes instance program
//! and a Svelte HIR ([`Translation`]). [`rsvelte_svelte::computation::tasks::compile`] then lowers
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

mod context;
mod script;
mod template;

use std::marker::PhantomData;

use rsvelte_javascript::{NodeIdentifier, SyntaxTree};
use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::compilation::lower::{CompileInput, Target};

/// The component as the Svelte compiler reads it: a runes instance program and a Svelte HIR, in a
/// tree of their own over the `.vue` document's text.
#[derive(Debug)]
pub struct Translation {
    pub javascript: SyntaxTree,
    pub program: NodeIdentifier,
    pub compiler_syntax_tree: rsvelte_svelte::compilation::compiler_syntax_tree::CompilerSyntaxTree,
    /// Every template expression, in document order.
    pub template_expressions: Vec<NodeIdentifier>,
}

impl Translation {
    #[must_use]
    pub fn compile_input<'a>(&'a self, source_text: &'a str) -> CompileInput<'a> {
        CompileInput {
            javascript: &self.javascript,
            program: self.program,
            compiler_syntax_tree: &self.compiler_syntax_tree,
            style: None,
            template_expressions: &self.template_expressions,
            source_text,
            // Vue's text is already condensed; Svelte's cleaning would condense it again.
            preserve_whitespace: true,
        }
    }
}

/// Translates the Vue plugin's artifacts for one target.
///
/// # Errors
///
/// A `compile_unsupported` [`Diagnostic`] for what svue does not translate (the crate's doc lists
/// every refusal).
pub fn translate(
    sfc: &rsvelte_vue::syntax_tree::SingleFileComponent,
    compiler_syntax_tree: Option<&rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTree>,
    resolution: &rsvelte_vue::resolve::Resolution,
    source_text: &str,
    target: Target,
) -> Result<Translation, Diagnostic> {
    context::translate(sfc, compiler_syntax_tree, resolution, source_text, target)
}

/// One of the two targets, as a type, so each gets its own chain of artifacts.
pub trait Side: Send + Sync + 'static {
    const TARGET: Target;
    const TASK: &'static str;
    const TRANSLATED: &'static str;
    const RESOLVED: &'static str;
    const ANALYZED: &'static str;
}

#[derive(Debug)]
pub struct Client;

impl Side for Client {
    const ANALYZED: &'static str = "svue.analyze.client";
    const RESOLVED: &'static str = "svue.resolve.client";
    const TARGET: Target = Target::Client;
    const TASK: &'static str = "svue.compile/client";
    const TRANSLATED: &'static str = "svue.translate.client";
}

#[derive(Debug)]
pub struct Server;

impl Side for Server {
    const ANALYZED: &'static str = "svue.analyze.server";
    const RESOLVED: &'static str = "svue.resolve.server";
    const TARGET: Target = Target::Server;
    const TASK: &'static str = "svue.compile/server";
    const TRANSLATED: &'static str = "svue.translate.server";
}

/// The translation, or why there is none; `None` when the document did not parse (the error is
/// on [`rsvelte_vue::Parsed`]).
#[derive(Debug)]
pub struct Translated<S>(PhantomData<S>);

impl<S: Side> Artifact for Translated<S> {
    type Output = Option<Result<Translation, Diagnostic>>;

    const NAME: &'static str = S::TRANSLATED;

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let sfc = context.get::<rsvelte_vue::Parsed>().as_ref().ok()?;
        let compiler_syntax_tree = context.get::<rsvelte_vue::Lowered>().as_ref();
        let resolution = context.get::<rsvelte_vue::Resolved>().as_ref()?;
        Some(translate(
            sfc,
            compiler_syntax_tree,
            resolution,
            context.source_text(),
            S::TARGET,
        ))
    }
}

/// Svelte's name resolution over the translation.
#[derive(Debug)]
pub struct Resolved<S>(PhantomData<S>);

impl<S: Side> Artifact for Resolved<S> {
    type Output = Option<rsvelte_svelte::semantic::resolve::Resolution>;

    const NAME: &'static str = S::RESOLVED;

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let t = context.get::<Translated<S>>().as_ref()?.as_ref().ok()?;
        Some(rsvelte_svelte::semantic::resolve::resolve(
            &t.javascript,
            t.program,
            &t.compiler_syntax_tree,
        ))
    }
}

/// Svelte's analysis over the translation.
#[derive(Debug)]
pub struct Analyzed<S>(PhantomData<S>);

impl<S: Side> Artifact for Analyzed<S> {
    type Output = Option<rsvelte_svelte::semantic::analyze::Analysis>;

    const NAME: &'static str = S::ANALYZED;

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let t = context.get::<Translated<S>>().as_ref()?.as_ref().ok()?;
        let resolution = context.get::<Resolved<S>>().as_ref()?;
        Some(rsvelte_svelte::semantic::analyze::analyze(
            &t.compile_input(context.source_text()),
            resolution,
            &context.document.path,
        ))
    }
}

/// Registers svue's tasks on `.vue` documents, and the Vue plugin's artifacts they read (which
/// [`rsvelte_vue::register`] registers too; a second registration is a no-op).
pub fn register(reg: &mut Registry) {
    reg.artifact::<rsvelte_vue::Parsed>()
        .artifact::<rsvelte_vue::Lowered>()
        .artifact::<rsvelte_vue::Resolved>()
        .artifact::<Translated<Client>>()
        .artifact::<Resolved<Client>>()
        .artifact::<Analyzed<Client>>()
        .artifact::<Translated<Server>>()
        .artifact::<Resolved<Server>>()
        .artifact::<Analyzed<Server>>()
        .task(Compile::<Client>(PhantomData))
        .task(Compile::<Server>(PhantomData));
}

/// The module `svelte/compiler` would emit for the translation, for one target.
#[derive(Debug)]
pub struct Compile<S>(PhantomData<S>);

impl<S: Side> Task for Compile<S> {
    fn identifier(&self) -> &'static str {
        S::TASK
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        if let Err(e) = context.get::<rsvelte_vue::Parsed>() {
            out.diagnostics.push(e.clone());
            return;
        }
        let t = match context.get::<Translated<S>>() {
            Some(Ok(t)) => t,
            Some(Err(e)) => {
                out.diagnostics.push(e.clone());
                return;
            }
            None => unreachable!("a parsed component is translated"),
        };
        let resolution = context
            .get::<Resolved<S>>()
            .as_ref()
            .expect("a translation is resolved");
        let analysis = context
            .get::<Analyzed<S>>()
            .as_ref()
            .expect("a translation is analysed");
        match rsvelte_svelte::computation::tasks::compile(
            &t.compile_input(context.source_text()),
            resolution,
            analysis,
            S::TARGET,
        ) {
            Ok(javascript) => out.file("js", javascript),
            Err(d) => out.diagnostics.push(d),
        }
    }
}
