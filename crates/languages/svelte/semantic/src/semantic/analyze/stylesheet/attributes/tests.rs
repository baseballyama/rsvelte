#[test]
fn attribute_case_rules_keep_ascii_folding_and_reject_other_names() {
    for name in [
        "accept-charset",
        "autocapitalize",
        "autocomplete",
        "behavior",
        "charset",
        "crossorigin",
        "decoding",
        "dir",
        "direction",
        "draggable",
        "enctype",
        "enterkeyhint",
        "fetchpriority",
        "formenctype",
        "formmethod",
        "formtarget",
        "hidden",
        "http-equiv",
        "inputmode",
        "kind",
        "loading",
        "method",
        "preload",
        "referrerpolicy",
        "rel",
        "rev",
        "role",
        "rules",
        "scope",
        "shape",
        "spellcheck",
        "target",
        "translate",
        "type",
        "valign",
        "wrap",
    ] {
        assert!(super::case_insensitive(name), "{name}");
        assert!(
            super::case_insensitive(&name.to_ascii_uppercase()),
            "{name}"
        );
    }
    for name in [
        "class",
        "id",
        "data-label",
        "data-state",
        "týpe",
        "typ",
        "types",
    ] {
        assert!(!super::case_insensitive(name), "{name}");
    }
}
