use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentOperator, BindingPattern, Expression, FormalParameters, PropertyKind, Statement,
};
use oxc_semantic::{NodeId, ReferenceId, ScopeId, SymbolId};
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript_semantic::semantic::Semantic;

use super::{Facts, Use, span};

/// `ESLint`'s `no-unused-vars` with its default options (`vars: all`, `args: after-used`,
/// `caughtErrors: all`, no ignore patterns, `ignoreRestSiblings: false`).
///
/// It looks at every name typescript-eslint's scope analysis declares: types, enum members and
/// the parameters of a signature too, which the core rule reports like any variable.
/// `reads` are references a host resolves to a symbol as plain reads, such as Svelte's `$store`.
/// `body` is the scope of a function a host declares outside JavaScript, such as a Svelte
/// snippet, inside which a reference to it is a self-reference.
pub fn no_unused_variables<'r>(
    semantic: &Semantic,
    considered: impl Fn(SymbolId) -> bool,
    reads: impl Fn(SymbolId) -> &'r [ReferenceId],
    body: impl Fn(SymbolId) -> Option<ScopeId>,
    reporter: &mut Reporter<'_>,
) {
    let f = Facts::new(semantic);
    let mut uses = Vec::new();
    for symbol in f.scoping.symbol_ids() {
        if !considered(symbol) {
            continue;
        }
        let declaration = f.declaration(symbol);
        match f.kind(declaration) {
            // A function expression's own name.
            AstKind::Function(function) if function.is_expression() => continue,
            // A class expression's own name, which `ESLint` keeps in the class's scope.
            AstKind::Class(class) if class.is_expression() => continue,
            AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_)
                if is_setter_parameter(&f, declaration)
                    || (is_plain_parameter(&f, symbol, declaration)
                        && !is_after_last_used_parameter(&f, symbol, declaration)) =>
            {
                continue;
            }
            _ => {}
        }
        f.uses(symbol, &mut uses);
        let extra = reads(symbol);
        if !extra.is_empty() {
            uses.extend(extra.iter().map(|&id| {
                let reference = f.scoping.get_reference(id);
                let node = reference.node_id();
                Use {
                    node,
                    span: f.span(node),
                    read: true,
                    write: false,
                    scope: reference.scope_id(),
                }
            }));
            uses.sort_by_key(|u| u.span.start);
        }
        if let Some(body) = body(symbol) {
            // `isSelfReference` over the host's function.
            uses.retain(|u| !f.scoping.scope_ancestors(u.scope).any(|s| s == body));
        }
        if is_used(&f, symbol, declaration, &uses) || is_exported(&f, declaration) {
            continue;
        }
        let variable_scope = f.variable_scope(f.scoping.symbol_scope_id(symbol));
        let at = uses
            .iter()
            .rfind(|u| u.write && f.variable_scope(u.scope) == variable_scope)
            .map_or_else(|| f.scoping.symbol_span(symbol), |u| u.span);
        let action = if uses.iter().any(|u| u.write) {
            "assigned a value"
        } else {
            "defined"
        };
        reporter.range(
            format!(
                "'{}' is {action} but never used.",
                f.scoping.symbol_name(symbol)
            ),
            identifier_range(&f, symbol, at),
        );
    }
    // A `this` parameter is a variable to typescript-eslint and never has a reference.
    for node in f.nodes.iter() {
        if let AstKind::Function(function) = node.kind()
            && let Some(this) = &function.this_param
            && !(function.body.is_some() && any_parameter_used(&f, &function.params))
        {
            reporter.range("'this' is defined but never used.", span(this.span));
        }
    }
}

/// Whether a name a parameter list declares has a reference.
fn any_parameter_used(f: &Facts<'_>, parameters: &FormalParameters<'_>) -> bool {
    let mut used = false;
    for item in &parameters.items {
        for identifier in item.pattern.get_binding_identifiers() {
            used |= identifier
                .symbol_id
                .get()
                .is_some_and(|s| !f.scoping.get_resolved_reference_ids(s).is_empty());
        }
    }
    if let Some(rest) = &parameters.rest {
        for identifier in rest.rest.argument.get_binding_identifiers() {
            used |= identifier
                .symbol_id
                .get()
                .is_some_and(|s| !f.scoping.get_resolved_reference_ids(s).is_empty());
        }
    }
    used
}

