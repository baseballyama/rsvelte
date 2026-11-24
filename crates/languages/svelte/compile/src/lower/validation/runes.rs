//! Upstream's rune and assignment checks over the scripts and the template expressions.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentTarget, Expression, ForStatementLeft, MemberExpression, MethodDefinitionKind,
    VariableDeclaration,
};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, ElementKind, MetadataTag, NodeKind,
};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_tree::{ExpressionIdentifier, document_span, node_span};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::input::{CompileInput, Target};
use crate::lower::attributes::event_attribute;
use crate::lower::validation::Unit;

mod assignments;
mod calls;
mod declarations;
mod errors;
mod exports;
mod places;
mod references;
mod visit;

use assignments::{check_assignment, fixed_expression, fixed_simple, fixed_target};
use declarations::{check_props_pattern, imports};
pub(in crate::lower) use errors::{script_and_template_errors, script_error};

use crate::lower::class_fields::{ClassFields, StateField, key_name, member_name};

fn state_field_invalid_assignment<T>(span: Span) -> Result<T, Diagnostic> {
    crate::lower::invalid(
        "state_field_invalid_assignment",
        "Cannot assign to a state field before its declaration",
        span,
    )
}

/// Where a node sits, as far as upstream's rune checks ask.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Parent {
    Other,
    /// A statement of the instance script's body.
    InstanceBody,
    /// A statement of the module script's body, or of a `.svelte.js` module's.
    ModuleBody,
    /// A declarator of a declaration in a script's body.
    TopDeclarator,
    /// A declarator's initializer; `top` at a script's top level, `named` binding one name,
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
    /// An expression statement that is a loop's or an `if`'s whole body, and its expression.
    LoneStatement,
    LoneExpression,
    /// The callee of an `$inspect(…).with(…)` statement, whose `$inspect(…)` stands in it.
    InspectWith(Option<(Body, bool)>),
    /// The callee of an `$inspect(…).with(…)` that initializes a name at a script's top level,
    /// and the `$inspect(…)` in it.
    InitializerWith,
    InitializerInspect,
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

/// What raises `experimental_async` at an `await` that suspends rendering, outside the arrow
/// functions of a `bind:` pair, which the rune checks always raise.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(in crate::lower) enum Awaits {
    /// The rune checks.
    Here,
    /// The analysis's warnings, where `experimental.async` decides it.
    Analysis,
}

/// Upstream's rune and assignment checks over the scripts and the template expressions, in
/// document order, then the runes this port does not lower.
struct RuneWalk<'a> {
    res: &'a Resolution,
    unit: Unit,
    target: Target,
    custom_element: bool,
    awaits: Awaits,
    props: bool,
    props_id: bool,
    /// Where the root being walked sits.
    root: Place,
    frames: Vec<Frame<'a>>,
    error: Option<Diagnostic>,
    /// The first rune or `for await` this port does not lower, refused only when upstream raises
    /// nothing later.
    refused: Option<Diagnostic>,
    /// The state fields of the classes the walk is inside, innermost last.
    classes: Vec<ClassFields>,
    /// Where each `{@const}` tag's declaration starts.
    const_tags: FxHashSet<u32>,
    /// The expression tag whose expression the walk is in.
    tag: Option<Span>,
    /// Where the arrow functions of the `bind:` pair the walk is in start: upstream analyzes
    /// their bodies as the template expression.
    bind_arrows: [Option<u32>; 2],
}

/// A template root: an expression, or a `{@const}` declaration.
#[derive(Clone, Copy)]
enum Root<'a> {
    Expression(ExpressionIdentifier, &'a Expression<'a>),
    Declaration(&'a VariableDeclaration<'a>),
}

