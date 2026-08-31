//! Pins the deliberate divergence recorded in
//! `compatibility/GATES.md#deliberate-divergences` — "A `$`-prefixed function parameter
//! is not a store subscription (server)".
//!
//! Upstream's server transform decides "this is a store" from the name's spelling
//! plus the existence of a binding one character shorter
//! (`3-transform/server/visitors/AssignmentExpression.js:75-79`) and never asks
//! whether `$viewport` itself resolves in the current scope, so it emits
//! `$.store_mutate(…)` for a callback parameter. Its own client target emits the
//! plain assignment for the same input, and `store_mutate` re-sets the outer store,
//! so reproducing the server form would subscribe to and write a store the source
//! never subscribed to in that scope.
//!
//! Without this test the corpus entries read as ordinary failures, and a
//! contributor closing them "toward upstream" would look correct.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str = r#"<script>
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

fn emit(generate: GenerateMode, dev: bool) -> String {
    compile(
        SOURCE,
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
fn a_dollar_parameter_is_assigned_directly_on_the_server() {
    for dev in [false, true] {
        let out = emit(GenerateMode::Server, dev);
        assert!(
            out.contains("$viewport.distance = 42"),
            "dev={dev}: the parameter must be assigned directly:\n{out}"
        );
        assert!(
            !out.contains("store_mutate"),
            "dev={dev}: a shadowed `$name` parameter must not be treated as a store:\n{out}"
        );
    }
}

#[test]
fn the_client_agrees_and_upstream_agrees_with_it() {
    for dev in [false, true] {
        let out = emit(GenerateMode::Client, dev);
        assert!(
            out.contains("$viewport.distance = 42"),
            "dev={dev}: client must assign the parameter directly:\n{out}"
        );
    }
}

/// The store in the same component still subscribes, so the test above cannot pass
/// by rsvelte having lost store handling altogether.
#[test]
fn a_real_store_read_still_subscribes() {
    let out = emit(GenerateMode::Server, false);
    assert!(
        out.contains("$$store_subs"),
        "the template's `{{$viewport.distance}}` must still subscribe:\n{out}"
    );
}
