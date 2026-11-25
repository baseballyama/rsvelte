use super::{default_export_name, reversed_prop_name};

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

/// The instance names svelte2tsx 0.7.63 gives these tags, less `$$_` and the depth: it reads
/// `sanitizePropName` by UTF-16 code unit, so an astral character is two `_`.
#[test]
fn an_instance_is_named_by_the_tag_s_utf16_code_units_reversed() {
    for (tag, name) in [
        ("Leaf", "faeL"),
        ("ui.Card", "draC_iu"),
        ("\u{dc}b", "b_"),
        ("X.\u{1d49c}b", "b___X"),
    ] {
        assert_eq!(reversed_prop_name(tag).collect::<String>(), name, "{tag}");
    }
}
