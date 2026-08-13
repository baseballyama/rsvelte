use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("client compile")
    .js
    .code
}

#[test]
fn bound_editable_children_are_initialized_without_a_reactive_text_update() {
    let output = compile_client(
        r#"<script>let value = $state(1);</script><div contenteditable="true" bind:innerText={value}>{value}</div>"#,
    );

    assert!(output.contains("text.nodeValue = $.get(value);"));
    assert!(!output.contains("$.set_text(text, $.get(value));"));
}

#[test]
fn non_editable_children_keep_the_reactive_text_update() {
    let output = compile_client(
        r#"<script>let value = $state(1);</script><div contenteditable="false" bind:innerText={value}>{value}</div>"#,
    );

    assert!(
        output.contains("$.template_effect(() => $.set_text(text, $.get(value)));"),
        "expected a reactive text update:\n{output}"
    );
}
