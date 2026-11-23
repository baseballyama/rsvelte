//! The node around oxc's label that decides what acorn reports, found as the tree is walked.

use std::borrow::Cow;

use oxc_ast::ast::{ArrowFunctionBody, Declaration, FormalParameters, Function};
use oxc_ast::{AstKind, AstType};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::Acorn;
use super::word::{Home, Read, Word};

/// What acorn reports about a node around oxc's label, found as the tree is walked.
#[derive(Debug)]
pub struct Locator {
    label: oxc_span::Span,
    find: Find,
    pub(super) found: Option<(u32, AstType)>,
    pub(super) rest: AroundRest,
    /// Whether acorn reads the label as a name declared, for [`Find::Binding`]: in a script, a
    /// function or a parameter list. A template's pattern and `{@const}` are none of these, and
    /// upstream hands each to acorn as the target of an assignment.
    pub(super) declares: bool,
    /// For [`Find::Redeclared`], whether the first declaration is a type alias or an interface.
    pub(super) first_is_type: bool,
    /// For [`Find::Redeclared`], the symbol the first declaration's name binds.
    first_symbol: Option<oxc_syntax::symbol::SymbolId>,
    /// For [`Find::Redeclared`], where the name declared again is.
    redeclared: Redeclared,
    /// For [`Find::Home`], where acorn reads the name the label is.
    pub(super) home: Option<Home>,
    /// For [`Find::Home`], the name the label is in the tree, and how acorn reads it.
    pub(super) word: Option<(Word, Read)>,
    /// For [`Find::Home`], the parameters around the label that acorn reads as expressions.
    cover: Cover,
    /// Where acorn checks the label as a name the head of a function binds: at its body.
    head_checked: Option<u32>,
    /// For [`Find::UncheckedName`], whether acorn checks the names of the innermost parameter
    /// list that holds the label.
    parameters_checked: Option<bool>,
    /// Whether the walk took in any node: a part oxc could not read has no tree.
    pub(super) walked: bool,
}

/// The parameters around a label that acorn reads as an expression, before it meets the `=>`
/// that makes them an arrow function's: its words are tokens, so `await` there is a keyword
/// wherever acorn can await.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Cover {
    None,
    /// A parenthesized parameter list, or an async arrow's, which acorn reads as a call's
    /// arguments, where a spread is an expression too; acorn then checks it as parameters.
    List {
        is_async: bool,
    },
    /// A plain arrow's one parameter without parentheses, an expression that `=>` ends.
    Bare,
}

/// The span of a class member's key, where it is a public name.
fn public_key(key: &oxc_ast::ast::PropertyKey<'_>) -> Option<oxc_span::Span> {
    (!key.is_private_identifier()).then(|| key.span())
}

/// Where the name a second declaration declares again is, which oxc labels.
#[derive(Clone, Copy, Debug)]
enum Redeclared {
    /// The label is the name.
    Label,
    /// The label is a variable declarator, and the name the binding in it of the first
    /// declaration's symbol, once the walk meets it.
    Declarator(Option<oxc_span::Span>),
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
    /// The start of the innermost function around the label.
    Function,
    /// The start of the class member around the label.
    Member,
    /// What decides how acorn reads the rest element whose `?` is the label.
    OptionalRest,
    /// The name the label is, where oxc's tree declares one.
    Binding,
    /// The class accessor without a body whose key is the label.
    BodilessAccessor,
    /// The node that declares the label as a name acorn reads without checking it: a class
    /// expression's, a type parameter's, a mapped type's key, or a parameter of a signature or
    /// of a function without a body.
    UncheckedName,
    /// The function declaration whose body is the label, which acorn-typescript reports an
    /// implementation in an ambient context at; it reads a method's body without a check.
    Implementation,
    /// The `break` or `continue` statement around the label.
    Jump,
    /// The `delete` around the label.
    Unary,
    /// The innermost method, class field, static block or other function around the label, which
    /// decides whether acorn allows `super` there.
    SuperHome,
    /// The initializer of the class field whose key is the label.
    Initializer,
    /// The module reference of the import equals declaration that is the label.
    ModuleReference,
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
            declares: false,
            first_is_type: false,
            first_symbol: None,
            redeclared: Redeclared::Label,
            home: None,
            word: None,
            cover: Cover::None,
            head_checked: None,
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

    /// For [`Find::Redeclared`], the name declared again, where acorn fails.
    pub(super) const fn redeclared_name(&self) -> Option<oxc_span::Span> {
        match self.redeclared {
            Redeclared::Label => Some(self.label),
            Redeclared::Declarator(binding) => binding,
        }
    }

