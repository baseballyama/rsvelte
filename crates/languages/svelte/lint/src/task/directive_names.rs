use oxc_ast::ast::Expression;
use oxc_span::SourceType;
use oxc_syntax::identifier::is_identifier_name;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Component, Part};
use rsvelte_typescript_tree::Tree;

/// What svelte-eslint-parser throws for the first directive name it reads as another expression
/// than it expects, and where.
///
/// It reads the name of a shorthand `bind:` or `class:` again and needs the identifier Svelte
/// takes it for, and needs a `transition:`, `in:`, `out:` or `animate:` name to be an identifier.
pub(super) fn rejection(component: &Component) -> Option<(String, u32)> {
    let tree = &component.javascript;
    component
        .attributes
        .iter()
        .filter_map(|attribute| {
            let (expression, expected) = match attribute.kind {
                AttributeKind::Bind | AttributeKind::Class if attribute.shorthand => {
                    let AttributeValue::Parts(parts) = attribute.value else {
                        return None;
                    };
                    let [Part::Expression { expression, .. }] = component.parts(parts) else {
                        return None;
                    };
                    (*expression, "Identifier")
                }
                AttributeKind::Transition { .. } | AttributeKind::Animate => {
                    (attribute.target?, "JS Identifier")
                }
                _ => return None,
            };
            let expression = tree.get_expression(expression);
            let found = match expression {
                // Svelte takes a name like `a.b` as one identifier; the parser reads it as code.
                Expression::Identifier(name) if !is_identifier_name(&name.name) => {
                    reread_type(&name.name)?
                }
                _ => estree_type(expression)?,
            };
            (found != "Identifier").then(|| {
                let at = oxc_span::GetSpan::span(expression).start;
                (format!("Expected {expected}, but {found} found."), at)
            })
        })
        .min_by_key(|&(_, at)| at)
}

/// The `ESTree` type of `text` read as one expression; `None` if it is not one.
fn reread_type(text: &str) -> Option<&'static str> {
    let (_, found) = Tree::build(text, |builder| {
        let read = builder.read_expression_at(0, SourceType::mjs());
        Ok(read.ok().and_then(|(expression, end)| {
            (end as usize == text.len())
                .then(|| estree_type(&expression))
                .flatten()
        }))
    })
    .ok()?;
    found
}

/// The `ESTree` type of `expression`, for the kinds a directive name can be; `None` otherwise.
const fn estree_type(expression: &Expression<'_>) -> Option<&'static str> {
    Some(match expression {
        Expression::Identifier(_) => "Identifier",
        Expression::ThisExpression(_) => "ThisExpression",
        Expression::StaticMemberExpression(_)
        | Expression::ComputedMemberExpression(_)
        | Expression::PrivateFieldExpression(_) => "MemberExpression",
        Expression::BinaryExpression(_) => "BinaryExpression",
        Expression::NullLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::StringLiteral(_) => "Literal",
        _ => return None,
    })
}
