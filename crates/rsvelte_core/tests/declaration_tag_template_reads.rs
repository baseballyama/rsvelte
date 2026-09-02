//! Upstream's `DeclarationTag` visitor calls `context.visit(node.declaration)`,
//! so every identifier in a `{const …}` / `{let …}` tag is read through its own
//! entry in `state.transform`. This port runs the tag's SOURCE TEXT through the
//! instance-script pipeline instead, which knows nothing about template scope,
//! and then re-applied the template reads from a hand-written list of two kinds
//! — each items and await bindings.
//!
//! A hand-written list is only right if the domain is closed, and this one was
//! not: a snippet parameter, a `let:` binding and a `{@const}` binding are all
//! template-scope reads, all three reached the tag, and all three came out as
//! the bare name. The list is now derived from `state.transform` itself, and a
//! name's replacement is what its own `read` produces — a snippet parameter is
//! a getter, so it reads as `v()` and not `$.get(v)`.
//!
//! `{@const}` is the control: it goes through `build_expression` and was
//! correct on every host below before this change.
//!
//! Every expected shape was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::{GenerateMode, compile};

const SCRIPT: &str = "let xs = $state([1]);\nconst pr = Promise.resolve(1);\nlet v = $state(9);";

/// The `c = …` line the client emits for a tag declaring `c`.
fn declared_c(template: &str) -> String {
    declared_c_with(SCRIPT, template)
}

