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

const SCRIPT: &str = "<script>\n\tlet n = 1;\n\tlet s = \"x\";\n\tlet arr = [1];\n\tlet o = { k: \"k\" };\n\tvoid n;\n\tvoid s;\n\tvoid arr;\n\tvoid o;\n</script>\n\n";

#[test]
fn sequence_in_a_concatenated_interpolation_is_guarded() {
    let out = client(&format!(
        "{SCRIPT}{{#each arr as q}}{{(n, s)}}{{q}}{{/each}}\n"
    ));
    assert!(
        out.contains("`${(n, s) ?? ''}${$.get(q) ?? ''}`"),
        "expected both slots guarded:\n{out}"
    );
}

#[test]
fn sequence_whose_last_element_is_a_literal_is_still_guarded() {
    let out = client(&format!(
        "{SCRIPT}{{#each arr as q}}{{(n, \"lit\")}}{{q}}{{/each}}\n"
    ));
    assert!(
        out.contains("`${(n, \"lit\") ?? ''}${$.get(q) ?? ''}`"),
        "upstream's scope.evaluate has no SequenceExpression case, so the last \
         element's value never makes the sequence defined:\n{out}"
    );
}

#[test]
fn sequence_in_a_concatenated_attribute_is_guarded() {
    let out = client(&format!(
        "{SCRIPT}<div title=\"{{(n, s)}}{{o.k}}\"></div>\n"
    ));
    assert!(
        out.contains("`${(n, s) ?? ''}${o.k ?? ''}`"),
        "expected the attribute chunk guarded too:\n{out}"
    );
}

#[test]
fn a_lone_sequence_needs_no_guard() {
    let out = client(&format!("{SCRIPT}<div>{{(n, s)}}</div>\n"));
    assert!(
        out.contains("div.textContent = (n, s);"),
        "a single expression is passed through directly, with no `?? ''`:\n{out}"
    );
    assert!(!out.contains("?? ''"), "{out}");
}
