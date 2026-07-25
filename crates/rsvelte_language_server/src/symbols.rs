//! `textDocument/documentSymbol`.
//!
//! Upstream builds this outline out of HTML nodes, so a component shows up as a
//! list of tags; the Svelte AST also knows which of those tags are components,
//! where the blocks are and what the snippets are called, so those become
//! symbols of their own.
//!
//! Elements keep upstream's `tag#id.class` naming and its
//! [`SymbolKind::FIELD`], so an outline built by this server looks like the one
//! built by the official one wherever the two describe the same thing.

use lsp_types::{
    DocumentSymbol, DocumentSymbolResponse, Location, Range, SymbolInformation, SymbolKind, Uri,
};
use rsvelte_core::Allocator;
use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Script, ScriptContext, TemplateNode,
};

use crate::context::skip_braces;
use crate::nodes::{Block, Kind, Span, Top, parse_root, top_level, view};
use crate::text::LineIndex;

/// How much of a block's opening tag its symbol shows.
const HEADER_LIMIT: usize = 60;

pub fn document_symbols(text: &str, uri: &Uri, hierarchical: bool) -> DocumentSymbolResponse {
    let allocator = Allocator::default();
    let mut symbols = Vec::new();
    if let Some(root) = parse_root(text, &allocator) {
        for top in top_level(&root) {
            match top {
                Top::Node(node) => collect(text, node, &mut symbols),
                Top::Script(script) => symbols.push(Symbol::leaf(
                    script_name(script),
                    SymbolKind::MODULE,
                    (script.start, script.end),
                    tag_name_span(script.start, "script"),
                )),
                Top::Style(style) => symbols.push(Symbol::leaf(
                    "style".to_string(),
                    SymbolKind::MODULE,
                    (style.start, style.end),
                    tag_name_span(style.start, "style"),
                )),
            }
        }
    }

    let index = LineIndex::new(text);
    if hierarchical {
        DocumentSymbolResponse::Nested(
            symbols
                .iter()
                .map(|symbol| symbol.nested(text, &index))
                .collect(),
        )
    } else {
        let mut flat = Vec::new();
        for symbol in &symbols {
            symbol.flatten(text, &index, uri, None, &mut flat);
        }
        DocumentSymbolResponse::Flat(flat)
    }
}

struct Symbol {
    name: String,
    kind: SymbolKind,
    span: Span,
    /// The part of `span` a client selects when the symbol is picked.
    selection: Span,
    children: Vec<Symbol>,
}

impl Symbol {
    fn leaf(name: String, kind: SymbolKind, span: Span, selection: Span) -> Self {
        Self {
            name,
            kind,
            span,
            selection,
            children: Vec::new(),
        }
    }

    fn nested(&self, text: &str, index: &LineIndex) -> DocumentSymbol {
        #[allow(deprecated)]
        DocumentSymbol {
            name: self.name.clone(),
            detail: None,
            kind: self.kind,
            tags: None,
            deprecated: None,
            range: to_range(text, index, self.span),
            selection_range: to_range(text, index, self.selection),
            children: Some(
                self.children
                    .iter()
                    .map(|child| child.nested(text, index))
                    .collect(),
            ),
        }
    }

    /// The same tree for a client that cannot read one, with the nesting
    /// carried by `containerName` instead.
    fn flatten(
        &self,
        text: &str,
        index: &LineIndex,
        uri: &Uri,
        container: Option<&str>,
        out: &mut Vec<SymbolInformation>,
    ) {
        #[allow(deprecated)]
        out.push(SymbolInformation {
            name: self.name.clone(),
            kind: self.kind,
            tags: None,
            deprecated: None,
            location: Location {
                uri: uri.clone(),
                range: to_range(text, index, self.span),
            },
            container_name: container.map(str::to_string),
        });
        for child in &self.children {
            child.flatten(text, index, uri, Some(&self.name), out);
        }
    }
}

fn collect(text: &str, node: &TemplateNode<'_>, out: &mut Vec<Symbol>) {
    let node = view(node);
    let (name, kind, selection) = match node.kind {
        Kind::Element(tag) => (
            element_name(tag, node.attributes),
            SymbolKind::FIELD,
            node.name_span.unwrap_or(node.span()),
        ),
        Kind::Block(Block::Snippet) => {
            let selection = node.name_span.unwrap_or(node.span());
            (
                text[selection.0 as usize..selection.1 as usize].to_string(),
                SymbolKind::FUNCTION,
                selection,
            )
        }
        Kind::Block(_) => {
            let header = (node.start, header_end(text, node.start, node.end));
            (header_name(text, header), SymbolKind::NAMESPACE, header)
        }
        // Text, comments and `{…}` tags are content, not structure.
        Kind::Comment | Kind::Leaf => return,
    };

    let mut children = Vec::new();
    for fragment in node.fragments() {
        for child in &fragment.nodes {
            collect(text, child, &mut children);
        }
    }
    out.push(Symbol {
        name,
        kind,
        span: node.span(),
        selection,
        children,
    });
}

