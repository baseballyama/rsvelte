//! Regression test for module scripts skipping the dev `await` instrumentation
//! (baseballyama/rsvelte#2090).
//!
//! Upstream's `visitors/AwaitExpression.js` sits in the one client visitor map
//! that walks a component's `<script module>` and a `.svelte.(js|ts)` module
//! alike, so both get `(await $.track_reactivity_loss(X))()` in dev. rsvelte
//! ran the rewrite only from the instance-script batches, so `module_dev_tail_ast`
//! left module-side `await`s bare. The expectations below are the official
//! compiler's output.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_module};

fn compile_component(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn compile_svelte_js(src: &str, dev: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("store.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[track_caller]
fn assert_contains(out: &str, expected: &str) {
    assert!(out.contains(expected), "expected `{expected}`. Got:\n{out}");
}

#[test]
fn script_module_await_is_instrumented() {
    let src = "<script module>\n\texport async function load() {\n\t\tconst r = await fetch(\"/x\");\n\t\treturn r;\n\t}\n</script>\n\n<p>hi</p>";
    assert_contains(
        &compile_component(src, true),
        "(await $.track_reactivity_loss(fetch('/x')))()",
    );
}

/// A legacy component's `<script module>` is instrumented too: upstream has no
/// runes gate on the visitor.
#[test]
fn legacy_component_script_module_await_is_instrumented() {
    let src = "<script module>\n\texport async function load() {\n\t\treturn await fetch(\"/x\");\n\t}\n</script>\n\n<script>\n\texport let a = 1;\n</script>\n\n<p>{a}</p>";
    assert_contains(
        &compile_component(src, true),
        "(await $.track_reactivity_loss(fetch('/x')))()",
    );
}

#[test]
fn svelte_js_await_is_instrumented() {
    let out = compile_svelte_js(
        "export async function load() {\n\tconst r = await fetch(\"/x\");\n\treturn r;\n}",
        true,
    );
    assert_contains(&out, "(await $.track_reactivity_loss(fetch('/x')))()");
}

#[test]
fn nested_await_settles_innermost_first() {
    let out = compile_svelte_js(
        "export async function f() {\n\treturn await g(await h());\n}",
        true,
    );
    assert_contains(
        &out,
        "(await $.track_reactivity_loss(g((await $.track_reactivity_loss(h()))())))()",
    );
}

#[test]
fn await_operand_of_equality_settles_both() {
    let out = compile_svelte_js(
        "export async function f() {\n\treturn (await g()) === 1;\n}",
        true,
    );
    assert_contains(
        &out,
        "$.strict_equals((await $.track_reactivity_loss(g()))(), 1)",
    );
}

#[test]
fn svelte_ignore_suppresses_the_wrap() {
    // Both the line-comment and the block-comment (comma-separated) spellings,
    // pinning the `extract_svelte_ignore` delegation.
    for comment in [
        "// svelte-ignore await_reactivity_loss",
        "/* svelte-ignore await_reactivity_loss, other */",
    ] {
        let out = compile_svelte_js(
            &format!(
                "export async function f() {{\n\t{comment}\n\tconst r = await g();\n\treturn r;\n}}"
            ),
            true,
        );
        assert!(
            !out.contains("$.track_reactivity_loss"),
            "expected `{comment}` to suppress the wrap. Got:\n{out}"
        );
    }
}

/// Upstream attaches a leading comment to the outermost node that starts after
/// it and inherits the ignore through that node's whole subtree, so a comment on
/// an enclosing declaration suppresses every `await` inside it.
#[test]
fn svelte_ignore_on_an_ancestor_node_suppresses_the_wrap() {
    let out = compile_svelte_js(
        "// svelte-ignore await_reactivity_loss\nexport async function f() {\n\tconst r = await g();\n\treturn r;\n}",
        true,
    );
    assert!(
        !out.contains("$.track_reactivity_loss"),
        "expected the ancestor-level ignore to suppress the wrap. Got:\n{out}"
    );
}

/// The `await` lands several lines below the comment because the annotated
/// statement spans multiple lines.
#[test]
fn svelte_ignore_on_a_multiline_statement_suppresses_the_wrap() {
    let out = compile_svelte_js(
        "export async function f() {\n\t// svelte-ignore await_reactivity_loss\n\tconst r = [\n\t\tawait g()\n\t];\n\treturn r;\n}",
        true,
    );
    assert!(
        !out.contains("$.track_reactivity_loss"),
        "expected the multi-line statement's ignore to suppress the wrap. Got:\n{out}"
    );
}

#[test]
fn same_line_block_comment_svelte_ignore_suppresses_the_wrap() {
    for src in [
        "export async function f() {\n\tconst r = /* svelte-ignore await_reactivity_loss */ await g();\n\treturn r;\n}",
        "export async function f() {\n\t/* svelte-ignore await_reactivity_loss */ const r = await g();\n\treturn r;\n}",
    ] {
        let out = compile_svelte_js(src, true);
        assert!(
            !out.contains("$.track_reactivity_loss"),
            "expected the same-line block comment to suppress the wrap. In:\n{src}\nGot:\n{out}"
        );
    }
}

/// The same three forms through the runes instance-script path, which reaches
/// the rewrite from `ast_state_transform` rather than a tail batch.
#[test]
fn instance_script_honours_the_ancestor_and_block_comment_forms() {
    for script in [
        "// svelte-ignore await_reactivity_loss\n\tasync function f() {\n\t\treturn await g();\n\t}",
        "\tasync function f() {\n\t\t// svelte-ignore await_reactivity_loss\n\t\tconst r = [\n\t\t\tawait g()\n\t\t];\n\t\treturn r;\n\t}",
        "\tasync function f() {\n\t\tconst r = /* svelte-ignore await_reactivity_loss */ await g();\n\t\treturn r;\n\t}",
    ] {
        let src =
            format!("<script>\n\tlet count = $state(0);\n{script}\n</script>\n\n<p>{{count}}</p>");
        let out = compile_component(&src, true);
        assert!(
            !out.contains("$.track_reactivity_loss"),
            "expected the ignore to suppress the wrap. In:\n{src}\nGot:\n{out}"
        );
    }
}

#[test]
fn svelte_ignore_naming_other_codes_does_not_suppress() {
    let out = compile_svelte_js(
        "export async function f() {\n\t// svelte-ignore state_referenced_locally\n\tconst r = await g();\n\treturn r;\n}",
        true,
    );
    assert_contains(&out, "$.track_reactivity_loss(g())");
}

#[test]
fn non_dev_module_output_is_untouched() {
    let out = compile_svelte_js(
        "export async function f() {\n\treturn await fetch(\"/x\");\n}",
        false,
    );
    assert!(
        !out.contains("$.track_reactivity_loss"),
        "unexpected wrap in non-dev output. Got:\n{out}"
    );

    let src = "<script module>\n\texport async function load() {\n\t\treturn await fetch(\"/x\");\n\t}\n</script>\n\n<p>hi</p>";
    let out = compile_component(src, false);
    assert!(
        !out.contains("$.track_reactivity_loss"),
        "unexpected wrap in non-dev output. Got:\n{out}"
    );
}

/// The wrapper contains an `await` of its own, so a fixed-point batch that did
/// not recognise its own marker would re-wrap it on every iteration.
#[test]
fn instrumentation_is_idempotent() {
    let out = compile_svelte_js(
        "export async function f() {\n\treturn await fetch(\"/x\");\n}",
        true,
    );
    assert_eq!(
        out.matches("$.track_reactivity_loss").count(),
        1,
        "in:\n{out}"
    );
}
