//! Code replacement utilities with source map tracking.
//!
//! Corresponds to `replace_in_code.js` from the official Svelte compiler.

use std::future::Future;
use std::sync::LazyLock;

use regex::Regex;

#[allow(unused_imports)]
use super::types::{Location, MappedCode, PreprocessError, Replacement, SimpleDecodedMap, Source};

// Cached regex for tokenizing lines (for source map generation)
static REGEX_LINE_TOKEN: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"([^\w\s]|\s+)").unwrap());

/// Create a slice of a Source at a given offset.
///
/// This adjusts the location function to account for the offset.
///
/// Corresponds to `slice_source` in replace_in_code.js.
pub fn slice_source(code_slice: String, offset: usize, source: &Source) -> Source {
    let get_location = source.get_location.clone();
    Source {
        source: code_slice,
        get_location: std::sync::Arc::new(move |index| get_location(index + offset)),
        file_basename: source.file_basename.clone(),
        filename: source.filename.clone(),
    }
}

/// Calculate replacements by applying a regex and async replacement function.
///
/// Corresponds to `calculate_replacements` in replace_in_code.js.
async fn calculate_replacements<F, Fut>(
    re: &Regex,
    get_replacement: F,
    source: &str,
) -> Result<Vec<Replacement>, PreprocessError>
where
    F: Fn(Vec<String>, usize) -> Fut,
    Fut: Future<Output = Result<MappedCode, PreprocessError>>,
{
    let mut replacements = Vec::new();
    let mut futures = Vec::new();

    // Collect all matches and their positions
    for captures in re.captures_iter(source) {
        let full_match = captures.get(0).unwrap();
        let matched_string = full_match.as_str().to_string();
        let offset = full_match.start();

        // Collect all capture groups
        let mut match_groups = vec![matched_string.clone()];
        for i in 1..captures.len() {
            if let Some(m) = captures.get(i) {
                match_groups.push(m.as_str().to_string());
            } else {
                match_groups.push(String::new());
            }
        }

        // Create the future for this replacement
        let future = get_replacement(match_groups.clone(), offset);
        futures.push((future, matched_string.len(), offset));
    }

    // Wait for all replacement futures to complete
    for (future, length, offset) in futures {
        let replacement = future.await?;
        replacements.push(Replacement {
            offset,
            length,
            replacement,
        });
    }

    Ok(replacements)
}

/// Perform replacements on the source code, building a MappedCode result.
///
/// Corresponds to `perform_replacements` in replace_in_code.js.
fn perform_replacements(replacements: Vec<Replacement>, source: &Source) -> MappedCode {
    let mut out = MappedCode::new();
    let mut last_end = 0;

    for Replacement {
        offset,
        length,
        replacement,
    } in replacements
    {
        // Add unchanged prefix
        if offset > last_end {
            let unchanged_prefix = source.source[last_end..offset].to_string();
            let prefix_source = slice_source(unchanged_prefix.clone(), last_end, source);
            let prefix_code = MappedCode::from_source(&prefix_source);
            out = out.concat(prefix_code);
        }

        // Add replacement
        out = out.concat(replacement);
        last_end = offset + length;
    }

    // Add unchanged suffix
    if last_end < source.source.len() {
        let unchanged_suffix = source.source[last_end..].to_string();
        let suffix_source = slice_source(unchanged_suffix.clone(), last_end, source);
        let suffix_code = MappedCode::from_source(&suffix_source);
        out = out.concat(suffix_code);
    }

    out
}

/// Replace matches in code using async replacement function.
///
/// This is the main entry point for code replacement with source map tracking.
///
/// Corresponds to `replace_in_code` in replace_in_code.js.
pub async fn replace_in_code<F, Fut>(
    regex: &Regex,
    get_replacement: F,
    location: &Source,
) -> Result<MappedCode, PreprocessError>
where
    F: Fn(Vec<String>, usize) -> Fut,
    Fut: Future<Output = Result<MappedCode, PreprocessError>>,
{
    let replacements = calculate_replacements(regex, get_replacement, &location.source).await?;
    Ok(perform_replacements(replacements, location))
}

