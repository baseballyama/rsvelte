use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{ArrowFunctionBody, Directive, Expression, FunctionBody, Statement};
use oxc_span::SPAN;
use rsvelte_svelte_semantic::compiler_syntax_tree::{EachKey, Modifiers};
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, AttributeValue, ClientCompilationContext, Lists, NodeKind};
use crate::lower::bindings::{BindStrategy, attribute_value, property_of};
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
                        directives.initializer.push(b.statement(effect));
                    } else {
                        directives.after.push(b.statement(call));
                    }
                }
                AttributeValue::Bind(expression) if a.name.text(self.source_text) == "this" => {
                    let call = self.bind_this(expression, b.id(node), tag != "svelte:element");
                    directives.initializer.push(b.statement(call));
                }
                AttributeValue::Bind(_) => {
                    let call = self.binding(a, attributes, tag, node);
                    // Upstream defers a binding beside an action, as it does an event.
                    if has_use {
                        let effect = b.runtime("effect", [b.thunk(call)]);
                        directives.initializer.push(b.statement(effect));
                    } else {
                        directives.after.push(b.statement(call));
                    }
                }
                AttributeValue::Attach(e) => {
                    let call = self.attach(e, node);
                    directives.initializer.push(b.statement(call));
                }
                AttributeValue::Use { action, argument } => {
                    let call = self.action(action, argument, node);
                    directives.initializer.push(b.statement(call));
                }
                AttributeValue::Transition { .. } | AttributeValue::Animate { .. } => {
                    directives.after.extend(self.motion(a, node));
                }
                _ => {}
            }
        }
        directives
    }

    /// Upstream `TransitionDirective` and `AnimateDirective`, which run after the update.
    pub(super) fn motion(&self, attribute: &Attribute, node: &str) -> Option<Statement<'o>> {
        let b = self.b;
        let call = match attribute.value {
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
                b.runtime("transition", arguments)
            }
            AttributeValue::Animate { function, argument } => {
                let argument = argument.map_or_else(|| b.null(), |e| b.thunk(self.expression(e)));
                b.runtime(
                    "animation",
                    [b.id(node), b.thunk(self.expression(function)), argument],
                )
            }
            _ => return None,
        };
        Some(b.statement(call))
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
        let mut arguments = vec![b.id(node), b.arrow(b.parameters(parameters), call)];
        arguments.extend(argument.map(|e| b.thunk(self.expression(e))));
        b.runtime("action", arguments)
    }

    /// Upstream `BindDirective` (client, non-dev) for the bindings the unsupported syntax check
    /// admits.
    pub(super) fn binding(
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
        let property =
            property_of(name).expect("the unsupported syntax check admits known properties");
        // Upstream writes the value unproxied only for a regular element.
        let (get, set) = self.binding_accessors(target, !tag.starts_with("svelte:"));
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
        match property.strategy {
            BindStrategy::Event(event) => {
                let mut arguments = vec![b.string(name), b.string(event), node, set];
                if property.bidirectional {
                    arguments.push(get);
                }
                b.runtime("bind_property", arguments)
            }
            BindStrategy::Accessors(method) => accessors(method, vec![node]),
            BindStrategy::Value if tag == "select" => accessors("bind_select_value", vec![node]),
            BindStrategy::Value => accessors("bind_value", vec![node]),
            BindStrategy::Setter(method) => b.runtime(method, [node, set]),
            BindStrategy::Measured(method) => b.runtime(method, [node, b.string(name), set]),
            BindStrategy::ContentEditable => {
                accessors("bind_content_editable", vec![b.string(name), node])
            }
            BindStrategy::Group => self.bind_group(attribute, attributes, tag, node, get, set),
            BindStrategy::This => unreachable!("lowered on its own"),
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
            if matches!(each.key(self.javascript), Ok(EachKey::Keyed { .. }))
                && each.index.is_some()
            {
                b.runtime("get", [index])
            } else {
                index
            }
        });
        let value = (tag != "svelte:element")
            .then(|| attribute_value(self.source_text, attributes, "value"))
            .flatten();
        // Upstream reads the value unmemoized, every chunk of it.
        let read = match value {
            Some(
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression)),
            ) => Some(self.expression(expression)),
            Some(AttributeValue::Interpolated(parts)) => {
                Some(self.chunk(&self.chunk_items(parts), None, false).0)
            }
            _ => None,
        };
        let get = read.map_or(get, |read| self.reading_getter(attribute, read));
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

    /// A group's getter that reads `read` before it returns the bound value.
    fn reading_getter(&self, attribute: &Attribute, read: Expression<'o>) -> Expression<'o> {
        let b = self.b;
        let AttributeValue::Bind(target) = attribute.value else {
            unreachable!("a binding")
        };
        let current = b.return_(Some(self.expression(target)));
        // Upstream prints a string read bare, so its output opens the body with a directive.
        let (directives, read) = match read {
            Expression::StringLiteral(s) if let Some(value) = s.value.as_str() => {
                let raw = b.str(&quoted_raw(value));
                (vec![Directive::new(SPAN, s.unbox(), raw, b)], None)
            }
            read => (Vec::new(), Some(b.statement(read))),
        };
        let statements = b.vec(read.into_iter().chain([current]));
        let body = FunctionBody::boxed(SPAN, b.vec(directives), statements, b);
        Expression::new_arrow_function_expression(
            SPAN,
            false,
            None,
            b.parameters([]),
            None,
            ArrowFunctionBody::FunctionBody(body),
            b,
        )
    }

    /// Upstream `AttachTag` (client).
    pub(super) fn attach(&self, e: ExpressionIdentifier, node: &str) -> Expression<'o> {
        let b = self.b;
        b.runtime("attach", [b.id(node), b.thunk(self.expression(e))])
    }
}

/// A directive's text between single quotes, escaped as upstream's printer (esrap) quotes it.
fn quoted_raw(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '\'' => out.push_str("\\'"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            c => out.push(c),
        }
    }
    out
}
