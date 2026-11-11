use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentTarget, AssignmentTargetMaybeDefault, AssignmentTargetProperty, BindingPattern,
    Expression, ForStatementInit, ForStatementLeft, SimpleAssignmentTarget, VariableDeclaration,
    VariableDeclarationKind,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::{NodeId, ScopeId, SymbolId};
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::ProgramIdentifier;
use rustc_hash::FxHashMap;

use super::{Facts, Use, span};

/// `ESLint`'s `prefer-const` options.
#[derive(Clone, Copy, Debug, Default)]
pub struct PreferConstOptions {
    /// `destructuring: "all"`: report a destructuring only when every name in it could be const.
    pub destructuring_all: bool,
    pub ignore_read_before_assign: bool,
}

/// Where the program's statements are, for `canBecomeVariableDeclaration`.
///
/// A host that wraps them in its own node (Svelte's `<script>`) makes an assignment at its top
/// level one that cannot become a declaration.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ProgramStatements {
    InProgram,
    Wrapped,
}

/// The name a check uses for `undefined` (no name) as distinct from the initial `""`.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Name<'a> {
    Named(&'a str),
    Undefined,
}

/// `ESLint`'s `prefer-const` over the `let` declarations of `programs` that `skip` does not
/// exclude. A variable `written_by_host` (a Svelte prop, which its parent writes) is never const.
pub fn prefer_const(
    semantic: &Semantic,
    programs: &[ProgramIdentifier],
    options: PreferConstOptions,
    statements: ProgramStatements,
    skip: impl Fn(&VariableDeclaration<'_>) -> bool,
    written_by_host: impl Fn(SymbolId) -> bool,
    reporter: &mut Reporter<'_>,
) {
    let f = Facts::new(semantic);
    let mut collector = Lets {
        f: &f,
        skip,
        variables: Vec::new(),
    };
    for &program in programs {
        collector.visit_program(semantic.tree().get_program(program));
    }
    let variables = collector.variables;
    let mut groups: Vec<Vec<Option<NodeId>>> = Vec::new();
    let mut group_of: FxHashMap<NodeId, usize> = FxHashMap::default();
    let mut uses = Vec::new();
    for &variable in &variables {
        f.uses(variable, &mut uses);
        let identifier = if written_by_host(variable) {
            None
        } else {
            identifier_if_should_be_const(&f, variable, &uses, options, statements)
        };
        let mut previous = None;
        for reference in &uses {
            if previous == Some(reference.node) {
                continue;
            }
            previous = Some(reference.node);
            if let Some(host) = destructuring_host(&f, reference) {
                let index = *group_of.entry(host).or_insert_with(|| {
                    groups.push(Vec::new());
                    groups.len() - 1
                });
                groups[index].push(identifier);
            }
        }
    }
    let mut state = GroupState {
        name: Name::Named(""),
        id: None,
        count: 0,
    };
    for nodes in &groups {
        check_group(&f, options, nodes, &mut state, reporter);
    }
}

/// Collects the symbols of the `let` declarations a check looks at, in source order.
struct Lets<'f, 's, S> {
    f: &'f Facts<'s>,
    skip: S,
    variables: Vec<SymbolId>,
}

impl<'a, S: Fn(&VariableDeclaration<'_>) -> bool> Visit<'a> for Lets<'_, '_, S> {
    fn visit_variable_declaration(&mut self, it: &VariableDeclaration<'a>) {
        if it.kind == VariableDeclarationKind::Let
            && !is_init_of_for(self.f, it.node_id.get())
            && !(self.skip)(it)
        {
            for declarator in &it.declarations {
                self.variables.extend(
                    declarator
                        .id
                        .get_binding_identifiers()
                        .iter()
                        .filter_map(|i| i.symbol_id.get()),
                );
            }
        }
        walk::walk_variable_declaration(self, it);
    }
}