    fn enter_redeclared(&mut self, first: oxc_span::Span, kind: AstKind<'_>, around: bool) {
        match kind {
            AstKind::VariableDeclarator(it) if it.span == self.label => {
                self.redeclared = Redeclared::Declarator(None);
            }
            // The first declaration comes first in the walk, as oxc binds in source order.
            AstKind::BindingIdentifier(it) if it.span == first => {
                self.first_symbol = it.symbol_id.get();
            }
            AstKind::BindingIdentifier(it)
                if matches!(self.redeclared, Redeclared::Declarator(None))
                    && self.label.contains_inclusive(it.span)
                    && it.symbol_id.get() == self.first_symbol =>
            {
                self.redeclared = Redeclared::Declarator(Some(it.span));
            }
            _ => {}
        }
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
        let name = match kind {
            AstKind::IdentifierReference(it) => Some(&it.name),
            AstKind::BindingIdentifier(it) => Some(&it.name),
            AstKind::LabelIdentifier(it) => Some(&it.name),
            _ => None,
        };
        if let Some(name) = name.filter(|_| kind.span() == self.label) {
            let read = match self.cover {
                Cover::None => Read::Name,
                Cover::List { .. } => Read::Parameter,
                Cover::Bare => Read::Expression,
            };
            self.word = Some((Word::named(name, self.label), read));
        }
        let holds = |span: oxc_span::Span| span.contains_inclusive(self.label);
        self.cover = match kind {
            AstKind::ArrowFunctionExpression(it) if it.params.span == self.label => {
                // acorn reads an async arrow's one parameter without parentheses as a name.
                if it.r#async { Cover::None } else { Cover::Bare }
            }
            AstKind::ArrowFunctionExpression(it) if holds(it.params.span) => Cover::List {
                is_async: it.r#async,
            },
            // acorn reads a plain arrow's rest parameter, and a shorthand property, as names; a
            // rest element nested in a pattern there is a spread, an expression.
            AstKind::FormalParameterRest(it)
                if holds(it.span) && self.cover == (Cover::List { is_async: false }) =>
            {
                Cover::None
            }
            AstKind::BindingProperty(it) if it.shorthand && holds(it.value.span()) => Cover::None,
            _ => self.cover,
        };
        if let Some((governs, home)) = governed(kind)
            && holds(governs)
        {
            self.home = Some(home);
            self.cover = Cover::None;
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

    /// acorn's failure at `at` with `message` for the name the label is, which it raises when it
    /// checks the names a function's head binds.
    pub(super) const fn checked(&self, message: Cow<'static, str>, at: u32) -> Acorn {
        match self.head_checked {
            Some(raised) => Acorn::FailsLater {
                message,
                at,
                raised,
            },
            None => Acorn::Fails { message, at },
        }
    }

    /// Where acorn checks the label as a name the head of a function around it binds: a
    /// parameter's, at the start of its block body or the end of its expression body, or a
    /// function expression's own, at the start of its body. The innermost function decides.
    fn enter_head_check(&mut self, kind: AstKind<'_>) {
        let names =
            |parameters: &FormalParameters<'_>| parameters.span.contains_inclusive(self.label);
        self.head_checked = match kind {
            AstKind::Function(it) => {
                // acorn checks a declaration's own name as it reads it.
                let own =
                    (it.id.as_ref()).filter(|id| !it.is_declaration() && id.span == self.label);
                (it.body.as_ref())
                    .filter(|_| names(&it.params) || own.is_some())
                    .map(|body| body.span.start)
            }
            AstKind::ArrowFunctionExpression(it) => names(&it.params).then(|| match &it.body {
                ArrowFunctionBody::FunctionBody(body) => body.span.start,
                body => body.span().end,
            }),
            _ => self.head_checked,
        };
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
        if around {
            self.enter_head_check(kind);
        }
        if matches!(self.find, Find::Binding)
            && around
            && matches!(
                kind,
                AstKind::Program(_)
                    | AstKind::Function(_)
                    | AstKind::ArrowFunctionExpression(_)
                    | AstKind::FormalParameters(_)
            )
        {
            self.declares = true;
        }
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
            // A method's function is the method, which comes first in the walk.
            (Find::SuperHome, AstKind::MethodDefinition(it)) if around => it.value.span.start,
            (Find::SuperHome, AstKind::Function(it))
                if around && self.found != Some((it.span.start, AstType::MethodDefinition)) =>
            {
                it.span.start
            }
            (Find::OperandEnd, AstKind::TSAsExpression(it)) if it.span == self.label => {
                it.expression.span().end
            }
            (Find::OperandEnd, AstKind::TSSatisfiesExpression(it)) if it.span == self.label => {
                it.expression.span().end
            }
            (Find::Binding, AstKind::BindingIdentifier(it)) if it.span == self.label => {
                it.span.start
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
            (Find::ModuleReference, AstKind::TSImportEqualsDeclaration(it))
                if it.span == self.label =>
            {
                it.module_reference.span().start
            }
            (Find::Initializer, AstKind::PropertyDefinition(it)) if it.key.span() == self.label => {
                let Some(value) = &it.value else { return };
                value.span().start
            }
            (Find::Function, AstKind::Function(_) | AstKind::ArrowFunctionExpression(_))
            | (
                Find::Member,
                AstKind::MethodDefinition(_)
                | AstKind::PropertyDefinition(_)
                | AstKind::AccessorProperty(_),
            )
            | (Find::Jump, AstKind::BreakStatement(_) | AstKind::ContinueStatement(_))
            | (Find::Unary, AstKind::UnaryExpression(_))
            | (
                Find::SuperHome,
                AstKind::PropertyDefinition(_)
                | AstKind::AccessorProperty(_)
                | AstKind::StaticBlock(_),
            ) if around => kind.span().start,
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
fn governed(kind: AstKind<'_>) -> Option<(oxc_span::Span, Home)> {
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
