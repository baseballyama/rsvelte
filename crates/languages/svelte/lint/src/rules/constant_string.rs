//! Values a rule can know without running the code: what a `const` holds, and a string built
//! only from literals.

use oxc_ast::AstKind;
use oxc_ast::ast::{BindingPattern, Expression};
use oxc_semantic::SymbolFlags;
use oxc_syntax::operator::BinaryOperator;
use rsvelte_typescript_semantic::semantic::Semantic;

/// Follows an identifier through `const name = initializer` declarations to the first expression
/// that is not such an identifier (`findRootExpression` upstream). A cycle stops where it closes.
pub(super) fn root<'s>(
    semantic: &'s Semantic,
    mut expression: &'s Expression<'s>,
) -> &'s Expression<'s> {
    let scoping = semantic.scoping();
    let mut visited = Vec::new();
    while let Expression::Identifier(identifier) = expression {
        if visited.contains(&identifier.span) {
            break;
        }
        visited.push(identifier.span);
        let Some(symbol) = identifier
            .reference_id
            .get()
            .and_then(|reference| scoping.get_reference(reference).symbol_id())
        else {
            break;
        };
        let flags = scoping.symbol_flags(symbol);
        // A type of the same name makes it one name with two definitions.
        if !flags.contains(SymbolFlags::ConstVariable)
            || flags.intersects(SymbolFlags::TypeAlias | SymbolFlags::Interface)
        {
            break;
        }
        // A destructured name does not hold the initializer.
        let AstKind::VariableDeclarator(declarator) =
            semantic.nodes().kind(scoping.symbol_declaration(symbol))
        else {
            break;
        };
        let (BindingPattern::BindingIdentifier(id), Some(initializer)) =
            (&declarator.id, &declarator.init)
        else {
            break;
        };
        if id.symbol_id.get() != Some(symbol) {
            break;
        }
        expression = initializer;
    }
    expression
}

/// A string literal, a template whose expressions are such strings, or their `+`
/// (`getStringIfConstant` upstream).
pub(super) fn string_if_constant(expression: &Expression<'_>) -> Option<String> {
    match expression {
        Expression::StringLiteral(string) => Some(string.value.display().to_string()),
        Expression::TemplateLiteral(template) => {
            let mut out = String::new();
            for (index, quasi) in template.quasis.iter().enumerate() {
                // An invalid escape has no cooked value.
                out.push_str(&quasi.value.cooked?.display().to_string());
                if let Some(inner) = template.expressions.get(index) {
                    out.push_str(&string_if_constant(inner)?);
                }
            }
            Some(out)
        }
        Expression::BinaryExpression(binary) if binary.operator == BinaryOperator::Addition => {
            let mut out = string_if_constant(&binary.left)?;
            out.push_str(&string_if_constant(&binary.right)?);
            Some(out)
        }
        _ => None,
    }
}
