//! Composition of a chain of preprocessor source maps into a single map.
//!
//! Port of `combine_sourcemaps` in `utils/mapped_code.js`, which delegates to
//! `@jridgewell/remapping`. The maps arrive newest-first, and each one maps its
//! own output back to the *previous* stage's output; composing them walks every
//! segment of the newest map down the chain until it reaches an original file.

use super::types::SimpleDecodedMap;

/// A node of the source-map tree: either an original file (a leaf) or a
/// transformation whose sources are themselves nodes.
enum Node {
    Original(String),
    Mapped {
        map: SimpleDecodedMap,
        sources: Vec<Node>,
    },
}

/// A position traced down to a leaf. An empty `source` is the sourceless
/// mapping, which records only the generated column.
struct Traced {
    source: String,
    line: i64,
    column: i64,
    name: String,
}

impl Traced {
    fn sourceless() -> Self {
        Traced {
            source: String::new(),
            line: -1,
            column: -1,
            name: String::new(),
        }
    }
}

const NO_NAME: i64 = -1;

/// Combine multiple source maps into one.
///
/// `sourcemap_list` is ordered newest-first: index 0 is the map produced by the
/// last preprocessor to run, and the final entry maps back to the original file.
///
/// Corresponds to `combine_sourcemaps` in mapped_code.js.
pub(super) fn combine_sourcemaps(
    filename: &str,
    sourcemap_list: &[SimpleDecodedMap],
) -> Option<SimpleDecodedMap> {
    let (last, leading) = sourcemap_list.split_last()?;

    // The array interface requires every map but the oldest to have exactly one
    // source; otherwise the chain has to be walked through the loader interface,
    // which matches a source against the input filename instead.
    let tree = if leading.iter().all(|m| m.sources.len() == 1) {
        let mut tree = Node::Mapped {
            map: last.clone(),
            sources: last.sources.iter().cloned().map(Node::Original).collect(),
        };
        for map in leading.iter().rev() {
            tree = Node::Mapped {
                map: map.clone(),
                sources: vec![tree],
            };
        }
        tree
    } else {
        let mut next = 1;
        build_with_loader(&sourcemap_list[0], sourcemap_list, &mut next, filename)
    };

    let mut combined = trace_mappings(&tree);
    if combined.sources.is_empty() {
        combined.sources = vec![filename.to_string()];
    }
    Some(combined)
}

/// Build the tree by treating a source equal to the input filename as the output
/// of the next map in the chain.
fn build_with_loader(
    map: &SimpleDecodedMap,
    sourcemap_list: &[SimpleDecodedMap],
    next: &mut usize,
    filename: &str,
) -> Node {
    let sources = map
        .sources
        .iter()
        .map(|source| {
            if source == filename && *next < sourcemap_list.len() {
                let child = &sourcemap_list[*next];
                *next += 1;
                build_with_loader(child, sourcemap_list, next, filename)
            } else {
                Node::Original(source.clone())
            }
        })
        .collect();

    Node::Mapped {
        map: map.clone(),
        sources,
    }
}

/// Walk every segment of the root map down to a leaf and rebuild a map from the
/// traced positions.
///
/// Corresponds to `traceMappings` in remapping.
fn trace_mappings(tree: &Node) -> SimpleDecodedMap {
    let Node::Mapped { map, sources } = tree else {
        return SimpleDecodedMap::default();
    };

    let mut out = GenMapping {
        file: map.file.clone().filter(|f| !f.is_empty()),
        ..GenMapping::default()
    };

    for (generated_line, segments) in map.mappings.iter().enumerate() {
        for segment in segments {
            let Some(&generated_column) = segment.first() else {
                continue;
            };
            let traced = if segment.len() == 1 {
                Traced::sourceless()
            } else if segment.len() >= 4 {
                let name = if segment.len() >= 5 {
                    name_at(&map.names, segment[4])
                } else {
                    String::new()
                };
                let Some(source) = node_at(sources, segment[1]) else {
                    continue;
                };
                match original_position_for(source, segment[2], segment[3], name) {
                    Some(traced) => traced,
                    None => continue,
                }
            } else {
                continue;
            };
            out.maybe_add_segment(generated_line, generated_column, &traced);
        }
    }

    out.into_map()
}

