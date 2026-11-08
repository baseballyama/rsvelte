use super::{
    AttributeValue, Builder, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    DirectiveExpression, DirectiveName, Helper, LoopExpression, NodeIdentifier, NodeKind, Parent,
    R, SourceLocation, Verbatim, bound, copy, directive, vue,
};

fn has_animation(tree: &CompilerSyntaxTree, body: Children) -> bool {
    tree.children(body).iter().any(|&child| {
        let NodeKind::Element(element) = &tree.node(child).kind else {
            return false;
        };
        tree.attributes(element.attributes)
            .iter()
            .any(|attribute| matches!(attribute.value, AttributeValue::Animate { .. }))
    })
}

impl Builder<'_, '_> {
    #[expect(
        clippy::too_many_lines,
        reason = "the loop and fallback share one evaluated collection"
    )]
    pub(super) fn each(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript) = (self.i.compiler_syntax_tree, self.i.javascript);
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::Each(each) = &node.kind else {
            unreachable!("called on an each")
        };
        self.render_read(each.collection)?;
        let mut source = self.each_source(each.collection);
        let mut wrapper = None;
        let mut vue_parent = vue_parent;
        let collection_name = format!("$$each_collection_{}", node.span.start_offset);
        if each.fallback.is_some() {
            let parameter = self.to.identifier(&collection_name);
            let array = self.to.array(&[source], SourceLocation::SYNTHETIC);
            let props = self.vb.props([directive(
                DirectiveName::For,
                None,
                DirectiveExpression::For(LoopExpression {
                    parameters: vec![parameter],
                    source: array,
                }),
                node.span,
            )]);
            let element = vue::Element {
                tag: super::spelled("template", node.span),
                tag_type: vue::TagType::Template,
                props,
                children: vue::Children::default(),
            };
            let identifier =
                self.vb
                    .node(vue::NodeKind::Element(element), node.span, vue_parent, 0);
            wrapper = Some(identifier);
            vue_parent = Some(identifier);
            source = self.to.identifier(&collection_name);
        }
        let context = if let Some(context) = each.context() {
            self.template_expression(context)
        } else {
            self.to
                .identifier(&format!("$$each_item_{}", node.span.start_offset))
        };
        let mut parameters = vec![context];
        if let Some(i) = each.index() {
            parameters.push(copy(javascript, self.to, &mut Verbatim, i));
        }
        let mut lead = Vec::new();
        if each.fallback.is_some() {
            let list = self.to.identifier(&collection_name);
            let length = self.to.dot(list, "length");
            lead.push(directive(
                DirectiveName::If,
                None,
                DirectiveExpression::Expression(length),
                node.span,
            ));
        }
        lead.push(directive(
            DirectiveName::For,
            None,
            DirectiveExpression::For(LoopExpression { parameters, source }),
            node.span,
        ));
        if let Some(k) = each.key().filter(|_| each.keyed(javascript)) {
            self.render_read(k)?;
            let exp = self.template_expression(k);
            let span = javascript.source_location(k).span().unwrap_or(node.span);
            lead.push(bound("$$key", span, exp, span));
        }
        let mut children = Vec::new();
        let loop_node = self.block_element(
            Parent::Each,
            compiler_syntax_tree.children(each.body),
            vue_parent,
            lead,
            preserve_whitespace,
            node.span,
        )?;
        if has_animation(compiler_syntax_tree, each.body) {
            self.animation_loops.insert(loop_node);
        }
        children.push(loop_node);
        if let Some(f) = each.fallback {
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            children.push(self.block_element(
                Parent::Each,
                compiler_syntax_tree.children(f),
                vue_parent,
                lead,
                preserve_whitespace,
                node.span,
            )?);
        }
        if let Some(wrapper) = wrapper {
            let children = self.vb.children(&children);
            self.vb.set_element_children(wrapper, children);
            out.push(wrapper);
        } else {
            out.extend(children);
        }
        Ok(())
    }

    pub(super) fn each_source(&mut self, collection: NodeIdentifier) -> NodeIdentifier {
        self.helpers.insert(if self.i.server {
            Helper::EachServer
        } else {
            Helper::Each
        });
        let c = self.template_expression(collection);
        self.call("$$each", &[c])
    }
}
