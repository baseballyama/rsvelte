//! vuelte: a `.svelte` component, with Svelte's meaning, compiled to JavaScript for the Vue
//! runtime.
//!
//! A plugin that registers tasks on another plugin's language and owns only a translation. The
//! Svelte plugin's artifacts ([`rsv_svelte::Parsed`], [`rsv_svelte::Normalized`],
//! [`rsv_svelte::Resolved`], [`rsv_svelte::Analyzed`]) are computed once per document and shared
//! with `svelte.compile` and the other Svelte tasks; this crate turns them into a Vue
//! `<script setup>` program ([`script`]) and a Vue template HIR ([`template`]), and the Vue
//! plugin's [`rsv_vue::resolve::resolve`] and [`rsv_vue::compile::compile`] turn those into what
//! `@vitejs/plugin-vue` emits for a production build. [`check`] runs once for both targets;
//! [`translate`] builds one module per target (`vuelte.compile/client`, `/server`), because
//! Svelte's client and server runtimes differ where Vue's do not (a client binding is an effect on
//! the element, a server one is markup).
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

pub mod helpers;
pub mod script;
pub mod template;

use rsv_js::{Ast, NodeId};
use rsv_kernel::db::{Artifact, Ctx};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Registry, Task, TaskOutput};
use rsv_kernel::source::Span;
use rsv_svelte::analyze::Analysis;
use rsv_svelte::ast::Component;
use rsv_svelte::hir::Hir;
use rsv_svelte::resolve::Resolution;

/// The translated component: one JavaScript tree holding the `<script setup>` program and every
/// template expression, and the template's Vue HIR.
#[derive(Debug)]
pub struct Translation {
    pub js: Ast,
    pub script: NodeId,
    pub hir: rsv_vue::hir::Hir,
}

type R<T> = Result<T, Diagnostic>;

fn unsupported(what: impl std::fmt::Display, span: Span) -> Diagnostic {
    Diagnostic::error(
        "vuelte_unsupported",
        format!("not supported by vuelte: {what}"),
        span,
    )
}

/// The checks that do not depend on the target: everything [`translate`] refuses for both.
///
/// # Errors
///
/// A `vuelte_unsupported` [`Diagnostic`] for a construct outside the mapping.
pub fn check(c: &Component, hir: &Hir, res: &Resolution, src: &str) -> R<script::Plan> {
    if let Some(style) = &c.style {
        return Err(unsupported("a <style>", style.span));
    }
    if let Some(t) = c.js.ts_runtime.first() {
        return Err(unsupported("TypeScript with runtime semantics", t.span));
    }
    template::check(hir, &c.js, res, &c.template_exprs, src)?;
    script::plan(c, res, src)
}

/// Translates a checked component for the client (`server: false`) or the server.
///
/// # Errors
///
/// A `vuelte_unsupported` [`Diagnostic`] for a construct outside the mapping.
pub fn translate(
    c: &Component,
    hir: &Hir,
    res: &Resolution,
    an: &Analysis,
    plan: &script::Plan,
    src: &str,
    server: bool,
) -> R<Translation> {
    let mut to = Ast::new();
    let input = template::Input {
        hir,
        res,
        an,
        js: &c.js,
        src,
        plan,
        server,
    };
    let t = template::build(input, &mut to)?;
    let script = script::emit(c, res, plan, &t.helpers, &mut to);
    Ok(Translation {
        js: to,
        script,
        hir: t.hir,
    })
}

/// The Vue plugin's compile of a [`Translation`]: `@vitejs/plugin-vue`'s production module.
///
/// # Errors
///
/// The Vue port's refusal, as a `vuelte_unsupported` [`Diagnostic`].
pub fn compile(t: &Translation, src: &str, path: &str) -> R<String> {
    let res = rsv_vue::resolve::resolve(&t.js, t.script, Some(&t.hir), src);
    let input = rsv_vue::compile::CompileInput {
        js: &t.js,
        script: Some(t.script),
        hir: Some(&t.hir),
        styles: Vec::new(),
        ts: false,
        src,
    };
    rsv_vue::compile::compile(&input, &res, path)
        .map(|o| o.js)
        .map_err(|u| unsupported(format_args!("the Vue compiler: {}", u.what), u.span()))
}

/// [`check`] on the Svelte plugin's artifacts, shared by both targets.
#[derive(Debug)]
pub struct Checked;

impl Artifact for Checked {
    type Output = R<script::Plan>;

