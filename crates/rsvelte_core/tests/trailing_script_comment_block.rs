//! A statement-position block is `b.block([…])` upstream and so carries no
//! `loc`, which makes esrap's `body` discard every pending comment at the brace.
//! rsvelte derived a comment-buffer span for it instead, so a comment at the end
//! of the instance script was flushed there and kept where official drops it.
//!
//! Expectations are read off the pinned official compiler
//! (`submodules/svelte/.../src/compiler/index.js`), which is the entry point the
//! corpus gates use. They pin *whether the comment survives* per target rather
//! than the whole program, so unrelated codegen movement does not re-pin this
//! class silently. The corpus output gates cannot hold this: `ast_equiv_batch`
//! compares with `CommentPolicy::Ignore`, so both arms score equivalent.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(name, template, comments kept on client, comments kept on server)`.
/// A bare block only exists in the client lowering, so every server cell is 1 —
/// a fix that reaches the server would take those to 0.
const CELLS: &[(&str, &str, usize, usize)] = &[
    ("if", "{#if c}\n\t<b>y</b>\n{/if}\n", 0, 1),
    ("if_const", "{#if c}{@const d = c}<b>{d}</b>{/if}\n", 0, 1),
    ("element", "<b>{c}</b>\n", 1, 1),
    ("await", "{#await p}\n\t<b>y</b>\n{/await}\n", 1, 1),
    ("no_template", "", 1, 1),
    ("bind", "<input bind:value={c} />\n", 1, 1),
    (
        "options",
        "<svelte:options runes={false} />\n<b>{c}</b>\n",
        1,
        1,
    ),
];

const HEAD: &str = "<script>\n\tlet c = 1;\n\tlet p = Promise.resolve(1);\n\t// x\n</script>\n\n";

fn compile_cell(template: &str, generate: GenerateMode, dev: bool) -> String {
    let source = format!("{HEAD}{template}");
    let output = compile(
        &source,
        CompileOptions {
            generate,
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
fn trailing_script_comment_survives_exactly_where_official_keeps_it() {
    // A grid every cell of which expects the same answer measures nothing: an
    // implementation that never emits a comment, and one that always does,
    // would each pass half of it.
    assert!(CELLS.iter().any(|cell| cell.2 == 0));
    assert!(CELLS.iter().any(|cell| cell.2 > 0));

    for &(name, template, client, server) in CELLS {
        for dev in [false, true] {
            assert_eq!(
                kept(&compile_cell(template, GenerateMode::Client, dev)),
                client,
                "client dev={dev} cell={name}"
            );
            assert_eq!(
                kept(&compile_cell(template, GenerateMode::Server, dev)),
                server,
                "server dev={dev} cell={name}"
            );
        }
    }
}
