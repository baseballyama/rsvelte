use crate::{CompileOptions, ModuleCompileOptions, Target, compile, compile_module};

/// The output without whitespace, so that a test does not depend on the printer's layout.
fn squashed(source: &str, generate: Target) -> String {
    let options = CompileOptions {
        filename: "App.svelte".to_owned(),
        generate,
        ..CompileOptions::default()
    };
    let compiled = compile(source, &options).unwrap_or_else(|e| panic!("{generate:?}: {e:?}"));
    compiled
        .js
        .code
        .chars()
        .filter(|c| !c.is_whitespace())
        .collect()
}

fn assert_contains(source: &str, target: Target, expected: &str) {
    let output = squashed(source, target);
    assert!(output.contains(expected), "{target:?}: {output}");
}

#[test]
fn an_instance_script_keeps_its_leading_line_block_and_jsdoc_comments() {
    // From svelte 5.57.3.
    let source = concat!(
        "<script>\n\t// top comment\n\tlet x = $state(1);\n\t/** jsdoc */\n",
        "\tfunction f() {\n\t\t// inner\n\t\treturn x;\n\t}\n",
        "\t/* block */ const w = 3;\n</script>\n{f()}{w}",
    );
    let script = "//topcommentletx=1;/**jsdoc*/functionf(){//innerreturnx;}/*block*/constw=3;";
    assert_contains(source, Target::Client, &format!("{{{script}$.next();"));
    assert_contains(
        source,
        Target::Server,
        &format!("{{{script}$$renderer.push("),
    );
}

/// The printed text as it is, for an assertion on where a comment's lines go.
fn printed(source: &str, generate: Target) -> String {
    let options = CompileOptions {
        filename: "App.svelte".to_owned(),
        generate,
        ..CompileOptions::default()
    };
    let compiled = compile(source, &options).unwrap_or_else(|e| panic!("{generate:?}: {e:?}"));
    compiled.js.code
}

fn assert_lines(source: &str, target: Target, expected: &str) {
    let output = printed(source, target);
    assert!(output.contains(expected), "{target:?}:\n{output}");
}

#[test]
fn a_comment_waits_for_the_next_node_that_has_a_position() {
    let source = "<script>\n\tlet { a, b } = $props();\n\tconst r = f(\n\t\ta,\n\t\t// \
                  eslint-disable-next-line svelte/no-unused-svelte-ignore\n\t\t// svelte-ignore \
                  state_referenced_locally\n\t\tb\n\t);\n</script>\n\n{r}";
    // The lines of svelte 5.57.3's output: line comments before the last argument break the call
    // over lines.
    assert_lines(
        source,
        Target::Server,
        concat!(
            "\tconst r = f(\n\t\ta,\n",
            "\t\t// eslint-disable-next-line svelte/no-unused-svelte-ignore\n",
            "\t\t// svelte-ignore state_referenced_locally\n\t\tb\n\t);\n",
        ),
    );
    // The rewritten `$$props.b` has no position, so upstream's printer writes them before the next
    // node that has one, `r` in the template effect.
    assert_lines(
        source,
        Target::Client,
        "\tconst r = f($$props.a, $$props.b);\n",
    );
    assert_lines(
        source,
        Target::Client,
        concat!(
            "\t$.template_effect(() => $.set_text(\n\t\ttext,\n",
            "\t\t// eslint-disable-next-line svelte/no-unused-svelte-ignore\n",
            "\t\t// svelte-ignore state_referenced_locally\n\t\tr\n\t));\n",
        ),
    );
}

