use oxc_ast::ast::{Expression, PropertyKind, Statement};

use super::super::component::{
    Entry, Prop, bind_this, child_snippets, is_dynamic, props, props_expression, push_accessors,
    push_binding, push_children, reference,
};
use super::super::derived::{Created, callback};
use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, Memo, NodeKind,
    Part, R, Target,
};
use crate::lower::builder::Runtime;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `build_component`; a `standalone` component is its fragment's only node, so it
    /// has no comment in the template to mount at.
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        standalone: bool,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a component element")
        };
        let reference = reference(tree, identifier);
        let intermediate = is_dynamic(
            self.res,
            self.javascript
                .get_expression(reference)
                .get_inner_expression(),
        )
        .then(|| self.names.generate(element.name.text(self.source_text)));
        let mut memo = Memo::derived();
        let mut parts = Vec::new();
        let mut accessors = Vec::new();
        for prop in props(
            tree.attributes(element.attributes),
            self.source_text,
            self.javascript,
        ) {
            self.push_prop(prop, &mut memo, &mut parts, &mut accessors);
        }
        let (mut statements, snippets) =
            child_snippets(tree, self.javascript, element.children, |snippet| {
                self.snippet_declaration(snippet)
            })?;
        let children = self.fragment_without(element.children, |_| true)?;
        push_children(
            b,
            &mut parts,
            &snippets,
            children,
            &["$$anchor", "$$slotProps"],
        );
        let props = props_expression(b, parts, Target::Client);
        statements.extend(self.memo_deriveds(memo));
        let this = bind_this(tree.attributes(element.attributes), self.source_text);
        let instance = |call| match this {
            Some(target) => self.bind_this(target, call, false),
            None => call,
        };
        let call = if let Some(intermediate) = intermediate {
            let inner = b.call(b.id(&intermediate), [b.id("$$anchor"), props]);
            let inner = b.stmt(instance(inner));
            let render = b.arrow_block(b.params(["$$anchor", &intermediate]), [inner], false);
            let get = b.thunk(self.expression(reference));
            b.runtime("component", [b.id(node), get, render])
        } else {
            instance(b.call(self.expression(reference), [b.id(node), props]))
        };
        statements.push(b.stmt(call));
        if !standalone {
            frag.tpl.push_comment();
        }
        lists.initializer.append(&mut accessors);
        lists.initializer.push(if statements.len() == 1 {
            statements.pop().expect("one statement")
        } else {
            b.block(statements)
        });
        Ok(())
    }

    /// Upstream `Memoizer.deriveds`: `let $0 = $.derived(() => value)` for each memoized value.
    pub(super) fn memo_deriveds(&self, memo: Memo<'o>) -> impl Iterator<Item = Statement<'o>> {
        let b = self.b;
        memo.entries.into_iter().map(move |m| {
            let source = self
                .javascript
                .get_expression(m.source)
                .get_inner_expression();
            let thunk = callback(b, self.res, Some(source), m.value, Created::Template);
            b.let_(&m.name, Some(b.runtime("derived", [thunk])))
        })
    }

    /// A prop as a property or a spread; memoized values become deriveds in `memo`.
    fn push_prop(
        &mut self,
        prop: Prop<'_>,
        memo: &mut Memo<'o>,
        parts: &mut Vec<Entry<'o>>,
        accessors: &mut Vec<Statement<'o>>,
    ) {
        let b = self.b;
        match prop {
            Prop::Accessors(a, get, set) => {
                let functions = (self.rewrite(get, true), self.rewrite(set, true));
                let name = a.name.text(self.source_text);
                push_accessors(b, parts, accessors, name, functions, &mut self.names);
            }
            Prop::Value(a) => {
                let if_state = self.wraps_in_derived(&a.value);
                let (value, has_state) = self.attribute_value(a, memo, if_state);
                let name = a.name.text(self.source_text);
                parts.push(Entry::Property(if has_state {
                    b.getter(name, value)
                } else {
                    b.init(name, value)
                }));
            }
            Prop::Spread(e) => {
                let built = self.expression(e);
                let value = self.memoize(memo, e, built, false);
                parts.push(Entry::Spread(if self.an.meta(e).has_state {
                    b.thunk(value)
                } else {
                    value
                }));
            }
            Prop::Bind(a, target) => {
                let value = self.expression(target);
                let setter = vec![b.stmt(self.binding_assignment(target, false))];
                let name = a.name.text(self.source_text);
                // A store read through a binding tells the store it is bound.
                let store = matches!(
                    self.javascript.get_expression(target).get_inner_expression(),
                    Expression::Identifier(identifier) if self.rewriter(true).is_store(identifier)
                );
                if store {
                    let mark = b.stmt(b.runtime("mark_store_binding", []));
                    let get = vec![mark, b.return_(Some(value))];
                    parts.push(Entry::Property(b.accessor(
                        PropertyKind::Get,
                        name,
                        b.params([]),
                        get,
                    )));
                    parts.push(Entry::Property(b.accessor(
                        PropertyKind::Set,
                        name,
                        b.params(["$$value"]),
                        setter,
                    )));
                } else {
                    push_binding(b, parts, name, value, setter);
                }
            }
        }
    }

    /// So that the child does not rerun a stateful value on each read; upstream skips names and
    /// members, but not an optional chain, which is a `ChainExpression`.
    fn wraps_in_derived(&self, value: &AttributeValue) -> bool {
        let simple = |e| {
            matches!(
                self.javascript.get_expression(e).get_inner_expression(),
                Expression::Identifier(_)
                    | Expression::StaticMemberExpression(_)
                    | Expression::ComputedMemberExpression(_)
                    | Expression::PrivateFieldExpression(_)
            )
        };
        match value {
            &AttributeValue::Expression { expression, .. } => !simple(expression),
            AttributeValue::Interpolated(parts) => parts.iter().any(
                |part| matches!(*part, Part::Expression { expression, .. } if !simple(expression)),
            ),
            _ => false,
        }
    }
}
