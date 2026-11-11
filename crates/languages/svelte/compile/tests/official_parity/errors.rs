//! The official compiler's diagnostics, and the refusals that stand where it would compile.

use rsvelte_svelte_compile::Target;

use super::{compile, compile_at};

#[test]
fn a_directive_a_component_never_takes_raises_upstreams_error() {
    for attribute in [
        "class:x",
        "use:f",
        "transition:f",
        "animate:f",
        "style:color=\"red\"",
    ] {
        let source = format!(
            "<script>import C from './C.svelte'; function f() {{}}</script><C {attribute} />"
        );
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(&source, target),
                Err("component_invalid_directive".to_owned()),
                "{source} on {target:?}"
            );
        }
    }
}

#[test]
fn template_errors_come_from_the_template_on_both_targets() {
    let script = "<script>import A from './A.svelte'; let v = $state(1); let el;</script>";
    for (markup, expected) in [
        ("<A x={1} x={2} />", Some("attribute_duplicate")),
        (
            "<A value={1} bind:value={v} />",
            Some("attribute_duplicate"),
        ),
        ("<div x={1} x={2}></div>", Some("attribute_duplicate")),
        ("<div class:a class:a></div>", Some("attribute_duplicate")),
        (
            "<div style:color=\"red\" style:color=\"blue\"></div>",
            Some("attribute_duplicate"),
        ),
        ("<div class=\"a\" class:a></div>", None),
        (
            "<svelte:fragment slot=\"a\">x</svelte:fragment>",
            Some("svelte_fragment_invalid_placement"),
        ),
        (
            "<A>{#if v}<svelte:fragment slot=\"a\">x</svelte:fragment>{/if}</A>",
            Some("svelte_fragment_invalid_placement"),
        ),
        ("<button is=\"x-b\" class=\"a\">b</button>", None),
        ("<my-el a=\"1\"></my-el>", None),
        ("<div><my-el a=\"1\"></my-el></div>", None),
    ] {
        let source = format!("{script}{markup}");
        for target in [Target::Client, Target::Server] {
            let outcome = compile(&source, target).err();
            assert_eq!(outcome.as_deref(), expected, "{markup} on {target:?}");
        }
    }
}

#[test]
fn a_binding_needs_a_name_or_a_member_chain_on_both_targets() {
    let script = "<script>import C from './C.svelte'; let o = $state({}); function f() { return o; \
        }</script>";
    for (markup, expected) in [
        (
            "<input bind:value={o?.a} />",
            Some("bind_invalid_expression"),
        ),
        (
            "<input bind:value={(o?.a).b} />",
            Some("bind_invalid_expression"),
        ),
        ("<C bind:value={o?.a} />", Some("bind_invalid_expression")),
        ("<C bind:value={f()} />", Some("bind_invalid_expression")),
        ("<C bind:value={1} />", Some("bind_invalid_expression")),
        ("<input bind:value={o.a} />", None),
        ("<C bind:value={o.a} />", None),
    ] {
        let source = format!("{script}{markup}");
        for target in [Target::Client, Target::Server] {
            let outcome = compile(&source, target).err();
            assert_eq!(outcome.as_deref(), expected, "{markup} on {target:?}");
        }
    }
}

#[test]
fn a_constant_cannot_be_assigned_or_bound_whatever_declares_it() {
    let script = "<script>import C from './C.svelte'; import x from './x.js'; const s = $state(0); \
        const r = $state.raw(0); const c = 1; let n = $state(0); let items = $state([{}]);";
    for (body, expected) in [
        ("</script><C bind:value={s} />", Some("constant_binding")),
        (
            "</script><input bind:value={r} />",
            Some("constant_binding"),
        ),
        (
            "</script><input bind:value={x} />",
            Some("constant_binding"),
        ),
        (
            "function f() { s = 1; }</script>",
            Some("constant_assignment"),
        ),
        (
            "function f() { s++; }</script>",
            Some("constant_assignment"),
        ),
        (
            "function f() { [n, c] = [1, 2]; }</script>",
            Some("constant_assignment"),
        ),
        (
            "function f() { ({ a: x } = {}); }</script>",
            Some("constant_assignment"),
        ),
        (
            "</script><button onclick={() => c++}>{c}</button>",
            Some("constant_assignment"),
        ),
        (
            "</script>{#each items as item, i}<button onclick={() => i++}>{i}</button>{/each}",
            Some("constant_assignment"),
        ),
        (
            "</script>{#each items as item}<input bind:value={item} />{/each}",
            Some("each_item_invalid_assignment"),
        ),
        (
            "</script>{#each items as item}<button onclick={() => item++}>{item}</button>{/each}",
            Some("each_item_invalid_assignment"),
        ),
        (
            "function f() { n = 1; s.a = 1; }</script><input bind:value={n} />",
            None,
        ),
        // Upstream does not look into a default, so this compiles to a runtime TypeError.
        ("function f() { [c = 1] = []; }</script>", None),
        (
            "</script>{#each items as item}<input bind:value={item.a} />{/each}",
            None,
        ),
    ] {
        let source = format!("{script}{body}");
        for target in [Target::Client, Target::Server] {
            let outcome = compile(&source, target).err();
            assert_eq!(outcome.as_deref(), expected, "{body} on {target:?}");
        }
    }
}

