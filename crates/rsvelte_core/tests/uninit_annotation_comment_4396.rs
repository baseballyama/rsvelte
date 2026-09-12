//! A declarator with no initializer ends at its identifier, so a comment left
//! behind by its erased TypeScript annotation has nothing to attach to and was
//! dropped. Upstream flushes it at the next located node instead (#4396).
//!
//! Re-emitting it at the removal point stays wrong for the reason #4395
//! recorded: the client's legacy state lowering is line-oriented, so a comment
//! inside the declaration's own line turns `let stats = $.mutable_source(0)`
//! into `let stats;` — text that parses, runs, and is no longer reactive. The
//! comment therefore goes on its own line ahead of the FOLLOWING statement.
//!
//! Every expected string below is official Svelte 5.57.0's own output for the
//! same source (`submodules/svelte`, pin `7bc0a70fe`), read off the oracle
//! rather than inferred from a neighbouring cell. Upstream prints the comment
//! twice because acorn-typescript speculates over the annotation; that is the
//! oracle's answer here, not a defect being pinned.
//!
//! No corpus gate observes any of this: `ast_equiv_batch` runs with
//! `CommentPolicy::Ignore`, so a comment-only divergence scores `match` on both
//! arms.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_with(src: &str, name: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some(format!("{name}.svelte")),
            generate,
            name: Some(name.to_string()),
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

fn client(src: &str, name: &str) -> String {
    compile_with(src, name, GenerateMode::Client)
}

fn server(src: &str, name: &str) -> String {
    compile_with(src, name, GenerateMode::Server)
}

/// `let a: { /* c */ b: number } | null;` followed by another statement.
const BLOCK: &str = "<script lang=\"ts\">\n\tlet a: {\n\t\t/* c */\n\t\tb: number;\n\t} | null;\n\tlet n = 1;\n</script>\n<i>{a}{n}</i>\n";

/// The same with a line comment, which is the spelling the real-world carrier
/// (`adventurelog`'s `+page.svelte`, `// Legacy fields`) uses.
const LINE: &str = "<script lang=\"ts\">\n\tlet a: {\n\t\t// c\n\t\tb: number;\n\t} | null;\n\tlet n = 1;\n</script>\n<i>{a}{n}</i>\n";

#[test]
fn a_block_comment_floats_to_the_next_statement_on_the_client() {
    let out = client(BLOCK, "Follow");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tlet a;\n\n\t/* c */\n\t/* c */\n\tlet n = 1;\n"),
        "{out}"
    );
}

#[test]
fn a_block_comment_floats_to_the_next_statement_on_the_server() {
    let out = server(BLOCK, "Follow");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tlet a;\n\n\t/* c */\n\t/* c */\n\tlet n = 1;\n"),
        "{out}"
    );
}

#[test]
fn a_line_comment_floats_to_the_next_statement_on_the_client() {
    let out = client(LINE, "Lineann");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tlet a;\n\n\t// c\n\t// c\n\tlet n = 1;\n"),
        "{out}"
    );
}

#[test]
fn a_line_comment_floats_to_the_next_statement_on_the_server() {
    let out = server(LINE, "Lineann");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tlet a;\n\n\t// c\n\t// c\n\tlet n = 1;\n"),
        "{out}"
    );
}

/// The hazard #4395 recorded, on the shape the real-world carrier has: a legacy
/// (non-runes) mutable declaration must keep its initializer. A comment landing
/// inside the declaration's own line is what turned this into `let stats;`.
#[test]
fn the_following_legacy_declaration_keeps_its_initializer() {
    let out = client(
        "<script lang=\"ts\">\n\tlet stats: {\n\t\t// Legacy fields\n\t\tb: number;\n\t} | null;\n\tlet user = 0;\n\tfunction bump() { user += 1; }\n</script>\n<i on:click={bump}>{user}</i>\n",
        "Legacy",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("// Legacy fields"), "{out}");
    assert!(out.contains("$.mutable_source(0)"), "{out}");
}

/// An initialized declarator is unchanged: its comment still goes ahead of the
/// initializer, which is #4395's own placement.
#[test]
fn an_initialized_declarator_is_untouched() {
    let out = client(
        "<script lang=\"ts\">\n\tlet a: {\n\t\t/* c */\n\t\tb: number;\n\t} | null = null;\n</script>\n<i>{a}</i>\n",
        "Init",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tlet a = /* c */\n\t/* c */\n\tnull;\n"),
        "{out}"
    );
}

/// The half this does NOT close: when the declarator ends its statement list,
/// upstream carries the comment out of the script entirely (onto the template's
/// own first statement), which no source-range rewrite can express. Pinned so
/// the gap is a measured fact rather than an unstated one.
#[test]
fn a_declarator_that_ends_its_list_still_drops_the_comment() {
    let out = client(
        "<script lang=\"ts\">\n\tlet a: {\n\t\t/* c */\n\t\tb: number;\n\t} | null;\n</script>\n<i>{a}</i>\n",
        "Noinit",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("/* c */"), "{out}");
}
