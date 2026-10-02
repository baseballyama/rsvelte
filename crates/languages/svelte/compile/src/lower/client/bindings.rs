use super::{
    AssignmentOperator, Attribute, ClientCompilationContext, Kind, NodeIdentifier, R,
    SourceLocation, check_binding,
};

impl ClientCompilationContext<'_> {
    /// Upstream `BindDirective` (client, non-dev) for the bindings [`check_binding`] admits.
    pub(super) fn binding(
        &mut self,
        a: &Attribute,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
    ) -> R<NodeIdentifier> {
        let e = check_binding(
            self.javascript,
            self.res,
            self.source_text,
            tag,
            attributes,
            a,
        )?;
        let get = self.expression(e);
        let get = self.thunk(get);
        let value = self.out.identifier("$$value");
        let assignment = if let Kind::Identifier(_) = self.javascript.kind(e) {
            // An element binding's value is a primitive: upstream never proxies it.
            let x = self
                .out
                .ident(self.javascript.name(e), self.javascript.source_location(e));
            self.out.runtime("$", "set", &[x, value])
        } else {
            let target = self.expression(e);
            self.out.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            )
        };
        let param = self.out.identifier("$$value");
        let set = self
            .out
            .arrow(&[param], assignment, true, false, SourceLocation::SYNTHETIC);
        let set = self.unthunk(set);
        let x = self.out.identifier(node);
        let method = match a.name.text(self.source_text) {
            "value" if tag == "select" => "bind_select_value",
            "value" => "bind_value",
            "checked" => "bind_checked",
            p => unreachable!("`check_binding` admits no `bind:{p}`"),
        };
        Ok(self.call(method, vec![Some(x), Some(get), Some(set)]))
    }

    /// Upstream `AttachTag` (client).
    pub(super) fn attach(&mut self, e: NodeIdentifier, node: &str) -> NodeIdentifier {
        let value = self.expression(e);
        let thunk = self.thunk(value);
        let x = self.out.identifier(node);
        self.call("attach", vec![Some(x), Some(thunk)])
    }
}
