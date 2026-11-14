use super::fuzzymatch;

#[test]
fn a_misspelled_binding_is_matched_as_upstream_matches_it() {
    let names: Vec<&str> = super::super::BINDINGS.iter().map(|&(n, _)| n).collect();
    // From svelte 5.57.3's `fuzzymatch` over `Object.keys(binding_properties)`.
    for (query, expected) in [
        ("innerwidth", Some("innerWidth")),
        ("innerWidht", Some("innerWidth")),
        ("value", Some("value")),
        ("valeu", None),
        ("type", None),
        ("href", None),
        ("whatever", None),
        ("$store", None),
        ("clientwidth", Some("clientWidth")),
        ("scrolly", Some("scrollY")),
        ("inner-width", Some("innerWidth")),
        ("offsetwidth", Some("offsetWidth")),
        ("check", Some("checked")),
        ("textcontent", Some("textContent")),
        ("innerhtm", Some("innerHTML")),
        ("nope", None),
        ("値", None),
        ("focus", Some("focused")),
        ("ch.ecked", Some("checked")),
        ("a-b-c", None),
        ("durationn", Some("duration")),
        ("natural", None),
    ] {
        assert_eq!(fuzzymatch(query, &names), expected, "{query}");
    }
}
