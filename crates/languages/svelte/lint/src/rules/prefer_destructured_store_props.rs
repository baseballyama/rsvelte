use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentTarget, AssignmentTargetMaybeDefault, AssignmentTargetProperty, BindingIdentifier,
    ComputedMemberExpression, Expression, Function, IdentifierReference, PropertyKey,
    StaticMemberExpression,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::{AstNodes, NodeId, ReferenceId, ScopeId, Scoping, SymbolId};
use oxc_syntax::scope::ScopeFlags;
use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::source::tokens::TokenIdentifier;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::legacy::{Variable, is_top_level};
use rsvelte_svelte_semantic::resolve::{RUNE_ROOTS, Resolution};
use rsvelte_svelte_syntax::syntax_tree::{Component, TokenType};
use rsvelte_typescript_semantic::globals::global;
use rustc_hash::{FxHashMap, FxHashSet};

use super::legacy_reactivity::{expression_node, legacy, property_name};
use super::nodes::span;
use super::runes::runes_mode;
use super::svelte_store::is_value;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-destructured-store-props",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferDestructuredStoreProps))
}

#[derive(Debug)]
struct PreferDestructuredStoreProps;

impl SvelteRule for PreferDestructuredStoreProps {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        // Outside `<script>`: a component's template, or a whole module.
        let (scripts, runes) = match (file.component(), file.module()) {
            (Some(component), _) => (
                component
                    .module
                    .iter()
                    .chain(&component.instance)
                    .map(|script| script.content)
                    .collect(),
                runes_mode(component, file.source()),
            ),
            (None, Some(_)) => (Vec::new(), file.is_svelte_module()),
            (None, None) => return,
        };
        let in_script = |at: oxc_span::Span| {
            scripts
                .iter()
                .any(|script| script.start_offset <= at.start && at.end <= script.end_offset)
        };
        let members: Vec<Member<'_>> = file
            .nodes()
            .iter()
            .filter_map(|node| Member::of(node.kind(), runes))
            .filter(|member| !in_script(member.span()))
            .collect();
        if members.is_empty() {
            return;
        }
        let top = TopLevel::new(file);
        let assigned = file
            .component()
            .map(|_| ReactiveVariables::new(file))
            .unwrap_or_default();
        for member in members {
            if self_scoped(file.semantic().scoping(), &top, member) {
                continue;
            }
            report(file, &top, &assigned, member, reporter);
        }
    }
}

/// A `$name.property` or `$name[property]` member.
#[derive(Clone, Copy)]
enum Member<'a> {
    Static(&'a StaticMemberExpression<'a>),
    Computed(&'a ComputedMemberExpression<'a>),
}

impl<'a> Member<'a> {
    fn of(kind: AstKind<'a>, runes: bool) -> Option<Self> {
        let member = match kind {
            AstKind::StaticMemberExpression(member) => Self::Static(member),
            AstKind::ComputedMemberExpression(member) => Self::Computed(member),
            _ => return None,
        };
        store_object(member.object(), runes).map(|_| member)
    }

    const fn object(self) -> &'a Expression<'a> {
        match self {
            Self::Static(member) => &member.object,
            Self::Computed(member) => &member.object,
        }
    }

    const fn span(self) -> oxc_span::Span {
        match self {
            Self::Static(member) => member.span,
            Self::Computed(member) => member.span,
        }
    }
}

/// The `$name` of a `$name.property` member's object.
fn store_object<'a>(
    object: &'a Expression<'a>,
    runes: bool,
) -> Option<&'a IdentifierReference<'a>> {
    let Expression::Identifier(object) = object else {
        return None;
    };
    let name = object.name.as_str();
    let rest = name.strip_prefix('$')?;
    if rest.is_empty() || rest.starts_with('$') || (runes && RUNE_ROOTS.contains(&name)) {
        return None;
    }
    Some(object)
}