/// Resolve a position in `node`'s output to a position in an original file.
///
/// Corresponds to `originalPositionFor` in remapping.
fn original_position_for(node: &Node, line: i64, column: i64, name: String) -> Option<Traced> {
    let (map, sources) = match node {
        Node::Original(source) => {
            return Some(Traced {
                source: source.clone(),
                line,
                column,
                name,
            });
        }
        Node::Mapped { map, sources } => (map, sources),
    };

    let segment = trace_segment(map, line, column)?;
    if segment.len() == 1 {
        return Some(Traced::sourceless());
    }
    if segment.len() < 4 {
        return None;
    }
    let name = if segment.len() >= 5 {
        name_at(&map.names, segment[4])
    } else {
        name
    };
    original_position_for(node_at(sources, segment[1])?, segment[2], segment[3], name)
}

fn node_at(sources: &[Node], index: i64) -> Option<&Node> {
    usize::try_from(index).ok().and_then(|i| sources.get(i))
}

fn name_at(names: &[String], index: i64) -> String {
    usize::try_from(index)
        .ok()
        .and_then(|i| names.get(i))
        .cloned()
        .unwrap_or_default()
}

/// Find the segment covering `column` on `line`: the last segment whose
/// generated column is at most `column`, resolved to the first of a run of
/// equal columns.
///
/// Corresponds to `traceSegment` (greatest-lower-bound bias) in trace-mapping.
fn trace_segment(map: &SimpleDecodedMap, line: i64, column: i64) -> Option<&Vec<i64>> {
    let segments = usize::try_from(line)
        .ok()
        .and_then(|l| map.mappings.get(l))?;

    let mut index = segments
        .iter()
        .rposition(|segment| segment.first().is_some_and(|&col| col <= column))?;
    let found = segments[index].first() == Some(&column);
    if found {
        while index > 0 && segments[index - 1].first() == Some(&column) {
            index -= 1;
        }
    }
    segments.get(index)
}

/// The map being built, with its source and name tables interned on first use.
///
/// Corresponds to `GenMapping` in out-mapping.
#[derive(Default)]
struct GenMapping {
    file: Option<String>,
    sources: Vec<String>,
    names: Vec<String>,
    mappings: Vec<Vec<Vec<i64>>>,
}

impl GenMapping {
    fn maybe_add_segment(&mut self, generated_line: usize, generated_column: i64, traced: &Traced) {
        while self.mappings.len() <= generated_line {
            self.mappings.push(Vec::new());
        }

        if traced.source.is_empty() {
            let line = &mut self.mappings[generated_line];
            let index = column_index(line, generated_column);
            if index == 0 || line[index - 1].len() == 1 {
                return;
            }
            line.insert(index, vec![generated_column]);
            return;
        }

        let source_index = intern(&mut self.sources, &traced.source);
        let name_index = if traced.name.is_empty() {
            NO_NAME
        } else {
            intern(&mut self.names, &traced.name)
        };

        let line = &mut self.mappings[generated_line];
        let index = column_index(line, generated_column);
        if index > 0 {
            let previous = &line[index - 1];
            let previous_name = if previous.len() >= 5 {
                previous[4]
            } else {
                NO_NAME
            };
            if previous.len() >= 4
                && previous[1] == source_index
                && previous[2] == traced.line
                && previous[3] == traced.column
                && previous_name == name_index
            {
                return;
            }
        }

        let mut segment = vec![generated_column, source_index, traced.line, traced.column];
        if name_index != NO_NAME {
            segment.push(name_index);
        }
        line.insert(index, segment);
    }

    fn into_map(self) -> SimpleDecodedMap {
        SimpleDecodedMap {
            version: Some(3),
            file: self.file,
            sources: self.sources,
            sources_content: None,
            names: self.names,
            mappings: self.mappings,
            source_root: None,
        }
    }
}

/// Where a segment for `generated_column` belongs in an ordered line.
fn column_index(line: &[Vec<i64>], generated_column: i64) -> usize {
    let mut index = line.len();
    for i in (0..line.len()).rev() {
        if line[i].first().is_some_and(|&col| generated_column >= col) {
            break;
        }
        index = i;
    }
    index
}

