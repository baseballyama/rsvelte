use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

/// Upstream calls `remove_bom` at every public entry point. Left in, the BOM is
/// template text, so a component that renders nothing but a child emits a stray
/// text node around it — 320 corpus entries diverged on this one character.
#[test]
fn a_leading_byte_order_mark_is_not_template_text() {
    let with_bom =
        "\u{feff}<script>\n\timport Child from './Child.svelte';\n</script>\n\n<Child />\n";
    let without_bom = &with_bom[3..];

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for dev in [false, true] {
            let options = || CompileOptions {
                generate,
                dev,
                ..Default::default()
            };
            assert_eq!(
                compile(with_bom, options()).expect("compiles").js.code,
                compile(without_bom, options()).expect("compiles").js.code
            );
        }
    }
}

#[test]
fn a_leading_byte_order_mark_is_stripped_from_a_module() {
    let with_bom = "\u{feff}export const answer = 42;\n";
    let without_bom = &with_bom[3..];

    assert_eq!(
        compile_module(with_bom, ModuleCompileOptions::default())
            .expect("compiles")
            .js
            .code,
        compile_module(without_bom, ModuleCompileOptions::default())
            .expect("compiles")
            .js
            .code
    );
}
