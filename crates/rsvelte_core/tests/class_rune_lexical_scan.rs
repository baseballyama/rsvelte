//! Issue #452: the class-rune transform's text scanning must be JS-lexical
//! aware — a `}` / `)` inside a string in a rune field's argument must not
//! truncate the class body / argument (H-057, H-058), and `new class {}(args)`
//! must keep the user's constructor arguments (H-059).

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// H-057 + H-058: a `}` and `)` inside the rune's string argument must survive
/// (the class-body brace scan and the rune-argument paren scan are now
/// JS-lexical-aware).
#[test]
fn rune_field_string_arg_with_brace_and_paren() {
    let out = client("<script>\nclass C { x = $state(\"a}b)c\"); }\nnew C();\n</script>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.state(\"a}b)c\")"),
        "rune string arg truncated at brace/paren: {out}"
    );
}

/// H-059: `new class {}(args)` keeps the constructor arguments rather than
/// becoming `new (class {})()(args)`.
#[test]
fn new_class_expression_keeps_constructor_args() {
    let out = client("<script>\nlet c = new class { x = $state(0); }(5, 6);\n</script>\n{c}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("})(5, 6)"), "constructor args lost: {out}");
    assert!(
        !out.contains("})()(5, 6)"),
        "an extra () was injected before the constructor args: {out}"
    );
}
