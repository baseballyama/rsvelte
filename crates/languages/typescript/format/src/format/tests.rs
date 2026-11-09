use rsvelte_document_printer::PrintOptions;
use rsvelte_typescript::parser::parse_program;

use super::expressions::print_number;
use super::*;

/// Formats `source` on a 1 MiB stack, after parsing it on a large one: only the formatter's own
/// recursion is measured.
fn format_on_small_stack(source: &str) -> Option<String> {
    let mut tree = SyntaxTree::new();
    let program = std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn_scoped(scope, || {
                let range = Span::new(0, u32::try_from(source.len()).expect("small source"));
                parse_program(&mut tree, source, range, false).expect("parses")
            })
            .expect("spawns")
            .join()
            .expect("parses on a large stack")
    });
    let lines = LineIndex::new(source);
    std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 20)
            .spawn_scoped(scope, || {
                let mut docs = LayoutInstructions::new();
                let root = Formatter::new(&tree, source, &lines, &mut docs, Options::default())
                    .program(program)
                    .ok()?;
                let options = PrintOptions {
                    width: usize::MAX / 2,
                    ..PrintOptions::default()
                };
                docs.print(root, &options).ok()
            })
            .expect("spawns")
            .join()
            .expect("formats within a 1 MiB stack")
    })
}

#[test]
fn long_chains_and_deep_blocks_format_without_recursing_per_level() {
    const LINKS: usize = 20_000;
    const DEPTH: usize = 2_000;
    for (source, expected) in [
        (
            format!("x{};", ".b".repeat(LINKS)),
            format!("x{};\n", ".b".repeat(LINKS)),
        ),
        (
            format!("f{};", "()".repeat(LINKS)),
            format!("f{};\n", "()".repeat(LINKS)),
        ),
        (
            format!("if (a) {{}}{}", " else if (a) {}".repeat(LINKS)),
            format!("if (a) {{\n}}{}\n", " else if (a) {\n}".repeat(LINKS)),
        ),
    ] {
        assert_eq!(
            format_on_small_stack(&source).as_deref(),
            Some(expected.as_str())
        );
    }
    let source = format!("{}x;{}", "{".repeat(DEPTH), "}".repeat(DEPTH));
    let mut expected = String::new();
    for level in 0..DEPTH {
        expected.push_str(&"  ".repeat(level));
        expected.push_str("{\n");
    }
    expected.push_str(&"  ".repeat(DEPTH));
    expected.push_str("x;\n");
    for level in (0..DEPTH).rev() {
        expected.push_str(&"  ".repeat(level));
        expected.push_str("}\n");
    }
    assert_eq!(format_on_small_stack(&source), Some(expected));
}

#[test]
fn numbers_print_like_prettier() {
    for (raw, want) in [
        ("1", "1"),
        ("1.0", "1.0"),
        ("1.50", "1.5"),
        ("1.", "1"),
        (".5", "0.5"),
        ("1E+05", "1e5"),
        ("2e-007", "2e-7"),
        ("3e0", "3"),
        ("0XAB", "0xab"),
    ] {
        assert_eq!(print_number(raw), want, "{raw}");
    }
}

#[test]
fn strings_prefer_double_quotes_unless_that_needs_more_escapes() {
    assert_eq!(make_string("a", preferred_quote("a", false)), "\"a\"");
    let q = "say \"hi\"";
    assert_eq!(make_string(q, preferred_quote(q, false)), "'say \"hi\"'");
    assert_eq!(
        make_string("it\\'s", preferred_quote("it\\'s", false)),
        "\"it's\""
    );
    assert_eq!(make_string("\\d", '"'), "\"d\"");
}