/// typescript-eslint's range for a declared name covers its `?` and its type annotation.
fn identifier_range(f: &Facts<'_>, symbol: SymbolId, at: oxc_span::Span) -> Span {
    let mut end = at.end;
    if at == f.scoping.symbol_span(symbol) {
        let annotation = match f.kind(f.declaration(symbol)) {
            AstKind::FormalParameter(p) if p.pattern.get_binding_identifier().is_some() => {
                if p.optional {
                    end += 1;
                }
                p.type_annotation.as_ref().map(|a| a.span())
            }
            AstKind::VariableDeclarator(d) if d.id.get_binding_identifier().is_some() => {
                d.type_annotation.as_ref().map(|a| a.span())
            }
            AstKind::CatchParameter(c) if c.pattern.get_binding_identifier().is_some() => {
                c.type_annotation.as_ref().map(|a| a.span())
            }
            _ => None,
        };
        if let Some(annotation) = annotation {
            end = end.max(annotation.end);
        }
    }
    span(oxc_span::Span::new(at.start, end))
}

/// The function a parameter belongs to, through its parameter list.
fn parameter_function(f: &Facts<'_>, parameter: NodeId) -> Option<NodeId> {
    let list = f.parent(parameter)?;
    if matches!(f.kind(list), AstKind::FormalParameters(_)) {
        f.parent(list)
    } else {
        None
    }
}

/// A setter's parameter is required, so `ESLint` never reports it.
fn is_setter_parameter(f: &Facts<'_>, parameter: NodeId) -> bool {
    parameter_function(f, parameter)
        .and_then(|function| f.parent(function))
        .is_some_and(|owner| match f.kind(owner) {
            AstKind::MethodDefinition(method) => method.kind.is_set(),
            AstKind::ObjectProperty(property) => property.kind == PropertyKind::Set,
            _ => false,
        })
}

/// `isFunction(def.name.parent)`: the parameter is the bare name, with no pattern, default or
/// rest around it, of a function with a body.
fn is_plain_parameter(f: &Facts<'_>, symbol: SymbolId, parameter: NodeId) -> bool {
    let with_body =
        parameter_function(f, parameter).is_some_and(|function| match f.kind(function) {
            AstKind::Function(function) => function.body.is_some(),
            AstKind::ArrowFunctionExpression(_) => true,
            _ => false,
        });
    match f.kind(parameter) {
        AstKind::FormalParameter(p) => {
            with_body
                && p.initializer.is_none()
                && matches!(&p.pattern, BindingPattern::BindingIdentifier(i) if i.symbol_id.get() == Some(symbol))
        }
        _ => false,
    }
}

/// `isAfterLastUsedArg`: no later parameter of the same function is used.
fn is_after_last_used_parameter(f: &Facts<'_>, symbol: SymbolId, parameter: NodeId) -> bool {
    let Some(list) = f.parent(parameter) else {
        return true;
    };
    let after = f.span(parameter).end;
    let end = f.span(list).end;
    let scope = f.scoping.symbol_scope_id(symbol);
    !f.scoping.symbol_ids().any(|later| {
        let at = f.scoping.symbol_span(later);
        later != symbol
            && f.scoping.symbol_scope_id(later) == scope
            && at.start >= after
            && at.end <= end
            && !f.scoping.get_resolved_reference_ids(later).is_empty()
    })
}

fn is_exported(f: &Facts<'_>, declaration: NodeId) -> bool {
    let owner = match f.kind(declaration) {
        AstKind::VariableDeclarator(_) => f.parent(declaration),
        _ => Some(declaration),
    };
    owner.and_then(|o| f.parent(o)).is_some_and(|p| {
        matches!(
            f.kind(p),
            AstKind::ExportDeclaration(_) | AstKind::ExportDefaultDeclaration(_)
        )
    })
}

/// An expression without the parentheses `ESTree` does not keep.
fn without_parentheses<'a, 'b>(mut expression: &'b Expression<'a>) -> &'b Expression<'a> {
    while let Expression::ParenthesizedExpression(p) = expression {
        expression = &p.expression;
    }
    expression
}

/// The function a name refers to when it is one: a function declaration, or a declarator whose
/// initializer is a function.
fn function_definition(f: &Facts<'_>, declaration: NodeId) -> Option<NodeId> {
    match f.kind(declaration) {
        AstKind::Function(_) => Some(declaration),
        AstKind::VariableDeclarator(declarator) => {
            match without_parentheses(declarator.init.as_ref()?) {
                Expression::FunctionExpression(function) => Some(function.node_id.get()),
                Expression::ArrowFunctionExpression(arrow) => Some(arrow.node_id.get()),
                _ => None,
            }
        }
        _ => None,
    }
}

fn is_used(f: &Facts<'_>, symbol: SymbolId, declaration: NodeId, uses: &[Use]) -> bool {
    let typed = f
        .scoping
        .get_resolved_reference_ids(symbol)
        .iter()
        .any(|&id| {
            let flags = f.scoping.get_reference(id).flags();
            flags.is_type() || flags.is_value_as_type()
        });
    if typed || f.qualified.contains(&symbol) {
        return true;
    }
    let function = function_definition(f, declaration);
    let declaration_scope = f.scoping.symbol_scope_id(symbol);
    let mut rhs = None;
    uses.iter().any(|u| {
        let for_itself = is_read_for_itself(f, u, rhs);
        rhs = rhs_node(f, u, rhs, declaration_scope);
        is_for_in_of_reference(f, u)
            || (u.read
                && !for_itself
                && !function.is_some_and(|func| is_self_reference(f, u, func)))
    })
}

