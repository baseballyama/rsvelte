use super::*;

#[test]
fn a_component_compiles_to_the_outcome_of_the_addon() {
    let json = compile(
        "<p>{a}</p><style>p { color: red }</style>",
        Some("App.svelte".to_owned()),
        Some("server".to_owned()),
        None,
    )
    .unwrap();
    assert!(json.starts_with(r#"{"compiled":{"js":{"code":"#), "{json}");
    assert!(json.contains(r#""css":{"code":"p.svelte-"#), "{json}");
    assert!(json.ends_with(r#""warnings":[]}}"#), "{json}");
}

#[test]
fn an_error_has_the_lines_columns_and_characters_of_its_ends() {
    let json = compile("é\n<p>{</p>", None, None, None).unwrap();
    assert!(
        json.starts_with(r#"{"error":{"code":"js_parse_error","#),
        "{json}"
    );
    assert!(
        json.contains(r#""start":{"line":2,"column":4,"character":6}"#),
        "{json}"
    );
}

#[test]
fn a_module_compiles_without_a_stylesheet() {
    let json = compile_module("export const a = $state(1);", None, None).unwrap();
    assert!(json.contains(r#""css":null"#), "{json}");
    assert!(json.contains("export const a = 1;"), "{json}");
}

#[test]
fn a_component_parses_to_its_syntax_tree_or_its_report() {
    let parsed = parse("<p>{a}</p>");
    assert!(parsed.syntax_tree.unwrap().starts_with(r#"{"css":null"#));
    let failed = parse("<p>{</p>");
    assert!(failed.syntax_tree.is_none());
    assert!(
        failed
            .error
            .unwrap()
            .starts_with(r#"{"code":"js_parse_error""#)
    );
}
