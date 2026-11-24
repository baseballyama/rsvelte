//! svelte2tsx's `TemplateScope` and the resolution of its `SlotHandler`: the names a `<slot>`
//! prop may read that svelte2tsx unpacks to the value they come from, so that a parent's `let:`
//! of the prop is typed by that value. These are an `{#each}` item, an `{#await}` value or error
//! and a component's `let:`; svelte2tsx copies any other name as it is written.

use oxc_ast::ast::{
    ArrayExpressionElement, BindingIdentifier, BindingPattern, Expression, IdentifierReference,
    ObjectProperty, ObjectPropertyKind,
};
use oxc_ast_visit::{Visit, walk};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Part, Range, TemplateNode,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, PatternIdentifier, document_span, node_span};

use super::Builder;
use crate::syntax_tree::{Node, NodeIdentifier};

/// A name svelte2tsx's scope holds, with what it unpacks.
#[derive(Clone, Copy, Debug)]
pub(super) struct Declared {
    name: Span,
    /// How many names were declared before the block that declares this one: those its value
    /// can read.
    outer: usize,
    unpacks: Unpacks,
    /// The pattern the name is destructured from, when it is.
    pattern: Option<Span>,
    /// The value, once a slot prop has read it.
    value: Option<NodeIdentifier>,
}

#[derive(Clone, Copy, Debug)]
pub(super) enum Unpacks {
    /// An item of the iterable, svelte2tsx's `__sveltets_2_unwrapArr`.
    Item(ExpressionIdentifier),
    /// The awaited value, svelte2tsx's `__sveltets_2_unwrapPromiseLike`.
    Awaited(ExpressionIdentifier),
    /// The error of `{:catch}`, which svelte2tsx types `any`.
    Error,
    /// `property` of the slot `slot` of a component, its default slot without one. Without a
    /// `component`, svelte2tsx's `__sveltets_1_componentType()`, which is `any`.
    Let {
        component: Option<ExpressionIdentifier>,
        slot: Option<Span>,
        property: Span,
    },
}

/// What svelte2tsx's copy of a slot prop writes for a name it reads.
#[derive(Clone, Copy)]
enum Read {
    /// The value of the declared name at this index.
    Declared(usize),
    /// A name declared only in the template, which the render function's return does not see.
    Unseen,
}

const UNTYPED: &str = "__rsvelte_untyped_prop()";

impl<'a> Builder<'a> {
    /// Declares the names `pattern` binds, unpacked from `unpacks`, after the first `outer`.
    pub(super) fn declare_pattern(
        &mut self,
        pattern: PatternIdentifier,
        unpacks: Unpacks,
        outer: usize,
    ) {
        let component = self.component;
        let pattern = &component.javascript.get_pattern(pattern).pattern;
        if let BindingPattern::BindingIdentifier(name) = pattern {
            self.declare(node_span(&**name), unpacks, None, outer);
            return;
        }
        let mut bound = Bound {
            scope: &mut self.slot_scope,
            declared: Declared {
                name: Span::default(),
                outer,
                unpacks,
                pattern: Some(node_span(pattern)),
                value: None,
            },
        };
        bound.visit_binding_pattern(pattern);
    }

    /// svelte2tsx's `handleComponentLet`: the `let:` names of the component and of each child
    /// that fills one of its named slots, after the first `outer`.
    pub(super) fn declare_lets(
        &mut self,
        component: Option<ExpressionIdentifier>,
        attributes: Range,
        children: Range,
        outer: usize,
    ) {
        self.declare_lets_of(component, None, attributes, outer);
        let tree = self.component;
        for &child in tree.children(children) {
            let TemplateNode::Element { attributes, .. } = *tree.node(child) else {
                continue;
            };
            let slot = tree.attributes(attributes).iter().find_map(|a| {
                let AttributeValue::Parts(parts) = a.value else {
                    return None;
                };
                match tree.parts(parts).first() {
                    Some(Part::Text(text))
                        if a.kind == AttributeKind::Attribute
                            && a.name.text(self.source) == "slot"
                            && !text.is_empty() =>
                    {
                        Some(*text)
                    }
                    _ => None,
                }
            });
            if slot.is_some() {
                self.declare_lets_of(component, slot, attributes, outer);
            }
        }
    }