/// `isSelfReference`: the reference is inside the function the name refers to.
fn is_self_reference(f: &Facts<'_>, u: &Use, function: NodeId) -> bool {
    f.nodes.ancestor_ids(u.node).any(|a| a == function)
}

/// `isForInOfRef`: the name is written by a `for…in`/`for…of` head whose body only returns.
fn is_for_in_of_reference(f: &Facts<'_>, u: &Use) -> bool {
    if !u.write {
        return false;
    }
    let Some(mut target) = f.parent(u.node) else {
        return false;
    };
    if matches!(f.kind(target), AstKind::VariableDeclarator(_)) {
        let Some(above) = f.parent(target).and_then(|d| f.parent(d)) else {
            return false;
        };
        target = above;
    }
    let body = match f.kind(target) {
        AstKind::ForInStatement(s) => &s.body,
        AstKind::ForOfStatement(s) => &s.body,
        _ => return false,
    };
    let first = match body {
        Statement::BlockStatement(block) => block.body.first(),
        statement => Some(statement),
    };
    matches!(first, Some(Statement::ReturnStatement(_)))
}

fn is_unused_expression(f: &Facts<'_>, node: NodeId) -> bool {
    let Some(parent) = f.parent_past_parentheses(node) else {
        return false;
    };
    match f.kind(parent) {
        AstKind::ExpressionStatement(_) => true,
        AstKind::SequenceExpression(sequence) => {
            sequence.expressions.last().map(GetSpan::span) != Some(f.span(node))
                || is_unused_expression(f, parent)
        }
        _ => false,
    }
}

/// `getRhsNode`.
fn rhs_node(
    f: &Facts<'_>,
    u: &Use,
    previous: Option<NodeId>,
    declaration_scope: ScopeId,
) -> Option<NodeId> {
    let can_be_used_later = f.variable_scope(u.scope) != f.variable_scope(declaration_scope);
    if let Some(p) = previous
        && f.inside(u.span, p)
    {
        return Some(p);
    }
    let parent = f.parent(u.node)?;
    match f.kind(parent) {
        AstKind::AssignmentExpression(assignment)
            if assignment.left.span() == u.span
                && is_unused_expression(f, parent)
                && !can_be_used_later =>
        {
            Some(without_parentheses(&assignment.right).node_id())
        }
        _ => None,
    }
}

/// `isReadForItself`.
fn is_read_for_itself(f: &Facts<'_>, u: &Use, rhs: Option<NodeId>) -> bool {
    if !u.read {
        return false;
    }
    let self_update = f.parent(u.node).is_some_and(|parent| match f.kind(parent) {
        AstKind::AssignmentExpression(assignment) => {
            assignment.left.span() == u.span
                && is_unused_expression(f, parent)
                && !matches!(
                    assignment.operator,
                    AssignmentOperator::LogicalOr
                        | AssignmentOperator::LogicalAnd
                        | AssignmentOperator::LogicalNullish
                )
        }
        AstKind::UpdateExpression(_) => is_unused_expression(f, parent),
        _ => false,
    });
    self_update
        || rhs
            .is_some_and(|rhs| f.inside(u.span, rhs) && !is_inside_of_storable_function(f, u, rhs))
}

fn is_inside_of_storable_function(f: &Facts<'_>, u: &Use, rhs: NodeId) -> bool {
    f.nodes
        .ancestor_ids(u.node)
        .find(|&a| f.kind(a).is_function_like())
        .is_some_and(|function| {
            f.inside(f.span(function), rhs) && is_storable_function(f, function, rhs)
        })
}

fn is_storable_function(f: &Facts<'_>, function: NodeId, rhs: NodeId) -> bool {
    let mut node = function;
    let mut parent = f.parent(function);
    while let Some(p) = parent.filter(|&p| f.inside(f.span(p), rhs)) {
        match f.kind(p) {
            AstKind::ParenthesizedExpression(_) => {
                parent = f.parent(p);
                continue;
            }
            AstKind::SequenceExpression(sequence) => {
                if sequence.expressions.last().map(GetSpan::span) != Some(f.span(node)) {
                    return false;
                }
            }
            AstKind::CallExpression(call) => return call.callee.span() != f.span(node),
            AstKind::NewExpression(new) => return new.callee.span() != f.span(node),
            AstKind::AssignmentExpression(_) => return true,
            kind if kind.is_statement() || kind.is_declaration() => return true,
            _ => {}
        }
        node = p;
        parent = f.parent(p);
    }
    false
}
