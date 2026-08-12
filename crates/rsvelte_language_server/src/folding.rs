//! `textDocument/foldingRange`.
//!
//! A port of the official language server's `plugins/html/getFoldingRanges.ts`,
//! reading the Svelte AST instead of an HTML one: comments and blocks are
//! nodes there, so they need no separate scan, and `{#if}` / `{#each}` /
//! `{#await}` / `{#key}` / `{#snippet}` fold like elements do.
//!
//! `<script>` and `<style>` bodies fold by indentation, which is what upstream
//! does for them as well while its TypeScript and CSS services are the ones
//! reading the contents.

use lsp_types::{FoldingRange, FoldingRangeKind, Position};
use rsvelte_core::Allocator;
use rsvelte_core::ast::arena::ParseArena;
use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{Root, Script, TemplateNode};

use crate::context::body_of;
use crate::indent_folding::{LineRange, body_lines, indent_folding};
use crate::nodes::{Top, parse_root, top_level, view};
use crate::text::LineIndex;

#[must_use]
pub fn folding_ranges(text: &str, line_folding_only: bool) -> Vec<FoldingRange> {
    let index = LineIndex::new(text);
    let allocator = Allocator::default();
    let mut collector = Collector {
        text,
        index: &index,
        ranges: Vec::new(),
        stack: Vec::new(),
    };
    match parse_root(text, &allocator) {
        Some(root) => collector.walk(&root),
        // A document the parser cannot read at all still folds by indentation,
        // rather than losing every fold the editor already drew.
        None => collector.indented(&[]),
    }
    collector.finish(line_folding_only)
}

/// A range before the client's `lineFoldingOnly` capability is applied.
struct Raw {
    start: Position,
    end: Position,
    kind: Option<FoldingRangeKind>,
    /// Whether `end` is the line of a closing tag, which a line-folding client
    /// wants left visible.
    closing: bool,
}

/// What is open around the node being walked. Elements are tracked as well as
/// regions, because a `#endregion` inside one of them takes precedence over
/// the folds of everything it interrupts.
#[derive(PartialEq, Eq)]
enum Frame {
    Node(u32),
    Region(u32),
}

struct Collector<'a> {
    text: &'a str,
    index: &'a LineIndex,
    ranges: Vec<Raw>,
    stack: Vec<Frame>,
}

