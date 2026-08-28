//! `state_referenced_locally` uses the same non-proxyable expression classes as
//! the client transform's `should_proxy` decision.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

fn state_reference_warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .into_iter()
    .filter(|warning| warning.code == "state_referenced_locally")
    .collect()
}

#[test]
fn logical_and_conditional_state_initializers_remain_proxyable() {
    let warnings = state_reference_warnings(
        r#"<script>
    const left = $state({ value: 1 });
    const right = $state({ value: 2 });
    const logical = $state(left ?? right);
    const conditional = $state(logical ? logical : right);
    const result = $state(logical ? conditional.value : []);
</script>"#,
    );

    assert!(warnings.is_empty(), "unexpected warnings: {warnings:?}");
}

#[test]
fn binary_state_initializer_remains_non_proxyable() {
    let warnings = state_reference_warnings(
        "<script>\nconst count = $state(1 + 2);\nconst doubled = count * 2;\n</script>",
    );

    assert_eq!(warnings.len(), 1);
    assert!(warnings[0].message.contains("`count`"));
}
