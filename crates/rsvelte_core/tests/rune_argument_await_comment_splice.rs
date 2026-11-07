//! A comment in front of an `await` that is a rune's argument (`$derived(/* c */
//! await x)`, `$state(...)`, an assignment's right-hand side) must not corrupt
//! the client output.
//!
//! In dev the `await` wrapper reaches back over that comment, so its edit
//! started before the argument; the rune's own edit drained only the argument,
//! left the wrapper pending, and the two overlapping edits were both spliced.
//! Without dev, the `$.save` pass read the `/` of a comment after `await` as a
//! division and emitted `$.save()` with no argument.
//!
//! Expected substrings are the official compiler's bytes (Svelte 5.57.3,
//! `experimental.async`, filename `T.svelte`).

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn compile_async(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed ({generate:?}, dev={dev}): {error:?}"))
    .js
    .code
}

#[track_caller]
fn assert_parses(code: &str) {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, code, SourceType::mjs()).parse();
    assert!(
        !parsed.fatal_error && parsed.diagnostics.is_empty(),
        "generated JavaScript must parse:\n{code}"
    );
}

#[track_caller]
fn assert_contains(out: &str, expected: &str) {
    assert!(out.contains(expected), "expected `{expected}`. Got:\n{out}");
}

fn script(body: &str, template: &str) -> String {
    format!("<script>\n  let {{ load }} = $props();\n{body}</script>\n{template}\n")
}

#[test]
fn a_block_comment_before_a_derived_await_stays_inside_the_wrap() {
    let out = compile_async(
        &script("  let a = $derived(/* c */ await load());\n", "{a}"),
        GenerateMode::Client,
        true,
    );
    assert_parses(&out);
    assert_contains(
        &out,
        "async () => a = await $.async_derived(async () => (/* c */ await $.track_reactivity_loss($$props.load()))(), 'a', 'T.svelte:3:10')",
    );
}

#[test]
fn a_jsdoc_cast_around_a_derived_await_stays_inside_the_wrap() {
    let out = compile_async(
        &script(
            "  let b = $derived(/** @type {R} */ (await load()));\n",
            "{b}",
        ),
        GenerateMode::Client,
        true,
    );
    assert_parses(&out);
    assert_contains(
        &out,
        "async () => b = await $.async_derived(async () => (/** @type {R} */ (await $.track_reactivity_loss($$props.load())))(), 'b', 'T.svelte:3:10')",
    );
}

#[test]
fn a_comment_before_a_state_await_stays_inside_the_wrap() {
    let out = compile_async(
        &script("  let a = $state(/* c */ await load());\n", "{a}"),
        GenerateMode::Client,
        true,
    );
    assert_parses(&out);
    assert_contains(
        &out,
        "async () => a = $.tag_proxy($.proxy((/* c */ await $.track_reactivity_loss($$props.load()))()), 'a')",
    );
}

#[test]
fn a_comment_before_a_pickled_await_is_dropped_with_the_tracking_wrap() {
    let out = compile_async(
        &script(
            "  let a = $derived(/* c */ await load() + /* d */ await load());\n",
            "{a}",
        ),
        GenerateMode::Client,
        true,
    );
    assert_parses(&out);
    assert_contains(
        &out,
        "return (await $.save($$props.load()))() + (await $.save($$props.load()))();",
    );
}

#[test]
fn a_comment_after_await_is_not_read_as_a_division() {
    let out = compile_async(
        &script("  let c = $derived((await /* y */ load()) + 1);\n", "{c}"),
        GenerateMode::Client,
        false,
    );
    assert_parses(&out);
    assert_contains(&out, "return (await $.save($$props.load()))() + 1;");
}

#[test]
fn every_rune_argument_await_comment_shape_parses() {
    let cases = [
        script("  let a = $derived(/* c */ await load());\n", "{a}"),
        script(
            "  let a = $derived(\n    // c\n    await load()\n  );\n",
            "{a}",
        ),
        script("  let a = $derived(await /* c */ load());\n", "{a}"),
        script("  let a = $derived(await // c\n    load());\n", "{a}"),
        script("  let a = $derived(/* c */ (await load()).x);\n", "{a}"),
        script("  let { x } = $derived(/* c */ await load());\n", "{x}"),
        script("  let [p] = $derived(/* c */ await load());\n", "{p}"),
        script(
            "  let a = $derived(/* c */ await load()), b = $derived(/* d */ await load());\n",
            "{a}{b}",
        ),
        script(
            "  let a = $derived(/* c */ await load());\n  let b = $derived(a + /* d */ await load());\n",
            "{a}{b}",
        ),
        script("  let a = $state(/* c */ await load());\n", "{a}"),
        script("  let a = $state.raw(/* c */ await load());\n", "{a}"),
        script(
            "  let a = $state(0);\n  a = /* c */ await load();\n  let b = $derived(a === /* d */ await load());\n",
            "{a}{b}",
        ),
        script(
            "  let a = $state({ v: 0 });\n  a.v = /* c */ await load();\n",
            "{a.v}",
        ),
        script(
            "  let a = $derived((await load()) + /* x */ load());\n  let c = $derived((await /* y */ load()) + 1);\n",
            "{a}{c}",
        ),
    ];
    for source in &cases {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            for dev in [true, false] {
                assert_parses(&compile_async(source, generate, dev));
            }
        }
    }
}
