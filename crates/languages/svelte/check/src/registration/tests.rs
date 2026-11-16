use super::without_any_component_module;

#[test]
fn only_the_any_component_module_is_blanked_in_place() {
    let types = "declare module 'svelte' {\n}declare module '*.svelte' {\n\tconst C: \
        any;\n}\n\nexport {};\n";
    let blanked = without_any_component_module(types.to_owned());
    assert_eq!(blanked.len(), types.len());
    assert!(blanked.starts_with("declare module 'svelte' {\n}"));
    assert!(!blanked.contains("*.svelte"));
    assert!(blanked.ends_with("\n\nexport {};\n"));
}

#[test]
fn types_without_the_module_stay_as_they_are() {
    let types = "declare module 'svelte' {}\n";
    assert_eq!(without_any_component_module(types.to_owned()), types);
}

#[test]
fn a_dynamic_import_s_relative_specifier_is_an_import_too() {
    let source = "<script>\n\timport A from './a.svelte';\n\texport { b } from './b.js';\n\t\
        const c = import('./c.svelte');\n\tasync function d() {\n\t\tawait import('./d.svelte');\n\t\
        \timport(name);\n\t\timport('pkg');\n\t}\n</script>\n";
    let component = rsvelte_svelte_syntax::parse::parse(source).expect("valid Svelte source");
    let found: Vec<_> = super::relative_imports(&component)
        .into_iter()
        .map(|(span, specifier)| (span.text(source).to_owned(), specifier))
        .collect();
    let expected = ["./a.svelte", "./b.js", "./c.svelte", "./d.svelte"];
    assert_eq!(
        found,
        expected.map(|s| (format!("'{s}'"), s.to_owned())).to_vec()
    );
}
