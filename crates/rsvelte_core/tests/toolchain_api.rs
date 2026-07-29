use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};

use rsvelte_core::{
    CompileOptions, GenerateMode,
    compiler::CssHashInput,
    toolchain::{ByteRange, RuntimeTarget, ScriptKind, Toolchain},
};

fn options(generate: GenerateMode) -> CompileOptions {
    CompileOptions {
        generate,
        filename: Some("/workspace/src/Counter.svelte".to_string()),
        root_dir: Some("/workspace".to_string()),
        ..Default::default()
    }
}

fn assert_compile_result_eq(
    actual: &rsvelte_core::CompileResult,
    expected: &rsvelte_core::CompileResult,
) {
    assert_eq!(actual.js.code, expected.js.code);
    assert_eq!(actual.js.map, expected.js.map);
    assert_eq!(
        actual
            .css
            .as_ref()
            .map(|css| (&css.code, &css.map, css.has_global)),
        expected
            .css
            .as_ref()
            .map(|css| (&css.code, &css.map, css.has_global))
    );
    assert_eq!(
        serde_json::to_value(&actual.warnings).unwrap(),
        serde_json::to_value(&expected.warnings).unwrap()
    );
    assert_eq!(actual.metadata.runes, expected.metadata.runes);
}

#[test]
fn prepared_component_reuses_analysis_and_is_repeatable() {
    let source = r#"<script context="module" lang="ts">
  export const answer: number = 42;
</script>
<script lang="ts">
  let { label = "count", value = $bindable(0) }: {
    label?: string;
    value?: number;
  } = $props();
  const doubled = $derived(value * 2);
</script>
<button onclick={() => value++}>{label}: {value} / {doubled}</button>
<style>button { color: rebeccapurple; }</style>"#;

    let toolchain = Toolchain::new();
    let expected_client =
        rsvelte_core::compile(source, options(GenerateMode::Client)).expect("client compile");
    let expected_server =
        rsvelte_core::compile(source, options(GenerateMode::Server)).expect("server compile");

    // The initial target is frozen with the other analysis options, but each
    // emit explicitly selects its runtime target.
    let mut prepared = toolchain
        .prepare(source, options(GenerateMode::Server))
        .expect("prepare component");

    let client_first = prepared
        .compile(RuntimeTarget::Client)
        .expect("first client emit");
    let server_first = prepared
        .compile(RuntimeTarget::Server)
        .expect("first server emit");
    let client_second = prepared
        .compile(RuntimeTarget::Client)
        .expect("second client emit");
    let server_second = prepared
        .compile(RuntimeTarget::Server)
        .expect("second server emit");

    assert_compile_result_eq(&client_first, &expected_client);
    assert_compile_result_eq(&client_second, &expected_client);
    assert_compile_result_eq(&server_first, &expected_server);
    assert_compile_result_eq(&server_second, &expected_server);
}

#[test]
fn prepared_component_can_move_to_a_worker_and_compile_both() {
    let source = r#"<script>let count = $state(0);</script>
<button onclick={() => count++}>{count}</button>"#;
    let toolchain = Toolchain::new();
    let prepared = toolchain
        .prepare(source, options(GenerateMode::Client))
        .expect("prepare component");

    std::thread::scope(|scope| {
        scope
            .spawn(move || {
                let mut prepared = prepared;
                prepared.compile_both().expect("compile both on worker")
            })
            .join()
            .expect("worker did not panic");
    });
}

#[test]
fn preparation_runs_analysis_once_for_multiple_emits() {
    let css_hash_calls = Arc::new(AtomicUsize::new(0));
    let calls = Arc::clone(&css_hash_calls);
    let mut compile_options = options(GenerateMode::Client);
    compile_options.css_hash = Some(Arc::new(move |input: &CssHashInput| {
        calls.fetch_add(1, Ordering::SeqCst);
        let _ = input;
        "scope-from-embedder".to_string()
    }));

    let toolchain = Toolchain::new();
    let mut prepared = toolchain
        .prepare(
            "<h1>Hello</h1><style>h1 { color: red }</style>",
            compile_options,
        )
        .expect("prepare component");
    let calls_after_prepare = css_hash_calls.load(Ordering::SeqCst);
    assert!(calls_after_prepare > 0);
    assert_eq!(
        prepared.facts().css_scope_hash.as_deref(),
        Some("scope-from-embedder"),
        "prepared facts must expose the hash frozen by analysis"
    );

    prepared
        .compile(RuntimeTarget::Client)
        .expect("client emit");
    prepared
        .compile(RuntimeTarget::Server)
        .expect("server emit");
    assert_eq!(
        css_hash_calls.load(Ordering::SeqCst),
        calls_after_prepare,
        "emitting from a prepared component must not analyze again"
    );
}

#[test]
fn prepared_facts_are_neutral_and_source_anchored() {
    let source = r#"<script context="module">
const moduleValue = 1;
</script>
<script lang="ts">
let { value = $bindable(0) } = $props(); export { value as version };
</script>
<button>{value}</button>
<style>.button { color: red }</style>"#;
    let toolchain = Toolchain::new();
    let prepared = toolchain
        .prepare(source, options(GenerateMode::Client))
        .expect("prepare component");
    let facts = prepared.facts();

    assert!(facts.runes);
    assert_eq!(facts.scripts.len(), 2);
    assert_eq!(facts.scripts[0].kind, ScriptKind::Module);
    assert_eq!(facts.scripts[1].kind, ScriptKind::Instance);
    assert!(!facts.scripts[0].typescript);
    assert!(facts.scripts[1].typescript);
    assert_eq!(
        &source[facts.scripts[0].content.as_usize_range()],
        "\nconst moduleValue = 1;\n"
    );
    assert_eq!(
        &source[facts.scripts[1].content.as_usize_range()],
        "\nlet { value = $bindable(0) } = $props(); export { value as version };\n"
    );
    let style = facts.style.as_ref().expect("style region");
    assert_eq!(
        &source[style.content.as_usize_range()],
        ".button { color: red }"
    );
    assert!(
        facts
            .props
            .iter()
            .any(|prop| prop.name == "value" && prop.bindable)
    );
    assert!(facts.exports.iter().any(|export| export.name == "version"));
}

#[test]
fn fingerprint_exposes_independent_phase_abis() {
    let fingerprint = Toolchain::new().fingerprint();
    assert_eq!(fingerprint.rsvelte_version, env!("CARGO_PKG_VERSION"));
    assert_eq!(
        fingerprint.svelte_version,
        include_str!("../svelte-version.txt").trim()
    );
    assert!(fingerprint.toolchain_schema > 0);
    assert!(fingerprint.runtime_schema > 0);
    assert_eq!(fingerprint.facts_schema, 2);
}

#[test]
fn byte_ranges_enforce_order_at_construction() {
    let range = ByteRange::new(2, 5).expect("ordered range");
    assert_eq!(range.start(), 2);
    assert_eq!(range.end(), 5);
    assert_eq!(range.len(), 3);
    assert_eq!(range.as_usize_range(), 2..5);
    assert!(ByteRange::new(5, 2).is_none());
}
