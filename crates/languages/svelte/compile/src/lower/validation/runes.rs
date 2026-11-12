//! Upstream's rune and assignment checks over the scripts and the template expressions.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentTarget, BindingPattern, Expression, ForStatementLeft, MemberExpression,
    MethodDefinitionKind, Statement, VariableDeclaration, VariableDeclarator,
};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rsvelte_kernel::performance::stack::grow;
use rsvelte_svelte_semantic::compiler_syntax_tree::{AttributeValue, NodeKind};
use rsvelte_typescript_tree::ExpressionIdentifier;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::lower::{CompileInput, Diagnostic, Resolution, Span, Target, span_of};

mod assignments;
mod calls;
mod exports;
mod places;

use assignments::{check_assignment, fixed_expression, fixed_simple, fixed_target};
use places::place_of;

use super::state_invalid_placement;
use crate::lower::class_fields::{ClassFields, StateField, class_fields, key_name, member_name};

fn state_field_invalid_assignment<T>(span: Span) -> Result<T, Diagnostic> {
    crate::lower::special::invalid(
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
    /// The state fields of the classes the walk is inside, innermost last.
    classes: Vec<ClassFields>,
    /// Where each `{@const}` tag's declaration starts.
    const_tags: FxHashSet<u32>,
    /// The `bind:` target being walked, if the root is one.
    bind_root: Option<oxc_span::Span>,
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
    target: Target,
    custom_element: bool,
) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
    let place = |module, rendering| Place {
        parent: Parent::Other,
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
        classes: Vec::new(),
        const_tags: FxHashSet::default(),
        bind_root: None,
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
                walk.bind_root = binds.contains_key(&identifier).then(|| e.span());
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
        // Upstream analyzes a class body before what it holds.
        if let AstKind::ClassBody(body) = kind {
            let fields = class_fields(self.res, body).unwrap_or_else(|error| {
                self.error.get_or_insert(error);
                ClassFields::default()
            });
            self.classes.push(fields);
        }
        let (mut place, parent) = match self.frames.last() {
            Some(frame) => (place_of(frame, kind), Some(frame.kind)),
            None => (self.root, None),
        };
        // Upstream visits the bodies of a `bind:` pair's arrows as the directive's expression.
        if !matches!(
            kind,
            AstKind::FormalParameters(_)
                | AstKind::TSTypeParameterDeclaration(_)
                | AstKind::TSTypeAnnotation(_)
        ) && self.in_bind_pair_arrow()
        {
            place.rendering = self.root.rendering;
        }
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

    fn leave_node(&mut self, kind: AstKind<'a>) {
        if matches!(kind, AstKind::ClassBody(_)) {
            self.classes.pop();
        }
        if let AstKind::ExportDeclaration(export) = kind
            && self.error.is_none()
            && let Err(error) = self.check_export(export)
        {
            self.error = Some(error);
        }
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

/// A `bind:` target other than `this` that [`check_runes`] raises upstream's error for: a name
/// nothing declares, or one upstream's `validate_assignment` rejects.
pub(in crate::lower) fn rejects_binding(res: &Resolution, e: &Expression<'_>) -> bool {
    fixed_expression(res, e, true).is_some()
        || matches!(e.get_inner_expression(), Expression::Identifier(name)
            if res.symbol(name).is_none() && !res.is_store_subscription(&name.name))
}

impl<'a> RuneWalk<'a> {
    /// Whether the walk is at an arrow of a `bind:` target's `{get, set}` pair.
    fn in_bind_pair_arrow(&self) -> bool {
        matches!(self.frames.as_slice(),
            [Frame { kind: AstKind::SequenceExpression(pair), .. },
             Frame { kind: AstKind::ArrowFunctionExpression(_), .. }]
                if self.bind_root == Some(pair.span))
    }

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
        let message = "Cannot use `await` in deriveds and template expressions, or at the top level \
                       of a component, unless the `experimental.async` compiler option is `true`";
        if place.rendering && matches!(kind, AstKind::AwaitExpression(_)) {
            return crate::lower::special::invalid("experimental_async", message, span_of(&kind));
        }
        // Upstream prints a `for await` into a function that is not async, and raises only what
        // an `await` later raises.
        if place.rendering
            && matches!(kind, AstKind::ForOfStatement(f) if f.r#await)
            && self.refused.is_none()
        {
            self.refused =
                crate::lower::special::invalid::<()>("experimental_async", message, span_of(&kind))
                    .err();
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
                self.check_field_assignment(update.argument.as_member_expression(), update.span)?;
            }
            AstKind::AssignmentExpression(assign) => {
                check_assignment(fixed_target(res, &assign.left, true), false, || {
                    span_of(assign)
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
                    self.check_pattern_assignment(span_of(assign), &assign.left, self.target)?;
                }
            }
            AstKind::PropertyDefinition(p) if p.value.is_some() => {
                let field = key_name(&p.key).and_then(|name| self.declared_later(&name, p.span));
                if field.is_some() {
                    return state_field_invalid_assignment(span_of(p));
                }
            }
            // Upstream prints any non-plain head as invalid JavaScript, on the server too.
            AstKind::ForInStatement(f) => self.check_head(span_of(f), &f.left)?,
            AstKind::ForOfStatement(f) => self.check_head(span_of(f), &f.left)?,
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
            return state_field_invalid_assignment(Span::new(at.start, at.end));
        }
        Ok(())
    }

    fn check_head(&self, span: Span, left: &ForStatementLeft<'_>) -> Result<(), Diagnostic> {
        left.as_assignment_target().map_or(Ok(()), |target| {
            self.check_pattern_assignment(span, target, Target::Client)
        })
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
