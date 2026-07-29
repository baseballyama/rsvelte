//! Generic OXC AST name-extraction helpers shared by the script passes.

use std::collections::HashSet;

use oxc_ast::ast as oxc;

use super::ExportedNames;

pub(super) fn extract_names_from_binding_pattern_full(
    pattern: &oxc::BindingPattern,
    exported_names: &mut ExportedNames,
    has_default: bool,
    is_prop: bool,
    is_let: bool,
    is_named_export: bool,
) {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => {
            let name = id.name.to_string();
            exported_names.add_full(
                name.clone(),
                name,
                has_default,
                None,
                is_prop,
                is_let,
                is_named_export,
            );
        }
        oxc::BindingPattern::ObjectPattern(obj_pat) => {
            for prop in obj_pat.properties.iter() {
                match &prop.value {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        extract_names_from_binding_pattern_full(
                            &assign.left,
                            exported_names,
                            true,
                            is_prop,
                            is_let,
                            is_named_export,
                        );
                    }
                    _ => {
                        extract_names_from_binding_pattern_full(
                            &prop.value,
                            exported_names,
                            has_default,
                            is_prop,
                            is_let,
                            is_named_export,
                        );
                    }
                }
            }
            // Handle rest element: `{ a, ...rest }` — recurse into `rest`
            if let Some(rest) = &obj_pat.rest {
                extract_names_from_binding_pattern_full(
                    &rest.argument,
                    exported_names,
                    has_default,
                    is_prop,
                    is_let,
                    is_named_export,
                );
            }
        }
        oxc::BindingPattern::ArrayPattern(arr_pat) => {
            for el in arr_pat.elements.iter().flatten() {
                match el {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        extract_names_from_binding_pattern_full(
                            &assign.left,
                            exported_names,
                            true,
                            is_prop,
                            is_let,
                            is_named_export,
                        );
                    }
                    _ => {
                        extract_names_from_binding_pattern_full(
                            el,
                            exported_names,
                            has_default,
                            is_prop,
                            is_let,
                            is_named_export,
                        );
                    }
                }
            }
            // Handle rest element: `[a, ...rest]` — recurse into `rest`
            if let Some(rest) = &arr_pat.rest {
                extract_names_from_binding_pattern_full(
                    &rest.argument,
                    exported_names,
                    has_default,
                    is_prop,
                    is_let,
                    is_named_export,
                );
            }
        }
        oxc::BindingPattern::AssignmentPattern(assign) => {
            extract_names_from_binding_pattern_full(
                &assign.left,
                exported_names,
                true,
                is_prop,
                is_let,
                is_named_export,
            );
        }
    }
}

/// Get a simple name from a binding pattern (only works for BindingIdentifier).
pub(super) fn binding_pattern_simple_name(pattern: &oxc::BindingPattern) -> Option<String> {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => Some(id.name.to_string()),
        _ => None,
    }
}

/// Whether a declarator's initializer is a boolean literal (`let x = false`).
/// Mirrors official `propTypeAssertToUserDefined`'s `True/FalseKeyword` check —
/// such an init still forces the `__sveltets_2_any` widen (TS would otherwise
/// narrow `x` to the `false`/`true` literal type).
pub(super) fn declarator_has_boolean_init(declarator: &oxc::VariableDeclarator) -> bool {
    declarator
        .init
        .as_ref()
        .is_some_and(|init| matches!(init, oxc::Expression::BooleanLiteral(_)))
}

/// Convert a PropertyKey to a string name.
pub(super) fn property_key_to_string(key: &oxc::PropertyKey) -> Option<String> {
    match key {
        oxc::PropertyKey::StaticIdentifier(id) => Some(id.name.to_string()),
        oxc::PropertyKey::StringLiteral(lit) => Some(lit.value.to_string()),
        oxc::PropertyKey::NumericLiteral(lit) => Some(lit.value.to_string()),
        _ => None,
    }
}

/// Convert a ModuleExportName to a string.
pub(super) fn module_export_name_to_string(name: &oxc::ModuleExportName) -> String {
    match name {
        oxc::ModuleExportName::IdentifierName(id) => id.name.to_string(),
        oxc::ModuleExportName::IdentifierReference(id) => id.name.to_string(),
        oxc::ModuleExportName::StringLiteral(lit) => lit.value.to_string(),
    }
}

