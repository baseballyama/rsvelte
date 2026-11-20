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
