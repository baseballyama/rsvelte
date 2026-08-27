//! Regression coverage for template bindings that shadow same-named bindings.
//! The binding must be resolved by its lexical each scope, not by name alone.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_target(source: &str, generate: GenerateMode, runes: Option<bool>) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("template-scope-shadow-3296.svelte".into()),
            generate,
            runes,
            dev: false,
            ..Default::default()
        },
    )
    .unwrap()
    .js
    .code
}

#[test]
fn server_const_read_uses_the_shadowing_each_item() {
    let output = compile_target(
        r#"<script>
	let base = $state(1);
	let v = $derived(base + 1);
</script>
{#each ["A"] as v}{#if true}{@const c = String(v)}{c}{/if}{/each}"#,
        GenerateMode::Server,
        None,
    );

    assert!(output.contains("const c = String(v);"), "{output}");
    assert!(!output.contains("const c = String(v());"), "{output}");
}

#[test]
fn server_declaration_read_uses_the_shadowing_each_item() {
    let output = compile_target(
        r#"<script>
	let base = $state(1);
	let v = $derived(base + 1);
</script>
{#each ["A"] as v}{#if true}{const c = String(v)}{c}{/if}{/each}"#,
        GenerateMode::Server,
        None,
    );

    assert!(output.contains("const c = String(v);"), "{output}");
    assert!(!output.contains("const c = String(v());"), "{output}");
}

#[test]
fn destructured_each_assignment_writes_back_without_promoting_the_outer_binding() {
    let output = compile_target(
        r#"<script>let v = "OUTER";</script>
{#each [{ v: "A" }] as { v }}
	<button onclick={() => { v = "W"; }}>b</button>
{/each}"#,
        GenerateMode::Client,
        Some(false),
    );

    assert!(output.contains("let v = \"OUTER\";"), "{output}");
    assert!(!output.contains("let v = $.mutable_source"), "{output}");
    assert!(output.contains("$$item.v = \"W\""), "{output}");
    assert!(output.contains("$.invalidate_inner_signals"), "{output}");
    assert!(!output.contains("\n\t\t\tv = \"W\""), "{output}");
}

#[test]
fn destructured_each_compound_assignment_and_member_mutation_write_back() {
    let output = compile_target(
        r#"<script>let value = 0;</script>
{#each [{ value: 1, nested: { count: 1 } }] as { value, nested }}
	<button onclick={() => { value += 2; nested.count += 1; }}>b</button>
{/each}"#,
        GenerateMode::Client,
        Some(false),
    );

    assert!(output.contains("$$item.value = value() + 2"), "{output}");
    assert!(output.contains("nested().count += 1"), "{output}");
    assert!(
        output.matches("$.invalidate_inner_signals").count() >= 2,
        "{output}"
    );
}

#[test]
fn nested_same_named_each_write_invalidates_only_the_owning_array() {
    let output = compile_target(
        r#"{#each ["A"] as v}{#each ["B"] as v}<button onclick={() => { v = "W"; }}>b</button>{/each}{/each}"#,
        GenerateMode::Client,
        Some(false),
    );

    let invalidation = output
        .lines()
        .find(|line| line.contains("$.invalidate_inner_signals"))
        .expect("an each-item write must invalidate its collection");
    let invalidated_collection = invalidation
        .split_once("$.invalidate_inner_signals")
        .expect("the selected line contains the invalidation call")
        .1;
    assert_eq!(
        invalidated_collection.matches("$$array").count(),
        1,
        "{output}"
    );
}

#[test]
fn a_shadowed_legacy_prop_is_not_deep_read() {
    let output = compile_target(
        r#"<script>export let v = "OUTER";</script>
{#each ["A"] as v}{String(v)}{/each}"#,
        GenerateMode::Client,
        Some(false),
    );

    assert!(!output.contains("$.deep_read_state(v)"), "{output}");
    assert!(output.contains("$.untrack(() => String(v))"), "{output}");
}
