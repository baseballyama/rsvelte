use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

#[test]
fn declaration_tag_rune_auto_detects_runes_mode_before_scope_validation() {
    let source = r#"<script lang="ts">
</script>
<footer>
	{let x = $state<number>(0)}
this is x: {x}
	</footer>"#;

    for (generate, dev) in [
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
    ] {
        let result = compile(
            source,
            CompileOptions {
                filename: Some("Component.svelte".to_string()),
                generate,
                dev,
                css: CssMode::External,
                ..Default::default()
            },
        )
        .expect("template declaration rune should compile");

        assert!(
            result.metadata.runes,
            "declaration tag should enable runes mode"
        );
        assert!(
            !result.js.code.contains("$state"),
            "rune call must be lowered before it reaches the browser:\n{}",
            result.js.code
        );
    }
}
