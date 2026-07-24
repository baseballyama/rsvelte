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

// ─── #973: `{@const}` with a TypeScript type annotation ──────────────────
//
// A `{@const}` declaration is a `const` variable declaration with an optional
// TS type annotation (`{@const _: never = x}`). The parity burndown (#906)
// parsed the body as a bare assignment expression, which rejected the `: Type`
// ("script parse failed"). Parsing it as a `const` declaration fixes that.

#[test]
fn const_tag_typed_annotation_round_trips() {
    for markup in [
        "<div>\n  {#if true}\n    {@const _: never = x}\n  {/if}\n</div>",
        "<div>\n  {#if true}\n    {@const name: Type = value}\n  {/if}\n</div>",
        "<div>\n  {#if true}\n    {@const n: number = 1}\n  {/if}\n</div>",
    ] {
        let out = fmt_ts(markup);
        // Each typed declaration must survive verbatim (no annotation drop, no
        // parse error).
        let decl = markup
            .lines()
            .find(|l| l.contains("{@const"))
            .unwrap()
            .trim();
        assert!(out.contains(decl), "expected `{decl}` from:\n{out}");
    }
}

#[test]
fn const_tag_typed_destructuring_round_trips() {
    let out = fmt_ts("<div>\n  {#if true}\n    {@const { a, b }: Point = obj}\n  {/if}\n</div>");
    assert!(out.contains("{@const { a, b }: Point = obj}"), "{out}");
}

#[test]
fn const_tag_untyped_still_normalizes() {
    // The fix must not regress untyped `{@const}` — quotes still normalize and
    // the declaration round-trips in both JS and TS components.
    let out = format(
        "<div>\n  {#if true}\n    {@const foo = 'bar'}\n  {/if}\n</div>",
        &FormatOptions::default(),
    )
    .expect("format ok");
    assert!(out.contains("{@const foo = \"bar\"}"), "{out}");

    let out_ts = fmt_ts("<div>\n  {#if true}\n    {@const y = x}\n  {/if}\n</div>");
    assert!(out_ts.contains("{@const y = x}"), "{out_ts}");
}

// ─── #946: `>` inside a `generics` attribute value must not split the body ──

#[test]
fn script_generics_attr_with_angle_brackets_parses() {
    // The `generics` attribute value contains a literal `>` (`Record<…>`). A
    // naive `find('>')` when locating the tag-terminating `>` would start the
    // body slice mid-attribute, so oxc parsed garbage and reported a spurious
    // "Unexpected token" — leaving the file unformatted (#946).
    let src = "<script lang=\"ts\" generics=\"TItem extends Record<string, unknown>\">\n\timport { onMount } from \"svelte\";\n\tconst x = 1;\n</script>\n";
    let out = format(src, &FormatOptions::default()).expect("format should succeed");
    assert!(out.contains("import { onMount }"), "body preserved:\n{out}");
    assert!(out.contains("const x = 1;"), "body preserved:\n{out}");
    // The open tag (with its generics attribute) survives unchanged.
    assert!(
        out.contains("generics=\"TItem extends Record<string, unknown>\""),
        "generics attribute preserved:\n{out}"
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

// ─── Plain `<script>` (no lang="ts") containing TS — formatter parses as TS ──
//
// oxfmt / prettier-plugin-svelte parse Svelte `<script>` as TS by default, so a
// plain `<script>` containing TS-only syntax is valid, formattable input there.
// The formatter's initial parse defers script/expression bodies, and
// `format_script` always re-parses `<script>` as TS, so a plain TS `<script>`
// formats correctly with no retry. When a *template expression* needs TS (a
// dialect-sensitive `ScriptParse` failure on the first, non-TS attempt), the
// whole format is re-run forcing TS (see `format_with_arenas`). Regression for
// the corpus `v4-migration-guide` / `content-sveltekit` entries.

#[test]
fn plain_script_with_typeof_generic_formats_as_ts() {
    // `typeof X<any>` is TS-only; a JS parse fails, the TS fallback succeeds.
    let src = "<script>\n\tlet component: typeof SvelteComponent<any>;\n</script>\n";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("let component: typeof SvelteComponent<any>;"),
        "plain <script> TS should round-trip:\n{out}"
    );
    // Idempotent.
    assert_eq!(
        format(&out, &FormatOptions::default()).expect("fmt"),
        out,
        "must be idempotent"
    );
}

#[test]
fn plain_script_with_import_type_formats_as_ts() {
    // `import type { … }` is TS-only.
    let src = "<script>\n\timport type { PageProps } from './$types';\n\tlet x = 1;\n</script>\n";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("import type { PageProps } from \"./$types\";"),
        "import type should round-trip via TS fallback:\n{out}"
    );
}

