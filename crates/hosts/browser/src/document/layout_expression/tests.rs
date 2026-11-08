use super::*;

fn print(source: &str, width: usize) -> Result<String, LayoutExpressionError> {
    let parsed = parse(source)?;
    parsed
        .docs
        .print(
            parsed.root,
            &rsvelte_document_printer::PrintOptions {
                width,
                ..rsvelte_document_printer::PrintOptions::default()
            },
        )
        .map_err(|_refused| LayoutExpressionError {
            message: "flat-only layout refused".to_owned(),
            at: 0,
        })
}

#[test]
fn builds_documents_and_named_groups() {
    let call = concat!(
        r#"group("f(", indent([softline, "#,
        r#"join([",", line], ["aaaa", "bbbb"])]), softline, ")")"#
    );
    assert_eq!(print(call, 80).expect("valid DSL"), "f(aaaa, bbbb)");
    assert_eq!(
        print(call, 10).expect("valid DSL"),
        "f(\n  aaaa,\n  bbbb\n)"
    );
    assert_eq!(
        print(
            r#"[groupId("g", "x", line, "y"), ifBreakOf("g", "!", "?")]"#,
            3,
        )
        .expect("valid DSL"),
        "x\ny!"
    );
}

#[test]
fn reports_utf16_offsets() {
    let error = parse("[\"日\", @]").expect_err("invalid character");
    assert_eq!(error.at, 6);
    let error = parse("// 😀\n[\"x\" \"y\"]").expect_err("missing comma");
    assert_eq!(error.at, 11);
    let error = parse("[\"😀\\q\"]").expect_err("unknown escape");
    assert_eq!(error.at, 4);
    let error = parse("[\"日\"").expect_err("unclosed list");
    assert_eq!(error.at, 4);
}

#[test]
fn origins_point_at_the_source_of_each_instruction() {
    let source = "indent([\"a\", line])";
    let parsed = parse(source).expect("valid DSL");
    let mut origins = parsed.origins;
    origins.sort_unstable();
    // line, the list's concatenation, then the indentation.
    assert_eq!(
        origins
            .iter()
            .map(|&(_, at)| &source[at..])
            .collect::<Vec<_>>(),
        ["line])", "[\"a\", line])", "indent([\"a\", line])"]
    );
}

#[test]
fn checks_argument_counts_and_escapes() {
    assert_eq!(
        parse("indent()").expect_err("no argument").message,
        "indent は引数を 1 個とります"
    );
    assert_eq!(
        parse("ifBreak(\"a\", \"b\", \"c\")")
            .expect_err("three arguments")
            .message,
        "ifBreak は引数を 2 個とります"
    );
    assert_eq!(
        print(r#""a\"b\\c\td""#, 80).expect("valid escapes"),
        "a\"b\\c\td"
    );
}

#[test]
fn refuses_deep_nesting_instead_of_overflowing_the_stack() {
    let deep = |n: usize| format!("{}\"x\"{}", "[".repeat(n), "]".repeat(n));
    assert_eq!(
        print(&deep(MAX_DEPTH - 1), 80).expect("within the limit"),
        "x"
    );
    let error = parse(&deep(100_000)).expect_err("too deep");
    assert_eq!(error.at, MAX_DEPTH);
}
