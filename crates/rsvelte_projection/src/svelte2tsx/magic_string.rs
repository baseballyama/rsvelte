//! A Rust implementation of MagicString, a string manipulation library that tracks
//! source positions for source map generation.
//!
//! MagicString works by maintaining a linked list of "chunks" representing segments
//! of the original string. Chunks can be modified (overwrite, remove, prepend, append)
//! while preserving position information for accurate source mapping.

use std::fmt;
use std::fmt::Write as _;
use std::num::{NonZeroU16, NonZeroU32};

// ---------------------------------------------------------------------------
// Chunk
// ---------------------------------------------------------------------------

/// A 1-based arena index so `Option<ChunkId>` uses `NonZeroU32`'s null niche.
#[repr(transparent)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct ChunkId(NonZeroU32);

impl ChunkId {
    fn from_index(index: usize) -> Self {
        let one_based = index
            .checked_add(1)
            .and_then(|value| u32::try_from(value).ok())
            .and_then(NonZeroU32::new)
            .expect("MagicString chunk count exceeds u32::MAX");
        Self(one_based)
    }

    #[inline]
    fn index(self) -> usize {
        (self.0.get() - 1) as usize
    }
}

/// A segment of the original string that may have been edited.
#[repr(C)]
#[derive(Debug, Clone)]
struct Chunk {
    /// Original start position in the source (inclusive).
    start: u32,
    /// Original end position in the source (exclusive).
    end: u32,
    /// Index of the next chunk in the arena (linked-list next pointer).
    next: Option<ChunkId>,
    /// Index of the previous chunk in the arena (linked-list prev pointer).
    previous: Option<ChunkId>,
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
}

#[cfg(target_pointer_width = "64")]
const _: () = assert!(std::mem::size_of::<Chunk>() == 88);
#[cfg(target_pointer_width = "32")]
const _: () = assert!(std::mem::size_of::<Chunk>() == 52);
const _: () = assert!(std::mem::size_of::<Option<ChunkId>>() == 4);

impl Chunk {
    fn new(start: u32, end: u32) -> Self {
        Self {
            start,
            end,
            next: None,
            previous: None,
            content: None,
            intro: String::new(),
            outro: String::new(),
        }
    }

    #[inline]
    fn is_edited(&self) -> bool {
        self.content.is_some()
    }

    #[inline]
    fn next_index(&self) -> Option<usize> {
        self.next.map(ChunkId::index)
    }

    #[inline]
    fn previous_index(&self) -> Option<usize> {
        self.previous.map(ChunkId::index)
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
            next: self.next,
            previous: None, // caller sets this
            content: content_after,
            intro: String::new(),
            outro: std::mem::take(&mut self.outro),
        };

        self.end = index;
        self.content = content_before;

        new_chunk
    }
}

#[derive(Debug, Clone, Copy)]
struct ChunkStart {
    position: u32,
    chunk: ChunkId,
}

// This caps reverse-order dense insertion at 256 KiB of total entry movement.
const DENSE_CHUNK_START_LIMIT: usize = 256;

enum ChunkStarts {
    Dense(Vec<ChunkStart>),
    Tree(std::collections::BTreeMap<u32, ChunkId>),
}

enum ChunkStartLookup {
    Boundary {
        left: Option<ChunkId>,
        right: ChunkId,
        dense_right_slot: Option<DenseSlot>,
    },
    Inside {
        chunk: ChunkId,
        dense_insert_slot: Option<DenseSlot>,
    },
    Missing,
}

#[repr(transparent)]
#[derive(Clone, Copy)]
struct DenseSlot(NonZeroU16);

impl DenseSlot {
    fn from_index(index: usize) -> Self {
        let one_based = u16::try_from(index + 1).expect("dense chunk slot exceeds u16");
        Self(NonZeroU16::new(one_based).expect("dense chunk slot is one-based"))
    }

    #[inline]
    fn index(self) -> usize {
        (self.0.get() - 1) as usize
    }
}

impl ChunkStarts {
    fn new() -> Self {
        Self::Dense(vec![ChunkStart {
            position: 0,
            chunk: ChunkId::from_index(0),
        }])
    }

    fn get(&self, position: u32) -> Option<usize> {
        match self {
            Self::Dense(entries) => entries
                .binary_search_by_key(&position, |entry| entry.position)
                .ok()
                .map(|slot| entries[slot].chunk.index()),
            Self::Tree(entries) => entries.get(&position).map(|&chunk| chunk.index()),
        }
    }

