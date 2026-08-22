//! Issue #3236: a rune name written with a unicode escape is the same
//! identifier to a JS parser, so upstream lowers it. rsvelte answered "is this a
//! rune" from the source bytes in the runes-mode scan, the `$`-reference
//! collector and every lowering pass, which made the escaped spelling
//! alternately invisible (left as a `$state` reference that throws at import)
//! and rejected (`global_reference_invalid` on the `$st` a char scan can read).
//!
//! In every source below `\u0024` is the six characters `\`, `u`, `0`, `0`,
//! `2`, `4` — the escape for `$`.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn module(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".into()),
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn component(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// An escaped `$` in a module: upstream emits `export let a = 1;`, rsvelte used
/// to leave the call, so the module threw on import.
#[test]
fn an_escaped_dollar_lowers_in_a_module() {
    let out = module("export let a = \\u0024state(1);\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        !out.contains("$state("),
        "the escaped rune was not lowered:\n{out}"
    );
    assert!(out.contains("export let a = 1;"), "{out}");
}

/// An escape *inside* the name was read as the unknown global `$st`.
#[test]
fn an_escape_inside_the_name_is_still_the_rune() {
    let out = component("<script>\n\tlet a = $st\\u0061te(1);\n</script>\n<div>x</div>\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("let a = 1;"), "{out}");
}

/// `\u0024props()` was `rune_invalid_usage`: the runes-mode scan never saw a
/// `$` in the source, so the component was analysed in legacy mode.
#[test]
fn an_escaped_props_turns_on_runes_mode() {
    let out = component("<script>\n\tlet { p } = \\u0024props();\n</script>\n<div>x</div>\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$$props"), "{out}");
    assert!(
        !out.contains("internal/flags/legacy"),
        "the component stayed in legacy mode:\n{out}"
    );
}

/// The braced form is the same identifier.
#[test]
fn a_braced_escape_lowers_too() {
    let out = module("export let a = \\u{24}state(1);\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("export let a = 1;"), "{out}");
}

/// Over-acceptance guard: the same escape in a string, a comment or a template
/// is text, and a non-`$` identifier is not the compiler's business.
#[test]
fn an_escape_that_is_not_a_rune_reference_is_left_alone() {
    let out = module("export const a = '\\u0024state(1)';\n");
    assert!(
        out.contains("'\\u0024state(1)'"),
        "a string literal was rewritten:\n{out}"
    );

    let out = module("// \\u0024state(1)\nexport const a = 1;\n");
    assert!(out.contains("export const a = 1;"), "{out}");

    // A method named with the escaped rune is still a declaration.
    let out =
        module("const o = { \\u0024derived: (v) => v };\nexport const a = o.\\u0024derived(1);\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("o.$derived(1)"),
        "an escaped property was read as the rune:\n{out}"
    );
}

/// The escaped spelling has to reach exactly the verdict the plain one does —
/// including a rejection. A `$`-prefixed declaration is `dollar_prefix_invalid`
/// either way; before the fix the escaped form was simply not seen.
#[test]
fn an_escaped_declaration_gets_the_same_verdict_as_the_plain_one() {
    let escaped = module("function \\u0024state(v) { return v; }\nexport const a = 1;\n");
    let plain = module("function $state(v) { return v; }\nexport const a = 1;\n");
    assert!(
        plain.contains("dollar_prefix_invalid"),
        "the control changed:\n{plain}"
    );
    assert!(
        escaped.contains("dollar_prefix_invalid"),
        "the escaped declaration was not seen:\n{escaped}"
    );
}

/// A non-`$` identifier escape is left verbatim in the source; the printer
/// cooks it, exactly as upstream's does.
#[test]
fn a_plain_identifier_escape_is_untouched_and_still_prints_cooked() {
    let out = module("export const \\u0058X = 1;\nexport const b = \\u0058X;\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("export const XX = 1;"), "{out}");
}
