//! A Rust implementation of MagicString, a string manipulation library that tracks
//! source positions for source map generation.
//!
//! MagicString works by maintaining a linked list of "chunks" representing segments
//! of the original string. Chunks can be modified (overwrite, remove, prepend, append)
//! while preserving position information for accurate source mapping.

use std::collections::HashMap;
use std::fmt;

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
    /// The original content of this chunk (never mutated).
    original: String,
    /// The current content — equals `original` unless `edited` is true.
    content: String,
    /// Content prepended before this chunk (via `append_left` / `prepend_right`).
    intro: String,
    /// Content appended after this chunk (via `append_right` / `prepend_left` on next).
    outro: String,
    /// Whether this chunk's content has been replaced via `overwrite` / `remove`.
    edited: bool,
    /// Index of the next chunk in the arena (linked-list next pointer).
    next: Option<usize>,
    /// Index of the previous chunk in the arena (linked-list prev pointer).
    previous: Option<usize>,
}

impl Chunk {
    fn new(start: u32, end: u32, content: &str) -> Self {
        Self {
            start,
            end,
            original: content.to_string(),
            content: content.to_string(),
            intro: String::new(),
            outro: String::new(),
            edited: false,
            next: None,
            previous: None,
        }
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

        let slice_index = (index - self.start) as usize;
        let original_before = self.original[..slice_index].to_string();
        let original_after = self.original[slice_index..].to_string();

        // If the chunk was edited, preserve the edited state in both halves.
        // An edited chunk with empty content should produce two edited chunks
        // with empty content (not revert to original text).
        let (content_before, content_after, new_edited) = if self.edited {
            // For edited chunks, split the edited content proportionally.
            // If content is empty (e.g., from a remove/overwrite with ""),
            // both halves get empty content.
            if self.content.is_empty() {
                (String::new(), String::new(), true)
            } else {
                // If content was replaced, we can't meaningfully split it,
                // so put all content in the first half and leave the second empty.
                let content = std::mem::take(&mut self.content);
                (content, String::new(), true)
            }
        } else {
            (original_before.clone(), original_after.clone(), false)
        };

        let new_chunk = Chunk {
            start: index,
            end: self.end,
            original: original_after,
            content: content_after,
            intro: String::new(),
            outro: std::mem::take(&mut self.outro),
            edited: new_edited,
            next: self.next,
            previous: None, // caller sets this
        };

        self.end = index;
        self.original = original_before;
        self.content = content_before;

        new_chunk
    }
}

// ---------------------------------------------------------------------------
// SourceMap
// ---------------------------------------------------------------------------

/// A v3 source map.
#[derive(Debug, Clone)]
pub struct SourceMap {
    pub version: u8,
    pub file: Option<String>,
    pub sources: Vec<String>,
    pub sources_content: Vec<String>,
    pub names: Vec<String>,
    pub mappings: String,
}

impl SourceMap {
    /// Serialize to a JSON string.
    pub fn to_json(&self) -> String {
        let sources: Vec<String> = self.sources.iter().map(|s| json_escape(s)).collect();
        let sources_content: Vec<String> = self
            .sources_content
            .iter()
            .map(|s| json_escape(s))
            .collect();
        let names: Vec<String> = self.names.iter().map(|s| json_escape(s)).collect();

        let file_str = match &self.file {
            Some(f) => json_escape(f),
            None => "null".to_string(),
        };

        format!(
            r#"{{"version":{},"file":{},"sources":[{}],"sourcesContent":[{}],"names":[{}],"mappings":{}}}"#,
            self.version,
            file_str,
            sources.join(","),
            sources_content.join(","),
            names.join(","),
            json_escape(&self.mappings),
        )
    }
}

/// Wrap a string value in double-quotes with JSON escaping.
fn json_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for ch in s.chars() {
        match ch {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                out.push_str(&format!("\\u{:04x}", c as u32));
            }
            c => out.push(c),
        }
    }
    out.push('"');
    out
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

// ---------------------------------------------------------------------------
// VLQ encoding
// ---------------------------------------------------------------------------

const VLQ_BASE_SHIFT: u32 = 5;
const VLQ_BASE: u32 = 1 << VLQ_BASE_SHIFT; // 32
const VLQ_BASE_MASK: u32 = VLQ_BASE - 1; // 31
const VLQ_CONTINUATION_BIT: u32 = VLQ_BASE; // 32

