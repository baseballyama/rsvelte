//! acorn raises its strict-mode reserved-word error while reading the
//! identifier, so a statement whose remainder is broken still reports at the
//! word. OXC replaces the program with a dummy on a fatal error, so the
//! strict-mode walk has no node and the word has to come from the source.
//!
//! A word that opens no statement — inside a block or a function body, an
//! object shorthand, after `export` — still reports at OXC's token.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn error_at(source: &str) -> (Option<String>, Option<(u32, u32)>) {
    let mut seen = None;
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let diagnostic = compile(
            source,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
        .expect_err("official rejects this script")
        .diagnostic();
        // The diagnostic appends the docs URL on its own line.
        let message = diagnostic
            .message
            .lines()
            .next()
            .unwrap_or_default()
            .to_string();
        let observed = (message, diagnostic.span);
        if let Some(previous) = &seen {
            assert_eq!(&observed, previous, "client and server must agree");
        }
        seen = Some(observed);
    }
    let (message, span) = seen.expect("at least one target");
    (Some(message), span)
}

fn at(source: &str, needle: &str) -> Option<(u32, u32)> {
    let offset = u32::try_from(source.find(needle).expect("needle is in the fixture")).unwrap();
    Some((offset, offset))
}

fn last_semicolon(source: &str) -> Option<(u32, u32)> {
    let offset = u32::try_from(source.rfind(';').expect("fixture ends in a broken call")).unwrap();
    Some((offset, offset))
}

#[test]
fn a_broken_statement_opening_with_a_reserved_word_reports_at_the_word() {
    let source = "<script>\n\tlet = ;\n</script>\n\n{#if true}\n";
    assert_eq!(
        error_at(source),
        (
            Some("The keyword 'let' is reserved".to_string()),
            at(source, "let")
        )
    );
}

#[test]
fn every_strict_reserved_word_reports_at_the_word() {
    for word in [
        "let",
        "yield",
        "static",
        "implements",
        "interface",
        "package",
        "private",
        "protected",
        "public",
    ] {
        let source = format!("<script>\n\t{word} + ;\n</script>");
        assert_eq!(
            error_at(&source),
            (
                Some(format!("The keyword '{word}' is reserved")),
                at(&source, word)
            ),
            "{word}"
        );
    }
}

#[test]
fn a_typescript_script_reports_at_the_word_too() {
    let source = "<script lang=\"ts\">\n\tlet = ;\n</script>";
    assert_eq!(
        error_at(source),
        (
            Some("The keyword 'let' is reserved".to_string()),
            at(source, "let")
        )
    );
}

#[test]
fn a_reserved_word_opening_an_earlier_statement_is_still_the_stopping_point() {
    // acorn stops at the first thing it cannot read, which is a whole statement
    // before the one OXC reports.
    for (source, word) in [
        ("<script>\n\tpublic;\n\tfoo(;\n</script>", "public"),
        ("<script>\n\tstatic;\n\tfoo(;\n</script>", "static"),
        ("<script>\n\tlet: 1;\n\tfoo(;\n</script>", "let"),
        ("<script>\n\tlet.a = 1;\n\tfoo(;\n</script>", "let"),
    ] {
        assert_eq!(
            error_at(source),
            (
                Some(format!("The keyword '{word}' is reserved")),
                at(source, word)
            ),
            "{source}"
        );
    }
}

#[test]
fn a_typescript_interface_declaration_is_not_a_reserved_word_use() {
    let source = "<script lang=\"ts\">\n\tinterface Foo {}\n\tfoo(;\n</script>";
    assert_eq!(
        error_at(source),
        (Some("Unexpected token".to_string()), last_semicolon(source))
    );
}

#[test]
fn a_let_that_opens_a_declaration_keeps_the_parsers_position() {
    // acorn's `isLet()`: an identifier, `[` or `{` after the keyword makes it a
    // declaration, and the error is then wherever the declaration breaks.
    for source in [
        "<script>\n\tlet a = ;\n</script>",
        "<script>\n\tlet [a] = ;\n</script>",
        "<script>\n\tlet {a} = ;\n</script>",
    ] {
        assert_eq!(
            error_at(source),
            (Some("Unexpected token".to_string()), last_semicolon(source)),
            "{source}"
        );
    }
}

#[test]
fn a_reserved_word_in_a_statement_that_already_parsed_is_not_the_stopping_point() {
    // A member property and an object key are positions where acorn reads the
    // name liberally and raises nothing, so only the failing statement counts.
    for source in [
        "<script>\n\tobj.let = 1;\n\tfoo(;\n</script>",
        "<script>\n\tconst o = { let: 1 };\n\tfoo(;\n</script>",
        "<script>\n\tconst s = \"let\";\n\tfoo(;\n</script>",
        "<script>\n\t// let\n\tfoo(;\n</script>",
    ] {
        assert_eq!(
            error_at(source),
            (Some("Unexpected token".to_string()), last_semicolon(source)),
            "{source}"
        );
    }
}
