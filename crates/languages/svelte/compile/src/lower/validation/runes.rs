//! Upstream's rune and assignment checks over the scripts and the template expressions.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, BindingPattern, Expression, ForStatementLeft,
    MethodDefinitionKind, Statement, VariableDeclaration, VariableDeclarator,
};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rsvelte_kernel::performance::stack::grow;
use rsvelte_svelte_semantic::compiler_syntax_tree::{AttributeValue, NodeKind};
use rsvelte_typescript_compile::strip::is_type_only;
use rsvelte_typescript_tree::ExpressionIdentifier;
use rustc_hash::FxHashMap;

use crate::lower::{CompileInput, Diagnostic, Resolution, Span, Target, span_of};

mod assignments;
mod calls;

use assignments::{check_assignment, fixed_expression, fixed_simple, fixed_target};

use super::state_invalid_placement;

/// Where a node sits, as far as upstream's rune checks ask.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Parent {
    Other,
    /// A statement of the instance script's body.
    InstanceBody,
    /// A declarator of a declaration in the instance script's body.
    TopDeclarator,
    /// A declarator's initializer; `top` at the instance's top level, `named` binding one name,
    /// and the rune it calls, named once at the declarator.
    Initializer {
        top: bool,
        named: bool,
        rune: Option<&'static str>,
    },
    /// The function of a class's `constructor`.
    Constructor,
    /// A function's block body, a statement of it (`first` or not), and the expression of an
    /// expression statement, which knows the body it stands in.
    Body(Body),
    BodyStatement(Body, bool),
    Statement(Option<(Body, bool)>),
    /// The value of a class field that is neither static nor computed.
    ClassField,
    /// The value of `this.x = …`, a statement of a constructor's body.
    ConstructorAssignment,
    /// The pattern a `$props()` declarator binds, one of its properties, and a property's value.
    Props,
    PropsProperty,
    PropsValue,
    /// The default of a `$props()` property.
    PropsDefault,
}

/// The function whose block body a statement stands in.
#[derive(Clone, Copy, PartialEq, Eq)]
struct Body {
    constructor: bool,
    generator: bool,
}

/// Where a node sits.
#[derive(Clone, Copy)]
struct Place {
    parent: Parent,
    in_class: bool,
    module: bool,
    /// Upstream evaluates it when the component renders: the instance's top level or a
    /// template expression, outside any function.
    rendering: bool,
}

/// A node the walk is inside, with where it sits and the rune a declarator calls.
struct Frame<'a> {
    kind: AstKind<'a>,
    place: Place,
    rune: Option<&'static str>,
}

/// Upstream's rune and assignment checks over the scripts and the template expressions, in
/// document order, then the runes this port does not lower.
struct RuneWalk<'a> {
    res: &'a Resolution,
    target: Target,
    custom_element: bool,
    props: bool,
    props_id: bool,
    /// Where the root being walked sits.
    root: Place,
    frames: Vec<Frame<'a>>,
    error: Option<Diagnostic>,
    /// The first rune this port does not lower, refused only when upstream raises nothing later.
    refused: Option<Diagnostic>,
}

/// A template root: an expression, or a `{@const}` declaration.
#[derive(Clone, Copy)]
enum Root<'a> {
    Expression(ExpressionIdentifier, &'a Expression<'a>),
    Declaration(&'a VariableDeclaration<'a>),
}