#[test]
fn a_returned_value_after_a_comment_is_wrapped_and_a_thrown_one_after_a_block_comment_is_not() {
    let source = concat!(
        "<script>\n\tfunction f(a) {\n\t\treturn (\n\t\t\t// why\n\t\t\ta + 1\n\t\t);\n\t}\n",
        "\tfunction g() {\n\t\tthrow /* boom */ new Error(\"x\");\n\t}\n",
        "\tconsole.log(f(1), g);\n</script>\n",
    );
    // The lines of svelte 5.57.3's output; on the server the function is in the context callback.
    for (target, indent) in [(Target::Client, "\t\t"), (Target::Server, "\t\t\t")] {
        assert_lines(
            source,
            target,
            &format!("{indent}return (// why\n{indent}a + 1);\n"),
        );
        assert_lines(
            source,
            target,
            &format!("{indent}throw /* boom */ new Error(\"x\");\n"),
        );
    }
}

#[test]
fn a_module_script_and_a_module_keep_their_comments() {
    // From svelte 5.57.3.
    let component = concat!(
        "<script module>\n\texport function helper() {\n\t\t// m-body\n\t\treturn 1;\n\t}\n",
        "</script>\n<script>\n\tlet y = $state(helper());\n</script>\n{y}",
    );
    let module = concat!(
        "export function f() {\n\t// body\n\treturn 1;\n}\n",
        "// before s\nlet s = $state(0);\nexport { s };\n",
    );
    for generate in [Target::Client, Target::Server] {
        assert_contains(
            component,
            generate,
            "exportfunctionhelper(){//m-bodyreturn1;}",
        );
        let options = ModuleCompileOptions {
            filename: "a.svelte.js".to_owned(),
            generate,
        };
        let compiled = compile_module(module, &options).unwrap_or_else(|e| panic!("{e:?}"));
        let output: String = (compiled.js.code.chars())
            .filter(|c| !c.is_whitespace())
            .collect();
        assert!(
            output.contains("exportfunctionf(){//bodyreturn1;}//beforeslets=0;"),
            "{generate:?}: {output}"
        );
    }
}

#[test]
fn an_element_variable_is_read_at_its_tag_name() {
    // The lines of svelte 5.57.3's output: every read of an element's variable carries the tag
    // name's position, so a comment in the template lands on the variable as upstream's does.
    assert_lines(
        "<script>let a = 1;</script>\n<button on:click={// why\na}>c</button>\n",
        Target::Client,
        "\t\tbutton, // why\n",
    );
    assert_lines(
        "<script>\n\tconst id = /*c*/ $props.id();\n</script>\n<p>{id}</p>\n",
        Target::Client,
        "\tvar /*c*/\n\tp = root();\n",
    );
    assert_lines(
        concat!(
            "<script>let a = $state(1);</script>\n",
            "<div><p>t</p>{#each [1] as x}<i onclick={// why\n() => a++}>{x}</i>{/each}</div>\n",
        ),
        Target::Client,
        "\tvar node = $.sibling($.child(div // why\n\t));\n",
    );
}

#[test]
fn a_component_name_has_a_position_only_where_upstream_lines_up_the_call() {
    // The lines of svelte 5.57.3's output. Upstream builds a component's name from the tag's text,
    // so a script comment waiting for a position is dropped on the server and in `$.component`'s
    // thunk, while the client's static call is lined up with the tag and writes it.
    let bare = "<script>\n\t// c\n</script>\n<X>t</X>\n";
    let server = printed(bare, Target::Server);
    assert!(!server.contains("// c"), "{server}");
    assert_lines(bare, Target::Client, "\t// c\n\tX($$anchor, {\n");
    let dynamic = "<script>\n\tlet X = $state(null);\n\t// c\n</script>\n<X>t</X>\n";
    let client = printed(dynamic, Target::Client);
    assert!(!client.contains("// c"), "{client}");
    assert_lines(
        dynamic,
        Target::Client,
        "\t$.component(node, () => X, ($$anchor, X_1) => {\n",
    );
    // Inside an element nothing after the call has a position, so it waits for the body's end.
    assert_lines(
        "<script>\n\timport X from \"./X.svelte\";\n\t// c\n</script>\n<div><X /></div>\n",
        Target::Server,
        "\tX($$renderer, {});\n\t$$renderer.push(`<!----></div>`);\n\t// c\n}",
    );
}
