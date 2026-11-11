use std::sync::Arc;

use rsvelte_lint_runner::rule::Reporter;
use oxc_ast::ast::{
    BindingPattern, Declaration, Expression, PropertyKey, Statement, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};

use super::nodes::{is_named, span};
use super::kit_route::{RouteFile, route_file};
use crate::LintSettings;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/valid-prop-names-in-kit-pages",
    files: Files::Components,
    configure,
};

const MESSAGE: &str = "disallow invalid props in SvelteKit route components.";
const PAGE: &[&str] = &["data", "form", "params", "snapshot"];
const LEGACY_PAGE: &[&str] = &["data", "form", "params", "snapshot", "errors"];
const LAYOUT: &[&str] = &["data", "form", "params", "snapshot", "children"];
const ERROR: &[&str] = &["error"];

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(ValidPropNames {
        settings: Arc::clone(options.settings),
    }))
}

#[derive(Debug)]
struct ValidPropNames {
    settings: Arc<LintSettings>,
}

impl SvelteRule for ValidPropNames {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let Some(instance) = &component.instance else {
            return;
        };
        let Some(route) = route_file(&self.settings, file, reporter) else {
            return;
        };
        let expected = match route {
            RouteFile::Page => PAGE,
            RouteFile::Layout => LAYOUT,
            RouteFile::Error => ERROR,
        };
        let program = component.javascript.get_program(instance.program);
        // `export let` props of the legacy syntax, in every route component.
        for statement in &program.body {
            let Statement::ExportDeclaration(export) = statement else {
                continue;
            };
            let Declaration::VariableDeclaration(declaration) = &export.declaration else {
                continue;
            };
            for declarator in &declaration.declarations {
                match &declarator.id {
                    BindingPattern::BindingIdentifier(name) => {
                        if !LEGACY_PAGE.contains(&name.name.as_str()) {
                            reporter.range(MESSAGE, span(declarator));
                        }
                    }
                    pattern => check_pattern(pattern, LEGACY_PAGE, reporter),
                }
            }
        }
        // `let { … } = $props()` anywhere in the instance script.
        Props { expected, reporter }.visit_program(program);
    }
}

struct Props<'r, 'p> {
    expected: &'static [&'static str],
    reporter: &'r mut Reporter<'p>,
}

impl<'a> Visit<'a> for Props<'_, '_> {
    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        if let Some(Expression::CallExpression(call)) = &it.init
            && is_named(&call.callee, "$props")
        {
            check_pattern(&it.id, self.expected, self.reporter);
        }
        walk::walk_variable_declarator(self, it);
    }
}

/// Reports each key of an object pattern that is not an expected prop.
fn check_pattern(pattern: &BindingPattern<'_>, expected: &[&str], reporter: &mut Reporter<'_>) {
    let BindingPattern::ObjectPattern(object) = pattern else {
        return;
    };
    for property in &object.properties {
        if property.computed {
            continue;
        }
        if let PropertyKey::StaticIdentifier(key) = &property.key
            && !expected.contains(&key.name.as_str())
        {
            reporter.range(MESSAGE, span(key.as_ref()));
        }
    }
}
