use oxc_ast::ast::IdentifierReference;
use rsvelte_vue_semantic::expressions::is_global;

use super::{
    BindingType, CAN_CACHE, CAN_SKIP_PATCH, CAN_STRINGIFY, DirectiveName, Exp, Expression,
    ExpressionIdentifier, Helper, NOT_CONSTANT, Nid, Node, Parent, Property, R, RefInfo,
    ReferenceId, Transform, Unsupported, can_prefix, collect_identifiers, ref_info,
};
use crate::compile::document_span;

impl Transform<'_> {
    // ---- expressions ---------------------------------------------------------------------

    /// `transformExpression` on an element: every directive's expression but `v-on`'s, which
    /// `transformOn` processes with `$event` in scope.
    pub(super) fn expression_props(&mut self, n: Nid) -> R<()> {
        let Node::Element { props, .. } = &self.tree[n] else {
            return Ok(());
        };
        let todo: Vec<(usize, ExpressionIdentifier)> = props
            .iter()
            .enumerate()
            .filter_map(|(i, p)| match p {
                Property::Dir {
                    name: DirectiveName::Bind | DirectiveName::Model,
                    raw: Some(raw),
                    ..
                } => Some((i, *raw)),
                _ => None,
            })
            .collect();
        for (i, raw) in todo {
            let e = self.process_expression(raw, false)?;
            if let Node::Element { props, .. } = &mut self.tree[n]
                && let Property::Dir { exp, .. } = &mut props[i]
            {
                *exp = Some(e);
            }
        }
        Ok(())
    }

    /// What `reference` names; `$event` is local to an inline `v-on` statement.
    pub(super) fn reference(
        &self,
        reference: ReferenceId,
        name: &str,
        event_local: bool,
    ) -> RefInfo {
        let mut r = ref_info(self.res, reference);
        if event_local && name == "$event" {
            r.local = true;
        }
        r
    }

    /// `processExpression`: the constant type, and the checks and helpers of the identifier
    /// rewrites (`rewriteIdentifier` adds `unref` while it rewrites).
    pub(super) fn process_expression(
        &mut self,
        e: ExpressionIdentifier,
        event_local: bool,
    ) -> R<Exp> {
        let mut out = Exp {
            node: e,
            const_type: NOT_CONSTANT,
            compound: false,
            event_local,
        };
        let javascript = self.javascript;
        let expression = javascript.get_expression(e);
        if let Expression::Identifier(identifier) = expression {
            let name = identifier.name.as_str();
            let local = self
                .reference(identifier.reference_id(), name, event_local)
                .local;
            let binding = self.binding_type(name);
            if !local && (!is_global(name) || binding.is_some()) {
                if matches!(
                    binding,
                    Some(BindingType::SetupConst | BindingType::LiteralConst)
                ) {
                    out.const_type = CAN_SKIP_PATCH;
                }
                self.check_rewrite(identifier, false)?;
            } else if !local {
                out.const_type = CAN_CACHE;
            }
            return Ok(out);
        }
        let mut identifiers = Vec::new();
        collect_identifiers(expression, &mut identifiers);
        if identifiers.is_empty() {
            out.const_type = CAN_STRINGIFY;
            return Ok(out);
        }
        out.compound = true;
        out.const_type = CAN_STRINGIFY;
        for identifier in identifiers {
            let r = identifier
                .reference
                .map(|r| self.reference(r, identifier.name, event_local));
            let need_prefix = r.is_some() && can_prefix(identifier.name);
            let local = r.is_some_and(|r| r.local);
            if need_prefix && !local {
                self.check_rewrite_at(
                    identifier.name,
                    identifier
                        .reference
                        .expect("a prefixed name is a reference"),
                    identifier.span,
                    r.is_some_and(|r| r.write),
                )?;
                out.const_type = NOT_CONSTANT;
            } else if need_prefix || identifier.parent == Parent::Accessed {
                // Reaching here, a name that needs a prefix is local: a scope variable.
                out.const_type = NOT_CONSTANT;
            }
        }
        Ok(out)
    }

    pub(super) fn binding_type(&self, name: &str) -> Option<BindingType> {
        if !self.inline {
            return None;
        }
        self.res.binding_type(name)
    }

    fn check_rewrite(&mut self, identifier: &IdentifierReference<'_>, write: bool) -> R<()> {
        self.check_rewrite_at(
            identifier.name.as_str(),
            identifier.reference_id(),
            document_span(identifier.span),
            write,
        )
    }

    /// Refuses what `rewriteIdentifier` would do that the port does not, and adds its helper.
    fn check_rewrite_at(
        &mut self,
        name: &str,
        reference: ReferenceId,
        span: rsvelte_kernel::source::positions::Span,
        write: bool,
    ) -> R<()> {
        let root_binding = self
            .res
            .symbol_of(reference)
            .is_some_and(|s| self.res.scoping().symbol_scope_id(s) == self.res.root_scope());
        let binding = self.binding_type(name);
        if self.inline && root_binding && binding.is_none() {
            return Err(Unsupported::at(
                "a template reference to a binding compileScript does not classify yet",
                span,
            ));
        }
        match binding {
            Some(BindingType::SetupLet) if write => Err(Unsupported::at(
                "assigning a `let` binding in the template",
                span,
            )),
            Some(BindingType::SetupLet | BindingType::SetupMaybeRef) if !write => {
                self.helper(Helper::Unref);
                Ok(())
            }
            _ => Ok(()),
        }
    }
}