#[test]
fn assignment_errors_come_in_document_order_after_the_binding_checks() {
    let script = "<script>import C from './C.svelte'; const s = $state(0); let n = $state(0);";
    for (body, expected) in [
        (
            "function f() { s = 1; }</script><input bind:value={s} />",
            "constant_assignment",
        ),
        (
            "</script><input bind:value={s} /><button onclick={() => s++}>x</button>",
            "constant_binding",
        ),
        (
            "</script><button onclick={() => s++}>x</button><C bind:value={s} />",
            "constant_assignment",
        ),
        ("</script><div bind:foo={s}></div>", "unsupported"),
        (
            "</script><input bind:value={s} /><C bind:value={nope} />",
            "constant_binding",
        ),
        ("</script><C bind:value={nope} />", "bind_invalid_value"),
        ("</script><input bind:value={nope} />", "bind_invalid_value"),
        (
            "</script><input bind:value={n} /><p>{$nope}</p>",
            "global_reference_invalid",
        ),
    ] {
        let source = format!("{script}{body}");
        for target in [Target::Client, Target::Server] {
            let outcome = compile(&source, target).err();
            assert_eq!(outcome.as_deref(), Some(expected), "{body} on {target:?}");
        }
    }
}

#[test]
fn a_destructured_rune_raises_upstreams_error_on_both_targets() {
    for (source, expected) in [
        (
            "<script>let { a } = $derived();</script>",
            "rune_invalid_arguments_length",
        ),
        (
            "<script>let { a } = $state({ a: 1 }); const c = 1; c = 2;</script>",
            "constant_assignment",
        ),
    ] {
        for target in [Target::Client, Target::Server] {
            let outcome = compile(source, target).err();
            assert_eq!(outcome.as_deref(), Some(expected), "{source} on {target:?}");
        }
    }
}

#[test]
fn a_reserved_or_legacy_name_raises_upstreams_error_on_both_targets() {
    for (source, code) in [
        (
            "<script>let $y = 1;</script><p>{$y}</p>",
            Some("dollar_prefix_invalid"),
        ),
        (
            "<script>let $ = 1;</script>",
            Some("dollar_binding_invalid"),
        ),
        (
            "<script>function f() { function g() { let $z; } }</script>",
            Some("dollar_prefix_invalid"),
        ),
        (
            "<script>const f = function $g() {};</script>",
            Some("dollar_prefix_invalid"),
        ),
        (
            "<script>try {} catch ($e) {}</script>",
            Some("dollar_prefix_invalid"),
        ),
        (
            "<script module>function f() { try {} catch ($e) {} }</script>",
            Some("dollar_prefix_invalid"),
        ),
        (
            "<script>import $a from './a';</script>",
            Some("dollar_prefix_invalid"),
        ),
        ("<p>{$$props.x}</p>", Some("legacy_props_invalid")),
        ("<p>{$$restProps.x}</p>", Some("legacy_rest_props_invalid")),
        // A name the scope does not check waits for the analysis walk, after `$$props`.
        (
            "<script>function f() { let $z; }</script><p>{$$props.x}</p>",
            Some("legacy_props_invalid"),
        ),
        (
            "<script>function f() { try {} catch ($e) {} }</script>",
            None,
        ),
        ("<script>const c = class $C {};</script>", None),
        (
            "<script lang=\"ts\">import { type $T } from './a';</script>",
            None,
        ),
        ("<script>const f = ($p) => $p;</script>", None),
        ("{#each [1] as $x}{$x}{/each}", None),
        // The name of a function expression is at the depth of the function around it.
        (
            "<script>function g() { const f = function $x() {}; }</script>",
            None,
        ),
        (
            "<script>function g() { class $C {} }</script>",
            Some("dollar_prefix_invalid"),
        ),
        (
            "<script lang=\"ts\">import type { $T } from './t';</script>",
            None,
        ),
        // Upstream erases a `declare`d `$a`, so `{$a}` subscribes to a store named `a`.
        (
            "<script lang=\"ts\">declare const $a: string;</script>{$a}",
            Some("global_reference_invalid"),
        ),
        (
            "<script lang=\"ts\">import { writable } from 'svelte/store'; const a = writable(1); \
                declare const $a: number;</script>{$a}",
            None,
        ),
    ] {
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(source, target).err().as_deref(),
                code,
                "{source} on {target:?}"
            );
        }
    }
}

