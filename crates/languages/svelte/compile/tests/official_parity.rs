//! Single components compiled end to end, pinning the official compiler's output or diagnostic,
//! or rsvelte's documented deviation where the official output is an upstream bug. Printed code is
//! compared without whitespace unless the whitespace is the point.

use rsvelte_svelte_compile::{CompileInput, Target, compile_input};
use rsvelte_svelte_semantic::{analyze, compiler_syntax_tree, resolve};

/// The output, or the code of the diagnostic that refuses the source.
fn compile(source: &str, target: Target) -> Result<String, String> {
    let component =
        rsvelte_svelte_syntax::parse::parse(source).map_err(|error| format!("{error:?}"))?;
    let tree = compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "App.svelte");
    let resolution = resolve::resolve_with_module(
        &component.javascript,
        component.program,
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input, &resolution);
    compile_input(&CompileInput::from(input), &resolution, &analysis, target)
        .map_err(|error| error.code.to_string())
}

fn compiled(source: &str, target: Target) -> String {
    compile(source, target).unwrap_or_else(|error| panic!("{source} on {target:?}: {error}"))
}

/// The output without whitespace, so that a test does not depend on the printer's layout.
fn squashed(source: &str, target: Target) -> String {
    compiled(source, target)
        .chars()
        .filter(|c| !c.is_whitespace())
        .collect()
}

#[test]
fn a_destructuring_assignment_is_refused_where_the_target_reads_a_signal() {
    for script in [
        "let n = $state(0); [n] = [1];",
        "let { p = $bindable(0) } = $props(); [p] = [1];",
        "let { a = $bindable({}) } = $props(); [a.x] = [1];",
        "let { a = $bindable({}) } = $props(); ({ y: a.y } = { y: 2 });",
        "let n = $state(0); function f() { [[n]] = [[1]]; }",
    ] {
        let source = format!("<script>{script}</script>");
        assert_eq!(
            compile(&source, Target::Client),
            Err("unsupported".to_owned()),
            "{source}"
        );
        compiled(&source, Target::Server);
    }
    // The server reads a derived through a call, which a pattern cannot assign.
    for script in [
        "let d = $derived(1); function f() { [d] = [2]; }",
        "let d = $derived(1); function f(o) { ({ d } = o); }",
        "let d = $derived.by(() => 1); function f() { [d] = [2]; }",
    ] {
        let source = format!("<script>{script}</script><button onclick={{f}}>{{d}}</button>");
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(&source, target),
                Err("unsupported".to_owned()),
                "{source} on {target:?}"
            );
        }
    }
    let plain = "<script>let a = 1, b = 2; [a, b] = [b, a];</script>{a}{b}";
    assert!(squashed(plain, Target::Client).contains("[a,b]=[b,a]"));
}

/// Upstream splits each into one declaration per path, which this port does not do yet.
#[test]
fn a_loop_head_that_assigns_a_signal_is_refused_on_both_targets() {
    for script in [
        "let n = $state(0); n = 2; function f() { for (n of [1]) {} }",
        "let n = $state(0); n = 2; function f() { for (n in {}) {} }",
        "let n = $state(0); n = 2; function f() { for ({ n } of [{}]) {} }",
        "let { p } = $props(); function f() { for (p of [1]) {} }",
        "let n = $state(0); let d = $derived(n); function f() { for (d of [1]) {} }",
        "let { a = $bindable() } = $props(); function f() { for (a.x of [1]) {} }",
    ] {
        let source = format!("<script>{script}</script>");
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(&source, target).err().as_deref(),
                Some("unsupported"),
                "{source} on {target:?}"
            );
        }
    }
    for script in [
        "let x = 0; function f() { for (x of [1]) {} }",
        "let o = {}; function f() { for (o.k in {}) {} }",
        "let n = $state(0); function f() { for (const n of [1]) {} }",
    ] {
        let source = format!("<script>{script}</script>");
        compiled(&source, Target::Client);
        compiled(&source, Target::Server);
    }
}

