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

#[test]
fn a_comment_between_call_arguments_stays_where_the_argument_is_printed_as_written() {
    let source = "<script>\n\tlet { a, b } = $props();\n\tconst r = f(\n\t\ta,\n\t\t// \
                  eslint-disable-next-line svelte/no-unused-svelte-ignore\n\t\t// svelte-ignore \
                  state_referenced_locally\n\t\tb\n\t);\n</script>\n\n{r}";
    // From svelte 5.57.3.
    assert_contains(
        source,
        Target::Server,
        concat!(
            "constr=f(a,//eslint-disable-next-linesvelte/no-unused-svelte-ignore",
            "//svelte-ignorestate_referenced_locallyb);",
        ),
    );
    // Upstream's printer drops them from the rewritten `$$props.b` and writes them before the
    // next identifier it prints, `r` in the template effect; they are dropped here instead.
    let client = squashed(source, Target::Client);
    assert!(
        client.contains("constr=f($$props.a,$$props.b);"),
        "{client}"
    );
    assert!(!client.contains("//"), "{client}");
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
