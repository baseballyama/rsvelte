//! Regression coverage for #3338. Production client lowering used to remove
//! every `$inspect(...)` spelling in a complete statement when the name was not
//! a function parameter. Upstream resolves each callee, so every lexical
//! binding slot must protect only the references in its own scope.

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
fn production_removal_respects_every_lexical_binding_slot() {
    let code = compile_client(
        r#"
$inspect(0);
function f(fn) {
	try {} catch ($inspect) {
		$inspect(1);
		$inspect.trace(2);
	}
	{
		const $inspect = fn;
		$inspect(3);
	}
	for (const $inspect of [fn]) {
		$inspect(4);
	}
	const { $inspect } = { $inspect: fn };
	$inspect(5);
}
f(console.log);
"#,
    );

    // The unbound top-level rune is still removed: the repair must not turn
    // into a statement-wide "keep every inspect" exemption.
    assert!(!code.contains("$inspect(0)"), "got:\n{code}");

    for call in [
        "$inspect(1);",
        "$inspect.trace(2);",
        "$inspect(3);",
        "$inspect(4);",
        "$inspect(5);",
    ] {
        assert!(code.contains(call), "missing {call:?} in:\n{code}");
    }
}
