use super::{
    ClientCompilationContext, DELEGATED_EVENTS, Kind, Lists, NodeIdentifier, PASSIVE_EVENTS,
    SourceLocation,
};

impl ClientCompilationContext<'_> {
    /// Upstream `visit_event_attribute` + `build_event` + `build_event_handler` (non-dev).
    pub(super) fn event(
        &mut self,
        raw_name: &str,
        handler: NodeIdentifier,
        node: &str,
        l: &mut Lists,
    ) {
        let mut event_name = &raw_name[2..];
        let capture = if event_name.ends_with("capture")
            && event_name != "gotpointercapture"
            && event_name != "lostpointercapture"
        {
            event_name = &event_name[..event_name.len() - 7];
            true
        } else {
            false
        };
        let meta = self.an.meta(handler);
        let built = self.expression(handler);
        let handler_expression = match self.javascript.kind(handler) {
            Kind::Arrow { .. }
            | Kind::Function {
                declaration: false, ..
            } => built,
            Kind::Identifier(_)
                if self.res.binding(handler).is_none_or(|(b, _)| {
                    self.res.sem.bindings[b].kind
                        != rsvelte_typescript::scope::DeclarationKind::Import
                }) =>
            {
                built
            }
            _ => {
                let mut h = built;
                if meta.has_call {
                    let identifier = self.names.generate("event_handler");
                    let thunk = self
                        .out
                        .arrow(&[], h, true, false, SourceLocation::SYNTHETIC);
                    let derived = self.call("derived", vec![Some(thunk)]);
                    l.initializer.push(self.var(&identifier, derived));
                    let x = self.out.identifier(&identifier);
                    h = self.call("get", vec![Some(x)]);
                }
                let apply = self.out.ident("apply", SourceLocation::SYNTHETIC);
                let member = self
                    .out
                    .member(h, apply, false, true, SourceLocation::SYNTHETIC);
                let this = self.out.this(SourceLocation::SYNTHETIC);
                let arguments = self.out.identifier("$$args");
                let call =
                    self.out
                        .call(member, &[this, arguments], false, SourceLocation::SYNTHETIC);
                let s = self.statement(call);
                let body = self.out.block(&[s], SourceLocation::SYNTHETIC);
                let rest_identifier = self.out.identifier("$$args");
                let rest = self.out.rest(rest_identifier, SourceLocation::SYNTHETIC);
                self.out
                    .function(false, None, &[rest], body, false, SourceLocation::SYNTHETIC)
            }
        };
        let delegated = DELEGATED_EVENTS.contains(&event_name);
        if delegated && !self.events.iter().any(|e| e == event_name) {
            self.events.push(event_name.to_owned());
        }
        let name = self.out.write_string(event_name);
        let x = self.out.identifier(node);
        let cap = capture.then(|| self.tru());
        let passive = PASSIVE_EVENTS.contains(&event_name).then(|| self.tru());
        let call = self.call(
            if delegated { "delegated" } else { "event" },
            vec![Some(name), Some(x), Some(handler_expression), cap, passive],
        );
        l.after.push(self.statement(call));
    }
}