/// Raises upstream's rune placement, rune argument and assignment errors, a `bind:` target's
/// among them, then refuses a rune call this port does not lower, a state rune in a class body
/// (class fields are not lowered yet), and on the server an `$effect` that is not a statement of
/// its own (upstream only drops it as an `ExpressionStatement`).
///
/// # Errors
///
/// The upstream or `unsupported` [`Diagnostic`] at the first such call.
pub(in crate::lower) fn check_runes(
    input: &CompileInput<'_>,
    res: &Resolution,
    target: Target,
    custom_element: bool,
) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
    let place = |module, rendering| Place {
        parent: Parent::Other,
        in_class: false,
        module,
        rendering,
    };
    let mut walk = RuneWalk {
        res,
        target,
        custom_element,
        props: false,
        props_id: false,
        root: place(false, false),
        frames: Vec::new(),
        error: None,
        refused: None,
    };
    if let Some(module) = input.component.module {
        walk.root = place(true, false);
        walk.visit_program(javascript.get_program(module));
    }
    if let Some(instance) = input.component.instance {
        walk.root = place(false, true);
        walk.visit_program(javascript.get_program(instance));
    }
    // Upstream checks a binding's target where it visits the directive, before the expression.
    let tree = input.component.compiler_syntax_tree;
    let binds: FxHashMap<ExpressionIdentifier, (Span, bool)> = (tree.nodes.iter())
        .filter_map(|n| match &n.kind {
            NodeKind::Element(el) => Some(tree.attributes(el.attributes)),
            _ => None,
        })
        .flatten()
        .filter_map(|a| match a.value {
            AttributeValue::Bind(target) => Some((
                target,
                (a.span, a.name.text(input.component.source_text) == "this"),
            )),
            _ => None,
        })
        .collect();
    let mut template: Vec<(u32, Root<'_>)> = (javascript.expressions())
        .map(|(identifier, e)| (e.span().start, Root::Expression(identifier, e)))
        .chain((javascript.declarations()).map(|(_, d)| (d.span.start, Root::Declaration(d))))
        .collect();
    // The tree keeps them in the order the parser met them, which is not the document's.
    template.sort_by_key(|&(start, _)| start);
    walk.root = place(false, true);
    for (_, root) in template {
        if walk.error.is_some() {
            break;
        }
        match root {
            Root::Expression(identifier, e) => {
                if let Some(&(span, this)) = binds.get(&identifier)
                    && let Err(error) = walk.check_binding(e, span, this)
                {
                    walk.error = Some(error);
                    break;
                }
                walk.visit_expression(e);
            }
            Root::Declaration(d) => walk.visit_variable_declaration(d),
        }
    }
    match (walk.error, walk.refused) {
        (Some(error), _) | (None, Some(error)) => Err(error),
        (None, None) => Ok(()),
    }
}

impl<'a> Visit<'a> for RuneWalk<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let (place, parent) = match self.frames.last() {
            Some(frame) => (place_of(frame, kind), Some(frame.kind)),
            None => (self.root, None),
        };
        let rune = if self.error.is_none() {
            self.check(kind, parent, place).unwrap_or_else(|error| {
                self.error = Some(error);
                None
            })
        } else {
            None
        };
        self.frames.push(Frame { kind, place, rune });
    }

    fn leave_node(&mut self, _kind: AstKind<'a>) {
        self.frames.pop();
    }

    // Expressions nest thousands deep in real input.
    fn visit_expression(&mut self, it: &Expression<'a>) {
        if self.error.is_none() {
            grow(|| oxc_ast_visit::walk::walk_expression(self, it));
        }
    }

    fn visit_statement(&mut self, it: &Statement<'a>) {
        if self.error.is_none() {
            grow(|| oxc_ast_visit::walk::walk_statement(self, it));
        }
    }
}

impl<'a> RuneWalk<'a> {
    /// Upstream's `BindDirective` checks of the `bind:` target `e` at `span`; `bind:this` also
    /// takes a global.
    fn check_binding(&self, e: &Expression<'_>, span: Span, this: bool) -> Result<(), Diagnostic> {
        check_assignment(fixed_expression(self.res, e, true), true, || span)?;
        if !this
            && let Expression::Identifier(name) = e.get_inner_expression()
            && self.res.symbol(name).is_none()
            && !self.res.is_store_subscription(&name.name)
        {
            return crate::lower::special::invalid(
                "bind_invalid_value",
                "Can only bind to state or props",
                span_of(e),
            );
        }
        Ok(())
    }

