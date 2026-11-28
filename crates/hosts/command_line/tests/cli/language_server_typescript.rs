//! TypeScript's features in components, which `rsvelte lsp` gets from the type checker that
//! `rsvelte typecheck` runs.

use std::path::Path;

use serde_json::{Value, json};

use crate::Scratch;
use crate::language_server::{Client, uri};
use crate::typecheck::typecheck_config;

const TSCONFIG: &str = r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#;

const APP: &str = "<script lang=\"ts\">\n\
                   \timport { double } from './math';\n\
                   \tlet count: number = 1;\n\
                   \tconst twice = double(count);\n\
                   \tconst label = count.toFixed(1);\n\
                   </script>\n\
                   \n\
                   <p>{twice} {label}</p>\n";

/// A Svelte project that `rsvelte typecheck` checks with the test checker, and with the content
/// mapper a release installs, which projects the components the editor opens.
fn project() -> Scratch {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    Scratch::new(&[
        ("rsvelte.config.json", &config),
        ("tsconfig.json", TSCONFIG),
        ("node_modules/.keep", ""),
        ("src/App.svelte", APP),
        (
            "src/math.ts",
            "export function double(n: number): number {\n\treturn n * 2;\n}\n",
        ),
        ("src/main.ts", "export const n: number = 1;\n"),
    ])
}

fn at(path: &Path, line: u64, character: u64) -> Value {
    json!({
        "textDocument": { "uri": uri(path) },
        "position": { "line": line, "character": character },
    })
}

#[test]
fn hover_definition_and_completion_in_a_component_come_from_the_checker() {
    let root = project();
    let (mut client, initialized) = Client::start(&root, false);
    let capabilities = &initialized["capabilities"];
    for capability in ["hoverProvider", "completionProvider", "definitionProvider"] {
        assert!(
            !capabilities[capability].is_null(),
            "{capability} in {capabilities}"
        );
    }
    let app = root.join("src/App.svelte");
    client.open(&app, APP);
    let hover = client.request("textDocument/hover", &at(&app, 2, 6));
    let contents = hover["contents"].to_string();
    assert!(contents.contains("let count: number"), "{hover}");
    let definition = client.request("textDocument/definition", &at(&app, 3, 16));
    let math = uri(&root.join("src/math.ts"));
    let targets = definition.as_array().expect("locations");
    assert!(
        targets.iter().any(|target| target["uri"] == math),
        "{definition}"
    );
    let completion = client.request("textDocument/completion", &at(&app, 4, 21));
    let items = completion["items"].as_array().or(completion.as_array());
    let labels: Vec<&str> = (items.expect("items").iter())
        .filter_map(|item| item["label"].as_str())
        .collect();
    assert!(labels.contains(&"toFixed"), "{labels:?}");
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn a_file_that_is_no_component_gets_no_answer_from_the_checker() {
    let root = project();
    let (mut client, _) = Client::start(&root, false);
    let main = root.join("src/main.ts");
    client.open(&main, "export const n: number = 1;\n");
    assert_eq!(
        client.request("textDocument/hover", &at(&main, 0, 13)),
        Value::Null
    );
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn without_typescript_the_editor_is_offered_none_of_its_features() {
    let root = project();
    let (client, initialized) = Client::start_with(&root, false, &["--no-typescript"]);
    let capabilities = &initialized["capabilities"];
    for capability in ["hoverProvider", "completionProvider", "definitionProvider"] {
        assert!(
            capabilities[capability].is_null(),
            "{capability} in {capabilities}"
        );
    }
    assert_eq!(client.exit(), Some(0));
}
