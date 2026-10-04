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
        self.event_on(raw_name, handler, node, true, l);
    }

    pub(super) fn event_on(
        &mut self,
        raw_name: &str,
        handler: NodeIdentifier,
        node: &str,
        allow_delegation: bool,
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
        let handler_expression = self.event_handler(handler, l);
        let delegated = allow_delegation && DELEGATED_EVENTS.contains(&event_name);
        if delegated && !self.events.iter().any(|e| e == event_name) {
            self.events.push(event_name.to_owned());
        }
        let name = self.out.write_string(event_name);
        let x = if allow_delegation {
            self.out.identifier(node)
        } else {
            self.global_event_target(node)
        };
        let cap = capture.then(|| self.tru());
        let passive = PASSIVE_EVENTS.contains(&event_name).then(|| self.tru());
        let call = self.call(
            if delegated { "delegated" } else { "event" },
            vec![Some(name), Some(x), Some(handler_expression), cap, passive],
        );
        let statement = self.statement(call);
        if allow_delegation {
            l.after.push(statement);
        } else {
            l.initializer.push(statement);
        }
    }

    fn event_handler(&mut self, handler: NodeIdentifier, l: &mut Lists) -> NodeIdentifier {
        let meta = self.an.meta(handler);
        let built = self.expression(handler);
        match self.out.kind(built) {
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
        }
    }

    pub(super) fn event_directive(
        &mut self,
        attribute: &super::Attribute,
        target: &str,
        global: bool,
        lists: &mut Lists,
    ) {
        use rsvelte_svelte::compilation::compiler_syntax_tree::Modifiers;
        let super::AttributeValue::On { handler, modifiers } = attribute.value else {
            unreachable!("an event directive")
        };
        let mut handler = if let Some(handler) = handler {
            self.event_handler(handler, lists)
        } else {
            self.needs_props = true;
            let namespace = self.out.identifier("$");
            let bubble = self.out.dot(namespace, "bubble_event");
            let call = self.out.dot(bubble, "call");
            let this = self.out.this(SourceLocation::SYNTHETIC);
            let props = self.out.identifier("$$props");
            let argument = self.out.identifier("$$arg");
            let call = self.out.call0(call, &[this, props, argument]);
            let statement = self.statement(call);
            let body = self.out.block(&[statement], SourceLocation::SYNTHETIC);
            self.out.function(
                false,
                None,
                &[argument],
                body,
                false,
                SourceLocation::SYNTHETIC,
            )
        };
        for (modifier, method) in [
            (Modifiers::STOP_PROPAGATION, "stopPropagation"),
            (
                Modifiers::STOP_IMMEDIATE_PROPAGATION,
                "stopImmediatePropagation",
            ),
            (Modifiers::PREVENT_DEFAULT, "preventDefault"),
            (Modifiers::SELF, "self"),
            (Modifiers::TRUSTED, "trusted"),
            (Modifiers::ONCE, "once"),
        ] {
            if modifiers.contains(modifier) {
                handler = self.out.runtime("$", method, &[handler]);
            }
        }
        let name = self.out.write_string(attribute.name.text(self.source_text));
        let target = if global {
            self.global_event_target(target)
        } else {
            self.out.identifier(target)
        };
        let capture = modifiers.contains(Modifiers::CAPTURE).then(|| self.tru());
        let passive = if modifiers.contains(Modifiers::PASSIVE) {
            Some(self.tru())
        } else if modifiers.contains(Modifiers::NONPASSIVE) {
            Some(self.out.write_boolean(false, SourceLocation::SYNTHETIC))
        } else {
            None
        };
        let call = self.call(
            "event",
            vec![Some(name), Some(target), Some(handler), capture, passive],
        );
        let statement = self.statement(call);
        if global {
            lists.initializer.push(statement);
        } else {
            lists.after.push(statement);
        }
    }

    fn global_event_target(&mut self, node: &str) -> NodeIdentifier {
        let namespace = self.out.identifier("$");
        let target = self.out.dot(
            namespace,
            if node == "$.window" {
                "window"
            } else {
                "document"
            },
        );
        if node == "$.document.body" {
            self.out.dot(target, "body")
        } else {
            target
        }
    }
}