/// Which scopes are the top level: the scripts' for a component, the program's for a module.
struct TopLevel<'a> {
    resolution: Option<&'a Resolution>,
    root: ScopeId,
}

impl<'a> TopLevel<'a> {
    fn new(file: &File<'a>) -> Self {
        Self {
            resolution: file.resolution(),
            root: file.semantic().scoping().root_scope_id(),
        }
    }

    fn contains(&self, scope: ScopeId) -> bool {
        self.resolution.map_or(scope == self.root, |resolution| {
            is_top_level(resolution, scope)
        })
    }
}

/// Whether an identifier of the member, outside members of its own kind, is declared below the
/// top level, as an `{#each}` item is.
fn self_scoped(scoping: &Scoping, top: &TopLevel<'_>, member: Member<'_>) -> bool {
    let mut finder = SelfScoped {
        scoping,
        top,
        function_name: None,
        found: false,
    };
    match member {
        Member::Static(member) => walk::walk_static_member_expression(&mut finder, member),
        Member::Computed(member) => walk::walk_computed_member_expression(&mut finder, member),
    }
    finder.found
}

struct SelfScoped<'s, 't> {
    scoping: &'s Scoping,
    top: &'s TopLevel<'t>,
    /// The name of the function being entered, which is no expression identifier.
    function_name: Option<oxc_span::Span>,
    found: bool,
}

impl SelfScoped<'_, '_> {
    fn symbol(&mut self, symbol: Option<SymbolId>) {
        if let Some(symbol) = symbol
            && !self.top.contains(self.scoping.symbol_scope_id(symbol))
        {
            self.found = true;
        }
    }
}

impl<'a> Visit<'a> for SelfScoped<'_, '_> {
    fn visit_static_member_expression(&mut self, it: &StaticMemberExpression<'a>) {
        if store_object(&it.object, false).is_none() {
            walk::walk_static_member_expression(self, it);
        }
    }

    fn visit_computed_member_expression(&mut self, it: &ComputedMemberExpression<'a>) {
        if store_object(&it.object, false).is_none() {
            walk::walk_computed_member_expression(self, it);
        }
    }

    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        self.function_name = it.id.as_ref().map(|id| id.span);
        walk::walk_function(self, it, flags);
    }

    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        let symbol = it
            .reference_id
            .get()
            .and_then(|id| self.scoping.get_reference(id).symbol_id());
        self.symbol(symbol);
    }

    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        if self.function_name.take() != Some(it.span) {
            self.symbol(it.symbol_id.get());
        }
    }
}

fn report(
    file: &File<'_>,
    top: &TopLevel<'_>,
    assigned: &ReactiveVariables<'_>,
    member: Member<'_>,
    reporter: &mut Reporter<'_>,
) {
    let source = file.source();
    let Some(object) = store_object(member.object(), false) else {
        return;
    };
    let store = object.name.as_str();
    let at = span(&member.span());
    let mut suggestions = Vec::new();
    if let Member::Static(static_member) = member {
        let name = static_member.property.name.as_str();
        if let Some(component) = file.component() {
            let mut seen = FxHashSet::default();
            for (variable, variable_name) in assigned.of(object.node_id(), name) {
                if seen.insert(variable) {
                    suggestions.push(Suggestion {
                        message_id: Some("fixUseVariable".into()),
                        message: format!("Using the predefined reactive variable {variable_name}"),
                        fix: Fix::replace(at, variable_name),
                    });
                }
            }
            if let Some(end_tag) = instance_end_tag(component) {
                let local = local_name(file, top, name);
                let mut fix = Fix::insert(
                    end_tag,
                    if local == name {
                        format!("$: ({{ {name} }} = {store});\n")
                    } else {
                        format!("$: ({{ {name}: {local} }} = {store});\n")
                    },
                );
                fix.push(at, local);
                suggestions.push(Suggestion {
                    message_id: Some("fixUseDestructuring".into()),
                    message: format!(
                        "Using destructuring like $: ({{ {name} }} = {store}); will run faster"
                    ),
                    fix,
                });
            }
        }
    }
    let shown = match member {
        Member::Computed(member) => span(&member.expression)
            .text(source)
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" "),
        Member::Static(member) => member.property.name.as_str().to_owned(),
    };
    let mut report = Report::range(
        format!("Destructure {shown} from {store} for better change tracking & fewer redraws"),
        at,
    )
    .message_id("useDestructuring");
    for suggestion in suggestions {
        report = report.suggest(suggestion);
    }
    reporter.report(report);
}

