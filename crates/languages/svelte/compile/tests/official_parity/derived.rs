use rsvelte_svelte_compile::Target;

use super::compile;

#[test]
fn a_destructured_derived_outside_the_instance_top_level_is_refused_on_both_targets() {
    for source in [
        "<script>let o = $state({}); function f() { let { a } = $derived(o); return a; }</script>",
        "<script module>let { a } = $derived({ a: 1 });</script><script>let b = 1;</script>",
    ] {
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(source, target),
                Err("unsupported".to_owned()),
                "{source} on {target:?}"
            );
        }
    }
}