    fn find(&self, position: u32) -> ChunkStartLookup {
        match self {
            Self::Dense(entries) => {
                let last_slot = entries.len() - 1;
                let last = entries[last_slot];
                if position >= last.position {
                    return if position == last.position {
                        ChunkStartLookup::Boundary {
                            left: last_slot
                                .checked_sub(1)
                                .map(|previous| entries[previous].chunk),
                            right: last.chunk,
                            dense_right_slot: Some(DenseSlot::from_index(last_slot)),
                        }
                    } else {
                        ChunkStartLookup::Inside {
                            chunk: last.chunk,
                            dense_insert_slot: Some(DenseSlot::from_index(entries.len())),
                        }
                    };
                }

                match entries.binary_search_by_key(&position, |entry| entry.position) {
                    Ok(slot) => ChunkStartLookup::Boundary {
                        left: slot.checked_sub(1).map(|previous| entries[previous].chunk),
                        right: entries[slot].chunk,
                        dense_right_slot: Some(DenseSlot::from_index(slot)),
                    },
                    Err(0) => ChunkStartLookup::Missing,
                    Err(slot) => ChunkStartLookup::Inside {
                        chunk: entries[slot - 1].chunk,
                        dense_insert_slot: Some(DenseSlot::from_index(slot)),
                    },
                }
            }
            Self::Tree(entries) => {
                let mut starts = entries.range(..=position);
                match starts.next_back() {
                    Some((&entry_position, &chunk)) if entry_position == position => {
                        ChunkStartLookup::Boundary {
                            left: starts.next_back().map(|(_, &chunk)| chunk),
                            right: chunk,
                            dense_right_slot: None,
                        }
                    }
                    Some((_, &chunk)) => ChunkStartLookup::Inside {
                        chunk,
                        dense_insert_slot: None,
                    },
                    None => ChunkStartLookup::Missing,
                }
            }
        }
    }

