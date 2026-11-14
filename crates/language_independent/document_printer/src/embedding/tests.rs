use oxc_allocator::Allocator;
use oxc_formatter_core::tag::Tag;
use oxc_formatter_core::{
    CoreFormatOptions, FormatElement, FormatState, Formatter, IndentWidth, LineMode,
};

use super::{Context, Embedding};
use crate::LayoutInstructions;

#[test]
fn a_part_that_ends_with_a_hard_line_takes_the_document_line_after_it() {
    let allocator = Allocator::default();
    let mut embedding = Embedding::new(&allocator, CoreFormatOptions::default());
    let context = Context {
        options: embedding.options(),
    };
    let mut state = FormatState::new_with_session(context, embedding.session().clone());
    let mut f = Formatter::new(&mut state);
    // A style sheet that ends with a `//` comment ends with a hard line, inside an indent.
    f.write_element(FormatElement::Tag(Tag::StartIndent));
    f.write_element(FormatElement::text("// one", IndentWidth::default()));
    f.write_element(FormatElement::Line(LineMode::Hard));
    f.write_element(FormatElement::Tag(Tag::EndIndent));
    let layout = f.into_vec();
    let mut docs = LayoutInstructions::new();
    let part = embedding.keep(&mut docs, layout);
    let open = docs.lit("<");
    let line = docs.hardline();
    let close = docs.lit(">");
    let root = docs.concat(&[open, part, line, close]);
    assert_eq!(
        embedding.print(&docs, root, 16).as_deref(),
        Ok("<// one\n>")
    );
}
