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
        &rsvelte_svelte::svelte_input(&c, &compiler_syntax_tree, source_text),
        &resolution,
        "A.svelte",
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
    let source_text = "<script>\n\tlet x = $state(null);\n</script>\n\
               <p onclick={() => (x = 1)}>{x}</p><p>{JSON.stringify(1)}</p>";
    let (client, server) = both(source_text);
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
    for javascript in [&client, &server] {
        assert!(
            javascript.contains("CLASS: $$class({ on: on.value })"),
            "{javascript}"
        );
    }
}

#[test]
fn a_spread_is_one_object_for_svelte_set_attributes_or_attributes() {
    let source_text = "<script>\n\tlet { a, ...rest } = $props();\n</script>\n\
               <p class={['x', a]} {...rest} hidden>t</p>";
    let (client, server) = both(source_text);
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
    let source_text = "<script>\n\tlet { ...rest } = $props();\n\tlet on = $state(true);\n\
               \tlet xs = $state([1]);\n</script>\n\
               <button onclick={() => (on = !on)}>b</button>\n\
               {#if on}<b {...rest}>on</b>{/if}\n\
               {#each xs as x (x)}<i {...rest}>{x}</i>{/each}";
    let (_, server) = both(source_text);
    for want in [
        "_normalizeProps(_mergeProps({ key: 0 }, $$spread({ ..._unref($$attrs) })))",
        "_mergeProps({ key: x }, { ref_for: true }, $$spread({ ..._unref($$attrs) }))",
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
    for source_text in [
        "<tr><td>x</td></tr>",
        "{#if true}<tr><td>a</td></tr>{:else}<tr><td>b</td></tr>{/if}",
        "<p>&amp;&lt;&#42;&#x2a; a & b &#;</p>",
    ] {
        run(source_text, false).expect(source_text);
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
    for (source_text, want) in cases {
        let got = run(source_text, false).expect_err(source_text);
        assert!(got.contains(want), "{source_text}: {got}");
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
    for (source_text, want) in cases {
        let got = run(source_text, false).expect_err(source_text);
        assert!(got.contains(want), "{source_text}: {got}");
    }
}
