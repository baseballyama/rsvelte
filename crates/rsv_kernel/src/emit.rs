//! Producing text: an output buffer that records where each piece came from, source map v3
//! encoding, reverse lookup (generated → original, for mapping diagnostics of a generated file back),
//! and a minimal edit list for tasks that patch the original text instead of reprinting it.

use crate::source::{LineIndex, Loc, Span};

/// `len > 0`: `len` bytes copied verbatim from `src`, so offsets inside map 1:1.
/// `len == 0`: a point mapping (the generated position corresponds to `src`).
#[derive(Clone, Copy, Debug)]
pub struct Mapping {
    pub generated: u32,
    pub src: u32,
    pub len: u32,
}

#[derive(Default)]
pub struct Emitter {
    pub out: String,
    pub mappings: Vec<Mapping>,
}

impl Emitter {
    pub fn new() -> Emitter {
        Emitter::default()
    }

    #[inline]
    pub fn push(&mut self, s: &str) {
        self.out.push_str(s);
    }

    #[inline]
    pub fn push_char(&mut self, c: char) {
        self.out.push(c);
    }

    /// Marks the current output position as corresponding to source offset `src`.
    #[inline]
    pub fn mark(&mut self, src: u32) {
        self.mappings.push(Mapping {
            generated: self.out.len() as u32,
            src,
            len: 0,
        });
    }

    /// Copies `span` of `source` verbatim, with a 1:1 mapping.
    pub fn copy(&mut self, source: &str, span: Span) {
        self.mappings.push(Mapping {
            generated: self.out.len() as u32,
            src: span.lo,
            len: span.len(),
        });
        self.out.push_str(span.text(source));
    }

    /// Pushes text that stands for `span` (e.g. a renamed identifier), mapped to its start.
    pub fn push_for(&mut self, s: &str, loc: Loc) {
        if let Some(span) = loc.span() {
            self.mark(span.lo);
        }
        self.out.push_str(s);
    }

    /// The original offset of the generated character at `pos`, as a per-character source map
    /// answers it (greatest lower bound on the same generated line): inside a verbatim copy 1:1,
    /// in inserted text the last mapped character before it, and `None` when no mapping precedes
    /// it on its line. [`Emitter::source_map`] writes exactly these answers.
    pub fn lookup(&self, pos: u32) -> Option<u32> {
        let i = self.mappings.partition_point(|m| m.generated <= pos);
        let m = self.mappings.get(i.checked_sub(1)?)?;
        if pos < m.generated + m.len {
            return Some(m.src + (pos - m.generated));
        }
        let (at, src) = self.last_point(m);
        let between = self.out.as_bytes().get(at as usize..pos as usize)?;
        (!between.contains(&b'\n')).then_some(src)
    }

    /// The generated and original offsets of the last character a mapping maps.
    fn last_point(&self, m: &Mapping) -> (u32, u32) {
        let copied = &self.out[m.generated as usize..(m.generated + m.len) as usize];
        let back = copied
            .chars()
            .next_back()
            .map_or(0, |c| c.len_utf8() as u32);
        (m.generated + m.len - back, m.src + m.len - back)
    }

    /// Both ends through [`Emitter::lookup`], which is how language tools map a diagnostic back
    /// through a source map. An end that falls in inserted text therefore lands on the start of the
    /// last mapped character, so a producer that wants exact ends marks the character after a copy.
    /// `None` when either end has no mapping before it on its line.
    pub fn lookup_span(&self, span: Span) -> Option<Span> {
        let lo = self.lookup(span.lo)?;
        let hi = self.lookup(span.hi)?;
        Some(Span::new(lo, hi.max(lo)))
    }

