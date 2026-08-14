use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("ParamPattern.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn parameter_default_and_computed_key_reads_are_reactive_dependencies() {
    let src = r#"<script>
	export let id;
	$: value = (({ [id]: key, value = id }) => key ?? value)({});
</script>"#;
    for dev in [false, true] {
        let output = compile_client(src, dev);
        assert!(
            output.contains("$.legacy_pre_effect(() => ($.deep_read_state(id()))"),
            "expected parameter-pattern reads in the dependency thunk (dev={dev}), got:\n{output}"
        );
    }
}
