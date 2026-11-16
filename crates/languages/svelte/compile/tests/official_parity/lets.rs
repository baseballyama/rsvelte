//! `let:` directives that upstream reads differently from the semantic model, refused.

use rsvelte_svelte_compile::Target;

use super::{compile, squashed};

#[test]
fn a_let_directive_upstream_would_read_differently_is_refused_on_both_targets() {
    let script = "<script>import C from './C.svelte'; let x = 1;</script>";
    for markup in [
        // Upstream declares no name for the rest, so reading it throws.
        "<C let:x={[a, ...b]}>{b}</C>",
        // Upstream reads a `$$slotProps` that only a component's content declares.
        "<slot let:foo>{foo}</slot>",
        "<C>{#snippet s()}<slot let:foo>{foo}</slot>{/snippet}</C>",
    ] {
        let source = format!("{script}{markup}");
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(&source, target),
                Err("unsupported".to_owned()),
                "{markup} on {target:?}"
            );
        }
    }
}

#[test]
fn a_default_in_a_let_pattern_is_written_as_is_on_the_server_and_refused_on_the_client() {
    // From svelte 5.57.3.
    let source = "<script>import C from './C.svelte'; let n = $state(1);</script>\
        <C let:item={{ a: [b = n], c: { d } = {}, e: [f] = [] }}>{b}{d}{f}</C>";
    assert!(
        squashed(source, Target::Server)
            .contains("default:($$renderer,{item:{a:[b=n],c:{d}={},e:[f]=[]}})=>"),
        "{}",
        squashed(source, Target::Server)
    );
    assert_eq!(
        compile(source, Target::Client),
        Err("unsupported".to_owned())
    );
}
