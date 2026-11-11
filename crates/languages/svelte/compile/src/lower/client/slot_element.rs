use super::super::slot_element::{SlotAttribute, slot_attributes, slot_call};
use super::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, Memo, NodeKind, Target,
};
use crate::lower::builder::Runtime;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `SlotElement` (client): a value with a call is read from a derived, and those
    /// deriveds and the call share a block.
    pub(super) fn slot_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> super::R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a slot element")
        };
        frag.tpl.push_comment();
        let mut memo = Memo::derived();
        let (mut name, mut properties, mut spreads) = (None, Vec::new(), Vec::new());
        for attribute in slot_attributes(tree.attributes(element.attributes), self.source_text) {
            match attribute {
                SlotAttribute::Spread(e) => spreads.push(b.thunk(self.expression(e))),
                SlotAttribute::Name(a) => name = Some(self.attribute_value(a, &mut memo, false).0),
                SlotAttribute::Prop(a) => {
                    let (value, has_state) = self.attribute_value(a, &mut memo, false);
                    let key = a.name.text(self.source_text);
                    properties.push(if has_state {
                        b.getter(key, value)
                    } else {
                        b.init(key, value)
                    });
                }
            }
        }
        let fallback = if tree.children(element.children).is_empty() {
            None
        } else {
            let body = self.fragment(element.children)?;
            Some(b.arrow_block(b.params(["$$anchor"]), body, false))
        };
        let mut statements: Vec<_> = self.memo_deriveds(memo).collect();
        let call = slot_call(
            b,
            b.id(node),
            name,
            properties,
            spreads,
            fallback,
            Target::Client,
        );
        statements.push(b.stmt(call));
        l.initializer.push(if statements.len() == 1 {
            statements.pop().expect("one statement")
        } else {
            b.block(statements)
        });
        Ok(())
    }
}
