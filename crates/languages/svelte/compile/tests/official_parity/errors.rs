//! The official compiler's diagnostics, and the refusals that stand where it would compile.

use rsvelte_svelte_compile::Target;

use super::compile;

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
fn each_component_attribute_not_lowered_yet_is_refused_on_both_targets() {
    for attribute in [
        "bind:this={c}",
        "bind:group={c}",
        "{@attach f}",
        "on:click={f}",
        "let:x",
        "--color=\"red\"",
        "slot=\"x\"",
    ] {
        let source = format!(
            "<script>import C from './C.svelte'; let c; function f() {{}}</script><C {attribute} />"
        );
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(&source, target),
                Err("unsupported".to_owned()),
                "{source} on {target:?}"
            );
        }
    }
    let children = "<script>import C from './C.svelte';</script><C children={1}>a</C>";
    for target in [Target::Client, Target::Server] {
        assert_eq!(
            compile(children, target),
            Err("unsupported".to_owned()),
            "{target:?}"
        );
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
        (
            "<button is=\"x-b\" class=\"a\">b</button>",
            Some("unsupported"),
        ),
        ("<button is=\"x-b\">b</button>", None),
        ("<my-el></my-el>", None),
        ("<my-el a=\"1\"></my-el>", Some("unsupported")),
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
    let script = "<script>import C from './C.svelte'; let o = $state({}); function f() { return o; }</script>";
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
    let script = "<script>import C from './C.svelte'; import x from './x.js'; const s = $state(0); const r = $state.raw(0); const c = 1; let n = $state(0); let items = $state([{}]);";
    for (body, expected) in [
        ("</script><C bind:value={s} />", Some("constant_binding")),
        (
            "</script><input bind:value={r} />",
            Some("constant_binding"),
        ),
        // A binding this port does not lower is refused before upstream's error is raised.
        ("</script><input bind:value={x} />", Some("unsupported")),
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
            Some("unsupported"),
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
fn a_destructured_rune_is_refused_only_when_upstream_raises_nothing() {
    for (source, expected) in [
        (
            "<script>let { a } = $derived();</script>",
            "rune_invalid_arguments_length",
        ),
        (
            "<script>let { a } = $state({ a: 1 }); const c = 1; c = 2;</script>",
            "constant_assignment",
        ),
        (
            "<script>let { a } = $state({ a: 1 });</script>{a}",
            "unsupported",
        ),
        (
            "<script>let [a] = $derived.by(() => [1]);</script>{a}",
            "unsupported",
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
