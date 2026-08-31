use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn element_bind_setter_mutates_a_legacy_prop_member() {
    let output = compile_client(
        r#"<script>
    export let options;
</script>

<input bind:value={options.from} />
"#,
    );

    assert!(
        output.contains("options(options().from = $$value, true)"),
        "got:\n{output}"
    );
}

#[test]
fn element_bind_setter_mutates_a_legacy_state_computed_member() {
    let output = compile_client(
        r#"<script>
    let selected = [false];
    let index = 0;
</script>

<input type="checkbox" bind:checked={selected[index]} />
"#,
    );

    assert!(
        output.contains("$.mutate(selected, $.get(selected)[index] = $$value)"),
        "got:\n{output}"
    );
}
