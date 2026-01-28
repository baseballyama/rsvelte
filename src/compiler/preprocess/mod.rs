//! Svelte preprocessing functionality.
//!
//! The preprocess function provides convenient hooks for arbitrarily transforming
//! component source code. For example, it can be used to convert a `<style lang="sass">`
//! block into vanilla CSS.
//!
//! Corresponds to the implementation in `svelte/packages/svelte/src/compiler/preprocess/`.

pub mod decode_sourcemap;
pub mod replace_in_code;
pub mod types;

use crate::compiler::utils::{get_basename, get_locator};
use decode_sourcemap::decode_map;
use lazy_static::lazy_static;
use regex::Regex;
use replace_in_code::{replace_in_code, slice_source};
use rustc_hash::FxHashMap;
use types::*;

lazy_static! {
    /// Regex for matching style tags (including HTML comments).
    static ref REGEX_STYLE_TAGS: Regex = Regex::new(
        r#"(?s)<!--[\s\S]*?-->|<style((?:\s+[^=>'"/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/\s]+)*\s*)(?:/>|>([\S\s]*?)</style>)"#
    ).unwrap();

    /// Regex for matching script tags (including HTML comments).
    static ref REGEX_SCRIPT_TAGS: Regex = Regex::new(
        r#"(?s)<!--[\s\S]*?-->|<script((?:\s+[^=>'"/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/\s]+)*\s*)(?:/>|>([\S\s]*?)</script>)"#
    ).unwrap();

    /// Regex for parsing tag attributes.
    static ref ATTRIBUTE_PATTERN: Regex = Regex::new(
        r#"([\w\-$]+\b)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?"#
    ).unwrap();
}

/// Represents intermediate states of the preprocessing.
///
/// Implements the Source interface and tracks the transformation chain.
///
/// Corresponds to `PreprocessResult` class in index.js.
struct PreprocessResult {
    /// Current source code
    source: String,
    /// The filename passed as-is to preprocess
    filename: Option<String>,
    /// Sourcemap list in reverse order (last map first)
    /// https://github.com/jridgewell/sourcemaps/tree/main/packages/remapping#multiple-transformations-of-a-file
    sourcemap_list: Vec<SimpleDecodedMap>,
    /// List of file dependencies
    dependencies: Vec<String>,
    /// Last part of the filename, as used for `sources` in sourcemaps
    file_basename: String,
    /// Location lookup function
    get_location: std::sync::Arc<dyn Fn(usize) -> Location + Send + Sync>,
}

impl PreprocessResult {
    /// Create a new PreprocessResult.
    fn new(source: String, filename: Option<String>) -> Self {
        let get_location = get_locator(&source);
        let file_basename = filename
            .as_ref()
            .map(|f| get_basename(f))
            .unwrap_or_default();

        PreprocessResult {
            source: source.clone(),
            filename,
            sourcemap_list: vec![],
            dependencies: vec![],
            file_basename,
            get_location,
        }
    }

    /// Update the source with new content and optionally a source map.
    fn update_source(&mut self, update: SourceUpdate) {
        if let Some(string) = update.string {
            self.source = string.clone();
            self.get_location = get_locator(&string);
        }
        if let Some(map) = update.map {
            self.sourcemap_list.insert(0, map);
        }
        if let Some(mut deps) = update.dependencies {
            self.dependencies.append(&mut deps);
        }
    }

    /// Convert to final Processed result.
    fn into_processed(self) -> Processed {
        // Combine all the source maps for each preprocessor function into one
        let map = if self.sourcemap_list.is_empty() {
            None
        } else {
            combine_sourcemaps(&self.file_basename, &self.sourcemap_list)
                .map(SourceMapInput::Decoded)
        };

        // Deduplicate dependencies
        let mut unique_deps: Vec<String> = self.dependencies;
        unique_deps.sort();
        unique_deps.dedup();

        Processed {
            code: self.source,
            dependencies: unique_deps,
            map,
            attributes: None,
        }
    }

    /// Get a Source reference for this result.
    fn as_source(&self) -> Source {
        Source {
            source: self.source.clone(),
            get_location: self.get_location.clone(),
            file_basename: self.file_basename.clone(),
            filename: self.filename.clone(),
        }
    }
}