/// `tag#id.class`, the naming `vscode-html-languageservice` uses and therefore
/// the one the official server's outline shows.
fn element_name(tag: &str, attributes: &[Attribute<'_>]) -> String {
    let mut name = tag.to_string();
    if let Some(id) = static_attribute(attributes, "id") {
        name.push('#');
        name.push_str(id);
    }
    if let Some(classes) = static_attribute(attributes, "class") {
        for class in classes.split_whitespace() {
            name.push('.');
            name.push_str(class);
        }
    }
    name
}

/// The value of an attribute that is plain text — anything interpolated has no
/// one value to name the element after.
fn static_attribute<'a>(attributes: &'a [Attribute<'a>], name: &str) -> Option<&'a str> {
    attributes.iter().find_map(|attribute| {
        let Attribute::Attribute(attribute) = attribute else {
            return None;
        };
        if attribute.name != name {
            return None;
        }
        match &attribute.value {
            AttributeValue::Sequence(parts) => match parts.as_slice() {
                [AttributeValuePart::Text(text)] => Some(text.data.as_ref()),
                _ => None,
            },
            _ => None,
        }
    })
}

/// Where a block's opening tag ends, so `{#each items as item}` names the
/// block and its body does not.
fn header_end(text: &str, start: u32, end: u32) -> u32 {
    let header = skip_braces(text, start as usize) as u32;
    header.min(end)
}

fn header_name(text: &str, (start, end): Span) -> String {
    let header: Vec<&str> = text[start as usize..end as usize]
        .split_whitespace()
        .collect();
    let header = header.join(" ");
    if header.chars().count() <= HEADER_LIMIT {
        return header;
    }
    header
        .chars()
        .take(HEADER_LIMIT - 1)
        .chain(std::iter::once('…'))
        .collect()
}

fn script_name(script: &Script<'_>) -> String {
    match script.context {
        ScriptContext::Module => "script module".to_string(),
        ScriptContext::Default => "script".to_string(),
    }
}

fn tag_name_span(start: u32, tag: &str) -> Span {
    (start + 1, start + 1 + tag.len() as u32)
}

fn to_range(text: &str, index: &LineIndex, (start, end): Span) -> Range {
    Range::new(
        index.position(text, start as usize),
        index.position(text, end as usize),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    fn uri() -> Uri {
        Uri::from_str("file:///App.svelte").unwrap()
    }

    fn nested(text: &str) -> Vec<DocumentSymbol> {
        match document_symbols(text, &uri(), true) {
            DocumentSymbolResponse::Nested(symbols) => symbols,
            DocumentSymbolResponse::Flat(_) => panic!("asked for a tree"),
        }
    }

    fn flat(text: &str) -> Vec<SymbolInformation> {
        match document_symbols(text, &uri(), false) {
            DocumentSymbolResponse::Flat(symbols) => symbols,
            DocumentSymbolResponse::Nested(_) => panic!("asked for a list"),
        }
    }

    /// Every symbol's name, indented by its depth.
    fn outline(symbols: &[DocumentSymbol]) -> Vec<String> {
        fn walk(symbols: &[DocumentSymbol], depth: usize, out: &mut Vec<String>) {
            for symbol in symbols {
                out.push(format!("{}{}", "  ".repeat(depth), symbol.name));
                walk(symbol.children.as_deref().unwrap_or(&[]), depth + 1, out);
            }
        }
        let mut out = Vec::new();
        walk(symbols, 0, &mut out);
        out
    }

    #[test]
    fn elements_are_named_like_the_official_outline() {
        let symbols = nested("<div id=\"main\" class=\"a b\"><span/></div>");
        assert_eq!(outline(&symbols), vec!["div#main.a.b", "  span"]);
        assert_eq!(symbols[0].kind, SymbolKind::FIELD);
    }

    #[test]
    fn an_interpolated_class_does_not_name_the_element() {
        assert_eq!(outline(&nested("<div class={a}></div>")), vec!["div"]);
        assert_eq!(outline(&nested("<div class=\"a {b}\"></div>")), vec!["div"]);
    }

    #[test]
    fn scripts_styles_components_and_blocks_all_show_up() {
        let text = concat!(
            "<script module>let a;</script>\n",
            "<script>let b;</script>\n",
            "<Widget prop={1}>\n",
            "  {#if a}\n",
            "    <p>x</p>\n",
            "  {/if}\n",
            "</Widget>\n",
            "<style>p{color:red}</style>\n",
        );
        assert_eq!(
            outline(&nested(text)),
            vec![
                "script module",
                "script",
                "Widget",
                "  {#if a}",
                "    p",
                "style",
            ]
        );
    }

    #[test]
    fn a_snippet_is_named_after_itself() {
        let symbols = nested("{#snippet row(item)}<p>{item}</p>{/snippet}");
        assert_eq!(outline(&symbols), vec!["row", "  p"]);
        assert_eq!(symbols[0].kind, SymbolKind::FUNCTION);
        // The selection lands on the name, not on the whole block.
        assert_eq!(
            symbols[0].selection_range,
            Range::new(
                lsp_types::Position::new(0, 10),
                lsp_types::Position::new(0, 13)
            )
        );
    }

    #[test]
    fn every_block_kind_is_named_by_its_opening_tag() {
        for (text, name) in [
            ("{#if a}x{/if}", "{#if a}"),
            ("{#each items as item}x{/each}", "{#each items as item}"),
            ("{#await p}x{/await}", "{#await p}"),
            ("{#key a}x{/key}", "{#key a}"),
        ] {
            assert_eq!(outline(&nested(text)), vec![name.to_string()]);
        }
    }

    #[test]
    fn an_each_over_a_destructured_context_keeps_its_braces() {
        assert_eq!(
            outline(&nested("{#each items as { a, b }}x{/each}")),
            vec!["{#each items as { a, b }}"]
        );
    }

    #[test]
    fn a_long_header_is_cut_short() {
        let text = format!("{{#if {}}}x{{/if}}", "a".repeat(200));
        let symbols = nested(&text);
        assert_eq!(symbols[0].name.chars().count(), HEADER_LIMIT);
        assert!(symbols[0].name.ends_with('…'));
    }

    #[test]
    fn a_multi_line_header_reads_as_one_line() {
        assert_eq!(
            outline(&nested("{#if a\n  && b}x{/if}")),
            vec!["{#if a && b}"]
        );
    }

    #[test]
    fn a_flat_client_gets_the_nesting_as_container_names() {
        let symbols = flat("<div><span>{#if a}<p>x</p>{/if}</span></div>");
        let names: Vec<(&str, Option<&str>)> = symbols
            .iter()
            .map(|symbol| (symbol.name.as_str(), symbol.container_name.as_deref()))
            .collect();
        assert_eq!(
            names,
            vec![
                ("div", None),
                ("span", Some("div")),
                ("{#if a}", Some("span")),
                ("p", Some("{#if a}")),
            ]
        );
        assert_eq!(symbols[0].location.uri, uri());
    }

    #[test]
    fn the_selection_range_is_inside_the_range() {
        fn check(symbols: &[DocumentSymbol]) {
            for symbol in symbols {
                assert!(
                    symbol.range.start <= symbol.selection_range.start
                        && symbol.selection_range.end <= symbol.range.end,
                    "{}: {:?} outside {:?}",
                    symbol.name,
                    symbol.selection_range,
                    symbol.range
                );
                check(symbol.children.as_deref().unwrap_or(&[]));
            }
        }
        check(&nested(
            "<script>let a;</script>\n<div>{#each a as b}<p>{b}</p>{/each}</div>\n<style>p{}</style>",
        ));
    }

    #[test]
    fn ranges_are_measured_in_utf16() {
        let symbols = nested("<p>💡</p>");
        assert_eq!(
            symbols[0].range,
            Range::new(
                lsp_types::Position::new(0, 0),
                lsp_types::Position::new(0, 9)
            )
        );
    }

    #[test]
    fn an_unclosed_element_still_has_an_outline() {
        assert_eq!(outline(&nested("<div>\n  <p>hi\n")), vec!["div", "  p"]);
    }

    #[test]
    fn no_input_panics() {
        for text in crate::nodes::tests_support::BROKEN {
            let symbols = nested(text);
            let index = LineIndex::new(text);
            let last = index.position(text, text.len());
            for symbol in &symbols {
                assert!(symbol.range.end <= last, "{text:?}: {symbol:?}");
            }
            assert_eq!(flat(text).len(), outline(&symbols).len(), "{text:?}");
        }
    }

    #[test]
    fn an_unreadable_document_has_no_outline() {
        // A stray closing tag is one of the few things loose parsing still
        // refuses; a half-written script is not.
        assert!(nested("<div>x</div>\n</span>").is_empty());
        assert!(nested("").is_empty());
        assert_eq!(
            outline(&nested("<script>const a = {\n</script><p>x</p>")),
            vec!["script", "p"]
        );
    }
}
