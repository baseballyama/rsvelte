use rsvelte_svelte::compilation::compiler_syntax_tree::MetadataTag;

use super::{Attribute, AttributeValue, ClientCompilationContext, Kind, Lists};
use crate::lower::special::{GlobalBinding, global_binding};

impl ClientCompilationContext<'_> {
    pub(super) fn global_binding(
        &mut self,
        attribute: &Attribute,
        tag: MetadataTag,
        lists: &mut Lists,
    ) {
        let AttributeValue::Bind(expression) = attribute.value else {
            unreachable!("a binding")
        };
        let binding = global_binding(tag, attribute.name.text(self.source_text))
            .expect("global bindings are validated");
        let (get, set) = if matches!(binding, GlobalBinding::This | GlobalBinding::Scroll(_)) {
            let (get, set) = self.binding_accessors(expression, false);
            (Some(get), set)
        } else {
            (None, self.binding_setter(expression, false))
        };
        let call = match binding {
            GlobalBinding::This => {
                let namespace = self.out.identifier("$");
                let target = self.out.dot(
                    namespace,
                    if tag == MetadataTag::Window {
                        "window"
                    } else {
                        "document"
                    },
                );
                let target = if tag == MetadataTag::Body {
                    self.out.dot(target, "body")
                } else {
                    target
                };
                self.call("bind_this", vec![Some(target), Some(set), get])
            }
            GlobalBinding::Size => {
                let name = self.out.write_string(attribute.name.text(self.source_text));
                self.call("bind_window_size", vec![Some(name), Some(set)])
            }
            GlobalBinding::Scroll(axis) => {
                let get = get.expect("a scroll getter");
                let axis = self.out.write_string(axis);
                let same = match (self.out.kind(get), self.out.kind(set)) {
                    (Kind::Identifier(a), Kind::Identifier(b)) => a == b,
                    _ => false,
                };
                self.call(
                    "bind_window_scroll",
                    vec![Some(axis), Some(get), (!same).then_some(set)],
                )
            }
            GlobalBinding::Online => self.call("bind_online", vec![Some(set)]),
            GlobalBinding::ActiveElement => self.call("bind_active_element", vec![Some(set)]),
            GlobalBinding::Property(event) => {
                let name = self.out.write_string(attribute.name.text(self.source_text));
                let event = self.out.write_string(event);
                let namespace = self.out.identifier("$");
                let target = self.out.dot(
                    namespace,
                    if tag == MetadataTag::Window {
                        "window"
                    } else {
                        "document"
                    },
                );
                self.call(
                    "bind_property",
                    vec![Some(name), Some(event), Some(target), Some(set)],
                )
            }
        };
        let statement = self.statement(call);
        if matches!(binding, GlobalBinding::This) {
            lists.initializer.push(statement);
        } else {
            lists.after.push(statement);
        }
    }
}
