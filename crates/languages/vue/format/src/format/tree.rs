use std::borrow::Cow;

use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::index::{IndexRange, IndexVector};
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_vue_syntax::syntax_tree::{
    SingleFileComponent, TagAttributes, TemplateNode, TemplateNodeIdentifier,
};

use super::{Attributes, Embed, Node, NodeIdentifier, NodeKind, R, Tree, only_ws};

/// Elements whose `white-space` is not `normal` (`CSS_WHITE_SPACE_TAGS`) or whose attributes
/// prettier formats with a language this port does not have.
const REFUSED_TAGS: &[&str] = &[
    "listing",
    "plaintext",
    "pre",
    "xmp",
    "textarea",
    "svg",
    "math",
];

impl<'a> Tree<'a> {
    pub(super) fn build(
        component: &'a SingleFileComponent,
        source_text: &'a str,
        lines: &'a LineIndex,
    ) -> R<Self> {
        // The parser has read the document, so its offsets fit in `u32`.
        let len = source_text.len() as u32;
        let mut t = Tree {
            nodes: IndexVector::from(vec![Node::new(NodeKind::Root, None, Span::new(0, len))]),
            lines,
            source_text,
        };
        let mut blocks: Vec<(Span, NodeIdentifier)> = Vec::new();
        if let Some(tpl) = &component.template {
            let identifier = t.push(
                NodeKind::Element {
                    name: "template",
                    attributes: Attributes::Block(&tpl.attributes),
                    embed: Embed::None,
                },
                NodeIdentifier::ROOT,
                tpl.span,
            );
            t.nodes[identifier].open_end = tpl.content.start_offset;
            t.nodes[identifier].close_start = Some(tpl.content.end_offset);
            let children = t.template_nodes(component, identifier, component.children(tpl.root))?;
            t.nodes[identifier].children = children;
            blocks.push((tpl.span, identifier));
        }
        if let Some(s) = &component.script {
            let identifier = t.block(
                "script",
                &s.attributes,
                Embed::Script(s.content),
                s.span,
                s.content,
            );
            blocks.push((s.span, identifier));
        }
        for (i, s) in component.styles.iter().enumerate() {
            if s.attributes.iter().any(|(n, v)| {
                n.text(source_text) == "lang" && v.is_some_and(|v| v.text(source_text) != "css")
            }) {
                return Err(Unsupported::at("a style language other than CSS", s.span));
            }
            let identifier = t.block("style", &s.attributes, Embed::Style(i), s.span, s.content);
            blocks.push((s.span, identifier));
        }
        blocks.sort_by_key(|b| b.0.start_offset);
        let mut at = 0;
        for (i, &(span, identifier)) in blocks.iter().enumerate() {
            let gap = &source_text[at as usize..span.start_offset as usize];
            if !only_ws(gap) {
                return Err(Unsupported::at(
                    "content between the blocks",
                    Span::new(at, span.start_offset),
                ));
            }
            if !gap.is_empty() {
                t.nodes[identifier].has.leading = true;
                if i > 0 {
                    t.nodes[blocks[i - 1].1].has.trailing = true;
                }
            }
            at = span.end_offset;
        }
        if !only_ws(&source_text[at as usize..]) {
            return Err(Unsupported::at(
                "content after the blocks",
                Span::new(at, len),
            ));
        }
        if at < len
            && let Some(&(_, last)) = blocks.last()
        {
            t.nodes[last].has.trailing = true;
        }
        t.nodes[NodeIdentifier::ROOT].children = blocks.iter().map(|b| b.1).collect();
        t.extract_whitespace();
        t.link();
        t.display_and_closing();
        t.space_sensitivity();
        t.merge_simple_elements();
        t.link();
        Ok(t)
    }

    pub(super) fn push(
        &mut self,
        kind: NodeKind<'a>,
        parent: NodeIdentifier,
        span: Span,
    ) -> NodeIdentifier {
        self.nodes.push(Node::new(kind, Some(parent), span))
    }

    pub(super) fn parent(&self, i: NodeIdentifier) -> NodeIdentifier {
        self.nodes[i].parent.expect("only the root has no parent")
    }

    pub(super) fn is_top_level(&self, i: NodeIdentifier) -> bool {
        self.nodes[i].parent == Some(NodeIdentifier::ROOT)
    }

    /// Every node, the root first; it does not borrow the tree, so a loop can change nodes.
    pub(super) fn identifiers(&self) -> impl Iterator<Item = NodeIdentifier> + use<> {
        IndexRange::new(NodeIdentifier::ROOT, self.nodes.next_identifier()).iter()
    }

