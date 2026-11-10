mod each_block;
mod if_block;

use oxc_ast::ast::{Argument, Expression, Statement};

use super::ServerCompilationContext;
use crate::lower::sanitize_template_string;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `prepend_block_marker`: folds the marker into a leading static push.
    fn prepend_block_marker(&self, mut body: Vec<Statement<'o>>, marker: &str) -> Statement<'o> {
        let b = self.b;
        let first = body.first_mut().and_then(|first| {
            let Statement::ExpressionStatement(statement) = first else {
                return None;
            };
            let Expression::CallExpression(call) = &mut statement.expression else {
                return None;
            };
            let is_push = matches!(&call.callee, Expression::StaticMemberExpression(m)
                if m.property.name == "push"
                    && matches!(&m.object, Expression::Identifier(o) if o.name == "$$renderer"));
            match call.arguments.as_mut_slice() {
                [Argument::TemplateLiteral(template)] if is_push => template.quasis.first_mut(),
                _ => None,
            }
        });
        if let Some(quasi) = first {
            let raw = format!("{}{}", sanitize_template_string(marker), quasi.value.raw);
            quasi.value.raw = b.str(&raw).into();
            if let Some(cooked) = quasi.value.cooked {
                let cooked = format!("{marker}{}", super::super::javascript::string_value(cooked));
                quasi.value.cooked = Some(b.str(&cooked).into());
            }
        } else {
            body.insert(0, self.push_literal(marker));
        }
        b.block(body)
    }
}
