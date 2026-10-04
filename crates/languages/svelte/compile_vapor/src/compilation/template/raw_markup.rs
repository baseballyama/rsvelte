use super::{
    Builder, CompilerNodeIdentifier, Helper, Namespace, NodeIdentifier, R, Span, bound, spelled,
    vue,
};

impl Builder<'_, '_> {
    pub(super) fn raw_markup(
        &mut self,
        identifier: CompilerNodeIdentifier,
        expression: NodeIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        span: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        self.render_read(expression)?;
        let value = self.template_expression(expression);
        if !self.i.server {
            self.helpers.insert(Helper::RawMarkup);
        }
        let props = self.vb.props([bound("value", span, value, span)]);
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
        Ok(node)
    }
}
