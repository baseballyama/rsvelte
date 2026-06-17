//! Port of esrap's `test/arrow-function-return-type.test.js`: a long arrow
//! return type must not push `=>` onto its own line, and the output must reparse.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::print;

#[test]
fn no_line_terminator_before_arrow_for_long_return_type() {
    let input = concat!(
        "const toNode = (kind: string): { kind: 'logical'; value: string } | ",
        "{ kind: 'binary'; value: number } => ",
        "(kind === 'and' ? { kind: 'logical', value: kind } : { kind: 'binary', value: 1 });"
    );
    let alloc = Allocator::default();
    let st = SourceType::default()
        .with_module(true)
        .with_typescript(true);
    let ret = Parser::new(&alloc, input, st).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    let code = print(&ret.program, input);

    // No LineTerminator immediately before `=>`.
    for (i, _) in code.match_indices("=>") {
        let before = &code[..i];
        let trimmed = before.trim_end_matches([' ', '\t']);
        assert!(
            !trimmed.ends_with('\n') && !trimmed.ends_with('\r'),
            "found a line break before `=>`:\n{code}"
        );
    }

    // Output must re-parse without errors.
    let alloc2 = Allocator::default();
    let reparse = Parser::new(&alloc2, &code, st).parse();
    assert!(
        reparse.diagnostics.is_empty(),
        "reparse error: {:?}\ncode:\n{code}",
        reparse.diagnostics
    );
}
