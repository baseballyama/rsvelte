use rsvelte_kernel::source::positions::Span;

use super::Normalized;

#[test]
fn every_line_ending_reads_as_a_line_feed() {
    let normalized = Normalized::new("a\r\nb\rc\nd\r\n");
    assert_eq!(normalized.text, "a\nb\nc\nd\n");
}

#[test]
fn a_span_maps_back_to_the_source() {
    // `\r\n`, a lone `\r`, and a `\r\n` right before the span.
    let source = "a\r\nb\rc\r\n<x>";
    let normalized = Normalized::new(source);
    assert_eq!(normalized.text, "a\nb\nc\n<x>");
    let span = |text: &str, part: &str| {
        let start = text.find(part).expect("in the text") as u32;
        Span::new(start, start + part.len() as u32)
    };
    for part in ["a", "b", "c", "<x>", "\nb"] {
        assert_eq!(
            normalized.original(span(&normalized.text, part)),
            span(source, &part.replace('\n', "\r\n")),
            "{part:?}"
        );
    }
    // A span from the line feed of a `\r\n` starts at its `\r`.
    assert_eq!(normalized.original(Span::new(1, 2)), Span::new(1, 3));
}
