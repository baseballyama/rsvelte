use super::*;

#[test]
fn vlq_matches_the_spec_examples() {
    let mut s = String::new();
    for v in [0, 1, -1, 16, 1000] {
        vlq(&mut s, v);
        s.push(' ');
    }
    assert_eq!(s, "A C D gB w+B ");
}

#[test]
fn lookup_maps_inside_copied_chunks() {
    let source_text = "let answer = 42;";
    let mut e = Emitter::new();
    e.push("// header\n");
    e.copy(source_text, Span::new(4, 10));
    assert_eq!(e.lookup(10), Some(4));
    assert_eq!(e.lookup(13), Some(7));
}

#[test]
fn overlap_lookup_maps_only_the_copied_characters() {
    let source_text = "{{ maybe.length }}";
    let mut e = Emitter::new();
    e.push("(");
    e.copy(source_text, Span::new(2, 3));
    e.push("__VLS_ctx.");
    e.copy(source_text, Span::new(3, 16));
    e.push(");");
    let generated = |s: &str| {
        let start_offset = e.out.find(s).unwrap() as u32;
        Span::new(start_offset, start_offset + s.len() as u32)
    };
    let back = |s: &str| e.lookup_overlap(generated(s)).map(|m| m.text(source_text));
    assert_eq!(back("__VLS_ctx.maybe"), Some("maybe"));
    assert_eq!(back("length"), Some("length"));
    assert_eq!(back("__VLS_ctx"), None);
    assert_eq!(back("( __VLS_ctx.maybe.length );"), Some(" maybe.length "));
    let end = generated("length").end_offset;
    assert_eq!(
        e.lookup_overlap(Span::new(end, end)),
        Some(Span::new(15, 15))
    );
}

#[test]
fn spans_map_back_through_copies_and_quotes() {
    let source_text = "<p aria-label={x}>";
    let mut e = Emitter::new();
    e.push("f({ ");
    e.mark(3);
    e.push("\"");
    e.copy(source_text, Span::new(3, 13));
    e.push("\": ");
    e.copy(source_text, Span::new(15, 16));
    e.push(" });");
    let key = Span::new(4, 16);
    assert_eq!(
        &e.out[key.start_offset as usize..key.end_offset as usize],
        "\"aria-label\""
    );
    assert_eq!(e.lookup_span(key), Some(Span::new(3, 12)));
    assert_eq!(&e.out[18..19], "x");
    assert_eq!(e.lookup_span(Span::new(18, 19)), Some(Span::new(15, 15)));
    assert_eq!(e.lookup_span(Span::new(0, 2)), None);
    let mut marked = Emitter::new();
    marked.copy(source_text, Span::new(15, 16));
    marked.mark(16);
    marked.push(";");
    assert_eq!(marked.lookup_span(Span::new(0, 1)), Some(Span::new(15, 16)));
}

/// A source map consumer's answer (greatest lower bound on the generated line), as a byte
/// offset.
fn consume(map: &str, source: &str, out: &str, position: u32) -> Option<u32> {
    fn unvlq(s: &mut std::str::Bytes<'_>) -> Option<i64> {
        const B64: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let (mut v, mut shift) = (0i64, 0);
        loop {
            let byte = s.next()?;
            let d = i64::try_from(B64.iter().position(|&c| c == byte)?).ok()?;
            v |= (d & 31) << shift;
            shift += 5;
            if d & 32 == 0 {
                return Some(if v & 1 == 1 { -(v >> 1) } else { v >> 1 });
            }
        }
    }
    let mappings = map.split("\"mappings\":\"").nth(1)?.trim_end_matches("\"}");
    let target = LineIndex::new(out).line_column(position);
    let (mut source_text_line, mut source_text_column, mut best) = (0i64, 0i64, None);
    for (line, segs) in mappings.split(';').enumerate() {
        let mut column = 0i64;
        for seg in segs.split(',').filter(|s| !s.is_empty()) {
            let mut b = seg.bytes();
            column += unvlq(&mut b)?;
            unvlq(&mut b)?;
            source_text_line += unvlq(&mut b)?;
            source_text_column += unvlq(&mut b)?;
            if line as u32 + 1 == target.line && column <= i64::from(target.column) {
                best = Some((source_text_line, source_text_column));
            }
        }
    }
    let (l, c) = best?;
    LineIndex::new(source).offset(u32::try_from(l).ok()? + 1, u32::try_from(c).ok()?)
}

#[test]
fn source_map_answers_what_lookup_answers() {
    let source_text = "<script>\n  let é = '😀';\n  count += 1;\n</script>\n<p>{é}</p>";
    let at = |s: &str| source_text.find(s).unwrap() as u32;
    let mut e = Emitter::new();
    e.push("import * as $ from 'svelte';\n");
    e.copy(source_text, Span::new(at("let"), at("</script>")));
    e.push("\nfunction App() {\n\t");
    e.mark(at("<p>"));
    e.push("$.text(");
    e.copy(source_text, Span::new(at("{é}") + 1, at("{é}") + 3));
    e.push(");\n}\n");
    let map = e.source_map(&LineIndex::new(source_text), "App.svelte");
    let mut checked = 0;
    for (position, _) in e.out.char_indices().chain([(e.out.len(), ' ')]) {
        assert_eq!(
            consume(&map, source_text, &e.out, position as u32),
            e.lookup(position as u32),
            "at {position}"
        );
        checked += 1;
    }
    assert_eq!(checked, e.out.chars().count() + 1);
    let second = e.out.find("count").unwrap() as u32;
    assert_eq!(
        e.lookup(second),
        Some(at("count")),
        "the copy's second line is mapped"
    );
    let after = e.out.find(");").unwrap() as u32;
    assert_eq!(
        e.lookup(after),
        Some(at("é}")),
        "the last character's start, not its last byte"
    );
    assert_eq!(e.lookup(e.out.find("function").unwrap() as u32), None);
}

#[test]
fn a_span_inside_an_atom_maps_to_the_atom_s_original_range() {
    let source_text = "<p title=x>";
    let mut e = Emitter::new();
    e.push("({ ");
    e.atom("\"title\"", Span::new(3, 8));
    e.push(": ");
    e.copy(source_text, Span::new(9, 10));
    e.push(", ");
    e.atom("children", Span::new(10, 10));
    e.push(" })");
    let at = |text: &str| e.out.find(text).expect("printed") as u32;
    let quoted = Span::new(at("\"title\""), at("\"title\"") + 7);
    assert_eq!(e.lookup_span(quoted), Some(Span::new(3, 8)));
    assert_eq!(e.lookup_overlap(quoted), Some(Span::new(3, 8)));
    let children = Span::new(at("children"), at("children") + 8);
    assert_eq!(e.lookup_span(children), Some(Span::new(10, 10)));
    // A span outside every atom maps as before: through the copy.
    let value = Span::new(at("x"), at("x") + 1);
    assert_eq!(e.lookup_overlap(value), Some(Span::new(9, 10)));
}