/// Convert preprocessor output for tag content into MappedCode.
///
/// Corresponds to `processed_content_to_code` in index.js.
fn processed_content_to_code(
    processed: &Processed,
    location: Location,
    file_basename: &str,
) -> MappedCode {
    let mut decoded_map = decode_map(processed);

    // Offset segments pointing at original component source
    if let Some(ref mut map) = decoded_map
        && let Some(source_index) = map.sources.iter().position(|s| s == file_basename)
    {
        sourcemap_add_offset(map, location, source_index);
    }

    MappedCode::from_processed(processed.code.clone(), decoded_map)
}

/// Given the whole tag including content, return a `MappedCode` representing
/// the tag content replaced with `processed`.
///
/// Corresponds to `processed_tag_to_code` in index.js.
fn processed_tag_to_code(
    processed: &Processed,
    tag_name: &str,
    original_attributes: &str,
    generated_attributes: &str,
    source: &Source,
) -> MappedCode {
    let file_basename = &source.file_basename;
    let get_location = &source.get_location;

    let build_mapped_code =
        |code: String, offset: usize| MappedCode::from_source(&slice_source(code, offset, source));

    // Build tag open/close strings
    let original_tag_open = format!("<{}{}>", tag_name, original_attributes);
    let tag_open = format!("<{}{}>", tag_name, generated_attributes);

    let tag_open_code = if original_tag_open != tag_open {
        // Generate a source map for the open tag
        let mut mappings = vec![vec![
            vec![0, 0, 0, 0],
            vec![
                format!("<{}", tag_name).len() as i64,
                0,
                0,
                format!("<{}", tag_name).len() as i64,
            ],
        ]];

        let line = tag_open.split('\n').count() - 1;
        let column = if line == 0 {
            tag_open.len()
        } else {
            tag_open.len() - tag_open.rfind('\n').unwrap() - 1
        };

        while mappings.len() <= line {
            mappings.push(vec![vec![0, 0, 0, format!("<{}", tag_name).len() as i64]]);
        }

        let original_line = original_tag_open.split('\n').count() - 1;
        let original_column = if original_line == 0 {
            original_tag_open.len()
        } else {
            original_tag_open.len() - original_tag_open.rfind('\n').unwrap() - 1
        };

        mappings[line].push(vec![
            column as i64,
            0,
            original_line as i64,
            original_column as i64,
        ]);

        let mut map = SimpleDecodedMap {
            version: Some(3),
            file: None,
            sources: vec![file_basename.clone()],
            sources_content: None,
            names: vec![],
            mappings,
            source_root: None,
        };

        sourcemap_add_offset(&mut map, get_location(0), 0);
        MappedCode::from_processed(tag_open, Some(map))
    } else {
        build_mapped_code(tag_open, 0)
    };

    let tag_close = format!("</{}>", tag_name);
    let tag_close_code =
        build_mapped_code(tag_close, original_tag_open.len() + source.source.len());

    // TODO: parse_attached_sourcemap equivalent if needed
    let content_code = processed_content_to_code(
        processed,
        get_location(original_tag_open.len()),
        file_basename,
    );

    tag_open_code.concat(content_code).concat(tag_close_code)
}

/// Parse tag attributes from a string.
///
/// Corresponds to `parse_tag_attributes` in index.js.
fn parse_tag_attributes(str: &str) -> FxHashMap<String, AttributeValue> {
    let mut attrs = FxHashMap::default();

    for cap in ATTRIBUTE_PATTERN.captures_iter(str) {
        let name = cap.get(1).map(|m| m.as_str()).unwrap_or("");
        let value = cap
            .get(2)
            .or_else(|| cap.get(3))
            .or_else(|| cap.get(4))
            .map(|m| m.as_str());

        if let Some(val) = value {
            if val.is_empty() {
                attrs.insert(name.to_string(), AttributeValue::Boolean(true));
            } else {
                attrs.insert(name.to_string(), AttributeValue::String(val.to_string()));
            }
        } else {
            attrs.insert(name.to_string(), AttributeValue::Boolean(true));
        }
    }

    attrs
}

