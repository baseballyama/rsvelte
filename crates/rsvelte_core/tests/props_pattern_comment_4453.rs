//! A comment inside a destructured `$props()` pattern survives to the client
//! output, at the position upstream's printer puts it.
//!
//! The client's state transform replaces SOURCE SPANS rather than reprinting, so
//! whatever sits inside a replaced range is deleted with it. A read-only
//! destructure makes `transform_props_destructuring` return nothing, and the
//! declaration's own comments went with it. Upstream deletes the declaration too
//! and flushes its comments before the first located node that follows them —
//! which is the template's `var` declarator when no instance statement does, so
//! the comment prints after the `var` keyword.
//!
//! The report arrived with `lang="ts"` as one of three terms. It is not a term:
//! every case below is plain JavaScript. A comment inside an ERASED TYPE
//! ANNOTATION is deliberately not carried — which of those upstream keeps is
//! position-dependent (two shadcn-svelte components show it dropping them), so
//! that half belongs with the TypeScript erasure machinery and not here.
//!
//! No corpus gate can hold any of this: `verify.mjs` calls `ast_equiv_batch`
//! with no arguments, so `CommentPolicy::Ignore` applies and a divergence that
//! lives only in comments is scored a pass for every entry and every target.
//!
//! Expected strings are the official compiler's own output, not this port's.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("R.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Presence alone cannot see a comment that survives in the wrong place — the
/// count-keyed version of this grid scored `H5` as passing while it printed the
/// comment before a statement upstream leaves untouched. Each row therefore
/// pins the surrounding text.
#[test]
fn a_comment_in_a_removed_props_pattern_lands_where_upstream_puts_it() {
    let rows: [(&str, &str); 5] = [
        // Nothing follows in the script: the next located node is the
        // template's declarator, so the comment prints after `var`.
        (
            "<script>\n\tlet { a /* c */ } = $props();\n</script>\n<i>{a}</i>\n",
            "\n\tvar /* c */\n\ti = root();\n",
        ),
        // A statement PRECEDES it. The comment may not move backwards onto it.
        (
            "<script>\n\tconst q = 1;\n\tlet { a /* c */ } = $props();\n</script>\n<i>{a}{q}</i>\n",
            "\n\tvar /* c */\n\ti = root();\n",
        ),
        // A statement precedes and another follows: the following one wins.
        (
            "<script>\n\tconst p = 1;\n\tlet { a /* c */ } = $props();\n\tconst q = 2;\n</script>\n<i>{a}{p}{q}</i>\n",
            "\n\t/* c */\n\tconst q = 2;\n",
        ),
        // A line comment flushes the same way and must not swallow what follows.
        (
            "<script>\n\tlet { a // c\n\t} = $props();\n</script>\n<i>{a}</i>\n",
            "\n\tvar // c\n\ti = root();\n",
        ),
        // Two comments keep their order and are not merged onto one line.
        (
            "<script>\n\tlet { /* c */ a /* c */ } = $props();\n</script>\n<i>{a}</i>\n",
            "\n\tvar /* c */\n\t/* c */\n\ti = root();\n",
        ),
    ];
    for (source, expected) in rows {
        let out = client(source);
        assert!(
            out.contains(expected),
            "{source:?}\nexpected to contain {expected:?}\ngot:\n{out}"
        );
    }
}

/// Rows that must NOT move. Each already carried its comment before the fix,
/// because the helper rewrites the declaration rather than removing it and the
/// comment rides along in the replacement text — so a carry that is not gated
/// on the removal doubles them, and the count is what says so.
#[test]
fn a_declaration_the_helper_rewrites_keeps_exactly_one_copy() {
    let rows: [&str; 4] = [
        "<script>\n\tlet { a = 1 /* c */ } = $props();\n</script>\n<i>{a}</i>\n",
        "<script>\n\tlet { a, /* c */ ...rest } = $props();\n</script>\n<i>{a}{rest.b}</i>\n",
        "<script>\n\tlet { a = $bindable(1) /* c */ } = $props();\n</script>\n<i>{a}</i>\n",
        "<script>\n\tlet { a /* c */ } = $props();\n\tfunction f() { a = 2; }\n</script>\n<i>{a}</i><button onclick={f}>x</button>\n",
    ];
    for source in rows {
        let out = client(source);
        assert_eq!(
            out.matches("/* c */").count(),
            1,
            "{source:?} changed:\n{out}"
        );
    }
}

/// Neighbours outside the axis: a comment before the declaration, a
/// non-destructured `$props()`, and a destructure that is not `$props()`.
/// None reaches the removal branch.
#[test]
fn neighbours_of_the_axis_keep_their_single_copy() {
    let rows: [&str; 3] = [
        "<script>\n\t/* c */\n\tlet { a } = $props();\n</script>\n<i>{a}</i>\n",
        "<script>\n\tlet p = /* c */ $props();\n</script>\n<i>{p.a}</i>\n",
        "<script>\n\tlet { a } = /* c */ { a: 1 };\n</script>\n<i>{a}</i>\n",
    ];
    for source in rows {
        let out = client(source);
        assert_eq!(
            out.matches("/* c */").count(),
            1,
            "{source:?} changed:\n{out}"
        );
    }
}

/// The needle is not something the compiler emits on its own: the same
/// declaration with no comment must yield zero. Without this, a fix that
/// emitted a stray `/* c */` would satisfy every assertion above.
#[test]
fn the_needle_is_absent_when_the_source_has_no_comment() {
    let out = client("<script>\n\tlet { a } = $props();\n</script>\n<i>{a}</i>\n");
    assert_eq!(
        out.matches("/* c */").count(),
        0,
        "unprompted needle:\n{out}"
    );
}
