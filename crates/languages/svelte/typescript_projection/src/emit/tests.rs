use super::default_export_name;

#[test]
fn a_component_is_named_from_its_file_as_svelte2tsx_names_it() {
    assert_eq!(
        default_export_name("src/lib/CitationTooltip.svelte"),
        "CitationTooltip__SvelteComponent_"
    );
    assert_eq!(
        default_export_name("src/routes/+page.svelte"),
        "Page__SvelteComponent_"
    );
    assert_eq!(
        default_export_name("src/lib/my-button_group.svelte"),
        "MyButtonGroup__SvelteComponent_"
    );
    assert_eq!(
        default_export_name("src/routes/[id].svelte"),
        "Id__SvelteComponent_"
    );
    assert_eq!(
        default_export_name("src/lib/Button.stories.svelte"),
        "Button__SvelteComponent_"
    );
    assert_eq!(
        default_export_name("src/lib/404.svelte"),
        "A4__SvelteComponent_"
    );
}
