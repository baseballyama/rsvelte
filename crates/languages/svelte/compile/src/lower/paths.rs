//! Upstream's `extract_paths`: each name a destructuring pattern binds, with the expression that
//! reads it from the destructured value. Snippet parameters and destructured `$derived` share it.

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    BindingIdentifier, BindingPattern, BindingProperty, BindingRestElement, Expression, PropertyKey,
};
use rsvelte_svelte_semantic::evaluate::Evaluator;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::Builder;
use super::builder::Runtime;
use super::javascript::is_simple_expression;

/// What a caller of [`extract_paths`] decides: how its script reads the pattern's own
/// expressions, and how it keeps an array the pattern destructures.
pub(super) trait Destructure<'a, 'o> {
    /// A key or a default value of the pattern, rewritten as the caller's script reads it.
    fn rewrite(&mut self, e: &'a Expression<'a>) -> Expression<'o>;

    /// Declares `$.to_array(…)`, which upstream calls an insert, and returns how a path reads it.
    fn array(&mut self, value: Expression<'o>) -> Expression<'o>;

    /// Whether `object.key` reads `$$props` instead, as upstream reads a rest prop's member.
    fn reads_props(&self, _object: &Expression<'o>, _key: &str) -> bool {
        false
    }
}

pub(super) struct Path<'a, 'o> {
    pub binding: &'a BindingIdentifier<'a>,
    pub value: Expression<'o>,
    /// A default value applies to it.
    pub default: bool,
}

pub(super) struct Paths<'b, 'r, 'o, D> {
    pub b: &'b Builder<'o>,
    pub res: &'r Resolution,
    pub hooks: D,
}

impl<'a, 'o, D: Destructure<'a, 'o>> Paths<'_, '_, 'o, D> {
    /// The paths of `pattern` read from `value`, in source order.
    pub(super) fn extract(
        &mut self,
        pattern: &'a BindingPattern<'a>,
        value: Expression<'o>,
        default: bool,
        paths: &mut Vec<Path<'a, 'o>>,
    ) {
        match pattern {
            BindingPattern::BindingIdentifier(binding) => paths.push(Path {
                binding,
                value,
                default,
            }),
            BindingPattern::ObjectPattern(object) => {
                self.object(
                    &object.properties,
                    object.rest.as_deref(),
                    value,
                    default,
                    paths,
                );
            }
            BindingPattern::ArrayPattern(array) => {
                self.array(
                    &array.elements,
                    array.rest.as_deref(),
                    value,
                    default,
                    paths,
                );
            }
            BindingPattern::AssignmentPattern(assignment) => {
                let value = self.fallback(&assignment.right, value);
                self.extract(&assignment.left, value, true, paths);
            }
        }
    }

    /// Upstream `build_fallback`: `value`, or `fallback` when it is `undefined`.
    pub(super) fn fallback(
        &mut self,
        fallback: &'a Expression<'a>,
        value: Expression<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        if is_simple_expression(fallback) {
            return b.runtime("fallback", [value, self.hooks.rewrite(fallback)]);
        }
        // Upstream makes the thunk before it rewrites the fallback, so `() => f()` is `f`.
        let thunk = match fallback.get_inner_expression() {
            Expression::CallExpression(call)
                if call.arguments.is_empty()
                    && !call.optional
                    && matches!(call.callee, Expression::Identifier(_)) =>
            {
                self.hooks.rewrite(&call.callee)
            }
            fallback => b.arrow(b.params([]), self.hooks.rewrite(fallback)),
        };
        b.runtime("fallback", [value, thunk, b.boolean(true)])
    }

    fn object(
        &mut self,
        properties: &'a [BindingProperty<'a>],
        rest: Option<&'a BindingRestElement<'a>>,
        value: Expression<'o>,
        default: bool,
        paths: &mut Vec<Path<'a, 'o>>,
    ) {
        let b = self.b;
        let excluded: Vec<_> = if rest.is_some() {
            properties.iter().map(|p| self.excluded_key(p)).collect()
        } else {
            Vec::new()
        };
        for property in properties {
            // A member of an optional chain would join the chain.
            let object = match &value {
                Expression::ChainExpression(_) => b.parenthesized(value.clone_in(b.allocator())),
                value => value.clone_in(b.allocator()),
            };
            let member = match &property.key {
                PropertyKey::StaticIdentifier(key) if !property.computed => {
                    if self.hooks.reads_props(&object, &key.name) {
                        b.member(b.id("$$props"), &key.name)
                    } else {
                        b.member(object, &key.name)
                    }
                }
                key => {
                    let key = key.as_expression().expect("a computed or literal key");
                    b.computed(object, self.hooks.rewrite(key))
                }
            };
            self.extract(&property.value, member, default, paths);
        }
        if let Some(rest) = rest {
            let value = b.runtime("exclude_from_object", [value, b.array(excluded)]);
            self.extract(&rest.argument, value, default, paths);
        }
    }

    /// A key `exclude_from_object` leaves out of the rest: its name as a string.
    fn excluded_key(&mut self, property: &'a BindingProperty<'a>) -> Expression<'o> {
        let b = self.b;
        match &property.key {
            PropertyKey::StaticIdentifier(key) if !property.computed => b.string(&key.name),
            key @ (PropertyKey::StringLiteral(_) | PropertyKey::NumericLiteral(_)) => {
                let key = key.as_expression().expect("a literal key");
                let value = Evaluator::new(self.res).evaluate(key).value;
                b.string(&value.to_javascript_string())
            }
            key => {
                let key = key.as_expression().expect("a computed key");
                b.call(b.id("String"), [self.hooks.rewrite(key)])
            }
        }
    }

    fn array(
        &mut self,
        elements: &'a [Option<BindingPattern<'a>>],
        rest: Option<&'a BindingRestElement<'a>>,
        value: Expression<'o>,
        default: bool,
        paths: &mut Vec<Path<'a, 'o>>,
    ) {
        let b = self.b;
        #[expect(clippy::cast_precision_loss, reason = "a pattern has few elements")]
        let length = |n: usize| b.number(n as f64);
        let mut arguments = vec![value];
        if rest.is_none() {
            arguments.push(length(elements.len()));
        }
        let array = self.hooks.array(b.runtime("to_array", arguments));
        for (index, element) in elements.iter().enumerate() {
            if let Some(element) = element {
                let item = b.computed(array.clone_in(b.allocator()), length(index));
                self.extract(element, item, default, paths);
            }
        }
        if let Some(rest) = rest {
            let value = b.call(b.member(array, "slice"), [length(elements.len())]);
            self.extract(&rest.argument, value, default, paths);
        }
    }
}
