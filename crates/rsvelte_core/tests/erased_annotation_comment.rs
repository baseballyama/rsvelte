//! A comment left behind when TypeScript erasure removes a type ANNOTATION was
//! dropped entirely, while one left behind by an erased *declaration* survived.
//! The gate on the re-emission was a conjunction, and each of its two terms
//! independently silenced a host: `!is_inline_type_annotation` (an annotation)
//! and `removed.contains('\n')` (a single-line region). The reported repro trips
//! both, so a fix that repairs one moves no bytes at all.
//!
//! What replaces them is one term, and it is the rule upstream's printer already
//! follows: an annotation on a declarator with an initializer keeps the comment
//! (it is flushed ahead of the initializer, which is the next located node),
//! and one on a declarator WITHOUT an initializer does not — there the
//! declaration ends at the identifier and the comment floats to whatever comes
//! next. Re-emitting it at the removal point in that second case puts it after
//! the `;`, and the client's legacy state lowering stops scanning there: measured
//! over the corpus, `let stats = $.mutable_source()` came out as `let stats;`,
//! which parses, runs, and is no longer reactive.
//!
//! Every expected string below is the oracle's own output
//! (`submodules/svelte/…/src/compiler/index.js`, `generate: 'client'`,
//! `dev: false`), read out of it rather than reasoned about — the counts alone
//! do not pin this, which is why the cells compare TEXT: under a
//! count-keyed grid the one-line-annotation row reads `2 == 2` and EQUAL while
//! the two copies sit on different lines than upstream puts them on.
//!
//! One cell is deliberately NOT the oracle's output and says so. Upstream emits
//! the comment twice through `@sveltejs/acorn-typescript@1.0.10`'s `tsLookAhead`
//! (see `collect_speculative_type_head_regions`), and rsvelte reproduces that
//! where it can; the residual row is the shape where it cannot yet — #4397
//! retired the other one, which is why the one-line annotation is now a matched
//! cell above rather than a pin below.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_lines(body: &str, tmpl: &str) -> Vec<String> {
    let src = format!("<script lang=\"ts\">\n{body}\n</script>\n<i>{tmpl}</i>\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(|l| l.trim_end().to_string())
        .filter(|l| l.contains("/* c */") || l.contains("let a") || l.contains("let v"))
        .collect()
}

/// The cells whose whole generated text upstream and rsvelte agree on.
#[test]
fn an_erased_annotations_comment_lands_where_upstream_puts_it() {
    let cells: [(&str, &str, &str, &[&str]); 6] = [
        (
            "multi-line annotation on an initialized declarator",
            "\tlet a: {\n\t\t/* c */\n\t\tb: number;\n\t} = { b: 1 };",
            "{a.b}",
            &["\tlet a = /* c */", "\t/* c */"],
        ),
        (
            // The row above and this one differ only in where the newline sits,
            // and upstream answers differently: the separator after the flushed
            // comment is the source text between it and the initializer (#4397).
            "one-line annotation on an initialized declarator",
            "\tlet a: { /* c */ b: number } = { b: 1 };",
            "{a.b}",
            &["\tlet a = /* c */ /* c */ { b: 1 };"],
        ),
        (
            "one-line interface declaration",
            "\tinterface I { /* c */ a?: number }\n\tlet v: I = {};",
            "{v.a}",
            &["\t/* c */", "\tlet v = {};"],
        ),
        (
            // A type alias's `{` is a speculative head and an interface body is
            // not, so this row carries two copies where the one above carries one.
            "one-line type alias declaration",
            "\ttype P = { /* c */ a?: number };\n\tlet v: P = {};",
            "{v.a}",
            &["\t/* c */", "\t/* c */", "\tlet v = {};"],
        ),
        (
            "multi-line function return annotation",
            "\tfunction f(): {\n\t\t/* c */\n\t\tb: number;\n\t} {\n\t\treturn { b: 1 };\n\t}\n\tlet a = f();",
            "{a.b}",
            &["\tfunction f(/* c */", "\t/* c */", "\tlet a = f();"],
        ),
        (
            // Control: a value-position comment is not erased at all, so it must
            // read the same before and after this change. It separates
            // "rsvelte mishandles erased positions" from "mishandles comments".
            "value position, nothing erased",
            "\tlet a = /* c */ { b: 1 };",
            "{a.b}",
            &["\tlet a = /* c */ { b: 1 };"],
        ),
    ];

    let mut failures = Vec::new();
    for (name, body, tmpl, expected) in cells {
        let got = compile_lines(body, tmpl);
        if got != expected {
            failures.push(format!(
                "{name}\n  expected {expected:?}\n  got      {got:?}"
            ));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

/// The shape where rsvelte still differs from upstream (#4396), pinned so the
/// difference is a recorded value rather than an unexamined one. It is
/// comment-placement only, which is exactly the class `ast_equiv_batch` rescues
/// under `CommentPolicy::Ignore` — so no corpus gate can hold it. #4397 retired
/// the one-line annotation that used to sit here; issues citing this test under
/// its old name `the_two_residual_shapes_are_pinned_rather_than_matched` mean
/// this one.
#[test]
fn the_residual_shape_is_pinned_rather_than_matched() {
    // Upstream: `let a;` then `var /* c */` `/* c */` — the comment floats to the
    // next located node. rsvelte drops it, which is what keeps the declaration's
    // own lowering intact.
    let got = compile_lines(
        "\tlet a: {\n\t\t/* c */\n\t\tb: number;\n\t} | null;",
        "{a}",
    );
    assert_eq!(
        got,
        vec!["\tlet a;".to_string()],
        "uninitialized declarator: no comment, and the declaration is intact"
    );
}
