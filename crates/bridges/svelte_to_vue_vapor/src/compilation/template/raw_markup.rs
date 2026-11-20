use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_compile::render_plan::Namespace;
use rsvelte_svelte_semantic::compiler_syntax_tree::CompilerNodeIdentifier;
use rsvelte_typescript_tree::ExpressionIdentifier;
use rsvelte_vue_semantic::compiler_syntax_tree as vue;

use super::{Template, spelled};
use crate::compilation::helpers::Helper;

impl Template<'_, '_, '_> {
    pub(super) fn raw_markup(
        &mut self,
        identifier: CompilerNodeIdentifier,
        expression: ExpressionIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        span: Span,
    ) -> vue::CompilerNodeIdentifier {
        let value = self.template_expression(expression);
        if !self.i.server {
            self.helpers.insert(Helper::RawMarkup);
        }
        let value = self.bound("value", span, value, span);
        let props = self.vb.props([value]);
        let kind = vue::NodeKind::Element(vue::Element {
            tag: spelled("$$RawMarkup", span),
            tag_type: vue::TagType::Component,
            props,
            children: vue::Children::default(),
        });
        let node = self.vb.node(kind, span, parent, 0);
        let namespace = self
            .i
            .plan
            .namespaces
            .as_ref()
            .expect("translation uses a checked plan")
            .get(identifier);
        if namespace != Namespace::Html {
            self.namespaces.insert(node, namespace);
        }
        node
    }
}