/// Acorn rejects these at parse time; oxc finds them in its semantic check.
#[test]
fn a_semantic_syntax_error_fails_the_compile_on_both_targets() {
    for source in [
        "<script>let a = 1; let a = 2;</script>",
        "<script>function f(a = 1) { 'use strict'; }</script>",
    ] {
        for target in [Target::Client, Target::Server] {
            let code = compile(source, target).err();
            assert!(code.is_some(), "{source} on {target:?} compiled");
        }
    }
}

#[test]
fn a_snippet_or_render_tag_raises_upstreams_error_where_upstream_does() {
    let props = "<script>let { a, xs, call } = $props();</script>";
    let component = "<script>import C from './C.svelte'; let v = $state(1);</script>";
    for (source, expected) in [
        (
            format!("{props}{{@render a(...xs)}}"),
            Some(("render_tag_invalid_spread_argument", (59, 64))),
        ),
        (
            format!("{props}{{@render a.call(null)}}"),
            Some(("render_tag_invalid_call_expression", (48, 70))),
        ),
        (
            format!("{props}{{@render a?.apply(null, [])}}"),
            Some(("render_tag_invalid_call_expression", (48, 76))),
        ),
        // Upstream also rejects a computed `a[call]`, which reads a variable, not `call`.
        (format!("{props}{{@render a[call]()}}"), None),
        (format!("{props}{{@render a[\"call\"]()}}"), None),
        (
            "<script>let x = 1;</script>{#snippet x()}a{/snippet}".to_owned(),
            Some(("declaration_duplicate", (37, 38))),
        ),
        (
            "<script>import x from './x.js';</script>{#snippet x()}a{/snippet}".to_owned(),
            None,
        ),
        (
            "<script lang=\"ts\">type x = number;</script>{#snippet x()}a{/snippet}".to_owned(),
            None,
        ),
        (
            format!("{component}<C foo={{1}}>{{#snippet foo()}}a{{/snippet}}</C>"),
            Some(("snippet_shadowing_prop", (74, 101))),
        ),
        (
            format!("{component}<C bind:foo={{v}}>{{#snippet foo()}}a{{/snippet}}</C>"),
            Some(("snippet_shadowing_prop", (79, 106))),
        ),
        (
            format!("{component}<C>{{#snippet children()}}a{{/snippet}}text</C>"),
            Some(("snippet_conflict", (66, 98))),
        ),
        (
            format!("{component}<C>{{#snippet children()}}a{{/snippet}} <!-- c --> </C>"),
            None,
        ),
        (
            "{#snippet a(...xs)}a{/snippet}".to_owned(),
            Some(("snippet_invalid_rest_parameter", (12, 17))),
        ),
    ] {
        for target in [Target::Client, Target::Server] {
            let actual = compile_at(&source, target).err();
            let actual = actual.as_ref().map(|(code, span)| (code.as_str(), *span));
            assert_eq!(actual, expected, "{source} on {target:?}");
        }
    }
}

