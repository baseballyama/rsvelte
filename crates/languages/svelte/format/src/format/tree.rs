use super::{
    Cow, ElementKind, LayoutInstructionIdentifier, LayoutInstructions, Printer, TemplateNode,
    TemplateNodeIdentifier, ends_with_linebreak, is_collapse_ws, only_ws, starts_with_linebreak,
};
use crate::options::WhitespaceSensitivity;

/// prettier-plugin-svelte `blockElements`.
const BLOCK_ELEMENTS: &[&str] = &[
    "address",
    "article",
    "aside",
    "blockquote",
    "details",
    "dialog",
    "dd",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "ul",
];

impl<'a> Printer<'a, '_> {
    pub(super) const fn d(&mut self) -> &mut LayoutInstructions {
        &mut *self.javascript.docs
    }

    pub(super) fn lit(&mut self, s: &'static str) -> LayoutInstructionIdentifier {
        self.javascript.docs.lit(s)
    }

    pub(super) fn cat(
        &mut self,
        items: &[LayoutInstructionIdentifier],
    ) -> LayoutInstructionIdentifier {
        self.javascript.docs.concat(items)
    }

    pub(super) fn group(
        &mut self,
        items: &[LayoutInstructionIdentifier],
    ) -> LayoutInstructionIdentifier {
        self.javascript.docs.group(items)
    }

    pub(super) fn is_text(&self, identifier: TemplateNodeIdentifier) -> bool {
        matches!(self.c.node(identifier), TemplateNode::Text { .. })
    }

    /// `getUnencodedText`: the raw text as the plugin currently holds it.
    pub(super) fn raw(&self, identifier: TemplateNodeIdentifier) -> &str {
        match &self.text[identifier as usize] {
            Some(t) => t,
            None => match self.c.node(identifier) {
                TemplateNode::Text { span } => span.text(self.source_text),
                _ => unreachable!("only text nodes have text"),
            },
        }
    }

    pub(super) fn set_raw(&mut self, identifier: TemplateNodeIdentifier, s: Cow<'a, str>) {
        self.text[identifier as usize] = Some(s);
    }

    pub(super) fn trim_left(&mut self, identifier: TemplateNodeIdentifier) {
        let t = match self.take_raw(identifier) {
            Cow::Borrowed(b) => Cow::Borrowed(b.trim_start_matches(is_collapse_ws)),
            Cow::Owned(mut o) => {
                o.drain(..o.len() - o.trim_start_matches(is_collapse_ws).len());
                Cow::Owned(o)
            }
        };
        self.set_raw(identifier, t);
    }

    pub(super) fn trim_right(&mut self, identifier: TemplateNodeIdentifier) {
        let t = match self.take_raw(identifier) {
            Cow::Borrowed(b) => Cow::Borrowed(b.trim_end_matches(is_collapse_ws)),
            Cow::Owned(mut o) => {
                o.truncate(o.trim_end_matches(is_collapse_ws).len());
                Cow::Owned(o)
            }
        };
        self.set_raw(identifier, t);
    }

    // The caller stores the result back, so an owned string moves instead of being copied.
    fn take_raw(&mut self, identifier: TemplateNodeIdentifier) -> Cow<'a, str> {
        match self.text[identifier as usize].take() {
            Some(t) => t,
            None => match self.c.node(identifier) {
                TemplateNode::Text { span } => Cow::Borrowed(span.text(self.source_text)),
                _ => unreachable!("only text nodes have text"),
            },
        }
    }

    pub(super) fn take_buffer(&mut self) -> Vec<LayoutInstructionIdentifier> {
        self.buffers.pop().unwrap_or_default()
    }

    pub(super) fn give_buffer(&mut self, mut buffer: Vec<LayoutInstructionIdentifier>) {
        buffer.clear();
        self.buffers.push(buffer);
    }

    pub(super) fn is_empty_text(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.is_text(identifier) && only_ws(self.raw(identifier))
    }

    pub(super) fn text_starts_ws(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.is_text(identifier) && self.raw(identifier).starts_with(is_collapse_ws)
    }

    pub(super) fn text_ends_ws(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.is_text(identifier) && self.raw(identifier).ends_with(is_collapse_ws)
    }

    pub(super) fn text_starts_linebreak(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.is_text(identifier) && starts_with_linebreak(self.raw(identifier), 1)
    }

    pub(super) fn text_ends_linebreak(&self, identifier: TemplateNodeIdentifier, n: usize) -> bool {
        self.is_text(identifier) && ends_with_linebreak(self.raw(identifier), n)
    }

    pub(super) fn element_name(&self, identifier: TemplateNodeIdentifier) -> Option<&'a str> {
        match self.c.node(identifier) {
            TemplateNode::Element { name, .. } => Some(name.text(self.source_text)),
            _ => None,
        }
    }

    /// Svelte's element type, in the context of the element being printed.
    pub(super) fn element_kind(&self, name: &str) -> ElementKind {
        if rsvelte_svelte_syntax::names::is_component_name(name)
            || name.starts_with("svelte:")
            || (name == "title" && self.in_head)
            || (name == "slot" && !self.in_shadow_root)
        {
            ElementKind::Other
        } else {
            ElementKind::Regular
        }
    }

    pub(super) fn is_regular(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.element_name(identifier)
            .is_some_and(|n| self.element_kind(n) == ElementKind::Regular)
    }

    /// `isBlockElement`: by name, every element when whitespace is ignored, none when it is
    /// strict.
    pub(super) fn is_block(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.is_regular(identifier)
            && match self.options.markup_whitespace_sensitivity {
                WhitespaceSensitivity::Display => {
                    BLOCK_ELEMENTS.contains(&self.element_name(identifier).expect("element"))
                }
                WhitespaceSensitivity::Ignore => true,
                WhitespaceSensitivity::Strict => false,
            }
    }

    /// `isInlineElement`; `in_pre` is the path's `isPreTagContent`.
    pub(super) fn is_inline(&self, identifier: TemplateNodeIdentifier, in_pre: bool) -> bool {
        self.is_regular(identifier) && !self.is_block(identifier) && !in_pre
    }

    pub(super) fn children(
        &self,
        identifier: TemplateNodeIdentifier,
    ) -> &'a [TemplateNodeIdentifier] {
        let c = self.c;
        match c.node(identifier) {
            TemplateNode::Element { children, .. } => c.children(*children),
            _ => &[],
        }
    }
}