/// `findReactiveVariable` for every store at once.
#[derive(Default)]
struct ReactiveVariables<'f> {
    /// The top-level variable each reference refers to, and whether through `$`.
    top_of: FxHashMap<NodeId, (Variable, bool)>,
    /// Per such pair, the `(property, variable, name)` that `$: name = $store.property` and
    /// `$: ({ property: name } = $store)` assign, in source order.
    assigned: FxHashMap<(Variable, bool), Vec<Assigned<'f>>>,
}

/// A property, the variable assigned from it, and that variable's name.
type Assigned<'f> = (&'f str, NodeId, &'f str);

impl<'f> ReactiveVariables<'f> {
    fn new(file: &File<'f>) -> Self {
        let semantic = file.semantic();
        let scoping = semantic.scoping();
        let nodes = semantic.nodes();
        let legacy = legacy(file);
        let mut out = Self::default();
        for id in (0..scoping.references_len()).map(ReferenceId::from_usize) {
            let reference = scoping.get_reference(id);
            if !is_value(reference) {
                continue;
            }
            let Some(top) = legacy.references[id.index()] else {
                continue;
            };
            let key = (top.variable, top.store);
            let node = reference.node_id();
            out.top_of.insert(node, key);
            let up = nodes.parent_id(node);
            if up == node {
                continue;
            }
            match nodes.kind(up) {
                member @ (AstKind::StaticMemberExpression(_)
                | AstKind::ComputedMemberExpression(_)) => {
                    let object = match member {
                        AstKind::StaticMemberExpression(member) => &member.object,
                        AstKind::ComputedMemberExpression(member) => &member.object,
                        _ => continue,
                    };
                    if expression_node(object) != node {
                        continue;
                    }
                    let assignment = nodes.parent_id(up);
                    if let Some(property) = property_name(member)
                        && let AstKind::AssignmentExpression(expression) = nodes.kind(assignment)
                        && expression_node(&expression.right) == up
                        && let AssignmentTarget::AssignmentTargetIdentifier(left) = &expression.left
                        && reactive(nodes, assignment)
                    {
                        out.assigned.entry(key).or_default().push((
                            property,
                            left.node_id(),
                            left.name.as_str(),
                        ));
                    }
                }
                AstKind::AssignmentExpression(assignment)
                    if expression_node(&assignment.right) == node && reactive(nodes, up) =>
                {
                    let AssignmentTarget::ObjectAssignmentTarget(pattern) = &assignment.left else {
                        continue;
                    };
                    let list = out.assigned.entry(key).or_default();
                    let first = list.len();
                    for property in &pattern.properties {
                        let Some((name, value)) = destructured(property) else {
                            continue;
                        };
                        // Upstream takes the first property of each name.
                        if !list[first..].iter().any(|&(seen, ..)| seen == name) {
                            list.push((name, value.node_id(), value.name.as_str()));
                        }
                    }
                }
                _ => {}
            }
        }
        out
    }

    /// The variables assigned from `object.property`, where `object` is a reference, in source
    /// order.
    fn of(&self, object: NodeId, property: &str) -> impl Iterator<Item = (NodeId, &'f str)> {
        self.top_of
            .get(&object)
            .and_then(|key| self.assigned.get(key))
            .into_iter()
            .flatten()
            .filter(move |&&(name, ..)| name == property)
            .map(|&(_, variable, name)| (variable, name))
    }
}

