use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::Modifiers;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, AttributeValue, ClientCompilationContext, Lists, PASSIVE_EVENTS};
use crate::lower::builder::Runtime;

const DELEGATED_EVENTS: &[&str] = &[
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart",
];

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `visit_event_attribute` + `build_event` + `build_event_handler` (non-dev).
    pub(super) fn event(
        &mut self,
        raw_name: &str,
        handler: ExpressionIdentifier,
        node: &str,
        l: &mut Lists<'o>,
    ) {
        self.event_on(raw_name, handler, node, true, l);
    }

    pub(super) fn event_on(
        &mut self,
        raw_name: &str,
        handler: ExpressionIdentifier,
        node: &str,
        allow_delegation: bool,
        l: &mut Lists<'o>,
    ) {
        let b = self.b;
        let mut event_name = &raw_name[2..];
        // Upstream decides delegation on the name with its `capture` suffix.
        let delegated = allow_delegation && DELEGATED_EVENTS.contains(&event_name);
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
        if delegated && !self.events.iter().any(|e| e == event_name) {
            self.events.push(event_name.to_owned());
        }
        let x = if allow_delegation {
            b.id(node)
        } else {
            self.global_event_target(node)
        };
        let cap = capture.then(|| b.boolean(true));
        let passive = PASSIVE_EVENTS
            .contains(&event_name)
            .then(|| b.boolean(true));
        let call = b.runtime_some(
            if delegated { "delegated" } else { "event" },
            vec![
                Some(b.string(event_name)),
                Some(x),
                Some(handler_expression),
                cap,
                passive,
            ],
        );
        if allow_delegation {
            l.after.push(b.stmt(call));
        } else {
            l.initializer.push(b.stmt(call));
        }
    }

    fn event_handler(
        &mut self,
        handler: ExpressionIdentifier,
        l: &mut Lists<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let meta = self.an.meta(handler);
        let built = self.expression(handler);
        let not_import = match self
            .javascript
            .get_expression(handler)
            .get_inner_expression()
        {
            Expression::Identifier(i) => self
                .res
                .symbol(i)
                .is_none_or(|s| !self.res.scoping().symbol_flags(s).is_import()),
            _ => true,
        };
        match &built {
            Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_) => built,
            Expression::Identifier(_) if not_import => built,
            _ => {
                let mut h = built;
                if meta.has_call {
                    let identifier = self.names.generate("event_handler");
                    let derived = b.runtime("derived", [b.thunk(h)]);
                    l.initializer.push(b.var(&identifier, derived));
                    h = b.runtime("get", [b.id(&identifier)]);
                }
                let apply = b.optional_method_call(h, "apply", [b.this(), b.id("$$args")]);
                b.rest_function("$$args", [b.stmt(apply)])
            }
        }
    }

    /// Upstream `OnDirective`: the `$.event` call, which the caller places.
    pub(super) fn event_directive(
        &mut self,
        attribute: &Attribute,
        target: &str,
        global: bool,
        lists: &mut Lists<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let AttributeValue::On { handler, modifiers } = attribute.value else {
            unreachable!("an event directive")
        };
        let mut handler = self.directive_handler(handler, lists);
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
                handler = b.runtime(method, [handler]);
            }
        }
        let name = b.string(attribute.name.text(self.source_text));
        let target = if global {
            self.global_event_target(target)
        } else {
            b.id(target)
        };
        let capture = modifiers
            .contains(Modifiers::CAPTURE)
            .then(|| b.boolean(true));
        let passive = if modifiers.contains(Modifiers::PASSIVE) {
            Some(b.boolean(true))
        } else if modifiers.contains(Modifiers::NONPASSIVE) {
            Some(b.boolean(false))
        } else {
            None
        };
        b.runtime_some(
            "event",
            vec![Some(name), Some(target), Some(handler), capture, passive],
        )
    }

    /// Upstream `build_event_handler` of an `on:` directive, which re-dispatches the event to the
    /// component's own listeners when it has no handler.
    pub(super) fn directive_handler(
        &mut self,
        handler: Option<ExpressionIdentifier>,
        lists: &mut Lists<'o>,
    ) -> Expression<'o> {
        if let Some(handler) = handler {
            return self.event_handler(handler, lists);
        }
        let b = self.b;
        self.needs_props = true;
        let call = b.member(b.member(b.id("$"), "bubble_event"), "call");
        let call = b.call(call, [b.this(), b.id("$$props"), b.id("$$arg")]);
        b.function_expression(None, b.params(["$$arg"]), [b.stmt(call)], false)
    }

    fn global_event_target(&self, node: &str) -> Expression<'o> {
        let b = self.b;
        let target = b.member(
            b.id("$"),
            if node == "$.window" {
                "window"
            } else {
                "document"
            },
        );
        if node == "$.document.body" {
            b.member(target, "body")
        } else {
            target
        }
    }
}
