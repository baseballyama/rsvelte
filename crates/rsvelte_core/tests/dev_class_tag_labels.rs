//! `$.tag()`'s label is `get_name(definition.key)` on the field key as written
//! (`ClassBody.js` via `phases/nodes.js`), so a genuinely private `#count`
//! reports `Class.#count` while a public `count` reports `Class.count` even
//! though both end up behind a private backing field.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Tag.svelte".to_string()),
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
fn a_private_field_keeps_its_hash_in_the_tag_label() {
    let out = compile_client_dev(
        r#"<script>
	class Counter {
		count = $state(0);
		#count = $state(1);
		get secret() { return this.#count; }
	}
	const c = new Counter();
</script>
<p>{c.count}{c.secret}</p>
"#,
    );
    assert!(
        out.contains("#_count = $.tag($.state(0), 'Counter.count');"),
        "the public field should report its own name, got:\n{out}"
    );
    assert!(
        out.contains("#count = $.tag($.state(1), 'Counter.#count');"),
        "the private field should keep the `#`, got:\n{out}"
    );
}

#[test]
fn a_lone_private_field_is_not_mistaken_for_a_lowered_public_one() {
    let out = compile_client_dev(
        r#"<script>
	class Box {
		#width = $state(0);
		get width() { return this.#width; }
	}
	const b = new Box();
</script>
<p>{b.width}</p>
"#,
    );
    assert!(
        out.contains("#width = $.tag($.state(0), 'Box.#width');"),
        "a hand-written getter must not turn `#width` into a public label, got:\n{out}"
    );
}