    fn insert(&mut self, position: u32, chunk: ChunkId, dense_insert_slot: Option<DenseSlot>) {
        match self {
            Self::Tree(entries) => {
                entries.insert(position, chunk);
            }
            Self::Dense(entries) if entries.len() < DENSE_CHUNK_START_LIMIT => {
                let slot = dense_insert_slot
                    .expect("dense chunk start insertion needs a slot")
                    .index();
                debug_assert!(
                    slot == 0 || entries[slot - 1].position < position,
                    "chunk start already indexed"
                );
                debug_assert!(
                    slot == entries.len() || position < entries[slot].position,
                    "chunk start already indexed"
                );
                if slot == entries.len() {
                    entries.push(ChunkStart { position, chunk });
                } else {
                    entries.insert(slot, ChunkStart { position, chunk });
                }
            }
            Self::Dense(entries) => {
                let mut tree = std::collections::BTreeMap::new();
                tree.extend(
                    std::mem::take(entries)
                        .into_iter()
                        .map(|entry| (entry.position, entry.chunk)),
                );
                tree.insert(position, chunk);
                *self = Self::Tree(tree);
            }
        }
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
    static JSON_STRING_DIRECT_WRITES: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
    static JSON_STRING_ESCAPE_FALLBACKS: std::cell::Cell<usize> = const { std::cell::Cell::new(0) };
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
    let needs_escape = value
        .as_bytes()
        .iter()
        .any(|&byte| byte < 0x20 || matches!(byte, b'"' | b'\\'));
    if needs_escape {
        #[cfg(test)]
        JSON_STRING_ESCAPE_FALLBACKS.with(|calls| calls.set(calls.get() + 1));
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
    } else {
        #[cfg(test)]
        JSON_STRING_DIRECT_WRITES.with(|calls| calls.set(calls.get() + 1));
        json.push_str(value);
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
const VLQ_I64_MIN: &str = "hgggggggggggQ";

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

    // Sign-magnitude VLQ needs 65 bits only for this otherwise unreachable source-map delta.
    if value == i64::MIN {
        encoded.push_str(VLQ_I64_MIN);
        return;
    }

    let mut vlq = (value.unsigned_abs() << 1) | u64::from(value < 0);
    while vlq >= u64::from(VLQ_BASE) {
        let digit = (vlq as u32 & VLQ_BASE_MASK) | VLQ_CONTINUATION_BIT;
        encoded.push(BASE64_CHARS[digit as usize] as char);
        vlq >>= VLQ_BASE_SHIFT;
    }
    encoded.push(BASE64_CHARS[vlq as usize] as char);
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
    code_bytes: usize,
    mapping_bytes: usize,
    forward_segments: usize,
}

impl OutputEstimate {
    #[inline]
    fn add_code_bytes(&mut self, bytes: usize) {
        self.code_bytes = self.code_bytes.saturating_add(bytes);
    }

    #[inline]
    fn add_mapping_bytes(&mut self, bytes: usize) {
        self.mapping_bytes = self.mapping_bytes.saturating_add(bytes);
    }

    #[inline]
    fn add_unmapped_output(&mut self, content: &str) {
        self.add_code_bytes(content.len());
        self.add_mapping_bytes(memchr::memchr_iter(b'\n', content.as_bytes()).count());
    }

    fn add_chunk_body(&mut self, chunk: &Chunk, body: &str) {
        self.add_code_bytes(body.len());
        if body.is_empty() {
            return;
        }

        // Four u32-domain VLQ fields plus a possible comma fit in 24 bytes.
        self.add_mapping_bytes(MAX_HIRES_SEGMENT_BYTES);
        if chunk.is_edited() {
            self.add_mapping_bytes(memchr::memchr_iter(b'\n', body.as_bytes()).count());
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
        let column_source = &original[line_start..offset];
        let column = if column_source.is_ascii() {
            column_source.len()
        } else {
            column_source.chars().map(char::len_utf16).sum::<usize>()
        };
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

        let mut generated_column = self.generated_column;
        let mut starts_line = false;
        // Valid UTF-8 contributes one unit per leading byte and one extra for astral leads.
        for &byte in content.as_bytes() {
            match byte {
                b'\n' => {
                    self.mappings.push(';');
                    generated_column = 0;
                    starts_line = true;
                }
                0x00..=0x7f | 0xc0..=0xef => generated_column += 1,
                0xf0..=0xff => generated_column += 2,
                _ => {}
            }
        }
        self.generated_column = generated_column;
        if starts_line {
            self.first_segment_on_line = true;
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
pub struct MagicString<'source> {
    /// The original source string.
    original: &'source str,
    /// Arena of chunks (linked list stored in a Vec).
    chunks: Vec<Chunk>,
    /// Index of the first chunk in the linked list.
    first_chunk: ChunkId,
    /// Index of the last chunk in the linked list.
    last_chunk: ChunkId,
    /// Original-source chunk starts, ordered by position.
    by_start: ChunkStarts,
    /// Content prepended before everything.
    intro: String,
    /// Content appended after everything.
    outro: String,
}

#[derive(Clone, Copy, Default)]
struct ChunkBoundary {
    left: Option<ChunkId>,
    right: Option<ChunkId>,
    dense_right_slot: Option<DenseSlot>,
}

impl ChunkBoundary {
    #[inline]
    fn left_index(self) -> Option<usize> {
        self.left.map(ChunkId::index)
    }

    #[inline]
    fn right_index(self) -> Option<usize> {
        self.right.map(ChunkId::index)
    }
}

#[cfg(target_pointer_width = "64")]
const _: () = assert!(std::mem::size_of::<MagicString<'_>>() == 128);
const _: () = assert!(std::mem::size_of::<ChunkBoundary>() == 12);

impl<'source> MagicString<'source> {
    // -----------------------------------------------------------------
    // Construction
    // -----------------------------------------------------------------

    /// Create a new `MagicString` from the given source.
    pub fn new(source: &'source str) -> Self {
        let source_len = checked_source_len(source.len());
        let chunk = Chunk::new(0, source_len);
        Self {
            original: source,
            chunks: vec![chunk],
            first_chunk: ChunkId::from_index(0),
            last_chunk: ChunkId::from_index(0),
            by_start: ChunkStarts::new(),
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

    #[inline]
    fn chunk_starting_at(&self, index: u32) -> Option<usize> {
        self.by_start.get(index)
    }

    /// Ensure there is a chunk boundary at the given original position.
    /// Returns the chunks immediately before and after that boundary in
    /// original-source order.
    ///
    /// If `index` falls outside `[0, original.len()]` we treat it as the
    /// "nothing to split" sentinel instead of panicking. This
    /// keeps a misbehaving upstream (e.g. an AST with stale positions) from
    /// crashing the entire compiler in release builds. Debug builds print a
    /// diagnostic so the upstream bug is still surfaced during development.
    fn split_at(&mut self, index: u32) -> ChunkBoundary {
        if index as usize > self.original.len() {
            #[cfg(debug_assertions)]
            eprintln!(
                "split_at({}): position out of range [0, {})",
                index,
                self.original.len()
            );
            return ChunkBoundary::default();
        }

        let (cur, dense_insert_slot) = match self.by_start.find(index) {
            ChunkStartLookup::Boundary {
                left,
                right,
                dense_right_slot,
            } => {
                return ChunkBoundary {
                    left,
                    right: Some(right),
                    dense_right_slot,
                };
            }
            ChunkStartLookup::Inside {
                chunk,
                dense_insert_slot,
            } => (chunk.index(), dense_insert_slot),
            ChunkStartLookup::Missing => {
                #[cfg(debug_assertions)]
                eprintln!(
                    "split_at({}): no chunk start <= index (source length {})",
                    index,
                    self.original.len()
                );
                return ChunkBoundary::default();
            }
        };

        // The source-end boundary has no chunk on its right.
        if index as usize == self.original.len() {
            return ChunkBoundary {
                left: Some(ChunkId::from_index(cur)),
                right: None,
                dense_right_slot: None,
            };
        }

        {
            let chunk = &self.chunks[cur];
            if !(index > chunk.start && index < chunk.end) {
                #[cfg(debug_assertions)]
                eprintln!(
                    "split_at({}): located chunk [{}, {}) does not strictly contain index",
                    index, chunk.start, chunk.end
                );
                return ChunkBoundary::default();
            }
        }

        self.split_known_chunk(cur, index, dense_insert_slot)
    }

    fn split_known_chunk(
        &mut self,
        cur: usize,
        index: u32,
        dense_insert_slot: Option<DenseSlot>,
    ) -> ChunkBoundary {
        debug_assert!(index > self.chunks[cur].start && index < self.chunks[cur].end);

        let old_next = self.chunks[cur].next_index();
        let mut new_chunk = self.chunks[cur].split(index);

        let new_idx = self.chunks.len();
        let new_id = ChunkId::from_index(new_idx);
        new_chunk.previous = Some(ChunkId::from_index(cur));
        self.chunks.push(new_chunk);

        self.chunks[cur].next = Some(new_id);
        if let Some(old_next_idx) = old_next {
            self.chunks[old_next_idx].previous = Some(new_id);
        }
        if self.last_chunk.index() == cur {
            self.last_chunk = new_id;
        }

        self.by_start.insert(index, new_id, dense_insert_slot);

        ChunkBoundary {
            left: Some(ChunkId::from_index(cur)),
            right: Some(new_id),
            dense_right_slot: dense_insert_slot,
        }
    }

    /// Internal: link chunk `a` → `b` in the linked list.
    fn link(&mut self, a: Option<usize>, b: Option<usize>) {
        if let Some(ai) = a {
            self.chunks[ai].next = b.map(ChunkId::from_index);
        }
        if let Some(bi) = b {
            self.chunks[bi].previous = a.map(ChunkId::from_index);
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
        let start_boundary = self.split_at(start);
        let first = start_boundary
            .right_index()
            .expect("overwrite: no chunk at start");
        match end.cmp(&self.chunks[first].end) {
            std::cmp::Ordering::Less => {
                let dense_insert_slot = start_boundary
                    .dense_right_slot
                    .map(|right_slot| DenseSlot::from_index(right_slot.index() + 1));
                self.split_known_chunk(first, end, dense_insert_slot);
            }
            std::cmp::Ordering::Equal => {}
            std::cmp::Ordering::Greater => {
                self.split_at(end);
            }
        }

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
            let ci = match self.chunk_starting_at(cur_end) {
                Some(i) => i,
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

    pub fn overwrite_fmt(&mut self, start: u32, end: u32, args: fmt::Arguments<'_>) -> &mut Self {
        if start >= end {
            return self;
        }
        self.overwrite(start, end, "");
        let chunk_idx = self
            .chunk_starting_at(start)
            .expect("overwrite_fmt: no chunk at start");
        self.chunks[chunk_idx]
            .content
            .as_mut()
            .expect("overwrite_fmt: chunk was not edited")
            .write_fmt(args)
            .expect("writing to String cannot fail");
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

        let start_boundary = self.split_at(start);
        self.split_at(end);

        // Walk by original position (see comment in `overwrite`) so chunks
        // relocated via `move_range` aren't incorrectly cleared.
        let mut current = start_boundary.right_index();
        while let Some(ci) = current {
            self.chunks[ci].content = Some(String::new());
            self.chunks[ci].intro.clear();
            self.chunks[ci].outro.clear();
            let cur_start = self.chunks[ci].end;
            if cur_start >= end {
                break;
            }
            current = self.by_start.get(cur_start);
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

    /// Append owned content at the very end of the output.
    pub fn append_str_owned(&mut self, content: String) -> &mut Self {
        if self.outro.is_empty() {
            self.outro = content;
            self
        } else {
            self.append_str(&content)
        }
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

        let chunk_idx = self
            .split_at(index)
            .left_index()
            .expect("append_left: no chunk ending at index");
        self.chunks[chunk_idx].outro.push_str(content);
        self
    }

    pub fn append_left_fmt(&mut self, index: u32, args: fmt::Arguments<'_>) -> &mut Self {
        assert!(
            (index as usize) <= self.original.len(),
            "append_left_fmt: index out of range"
        );

        if index == 0 {
            self.intro
                .write_fmt(args)
                .expect("writing to String cannot fail");
            return self;
        }

        let chunk_idx = self
            .split_at(index)
            .left_index()
            .expect("append_left_fmt: no chunk ending at index");
        self.chunks[chunk_idx]
            .outro
            .write_fmt(args)
            .expect("writing to String cannot fail");
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

        let chunk_idx = self
            .split_at(index)
            .right_index()
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

        let chunk_idx = self
            .split_at(index)
            .left_index()
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

        let chunk_idx = self
            .split_at(index)
            .right_index()
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

        let start_boundary = self.split_at(start);
        let end_boundary = self.split_at(end);
        let target_boundary = self.split_at(index);

        let first_in_range = start_boundary
            .right_index()
            .expect("move_range: no chunk at start");
        let last_in_range = end_boundary
            .left_index()
            .expect("move_range: no chunk at end");

        let before_range = self.chunks[first_in_range].previous_index();
        let after_range = self.chunks[last_in_range].next_index();

        // Detach the range from its current position.
        self.link(before_range, after_range);

        // Update first/last chunk pointers if needed.
        if self.first_chunk.index() == first_in_range
            && let Some(ar) = after_range
        {
            self.first_chunk = ChunkId::from_index(ar);
        }
        if self.last_chunk.index() == last_in_range
            && let Some(br) = before_range
        {
            self.last_chunk = ChunkId::from_index(br);
        }

        // Insert at the target position.
        if index == 0 {
            // Insert before the current first chunk.
            let old_first = self.first_chunk.index();
            self.link(Some(last_in_range), Some(old_first));
            self.chunks[first_in_range].previous = None;
            self.first_chunk = ChunkId::from_index(first_in_range);
        } else if index == self.original.len() as u32 {
            // Insert after the current last chunk.
            let old_last = self.last_chunk.index();
            self.link(Some(old_last), Some(first_in_range));
            self.chunks[last_in_range].next = None;
            self.last_chunk = ChunkId::from_index(last_in_range);
        } else {
            // Insert before the chunk that starts at `index`.
            let target = target_boundary
                .right_index()
                .expect("move_range: no chunk at target index");
            let before_target = self.chunks[target].previous_index();
            self.link(before_target, Some(first_in_range));
            self.link(Some(last_in_range), Some(target));
            if self.first_chunk.index() == target && before_range.is_none() {
                self.first_chunk = ChunkId::from_index(first_in_range);
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
                vec![self.original.to_string()]
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
            include_content.then_some(self.original),
        );

        let mut code = String::with_capacity(estimate.code_bytes);
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
        estimate.add_unmapped_output(&self.intro);

        let mut cur = Some(self.first_chunk.index());
        while let Some(chunk_index) = cur {
            let chunk = &self.chunks[chunk_index];
            let body = self.chunk_content(chunk_index);
            estimate.add_unmapped_output(&chunk.intro);
            estimate.add_chunk_body(chunk, body);
            estimate.add_unmapped_output(&chunk.outro);
            if !chunk.is_edited() && chunk.end > chunk.start {
                estimate.forward_segments = estimate.forward_segments.saturating_add(1);
            }
            cur = chunk.next_index();
        }

        estimate.add_unmapped_output(&self.outro);
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
        let mut mapping = mappings.map(|mappings| MappingState::new(mappings, self.original));
        if let Some(code) = &mut code {
            code.push_str(&self.intro);
        }
        if let Some(mapping) = &mut mapping {
            mapping.advance_unmapped(&self.intro);
        }

        let mut generated_bytes = self.intro.len() as u32;
        let mut cur = Some(self.first_chunk.index());
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
                mapping.advance_chunk_body(self.original, chunk, body);
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
            cur = chunk.next_index();
        }

        if let Some(code) = &mut code {
            code.push_str(&self.outro);
        }
        if let Some(mapping) = &mut mapping {
            mapping.advance_unmapped(&self.outro);
        }
    }
}

impl fmt::Display for MagicString<'_> {
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
    starts.extend(memchr::memchr_iter(b'\n', s.as_bytes()).map(|index| index + 1));
    starts
}

fn checked_source_len(len: usize) -> u32 {
    u32::try_from(len).expect("MagicString source length exceeds u32::MAX bytes")
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::{align_of, offset_of, size_of};

    type PreviousChunkLayout = (
        u32,
        u32,
        Option<String>,
        String,
        String,
        Option<usize>,
        Option<usize>,
    );

    fn assert_bidirectional_links(s: &MagicString) {
        let mut forward = Vec::with_capacity(s.chunks.len());
        let mut visited = vec![false; s.chunks.len()];
        let mut expected_previous = None;
        let mut current = Some(s.first_chunk.index());

        while let Some(index) = current {
            assert!(!visited[index], "cycle at chunk {index}");
            visited[index] = true;
            let chunk = &s.chunks[index];
            assert_eq!(chunk.previous_index(), expected_previous);
            forward.push(index);
            expected_previous = Some(index);
            current = chunk.next_index();
        }

        assert_eq!(forward.len(), s.chunks.len());
        assert_eq!(forward.last().copied(), Some(s.last_chunk.index()));

        let mut backward = Vec::with_capacity(s.chunks.len());
        let mut expected_next = None;
        current = Some(s.last_chunk.index());
        while let Some(index) = current {
            let chunk = &s.chunks[index];
            assert_eq!(chunk.next_index(), expected_next);
            backward.push(index);
            expected_next = Some(index);
            current = chunk.previous_index();
        }

        assert_eq!(forward.iter().copied().rev().collect::<Vec<_>>(), backward);
    }

    fn vlq_decode(encoded: &str) -> i64 {
        let mut value = 0u128;
        let mut shift = 0;
        for (index, byte) in encoded.bytes().enumerate() {
            let digit = BASE64_CHARS
                .iter()
                .position(|candidate| *candidate == byte)
                .expect("VLQ output must use the base64 alphabet") as u128;
            value |= (digit & u128::from(VLQ_BASE_MASK)) << shift;
            if digit & u128::from(VLQ_CONTINUATION_BIT) == 0 {
                assert_eq!(index + 1, encoded.len());
                let magnitude = value >> 1;
                return if value & 1 == 0 {
                    i64::try_from(magnitude).expect("positive VLQ fits i64")
                } else if magnitude == 1u128 << 63 {
                    i64::MIN
                } else {
                    -i64::try_from(magnitude).expect("negative VLQ magnitude fits i64")
                };
            }
            shift += VLQ_BASE_SHIFT;
        }
        panic!("unterminated VLQ");
    }

    #[test]
    fn chunk_layout_compacts_links_and_groups_hot_fields() {
        assert_eq!(size_of::<ChunkId>(), 4);
        assert_eq!(size_of::<Option<ChunkId>>(), 4);
        assert_eq!(offset_of!(Chunk, start), 0);
        assert_eq!(offset_of!(Chunk, end), 4);
        assert_eq!(offset_of!(Chunk, next), 8);
        assert_eq!(offset_of!(Chunk, previous), 12);
        assert_eq!(offset_of!(Chunk, content), 16);

        #[cfg(target_pointer_width = "64")]
        {
            assert_eq!(size_of::<String>(), 24);
            assert_eq!(size_of::<Option<String>>(), 24);
            assert_eq!(size_of::<Option<usize>>(), 16);
            assert_eq!(size_of::<PreviousChunkLayout>(), 112);
            assert_eq!(size_of::<Chunk>(), 88);
            assert_eq!(align_of::<Chunk>(), 8);
            assert_eq!(size_of::<std::collections::BTreeMap<u32, u32>>(), 24);
            assert_eq!(size_of::<ChunkStarts>(), 32);
            assert_eq!(size_of::<MagicString<'_>>(), 128);
        }
    }

    #[test]
    fn chunk_id_round_trips_representable_indices() {
        assert_eq!(ChunkId::from_index(0).index(), 0);
        let last_index = u32::MAX as usize - 1;
        assert_eq!(ChunkId::from_index(last_index).index(), last_index);
    }

    #[cfg(target_pointer_width = "64")]
    #[test]
    #[should_panic(expected = "MagicString chunk count exceeds u32::MAX")]
    fn chunk_id_rejects_an_unrepresentable_index() {
        ChunkId::from_index(u32::MAX as usize);
    }

    #[cfg(target_pointer_width = "64")]
    #[test]
    #[should_panic(expected = "MagicString source length exceeds u32::MAX bytes")]
    fn source_length_invariant_rejects_unrepresentable_positions() {
        checked_source_len(u32::MAX as usize + 1);
    }

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
        let estimate = value.estimate_outputs();
        assert_eq!(estimate.forward_segments, expected_forward_segments.len());
        assert_eq!(estimate.code_bytes, expected_code.len());
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
    fn borrows_original_source() {
        let source = String::from("hello world");
        let s = MagicString::new(&source);

        assert_eq!(s.original.as_ptr(), source.as_ptr());
        assert_eq!(s.original.len(), source.len());
    }

    #[test]
    fn test_overwrite() {
        let mut s = MagicString::new("hello world");
        s.overwrite(0, 5, "goodbye");
        assert_eq!(s.to_string(), "goodbye world");
    }

    #[test]
    fn test_overwrite_fmt() {
        let mut s = MagicString::new("hello world");
        s.overwrite_fmt(0, 5, format_args!("{} {}", "good", "day"));
        assert_eq!(s.to_string(), "good day world");
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
    fn append_str_owned_reuses_an_empty_outro() {
        let mut s = MagicString::new("hello");
        let content = String::from(" world");
        let content_ptr = content.as_ptr();

        s.append_str_owned(content);

        assert_eq!(s.outro.as_ptr(), content_ptr);
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
    fn test_append_left_fmt() {
        let mut s = MagicString::new("hello world");
        s.append_left_fmt(5, format_args!(" {} {}", "wide", 2));
        assert_eq!(s.to_string(), "hello wide 2 world");
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
    fn split_move_overwrite_preserves_bidirectional_traversal() {
        let mut s = MagicString::new("abcdefghijkl");
        s.append_left(3, "|");
        s.prepend_right(6, "!");
        s.move_range(6, 9, 0);
        assert_eq!(s.to_string(), "!ghiabc|defjkl");
        assert_bidirectional_links(&s);

        s.overwrite(0, 6, "X");
        assert_eq!(s.to_string(), "!ghiXjkl");
        assert_eq!(s.forward_segments(), vec![(6, 9, 1), (9, 12, 5)]);
        assert!(
            !s.generate_map(GenerateMapOptions::default())
                .mappings
                .is_empty()
        );
        assert_bidirectional_links(&s);
    }

    #[test]
    fn repeated_boundary_edits_keep_original_sides_after_move() {
        let mut s = MagicString::new("abcdef");
        s.move_range(2, 4, 6);
        assert_eq!(s.to_string(), "abefcd");

        s.append_left(2, "L");
        s.append_left(2, "R");
        s.prepend_left(2, "X");
        s.prepend_right(2, "P");
        s.prepend_right(2, "Q");
        s.append_right(2, "A");

        assert_eq!(s.to_string(), "abXLRefQPAcd");
    }

    #[test]
    fn packed_chunk_starts_promote_after_bounded_reverse_inserts() {
        assert_eq!(std::mem::size_of::<ChunkStart>(), 8);

        let source = "x".repeat(DENSE_CHUNK_START_LIMIT + 2);
        let mut s = MagicString::new(&source);
        for index in (1..DENSE_CHUNK_START_LIMIT).rev() {
            s.append_right(index as u32, "_");
        }
        let chunk_count = s.chunks.len();
        s.append_right(128, "!");

        let ChunkStarts::Dense(entries) = &s.by_start else {
            panic!("repeated boundaries must not promote the dense index");
        };
        assert_eq!(entries.len(), chunk_count);
        assert!(
            entries
                .windows(2)
                .all(|entries| entries[0].position < entries[1].position)
        );
        assert!(
            entries
                .iter()
                .all(|entry| s.chunks[entry.chunk.index()].start == entry.position)
        );

        s.append_right(DENSE_CHUNK_START_LIMIT as u32, "_");
        let ChunkStarts::Tree(entries) = &s.by_start else {
            panic!("the first boundary past the dense limit must promote");
        };
        assert_eq!(entries.len(), DENSE_CHUNK_START_LIMIT + 1);
        let output = s.to_string();
        assert_eq!(output.matches('_').count(), DENSE_CHUNK_START_LIMIT);
        assert_eq!(output.matches('!').count(), 1);
    }

    #[test]
    fn compact_links_preserve_split_move_and_overwrite_traversal() {
        let mut s = MagicString::new("abcdefghijkl");
        s.append_left(3, "|");
        s.prepend_right(6, "!");
        s.move_range(6, 9, 0);
        assert_eq!(s.to_string(), "!ghiabc|defjkl");
        assert_bidirectional_links(&s);

        s.overwrite(0, 6, "X");
        assert_eq!(s.to_string(), "!ghiXjkl");
        assert_eq!(s.forward_segments(), vec![(6, 9, 1), (9, 12, 5)]);
        assert!(
            !s.generate_map(GenerateMapOptions::default())
                .mappings
                .is_empty()
        );
        assert_bidirectional_links(&s);
    }

    #[cfg(target_pointer_width = "64")]
    #[test]
    fn compact_links_reduce_a_1024_chunk_arena_by_24_kib() {
        const CHUNK_COUNT: usize = 1024;
        let source = "x".repeat(CHUNK_COUNT);
        let mut s = MagicString::new(&source);
        for index in (1..CHUNK_COUNT).rev() {
            s.append_right(index as u32, "_");
        }

        assert_eq!(s.chunks.len(), CHUNK_COUNT);
        let ChunkStarts::Tree(entries) = &s.by_start else {
            panic!("the reverse-split workload must promote the start index");
        };
        assert_eq!(entries.len(), CHUNK_COUNT);
        assert!(
            entries
                .iter()
                .all(|(&position, &chunk)| s.chunks[chunk.index()].start == position)
        );
        let output = s.to_string();
        assert_eq!(output.len(), CHUNK_COUNT * 2 - 1);
        assert_eq!(output.matches('_').count(), CHUNK_COUNT - 1);
        assert_bidirectional_links(&s);
        assert_eq!(CHUNK_COUNT * size_of::<PreviousChunkLayout>(), 114_688);
        assert_eq!(CHUNK_COUNT * size_of::<Chunk>(), 90_112);
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
    fn generated_output_and_map_content_outlive_the_source() {
        let (output, map) = {
            let source = String::from("hello world");
            let mut s = MagicString::new(&source);
            s.overwrite(6, 11, "earth");

            (
                s.to_string(),
                s.generate_map(GenerateMapOptions {
                    file: None,
                    source: Some("input.svelte".to_string()),
                    include_content: true,
                }),
            )
        };

        assert_eq!(output, "hello earth");
        assert_eq!(map.sources_content, vec!["hello world".to_string()]);
        assert!(
            map.to_json()
                .contains("\"sourcesContent\":[\"hello world\"]")
        );
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
    fn json_strings_preserve_the_ascii_byte_escape_contract() {
        for byte in 0..=0x7f {
            let value = char::from(byte).to_string();
            let escaped = match byte {
                b'"' => "\\\"".to_string(),
                b'\\' => "\\\\".to_string(),
                b'\n' => "\\n".to_string(),
                b'\r' => "\\r".to_string(),
                b'\t' => "\\t".to_string(),
                0x00..=0x1f => format!("\\u{byte:04x}"),
                _ => value.clone(),
            };
            let expected = format!("sentinel:\"{escaped}\"");
            let mut actual = String::from("sentinel:");

            push_json_string(&mut actual, &value);

            assert_eq!(actual, expected, "byte 0x{byte:02x}");
            assert_eq!(
                serde_json::from_str::<String>(&actual["sentinel:".len()..]).unwrap(),
                value,
                "byte 0x{byte:02x}"
            );
        }
    }

    #[test]
    fn json_strings_bulk_write_safe_bytes_and_fall_back_for_each_hazard_position() {
        let safe_ascii = (0x20..=0x7f)
            .filter(|&byte| !matches!(byte, b'"' | b'\\'))
            .map(char::from)
            .collect::<String>();
        let safe_values = ["", safe_ascii.as_str(), "é雪😀\u{2028}\u{2029}"];

        JSON_STRING_DIRECT_WRITES.with(|calls| calls.set(0));
        JSON_STRING_ESCAPE_FALLBACKS.with(|calls| calls.set(0));
        for value in safe_values {
            let mut actual = String::new();
            push_json_string(&mut actual, value);
            assert_eq!(actual, serde_json::to_string(value).unwrap());
        }
        assert_eq!(JSON_STRING_DIRECT_WRITES.with(std::cell::Cell::get), 3);
        assert_eq!(JSON_STRING_ESCAPE_FALLBACKS.with(std::cell::Cell::get), 0);

        let hazards = [
            "\"tail",
            "head\"tail",
            "head\"",
            "\\tail",
            "head\\tail",
            "head\\",
            "\u{0000}tail",
            "head\u{001f}tail",
            "head\n",
        ];
        JSON_STRING_DIRECT_WRITES.with(|calls| calls.set(0));
        JSON_STRING_ESCAPE_FALLBACKS.with(|calls| calls.set(0));
        for value in hazards {
            let mut actual = String::new();
            push_json_string(&mut actual, value);
            assert_eq!(
                serde_json::from_str::<String>(&actual).unwrap(),
                value,
                "{value:?}"
            );
        }
        assert_eq!(JSON_STRING_DIRECT_WRITES.with(std::cell::Cell::get), 0);
        assert_eq!(
            JSON_STRING_ESCAPE_FALLBACKS.with(std::cell::Cell::get),
            hazards.len()
        );
    }

    #[test]
    fn json_string_scalar_fallback_preserves_unicode_and_control_escapes() {
        let value = "\u{0000}\u{0001}\u{0008}\t\n\u{000c}\r\u{001f}\"\\é雪😀";
        let mut actual = String::new();

        push_json_string(&mut actual, value);

        assert_eq!(actual, r#""\u0000\u0001\u0008\t\n\u000c\r\u001f\"\\é雪😀""#);
        assert_eq!(serde_json::from_str::<String>(&actual).unwrap(), value);
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
    fn vlq_round_trips_every_i16_and_signed_boundaries() {
        for value in i16::MIN..=i16::MAX {
            let mut encoded = String::new();
            vlq_encode(&mut encoded, i64::from(value));
            assert_eq!(vlq_decode(&encoded), i64::from(value));
        }

        let mut boundaries = vec![i64::MIN, i64::MAX];
        for bit in 0..=62 {
            let value = 1i64 << bit;
            boundaries.extend([
                value.saturating_sub(1),
                value,
                value.saturating_add(1),
                value.saturating_neg().saturating_sub(1),
                value.saturating_neg(),
                value.saturating_neg().saturating_add(1),
            ]);
        }
        for value in boundaries {
            let mut encoded = String::new();
            vlq_encode(&mut encoded, value);
            assert_eq!(vlq_decode(&encoded), value);
        }
    }

    #[test]
    fn vlq_digit_width_transitions_are_exact() {
        for (value, expected) in [
            (-17, "jB"),
            (-16, "hB"),
            (15, "e"),
            (16, "gB"),
            (-513, "jgB"),
            (-512, "hgB"),
            (511, "+f"),
            (512, "ggB"),
        ] {
            let mut encoded = String::new();
            vlq_encode(&mut encoded, value);
            assert_eq!(encoded, expected);
        }
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
    fn advance_unmapped_fuses_line_and_utf16_scans() {
        for (content, initial_column, expected_mappings, expected_column) in [
            ("abc", 2, "", 5),
            ("a\nbc\n", 2, ";;", 0),
            ("à😀\nx", 2, ";", 1),
            ("\n😀", 2, ";", 2),
        ] {
            let mut mappings = String::new();
            let mut state = MappingState::new(&mut mappings, "");
            state.generated_column = initial_column;
            state.advance_unmapped(content);
            assert_eq!(state.mappings, expected_mappings, "{content:?}");
            assert_eq!(state.generated_column, expected_column, "{content:?}");
        }
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
