//! Generated text that remembers where it came from.
//!
//! An output buffer that records where each piece came from, source map v3 encoding, and reverse
//! lookup (generated → original, for mapping diagnostics of a generated file back).

use crate::source::positions::{LineCursor, LineIndex, Span};

/// `len > 0`: `len` bytes copied verbatim from `source_text`, so offsets inside map 1:1.
/// `len == 0`: a point mapping (the generated position corresponds to `source_text`).
#[derive(Clone, Copy, Debug)]
pub struct Mapping {
    pub generated: u32,
    pub source_text: u32,
    pub len: u32,
}

/// Generated text that maps as a whole to an original range of any length, empty included: no
/// position inside it has a counterpart of its own (native TypeScript's atom segment).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Atom {
    pub generated: Span,
    pub original: Span,
}

#[derive(Default, Debug)]
pub struct Emitter {
    pub out: String,
    pub mappings: Vec<Mapping>,
    /// In output order, beside the copies and points, so a [`Mapping`] stays small.
    pub atoms: Vec<Atom>,
    /// Generated ranges whose findings the projected language's own tool hides: a finding that
    /// starts in one, by its generated position when nothing maps there. The original text a range
    /// maps from is mapped from nowhere else, so a finding already mapped back still tells whether
    /// it started in one ([`Emitter::maps_into`]).
    pub ignored: Vec<Span>,
    /// The generated range the projected language's own tool writes with no mapping, so that it
    /// drops a finding there that maps nowhere: svelte2tsx's return, one per projection. Only such
    /// a finding reads it: a copy inside still maps its own.
    pub unmapped: Option<Span>,
}

