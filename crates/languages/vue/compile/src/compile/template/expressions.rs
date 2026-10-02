use rsvelte_vue::semantic::expressions::is_global;

use super::{
    BindingType, CAN_CACHE, CAN_SKIP_PATCH, CAN_STRINGIFY, DirectiveName, Exp, Helper, Kind,
    NOT_CONSTANT, Nid, Node, NodeIdentifier, Property, R, RefInfo, ScopeIdentifier, Transform,
    Unsupported, can_prefix, collect_identifiers,
};

impl Transform<'_> {
    // ---- expressions ---------------------------------------------------------------------

    /// `transformExpression` on an element: every directive's expression but `v-on`'s, which
    /// `transformOn` processes with `$event` in scope.
    pub(super) fn expression_props(&mut self, n: Nid) -> R<()> {
        let Node::Element { props, .. } = &self.tree[n] else {
            return Ok(());
        };
        let todo: Vec<(usize, NodeIdentifier)> = props
            .iter()
            .enumerate()
            .filter_map(|(i, p)| match p {
                Property::Dir {
                    name: DirectiveName::Bind | DirectiveName::Model,
                    raw,
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

    pub(super) fn reference(
        &self,
        identifier: NodeIdentifier,
        event_local: bool,
    ) -> Option<RefInfo> {
        let mut r = *self.references.get(&identifier)?;
        if event_local && self.javascript.name(identifier) == "$event" {
            r.local = true;
        }
        Some(r)
    }

    /// `processExpression`: the constant type, and the checks and helpers of the identifier
    /// rewrites (`rewriteIdentifier` adds `unref` while it rewrites).
    pub(super) fn process_expression(&mut self, e: NodeIdentifier, event_local: bool) -> R<Exp> {
        let mut out = Exp {
            node: e,
            const_type: NOT_CONSTANT,
            compound: false,
            event_local,
        };
        if let Kind::Identifier(_) = self.javascript.kind(e) {
            let name = self.javascript.name(e);
            let local = self.reference(e, event_local).is_some_and(|r| r.local);
            let binding = self.binding_type(e);
            if !local && (!is_global(name) || binding.is_some()) {
                if matches!(
                    binding,
                    Some(BindingType::SetupConst | BindingType::LiteralConst)
                ) {
                    out.const_type = CAN_SKIP_PATCH;
                }
                self.check_rewrite(e, false)?;
            } else if !local {
                out.const_type = CAN_CACHE;
            }
            return Ok(out);
        }
        let mut identifiers = Vec::new();
        collect_identifiers(self.javascript, e, None, &mut identifiers);
        if identifiers.is_empty() {
            out.const_type = CAN_STRINGIFY;
            return Ok(out);
        }
        out.compound = true;
        out.const_type = CAN_STRINGIFY;
        for (identifier, parent) in identifiers {
            let r = self.reference(identifier, event_local);
            let need_prefix = r.is_some() && can_prefix(self.javascript.name(identifier));
            let local = r.is_some_and(|r| r.local);
            if need_prefix && !local {
                self.check_rewrite(identifier, r.is_some_and(|r| r.write))?;
                out.const_type = NOT_CONSTANT;
            } else {
                // Reaching here, a name that needs a prefix is local: a scope variable.
                let accessed = parent.is_some_and(|p| {
                    matches!(
                        self.javascript.kind(p),
                        Kind::Call { .. } | Kind::New { .. } | Kind::Member { .. }
                    )
                });
                if need_prefix || accessed {
                    out.const_type = NOT_CONSTANT;
                }
            }
        }
        Ok(out)
    }

    pub(super) fn binding_type(&self, identifier: NodeIdentifier) -> Option<BindingType> {
        if !self.inline {
            return None;
        }
        self.javascript
            .atom(identifier)
            .and_then(|a| self.res.binding_type(a))
    }

    /// Refuses what `rewriteIdentifier` would do that the port does not, and adds its helper.
    pub(super) fn check_rewrite(&mut self, identifier: NodeIdentifier, write: bool) -> R<()> {
        let source_location = self.javascript.source_location(identifier);
        let root_binding = self
            .res
            .sem
            .binding_of(identifier)
            .is_some_and(|b| self.res.sem.bindings[b].scope == ScopeIdentifier::ROOT);
        if self.inline && root_binding && self.binding_type(identifier).is_none() {
            return Err(Unsupported::at(
                "a template reference to a binding compileScript does not classify yet",
                source_location,
            ));
        }
        match self.binding_type(identifier) {
            Some(BindingType::SetupLet) if write => Err(Unsupported::at(
                "assigning a `let` binding in the template",
                source_location,
            )),
            Some(BindingType::SetupLet | BindingType::SetupMaybeRef) if !write => {
                self.helper(Helper::Unref);
                Ok(())
            }
            _ => Ok(()),
        }
    }
}
