//! Fixture tests for the JS-fallback (Node-bridge) preprocessor ports:
//! mdsvex, svelte-preprocess-markdown, @modular-css/svelte, and @nvl/sveltex.
//!
//! Each test drives the rsvelte `PreprocessorGroup` (which bridges to the
//! installed upstream tool) and asserts the upstream-defined output — the
//! drop-in contract from the port plan (§4.3). Tests skip with a notice when
//! the upstream tool / Node is unavailable.

#![cfg(all(
    feature = "mdsvex",
    feature = "markdown",
    feature = "modular-css",
    feature = "sveltex"
))]

use std::path::PathBuf;

use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_core::compiler::preprocess::types::PreprocessorGroup;
use rsvelte_preprocess::bridge::{BridgeOptions, MarkupBridge};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .canonicalize()
        .unwrap()
}

fn bridge_at(dir: PathBuf, options: serde_json::Value) -> MarkupBridge {
    MarkupBridge {
        options,
        bridge: BridgeOptions {
            cwd: Some(dir),
            ..Default::default()
        },
    }
}

fn run(template: &str, filename: &str, group: PreprocessorGroup) -> Result<String, String> {
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    rt.block_on(async {
        preprocess(
            template.to_string(),
            vec![group],
            Some(filename.to_string()),
        )
        .await
        .map(|p| p.code)
        .map_err(|e| e.to_string())
    })
}

/// Skip a test (returning `None`) when the tool isn't installed.
fn guard(result: Result<String, String>) -> Option<String> {
    match result {
        Ok(code) => Some(code),
        Err(msg) if msg.contains("Cannot find module") || msg.contains("failed to spawn") => {
            eprintln!("skipping: bridge tool unavailable: {msg}");
            None
        }
        Err(msg) => panic!("bridge error: {msg}"),
    }
}

#[test]
fn mdsvex_renders_markdown() {
    let group = rsvelte_preprocess::mdsvex(bridge_at(repo_root(), serde_json::json!({})));
    let Some(out) = guard(run("# Hello\n\nsome **bold** text", "test.svx", group)) else {
        return;
    };
    assert!(out.contains("<h1>Hello</h1>"), "{out}");
    assert!(out.contains("<strong>bold</strong>"), "{out}");
}

#[test]
fn markdown_renders_component_in_markdown() {
    let group = rsvelte_preprocess::markdown(bridge_at(repo_root(), serde_json::json!(null)));
    let Some(out) = guard(run("# Hello\n\nsome **bold** text", "test.md", group)) else {
        return;
    };
    assert!(out.contains("<h1>Hello</h1>"), "{out}");
    assert!(out.contains("<strong>bold</strong>"), "{out}");
}

#[test]
fn sveltex_applies_structure_transform() {
    let group = rsvelte_preprocess::sveltex(bridge_at(repo_root(), serde_json::json!({})));
    let Some(out) = guard(run("# Hi\n\nsome *text*", "test.sveltex", group)) else {
        return;
    };
    // With default (`none`) backends sveltex keeps the Markdown verbatim but
    // injects its Svelte-structure scaffolding.
    assert!(out.contains("# Hi"), "{out}");
    assert!(out.contains("<script module>"), "{out}");
}

#[test]
fn modular_css_extracts_style_block() {
    use rsvelte_preprocess::modular_css::process;

    let submodule = repo_root().join("submodules/modular-css");
    if !submodule.exists() {
        eprintln!("skipping: modular-css submodule not checked out");
        return;
    }
    let specimen = submodule.join("packages/svelte/test/specimens/style.svelte");
    let content = std::fs::read_to_string(&specimen).unwrap();

    let config = bridge_at(
        submodule.clone(),
        serde_json::json!({ "testNamer": true, "values": true }),
    );
    let out = match process(&content, Some(specimen.to_str().unwrap()), &config) {
        Ok(out) => out,
        Err(msg) if msg.contains("Cannot find module") || msg.contains("failed to spawn") => {
            eprintln!("skipping: @modular-css/svelte unavailable: {msg}");
            return;
        }
        Err(msg) => panic!("modular-css error: {msg}"),
    };

    let expected_markup = "<div class=\"mc_flex mc_wrapper\">\n    <h1 class=\"mc_flex mc_fooga mc_hd\">Head</h1>\n    <div class=\"mc_fooga mc_wooga mc_bd\">\n        <p class=\"{bool ? \"mc_text\" : \"mc_active\" }\">Text</p>\n    </div>\n</div>\n\n<script>\nexport default {\n    data : () => ({\n        bool : true\n    })\n};\n</script>\n";
    assert_eq!(out.code, expected_markup);

    let expected_css = "/* packages/svelte/test/specimens/simple.css */\n.mc_fooga {\n    color: red;\n}\n/* packages/svelte/test/specimens/dependencies.css */\n.mc_wooga {\n    background: blue;\n}\n/* packages/svelte/test/specimens/style.svelte */\n.mc_flex {\n        display: flex;\n    }\n.mc_text {\n        color: #000;\n    }\n.mc_active {\n        color: #F00;\n    }\n";
    assert_eq!(out.css, expected_css);
}
