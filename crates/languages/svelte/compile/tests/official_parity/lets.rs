//! `let:` directives that upstream reads differently from the semantic model, refused.

use rsvelte_svelte_compile::Target;

use super::compile;

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
