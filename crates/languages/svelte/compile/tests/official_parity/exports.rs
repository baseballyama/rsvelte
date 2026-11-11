use rsvelte_svelte_compile::Target;

use super::compile;

#[test]
fn an_export_specifier_lowers_unless_it_exports_default_on_both_targets() {
    for (script, refused) in [
        ("let a = 1; export { a };", false),
        ("let s = $state(0); export { s };", false),
        ("let { p } = $props(); export { p };", false),
        ("class K {} export { K };", false),
        ("const c = 1; export { c as default };", true),
    ] {
        let source = format!("<script>{script}</script><p>{{1}}</p>");
        for target in [Target::Client, Target::Server] {
            let outcome = compile(&source, target).err();
            let expected = refused.then(|| "unsupported".to_owned());
            assert_eq!(outcome, expected, "{source} on {target:?}");
        }
    }
}