const BASE64_CHARS: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn vlq_encode(value: i64) -> String {
    let mut vlq = if value < 0 {
        ((-value) as u32) << 1 | 1
    } else {
        (value as u32) << 1
    };

    let mut encoded = String::new();
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
    encoded
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
    /// Populated lazily via `split_at`.
    by_start: HashMap<u32, usize>,
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
        let chunk = Chunk::new(0, source.len() as u32, source);
        let mut by_start = HashMap::new();
        let mut by_end = HashMap::new();
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

        // Walk the linked list to find the chunk containing `index`.
        let mut cur = self.first_chunk;
        loop {
            let chunk = &self.chunks[cur];
            if index > chunk.start && index < chunk.end {
                // Need to split this chunk.
                break;
            }
            match chunk.next {
                Some(next) => cur = next,
                // The earlier `index >= self.original.len()` guard means we
                // should not reach the end of the chunk list with `index` past
                // the source. If we somehow do (e.g. corrupted chunk list),
                // log in debug and return the sentinel rather than panic.
                None => {
                    #[cfg(debug_assertions)]
                    eprintln!(
                        "split_at({}): chunk list exhausted (source length {})",
                        index,
                        self.original.len()
                    );
                    return usize::MAX;
                }
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
        self.chunks[first].content = content.to_string();
        self.chunks[first].edited = true;
        // Preserve intro of first chunk, but clear its outro – the last chunk's outro is kept.
        self.chunks[first].outro.clear();

        let mut cur = self.chunks[first].next;
        while let Some(ci) = cur {
            if self.chunks[ci].start >= end {
                break;
            }
            self.chunks[ci].content.clear();
            self.chunks[ci].edited = true;
            self.chunks[ci].intro.clear();
            if self.chunks[ci].end == end {
                // Keep the outro of the last chunk in the range.
                break;
            }
            self.chunks[ci].outro.clear();
            cur = self.chunks[ci].next;
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

        let first = *self
            .by_start
            .get(&start)
            .expect("remove: no chunk at start");

        let mut cur = Some(first);
        while let Some(ci) = cur {
            if self.chunks[ci].start >= end {
                break;
            }
            self.chunks[ci].content.clear();
            self.chunks[ci].edited = true;
            self.chunks[ci].intro.clear();
            self.chunks[ci].outro.clear();
            cur = self.chunks[ci].next;
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
        result.push_str(&self.intro);

        let mut cur = Some(self.first_chunk);
        while let Some(ci) = cur {
            let chunk = &self.chunks[ci];
            result.push_str(&chunk.intro);
            result.push_str(&chunk.content);
            result.push_str(&chunk.outro);
            cur = chunk.next;
        }

        result.push_str(&self.outro);
        result
    }

    /// Generate a v3 source map.
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

    // -----------------------------------------------------------------
    // Source-map internals
    // -----------------------------------------------------------------

    /// Build the VLQ-encoded `mappings` string.
    #[allow(unused_assignments)]
    fn generate_mappings(&self) -> String {
        let mut mappings = String::new();

        // Running state for relative VLQ encoding.
        let mut _generated_line: u32 = 0;
        let mut generated_column: i64 = 0;
        let mut original_line: i64 = 0;
        let mut original_column: i64 = 0;

        // Pre-compute line starts for the original source.
        let original_line_starts = line_starts(&self.original);

        // Helper closure: given an original byte offset, return (line, col) both 0-based.
        let orig_loc = |offset: u32| -> (i64, i64) {
            let offset = offset as usize;
            let line = match original_line_starts.binary_search(&offset) {
                Ok(i) => i,
                Err(i) => i - 1,
            };
            let col = offset - original_line_starts[line];
            (line as i64, col as i64)
        };

        let mut first_segment_on_line = true;

        // Emit a mapping segment.
        let emit_segment = |mappings: &mut String,
                            gen_col: i64,
                            generated_column: &mut i64,
                            source_idx: i64,
                            orig_line: i64,
                            original_line: &mut i64,
                            orig_col: i64,
                            original_column: &mut i64,
                            first_segment_on_line: &mut bool| {
            if !*first_segment_on_line {
                mappings.push(',');
            }
            *first_segment_on_line = false;

            // Field 1: generated column (relative)
            mappings.push_str(&vlq_encode(gen_col - *generated_column));
            *generated_column = gen_col;
            // Field 2: source index (relative)
            mappings.push_str(&vlq_encode(source_idx));
            // Field 3: original line (relative)
            mappings.push_str(&vlq_encode(orig_line - *original_line));
            *original_line = orig_line;
            // Field 4: original column (relative)
            mappings.push_str(&vlq_encode(orig_col - *original_column));
            *original_column = orig_col;
        };

        // Process the intro (generated content with no source mapping).
        let intro_lines: Vec<&str> = self.intro.split('\n').collect();
        for (i, _) in intro_lines.iter().enumerate() {
            if i > 0 {
                mappings.push(';');
                _generated_line += 1;
                generated_column = 0;
                first_segment_on_line = true;
            }
        }
        // Advance generated column for the last intro line fragment.
        if let Some(last) = intro_lines.last() {
            generated_column += count_chars(last) as i64;
        }

        // Walk chunks.
        let mut cur = Some(self.first_chunk);
        while let Some(ci) = cur {
            let chunk = &self.chunks[ci];

            // Process chunk intro.
            if !chunk.intro.is_empty() {
                let parts: Vec<&str> = chunk.intro.split('\n').collect();
                for (i, part) in parts.iter().enumerate() {
                    if i > 0 {
                        mappings.push(';');
                        _generated_line += 1;
                        generated_column = 0;
                        first_segment_on_line = true;
                    }
                    generated_column += count_chars(part) as i64;
                }
            }

            // Process chunk content.
            if !chunk.content.is_empty() {
                if !chunk.edited {
                    // Unedited: emit one segment per character ("hires"
                    // mode). Per-line-only mapping forces consumers to
                    // interpolate, which breaks at edited-chunk
                    // boundaries; per-character segments let
                    // `lookup_token` return the exact original column
                    // for any generated position inside an unedited
                    // region.
                    let (src_line, src_col) = orig_loc(chunk.start);
                    let mut cur_src_line = src_line;
                    let mut cur_src_col = src_col;

                    // Emit a segment at the start of this chunk.
                    emit_segment(
                        &mut mappings,
                        generated_column,
                        &mut generated_column,
                        0,
                        cur_src_line,
                        &mut original_line,
                        cur_src_col,
                        &mut original_column,
                        &mut first_segment_on_line,
                    );

                    // Walk character-by-character, emitting one segment
                    // per character anchored to its original position.
                    for ch in chunk.content.chars() {
                        if ch == '\n' {
                            mappings.push(';');
                            _generated_line += 1;
                            generated_column = 0;
                            first_segment_on_line = true;
                            cur_src_line += 1;
                            cur_src_col = 0;

                            // Emit mapping at start of new line.
                            emit_segment(
                                &mut mappings,
                                generated_column,
                                &mut generated_column,
                                0,
                                cur_src_line,
                                &mut original_line,
                                cur_src_col,
                                &mut original_column,
                                &mut first_segment_on_line,
                            );
                        } else {
                            generated_column += 1;
                            cur_src_col += 1;
                            emit_segment(
                                &mut mappings,
                                generated_column,
                                &mut generated_column,
                                0,
                                cur_src_line,
                                &mut original_line,
                                cur_src_col,
                                &mut original_column,
                                &mut first_segment_on_line,
                            );
                        }
                    }
                } else {
                    // Edited chunk: map the start of the replacement to the original position.
                    let (src_line, src_col) = orig_loc(chunk.start);

                    emit_segment(
                        &mut mappings,
                        generated_column,
                        &mut generated_column,
                        0,
                        src_line,
                        &mut original_line,
                        src_col,
                        &mut original_column,
                        &mut first_segment_on_line,
                    );

                    // Advance through the replacement content.
                    for ch in chunk.content.chars() {
                        if ch == '\n' {
                            mappings.push(';');
                            _generated_line += 1;
                            generated_column = 0;
                            first_segment_on_line = true;
                        } else {
                            generated_column += 1;
                        }
                    }
                }
            }

            // Process chunk outro.
            if !chunk.outro.is_empty() {
                let parts: Vec<&str> = chunk.outro.split('\n').collect();
                for (i, part) in parts.iter().enumerate() {
                    if i > 0 {
                        mappings.push(';');
                        _generated_line += 1;
                        generated_column = 0;
                        first_segment_on_line = true;
                    }
                    generated_column += count_chars(part) as i64;
                }
            }

            cur = chunk.next;
        }

        // Process the outro.
        if !self.outro.is_empty() {
            let parts: Vec<&str> = self.outro.split('\n').collect();
            for (i, _) in parts.iter().enumerate() {
                if i > 0 {
                    mappings.push(';');
                }
            }
        }

        mappings
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

/// Count the number of characters (not bytes) in a string.
fn count_chars(s: &str) -> usize {
    s.chars().count()
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

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
        assert_eq!(vlq_encode(0), "A");
        assert_eq!(vlq_encode(1), "C");
        assert_eq!(vlq_encode(-1), "D");
        assert_eq!(vlq_encode(5), "K");
        assert_eq!(vlq_encode(16), "gB");
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
}