    /// Checks the node `kind`, a child of `parent`; a declarator returns the rune it calls.
    fn check(
        &mut self,
        kind: AstKind<'a>,
        parent: Option<AstKind<'a>>,
        place: Place,
    ) -> Result<Option<&'static str>, Diagnostic> {
        // A `for await` suspends rendering as an `await` does; upstream prints it into a
        // function that is not async.
        let suspends = match kind {
            AstKind::AwaitExpression(_) => true,
            AstKind::ForOfStatement(f) => f.r#await,
            _ => false,
        };
        if place.rendering && suspends {
            return crate::lower::special::invalid(
                "experimental_async",
                "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`",
                span_of(&kind),
            );
        }
        let res = self.res;
        match kind {
            AstKind::CallExpression(call) => {
                if let Some(rune) = res.rune_of_call(call) {
                    let chained = matches!(parent, Some(AstKind::ChainExpression(_)));
                    self.check_rune(call, rune, place, chained)?;
                }
            }
            AstKind::VariableDeclarator(declarator) => {
                let Some(init) = &declarator.init else {
                    return Ok(None);
                };
                // Upstream erases types before it analyzes the script.
                let rune = res.rune_named(init.get_inner_expression());
                if rune == Some("$props") {
                    check_props_pattern(declarator)?;
                }
                return Ok(rune);
            }
            AstKind::UpdateExpression(update) => {
                check_assignment(fixed_simple(res, &update.argument, true), false, || {
                    span_of(update)
                })?;
            }
            AstKind::AssignmentExpression(assign) => {
                check_assignment(fixed_target(res, &assign.left, true), false, || {
                    span_of(assign)
                })?;
                if matches!(
                    assign.left,
                    AssignmentTarget::ArrayAssignmentTarget(_)
                        | AssignmentTarget::ObjectAssignmentTarget(_)
                ) {
                    self.check_pattern_assignment(span_of(assign), &assign.left, self.target)?;
                }
            }
            // Upstream prints any non-plain head as invalid JavaScript, on the server too.
            AstKind::ForInStatement(f) => self.check_head(span_of(f), &f.left)?,
            AstKind::ForOfStatement(f) => self.check_head(span_of(f), &f.left)?,
            _ => {}
        }
        Ok(None)
    }

    fn check_head(&self, span: Span, left: &ForStatementLeft<'_>) -> Result<(), Diagnostic> {
        left.as_assignment_target().map_or(Ok(()), |target| {
            self.check_pattern_assignment(span, target, Target::Client)
        })
    }
}

/// Where `kind`, a child of `frame`, sits.
fn place_of(frame: &Frame<'_>, kind: AstKind<'_>) -> Place {
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
        in_class: place.in_class || matches!(frame.kind, AstKind::Class(_)),
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
        (AstKind::ExpressionStatement(_), _) => Parent::Statement(None),
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

/// Upstream `VariableDeclarator`: `$props()` binds a name or flat object pattern, checked before
/// the call and its `$bindable` defaults.
fn check_props_pattern(declarator: &VariableDeclarator<'_>) -> Result<(), Diagnostic> {
    let properties = match &declarator.id {
        BindingPattern::BindingIdentifier(_) => return Ok(()),
        BindingPattern::ObjectPattern(pattern) => &pattern.properties,
        _ => {
            return crate::lower::special::invalid(
                "props_invalid_identifier",
                "`$props()` can only be used with an object destructuring pattern",
                span_of(declarator),
            );
        }
    };
    for property in properties {
        let value = match &property.value {
            BindingPattern::AssignmentPattern(p) => &p.left,
            value => value,
        };
        if property.computed || !matches!(value, BindingPattern::BindingIdentifier(_)) {
            return crate::lower::special::invalid(
                "props_invalid_pattern",
                "`$props()` assignment must not contain nested properties or computed keys",
                span_of(property),
            );
        }
    }
    Ok(())
}
