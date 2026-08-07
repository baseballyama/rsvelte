//! Regression tests for false-positive compile errors found by compiling
//! open-webui v0.11.0 (650 components) and Huly Platform v0.7.426 (2,462), which
//! upstream `svelte.compile` accepts. Each case was reduced from a real component
//! and confirmed against the official compiler in both directions — the negative
//! controls below still have to fail.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

#[test]
fn catch_clause_parameter_is_assignable() {
    assert!(
        try_compile(
            "<script>\nconst go = () => { try { x(); } catch (err) { err = err.message; } };\n</script>"
        )
        .is_ok()
    );
    assert!(
        try_compile(
            "<script>\nconst go = () => { try { x(); } catch ({ a }) { a = 1; } };\n</script>"
        )
        .is_ok()
    );
}

#[test]
fn const_declared_in_a_function_is_still_constant() {
    assert!(try_compile("<script>\nconst go = () => { const e = 1; e = 2; };\n</script>").is_err());
}

#[test]
fn dollar_name_destructured_from_a_declaration_is_not_a_store_read() {
    let src = "<script>\n\
        const a = (r) => { r.forEach(({ from }) => from); };\n\
        const b = (state) => { const { $from } = state.selection; return $from; };\n\
        </script>";
    assert!(try_compile(src).is_ok());
    // Nested patterns reach the declaration keyword through more than one hop.
    let nested = "<script>\n\
        const a = (r) => { r.forEach(({ from }) => from); };\n\
        const b = (s) => { const { a: { $from } } = s; return $from; };\n\
        </script>";
    assert!(try_compile(nested).is_ok());
}

#[test]
fn dollar_name_in_an_object_literal_is_still_a_store_read() {
    // Same shorthand, but the `{` opens a literal rather than a pattern, so the
    // scoped-store error must survive.
    let src = "<script>\n\
        const a = (r) => { r.forEach(({ from }) => from); };\n\
        const b = () => $from;\n\
        </script>";
    assert!(try_compile(src).is_err());
}

#[test]
fn typescript_grammar_rules_acorn_does_not_check_are_not_parse_errors() {
    let ts = |body: &str| format!("<script lang=\"ts\">\n{body}\n</script>");
    for body in [
        "const f = (a?: string, b: string) => b;", // TS1016
        "const f = (a?: string = \"x\") => a;",    // TS1015
        "const f = (...a?: string[]) => a;",       // TS1047
        "class C { set x(a?: number) {} }",        // TS1051
        "class C { set x(a: number): void {} }",   // TS1095
        "class C { constructor(this: C) {} }",     // TS2681
        "let x!: number = 1;",                     // TS1263
        "type T = [...a?: string[]];",             // TS5085
    ] {
        assert!(try_compile(&ts(body)).is_ok(), "should compile: {body}");
    }
}

#[test]
fn typescript_grammar_rules_acorn_does_check_stay_parse_errors() {
    let ts = |body: &str| format!("<script lang=\"ts\">\n{body}\n</script>");
    for body in [
        "class C { set x(a: number, b: number) {} }", // TS1049
        "interface I { [a: string, b: string]: number }", // TS1096
        "function f<>() {}",                          // TS1098
        "type T = [a?: string, b: string];",          // TS1257
        "class C { accessor x?: number; }",           // TS1276
        "enum E { 1 = 1 }",                           // TS2452
    ] {
        assert!(
            try_compile(&ts(body)).is_err(),
            "should be rejected: {body}"
        );
    }
    // TypeScript syntax in a plain script stays a `js_parse_error`.
    assert!(try_compile("<script>\nconst x = <string>y;\n</script>").is_err());
}

#[test]
fn a_rune_named_store_prop_does_not_flip_runes_mode() {
    // `export let state` + `$state.x` is a store read, so `export let` stays legal.
    // Upstream deletes the synthetic store name from `module.scope.references`
    // before runes detection reads it.
    for name in ["state", "derived", "props", "effect"] {
        let src = format!(
            "<script>\nexport let {name};\nfunction go(v) {{ ${name}.room = v; }}\n</script>"
        );
        assert!(try_compile(&src).is_ok(), "should compile: {name}");
    }
    // A type annotation and a missing initialiser must not hide the declaration.
    assert!(
        try_compile(
            "<script lang=\"ts\">\nexport let state: unknown;\nlet other;\nfunction go() { return $state; }\n</script>"
        )
        .is_ok()
    );
}

#[test]
fn a_real_rune_still_flips_runes_mode() {
    assert!(try_compile("<script>\nlet a = $state(0);\nexport let b;\n</script>").is_err());
}

#[test]
fn a_dollar_prefixed_import_specifier_is_not_a_store_read() {
    assert!(
        try_compile("<script>\nimport { $comparedDocument as compareTo } from './s';\nconst v = compareTo;\n</script>")
            .is_ok()
    );
    // A `$`-prefixed *local* name is still reserved, aliased or not.
    assert!(
        try_compile("<script>\nimport { $foo } from './s';\nconst v = $foo;\n</script>").is_err()
    );
}

#[test]
fn a_free_dollar_reference_is_still_an_invalid_global() {
    assert!(try_compile("<script>\nconst v = $comparedDocument;\n</script>").is_err());
}

#[test]
fn a_slot_attribute_inside_a_fragment_is_invalid_placement() {
    // Upstream errors because the element's parent is the fragment, not the
    // component (`owner !== parent` in shared/attribute.js).
    let src = "<script>import C from './C.svelte';</script>\n\
        <C>\n<svelte:fragment slot=\"pool\">\n\
        <div slot=\"afterContent\">x</div>\n</svelte:fragment>\n</C>";
    assert!(try_compile(src).is_err());
    // A nested fragment is invalid for the same reason.
    let nested = "<script>import C from './C.svelte';</script>\n\
        <C>\n<svelte:fragment slot=\"a\"><svelte:fragment slot=\"b\">x</svelte:fragment></svelte:fragment>\n</C>";
    assert!(try_compile(nested).is_err());
}

#[test]
fn a_slot_attribute_directly_under_a_component_is_still_valid() {
    let src = "<script>import C from './C.svelte';</script>\n\
        <C><div slot=\"x\">y</div></C>";
    assert!(try_compile(src).is_ok());
    // A component may carry `slot=` anywhere under its owner.
    let inner = "<script>import C from './C.svelte'; import D from './D.svelte';</script>\n\
        <C><svelte:fragment slot=\"a\"><D slot=\"b\" /></svelte:fragment></C>";
    assert!(try_compile(inner).is_ok());
}

#[test]
fn a_dollar_name_in_a_destructuring_default_is_still_a_store_read() {
    // `{ value = $page }` reads the store; only the binding target is a declaration.
    let src = "<script>\nimport { writable } from 'svelte/store';\n\
        const page = writable(1);\nconst { value = $page } = $props();\n</script>\n{value}";
    assert!(try_compile(src).is_ok());
}
