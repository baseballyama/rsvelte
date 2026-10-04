use rsvelte_typescript::SyntaxTree;

use super::*;
use crate::helpers;

/// The module for one target, or the refusal's message.
fn run(source_text: &str, server: bool) -> Result<String, String> {
    let c = rsvelte_svelte::syntax::parse::parse(source_text).map_err(|d| d.message)?;
    let compiler_syntax_tree =
        rsvelte_svelte::compilation::compiler_syntax_tree::lower(&c, source_text);
    let resolution =
        rsvelte_svelte::semantic::resolve::resolve(&c.javascript, c.program, &compiler_syntax_tree);
    let analysis = rsvelte_svelte::semantic::analyze::analyze(
        &rsvelte_svelte::svelte_input(&c, &compiler_syntax_tree, source_text, "A.svelte"),
        &resolution,
    );
    let plan = check(&c, &compiler_syntax_tree, &resolution, source_text).map_err(|d| d.message)?;
    let t = translate(
        &c,
        &compiler_syntax_tree,
        &resolution,
        &analysis,
        &plan,
        source_text,
        server,
        "A.svelte",
    )
    .map_err(|d| d.message)?;
    compile(&t, source_text, "A.svelte").map_err(|d| d.message)
}

fn both(source_text: &str) -> (String, String) {
    let client = run(source_text, false).unwrap_or_else(|e| panic!("{source_text}: {e}"));
    let server = run(source_text, true).unwrap_or_else(|e| panic!("{source_text}: {e}"));
    (client, server)
}

#[test]
fn every_helper_parses() {
    use helpers::Helper::*;
    let mut to = SyntaxTree::new();
    let all = [
        Each,
        EachServer,
        Attribute,
        AttributeServer,
        BooleanServer,
        Stringify,
        NodeValue,
        Clsx,
        Class,
        ToClass,
        SetClass,
        Attributes,
        Spread,
        Fail,
        Value,
        Once,
        Select,
        Option,
        ScopedClass,
        Style,
        RawMarkup,
        Lifecycle,
        Await,
        NumberBinding,
        Group,
        PropertyBinding,
        MediaBinding,
        ResizeBinding,
        FormReset,
        ClassSpread,
        ComponentProps,
        Transition,
        Animate,
        Boundary,
        CustomElementData,
    ];
    assert!(!helpers::declarations(&all, &mut to).is_empty());
}

#[test]
fn runes_become_refs_and_props_read_through_define_props() {
    let (client, _) = both(
        "<script>\n\tlet { a, b = 1 } = $props();\n\tlet n = $state(b);\n\
         \tlet d = $derived(n * 2);\n\tlet r = $state.raw([]);\n</script>\n\
         <button onclick={() => n++}>{a} {d} {r.length}</button>",
    );
    for want in [
        "customRef as $$createState, shallowRef as $$shallowRef, computed as $$createDerived",
        "$$v_defineVaporComponent({ inheritAttrs: false, props: { a: {}, \
         b: { default: 1 } }",
        "const $$props = __props;",
        "const n = $$ref($$props.b);",
        "const d = $$computed(() => n.value * 2);",
        "const r = $$shallowRef([]);",
        "'click', () => n.value++",
        // `n * 2` is a number: Svelte's chunk leaves out `?? ''` where it proves a value
        // defined.
        "${$$props.a ?? ''}",
        "${d.value}",
        "${r.value.length ?? ''}",
    ] {
        assert!(client.contains(want), "{want}\n{client}");
    }
}

#[test]
fn text_follows_each_runtime() {
    let source_text = "<script>\n\tlet x = $state(null);\n</script>\n\
               <p onclick={() => (x = 1)}>{x}</p><p>{JSON.stringify(1)}</p>";
    let (client, server) = both(source_text);
    assert!(client.contains("`${x.value ?? ''}`"), "{client}");
    assert!(client.contains("$$node(JSON.stringify(1))"), "{client}");
    assert!(
        server.contains("$$escape(String(x.value ?? ''))"),
        "{server}"
    );
}

#[test]
fn bindings_run_svelte_effects_on_the_client_and_print_on_the_server() {
    let source_text = "<script>\n\tlet s = $state('');\n\tlet c = $state(false);\n</script>\n\
               <input bind:value={s} /><input type=\"checkbox\" bind:checked={c} />";
    let (client, server) = both(source_text);
    assert!(
        client.contains("s.value !== $$el.value && ($$el.value = s.value ?? '')"),
        "{client}"
    );
    assert!(
        client.contains("$$el.checked = Boolean(c.value)"),
        "{client}"
    );
    assert!(
        server.contains("$$attribute('value', $$attr(s.value))"),
        "{server}"
    );
    assert!(
        server.contains("$$attribute('checked', $$bool(c.value))"),
        "{server}"
    );
}

#[test]
fn class_removes_the_attribute_when_empty() {
    let (client, server) =
        both("<script>\n\tlet on = $state(false);\n</script>\n<p class={{ on }}>x</p>");
    assert!(
        client.contains("'class', $$class({ on: on.value })"),
        "{client}"
    );
    assert!(
        server.contains("$$attribute('class', $$class({ on: on.value }))"),
        "{server}"
    );
}

#[test]
fn a_spread_is_one_object_for_svelte_set_attributes_or_attributes() {
    let source_text = "<script>\n\tlet { a, ...rest } = $props();\n</script>\n\
               <p class={['x', a]} {...rest} hidden>t</p>";
    let (client, server) = both(source_text);
    assert!(
        client.contains("const $$attrs = $$rest_props($$useAttrs());"),
        "{client}"
    );
    assert!(
        client.contains(
            "$$attributes($$el, { 'class': ['x', $$props.a], ...$$v_unref($$attrs), \
             'hidden': true })"
        ),
        "{client}"
    );
    assert!(
        server.contains(
            "$$attributes_text($$spread({ 'class': $$sclsx(['x', $$props.a]), \
             ...$$v_unref($$attrs), 'hidden': true }))"
        ),
        "{server}"
    );
}

