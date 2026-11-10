use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::scope::{BindingIdentifier, ScopeIdentifier};
use rsvelte_typescript_syntax::syntax_tree::{Class, Control, Kind, NodeIdentifier, flag};
use rustc_hash::FxHashMap;

use super::JavaScriptFacts;

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

/// A reference as `prefer-const` reads it; a `for…in`/`for…of` declaration writes its names
/// once more than the scope analysis records.
#[derive(Clone, Copy)]
struct Use {
    node: NodeIdentifier,
    read: bool,
    write: bool,
    scope: ScopeIdentifier,
}

/// The name a check uses for `undefined` (no name) as distinct from the initial `""`.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Name<'a> {
    Named(&'a str),
    Undefined,
}

/// `ESLint`'s `prefer-const` over the `let` declarations under `roots` that `skip` does not
/// exclude. A variable `written_by_host` (a Svelte prop, which its parent writes) is never const.
pub fn prefer_const(
    f: &JavaScriptFacts<'_>,
    roots: &[NodeIdentifier],
    options: PreferConstOptions,
    statements: ProgramStatements,
    skip: impl Fn(NodeIdentifier) -> bool,
    written_by_host: impl Fn(BindingIdentifier) -> bool,
    reporter: &mut Reporter<'_>,
) {
    let tree = f.syntax_tree;
    let mut variables: Vec<BindingIdentifier> = Vec::new();
    let mut stack: Vec<NodeIdentifier> = roots.iter().rev().copied().collect();
    let mut identifiers = Vec::new();
    while let Some(node) = stack.pop() {
        if let Kind::VariableDeclaration {
            kind: flag::LET,
            declarations,
        } = tree.kind(node)
            && !is_init_of_for(f, node)
            && !skip(node)
        {
            for &declarator in declarations {
                if let Kind::Declarator { identifier, .. } = tree.kind(declarator) {
                    identifiers.clear();
                    pattern_identifiers(f, identifier, &mut identifiers);
                    variables.extend(identifiers.iter().filter_map(|&i| f.sem.binding_of(i)));
                }
            }
        }
        let at = stack.len();
        tree.for_each_child(node, |child| stack.push(child));
        stack[at..].reverse();
    }
    let mut groups: Vec<(NodeIdentifier, Vec<Option<NodeIdentifier>>)> = Vec::new();
    let mut group_of: FxHashMap<NodeIdentifier, usize> = FxHashMap::default();
    let mut uses = Vec::new();
    for &variable in &variables {
        collect_uses(f, variable, &mut uses);
        let identifier = if written_by_host(variable) {
            None
        } else {
            identifier_if_should_be_const(f, variable, &uses, options, statements)
        };
        let mut previous = None;
        for reference in &uses {
            if previous == Some(reference.node) {
                continue;
            }
            previous = Some(reference.node);
            if let Some(host) = destructuring_host(f, reference) {
                let index = *group_of.entry(host).or_insert_with(|| {
                    groups.push((host, Vec::new()));
                    groups.len() - 1
                });
                groups[index].1.push(identifier);
            }
        }
    }
    let mut state = GroupState {
        name: Name::Named(""),
        id: None,
        count: 0,
    };
    for (_, nodes) in &groups {
        check_group(f, options, nodes, &mut state, reporter);
    }
}

struct GroupState<'a> {
    name: Name<'a>,
    id: Option<NodeIdentifier>,
    count: usize,
}

