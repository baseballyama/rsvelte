//! A uniform view of the template AST for the structure providers.
//!
//! Folding ranges, selection ranges and document symbols all ask a node the
//! same handful of questions — its span, its name, the fragments nested in it,
//! the spans of the expressions it carries — which the template AST spells
//! differently for every one of its thirty variants. They are answered once
//! here.
//!
//! The parse is `loose`, the mode the official language server also compiles
//! in: a document is asked for its outline while it is being typed, so a
//! missing close tag has to leave the rest of the tree standing.

use rsvelte_core::ast::css::StyleSheet;
use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{Attribute, Fragment, Root, Script, TemplateNode};
use rsvelte_core::{Allocator, ParseOptions, parse};

pub type Span = (u32, u32);

/// The blocks that own a body.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Block {
    If,
    Each,
    Await,
    Key,
    Snippet,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Kind<'a> {
    Element(&'a str),
    Block(Block),
    Comment,
    /// Text, expression tags and the other leaves: a span, and nothing nested.
    Leaf,
}

/// One template node, seen as span + children.
pub struct View<'a> {
    pub start: u32,
    pub end: u32,
    pub kind: Kind<'a>,
    pub attributes: &'a [Attribute<'a>],
    /// The span a client should select when the node is picked from an
    /// outline: an element's tag name, a snippet's name.
    pub name_span: Option<Span>,
    fragments: [Option<&'a Fragment<'a>>; 3],
    expressions: [Option<Span>; 2],
}

impl<'a> View<'a> {
    pub fn span(&self) -> Span {
        (self.start, self.end)
    }

    pub fn fragments(&self) -> impl Iterator<Item = &'a Fragment<'a>> + '_ {
        self.fragments.into_iter().flatten()
    }

    pub fn expressions(&self) -> impl Iterator<Item = Span> + '_ {
        self.expressions.into_iter().flatten()
    }

    /// Whether the node can hold other nodes, and so is worth folding and
    /// outlining even when nothing is nested in it yet.
    pub fn is_container(&self) -> bool {
        matches!(self.kind, Kind::Element(_) | Kind::Block(_))
    }

    pub fn contains(&self, offset: usize) -> bool {
        (self.start as usize..=self.end as usize).contains(&offset)
    }
}

