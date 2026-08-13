#![cfg(feature = "mdsvex")]

use std::{
    io::Write,
    process::{Command, Stdio},
};

use rsvelte_preprocess::mdsvex::native::{render_markdown, render_standard};

fn official(source: &str) -> String {
    const SCRIPT: &str = r#"
        import { mdsvex } from 'mdsvex';
        let input = '';
        for await (const chunk of process.stdin) input += chunk;
        const pp = mdsvex({ extensions: ['.md'], highlight: false });
        const result = await pp.markup({ content: JSON.parse(input), filename: 'fixture.md' });
        process.stdout.write(result.code);
    "#;
    let mut child = Command::new("node")
        .args(["--input-type=module", "-e", SCRIPT])
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();
    child
        .stdin
        .take()
        .unwrap()
        .write_all(serde_json::to_string(source).unwrap().as_bytes())
        .unwrap();
    let output = child.wait_with_output().unwrap();
    assert!(output.status.success());
    String::from_utf8(output.stdout).unwrap()
}

fn assert_parity(name: &str, source: &str) {
    assert_eq!(render_markdown(source), official(source), "{name}");
}

fn official_with_data(source: &str) -> (String, serde_json::Value) {
    const SCRIPT: &str = r#"
        import { mdsvex } from 'mdsvex';
        let input = '';
        for await (const chunk of process.stdin) input += chunk;
        const pp = mdsvex({ extensions: ['.md'], highlight: false });
        const result = await pp.markup({ content: JSON.parse(input), filename: 'fixture.md' });
        process.stdout.write(JSON.stringify({ code: result.code, data: result.data }));
    "#;
    let mut child = Command::new("node")
        .args(["--input-type=module", "-e", SCRIPT])
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();
    child
        .stdin
        .take()
        .unwrap()
        .write_all(serde_json::to_string(source).unwrap().as_bytes())
        .unwrap();
    let output = child.wait_with_output().unwrap();
    assert!(output.status.success());
    let result: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    (
        result["code"].as_str().unwrap().to_owned(),
        result["data"]["fm"].clone(),
    )
}

#[test]
fn standard_markdown_matches_mdsvex_fixtures() {
    for (name, source) in [
        ("simple-paragraph", "Hello, world!"),
        (
            "strong",
            "**important**\n\n__important__\n\nreally **freaking**strong",
        ),
        ("atx-heading", "# This is an H1\n\n## This is an H2"),
        ("unordered-list", "* Red\n* Green\n* Blue"),
        ("ordered-list", "1. One\n2. Two\n3. Three"),
        ("blockquote", "> A quotation\n>\n> With two paragraphs"),
        (
            "inline-code",
            "Please don't use any `<blink>` tags.\n\n`&#8212;` is the decimal-encoded equivalent of `&mdash;`.\n\nthis `inline **code** has ___magic___` chars",
        ),
        ("template-expression", "Hello {name}"),
        ("component", "<Component answer={42} />"),
        ("component-in-heading", "## Hello {name}"),
        (
            "svelte-script",
            "<script>let answer = 42;</script>\n\n# {answer}",
        ),
        ("link-expression", "[link](/things/{id})"),
    ] {
        assert_parity(name, source);
    }
}

#[test]
fn yaml_frontmatter_matches_mdsvex_output_and_data() {
    for (name, source) in [
        ("basic", "---\ntitle: Hello\nprice: '$10'\n---\n\n# Heading"),
        ("hyphenated-key", "---\nfoo-bar: 1\n---\n\nHi"),
        ("script-tag", "---\ntitle: '<script>'\n---\n\nHi"),
    ] {
        let native = render_standard(source);
        let (code, data) = official_with_data(source);
        assert_eq!(native.code, code, "{name}: code");
        assert_eq!(native.data, Some(data), "{name}: data");
    }
}