impl Emitter {
    /// An emitter with room for `out` bytes, `mappings` mappings and `atoms` atoms.
    #[must_use]
    pub fn with_capacity(out: usize, mappings: usize, atoms: usize) -> Self {
        Self {
            out: String::with_capacity(out),
            mappings: Vec::with_capacity(mappings),
            atoms: Vec::with_capacity(atoms),
            ignored: Vec::new(),
            unmapped: None,
        }
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

    /// Pushes `text`, which maps as a whole to `original`.
    pub fn atom(&mut self, text: &str, original: Span) {
        let start = self.out.len() as u32;
        self.out.push_str(text);
        self.atom_since(start, original);
    }

    /// [`Self::atom`] when there is an `original`, else [`Self::push`].
    pub fn atom_at(&mut self, text: &str, original: Option<Span>) {
        match original {
            Some(original) => self.atom(text, original),
            None => self.push(text),
        }
    }

    /// Maps the text pushed since the output offset `start` as a whole to `original`.
    pub fn atom_since(&mut self, start: u32, original: Span) {
        self.atoms.push(Atom {
            generated: Span::new(start, self.out.len() as u32),
            original,
        });
    }

    /// The atom whose generated text holds all of `span`.
    fn atom_around(&self, span: Span) -> Option<&Atom> {
        let i = self
            .atoms
            .partition_point(|a| a.generated.start_offset <= span.start_offset);
        let atom = self.atoms.get(i.checked_sub(1)?)?;
        (span.end_offset <= atom.generated.end_offset).then_some(atom)
    }

    /// Marks the output written since `start` as [`Emitter::ignored`].
    pub fn ignore_since(&mut self, start: u32) {
        self.ignored.push(Span::new(start, self.out.len() as u32));
    }

    /// Marks the output written since `start` as [`Emitter::unmapped`].
    pub const fn unmapped_since(&mut self, start: u32) {
        self.unmapped = Some(Span::new(start, self.out.len() as u32));
    }

    /// Whether a character inside `generated` maps from the original offset `original`: a copied
    /// one, or the first of an atom.
    #[must_use]
    pub fn maps_into(&self, generated: Span, original: u32) -> bool {
        let inside = |at: u32| (generated.start_offset..generated.end_offset).contains(&at);
        let copied = self.mappings.iter().any(|m| {
            (m.source_text..m.source_text + m.len).contains(&original)
                && inside(m.generated + (original - m.source_text))
        });
        copied
            || (self.atoms.iter())
                .any(|a| a.original.start_offset == original && inside(a.generated.start_offset))
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

    /// Where the first verbatim copy of the original character at `source` is in the output.
    #[must_use]
    pub fn generated(&self, source: u32) -> Option<u32> {
        (self.mappings.iter())
            .find(|m| (m.source_text..m.source_text + m.len).contains(&source))
            .map(|m| m.generated + (source - m.source_text))
    }

    /// The original offset of the generated character at `position`, as a per-character source map
    /// answers it (greatest lower bound on the same generated line): inside a verbatim copy 1:1,
    /// in inserted text the last mapped character before it, and `None` when no mapping precedes
    /// it on its line. [`Emitter::source_map`] writes exactly these answers.
    #[must_use]
    pub(crate) fn lookup(&self, position: u32) -> Option<u32> {
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

    /// Both ends through `Emitter::lookup`, which is how language tools map a diagnostic back
    /// through a source map. An end that falls in inserted text therefore lands on the start of the
    /// last mapped character, so a producer that wants exact ends marks the character after a copy.
    /// `None` when either end has no mapping before it on its line.
    #[must_use]
    pub fn lookup_span(&self, span: Span) -> Option<Span> {
        if let Some(atom) = self.atom_around(span) {
            return Some(atom.original);
        }
        let start_offset = self.lookup(span.start_offset)?;
        let end_offset = self.lookup(span.end_offset)?;
        Some(Span::new(start_offset, end_offset.max(start_offset)))
    }

    /// The original range of the copied characters inside `span`, as Volar maps a diagnostic back:
    /// inserted text maps to nothing, so `__VLS_context.x` maps to `x`. An empty `span` maps where
    /// a copy contains it (its end included). `None` when no copied character is inside.
    #[must_use]
    pub fn lookup_overlap(&self, span: Span) -> Option<Span> {
        if let Some(atom) = self.atom_around(span) {
            return Some(atom.original);
        }
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

    /// Calls `f` with every mapped character as (generated, original, line): one point per line
    /// of a copy, one per point mapping and per atom, which maps from its start; a later mapping
    /// at the same generated offset replaces an earlier one. `line` is the copy's text from the
    /// point up to and with its `\n`, whose later characters each map one step after the one
    /// before on both sides; it is empty for the other points. Both lists are in output order, so
    /// merging them, mappings first on a tie, is the order a stable sort of the two would give.
    fn points<'s>(&'s self, mut f: impl FnMut(u32, u32, &'s str)) {
        let mut last: Option<(u32, u32, &str)> = None;
        let mut put = |generated: u32, source_text: u32, line: &'s str| {
            if let Some(point) = last.filter(|&(g, ..)| g != generated) {
                f(point.0, point.1, point.2);
            }
            last = Some((generated, source_text, line));
        };
        let mut atoms = self.atoms.iter().peekable();
        for m in &self.mappings {
            while let Some(a) = atoms.next_if(|a| a.generated.start_offset < m.generated) {
                put(a.generated.start_offset, a.original.start_offset, "");
            }
            if m.len == 0 {
                put(m.generated, m.source_text, "");
                continue;
            }
            let copied = &self.out[m.generated as usize..(m.generated + m.len) as usize];
            let mut at = 0;
            for line in copied.split_inclusive('\n') {
                put(m.generated + at, m.source_text + at, line);
                at += line.len() as u32;
            }
        }
        for a in atoms {
            put(a.generated.start_offset, a.original.start_offset, "");
        }
        if let Some((generated, source_text, line)) = last {
            f(generated, source_text, line);
        }
    }

    /// Encodes the mappings as a source map v3 JSON document, one segment per mapped character.
    /// `source` indexes `source_text` by
    /// [`LineBreaks::Newline`](crate::source::positions::LineBreaks::Newline); a document's is
    /// cached in its `DocumentContext`.
    #[must_use]
    pub fn source_map(&self, source_text: &str, source: &LineIndex, source_name: &str) -> String {
        // The points come in generated order, so the output is read once and never indexed.
        let mut generated_cursor = LineCursor::new(&self.out, None);
        let mut source_cursor = LineCursor::new(source_text, Some(source));
        let mut json = String::from("{\"version\":3,\"sources\":[");
        crate::output::structured_data::write_string(&mut json, source_name);
        // The mappings are base64 digits, commas and semicolons, which JSON writes unescaped.
        json.push_str("],\"names\":[],\"mappings\":\"");
        let (
            mut prev_gen_line,
            mut prev_gen_column,
            mut prev_source_text_line,
            mut prev_source_text_column,
        ) = (1u32, 0i64, 0i64, 0i64);
        let mut first_in_line = true;
        self.points(|generated, original, line| {
            let (g_line, g_column) = generated_cursor.line_column(generated);
            let (s_line, s_column) = source_cursor.line_column(original);
            while prev_gen_line < g_line {
                json.push(';');
                prev_gen_line += 1;
                prev_gen_column = 0;
                first_in_line = true;
            }
            if !first_in_line {
                json.push(',');
            }
            first_in_line = false;
            vlq(&mut json, i64::from(g_column) - prev_gen_column);
            vlq(&mut json, 0);
            vlq(&mut json, (i64::from(s_line) - 1) - prev_source_text_line);
            vlq(&mut json, i64::from(s_column) - prev_source_text_column);
            prev_gen_column = i64::from(g_column);
            prev_source_text_line = i64::from(s_line) - 1;
            prev_source_text_column = i64::from(s_column);
            // Each later character of the line moves both columns alike.
            let units = line_segments(&mut json, line);
            prev_gen_column += i64::from(units);
            prev_source_text_column += i64::from(units);
            // A copied line is the same text on both sides, so both cursors step over it alike.
            if let Some(last) = line.chars().next_back() {
                let units =
                    (last != '\n').then(|| units + if u32::from(last) > 0xFFFF { 2 } else { 1 });
                generated_cursor.step_over(line.len() as u32, units);
                source_cursor.step_over(line.len() as u32, units);
            }
        });
        json.push_str("\"}");
        json
    }
}

/// Writes a segment for each character of `line` after its first, one step of the UTF-16 units
/// of the character before, and returns the units: `,CAAC` for one unit and `,EAAE` for two.
fn line_segments(json: &mut String, line: &str) -> u32 {
    const ASCII: &str =
        ",CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC";
    // A line is part of the output, whose offsets are u32.
    let steps = (line.len() as u32).saturating_sub(1);
    if line.is_ascii() {
        json.reserve(steps as usize * 5);
        let mut left = steps as usize;
        while left > 0 {
            let n = left.min(ASCII.len() / 5);
            json.push_str(&ASCII[..n * 5]);
            left -= n;
        }
        return steps;
    }
    let mut units = 0;
    let mut chars = line.chars().peekable();
    while let (Some(c), Some(_)) = (chars.next(), chars.peek()) {
        if u32::from(c) > 0xFFFF {
            json.push_str(",EAAE");
            units += 2;
        } else {
            json.push_str(",CAAC");
            units += 1;
        }
    }
    units
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
