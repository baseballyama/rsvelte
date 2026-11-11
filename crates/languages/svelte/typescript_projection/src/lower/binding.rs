//! svelte2tsx's `handleBinding`: what a `bind:` directive passes and assigns.

use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeValue, Part};
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Builder, Node, NodeIdentifier, Result, Unsupported};

/// svelte2tsx's `oneWayBindingAttributes`: the element's property of the same name is assigned.
const ONE_WAY: &[&str] = &[
    "clientWidth",
    "clientHeight",
    "offsetWidth",
    "offsetHeight",
    "duration",
    "seeking",
    "ended",
    "readyState",
    "naturalWidth",
    "naturalHeight",
];

/// svelte2tsx's `oneWayBindingAttributesNotOnElement`: a value of this type is assigned.
const NOT_ON_ELEMENT: &[(&str, &str)] = &[
    ("contentRect", "null as DOMRectReadOnly"),
    ("contentBoxSize", "null as ResizeObserverSize[]"),
    ("borderBoxSize", "null as ResizeObserverSize[]"),
    ("devicePixelContentBoxSize", "null as ResizeObserverSize[]"),
    (
        "buffered",
        "null as import('svelte/elements').SvelteMediaTimeRange[]",
    ),
    (
        "played",
        "null as import('svelte/elements').SvelteMediaTimeRange[]",
    ),
    (
        "seekable",
        "null as import('svelte/elements').SvelteMediaTimeRange[]",
    ),
];

/// What a binding assigns or widens around the call.
pub(super) enum Binding {
    /// `bind:this`: the element or the component is assigned to `target`, or passed to the
    /// setter `target`.
    This { target: NodeIdentifier, set: bool },
    /// The element's property `name` is assigned to `target`.
    Property {
        target: NodeIdentifier,
        name: &'static str,
    },
    /// `value` is assigned to `target`.
    Assigned {
        target: NodeIdentifier,
        value: NodeIdentifier,
    },
    /// A dead assignment to the bound expression, so a narrowed declaration reads as its
    /// declared type. svelte2tsx ignores what it raises.
    Widened { at: Span, typed: bool },
    /// Only the property it passes.
    Passed,
}

/// Whether `expression` ends in a type, which an assignment needs parentheses around:
/// `(value as string) = …` parses, `value as string = …` does not.
const fn has_type(expression: &Expression<'_>) -> bool {
    matches!(
        expression,
        Expression::TSAsExpression(_)
            | Expression::TSSatisfiesExpression(_)
            | Expression::TSTypeAssertion(_)
            | Expression::TSNonNullExpression(_)
    )
}

/// The expression inside `x as T`, `x satisfies T` or `x!`, whose type svelte2tsx moves to the
/// assigned value.
fn asserted(expression: &Expression<'_>) -> Option<oxc_span::Span> {
    match expression {
        Expression::TSAsExpression(e) => Some(e.expression.span()),
        Expression::TSSatisfiesExpression(e) => Some(e.expression.span()),
        Expression::TSNonNullExpression(e) => Some(e.expression.span()),
        _ => None,
    }
}