/// Whether `assignment` is the expression of a `$:` statement.
fn reactive(nodes: &AstNodes<'_>, assignment: NodeId) -> bool {
    let statement = nodes.parent_id(assignment);
    matches!(nodes.kind(statement), AstKind::ExpressionStatement(_))
        && matches!(
            nodes.parent_kind(statement),
            AstKind::LabeledStatement(labeled) if labeled.label.name == "$"
        )
}

/// The name a destructuring property reads and the variable it assigns, when that is a plain
/// name: `{ name }`, `{ name: variable }` or `{ "name": variable }`.
fn destructured<'a>(
    property: &'a AssignmentTargetProperty<'a>,
) -> Option<(&'a str, &'a IdentifierReference<'a>)> {
    match property {
        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(property) => property
            .init
            .is_none()
            .then(|| (property.binding.name.as_str(), &property.binding)),
        AssignmentTargetProperty::AssignmentTargetPropertyProperty(property) => {
            let AssignmentTargetMaybeDefault::AssignmentTargetIdentifier(value) = &property.binding
            else {
                return None;
            };
            Some((static_key(&property.name)?, &**value))
        }
    }
}

/// A property key's static name.
fn static_key<'t>(key: &PropertyKey<'t>) -> Option<&'t str> {
    match key {
        PropertyKey::StaticIdentifier(name) => Some(name.name.as_str()),
        PropertyKey::StringLiteral(string) => string.value.as_str(),
        _ => None,
    }
}

/// Where `</script>` of the instance script starts.
fn instance_end_tag(component: &Component) -> Option<u32> {
    let script = component.instance.as_ref()?;
    let tokens = &component.tokens;
    let last = tokens.before(script.span.end_offset)?;
    (0..=last.index())
        .rev()
        .map(|i| tokens.get(TokenIdentifier::new(i)))
        .take_while(|token| token.span.start_offset >= script.span.start_offset)
        .find(|token| token.kind == TokenType::EndTagOpen)
        .map(|token| token.span.start_offset)
}

/// A name for `property` no top-level variable, global or reserved word takes.
fn local_name(file: &File<'_>, top: &TopLevel<'_>, property: &str) -> String {
    let base = property.strip_prefix('$').unwrap_or(property);
    let mut suffix = usize::from(RESERVED.contains(&base));
    let mut name = if suffix == 0 {
        base.to_owned()
    } else {
        format!("{base}{suffix}")
    };
    while declared(file, top, &name) {
        suffix += 1;
        name = format!("{base}{suffix}");
    }
    name
}

/// Whether a global or a top-level variable is called `name`.
fn declared(file: &File<'_>, top: &TopLevel<'_>, name: &str) -> bool {
    if global(name).is_some() {
        return true;
    }
    let scoping = file.semantic().scoping();
    let scope = top.resolution.map_or(top.root, Resolution::instance_scope);
    scoping
        .find_binding(scope, name.into())
        .is_some_and(|symbol| top.contains(scoping.symbol_scope_id(symbol)))
        || file.component().is_some()
            && legacy(file)
                .implicit
                .iter()
                .any(|implicit| &*implicit.name == name)
}

/// `esutils`' ES6 reserved words in strict mode, and `eval` and `arguments`.
const RESERVED: &[&str] = &[
    "if",
    "in",
    "do",
    "var",
    "for",
    "new",
    "try",
    "let",
    "this",
    "else",
    "case",
    "void",
    "with",
    "enum",
    "while",
    "break",
    "catch",
    "throw",
    "const",
    "yield",
    "class",
    "super",
    "return",
    "typeof",
    "delete",
    "switch",
    "export",
    "import",
    "default",
    "finally",
    "extends",
    "function",
    "continue",
    "debugger",
    "instanceof",
    "implements",
    "interface",
    "package",
    "private",
    "protected",
    "public",
    "static",
    "null",
    "true",
    "false",
    "eval",
    "arguments",
];
