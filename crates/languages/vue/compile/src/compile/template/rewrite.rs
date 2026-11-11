use oxc_ast::ast::{IdentifierReference, ObjectProperty, SimpleAssignmentTarget};
use oxc_ast_visit::{VisitMut, walk_mut};
use rsvelte_typescript_compile::build::Builder;

use super::{BindingType, Expression, Resolution, can_prefix, ref_info};

// ---- generate ----------------------------------------------------------------------------

/// Rewrites a copied template expression's names as inline-mode `rewriteIdentifier` does (or to
/// `_ctx.x` without bindings).
pub(super) struct ExpRewrite<'r, 'b, 'o> {
    pub(super) res: &'r Resolution,
    pub(super) b: &'b Builder<'o>,
    pub(super) inline: bool,
    pub(super) event_local: bool,
}

impl<'o> ExpRewrite<'_, '_, 'o> {
    fn binding(&self, name: &str) -> Option<BindingType> {
        if !self.inline {
            return None;
        }
        self.res.binding_type(name)
    }

    fn prefixed(&self, identifier: &IdentifierReference<'_>) -> bool {
        let name = identifier.name.as_str();
        let local = ref_info(self.res, identifier.reference_id()).local
            || (self.event_local && name == "$event");
        !local && (can_prefix(name) || self.binding(name).is_some())
    }

    fn rewrite_ident(&self, identifier: &IdentifierReference<'_>) -> Expression<'o> {
        let b = self.b;
        let name = identifier.name.as_str();
        let x = b.id_at(name, identifier.span);
        let write = ref_info(self.res, identifier.reference_id()).write;
        match self.binding(name) {
            Some(
                BindingType::SetupConst
                | BindingType::LiteralConst
                | BindingType::SetupReactiveConst,
            ) => x,
            Some(BindingType::SetupRef) => b.member(x, "value"),
            Some(BindingType::SetupMaybeRef) if write => b.member(x, "value"),
            Some(BindingType::SetupMaybeRef | BindingType::SetupLet) => b.call(b.id("_unref"), [x]),
            Some(BindingType::Props) => b.member(b.id("__props"), name),
            None => b.member(b.id("_ctx"), name),
        }
    }
}

impl<'o> VisitMut<'o> for ExpRewrite<'_, '_, 'o> {
    fn visit_expression(&mut self, it: &mut Expression<'o>) {
        if let Expression::Identifier(identifier) = it {
            if self.prefixed(identifier) {
                *it = self.rewrite_ident(identifier);
            }
            return;
        }
        walk_mut::walk_expression(self, it);
    }

    fn visit_object_property(&mut self, it: &mut ObjectProperty<'o>) {
        if it.shorthand
            && let Expression::Identifier(identifier) = &it.value
            && self.prefixed(identifier)
        {
            it.shorthand = false;
        }
        walk_mut::walk_object_property(self, it);
    }

    fn visit_simple_assignment_target(&mut self, it: &mut SimpleAssignmentTarget<'o>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier) = it {
            if self.prefixed(identifier) {
                // Only a member is written: `rewriteIdentifier` never writes through `unref`.
                let rewritten = self.rewrite_ident(identifier);
                if rewritten.is_member_expression() {
                    *it = SimpleAssignmentTarget::from(rewritten.into_member_expression());
                }
            }
            return;
        }
        walk_mut::walk_simple_assignment_target(self, it);
    }
}