struct GroupState<'a> {
    name: Name<'a>,
    /// The first declarator of the last declaration, by its node.
    id: Option<NodeId>,
    count: usize,
}

/// The name an identifier node carries, declared or referenced.
fn name_of<'s>(f: &Facts<'s>, node: NodeId) -> &'s str {
    match f.kind(node) {
        AstKind::BindingIdentifier(i) => i.name.as_str(),
        AstKind::IdentifierReference(i) => i.name.as_str(),
        _ => "",
    }
}

/// `checkGroup`, with the counters `ESLint` keeps across groups.
fn check_group<'s>(
    f: &Facts<'s>,
    options: PreferConstOptions,
    nodes: &[Option<NodeId>],
    state: &mut GroupState<'s>,
    reporter: &mut Reporter<'_>,
) {
    let to_report: Vec<NodeId> = nodes.iter().flatten().copied().collect();
    if nodes.is_empty() || (options.destructuring_all && to_report.len() != nodes.len()) {
        return;
    }
    let declaration = nodes[0].and_then(|node| enclosing_declaration(f, node));
    let declaration = declaration.and_then(|d| match f.kind(d) {
        AstKind::VariableDeclaration(declaration) => Some((d, declaration)),
        _ => None,
    });
    let declarations = declaration.map_or(&[][..], |(_, d)| &d.declarations[..]);
    if let Some(first) = declarations.first()
        && let Some(initializer) = &first.init
    {
        let pattern_name = match &first.id {
            BindingPattern::BindingIdentifier(i) => Name::Named(i.name.as_str()),
            _ => Name::Undefined,
        };
        if pattern_name != state.name {
            state.name = pattern_name;
            state.count = 0;
        }
        if matches!(first.id, BindingPattern::ObjectPattern(_)) {
            let initializer_name = match initializer {
                Expression::Identifier(i) => Name::Named(i.name.as_str()),
                _ => Name::Undefined,
            };
            if initializer_name != state.name {
                state.name = initializer_name;
                state.count = 0;
            }
        }
        let id = Some(first.node_id.get());
        if state.id != id {
            state.id = id;
            state.count = 0;
        }
    }
    let mut should_fix = declaration.is_some_and(|(node, _)| {
        is_left_of_for_each(f, node) || declarations.iter().all(|d| d.init.is_some())
    }) && to_report.len() == nodes.len();
    if declarations.len() > 1 {
        state.count += to_report.len();
        let total: usize = declarations
            .iter()
            .map(|d| match &d.id {
                BindingPattern::ObjectPattern(p) => {
                    p.properties.len() + usize::from(p.rest.is_some())
                }
                BindingPattern::ArrayPattern(p) => p.elements.len() + usize::from(p.rest.is_some()),
                _ => 1,
            })
            .sum();
        should_fix = should_fix && state.count == total;
    }
    for node in to_report {
        let mut report = Report::range(
            format!(
                "'{}' is never reassigned. Use 'const' instead.",
                name_of(f, node)
            ),
            span(f.span(node)),
        )
        .message_id("useConst");
        if should_fix && let Some((_, declaration)) = declaration {
            // A declaration starts with its keyword, which `ESLint` replaces whatever it is.
            let range = declaration.span;
            let length = if declaration.kind == VariableDeclarationKind::Const {
                5
            } else {
                3
            };
            let keyword = Span::new(range.start, range.start + length);
            // The fix covers the whole declaration so that no other fix in the pass touches it.
            let mut fix = Fix::replace(keyword, "const");
            fix.push(Span::new(range.end, range.end), "");
            report = report.fix(fix);
        }
        reporter.report(report);
    }
}

