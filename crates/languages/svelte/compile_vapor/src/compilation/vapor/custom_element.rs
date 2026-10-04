use super::{Builder, NodeIdentifier, SYNTHETIC, flag};
use crate::template::CustomElement;

impl Builder<'_> {
    pub(super) fn custom_element(
        &mut self,
        component: NodeIdentifier,
        options: &CustomElement,
        module: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let name = self.to.identifier("$$component");
        module.push(self.to.let_(flag::CONST, name, Some(component)));
        let mut fields = Vec::new();
        if let Some(stylesheet) = &self.input.stylesheet
            && options.shadow_root
        {
            let stylesheet = self.to.write_string(stylesheet);
            let key = self.to.identifier("styles");
            fields.push(self.to.property(key, stylesheet, 0, SYNTHETIC));
        }
        if !options.shadow_root {
            let value = self.to.write_boolean(false, SYNTHETIC);
            let key = self.to.identifier("shadow");
            fields.push(self.to.property(key, value, 0, SYNTHETIC));
        }
        for (name, value) in [
            ("shadow", options.shadow),
            ("props", options.props),
            ("extend", options.extend),
        ] {
            if let Some(value) = value {
                let value = self.copy_expression(value);
                let key = self.to.identifier(name);
                fields.push(self.to.property(key, value, 0, SYNTHETIC));
            }
        }
        let config = self.to.object(&fields, SYNTHETIC);
        self.helpers.extend([
            "inject",
            "useHost",
            "renderEffect",
            "shallowReactive",
            "defineVaporComponent",
            "createComponent",
            "createVaporApp",
        ]);
        module.extend(crate::helpers::source_declarations(
            include_str!("custom_element.js"),
            &mut self.to,
        ));
        let factory = self.to.identifier("$$custom_element");
        let element = self.to.call0(factory, &[name, config]);
        let property = self.to.dot(name, "element");
        let assign = self.to.assign(
            rsvelte_typescript::operators::AssignmentOperator::Assign,
            property,
            element,
            SYNTHETIC,
        );
        module.push(self.to.expression_statement(assign));
        if let Some(tag) = &options.tag {
            let registry = self.to.identifier("customElements");
            let define = self.to.dot(registry, "define");
            let tag = self.to.write_string(tag);
            let call = self.to.call0(define, &[tag, property]);
            module.push(self.to.expression_statement(call));
        }
        name
    }
}
