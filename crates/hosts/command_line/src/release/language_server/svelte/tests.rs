use tower_lsp_server::gen_lsp_types::{Position, Range};

use super::nest;

#[test]
fn a_nested_symbol_spans_its_element_and_holds_the_elements_in_it() {
    let text = "<div class=\"a\">\n\t<span>é</span>\n</div>\n";
    let component = rsvelte_svelte_syntax::parse::parse(text).expect("parses");
    let lines = super::super::convert::lines(text);
    let nested = nest(
        &lines,
        rsvelte_svelte_editor::symbols::symbols(&component, text),
    );
    let range =
        |a: (u32, u32), b: (u32, u32)| Range::new(Position::new(a.0, a.1), Position::new(b.0, b.1));
    let [div] = nested.as_slice() else {
        panic!("one symbol, not {nested:?}");
    };
    assert_eq!(
        (div.name.as_str(), div.range),
        ("div.a", range((0, 0), (2, 6)))
    );
    assert_eq!(div.selection_range, div.range);
    let [span] = div.children.as_deref().unwrap_or_default() else {
        panic!("one child, not {:?}", div.children);
    };
    // Columns count UTF-16 code units, as the protocol does.
    assert_eq!(
        (span.name.as_str(), span.range),
        ("span", range((1, 1), (1, 15)))
    );
    assert_eq!(span.children, None);
}
