use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str = r#"<script>
	let options = { currentPage: 0, rowsPerPage: 1 };
	function f() {
		// retained comment
		if (x) options.currentPage = 1;
		// discarded comment
	}
	function updatePageSize() {}
</script>
<select bind:value={options.rowsPerPage} onchange={updatePageSize}></select>"#;

#[test]
fn synthesized_invalidation_does_not_rewind_comments() {
    for dev in [false, true] {
        let code = compile(
            SOURCE,
            CompileOptions {
                filename: Some("Cursor.svelte".to_string()),
                generate: GenerateMode::Client,
                dev,
                ..Default::default()
            },
        )
        .expect("component should compile")
        .js
        .code;

        assert_eq!(code.matches("// retained comment").count(), 1, "{code}");
        assert_eq!(code.matches("// discarded comment").count(), 0, "{code}");
        assert!(
            code.contains("function f() {\n\t\t// retained comment\n\t\tif (x) ("),
            "{code}"
        );
        assert!(
            !code
                .split("$.invalidate_inner_signals")
                .nth(1)
                .is_some_and(|tail| tail.contains("// retained comment")),
            "{code}"
        );
    }
}
