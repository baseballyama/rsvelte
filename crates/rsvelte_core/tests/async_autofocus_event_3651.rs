use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

const SOURCE: &str = r#"<script>
	const autofocus = () => Promise.resolve(true);
	const handler = () => Promise.resolve(() => {});
</script>

<input autofocus={await autofocus()} />
<button onclick={await handler()}>click</button>
"#;

fn client(dev: bool) -> String {
    compile(
        SOURCE,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

#[test]
fn awaited_autofocus_and_event_values_emit_parseable_javascript() {
    for dev in [false, true] {
        let output = client(dev);
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();

        assert!(
            !parsed.panicked && parsed.diagnostics.is_empty(),
            "client dev={dev} output must parse:\n{output}\ndiagnostics: {:?}",
            parsed.diagnostics
        );
        assert!(
            !output.contains("$.derived(() => $0)"),
            "the local async parameter must not be captured by an init-level derived:\n{output}"
        );
    }
}

#[test]
fn awaited_values_are_resolved_before_the_runtime_calls() {
    let output = client(false);

    let autofocus_call = output
        .lines()
        .find(|line| line.contains("$.autofocus"))
        .unwrap_or_else(|| panic!("no autofocus call:\n{output}"));
    assert!(
        autofocus_call.contains("$0") && !autofocus_call.contains("await "),
        "autofocus must receive the resolved memoized value:\n{autofocus_call}"
    );

    let event_call = output
        .lines()
        .find(|line| line.contains("$.delegated") && line.contains("'click'"))
        .unwrap_or_else(|| panic!("no delegated click registration:\n{output}"));
    assert!(
        event_call.contains("$0") && !event_call.contains("await "),
        "the event must receive the resolved memoized handler:\n{event_call}"
    );

    // Upstream's arrow builder deliberately collapses `async () => await x()`
    // to `() => x()` when `x()` contains no nested await. The async-values
    // argument is still the third `template_effect` argument, and the runtime
    // resolves the promises before passing `$0` to either callback.
    assert!(
        output.contains("[() => autofocus()]") && output.contains("[() => handler()]"),
        "both awaited expressions must live in async memoizer slots:\n{output}"
    );
}
