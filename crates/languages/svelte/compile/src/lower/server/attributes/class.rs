use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Attribute, AttributeValue};

use crate::input::Target;
use crate::lower::attributes::scoped_class;
use crate::lower::builder::Runtime;
use crate::lower::javascript::string_value;
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
                let key = oxc_ast::ast::PropertyKey::from(b.string(d.name.text(self.source_text)));
                b.property(key, self.expression(e), false)
            }))
        });
        let mut value = value;
        let mut stylesheet_hash = None;
        if let Some(h) = hash {
            if let Expression::StringLiteral(literal) = &value {
                value = b.string(&scoped_class(
                    &string_value(literal.value),
                    h,
                    Target::Server,
                ));
            } else {
                stylesheet_hash = Some(b.string(h));
            }
        }
        b.runtime_some("attr_class", vec![Some(value), stylesheet_hash, directives])
    }
}
