//! Single components compiled end to end, pinning the official compiler's output or diagnostic,
//! or rsvelte's documented deviation where the official output is an upstream bug. Printed code is
//! compared without whitespace unless the whitespace is the point.

use rsvelte_svelte_compile::{CompileInput, Target, compile_input};
use rsvelte_svelte_semantic::{analyze, compiler_syntax_tree, resolve};

/// The output, or the code of the diagnostic that refuses the source.
fn compile(source: &str, target: Target) -> Result<String, String> {
    let component =
        rsvelte_svelte_syntax::parse::parse(source).map_err(|error| error.code.to_string())?;
    let tree = compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "App.svelte");
    let resolution = resolve::resolve_with_module(
        &component.javascript,
        source,
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
fn a_destructured_state_or_derived_is_refused_on_both_targets() {
    for script in [
        "const { a, b: c } = $state({ a: 1, b: 2 });",
        "let [x] = $state.raw([1]);",
        "const { a } = $derived({ a: 1 });",
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
}

/// Upstream prints such a head as invalid JavaScript (`for ($.get(n) of xs)`, `for (d() of xs)`).
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
fn a_keyframe_step_scopes_no_element() {
    for step in ["0%", "from"] {
        let source =
            format!("<div>a</div><style>@keyframes fade {{ {step} {{ opacity: 0; }} }}</style>");
        assert!(
            squashed(&source, Target::Server).contains("<div>a</div>"),
            "{source}"
        );
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

/// Official 5.57.3 output for each statement position an effect can take.
#[test]
fn the_server_empties_an_effect_wherever_a_statement_stands() {
    let source = "<script>let x = 1; if (x) $effect(() => {}); else $effect.pre(() => {}); \
                  for (;;) $effect(() => {}); while (x) $effect(() => {}); l: $effect(() => {}); \
                  function f() { a(); $effect(() => {}); b(); } switch (x) { case 1: $effect(() => {}); } \
                  $effect(() => {});</script>";
    assert!(
        squashed(source, Target::Server).ends_with(
            "letx=1;if(x);else;for(;;);while(x);l:;functionf(){a();b();}switch(x){case1:;}});}"
        ),
        "{}",
        compiled(source, Target::Server)
    );
}

/// Official 5.57.3 output: an instance export is returned on the client and bound on the server.
#[test]
fn an_instance_export_is_returned_and_bound() {
    for (script, client, server) in [
        (
            "export const p = $props();",
            "constp=$.rest_props($$props,rest_excludes);var$$exports={p};",
            "const{$$slots,$$events,...p}=$$props;",
        ),
        (
            "let n = $state(0); export function f() { n++; } export const a = 1, b = 2;",
            "var$$exports={f,a,b};",
            "$.bind_props($$props,{f,a,b});}",
        ),
    ] {
        let source = format!("<script>{script}</script>{{n}}");
        let client_output = squashed(&source, Target::Client);
        assert!(client_output.contains(client), "{client_output}");
        assert!(
            client_output.contains("return$.pop($$exports);"),
            "{client_output}"
        );
        let server_output = squashed(&source, Target::Server);
        assert!(server_output.contains(server), "{server_output}");
        assert!(
            server_output.contains("($$renderer,$$props)"),
            "{server_output}"
        );
    }
    for script in [
        "export class K {}",
        "export let a = 1;",
        "export const { a } = o;",
    ] {
        let source = format!("<script>{script}</script>");
        assert_eq!(
            compile(&source, Target::Client),
            Err("unsupported".to_owned())
        );
    }
}

/// esrap skips an empty statement only in a block or program body, not in a `switch` case.
#[test]
fn an_empty_statement_is_dropped_from_a_block_or_program_body() {
    let source = "<script>function f() { a();; b(); } ; if (x) ; switch (x) { case 1: ; default: ; }</script>";
    assert!(
        squashed(source, Target::Client)
            .ends_with("functionf(){a();b();}if(x);switch(x){case1:;default:;}}"),
        "{}",
        compiled(source, Target::Client)
    );
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
        // Only HTML whitespace collapses; a no-break space is text.
        (
            "<svg><rect/>\u{a0}<rect/></svg>",
            "$.from_svg(`<svg><rect></rect>\u{a0}<rect></rect></svg>`",
            "<svg><rect></rect>\u{a0}<rect></rect></svg>",
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
fn a_slot_attribute_needs_a_component_parent_or_a_custom_element() {
    let script = "<script>import C from './C.svelte'; let x = $state(1);</script>";
    for (markup, expected) in [
        (
            "<C>{#if x}<div slot=\"a\">x</div>{/if}</C>",
            Some("slot_attribute_invalid_placement"),
        ),
        (
            "<div slot=\"a\">x</div>",
            Some("slot_attribute_invalid_placement"),
        ),
        ("<C><div slot=\"a\">x</div></C>", Some("unsupported")),
        ("<my-element><div slot=\"a\">x</div></my-element>", None),
    ] {
        let source = format!("{script}{markup}");
        for target in [Target::Client, Target::Server] {
            let outcome = compile(&source, target);
            match expected {
                Some(code) => assert_eq!(outcome, Err(code.to_owned()), "{markup} on {target:?}"),
                None => assert_ne!(
                    outcome,
                    Err("slot_attribute_invalid_placement".to_owned()),
                    "{markup} on {target:?}"
                ),
            }
        }
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
fn a_prop_proxies_where_upstream_reads_it_and_not_where_it_follows_the_default() {
    for (script, expected) in [
        (
            "let { d = null, c = $bindable(d) } = $props();",
            "c=$.prop($$props,'c',27,()=>$.proxy(d()));",
        ),
        (
            "let { d = null } = $props(); let s = $state(d);",
            "lets=$.proxy(d());",
        ),
        (
            "let { d = null } = $props(); let s = $state(0); function f() { s = d; }",
            "$.set(s,d());",
        ),
    ] {
        let source = format!("<script>{script}</script>{{s}}{{c}}");
        let client = squashed(&source, Target::Client);
        assert!(client.contains(expected), "{expected} in {client}");
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
fn a_scoped_custom_element_is_refused_on_the_client_only() {
    let source = "<my-el></my-el><style>my-el { color: red; }</style>";
    assert_eq!(
        compile(source, Target::Client),
        Err("unsupported".to_owned())
    );
    assert!(squashed(source, Target::Server).contains("<my-elclass=\"svelte-"));
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

/// Official 5.57.3 output reads a number key as `String(value)`, except that it excludes the
/// number itself from a rest object, whose string keys never match it; rsvelte excludes the name.
#[test]
fn a_number_props_key_reads_the_prop_its_string_names() {
    let source = "<script>let { 0: a, 0x10: b, 1.5: c = 1, \"x-y\": d, \"e\": e, ...rest } = $props();</script>{a}{b}{c}{d}{e}{rest}";
    let client = squashed(source, Target::Client);
    for expected in [
        "newSet(['$$slots','$$events','$$legacy','0','16','1.5','x-y','e'])",
        "letc=$.prop($$props,1.5,3,1)",
        "${$$props['0']??''}${$$props['16']??''}${c()??''}${$$props['x-y']??''}${$$props.e??''}",
    ] {
        assert!(client.contains(expected), "{expected} in {client}");
    }
}

#[test]
fn a_typescript_this_parameter_is_erased_from_a_component() {
    let source = "<script lang=\"ts\">function f(this: Window, e: Event) { return e; } f;</script>";
    for target in [Target::Client, Target::Server] {
        let code = squashed(source, target);
        assert!(code.contains("functionf(e){"), "{target:?}: {code}");
    }
}
