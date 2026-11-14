//! The node around oxc's label that decides what acorn reports, found as the tree is walked.

use oxc_ast::{AstKind, AstType};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

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
    /// The `break` or `continue` statement around the label.
    Jump,
    /// The `delete` around the label.
    Unary,
    /// The parameter list around the label.
    Parameters,
    /// The innermost method, class field, static block or other function around the label, which
    /// decides whether acorn allows `super` there.
    SuperHome,
}

impl Locator {
    pub(super) const fn new(start: u32, end: u32, find: Find) -> Self {
        Self {
            label: oxc_span::Span::new(start, end),
            find,
            found: None,
            declares: false,
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

    /// Takes in a node of the walk, outer nodes before inner ones.
    pub fn enter(&mut self, kind: AstKind<'_>) {
        let around = kind.span().contains_inclusive(self.label);
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
            (Find::Function, AstKind::Function(_) | AstKind::ArrowFunctionExpression(_))
            | (
                Find::Member,
                AstKind::MethodDefinition(_)
                | AstKind::PropertyDefinition(_)
                | AstKind::AccessorProperty(_),
            )
            | (Find::Jump, AstKind::BreakStatement(_) | AstKind::ContinueStatement(_))
            | (Find::Unary, AstKind::UnaryExpression(_))
            | (Find::Parameters, AstKind::FormalParameters(_))
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