#[test]
fn plain_script_valid_js_is_untouched_by_fallback() {
    // A valid-JS plain <script> must parse on the JS path (no fallback), so a
    // bare `<T>` that would be a TS cast stays a comparison-free formatting.
    let src = "<script>\n\tlet a = 1;\n\tlet b = a + 2;\n</script>\n";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("let a = 1;") && out.contains("let b = a + 2;"),
        "{out}"
    );
}

#[test]
fn plain_script_with_ts_template_expr_triggers_ts_retry() {
    // The ONLY coverage of the retry path itself: a plain (valid-JS) `<script>`
    // plus a TS-only *template expression*. `lang="ts"` is absent, so the first
    // (non-TS) attempt parses `{x as string}` as JS and fails with a dialect-
    // sensitive `ScriptParse`; the whole format then re-runs forcing TS and the
    // cast round-trips. Disabling `FormatError::is_dialect_sensitive` makes this
    // test fail.
    let src = "<script>let x = 1;</script>\n<p>{x as string}</p>\n";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("{x as string}"),
        "the TS retry should round-trip the template cast:\n{out}"
    );
}

#[test]
fn plain_ts_script_ambiguous_generic_expr_formats_as_js() {
    // Documented, ACCEPTED divergence from the old eager path: a plain `<script>`
    // whose TS-ness lives only in the body (no `lang="ts"`) does not flip an
    // *ambiguous* template expression's dialect — `{fn<string>(a)}` parses fine
    // as a JS comparison, raises no error, so no TS retry fires and it formats as
    // JS (the eager path used to force it to a TS generic call). Closing this
    // needs a script JS-parse probe, re-adding the parse cost parse-lite removed;
    // TS in a plain `<script>` is invalid Svelte the compiler rejects, so the
    // dialect here is a don't-care.
    let src = "<script>let x: number = 1;</script>\n<p>{fn<string>(a)}</p>\n";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("fn < string"),
        "ambiguous generic must format as a JS comparison, not a TS generic call:\n{out}"
    );
}

#[test]
fn const_tag_inline_not_overbroken() {
    // Regression for #973 fix: `{@const}` bodies that fit must stay inline
    // (oxfmt/prettier keeps them on one line). The const-declaration parse path
    // must not double-count the `const ;` wrapper against the width budget.
    let src = "{#each xs as post, i}\n  {@const show_comma = post.authors.length > 2 && i < post.authors.length - 1}\n{/each}\n";
    let out =
        rsvelte_formatter::format(src, &rsvelte_formatter::FormatOptions::default()).expect("ok");
    assert!(
        out.contains(
            "{@const show_comma = post.authors.length > 2 && i < post.authors.length - 1}"
        ),
        "const tag was wrongly broken:\n{out}"
    );

    let src2 = "{#if box}\n  {@const { area, volume } = calculate(box.width, box.height, constant)}\n{/if}\n";
    let out2 =
        rsvelte_formatter::format(src2, &rsvelte_formatter::FormatOptions::default()).expect("ok");
    assert!(
        out2.contains("{@const { area, volume } = calculate(box.width, box.height, constant)}"),
        "destructuring const tag was wrongly broken:\n{out2}"
    );
}

// ─── Template-position `as`/`satisfies` union reflow (#1484) ──────────────

