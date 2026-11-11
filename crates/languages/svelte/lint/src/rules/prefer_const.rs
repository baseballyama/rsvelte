use oxc_ast::ast::{
    BindingPattern, Declaration, Expression, ModuleExportName, Statement,
    VariableDeclaration,
};
use oxc_semantic::{ScopeId, Scoping, SymbolId};
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_lint::{PreferConstOptions, ProgramStatements};
use rustc_hash::FxHashSet;
use serde::Deserialize;

use super::nodes::is_named;
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
        let statements = if file.is_component() {
            ProgramStatements::Wrapped
        } else {
            ProgramStatements::InProgram
        };
        let props = props(file);
        // TODO(oxc port): the shared rule visits programs only, so it no longer sees the functions
        // and blocks in template expressions, which upstream checks too.
        rsvelte_typescript_lint::prefer_const(
            file.semantic(),
            &file.programs(),
            self.core,
            statements,
            |declaration| self.initialised_by_excluded_rune(declaration),
            |variable| props.contains(&variable),
            reporter,
        );
    }
}

impl PreferConst {
    /// A declarator of `declaration` calls `$rune(…)` or `$rune.member(…)` with an excluded rune.
    fn initialised_by_excluded_rune(&self, declaration: &VariableDeclaration<'_>) -> bool {
        declaration.declarations.iter().any(|declarator| {
            let Some(Expression::CallExpression(call)) = &declarator.init else {
                return false;
            };
            let rune = match &call.callee {
                Expression::StaticMemberExpression(member) => &member.object,
                Expression::ComputedMemberExpression(member) => &member.object,
                callee => callee,
            };
            self.excluded_runes.iter().any(|r| is_named(rune, r))
        })
    }
}

/// The instance script's props, which the parent component writes: `export let` names and
/// exported variables, and in runes mode the `$bindable()` names of `let {…} = $props()`.
fn props(file: &File<'_>) -> FxHashSet<SymbolId> {
    let mut props = FxHashSet::default();
    let Some(instance) = file.component().and_then(|c| c.instance.as_ref()) else {
        return props;
    };
    let program = file.javascript().get_program(instance.program);
    let scoping = file.semantic().scoping();
    // With a `<script module>`, the instance's statements are in the module's scope.
    let scope = file.resolution().map(Resolution::instance_scope);
    let runes_mode = runes(file) != Some(false);
    let mut identifiers = Vec::new();
    for statement in &program.body {
        identifiers.clear();
        match statement {
            Statement::ExportDeclaration(export) => {
                if let Declaration::VariableDeclaration(declaration) = &export.declaration {
                    for declarator in &declaration.declarations {
                        pattern_names(&declarator.id, &mut identifiers);
                    }
                }
            }
            Statement::ExportNamedDeclaration(export) if !export.export_kind.is_type() => {
                for specifier in export.specifiers.iter().filter(|s| !s.export_kind.is_type()) {
                    props.extend(scope.and_then(|scope| lookup(scoping, scope, &specifier.local)));
                }
            }
            Statement::ExportFromDeclaration(export) if !export.export_kind.is_type() => {
                for specifier in export.specifiers.iter().filter(|s| !s.export_kind.is_type()) {
                    props.extend(scope.and_then(|scope| lookup(scoping, scope, &specifier.local)));
                }
            }
            Statement::VariableDeclaration(declaration) if runes_mode => {
                for declarator in &declaration.declarations {
                    if let Some(Expression::CallExpression(call)) = &declarator.init
                        && is_named(&call.callee, "$props")
                        && matches!(declarator.id, BindingPattern::ObjectPattern(_))
                    {
                        bindable_names(&declarator.id, &mut identifiers);
                    }
                }
            }
            _ => {}
        }
        props.extend(identifiers.iter().flatten());
    }
    props
}

/// The variable a name in `export { name }` refers to, looked up by name as upstream does.
fn lookup(scoping: &Scoping, scope: ScopeId, local: &ModuleExportName<'_>) -> Option<SymbolId> {
    match local {
        ModuleExportName::IdentifierName(name) => scoping.find_binding(scope, name.name),
        ModuleExportName::IdentifierReference(name) => {
            scoping.find_binding(scope, name.name)
        }
        ModuleExportName::StringLiteral(_) => None,
    }
}

/// The symbols a pattern declares.
fn pattern_names(pattern: &BindingPattern<'_>, out: &mut Vec<Option<SymbolId>>) {
    match pattern {
        BindingPattern::BindingIdentifier(identifier) => out.push(identifier.symbol_id.get()),
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                pattern_names(&property.value, out);
            }
            if let Some(rest) = &object.rest {
                pattern_names(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(array) => {
            for element in array.elements.iter().flatten() {
                pattern_names(element, out);
            }
            if let Some(rest) = &array.rest {
                pattern_names(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(assignment) => pattern_names(&assignment.left, out),
    }
}

/// The symbols of a pattern that default to `$bindable(…)`, at any depth.
fn bindable_names(pattern: &BindingPattern<'_>, out: &mut Vec<Option<SymbolId>>) {
    match pattern {
        BindingPattern::BindingIdentifier(_) => {}
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                bindable_names(&property.value, out);
            }
            if let Some(rest) = &object.rest {
                bindable_names(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(array) => {
            for element in array.elements.iter().flatten() {
                bindable_names(element, out);
            }
            if let Some(rest) = &array.rest {
                bindable_names(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(assignment) => {
            if let BindingPattern::BindingIdentifier(identifier) = &assignment.left
                && let Expression::CallExpression(call) = &assignment.right
                && is_named(&call.callee, "$bindable")
            {
                out.push(identifier.symbol_id.get());
            }
            bindable_names(&assignment.left, out);
        }
    }
}
