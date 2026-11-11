use oxc_ast::ast::Expression;

use super::Emitter;
use crate::compilation::statements;
use crate::template::CustomElementValues;

impl<'o> Emitter<'_, 'o> {
    /// `const $$component = …; $$component.element = $$custom_element($$component, config)`, and
    /// its registration under the tag.
    pub(super) fn custom_element(
        &mut self,
        component: Expression<'o>,
        options: &CustomElementValues,
        module: &mut Vec<oxc_ast::ast::Statement<'o>>,
    ) -> Expression<'o> {
        let b = self.b;
        module.push(b.const_("$$component", component));
        let mut fields = Vec::new();
        if let Some(stylesheet) = &self.t.stylesheet
            && options.shadow_root
        {
            fields.push(b.init("styles", b.string(stylesheet)));
        }
        if !options.shadow_root {
            fields.push(b.init("shadow", b.boolean(false)));
        }
        for (name, value) in [
            ("shadow", options.shadow),
            ("props", options.props),
            ("extend", options.extend),
        ] {
            if let Some(value) = value {
                let value = self.copy_expression(self.source(value));
                fields.push(b.init(name, value));
            }
        }
        self.helpers.extend([
            "inject",
            "useHost",
            "renderEffect",
            "shallowReactive",
            "defineVaporComponent",
            "createComponent",
            "createVaporApp",
        ]);
        module.extend(statements(b, include_str!("custom_element.js")));
        let element = b.call(
            b.id("$$custom_element"),
            [b.id("$$component"), b.object(fields)],
        );
        let property = || b.member(b.id("$$component"), "element");
        module.push(b.stmt(b.assign_member(property(), element)));
        if let Some(tag) = &options.tag {
            let call = b.call(
                b.member(b.id("customElements"), "define"),
                [b.string(tag), property()],
            );
            module.push(b.stmt(call));
        }
        b.id("$$component")
    }
}