pub fn view<'a>(node: &'a TemplateNode<'a>) -> View<'a> {
    match node {
        TemplateNode::RegularElement(node) => element(
            node.start,
            node.end,
            &node.name,
            &node.attributes,
            &node.fragment,
        ),
        TemplateNode::Component(node) => element(
            node.start,
            node.end,
            &node.name,
            &node.attributes,
            &node.fragment,
        ),
        TemplateNode::TitleElement(node) => element(
            node.start,
            node.end,
            &node.name,
            &node.attributes,
            &node.fragment,
        ),
        TemplateNode::SlotElement(node) => element(
            node.start,
            node.end,
            &node.name,
            &node.attributes,
            &node.fragment,
        ),
        TemplateNode::SvelteBody(node)
        | TemplateNode::SvelteDocument(node)
        | TemplateNode::SvelteFragment(node)
        | TemplateNode::SvelteBoundary(node)
        | TemplateNode::SvelteHead(node)
        | TemplateNode::SvelteOptions(node)
        | TemplateNode::SvelteSelf(node)
        | TemplateNode::SvelteWindow(node) => element(
            node.start,
            node.end,
            &node.name,
            &node.attributes,
            &node.fragment,
        ),
        TemplateNode::SvelteComponent(node) => {
            let mut view = element(
                node.start,
                node.end,
                &node.name,
                &node.attributes,
                &node.fragment,
            );
            view.expressions[0] = span_of(&node.expression);
            view
        }
        TemplateNode::SvelteElement(node) => {
            let mut view = element(
                node.start,
                node.end,
                &node.name,
                &node.attributes,
                &node.fragment,
            );
            view.expressions[0] = span_of(&node.tag);
            view
        }
        TemplateNode::IfBlock(node) => View {
            fragments: [Some(&node.consequent), node.alternate.as_ref(), None],
            expressions: [span_of(&node.test), None],
            ..block(node.start, node.end, Block::If)
        },
        TemplateNode::EachBlock(node) => View {
            fragments: [Some(&node.body), node.fallback.as_ref(), None],
            expressions: [
                span_of(&node.expression),
                node.key.as_ref().and_then(span_of),
            ],
            ..block(node.start, node.end, Block::Each)
        },
        TemplateNode::AwaitBlock(node) => View {
            fragments: [
                node.pending.as_ref(),
                node.then.as_ref(),
                node.catch.as_ref(),
            ],
            expressions: [span_of(&node.expression), None],
            ..block(node.start, node.end, Block::Await)
        },
        TemplateNode::KeyBlock(node) => View {
            fragments: [Some(&node.fragment), None, None],
            expressions: [span_of(&node.expression), None],
            ..block(node.start, node.end, Block::Key)
        },
        TemplateNode::SnippetBlock(node) => View {
            fragments: [Some(&node.body), None, None],
            name_span: span_of(&node.expression),
            ..block(node.start, node.end, Block::Snippet)
        },
        TemplateNode::Comment(node) => leaf(node.start, node.end, Kind::Comment),
        TemplateNode::Text(node) => leaf(node.start, node.end, Kind::Leaf),
        TemplateNode::ExpressionTag(node) => {
            let mut view = leaf(node.start, node.end, Kind::Leaf);
            view.expressions[0] = span_of(&node.expression);
            view
        }
        TemplateNode::HtmlTag(node) => {
            let mut view = leaf(node.start, node.end, Kind::Leaf);
            view.expressions[0] = span_of(&node.expression);
            view
        }
        TemplateNode::RenderTag(node) => {
            let mut view = leaf(node.start, node.end, Kind::Leaf);
            view.expressions[0] = span_of(&node.expression);
            view
        }
        TemplateNode::AttachTag(node) => {
            let mut view = leaf(node.start, node.end, Kind::Leaf);
            view.expressions[0] = span_of(&node.expression);
            view
        }
        TemplateNode::ConstTag(node) => {
            let mut view = leaf(node.start, node.end, Kind::Leaf);
            view.expressions[0] = span_of(&node.declaration);
            view
        }
        TemplateNode::DeclarationTag(node) => {
            let mut view = leaf(node.start, node.end, Kind::Leaf);
            view.expressions[0] = span_of(&node.declaration);
            view
        }
        TemplateNode::DebugTag(node) => {
            let mut view = leaf(node.start, node.end, Kind::Leaf);
            view.expressions[0] = node.identifiers.first().and_then(span_of);
            view
        }
    }
}

fn element<'a>(
    start: u32,
    end: u32,
    name: &'a str,
    attributes: &'a [Attribute<'a>],
    fragment: &'a Fragment<'a>,
) -> View<'a> {
    // The tag name always follows the `<` the node starts at.
    let name_end = start + 1 + name.len() as u32;
    View {
        start,
        end,
        kind: Kind::Element(name),
        attributes,
        name_span: (name_end <= end).then_some((start + 1, name_end)),
        fragments: [Some(fragment), None, None],
        expressions: [None, None],
    }
}

fn block<'a>(start: u32, end: u32, block: Block) -> View<'a> {
    View {
        start,
        end,
        kind: Kind::Block(block),
        attributes: &[],
        name_span: None,
        fragments: [None, None, None],
        expressions: [None, None],
    }
}

fn leaf<'a>(start: u32, end: u32, kind: Kind<'a>) -> View<'a> {
    View {
        start,
        end,
        kind,
        attributes: &[],
        name_span: None,
        fragments: [None, None, None],
        expressions: [None, None],
    }
}

pub fn span_of(expression: &Expression<'_>) -> Option<Span> {
    Some((expression.start()?, expression.end()?))
}

/// A top-level piece of a document. `<script>` and `<style>` are lifted out of
/// the fragment by the parser, so they have to be woven back into document
/// order before anything can walk the file as a whole.
pub enum Top<'a> {
    Node(&'a TemplateNode<'a>),
    Script(&'a Script<'a>),
    Style(&'a StyleSheet),
}

impl Top<'_> {
    pub fn span(&self) -> Span {
        match self {
            Top::Node(node) => view(node).span(),
            Top::Script(script) => (script.start, script.end),
            Top::Style(style) => (style.start, style.end),
        }
    }
}

