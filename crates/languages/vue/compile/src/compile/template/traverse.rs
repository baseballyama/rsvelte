use super::{
    CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Exit, Exp, Helper, NOT_CONSTANT,
    Nid, Node, NodeIdentifier, NodeKind, Property, PropertyIdentifier, PropertyKind, R, TagType,
    Transform, Unsupported,
};

impl Transform<'_> {
    // ---- the HIR ------------------------------------------------------------------------

    /// The nodes as the transforms hold them, refusing what the port does not compile.
    pub(super) fn parse_children(&mut self, children: &[CompilerNodeIdentifier]) -> R<Vec<Nid>> {
        let mut out = Vec::with_capacity(children.len());
        for &k in children {
            let node = self.compiler_syntax_tree.node(k);
            let n = match &node.kind {
                NodeKind::Text(t) => {
                    let text = t.text(self.source_text).to_owned();
                    self.push(Node::Text(text))
                }
                NodeKind::Comment { .. } => {
                    return Err(Unsupported::at(
                        "a comment in a compiled template",
                        node.span,
                    ));
                }
                NodeKind::Interpolation { expression } => self.push(Node::Interpolation(Exp {
                    node: *expression,
                    const_type: NOT_CONSTANT,
                    compound: false,
                    event_local: false,
                })),
                NodeKind::Element(el) => {
                    let tag = el.tag.text(self.source_text);
                    let filled_textarea = tag == "textarea"
                        && !self.compiler_syntax_tree.children(el.children).is_empty();
                    if filled_textarea || matches!(tag, "svg" | "math" | "foreignObject") {
                        return Err(Unsupported::at(
                            "this element in a compiled template",
                            el.tag.span(),
                        ));
                    }
                    if el.tag_type != TagType::Element {
                        return Err(Unsupported::at(
                            "a component, slot or template in a compiled template",
                            el.tag.span(),
                        ));
                    }
                    let tag = tag.to_owned();
                    let props = self.parse_props(el.props)?;
                    let children =
                        self.parse_children(self.compiler_syntax_tree.children(el.children))?;
                    self.push(Node::Element {
                        tag,
                        props,
                        children,
                        codegen: None,
                    })
                }
            };
            out.push(n);
        }
        Ok(out)
    }

    pub(super) fn parse_props(
        &self,
        range: rsvelte_kernel::source::index::IndexRange<PropertyIdentifier>,
    ) -> R<Vec<Property>> {
        let mut props = Vec::with_capacity(range.len());
        for (identifier, p) in range.iter().zip(self.compiler_syntax_tree.props(range)) {
            props.push(match &p.kind {
                PropertyKind::Attribute { name, value } => {
                    let name = name.text(self.source_text);
                    if matches!(name, "ref" | "is" | "key") {
                        return Err(Unsupported::at("this attribute", p.span));
                    }
                    Property::Static {
                        name: name.to_owned(),
                        value: value.as_ref().map(|v| v.text(self.source_text).to_owned()),
                    }
                }
                PropertyKind::Directive(d) => {
                    let arg = d.arg.as_ref().map_or("", |a| a.text(self.source_text));
                    if d.name == DirectiveName::Bind && matches!(arg, "class" | "style" | "is") {
                        return Err(Unsupported::at("this bound attribute", p.span));
                    }
                    let raw = match &d.exp {
                        DirectiveExpression::None => NodeIdentifier::NONE,
                        DirectiveExpression::Expression(e) => *e,
                        DirectiveExpression::For(f) => f.source,
                    };
                    Property::Dir {
                        name: d.name,
                        arg: arg.to_owned(),
                        raw,
                        exp: None,
                        identifier,
                    }
                }
            });
        }
        Ok(props)
    }

    // ---- traverseNode --------------------------------------------------------------------

    /// `traverseNode` with the transforms that act on this template, in preset order:
    /// `transformIf`, `transformFor`, `transformExpression`, `transformElement`, `transformText`.
    pub(super) fn traverse(&mut self, mut n: Nid, parent: Option<Nid>) -> R<()> {
        let mut exits: Vec<Exit> = Vec::new();
        let is_if = |d| {
            matches!(
                d,
                DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else
            )
        };
        if let Node::Element { props, .. } = &self.tree[n] {
            let count = |m: &dyn Fn(DirectiveName) -> bool| {
                props
                    .iter()
                    .filter(|p| matches!(p, Property::Dir { name, .. } if m(*name)))
                    .count()
            };
            // `createStructuralDirectiveTransform` runs each one in turn.
            if count(&is_if) > 1 || count(&|d| d == DirectiveName::For) > 1 {
                return Err(Unsupported::nowhere(
                    "two structural directives of one kind",
                ));
            }
        }
        if let Some((name, raw, _)) = self.take_directive(n, is_if) {
            match self.process_if(n, parent, name, raw)? {
                Some((if_node, exit)) => {
                    n = if_node;
                    exits.push(exit);
                }
                None => return Ok(()),
            }
        }
        if let Some((_, raw, identifier)) = self.take_directive(n, |d| d == DirectiveName::For) {
            let (for_node, exit) = self.process_for(n, parent, raw, identifier)?;
            n = for_node;
            exits.push(exit);
        }
        match self.tree[n] {
            Node::Interpolation(e) => {
                let e = self.process_expression(e.node, false)?;
                self.tree[n] = Node::Interpolation(e);
            }
            Node::Element { .. } => self.expression_props(n)?,
            _ => {}
        }
        if matches!(self.tree[n], Node::Element { .. }) {
            exits.push(Exit::Element(n));
        }
        if matches!(
            self.tree[n],
            Node::Root(_) | Node::Element { .. } | Node::For { .. } | Node::Branch { .. }
        ) {
            exits.push(Exit::Text(n));
        }
        match &self.tree[n] {
            Node::Interpolation(_) => self.helper(Helper::ToDisplayString),
            Node::If { branches, .. } => {
                for b in branches.clone() {
                    self.traverse(b, Some(n))?;
                }
            }
            Node::Root(_) | Node::Element { .. } | Node::Branch { .. } | Node::For { .. } => {
                self.traverse_children(n)?;
            }
            _ => {}
        }
        while let Some(exit) = exits.pop() {
            match exit {
                Exit::Element(n) => self.post_transform_element(n)?,
                Exit::Text(n) => self.transform_text(n),
                Exit::If {
                    if_node,
                    branch,
                    key,
                } => {
                    let cg = self.branch_codegen(branch, key);
                    if let Node::If { codegen, .. } = &mut self.tree[if_node] {
                        *codegen = Some(cg);
                    }
                }
                Exit::For(for_node) => {
                    self.v_for -= 1;
                    self.finish_for(for_node);
                }
            }
        }
        Ok(())
    }

    pub(super) fn traverse_children(&mut self, n: Nid) -> R<()> {
        let mut i = 0;
        while i < self.children_of(n).len() {
            let child = self.children_of(n)[i];
            let before = self.children_of(n).len();
            self.traverse(child, Some(n))?;
            // Removals (a `v-else` and the whitespace before it) are at or before `i`.
            i = i + 1 - (before - self.children_of(n).len());
        }
        Ok(())
    }

    /// `createStructuralDirectiveTransform`: removes the first matching directive.
    pub(super) fn take_directive(
        &mut self,
        n: Nid,
        matches: impl Fn(DirectiveName) -> bool,
    ) -> Option<(DirectiveName, NodeIdentifier, PropertyIdentifier)> {
        let Node::Element { props, .. } = &mut self.tree[n] else {
            return None;
        };
        let i = props
            .iter()
            .position(|p| matches!(p, Property::Dir { name, .. } if matches(*name)))?;
        let Property::Dir {
            name,
            raw,
            identifier,
            ..
        } = props.remove(i)
        else {
            unreachable!("matched a directive")
        };
        Some((name, raw, identifier))
    }

    pub(super) fn replace_child(&mut self, parent: Nid, old: Nid, new: Nid) {
        if let Some(slot) = self.children_mut(parent).iter_mut().find(|c| **c == old) {
            *slot = new;
        }
    }
}
