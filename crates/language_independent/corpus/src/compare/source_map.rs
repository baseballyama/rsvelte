//! Where a module's identifiers come from, as its source map says: each identifier is keyed by its
//! name and how many identifiers of that name come before it, and has the original line and
//! column of the segment that starts at it, if one does. Other layout does not count.

use std::collections::{BTreeMap, HashMap};

use oxc_allocator::Allocator;
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Kind, Parser};
use oxc_span::SourceType;
use serde::Deserialize;

use super::javascript::Unparsed;

/// How the identifiers of two mapped texts differ.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
pub(crate) struct Difference {
    /// Identifiers only the expected map gives an origin.
    pub(crate) missing: usize,
    /// Identifiers only the actual map gives an origin.
    pub(crate) extra: usize,
    /// Identifiers the two maps give different origins.
    pub(crate) moved: usize,
}

/// A text and its source map, as a compiler writes them.
#[derive(Clone, Copy)]
pub(crate) struct Mapped<'a> {
    pub(crate) javascript: &'a str,
    pub(crate) map: &'a str,
}

/// An original position: the zero-based line, and the column in UTF-16 code units.
type Origin = (u32, u32);

/// The origins each map gives and the other does not, or gives elsewhere.
pub(crate) fn difference(expected: Mapped<'_>, actual: Mapped<'_>) -> Result<Difference, Unparsed> {
    let expected = origins(expected).map_err(Unparsed::Expected)?;
    let actual = origins(actual).map_err(Unparsed::Actual)?;
    let mut d = Difference::default();
    for (key, e) in &expected {
        match (e, actual.get(key).copied().flatten()) {
            (Some(e), Some(a)) if *e != a => d.moved += 1,
            (Some(_), None) => d.missing += 1,
            (None, Some(_)) => d.extra += 1,
            _ => {}
        }
    }
    d.extra += (actual.iter())
        .filter(|(key, a)| a.is_some() && !expected.contains_key(*key))
        .count();
    Ok(d)
}

#[derive(Deserialize)]
struct SourceMap<'a> {
    #[serde(borrow)]
    mappings: std::borrow::Cow<'a, str>,
}

/// Each identifier of the text, keyed by its name and the identifiers of that name before it, with
/// the origin of the segment that starts at it.
fn origins(mapped: Mapped<'_>) -> Result<BTreeMap<(&str, u32), Option<Origin>>, String> {
    let map: SourceMap<'_> = serde_json::from_str(mapped.map).map_err(|e| e.to_string())?;
    let lines = segments(&map.mappings)?;
    let text = mapped.javascript;
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, text, SourceType::mjs())
        .with_config(TokensParserConfig)
        .parse();
    if let Some(d) = parsed.diagnostics.first() {
        return Err(d.to_string());
    }
    let mut seen: HashMap<&str, u32> = HashMap::new();
    let mut out = BTreeMap::new();
    let mut cursor = Cursor::default();
    for token in parsed.tokens.iter().filter(|t| t.kind() == Kind::Ident) {
        let (line, column) = cursor.advance(text, token.start() as usize);
        let name = &text[token.start() as usize..token.end() as usize];
        let count = seen.entry(name).or_default();
        let origin = (lines.get(line as usize)).and_then(|line| {
            let at = line.binary_search_by_key(&column, |s| s.0).ok()?;
            line[at].1
        });
        out.insert((name, *count), origin);
        *count += 1;
    }
    Ok(out)
}

/// The line and UTF-16 column of byte offsets visited in increasing order.
#[derive(Default)]
struct Cursor {
    at: usize,
    line: u32,
    column: u32,
}

impl Cursor {
    fn advance(&mut self, text: &str, to: usize) -> (u32, u32) {
        for c in text[self.at..to].chars() {
            if c == '\n' {
                self.line += 1;
                self.column = 0;
            } else {
                self.column += c.len_utf16() as u32;
            }
        }
        self.at = to;
        (self.line, self.column)
    }
}

/// One generated line's segments, sorted by generated column: the column, and the origin a segment
/// of four or five fields gives.
type Line = Vec<(u32, Option<Origin>)>;

/// The segments of a source map's `mappings`, one list per generated line.
fn segments(mappings: &str) -> Result<Vec<Line>, String> {
    let mut lines = vec![Vec::new()];
    let (mut source_line, mut source_column) = (0i64, 0i64);
    for (l, line) in mappings.split(';').enumerate() {
        if l > 0 {
            lines.push(Vec::new());
        }
        let mut column = 0i64;
        for segment in line.split(',').filter(|s| !s.is_empty()) {
            let fields = vlq(segment)?;
            column += fields[0];
            let origin = if fields.len() >= 4 {
                source_line += fields[2];
                source_column += fields[3];
                Some((as_u32(source_line)?, as_u32(source_column)?))
            } else {
                None
            };
            lines[l].push((as_u32(column)?, origin));
        }
        lines[l].sort_by_key(|s| s.0);
    }
    Ok(lines)
}

fn as_u32(n: i64) -> Result<u32, String> {
    u32::try_from(n).map_err(|e| format!("a position of {n}: {e}"))
}

/// The base64 VLQ fields of one segment.
fn vlq(segment: &str) -> Result<Vec<i64>, String> {
    let mut fields = Vec::with_capacity(5);
    let (mut value, mut shift) = (0i64, 0u32);
    for b in segment.bytes() {
        let digit = match b {
            b'A'..=b'Z' => b - b'A',
            b'a'..=b'z' => b - b'a' + 26,
            b'0'..=b'9' => b - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            _ => return Err(format!("not a base64 digit: {:?}", b as char)),
        };
        value |= i64::from(digit & 31) << shift;
        if digit & 32 == 0 {
            let magnitude = value >> 1;
            fields.push(if value & 1 == 1 {
                -magnitude
            } else {
                magnitude
            });
            (value, shift) = (0, 0);
        } else {
            shift += 5;
        }
    }
    if shift != 0 || fields.is_empty() {
        return Err(format!("a truncated segment: {segment}"));
    }
    Ok(fields)
}

#[cfg(test)]
mod tests;
