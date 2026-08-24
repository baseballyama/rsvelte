use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

/// A custom-element attribute took the one attribute path that skipped the
/// memoizer, so an `await` in its value was inlined into the `template_effect`
/// arrow instead of landing in `async_values()` as `async () => …`. The arrow is
/// not async, so the emitted module is not JavaScript any parser accepts —
/// output that a text-comparison gate scores as a mismatch and a parse gate
/// rejects outright.
const SOURCE: &str = "<script>\n\tconst foo = $derived(await 'foo');\n</script>\n\n<async-custom-element {foo} bar={await 'bar'}></async-custom-element>";

#[test]
fn custom_element_await_attribute_emits_parseable_output() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let output = compile(
            SOURCE,
            CompileOptions {
                generate,
                experimental: ExperimentalOptions { r#async: true },
                ..Default::default()
            },
        )
        .unwrap_or_else(|error| panic!("compile failed for {generate:?}: {error:?}"))
        .js
        .code;

        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
        assert!(
            !parsed.panicked && parsed.diagnostics.is_empty(),
            "{generate:?} output must parse:\n{output}\ndiagnostics: {:?}",
            parsed.diagnostics
        );
    }
}

#[test]
fn custom_element_await_attribute_reaches_the_async_values_slot() {
    let output = compile(
        SOURCE,
        CompileOptions {
            generate: GenerateMode::Client,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code;

    assert!(
        output.contains("$.set_custom_element_data"),
        "expected the custom-element attribute path:\n{output}"
    );
    // `output.contains("async () =>")` does NOT discriminate: the unfixed output
    // already carries one from the `$.run([async () => …])` that lowers the
    // top-level `$derived(await …)`. What separates the two is that the awaited
    // attribute value must not survive INSIDE the `set_custom_element_data`
    // call — it belongs in the memoizer's async slot, with a `$0` in its place.
    let bar_call = output
        .lines()
        .find(|line| line.contains("$.set_custom_element_data") && line.contains("'bar'"))
        .unwrap_or_else(|| panic!("no set_custom_element_data for `bar`:\n{output}"));
    assert!(
        !bar_call.contains("await "),
        "the awaited value must be memoized, not inlined into the call:\n{bar_call}"
    );
    // The shape is the OFFICIAL 5.56.10 output, read off the upstream compiler
    // rather than off this port: `await 'bar'` collapses to `() => 'bar'` because
    // the awaited operand holds no further await. Upstream 5.56.9 emitted the
    // unparseable form instead, which is why the sample only appears in 5.56.10.
    assert!(
        output.contains("[() => 'bar']"),
        "expected the awaited value in the memoizer's async slot:\n{output}"
    );
}

#[test]
#[ignore = "prints the output for manual comparison against the upstream compiler"]
fn print_output_for_review() {
    let output = compile(
        SOURCE,
        CompileOptions {
            generate: GenerateMode::Client,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap()
    .js
    .code;
    println!("{output}");
}
