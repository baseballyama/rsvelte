//! Snippets and render tags: the errors of their names, arguments and placement.

use rsvelte_svelte_compile::Target;

use super::{compile, compile_at};

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
