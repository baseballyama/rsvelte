//! Regression coverage for #682 — template `{expr}` / attribute / directive
//! source in a `<script lang="ts">` component must be parsed and formatted as
//! TypeScript, the same dialect as the `<script>` body. Before the fix, every
//! template expression was parsed as plain JS: TS-only syntax (`as`,
//! `satisfies`, non-null `!`, `as const`, type-arg casts) errored with TS8016
//! (exit 2), and a generic call `fn<T>(a)` silently miscompiled to the
//! comparison `fn < T > a`.

use rsvelte_formatter::{FormatOptions, format};

const TS: &str = "<script lang=\"ts\"></script>";

fn fmt_ts(markup: &str) -> String {
    let src = format!("{TS}{markup}");
    format(&src, &FormatOptions::default()).expect("format ok")
}

// ─── Mustache / template expressions ─────────────────────────────────────

#[test]
fn mustache_ts_casts_round_trip() {
    for (markup, expect) in [
        ("<p>{value as string}</p>", "{value as string}"),
        (
            "<p>{value satisfies string}</p>",
            "{value satisfies string}",
        ),
        ("<p>{value!}</p>", "{value!}"),
        ("<p>{x as const}</p>", "{x as const}"),
        ("<p>{arr as string[]}</p>", "{arr as string[]}"),
        ("<p>{(x as string).length}</p>", "{(x as string).length}"),
    ] {
        let out = fmt_ts(markup);
        assert!(
            out.contains(expect),
            "expected `{expect}` from `{markup}`:\n{out}"
        );
    }
}

#[test]
fn mustache_generic_call_is_not_a_comparison() {
    // In JS mode this parsed as `fn < string > (a)`; TS mode keeps the
    // generic call intact.
    let out = fmt_ts("<p>{fn<string>(a)}</p>");
    assert!(
        out.contains("{fn<string>(a)}"),
        "expected generic call kept:\n{out}"
    );
    assert!(
        !out.contains("<string >"),
        "must not become a comparison:\n{out}"
    );
}

// ─── Attribute values ────────────────────────────────────────────────────

#[test]
fn attribute_value_ts_cast_round_trips() {
    let out = fmt_ts("<Comp prop={value as string} />");
    assert!(out.contains("prop={value as string}"), "{out}");
}

// ─── Directive values ────────────────────────────────────────────────────
//
// Directives are the subtle case: the parser narrows a TS cast down to its
// inner identifier, so the formatter must slice the brace interior from the
// source rather than the bare AST node — otherwise `bind:value={value as
// string}` collapsed to `bind:value` (silent data loss).

#[test]
fn directive_values_preserve_ts_casts() {
    for (markup, expect) in [
        (
            "<input bind:value={value as string} />",
            "bind:value={value as string}",
        ),
        (
            "<div class:x={value as string}></div>",
            "class:x={value as string}",
        ),
        (
            "<button on:click={handler as any}>x</button>",
            "on:click={handler as any}",
        ),
        (
            "<div use:action={value as string}></div>",
            "use:action={value as string}",
        ),
    ] {
        let out = fmt_ts(markup);
        assert!(
            out.contains(expect),
            "expected `{expect}` from `{markup}`:\n{out}"
        );
    }
}

#[test]
fn directive_shorthand_collapse_still_applies_without_a_cast() {
    // The TS path must not break the `bind:value={value}` → `bind:value`
    // collapse, nor turn `bind:value={other}` into a shorthand.
    assert!(fmt_ts("<input bind:value={value} />").contains("bind:value />"));
    assert!(fmt_ts("<div class:active={active}></div>").contains("class:active>"));
    assert!(fmt_ts("<input bind:value={other} />").contains("bind:value={other}"));
}

#[test]
fn transition_object_param_unaffected_by_ts_path() {
    let out = fmt_ts("<div in:fade out:slide={ {duration: 200} }></div>");
    assert!(out.contains("out:slide={{ duration: 200 }}"), "{out}");
}

// ─── A plain (non-TS) component still rejects TS-only syntax ──────────────

#[test]
fn non_ts_component_does_not_parse_ts_syntax() {
    // No `<script lang="ts">`, so `as` is not valid — the formatter surfaces
    // the parse error rather than silently producing wrong output.
    let res = format("<p>{value as string}</p>", &FormatOptions::default());
    assert!(
        res.is_err(),
        "expected a parse error for `as` in a JS component"
    );
}

// ─── #761: <script> body long type-argument wrapping matches oxfmt ──────────

#[test]
fn script_long_type_alias_wraps_like_oxfmt() {
    // Regression lock for #761: a long type alias must break its outer
    // `Awaited<…>` type-argument list across lines exactly like oxfmt 0.53.
    // The divergence was an oxc_formatter digest skew, aligned in #771; this
    // test pins the now-matching output at the workspace's pinned rev so a
    // future bump that regresses the wrapping is caught.
    let src = "<script lang=\"ts\">\n  type AccountDisabledBody = Awaited<ReturnType<Extract<MfaVerifyResponse, { status: 403 }>['json']>>;\n</script>\n";
    let out = format(
        src,
        &FormatOptions {
            typescript: true,
            ..FormatOptions::default()
        },
    )
    .expect("format ok");
    let expected = "<script lang=\"ts\">\n  type AccountDisabledBody = Awaited<\n    ReturnType<Extract<MfaVerifyResponse, { status: 403 }>[\"json\"]>\n  >;\n</script>\n";
    assert_eq!(
        out, expected,
        "long type alias should wrap like oxfmt:\n{out}"
    );
    // Idempotent.
    assert_eq!(
        format(
            &out,
            &FormatOptions {
                typescript: true,
                ..FormatOptions::default()
            }
        )
        .expect("fmt"),
        out,
        "must be idempotent"
    );
}
