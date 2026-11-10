use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex};

use super::print_mapped;

/// The generated offset of every token the printer maps, by an index of the printed text.
fn indexed(source: &str) -> (Vec<u32>, Vec<u32>) {
    let allocator = Allocator::default();
    let program = Parser::new(&allocator, source, SourceType::mjs())
        .parse()
        .program;
    let emitter = print_mapped(&program, &LineIndex::new(source));
    let printed = Codegen::new()
        .with_options(CodegenOptions {
            source_map_path: Some("source".into()),
            ..CodegenOptions::default()
        })
        .build(&program);
    let generated = LineIndex::with_breaks(&printed.code, LineBreaks::Ecmascript);
    let sources = LineIndex::with_breaks(source, LineBreaks::Ecmascript);
    let tokens: Vec<_> = printed.map.expect("a source map").get_tokens().collect();
    let expected = tokens
        .iter()
        .filter_map(|t| generated.offset(t.get_dst_line() + 1, t.get_dst_col()))
        .zip(tokens.iter())
        .map(|(g, t)| (g, sources.offset(t.get_src_line() + 1, t.get_src_col())))
        .collect::<Vec<_>>();
    assert!(expected.iter().all(|(_, s)| s.is_some()), "{expected:?}");
    let actual = emitter
        .mappings
        .iter()
        .map(|m| (m.generated, Some(m.source_text)))
        .collect::<Vec<_>>();
    assert_eq!(actual, expected, "{:?}", printed.code);
    (
        actual.iter().map(|m| m.0).collect(),
        expected.iter().map(|m| m.0).collect(),
    )
}

#[test]
fn a_mapping_lands_where_an_index_of_both_texts_puts_it() {
    for source in [
        "let é = 'ü😀';\r\nconst t = `a\u{2028}b\r\nc`;\nf(é, t, `${é}x`);\n",
        "let a = 1;\rlet b = '\u{2029}';\u{2029}g(a, b);\n",
    ] {
        let (actual, _) = indexed(source);
        assert!(actual.len() > 5, "{actual:?}");
    }
}
