use super::{
    BLOCK_ELEMENTS, Cow, ElementKind, LayoutInstructionIdentifier, LayoutInstructions, Printer,
    TemplateNode, TemplateNodeIdentifier, ends_with_linebreak, is_collapse_ws, only_ws,
    starts_with_linebreak,
};

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
        let t = self.raw_cow(identifier);
        let t = match t {
            Cow::Borrowed(b) => Cow::Borrowed(b.trim_start_matches(is_collapse_ws)),
            Cow::Owned(o) => Cow::Owned(o.trim_start_matches(is_collapse_ws).to_owned()),
        };
        self.set_raw(identifier, t);
    }

    pub(super) fn trim_right(&mut self, identifier: TemplateNodeIdentifier) {
        let t = self.raw_cow(identifier);
        let t = match t {
            Cow::Borrowed(b) => Cow::Borrowed(b.trim_end_matches(is_collapse_ws)),
            Cow::Owned(o) => Cow::Owned(o.trim_end_matches(is_collapse_ws).to_owned()),
        };
        self.set_raw(identifier, t);
    }

    pub(super) fn raw_cow(&self, identifier: TemplateNodeIdentifier) -> Cow<'a, str> {
        match &self.text[identifier as usize] {
            Some(Cow::Borrowed(b)) => Cow::Borrowed(b),
            Some(Cow::Owned(o)) => Cow::Owned(o.clone()),
            None => match self.c.node(identifier) {
                TemplateNode::Text { span } => Cow::Borrowed(span.text(self.source_text)),
                _ => unreachable!("only text nodes have text"),
            },
        }
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

    pub(super) fn element_kind(name: &str) -> ElementKind {
        if name.starts_with(|c: char| c.is_ascii_uppercase()) || name.contains('.') {
            ElementKind::Component
        } else {
            ElementKind::Regular
        }
    }

    pub(super) fn is_regular(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.element_name(identifier)
            .is_some_and(|n| Self::element_kind(n) == ElementKind::Regular)
    }

    /// `isBlockElement` (with `htmlWhitespaceSensitivity: "css"`).
    pub(super) fn is_block(&self, identifier: TemplateNodeIdentifier) -> bool {
        self.is_regular(identifier)
            && BLOCK_ELEMENTS.contains(&self.element_name(identifier).expect("element"))
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
