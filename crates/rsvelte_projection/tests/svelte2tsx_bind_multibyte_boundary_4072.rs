//! Regression test for #4072: svelte2tsx aborted with a UTF-8 char-boundary
//! panic on a `bind:` whose value expression starts with a multi-byte char.
//!
//! `opener_spacing.rs`'s `push_bind_directive_ranges` located the directive's
//! `=` with `source[..=expr_start].rfind('=')`. `expr_start` is a byte offset
//! and the range is *inclusive*, so the slice ends at `expr_start + 1` — inside
//! the expression's first char whenever that char is multi-byte. The astral
//! text in the reported repro is incidental; a single CJK identifier is enough.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Component.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts)
        .expect("svelte2tsx should not fail")
        .code
}

#[test]
fn element_bind_value_with_multibyte_identifier() {
    let out =
        tsx("<script lang=\"ts\">\n  let 値: string = '';\n</script>\n<input bind:value={値} />");
    assert!(out.contains('値'), "output:\n{out}");
}

#[test]
fn element_bind_value_with_astral_identifier() {
    let out =
        tsx("<script lang=\"ts\">\n  let 𝔘: string = '';\n</script>\n<input bind:value={𝔘} />");
    assert!(out.contains('𝔘'), "output:\n{out}");
}

#[test]
fn element_bind_value_with_ts_assertion_on_multibyte_identifier() {
    let out = tsx(
        "<script lang=\"ts\">\n  let 値: string = '';\n</script>\n<input bind:value={値 as string} />",
    );
    assert!(out.contains('値'), "output:\n{out}");
}

#[test]
fn component_bind_with_multibyte_identifier() {
    let out = tsx(
        "<script lang=\"ts\">\n  import C from './C.svelte';\n  let 値: string = '';\n</script>\n<C bind:v={値} />",
    );
    assert!(out.contains('値'), "output:\n{out}");
}

#[test]
fn svelte_element_bind_with_multibyte_identifier() {
    let out = tsx(
        "<script lang=\"ts\">\n  let 値: string = '';\n  const kind = 'input';\n</script>\n<svelte:element this={kind} bind:value={値} />",
    );
    assert!(out.contains('値'), "output:\n{out}");
}

/// The file from the report, byte for byte.
#[test]
fn reported_repro_file() {
    let src = include_str!(
        "../../../compatibility/pattern-corpus/issues/4072-bind-value-multibyte-boundary.svelte"
    );
    let out = tsx(src);
    assert!(out.contains('値'), "output:\n{out}");
}

/// Same class, a different site, found by sweeping the crate for byte-offset
/// `str` slices rather than by a report: `rewrite_interface_to_type_dts` used to
/// walk back from the first heritage entry over whitespace and read the seven
/// bytes before it as the `extends` keyword, so a comment between the two put
/// those bytes inside the comment's text and a multi-byte char there was sliced
/// mid-character. `--mode dts` only (`svelte-package`), which is why
/// `rsvelte-check` never reached it.
///
/// That slice is gone — #4077 replaced all three of the function's text scans
/// with spans, and `svelte2tsx_dts_interface_heritage_4077.rs` is where those
/// live. What is still only here is the **multi-byte** comment: these rows say
/// that a `/*日本*/` in the slot behaves exactly like the `/*hi*/` beside it,
/// which is what would go red if byte arithmetic ever returned to the site.
/// Both expectations are official's own output, so they no longer have to be
/// stated as "the two agree with each other".
mod dts_interface_extends {
    use rsvelte_projection::svelte2tsx::{Svelte2TsxMode, Svelte2TsxOptions, svelte2tsx};

    fn dts(comment: &str) -> String {
        let opts = Svelte2TsxOptions {
            filename: "Component.svelte".to_string(),
            is_ts_file: true,
            mode: Svelte2TsxMode::Dts,
            ..Default::default()
        };
        let src = format!(
            "<script lang=\"ts\">\n  interface B {{ a: string }}\n  interface A extends /*{comment}*/B {{ b: string }}\n  export let x: A;\n</script>\n{{x}}"
        );
        svelte2tsx(&src, opts)
            .expect("svelte2tsx should not fail")
            .code
    }

    /// `/*日本*/` is 10 bytes — the width that put the old `- 7` inside `日`.
    #[test]
    fn multibyte_comment_between_extends_and_its_heritage_entry() {
        let out = dts("日本");
        assert!(
            out.contains("type A = /*日本*/B &  { b: string }"),
            "output:\n{out}"
        );
    }

    /// The ASCII control: same shape, no boundary to cross.
    #[test]
    fn ascii_comment_between_extends_and_its_heritage_entry() {
        let out = dts("hi");
        assert!(
            out.contains("type A = /*hi*/B &  { b: string }"),
            "output:\n{out}"
        );
    }

    /// No comment: the row that keeps the two above from reading as "this path
    /// never fires".
    #[test]
    fn no_comment_still_rewrites_extends() {
        let opts = Svelte2TsxOptions {
            filename: "Component.svelte".to_string(),
            is_ts_file: true,
            mode: Svelte2TsxMode::Dts,
            ..Default::default()
        };
        let out = svelte2tsx(
            "<script lang=\"ts\">\n  interface B { a: string }\n  interface A extends B { b: string }\n  export let x: A;\n</script>\n{x}",
            opts,
        )
        .expect("svelte2tsx should not fail")
        .code;
        assert!(out.contains("type A = B"), "output:\n{out}");
    }
}