/// Raises upstream's rune placement, rune argument and assignment errors, a `bind:` target's
/// among them, and its class field errors, then refuses a rune call this port does not lower,
/// and on the server an `$effect` that is not a statement of its own (upstream only drops it as
/// an `ExpressionStatement`).
///
/// # Errors
///
/// The upstream or `unsupported` [`Diagnostic`] at the first such call.
pub(in crate::lower) fn check_runes(
    input: &CompileInput<'_>,
    res: &Resolution,
    unit: Unit,
    target: Target,
    custom_element: bool,
) -> Result<(), Diagnostic> {
    check_runes_with(input, res, unit, target, custom_element, Awaits::Here)
}

/// [`check_runes`], with what raises `experimental_async`.
pub(in crate::lower) fn check_runes_with(
    input: &CompileInput<'_>,
    res: &Resolution,
    unit: Unit,
    target: Target,
    custom_element: bool,
    awaits: Awaits,
) -> Result<(), Diagnostic> {
    walk_template(
        input,
        walk_scripts(input, res, unit, target, custom_element, awaits),
    )
}

/// Continues `walk` over the template's expressions and declarations, in document order.
fn walk_template<'a>(input: &CompileInput<'a>, mut walk: RuneWalk<'a>) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
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
    // The server prints no event attribute of an element, so it lowers nothing in one.
    let dropped: FxHashSet<ExpressionIdentifier> = (tree.elements())
        .filter(|(_, el)| {
            walk.target == Target::Server
                && matches!(
                    el.kind,
                    ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
                )
        })
        .flat_map(|(_, el)| tree.attributes(el.attributes))
        .filter_map(|a| event_attribute(input.component.source_text, a))
        .collect();
    let tags: FxHashMap<ExpressionIdentifier, Span> = (tree.nodes.iter())
        .filter_map(|n| match n.kind {
            NodeKind::Expression { expression } => Some((expression, n.span)),
            _ => None,
        })
        .collect();
    walk.const_tags = (tree.nodes.iter())
        .filter_map(|n| match n.kind {
            NodeKind::Const { declaration } => {
                Some(javascript.get_declaration(declaration).span.start)
            }
            _ => None,
        })
        .collect();
    let mut template: Vec<(u32, Root<'_>)> = (javascript.expressions())
        .map(|(identifier, e)| (e.span().start, Root::Expression(identifier, e)))
        .chain((javascript.declarations()).map(|(_, d)| (d.span.start, Root::Declaration(d))))
        .collect();
    // The tree keeps them in the order the parser met them, which is not the document's.
    template.sort_by_key(|&(start, _)| start);
    walk.root = Place {
        parent: Parent::Other,
        module: false,
        rendering: true,
    };
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
                walk.tag = tags.get(&identifier).copied();
                walk.bind_arrows = match e {
                    Expression::SequenceExpression(pair) if binds.contains_key(&identifier) => {
                        let mut arrows = pair.expressions.iter().map(|e| match e {
                            Expression::ArrowFunctionExpression(arrow) => Some(arrow.span.start),
                            _ => None,
                        });
                        [arrows.next().flatten(), arrows.next().flatten()]
                    }
                    _ => [None; 2],
                };
                let refused = walk.refused.is_some();
                walk.visit_expression(e);
                if !refused && dropped.contains(&identifier) {
                    walk.refused = None;
                }
            }
            Root::Declaration(d) => {
                walk.tag = None;
                walk.visit_variable_declaration(d);
            }
        }
    }
    match (walk.error, walk.refused) {
        (Some(error), _) | (None, Some(error)) => Err(error),
        (None, None) => Ok(()),
    }
}

/// A walk over the module script, then the instance's.
fn walk_scripts<'a>(
    input: &CompileInput<'a>,
    res: &'a Resolution,
    unit: Unit,
    target: Target,
    custom_element: bool,
    awaits: Awaits,
) -> RuneWalk<'a> {
    let javascript = input.component.javascript;
    let place = |module, rendering| Place {
        parent: Parent::Other,
        module,
        rendering,
    };
    let mut walk = RuneWalk {
        res,
        unit,
        target,
        custom_element,
        awaits,
        props: false,
        props_id: false,
        root: place(false, false),
        frames: Vec::new(),
        error: None,
        refused: None,
        classes: Vec::new(),
        const_tags: FxHashSet::default(),
        tag: None,
        bind_arrows: [None; 2],
    };
    if let Some(module) = input.component.module {
        walk.root = place(true, false);
        walk.visit_program(javascript.get_program(module));
    }
    if let Some(instance) = input.component.instance {
        walk.root = place(false, true);
        walk.visit_program(javascript.get_program(instance));
    }
    walk
}

