use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{Expression, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::Modifiers;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, AttributeValue, ClientCompilationContext, Lists, NodeKind};
use crate::lower::bindings::{Lowering, attribute_value, property_of};
use crate::lower::builder::Runtime;

const TRANSITION_IN: u32 = 1;
const TRANSITION_OUT: u32 = 1 << 1;
const TRANSITION_GLOBAL: u32 = 1 << 2;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The directives of upstream `RegularElement`'s `other_directives`, in attribute order.
    /// An event handler's derived goes to `handlers` when the element's parent declares it at
    /// once, as upstream visits an `on:` with the parent's state.
    pub(super) fn element_directives(
        &mut self,
        attributes: &[Attribute],
        tag: &str,
        node: &str,
        mut handlers: Option<&mut Vec<Statement<'o>>>,
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
                    let mut own = Lists::default();
                    let call = self.event_directive(a, node, false, &mut own);
                    match handlers.as_deref_mut() {
                        Some(handlers) => handlers.append(&mut own.initializer),
                        None => directives.initializer.append(&mut own.initializer),
                    }
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
                    let call = self.binding(a, attributes, tag, node);
                    // Upstream defers a binding beside an action, as it does an event.
                    if has_use {
                        let effect = b.runtime("effect", [b.thunk(call)]);
                        directives.initializer.push(b.stmt(effect));
                    } else {
                        directives.after.push(b.stmt(call));
                    }
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
    pub(super) fn action(
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
    fn binding(
        &self,
        attribute: &Attribute,
        attributes: &[Attribute],
        tag: &str,
        node: &str,
    ) -> Expression<'o> {
        let AttributeValue::Bind(target) = attribute.value else {
            unreachable!("called on bindings")
        };
        let b = self.b;
        let name = attribute.name.text(self.source_text);
        let property = property_of(name).expect("coverage admits known properties");
        let (get, set) = self.binding_accessors(target, true);
        // Upstream drops a setter that is the getter, as both are a prop's accessor.
        let same = matches!((&get, &set),
            (Expression::Identifier(g), Expression::Identifier(s)) if g.name == s.name);
        let accessors = |method, mut arguments: Vec<Expression<'o>>| {
            arguments.push(get.clone_in(b.allocator()));
            if !same {
                arguments.push(set.clone_in(b.allocator()));
            }
            b.runtime(method, arguments)
        };
        let node = b.id(node);
        match property.lowering {
            Lowering::Event(event) => {
                let mut arguments = vec![b.string(name), b.string(event), node, set];
                if property.bidirectional {
                    arguments.push(get);
                }
                b.runtime("bind_property", arguments)
            }
            Lowering::Accessors(method) => accessors(method, vec![node]),
            Lowering::Value if tag == "select" => accessors("bind_select_value", vec![node]),
            Lowering::Value => accessors("bind_value", vec![node]),
            Lowering::Setter(method) => b.runtime(method, [node, set]),
            Lowering::Measured(method) => b.runtime(method, [node, b.string(name), set]),
            Lowering::ContentEditable => {
                accessors("bind_content_editable", vec![b.string(name), node])
            }
            Lowering::Group => self.bind_group(attribute, attributes, tag, node, get, set),
            Lowering::This => unreachable!("lowered on its own"),
        }
    }

    /// Upstream's `$.bind_group(group, indexes, node, get, set)`. The getter also reads a
    /// dynamic `value`, so that the group updates when it changes.
    fn bind_group(
        &self,
        attribute: &Attribute,
        attributes: &[Attribute],
        tag: &str,
        node: Expression<'o>,
        get: Expression<'o>,
        set: Expression<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let (group, blocks) = &self.binding_groups.of[&attribute.span.start_offset];
        let indexes = blocks.iter().map(|&block| {
            let NodeKind::Each(each) = &tree.node(block).kind else {
                unreachable!("a group's blocks are `{{#each}}` blocks")
            };
            let index = b.id(&self.each_index[&block]);
            if each.keyed(self.javascript) && each.index.is_some() {
                b.runtime("get", [index])
            } else {
                index
            }
        });
        let value = (tag != "svelte:element")
            .then(|| attribute_value(self.source_text, attributes, "value"))
            .flatten();
        let get = match value {
            Some(
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression)),
            ) => {
                let AttributeValue::Bind(target) = attribute.value else {
                    unreachable!("a binding")
                };
                let read = b.stmt(self.expression(expression));
                let current = b.return_(Some(self.expression(target)));
                b.arrow_block(b.params([]), [read, current], false)
            }
            _ => get,
        };
        b.runtime(
            "bind_group",
            [
                b.id(&self.binding_groups.names[*group]),
                b.array(indexes),
                node,
                get,
                set,
            ],
        )
    }

    /// Upstream `AttachTag` (client).
    pub(super) fn attach(&self, e: ExpressionIdentifier, node: &str) -> Expression<'o> {
        let b = self.b;
        b.runtime("attach", [b.id(node), b.thunk(self.expression(e))])
    }
}