    /// A `<script>` or `<style>` block: one raw text child, or none when only whitespace.
    pub(super) fn block(
        &mut self,
        name: &'static str,
        attributes: &'a [TagAttributes],
        embed: Embed,
        span: Span,
        content: Span,
    ) -> NodeIdentifier {
        let identifier = self.push(
            NodeKind::Element {
                name,
                attributes: Attributes::Block(attributes),
                embed,
            },
            NodeIdentifier::ROOT,
            span,
        );
        self.nodes[identifier].open_end = content.start_offset;
        self.nodes[identifier].close_start = Some(content.end_offset);
        let text = content.text(self.source_text);
        if only_ws(text) {
            self.nodes[identifier].has.dangling = !text.is_empty();
        } else {
            let t = self.push(NodeKind::Text(Cow::Borrowed(text)), identifier, content);
            self.nodes[identifier].children = vec![t];
        }
        identifier
    }

    pub(super) fn template_nodes(
        &mut self,
        component: &'a SingleFileComponent,
        parent: NodeIdentifier,
        children: &[TemplateNodeIdentifier],
    ) -> R<Vec<NodeIdentifier>> {
        let mut out = Vec::with_capacity(children.len());
        for &k in children {
            let identifier = match *component.node(k) {
                TemplateNode::Text { span } => self.push(
                    NodeKind::Text(Cow::Borrowed(span.text(self.source_text))),
                    parent,
                    span,
                ),
                TemplateNode::Comment { span, .. } => {
                    return Err(Unsupported::at("a template comment", span));
                }
                TemplateNode::Interpolation { span, .. } => {
                    self.push(NodeKind::Interpolation(span), parent, span)
                }
                TemplateNode::Element {
                    name,
                    attributes,
                    children,
                    start_tag,
                    self_closing,
                    span,
                } => {
                    let tag = name.text(self.source_text);
                    // An empty `<textarea>` has no content for its `white-space` to preserve.
                    let empty_textarea = tag == "textarea" && children.len == 0;
                    let refused = REFUSED_TAGS.contains(&tag) && !empty_textarea;
                    if refused || tag.contains('-') || tag.contains(':') {
                        return Err(Unsupported::at("this element", name));
                    }
                    let attributes = component.attributes(attributes);
                    let identifier = self.push(
                        NodeKind::Element {
                            name: tag,
                            attributes: Attributes::Template(attributes),
                            embed: Embed::None,
                        },
                        parent,
                        span,
                    );
                    self.nodes[identifier].open_end = start_tag.end_offset;
                    let void = rsvelte_markup_syntax::is_void(tag);
                    self.nodes[identifier].self_closing = void || self_closing;
                    if !void && !self_closing {
                        let close = self.source_text[..span.end_offset as usize]
                            .rfind("</")
                            .ok_or_else(|| {
                                Unsupported::at("an element without an end tag", span)
                            })?;
                        self.nodes[identifier].close_start =
                            Some(span.start_offset + (close - span.start_offset as usize) as u32);
                    }
                    let children =
                        self.template_nodes(component, identifier, component.children(children))?;
                    self.nodes[identifier].children = children;
                    identifier
                }
            };
            out.push(identifier);
        }
        Ok(out)
    }

    pub(super) fn link(&mut self) {
        for i in self.identifiers() {
            let children = self.nodes[i].children.clone();
            for (j, &k) in children.iter().enumerate() {
                self.nodes[k].parent = Some(i);
                self.nodes[k].prev = j.checked_sub(1).map(|p| children[p]);
                self.nodes[k].next = children.get(j + 1).copied();
            }
        }
    }

    pub(super) fn is_element(&self, i: NodeIdentifier) -> bool {
        matches!(self.nodes[i].kind, NodeKind::Element { .. })
    }

    pub(super) fn name(&self, i: NodeIdentifier) -> Option<&'a str> {
        match self.nodes[i].kind {
            NodeKind::Element { name, .. } => Some(name),
            _ => None,
        }
    }

    /// `isScriptLikeTag`.
    pub(super) fn is_script_like(&self, i: NodeIdentifier) -> bool {
        matches!(self.name(i), Some("script" | "style"))
    }

    pub(super) fn is_text(&self, i: NodeIdentifier) -> bool {
        matches!(self.nodes[i].kind, NodeKind::Text(_))
    }
}