/// An error's code and the range it points at.
type Raised = Option<(&'static str, (u32, u32))>;

/// Each source with the error upstream raises for it, if any.
const SNIPPET_NAME_CASES: &[(&str, Raised)] = &[
    (
        "{#snippet a()}<p>1</p>{/snippet}{#snippet a()}<p>2</p>{/snippet}",
        Some(("declaration_duplicate", (42, 43))),
    ),
    (
        "<div>{#snippet a()}1{/snippet}{#snippet a()}2{/snippet}</div>",
        Some(("declaration_duplicate", (40, 41))),
    ),
    (
        "{#if 1}{#snippet a()}1{/snippet}{#snippet a()}2{/snippet}{/if}",
        Some(("declaration_duplicate", (42, 43))),
    ),
    (
        "<script>let { items } = $props();</script>{#each items as row}{#snippet \
            row()}x{/snippet}{/each}",
        Some(("declaration_duplicate", (72, 75))),
    ),
    (
        "<script>let { items } = $props();</script>{#each items as item, i}{#snippet \
            i()}x{/snippet}{/each}",
        Some(("declaration_duplicate", (76, 77))),
    ),
    (
        "{#snippet s(x)}{#snippet x()}y{/snippet}{/snippet}",
        Some(("declaration_duplicate", (25, 26))),
    ),
    (
        "{#snippet s({x})}{#snippet x()}y{/snippet}{/snippet}",
        Some(("declaration_duplicate", (27, 28))),
    ),
    (
        "<script>let { p } = $props();</script>{#await p then v}{#snippet \
            v()}x{/snippet}{/await}",
        Some(("declaration_duplicate", (53, 54))),
    ),
    (
        "<script>import C from \"./C.svelte\";</script><C let:a>{#snippet \
            a()}x{/snippet}</C>",
        Some(("declaration_duplicate", (63, 64))),
    ),
    (
        "<script lang=\"ts\">declare let x: number;</script>{#snippet \
        x()}a{/snippet}",
        None,
    ),
    (
        "<script>import a from \"./a.js\";</script>{#snippet \
        a()}<p>1</p>{/snippet}",
        None,
    ),
    (
        "<script module>const a = 1;</script>{#snippet a()}<p>1</p>{/snippet}",
        None,
    ),
    (
        "{#snippet a()}1{/snippet}{#if 1}{#snippet a()}2{/snippet}{@render a()}{/if}{@render \
        a()}",
        None,
    ),
    ("{#snippet a(a)}{a}{/snippet}{@render a(1)}", None),
    (
        "{#snippet a()}{#snippet a()}2{/snippet}{@render a()}{/snippet}{@render \
        a()}",
        None,
    ),
    (
        "{#snippet s(x)}<div>{#snippet x()}y{/snippet}</div>{/snippet}",
        None,
    ),
    (
        "{#if 1}{#snippet a()}1{/snippet}{:else}{#snippet a()}2{/snippet}{/if}",
        None,
    ),
    (
        "<script>let x = 1; let { a, xs } = $props();</script>{#snippet x()}{@render \
            a(...xs)}{/snippet}",
        Some(("render_tag_invalid_spread_argument", (78, 83))),
    ),
    (
        "<script>import C from \"./C.svelte\"; let { a, xs } = $props();</script><C \
            foo={1}>{#snippet foo()}{@render a(...xs)}{/snippet}</C>",
        Some(("render_tag_invalid_spread_argument", (108, 113))),
    ),
    (
        "<script module>export { s };</script><script>let v = $state(1);</script>{#snippet \
            s()}<p>{v}</p>{/snippet}",
        Some(("snippet_invalid_export", (24, 25))),
    ),
    (
        "<script module>export { a };</script><script>let { name } = \
            $props();</script>{#snippet a()}{@render b()}{/snippet}{#snippet \
            b()}{name}{/snippet}",
        Some(("snippet_invalid_export", (24, 25))),
    ),
    (
        "<script module>export { s };</script>{#snippet s()}<p>x</p>{/snippet}",
        None,
    ),
    (
        "<script module>export { s };</script><div>{#snippet s()}x{/snippet}</div>",
        Some(("snippet_invalid_export", (24, 25))),
    ),
    (
        "{#snippet s(x)}<input bind:value={x} />{/snippet}",
        Some(("snippet_parameter_assignment", (22, 36))),
    ),
    (
        "<script>let $$a = 1; let { a, xs } = $props();</script>{@render a(...xs)}",
        Some(("dollar_prefix_invalid", (12, 15))),
    ),
];

#[test]
fn a_snippet_name_raises_upstreams_error_where_upstream_does_in_its_order() {
    for &(source, expected) in SNIPPET_NAME_CASES {
        for target in [Target::Client, Target::Server] {
            let actual = compile_at(source, target).err();
            let actual = actual.as_ref().map(|(code, span)| (code.as_str(), *span));
            assert_eq!(actual, expected, "{source} on {target:?}");
        }
    }
}

#[test]
fn a_snippet_upstream_declares_beside_a_let_of_its_name_is_refused_on_the_server() {
    // Upstream's server output declares both in the component's function, which does not parse.
    for (source, server) in [
        (
            "<script>let { label } = $props();</script><p>{#snippet label()}x{/snippet}{@render \
                label()}</p>",
            Some("unsupported"),
        ),
        (
            "<script>class label {}</script><p><b>{#snippet label()}x{/snippet}{@render \
                label()}</b></p>",
            Some("unsupported"),
        ),
        (
            "<script>import label from './l.js';</script><p>{#snippet label()}x{/snippet}{@render \
                label()}</p>",
            None,
        ),
        (
            "<script>let { label } = $props();</script>{#if 1}{#snippet \
                label()}x{/snippet}{@render label()}{/if}",
            None,
        ),
    ] {
        assert_eq!(compile(source, Target::Client).err(), None, "{source}");
        assert_eq!(
            compile(source, Target::Server).err().as_deref(),
            server,
            "{source}"
        );
    }
}

#[test]
fn a_store_subscription_raises_upstreams_error_where_upstream_does() {
    let store = "import { writable } from 'svelte/store'; const a = writable(1);";
    for (source, expected) in [
        (
            format!("<script module>{store} console.log($a);</script>"),
            Some(("store_invalid_subscription", (91, 93))),
        ),
        (
            format!("<script>{store} function f(a) {{ return $a; }}</script>"),
            Some(("store_invalid_scoped_subscription", (95, 97))),
        ),
        (
            format!("<script>{store}</script>{{#each [1] as a}}{{$a}}{{/each}}"),
            Some(("store_invalid_scoped_subscription", (97, 99))),
        ),
        (
            "<script>let x = $y;</script>".to_owned(),
            Some(("global_reference_invalid", (16, 18))),
        ),
        (
            "<p>{$}</p>".to_owned(),
            Some(("global_reference_invalid", (4, 5))),
        ),
        (
            "<p>{$$x}</p>".to_owned(),
            Some(("global_reference_invalid", (4, 7))),
        ),
        ("<p>{$Foo}</p>".to_owned(), None),
        (format!("<script>{store}</script><p>{{$a}}</p>"), None),
    ] {
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile_at(&source, target).err(),
                expected.map(|(code, span)| (code.to_owned(), span)),
                "{source} on {target:?}"
            );
        }
    }
}

