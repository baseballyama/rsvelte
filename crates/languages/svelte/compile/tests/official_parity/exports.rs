use rsvelte_svelte_compile::Target;

use super::compile;

#[test]
fn an_export_specifier_that_upstream_counts_as_a_write_is_refused_on_both_targets() {
    for script in [
        "let a = 1; export { a };",
        "let s = $state(0); export { s };",
        "let { p } = $props(); export { p };",
        "class K {} export { K };",
        "const c = 1; export { c as default };",
    ] {
        let source = format!("<script>{script}</script><p>{{1}}</p>");
        for target in [Target::Client, Target::Server] {
            assert_eq!(
                compile(&source, target),
                Err("unsupported".to_owned()),
                "{source} on {target:?}"
            );
        }
    }
}
