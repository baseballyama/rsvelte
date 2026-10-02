use super::{
    BindingType, FxHashMap, Kind, NodeIdentifier, RefInfo, Resolution, Rewrite, SyntaxTree,
    can_prefix,
};

// ---- generate ----------------------------------------------------------------------------

/// Copies a template expression into the output, rewriting names as inline-mode
/// `rewriteIdentifier` does (or to `_context.x` without bindings).
pub(super) struct ExpRewrite<'a> {
    pub(super) res: &'a Resolution,
    pub(super) references: &'a FxHashMap<NodeIdentifier, RefInfo>,
    pub(super) inline: bool,
    pub(super) event_local: bool,
}

impl ExpRewrite<'_> {
    fn binding(&self, from: &SyntaxTree, identifier: NodeIdentifier) -> Option<BindingType> {
        if !self.inline {
            return None;
        }
        from.atom(identifier).and_then(|a| self.res.binding_type(a))
    }

    fn prefixed(&self, from: &SyntaxTree, identifier: NodeIdentifier) -> bool {
        let Some(r) = self.references.get(&identifier) else {
            return false;
        };
        let name = from.name(identifier);
        let local = r.local || (self.event_local && name == "$event");
        !local && (can_prefix(name) || self.binding(from, identifier).is_some())
    }

    fn rewrite_ident(
        &self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> NodeIdentifier {
        let source_location = from.source_location(identifier);
        let x = to.ident(from.name(identifier), source_location);
        let write = self.references.get(&identifier).is_some_and(|r| r.write);
        let member = |to: &mut SyntaxTree, object: &str, x: NodeIdentifier| {
            let o = to.identifier(object);
            to.member(o, x, false, false, source_location)
        };
        match self.binding(from, identifier) {
            Some(
                BindingType::SetupConst
                | BindingType::LiteralConst
                | BindingType::SetupReactiveConst,
            ) => x,
            Some(BindingType::SetupRef) => to.dot(x, "value"),
            Some(BindingType::SetupMaybeRef) if write => to.dot(x, "value"),
            Some(BindingType::SetupMaybeRef | BindingType::SetupLet) => {
                let callee = to.identifier("_unref");
                to.call(callee, &[x], false, source_location)
            }
            Some(BindingType::Props) => member(to, "__props", x),
            None => member(to, "_ctx", x),
        }
    }
}

impl Rewrite for ExpRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
            Kind::Identifier(_) if self.prefixed(from, identifier) => {
                Some(self.rewrite_ident(from, to, identifier))
            }
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } if self.prefixed(from, value) => {
                let k = to.ident(from.name(key), from.source_location(key));
                let v = self.rewrite_ident(from, to, value);
                Some(to.property(k, v, 0, from.source_location(identifier)))
            }
            _ => None,
        }
    }
}