impl Collector<'_> {
    fn walk(&mut self, root: &Root<'_>) {
        for top in top_level(root) {
            match top {
                Top::Node(node) => self.node(node),
                Top::Script(script) => {
                    self.embedded(script.start, script.end);
                    self.imports(script, &root.arena);
                    self.fold(script.start, script.end, None, true);
                }
                Top::Style(style) => {
                    self.embedded(style.start, style.end);
                    self.fold(style.start, style.end, None, true);
                }
            }
        }
    }

    fn node(&mut self, node: &TemplateNode<'_>) {
        if let TemplateNode::Comment(comment) = node {
            self.comment(&comment.data, comment.start, comment.end);
            return;
        }
        let node = view(node);
        if !node.is_container() {
            return;
        }
        self.stack.push(Frame::Node(node.start));
        for fragment in node.fragments() {
            for child in &fragment.nodes {
                self.node(child);
            }
        }
        // Gone from the stack means a `#endregion` inside this node closed a
        // region that started outside it, and this fold would overlap it.
        if let Some(at) = self
            .stack
            .iter()
            .rposition(|open| *open == Frame::Node(node.start))
        {
            self.stack.truncate(at);
            self.fold(node.start, node.end, None, true);
        }
    }

    fn comment(&mut self, data: &str, start: u32, end: u32) {
        let data = data.trim_start();
        if word(data, "#region") {
            self.stack.push(Frame::Region(start));
            return;
        }
        if word(data, "#endregion") {
            if let Some(at) = self
                .stack
                .iter()
                .rposition(|open| matches!(open, Frame::Region(_)))
            {
                let Frame::Region(from) = self.stack[at] else {
                    return;
                };
                self.stack.truncate(at);
                self.fold(from, end, Some(FoldingRangeKind::Region), false);
            }
            return;
        }
        self.fold(start, end, Some(FoldingRangeKind::Comment), false);
    }

    /// The body of a `<script>` or `<style>`, folded by indentation.
    fn embedded(&mut self, start: u32, end: u32) {
        let Some(body) = body_of(self.text, start as usize, end as usize) else {
            return;
        };
        let Some(lines) = body_lines(self.index, self.text, body.start, body.end) else {
            return;
        };
        self.indented(&[lines]);
    }

    /// The leading run of `import` declarations of a script.
    fn imports(&mut self, script: &Script<'_>, arena: &ParseArena) {
        let Expression::Typed(program) = &script.content else {
            return;
        };
        let mut first = None;
        let mut last = None;
        for statement in arena.get_js_children(program.node.body_stmts()) {
            if statement.node_type() != Some("ImportDeclaration") {
                break;
            }
            let (Some(start), Some(end)) = (statement.start(), statement.end()) else {
                break;
            };
            first.get_or_insert(start);
            last = Some(end);
        }
        if let (Some(first), Some(last)) = (first, last) {
            self.fold(first, last, Some(FoldingRangeKind::Imports), false);
        }
    }

    fn indented(&mut self, ranges: &[LineRange]) {
        for fold in indent_folding(self.text, self.index, ranges) {
            self.ranges.push(Raw {
                start: Position::new(fold.start_line, 0),
                end: Position::new(fold.end_line, 0),
                kind: None,
                closing: false,
            });
        }
    }

    fn fold(&mut self, start: u32, end: u32, kind: Option<FoldingRangeKind>, closing: bool) {
        self.ranges.push(Raw {
            start: self.index.position(self.text, start as usize),
            end: self.index.position(self.text, end as usize),
            kind,
            closing,
        });
    }

    fn finish(self, line_folding_only: bool) -> Vec<FoldingRange> {
        if !line_folding_only {
            return self
                .ranges
                .into_iter()
                .filter(|raw| raw.start.line <= raw.end.line)
                .map(|raw| FoldingRange {
                    start_line: raw.start.line,
                    start_character: Some(raw.start.character),
                    end_line: raw.end.line,
                    end_character: Some(raw.end.character),
                    kind: raw.kind,
                    collapsed_text: None,
                })
                .collect();
        }

        // One fold per line is all such a client can draw, and the innermost
        // one — emitted first, since children are walked before their parent —
        // is the one it should get.
        let mut folds: Vec<FoldingRange> = Vec::new();
        for raw in self.ranges {
            let start_line = raw.start.line;
            let end_line = if raw.closing {
                raw.end.line.saturating_sub(1).max(start_line)
            } else {
                raw.end.line
            };
            if start_line >= end_line || folds.iter().any(|fold| fold.start_line == start_line) {
                continue;
            }
            folds.push(FoldingRange {
                start_line,
                end_line,
                kind: raw.kind,
                ..FoldingRange::default()
            });
        }
        folds
    }
}