/// Stringify tag attributes to a string.
///
/// Corresponds to `stringify_tag_attributes` in index.js.
fn stringify_tag_attributes(attributes: &Option<FxHashMap<String, AttributeValue>>) -> String {
    if let Some(attrs) = attributes {
        let value = attrs
            .iter()
            .map(|(key, value)| match value {
                AttributeValue::Boolean(true) => key.clone(),
                AttributeValue::Boolean(false) => format!("{}=\"false\"", key),
                AttributeValue::String(val) => format!("{}=\"{}\"", key, val),
            })
            .collect::<Vec<_>>()
            .join(" ");

        if value.is_empty() {
            String::new()
        } else {
            format!(" {}", value)
        }
    } else {
        String::new()
    }
}

/// Calculate the updates required to process all instances of the specified tag.
///
/// Corresponds to `process_tag` in index.js.
async fn process_tag(
    tag_name: &str,
    preprocessor: &PreprocessorFn,
    source: &Source,
) -> Result<SourceUpdate, PreprocessError> {
    let filename = source.filename.clone();
    let markup = source.source.clone();
    let tag_regex = if tag_name == "style" {
        &*REGEX_STYLE_TAGS
    } else {
        &*REGEX_SCRIPT_TAGS
    };

    let dependencies = std::sync::Arc::new(std::sync::Mutex::new(Vec::new()));
    let dependencies_for_closure = dependencies.clone();
    let source_clone = source.clone();

    let get_replacement = move |match_groups: Vec<String>, tag_offset: usize| {
        let preprocessor = preprocessor;
        let source = source_clone.clone();
        let filename = filename.clone();
        let markup = markup.clone();
        let tag_name = tag_name.to_string();
        let dependencies = dependencies_for_closure.clone();

        async move {
            let tag_with_content = match_groups.first().map(|s| s.as_str()).unwrap_or("");
            let attributes = match_groups.get(1).map(|s| s.as_str()).unwrap_or("");
            let content = match_groups.get(2).map(|s| s.as_str()).unwrap_or("");

            // No-op if no attributes and no content
            if attributes.is_empty() && content.is_empty() {
                return Ok(MappedCode::from_source(&slice_source(
                    tag_with_content.to_string(),
                    tag_offset,
                    &source,
                )));
            }

            let options = PreprocessorOptions {
                content: content.to_string(),
                attributes: parse_tag_attributes(attributes),
                markup: markup.clone(),
                filename: filename.clone(),
            };

            let processed_opt = preprocessor(options).await?;

            if let Some(processed) = processed_opt {
                if !processed.dependencies.is_empty()
                    && let Ok(mut deps) = dependencies.lock()
                {
                    deps.extend_from_slice(&processed.dependencies);
                }

                // Check if anything changed
                if processed.map.is_none() && processed.code == content {
                    return Ok(MappedCode::from_source(&slice_source(
                        tag_with_content.to_string(),
                        tag_offset,
                        &source,
                    )));
                }

                let generated_attributes = stringify_tag_attributes(&processed.attributes);
                let final_attributes = if generated_attributes.is_empty() {
                    attributes.to_string()
                } else {
                    generated_attributes
                };

                Ok(processed_tag_to_code(
                    &processed,
                    &tag_name,
                    attributes,
                    &final_attributes,
                    &slice_source(content.to_string(), tag_offset, &source),
                ))
            } else {
                Ok(MappedCode::from_source(&slice_source(
                    tag_with_content.to_string(),
                    tag_offset,
                    &source,
                )))
            }
        }
    };

    let mapped = replace_in_code(tag_regex, get_replacement, source).await?;

    let collected_dependencies = if let Ok(deps) = dependencies.lock() {
        deps.clone()
    } else {
        vec![]
    };

    Ok(SourceUpdate {
        string: Some(mapped.string),
        map: Some(mapped.map),
        dependencies: if collected_dependencies.is_empty() {
            None
        } else {
            Some(collected_dependencies)
        },
    })
}

