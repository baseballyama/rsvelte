//! Native (no-Node) tests for the modular-css `<style type="text/m-css">` path,
//! validated byte-for-byte against `@modular-css/processor`'s output for the
//! upstream specimens (`submodules/modular-css/packages/svelte/test/specimens`).

#![cfg(feature = "modular-css")]

use std::path::PathBuf;

use rsvelte_preprocess::bridge::{BridgeOptions, MarkupBridge};
use rsvelte_preprocess::modular_css::process;

fn submodule() -> Option<PathBuf> {
    let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../submodules/modular-css")
        .canonicalize()
        .ok()?;
    dir.exists().then_some(dir)
}

fn run(specimen: &str) -> (String, String) {
    let submodule = submodule().expect("modular-css submodule");
    let path = submodule
        .join("packages/svelte/test/specimens")
        .join(specimen);
    let content = std::fs::read_to_string(&path).unwrap();
    let config = MarkupBridge {
        options: serde_json::json!({}),
        bridge: BridgeOptions {
            cwd: Some(submodule),
            ..Default::default()
        },
    };
    let out = process(&content, Some(path.to_str().unwrap()), &config).expect("native process");
    (out.code, out.css)
}

#[test]
fn style_block_with_composes() {
    if submodule().is_none() {
        eprintln!("skipping: modular-css submodule not checked out");
        return;
    }
    let (markup, css) = run("style.svelte");
    assert_eq!(
        markup,
        "<div class=\"mc_flex mc_wrapper\">\n    <h1 class=\"mc_flex mc_fooga mc_hd\">Head</h1>\n    <div class=\"mc_fooga mc_wooga mc_bd\">\n        <p class=\"{bool ? \"mc_text\" : \"mc_active\" }\">Text</p>\n    </div>\n</div>\n\n<script>\nexport default {\n    data : () => ({\n        bool : true\n    })\n};\n</script>\n"
    );
    assert_eq!(
        css,
        "/* packages/svelte/test/specimens/simple.css */\n.mc_fooga {\n    color: red;\n}\n/* packages/svelte/test/specimens/dependencies.css */\n.mc_wooga {\n    background: blue;\n}\n/* packages/svelte/test/specimens/style.svelte */\n.mc_flex {\n        display: flex;\n    }\n.mc_text {\n        color: #000;\n    }\n.mc_active {\n        color: #F00;\n    }\n"
    );
}

#[test]
fn unquoted_class_attributes() {
    if submodule().is_none() {
        eprintln!("skipping: modular-css submodule not checked out");
        return;
    }
    let (markup, css) = run("unquoted.svelte");
    assert_eq!(
        markup,
        "<div class=\"mc_a mc_b\">\n    I'm not quoted lol\n    <div class=\"mc_a\">Me either!</div>\n</div>\n\n<div class=\"mc_a mc_b\">\n    But I am!\n</div>\n\n"
    );
    assert_eq!(
        css,
        "/* packages/svelte/test/specimens/unquoted.svelte */\n.mc_a {\n        color: red;\n    }\n"
    );
}

#[test]
fn ignores_style_without_m_css_attribute() {
    if submodule().is_none() {
        eprintln!("skipping: modular-css submodule not checked out");
        return;
    }
    let (markup, css) = run("style-no-attribute.svelte");
    assert_eq!(markup, "<style>\n    .no { color: red; }\n</style>\n\n");
    assert_eq!(
        css,
        "/* packages/svelte/test/specimens/style-no-attribute.svelte */\n.mc_yes { color: blue; }\n"
    );
}
