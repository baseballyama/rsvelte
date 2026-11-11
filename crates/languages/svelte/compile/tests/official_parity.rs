//! Single components compiled end to end, pinning the official compiler's output or diagnostic,
//! or rsvelte's documented deviation where the official output is an upstream bug. Printed code is
//! compared without whitespace unless the whitespace is the point.

use rsvelte_svelte_compile::{CompileInput, Target, compile_input};
use rsvelte_svelte_semantic::{analyze, compiler_syntax_tree, resolve};

#[path = "official_parity/const_tags.rs"]
mod const_tags;
#[path = "official_parity/derived.rs"]
mod derived;
#[path = "official_parity/errors.rs"]
mod errors;
#[path = "official_parity/exports.rs"]
mod exports;
#[path = "official_parity/lets.rs"]
mod lets;
#[path = "official_parity/patterns.rs"]
mod patterns;

/// The output, or the code of the diagnostic that refuses the source.
fn compile(source: &str, target: Target) -> Result<String, String> {
    compile_at(source, target).map_err(|(code, _)| code)
}

/// The output, or the error's code and where it is (UTF-8 bytes, which equal upstream's offsets
/// in ASCII).
fn compile_at(source: &str, target: Target) -> Result<String, (String, (u32, u32))> {
    let component = rsvelte_svelte_syntax::parse::parse(source).map_err(|error| {
        (
            error.code.to_string(),
            (error.span.start_offset, error.span.end_offset),
        )
    })?;
    let tree = compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "App.svelte");
    let resolution = resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input, &resolution);
    compile_input(&CompileInput::from(input), &resolution, &analysis, target).map_err(|error| {
        (
            error.code.to_string(),
            (error.span.start_offset, error.span.end_offset),
        )
    })
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
fn a_destructuring_assignment_writes_each_path_as_upstream_does() {
    for (script, client, server) in [
        (
            "let n = $state(0); [n] = [1];",
            "(($$value)=>{var$$array=$.to_array($$value,1);$.set(n,$$array[0],true);})([1]);",
            "[n]=[1];",
        ),
        (
            "let { p = $bindable(0) } = $props(); [p] = [1];",
            "(($$value)=>{var$$array=$.to_array($$value,1);p($$array[0]);})([1]);",
            "[p]=[1];",
        ),
        (
            "let { a = $bindable({}) } = $props(); [a.x] = [1];",
            "a(a().x=$$array[0],true);",
            "[a.x]=[1];",
        ),
        (
            "let { a = $bindable({}) } = $props(); ({ y: a.y } = { y: 2 });",
            "(($$value)=>{a(a().y=$$value.y,true);})({y:2});",
            "({y:a.y}={y:2});",
        ),
        (
            "let n = $state(0); function f() { [[n]] = [[1]]; }",
            "var$$array_1=$.to_array($$array[0],1);$.set(n,$$array_1[0],true);",
            "[[n]]=[[1]];",
        ),
        // The client's mutation of state counts as a rewrite, though it keeps the mutation.
        (
            "let s = $state([1, 2]); function f() { s = []; [s[0], s[1]] = [s[1], s[0]]; }",
            "$.get(s)[0]=$$array[0];$.get(s)[1]=$$array[1];})([$.get(s)[1],$.get(s)[0]]);",
            "[s[0],s[1]]=[s[1],s[0]];",
        ),
        // The server reads a derived through a call, which a pattern cannot assign.
        (
            "let d = $derived(1); function f() { [d] = [2]; }",
            "$.set(d,$$array[0]);",
            "(($$value)=>{var$$array=$.to_array($$value,1);d($$array[0]);})([2]);",
        ),
        (
            "let d = $derived(1); function f(o) { ({ d } = o); }",
            "functionf(o){$.set(d,o.d);}",
            "functionf(o){d(o.d);}",
        ),
    ] {
        let markup = if script.contains("$derived") {
            "<button onclick={f}>{d}</button>"
        } else {
            ""
        };
        let source = format!("<script>{script}</script>{markup}");
        for (target, expected) in [(Target::Client, client), (Target::Server, server)] {
            let compiled = squashed(&source, target);
            assert!(
                compiled.contains(expected),
                "{source} on {target:?}: {compiled}"
            );
        }
    }
    let store = "<script>import { writable } from 'svelte/store'; const a = writable(1); let b; \
                 function f() { [$a, b] = [1, 2]; }</script>";
    for target in [Target::Client, Target::Server] {
        let compiled = squashed(store, target);
        assert!(
            compiled.contains("$.store_set(a,$$array[0]);b=$$array[1];"),
            "{store} on {target:?}: {compiled}"
        );
    }
    let plain = "<script>let a = 1, b = 2; [a, b] = [b, a];</script>{a}{b}";
    assert!(squashed(plain, Target::Client).contains("[a,b]=[b,a]"));
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
    let source = "<script>import A from './A.svelte'; const g = () => 1; let f = () => 1; function \
        swap() { f = () => 2; } let d = $derived(g()); let e = $derived(f()); let l = \
        $derived(h()); const h = () => 3;</script><A a={f()} b={g()} t={$effect.tracking()} {d} \
        {e} {l} {swap} />";
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
                  function f() { a(); $effect(() => {}); b(); } switch (x) { case 1: $effect(() => \
                      {}); } \
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
    let source = "<script>export let a = 1;</script>";
    assert_eq!(
        compile(source, Target::Client),
        Err("unsupported".to_owned())
    );
}

