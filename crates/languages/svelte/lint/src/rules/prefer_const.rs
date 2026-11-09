use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_typescript_lint::{JavaScriptFacts, PreferConstOptions, ProgramStatements};
use serde::Deserialize;

use super::nodes::roots;
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
        rsvelte_typescript_lint::prefer_const(
            &facts,
            &roots(file),
            file.source(),
            self.core,
            statements,
            |declaration| self.initialised_by_excluded_rune(tree, declaration),
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
