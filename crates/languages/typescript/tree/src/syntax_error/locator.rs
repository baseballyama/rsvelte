//! The node around oxc's label that decides what acorn reports, found as the tree is walked.

use oxc_ast::ast::{Declaration, Function};
use oxc_ast::{AstKind, AstType};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::word::Home;

/// What acorn reports about a node around oxc's label, found as the tree is walked.
#[derive(Debug)]
pub struct Locator {
    label: oxc_span::Span,
    find: Find,
    pub(super) found: Option<(u32, AstType)>,
    pub(super) rest: AroundRest,
    /// For [`Find::Redeclared`], whether the first declaration is a type alias or an interface.
    pub(super) first_is_type: bool,
    /// For [`Find::Home`], where acorn reads the name the label is.
    pub(super) home: Option<Home>,
    /// For [`Find::UncheckedName`], whether acorn checks the names of the innermost parameter
    /// list that holds the label.
    parameters_checked: Option<bool>,
    /// Whether the walk took in any node: a part oxc could not read has no tree.
    pub(super) walked: bool,
}

/// The span of a class member's key, where it is a public name.
fn public_key(key: &oxc_ast::ast::PropertyKey<'_>) -> Option<oxc_span::Span> {
    (!key.is_private_identifier()).then(|| key.span())
}

/// What decides how acorn reads an optional rest element, from the nodes around it.
#[derive(Clone, Copy, Debug)]
pub(super) struct AroundRest {
    /// Under a `declare`, where acorn checks no pattern.
    pub(super) ambient: bool,
    /// How acorn reads the innermost parameter list.
    pub(super) reading: Reading,
    /// What holds the patterns entered last.
    pub(super) holder: Holder,
    /// The innermost rest element, and what holds it.
    pub(super) rest: Option<(oxc_span::Span, Holder)>,
}

/// How acorn reads a parameter list.
#[derive(Clone, Copy, Debug)]
pub(super) enum Reading {
    /// As bindings, which may not be optional patterns.
    Binding,
    /// As a parenthesized expression, or an async function's arguments, turned into parameters.
    Arrow { is_async: bool },
    /// As a type, which checks no pattern.
    Type,
}

/// What holds a rest element.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) enum Holder {
    Parameters,
    Array,
    Object,
}

#[derive(Clone, Copy, Debug)]
pub(super) enum Find {
    /// The end of the operand of the type assertion that is the label.
    OperandEnd,
    /// What decides how acorn reads the rest element whose `?` is the label.
    OptionalRest,
    /// The class accessor without a body whose key is the label.
    BodilessAccessor,
    /// The node that declares the label as a name acorn reads without checking it: a class
    /// expression's, a type parameter's, a mapped type's key, or a parameter of a signature or
    /// of a function without a body.
    UncheckedName,
    /// The function declaration whose body is the label, which acorn-typescript reports an
    /// implementation in an ambient context at; it reads a method's body without a check.
    Implementation,
    /// The initializer of the class field whose key is the label.
    Initializer,
    /// The class field with a public name whose initializer is the label.
    PublicFieldValue,
    /// The type alias, interface, class member with a public name or enum member whose name is
    /// the label, or the parameter list around it or the signature or function without a body
    /// that holds it, where the label redeclares the name the span is.
    Redeclared(oxc_span::Span),
    /// Where acorn reads the name the label is: the innermost function, class static block or
    /// class field initializer around it.
    Home,
}

impl Locator {
    pub(super) const fn new(start: u32, end: u32, find: Find) -> Self {
        Self {
            label: oxc_span::Span::new(start, end),
            find,
            found: None,
            first_is_type: false,
            home: None,
            parameters_checked: None,
            walked: false,
            rest: AroundRest {
                ambient: false,
                reading: Reading::Binding,
                holder: Holder::Parameters,
                rest: None,
            },
        }
    }

