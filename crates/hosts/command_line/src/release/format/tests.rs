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

#[test]
fn an_option_oxfmt_would_apply_to_a_svelte_file_and_the_formatter_does_not_is_an_error() {
    let configured = |config: Value| {
        let plugin = json!({ "config": config, "filepath": "/a/App.svelte" }).to_string();
        json!({ "printWidth": 80, "_oxfmtPluginOptionsJson": plugin })
    };
    for (options, name) in [
        (
            json!({ "printWidth": 80, "_useTailwindPlugin": 1, "tailwindFunctions": ["cn"] }),
            "`sortTailwindcss`",
        ),
        (configured(json!({ "sortImports": {} })), "`sortImports`"),
        (configured(json!({ "jsdoc": true })), "`jsdoc`"),
        (
            json!({ "printWidth": 80, "astroAllowShorthand": true }),
            "`astroAllowShorthand`",
        ),
    ] {
        let error = Svelte.format("<p>a</p>\n", &options).unwrap_err();
        assert!(error.contains(name), "{error}");
    }
    let off = configured(json!({ "sortImports": false, "jsdoc": null, "semi": true }));
    assert_eq!(Svelte.format("<p>a</p>\n", &off).unwrap(), "<p>a</p>\n");
}

#[test]
fn an_error_is_at_the_line_and_the_column_an_editor_shows() {
    let error = Svelte
        .format("<p>\n日本語 {#if}</p>\n", &json!({ "printWidth": 80 }))
        .unwrap_err();
    assert!(error.ends_with("(2:9)"), "{error}");
}

#[test]
fn deeply_nested_text_formats_on_a_small_stack() {
    let depth = 5_000;
    let source = format!(
        "<script>\nlet a = {}{};\n</script>\n",
        "[".repeat(depth),
        "]".repeat(depth)
    );
    let worker = std::thread::Builder::new().stack_size(2 << 20);
    let formatted = worker
        .spawn(move || {
            Svelte
                .format(&source, &json!({ "printWidth": 80 }))
                .map(|_| ())
        })
        .unwrap()
        .join();
    assert!(formatted.is_ok(), "the formatter overflowed the stack");
}
