use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::source::tokens::TokenIdentifier;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::semantic::legacy::{Variable, is_top_level, reactive_body};
use rsvelte_svelte::semantic::resolve::RUNE_ROOTS;
use rsvelte_svelte::syntax::syntax_tree::{Component, TokenType};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::semantic::globals::global;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::{FxHashMap, FxHashSet};

use super::javascript::span;
use super::legacy_reactivity::{legacy, property_name};
use super::runes::runes_mode;
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
        let javascript = file.javascript();
        // Outside `<script>`: a component's template, or a whole module.
        let (roots, runes) = match (file.component(), file.module()) {
            (Some(component), _) => (
                component.template_expressions.clone(),
                runes_mode(component, file.source()),
            ),
            (None, Some(module)) => (
                vec![module.root],
                file.path().ends_with(".svelte.js") || file.path().ends_with(".svelte.ts"),
            ),
            (None, None) => return,
        };
        let mut members = Vec::new();
        for root in roots {
            find(javascript, root, runes, &mut members);
        }
        if members.is_empty() {
            return;
        }
        let assigned = file
            .component()
            .map(|_| ReactiveVariables::new(file))
            .unwrap_or_default();
        for member in members {
            if self_scoped(file, member) {
                continue;
            }
            report(file, &assigned, member, reporter);
        }
    }
}

/// The `$name.property` members under `node`, outermost first.
fn find(javascript: &SyntaxTree, root: NodeIdentifier, runes: bool, out: &mut Vec<NodeIdentifier>) {
    let mut pending = vec![root];
    while let Some(node) = pending.pop() {
        if store_object(javascript, node, runes).is_some() {
            out.push(node);
        }
        let first = pending.len();
        javascript.for_each_child(node, |child| pending.push(child));
        pending[first..].reverse();
    }
}

/// The `$name` of a `$name.property` member.
fn store_object(javascript: &SyntaxTree, node: NodeIdentifier, runes: bool) -> Option<&str> {
    let Kind::Member { object, .. } = javascript.kind(node) else {
        return None;
    };
    let name = javascript.atoms.get(javascript.atom(object)?);
    let rest = name.strip_prefix('$')?;
    if rest.is_empty() || rest.starts_with('$') || (runes && RUNE_ROOTS.contains(&name)) {
        return None;
    }
    Some(name)
}

/// Whether an identifier of the member, outside members of its own kind, is declared below the
/// top level, as an `{#each}` item is.
fn self_scoped(file: &File<'_>, member: NodeIdentifier) -> bool {
    let javascript = file.javascript();
    let sem = file.semantic();
    let runes = false;
    let mut pending = vec![member];
    while let Some(node) = pending.pop() {
        if node != member && store_object(javascript, node, runes).is_some() {
            continue;
        }
        if javascript.is_identifier(node)
            && is_expression_identifier(file, node)
            && let Some(binding) = sem.binding_of(node)
            && !is_top_level(sem, sem.bindings[binding].scope)
        {
            return true;
        }
        javascript.for_each_child(node, |child| pending.push(child));
    }
    false
}

/// `isExpressionIdentifier`: not a property name, label or declared name.
fn is_expression_identifier(file: &File<'_>, node: NodeIdentifier) -> bool {
    let javascript = file.javascript();
    let parent = file.parents()[node.index()];
    if parent.is_none() {
        return true;
    }
    match javascript.kind(parent) {
        Kind::Member {
            property, computed, ..
        } => computed || property != node,
        Kind::Property {
            key,
            computed,
            shorthand,
            ..
        } => computed || key != node || shorthand,
        Kind::Function { name, .. } => name != Some(node),
        _ => true,
    }
}

