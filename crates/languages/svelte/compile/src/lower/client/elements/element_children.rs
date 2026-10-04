use crate::lower::client::{
    AssignmentOperator, ClientCompilationContext, CompilerNodeIdentifier, Frag, Item, Kind, Lists,
    NodeIdentifier, NodeKind, Prev, R, SourceLocation,
};

impl ClientCompilationContext<'_> {
    /// The children half of upstream `RegularElement`, under the element's whitespace rule.
    pub(super) fn element_children(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
    ) -> R<Lists> {
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
            let (value, _) = self.template_chunk(items, frag);
            let empty = matches!(self.out.kind(value), Kind::String)
                && self.out.str_value(value, self.source_text).is_empty();
            if !empty {
                let x = self.out.identifier(node);
                let target = self.out.dot(x, "textContent");
                let assign = self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                );
                child.initializer.push(self.statement(assign));
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
                let x = self.out.identifier(node);
                let call = self.call("reset", vec![Some(x)]);
                child.initializer.push(self.statement(call));
            }
        }
        Ok(child)
    }

    /// Upstream `fold_reset_into_child`: `var x = $.child(el)` + `$.reset(el)` →
    /// `$.only_child(el)`.
    fn fold_reset_into_child(&mut self, initializer: &mut [NodeIdentifier], node: &str) -> bool {
        let Some(&last) = initializer.last() else {
            return false;
        };
        let Kind::VariableDeclaration {
            declarations: [d],
            kind,
        } = self.out.kind(last)
        else {
            return false;
        };
        let d = *d;
        let Kind::Declarator {
            identifier,
            initializer: Some(call),
        } = self.out.kind(d)
        else {
            return false;
        };
        let Kind::Call {
            callee, arguments, ..
        } = self.out.kind(call)
        else {
            return false;
        };
        let is_child = matches!(
            self.out.kind(callee),
            Kind::Member { object, property, computed: false, .. }
                if self.out.name(object) == "$" && self.out.name(property) == "child"
        );
        let first_is_node = arguments
            .first()
            .is_some_and(|&a| self.out.is_identifier(a) && self.out.name(a) == node);
        if !is_child || !first_is_node {
            return false;
        }
        let arguments = arguments.to_vec();
        let new_call = self.out.runtime("$", "only_child", &arguments);
        let declaration =
            self.out
                .declarator(identifier, Some(new_call), SourceLocation::SYNTHETIC);
        let var = self
            .out
            .var_declaration(kind, &[declaration], SourceLocation::SYNTHETIC);
        *initializer.last_mut().expect("checked above") = var;
        true
    }
}
