use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::{GenerateMode, compile};

const SOURCE: &str = r#"<script>
	let n = $state(0);
	function a(x) { return (g(/* c */ x)); }
	function b(x) { return (x + /* c */ n) * 2; }
	function c(x) { return ((/* c */ x)); }
	function d(x) { return (x /* c */); }
</script>
<p>{n}</p>"#;

#[test]
fn function_body_comments_are_not_duplicated_into_parameters() {
    for (generate, dev) in [
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
    ] {
        let code = compile(
            SOURCE,
            CompileOptions {
                generate,
                dev,
                filename: Some("x.svelte".to_string()),
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        for expected in [
            "function a(x) {\n\t\treturn g(/* c */ x);",
            "function b(x) {\n\t\treturn (x + /* c */ n) * 2;",
            "function c(x) {\n\t\treturn (/* c */ x);",
            "function d(x) {\n\t\treturn x; /* c */",
        ] {
            assert!(code.contains(expected), "missing body comment:\n{code}");
        }
        assert_eq!(
            code.matches("/* c */").count(),
            4,
            "duplicated comment:\n{code}"
        );
        assert!(
            !code.contains("x /* c */"),
            "function parameter duplicated a body comment:\n{code}"
        );
    }
}
