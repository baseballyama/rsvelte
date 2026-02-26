fn main() {
    let tests = [
        "general-siblings-combinator-slot-global",
        "general-siblings-combinator-rendertag-global",
        "siblings-combinator-component",
        "siblings-combinator-each-else-nested",
        "root",
        "has",
        "has-with-render-tag",
        "nested-css",
        "nesting-selectors",
        "comments-after-last-selector",
        "selectedcontent",
        "snippets",
        "unicode-identifier",
    ];
    for test_name in tests {
        let input_path = format!(
            "svelte/packages/svelte/tests/css/samples/{}/input.svelte",
            test_name
        );
        let input = match std::fs::read_to_string(&input_path) {
            Ok(s) => s,
            Err(_) => continue,
        };
        let options = svelte_compiler_rust::CompileOptions {
            generate: svelte_compiler_rust::GenerateMode::Client,
            filename: Some("input.svelte".to_string()),
            css: svelte_compiler_rust::compiler::CssMode::External,
            ..Default::default()
        };
        match svelte_compiler_rust::compile(&input, options) {
            Ok(r) => {
                let css = r.css.map(|c| c.code).unwrap_or_default();
                println!("=== {} ===\n{}\n===END===\n", test_name, css);
            }
            Err(e) => println!("=== {} === ERROR: {:?}", test_name, e),
        }
    }
}