    fn declare_lets_of(
        &mut self,
        component: Option<ExpressionIdentifier>,
        slot: Option<Span>,
        attributes: Range,
        outer: usize,
    ) {
        let tree = self.component;
        let javascript = &tree.javascript;
        for attribute in tree.attributes(attributes) {
            if attribute.kind != AttributeKind::Let {
                continue;
            }
            let Some(property) = attribute.directive_name(&tree.modifiers) else {
                continue;
            };
            let unpacks = Unpacks::Let {
                component,
                slot,
                property,
            };
            let expression = match attribute.value {
                AttributeValue::Parts(parts) => match tree.parts(parts) {
                    &[Part::Expression { expression, .. }] => {
                        Some(javascript.get_expression(expression))
                    }
                    _ => None,
                },
                AttributeValue::True => None,
            };
            // svelte2tsx reads an object or array as the pattern it is, and none nested in it.
            match expression {
                None => self.declare(property, unpacks, None, outer),
                Some(Expression::Identifier(name)) => {
                    self.declare(node_span(&**name), unpacks, None, outer);
                }
                Some(pattern @ Expression::ObjectExpression(object)) => {
                    for property in &object.properties {
                        if let ObjectPropertyKind::ObjectProperty(property) = property
                            && let Expression::Identifier(name) = &property.value
                        {
                            self.declare(
                                node_span(&**name),
                                unpacks,
                                Some(node_span(pattern)),
                                outer,
                            );
                        }
                    }
                }
                Some(pattern @ Expression::ArrayExpression(array)) => {
                    for element in &array.elements {
                        if let ArrayExpressionElement::Identifier(name) = element {
                            self.declare(
                                node_span(&**name),
                                unpacks,
                                Some(node_span(pattern)),
                                outer,
                            );
                        }
                    }
                }
                Some(_) => {}
            }
        }
    }

    fn declare(&mut self, name: Span, unpacks: Unpacks, pattern: Option<Span>, outer: usize) {
        self.slot_scope.push(Declared {
            name,
            outer,
            unpacks,
            pattern,
            value: None,
        });
    }

    /// svelte2tsx's `resolveExpression`: `expression` as svelte2tsx copies it into the slots,
    /// with each name the first `outer` declare written as the value it unpacks. `None` without
    /// the analysis.
    pub(super) fn slot_value(
        &mut self,
        expression: &'a Expression<'a>,
        outer: usize,
    ) -> Option<NodeIdentifier> {
        let span = node_span(expression);
        let mut reads = Reads {
            declared: &self.slot_scope[..outer],
            source: self.source,
            resolution: (self.resolution)()?,
            within: span,
            found: Vec::new(),
        };
        reads.visit_expression(expression);
        let reads = reads.found;
        if reads.is_empty() {
            return Some(self.tree.push(Node::UnmappedSource(span)));
        }
        let start = self.scratch.len();
        let mut cursor = span.start_offset;
        for (name, shorthand, read) in reads {
            let Some(value) = (match read {
                Read::Declared(index) => self.declared_value(index),
                Read::Unseen => Some(self.tree.push(Node::Identifier(UNTYPED))),
            }) else {
                self.scratch.truncate(start);
                return None;
            };
            if cursor < name.start_offset {
                let before = Span::new(cursor, name.start_offset);
                self.scratch
                    .push(self.tree.push(Node::UnmappedSource(before)));
            }
            if shorthand {
                self.scratch
                    .push(self.tree.push(Node::UnmappedSource(name)));
                self.scratch.push(self.tree.push(Node::Identifier(": ")));
            }
            self.scratch.push(value);
            cursor = name.end_offset;
        }
        if cursor < span.end_offset {
            let after = Span::new(cursor, span.end_offset);
            self.scratch
                .push(self.tree.push(Node::UnmappedSource(after)));
        }
        let parts = self.finish_list(start);
        Some(self.tree.push(Node::Parts(parts)))
    }

    /// svelte2tsx's `getResolveExpressionStr`, or its `getResolveExpressionStrForLet`, of the
    /// declared name at `index`, and the arrow that picks it out of its pattern.
    fn declared_value(&mut self, index: usize) -> Option<NodeIdentifier> {
        let declared = self.slot_scope[index];
        if let Some(value) = declared.value {
            return Some(value);
        }
        let value = match declared.unpacks {
            Unpacks::Item(iterable) => {
                self.unpacked("__sveltets_2_unwrapArr", iterable, declared.outer)?
            }
            Unpacks::Awaited(promise) => {
                self.unpacked("__sveltets_2_unwrapPromiseLike", promise, declared.outer)?
            }
            Unpacks::Error => self.tree.push(Node::Identifier(UNTYPED)),
            Unpacks::Let {
                component,
                slot,
                property,
            } => self.slot_property_of(component, slot, property)?,
        };
        let value = match declared.pattern {
            None => value,
            Some(pattern) => {
                let parts = [
                    Node::Identifier("(("),
                    Node::UnmappedSource(pattern),
                    Node::Identifier(") => "),
                    Node::UnmappedSource(declared.name),
                    Node::Identifier(")("),
                    Node::Identifier(")"),
                ]
                .map(|part| self.tree.push(part));
                let [open, pattern, arrow, name, call, close] = parts;
                let parts = self
                    .tree
                    .list(&[open, pattern, arrow, name, call, value, close]);
                self.tree.push(Node::Parts(parts))
            }
        };
        self.slot_scope[index].value = Some(value);
        Some(value)
    }