#[test]
fn server_branches_and_each_render_spreads() {
    let source_text = "<script>\n\tlet { ...rest } = $props();\n\tlet on = $state(true);\n\
               \tlet xs = $state([1]);\n</script>\n\
               <button onclick={() => (on = !on)}>b</button>\n\
               {#if on}<b {...rest}>on</b>{/if}\n\
               {#each xs as x (x)}<i {...rest}>{x}</i>{/each}";
    let (_, server) = both(source_text);
    for want in [
        "on.value ?",
        "$$each(xs.value).map((x) =>",
        "$$attributes_text($$spread({ ...$$v_unref($$attrs) }))",
    ] {
        assert!(server.contains(want), "{want}\n{server}");
    }
}

#[test]
fn class_directives_are_to_class_of_the_value_and_the_directives() {
    let source_text = "<script>\n\tlet on = $state(true);\n</script>\n\
               <p class=\"a b\" class:b={on} class:c-d={!on}>x</p>";
    let (client, server) = both(source_text);
    assert!(
        client.contains("$$set_class($$el, 'a b', { 'b': on.value, 'c-d': !on.value })"),
        "{client}"
    );
    assert!(
        server.contains(
            "$$attribute('class', $$to_class('a b', { 'b': on.value, 'c-d': !on.value }))"
        ),
        "{server}"
    );
}

#[test]
fn load_and_error_elements_carry_the_server_event_marks() {
    let (_, server) = both("<img src=\"a.png\" onload={() => {}} />");
    assert!(server.contains("onload=\"this.__e=event\""), "{server}");
    let (_, server) = both("<img {...{ src: 'a.png' }} />");
    assert!(server.contains("['onload', 'onerror']"), "{server}");
}

#[test]
fn table_parts_alone_in_their_template_are_kept() {
    for source_text in [
        "<tr><td>x</td></tr>",
        "{#if true}<tr><td>a</td></tr>{:else}<tr><td>b</td></tr>{/if}",
        "<p>&amp;&lt;&#42;&#x2a; a & b &#;</p>",
    ] {
        run(source_text, false).expect(source_text);
    }
}

#[test]
fn client_uses_vapor_blocks_and_resolves_loop_aliases_by_binding() {
    let (client, _) = both(
        "<script>let xs = $state([{ id: 1 }]);</script>\
         {#each xs as x, i (x.id)}<p>{i}: {x.id} {xs.map((x) => x.id).join(',')}</p>{/each}",
    );
    assert!(
        client.contains("$$v_createFor(() => $$each(xs.value)"),
        "{client}"
    );
    assert!(client.contains("${i.value}"), "{client}");
    assert!(client.contains("${x.value.id ?? ''}"), "{client}");
    assert!(client.contains("xs.value.map((x) => x.id)"), "{client}");
    assert!(client.contains("(x, i) => x.id"), "{client}");
    assert!(
        !client.contains("createElementVNode") && !client.contains("openBlock"),
        "{client}"
    );
}

#[test]
fn vapor_bindings_dispose_with_their_scope() {
    let client = run(
        "<script>let el = $state(); let on = $state(true);</script>\
         {#if on}<p bind:this={el}>x</p>{:else if !on}<b>y</b>{:else}<i>z</i>{/if}",
        false,
    )
    .unwrap();
    assert!(client.contains("$$v_onScopeDispose("), "{client}");
    assert!(client.contains("el.value = $$el"), "{client}");
    assert_eq!(client.matches("$$v_createIf(").count(), 2, "{client}");
}

#[test]
fn vapor_boolean_bindings_use_dom_property_names() {
    let client = run(
        "<script>let locked = $state(false);</script><input readonly={locked} />\
         <form novalidate={locked}><button formnovalidate={locked}>x</button></form>\
         <img ismap={locked} />",
        false,
    )
    .unwrap();
    for property in ["readOnly", "noValidate", "formNoValidate", "isMap"] {
        assert!(
            client.contains(&format!("'{property}', Boolean(locked.value)")),
            "{client}"
        );
    }
}

#[test]
fn refusals_name_their_reason() {
    let cases: &[(&str, &str)] = &[
        (
            "<svelte:options customElement='invalid-slot' /><script>let slot = \
             $state();</script><slot bind:this={slot} />",
            "slot_element_invalid_attribute",
        ),
        (
            "<svelte:options customElement='invalid-slot' /><slot name={'named'} />",
            "slot_element_invalid_name",
        ),
        (
            "<svelte:options customElement='invalid-slot' /><slot name='default' />",
            "slot_element_invalid_name_default",
        ),
        (
            "<script>\n\timport { beforeUpdate } from 'svelte';\n</script>",
            "this import from",
        ),
        (
            "<script>\n\tlet Object = 1;\n</script>",
            "a binding named `Object`",
        ),
        ("<input {...{}} />", "a spread attribute on <input>"),
        ("<p a=\"1\" {...{}} a=\"2\"></p>", "attribute_duplicate"),
    ];
    for (source_text, want) in cases {
        let got = run(source_text, false).expect_err(source_text);
        assert!(got.contains(want), "{source_text}: {got}");
    }
}

#[test]
fn refusals_where_svelte_reads_the_source_differently() {
    let cases: &[(&str, &str)] = &[
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
    for (source_text, want) in cases {
        let got = run(source_text, false).expect_err(source_text);
        assert!(got.contains(want), "{source_text}: {got}");
    }
}