/// `checkGroup`, with the counters `ESLint` keeps across groups.
fn check_group<'a>(
    f: &JavaScriptFacts<'a>,
    options: PreferConstOptions,
    nodes: &[Option<NodeIdentifier>],
    state: &mut GroupState<'a>,
    reporter: &mut Reporter<'_>,
) {
    let tree = f.syntax_tree;
    let to_report: Vec<NodeIdentifier> = nodes.iter().flatten().copied().collect();
    if nodes.is_empty() || (options.destructuring_all && to_report.len() != nodes.len()) {
        return;
    }
    let declaration = nodes[0].and_then(|node| enclosing_declaration(f, node));
    let declarations = match declaration.map(|d| tree.kind(d)) {
        Some(Kind::VariableDeclaration { declarations, .. }) => declarations,
        _ => &[],
    };
    if let Some(&first) = declarations.first()
        && let Kind::Declarator {
            identifier,
            initializer: Some(initializer),
        } = tree.kind(first)
    {
        let name_of = |node| match tree.kind(node) {
            Kind::Identifier(atom) => Name::Named(tree.atoms.get(atom)),
            _ => Name::Undefined,
        };
        if name_of(identifier) != state.name {
            state.name = name_of(identifier);
            state.count = 0;
        }
        if matches!(tree.kind(identifier), Kind::ObjectPattern(_))
            && name_of(initializer) != state.name
        {
            state.name = name_of(initializer);
            state.count = 0;
        }
        if state.id != Some(identifier) {
            state.id = Some(identifier);
            state.count = 0;
        }
    }
    let mut should_fix = declaration.is_some_and(|declaration| {
        let in_for_each = f.parent(declaration).is_some_and(|p| {
            matches!(tree.kind(p), Kind::Control(Control::ForEach { left, .. }) if left == declaration)
        });
        in_for_each
            || declarations.iter().all(|&d| {
                matches!(
                    tree.kind(d),
                    Kind::Declarator {
                        initializer: Some(_),
                        ..
                    }
                )
            })
    }) && to_report.len() == nodes.len();
    if declarations.len() > 1 {
        state.count += to_report.len();
        let total: usize = declarations
            .iter()
            .map(|&d| match tree.kind(d) {
                Kind::Declarator { identifier, .. } => match tree.kind(identifier) {
                    Kind::ObjectPattern(items) | Kind::ArrayPattern(items) => items.len(),
                    _ => 1,
                },
                _ => 1,
            })
            .sum();
        should_fix = should_fix && state.count == total;
    }
    for node in to_report {
        let mut report = Report::range(
            format!(
                "'{}' is never reassigned. Use 'const' instead.",
                tree.name(node)
            ),
            f.span(node),
        )
        .message_id("useConst");
        if should_fix
            && let Some(declaration) = declaration
            && let Kind::VariableDeclaration { kind, .. } = tree.kind(declaration)
        {
            // A declaration starts with its keyword, which `ESLint` replaces whatever it is.
            let range = f.span(declaration);
            let length = if kind == flag::CONST { 5 } else { 3 };
            let keyword = Span::new(range.start_offset, range.start_offset + length);
            // The fix covers the whole declaration so that no other fix in the pass touches it.
            let mut fix = Fix::replace(keyword, "const");
            fix.push(Span::new(range.end_offset, range.end_offset), "");
            report = report.fix(fix);
        }
        reporter.report(report);
    }
}