impl MappedCode {
    /// Create a MappedCode from a Source with identity mapping.
    ///
    /// Corresponds to `MappedCode.from_source` in mapped_code.js.
    pub fn from_source(source: &Source) -> Self {
        let offset = (source.get_location)(0);

        let mut map = SimpleDecodedMap {
            version: Some(3),
            file: None,
            sources: vec![source.file_basename.clone()],
            sources_content: None,
            names: vec![],
            mappings: vec![],
            source_root: None,
        };

        if source.source.is_empty() {
            return MappedCode {
                string: source.source.clone(),
                map,
            };
        }

        // Create high-resolution identity map
        // Split on token boundaries for better resolution
        let line_list: Vec<&str> = source.source.split('\n').collect();

        for (line_idx, line) in line_list.iter().enumerate() {
            let mut line_mappings = vec![];
            let mut column = 0u32;

            // Split line into tokens
            let mut last_end = 0;
            for token_match in REGEX_LINE_TOKEN.find_iter(line) {
                // Add token before this match
                if token_match.start() > last_end {
                    let token_len = (token_match.start() - last_end) as u32;
                    if token_len > 0 {
                        line_mappings.push(vec![
                            column as i64,
                            0,
                            (offset.line + line_idx) as i64,
                            column as i64,
                        ]);
                        column += token_len;
                    }
                }

                // Add the matched token
                let token_len = token_match.as_str().len() as u32;
                if token_len > 0 {
                    line_mappings.push(vec![
                        column as i64,
                        0,
                        (offset.line + line_idx) as i64,
                        column as i64,
                    ]);
                    column += token_len;
                }
                last_end = token_match.end();
            }

            // Add remaining part of line
            if last_end < line.len() {
                let token_len = (line.len() - last_end) as u32;
                if token_len > 0 {
                    line_mappings.push(vec![
                        column as i64,
                        0,
                        (offset.line + line_idx) as i64,
                        column as i64,
                    ]);
                }
            }

            map.mappings.push(line_mappings);
        }

        // Shift columns in first line
        if !map.mappings.is_empty() && !map.mappings[0].is_empty() {
            for segment in &mut map.mappings[0] {
                if segment.len() >= 4 {
                    segment[3] += offset.column as i64;
                }
            }
        }

        MappedCode {
            string: source.source.clone(),
            map,
        }
    }

    /// Concatenate two MappedCode instances.
    ///
    /// This mutates `self` and returns it for chaining.
    ///
    /// Corresponds to `MappedCode.concat` in mapped_code.js.
    pub fn concat(mut self, other: MappedCode) -> Self {
        // noop: if one is empty, return the other
        if other.string.is_empty() {
            return self;
        }
        if self.string.is_empty() {
            return other;
        }

        // Compute last line length before mutating
        let column_offset = last_line_length(&self.string);
        self.string.push_str(&other.string);

        let m2 = other.map;
        if m2.mappings.is_empty() {
            return self;
        }

        // Combine sources and names
        let (sources, new_source_idx, sources_changed) =
            merge_tables(&self.map.sources, &m2.sources);
        let (names, new_name_idx, names_changed) = merge_tables(&self.map.names, &m2.names);

        if sources_changed {
            self.map.sources = sources;
        }
        if names_changed {
            self.map.names = names;
        }

        // Update source/name indices in m2's mappings. Bounds-check the lookup
        // tables: a malformed input map can carry a source/name index that is
        // out of range for its declared `sources` / `names` arrays, which would
        // otherwise panic the whole compile (H-142). Leave such a segment's index
        // unchanged rather than crashing.
        let mut m2_mappings = m2.mappings;
        for line in &mut m2_mappings {
            for segment in line {
                if segment.len() >= 2
                    && segment[1] >= 0
                    && let Some(&mapped) = new_source_idx.get(segment[1] as usize)
                {
                    segment[1] = mapped as i64;
                }
                if segment.len() >= 5
                    && segment[4] >= 0
                    && let Some(&mapped) = new_name_idx.get(segment[4] as usize)
                {
                    segment[4] = mapped as i64;
                }
            }
        }

        // Shift columns in first line of m2
        if !m2_mappings.is_empty() && column_offset > 0 {
            for segment in &mut m2_mappings[0] {
                segment[0] += column_offset as i64;
            }
        }

        // Combine last line of m1 with first line of m2
        if !self.map.mappings.is_empty() && !m2_mappings.is_empty() {
            let first_line = m2_mappings.remove(0);
            self.map.mappings.last_mut().unwrap().extend(first_line);
        }

        // Append remaining lines
        self.map.mappings.extend(m2_mappings);

        self
    }

