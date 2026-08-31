//! The `$$ComponentProps` type for a `$props()` default is picked by a chain of
//! node-kind tests in upstream's `ExportedNames.createPropsStr`, and the
//! callable arm is `ts.isArrowFunction` alone. `SyntaxKind.FunctionExpression`
//! is a different kind whether or not the expression carries a name, so a
//! `function` default falls through to `any` — rsvelte matched a `function`
//! expression too and emitted `Function`.
//!
//! Expectations are the official tool's own bytes, measured on
//! `submodules/language-tools` @ 092af3826 (built `index.js`, resolving
//! svelte@5.56.9) with `isTsFile` both false and true — the two agree on every
//! row below.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// The `format?: <type>` fragment official emits for a prop defaulted to `init`.
fn prop_type(init: &str, is_ts: bool) -> String {
    let lang = if is_ts { " lang=\"ts\"" } else { "" };
    let src = format!("<script{lang}>\n\tlet {{ format = {init} }} = $props();\n</script>\n");
    let out = svelte2tsx(
        &src,
        Svelte2TsxOptions {
            filename: "Probe.svelte".to_string(),
            is_ts_file: is_ts,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let start = out
        .find("format?:")
        .unwrap_or_else(|| panic!("no `format?:` in output for `{init}`:\n{out}"));
    let rest = &out[start + "format?:".len()..];
    let end = rest.find([',', '}']).unwrap_or(rest.len());
    rest[..end].trim().to_string()
}

#[test]
fn only_an_arrow_default_is_typed_function() {
    let rows = [
        ("(x) => x", "Function"),
        ("async (x) => x", "Function"),
        ("function (x) { return x; }", "any"),
        ("function change(x) { return x; }", "any"),
        ("async function (x) { return x; }", "any"),
        ("function* (x) { yield x; }", "any"),
        ("class {}", "any"),
    ];
    for (init, expected) in rows {
        for is_ts in [false, true] {
            assert_eq!(
                prop_type(init, is_ts),
                expected,
                "default `{init}` (is_ts_file={is_ts})"
            );
        }
    }
}

#[test]
fn a_bindable_default_is_judged_by_its_argument() {
    // `$bindable(x)` is unwrapped before the kind chain runs, so the argument's
    // kind decides — the same arrow-vs-function split, one level in.
    assert_eq!(prop_type("$bindable((x) => x)", false), "Function");
    assert_eq!(
        prop_type("$bindable(function change(x) { return x; })", false),
        "any"
    );
}

#[test]
fn the_non_callable_arms_still_answer() {
    // A control: the assertions above are `any`-heavy, and `any` is also this
    // chain's fallback, so a table that only tested them would pass with the
    // whole chain deleted.
    for (init, expected) in [
        ("'s'", "string"),
        ("1", "number"),
        ("true", "boolean"),
        ("[]", "any[]"),
        ("{}", "Record<string"),
    ] {
        assert_eq!(prop_type(init, false), expected, "default `{init}`");
    }
}