    fn enter_around_rest(&mut self, kind: AstKind<'_>) {
        let around = &mut self.rest;
        let reading = match kind {
            AstKind::Function(it) => {
                around.ambient |= it.declare;
                Reading::Binding
            }
            AstKind::ArrowFunctionExpression(it) => Reading::Arrow {
                is_async: it.r#async,
            },
            AstKind::TSFunctionType(_)
            | AstKind::TSConstructorType(_)
            | AstKind::TSMethodSignature(_)
            | AstKind::TSCallSignatureDeclaration(_)
            | AstKind::TSConstructSignatureDeclaration(_) => Reading::Type,
            AstKind::Class(it) => return around.ambient |= it.declare,
            AstKind::VariableDeclaration(it) => return around.ambient |= it.declare,
            AstKind::TSNamespaceDeclaration(it) => return around.ambient |= it.declare,
            AstKind::TSExternalModuleDeclaration(it) => return around.ambient |= it.declare,
            AstKind::TSGlobalDeclaration(it) => return around.ambient |= it.declare,
            AstKind::ArrayPattern(_) => return around.holder = Holder::Array,
            AstKind::ObjectPattern(_) => return around.holder = Holder::Object,
            AstKind::FormalParameterRest(it) => {
                return around.rest = Some((it.rest.span, Holder::Parameters));
            }
            // A rest parameter's element is the rest parameter itself.
            AstKind::BindingRestElement(it) => {
                if around.rest != Some((it.span, Holder::Parameters)) {
                    around.rest = Some((it.span, around.holder));
                }
                return;
            }
            _ => return,
        };
        around.reading = reading;
        around.holder = Holder::Parameters;
    }

    fn enter_redeclared(&mut self, first: oxc_span::Span, kind: AstKind<'_>, around: bool) {
        // The innermost holder of parameters around the label decides: a signature or a function
        // without a body, whose parameter names acorn does not check, or the parameter list of
        // one that has a body.
        if let Some(checked) = parameters_checked(kind).filter(|_| around) {
            self.found = (!checked).then(|| (kind.span().start, kind.ty()));
        }
        let name = match kind {
            AstKind::FormalParameters(it) if around && self.found.is_none() => {
                return self.found = Some((it.span.start, kind.ty()));
            }
            AstKind::TSTypeAliasDeclaration(it) => Some(it.id.span),
            AstKind::TSInterfaceDeclaration(it) => Some(it.id.span),
            AstKind::PropertyDefinition(it) => public_key(&it.key),
            AstKind::MethodDefinition(it) => public_key(&it.key),
            AstKind::AccessorProperty(it) => public_key(&it.key),
            AstKind::TSEnumMember(it) => Some(it.id.span()),
            _ => None,
        };
        let Some(name) = name else { return };
        self.first_is_type |= name == first;
        if name == self.label {
            self.found = Some((name.start, kind.ty()));
        }
    }

    fn enter_home(&mut self, kind: AstKind<'_>) {
        if let Some((governs, home)) = governed(kind)
            && governs.contains_inclusive(self.label)
        {
            self.home = Some(home);
        }
    }

    /// The spans whose nodes decide what the locator finds: those around each, those in each,
    /// and no other node. The label, and for a second declaration the first one's name.
    pub fn regions(&self) -> impl Iterator<Item = oxc_span::Span> {
        let first = match self.find {
            Find::Redeclared(first) => Some(first),
            _ => None,
        };
        std::iter::once(self.label).chain(first)
    }

    fn enter_unchecked_name(&mut self, kind: AstKind<'_>, around: bool) {
        if around && let Some((parameters, checked)) = parameter_list(kind) {
            self.parameters_checked = parameters.contains_inclusive(self.label).then_some(checked);
        }
        let name = match kind {
            AstKind::Class(it) if it.is_expression() => it.id.as_ref().map(|id| id.span),
            AstKind::TSTypeParameter(it) => Some(it.name.span),
            AstKind::TSMappedType(it) => Some(it.key.span),
            AstKind::BindingIdentifier(it) if self.parameters_checked == Some(false) => {
                Some(it.span)
            }
            _ => None,
        };
        if name == Some(self.label) {
            self.found = Some((kind.span().start, kind.ty()));
        }
    }

