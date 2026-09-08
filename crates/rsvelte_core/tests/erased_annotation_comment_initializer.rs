//! A comment left inside an erased declarator annotation is flushed ahead of the
//! INITIALIZER, which is where upstream's printer puts it — not at the annotation
//! it removed.
//!
//! The difference is not cosmetic. Re-emitted at the removal point the comment
//! sits between the identifier and the `=`, and the client's legacy state
//! lowering looks for the literal `"<keyword> <var> ="`: the needle misses, the
//! `$.mutable_source()` wrapping is dropped, and the declaration keeps its raw
//! value while every read and write around it still goes through `$.get`/`$.set`.
//! The corpus found it only under mutation (a comment inserted into a type
//! literal), so the rows below carry all eight comment kinds rather than the two
//! the report happened to bring — the defect is the comment's presence, not the
//! `)` or `}` inside it.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// Every `COMMENT_KINDS` value from `scripts/compat-corpus/matrix/axes.mjs`.
const COMMENT_KINDS: [&str; 8] = [
    "// c",
    "// } c",
    "// ) c",
    "// ; c",
    "/* c */",
    "/* } c */",
    "/* ) c */",
    "// svelte-ignore a11y_no_static_element_interactions",
];

fn client(comment: &str) -> String {
    let source = format!(
        "<script lang=\"ts\">\n  export let n = 0;\n\n  let tabs: {{\n    a: string;\n    {comment}\n    b: number;\n  }}[] = [];\n\n  $: {{\n    tabs = [{{ a: \"x\", b: n }}];\n  }}\n</script>\n\n<p>{{tabs.length}}</p>\n"
    );
    compile(
        &source,
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

#[test]
fn a_commented_annotation_keeps_its_legacy_state_wrapping() {
    for comment in COMMENT_KINDS {
        let out = client(comment);
        assert!(
            out.contains("let tabs = $.mutable_source("),
            "{comment:?} lost the mutable_source wrapping:\n{out}"
        );
        // The reads and writes agree with the declaration or the component throws
        // at runtime, which is the shape the byte gate cannot tell from a comment
        // move.
        assert!(
            out.contains("$.set(tabs,") && out.contains("$.get(tabs)"),
            "{comment:?} lost a read or a write:\n{out}"
        );
    }
}

/// Control: the same declaration with no comment in the annotation, and with no
/// annotation at all. Neither may move.
#[test]
fn an_uncommented_annotation_is_unchanged() {
    for source in [
        "<script lang=\"ts\">\n  export let n = 0;\n  let tabs: {\n    a: string;\n    b: number;\n  }[] = [];\n  $: {\n    tabs = [{ a: \"x\", b: n }];\n  }\n</script>\n\n<p>{tabs.length}</p>\n",
        "<script>\n  export let n = 0;\n  let tabs = [];\n  $: {\n    tabs = [{ a: \"x\", b: n }];\n  }\n</script>\n\n<p>{tabs.length}</p>\n",
    ] {
        let out = compile(
            source,
            CompileOptions {
                filename: Some("R.svelte".to_string()),
                generate: GenerateMode::Client,
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        assert!(
            out.contains("let tabs = $.mutable_source([]);"),
            "control moved:\n{out}"
        );
    }
}

/// The comment still has to survive: dropping it instead of moving it would pass
/// every assertion above.
#[test]
fn the_comment_is_still_printed() {
    let out = client("// keep-me");
    assert!(
        out.contains("// keep-me"),
        "the comment was dropped rather than moved:\n{out}"
    );
}