    const NAME: &'static str = "vuelte.check";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let c = ctx
            .get::<rsv_svelte::Parsed>()
            .as_ref()
            .map_err(Clone::clone)?;
        let hir = ctx
            .get::<rsv_svelte::Normalized>()
            .as_ref()
            .expect("a parsed component is lowered to HIR");
        let res = ctx
            .get::<rsv_svelte::Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let _p = metrics::phase("vuelte.check");
        check(c, hir, res, ctx.src())
    }
}

pub fn register(reg: &mut Registry) {
    reg.artifact::<Checked>()
        .task(Compile { server: false })
        .task(Compile { server: true });
}

/// The module the behavioural oracle mounts with `createApp` (client) or renders with
/// `renderToString(createSSRApp(…))` (server).
#[derive(Debug)]
pub struct Compile {
    pub server: bool,
}

impl Compile {
    fn module(&self, ctx: &Ctx<'_>) -> R<String> {
        let plan = ctx.get::<Checked>().as_ref().map_err(Clone::clone)?;
        let c = ctx
            .get::<rsv_svelte::Parsed>()
            .as_ref()
            .map_err(Clone::clone)?;
        let hir = ctx
            .get::<rsv_svelte::Normalized>()
            .as_ref()
            .expect("a parsed component is lowered to HIR");
        let res = ctx
            .get::<rsv_svelte::Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let an = ctx
            .get::<rsv_svelte::Analyzed>()
            .as_ref()
            .expect("a parsed component is analysed");
        let t = {
            let _p = metrics::phase("vuelte.translate");
            translate(c, hir, res, an, plan, ctx.src(), self.server)?
        };
        let _p = metrics::phase("vuelte.vue");
        compile(&t, ctx.src(), &ctx.doc.path)
    }
}

