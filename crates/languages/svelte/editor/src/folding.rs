//! Where an editor folds a component, as the official Svelte language server folds its markup.
//!
//! Each element and markup comment over more than one line folds, and so does each
//! `<!-- #region -->` up to its `<!-- #endregion -->`, for an editor that folds whole lines.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex, Span};
use rsvelte_svelte_syntax::syntax_tree::{Component, ElementEnd, Range, TemplateNode};

/// The identifier of the task that writes each component's folding ranges.
pub const TASK: &str = "svelte.folding/default";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct FoldingRange {
    /// 0-based, as the protocol counts lines.
    pub start_line: u32,
    pub end_line: u32,
    pub kind: Option<FoldingKind>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FoldingKind {
    Comment,
    Region,
}

impl FoldingKind {
    const fn name(self) -> &'static str {
        match self {
            Self::Comment => "comment",
            Self::Region => "region",
        }
    }
}

#[derive(Debug)]
pub(crate) struct Folding;

impl Task for Folding {
    fn identifier(&self) -> &'static str {
        TASK
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match rsvelte_svelte_syntax::parsed_reading_scripts_as_typescript(context) {
            Ok(component) => {
                let ranges = folding_ranges(component, context.source_text());
                out.file("folding.json", json(&ranges));
            }
            Err(error) => out.diagnostics.push(error.clone()),
        }
    }
}

/// The ranges in the order the language server answers them: each element after the ranges in
/// it, each comment where it is. Where two start on one line, the first of them is kept.
#[must_use]
pub fn folding_ranges(component: &Component, text: &str) -> Vec<FoldingRange> {
    let lines = LineIndex::with_breaks(text, LineBreaks::LanguageServer);
    let mut folds = Folds {
        component,
        text,
        lines: &lines,
        stack: Vec::new(),
        next_element: 0,
        ranges: Vec::new(),
    };
    folds.top_level();
    let mut kept: Vec<FoldingRange> = Vec::with_capacity(folds.ranges.len());
    let mut starts = std::collections::HashSet::new();
    for range in folds.ranges {
        if range.start_line < range.end_line && starts.insert(range.start_line) {
            kept.push(range);
        }
    }
    kept.extend(template_indentation(component, text, &lines));
    kept
}

/// What the scan has opened and not closed yet.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Open {
    /// An element, by the order it was opened in.
    Element(u32),
    /// A `#region` comment, by where its text starts.
    Region(u32),
}

struct Folds<'a> {
    component: &'a Component,
    text: &'a str,
    lines: &'a LineIndex,
    stack: Vec<Open>,
    next_element: u32,
    /// In the order the language server adds them, before it keeps one per line.
    ranges: Vec<FoldingRange>,
}

/// A node of the outline the language server reads: the markup's elements and comments, with the
/// blocks between them left out, and the scripts and the style sheet as elements.
#[derive(Clone, Copy)]
enum Item {
    Node(u32),
    Tag(Span),
}

