mod asynchronous;
pub(super) use asynchronous::script_getter;
use rsvelte_typescript::copy::{Rewrite, copy};
use rsvelte_typescript::scope::{BindingIdentifier, DeclarationKind};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_vue::resolve::{BindingType, Resolution};
use rustc_hash::{FxHashMap, FxHashSet};

use super::Builder;

impl Builder<'_> {
    pub(super) fn callback_expression(
        &mut self,
        identifier: NodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let mut pending = vec![identifier];
        let mut values = FxHashMap::default();
        while let Some(node) = pending.pop() {
            if self.input.memoized.contains(&node)
                && !super::super::asynchronous::has_await(&self.input.javascript, node)
            {
                values.insert(node, self.memoized_value(node, body));
                continue;
            }
            match self.input.javascript.kind(node) {
                Kind::Await(_) => {
                    values.insert(node, self.async_text(node, body));
                }
                Kind::Arrow { is_async: true, .. } | Kind::Function { .. } => {}
                _ => self
                    .input
                    .javascript
                    .for_each_child(node, |child| pending.push(child)),
            }
        }
        let mut rewrite = ExpressionRewrite {
            resolution: self.resolution,
            references: &self.references,
            loop_bindings: &self.loop_bindings,
            needs_unref: false,
            memoized: Some(&values),
            tracking: self.input.tracking,
        };
        let value = copy(
            &self.input.javascript,
            &mut self.to,
            &mut rewrite,
            identifier,
        );
        if rewrite.needs_unref {
            self.helpers.insert("unref");
        }
        value
    }

    pub(super) fn reactive_expression(
        &mut self,
        identifier: NodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        self.render_expression(identifier, body)
    }

    pub(super) fn render_expression(
        &mut self,
        identifier: NodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        if super::super::asynchronous::has_await(&self.input.javascript, identifier) {
            return self.async_text(identifier, body);
        }
        let mut pending = vec![identifier];
        let mut memoized = FxHashMap::default();
        while let Some(node) = pending.pop() {
            if self.input.memoized.contains(&node) {
                memoized.insert(node, self.memoized_value(node, body));
            } else {
                self.input
                    .javascript
                    .for_each_child(node, |child| pending.push(child));
            }
        }
        let mut rewrite = ExpressionRewrite {
            resolution: self.resolution,
            references: &self.references,
            loop_bindings: &self.loop_bindings,
            needs_unref: false,
            memoized: Some(&memoized),
            tracking: self.input.tracking,
        };
        let value = copy(
            &self.input.javascript,
            &mut self.to,
            &mut rewrite,
            identifier,
        );
        if rewrite.needs_unref {
            self.helpers.insert("unref");
        }
        value
    }

    fn memoized_value(
        &mut self,
        identifier: NodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let value = self.expression(identifier);
        let getter = self.to.arrow(&[], value, true, false, super::SYNTHETIC);
        let computed = self.call("computed", &[getter]);
        let name = self.declare(computed, body);
        let value = self.to.dot(name, "value");
        self.cached_reads.insert(value);
        value
    }

    pub(super) fn copy_expression(&mut self, identifier: NodeIdentifier) -> NodeIdentifier {
        let mut rewrite = ExpressionRewrite {
            resolution: self.resolution,
            references: &self.references,
            loop_bindings: &self.loop_bindings,
            needs_unref: false,
            memoized: None,
            tracking: self.input.tracking,
        };
        let result = copy(
            &self.input.javascript,
            &mut self.to,
            &mut rewrite,
            identifier,
        );
        if rewrite.needs_unref {
            self.helpers.insert("unref");
        }
        result
    }

    pub(super) fn expression(&mut self, identifier: NodeIdentifier) -> NodeIdentifier {
        let result = self.copy_expression(identifier);
        if self.input.tracking {
            let getter = self.to.arrow(&[], result, true, false, super::SYNTHETIC);
            let tracked = self.to.identifier("$$tracked");
            self.to.call0(tracked, &[getter])
        } else {
            result
        }
    }
}

struct ExpressionRewrite<'a> {
    resolution: &'a Resolution,
    references: &'a FxHashMap<NodeIdentifier, BindingIdentifier>,
    loop_bindings: &'a FxHashSet<BindingIdentifier>,
    needs_unref: bool,
    tracking: bool,
    memoized: Option<&'a FxHashMap<NodeIdentifier, NodeIdentifier>>,
}

impl ExpressionRewrite<'_> {
    fn reference(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let binding = *self.references.get(&identifier)?;
        let declaration = &self.resolution.sem.bindings[binding];
        if declaration.node == identifier {
            return None;
        }
        let loop_ref = self.loop_bindings.contains(&binding);
        if declaration.kind == DeclarationKind::Host && !loop_ref {
            return None;
        }
        if !loop_ref
            && !matches!(
                from.kind(self.resolution.sem.scopes[declaration.scope].node),
                Kind::Program(_)
            )
        {
            return None;
        }
        let kind = from
            .atom(declaration.node)
            .and_then(|a| self.resolution.binding_type(a));
        let state = declaration.initializer(from).is_some_and(|initializer| {
            if let Kind::Await(value) = from.kind(initializer) {
                return rsvelte_vue::resolve::call_name(from, value) == Some("$$async_derived");
            }
            matches!(
                rsvelte_vue::resolve::call_name(from, initializer),
                Some("$$ref" | "$$computed" | "$$prop_cell")
            )
        });
        if loop_ref || state || kind == Some(BindingType::SetupRef) {
            let name = to.ident(from.name(identifier), from.source_location(identifier));
            return Some(to.dot(name, "value"));
        }
        if kind == Some(BindingType::SetupMaybeRef) {
            self.needs_unref = true;
            let name = to.ident(from.name(identifier), from.source_location(identifier));
            let callee = to.identifier("$$v_unref");
            return Some(to.call0(callee, &[name]));
        }
        None
    }
}

impl Rewrite for ExpressionRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if let Some(value) = self.memoized.and_then(|memoized| memoized.get(&identifier)) {
            return Some(*value);
        }
        match from.kind(identifier) {
            Kind::Call {
                callee, arguments, ..
            } => {
                if matches!(from.kind(callee), Kind::Identifier(_))
                    && from.name(callee) == "$$group_source"
                {
                    return Some(to.identifier(from.name(arguments[0])));
                }
                let (name, argument) =
                    rsvelte_svelte::semantic::resolve::rune_call(from, identifier)?;
                if !crate::script::runes::value(name) {
                    return None;
                }
                let tracking = self.tracking;
                crate::script::rune_value(from, to, self, name, argument, tracking)
            }
            Kind::Member {
                object,
                property,
                computed: false,
                optional,
            } if matches!(from.kind(object), Kind::Identifier(_))
                && from.name(object).starts_with("$$pattern_")
                && from.name(property) == "value" =>
            {
                let object = copy(from, to, &mut rsvelte_typescript::copy::Verbatim, object);
                let property = copy(from, to, &mut rsvelte_typescript::copy::Verbatim, property);
                Some(to.member(object, property, false, optional, super::SYNTHETIC))
            }
            Kind::Identifier(_) => self.reference(from, to, identifier),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let value = self.reference(from, to, value)?;
                let key = to.ident(from.name(key), from.source_location(key));
                Some(to.property(key, value, 0, from.source_location(identifier)))
            }
            _ => None,
        }
    }
}