/// As [`declared_c`], with an explicit instance script.
fn declared_c_with(script: &str, template: &str) -> String {
    let src = format!("<script>{script}</script>\n{template}\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .find(|l| l.contains("c = "))
        .unwrap_or_else(|| panic!("no `c = ` line for `{template}` in:\n{js}"))
        .to_string()
}

#[test]
fn a_declaration_tag_reads_a_snippet_parameter_through_its_getter() {
    // A snippet parameter is `v = $.noop`, so its read is a CALL. This is the
    // one host whose read is not `$.get(v)`, which is why the replacement has
    // to come from the binding's own transform rather than from one spelling.
    assert_eq!(
        declared_c("{#snippet p(v)}{const c = v}{/snippet}{@render p(1)}"),
        "const c = v();"
    );
    assert_eq!(
        declared_c("{#snippet p({v})}{const c = v}{/snippet}{@render p({ v: 1 })}"),
        "const c = v();"
    );
}

#[test]
fn a_declaration_tag_reads_a_const_tag_and_a_let_binding_through_get() {
    assert_eq!(
        declared_c("{#each xs as q}{@const v = q + 1}{const c = v}{/each}"),
        "const c = $.get(v);"
    );
}

#[test]
fn the_two_hosts_the_hand_written_list_already_covered_still_work() {
    // The control against a rewrite that widened the list and lost the shapes
    // it used to get right.
    assert_eq!(
        declared_c("{#each xs as v}{const c = v}{/each}"),
        "const c = $.get(v);"
    );
    assert_eq!(
        declared_c("{#await pr then v}{const c = v}{/await}"),
        "const c = $.get(v);"
    );
}

#[test]
fn a_binding_that_needs_no_read_stays_bare() {
    // The negative half: an each INDEX and a non-reactive item are not signals,
    // so wrapping either would be the defect this widening could introduce.
    for template in [
        "{#each xs as q, v}{const c = v}{/each}",
        "{#each xs as v (v)}{const c = v}{/each}",
    ] {
        assert_eq!(declared_c(template), "const c = v;", "for `{template}`");
    }
}

#[test]
fn an_instance_signal_is_wrapped_once_not_twice() {
    // The instance-script pipeline has already rewritten its own names by the
    // time this rewrite runs, so a second pass must not wrap them again. The
    // `$state` has to be WRITTEN to be discriminating — upstream keeps a
    // never-written `$state` a plain `let`, and a plain `let` needs no read at
    // all, so it would pass with the guard removed.
    let script = "let xs = $state([1]);\nlet v = $state(9);\nfunction bump() { v++; }";
    let c = |template: &str| declared_c_with(script, template);

    assert_eq!(
        c("{#if true}{const c = v}{/if}<button onclick={bump}>b</button>"),
        "const c = $.get(v);"
    );
    // …and the snippet parameter beside it still reads as a getter.
    assert_eq!(
        c(
            "{#snippet p(w)}{const c = v + w}{/snippet}{@render p(1)}<button onclick={bump}>b</button>"
        ),
        "const c = $.get(v) + w();"
    );
}

#[test]
fn the_at_const_control_is_unchanged_on_every_host() {
    for (template, expected) in [
        (
            "{#snippet p(v)}{@const c = v}{/snippet}{@render p(1)}",
            "const c = $.derived(v);",
        ),
        (
            "{#each xs as v}{@const c = v}{/each}",
            "const c = $.derived(() => $.get(v));",
        ),
        (
            "{#each xs as q, v}{@const c = v}{/each}",
            "const c = $.derived(() => v);",
        ),
    ] {
        assert_eq!(declared_c(template), expected, "for `{template}`");
    }
}

#[test]
fn a_read_the_instance_pipeline_already_applied_is_not_applied_twice() {
    // The axis that the host grid above holds fixed: the SHAPE of the read.
    // Every host row reads as `$.get(x)` or as a call, and `$.get(x)` is the
    // only shape the rewrite skips as already-wrapped — so widening the domain
    // to the whole transform map emitted `p()()` for a prop and `$s()()` for a
    // store while all twenty host cells stayed green. These rows are that
    // second axis; ablate the instance-scope exclusion and only they fail.
    for (script, template, expected) in [
        (
            "let { p = 1 } = $props();",
            "{#if true}{const c = p + 1}{/if}",
            "const c = p() + 1;",
        ),
        (
            "let { p = $bindable(1) } = $props();",
            "{#if true}{const c = p}{/if}",
            "const c = p();",
        ),
        (
            "import { writable } from 'svelte/store';\nconst s = writable(1);",
            "{#if true}{const c = $s}{/if}",
            "const c = $s();",
        ),
        (
            "let { p } = $props();",
            "{#if true}{const c = p.a}{/if}",
            "const c = $$props.p.a;",
        ),
        (
            "let { ...rest } = $props();",
            "{#if true}{const c = rest}{/if}",
            "const c = rest;",
        ),
    ] {
        assert_eq!(
            declared_c_with(script, template),
            expected,
            "for `{template}`"
        );
    }
}

#[test]
fn a_template_binding_beside_a_prop_gets_its_own_read() {
    // Both axes at once: the prop keeps the pipeline's single application and
    // the each item still gets the template read.
    assert_eq!(
        declared_c_with(
            "let { p } = $props(); let xs = $state([1]);",
            "{#each xs as v}{const c = p + v}{/each}"
        ),
        "const c = $$props.p + $.get(v);"
    );
}

#[test]
fn a_template_binding_that_shadows_an_instance_one_still_gets_the_template_read() {
    // The third axis, and the one that caught a fix that both grids above
    // called green: every host row names its binding `v`, so an exclusion
    // keyed on "is `v` declared in the script" removes the template binding
    // too. A name cannot tell a binding from the one it shadows — the guard
    // that stops double application has to be positional, not nominal.
    let script = "let xs = $state([1]);\nconst pr = Promise.resolve(1);\nlet v = $state(9);";
    for (template, expected) in [
        (
            "{#snippet p(v)}{const c = v}{/snippet}{@render p(1)}",
            "const c = v();",
        ),
        ("{#each xs as v}{const c = v}{/each}", "const c = $.get(v);"),
        (
            "{#await pr then v}{const c = v}{/await}",
            "const c = $.get(v);",
        ),
        (
            "{#each xs as q}{@const v = q + 1}{const c = v}{/each}",
            "const c = $.get(v);",
        ),
    ] {
        assert_eq!(
            declared_c_with(script, template),
            expected,
            "for `{template}`"
        );
    }
}
