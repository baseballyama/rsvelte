//! svelte2tsx's checks for an element's `on:`, `use:`, transition, `animate:` and `style:`
//! directives, which call the helpers of its shims.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range};

use super::{Builder, Node, NodeIdentifier, Result, SourceExpression, Unsupported};

/// What an element's directives add around its `createElement` call.
#[derive(Default)]
pub(super) struct Directives {
    /// `const` declarations of the actions, before the call.
    pub(super) actions: Vec<NodeIdentifier>,
    /// The names of those declarations, which the call merges into the element's attributes.
    pub(super) action_names: Vec<NodeIdentifier>,
    /// Statements after the call.
    pub(super) checks: Vec<NodeIdentifier>,
    /// The arguments of a component's `$on` calls.
    pub(super) events: Vec<Range>,
    /// The properties of the pattern that a component's `let:` directives destructure.
    pub(super) lets: Vec<NodeIdentifier>,
}

impl Directives {
    pub(super) fn clear(&mut self) {
        self.actions.clear();
        self.action_names.clear();
        self.checks.clear();
        self.events.clear();
        self.lets.clear();
    }
}

impl Builder<'_> {
    /// `"on:name": handler` on an element, or `undefined` for a forwarded event.
    pub(super) fn event_property(&mut self, attribute: &Attribute) -> Result<NodeIdentifier> {
        let unsupported = || Unsupported::at("directives", attribute.span);
        let name = attribute
            .directive_name(&self.component.modifiers)
            .ok_or_else(unsupported)?;
        let value = match attribute.value {
            AttributeValue::True => None,
            AttributeValue::Parts(parts) => match self.component.parts(parts) {
                [] => None,
                &[Part::Expression { expression, span }] => {
                    Some(self.expression_source(expression, Some(span.end_offset - 1)))
                }
                _ => return Err(unsupported()),
            },
        };
        let end = value.map(|_| name.end_offset);
        let value = value.unwrap_or_else(|| self.tree.push(Node::Identifier("undefined")));
        Ok(self.tree.push(Node::Property {
            name: Span::new(name.start_offset - "on:".len() as u32, name.end_offset),
            lowercase: false,
            value,
            end,
        }))
    }

    /// The arguments of svelte2tsx's `$on("name", handler)` for `on:` on a component.
    pub(super) fn component_event(&mut self, attribute: &Attribute) -> Result<Range> {
        let unsupported = || Unsupported::at("directives", attribute.span);
        let name = attribute
            .directive_name(&self.component.modifiers)
            .ok_or_else(unsupported)?;
        let handler = match attribute.value {
            AttributeValue::True => None,
            AttributeValue::Parts(parts) => match self.component.parts(parts) {
                [] => None,
                &[Part::Expression { expression, .. }] => {
                    Some(self.expression_source(expression, None))
                }
                _ => return Err(unsupported()),
            },
        };
        let handler = handler.unwrap_or_else(|| self.tree.push(Node::Identifier("() => {}")));
        let text = self.tree.push(Node::Text(name));
        let parts = self.tree.list(&[text]);
        let name = self.tree.push(Node::String {
            parts,
            template: false,
        });
        Ok(self.tree.list(&[name, handler]))
    }

    /// `name` or `name: pattern` for `let:name={pattern}` on a component.
    pub(super) fn component_let(&mut self, attribute: &Attribute) -> Result<NodeIdentifier> {
        let unsupported = || Unsupported::at("directives", attribute.span);
        let name = attribute
            .directive_name(&self.component.modifiers)
            .ok_or_else(unsupported)?;
        let pattern = match attribute.value {
            AttributeValue::True => None,
            AttributeValue::Parts(parts) => match self.component.parts(parts) {
                [] => None,
                &[Part::Expression { expression, .. }] => {
                    Some(self.expression_source(expression, None))
                }
                _ => return Err(unsupported()),
            },
        };
        let Some(value) = pattern else {
            let value = self.tree.push(Node::Source(SourceExpression {
                span: name,
                end: name.end_offset,
            }));
            return Ok(self.tree.push(Node::Shorthand(value)));
        };
        Ok(self.tree.push(Node::Property {
            name,
            lowercase: false,
            value,
            end: None,
        }))
    }

    /// svelte2tsx's `const { … } = component.$$slot_def.default;` for a component's `let:`.
    pub(super) fn component_lets(&mut self, component: NodeIdentifier, lets: &[NodeIdentifier]) {
        if lets.is_empty() {
            return;
        }
        let properties = self.tree.list(lets);
        let name = self.tree.push(Node::Object { properties });
        let object = self.instance(component);
        let property = self.tree.push(Node::Identifier("$$slot_def"));
        let object = self.tree.push(Node::Member { object, property });
        let property = self.tree.push(Node::Identifier("default"));
        let value = self.tree.push(Node::Member { object, property });
        self.scratch
            .push(self.tree.push(Node::Const { name, value }));
    }

    /// `__rsvelte_instance(component)`: the instance svelte2tsx constructs.
    fn instance(&mut self, component: NodeIdentifier) -> NodeIdentifier {
        let callee = self.tree.push(Node::Identifier("__rsvelte_instance"));
        let arguments = self.tree.list(&[component]);
        self.tree.push(Node::Call { callee, arguments })
    }

    /// `__rsvelte_instance(component).$on(name, handler);` for each event.
    pub(super) fn component_events(&mut self, component: NodeIdentifier, events: &[Range]) {
        for &arguments in events {
            let object = self.instance(component);
            let property = self.tree.push(Node::Identifier("$on"));
            let callee = self.tree.push(Node::Member { object, property });
            let call = self.tree.push(Node::Call { callee, arguments });
            self.scratch.push(self.tree.push(Node::Statement(call)));
        }
    }

    /// Adds what `use:`, a transition, `animate:` or `style:` on the element `tag` checks.
    pub(super) fn directive(
        &mut self,
        attribute: &Attribute,
        tag: Span,
        directives: &mut Directives,
    ) -> Result<()> {
        let unsupported = || Unsupported::at("directives", attribute.span);
        let name = attribute
            .directive_name(&self.component.modifiers)
            .ok_or_else(unsupported)?;
        if attribute.kind == AttributeKind::Style {
            let value = self.style_value(attribute, name);
            let callee = self.tree.push(Node::Identifier("__sveltets_2_ensureType"));
            let string = self.tree.push(Node::Identifier("String"));
            let number = self.tree.push(Node::Identifier("Number"));
            let arguments = self.tree.list(&[string, number, value]);
            let call = self.tree.push(Node::Call { callee, arguments });
            directives
                .checks
                .push(self.tree.push(Node::Statement(call)));
            return Ok(());
        }
        let argument = match attribute.value {
            AttributeValue::True => None,
            AttributeValue::Parts(parts) => match self.component.parts(parts) {
                [] => None,
                &[Part::Expression { expression, .. }] => {
                    let value = self.expression_source(expression, None);
                    Some(self.tree.push(Node::Parenthesized(value)))
                }
                _ => return Err(unsupported()),
            },
        };
        let element = self.map_element_tag(tag);
        let movement = (attribute.kind == AttributeKind::Animate).then(|| {
            self.tree
                .push(Node::Identifier("__sveltets_2_AnimationMove"))
        });
        let callee = self.tree.push(Node::Source(SourceExpression {
            span: name,
            end: name.end_offset,
        }));
        let arguments = match (movement, argument) {
            (Some(movement), Some(argument)) => self.tree.list(&[element, movement, argument]),
            (Some(other), None) | (None, Some(other)) => self.tree.list(&[element, other]),
            (None, None) => self.tree.list(&[element]),
        };
        let call = self.tree.push(Node::Call { callee, arguments });
        let helper = match attribute.kind {
            AttributeKind::Use => "__sveltets_2_ensureAction",
            AttributeKind::Animate => "__sveltets_2_ensureAnimation",
            _ => "__sveltets_2_ensureTransition",
        };
        let callee = self.tree.push(Node::Identifier(helper));
        let arguments = self.tree.list(&[call]);
        let call = self.tree.push(Node::Call { callee, arguments });
        if attribute.kind == AttributeKind::Use {
            let after =
                directives
                    .action_names
                    .last()
                    .map_or(0, |&last| match self.tree.node(last) {
                        Node::GeneratedIdentifier { index, .. } => index + 1,
                        _ => 0,
                    });
            let name = self.unused_name_from("__rsvelte_action", after);
            directives
                .actions
                .push(self.tree.push(Node::Const { name, value: call }));
            directives.action_names.push(name);
        } else {
            directives
                .checks
                .push(self.tree.push(Node::Statement(call)));
        }
        Ok(())
    }

    /// svelte2tsx's `svelteHTML.mapElementTag('tag')`.
    fn map_element_tag(&mut self, tag: Span) -> NodeIdentifier {
        let object = self.tree.push(Node::Identifier("svelteHTML"));
        let property = self.tree.push(Node::Identifier("mapElementTag"));
        let callee = self.tree.push(Node::Member { object, property });
        let name = if tag.text(self.source) == "svelte:body" {
            self.tree.push(Node::StringLiteral("body"))
        } else {
            let text = self.tree.push(Node::Text(tag));
            let parts = self.tree.list(&[text]);
            self.tree.push(Node::String {
                parts,
                template: false,
            })
        };
        let arguments = self.tree.list(&[name]);
        self.tree.push(Node::Call { callee, arguments })
    }

    /// The value `style:name` checks: the name itself without a value, a string of a text or of
    /// several parts, or the one expression.
    fn style_value(&mut self, attribute: &Attribute, name: Span) -> NodeIdentifier {
        let parts = match attribute.value {
            AttributeValue::True => &[][..],
            AttributeValue::Parts(range) => self.component.parts(range),
        };
        match *parts {
            [] => self.tree.push(Node::Source(SourceExpression {
                span: name,
                end: name.end_offset,
            })),
            [Part::Expression { expression, .. }] => self.expression_source(expression, None),
            _ => {
                let template = parts.len() > 1;
                let start = self.scratch.len();
                for part in parts {
                    let value = match *part {
                        Part::Text(span) => self.tree.push(Node::Text(span)),
                        Part::Expression { expression, span } => {
                            self.expression_source(expression, Some(span.end_offset - 1))
                        }
                    };
                    self.scratch.push(value);
                }
                let parts = self.finish_list(start);
                self.tree.push(Node::String { parts, template })
            }
        }
    }
}
