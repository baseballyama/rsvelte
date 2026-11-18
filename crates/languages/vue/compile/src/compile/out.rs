//! Output nodes the shared builder has no constructor for.

use oxc_allocator::GetAllocator;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, BindingIdentifier, ExportDefaultDeclarationKind, Expression,
    FormalParameters, ImportDeclarationSpecifier, ImportOrExportKind, ModuleExportName, Statement,
    StringLiteral,
};
use oxc_span::SPAN;
use rsvelte_typescript_compile::build::Builder;

/// `import { imported as local, … } from 'source'`.
pub(super) fn import<'o>(
    b: &Builder<'o>,
    specifiers: impl IntoIterator<Item = (&'o str, &'o str)>,
    source: &str,
) -> Statement<'o> {
    let specifiers = b.vec(specifiers.into_iter().map(|(imported, local)| {
        ImportDeclarationSpecifier::new_import_specifier(
            SPAN,
            ModuleExportName::new_identifier_name(SPAN, imported, b),
            BindingIdentifier::new(SPAN, local, b),
            ImportOrExportKind::Value,
            b,
        )
    }));
    Statement::new_import_declaration(
        SPAN,
        Some(specifiers),
        StringLiteral::new(SPAN, b.str(source), None, b),
        None,
        None,
        ImportOrExportKind::Value,
        b,
    )
}

/// `import local from 'source'`.
pub(super) fn import_default<'o>(b: &Builder<'o>, local: &str, source: &str) -> Statement<'o> {
    let specifier = ImportDeclarationSpecifier::new_import_default_specifier(
        SPAN,
        BindingIdentifier::new(SPAN, b.str(local), b),
        b,
    );
    Statement::new_import_declaration(
        SPAN,
        Some(b.vec([specifier])),
        StringLiteral::new(SPAN, b.str(source), None, b),
        None,
        None,
        ImportOrExportKind::Value,
        b,
    )
}

/// `export default value`.
pub(super) fn export_default<'o>(b: &Builder<'o>, value: Expression<'o>) -> Statement<'o> {
    Statement::new_export_default_declaration(SPAN, ExportDefaultDeclarationKind::from(value), b)
}

/// `/* @__PURE__ */ callee(arguments)`.
pub(super) fn pure_call<'o>(
    b: &Builder<'o>,
    callee: Expression<'o>,
    arguments: impl IntoIterator<Item = Expression<'o>>,
) -> Expression<'o> {
    let mut call = b.call(callee, arguments);
    if let Expression::CallExpression(c) = &mut call {
        c.pure = true;
    }
    call
}

/// `[...value]`.
pub(super) fn spread_array<'o>(b: &Builder<'o>, value: Expression<'o>) -> Expression<'o> {
    let element = ArrayExpressionElement::new_spread_element(SPAN, value, b);
    Expression::new_array_expression(SPAN, b.vec([element]), b)
}

/// `(...rest) => body`.
pub(super) fn rest_arrow<'o>(b: &Builder<'o>, rest: &str, body: Expression<'o>) -> Expression<'o> {
    let element = oxc_ast::ast::BindingRestElement::new(SPAN, b.binding(rest), b);
    let parameters = FormalParameters::boxed(
        SPAN,
        oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
        b.vec([]),
        Some(oxc_ast::ast::FormalParameterRest::boxed(
            SPAN,
            [],
            element,
            None,
            b,
        )),
        b,
    );
    b.arrow(parameters, body)
}

/// `callee(...argument)`.
pub(super) fn spread_call<'o>(
    b: &Builder<'o>,
    callee: Expression<'o>,
    argument: Expression<'o>,
) -> Expression<'o> {
    let argument = Argument::new_spread_element(SPAN, argument, b);
    Expression::new_call_expression(SPAN, callee, None, b.vec([argument]), false, b)
}

/// `name(…) { … }` for a function expression `function`.
pub(super) fn method<'o>(
    b: &Builder<'o>,
    name: &str,
    function: Expression<'o>,
) -> oxc_ast::ast::ObjectPropertyKind<'o> {
    oxc_ast::ast::ObjectPropertyKind::new_object_property(
        SPAN,
        oxc_ast::ast::PropertyKind::Init,
        b.key(name),
        function,
        true,
        false,
        false,
        b,
    )
}

/// A name in the output's arena.
pub(super) fn name<'o>(b: &Builder<'o>, name: &str) -> &'o str {
    b.allocator().alloc_str(name)
}
