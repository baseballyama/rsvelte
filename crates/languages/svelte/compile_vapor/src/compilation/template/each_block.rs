use oxc_span::GetSpan;

use super::{
    AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, DirectiveExpression,
    DirectiveName, Helper, NodeKind, Parent, R, Template, directive, vue,
};
use crate::compilation::span_of;

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

impl Template<'_, '_, '_> {
    pub(super) fn each(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let b = self.b;
        let (compiler_syntax_tree, javascript) =
            (self.i.compiler_syntax_tree, &self.i.component.javascript);
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::Each(each) = &node.kind else {
            unreachable!("called on an each")
        };
        self.helpers.insert(if self.i.server {
            Helper::EachServer
        } else {
            Helper::Each
        });
        let collection = self.template_expression(each.collection);
        let mut source = self.call("$$each", [collection]);
        let mut wrapper = None;
        let mut vue_parent = vue_parent;
        let collection_name = format!("$$each_collection_{}", node.span.start_offset);
        if each.fallback.is_some() {
            let parameter = b.parameter(b.binding(&collection_name));
            let property = self.loop_directive([parameter], b.array([source]), node.span);
            let scope = self.template_node("template", node.span, vec![property], vue_parent);
            wrapper = Some(scope);
            vue_parent = Some(scope);
            source = b.id(&collection_name);
        }
        let context = each.context.map_or_else(
            || b.parameter(b.binding(&format!("$$each_item_{}", node.span.start_offset))),
            |context| self.parameter(javascript.get_pattern(context)),
        );
        let mut parameters = vec![context];
        if let Some(index) = each.index {
            parameters.push(self.parameter(javascript.get_pattern(index)));
        }
        let mut lead = Vec::new();
        if each.fallback.is_some() {
            let length = b.member(b.id(&collection_name), "length");
            lead.push(self.directive_with(DirectiveName::If, Some(length), node.span));
        }
        lead.push(self.loop_directive(parameters, source, node.span));
        if let Some(key) = each.key.filter(|_| each.keyed(javascript)) {
            let span = span_of(self.source(key).span());
            let value = self.template_expression(key);
            lead.push(self.bound("$$key", span, value, span));
        }
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
        let mut children = vec![loop_node];
        if let Some(fallback) = each.fallback {
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            children.push(self.block_element(
                Parent::Each,
                compiler_syntax_tree.children(fallback),
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
}