/// Whether `data` starts with `word` and does not merely have it as a prefix.
fn word(data: &str, word: &str) -> bool {
    data.strip_prefix(word)
        .is_some_and(|rest| !rest.starts_with(|c: char| c.is_alphanumeric() || c == '_'))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The ranges a `lineFoldingOnly` client — every editor in practice — gets,
    /// sorted the way the official test suite compares them.
    fn ranges(lines: &[&str]) -> Vec<(u32, u32, Option<FoldingRangeKind>)> {
        let text = lines.join("\n");
        let mut ranges: Vec<_> = folding_ranges(&text, true)
            .into_iter()
            .map(|range| (range.start_line, range.end_line, range.kind))
            .collect();
        ranges.sort_by_key(|&(start, _, _)| start);
        ranges
    }

    fn plain(lines: &[&str]) -> Vec<(u32, u32)> {
        ranges(lines)
            .into_iter()
            .map(|(start, end, kind)| {
                assert_eq!(kind, None, "{lines:?}");
                (start, end)
            })
            .collect()
    }

    #[test]
    fn fold_one_level() {
        assert_eq!(plain(&["<html>", "Hello", "</html>"]), vec![(0, 1)]);
    }

    #[test]
    fn fold_two_levels() {
        assert_eq!(
            plain(&["<html>", "<head>", "Hello", "</head>", "</html>"]),
            vec![(0, 3), (1, 2)]
        );
    }

    #[test]
    fn fold_siblings() {
        assert_eq!(
            plain(&[
                "<html>",
                "<head>",
                "Head",
                "</head>",
                "<body class=\"f\">",
                "Body",
                "</body>",
                "</html>",
            ]),
            vec![(0, 6), (1, 2), (4, 5)]
        );
    }

    #[test]
    fn fold_self_closing_tags() {
        assert_eq!(
            plain(&[
                "<div>",
                "<a href=\"top\"/>",
                "<img src=\"s\">",
                "<br/>",
                "<br>",
                "<img class=\"c\"",
                "     src=\"top\"",
                ">",
                "</div>",
            ]),
            vec![(0, 7), (5, 6)]
        );
    }

    #[test]
    fn fold_comments() {
        assert_eq!(
            ranges(&[
                "<!--",
                " multi line",
                "-->",
                "<!-- some stuff",
                " some more stuff -->"
            ]),
            vec![
                (0, 2, Some(FoldingRangeKind::Comment)),
                (3, 4, Some(FoldingRangeKind::Comment)),
            ]
        );
    }

    #[test]
    fn fold_regions() {
        assert_eq!(
            ranges(&[
                "<!-- #region -->",
                "<!-- #region -->",
                "<!-- #endregion -->",
                "<!-- #endregion -->",
            ]),
            vec![
                (0, 3, Some(FoldingRangeKind::Region)),
                (1, 2, Some(FoldingRangeKind::Region)),
            ]
        );
    }

    #[test]
    fn a_region_interrupted_by_its_container_loses_the_container_fold() {
        assert_eq!(
            ranges(&[
                "<!-- #region -->",
                "<body>",
                "Hello",
                "<!-- #endregion -->",
                "<div></div>",
                "</body>",
            ]),
            vec![(0, 3, Some(FoldingRangeKind::Region))]
        );
    }

    #[test]
    fn a_region_a_container_outlives_is_dropped() {
        assert_eq!(
            ranges(&[
                "<body>",
                "<!-- #region -->",
                "Hello",
                "<div></div>",
                "</body>",
                "<!-- #endregion -->",
            ]),
            vec![(0, 3)]
                .into_iter()
                .map(|(s, e)| (s, e, None))
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn a_word_that_merely_starts_with_region_is_a_plain_comment() {
        assert_eq!(
            ranges(&["<!-- #regionally", " speaking -->"]),
            vec![(0, 1, Some(FoldingRangeKind::Comment))]
        );
    }

    #[test]
    fn svelte_blocks_fold() {
        assert_eq!(
            plain(&["{#if a}", "yes", "{:else}", "no", "{/if}"]),
            vec![(0, 3)]
        );
        assert_eq!(
            plain(&["{#each items as item}", "{item}", "{/each}"]),
            vec![(0, 1)]
        );
        assert_eq!(
            plain(&[
                "{#await promise}",
                "wait",
                "{:then value}",
                "ok",
                "{/await}"
            ]),
            vec![(0, 3)]
        );
        assert_eq!(plain(&["{#key a}", "b", "{/key}"]), vec![(0, 1)]);
        assert_eq!(
            plain(&["{#snippet row(item)}", "{item}", "{/snippet}"]),
            vec![(0, 1)]
        );
    }

    #[test]
    fn a_block_inside_an_element_folds_too() {
        assert_eq!(
            plain(&["<div>", "{#if a}", "yes", "{/if}", "</div>"]),
            vec![(0, 3), (1, 2)]
        );
    }

    #[test]
    fn script_and_style_fold_with_their_bodies() {
        assert_eq!(
            plain(&[
                "<script>",
                "  function a() {",
                "    b();",
                "  }",
                "</script>",
                "<style>",
                "  p {",
                "    color: red;",
                "  }",
                "</style>",
            ]),
            vec![(0, 3), (1, 2), (5, 8), (6, 7)]
        );
    }

    #[test]
    fn a_run_of_imports_folds_as_imports() {
        let ranges = ranges(&[
            "<script>",
            "  import a from 'a';",
            "  import b from 'b';",
            "  let c = 1;",
            "</script>",
        ]);
        assert!(
            ranges.contains(&(1, 2, Some(FoldingRangeKind::Imports))),
            "{ranges:?}"
        );
    }

    #[test]
    fn a_single_import_is_not_worth_folding() {
        let ranges = ranges(&["<script>", "  import a from 'a';", "</script>"]);
        assert!(
            !ranges
                .iter()
                .any(|(_, _, kind)| kind == &Some(FoldingRangeKind::Imports)),
            "{ranges:?}"
        );
    }

    #[test]
    fn an_unreadable_document_falls_back_to_indentation() {
        // A stray closing tag is one of the few things loose parsing refuses,
        // and the folds the editor has already drawn should survive it.
        let text = "<div>\n  <p>\n    x\n  </p>\n</div>\n</span>";
        let ranges = folding_ranges(text, true);
        assert_eq!(
            ranges
                .iter()
                .map(|range| (range.start_line, range.end_line))
                .collect::<Vec<_>>(),
            vec![(0, 3), (1, 2)]
        );
    }

    #[test]
    fn a_document_being_typed_still_folds() {
        for text in [
            "<div>\n  <p>hi\n",
            "{#if a}\n  <p>\n    x\n  </p>\n",
            "<script>\n  const a = {\n</script>",
        ] {
            assert!(
                !folding_ranges(text, true).is_empty(),
                "{text:?} should still fold"
            );
        }
    }

    #[test]
    fn no_input_panics() {
        for text in crate::nodes::tests_support::BROKEN {
            let lines = folding_ranges(text, true);
            assert!(lines.iter().all(|range| range.start_line < range.end_line));
            let offsets = folding_ranges(text, false);
            assert!(
                offsets
                    .iter()
                    .all(|range| range.start_line <= range.end_line)
            );
        }
    }

    #[test]
    fn a_document_that_folds_nothing_is_empty_not_absent() {
        assert!(folding_ranges("", true).is_empty());
        assert!(folding_ranges("<p>hi</p>", true).is_empty());
    }

    #[test]
    fn characters_are_reported_when_the_client_folds_by_offset() {
        let ranges = folding_ranges("<div>\n  x\n</div>", false);
        let div = ranges.first().expect("the div folds");
        assert_eq!((div.start_line, div.start_character), (0, Some(0)));
        assert_eq!((div.end_line, div.end_character), (2, Some(6)));
    }

    #[test]
    fn astral_text_does_not_shift_the_lines() {
        let text = "<div>\n  💡{name}\n</div>";
        let ranges = folding_ranges(text, true);
        assert_eq!(
            ranges
                .iter()
                .map(|range| (range.start_line, range.end_line))
                .collect::<Vec<_>>(),
            vec![(0, 1)]
        );
        let ranges = folding_ranges(text, false);
        assert_eq!(ranges[0].end_character, Some(6));
    }

    #[test]
    fn crlf_documents_fold_on_the_same_lines() {
        let unix = folding_ranges("<div>\n  x\n</div>", true);
        let dos = folding_ranges("<div>\r\n  x\r\n</div>", true);
        assert_eq!(unix.len(), dos.len());
        assert_eq!(unix[0].start_line, dos[0].start_line);
        assert_eq!(unix[0].end_line, dos[0].end_line);
    }
}
