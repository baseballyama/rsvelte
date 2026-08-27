use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[test]
fn option_values_with_defined_expression_shapes_have_no_guard() {
    for value in ["() => 1", "function () {}", "1 + 1", "-1"] {
        let out = client(&format!(
            "<select><option value={{{value}}}>x</option></select>"
        ));
        assert!(
            !out.contains("?? ''"),
            "{value} is always defined, but retained a nullish guard:\n{out}"
        );
    }

    let out = client("<select><option value={{}}>x</option></select>");
    assert!(
        out.contains("?? ''"),
        "an object is UNKNOWN to upstream's evaluator and keeps its guard:\n{out}"
    );
}

#[test]
fn title_resolves_a_binding_with_a_binary_initializer() {
    let out = client(
        "<script>export let a = 1; let b = a + 1;</script>\n\
         <svelte:head><title>{b}</title></svelte:head>",
    );
    assert!(out.contains("$.document.title = b;"), "{out}");
    assert!(!out.contains("b ?? ''"), "{out}");
}

#[test]
fn assignment_and_sequence_initializers_stay_unknown() {
    for initializer in ["obj.a = 1", "(un, 1)"] {
        let out = client(&format!(
            "<script>\n\
             \tlet {{ cond, un }} = $props();\n\
             \tlet obj = $state({{ a: 0 }});\n\
             \tconst v = ({initializer});\n\
             </script>\n\n\
             {{v}}{{cond}}"
        ));
        assert!(
            out.contains("${v ?? ''}${$$props.cond ?? ''}"),
            "{initializer} must remain unknown:\n{out}"
        );
    }
}
