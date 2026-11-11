//! `let:` directives that upstream reads differently from the semantic model, refused.

use rsvelte_svelte_compile::Target;

use super::compile;

#[test]
fn a_let_directive_upstream_would_read_differently_is_refused_on_both_targets() {
    let script = "<script>import C from './C.svelte'; let x = 1;</script>";
    for markup in [
        // Upstream's named slot reads the instance's `x`, not the default slot's.
        "<C let:x><p slot=\"a\">{x}</p></C>",
        // Upstream declares no name for the rest, so reading it throws.
        "<C let:x={[a, ...b]}>{b}</C>",
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