impl Task for Compile {
    fn id(&self) -> &'static str {
        if self.server {
            "vuelte.compile/server"
        } else {
            "vuelte.compile/client"
        }
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svelte"
    }

    fn run(&self, ctx: &Ctx<'_>, out: &mut TaskOutput) {
        match self.module(ctx) {
            Ok(js) => out.file("js", js),
            Err(d) => out.diagnostics.push(d),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The module for one target, or the refusal's message.
    fn run(src: &str, server: bool) -> Result<String, String> {
        let c = rsv_svelte::parse::parse(src).map_err(|d| d.message)?;
        let hir = rsv_svelte::hir::lower(&c, src);
        let res = rsv_svelte::resolve::resolve(&c.js, c.program, &hir);
        let an = rsv_svelte::analyze::analyze(
            &rsv_svelte::svelte_input(&c, &hir, src),
            &res,
            "A.svelte",
        );
        let plan = check(&c, &hir, &res, src).map_err(|d| d.message)?;
        let t = translate(&c, &hir, &res, &an, &plan, src, server).map_err(|d| d.message)?;
        compile(&t, src, "A.svelte").map_err(|d| d.message)
    }

    fn both(src: &str) -> (String, String) {
        let client = run(src, false).unwrap_or_else(|e| panic!("{src}: {e}"));
        let server = run(src, true).unwrap_or_else(|e| panic!("{src}: {e}"));
        (client, server)
    }

    #[test]
    fn every_helper_parses() {
        use helpers::Helper::*;
        let mut to = Ast::new();
        let all = [
            Each, EachServer, Attr, AttrServer, BoolServer, Stringify, NodeValue, Clsx, Class,
            ToClass, SetClass, Attributes, Spread, Fail, Value, Once, Select, Option,
        ];
        assert_eq!(helpers::declarations(&all, &mut to).len(), 34);
    }

    #[test]
    fn runes_become_refs_and_props_read_through_define_props() {
        let (client, _) = both(
            "<script>\n\tlet { a, b = 1 } = $props();\n\tlet n = $state(b);\n\
             \tlet d = $derived(n * 2);\n\tlet r = $state.raw([]);\n</script>\n\
             <button onclick={() => n++}>{a} {d} {r.length}</button>",
        );
        for want in [
            "import { ref as $$ref, shallowRef as $$shallowRef, computed as $$computed } \
             from 'vue';",
            "Object.assign({ inheritAttrs: false }, { __name: 'A', props: { a: {}, \
             b: { default: 1 } }",
            "const $$props = __props;",
            "const n = $$ref($$props.b);",
            "const d = $$computed(() => n.value * 2);",
            "const r = $$shallowRef([]);",
            "onClick: _cache[0] || (_cache[0] = () => n.value++)",
            // `n * 2` is a number: Svelte's chunk leaves out `?? ''` where it proves a value
            // defined.
            "_toDisplayString(`${$$props.a ?? ''}`) + ' ' + _toDisplayString(`${d.value}`) + ' ' + \
             _toDisplayString(`${r.value.length ?? ''}`)",
        ] {
            assert!(client.contains(want), "{want}\n{client}");
        }
    }

    #[test]
    fn text_follows_each_runtime() {
        let src = "<script>\n\tlet x = $state(null);\n</script>\n\
                   <p onclick={() => (x = 1)}>{x}</p><p>{JSON.stringify(1)}</p>";
        let (client, server) = both(src);
        assert!(
            client.contains("_toDisplayString(`${x.value ?? ''}`)"),
            "{client}"
        );
        assert!(
            client.contains("_toDisplayString($$node(JSON.stringify(1)))"),
            "{client}"
        );
        assert!(
            server.contains("_toDisplayString(String(x.value ?? ''))"),
            "{server}"
        );
    }

    #[test]
    fn bindings_run_svelte_effects_on_the_client_and_print_on_the_server() {
        let src = "<script>\n\tlet s = $state('');\n\tlet c = $state(false);\n</script>\n\
                   <input bind:value={s} /><input type=\"checkbox\" bind:checked={c} />";
        let (client, server) = both(src);
        assert!(
            client.contains("s.value !== $$el.value && ($$el.value = s.value ?? '')"),
            "{client}"
        );
        assert!(
            client.contains("$$el.checked = Boolean(c.value)"),
            "{client}"
        );
        assert!(
            !client.contains("checked:") && !client.contains("value:"),
            "{client}"
        );
        assert!(server.contains("value: $$attr(s.value)"), "{server}");
        assert!(server.contains("checked: $$bool(c.value)"), "{server}");
    }

    #[test]
    fn class_removes_the_attribute_when_empty() {
        let (client, server) =
            both("<script>\n\tlet on = $state(false);\n</script>\n<p class={{ on }}>x</p>");
        for js in [&client, &server] {
            assert!(js.contains("CLASS: $$class({ on: on.value })"), "{js}");
        }
    }

    #[test]
    fn a_spread_is_one_object_for_svelte_set_attributes_or_attributes() {
        let src = "<script>\n\tlet { a, ...rest } = $props();\n</script>\n\
                   <p class={['x', a]} {...rest} hidden>t</p>";
        let (client, server) = both(src);
        assert!(client.contains("const $$attrs = $$useAttrs();"), "{client}");
        assert!(
            client.contains(
                "$$attributes($$el, { 'class': ['x', $$props.a], ..._unref($$attrs), \
                 'hidden': true })"
            ),
            "{client}"
        );
        // compiler-core's single `v-bind="obj"`, as compiler-sfc 3.5.43 prints it.
        assert!(
            server.contains(
                "_createElementBlock('p', _normalizeProps(_guardReactiveProps($$spread({ \
                 'class': $$sclsx(['x', $$props.a]), ..._unref($$attrs), 'hidden': true }))), \
                 't', 16)"
            ),
            "{server}"
        );
    }

    #[test]
    fn a_spread_in_a_branch_or_an_each_merges_the_key_as_compiler_core_does() {
        let src = "<script>\n\tlet { ...rest } = $props();\n\tlet on = $state(true);\n\
                   \tlet xs = $state([1]);\n</script>\n\
                   <button onclick={() => (on = !on)}>b</button>\n\
                   {#if on}<b {...rest}>on</b>{/if}\n\
                   {#each xs as x (x)}<i {...rest}>{x}</i>{/each}";
        let (_, server) = both(src);
        for want in [
            "_normalizeProps(_mergeProps({ key: 0 }, $$spread({ ..._unref($$attrs) })))",
            "_mergeProps({ key: x }, { ref_for: true }, $$spread({ ..._unref($$attrs) }))",
        ] {
            assert!(server.contains(want), "{want}\n{server}");
        }
    }

    #[test]
    fn class_directives_are_to_class_of_the_value_and_the_directives() {
        let src = "<script>\n\tlet on = $state(true);\n</script>\n\
                   <p class=\"a b\" class:b={on} class:c-d={!on}>x</p>";
        let (client, server) = both(src);
        assert!(
            client.contains("$$set_class($$el, 'a b', { 'b': on.value, 'c-d': !on.value })"),
            "{client}"
        );
        assert!(
            server.contains("CLASS: $$to_class('a b', { 'b': on.value, 'c-d': !on.value })"),
            "{server}"
        );
    }

    #[test]
    fn load_and_error_elements_carry_the_server_event_marks() {
        let (_, server) = both("<img src=\"a.png\" onload={() => {}} />");
        assert!(server.contains("onload: 'this.__e=event'"), "{server}");
        let (_, server) = both("<img {...{ src: 'a.png' }} />");
        assert!(server.contains("['onload', 'onerror']"), "{server}");
    }

    #[test]
    fn table_parts_alone_in_their_template_are_kept() {
        for src in [
            "<tr><td>x</td></tr>",
            "{#if true}<tr><td>a</td></tr>{:else}<tr><td>b</td></tr>{/if}",
            "<p>&amp;&lt;&#42;&#x2a; a & b &#;</p>",
        ] {
            run(src, false).expect(src);
        }
    }

    #[test]
    fn refusals_name_their_reason() {
        let cases: &[(&str, &str)] = &[
            (
                "<script>\n\tlet x = $state(0);\n\t$effect(() => {});\n</script>",
                "`$effect`",
            ),
            (
                "<script>\n\timport { tick } from 'svelte';\n</script>",
                "an import other than one `onMount`",
            ),
            (
                "<script>\n\tlet { a } = $props();\n\ta = 1;\n</script>",
                "writing or mutating a prop",
            ),
            (
                "<script>\n\tlet d = $derived(1);\n\td = 2;\n</script>",
                "assigning a `$derived`",
            ),
            (
                "<script>\n\tlet { A } = $props();\n</script>",
                "the prop name `A`",
            ),
            (
                "<script>\n\tlet n = 0;\n</script>\n<button onclick={() => n++}>{n}</button>",
                "changes without being reactive",
            ),
            (
                "<script>\n\tconst m = new Map();\n</script>",
                "a `new` expression",
            ),
            (
                "<script>\n\tlet Object = 1;\n</script>",
                "a binding named `Object`",
            ),
            ("<p>{window.x}</p>", "the global `window`"),
            ("<p>{Math.random()}</p>", "changes on every read"),
            (
                "<p hidden={true}>x</p>",
                "a dynamic `hidden` attribute on <p>",
            ),
            (
                "<input checked={true} />",
                "a dynamic `checked` attribute on <input>",
            ),
            ("{#if true}a{/if}", "not exactly one element"),
            ("<pre>\nx</pre>", "starts with a newline"),
            ("<svelte:window />", "the element <svelte:window>"),
            ("<div ontouchstart={() => {}}></div>", "passive event"),
            (
                "<script>\n\tfunction f() { this.x = 1; }\n</script>\n\
                 <button onclick={f}></button>",
                "does not read `this`",
            ),
            (
                "<script>\n\tlet v = $state(0);\n</script>\n\
                 <input type=\"number\" bind:value={v} />",
                "`bind:value` on this <input>",
            ),
            (
                "<script>\n\tlet v = $state('');\n</script>\n\
                 <form><input bind:value={v} /><button type=\"reset\"></button></form>",
                "reset a form",
            ),
            ("<style>p { color: red }</style><p>x</p>", "a <style>"),
            ("<div {@attach (n) => {}}></div>", "an {@attach} tag"),
            ("<input {...{}} />", "a spread attribute on <input>"),
            (
                "<p {...{}} onclick={() => {}}></p>",
                "an event attribute beside a spread attribute",
            ),
            (
                "<p {...{}} class:x={true}></p>",
                "beside a spread attribute",
            ),
            ("<p a=\"1\" {...{}} a=\"2\"></p>", "attribute_duplicate"),
            (
                "<script>\n\tlet { ...rest } = $props();\n</script>\n<p title={rest.t}></p>",
                "other than as a spread attribute",
            ),
            (
                "<script>\n\tlet { ...rest } = $props();\n\tconsole.log(rest);\n</script>",
                "other than spread in the template",
            ),
            (
                "<script>\n\timport { onMount } from 'svelte';\n\
                 \tonMount(() => () => {});\n</script>",
                "may return a value",
            ),
        ];
        for (src, want) in cases {
            let got = run(src, false).expect_err(src);
            assert!(got.contains(want), "{src}: {got}");
        }
    }

    #[test]
    fn refusals_where_svelte_reads_the_source_differently() {
        let cases: &[(&str, &str)] = &[
            ("<p>&copy;</p>", "a character reference"),
            ("<p title=\"&quot x\">y</p>", "a character reference"),
            ("<p>&#128;</p>", "a character reference"),
            ("<p>&#10;</p>", "a character reference"),
            ("<div>a</div><tr><td>x</td></tr>", "a <tr> outside"),
            ("<p>a</p><body></body>", "the element <body>"),
            (
                "<select><option><b>a</b></option></select>",
                "rich content in <option>",
            ),
            (
                "<script>\n\tvar t = 1;\n\tvar t = 2;\n</script>\n{t}",
                "a name declared twice",
            ),
        ];
        for (src, want) in cases {
            let got = run(src, false).expect_err(src);
            assert!(got.contains(want), "{src}: {got}");
        }
    }
}
