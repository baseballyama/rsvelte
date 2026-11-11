//! Where a node sits, for the rune checks: upstream reads it from the node's parents.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, BindingPattern, Expression, MethodDefinitionKind,
};
use oxc_span::GetSpan;
use rsvelte_typescript_compile::strip::is_type_only;

use super::{Body, Frame, Parent, Place};

/// Where `kind`, a child of `frame`, sits.
pub(super) fn place_of(frame: &Frame<'_>, kind: AstKind<'_>) -> Place {
    let place = frame.place;
    // Upstream's tree has no parentheses, and no type wrappers once types are erased.
    if matches!(
        frame.kind,
        AstKind::ParenthesizedExpression(_)
            | AstKind::TSAsExpression(_)
            | AstKind::TSSatisfiesExpression(_)
            | AstKind::TSNonNullExpression(_)
            | AstKind::TSTypeAssertion(_)
            | AstKind::TSInstantiationExpression(_)
    ) {
        return place;
    }
    Place {
        parent: parent_of(frame, kind),
        module: place.module,
        // A class's heritage and computed keys run where the class is defined.
        rendering: place.rendering
            && !matches!(
                frame.kind,
                AstKind::Function(_) | AstKind::ArrowFunctionExpression(_)
            ),
    }
}

/// Where `kind`, a child of `frame`, sits, given where `frame` sits.
fn parent_of(frame: &Frame<'_>, kind: AstKind<'_>) -> Parent {
    let parent = frame.place.parent;
    let is = |span: oxc_span::Span| kind.span() == span;
    match (frame.kind, parent) {
        (AstKind::Program(_), _) if !frame.place.module => Parent::InstanceBody,
        (AstKind::VariableDeclaration(_), Parent::InstanceBody) => Parent::TopDeclarator,
        // Upstream asks for the instance scope, which an `export` does not leave.
        (
            AstKind::ExportDeclaration(_) | AstKind::ExportNamedDeclaration(_),
            Parent::InstanceBody,
        ) => Parent::InstanceBody,
        (AstKind::VariableDeclarator(d), _) if d.init.as_ref().is_some_and(|i| is(i.span())) => {
            Parent::Initializer {
                top: parent == Parent::TopDeclarator,
                named: matches!(d.id, BindingPattern::BindingIdentifier(_)),
                rune: frame.rune,
            }
        }
        (AstKind::VariableDeclarator(_), _) if frame.rune == Some("$props") => Parent::Props,
        (AstKind::ObjectPattern(_), Parent::Props) => Parent::PropsProperty,
        // A shorthand's key spans its value too, and is a name.
        (AstKind::BindingProperty(p), Parent::PropsProperty)
            if is(p.value.span()) && !matches!(kind, AstKind::IdentifierName(_)) =>
        {
            Parent::PropsValue
        }
        (AstKind::AssignmentPattern(p), Parent::PropsValue) if is(p.right.span()) => {
            Parent::PropsDefault
        }
        (AstKind::MethodDefinition(m), _) if m.kind == MethodDefinitionKind::Constructor => {
            Parent::Constructor
        }
        (AstKind::Function(f), _) if matches!(kind, AstKind::FunctionBody(_)) => {
            Parent::Body(Body {
                constructor: parent == Parent::Constructor,
                generator: f.generator,
            })
        }
        (AstKind::ArrowFunctionExpression(_), _) if matches!(kind, AstKind::FunctionBody(_)) => {
            Parent::Body(Body {
                constructor: false,
                generator: false,
            })
        }
        (AstKind::FunctionBody(body), Parent::Body(function)) => {
            // Upstream's body starts with its directives, and has no statement types erase.
            let first = body.directives.is_empty()
                && (body.statements.iter())
                    .find(|s| !is_type_only(s))
                    .is_some_and(|s| is(s.span()));
            Parent::BodyStatement(function, first)
        }
        (AstKind::ExpressionStatement(_), Parent::BodyStatement(body, first)) => {
            Parent::Statement(Some((body, first)))
        }
        (
            AstKind::IfStatement(_)
            | AstKind::ForStatement(_)
            | AstKind::ForInStatement(_)
            | AstKind::ForOfStatement(_)
            | AstKind::WhileStatement(_)
            | AstKind::DoWhileStatement(_)
            | AstKind::LabeledStatement(_)
            | AstKind::WithStatement(_),
            _,
        ) if matches!(kind, AstKind::ExpressionStatement(_)) => Parent::LoneStatement,
        (AstKind::ExpressionStatement(_), Parent::LoneStatement) => Parent::LoneExpression,
        (AstKind::ExpressionStatement(_), _) => Parent::Statement(None),
        (AstKind::CallExpression(call), Parent::Statement(statement))
            if is(call.callee.span())
                && matches!(kind, AstKind::StaticMemberExpression(m) if m.property.name == "with") =>
        {
            Parent::InspectWith(statement)
        }
        (AstKind::StaticMemberExpression(_), Parent::InspectWith(statement))
            if matches!(kind, AstKind::CallExpression(c)
                if matches!(&c.callee, Expression::Identifier(i) if i.name == "$inspect")) =>
        {
            Parent::Statement(statement)
        }
        (
            AstKind::AssignmentExpression(assign),
            Parent::Statement(Some((
                Body {
                    constructor: true, ..
                },
                _,
            ))),
        ) if assign.operator == AssignmentOperator::Assign
            && is(assign.right.span())
            && assigns_this_property(&assign.left) =>
        {
            Parent::ConstructorAssignment
        }
        (AstKind::PropertyDefinition(p), _)
            if !p.computed && !p.r#static && p.value.as_ref().is_some_and(|v| is(v.span())) =>
        {
            Parent::ClassField
        }
        _ => Parent::Other,
    }
}

/// Upstream's `this.x`, `this.#x` or `this[<literal>]`.
fn assigns_this_property(target: &AssignmentTarget<'_>) -> bool {
    match target {
        AssignmentTarget::StaticMemberExpression(m) => {
            matches!(m.object, Expression::ThisExpression(_))
        }
        AssignmentTarget::PrivateFieldExpression(m) => {
            matches!(m.object, Expression::ThisExpression(_))
        }
        AssignmentTarget::ComputedMemberExpression(m) => {
            matches!(m.object, Expression::ThisExpression(_))
                && matches!(
                    m.expression,
                    Expression::StringLiteral(_)
                        | Expression::NumericLiteral(_)
                        | Expression::BooleanLiteral(_)
                        | Expression::NullLiteral(_)
                        | Expression::RegExpLiteral(_)
                        | Expression::BigIntLiteral(_)
                )
        }
        _ => false,
    }
}
