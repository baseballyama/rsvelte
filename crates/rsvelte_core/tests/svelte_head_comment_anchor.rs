//! Upstream stamps `$.head`'s callee with the tag name's own source position
//! (`b.id('$.head', node.name_loc)`), so esrap flushes a comment left pending at
//! the end of the instance script there. rsvelte built the call unanchored, and
//! the comment was dropped.
//!
//! Expectations are read off the pinned official compiler
//! (`submodules/svelte/.../src/compiler/index.js`) rather than typed, and pin
//! *whether the comment survives* per target so unrelated codegen movement does
//! not re-pin this class silently. The corpus output gates cannot hold it:
//! `ast_equiv_batch` compares with `CommentPolicy::Ignore` and `verify.mjs`
//! normalizes with oxfmt, so both arms score equivalent.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(name, template, comments kept with dev off, comments kept with dev on)`.
const CELLS: &[(&str, &str, usize, usize)] = &[
    (
        "head",
        "<svelte:head><title>{c}</title></svelte:head>",
        1,
        1,
    ),
    ("plain", "<b>{c}</b>", 1, 1),
    ("if_", "{#if c}<b>{c}</b>{/if}", 0, 0),
    ("each", "{#each [1] as n}<b>{c}{n}</b>{/each}", 1, 1),
    ("key", "{#key c}<b>{c}</b>{/key}", 1, 1),
    ("await_", "{#await p}<b>{c}</b>{/await}", 1, 1),
    ("html", "{@html c}", 1, 1),
    ("const_", "{#if c}{@const d = c}<b>{d}</b>{/if}", 0, 0),
    ("window", "<svelte:window on:resize={() => c} />", 1, 0),
    ("bind", "<input bind:value={c} />", 1, 1),
    ("empty", "", 1, 1),
];

const HEAD: &str = "<script>\n\tlet c = 1;\n\tlet p = Promise.resolve(1);\n\t// x\n</script>\n";

fn compile_cell(template: &str, dev: bool) -> String {
    let source = format!("{HEAD}{template}\n");
    let output = compile(
        &source,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("C.svelte".into()),
            dev,
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code;

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
    assert!(
        !parsed.fatal_error && parsed.diagnostics.is_empty(),
        "output must parse:\n{output}"
    );
    output
}

fn kept(output: &str) -> usize {
    output.matches("// x").count()
}

#[test]
fn svelte_head_keeps_the_trailing_script_comment_exactly_where_official_does() {
    // A grid whose cells all expect the same answer measures nothing: an
    // implementation that never emits a comment and one that always does would
    // each pass half of it. The dev axis needs its own two-sidedness, because a
    // cell that answers alike on both targets cannot see a dev-only rule.
    assert!(CELLS.iter().any(|cell| cell.2 == 0));
    assert!(CELLS.iter().any(|cell| cell.2 > 0));
    assert!(CELLS.iter().any(|cell| cell.2 != cell.3));
    // Removing the anchor must redden this suite, so the cell the fix moves has
    // to be one the grid actually asserts on.
    assert!(CELLS.iter().any(|cell| cell.0 == "head" && cell.2 > 0));

    for &(name, template, prod, dev_kept) in CELLS {
        assert_eq!(kept(&compile_cell(template, false)), prod, "cell={name}");
        assert_eq!(
            kept(&compile_cell(template, true)),
            dev_kept,
            "dev cell={name}"
        );
    }
}
