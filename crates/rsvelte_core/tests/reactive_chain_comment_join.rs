//! A `//` comment inside a `$:` body must not swallow the member-chain
//! continuation on the next line.
//!
//! `transform_reactive_statement` collapses a chain continuation onto the
//! previous line so its assignment detection sees one unit. The scan already
//! declines to collapse a `...` spread for this reason, but not a line that IS
//! a `//` comment — the joined `.catch(…)` then lands inside the comment, and
//! every line of a multi-line callback is orphaned. Official emits
//! `sub().// } c\ncatch((e) => {`, which is why the divergence is only visible
//! as output that no JS parser accepts.

use rsvelte_core::compiler::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// A `//` comment before a chained call whose argument is a multi-line arrow.
const JOINED: &str = r#"<script>
	export let id;
	let n = 0;

	$: if (id) {
		sub()
			// } c
			.catch((e) => {
				n = 2;
			});
	}
</script>

<button>{n}</button>
"#;

/// The same body with the comment removed: the collapse is still exercised.
const CONTROL: &str = r#"<script>
	export let id;
	let n = 0;

	$: if (id) {
		sub()
			.catch((e) => {
				n = 2;
			});
	}
</script>

<button>{n}</button>
"#;

#[test]
fn a_comment_never_swallows_the_chain_continuation() {
    for dev in [false, true] {
        let out = compile_to(JOINED, GenerateMode::Client, dev);
        assert!(
            !out.contains("// } c.catch"),
            "the continuation must not be joined onto the comment (dev={dev}):\n{out}"
        );
    }
}

#[test]
fn the_callback_body_is_still_reachable_code() {
    for dev in [false, true] {
        let out = compile_to(JOINED, GenerateMode::Client, dev);
        // Swallowed by the comment, `n = 2` is never transformed and the block
        // that follows it is orphaned.
        assert!(
            out.contains("$.set(n, 2)"),
            "the callback body must still be transformed (dev={dev}):\n{out}"
        );
    }
}

#[test]
fn the_comment_itself_survives() {
    for dev in [false, true] {
        let out = compile_to(JOINED, GenerateMode::Client, dev);
        assert!(
            out.contains("// } c"),
            "the comment must not be dropped (dev={dev}):\n{out}"
        );
    }
}

#[test]
fn the_collapse_still_happens_without_a_comment() {
    // CONTROL: the same chain with no comment must keep working, so a fix that
    // simply stopped collapsing would fail here.
    for dev in [false, true] {
        let out = compile_to(CONTROL, GenerateMode::Client, dev);
        assert!(
            out.contains("$.set(n, 2)"),
            "the un-commented chain must still transform (dev={dev}):\n{out}"
        );
    }
}

#[test]
fn the_server_is_unaffected() {
    for dev in [false, true] {
        let out = compile_to(JOINED, GenerateMode::Server, dev);
        assert!(
            !out.contains("// } c.catch"),
            "the server must not join either (dev={dev}):\n{out}"
        );
    }
}
