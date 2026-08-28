use rsvelte_core::{ModuleCompileOptions, compile_module};

#[test]
fn indirect_state_exports_point_at_the_invalid_specifier() {
    for (source, name, code) in [
        (
            "let count = $state(0);\nconst double = $derived(count * 2);\nexport { double };",
            "double",
            "derived_invalid_export",
        ),
        (
            "let object = $state({ ok: true });\nlet primitive = $state('nope');\nobject.ok = false;\nprimitive = 'yep';\nexport { object, primitive };",
            "primitive",
            "state_invalid_export",
        ),
    ] {
        let diagnostic = compile_module(source, ModuleCompileOptions::default())
            .expect_err("indirect state exports must be rejected")
            .diagnostic();
        let start = source.rfind(name).unwrap() as u32;

        assert_eq!(diagnostic.code.as_deref(), Some(code));
        assert_eq!(diagnostic.span, Some((start, start + name.len() as u32)));
    }
}
