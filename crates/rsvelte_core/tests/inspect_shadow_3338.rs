//! Regression coverage for #3338. Production client lowering used to remove
//! every `$inspect(...)` spelling in a complete statement when the name was not
//! a function parameter. Upstream resolves each callee, so a catch parameter
//! must protect only the references in its own scope.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(script: &str) -> String {
    let source = format!("<script>\n{script}\n</script>\n<div>x</div>\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("InspectShadow.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn production_removal_respects_a_catch_parameter_scope() {
    let code = compile_client(
        r#"
$inspect(0);
function f() {
	try {} catch ($inspect) {
		$inspect(1);
		$inspect.trace(2);
	}
	$inspect(3);
}
f();
"#,
    );

    // Unbound runes on either side are still removed: the repair must not turn
    // into a statement-wide "keep every inspect" exemption.
    assert!(!code.contains("$inspect(0)"), "got:\n{code}");
    assert!(!code.contains("$inspect(3)"), "got:\n{code}");

    for call in ["$inspect(1);", "$inspect.trace(2);"] {
        assert!(code.contains(call), "missing {call:?} in:\n{code}");
    }
}
