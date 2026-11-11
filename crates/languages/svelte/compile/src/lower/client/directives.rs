use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Attribute, AttributeValue, ClientCompilationContext, Lists};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The directives of upstream `RegularElement`'s `other_directives`, in attribute order.
    pub(super) fn element_directives(
        &mut self,
        attributes: &[Attribute],
        tag: &str,
        node: &str,
    ) -> Lists<'o> {
        let b = self.b;
        let mut directives = Lists::default();
        for a in attributes {
            match a.value {
                AttributeValue::On { .. } => self.event_directive(a, node, false, &mut directives),
                AttributeValue::Bind(expression)
                    if tag == "svelte:element" && a.name.text(self.source_text) == "this" =>
                {
                    let (get, set) = self.bind_this_accessors(expression);
                    let call = b.runtime("bind_this", [b.id(node), set, get]);
                    directives.initializer.push(b.stmt(call));
                }
                AttributeValue::Bind(_) => {
                    let call = self.binding(a, tag, node);
                    directives.after.push(b.stmt(call));
                }
                AttributeValue::Attach(e) => {
                    let call = self.attach(e, node);
                    directives.initializer.push(b.stmt(call));
                }
                _ => {}
            }
        }
        directives
    }

    /// Upstream `BindDirective` (client, non-dev) for the bindings coverage admits.
    fn binding(&self, a: &Attribute, tag: &str, node: &str) -> Expression<'o> {
        let AttributeValue::Bind(e) = a.value else {
            unreachable!("called on bindings")
        };
        let (get, set) = self.binding_accessors(e, true);
        let method = match a.name.text(self.source_text) {
            "value" if tag == "select" => "bind_select_value",
            "value" => "bind_value",
            "checked" => "bind_checked",
            p => unreachable!("coverage admits no `bind:{p}`"),
        };
        self.b.runtime(method, [self.b.id(node), get, set])
    }

    /// Upstream `AttachTag` (client).
    fn attach(&self, e: ExpressionIdentifier, node: &str) -> Expression<'o> {
        let b = self.b;
        b.runtime("attach", [b.id(node), b.thunk(self.expression(e))])
    }
}