#[test]
fn a_binding_upstream_rejects_on_its_element_is_refused_on_both_targets() {
    for element in [
        "<input bind:checked={x} />",
        "<input type=\"radio\" bind:checked={x} />",
        "<input type={t} bind:checked={x} />",
        "<input type bind:value={x} />",
        "<input bind:files={x} />",
        "<div bind:value={x}></div>",
        "<div bind:innerHTML={x}></div>",
        "<div contenteditable={t} bind:textContent={x}></div>",
        "<select multiple={t} bind:value={x}></select>",
        "<svg bind:offsetWidth={x}></svg>",
        "<div bind:nope={x}></div>",
        "<input type=\"radio\" bind:group={() => x, (v) => (x = v)} />",
        "{#snippet s(y)}<input type=\"radio\" bind:group={y} />{/snippet}",
    ] {
        let source = format!("<script>let x = $state(); let t = $state();</script>{element}");
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(&source, target),
                Err("unsupported".to_owned()),
                "{source} on {target:?}"
            );
        }
    }
}

#[test]
fn textarea_content_beside_a_value_is_textarea_invalid_content_on_both_targets() {
    let script = "<script>let a = 1;</script>\n";
    for (markup, expected) in [
        (
            "<div><textarea value=\"x\">a</textarea></div>",
            Some((33, 65)),
        ),
        // The parser has moved this content into a second `value`.
        ("<textarea value=\"x\">{a} b</textarea>", Some((28, 64))),
        ("<textarea>{a} b</textarea>", None),
    ] {
        let source = format!("{script}{markup}");
        for target in [Target::Client, Target::Server] {
            let actual = compile_at(&source, target).err();
            let actual = actual.as_ref().map(|(code, span)| (code.as_str(), *span));
            assert_eq!(
                actual,
                expected.map(|span| ("textarea_invalid_content", span)),
                "{markup} on {target:?}"
            );
        }
    }
}
