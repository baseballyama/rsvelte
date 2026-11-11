use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::MetadataTag;

use super::{Attribute, AttributeValue, ClientCompilationContext, Lists};
use crate::lower::special::{GlobalBinding, global_binding};

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn global_binding(
        &self,
        attribute: &Attribute,
        tag: MetadataTag,
        lists: &mut Lists<'o>,
    ) {
        let b = self.b;
        let AttributeValue::Bind(expression) = attribute.value else {
            unreachable!("a binding")
        };
        let name = attribute.name.text(self.source_text);
        let binding = global_binding(tag, name).expect("global bindings are validated");
        let (get, set) = if matches!(binding, GlobalBinding::This | GlobalBinding::Scroll(_)) {
            let (get, set) = self.binding_accessors(expression, false);
            (Some(get), set)
        } else {
            (None, self.binding_setter(expression, false))
        };
        let global = || {
            b.member(
                b.id("$"),
                if tag == MetadataTag::Window {
                    "window"
                } else {
                    "document"
                },
            )
        };
        let call = match binding {
            GlobalBinding::This => {
                let target = if tag == MetadataTag::Body {
                    b.member(global(), "body")
                } else {
                    global()
                };
                b.runtime_some("bind_this", vec![Some(target), Some(set), get])
            }
            GlobalBinding::Size => b.runtime("bind_window_size", [b.string(name), set]),
            GlobalBinding::Scroll(axis) => {
                let get = get.expect("a scroll getter");
                let same = matches!((&get, &set),
                    (Expression::Identifier(a), Expression::Identifier(s)) if a.name == s.name);
                b.runtime_some(
                    "bind_window_scroll",
                    vec![Some(b.string(axis)), Some(get), (!same).then_some(set)],
                )
            }
            GlobalBinding::Online => b.runtime("bind_online", [set]),
            GlobalBinding::ActiveElement => b.runtime("bind_active_element", [set]),
            GlobalBinding::Property(event) => b.runtime(
                "bind_property",
                [b.string(name), b.string(event), global(), set],
            ),
        };
        if matches!(binding, GlobalBinding::This) {
            lists.initializer.push(b.stmt(call));
        } else {
            lists.after.push(b.stmt(call));
        }
    }
}
