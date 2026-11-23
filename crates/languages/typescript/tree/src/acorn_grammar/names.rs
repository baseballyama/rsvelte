//! The names acorn checks in strict mode, where it checks them, for an ambient context: oxc's
//! checker reports `eval` and `arguments` among them outside one, and lets them pass inside one,
//! as TypeScript does, where acorn-typescript checks them all the same.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    ArrowFunctionBody, BindingIdentifier, BindingPattern, FormalParameters,
    TSNamespaceDeclarationBody,
};
use oxc_span::GetSpan;

use super::{Rejection, Stop};

/// A name strict mode does not let a script bind or assign.
#[derive(Clone, Copy, Debug)]
pub(crate) enum Restricted {
    Eval,
    Arguments,
}

impl Restricted {
    fn of(name: &str) -> Option<Self> {
        match name {
            "eval" => Some(Self::Eval),
            "arguments" => Some(Self::Arguments),
            _ => None,
        }
    }

    pub(super) const fn message(self, binds: bool) -> &'static str {
        match (self, binds) {
            (Self::Eval, true) => "Binding eval in strict mode",
            (Self::Eval, false) => "Assigning to eval in strict mode",
            (Self::Arguments, true) => "Binding arguments in strict mode",
            (Self::Arguments, false) => "Assigning to arguments in strict mode",
        }
    }
}

/// Where acorn checks the names the head of the function `kind` is binds: at the start of its
/// block body or the end of its expression body. A function without a body has none.
pub(crate) fn head_checked_at(kind: AstKind<'_>) -> Option<u32> {
    match kind {
        AstKind::Function(it) => it.body.as_ref().map(|body| body.span.start),
        AstKind::ArrowFunctionExpression(it) => Some(match &it.body {
            ArrowFunctionBody::FunctionBody(body) => body.span.start,
            body => body.span().end,
        }),
        _ => None,
    }
}

/// The namespace the next part of `kind`'s dotted name declares.
pub(super) fn dotted(kind: AstKind<'_>) -> Option<oxc_span::Span> {
    match kind {
        AstKind::TSNamespaceDeclaration(it) => match &it.body {
            TSNamespaceDeclarationBody::TSNamespaceDeclaration(next) => Some(next.span),
            TSNamespaceDeclarationBody::TSModuleBlock(_) => None,
        },
        _ => None,
    }
}

/// The first restricted name acorn checks where `kind` declares it, and raises at; `nested` is
/// whether `kind` is a later part of a dotted namespace name.
pub(super) fn strict_name(kind: AstKind<'_>, nested: bool) -> Option<Stop> {
    match kind {
        // acorn reads a declaration's name as it checks it, and checks the name of a function
        // without a body as assigned.
        AstKind::Function(it) if it.is_declaration() => {
            (it.id.as_ref()).and_then(|id| checked(id, it.body.is_some(), None))
        }
        // An expression's own name it checks at its body, after the parameters.
        AstKind::Function(it) => {
            let raised = head_checked_at(kind)?;
            parameter(&it.params, Some(raised)).or_else(|| {
                it.id
                    .as_ref()
                    .and_then(|id| checked(id, true, Some(raised)))
            })
        }
        AstKind::ArrowFunctionExpression(it) => parameter(&it.params, head_checked_at(kind)),
        AstKind::Class(it) if it.is_declaration() => {
            it.id.as_ref().and_then(|id| checked(id, true, None))
        }
        AstKind::TSNamespaceDeclaration(it) if !nested => checked(&it.id, true, None),
        AstKind::TSEnumDeclaration(it) => checked(&it.id, true, None),
        AstKind::TSInterfaceDeclaration(it) => checked(&it.id, true, None),
        AstKind::TSTypeAliasDeclaration(it) => checked(&it.id, true, None),
        AstKind::TSImportEqualsDeclaration(it) => checked(&it.id, true, None),
        AstKind::ImportDeclaration(it) => (it.specifiers.iter().flatten())
            .find_map(|specifier| checked(specifier.local(), true, None)),
        AstKind::CatchParameter(it) => {
            bound(&it.pattern).and_then(|id| checked(id, true, Some(it.pattern.span().end)))
        }
        _ => None,
    }
}

fn checked(id: &BindingIdentifier<'_>, binds: bool, raised: Option<u32>) -> Option<Stop> {
    let name = Restricted::of(&id.name)?;
    Some(Stop {
        at: id.span.start,
        raised: raised.unwrap_or(id.span.start),
        why: Rejection::StrictName { name, binds },
    })
}

/// The first restricted name a parameter of `parameters` binds, checked at `raised`.
fn parameter(parameters: &FormalParameters<'_>, raised: Option<u32>) -> Option<Stop> {
    (parameters.items.iter().map(|parameter| &parameter.pattern))
        .chain(parameters.rest.iter().map(|rest| &rest.rest.argument))
        .find_map(bound)
        .and_then(|id| checked(id, true, raised))
}

/// The first restricted name `pattern` binds.
fn bound<'p, 'a>(pattern: &'p BindingPattern<'a>) -> Option<&'p BindingIdentifier<'a>> {
    match pattern {
        BindingPattern::BindingIdentifier(it) => Restricted::of(&it.name).map(|_| &**it),
        BindingPattern::ObjectPattern(it) => (it.properties.iter().map(|property| &property.value))
            .chain(it.rest.iter().map(|rest| &rest.argument))
            .find_map(bound),
        BindingPattern::ArrayPattern(it) => (it.elements.iter().flatten())
            .chain(it.rest.iter().map(|rest| &rest.argument))
            .find_map(bound),
        BindingPattern::AssignmentPattern(it) => bound(&it.left),
    }
}
