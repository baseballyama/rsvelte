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

/// A word acorn's `checkUnreserved` refuses as a name in strict module code.
#[derive(Clone, Copy, Debug)]
pub(crate) enum ReservedWord {
    Implements,
    Interface,
    Let,
    Package,
    Private,
    Protected,
    Public,
    Static,
    Yield,
    Await,
}

impl ReservedWord {
    fn of(name: &str) -> Option<Self> {
        Some(match name {
            "implements" => Self::Implements,
            "interface" => Self::Interface,
            "let" => Self::Let,
            "package" => Self::Package,
            "private" => Self::Private,
            "protected" => Self::Protected,
            "public" => Self::Public,
            "static" => Self::Static,
            "yield" => Self::Yield,
            "await" => Self::Await,
            _ => return None,
        })
    }

    pub(super) const fn message(self) -> &'static str {
        match self {
            Self::Implements => "The keyword 'implements' is reserved",
            Self::Interface => "The keyword 'interface' is reserved",
            Self::Let => "The keyword 'let' is reserved",
            Self::Package => "The keyword 'package' is reserved",
            Self::Private => "The keyword 'private' is reserved",
            Self::Protected => "The keyword 'protected' is reserved",
            Self::Public => "The keyword 'public' is reserved",
            Self::Static => "The keyword 'static' is reserved",
            Self::Yield => "The keyword 'yield' is reserved",
            Self::Await => "Cannot use keyword 'await' outside an async function",
        }
    }
}

/// Whether acorn-typescript reads `name` as a TypeScript keyword's token rather than as a name.
pub(super) fn typescript_keyword(name: &str) -> bool {
    matches!(
        name,
        "assert"
            | "asserts"
            | "global"
            | "keyof"
            | "readonly"
            | "unique"
            | "abstract"
            | "declare"
            | "enum"
            | "module"
            | "namespace"
            | "interface"
            | "type"
    )
}

/// A reserved word acorn reads as a name at `kind`: any name a declaration binds, and a name an
/// expression reads, outside a type (`in_type`), whose names acorn-typescript reads liberally.
pub(super) fn reserved(kind: AstKind<'_>, in_type: bool) -> Option<Stop> {
    let (name, span) = match kind {
        AstKind::BindingIdentifier(it) => (it.name.as_str(), it.span),
        AstKind::TSIndexSignatureName(it) => (it.name.as_str(), it.span),
        AstKind::IdentifierReference(it) if !in_type => (it.name.as_str(), it.span),
        _ => return None,
    };
    ReservedWord::of(name).map(|word| Stop {
        at: span.start,
        raised: span.start,
        why: Rejection::Reserved(word),
    })
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
