//! A Rust implementation of MagicString, a string manipulation library that tracks
//! source positions for source map generation.
//!
//! MagicString works by maintaining a linked list of "chunks" representing segments
//! of the original string. Chunks can be modified (overwrite, remove, prepend, append)
//! while preserving position information for accurate source mapping.

use std::fmt;
use std::fmt::Write as _;

use rustc_hash::FxHashMap;
type HashMap<K, V> = FxHashMap<K, V>;

// ---------------------------------------------------------------------------
// Chunk
// ---------------------------------------------------------------------------

/// A segment of the original string that may have been edited.
#[derive(Debug, Clone)]
struct Chunk {
    /// Original start position in the source (inclusive).
    start: u32,
    /// Original end position in the source (exclusive).
    end: u32,
    /// Replacement content when the chunk has been edited. `None` means
    /// unedited — the effective content is `master_source[start..end]`
    /// and no copy is stored. The previous implementation kept two extra
    /// `String` copies (`original` + `content`) per chunk, allocating ~2×
    /// the source length up-front for every file.
    content: Option<String>,
    /// Content prepended before this chunk (via `append_left` / `prepend_right`).
    intro: String,
    /// Content appended after this chunk (via `append_right` / `prepend_left` on next).
    outro: String,
    /// Index of the next chunk in the arena (linked-list next pointer).
    next: Option<usize>,
    /// Index of the previous chunk in the arena (linked-list prev pointer).
    previous: Option<usize>,
}

impl Chunk {
    fn new(start: u32, end: u32) -> Self {
        Self {
            start,
            end,
            content: None,
            intro: String::new(),
            outro: String::new(),
            next: None,
            previous: None,
        }
    }

    #[inline]
    fn is_edited(&self) -> bool {
        self.content.is_some()
    }

    /// Split this chunk at `index` (an original-source position). Returns the new
    /// chunk that covers `[index, self.end)`. `self` is trimmed to `[self.start, index)`.
    ///
    /// Panics if `index` is not strictly inside `(self.start, self.end)`.
    fn split(&mut self, index: u32) -> Chunk {
        assert!(
            index > self.start && index < self.end,
            "split index {} out of range [{}, {})",
            index,
            self.start,
            self.end
        );

        // If the chunk was edited, the replacement text can't be meaningfully
        // split — keep it all in the first half and leave the second half as
        // an empty edited chunk. Mirrors the JS MagicString semantics.
        let (content_before, content_after) = match self.content.take() {
            Some(s) => (Some(s), Some(String::new())),
            None => (None, None),
        };

        let new_chunk = Chunk {
            start: index,
            end: self.end,
            content: content_after,
            intro: String::new(),
            outro: std::mem::take(&mut self.outro),
            next: self.next,
            previous: None, // caller sets this
        };

        self.end = index;
        self.content = content_before;

        new_chunk
    }
}

// ---------------------------------------------------------------------------
// SourceMap
// ---------------------------------------------------------------------------

/// A v3 source map.
#[allow(dead_code, reason = "preserved as the standalone MagicString API")]
#[derive(Debug, Clone)]
pub struct SourceMap {
    pub version: u8,
    pub file: Option<String>,
    pub sources: Vec<String>,
    pub sources_content: Vec<String>,
    pub names: Vec<String>,
    pub mappings: String,
}