#[test]
fn a_derived_keeps_its_arrow_only_when_the_callee_may_change() {
    let source = "<script>import A from './A.svelte'; const g = () => 1; let f = () => 1; function swap() { f = () => 2; } let d = $derived(g()); let e = $derived(f()); let l = $derived(h()); const h = () => 3;</script><A a={f()} b={g()} t={$effect.tracking()} {d} {e} {l} {swap} />";
    let client = squashed(source, Target::Client);
    for expected in [
        "letd=$.derived(g);",
        "lete=$.derived(()=>f());",
        "letl=$.derived(()=>h());",
        "let$0=$.derived(()=>f());",
        "let$1=$.derived(g);",
        "let$2=$.derived($.effect_tracking);",
    ] {
        assert!(client.contains(expected), "{expected} in {client}");
    }
    let server = squashed(source, Target::Server);
    for expected in [
        "letd=$.derived(g);",
        "lete=$.derived(()=>f());",
        "letl=$.derived(()=>h());",
    ] {
        assert!(server.contains(expected), "{expected} in {server}");
    }
}

#[test]
fn effect_tracking_is_read_inside_an_effect() {
    let source = "<script>import C from './C.svelte';</script><C t={$effect.tracking()} /><p>{$effect.tracking()}</p>";
    let client = squashed(source, Target::Client);
    assert!(client.contains("gett()"), "{client}");
    assert!(
        !client.contains("textContent=$.effect_tracking()"),
        "{client}"
    );
}

#[test]
fn only_svg_outside_an_svg_text_drops_whitespace_between_nodes() {
    for (markup, client, server) in [
        (
            "<math> <mi>x</mi> <mo>+</mo> </math>\n<p>a</p>",
            "$.from_html(`<math><mi>x</mi> <mo>+</mo></math> <p>a</p>`",
            "<math><mi>x</mi> <mo>+</mo></math> <p>a</p>",
        ),
        (
            "<math><mi>x</mi></math>\n<C />",
            "$.from_mathml(`<math><mi>x</mi></math> <!>`",
            "<math><mi>x</mi></math> ",
        ),
        (
            "{#if x}<div></div>{/if}\n<svg></svg>",
            "$.from_html(`<!> <svg></svg>`",
            "<!--]--> <svg></svg>",
        ),
        (
            "<svg><text><tspan>a</tspan> <tspan>b</tspan></text></svg>",
            "<tspan>a</tspan> <tspan>b</tspan>",
            "<tspan>a</tspan> <tspan>b</tspan>",
        ),
        (
            "{#if x}<svg></svg> <C />{/if}",
            "$.from_svg(`<svg></svg><!>`",
            "<!--[0--><svg></svg>`",
        ),
    ] {
        let source =
            format!("<script>import C from './C.svelte'; let x = $state(1);</script>\n{markup}\n");
        assert!(
            compiled(&source, Target::Client).contains(client),
            "{markup} on the client"
        );
        assert!(
            compiled(&source, Target::Server).contains(server),
            "{markup} on the server"
        );
    }
}

#[test]
fn an_await_while_rendering_needs_async_mode() {
    for (source, error) in [
        (
            "<script>let a = await Promise.resolve(1);</script>{a}",
            true,
        ),
        ("<script>let a = 1;</script>{await a}", true),
        // Upstream prints this `for await` into the component function, which is not async.
        ("<script>for await (const a of []) {}</script>", true),
        (
            "<script>async function f() { for await (const a of []) {} }</script>",
            false,
        ),
        ("<script>async function f() { await 1; }</script>", false),
        ("<script module>await Promise.resolve();</script>", false),
    ] {
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(source, target).err().as_deref() == Some("experimental_async"),
                error,
                "{source} on {target:?}"
            );
        }
    }
}

#[test]
fn a_byte_order_mark_is_no_text() {
    assert!(squashed("\u{feff}<p>a</p>", Target::Server).contains("`<p>a</p>`"));
}

#[test]
fn an_optional_global_member_is_not_folded() {
    for (markup, kept) in [
        ("<p>{Math?.PI}</p>", "Math?.PI"),
        ("<p>{Math.max?.(1, 2)}</p>", "Math.max?.(1,2)"),
    ] {
        assert!(squashed(markup, Target::Client).contains(kept), "{markup}");
    }
}