    /// `helper(expression)`, with the names the first `outer` declare unpacked.
    fn unpacked(
        &mut self,
        helper: &'static str,
        expression: ExpressionIdentifier,
        outer: usize,
    ) -> Option<NodeIdentifier> {
        let tree = self.component;
        let argument = self.slot_value(tree.javascript.get_expression(expression), outer)?;
        let callee = self.tree.push(Node::Identifier(helper));
        let arguments = self.tree.list(&[argument]);
        Some(self.tree.push(Node::Call { callee, arguments }))
    }

    /// `__rsvelte_instance(component).$$slot_def[slot].property`, where svelte2tsx copies the
    /// component's name and reads no name it unpacks.
    fn slot_property_of(
        &mut self,
        component: Option<ExpressionIdentifier>,
        slot: Option<Span>,
        property: Span,
    ) -> Option<NodeIdentifier> {
        let component = match component {
            Some(component) => {
                let tree = self.component;
                self.slot_value(tree.javascript.get_expression(component), 0)?
            }
            None => self.tree.push(Node::Identifier(UNTYPED)),
        };
        let callee = self.tree.push(Node::Identifier("__rsvelte_instance"));
        let arguments = self.tree.list(&[component]);
        let object = self.tree.push(Node::Call { callee, arguments });
        let definition = self.tree.push(Node::Identifier("$$slot_def"));
        let object = self.tree.push(Node::Member {
            object,
            property: definition,
        });
        let object = if let Some(slot) = slot {
            let text = self.tree.push(Node::Text(slot));
            let parts = self.tree.list(&[text]);
            let index = self.tree.push(Node::String {
                parts,
                template: false,
            });
            self.tree.push(Node::Index { object, index })
        } else {
            let property = self.tree.push(Node::Identifier("default"));
            self.tree.push(Node::Member { object, property })
        };
        let property = self.tree.push(Node::UnmappedSource(property));
        Some(self.tree.push(Node::Member { object, property }))
    }
}

/// Declares each name a pattern binds as `declared` declares its own.
struct Bound<'s> {
    scope: &'s mut Vec<Declared>,
    declared: Declared,
}

impl<'a> Visit<'a> for Bound<'_> {
    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        self.scope.push(Declared {
            name: node_span(it),
            ..self.declared
        });
    }
}

/// The names in a slot prop that svelte2tsx's copy writes otherwise: each with whether it is an
/// object's shorthand property.
struct Reads<'r> {
    declared: &'r [Declared],
    source: &'r str,
    resolution: &'r Resolution,
    within: Span,
    found: Vec<(Span, bool, Read)>,
}

impl Reads<'_> {
    fn read(&mut self, reference: &IdentifierReference<'_>, shorthand: bool) {
        let symbol = self.resolution.symbol(reference);
        let scoping = self.resolution.scoping();
        // A name the prop itself binds, such as an arrow's parameter, is neither.
        if let Some(symbol) = symbol {
            let declared = document_span(scoping.symbol_span(symbol));
            if self.within.start_offset <= declared.start_offset
                && declared.end_offset <= self.within.end_offset
            {
                return;
            }
        }
        let name = node_span(reference);
        let text = name.text(self.source);
        let read = if let Some(index) =
            (self.declared.iter()).rposition(|declared| declared.name.text(self.source) == text)
        {
            Read::Declared(index)
        // A template name svelte2tsx does not unpack is unseen where its copy is read, unless a
        // script declares the same name.
        } else if let Some(symbol) = symbol
            && let scope = scoping.symbol_scope_id(symbol)
            && scope != self.resolution.instance_scope()
            && scope != scoping.root_scope_id()
            && scoping
                .find_binding(self.resolution.instance_scope(), text.into())
                .is_none()
        {
            Read::Unseen
        } else {
            return;
        };
        self.found.push((name, shorthand, read));
    }
}

impl<'a> Visit<'a> for Reads<'_> {
    fn visit_object_property(&mut self, it: &ObjectProperty<'a>) {
        if it.shorthand
            && let Expression::Identifier(name) = &it.value
        {
            self.read(name, true);
            return;
        }
        walk::walk_object_property(self, it);
    }

    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        self.read(it, false);
    }
}
