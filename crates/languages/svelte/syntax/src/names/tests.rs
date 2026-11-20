#[test]
fn component_names_keep_filename_rules() {
    for (filename, expected) in [
        ("input.svelte", "Input"),
        ("button-group/index.svelte", "Button_group"),
        ("src/index.svelte", "Index"),
        (r"C:\ui\index.svelte", "Ui"),
        ("foo.sveltebar.svelte", "Foobar_svelte"),
        ("1-test.svelte", "__test"),
        ("ß.svelte", "SS"),
        ("no-extension", "No_extension"),
    ] {
        assert_eq!(super::component_name(filename), expected);
    }
}

#[test]
fn sanitize_identifier_replaces_what_upstream_s_invalid_identifier_regex_does() {
    // Node: `name.replace(/(^[^a-zA-Z_$]|[^a-zA-Z0-9_$])/g, "_")`.
    for (name, expected) in [
        ("count", "count"),
        ("1st", "_st"),
        ("a-b", "a_b"),
        ("é1", "_1"),
        ("😀x", "__x"),
        ("9😀", "___"),
        ("$_a1", "$_a1"),
        ("", ""),
    ] {
        assert_eq!(super::sanitize_identifier(name), expected, "{name}");
    }
}

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