/// Process markup with a markup preprocessor.
///
/// Corresponds to `process_markup` in index.js.
async fn process_markup(
    process: &MarkupPreprocessorFn,
    source: &Source,
) -> Result<SourceUpdate, PreprocessError> {
    let options = MarkupPreprocessorOptions {
        content: source.source.clone(),
        filename: source.filename.clone(),
    };

    let processed_opt = process(options).await?;

    if let Some(processed) = processed_opt {
        let map = if let Some(map_input) = processed.map {
            match map_input {
                SourceMapInput::Json(json) => serde_json::from_str(&json).ok(),
                SourceMapInput::Decoded(decoded) => Some(decoded),
            }
        } else {
            None
        };

        Ok(SourceUpdate {
            string: Some(processed.code),
            map,
            dependencies: if processed.dependencies.is_empty() {
                None
            } else {
                Some(processed.dependencies)
            },
        })
    } else {
        Ok(SourceUpdate::default())
    }
}

/// The preprocess function provides convenient hooks for arbitrarily transforming
/// component source code.
///
/// For example, it can be used to convert a `<style lang="sass">` block into vanilla CSS.
///
/// Corresponds to the default export `preprocess` function in index.js.
pub async fn preprocess(
    source: String,
    preprocessors: Vec<PreprocessorGroup>,
    filename: Option<String>,
) -> Result<Processed, PreprocessError> {
    let mut result = PreprocessResult::new(source, filename);

    for preprocessor in preprocessors {
        if let Some(markup) = preprocessor.markup {
            let update = process_markup(&markup, &result.as_source()).await?;
            result.update_source(update);
        }

        if let Some(script) = preprocessor.script {
            let update = process_tag("script", &script, &result.as_source()).await?;
            result.update_source(update);
        }

        if let Some(style) = preprocessor.style {
            let update = process_tag("style", &style, &result.as_source()).await?;
            result.update_source(update);
        }
    }

    Ok(result.into_processed())
}

/// Add offset to source map mappings.
///
/// Mutates the map in-place.
///
/// Corresponds to `sourcemap_add_offset` in mapped_code.js.
fn sourcemap_add_offset(map: &mut SimpleDecodedMap, offset: Location, source_index: usize) {
    if map.mappings.is_empty() {
        return;
    }

    for line in map.mappings.iter_mut() {
        for segment in line {
            if segment.len() >= 2 && segment[1] == source_index as i64 {
                // Shift column if it points at the first line
                if segment.len() >= 4 && segment[2] == 0 {
                    segment[3] += offset.column as i64;
                }
                // Shift line
                if segment.len() >= 3 {
                    segment[2] += offset.line as i64;
                }
            }
        }
    }
}

/// Combine multiple source maps into one.
///
/// Corresponds to `combine_sourcemaps` in mapped_code.js.
fn combine_sourcemaps(
    filename: &str,
    sourcemap_list: &[SimpleDecodedMap],
) -> Option<SimpleDecodedMap> {
    if sourcemap_list.is_empty() {
        return None;
    }

    // For simplicity, we'll use a basic implementation that takes the first map
    // A full implementation would use proper source map remapping
    // TODO: Implement full remapping logic similar to @jridgewell/remapping
    let mut combined = sourcemap_list[0].clone();

    // Ensure sources contains the filename
    if combined.sources.is_empty() {
        combined.sources = vec![filename.to_string()];
    }

    Some(combined)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_tag_attributes() {
        let attrs = parse_tag_attributes(r#" lang="ts" defer"#);
        assert_eq!(attrs.len(), 2);
        assert_eq!(
            attrs.get("lang"),
            Some(&AttributeValue::String("ts".to_string()))
        );
        assert_eq!(attrs.get("defer"), Some(&AttributeValue::Boolean(true)));
    }

    #[test]
    fn test_stringify_tag_attributes() {
        let mut attrs = FxHashMap::default();
        attrs.insert("lang".to_string(), AttributeValue::String("ts".to_string()));
        attrs.insert("defer".to_string(), AttributeValue::Boolean(true));

        let stringified = stringify_tag_attributes(&Some(attrs));
        assert!(stringified.contains("lang=\"ts\""));
        assert!(stringified.contains("defer"));
    }

    #[test]
    fn test_preprocess_result_creation() {
        let result = PreprocessResult::new("test".to_string(), Some("test.svelte".to_string()));
        assert_eq!(result.source, "test");
        assert_eq!(result.file_basename, "test.svelte");
    }
}
