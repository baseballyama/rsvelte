use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript::scope::{BindingIdentifier, Semantic};
use rsvelte_typescript::syntax_tree::Control;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_typescript_lint::{JavaScriptFacts, PreferConstOptions, ProgramStatements};
use rustc_hash::FxHashSet;
use serde::Deserialize;

use super::nodes::{is_named, roots};
use super::runes::runes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

/// `ESLint`'s core rule, which leaves alone a declaration initialised by an excluded rune.
pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-const",
    files: Files::All,
    configure,
};

/// Upstream's schema allows properties it does not know, for the core rule's future options.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Options {
    destructuring: Option<Destructuring>,
    ignore_read_before_assign: Option<bool>,
    excluded_runes: Option<Vec<String>>,
}

#[derive(Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
enum Destructuring {
    Any,
    All,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    if options.options.len() > 1 {
        return Err("takes one option".to_owned());
    }
    let options: Option<Options> = options.get(0)?;
    let (core, excluded_runes) = options.map_or_else(
        || (PreferConstOptions::default(), None),
        |o| {
            (
                PreferConstOptions {
                    destructuring_all: o.destructuring == Some(Destructuring::All),
                    ignore_read_before_assign: o.ignore_read_before_assign.unwrap_or(false),
                },
                o.excluded_runes,
            )
        },
    );
    Ok(Box::new(PreferConst {
        core,
        excluded_runes: excluded_runes
            .unwrap_or_else(|| vec!["$props".to_owned(), "$derived".to_owned()]),
    }))
}

#[derive(Debug)]
struct PreferConst {
    core: PreferConstOptions,
    excluded_runes: Vec<String>,
}

impl SvelteRule for PreferConst {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let tree = file.javascript();
        let facts = JavaScriptFacts {
            syntax_tree: tree,
            sem: file.semantic(),
            parents: file.parents(),
        };
        let statements = if file.is_component() {
            ProgramStatements::Wrapped
        } else {
            ProgramStatements::InProgram
        };
        let props = props(file);
        rsvelte_typescript_lint::prefer_const(
            &facts,
            &roots(file),
            file.source(),
            self.core,
            statements,
            |declaration| self.initialised_by_excluded_rune(tree, declaration),
            |variable| props.contains(&variable),
            reporter,
        );
    }
}

impl PreferConst {
    /// A declarator of `declaration` calls `$rune(…)` or `$rune.member(…)` with an excluded rune.
    fn initialised_by_excluded_rune(&self, tree: &SyntaxTree, declaration: NodeIdentifier) -> bool {
        let Kind::VariableDeclaration { declarations, .. } = tree.kind(declaration) else {
            return false;
        };
        declarations.iter().any(|&declarator| {
            let Kind::Declarator {
                initializer: Some(initializer),
                ..
            } = tree.kind(declarator)
            else {
                return false;
            };
            let Kind::Call { callee, .. } = tree.kind(initializer) else {
                return false;
            };
            let rune = match tree.kind(callee) {
                Kind::Member { object, .. } => object,
                _ => callee,
            };
            tree.atom(rune).is_some_and(|atom| {
                self.excluded_runes
                    .iter()
                    .any(|r| r == tree.atoms.get(atom))
            })
        })
    }
}

/// The instance script's props, which the parent component writes: `export let` names and
/// exported variables, and in runes mode the `$bindable()` names of `let {…} = $props()`.
fn props(file: &File<'_>) -> FxHashSet<BindingIdentifier> {
    let mut props = FxHashSet::default();
    let Some(instance) = file.component().and_then(|c| c.instance.as_ref()) else {
        return props;
    };
    let tree = file.javascript();
    let sem = file.semantic();
    let Kind::Program(statements) = tree.kind(instance.program) else {
        return props;
    };
    let scope = sem.scope_of(instance.program);
    let runes_mode = runes(file) != Some(false);
    let mut identifiers = Vec::new();
    for &statement in statements {
        identifiers.clear();
        match tree.kind(statement) {
            Kind::ExportNamed(declaration) => {
                if let Kind::VariableDeclaration { declarations, .. } = tree.kind(declaration) {
                    for &declarator in declarations {
                        if let Kind::Declarator { identifier, .. } = tree.kind(declarator) {
                            pattern_names(tree, identifier, &mut identifiers);
                        }
                    }
                }
            }
            Kind::Control(Control::ExportList { specifiers, .. }) => {
                for &specifier in specifiers {
                    if let Kind::Control(Control::ExportSpecifier { local, .. }) =
                        tree.kind(specifier)
                    {
                        props.extend(scope.and_then(|scope| lookup(tree, sem, scope, local)));
                    }
                }
            }
            Kind::VariableDeclaration { declarations, .. } if runes_mode => {
                for &declarator in declarations {
                    if let Kind::Declarator {
                        identifier,
                        initializer: Some(initializer),
                    } = tree.kind(declarator)
                        && let Kind::Call { callee, .. } = tree.kind(initializer)
                        && is_named(tree, callee, "$props")
                        && matches!(tree.kind(identifier), Kind::ObjectPattern(_))
                    {
                        bindable_names(tree, identifier, &mut identifiers);
                    }
                }
            }
            _ => {}
        }
        props.extend(identifiers.iter().filter_map(|&i| sem.binding_of(i)));
    }
    props
}

/// The variable a name in `export { name }` refers to, looked up by name as upstream does.
fn lookup(
    tree: &SyntaxTree,
    sem: &Semantic,
    scope: rsvelte_typescript::scope::ScopeIdentifier,
    local: NodeIdentifier,
) -> Option<BindingIdentifier> {
    sem.lookup(scope, tree.atom(local)?)
}

/// The identifiers a pattern declares.
fn pattern_names(tree: &SyntaxTree, pattern: NodeIdentifier, out: &mut Vec<NodeIdentifier>) {
    match tree.kind(pattern) {
        Kind::Identifier(_) => out.push(pattern),
        Kind::ObjectPattern(items) | Kind::ArrayPattern(items) => {
            for &item in items {
                pattern_names(tree, item, out);
            }
        }
        Kind::Property { value, .. } => pattern_names(tree, value, out),
        Kind::AssignPattern(left, _) | Kind::Rest(left) => pattern_names(tree, left, out),
        _ => {}
    }
}

/// The identifiers of a pattern that default to `$bindable(…)`, at any depth.
fn bindable_names(tree: &SyntaxTree, pattern: NodeIdentifier, out: &mut Vec<NodeIdentifier>) {
    match tree.kind(pattern) {
        Kind::ObjectPattern(items) | Kind::ArrayPattern(items) => {
            for &item in items {
                bindable_names(tree, item, out);
            }
        }
        Kind::Property { value, .. } => bindable_names(tree, value, out),
        Kind::Rest(argument) => bindable_names(tree, argument, out),
        Kind::AssignPattern(left, right) => {
            if matches!(tree.kind(left), Kind::Identifier(_))
                && let Kind::Call { callee, .. } = tree.kind(right)
                && is_named(tree, callee, "$bindable")
            {
                out.push(left);
            }
            bindable_names(tree, left, out);
        }
        _ => {}
    }
}