/// `getIdentifierIfShouldBeConst`.
fn identifier_if_should_be_const(
    f: &Facts<'_>,
    variable: SymbolId,
    uses: &[Use],
    options: PreferConstOptions,
    statements: ProgramStatements,
) -> Option<NodeId> {
    let scope = f.scoping.symbol_scope_id(variable);
    let mut writer: Option<&Use> = None;
    let mut read_before_init = false;
    for reference in uses {
        if reference.write {
            if writer.is_some_and(|w| w.node != reference.node) {
                return None;
            }
            if let Some(host) = destructuring_host(f, reference)
                && let AstKind::AssignmentExpression(assignment) = f.kind(host)
                && destructures_outer_or_member(f, &assignment.left, scope)
            {
                return None;
            }
            writer = Some(reference);
        } else if reference.read && writer.is_none() {
            if options.ignore_read_before_assign {
                return None;
            }
            read_before_init = true;
        }
    }
    let writer = writer?;
    if writer.scope != scope || !can_become_declaration(f, writer.node, statements) {
        return None;
    }
    if read_before_init {
        f.identifiers[variable.index()]
    } else {
        Some(writer.node)
    }
}

/// A node of a binding or assignment pattern, which the host of a write is above.
const fn is_pattern(kind: AstKind<'_>) -> bool {
    matches!(
        kind,
        AstKind::ObjectPattern(_)
            | AstKind::ArrayPattern(_)
            | AstKind::AssignmentPattern(_)
            | AstKind::BindingRestElement(_)
            | AstKind::BindingProperty(_)
            | AstKind::ObjectAssignmentTarget(_)
            | AstKind::ArrayAssignmentTarget(_)
            | AstKind::AssignmentTargetWithDefault(_)
            | AstKind::AssignmentTargetRest(_)
            | AstKind::AssignmentTargetPropertyIdentifier(_)
            | AstKind::AssignmentTargetPropertyProperty(_)
    )
}

/// The first node above `node` that is not part of a pattern.
fn pattern_host(f: &Facts<'_>, node: NodeId) -> Option<NodeId> {
    let mut at = f.parent(node)?;
    while is_pattern(f.kind(at)) {
        at = f.parent(at)?;
    }
    Some(at)
}

/// `getDestructuringHost`: the declarator or assignment a write belongs to.
fn destructuring_host(f: &Facts<'_>, reference: &Use) -> Option<NodeId> {
    if !reference.write {
        return None;
    }
    let host = pattern_host(f, reference.node)?;
    matches!(
        f.kind(host),
        AstKind::VariableDeclarator(_) | AstKind::AssignmentExpression(_)
    )
    .then_some(host)
}

/// `canBecomeVariableDeclaration`.
fn can_become_declaration(
    f: &Facts<'_>,
    identifier: NodeId,
    statements: ProgramStatements,
) -> bool {
    let Some(host) = pattern_host(f, identifier) else {
        return false;
    };
    match f.kind(host) {
        AstKind::VariableDeclarator(_) => true,
        AstKind::AssignmentExpression(_) => f
            .parent(host)
            .filter(|&s| matches!(f.kind(s), AstKind::ExpressionStatement(_)))
            .and_then(|s| f.parent(s))
            .is_some_and(|p| match f.kind(p) {
                AstKind::Program(_) => statements == ProgramStatements::InProgram,
                AstKind::BlockStatement(_)
                | AstKind::FunctionBody(_)
                | AstKind::SwitchCase(_)
                | AstKind::StaticBlock(_) => true,
                _ => false,
            }),
        _ => false,
    }
}

/// The symbol a plain identifier target assigns.
fn assigned_symbol(f: &Facts<'_>, target: &AssignmentTargetMaybeDefault<'_>) -> Option<SymbolId> {
    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetIdentifier(identifier) => f
            .scoping
            .get_reference(identifier.reference_id())
            .symbol_id(),
        _ => None,
    }
}

