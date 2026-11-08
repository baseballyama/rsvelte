//! Generated text that remembers where it came from.
//!
//! An output buffer that records where each piece came from, source map v3 encoding, and reverse
//! lookup (generated → original, for mapping diagnostics of a generated file back).

use crate::source::positions::{LineIndex, SourceLocation, Span};

/// `len > 0`: `len` bytes copied verbatim from `source_text`, so offsets inside map 1:1.
/// `len == 0`: a point mapping (the generated position corresponds to `source_text`).
#[derive(Clone, Copy, Debug)]
pub struct Mapping {
    pub generated: u32,
    pub source_text: u32,
    pub len: u32,
}

#[derive(Default, Debug)]
pub struct Emitter {
    pub out: String,
    pub mappings: Vec<Mapping>,
}

impl Emitter {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    #[inline]
    pub fn push(&mut self, s: &str) {
        self.out.push_str(s);
    }

    #[inline]
    pub fn push_char(&mut self, c: char) {
        self.out.push(c);
    }

    /// Marks the current output position as corresponding to source offset `source_text`.
    #[inline]
    pub fn mark(&mut self, source_text: u32) {
        self.mappings.push(Mapping {
            generated: self.out.len() as u32,
            source_text,
            len: 0,
        });
    }

    /// Copies `span` of `source` verbatim, with a 1:1 mapping.
    pub fn copy(&mut self, source: &str, span: Span) {
        self.mappings.push(Mapping {
            generated: self.out.len() as u32,
            source_text: span.start_offset,
            len: span.len(),
        });
        self.out.push_str(span.text(source));
    }

    /// Pushes text that stands for `span` (e.g. a renamed identifier), mapped to its start.
    pub fn push_for(&mut self, s: &str, source_location: SourceLocation) {
        if let Some(span) = source_location.span() {
            self.mark(span.start_offset);
        }
        self.out.push_str(s);
    }

    /// The original offset of the generated character at `position`, as a per-character source map
    /// answers it (greatest lower bound on the same generated line): inside a verbatim copy 1:1,
    /// in inserted text the last mapped character before it, and `None` when no mapping precedes
    /// it on its line. [`Emitter::source_map`] writes exactly these answers.
    #[must_use]
    pub fn lookup(&self, position: u32) -> Option<u32> {
        let i = self.mappings.partition_point(|m| m.generated <= position);
        let m = self.mappings.get(i.checked_sub(1)?)?;
        if position < m.generated + m.len {
            return Some(m.source_text + (position - m.generated));
        }
        let (at, source_text) = self.last_point(m);
        let between = self.out.as_bytes().get(at as usize..position as usize)?;
        (!between.contains(&b'\n')).then_some(source_text)
    }

    /// The generated and original offsets of the last character a mapping maps.
    fn last_point(&self, m: &Mapping) -> (u32, u32) {
        let copied = &self.out[m.generated as usize..(m.generated + m.len) as usize];
        let back = copied
            .chars()
            .next_back()
            .map_or(0, |c| c.len_utf8() as u32);
        (m.generated + m.len - back, m.source_text + m.len - back)
    }

    /// Both ends through [`Emitter::lookup`], which is how language tools map a diagnostic back
    /// through a source map. An end that falls in inserted text therefore lands on the start of the
    /// last mapped character, so a producer that wants exact ends marks the character after a copy.
    /// `None` when either end has no mapping before it on its line.
    #[must_use]
    pub fn lookup_span(&self, span: Span) -> Option<Span> {
        let start_offset = self.lookup(span.start_offset)?;
        let end_offset = self.lookup(span.end_offset)?;
        Some(Span::new(start_offset, end_offset.max(start_offset)))
    }

    /// The original range of the copied characters inside `span`, as Volar maps a diagnostic back:
    /// inserted text maps to nothing, so `__VLS_context.x` maps to `x`. An empty `span` maps where
    /// a copy contains it (its end included). `None` when no copied character is inside.
    #[must_use]
    pub fn lookup_overlap(&self, span: Span) -> Option<Span> {
        // Copies are recorded in output order, so both ends of the mappings are sorted.
        let first = self
            .mappings
            .partition_point(|m| m.generated + m.len < span.start_offset);
        let mut found: Option<Span> = None;
        for m in &self.mappings[first..] {
            if m.generated > span.end_offset {
                break;
            }
            let (start_offset, end_offset) = (
                span.start_offset.max(m.generated),
                span.end_offset.min(m.generated + m.len),
            );
            if m.len == 0
                || start_offset > end_offset
                || (start_offset == end_offset && !span.is_empty())
            {
                continue;
            }
            let mapped = Span::new(
                m.source_text + (start_offset - m.generated),
                m.source_text + (end_offset - m.generated),
            );
            if span.is_empty() {
                return Some(mapped);
            }
            found = Some(found.map_or(mapped, |f| {
                Span::new(
                    f.start_offset.min(mapped.start_offset),
                    f.end_offset.max(mapped.end_offset),
                )
            }));
        }
        found
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
                put(m.generated, m.source_text);
                continue;
            }
            let copied = &self.out[m.generated as usize..(m.generated + m.len) as usize];
            for (i, _) in copied.char_indices() {
                put(m.generated + i as u32, m.source_text + i as u32);
            }
        }
        points
    }

    /// Encodes the mappings as a source map v3 JSON document, one segment per mapped character.
    /// `source` indexes the original text; a document's is cached in its `DocumentContext`.
    #[must_use]
    pub fn source_map(&self, source: &LineIndex, source_name: &str) -> String {
        let gen_index = LineIndex::new(&self.out);
        let mut mappings = String::new();
        let (
            mut prev_gen_line,
            mut prev_gen_column,
            mut prev_source_text_line,
            mut prev_source_text_column,
        ) = (1u32, 0i64, 0i64, 0i64);
        let mut first_in_line = true;
        for (generated, source_text) in self.points() {
            let g = gen_index.line_column(generated);
            let s = source.line_column(source_text);
            while prev_gen_line < g.line {
                mappings.push(';');
                prev_gen_line += 1;
                prev_gen_column = 0;
                first_in_line = true;
            }
            if !first_in_line {
                mappings.push(',');
            }
            first_in_line = false;
            vlq(&mut mappings, i64::from(g.column) - prev_gen_column);
            vlq(&mut mappings, 0);
            vlq(
                &mut mappings,
                (i64::from(s.line) - 1) - prev_source_text_line,
            );
            vlq(&mut mappings, i64::from(s.column) - prev_source_text_column);
            prev_gen_column = i64::from(g.column);
            prev_source_text_line = i64::from(s.line) - 1;
            prev_source_text_column = i64::from(s.column);
        }
        let mut json = String::from("{\"version\":3,\"sources\":[");
        crate::output::structured_data::write_string(&mut json, source_name);
        json.push_str("],\"names\":[],\"mappings\":");
        crate::output::structured_data::write_string(&mut json, &mappings);
        json.push('}');
        json
    }
}

fn vlq(out: &mut String, value: i64) {
    const B64: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut v = (value.unsigned_abs() << 1) | u64::from(value < 0);
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

// One per copied source range of every generated file.
const _: () = assert!(size_of::<Mapping>() == 12, "`Mapping` is 12 bytes");

#[cfg(test)]
mod tests;