/// esrap skips an empty statement only in a block or program body, not in a `switch` case.
#[test]
fn an_empty_statement_is_dropped_from_a_block_or_program_body() {
    let source = "<script>function f() { a();; b(); } ; if (x) ; switch (x) { case 1: ; default: ; \
        }</script>";
    assert!(
        squashed(source, Target::Client)
            .ends_with("functionf(){a();b();}if(x);switch(x){case1:;default:;}}"),
        "{}",
        compiled(source, Target::Client)
    );
}

#[test]
fn effect_tracking_is_read_inside_an_effect() {
    let source = "<script>import C from './C.svelte';</script><C t={$effect.tracking()} \
        /><p>{$effect.tracking()}</p>";
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
        ("<C><div slot=\"a\">x</div></C>", None),
        (
            "<C><div slot={x}>x</div></C>",
            Some("slot_attribute_invalid"),
        ),
        (
            "{#snippet s()}<div slot=\"a{x}\">x</div>{/snippet}",
            Some("slot_attribute_invalid"),
        ),
        (
            "<C><C slot=\"a\" /><p slot=\"a\">x</p></C>",
            Some("slot_attribute_duplicate"),
        ),
        (
            "<C><p slot=\"default\">x</p><!-- y --></C>",
            Some("slot_default_duplicate"),
        ),
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
fn a_bindable_prop_member_is_written_through_the_prop() {
    let source = "<script>import C from './C.svelte'; let { a = $bindable({}) } = $props(); \
        function f() { a.x = 1; a.x++; }</script><C bind:v={a.x} /><button onclick={f}>b</button>";
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
        "do{$$settled=true;$$inner_renderer=$$renderer.copy();$$render_inner($$inner_renderer);}wh\
            ile(!$$settled);",
    ] {
        assert!(server.contains(expected), "{expected} in {server}");
    }
}

#[test]
fn a_prop_proxies_where_upstream_reads_it_and_not_where_it_follows_the_default() {
    for (script, expected) in [
        (
            "let { d = null, c = $bindable(d) } = $props();",
            r#"c=$.prop($$props,"c",27,()=>$.proxy(d()));"#,
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
    let source = "<script module>let m = 1, n = 2;</script><script>let p = 1, q = 2; function f() \
        { let r = 1, s = 2; return r + s; }</script>{m}{n}{p}{q}{f()}";
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
            "<svg><svelte:element this={'g'}><a \
                href='x'>t</a></svelte:element><C><a>u</a></C></svg>",
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
fn a_scoped_custom_element_sets_its_class_on_the_client_only() {
    let source = "<my-el id=\"a\"></my-el><style>my-el { color: red; }</style>";
    assert!(squashed(source, Target::Client).contains("$.set_class(my_el,1,\"svelte-"));
    assert!(squashed(source, Target::Server).contains("<my-elid=\"a\"class=\"svelte-"));
}

#[test]
fn a_grouped_optional_chain_in_a_prop_is_a_member() {
    let source = "<script>import C from './C.svelte'; let { a } = $props();</script><C \
        x={(a?.b).c} y={a?.b} />";
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

/// Official 5.57.3 output reads a number key as `String(value)`, except that it excludes the
/// number itself from a rest object, whose string keys never match it; rsvelte excludes the name.
#[test]
fn a_number_props_key_reads_the_prop_its_string_names() {
    let source = "<script>let { 0: a, 0x10: b, 1.5: c = 1, \"x-y\": d, \"e\": e, ...rest } = \
        $props();</script>{a}{b}{c}{d}{e}{rest}";
    let client = squashed(source, Target::Client);
    for expected in [
        r#"newSet(["$$slots","$$events","$$legacy","0","16","1.5","x-y","e"])"#,
        "letc=$.prop($$props,1.5,3,1)",
        r#"${$$props["0"]??""}${$$props["16"]??""}${c()??""}${$$props["x-y"]??""}${$$props.e??""}"#,
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
