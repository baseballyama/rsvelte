use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use rsvelte_svelte_semantic::compiler_syntax_tree::Modifiers;

use super::{Attribute, AttributeValue, ClientCompilationContext, Lists};

const TRANSITION_IN: u32 = 1;
const TRANSITION_OUT: u32 = 1 << 1;
const TRANSITION_GLOBAL: u32 = 1 << 2;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The directives of upstream `RegularElement`'s `other_directives`, in attribute order.
    pub(super) fn element_directives(
        &mut self,
        attributes: &[Attribute],
        tag: &str,
        node: &str,
    ) -> Lists<'o> {
        let b = self.b;
        let mut directives = Lists::default();
        // Upstream's `svelte:element` adds its events after the update either way.
        let has_use = tag != "svelte:element"
            && attributes
                .iter()
                .any(|a| matches!(a.value, AttributeValue::Use { .. }));
        for a in attributes {
            match a.value {
                AttributeValue::On { .. } => {
                    let call = self.event_directive(a, node, false, &mut directives);
                    // An action may add listeners first, so the events wait for it.
                    if has_use {
                        let effect = b.runtime("effect", [b.thunk(call)]);
                        directives.initializer.push(b.stmt(effect));
                    } else {
                        directives.after.push(b.stmt(call));
                    }
                }
                AttributeValue::Bind(expression) if a.name.text(self.source_text) == "this" => {
                    let call = self.bind_this(expression, b.id(node), tag != "svelte:element");
                    directives.initializer.push(b.stmt(call));
                }
                AttributeValue::Bind(_) => {
                    let call = self.binding(a, tag, node);
                    directives.after.push(b.stmt(call));
                }
                AttributeValue::Attach(e) => {
                    let call = self.attach(e, node);
                    directives.initializer.push(b.stmt(call));
                }
                AttributeValue::Use { action, argument } => {
                    let call = self.action(action, argument, node);
                    directives.initializer.push(b.stmt(call));
                }
                AttributeValue::Transition {
                    function,
                    argument,
                    intro,
                    outro,
                    modifiers,
                } => {
                    let mut flags = 0;
                    if modifiers.contains(Modifiers::GLOBAL) {
                        flags |= TRANSITION_GLOBAL;
                    }
                    if intro {
                        flags |= TRANSITION_IN;
                    }
                    if outro {
                        flags |= TRANSITION_OUT;
                    }
                    let mut arguments = vec![
                        b.number(f64::from(flags)),
                        b.id(node),
                        b.thunk(self.expression(function)),
                    ];
                    arguments.extend(argument.map(|e| b.thunk(self.expression(e))));
                    directives
                        .after
                        .push(b.stmt(b.runtime("transition", arguments)));
                }
                AttributeValue::Animate { function, argument } => {
                    let argument =
                        argument.map_or_else(|| b.null(), |e| b.thunk(self.expression(e)));
                    let call = b.runtime(
                        "animation",
                        [b.id(node), b.thunk(self.expression(function)), argument],
                    );
                    directives.after.push(b.stmt(call));
                }
                _ => {}
            }
        }
        directives
    }

    /// Upstream `UseDirective`: `$.action(node, ($$node, $$action_arg) => action?.(…), () => arg)`.
    fn action(
        &self,
        action: ExpressionIdentifier,
        argument: Option<ExpressionIdentifier>,
        node: &str,
    ) -> Expression<'o> {
        let b = self.b;
        let mut parameters = vec!["$$node"];
        if argument.is_some() {
            parameters.push("$$action_arg");
        }
        let call = b.optional_call(self.expression(action), parameters.iter().map(|&p| b.id(p)));
        let mut arguments = vec![b.id(node), b.arrow(b.params(parameters), call)];
        arguments.extend(argument.map(|e| b.thunk(self.expression(e))));
        b.runtime("action", arguments)
    }

    /// Upstream `BindDirective` (client, non-dev) for the bindings coverage admits.
    fn binding(&self, a: &Attribute, tag: &str, node: &str) -> Expression<'o> {
        let AttributeValue::Bind(e) = a.value else {
            unreachable!("called on bindings")
        };
        let (get, set) = self.binding_accessors(e, true);
        let method = match a.name.text(self.source_text) {
            "value" if tag == "select" => "bind_select_value",
            "value" => "bind_value",
            "checked" => "bind_checked",
            p => unreachable!("coverage admits no `bind:{p}`"),
        };
        self.b.runtime(method, [self.b.id(node), get, set])
    }

    /// Upstream `AttachTag` (client).
    fn attach(&self, e: ExpressionIdentifier, node: &str) -> Expression<'o> {
        let b = self.b;
        b.runtime("attach", [b.id(node), b.thunk(self.expression(e))])
    }
}
