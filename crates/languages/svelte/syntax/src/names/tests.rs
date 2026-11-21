#[test]
fn no_svelte_meta_tag_is_a_component_name() {
    for name in [
        "svelte:self",
        "svelte:component",
        "svelte:element",
        "svelte:options",
    ] {
        assert!(!super::is_component_name(name), "{name}");
    }
}
