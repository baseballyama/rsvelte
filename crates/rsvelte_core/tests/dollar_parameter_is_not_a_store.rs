//! Pins the deliberate divergence recorded in
//! `compatibility/GATES.md#deliberate-divergences` — "A `$`-prefixed local binding
//! is not a store subscription (server)".
//!
//! Upstream's server transform decides "this is a store" from the name's spelling
//! plus the existence of a binding one character shorter
//! (`3-transform/server/visitors/AssignmentExpression.js:75-79`) and never asks
//! whether `$viewport` itself resolves in the current scope, so it emits
//! `$.store_mutate(…)`. Its own client target emits the plain assignment for the
//! same input, and reproducing the server form is unreachable code in both of the
//! two shapes below.
//!
//! Without this test the corpus entries read as ordinary failures, and a
//! contributor closing them "toward upstream" would look correct.
//!
//! **The axis is the SPELLING, not "a function parameter".** The name in the
//! divergence, in the ratchet prose and in the first version of this file all said
//! parameter; a plain `let` in a nested block produces byte-identical upstream
//! output, so a fix special-casing parameters would have passed a parameter-only
//! grid. Every expected string below is the oracle's own
//! (`submodules/svelte` @ `5.56.10`, `dev: false`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const WRITE: &str = "$viewport.distance = 42";

/// A real store `viewport` exists, so upstream declares `var $$store_subs` and the
/// emitted call subscribes to and re-sets a store the source never subscribed to
/// in that scope.
const PARAM_WITH_STORE: &str = r#"<script>
	import { writable } from 'svelte/store';

	const viewport = writable({ distance: 0 });

	function update(fn) {
		fn({ distance: 1 });
	}

	update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>{$viewport.distance}</p>
"#;

/// The same shape with a plain `let` instead of a parameter. Upstream's server
/// output is byte-identical to `PARAM_WITH_STORE`'s, which is what says the
/// mechanism is the spelling.
const NESTED_LET_WITH_STORE: &str = r#"<script>
	import { writable } from 'svelte/store';

	const viewport = writable({ distance: 0 });

	function update(fn) {
		fn();
	}

	update(() => {
		let $viewport = { distance: 1 };
		$viewport.distance = 42;
	});
</script>

<p>{$viewport.distance}</p>
"#;

/// No store anywhere. Upstream still emits `$.store_mutate($$store_subs ??= {}, …)`
/// and does **not** emit `var $$store_subs`, so the module throws a `ReferenceError`
/// on its first SSR render — a second, independent reason not to reproduce it.
const PARAM_NO_STORE: &str = r#"<script>
	const viewport = {
		update(fn) {
			fn({ distance: 1 });
		}
	};

	viewport.update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>ok</p>
"#;

/// The brake: `if (!context.state.scope.get(name)) return null`. With nothing named
/// `viewport` in scope upstream emits the plain assignment on both targets, so this
/// cell is already correct on both sides and is here to catch an over-broad fix.
const PARAM_NO_VIEWPORT: &str = r#"<script>
	function update(fn) {
		fn({ distance: 1 });
	}

	update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>ok</p>
"#;

fn emit(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("Viewport.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn a_dollar_local_is_assigned_directly_on_the_server() {
    for (name, source) in [
        ("parameter, real store", PARAM_WITH_STORE),
        ("nested let, real store", NESTED_LET_WITH_STORE),
        ("parameter, no store at all", PARAM_NO_STORE),
    ] {
        for dev in [false, true] {
            let out = emit(source, GenerateMode::Server, dev);
            assert!(
                out.contains(WRITE),
                "{name} dev={dev}: the local must be assigned directly:\n{out}"
            );
            assert!(
                !out.contains("store_mutate"),
                "{name} dev={dev}: a shadowed `$name` must not be treated as a store:\n{out}"
            );
        }
    }
}

#[test]
fn the_client_agrees_and_upstream_agrees_with_it() {
    for (name, source) in [
        ("parameter, real store", PARAM_WITH_STORE),
        ("nested let, real store", NESTED_LET_WITH_STORE),
        ("parameter, no store at all", PARAM_NO_STORE),
    ] {
        for dev in [false, true] {
            let out = emit(source, GenerateMode::Client, dev);
            assert!(
                out.contains(WRITE),
                "{name} dev={dev}: client must assign the local directly:\n{out}"
            );
        }
    }
}

/// The store in the same component still subscribes, so the tests above cannot pass
/// by rsvelte having lost store handling altogether.
#[test]
fn a_real_store_read_still_subscribes() {
    for (name, source) in [
        ("parameter, real store", PARAM_WITH_STORE),
        ("nested let, real store", NESTED_LET_WITH_STORE),
    ] {
        let out = emit(source, GenerateMode::Server, false);
        assert!(
            out.contains("$$store_subs"),
            "{name}: the template's `{{$viewport.distance}}` must still subscribe:\n{out}"
        );
    }
}

/// With nothing named `viewport` in scope upstream's own brake fires, so both
/// compilers already agree here. A fix that widened the rule instead of narrowing
/// it would break this cell and no other.
#[test]
fn the_brake_cell_agrees_with_upstream_on_both_targets() {
    for generate in [GenerateMode::Server, GenerateMode::Client] {
        for dev in [false, true] {
            let out = emit(PARAM_NO_VIEWPORT, generate, dev);
            assert!(
                out.contains(WRITE) && !out.contains("store_mutate"),
                "dev={dev}: nothing named `viewport` is in scope, so this must be a plain write:\n{out}"
            );
        }
    }
}
