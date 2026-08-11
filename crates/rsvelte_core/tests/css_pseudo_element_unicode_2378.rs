use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn preserves_unicode_pseudo_element_arguments() {
    let source = "<style>::view-transition-group(あ) { color: red }</style>";

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let result = compile(
            source,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
        .expect("unicode pseudo-element argument should compile");

        assert_eq!(
            result.css.expect("style output").code,
            "::view-transition-group(あ) { color: red }"
        );
    }
}
