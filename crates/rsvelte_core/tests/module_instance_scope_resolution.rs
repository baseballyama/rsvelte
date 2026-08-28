//! Instance-script references resolve through the instance scope before the
//! module scope, including when both scripts declare the same name.

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
fn instance_prop_shadows_same_named_module_export() {
    let warnings = state_reference_warnings(
        r#"<script module>
    export const animate = () => {};
</script>

<script>
    const { initial, animate } = $props();
    const style = $state(initial ?? animate);
</script>"#,
    );

    assert_eq!(warnings.len(), 2);
    assert!(warnings[0].message.contains("`initial`"));
    assert!(warnings[1].message.contains("`animate`"));
}
