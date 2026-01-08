use std::fs;
use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};

fn main() {
    let input = fs::read_to_string(
        "svelte/packages/svelte/tests/css/samples/unused-selector-in-between/input.svelte",
    )
    .unwrap();

    let result = parse(&input, ParseOptions::default()).unwrap();

    if let Some(css) = &result.css {
        let json: serde_json::Value =
            serde_json::from_str(&serde_json::to_string(&css).unwrap()).unwrap();

        // Print full prelude structure
        if let Some(children) = json.get("children").and_then(|c| c.as_array()) {
            if let Some(rule) = children.first() {
                if let Some(prelude) = rule.get("prelude") {
                    println!("{}", serde_json::to_string_pretty(&prelude).unwrap());
                }
            }
        }
    }
}
