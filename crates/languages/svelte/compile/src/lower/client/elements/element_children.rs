use oxc_ast::ast::{Argument, Expression, Statement};

use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Item, Lists, NodeKind, Prev, R,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The children half of upstream `RegularElement`, under the element's whitespace rule.
    pub(super) fn element_children(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
    ) -> R<Lists<'o>> {
        let b = self.b;
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let cleaned = self.plan.fragment(el.children);
        let items = &cleaned.items;
        let mut child = Lists::default();
        self.hoisted_elements(&cleaned.hoisted, frag, &mut child)?;
        let use_text_content = items.iter().all(|i| match i {
            Item::Text { .. } => true,
            Item::Expression(e) => !self.an.meta(*e).has_state,
            Item::Node(_) => false,
        }) && items.iter().any(|i| matches!(i, Item::Expression(_)));
        if use_text_content {
            let (value, _) = self.template_chunk(items, &mut frag.memo, false);
            let empty = matches!(&value, Expression::StringLiteral(s) if s.value.is_empty());
            if !empty {
                let target = b.member(b.id(node), "textContent");
                child
                    .initializer
                    .push(b.stmt(b.assign_member(target, value)));
            }
        } else {
            let needs_reset = items.iter().any(|i| match i {
                Item::Text { .. } => false,
                Item::Expression(_) => true,
                Item::Node(n) => !self.is_static_element(*n),
            });
            self.process_children(
                items,
                Prev::Call {
                    method: "child",
                    of: node.to_owned(),
                },
                true,
                frag,
                &mut child,
            )?;
            if needs_reset && !self.fold_reset_into_child(&mut child.initializer, node) {
                child
                    .initializer
                    .push(b.stmt(b.runtime("reset", [b.id(node)])));
            }
        }
        Ok(child)
    }

    /// Upstream `fold_reset_into_child`: `var x = $.child(el)` + `$.reset(el)` →
    /// `$.only_child(el)`.
    fn fold_reset_into_child(&self, initializer: &mut [Statement<'o>], node: &str) -> bool {
        let Some(Statement::VariableDeclaration(declaration)) = initializer.last_mut() else {
            return false;
        };
        let [declarator] = declaration.declarations.as_mut_slice() else {
            return false;
        };
        let Some(Expression::CallExpression(call)) = &mut declarator.init else {
            return false;
        };
        let first_is_node = matches!(
            call.arguments.first(),
            Some(Argument::Identifier(a)) if a.name == node
        );
        let Expression::StaticMemberExpression(callee) = &mut call.callee else {
            return false;
        };
        let is_child = matches!(&callee.object, Expression::Identifier(o) if o.name == "$")
            && callee.property.name == "child";
        if !is_child || !first_is_node {
            return false;
        }
        callee.property.name = self.b.str("only_child").into();
        true
    }
}