    /// Every mapped character as (generated, original): one point per character of a copy, one per
    /// point mapping; a later mapping at the same generated offset replaces an earlier one.
    fn points(&self) -> Vec<(u32, u32)> {
        let mut sorted = self.mappings.clone();
        sorted.sort_by_key(|m| m.generated);
        let mut points: Vec<(u32, u32)> = Vec::with_capacity(sorted.len());
        let mut put = |g: u32, s: u32| match points.last_mut() {
            Some(last) if last.0 == g => *last = (g, s),
            _ => points.push((g, s)),
        };
        for m in &sorted {
            if m.len == 0 {
                put(m.generated, m.src);
                continue;
            }
            let copied = &self.out[m.generated as usize..(m.generated + m.len) as usize];
            for (i, _) in copied.char_indices() {
                put(m.generated + i as u32, m.src + i as u32);
            }
        }
        points
    }

    /// Encodes the mappings as a source map v3 JSON document, one segment per mapped character.
    pub fn source_map(&self, source: &str, source_name: &str) -> String {
        let src_index = LineIndex::new(source);
        let gen_index = LineIndex::new(&self.out);
        let mut mappings = String::new();
        let (mut prev_gen_line, mut prev_gen_col, mut prev_src_line, mut prev_src_col) =
            (1u32, 0i64, 0i64, 0i64);
        let mut first_in_line = true;
        for (generated, src) in self.points() {
            let g = gen_index.line_col(&self.out, generated);
            let s = src_index.line_col(source, src);
            while prev_gen_line < g.line {
                mappings.push(';');
                prev_gen_line += 1;
                prev_gen_col = 0;
                first_in_line = true;
            }
            if !first_in_line {
                mappings.push(',');
            }
            first_in_line = false;
            vlq(&mut mappings, g.column as i64 - prev_gen_col);
            vlq(&mut mappings, 0);
            vlq(&mut mappings, (s.line as i64 - 1) - prev_src_line);
            vlq(&mut mappings, s.column as i64 - prev_src_col);
            prev_gen_col = g.column as i64;
            prev_src_line = s.line as i64 - 1;
            prev_src_col = s.column as i64;
        }
        let mut json = String::from("{\"version\":3,\"sources\":[");
        crate::json::write_str(&mut json, source_name);
        json.push_str("],\"names\":[],\"mappings\":");
        crate::json::write_str(&mut json, &mappings);
        json.push('}');
        json
    }
}

fn vlq(out: &mut String, value: i64) {
    const B64: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut v = if value < 0 {
        ((-value) << 1) | 1
    } else {
        value << 1
    } as u64;
    loop {
        let mut digit = (v & 31) as u8;
        v >>= 5;
        if v > 0 {
            digit |= 32;
        }
        out.push(B64[digit as usize] as char);
        if v == 0 {
            break;
        }
    }
}

/// Insertions and deletions against an original text, applied in one pass.
#[derive(Default)]
pub struct Edits {
    items: Vec<(u32, u32, String)>,
}

impl Edits {
    pub fn insert(&mut self, at: u32, text: impl Into<String>) {
        self.items.push((at, at, text.into()));
    }

    pub fn replace(&mut self, span: Span, text: impl Into<String>) {
        self.items.push((span.lo, span.hi, text.into()));
    }

    pub fn apply(self, src: &str) -> String {
        self.apply_in(src, Span::new(0, src.len() as u32))
    }

    /// Applies the edits and returns only `range` of the result. Inserts at the same offset keep
    /// the order they were added in.
    pub fn apply_in(mut self, src: &str, range: Span) -> String {
        self.items.sort_by_key(|&(lo, hi, _)| (lo, hi));
        let extra: usize = self.items.iter().map(|i| i.2.len()).sum();
        let mut out = String::with_capacity(range.len() as usize + extra);
        let mut pos = range.lo as usize;
        for (lo, hi, text) in self.items {
            assert!(lo as usize >= pos, "overlapping edits at {lo}");
            assert!(range.lo <= lo && hi <= range.hi, "edit outside the range");
            out.push_str(&src[pos..lo as usize]);
            out.push_str(&text);
            pos = hi as usize;
        }
        out.push_str(&src[pos..range.hi as usize]);
        out
    }
}