/// A `bind:` target other than `this` that [`check_runes`] raises upstream's error for: a name
/// nothing declares, or one upstream's `validate_assignment` rejects.
pub(in crate::lower) fn rejects_binding(res: &Resolution, e: &Expression<'_>) -> bool {
    fixed_expression(res, e, true).is_some()
        || matches!(e.get_inner_expression(), Expression::Identifier(name)
            if res.symbol(name).is_none() && !res.is_store_subscription(&name.name))
}

impl<'a> RuneWalk<'a> {
    /// Whether the walk is inside a `{@const}` tag's declaration.
    fn in_const_tag(&self) -> bool {
        matches!(self.frames.first().map(|f| f.kind),
            Some(AstKind::VariableDeclaration(d)) if self.const_tags.contains(&d.span.start))
    }

    /// Upstream's `BindDirective` checks of the `bind:` target `e` at `span`; `bind:this` also
    /// takes a global.
    fn check_binding(&self, e: &Expression<'_>, span: Span, this: bool) -> Result<(), Diagnostic> {
        check_assignment(fixed_expression(self.res, e, true), true, || span)?;
        if !this
            && let Expression::Identifier(name) = e.get_inner_expression()
            && self.res.symbol(name).is_none()
            && !self.res.is_store_subscription(&name.name)
        {
            // Upstream erases the types before it analyzes, so the name is the whole target.
            return crate::lower::invalid(
                "bind_invalid_value",
                "Can only bind to state or props",
                document_span(name.span),
            );
        }
        Ok(())
    }

