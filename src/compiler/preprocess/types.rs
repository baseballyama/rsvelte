//! Type definitions for Svelte preprocessing.
//!
//! Corresponds to the TypeScript definitions in `public.d.ts` and `private.d.ts`.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// The result of a preprocessor run.
///
/// If the preprocessor does not return a result, it is assumed that the code is unchanged.
///
/// Corresponds to `Processed` interface in public.d.ts.
#[derive(Debug, Clone, Default)]
pub struct Processed {
    /// The new code.
    pub code: String,
    /// A source map mapping back to the original code.
    pub map: Option<SourceMapInput>,
    /// A list of additional files to watch for changes.
    pub dependencies: Vec<String>,
    /// Only for script/style preprocessors: The updated attributes to set on the tag.
    /// If None, attributes stay unchanged.
    pub attributes: Option<HashMap<String, AttributeValue>>,
}

/// Attribute values can be boolean (for valueless attributes) or strings.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum AttributeValue {
    /// Boolean attribute (e.g., `<script defer>`)
    Boolean(bool),
    /// String attribute value (e.g., `lang="ts"`)
    String(String),
}

impl From<bool> for AttributeValue {
    fn from(b: bool) -> Self {
        AttributeValue::Boolean(b)
    }
}

impl From<String> for AttributeValue {
    fn from(s: String) -> Self {
        AttributeValue::String(s)
    }
}

impl From<&str> for AttributeValue {
    fn from(s: &str) -> Self {
        AttributeValue::String(s.to_string())
    }
}

/// Source map input - can be either a JSON string or a decoded map.
#[derive(Debug, Clone)]
pub enum SourceMapInput {
    /// JSON string representation of a source map
    Json(String),
    /// Decoded source map
    Decoded(SimpleDecodedMap),
}

/// Location in source code.
///
/// Corresponds to `Location` from locate-character.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Location {
    /// Line number (0-indexed)
    pub line: usize,
    /// Column number (0-indexed)
    pub column: usize,
}

/// A markup preprocessor that takes a string of code and returns a processed version.
///
/// Corresponds to `MarkupPreprocessor` in public.d.ts.
pub type MarkupPreprocessorFn =
    Box<dyn Fn(MarkupPreprocessorOptions) -> PreprocessorResult + Send + Sync>;

/// Options passed to markup preprocessors.
#[derive(Debug, Clone)]
pub struct MarkupPreprocessorOptions {
    /// The whole Svelte file content
    pub content: String,
    /// The filename of the Svelte file
    pub filename: Option<String>,
}

/// A script/style preprocessor that takes a string of code and returns a processed version.
///
/// Corresponds to `Preprocessor` in public.d.ts.
pub type PreprocessorFn = Box<dyn Fn(PreprocessorOptions) -> PreprocessorResult + Send + Sync>;

/// Options passed to script/style preprocessors.
#[derive(Debug, Clone)]
pub struct PreprocessorOptions {
    /// The script/style tag content
    pub content: String,
    /// The attributes on the script/style tag
    pub attributes: HashMap<String, AttributeValue>,
    /// The whole Svelte file content
    pub markup: String,
    /// The filename of the Svelte file
    pub filename: Option<String>,
}

/// Result type for preprocessors (async).
pub type PreprocessorResult = std::pin::Pin<
    Box<dyn std::future::Future<Output = Result<Option<Processed>, PreprocessError>> + Send>,
>;

/// A preprocessor group is a set of preprocessors that are applied to a Svelte file.
///
/// Corresponds to `PreprocessorGroup` in public.d.ts.
#[derive(Default)]
pub struct PreprocessorGroup {
    /// Name of the preprocessor. Will be a required option in the next major version
    pub name: Option<String>,
    /// Markup preprocessor
    pub markup: Option<MarkupPreprocessorFn>,
    /// Style preprocessor
    pub style: Option<PreprocessorFn>,
    /// Script preprocessor
    pub script: Option<PreprocessorFn>,
}

/// Source object used internally during preprocessing.
///
/// Corresponds to `Source` interface in private.d.ts.
#[derive(Clone)]
pub struct Source {
    /// The source code
    pub source: String,
    /// Function to get location from character index
    pub get_location: std::sync::Arc<dyn Fn(usize) -> Location + Send + Sync>,
    /// Last part of the filename, as used for `sources` in sourcemaps
    pub file_basename: String,
    /// The filename passed as-is to preprocess
    pub filename: Option<String>,
}

/// Simplified decoded source map structure.
///
/// This matches the JavaScript DecodedSourceMap format.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SimpleDecodedMap {
    pub version: Option<u32>,
    pub file: Option<String>,
    pub sources: Vec<String>,
    pub sources_content: Option<Vec<Option<String>>>,
    pub names: Vec<String>,
    pub mappings: Vec<Vec<Vec<i64>>>,
    pub source_root: Option<String>,
}

impl Default for SimpleDecodedMap {
    fn default() -> Self {
        SimpleDecodedMap {
            version: Some(3),
            file: None,
            sources: vec![],
            sources_content: None,
            names: vec![],
            mappings: vec![],
            source_root: None,
        }
    }
}

/// Source update used during preprocessing.
///
/// Corresponds to `SourceUpdate` interface in private.d.ts.
#[derive(Default)]
pub struct SourceUpdate {
    /// Updated source code
    pub string: Option<String>,
    /// Updated source map
    pub map: Option<SimpleDecodedMap>,
    /// Additional dependencies
    pub dependencies: Option<Vec<String>>,
}

/// Replacement operation for code transformation.
///
/// Corresponds to `Replacement` interface in private.d.ts.
pub struct Replacement {
    /// Offset in the source where replacement starts
    pub offset: usize,
    /// Length of content to replace
    pub length: usize,
    /// Replacement code with source map
    pub replacement: MappedCode,
}

/// Code with associated source map.
///
/// Simplified version of the JavaScript `MappedCode` class.
#[derive(Debug, Clone)]
pub struct MappedCode {
    /// The code string
    pub string: String,
    /// Associated source map
    pub map: SimpleDecodedMap,
}

/// Error type for preprocessing operations.
#[derive(Debug, thiserror::Error)]
pub enum PreprocessError {
    #[error("Regex error: {0}")]
    Regex(#[from] regex::Error),
    #[error("Source map error: {0}")]
    SourceMap(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Preprocessor error: {0}")]
    Other(String),
}

impl MappedCode {
    /// Create a new empty MappedCode.
    pub fn new() -> Self {
        MappedCode {
            string: String::new(),
            map: SimpleDecodedMap::default(),
        }
    }

    /// Create a MappedCode with the given string and optional map.
    pub fn with_map(string: String, map: Option<SimpleDecodedMap>) -> Self {
        if let Some(map) = map {
            MappedCode { string, map }
        } else {
            let line_count = string.split('\n').count();
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
}

impl Default for MappedCode {
    fn default() -> Self {
        Self::new()
    }
}