impl Folds<'_> {
    fn top_level(&mut self) {
        let component = self.component;
        let mut items: Vec<(u32, Item)> = Vec::new();
        self.items(component.root, &mut items);
        let tags = [
            component.module.as_ref().map(|script| script.span),
            component.instance.as_ref().map(|script| script.span),
            component.style.as_ref().map(|style| style.span),
        ];
        items.extend(
            tags.into_iter()
                .flatten()
                .map(|span| (span.start_offset, Item::Tag(span))),
        );
        items.sort_by_key(|(start, _)| *start);
        for (_, item) in items {
            self.item(item);
        }
    }

    /// The elements and comments of `nodes` and of the blocks among them, in order.
    fn items(&self, nodes: Range, items: &mut Vec<(u32, Item)>) {
        let component = self.component;
        for &id in nodes.get(&component.children) {
            let node = &component.nodes[id as usize];
            match node {
                TemplateNode::Element { .. } | TemplateNode::Comment { .. } => {
                    items.push((node.span().start_offset, Item::Node(id)));
                }
                TemplateNode::If {
                    consequent,
                    alternate,
                    ..
                } => {
                    self.items(*consequent, items);
                    if let Some(alternate) = alternate {
                        self.items(*alternate, items);
                    }
                }
                TemplateNode::Each {
                    body,
                    fallback,
                    has_fallback,
                    ..
                } => {
                    self.items(*body, items);
                    if *has_fallback {
                        self.items(*fallback, items);
                    }
                }
                TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                    self.items(*body, items);
                }
                TemplateNode::Await {
                    pending,
                    then,
                    catch,
                    ..
                } => {
                    for branch in [pending, then, catch] {
                        if let Some(branch) = branch.present() {
                            self.items(branch, items);
                        }
                    }
                }
                _ => {}
            }
        }
    }

    fn item(&mut self, item: Item) {
        match item {
            Item::Tag(span) => self.element(span, None),
            Item::Node(id) => match &self.component.nodes[id as usize] {
                TemplateNode::Comment { data, .. } => self.comment(*data),
                TemplateNode::Element {
                    children,
                    end,
                    span,
                    ..
                } => {
                    // Only an element its own end tag closes holds what the server reads in it.
                    let children = (*end == ElementEnd::EndTag).then_some(*children);
                    self.element(*span, children);
                }
                _ => {}
            },
        }
    }

    fn element(&mut self, span: Span, children: Option<Range>) {
        let open = Open::Element(self.next_element);
        self.next_element += 1;
        self.stack.push(open);
        if let Some(children) = children {
            let mut items = Vec::new();
            self.items(children, &mut items);
            for (_, item) in items {
                self.item(item);
            }
        }
        // A region that ends in it closed it too, and then the element does not fold.
        if let Some(index) = self.stack.iter().rposition(|entry| *entry == open) {
            self.stack.truncate(index);
            self.add(span, None);
        }
    }

    fn comment(&mut self, data: Span) {
        let text = data.text(self.text);
        match region(text) {
            None => self.add(data, Some(FoldingKind::Comment)),
            Some(Region::Start) => self.stack.push(Open::Region(data.start_offset)),
            Some(Region::End) => {
                let Some(index) =
                    (self.stack.iter()).rposition(|entry| matches!(entry, Open::Region(_)))
                else {
                    return;
                };
                if let Open::Region(start) = self.stack[index] {
                    self.stack.truncate(index);
                    self.add(Span::new(start, data.end_offset), Some(FoldingKind::Region));
                }
            }
        }
    }

    fn add(&mut self, span: Span, kind: Option<FoldingKind>) {
        let start_line = line(self.lines, span.start_offset);
        let end_line = line(self.lines, span.end_offset);
        // An element folds up to the line of its end tag; a comment or region folds that line too.
        let end_line = if kind.is_some() {
            end_line
        } else {
            end_line.saturating_sub(1).max(start_line)
        };
        self.ranges.push(FoldingRange {
            start_line,
            end_line,
            kind,
        });
    }
}

enum Region {
    Start,
    End,
}

/// Whether a comment's text starts or ends a region, as `/^\s*#(region\b)|(endregion\b)/` reads it.
fn region(text: &str) -> Option<Region> {
    let word_ends = |rest: &str| !rest.starts_with(|c: char| c.is_ascii_alphanumeric() || c == '_');
    if let Some(rest) = text.trim_start().strip_prefix("#region")
        && word_ends(rest)
    {
        return Some(Region::Start);
    }
    let ends = text
        .match_indices("endregion")
        .any(|(at, word)| word_ends(&text[at + word.len()..]));
    ends.then_some(Region::End)
}

/// The folds by indentation in a top-level `<template>`, which a preprocessor such as Pug reads.
fn template_indentation(component: &Component, text: &str, lines: &LineIndex) -> Vec<FoldingRange> {
    let template = component
        .root
        .get(&component.children)
        .iter()
        .find_map(|&id| match &component.nodes[id as usize] {
            TemplateNode::Element {
                name,
                start_tag,
                end,
                children,
                ..
            } if name.text(text) == "template" => {
                let content_end = (*end == ElementEnd::EndTag)
                    .then(|| children.get(&component.children).last())
                    .flatten()
                    .map_or(start_tag.end_offset, |&last| {
                        component.nodes[last as usize].span().end_offset
                    });
                Some((start_tag.end_offset, content_end))
            }
            _ => None,
        });
    let Some((start, end)) = template else {
        return Vec::new();
    };
    let first = line(lines, start) + 1;
    let last = line(lines, end).saturating_sub(1);
    if line(lines, start) == line(lines, end) || first >= last {
        return Vec::new();
    }
    indentation::folds(text, first, last)
}

/// The 0-based line of a byte offset, as the protocol counts lines.
fn line(lines: &LineIndex, byte: u32) -> u32 {
    lines.line(byte) - 1
}

/// `ranges` as the protocol's JSON.
fn json(ranges: &[FoldingRange]) -> String {
    let mut out = StructuredDataWriter::new(false);
    out.begin_array();
    for range in ranges {
        out.begin_object()
            .key("startLine")
            .write_number(range.start_line)
            .key("endLine")
            .write_number(range.end_line);
        if let Some(kind) = range.kind {
            out.key("kind").write_string(kind.name());
        }
        out.end_object();
    }
    out.end_array();
    out.finish()
}

mod indentation;

#[cfg(test)]
mod tests;