/// Whether a destructuring assignment also assigns a variable from outside `scope`, a
/// parameter, or a member (`hasOuterVariables || hasNonIdentifiers`).
fn destructures_outer_or_member(
    f: &Facts<'_>,
    left: &AssignmentTarget<'_>,
    scope: ScopeId,
) -> bool {
    let symbols: Vec<SymbolId> = match left {
        AssignmentTarget::ObjectAssignmentTarget(object) => object
            .properties
            .iter()
            .filter_map(|p| match p {
                AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p)
                    if p.init.is_none() =>
                {
                    f.scoping
                        .get_reference(p.binding.reference_id())
                        .symbol_id()
                }
                AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                    assigned_symbol(f, &p.binding)
                }
                AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(_) => None,
            })
            .collect(),
        AssignmentTarget::ArrayAssignmentTarget(array) => array
            .elements
            .iter()
            .flatten()
            .filter_map(|e| assigned_symbol(f, e))
            .collect(),
        _ => return false,
    };
    let outer = symbols.iter().any(|&symbol| {
        f.scoping.symbol_scope_id(symbol) != scope
            || matches!(
                f.kind(f.declaration(symbol)),
                AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_)
            )
    });
    outer || has_member_assignment(left)
}

/// `hasMemberExpressionAssignment`.
fn has_member_assignment(target: &AssignmentTarget<'_>) -> bool {
    match target {
        AssignmentTarget::ObjectAssignmentTarget(object) => {
            object.properties.iter().any(|p| match p {
                AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                    has_member_assignment_maybe_default(&p.binding)
                }
                AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(_) => false,
            }) || object
                .rest
                .as_ref()
                .is_some_and(|r| has_member_assignment(&r.target))
        }
        AssignmentTarget::ArrayAssignmentTarget(array) => {
            array
                .elements
                .iter()
                .flatten()
                .any(has_member_assignment_maybe_default)
                || array
                    .rest
                    .as_ref()
                    .is_some_and(|r| has_member_assignment(&r.target))
        }
        target => matches!(
            target.as_simple_assignment_target(),
            Some(
                SimpleAssignmentTarget::ComputedMemberExpression(_)
                    | SimpleAssignmentTarget::StaticMemberExpression(_)
                    | SimpleAssignmentTarget::PrivateFieldExpression(_)
            )
        ),
    }
}

fn has_member_assignment_maybe_default(target: &AssignmentTargetMaybeDefault<'_>) -> bool {
    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(with_default) => {
            has_member_assignment(&with_default.binding)
        }
        target => target
            .as_assignment_target()
            .is_some_and(has_member_assignment),
    }
}

/// `findUp(node, "VariableDeclaration", …)`, which stops at a statement.
fn enclosing_declaration(f: &Facts<'_>, node: NodeId) -> Option<NodeId> {
    let mut at = Some(node);
    while let Some(current) = at {
        let kind = f.kind(current);
        match kind {
            AstKind::VariableDeclaration(_) => return Some(current),
            AstKind::FunctionBody(_) => return None,
            AstKind::ExportDefaultDeclaration(_) => {}
            kind if kind.is_statement() => return None,
            _ => {}
        }
        at = f.parent(current);
    }
    None
}

/// The declaration is the left of a `for…in` or `for…of`.
fn is_left_of_for_each(f: &Facts<'_>, declaration: NodeId) -> bool {
    let span = f.span(declaration);
    f.parent(declaration).is_some_and(|p| {
        let left = match f.kind(p) {
            AstKind::ForInStatement(s) => &s.left,
            AstKind::ForOfStatement(s) => &s.left,
            _ => return false,
        };
        matches!(left, ForStatementLeft::VariableDeclaration(d) if d.span == span)
    })
}

/// `isInitOfForStatement`.
fn is_init_of_for(f: &Facts<'_>, declaration: NodeId) -> bool {
    let span = f.span(declaration);
    f.parent(declaration).is_some_and(|p| {
        matches!(
            f.kind(p),
            AstKind::ForStatement(s)
                if matches!(&s.init, Some(ForStatementInit::VariableDeclaration(d)) if d.span == span)
        )
    })
}