#[allow(dead_code, reason = "preserved as the standalone MagicString API")]
impl SourceMap {
    /// Serialize to a JSON string.
    pub fn to_json(&self) -> String {
        let metadata_bytes = self
            .sources
            .iter()
            .chain(&self.sources_content)
            .chain(&self.names)
            .map(String::len)
            .fold(
                self.file.as_ref().map_or(0, String::len),
                usize::saturating_add,
            );
        let mut json = String::with_capacity(
            96usize
                .saturating_add(metadata_bytes)
                .saturating_add(self.mappings.len()),
        );

        json.push_str(r#"{"version":"#);
        let _ = write!(json, "{}", self.version);
        json.push_str(r#","file":"#);
        match &self.file {
            Some(file) => push_json_string(&mut json, file),
            None => json.push_str("null"),
        }
        json.push_str(r#","sources":"#);
        push_json_string_array(&mut json, &self.sources);
        json.push_str(r#","sourcesContent":"#);
        push_json_string_array(&mut json, &self.sources_content);
        json.push_str(r#","names":"#);
        push_json_string_array(&mut json, &self.names);
        json.push_str(r#","mappings":"#);
        push_mappings_json(&mut json, &self.mappings);
        json.push('}');
        json
    }
}

#[inline]
#[allow(dead_code, reason = "used by the standalone SourceMap API")]
fn push_json_string_array(json: &mut String, values: &[String]) {
    json.push('[');
    for (index, value) in values.iter().enumerate() {
        if index != 0 {
            json.push(',');
        }
        push_json_string(json, value);
    }
    json.push(']');
}

#[inline]
#[allow(dead_code, reason = "used by the standalone SourceMap API")]
fn push_mappings_json(json: &mut String, mappings: &str) {
    let needs_escape = mappings
        .bytes()
        .any(|byte| byte < 0x20 || matches!(byte, b'"' | b'\\'));

    if needs_escape {
        #[cfg(test)]
        MAPPINGS_ESCAPE_FALLBACKS.with(|calls| calls.set(calls.get() + 1));
        push_json_string(json, mappings);
    } else {
        #[cfg(test)]
        MAPPINGS_DIRECT_WRITES.with(|calls| calls.set(calls.get() + 1));
        json.push('"');
        json.push_str(mappings);
        json.push('"');
    }
}

fn push_source_map_json_prefix(
    json: &mut String,
    file: Option<&str>,
    source: &str,
    source_content: Option<&str>,
) {
    json.push_str(r#"{"version":3,"file":"#);
    match file {
        Some(file) => push_json_string(json, file),
        None => json.push_str("null"),
    }
    json.push_str(r#","sources":["#);
    push_json_string(json, source);
    json.push_str(r#"],"sourcesContent":"#);
    match source_content {
        Some(content) => {
            json.push('[');
            push_json_string(json, content);
            json.push(']');
        }
        None => json.push_str("[]"),
    }
    json.push_str(r#","names":[],"mappings":""#);
}

#[cfg(test)]
std::thread_local! {
    static JSON_STRING_WRITES: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
    static JSON_STRING_INPUT_BYTES: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
    static MAPPINGS_DIRECT_WRITES: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
    static MAPPINGS_ESCAPE_FALLBACKS: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
    static BUNDLE_SOURCE_MAP_CAPACITY_GREW: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
}

/// Append a string value with JSON escaping.
fn push_json_string(json: &mut String, value: &str) {
    #[cfg(test)]
    {
        JSON_STRING_WRITES.with(|writes| writes.set(writes.get() + 1));
        JSON_STRING_INPUT_BYTES.with(|bytes| bytes.set(bytes.get() + value.len()));
    }

    json.push('"');
    for ch in value.chars() {
        match ch {
            '"' => json.push_str("\\\""),
            '\\' => json.push_str("\\\\"),
            '\n' => json.push_str("\\n"),
            '\r' => json.push_str("\\r"),
            '\t' => json.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(json, "\\u{:04x}", c as u32);
            }
            c => json.push(c),
        }
    }
    json.push('"');
}

// ---------------------------------------------------------------------------
// Source-map generation options
// ---------------------------------------------------------------------------

/// Options passed to [`MagicString::generate_map`].
#[derive(Debug, Clone, Default)]
pub struct GenerateMapOptions {
    /// The `file` field in the generated source map.
    pub file: Option<String>,
    /// The source filename that appears in `sources`.
    pub source: Option<String>,
    /// Whether to include `sourcesContent`.
    pub include_content: bool,
}

/// Code and both mapping directions produced by one chunk traversal.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GeneratedBundle {
    pub code: String,
    pub source_map: String,
    pub forward_segments: Vec<(u32, u32, u32)>,
}

// ---------------------------------------------------------------------------
// VLQ encoding
// ---------------------------------------------------------------------------

const VLQ_BASE_SHIFT: u32 = 5;
const VLQ_BASE: u32 = 1 << VLQ_BASE_SHIFT; // 32
const VLQ_BASE_MASK: u32 = VLQ_BASE - 1; // 31
const VLQ_CONTINUATION_BIT: u32 = VLQ_BASE; // 32

const BASE64_CHARS: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const ASCII_HIRES_SEGMENT: &str = ",AAAC";
const ASCII_HIRES_BLOCK_SEGMENTS: usize = 16;
const MAX_HIRES_SEGMENT_BYTES: usize = 24;
const ASCII_HIRES_BLOCK: &str = concat!(
    ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC",
    ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC", ",AAAC",
);

#[cfg(test)]
std::thread_local! {
    static VLQ_ENCODE_CALLS: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
}

#[inline]
fn vlq_encode(encoded: &mut String, value: i64) {
    #[cfg(test)]
    VLQ_ENCODE_CALLS.with(|calls| calls.set(calls.get() + 1));

    let mut vlq = if value < 0 {
        ((-value) as u32) << 1 | 1
    } else {
        (value as u32) << 1
    };

    loop {
        let mut digit = vlq & VLQ_BASE_MASK;
        vlq >>= VLQ_BASE_SHIFT;
        if vlq > 0 {
            digit |= VLQ_CONTINUATION_BIT;
        }
        encoded.push(BASE64_CHARS[digit as usize] as char);
        if vlq == 0 {
            break;
        }
    }
}

#[inline]
fn push_ascii_hires_segments(mappings: &mut String, count: usize) {
    mappings.reserve(count * ASCII_HIRES_SEGMENT.len());

    let mut remaining = count;
    while remaining >= ASCII_HIRES_BLOCK_SEGMENTS {
        mappings.push_str(ASCII_HIRES_BLOCK);
        remaining -= ASCII_HIRES_BLOCK_SEGMENTS;
    }
    mappings.push_str(&ASCII_HIRES_BLOCK[..remaining * ASCII_HIRES_SEGMENT.len()]);
}

#[derive(Default)]
struct OutputEstimate {
    mapping_bytes: usize,
    forward_segments: usize,
}

impl OutputEstimate {
    #[inline]
    fn add_mapping_bytes(&mut self, bytes: usize) {
        self.mapping_bytes = self.mapping_bytes.saturating_add(bytes);
    }

    #[inline]
    fn add_unmapped(&mut self, content: &str) {
        self.add_mapping_bytes(memchr::memchr_iter(b'\n', content.as_bytes()).count());
    }

    fn add_chunk_body(&mut self, chunk: &Chunk, body: &str) {
        if body.is_empty() {
            return;
        }

        // Four u32-domain VLQ fields plus a possible comma fit in 24 bytes.
        self.add_mapping_bytes(MAX_HIRES_SEGMENT_BYTES);
        if chunk.is_edited() {
            self.add_unmapped(body);
            return;
        }

        if body.is_ascii() {
            let newlines = memchr::memchr_iter(b'\n', body.as_bytes()).count();
            let ascii_bytes = body.len() - newlines;
            self.add_mapping_bytes(
                ascii_bytes
                    .saturating_mul(ASCII_HIRES_SEGMENT.len())
                    .saturating_add(newlines.saturating_mul(1 + MAX_HIRES_SEGMENT_BYTES)),
            );
            return;
        }

        for &byte in body.as_bytes() {
            if byte == b'\n' {
                self.add_mapping_bytes(1 + MAX_HIRES_SEGMENT_BYTES);
            } else if byte.is_ascii() {
                self.add_mapping_bytes(ASCII_HIRES_SEGMENT.len());
            } else if byte & 0xc0 != 0x80 {
                self.add_mapping_bytes(MAX_HIRES_SEGMENT_BYTES);
            }
        }
    }
}

struct MappingState<'a> {
    mappings: &'a mut String,
    original_line_starts: Vec<usize>,
    generated_column: i64,
    original_line: i64,
    original_column: i64,
    first_segment_on_line: bool,
}

impl<'a> MappingState<'a> {
    fn new(mappings: &'a mut String, original: &str) -> Self {
        Self {
            mappings,
            original_line_starts: line_starts(original),
            generated_column: 0,
            original_line: 0,
            original_column: 0,
            first_segment_on_line: true,
        }
    }

    #[inline]
    fn original_location(&self, original: &str, offset: u32) -> (i64, i64) {
        let offset = offset as usize;
        let line = match self.original_line_starts.binary_search(&offset) {
            Ok(index) => index,
            Err(index) => index - 1,
        };
        let line_start = self.original_line_starts[line];
        let column = original[line_start..offset]
            .chars()
            .map(char::len_utf16)
            .sum::<usize>();
        (line as i64, column as i64)
    }

    #[inline]
    fn advance_line(&mut self) {
        self.mappings.push(';');
        self.generated_column = 0;
        self.first_segment_on_line = true;
    }

    fn advance_unmapped(&mut self, content: &str) {
        if content.is_empty() {
            return;
        }
        for (index, part) in content.split('\n').enumerate() {
            if index != 0 {
                self.advance_line();
            }
            self.generated_column += count_utf16(part) as i64;
        }
    }

    #[inline]
    fn emit_segment(&mut self, generated_column: i64, original_line: i64, original_column: i64) {
        if !self.first_segment_on_line {
            self.mappings.push(',');
        }
        self.first_segment_on_line = false;

        vlq_encode(self.mappings, generated_column - self.generated_column);
        self.generated_column = generated_column;
        vlq_encode(self.mappings, 0);
        vlq_encode(self.mappings, original_line - self.original_line);
        self.original_line = original_line;
        vlq_encode(self.mappings, original_column - self.original_column);
        self.original_column = original_column;
    }

    fn advance_chunk_body(&mut self, original: &str, chunk: &Chunk, body: &str) {
        if body.is_empty() {
            return;
        }

        let (source_line, source_column) = self.original_location(original, chunk.start);
        self.emit_segment(self.generated_column, source_line, source_column);

        if chunk.is_edited() {
            for ch in body.chars() {
                if ch == '\n' {
                    self.advance_line();
                } else {
                    self.generated_column += ch.len_utf16() as i64;
                }
            }
            return;
        }

        let mut current_source_line = source_line;
        let mut current_source_column = source_column;
        let bytes = body.as_bytes();
        let mut byte_index = 0;
        while byte_index < bytes.len() {
            if bytes[byte_index] == b'\n' {
                self.advance_line();
                current_source_line += 1;
                current_source_column = 0;
                self.emit_segment(
                    self.generated_column,
                    current_source_line,
                    current_source_column,
                );
                byte_index += 1;
            } else if bytes[byte_index].is_ascii() {
                let run_start = byte_index;
                while byte_index < bytes.len()
                    && bytes[byte_index].is_ascii()
                    && bytes[byte_index] != b'\n'
                {
                    byte_index += 1;
                }
                let run_len = byte_index - run_start;
                push_ascii_hires_segments(self.mappings, run_len);
                self.generated_column += run_len as i64;
                current_source_column += run_len as i64;
                self.original_column = current_source_column;
            } else {
                let ch = body[byte_index..]
                    .chars()
                    .next()
                    .expect("non-ASCII byte starts a character");
                let width = ch.len_utf16() as i64;
                self.generated_column += width;
                current_source_column += width;
                self.emit_segment(
                    self.generated_column,
                    current_source_line,
                    current_source_column,
                );
                byte_index += ch.len_utf8();
            }
        }
    }
}

// ---------------------------------------------------------------------------
// MagicString
// ---------------------------------------------------------------------------

/// A string manipulation class that preserves source positions for source-map
/// generation.
pub struct MagicString {
    /// The original source string.
    original: String,
    /// Arena of chunks (linked list stored in a Vec).
    chunks: Vec<Chunk>,
    /// Index of the first chunk in the linked list.
    first_chunk: usize,
    /// Index of the last chunk in the linked list.
    last_chunk: usize,
    /// Map from original-source position → chunk index that *starts* at that position.
    /// Populated lazily via `split_at`. A `BTreeMap` (not a hash map) so
    /// `split_at` can locate the chunk containing an arbitrary position with an
    /// O(log n) `range(..=index).next_back()` lookup instead of an O(n) walk
    /// from the head of the chunk list — the walk made repeated splits on a
    /// large edited file O(n²) (the dominant svelte2tsx hotspot). Every chunk's
    /// start is kept here and entries are never removed, so the greatest start
    /// `<= index` is always the chunk that contains `index`.
    by_start: std::collections::BTreeMap<u32, usize>,
    /// Map from original-source position → chunk index that *ends* at that position.
    by_end: HashMap<u32, usize>,
    /// Content prepended before everything.
    intro: String,
    /// Content appended after everything.
    outro: String,
}

impl MagicString {
    // -----------------------------------------------------------------
    // Construction
    // -----------------------------------------------------------------

    /// Create a new `MagicString` from the given source.
    pub fn new(source: &str) -> Self {
        let chunk = Chunk::new(0, source.len() as u32);
        let mut by_start: std::collections::BTreeMap<u32, usize> =
            std::collections::BTreeMap::new();
        let mut by_end: HashMap<u32, usize> = HashMap::default();
        by_start.insert(0, 0);
        by_end.insert(source.len() as u32, 0);

        Self {
            original: source.to_string(),
            chunks: vec![chunk],
            first_chunk: 0,
            last_chunk: 0,
            by_start,
            by_end,
            intro: String::new(),
            outro: String::new(),
        }
    }

    /// Return the effective content of a chunk — either the replacement
    /// text (for edited chunks) or the corresponding slice of the original
    /// source (for unedited chunks).
    #[inline]
    fn chunk_content(&self, ci: usize) -> &str {
        let chunk = &self.chunks[ci];
        match &chunk.content {
            Some(s) => s.as_str(),
            None => &self.original[chunk.start as usize..chunk.end as usize],
        }
    }

    // -----------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------

    /// Ensure there is a chunk boundary at the given original position.
    /// Returns the index of the chunk that *starts* at `index`.
    ///
    /// When `index` equals the source length, there is no chunk starting there.
    /// In that case we return `usize::MAX` as a sentinel — callers that need
    /// a real start-chunk (like `overwrite`) should not use this value, but
    /// callers that only need the split side-effect (ensuring `by_end` has an
    /// entry) are fine.
    ///
    /// If `index` falls outside `[0, original.len()]` we treat it as the
    /// "nothing to split" sentinel (`usize::MAX`) instead of panicking. This
    /// keeps a misbehaving upstream (e.g. an AST with stale positions) from
    /// crashing the entire compiler in release builds. Debug builds print a
    /// diagnostic so the upstream bug is still surfaced during development.
    fn split_at(&mut self, index: u32) -> usize {
        if let Some(&chunk_idx) = self.by_start.get(&index) {
            return chunk_idx;
        }

        // If index is at the very end of the source, there is nothing to split.
        // The last chunk already ends at this position.
        if index as usize >= self.original.len() {
            #[cfg(debug_assertions)]
            if index as usize > self.original.len() {
                eprintln!(
                    "split_at({}): position out of range [0, {})",
                    index,
                    self.original.len()
                );
            }
            return usize::MAX;
        }

        // Find the chunk containing `index` via the sorted start index in
        // O(log n). `by_start` holds every chunk's start and chunks partition
        // the source contiguously, so the greatest start `<= index` is the
        // chunk that contains `index`. (The `by_start.get(&index)` fast-path
        // above already handled the case where `index` is itself a boundary,
        // so here `start < index`.) This replaces an O(n) walk from the head
        // that made repeated splits O(n²).
        let cur = match self.by_start.range(..=index).next_back() {
            Some((_, &chunk_idx)) => chunk_idx,
            None => {
                #[cfg(debug_assertions)]
                eprintln!(
                    "split_at({}): no chunk start <= index (source length {})",
                    index,
                    self.original.len()
                );
                return usize::MAX;
            }
        };
        // Defensive: confirm `index` really falls strictly inside `cur`. With a
        // well-formed chunk list this always holds; if not, fall back to the
        // sentinel rather than producing a corrupt split.
        {
            let chunk = &self.chunks[cur];
            if !(index > chunk.start && index < chunk.end) {
                #[cfg(debug_assertions)]
                eprintln!(
                    "split_at({}): located chunk [{}, {}) does not strictly contain index",
                    index, chunk.start, chunk.end
                );
                return usize::MAX;
            }
        }

        // `cur` is the chunk that contains `index` strictly inside it.
        let old_next = self.chunks[cur].next;
        let mut new_chunk = self.chunks[cur].split(index);
        new_chunk.previous = Some(cur);
        new_chunk.next = old_next;

        let new_idx = self.chunks.len();
        self.chunks.push(new_chunk);

        self.chunks[cur].next = Some(new_idx);
        if let Some(old_next_idx) = old_next {
            self.chunks[old_next_idx].previous = Some(new_idx);
        }
        if self.last_chunk == cur {
            self.last_chunk = new_idx;
        }

        // Update indices.
        self.by_start.insert(index, new_idx);
        self.by_end.insert(index, cur);
        // The end of the new chunk is the old end – already in by_end pointing to cur,
        // but it should now point to new_idx.
        let new_end = self.chunks[new_idx].end;
        self.by_end.insert(new_end, new_idx);

        new_idx
    }

    /// Internal: link chunk `a` → `b` in the linked list.
    fn link(&mut self, a: Option<usize>, b: Option<usize>) {
        if let Some(ai) = a {
            self.chunks[ai].next = b;
        }
        if let Some(bi) = b {
            self.chunks[bi].previous = a;
        }
    }

    // -----------------------------------------------------------------
    // Public API – mutations
    // -----------------------------------------------------------------

    /// Replace the content in `[start, end)` with `content`.
    ///
    /// If `start >= end`, this is a no-op (returns self without modification).
    pub fn overwrite(&mut self, start: u32, end: u32, content: &str) -> &mut Self {
        if start >= end {
            return self;
        }
        assert!(
            (end as usize) <= self.original.len(),
            "overwrite: end ({}) > source length ({})",
            end,
            self.original.len()
        );

        // Ensure chunk boundaries at start and end.
        self.split_at(start);
        self.split_at(end);

        let first = *self
            .by_start
            .get(&start)
            .expect("overwrite: no chunk at start");

        // Set the content of the first chunk and blank out subsequent ones.
        self.chunks[first].content = Some(content.to_string());
        // Preserve intro of first chunk, but clear its outro – the last chunk's outro is kept.
        self.chunks[first].outro.clear();

        // Walk by ORIGINAL position (via `by_start` lookups on the previous
        // chunk's `end`), not via `chunks[ci].next`. After a `move_range`
        // call the linked list can interleave chunks whose original ranges
        // lie outside `[start, end)`, but `by_start` still maps the
        // contiguous original layout — so position-based traversal only
        // touches chunks whose source range is genuinely inside this
        // overwrite.
        let mut cur_end = self.chunks[first].end;
        while cur_end < end {
            let ci = match self.by_start.get(&cur_end) {
                Some(&i) => i,
                None => break,
            };
            self.chunks[ci].content = Some(String::new());
            self.chunks[ci].intro.clear();
            if self.chunks[ci].end == end {
                // Keep the outro of the last chunk in the range.
                break;
            }
            self.chunks[ci].outro.clear();
            cur_end = self.chunks[ci].end;
        }

        self
    }

    /// Remove the content in `[start, end)`.
    pub fn remove(&mut self, start: u32, end: u32) -> &mut Self {
        assert!(start < end, "remove: start must be < end");
        assert!(
            (end as usize) <= self.original.len(),
            "remove: end ({}) > source length ({})",
            end,
            self.original.len()
        );

        self.split_at(start);
        self.split_at(end);

        // Walk by original position (see comment in `overwrite`) so chunks
        // relocated via `move_range` aren't incorrectly cleared.
        let mut cur_start = start;
        while cur_start < end {
            let ci = match self.by_start.get(&cur_start) {
                Some(&i) => i,
                None => break,
            };
            self.chunks[ci].content = Some(String::new());
            self.chunks[ci].intro.clear();
            self.chunks[ci].outro.clear();
            cur_start = self.chunks[ci].end;
        }

        self
    }

    /// Prepend content at the very beginning of the output.
    pub fn prepend_str(&mut self, content: &str) -> &mut Self {
        self.intro.insert_str(0, content);
        self
    }

    /// Append content at the very end of the output.
    pub fn append_str(&mut self, content: &str) -> &mut Self {
        self.outro.push_str(content);
        self
    }

    /// Insert `content` before the character at `index`, after any previously
    /// prepended content at this position. In the JS API this is called
    /// `appendLeft`.
    pub fn append_left(&mut self, index: u32, content: &str) -> &mut Self {
        assert!(
            (index as usize) <= self.original.len(),
            "append_left: index out of range"
        );

        if index == 0 {
            // Append to the global intro.
            self.intro.push_str(content);
            return self;
        }

        self.split_at(index);
        let chunk_idx = *self
            .by_end
            .get(&index)
            .expect("append_left: no chunk ending at index");
        self.chunks[chunk_idx].outro.push_str(content);
        self
    }

    /// Insert `content` before the character at `index`, before any previously
    /// prepended content at this position. In the JS API this is called
    /// `prependRight` (inserts go into the *intro* of the chunk starting at
    /// `index`, but at the front).
    ///
    /// Note: despite the name, this inserts *before* the character at `index`.
    pub fn prepend_right(&mut self, index: u32, content: &str) -> &mut Self {
        assert!(
            (index as usize) <= self.original.len(),
            "prepend_right: index out of range"
        );

        if index == self.original.len() as u32 {
            self.outro.insert_str(0, content);
            return self;
        }

        self.split_at(index);
        let chunk_idx = *self
            .by_start
            .get(&index)
            .expect("prepend_right: no chunk at index");
        self.chunks[chunk_idx].intro.insert_str(0, content);
        self
    }

    /// Insert `content` before the character at `index` (same position as
    /// `append_left` but the content goes *before* any previously appended
    /// content at this position). In JS API this is `prependLeft`.
    pub fn prepend_left(&mut self, index: u32, content: &str) -> &mut Self {
        assert!(
            (index as usize) <= self.original.len(),
            "prepend_left: index out of range"
        );

        if index == 0 {
            self.intro.insert_str(0, content);
            return self;
        }

        self.split_at(index);
        let chunk_idx = *self
            .by_end
            .get(&index)
            .expect("prepend_left: no chunk ending at index");
        self.chunks[chunk_idx].outro.insert_str(0, content);
        self
    }

    /// Insert `content` after the character at `index`, after any previously
    /// appended content at this position. In JS API this is `appendRight`.
    pub fn append_right(&mut self, index: u32, content: &str) -> &mut Self {
        assert!(
            (index as usize) <= self.original.len(),
            "append_right: index out of range"
        );

        if index == self.original.len() as u32 {
            self.outro.push_str(content);
            return self;
        }

        self.split_at(index);
        let chunk_idx = *self
            .by_start
            .get(&index)
            .expect("append_right: no chunk at index");
        self.chunks[chunk_idx].intro.push_str(content);
        self
    }

    /// Move the content in `[start, end)` to the position before `index`.
    pub fn move_range(&mut self, start: u32, end: u32, index: u32) -> &mut Self {
        assert!(start < end, "move_range: start must be < end");
        assert!(
            !(index >= start && index < end),
            "move_range: cannot move a range into itself"
        );

        self.split_at(start);
        self.split_at(end);
        if index != 0 && index != self.original.len() as u32 {
            self.split_at(index);
        }

        let first_in_range = *self
            .by_start
            .get(&start)
            .expect("move_range: no chunk at start");
        let last_in_range = *self.by_end.get(&end).expect("move_range: no chunk at end");

        let before_range = self.chunks[first_in_range].previous;
        let after_range = self.chunks[last_in_range].next;

        // Detach the range from its current position.
        self.link(before_range, after_range);

        // Update first/last chunk pointers if needed.
        if self.first_chunk == first_in_range
            && let Some(ar) = after_range
        {
            self.first_chunk = ar;
        }
        if self.last_chunk == last_in_range
            && let Some(br) = before_range
        {
            self.last_chunk = br;
        }

        // Insert at the target position.
        if index == 0 {
            // Insert before the current first chunk.
            let old_first = self.first_chunk;
            self.link(Some(last_in_range), Some(old_first));
            self.chunks[first_in_range].previous = None;
            self.first_chunk = first_in_range;
        } else if index == self.original.len() as u32 {
            // Insert after the current last chunk.
            let old_last = self.last_chunk;
            self.link(Some(old_last), Some(first_in_range));
            self.chunks[last_in_range].next = None;
            self.last_chunk = last_in_range;
        } else {
            // Insert before the chunk that starts at `index`.
            let target = *self
                .by_start
                .get(&index)
                .expect("move_range: no chunk at target index");
            let before_target = self.chunks[target].previous;
            self.link(before_target, Some(first_in_range));
            self.link(Some(last_in_range), Some(target));
            if self.first_chunk == target && before_range.is_none() {
                self.first_chunk = first_in_range;
            }
        }

        self
    }

    // -----------------------------------------------------------------
    // Public API – output
    // -----------------------------------------------------------------

    /// Generate the modified string.
    #[allow(clippy::inherent_to_string)]
    pub fn to_string(&self) -> String {
        let mut result = String::with_capacity(self.original.len());
        self.traverse_outputs(Some(&mut result), None, None);
        result
    }

    /// Forward-mapping segments for **unedited** (verbatim-copied) chunks, in
    /// generated order: each tuple is `(original_start, original_end,
    /// generated_start)`. An original byte offset `o` within
    /// `[original_start, original_end)` maps forward to the generated byte
    /// offset `generated_start + (o - original_start)`.
    ///
    /// Edited / synthesized chunks (those whose content was overwritten or
    /// inserted) are omitted — they have no byte-exact 1:1 original mapping.
    /// This is the inverse direction of the source map (`generate_map` is
    /// generated→original); it is what a type-aware consumer needs to place a
    /// `get_type_at_position` probe byte-exactly on a verbatim-copied
    /// expression (e.g. a `<script>` identifier carried through to the TSX).
    ///
    /// Note: this reflects the chunk graph, i.e. the output of
    /// [`MagicString::to_string`] *before* any text-level post-pass. Callers
    /// that apply such a post-pass (e.g. import-specifier rewriting) must
    /// account for drift after the rewrite point themselves.
    #[allow(dead_code, reason = "preserved as the standalone MagicString API")]
    pub fn forward_segments(&self) -> Vec<(u32, u32, u32)> {
        let mut segments = Vec::with_capacity(self.chunks.len());
        self.traverse_outputs(None, None, Some(&mut segments));
        segments
    }

    /// Generate a v3 source map.
    #[allow(dead_code, reason = "preserved as the standalone MagicString API")]
    pub fn generate_map(&self, options: GenerateMapOptions) -> SourceMap {
        let source_name = options.source.unwrap_or_default();
        let mappings = self.generate_mappings();

        SourceMap {
            version: 3,
            file: options.file,
            sources: vec![source_name.clone()],
            sources_content: if options.include_content {
                vec![self.original.clone()]
            } else {
                vec![]
            },
            names: vec![],
            mappings,
        }
    }

    /// Generate code and both mapping directions in one chunk traversal.
    pub fn generate_bundle(&self, options: GenerateMapOptions) -> GeneratedBundle {
        let GenerateMapOptions {
            file,
            source,
            include_content,
        } = options;
        let source = source.unwrap_or_default();
        let estimate = self.estimate_outputs();
        let code_capacity = self
            .original
            .len()
            .saturating_add(self.intro.len())
            .saturating_add(self.outro.len());
        let metadata_bytes = file
            .as_ref()
            .map_or(0, String::len)
            .saturating_add(source.len())
            .saturating_add(usize::from(include_content).saturating_mul(self.original.len()));
        let mut source_map = String::with_capacity(
            96usize
                .saturating_add(metadata_bytes)
                .saturating_add(estimate.mapping_bytes),
        );
        #[cfg(test)]
        let initial_source_map_capacity = source_map.capacity();
        push_source_map_json_prefix(
            &mut source_map,
            file.as_deref(),
            &source,
            include_content.then_some(self.original.as_str()),
        );

        let mut code = String::with_capacity(code_capacity);
        let mut forward_segments = Vec::with_capacity(estimate.forward_segments);
        self.traverse_outputs(
            Some(&mut code),
            Some(&mut source_map),
            Some(&mut forward_segments),
        );
        source_map.push_str("\"}");
        #[cfg(test)]
        BUNDLE_SOURCE_MAP_CAPACITY_GREW.with(|grew| {
            grew.set(source_map.capacity() != initial_source_map_capacity);
        });

        GeneratedBundle {
            code,
            source_map,
            forward_segments,
        }
    }

    fn estimate_outputs(&self) -> OutputEstimate {
        let mut estimate = OutputEstimate::default();
        estimate.add_unmapped(&self.intro);

        let mut cur = Some(self.first_chunk);
        while let Some(chunk_index) = cur {
            let chunk = &self.chunks[chunk_index];
            let body = self.chunk_content(chunk_index);
            estimate.add_unmapped(&chunk.intro);
            estimate.add_chunk_body(chunk, body);
            estimate.add_unmapped(&chunk.outro);
            if !chunk.is_edited() && chunk.end > chunk.start {
                estimate.forward_segments = estimate.forward_segments.saturating_add(1);
            }
            cur = chunk.next;
        }

        estimate.add_unmapped(&self.outro);
        estimate
    }

    // -----------------------------------------------------------------
    // Source-map internals
    // -----------------------------------------------------------------

    /// Build the VLQ-encoded `mappings` string.
    #[allow(dead_code, reason = "used by the standalone MagicString API")]
    fn generate_mappings(&self) -> String {
        let mut mappings = String::new();
        self.traverse_outputs(None, Some(&mut mappings), None);
        mappings
    }

    fn traverse_outputs(
        &self,
        mut code: Option<&mut String>,
        mappings: Option<&mut String>,
        mut forward_segments: Option<&mut Vec<(u32, u32, u32)>>,
    ) {
        let mut mapping = mappings.map(|mappings| MappingState::new(mappings, &self.original));
        if let Some(code) = &mut code {
            code.push_str(&self.intro);
        }
        if let Some(mapping) = &mut mapping {
            mapping.advance_unmapped(&self.intro);
        }

        let mut generated_bytes = self.intro.len() as u32;
        let mut cur = Some(self.first_chunk);
        while let Some(ci) = cur {
            let chunk = &self.chunks[ci];
            let body = self.chunk_content(ci);

            if let Some(code) = &mut code {
                code.push_str(&chunk.intro);
                code.push_str(body);
                code.push_str(&chunk.outro);
            }
            if let Some(mapping) = &mut mapping {
                mapping.advance_unmapped(&chunk.intro);
                mapping.advance_chunk_body(&self.original, chunk, body);
                mapping.advance_unmapped(&chunk.outro);
            }
            if let Some(segments) = &mut forward_segments {
                generated_bytes += chunk.intro.len() as u32;
                if !chunk.is_edited() && chunk.end > chunk.start {
                    segments.push((chunk.start, chunk.end, generated_bytes));
                }
                generated_bytes += body.len() as u32;
                generated_bytes += chunk.outro.len() as u32;
            }
            cur = chunk.next;
        }

        if let Some(code) = &mut code {
            code.push_str(&self.outro);
        }
        if let Some(mapping) = &mut mapping {
            mapping.advance_unmapped(&self.outro);
        }
    }
}

impl fmt::Display for MagicString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_string())
    }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/// Compute byte offsets of line starts (the offset of the first character on each line).
fn line_starts(s: &str) -> Vec<usize> {
    let mut starts = vec![0usize];
    for (i, ch) in s.char_indices() {
        if ch == '\n' {
            starts.push(i + 1);
        }
    }
    starts
}

/// Count the UTF-16 code units in a string.
///
/// Source-map generated columns are measured in UTF-16 code units (spec v3 /
/// LSP), so an astral char (emoji, 4-byte UTF-8) counts as 2 and a BMP char as
/// 1. For ASCII this equals both the char count and the byte length.
fn count_utf16(s: &str) -> usize {
    s.chars().map(|c| c.len_utf16()).sum()
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn assert_bundle_matches_individual_outputs(value: &MagicString) {
        let options = [
            GenerateMapOptions::default(),
            GenerateMapOptions {
                file: Some("out\"\\雪\n.tsx".to_string()),
                source: Some("src\"\\é.svelte".to_string()),
                include_content: false,
            },
            GenerateMapOptions {
                file: Some("out\"\\雪\n.tsx".to_string()),
                source: Some("src\"\\é.svelte".to_string()),
                include_content: true,
            },
        ];
        let expected_code = value.to_string();
        let expected_forward_segments = value.forward_segments();
        assert_eq!(
            value.estimate_outputs().forward_segments,
            expected_forward_segments.len()
        );
        for options in options {
            let expected_source_map = value.generate_map(options.clone()).to_json();

            let actual = value.generate_bundle(options);
            assert_eq!(actual.code, expected_code);
            assert_eq!(actual.source_map, expected_source_map);
            assert_eq!(actual.forward_segments, expected_forward_segments);
            assert!(!BUNDLE_SOURCE_MAP_CAPACITY_GREW.with(std::cell::Cell::get));
        }
    }

    #[test]
    fn test_basic_to_string() {
        let s = MagicString::new("hello world");
        assert_eq!(s.to_string(), "hello world");
    }

    #[test]
    fn test_overwrite() {
        let mut s = MagicString::new("hello world");
        s.overwrite(0, 5, "goodbye");
        assert_eq!(s.to_string(), "goodbye world");
    }

    #[test]
    fn test_overwrite_middle() {
        let mut s = MagicString::new("hello world");
        s.overwrite(6, 11, "earth");
        assert_eq!(s.to_string(), "hello earth");
    }

    #[test]
    fn test_overwrite_with_empty() {
        let mut s = MagicString::new("hello world");
        s.overwrite(5, 6, "");
        assert_eq!(s.to_string(), "helloworld");
    }

    #[test]
    fn test_remove() {
        let mut s = MagicString::new("hello world");
        s.remove(5, 11);
        assert_eq!(s.to_string(), "hello");
    }

    #[test]
    fn test_remove_beginning() {
        let mut s = MagicString::new("hello world");
        s.remove(0, 6);
        assert_eq!(s.to_string(), "world");
    }

    #[test]
    fn test_prepend_str() {
        let mut s = MagicString::new("world");
        s.prepend_str("hello ");
        assert_eq!(s.to_string(), "hello world");
    }

    #[test]
    fn test_append_str() {
        let mut s = MagicString::new("hello");
        s.append_str(" world");
        assert_eq!(s.to_string(), "hello world");
    }

    #[test]
    fn test_prepend_and_append() {
        let mut s = MagicString::new("middle");
        s.prepend_str("start ");
        s.append_str(" end");
        assert_eq!(s.to_string(), "start middle end");
    }

    #[test]
    fn test_append_left() {
        let mut s = MagicString::new("hello world");
        s.append_left(5, " cruel");
        assert_eq!(s.to_string(), "hello cruel world");
    }

    #[test]
    fn test_append_right() {
        let mut s = MagicString::new("hello world");
        s.append_right(6, "big ");
        assert_eq!(s.to_string(), "hello big world");
    }

    #[test]
    fn test_prepend_right() {
        let mut s = MagicString::new("hello world");
        s.prepend_right(5, "!");
        assert_eq!(s.to_string(), "hello! world");
    }

    #[test]
    fn test_prepend_left() {
        let mut s = MagicString::new("hello world");
        s.prepend_left(5, "!");
        assert_eq!(s.to_string(), "hello! world");
    }

    #[test]
    fn test_multiple_operations() {
        let mut s = MagicString::new("abcdefghij");
        s.overwrite(2, 4, "CD"); // ab CD efghij
        s.remove(6, 8); // abCDefij
        s.append_left(2, "<<"); // ab<<CDefij
        s.append_right(4, ">>"); // ab<<CD>>efij
        assert_eq!(s.to_string(), "ab<<CD>>efij");
    }

    #[test]
    fn test_overwrite_then_to_string() {
        let mut s = MagicString::new("var answer = 42;");
        s.overwrite(4, 10, "question");
        s.overwrite(13, 15, "'???'");
        assert_eq!(s.to_string(), "var question = '???';");
    }

    #[test]
    fn generated_bundle_matches_exhaustive_overwrites() {
        let source = "a😀\nb";
        let mut boundaries = source
            .char_indices()
            .map(|(offset, _)| offset as u32)
            .collect::<Vec<_>>();
        boundaries.push(source.len() as u32);

        assert_bundle_matches_individual_outputs(&MagicString::new(""));
        assert_bundle_matches_individual_outputs(&MagicString::new(source));
        for (start_index, &start) in boundaries.iter().enumerate() {
            for &end in &boundaries[start_index + 1..] {
                for replacement in ["", "X", "Ω\n😀"] {
                    let mut value = MagicString::new(source);
                    value.overwrite(start, end, replacement);
                    assert_bundle_matches_individual_outputs(&value);
                }
            }
        }

        let mut fully_overwritten = MagicString::new(source);
        fully_overwritten.overwrite(0, source.len() as u32, "\n全😀\n");
        assert_bundle_matches_individual_outputs(&fully_overwritten);
    }

    #[test]
    fn generated_bundle_matches_moved_chunks() {
        for start in 0..5 {
            for end in start + 1..=5 {
                if start == 0 && end == 5 {
                    continue;
                }
                for target in 0..=5 {
                    if target >= start && target < end {
                        continue;
                    }
                    let mut value = MagicString::new("abcde");
                    value.move_range(start, end, target);
                    assert_bundle_matches_individual_outputs(&value);
                }
            }
        }

        let source = "A😀\nBC";
        let mut value = MagicString::new(source);
        value.append_left(1, "<");
        value.prepend_right(1, ">");
        value.move_range(1, 5, source.len() as u32);
        value.overwrite(6, 7, "Ω\n");
        assert_bundle_matches_individual_outputs(&value);
    }

    #[test]
    fn generated_bundle_matches_insert_ordering_and_empty_source() {
        let mut value = MagicString::new("ab");
        value.append_left(1, "a1");
        value.append_left(1, "a2");
        value.prepend_left(1, "p1");
        value.prepend_left(1, "p2");
        value.append_right(1, "r1");
        value.append_right(1, "r2");
        value.prepend_right(1, "q1");
        value.prepend_right(1, "q2");
        value.prepend_str("I😀\n");
        value.append_str("\nO雪");
        assert_bundle_matches_individual_outputs(&value);

        let mut empty = MagicString::new("");
        empty.append_left(0, "left");
        empty.prepend_left(0, "<");
        empty.append_right(0, "right");
        empty.prepend_right(0, ">");
        empty.prepend_str("\n");
        empty.append_str("😀\n");
        assert_bundle_matches_individual_outputs(&empty);

        let mut control_chars = MagicString::new("\t\u{001f}\"\\\n😀");
        control_chars.overwrite(2, 3, "\r\n");
        assert_bundle_matches_individual_outputs(&control_chars);
    }

    #[test]
    fn edited_heavy_bundle_does_not_reserve_for_unedited_hires_mappings() {
        let source = "x".repeat(64 * 1024);
        let mut value = MagicString::new(&source);
        for start in (0..source.len()).step_by(64) {
            value.overwrite(start as u32, (start + 64) as u32, "_");
        }

        let generated = value.generate_bundle(GenerateMapOptions::default());
        assert!(
            generated.source_map.capacity() < source.len() * 2,
            "edited source map reserved {} bytes for {} source bytes",
            generated.source_map.capacity(),
            source.len()
        );
        assert!(!BUNDLE_SOURCE_MAP_CAPACITY_GREW.with(std::cell::Cell::get));
    }

    #[test]
    fn unedited_heavy_bundle_reserves_the_mapping_once() {
        let source = "x".repeat(64 * 1024);
        let generated = MagicString::new(&source).generate_bundle(GenerateMapOptions::default());

        assert!(generated.source_map.len() > source.len() * 5);
        assert!(!BUNDLE_SOURCE_MAP_CAPACITY_GREW.with(std::cell::Cell::get));
    }

    #[test]
    fn test_move_range_forward() {
        let mut s = MagicString::new("abcdefghij");
        s.move_range(0, 3, 6);
        // Original: a b c d e f g h i j
        // Move [0,3) = "abc" to before position 6 (= "g")
        // Result: "def" + "abc" + "ghij"
        assert_eq!(s.to_string(), "defabcghij");
    }

    #[test]
    fn test_move_range_backward() {
        let mut s = MagicString::new("abcdefghij");
        s.move_range(6, 9, 2);
        // Move [6,9) = "ghi" to before position 2 (= "c")
        // Result: "ab" + "ghi" + "cdef" + "j"
        assert_eq!(s.to_string(), "abghicdefj");
    }

    #[test]
    fn test_move_range_to_start() {
        let mut s = MagicString::new("abcdefghij");
        s.move_range(5, 10, 0);
        assert_eq!(s.to_string(), "fghijabcde");
    }

    #[test]
    fn test_move_range_to_end() {
        let mut s = MagicString::new("abcdefghij");
        s.move_range(0, 5, 10);
        assert_eq!(s.to_string(), "fghijabcde");
    }

    #[test]
    fn test_generate_map_basic() {
        let s = MagicString::new("hello world");
        let map = s.generate_map(GenerateMapOptions {
            file: Some("output.js".to_string()),
            source: Some("input.js".to_string()),
            include_content: true,
        });
        assert_eq!(map.version, 3);
        assert_eq!(map.file, Some("output.js".to_string()));
        assert_eq!(map.sources, vec!["input.js".to_string()]);
        assert_eq!(map.sources_content, vec!["hello world".to_string()]);
        assert!(!map.mappings.is_empty());
    }

    #[test]
    fn test_generate_map_json() {
        let s = MagicString::new("hello");
        let map = s.generate_map(GenerateMapOptions {
            file: Some("out.js".to_string()),
            source: Some("in.js".to_string()),
            include_content: false,
        });
        let json = map.to_json();
        assert!(json.contains("\"version\":3"));
        assert!(json.contains("\"file\":\"out.js\""));
        assert!(json.contains("\"sources\":[\"in.js\"]"));
    }

    #[test]
    fn source_map_json_escapes_metadata_but_not_encoded_mappings() {
        let map = SourceMap {
            version: 3,
            file: Some("out\"\\雪\n.js".to_string()),
            sources: vec!["src\"\\é.svelte".to_string(), "二.svelte".to_string()],
            sources_content: vec!["line \"one\"\\\n\t\u{001f}雪".to_string()],
            names: vec!["na\"\\mé".to_string()],
            mappings: "AAAA,CAAC;AACA+/09".to_string(),
        };

        assert_eq!(
            map.to_json(),
            r#"{"version":3,"file":"out\"\\雪\n.js","sources":["src\"\\é.svelte","二.svelte"],"sourcesContent":["line \"one\"\\\n\t\u001f雪"],"names":["na\"\\mé"],"mappings":"AAAA,CAAC;AACA+/09"}"#
        );
    }

    #[test]
    fn large_mappings_do_not_add_json_escape_work() {
        let mappings = "AAAA,AAAC;".repeat(32 * 1024);
        let file = "out\"\\雪.js".to_string();
        let source = "src\"\\é.svelte".to_string();
        let content = "line \"one\"\\\n雪".to_string();
        let name = "na\"\\mé".to_string();
        let map = SourceMap {
            version: 3,
            file: Some(file.clone()),
            sources: vec![source.clone()],
            sources_content: vec![content.clone()],
            names: vec![name.clone()],
            mappings: mappings.clone(),
        };

        JSON_STRING_WRITES.with(|writes| writes.set(0));
        JSON_STRING_INPUT_BYTES.with(|bytes| bytes.set(0));
        MAPPINGS_DIRECT_WRITES.with(|calls| calls.set(0));
        MAPPINGS_ESCAPE_FALLBACKS.with(|calls| calls.set(0));
        let json = map.to_json();

        assert_eq!(JSON_STRING_WRITES.with(std::cell::Cell::get), 4);
        assert_eq!(
            JSON_STRING_INPUT_BYTES.with(std::cell::Cell::get),
            file.len() + source.len() + content.len() + name.len()
        );
        assert_eq!(MAPPINGS_DIRECT_WRITES.with(std::cell::Cell::get), 1);
        assert_eq!(MAPPINGS_ESCAPE_FALLBACKS.with(std::cell::Cell::get), 0);
        assert_eq!(
            json,
            [
                r#"{"version":3,"file":"out\"\\雪.js","sources":["src\"\\é.svelte"],"sourcesContent":["line \"one\"\\\n雪"],"names":["na\"\\mé"],"mappings":""#,
                &mappings,
                r#""}"#,
            ]
            .concat()
        );
    }

    #[test]
    fn externally_mutated_mappings_fall_back_to_json_escaping() {
        let mut map = MagicString::new("x").generate_map(GenerateMapOptions::default());
        map.sources.clear();
        map.mappings = "AA\"\\\n\t\u{0001}雪".to_string();

        JSON_STRING_WRITES.with(|writes| writes.set(0));
        MAPPINGS_DIRECT_WRITES.with(|calls| calls.set(0));
        MAPPINGS_ESCAPE_FALLBACKS.with(|calls| calls.set(0));
        assert_eq!(
            map.to_json(),
            r#"{"version":3,"file":null,"sources":[],"sourcesContent":[],"names":[],"mappings":"AA\"\\\n\t\u0001雪"}"#
        );
        assert_eq!(JSON_STRING_WRITES.with(std::cell::Cell::get), 1);
        assert_eq!(MAPPINGS_DIRECT_WRITES.with(std::cell::Cell::get), 0);
        assert_eq!(MAPPINGS_ESCAPE_FALLBACKS.with(std::cell::Cell::get), 1);
    }

    #[test]
    fn test_generate_map_with_overwrite() {
        let mut s = MagicString::new("hello world");
        s.overwrite(0, 5, "goodbye");
        let map = s.generate_map(GenerateMapOptions {
            file: None,
            source: Some("input.js".to_string()),
            include_content: true,
        });
        // The map should have mappings that are non-empty.
        assert!(!map.mappings.is_empty());
        let json = map.to_json();
        // Verify it's valid-looking JSON.
        assert!(json.starts_with('{'));
        assert!(json.ends_with('}'));
    }

    #[test]
    fn test_vlq_encode() {
        let mut encoded = "prefix:".to_string();
        for value in [0, 1, -1, 5, 16] {
            vlq_encode(&mut encoded, value);
        }
        assert_eq!(encoded, "prefix:ACDKgB");
    }

    #[test]
    fn test_display_trait() {
        let s = MagicString::new("hello");
        assert_eq!(format!("{}", s), "hello");
    }

    #[test]
    fn test_complex_scenario() {
        // Simulate a simple svelte2tsx-like transformation.
        let source = r#"<script>
  let count = 0;
</script>

<button on:click={() => count++}>
  {count}
</button>"#;

        let mut s = MagicString::new(source);

        // Wrap in a function.
        s.prepend_str("function render() {\n");
        s.append_str("\n}");

        // Remove the <script> tags.
        let script_start = source.find("<script>").unwrap() as u32;
        let script_end = (source.find("<script>").unwrap() + "<script>".len()) as u32;
        s.overwrite(script_start, script_end, "// script content:");

        let result = s.to_string();
        assert!(result.starts_with("function render() {\n"));
        assert!(result.ends_with("\n}"));
        assert!(result.contains("// script content:"));
        assert!(!result.contains("<script>"));
    }

    #[test]
    fn test_append_left_at_zero() {
        let mut s = MagicString::new("world");
        s.append_left(0, "hello ");
        assert_eq!(s.to_string(), "hello world");
    }

    #[test]
    fn test_append_right_at_end() {
        let mut s = MagicString::new("hello");
        s.append_right(5, " world");
        assert_eq!(s.to_string(), "hello world");
    }

    #[test]
    fn test_multiple_appends_at_same_position() {
        let mut s = MagicString::new("ab");
        s.append_left(1, "1");
        s.append_left(1, "2");
        // append_left appends to outro of the chunk ending at 1,
        // so ordering is: "a" + outro("12") + "b"
        assert_eq!(s.to_string(), "a12b");
    }

    #[test]
    fn test_prepend_right_ordering() {
        let mut s = MagicString::new("ab");
        s.prepend_right(1, "2");
        s.prepend_right(1, "1");
        // prepend_right inserts at front of intro of chunk starting at 1,
        // so last prepend_right goes first: "a" + intro("12") + "b"
        assert_eq!(s.to_string(), "a12b");
    }

    #[test]
    fn test_multiline_source_map() {
        let source = "line1\nline2\nline3";
        let mut s = MagicString::new(source);
        s.overwrite(6, 11, "LINE2");
        let map = s.generate_map(GenerateMapOptions {
            file: Some("out.js".to_string()),
            source: Some("in.js".to_string()),
            include_content: true,
        });
        // Should have semicolons for line breaks.
        assert!(map.mappings.contains(';'));
    }

    #[test]
    fn source_map_mappings_cover_unmapped_newlines_and_utf16_columns() {
        let mut s = MagicString::new("à😀\nZ");
        s.prepend_str("P😀\n\n");
        s.append_left("à".len() as u32, "I😀\n");
        s.prepend_right("à".len() as u32, "\nJà");
        let z = "à😀\n".len() as u32;
        s.overwrite(z, z + 1, "Ω\nQ😀");
        s.append_str("\n\nTAIL");

        assert_eq!(s.to_string(), "P😀\n\nàI😀\n\nJà😀\nΩ\nQ😀\n\nTAIL");

        let map = s.generate_map(GenerateMapOptions {
            file: None,
            source: Some("in.svelte".to_string()),
            include_content: false,
        });
        assert_eq!(map.mappings, ";;AAAA,AAAC;;AAAA,AAAE;AACH,AAAA;;;");
    }

    #[test]
    fn source_map_ascii_runs_are_exact_across_moved_and_edited_chunks() {
        let mut s = MagicString::new("abcdef\nghijkl");
        s.append_left(3, "<>");
        s.overwrite(9, 10, "Ω");
        s.move_range(10, 13, 0);

        assert_eq!(s.to_string(), "jklabc<>def\nghΩ");

        let map = s.generate_map(GenerateMapOptions {
            file: None,
            source: Some("in.svelte".to_string()),
            include_content: false,
        });
        assert_eq!(
            map.mappings,
            "AACG,AAAC,AAAC,AAAC,AADN,AAAC,AAAC,AAAC,AAAA,AAAC,AAAC,AAAC;\
             AACN,AAAC,AAAC,AAAA"
        );
    }

    #[test]
    fn ascii_hires_run_avoids_per_character_vlq_work() {
        let source = "a".repeat(32 * 1024);
        VLQ_ENCODE_CALLS.with(|calls| calls.set(0));

        let mappings = MagicString::new(&source).generate_mappings();
        let vlq_calls = VLQ_ENCODE_CALLS.with(std::cell::Cell::get);

        assert_eq!(mappings.len(), 4 + source.len() * ASCII_HIRES_SEGMENT.len());
        assert_eq!(vlq_calls, 4);
    }

    #[test]
    fn ascii_hires_segment_batches_are_exact() {
        for count in 0..=ASCII_HIRES_BLOCK_SEGMENTS * 2 {
            let mut actual = String::new();
            push_ascii_hires_segments(&mut actual, count);
            assert_eq!(actual, ASCII_HIRES_SEGMENT.repeat(count));
        }
    }

    #[test]
    fn count_utf16_counts_code_units() {
        assert_eq!(count_utf16("abc"), 3); // ASCII: 1 unit each
        assert_eq!(count_utf16("àb"), 2); // BMP: à is 2 bytes but 1 UTF-16 unit
        assert_eq!(count_utf16("😀"), 2); // astral: 4 bytes, 2 UTF-16 units
        assert_eq!(count_utf16("😀x"), 3);
    }

    // Source-map columns must be UTF-16 code units (spec v3 / LSP), not bytes or
    // Unicode scalars. The expected original columns below were cross-checked
    // against the official `magic-string` library. The old byte/char math gave
    // 3 and 8 respectively.

    #[test]
    fn source_map_original_column_is_utf16_for_bmp() {
        // `à` is 2 bytes but 1 UTF-16 unit; overwrite the trailing `x`.
        let mut s = MagicString::new("àbx");
        let x = "àb".len() as u32; // byte offset 3
        s.overwrite(x, x + 1, "Q");
        let map = s.generate_map(GenerateMapOptions {
            file: None,
            source: Some("in.svelte".to_string()),
            include_content: false,
        });
        let sm = sourcemap::SourceMap::from_slice(map.to_json().as_bytes()).unwrap();
        // `Q` sits at generated UTF-16 column 2 (à=1, b=1) and must map back to
        // original UTF-16 column 2 — not byte column 3.
        let t = sm.lookup_token(0, 2).expect("token at generated col 2");
        assert_eq!(t.get_src_col(), 2);
    }

    #[test]
    fn source_map_original_column_is_utf16_for_astral() {
        // Each `😀` is 4 bytes / 2 UTF-16 units; overwrite the trailing `x`.
        let mut s = MagicString::new("😀😀x");
        let x = "😀😀".len() as u32; // byte offset 8
        s.overwrite(x, x + 1, "QQ");
        let map = s.generate_map(GenerateMapOptions {
            file: None,
            source: Some("in.svelte".to_string()),
            include_content: false,
        });
        let sm = sourcemap::SourceMap::from_slice(map.to_json().as_bytes()).unwrap();
        // `QQ` starts at generated UTF-16 column 4 (two astral chars = 4 units)
        // and must map to original UTF-16 column 4 — not byte column 8.
        let t = sm.lookup_token(0, 4).expect("token at generated col 4");
        assert_eq!(t.get_src_col(), 4);
    }

    /// `overwrite` and `remove` walk by ORIGINAL position, not by the chunk
    /// linked list, so a `move_range` that interleaves a foreign chunk into the
    /// target range cannot blank it. Locking this in: the property is what
    /// makes svelte2tsx's phase ordering forgiving, and only a comment guarded
    /// it before.
    #[test]
    fn overwrite_and_remove_ignore_chunks_relocated_into_the_range() {
        // A=[0,3) B=[3,6) C=[6,9); move C between A and B.
        let mut s = MagicString::new("AAABBBCCC");
        s.move_range(6, 9, 3);
        assert_eq!(s.to_string(), "AAACCCBBB");
        // [0,6) is A+B in original coordinates; a next-pointer walk would also
        // reach the relocated C.
        s.overwrite(0, 6, "X");
        assert_eq!(s.to_string(), "XCCC");

        let mut s = MagicString::new("AAABBBCCC");
        s.move_range(6, 9, 3);
        s.remove(0, 6);
        assert_eq!(s.to_string(), "CCC");
    }
}
