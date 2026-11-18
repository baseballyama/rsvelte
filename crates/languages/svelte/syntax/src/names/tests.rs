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