/// `getIdentifierIfShouldBeConst`.
fn identifier_if_should_be_const(
    f: &JavaScriptFacts<'_>,
    variable: BindingIdentifier,
    uses: &[Use],
    options: PreferConstOptions,
    statements: ProgramStatements,
) -> Option<NodeIdentifier> {
    let binding = &f.sem.bindings[variable];
    let mut writer: Option<&Use> = None;
    let mut read_before_init = false;
    for reference in uses {
        if reference.write {
            if writer.is_some_and(|w| w.node != reference.node) {
                return None;
            }
            if let Some(host) = destructuring_host(f, reference)
                && let Kind::Assign(_, left, _) = f.syntax_tree.kind(host)
                && destructures_outer_or_member(f, left, binding.scope)
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
    if writer.scope != binding.scope || !can_become_declaration(f, writer.node, statements) {
        return None;
    }
    Some(if read_before_init {
        binding.node
    } else {
        writer.node
    })
}

/// The binding's references, with the write a `for…in`/`for…of` declaration makes.
fn collect_uses(f: &JavaScriptFacts<'_>, variable: BindingIdentifier, uses: &mut Vec<Use>) {
    uses.clear();
    let binding = &f.sem.bindings[variable];
    let declaration = binding.declaration.and_then(|d| f.parent(d));
    let in_for_each = declaration.is_some_and(|declaration| {
        f.parent(declaration).is_some_and(|p| {
            matches!(f.syntax_tree.kind(p), Kind::Control(Control::ForEach { left, .. }) if left == declaration)
        })
    });
    if in_for_each {
        uses.push(Use {
            node: binding.node,
            read: false,
            write: true,
            scope: binding.scope,
        });
    }
    uses.extend(f.sem.references_to(variable).map(|r| Use {
        node: r.node,
        read: r.read,
        write: r.write,
        scope: r.scope,
    }));
}

const fn is_pattern(kind: Kind<'_>) -> bool {
    matches!(
        kind,
        Kind::ObjectPattern(_)
            | Kind::ArrayPattern(_)
            | Kind::AssignPattern(..)
            | Kind::Rest(_)
            | Kind::Property { .. }
    )
}

/// The first node above `node` that is not part of a pattern.
fn pattern_host(f: &JavaScriptFacts<'_>, node: NodeIdentifier) -> Option<NodeIdentifier> {
    let mut at = f.parent(node)?;
    while is_pattern(f.syntax_tree.kind(at)) {
        at = f.parent(at)?;
    }
    Some(at)
}

/// `getDestructuringHost`: the declarator or assignment a write belongs to.
fn destructuring_host(f: &JavaScriptFacts<'_>, reference: &Use) -> Option<NodeIdentifier> {
    if !reference.write {
        return None;
    }
    let host = pattern_host(f, reference.node)?;
    matches!(
        f.syntax_tree.kind(host),
        Kind::Declarator { .. } | Kind::Assign(..)
    )
    .then_some(host)
}

/// `canBecomeVariableDeclaration`.
fn can_become_declaration(
    f: &JavaScriptFacts<'_>,
    identifier: NodeIdentifier,
    statements: ProgramStatements,
) -> bool {
    let tree = f.syntax_tree;
    let Some(host) = pattern_host(f, identifier) else {
        return false;
    };
    match tree.kind(host) {
        Kind::Declarator { .. } => true,
        Kind::Assign(..) => f
            .parent(host)
            .filter(|&s| matches!(tree.kind(s), Kind::ExpressionStatement(_)))
            .and_then(|s| f.parent(s))
            .is_some_and(|p| match tree.kind(p) {
                Kind::Program(_) => statements == ProgramStatements::InProgram,
                Kind::Block(_)
                | Kind::Control(Control::Case { .. })
                | Kind::Class(Class::StaticBlock(_)) => true,
                _ => false,
            }),
        _ => false,
    }
}

/// Whether a destructuring assignment also assigns a variable from outside `scope`, a
/// parameter, or a member (`hasOuterVariables || hasNonIdentifiers`).
fn destructures_outer_or_member(
    f: &JavaScriptFacts<'_>,
    left: NodeIdentifier,
    scope: ScopeIdentifier,
) -> bool {
    let tree = f.syntax_tree;
    let names: Vec<NodeIdentifier> = match tree.kind(left) {
        Kind::ObjectPattern(properties) => properties
            .iter()
            .filter_map(|&p| match tree.kind(p) {
                Kind::Property { value, .. } => Some(value),
                _ => None,
            })
            .collect(),
        Kind::ArrayPattern(items) => items.to_vec(),
        _ => return false,
    };
    let outer = names.iter().any(|&name| {
        let Some(atom) = tree.atom(name) else {
            return false;
        };
        f.sem.lookup(scope, atom).is_some_and(|b| {
            let binding = &f.sem.bindings[b];
            binding.scope != scope
                || binding.kind == rsvelte_typescript_semantic::scope::DeclarationKind::Param
        })
    });
    outer || has_member_assignment(f, left)
}

/// `hasMemberExpressionAssignment`.
fn has_member_assignment(f: &JavaScriptFacts<'_>, node: NodeIdentifier) -> bool {
    match f.syntax_tree.kind(node) {
        Kind::ObjectPattern(properties) => {
            properties.iter().any(|&p| match f.syntax_tree.kind(p) {
                Kind::Property { value, .. } => has_member_assignment(f, value),
                Kind::Rest(argument) => has_member_assignment(f, argument),
                _ => false,
            })
        }
        Kind::ArrayPattern(items) => items.iter().any(|&item| has_member_assignment(f, item)),
        Kind::AssignPattern(left, _) => has_member_assignment(f, left),
        Kind::Member { .. } => true,
        _ => false,
    }
}

/// `findUp(node, "VariableDeclaration", …)`, which stops at a statement.
fn enclosing_declaration(f: &JavaScriptFacts<'_>, node: NodeIdentifier) -> Option<NodeIdentifier> {
    let mut at = Some(node);
    while let Some(current) = at {
        match f.syntax_tree.kind(current) {
            Kind::VariableDeclaration { .. } => return Some(current),
            Kind::ExpressionStatement(_)
            | Kind::Block(_)
            | Kind::If { .. }
            | Kind::For { .. }
            | Kind::Return(_)
            | Kind::Empty => return None,
            Kind::Control(control)
                if !matches!(control, Control::Catch { .. } | Control::Case { .. }) =>
            {
                return None;
            }
            _ => at = f.parent(current),
        }
    }
    None
}

/// `isInitOfForStatement`.
fn is_init_of_for(f: &JavaScriptFacts<'_>, declaration: NodeIdentifier) -> bool {
    f.parent(declaration).is_some_and(|p| {
        matches!(f.syntax_tree.kind(p), Kind::For { initializer: Some(i), .. } if i == declaration)
    })
}

/// The identifiers a pattern declares, in order.
fn pattern_identifiers(
    f: &JavaScriptFacts<'_>,
    pattern: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
) {
    match f.syntax_tree.kind(pattern) {
        Kind::Identifier(_) => out.push(pattern),
        Kind::ObjectPattern(properties) => {
            for &p in properties {
                match f.syntax_tree.kind(p) {
                    Kind::Property { value, .. } => pattern_identifiers(f, value, out),
                    Kind::Rest(argument) => pattern_identifiers(f, argument, out),
                    _ => {}
                }
            }
        }
        Kind::ArrayPattern(items) => {
            for &item in items {
                pattern_identifiers(f, item, out);
            }
        }
        Kind::AssignPattern(left, _) | Kind::Rest(left) => pattern_identifiers(f, left, out),
        _ => {}
    }
}