#[cfg(test)]
mod tests {
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
        let src = "let answer = 42;";
        let mut e = Emitter::new();
        e.push("// header\n");
        e.copy(src, Span::new(4, 10));
        assert_eq!(e.lookup(10), Some(4));
        assert_eq!(e.lookup(13), Some(7));
    }

    #[test]
    fn spans_map_back_through_copies_and_quotes() {
        let src = "<p aria-label={x}>";
        let mut e = Emitter::new();
        e.push("f({ ");
        e.mark(3);
        e.push("\"");
        e.copy(src, Span::new(3, 13));
        e.push("\": ");
        e.copy(src, Span::new(15, 16));
        e.push(" });");
        let key = Span::new(4, 16);
        assert_eq!(&e.out[key.lo as usize..key.hi as usize], "\"aria-label\"");
        assert_eq!(e.lookup_span(key), Some(Span::new(3, 12)));
        assert_eq!(&e.out[18..19], "x");
        assert_eq!(e.lookup_span(Span::new(18, 19)), Some(Span::new(15, 15)));
        assert_eq!(e.lookup_span(Span::new(0, 2)), None);
        let mut marked = Emitter::new();
        marked.copy(src, Span::new(15, 16));
        marked.mark(16);
        marked.push(";");
        assert_eq!(marked.lookup_span(Span::new(0, 1)), Some(Span::new(15, 16)));
    }

    /// A source map consumer's answer (greatest lower bound on the generated line), as a byte offset.
    fn consume(map: &str, source: &str, out: &str, pos: u32) -> Option<u32> {
        fn unvlq(s: &mut std::str::Bytes) -> Option<i64> {
            const B64: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let (mut v, mut shift) = (0i64, 0);
            loop {
                let byte = s.next()?;
                let d = B64.iter().position(|&c| c == byte)? as i64;
                v |= (d & 31) << shift;
                shift += 5;
                if d & 32 == 0 {
                    return Some(if v & 1 == 1 { -(v >> 1) } else { v >> 1 });
                }
            }
        }
        let mappings = map.split("\"mappings\":\"").nth(1)?.trim_end_matches("\"}");
        let target = LineIndex::new(out).line_col(out, pos);
        let (mut src_line, mut src_col, mut best) = (0i64, 0i64, None);
        for (line, segs) in mappings.split(';').enumerate() {
            let mut col = 0i64;
            for seg in segs.split(',').filter(|s| !s.is_empty()) {
                let mut b = seg.bytes();
                col += unvlq(&mut b)?;
                unvlq(&mut b)?;
                src_line += unvlq(&mut b)?;
                src_col += unvlq(&mut b)?;
                if line as u32 + 1 == target.line && col <= target.column as i64 {
                    best = Some((src_line, src_col));
                }
            }
        }
        let (l, c) = best?;
        LineIndex::new(source).offset(source, l as u32 + 1, c as u32)
    }

    #[test]
    fn source_map_answers_what_lookup_answers() {
        let src = "<script>\n  let é = '😀';\n  count += 1;\n</script>\n<p>{é}</p>";
        let at = |s: &str| src.find(s).unwrap() as u32;
        let mut e = Emitter::new();
        e.push("import * as $ from 'svelte';\n");
        e.copy(src, Span::new(at("let"), at("</script>")));
        e.push("\nfunction App() {\n\t");
        e.mark(at("<p>"));
        e.push("$.text(");
        e.copy(src, Span::new(at("{é}") + 1, at("{é}") + 3));
        e.push(");\n}\n");
        let map = e.source_map(src, "App.svelte");
        let mut checked = 0;
        for (pos, _) in e.out.char_indices().chain([(e.out.len(), ' ')]) {
            assert_eq!(
                consume(&map, src, &e.out, pos as u32),
                e.lookup(pos as u32),
                "at {pos}"
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
    fn edits_apply_in_order() {
        let mut e = Edits::default();
        e.insert(4, ".h");
        e.replace(Span::new(0, 1), "X");
        assert_eq!(e.apply(".big {}"), "Xbig.h {}");
    }
}