    /// Takes in a node of the walk, outer nodes before inner ones.
    pub fn enter(&mut self, kind: AstKind<'_>) {
        self.walked = true;
        let around = kind.span().contains_inclusive(self.label);
        if matches!(self.find, Find::OptionalRest) {
            if around {
                self.enter_around_rest(kind);
            }
            return;
        }
        if matches!(self.find, Find::UncheckedName) {
            return self.enter_unchecked_name(kind, around);
        }
        if let Find::Redeclared(first) = self.find {
            return self.enter_redeclared(first, kind, around);
        }
        if matches!(self.find, Find::Home) {
            return self.enter_home(kind);
        }
        let found = match (self.find, kind) {
            (Find::OperandEnd, AstKind::TSAsExpression(it)) if it.span == self.label => {
                it.expression.span().end
            }
            (Find::OperandEnd, AstKind::TSSatisfiesExpression(it)) if it.span == self.label => {
                it.expression.span().end
            }
            (Find::BodilessAccessor, AstKind::MethodDefinition(it))
                if it.key.span() == self.label
                    && it.kind.is_accessor()
                    && it.value.body.is_none() =>
            {
                it.span.start
            }
            (Find::Implementation, AstKind::ExportDeclaration(it))
                if let Declaration::FunctionDeclaration(function) = &it.declaration
                    && function.declare
                    && implements(function, self.label) =>
            {
                function.span.start
            }
            (Find::Implementation, AstKind::Function(it))
                if self.found.is_none() && it.is_declaration() && implements(it, self.label) =>
            {
                it.span.start
            }
            (Find::PublicFieldValue, AstKind::PropertyDefinition(it))
                if !it.key.is_private_identifier()
                    && it
                        .value
                        .as_ref()
                        .is_some_and(|value| value.span() == self.label) =>
            {
                it.span.start
            }
            (Find::Initializer, AstKind::PropertyDefinition(it)) if it.key.span() == self.label => {
                let Some(value) = &it.value else { return };
                value.span().start
            }
            _ => return,
        };
        self.found = Some((found, kind.ty()));
    }
}

/// Whether acorn checks the names of the parameters `kind` holds, where it holds any.
fn parameters_checked(kind: AstKind<'_>) -> Option<bool> {
    parameter_list(kind).map(|(_, checked)| checked)
}

/// The parameter list `kind` holds, and whether acorn checks its names: those of a function with
/// a body.
fn parameter_list(kind: AstKind<'_>) -> Option<(oxc_span::Span, bool)> {
    Some(match kind {
        AstKind::Function(it) => (it.params.span, it.body.is_some()),
        AstKind::ArrowFunctionExpression(it) => (it.params.span, true),
        AstKind::TSFunctionType(it) => (it.params.span, false),
        AstKind::TSConstructorType(it) => (it.params.span, false),
        AstKind::TSMethodSignature(it) => (it.params.span, false),
        AstKind::TSCallSignatureDeclaration(it) => (it.params.span, false),
        AstKind::TSConstructSignatureDeclaration(it) => (it.params.span, false),
        _ => return None,
    })
}

/// The home `kind` is, and the source it governs, where acorn reads a name in that home.
pub(super) fn governed(kind: AstKind<'_>) -> Option<(oxc_span::Span, Home)> {
    let function = |span, is_async, is_generator| {
        Some((
            span,
            Home::Function {
                is_async,
                is_generator,
            },
        ))
    };
    match kind {
        // acorn reads a declaration's name before it enters the function, and an expression's in
        // it.
        AstKind::Function(it) => {
            let id = it.id.as_ref().filter(|_| it.is_declaration());
            let start = id.map_or(it.span.start, |id| id.span.end);
            function(
                oxc_span::Span::new(start, it.span.end),
                it.r#async,
                it.generator,
            )
        }
        // acorn reads an arrow's parameters before it knows they are an arrow's.
        AstKind::ArrowFunctionExpression(it) => function(it.body.span(), it.r#async, false),
        AstKind::StaticBlock(it) => Some((it.span, Home::StaticBlock)),
        AstKind::PropertyDefinition(it) => Some((it.value.as_ref()?.span(), Home::Initializer)),
        AstKind::AccessorProperty(it) => Some((it.value.as_ref()?.span(), Home::Initializer)),
        _ => None,
    }
}

impl<'a> Visit<'a> for Locator {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.enter(kind);
    }
}

/// What `find` finds around `start..end` in the tree `visit` walks.
pub(super) fn locate(
    start: u32,
    end: u32,
    find: Find,
    visit: impl FnOnce(&mut Locator),
) -> Option<(u32, AstType)> {
    let mut locator = Locator::new(start, end, find);
    visit(&mut locator);
    locator.found
}

/// Whether the body of `function` is `label`.
fn implements(function: &Function<'_>, label: oxc_span::Span) -> bool {
    (function.body.as_ref()).is_some_and(|body| body.span.start == label.start)
}
