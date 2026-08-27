//! Four inputs make the **official** compiler emit client output no JavaScript
//! parser accepts: a write to an `{#each}` array-rest or object-rest binding, an
//! update of a destructured `{#each}` binding, and a write to an outer binding
//! whose name a `{:catch}` parameter reuses. Each
//! puts the binding's *read* expression on the left of an assignment, so acorn
//! rejects the module with `Assigning to rvalue`. rsvelte's output for all four
//! parses (issue #3306).
//!
//! Byte equality is the goal, and the standing precedent — `client/dead_comments.rs`
//! — is to reproduce an upstream defect rather than carry a ratchet entry. That
//! precedent covers output that still runs. The shape-matrix gate scores
//! `output-unparseable` apart from `js-mismatch` so the two never suppress one
//! another, so reproducing these would mean permanent entries in the one ratchet
//! whose purpose is that none exist. This file pins rsvelte's side so a later
//! change that "improves fidelity" by adopting the upstream spelling fails here.
//!
//! Every expectation was measured against the official compiler at `svelte@5.56.8`,
//! not recalled. The write-up is
//! `upstream_issues/3306-svelte-a-bindings-read-expression-lands-on-the-lhs-of-a-write.md`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const WRITE: &str = r#"<button onclick={() => { v = "W"; }}>b</button>"#;

fn client_js(markup: &str) -> String {
    compile(
        markup,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("the component compiles")
    .js
    .code
}

/// The setter form rsvelte emits, and the upstream spelling that must not appear.
/// Asserting only the first would be satisfied by emitting both.
fn assert_write(markup: &str, expected: &str, upstream_rvalue: &str) {
    let js = client_js(markup);
    assert!(
        js.contains(expected),
        "for {markup}\nexpected to contain: {expected}\ngot:\n{js}"
    );
    assert!(
        !js.contains(upstream_rvalue),
        "for {markup}\nthe upstream rvalue spelling reached the output: {upstream_rvalue}\ngot:\n{js}"
    );
}

#[test]
fn an_each_rest_binding_is_written_through_its_name() {
    assert_write(
        &format!(r#"{{#each [["A","B"]] as [first, ...v]}}{WRITE}{{/each}}"#),
        r#"v = "W";"#,
        r#"$$array.slice(1) = "W""#,
    );
    assert_write(
        &format!(r#"{{#each [{{a:1,b:2}}] as {{a, ...v}}}}{WRITE}{{/each}}"#),
        r#"v = "W";"#,
        r#"$.exclude_from_object($$item, ['a']) = "W""#,
    );
}

#[test]
fn a_destructured_each_binding_update_writes_to_its_source_path() {
    let js = client_js(
        r#"{#each [{ value: 1 }] as { value }}<button onclick={() => value++}>b</button>{/each}"#,
    );
    assert!(
        js.contains("$$item.value++"),
        "the update must target the destructured source path:\n{js}"
    );
    assert!(
        !js.contains("value()++"),
        "the upstream rvalue spelling reached the output:\n{js}"
    );
}

/// A `{:catch}` parameter whose name matches an outer binding, plus a write to
/// that outer binding. Using the parameter is not required and runes mode
/// reproduces it too — both measured on the official compiler.
#[test]
fn a_write_past_a_catch_parameter_of_the_same_name_uses_the_setter() {
    for head in [
        r#"<script>let v = "OUTER";</script>"#,
        r#"<script>let v = $state("OUTER");</script>"#,
    ] {
        for clause in [r#"{:catch v}{String(v)}"#, r#"{:catch v}x"#] {
            assert_write(
                &format!(r#"{head}{{#await Promise.reject("A")}}w{clause}{{/await}}{WRITE}"#),
                r#"$.set(v, "W")"#,
                r#"$.get(v) = "W""#,
            );
        }
    }
}

/// The controls. Every other construct that introduces a binding of the same
/// name leaves the outer write alone on the official compiler, and a plain
/// `{#each … as v}` item write is byte-identical between the two — so the three
/// cells above are the destructured/rest/`{:catch}` paths, not writes in general. Without
/// this the assertions above are equally satisfied by routing every write
/// through `$.set`, including where upstream does not.
#[test]
fn the_shapes_that_already_agreed_are_unchanged() {
    let js = client_js(&format!(r#"{{#each ["A"] as v}}{WRITE}{{/each}}"#));
    assert!(
        js.contains(r#"(["A"][$$index] = "W");"#),
        "a plain each-item write must keep the member-assignment form:\n{js}"
    );

    for shadow in [
        r#"{#await Promise.resolve("A") then v}{String(v)}{/await}"#,
        r#"{#each ["A"] as v}{String(v)}{/each}"#,
        r#"{#snippet s(v)}{String(v)}{/snippet}"#,
        r#"{#if true}{@const v = 1}{String(v)}{/if}"#,
    ] {
        let markup = format!(r#"<script>let v = "OUTER";</script>{shadow}{WRITE}"#);
        let js = client_js(&markup);
        assert!(
            !js.contains(r#"$.get(v) = "W""#),
            "for {markup}\nan rvalue assignment reached the output:\n{js}"
        );
    }
}