#[test]
fn a_grouped_optional_chain_is_neither_pure_nor_safe() {
    for markup in [
        "<p>{(Math?.PI).toFixed()}</p>",
        "<p>{(Math?.max)(1, 2)}</p>",
    ] {
        let client = squashed(markup, Target::Client);
        assert!(client.contains("$.push($$props,true);"), "{client}");
        assert!(client.contains("$.template_effect(($0)=>"), "{client}");
        let server = squashed(markup, Target::Server);
        assert!(
            server.contains("$$renderer.component(($$renderer)=>"),
            "{server}"
        );
    }
}

#[test]
fn each_component_attribute_not_lowered_yet_is_refused_on_both_targets() {
    for attribute in [
        "bind:this={c}",
        "bind:group={c}",
        "bind:v={1}",
        "{@attach f}",
        "class:x",
        "on:click={f}",
        "use:f",
        "transition:f",
        "animate:f",
        "style:color=\"red\"",
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
fn a_bindable_prop_member_is_written_through_the_prop() {
    let source = "<script>import C from './C.svelte'; let { a = $bindable({}) } = $props(); function f() { a.x = 1; a.x++; }</script><C bind:v={a.x} /><button onclick={f}>b</button>";
    let client = squashed(source, Target::Client);
    for expected in [
        "a(a().x=1,true);",
        "a(a().x++,true);",
        "getv(){returna().x;}",
        "setv($$value){a(a().x=$$value,true);}",
    ] {
        assert!(client.contains(expected), "{expected} in {client}");
    }
    let server = squashed(source, Target::Server);
    for expected in [
        "a.x=1;a.x++;",
        "getv(){returna.x;}",
        "setv($$value){a.x=$$value;$$settled=false;}",
        "do{$$settled=true;$$inner_renderer=$$renderer.copy();$$render_inner($$inner_renderer);}while(!$$settled);",
    ] {
        assert!(server.contains(expected), "{expected} in {server}");
    }
}

#[test]
fn only_the_instance_splits_a_declaration_into_one_per_declarator() {
    let source = "<script module>let m = 1, n = 2;</script><script>let p = 1, q = 2; function f() { let r = 1, s = 2; return r + s; }</script>{m}{n}{p}{q}{f()}";
    for target in [Target::Client, Target::Server] {
        let output = squashed(source, target);
        for expected in ["letm=1,n=2;", "letp=1;letq=2;", "letr=1,s=2;"] {
            assert!(
                output.contains(expected),
                "{expected} on {target:?} in {output}"
            );
        }
    }
}

#[test]
fn an_element_takes_its_namespace_from_its_name_when_a_fragment_is_inferred() {
    for (markup, templates) in [
        (
            "<svg><C><div></div></C></svg>",
            &["$.from_html(`<div></div>`)", "$.from_svg(`<svg><!></svg>`)"][..],
        ),
        (
            "<svg>{#if x}<circle />{:else}<div></div>{/if}</svg>",
            &[
                "$.from_svg(`<circle></circle>`)",
                "$.from_html(`<div></div>`)",
            ],
        ),
        (
            "<svg><svelte:element this={'g'}><a href='x'>t</a></svelte:element><C><a>u</a></C></svg>",
            &["$.from_svg(`<ahref=\"x\">t</a>`)", "$.from_svg(`<a>u</a>`)"],
        ),
    ] {
        let source = format!("<script>import C from './C.svelte'; let x = true;</script>{markup}");
        let client = squashed(&source, Target::Client);
        for template in templates {
            assert!(client.contains(template), "{template} in {client}");
        }
    }
}

#[test]
fn a_grouped_optional_chain_in_a_prop_is_a_member() {
    let source = "<script>import C from './C.svelte'; let { a } = $props();</script><C x={(a?.b).c} y={a?.b} />";
    let client = squashed(source, Target::Client);
    for expected in [
        "let$0=$.derived(()=>$$props.a?.b);",
        "getx(){return($$props.a?.b).c;}",
        "gety(){return$.get($0);}",
    ] {
        assert!(client.contains(expected), "{expected} in {client}");
    }
    assert!(squashed(source, Target::Server).contains("x:(a?.b).c,y:a?.b"));
}
