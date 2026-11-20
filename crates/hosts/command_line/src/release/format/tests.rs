use serde_json::json;

use super::*;

#[test]
fn the_svelte_options_are_prettiers_without_its_plumbing() {
    let options = svelte_options(&json!({
        "printWidth": 100,
        "useTabs": true,
        "parser": "svelte",
        "filepath": "/a/App.svelte",
        "_useSveltePlugin": 1,
        "svelteIndentScriptAndStyle": false,
    }))
    .unwrap();
    assert_eq!(options.print_width, 100);
    assert!(options.use_tabs);
    assert!(!options.svelte_indent_script_and_style);
}

#[test]
fn a_value_the_svelte_formatter_does_not_print_is_an_error() {
    let error = Svelte
        .format("<p>a</p>\n", &json!({ "printWidth": 80, "semi": false }))
        .unwrap_err();
    assert!(error.contains("`semi`"), "{error}");
}
