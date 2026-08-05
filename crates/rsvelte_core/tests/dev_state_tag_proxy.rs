//! `create_state_declarator` (`VariableDeclaration.js`) labels a proxied
//! `$state` initializer with `$.tag_proxy(value, name)`, and it decides on the
//! *visited* expression — so in dev an `a === b` initializer has already become
//! a `$.strict_equals(...)` call and therefore proxies.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn an_equality_initializer_proxies_in_dev_only() {
    let src = r#"<script>
	const isStandalone = $state(window.self === window.top);
</script>

{isStandalone}
"#;
    let dev = compile_client(src, true);
    assert!(
        dev.contains(
            "$.tag_proxy($.proxy($.strict_equals(window.self, window.top)), 'isStandalone')"
        ),
        "got:\n{dev}"
    );

    let prod = compile_client(src, false);
    assert!(!prod.contains("$.proxy("), "got:\n{prod}");
}

#[test]
fn an_arithmetic_initializer_never_proxies() {
    let out = compile_client(
        r#"<script>
	const total = $state(1 + 2);
</script>

{total}
"#,
        true,
    );
    assert!(!out.contains("$.proxy("), "got:\n{out}");
}

#[test]
fn a_state_declared_in_a_handler_body_is_tagged() {
    let out = compile_client(
        r#"<script>
	import { SvelteSet } from 'svelte/reactivity';

	const set = new SvelteSet();
</script>

<button onclick={() => {
	const entry = $state({ name: 'a' });
	set.add(entry);
}}>add</button>
"#,
        true,
    );
    assert!(
        out.contains("$.tag_proxy($.proxy({ name: 'a' }), 'entry')"),
        "got:\n{out}"
    );
}
