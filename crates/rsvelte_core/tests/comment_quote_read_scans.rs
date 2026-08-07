//! An apostrophe in a comment must not swallow the reads that follow it.
//!
//! Both scans below track quote state to avoid rewriting identifiers inside
//! string literals, and neither knew what a comment was. `it's` opens a string
//! nothing closes, so every position after it answers "inside a string" and its
//! read is emitted uncalled — code that parses and is silently wrong at runtime,
//! which is why no gate that only checks parseability sees it.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("Apostrophe.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Store read, reached through an ordinary multi-line statement — the comment
/// survives into `transform_store_reads_client` because nothing strips comments
/// outside a `$:` statement.
#[test]
fn a_comment_apostrophe_does_not_swallow_a_store_read() {
    let out = client(
        "<script>\n\
         \timport { writable } from 'svelte/store';\n\
         \tconst s = writable(1);\n\
         \n\
         \tconst obj = {\n\
         \t\t// it's fine\n\
         \t\tv: $s\n\
         \t};\n\
         </script>\n\
         \n\
         <div>{obj.v}</div>\n",
    );

    assert!(
        out.contains("v: $s()"),
        "store read left uncalled after a comment apostrophe: {out}"
    );
}

/// Prop read inside a `$:` body. A `svelte-ignore` comment is deliberately left
/// where it is — later text passes find it by scanning back from the node it
/// annotates — so it is the one comment kind that always reaches these scans
/// from a reactive statement.
#[test]
fn a_svelte_ignore_apostrophe_does_not_swallow_a_prop_read() {
    let out = client(
        "<script>\n\
         \texport let rows = [];\n\
         \texport let filterSelections = {};\n\
         \n\
         \t$: filteredRows = rows.filter((r) => {\n\
         \t\treturn Object.keys(filterSelections).every((f) => {\n\
         \t\t\t// svelte-ignore a11y_no_static_element_interactions it's not defined\n\
         \t\t\tif (filterSelections[f] === '') {\n\
         \t\t\t\treturn true;\n\
         \t\t\t}\n\
         \t\t\treturn false;\n\
         \t\t});\n\
         \t});\n\
         </script>\n\
         \n\
         <div>{filteredRows.length}</div>\n",
    );

    assert!(
        out.contains("filterSelections()[f]"),
        "prop read left uncalled after a comment apostrophe: {out}"
    );
}

/// Control: a real string literal still suppresses the rewrite, so the fix is
/// "comments are not strings" and not "quote tracking was dropped".
#[test]
fn an_identifier_inside_a_real_string_is_still_left_alone() {
    let out = client(
        "<script>\n\
         \timport { writable } from 'svelte/store';\n\
         \tconst s = writable(1);\n\
         \n\
         \tconst obj = {\n\
         \t\tlabel: 'read $s here',\n\
         \t\tv: $s\n\
         \t};\n\
         </script>\n\
         \n\
         <div>{obj.v}</div>\n",
    );

    assert!(
        out.contains("'read $s here'"),
        "string literal rewritten: {out}"
    );
    assert!(out.contains("v: $s()"), "store read left uncalled: {out}");
}

/// A block comment reaches the same scans through the other `skip_opaque`
/// branch, and an apostrophe in one is at least as common as in a line comment.
#[test]
fn a_block_comment_apostrophe_does_not_swallow_a_store_read() {
    let out = client(
        "<script>\n\
         \timport { writable } from 'svelte/store';\n\
         \tconst s = writable(1);\n\
         \n\
         \tconst obj = {\n\
         \t\t/* it's fine */\n\
         \t\tv: $s\n\
         \t};\n\
         </script>\n\
         \n\
         <div>{obj.v}</div>\n",
    );

    assert!(
        out.contains("v: $s()"),
        "store read left uncalled after a block-comment apostrophe: {out}"
    );
}
