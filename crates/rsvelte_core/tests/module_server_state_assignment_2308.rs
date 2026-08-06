//! `compileModule(generate: 'server')` must leave assignments to `$state`
//! bindings verbatim — the server has no signals, so `runs = runs + 1` stays
//! `runs = runs + 1` and is never contracted to `runs += 1`.

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

fn compile_mod_server(src: &str) -> String {
    let result = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("in.svelte.js".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module");
    result.js.code
}

#[test]
fn plain_assignment_to_state_is_not_contracted() {
    let src = r#"export function t() {
	let runs = $state(0);
	let plain = 0;
	function f() {
		runs = runs + 1;
		plain = plain + 1;
		runs = runs - 2;
		runs = 1 + runs;
	}
	return f;
}
"#;
    let out = compile_mod_server(src);

    assert!(
        out.contains("runs = runs + 1"),
        "`runs = runs + 1` must stay verbatim. Got:\n{out}"
    );
    assert!(
        out.contains("runs = runs - 2"),
        "`runs = runs - 2` must stay verbatim. Got:\n{out}"
    );
    // Negative controls: the non-state binding and the right-operand form were
    // already correct and must not move.
    assert!(
        out.contains("plain = plain + 1"),
        "`plain = plain + 1` must stay verbatim. Got:\n{out}"
    );
    assert!(
        out.contains("runs = 1 + runs"),
        "`runs = 1 + runs` must stay verbatim. Got:\n{out}"
    );
    assert!(
        !out.contains("+=") && !out.contains("-="),
        "no assignment may be contracted. Got:\n{out}"
    );
    // No client signal plumbing may survive on the server module path.
    assert!(
        !out.contains("$.set(") && !out.contains("$.get("),
        "server modules must not emit `$.set` / `$.get` for state. Got:\n{out}"
    );
}

#[test]
fn genuine_compound_assignment_to_state_is_preserved() {
    let src = r#"export function t() {
	let runs = $state(0);
	function f() {
		runs += 1;
		runs *= 2;
	}
	return f;
}
"#;
    let out = compile_mod_server(src);
    assert!(
        out.contains("runs += 1"),
        "`runs += 1` must stay verbatim. Got:\n{out}"
    );
    assert!(
        out.contains("runs *= 2"),
        "`runs *= 2` must stay verbatim. Got:\n{out}"
    );
}
