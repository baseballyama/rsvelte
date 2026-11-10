use oxc_ast::ast::{Expression, Statement};

use super::super::component::{
    Entry, Prop, is_dynamic, props, props_expression, push_binding, push_children, reference,
};
use super::super::derived::{Created, callback};
use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, Memo, NodeKind,
    Part, R, Target,
};

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
        for prop in props(tree.attributes(element.attributes)) {
            self.push_prop(prop, &mut memo, &mut parts);
        }
        let children = self.fragment(element.children)?;
        push_children(b, &mut parts, children, &["$$anchor", "$$slotProps"]);
        let props = props_expression(b, parts, Target::Client);
        let mut statements: Vec<Statement<'o>> = (memo.entries.into_iter())
            .map(|m| {
                let source = self
                    .javascript
                    .get_expression(m.source)
                    .get_inner_expression();
                let thunk = callback(b, self.res, Some(source), m.value, Created::Template);
                b.let_(&m.name, Some(b.runtime("derived", [thunk])))
            })
            .collect();
        let call = if let Some(intermediate) = intermediate {
            let inner = b.stmt(b.call(b.id(&intermediate), [b.id("$$anchor"), props]));
            let render = b.arrow_block(b.params(["$$anchor", &intermediate]), [inner], false);
            let get = b.thunk(self.expression(reference));
            b.runtime("component", [b.id(node), get, render])
        } else {
            b.call(self.expression(reference), [b.id(node), props])
        };
        statements.push(b.stmt(call));
        if !standalone {
            frag.tpl.push_comment();
        }
        lists.initializer.push(if statements.len() == 1 {
            statements.pop().expect("one statement")
        } else {
            b.block(statements)
        });
        Ok(())
    }

    /// A prop as a property or a spread; memoized values become deriveds in `memo`.
    fn push_prop(&self, prop: Prop<'_>, memo: &mut Memo<'o>, parts: &mut Vec<Entry<'o>>) {
        let b = self.b;
        match prop {
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
                push_binding(b, parts, a.name.text(self.source_text), value, setter);
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
