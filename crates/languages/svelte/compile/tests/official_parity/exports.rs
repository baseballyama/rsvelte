use rsvelte_svelte_compile::Target;

use super::{compile, compile_at};

#[test]
fn an_export_specifier_lowers_unless_it_exports_default_on_both_targets() {
    for (script, default) in [
        ("let a = 1; export { a };", false),
        ("let s = $state(0); export { s };", false),
        ("let { p } = $props(); export { p };", false),
        ("class K {} export { K };", false),
        ("const c = 1; export { c as default };", true),
    ] {
        let source = format!("<script>{script}</script><p>{{1}}</p>");
        for target in [Target::Client, Target::Server] {
            let outcome = compile(&source, target).err();
            let expected = default.then(|| "module_illegal_default_export".to_owned());
            assert_eq!(outcome, expected, "{source} on {target:?}");
        }
    }
}

#[test]
fn an_exported_variable_raises_upstreams_error_after_its_declaration_on_both_targets() {
    // From svelte 5.57.3, compiled with `runes: true`.
    for (script, expected) in [
        (
            "export let a = 1;",
            Some(("legacy_export_invalid", (8, 25))),
        ),
        (
            "let x = $state(0); export let a = $derived(x);",
            Some(("derived_invalid_export", (27, 54))),
        ),
        (
            "export let a = $state(0); a = 1;",
            Some(("state_invalid_export", (8, 33))),
        ),
        (
            "export let a = $state(1, 2);",
            Some(("rune_invalid_arguments_length", (23, 35))),
        ),
        ("export const a = 1;", None),
    ] {
        let source = format!("<script>{script}</script>");
        for target in [Target::Client, Target::Server] {
            let outcome = compile_at(&source, target).err();
            let expected = expected.map(|(code, at)| (code.to_owned(), at));
            assert_eq!(outcome, expected, "{source} on {target:?}");
        }
    }
    let module = "<script module>export let a = 1;</script>";
    assert_eq!(compile(module, Target::Client).err(), None);
}