fn report(
    file: &File<'_>,
    assigned: &ReactiveVariables<'_>,
    member: NodeIdentifier,
    reporter: &mut Reporter<'_>,
) {
    let javascript = file.javascript();
    let source = file.source();
    let Kind::Member {
        object,
        property,
        computed,
        ..
    } = javascript.kind(member)
    else {
        return;
    };
    let store = javascript.name(object);
    let mut suggestions = Vec::new();
    if !computed {
        let name = javascript.name(property);
        if let Some(component) = file.component() {
            let mut seen = FxHashSet::default();
            for variable in assigned.of(object, name) {
                if seen.insert(variable) {
                    let variable = javascript.name(variable);
                    suggestions.push(Suggestion {
                        message_id: Some("fixUseVariable".into()),
                        message: format!("Using the predefined reactive variable {variable}"),
                        fix: Fix::replace(span(javascript, member), variable),
                    });
                }
            }
            if let Some(end_tag) = instance_end_tag(component) {
                let local = local_name(file, name);
                let mut fix = Fix::insert(
                    end_tag,
                    if local == name {
                        format!("$: ({{ {name} }} = {store});\n")
                    } else {
                        format!("$: ({{ {name}: {local} }} = {store});\n")
                    },
                );
                fix.push(span(javascript, member), local);
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
    let shown = if computed {
        span(javascript, property)
            .text(source)
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
    } else {
        javascript.name(property).to_owned()
    };
    let mut report = Report::range(
        format!("Destructure {shown} from {store} for better change tracking & fewer redraws"),
        span(javascript, member),
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
    top_of: FxHashMap<NodeIdentifier, (Variable, bool)>,
    /// Per such pair, the `(property, name)` that `$: name = $store.property` and
    /// `$: ({ property: name } = $store)` assign, in source order.
    assigned: FxHashMap<(Variable, bool), Vec<(&'f str, NodeIdentifier)>>,
}

impl<'f> ReactiveVariables<'f> {
    fn new(file: &'f File<'_>) -> Self {
        let javascript = file.javascript();
        let source = file.source();
        let sem = file.semantic();
        let parents = file.parents();
        let parent = |node: NodeIdentifier| parents[node.index()].opt();
        // The `$:` statement whose expression is `assignment`.
        let reactive = |assignment: NodeIdentifier| {
            parent(assignment)
                .filter(|&statement| {
                    matches!(javascript.kind(statement), Kind::ExpressionStatement(_))
                })
                .and_then(parent)
                .is_some_and(|labeled| reactive_body(javascript, labeled).is_some())
        };
        let mut out = Self::default();
        for (reference, top) in sem.references.iter().zip(&legacy(file).references) {
            let Some(top) = top else { continue };
            let key = (top.variable, top.store);
            let id = reference.node;
            out.top_of.insert(id, key);
            let Some(up) = parent(id) else { continue };
            match javascript.kind(up) {
                Kind::Member { object, .. } if object == id => {
                    if let Some(property) = property_name(javascript, source, up)
                        && let Some(assignment) = parent(up)
                        && let Kind::Assign(_, left, right) = javascript.kind(assignment)
                        && right == up
                        && javascript.is_identifier(left)
                        && reactive(assignment)
                    {
                        out.assigned.entry(key).or_default().push((property, left));
                    }
                }
                Kind::Assign(_, left, right) if right == id && reactive(up) => {
                    let Kind::ObjectPattern(properties) = javascript.kind(left) else {
                        continue;
                    };
                    let list = out.assigned.entry(key).or_default();
                    let first = list.len();
                    for &property in properties {
                        if let Kind::Property {
                            key,
                            value,
                            computed,
                            ..
                        } = javascript.kind(property)
                            && javascript.is_identifier(value)
                            && let Some(name) = static_key(javascript, source, key, computed)
                            // Upstream takes the first property of each name.
                            && !list[first..].iter().any(|&(seen, _)| seen == name)
                        {
                            list.push((name, value));
                        }
                    }
                }
                _ => {}
            }
        }
        out
    }

    /// The names assigned from `object.property`, where `object` is a reference, in source order.
    fn of(&self, object: NodeIdentifier, property: &str) -> impl Iterator<Item = NodeIdentifier> {
        self.top_of
            .get(&object)
            .and_then(|key| self.assigned.get(key))
            .into_iter()
            .flatten()
            .filter(move |&&(name, _)| name == property)
            .map(|&(_, variable)| variable)
    }
}

/// A property key's static name.
fn static_key<'t>(
    javascript: &'t SyntaxTree,
    source: &'t str,
    key: NodeIdentifier,
    computed: bool,
) -> Option<&'t str> {
    match javascript.kind(key) {
        Kind::Identifier(_) if !computed => Some(javascript.name(key)),
        Kind::String => Some(javascript.str_value(key, source)),
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
fn local_name(file: &File<'_>, property: &str) -> String {
    let base = property.strip_prefix('$').unwrap_or(property);
    let mut suffix = usize::from(RESERVED.contains(&base));
    let mut name = if suffix == 0 {
        base.to_owned()
    } else {
        format!("{base}{suffix}")
    };
    while declared(file, &name) {
        suffix += 1;
        name = format!("{base}{suffix}");
    }
    name
}

/// Whether a global or a top-level variable is called `name`.
fn declared(file: &File<'_>, name: &str) -> bool {
    if global(name).is_some() {
        return true;
    }
    let javascript = file.javascript();
    let Some(atom) = javascript.atoms.lookup(name) else {
        return false;
    };
    let sem = file.semantic();
    let top_level = |binding: BindingIdentifier| is_top_level(sem, sem.bindings[binding].scope);
    sem.root_binding(atom).is_some_and(top_level)
        || file.component().is_some()
            && legacy(file)
                .implicit
                .iter()
                .any(|implicit| implicit.name == atom)
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
