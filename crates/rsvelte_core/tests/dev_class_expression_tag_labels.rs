//! `$.tag` labels for a class **expression**: upstream builds them from
//! `declaration.id?.name ?? '[class]'` (`ClassBody.js`, `AssignmentExpression.js`)
//! and from `get_name` on the *original* key, so a public field lowered to a
//! private backing keeps its public name.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn an_anonymous_class_expression_is_labelled_bracket_class() {
    let out = compile_client_dev(
        r#"<script>
	const a = new class {
		foo = $state(0)
	}
</script>

<p>{a.foo}</p>
"#,
    );
    assert!(out.contains("'[class].foo'"), "got:\n{out}");
}

#[test]
fn a_constructor_assigned_public_field_keeps_its_public_name() {
    let out = compile_client_dev(
        r#"<script>
	const counter = new class Counter {
		constructor() {
			this.count = $state(0);
		}
	}
</script>

<p>{counter.count}</p>
"#,
    );
    assert!(out.contains("'Counter.count'"), "got:\n{out}");
    assert!(!out.contains("'Counter.#count'"), "got:\n{out}");
}

#[test]
fn a_hand_written_accessor_over_a_private_field_keeps_the_hash() {
    let out = compile_client_dev(
        r#"<script>
	class Counter {
		#count = $state(0);
		get count() { return this.#count; }
		set count(val) { this.#count = val; }
	}
	const c = new Counter();
</script>

<p>{c.count}</p>
"#,
    );
    assert!(out.contains("'Counter.#count'"), "got:\n{out}");
}