impl Builder<'_> {
    /// The bound expression as an assignment's target.
    fn target(&mut self, at: oxc_span::Span, typed: bool) -> NodeIdentifier {
        let target = self.source(at, None);
        if typed {
            self.tree.push(Node::Parenthesized(target))
        } else {
            target
        }
    }

    /// svelte2tsx's `appendOneWayBinding`: `x = value as T` for `bind:…={x as T}`.
    fn one_way_target(&mut self, expression: ExpressionIdentifier) -> NodeIdentifier {
        let e = self.expression(expression);
        let (at, typed) = (e.span(), has_type(e));
        let Some(inner) = asserted(e) else {
            return self.target(at, typed);
        };
        let target = self.source(inner, None);
        self.tree.push(Node::Asserted {
            target,
            assertion: Span::new(inner.end, at.end),
        })
    }

    /// Pushes the property a binding passes, and returns what it assigns or widens.
    pub(super) fn binding(
        &mut self,
        attribute: &Attribute,
        tag: &str,
        is_component: bool,
        intrinsic: bool,
    ) -> Result<Binding> {
        let unsupported = || Unsupported::at("bind: directives", attribute.span);
        let AttributeValue::Parts(parts) = attribute.value else {
            return Err(unsupported());
        };
        let &[Part::Expression { expression, .. }] = self.component.parts(parts) else {
            return Err(unsupported());
        };
        let name = attribute
            .directive_name(&self.component.modifiers)
            .ok_or_else(unsupported)?;
        let directive = name.text(self.source);
        let at = self.expression(expression).span();
        let typed = has_type(self.expression(expression));
        let get_set = match self.expression(expression) {
            Expression::SequenceExpression(sequence) => match sequence.expressions.as_slice() {
                [get, set] => Some((get.span(), set.span())),
                _ => return Err(Unsupported::at("function bindings", attribute.span)),
            },
            _ => None,
        };
        if directive == "this" {
            let (target, set) = match get_set {
                Some((_, set)) => (self.source(set, None), true),
                None => (self.one_way_target(expression), false),
            };
            return Ok(Binding::This { target, set });
        }
        if get_set.is_none() && intrinsic {
            if directive == "group" && tag == "input" {
                let target = self.target(at, typed);
                let value = self.tree.push(Node::Identifier("__rsvelte_untyped_prop()"));
                return Ok(Binding::Assigned { target, value });
            }
            if let Some(&name) = ONE_WAY.iter().find(|n| **n == directive) {
                let target = self.one_way_target(expression);
                return Ok(Binding::Property { target, name });
            }
            if let Some(&(_, value)) = NOT_ON_ELEMENT.iter().find(|(n, _)| *n == directive) {
                let target = self.target(at, typed);
                let value = self.tree.push(Node::Identifier(value));
                return Ok(Binding::Assigned { target, value });
            }
        }
        let value = match get_set {
            Some((get, set)) => {
                let callee = self.tree.push(Node::Identifier("__rsvelte_get_set"));
                let get = self.source(get, None);
                let set = self.source(set, None);
                let arguments = self.tree.list(&[get, set]);
                self.tree.push(Node::Call { callee, arguments })
            }
            None => self.source(at, None),
        };
        let property = if is_component && attribute.shorthand {
            Node::Shorthand(value)
        } else {
            Node::Property {
                // A component's prop is named without the prefix; an element's keeps it.
                name: if is_component { name } else { attribute.name },
                lowercase: false,
                value,
                end: (!attribute.shorthand).then_some(attribute.name.end_offset),
            }
        };
        let property = self.tree.push(property);
        self.scratch.push(property);
        // A getter and setter declare no variable to widen.
        Ok(match get_set {
            Some(_) => Binding::Passed,
            None => Binding::Widened {
                at: super::span(at),
                typed,
            },
        })
    }

    /// Pushes `call` as a statement, with what `bindings` assign around it.
    pub(super) fn bound_call(&mut self, call: NodeIdentifier, bindings: Vec<Binding>) {
        let needs_name = bindings.iter().any(|b| {
            matches!(
                b,
                Binding::Property { .. } | Binding::This { set: true, .. }
            )
        });
        let instance = if needs_name {
            let name = self.unused_name("__rsvelte_element");
            self.scratch
                .push(self.tree.push(Node::Const { name, value: call }));
            name
        } else {
            // Each `bind:this` target is assigned the call itself, so one statement holds it.
            let mut call = call;
            for binding in &bindings {
                if let &Binding::This { target, .. } = binding {
                    call = self.tree.push(Node::Assignment {
                        target,
                        value: call,
                    });
                }
            }
            self.scratch.push(self.tree.push(Node::Statement(call)));
            call
        };
        for binding in bindings {
            let statement = match binding {
                Binding::This { target, set } if needs_name => {
                    if set {
                        let callee = self.tree.push(Node::Parenthesized(target));
                        let arguments = self.tree.list(&[instance]);
                        self.tree.push(Node::Call { callee, arguments })
                    } else {
                        self.tree.push(Node::Assignment {
                            target,
                            value: instance,
                        })
                    }
                }
                Binding::This { .. } | Binding::Passed => continue,
                Binding::Property { target, name } => {
                    let property = self.tree.push(Node::Identifier(name));
                    let value = self.tree.push(Node::Member {
                        object: instance,
                        property,
                    });
                    self.tree.push(Node::Assignment { target, value })
                }
                Binding::Assigned { target, value } => {
                    self.tree.push(Node::Assignment { target, value })
                }
                Binding::Widened { at, typed } => {
                    let mut target = self.tree.push(Node::UnmappedSource(at));
                    if typed {
                        target = self.tree.push(Node::Parenthesized(target));
                    }
                    let value = self.tree.push(Node::Identifier("__rsvelte_untyped_prop()"));
                    let assignment = self.tree.push(Node::Assignment { target, value });
                    let ignored = self.tree.push(Node::Ignored(assignment));
                    let body = self.tree.list(&[ignored]);
                    self.tree.push(Node::Arrow { body })
                }
            };
            self.scratch
                .push(self.tree.push(Node::Statement(statement)));
        }
    }
}