#[test]
fn template_as_union_stays_flat_when_it_fits() {
    // oxc expands `x as A | B` to a leading-`|` union once the annotation
    // breaks; the oracle keeps the union flat on the continuation line when it
    // fits. The reflow reproduces the oracle's layout for template expressions.
    let markup = "<div><div><div><div>\n<input onkeydown={(e) => {\n  if (e.key === 'Enter') {\n    const el = document.querySelector('a[data-has-node]') as HTMLElement | undefined;\n  }\n}} />\n</div></div></div></div>";
    let out = fmt_ts(markup);
    assert!(
        out.contains("HTMLElement | undefined"),
        "union should be flat:\n{out}"
    );
    assert!(
        !out.contains("| HTMLElement"),
        "union must not keep oxc's leading-`|` form:\n{out}"
    );
}

#[test]
fn template_as_union_expands_when_too_long_to_fit_flat() {
    // A union whose flat form overflows must stay expanded — the reflow only
    // collapses when the flat line fits, matching the oracle for long unions.
    let markup = "<div><div><div><div>\n<input onkeydown={(e) => {\n  const el = document.querySelector('a') as HtmlElementLongTypeNameXXXXXXXXXX | SomeOtherReallyLongTypeNameYYYYYYYYYY | undefinedZZZZZZZZZZ;\n}} />\n</div></div></div></div>";
    let out = fmt_ts(markup);
    assert!(
        out.contains("| HtmlElementLongTypeNameXXXXXXXXXX"),
        "long union should stay expanded (leading-`|`):\n{out}"
    );
}

#[test]
fn script_block_as_union_keeps_oxc_leading_pipe() {
    // The `<script>` path (`format_program`) is untouched: it agrees with the
    // oxfmt oracle on oxc's leading-`|` expansion, so the reflow must not reach
    // it.
    let src = "<script lang=\"ts\">\n  function handle(e) {\n    if (e.key === 'Enter' && !e.isComposing) {\n      const element = modal.querySelector('a[data-has-node]') as HTMLElement | undefined;\n      element?.click();\n    }\n  }\n</script>";
    // Narrow the width so the union deterministically breaks; the reflow must
    // still not reach the `<script>` path (`format_program`), so it stays in
    // oxc's leading-`|` form.
    let mut opts = FormatOptions::default();
    opts.js.line_width = rsvelte_formatter::LineWidth::try_from(70u16).unwrap();
    let out = format(src, &opts).expect("format ok");
    assert!(
        out.contains("| HTMLElement") && out.contains("| undefined"),
        "script-block union must keep oxc's leading-`|` form:\n{out}"
    );
}

#[test]
fn reflow_does_not_touch_template_literal_with_sibling_as_union() {
    // A multi-line template literal whose text happens to end a line with `as`
    // and continue with `| `-prefixed lines must survive verbatim, even when a
    // real `as`-union sibling in the same expression opens the reflow gate.
    let markup = "<div><div><div><div>\n<input onkeydown={(e) => {\n  const doc = `something ending as\n    | A\n    | B`;\n  const el = document.querySelector('a[data-has-node]') as HTMLElement | undefined;\n}} />\n</div></div></div></div>";
    let out = fmt_ts(markup);
    assert!(
        out.contains("`something ending as\n    | A\n    | B`"),
        "template literal body must be preserved verbatim:\n{out}"
    );
    // The genuine sibling union still flattens.
    assert!(
        out.contains("HTMLElement | undefined") && !out.contains("| HTMLElement"),
        "sibling as-union should still flatten:\n{out}"
    );
}

#[test]
fn reflow_does_not_touch_block_comment_with_sibling_as_union() {
    // A block comment containing a `| `-prefixed list after an `as`-ending line
    // must survive verbatim.
    let markup = "<div><div><div><div>\n<input onkeydown={(e) => {\n  /* pick one as\n     | A\n     | B */\n  const el = document.querySelector('a[data-has-node]') as HTMLElement | undefined;\n}} />\n</div></div></div></div>";
    let out = fmt_ts(markup);
    assert!(
        out.contains("| A\n") && out.contains("| B */"),
        "block comment body must be preserved verbatim:\n{out}"
    );
    assert!(
        out.contains("HTMLElement | undefined") && !out.contains("| HTMLElement"),
        "sibling as-union should still flatten:\n{out}"
    );
}
