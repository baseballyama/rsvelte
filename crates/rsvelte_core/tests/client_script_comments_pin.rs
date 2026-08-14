//! Client codegen keeps comments from module and instance `<script>` blocks.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(name: &str, source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some(format!("{name}/index.svelte")),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn leading_script_comment_matches_upstream() {
    let source = "<script>\n\t// leading note\n\tlet x = 1;\n</script>\n\n<p>{x}</p>\n";
    let out = client("leading", source);
    assert!(out.contains("// leading note\n\tlet x = 1;"), "{out}");
}

#[test]
fn trailing_script_comment_flushes_at_the_next_located_node() {
    let source =
        "<script>\n\t// leading note\n\tlet x = 1;\n\t// trailing note\n</script>\n\n<p>{x}</p>\n";
    let out = client("leading_and_trailing", source);
    assert!(out.contains("// leading note\n\tlet x = 1;"), "{out}");
    assert!(out.contains("// trailing note"), "{out}");
}

#[test]
fn trailing_script_comment_stays_at_the_body_tail_when_the_element_comes_first() {
    let source =
        "<p>{x}</p>\n\n<script>\n\t// leading note\n\tlet x = 1;\n\t// trailing note\n</script>\n";
    let out = client("element_first", source);
    assert!(out.contains("// leading note\n\tlet x = 1;"), "{out}");
    assert!(out.contains("// trailing note\n}"), "{out}");
}

#[test]
fn module_and_instance_script_comments() {
    let source = "<script module>\n\t// module note\n\texport const version = 1;\n</script>\n\n<script>\n\t/* instance note */\n\tlet n = 0;\n</script>\n\n<button onclick={() => n++}>{n}</button>\n";
    let out = client("module_and_instance", source);
    assert!(out.contains("export const version = 1;"), "{out}");
    assert!(
        out.contains("/* instance note */\n\tlet n = $.mutable_source(0);"),
        "{out}"
    );
}