    /// Raises `experimental_async` at an `await` that suspends rendering, and keeps it as the
    /// refusal at a `for await`.
    fn check_await(&mut self, kind: AstKind<'a>, place: Place) -> Result<(), Diagnostic> {
        // A `for await` suspends rendering as an `await` does; upstream prints it into a
        // function that is not async.
        let suspends = match kind {
            AstKind::AwaitExpression(_) => true,
            AstKind::ForOfStatement(f) => f.r#await,
            _ => false,
        };
        let in_bind_arrow = || {
            let function = self.frames.iter().rev().find(|f| {
                matches!(
                    f.kind,
                    AstKind::Function(_) | AstKind::ArrowFunctionExpression(_)
                )
            });
            matches!(function.map(|f| f.kind), Some(AstKind::ArrowFunctionExpression(arrow))
                if self.bind_arrows.contains(&Some(arrow.span.start)))
        };
        // Upstream suspends at a `$derived(…)` argument in any script, up to the nearest function.
        let in_derived = || {
            self.frames.iter().rev().find_map(|f| match f.kind {
                AstKind::Function(_) | AstKind::ArrowFunctionExpression(_) => Some(false),
                AstKind::CallExpression(call) => {
                    (self.res.rune_of_call(call) == Some("$derived")).then_some(true)
                }
                _ => None,
            }) == Some(true)
        };
        if suspends
            && ((self.awaits == Awaits::Here && (place.rendering || in_derived()))
                || in_bind_arrow())
        {
            let error = crate::lower::error(
                "experimental_async",
                "Cannot use `await` in deriveds and template expressions, or at the top level of a \
                    component, unless the `experimental.async` compiler option is `true`",
                node_span(&kind),
            );
            // Upstream's analysis does not see a `for await`, so its later errors come first.
            if matches!(kind, AstKind::ForOfStatement(_)) {
                self.refused.get_or_insert(error);
            } else {
                return Err(error);
            }
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
        self.check_await(kind, place)?;
        let res = self.res;
        match kind {
            AstKind::LabeledStatement(statement)
                if place.parent == Parent::InstanceBody && statement.label.name == "$" =>
            {
                return crate::lower::invalid(
                    "legacy_reactive_statement_invalid",
                    "`$:` is not allowed in runes mode, use `$derived` or `$effect` instead",
                    node_span(&kind),
                );
            }
            AstKind::ImportDeclaration(import) => imports(import)?,
            AstKind::IdentifierReference(reference) => {
                self.check_arguments(kind)?;
                self.check_rune_reference(reference)?;
            }
            AstKind::BindingIdentifier(_) => self.check_arguments(kind)?,
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
                    node_span(update)
                })?;
                self.check_field_assignment(update.argument.as_member_expression(), update.span)?;
            }
            AstKind::AssignmentExpression(assign) => {
                check_assignment(fixed_target(res, &assign.left, true), false, || {
                    node_span(assign)
                })?;
                self.check_field_assignment(assign.left.as_member_expression(), assign.span)?;
                // Only a script's rewrite has the names its `$$array`s take.
                let scripted = matches!(
                    self.frames.first().map(|f| f.kind),
                    Some(AstKind::Program(_))
                );
                if matches!(
                    assign.left,
                    AssignmentTarget::ArrayAssignmentTarget(_)
                        | AssignmentTarget::ObjectAssignmentTarget(_)
                ) && !scripted
                {
                    self.check_pattern_assignment(node_span(assign), &assign.left, self.target)?;
                }
            }
            AstKind::PropertyDefinition(p) if p.value.is_some() => {
                let field = key_name(&p.key).and_then(|name| self.declared_later(&name, p.span));
                if field.is_some() {
                    return state_field_invalid_assignment(node_span(p));
                }
            }
            // Upstream prints any non-plain head as invalid JavaScript, on the server too.
            AstKind::ForInStatement(f) => self.check_head(node_span(f), &f.left)?,
            AstKind::ForOfStatement(f) => self.check_head(node_span(f), &f.left)?,
            _ => {}
        }
        Ok(None)
    }

    /// The state field `name` of the innermost class, when a node at `at` other than its
    /// declaration comes before it.
    fn declared_later(&self, name: &str, at: oxc_span::Span) -> Option<&StateField> {
        let field = self.classes.last()?.get(name)?;
        (field.at != at && at.start < field.at.start).then_some(field)
    }

    /// Upstream `validate_assignment`: the constructor writes `this.x` before the assignment
    /// that declares the state field `x`.
    fn check_field_assignment(
        &self,
        target: Option<&MemberExpression<'_>>,
        at: oxc_span::Span,
    ) -> Result<(), Diagnostic> {
        let Some(target) = target else {
            return Ok(());
        };
        if !matches!(target.object(), Expression::ThisExpression(_)) {
            return Ok(());
        }
        let Some(field) = member_name(target).and_then(|name| self.declared_later(&name, at))
        else {
            return Ok(());
        };
        let function = (self.frames.iter()).rposition(|f| {
            matches!(
                f.kind,
                AstKind::Function(_) | AstKind::ArrowFunctionExpression(_)
            )
        });
        let in_constructor = function.and_then(|i| i.checked_sub(1)).is_some_and(|i| {
            matches!(self.frames[i].kind,
                AstKind::MethodDefinition(m) if m.kind == MethodDefinitionKind::Constructor)
        });
        if field.constructor && in_constructor {
            return state_field_invalid_assignment(document_span(at));
        }
        Ok(())
    }

    fn check_head(&self, span: Span, left: &ForStatementLeft<'_>) -> Result<(), Diagnostic> {
        left.as_assignment_target().map_or(Ok(()), |target| {
            self.check_pattern_assignment(span, target, Target::Client)
        })
    }
}
