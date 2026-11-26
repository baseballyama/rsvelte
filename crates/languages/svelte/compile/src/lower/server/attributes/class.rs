use std::borrow::Cow;

use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Attribute, AttributeValue};

use crate::input::Target;
use crate::lower::attributes::scoped_literal_class;
use crate::lower::builder::Runtime;
use crate::lower::server::ServerCompilationContext;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_attr_class`.
    pub(super) fn attribute_class(
        &self,
        directives: &[&Attribute],
        value: Expression<'o>,
        hash: Option<&str>,
    ) -> Expression<'o> {
        let b = self.b;
        let directives = (!directives.is_empty()).then(|| {
            b.object(directives.iter().map(|d| {
                let AttributeValue::Class(e) = d.value else {
                    unreachable!("class directives")
                };
                let key = b.key_by(d.name.text(self.source_text), |_| false);
                b.property(key, self.expression(e))
            }))
        });
        let mut value = value;
        let mut stylesheet_hash = None;
        if let Some(h) = hash {
            if let Expression::StringLiteral(literal) = &value {
                let scoped = scoped_literal_class(literal.value, h, Target::Server, |text| {
                    Cow::Borrowed(text)
                });
                value = b.javascript_string(&scoped);
            } else {
                stylesheet_hash = Some(b.string(h));
            }
        }
        b.runtime_some("attr_class", vec![Some(value), stylesheet_hash, directives])
    }
}