    /// Create a MappedCode from processed code and optional source map.
    ///
    /// Corresponds to `MappedCode.from_processed` in mapped_code.js.
    pub fn from_processed(string: String, map: Option<SimpleDecodedMap>) -> Self {
        let line_count = string.split('\n').count();

        if let Some(mut map) = map {
            // Ensure that count of source map mappings lines
            // is equal to count of generated code lines
            let missing_lines = line_count.saturating_sub(map.mappings.len());
            for _ in 0..missing_lines {
                map.mappings.push(vec![]);
            }
            return MappedCode { string, map };
        }

        if string.is_empty() {
            return MappedCode::new();
        }

        let mut mappings = Vec::with_capacity(line_count);
        for _ in 0..line_count {
            mappings.push(vec![]);
        }

        MappedCode {
            string,
            map: SimpleDecodedMap {
                version: Some(3),
                file: None,
                sources: vec![],
                sources_content: None,
                names: vec![],
                mappings,
                source_root: None,
            },
        }
    }
}

/// Get the length of the last line in a string.
fn last_line_length(s: &str) -> usize {
    s.len() - s.rfind('\n').map(|i| i + 1).unwrap_or(0)
}

/// Merge two tables (sources or names arrays) and return the merged table,
/// index mapping, and whether values/indices changed.
///
/// Returns: (new_table, idx_map, changed)
fn merge_tables<T: Clone + Eq>(this_table: &[T], other_table: &[T]) -> (Vec<T>, Vec<usize>, bool) {
    let mut new_table = this_table.to_vec();
    let mut idx_map = Vec::with_capacity(other_table.len());
    let mut val_changed = false;

    for other_val in other_table {
        if let Some(this_idx) = this_table.iter().position(|v| v == other_val) {
            idx_map.push(this_idx);
        } else {
            let new_idx = new_table.len();
            new_table.push(other_val.clone());
            idx_map.push(new_idx);
            val_changed = true;
        }
    }

    (new_table, idx_map, val_changed)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    fn create_test_source(code: &str) -> Source {
        Source {
            source: code.to_string(),
            get_location: Arc::new(|_| Location { line: 0, column: 0 }),
            file_basename: "test.svelte".to_string(),
            filename: Some("test.svelte".to_string()),
        }
    }

    #[test]
    fn test_slice_source() {
        let source = create_test_source("hello world");
        let sliced = slice_source("world".to_string(), 6, &source);
        assert_eq!(sliced.source, "world");
        assert_eq!(sliced.file_basename, "test.svelte");
    }

    #[test]
    fn test_last_line_length() {
        assert_eq!(last_line_length("hello"), 5);
        assert_eq!(last_line_length("hello\nworld"), 5);
        assert_eq!(last_line_length("a\nb\nc"), 1);
    }

    #[test]
    fn test_merge_tables() {
        let t1 = vec!["a", "b", "c"];
        let t2 = vec!["b", "d"];
        let (merged, idx_map, changed) = merge_tables(&t1, &t2);

        assert_eq!(merged, vec!["a", "b", "c", "d"]);
        assert_eq!(idx_map, vec![1, 3]); // "b" maps to 1, "d" maps to 3
        assert!(changed);
    }

    fn mapped(string: &str, sources: Vec<String>, mappings: Vec<Vec<Vec<i64>>>) -> MappedCode {
        MappedCode {
            string: string.to_string(),
            map: SimpleDecodedMap {
                version: Some(3),
                file: None,
                sources,
                sources_content: None,
                names: vec![],
                mappings,
                source_root: None,
            },
        }
    }

    // H-142: an input map whose mapping segment carries a source/name index that
    // is out of range for its `sources`/`names` arrays must not panic `concat`.
    #[test]
    fn concat_does_not_panic_on_out_of_range_indices() {
        let m1 = mapped("a", vec!["a.svelte".into()], vec![vec![vec![0, 0, 0, 0]]]);
        // segment source index 5 and name index 9 are both out of range for the
        // single-entry sources / empty names of m2.
        let m2 = mapped(
            "b",
            vec!["b.svelte".into()],
            vec![vec![vec![0, 5, 0, 0, 9]]],
        );
        let combined = m1.concat(m2);
        // The out-of-range indices are left unchanged rather than crashing.
        assert!(!combined.map.mappings.is_empty());
    }
}
