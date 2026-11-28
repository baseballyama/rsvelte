//! The symbols of a component's markup, as the official Svelte language server lists them: each
//! element, named by its tag, its `id` and its classes, in the element around it.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex, Span};
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Component, TagAttributes, TemplateNode};

use crate::outline::{self, Item};

/// The identifier of the task that writes each component's symbols.
pub const TASK: &str = "svelte.symbols/default";

#[derive(Debug, PartialEq, Eq)]
pub struct Symbol {
    pub name: String,
    pub span: Span,
    pub children: Vec<Self>,
}

#[derive(Debug)]
pub(crate) struct Symbols;

impl Task for Symbols {
    fn identifier(&self) -> &'static str {
        TASK
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match rsvelte_svelte_syntax::parsed_reading_scripts_as_typescript(context) {
            Ok(component) => {
                let text = context.source_text();
                out.file("symbols.json", json(&symbols(component, text), text));
            }
            Err(error) => out.diagnostics.push(error.clone()),
        }
    }
}

/// Each element of `component`, with the elements in it.
#[must_use]
pub fn symbols(component: &Component, text: &str) -> Vec<Symbol> {
    of(component, text, outline::top_level(component, text))
}

fn of(component: &Component, text: &str, items: Vec<Item<'_>>) -> Vec<Symbol> {
    let mut symbols = Vec::with_capacity(items.len());
    for item in items {
        match item {
            Item::Tag { span, attributes } => {
                let tag = if text[span.start_offset as usize..].starts_with("<style") {
                    "style"
                } else {
                    "script"
                };
                let value = |wanted: &str| tag_attribute(attributes, text, wanted);
                symbols.push(Symbol {
                    name: name(tag, value("id"), value("class")),
                    span,
                    children: Vec::new(),
                });
            }
            Item::Node(id) => {
                let TemplateNode::Element {
                    name: tag,
                    attributes,
                    children,
                    span,
                    ..
                } = &component.nodes[id as usize]
                else {
                    continue;
                };
                let value = |wanted: &str| {
                    let attributes = attributes.get(&component.attributes).iter();
                    // As in HTML, a later attribute of one name stands for the earlier ones.
                    let attribute = attributes.rev().find(|a| a.name.text(text) == wanted)?;
                    match attribute.value {
                        AttributeValue::True => None,
                        _ if attribute.shorthand => Some(attribute.span.text(text)),
                        AttributeValue::Parts(_) => {
                            let after_name = &text[attribute.name.end_offset as usize
                                ..attribute.span.end_offset as usize];
                            Some(after_name.trim_start().trim_start_matches('=').trim_start())
                        }
                    }
                };
                symbols.push(Symbol {
                    name: name(tag.text(text), value("id"), value("class")),
                    span: *span,
                    children: of(component, text, outline::within(component, text, *children)),
                });
            }
        }
    }
    symbols
}

/// The value of the attribute `wanted` of a script or style tag, without its quotes.
fn tag_attribute<'t>(attributes: &[TagAttributes], text: &'t str, wanted: &str) -> Option<&'t str> {
    let (_, value) = attributes
        .iter()
        .find(|(name, _)| name.text(text) == wanted)?;
    value.map(|value| value.text(text))
}

/// `tag#id.class…`, from the values as written, without their quotes. A value is there even when
/// it is empty, as `""` is.
fn name(tag: &str, id: Option<&str>, class: Option<&str>) -> String {
    let unquoted = |value: &str| value.replace(['"', '\''], "");
    let mut name = tag.to_owned();
    if let Some(id) = id {
        name.push('#');
        name.push_str(&unquoted(id));
    }
    if let Some(class) = class {
        let class = unquoted(class);
        let pieces: Vec<&str> = class.split(is_javascript_space).collect();
        let last = pieces.len() - 1;
        // As JavaScript splits at each run of spaces: the first and last piece stay when empty.
        for (index, piece) in pieces.into_iter().enumerate() {
            if piece.is_empty() && index != 0 && index != last {
                continue;
            }
            name.push('.');
            name.push_str(piece);
        }
    }
    if name.is_empty() {
        name.push('?');
    }
    name
}

/// Whether JavaScript's `\s` matches `c`.
const fn is_javascript_space(c: char) -> bool {
    (c.is_whitespace() && c != '\u{85}') || c == '\u{feff}'
}

/// `symbols` as the official server lists them, each after the one it is in.
fn json(symbols: &[Symbol], text: &str) -> String {
    let lines = LineIndex::with_breaks(text, LineBreaks::LanguageServer);
    let mut out = StructuredDataWriter::new(false);
    out.begin_array();
    write(&mut out, &lines, symbols, "");
    out.end_array();
    out.finish()
}

fn write(out: &mut StructuredDataWriter, lines: &LineIndex, symbols: &[Symbol], container: &str) {
    let position = |out: &mut StructuredDataWriter, byte: u32| {
        let at = lines.line_column(byte);
        out.begin_object()
            .key("line")
            .write_number(at.line - 1)
            .key("character")
            .write_number(at.column);
        out.end_object();
    };
    for symbol in symbols {
        out.begin_object()
            .key("name")
            .write_string(&symbol.name)
            .key("containerName")
            .write_string(container)
            .key("range");
        out.begin_object().key("start");
        position(out, symbol.span.start_offset);
        out.key("end");
        position(out, symbol.span.end_offset);
        out.end_object();
        out.end_object();
        write(out, lines, &symbol.children, &symbol.name);
    }
}

#[cfg(test)]
mod tests;
