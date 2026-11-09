use super::super::component::{
    Entry, Prop, is_dynamic, props, props_expression, push_binding, push_children, reference,
};
use super::super::derived::{Created, callback};
use super::super::javascript::getter;
use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Frag, Kind, Lists, Memo,
    NodeIdentifier, NodeKind, R, SourceLocation, Target, flag, init_property,
};

impl ClientCompilationContext<'_> {
    /// Upstream `build_component`; a `standalone` component is its fragment's only node, so it
    /// has no comment in the template to mount at.
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        standalone: bool,
        frag: &mut Frag,
        lists: &mut Lists,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a component element")
        };
        let reference = reference(tree, identifier);
        let intermediate = is_dynamic(self.javascript, self.res, reference)
            .then(|| self.names.generate(element.name.text(self.source_text)));
        let mut memo = Memo::derived();
        let mut parts = Vec::new();
        for prop in props(tree.attributes(element.attributes)) {
            self.push_prop(prop, &mut memo, &mut parts);
        }
        let children = self.fragment(element.children)?;
        push_children(
            &mut self.out,
            &mut parts,
            &children,
            &["$$anchor", "$$slotProps"],
        );
        let props = props_expression(&mut self.out, parts, Target::Client);
        let mut statements: Vec<NodeIdentifier> = (memo.entries.into_iter())
            .map(|m| {
                let thunk = callback(
                    self.javascript,
                    self.res,
                    &mut self.out,
                    Some(m.source),
                    m.value,
                    Created::Template,
                );
                let derived = self.out.runtime("$", "derived", &[thunk]);
                let name = self.out.ident_atom(m.name, SourceLocation::SYNTHETIC);
                self.out.let_(flag::LET, name, Some(derived))
            })
            .collect();
        let call = if let Some(intermediate) = intermediate {
            let callee = self.out.identifier(&intermediate);
            let anchor = self.out.identifier("$$anchor");
            let inner = self.out.call0(callee, &[anchor, props]);
            let inner = self.statement(inner);
            let body = self.out.block(&[inner], SourceLocation::SYNTHETIC);
            let parameters = [
                self.out.identifier("$$anchor"),
                self.out.identifier(&intermediate),
            ];
            let render = self
                .out
                .arrow(&parameters, body, false, false, SourceLocation::SYNTHETIC);
            let component = self.expression(reference);
            let get = self.thunk(component);
            let anchor = self.out.identifier(node);
            self.out.runtime("$", "component", &[anchor, get, render])
        } else {
            let callee = self.expression(reference);
            let anchor = self.out.identifier(node);
            self.out.call0(callee, &[anchor, props])
        };
        statements.push(self.statement(call));
        if !standalone {
            frag.tpl.push_comment();
        }
        lists.initializer.push(match statements.as_slice() {
            [statement] => *statement,
            _ => self.out.block(&statements, SourceLocation::SYNTHETIC),
        });
        Ok(())
    }

    /// A prop as a property or a spread; memoized values become deriveds in `memo`.
    fn push_prop(&mut self, prop: Prop<'_>, memo: &mut Memo, parts: &mut Vec<Entry>) {
        match prop {
            Prop::Value(a) => {
                let if_state = self.wraps_in_derived(&a.value);
                let (value, has_state) = self.attribute_value(a, memo, if_state);
                let name = a.name.text(self.source_text);
                parts.push(Entry::Property(if has_state {
                    getter(&mut self.out, name, value)
                } else {
                    init_property(&mut self.out, name, value)
                }));
            }
            Prop::Spread(e) => {
                let built = self.expression(e);
                let value = self.memoize(memo, e, built, false);
                parts.push(Entry::Spread(if self.an.meta(e).has_state {
                    self.thunk(value)
                } else {
                    value
                }));
            }
            Prop::Bind(a, target) => {
                let value = self.expression(target);
                let assignment = self.binding_assignment(target, false);
                let setter = [self.statement(assignment)];
                let name = a.name.text(self.source_text);
                push_binding(&mut self.out, parts, name, value, &setter);
            }
        }
    }

    /// So that the child does not rerun a stateful value on each read; upstream skips names and
    /// members, but not an optional chain, which is a `ChainExpression`.
    fn wraps_in_derived(&self, value: &AttributeValue) -> bool {
        let simple = |e: NodeIdentifier| match self.javascript.kind(e) {
            Kind::Identifier(_) => true,
            Kind::Member { .. } => !self.javascript.is_chain(e),
            _ => false,
        };
        match value {
            &AttributeValue::Expression { expression, .. } => !simple(expression),
            AttributeValue::Interpolated(parts) => parts.iter().any(|part| {
                matches!(*part, super::Part::Expression { expression, .. } if !simple(expression))
            }),
            _ => false,
        }
    }
}