/// Pre-pass: collect EVERY top-level declared binding name in the instance
/// script before rune detection runs. Official `svelte2tsx` resolves a
/// `$name` reference as a store auto-subscription (NOT the `$state`/`$derived`/
/// `$effect` rune) whenever `name` is a declared binding, using the COMPLETE
/// top-level scope. So `let state = $state(0)` must see its own `state` as
/// declared (→ legacy), while `let x = $state(0)` stays runes. Without this
/// pre-pass `declared_names` was still empty when a declarator's own
/// initializer was checked, over-detecting runes. Mirrors upstream
/// `ImplicitStoreValues` / `checkGlobalsForRunes`.
pub(super) fn collect_top_level_declared_names(body: &[oxc::Statement]) -> HashSet<String> {
    fn add_binding(pattern: &oxc::BindingPattern, names: &mut HashSet<String>) {
        if let oxc::BindingPattern::BindingIdentifier(id) = pattern {
            names.insert(id.name.to_string());
            return;
        }
        visit_binding_names(pattern, &mut |name| {
            names.insert(name.to_string());
        });
    }

    fn add_var(vd: &oxc::VariableDeclaration, names: &mut HashSet<String>) {
        for d in vd.declarations.iter() {
            add_binding(&d.id, names);
        }
    }

    fn add_declaration(decl: &oxc::Declaration, names: &mut HashSet<String>) {
        match decl {
            oxc::Declaration::VariableDeclaration(vd) => add_var(vd, names),
            oxc::Declaration::FunctionDeclaration(f) => {
                if let Some(id) = &f.id {
                    names.insert(id.name.to_string());
                }
            }
            oxc::Declaration::ClassDeclaration(c) => {
                if let Some(id) = &c.id {
                    names.insert(id.name.to_string());
                }
            }
            _ => {}
        }
    }

    let mut names = HashSet::new();
    for stmt in body {
        match stmt {
            oxc::Statement::VariableDeclaration(vd) => add_var(vd, &mut names),
            oxc::Statement::FunctionDeclaration(f) => {
                if let Some(id) = &f.id {
                    names.insert(id.name.to_string());
                }
            }
            oxc::Statement::ClassDeclaration(c) => {
                if let Some(id) = &c.id {
                    names.insert(id.name.to_string());
                }
            }
            oxc::Statement::TSModuleDeclaration(m) => {
                if let oxc_ast::ast::TSModuleDeclarationName::Identifier(id) = &m.id {
                    names.insert(id.name.to_string());
                }
            }
            oxc::Statement::TSEnumDeclaration(e) => {
                names.insert(e.id.name.to_string());
            }
            oxc::Statement::ImportDeclaration(imp) => {
                if let Some(specs) = &imp.specifiers {
                    for s in specs.iter() {
                        let n = match s {
                            oxc::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                                s.local.name.to_string()
                            }
                            oxc::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                                s.local.name.to_string()
                            }
                            oxc::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                                s.local.name.to_string()
                            }
                        };
                        names.insert(n);
                    }
                }
            }
            oxc::Statement::ExportNamedDeclaration(ex) => {
                if let Some(decl) = &ex.declaration {
                    add_declaration(decl, &mut names);
                }
            }
            _ => {}
        }
    }
    names
}

/// Extract all identifier names from a binding pattern (for destructuring support).
///
/// For `{ a, b, c }` returns `["a", "b", "c"]`.
/// For `[a, b, c]` returns `["a", "b", "c"]`.
/// For simple identifiers, returns the single name.
pub(super) fn extract_all_names_from_binding_pattern(pattern: &oxc::BindingPattern) -> Vec<String> {
    let mut names = Vec::new();
    collect_binding_names(pattern, &mut names);
    names
}

pub(super) fn collect_binding_names(pattern: &oxc::BindingPattern, names: &mut Vec<String>) {
    visit_binding_names(pattern, &mut |name| names.push(name.to_string()));
}

fn visit_binding_names<F>(pattern: &oxc::BindingPattern, visit: &mut F)
where
    F: FnMut(&str),
{
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => {
            visit(id.name.as_str());
        }
        oxc::BindingPattern::ObjectPattern(obj) => {
            for prop in obj.properties.iter() {
                visit_binding_names(&prop.value, visit);
            }
            if let Some(ref rest) = obj.rest {
                visit_binding_names(&rest.argument, visit);
            }
        }
        oxc::BindingPattern::ArrayPattern(arr) => {
            for el in arr.elements.iter().flatten() {
                visit_binding_names(el, visit);
            }
            if let Some(ref rest) = arr.rest {
                visit_binding_names(&rest.argument, visit);
            }
        }
        oxc::BindingPattern::AssignmentPattern(assign) => {
            visit_binding_names(&assign.left, visit);
        }
    }
}

/// Extract names from the left-hand side of an assignment expression
/// (used for reactive declarations like `$: store = ...`).
pub(super) fn extract_names_from_assignment_target(target: &oxc::AssignmentTarget) -> Vec<String> {
    let mut names = Vec::new();
    collect_assignment_target_names(target, &mut names);
    names
}

fn collect_assignment_target_names(target: &oxc::AssignmentTarget, names: &mut Vec<String>) {
    match target {
        oxc::AssignmentTarget::AssignmentTargetIdentifier(id) => {
            let name = id.name.to_string();
            if !name.starts_with('$') {
                names.push(name);
            }
        }
        oxc::AssignmentTarget::ObjectAssignmentTarget(obj) => {
            for prop in obj.properties.iter() {
                match prop {
                    oxc::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(id) => {
                        let name = id.binding.name.to_string();
                        if !name.starts_with('$') {
                            names.push(name);
                        }
                    }
                    oxc::AssignmentTargetProperty::AssignmentTargetPropertyProperty(prop) => {
                        match &prop.binding {
                            oxc::AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(
                                with_default,
                            ) => {
                                collect_assignment_target_names(&with_default.binding, names);
                            }
                            _ => {
                                if let Some(target) = prop.binding.as_assignment_target() {
                                    collect_assignment_target_names(target, names);
                                }
                            }
                        }
                    }
                }
            }
            if let Some(ref rest) = obj.rest {
                collect_assignment_target_names(&rest.target, names);
            }
        }
        oxc::AssignmentTarget::ArrayAssignmentTarget(arr) => {
            for el in arr.elements.iter().flatten() {
                match el {
                    oxc::AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(
                        with_default,
                    ) => {
                        collect_assignment_target_names(&with_default.binding, names);
                    }
                    _ => {
                        if let Some(target) = el.as_assignment_target() {
                            collect_assignment_target_names(target, names);
                        }
                    }
                }
            }
            if let Some(ref rest) = arr.rest {
                collect_assignment_target_names(&rest.target, names);
            }
        }
        _ => {}
    }
}
