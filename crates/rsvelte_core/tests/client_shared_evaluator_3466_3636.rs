//! Regressions that were hidden by the client's private approximation of
//! upstream `scope.evaluate` (#3466 / #3636).
//!
//! These assert the consequence of knownness, not merely the folded value:
//! `{@const}` writes a known value once, while a function declaration reached
//! through a `const` alias remains unknown and keeps its template effect.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

/// #3466: the `{@const}` reactivity predicate had a second, incomplete globals
/// table. These names are deliberately spread across global, Number, String
/// and Math entries that the shared evaluator can execute.
#[test]
fn const_tags_use_the_shared_globals_table_for_knownness() {
    for initializer in [
        "Number.isInteger(1)",
        "Number.parseInt('3')",
        "String('A')",
        "String.fromCharCode(65)",
        "Math.f16round(1.337)",
    ] {
        let out = client(&format!(
            "{{#if true}}{{@const c = {initializer}}}<b>{{c}}</b>{{/if}}\n"
        ));
        assert!(
            out.contains("b.textContent = $.get(c);"),
            "a foldable global call must be written once for `{initializer}`; got:\n{out}"
        );
        assert!(
            !out.contains("template_effect"),
            "a foldable global call must not remain reactive for `{initializer}`; got:\n{out}"
        );
    }
}

/// A global marker with no fold function is not a known value. This is the
/// direction an over-broad "globals are known" replacement would break.
#[test]
fn const_tag_over_an_unfoldable_global_member_stays_reactive() {
    let out = client("{#if true}{@const c = Number.MAX_SAFE_INTEGER}<b>{c}</b>{/if}\n");
    assert!(
        out.contains("template_effect"),
        "Number.MAX_SAFE_INTEGER is represented by an unknown marker upstream; got:\n{out}"
    );
    assert!(
        !out.contains("b.textContent = $.get(c);"),
        "an unknown global member must not take the one-shot path; got:\n{out}"
    );
}

/// #3636: evaluating a function declaration yields upstream's FUNCTION marker,
/// whose `is_known` is false. Aliasing it must not turn it into a constant.
#[test]
fn function_declaration_alias_stays_reactive() {
    let out =
        client("<script>\n\tfunction f() { return 1; }\n\tconst g = f;\n</script>\n<b>{g}</b>\n");
    assert!(
        out.contains("template_effect"),
        "a function declaration alias must retain its effect; got:\n{out}"
    );
    assert!(
        out.contains("<b> </b>"),
        "the reactive read needs a text placeholder; got:\n{out}"
    );
}

/// Function literals and scalar aliases are the two known controls: the
/// declaration marker above must not make every function-shaped value unknown.
#[test]
fn function_literal_and_scalar_aliases_remain_static() {
    for declaration in ["const f = () => 1;", "const value = 1;\n\tconst f = value;"] {
        let out = client(&format!(
            "<script>\n\t{declaration}\n</script>\n<b>{{f}}</b>\n"
        ));
        assert!(
            !out.contains("template_effect"),
            "a known control must stay on the static path for `{declaration}`; got:\n{out}"
        );
    }
}

/// Component `let:` bindings apply to the default slot, but not to named
/// slots without their own `let:` directive. Phase 2 reference positions see
/// the component scope before slots are separated, so the client evaluator
/// must honor Phase 3's active transform boundary here.
#[test]
fn component_let_shadowing_respects_each_slot_scope() {
    let out = client(
        "<script>\n\timport Counter from './Counter.svelte';\n\tlet count = 'outer';\n</script>\n<Counter let:count>\n\t{count}\n\t<p slot=\"named\">named {count}</p>\n</Counter>\n",
    );

    assert!(
        out.contains("$.template_effect(() => $.set_text(text, $.get(count)))"),
        "the default slot must read its reactive `let:` binding; got:\n{out}"
    );
    assert!(
        out.contains("p.textContent = 'named outer';"),
        "the named slot must fold the shadowed outer binding; got:\n{out}"
    );
}