fn intern(table: &mut Vec<String>, value: &str) -> i64 {
    match table.iter().position(|v| v == value) {
        Some(index) => index as i64,
        None => {
            table.push(value.to_string());
            (table.len() - 1) as i64
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn map(sources: &[&str], mappings: Vec<Vec<Vec<i64>>>) -> SimpleDecodedMap {
        SimpleDecodedMap {
            sources: sources.iter().map(|s| s.to_string()).collect(),
            mappings,
            ..SimpleDecodedMap::default()
        }
    }

    #[test]
    fn a_single_map_is_reproduced() {
        let only = map(&["a.svelte"], vec![vec![vec![0, 0, 3, 7]]]);
        let combined = combine_sourcemaps("a.svelte", &[only]).unwrap();
        assert_eq!(combined.sources, vec!["a.svelte".to_string()]);
        assert_eq!(combined.mappings, vec![vec![vec![0, 0, 3, 7]]]);
    }

    #[test]
    fn two_maps_resolve_to_the_original_source() {
        // Stage 2 maps its line 0 back to line 1 of stage 1's output, which
        // stage 1 in turn maps back to line 5 of the original file. Composing
        // must land on line 5, not line 1.
        let newest = map(&["a.svelte"], vec![vec![vec![0, 0, 1, 0]]]);
        let oldest = map(
            &["a.svelte"],
            vec![vec![vec![0, 0, 0, 0]], vec![vec![0, 0, 5, 2]]],
        );
        let combined = combine_sourcemaps("a.svelte", &[newest, oldest]).unwrap();
        assert_eq!(combined.mappings, vec![vec![vec![0, 0, 5, 2]]]);
    }

    #[test]
    fn a_column_between_segments_uses_the_greatest_lower_bound() {
        let newest = map(&["a.svelte"], vec![vec![vec![0, 0, 0, 7]]]);
        let oldest = map(
            &["a.svelte"],
            vec![vec![vec![0, 0, 0, 0], vec![4, 0, 9, 9], vec![10, 0, 0, 10]]],
        );
        let combined = combine_sourcemaps("a.svelte", &[newest, oldest]).unwrap();
        assert_eq!(combined.mappings, vec![vec![vec![0, 0, 9, 9]]]);
    }

    #[test]
    fn an_untraceable_segment_is_dropped() {
        // Nothing on line 3 of the older map, so the newer map's only segment
        // has no original position and must not appear in the result.
        let newest = map(&["a.svelte"], vec![vec![vec![0, 0, 3, 0]]]);
        let oldest = map(&["a.svelte"], vec![vec![vec![0, 0, 0, 0]]]);
        let combined = combine_sourcemaps("a.svelte", &[newest, oldest]).unwrap();
        assert!(combined.mappings.is_empty());
    }

    #[test]
    fn redundant_segments_are_collapsed() {
        let newest = map(
            &["a.svelte"],
            vec![vec![vec![0, 0, 0, 0], vec![3, 0, 0, 0], vec![6, 0, 0, 1]]],
        );
        let oldest = map(
            &["a.svelte"],
            vec![vec![vec![0, 0, 4, 4], vec![1, 0, 4, 5]]],
        );
        let combined = combine_sourcemaps("a.svelte", &[newest, oldest]).unwrap();
        assert_eq!(
            combined.mappings,
            vec![vec![vec![0, 0, 4, 4], vec![6, 0, 4, 5]]]
        );
    }

    #[test]
    fn a_multi_source_leading_map_uses_the_loader_interface() {
        // The newest map has two sources, so the chain is matched by filename.
        let newest = map(
            &["a.svelte", "helper.js"],
            vec![vec![vec![0, 0, 1, 0], vec![5, 1, 2, 2]]],
        );
        let oldest = map(&["a.svelte"], vec![vec![], vec![vec![0, 0, 8, 3]]]);
        let combined = combine_sourcemaps("a.svelte", &[newest, oldest]).unwrap();
        assert_eq!(combined.sources, vec!["a.svelte", "helper.js"]);
        assert_eq!(
            combined.mappings,
            vec![vec![vec![0, 0, 8, 3], vec![5, 1, 2, 2]]]
        );
    }

    #[test]
    fn an_empty_result_falls_back_to_the_filename() {
        let only = map(&[], vec![vec![]]);
        let combined = combine_sourcemaps("a.svelte", &[only]).unwrap();
        assert_eq!(combined.sources, vec!["a.svelte".to_string()]);
    }
}