pub fn top_level<'a>(root: &'a Root<'a>) -> Vec<Top<'a>> {
    let mut tops: Vec<Top<'a>> = root.fragment.nodes.iter().map(Top::Node).collect();
    tops.extend(
        [root.instance.as_deref(), root.module.as_deref()]
            .into_iter()
            .flatten()
            .map(Top::Script),
    );
    tops.extend(root.css.as_deref().map(Top::Style));
    tops.sort_by_key(|top| top.span().0);
    tops
}

pub fn parse_root<'a>(text: &'a str, allocator: &Allocator) -> Option<Root<'a>> {
    let options = ParseOptions {
        loose: true,
        lenient_script: true,
        skip_non_css_lang_style: true,
        skip_expression_loc: true,
        ..ParseOptions::default()
    };
    parse(text, allocator, options).ok()
}

/// Documents in the state a component spends most of its life in: half
/// written. Every structure provider has to answer something for each of them
/// without falling over.
#[cfg(test)]
pub mod tests_support {
    pub const BROKEN: &[&str] = &[
        "",
        "<",
        "{",
        "{#",
        "{#if",
        "{#if a}",
        "{#each items as }x{/each}",
        "{#await}{:then}{:catch}{/await}",
        "{@render}",
        "{#snippet}",
        "</div>",
        "<div>x</div>\n</span>",
        "<div\n  attr=\"",
        "<div {{{>",
        "<div>\n  <p>hi\n",
        "<div>{#if a}</div>{/if}",
        "<script>const a = {\n</script><p>x</p>",
        "<script lang=\"ts\">let a: = ;</script><p>x</p>",
        "<style>h1{</style>",
        "<style lang=\"scss\">$a: 1; .b { c: $a }</style>",
        "<!-- unterminated",
        "<!-- #region -->\n<div>\n",
        "<p>💡{ }</p>\n<div>\n  あ\n",
        "<svelte:options bogus />",
    ];
}

#[cfg(test)]
mod tests {
    use super::*;

    fn root_of(text: &str) -> (Allocator, Option<Root<'_>>) {
        let allocator = Allocator::default();
        // The root borrows `text`, not the allocator, so both can be returned.
        let root = parse_root(text, &allocator);
        (allocator, root)
    }

    #[test]
    fn top_level_pieces_come_back_in_document_order() {
        let text = "<p>a</p>\n<script>let a;</script>\n<style>p{color:red}</style>";
        let (_allocator, root) = root_of(text);
        let root = root.unwrap();
        let starts: Vec<u32> = top_level(&root).iter().map(|top| top.span().0).collect();
        assert!(starts.windows(2).all(|w| w[0] <= w[1]), "{starts:?}");
        assert_eq!(starts.len(), 5, "two texts, an element, a script, a style");
    }

    #[test]
    fn an_unclosed_element_still_parses() {
        let text = "<div>\n  <p>hi\n";
        let (_allocator, root) = root_of(text);
        let root = root.expect("loose mode recovers");
        let div = view(&root.fragment.nodes[0]);
        assert_eq!(div.kind, Kind::Element("div"));
        assert_eq!(div.name_span, Some((1, 4)));
    }

    #[test]
    fn a_block_exposes_its_fragments_and_expression() {
        let text = "{#each items as item}{item}{:else}none{/each}";
        let (_allocator, root) = root_of(text);
        let root = root.unwrap();
        let each = view(&root.fragment.nodes[0]);
        assert_eq!(each.kind, Kind::Block(Block::Each));
        assert_eq!(each.fragments().count(), 2);
        assert_eq!(each.expressions().next(), Some((7, 12)));
    }

    #[test]
    fn a_snippet_carries_its_name_span() {
        let text = "{#snippet row(item)}{item}{/snippet}";
        let (_allocator, root) = root_of(text);
        let root = root.unwrap();
        let snippet = view(&root.fragment.nodes[0]);
        assert_eq!(snippet.kind, Kind::Block(Block::Snippet));
        assert_eq!(&text[10..13], "row");
        assert_eq!(snippet.name_span, Some((10, 13)));
    }
}
