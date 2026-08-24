//! Runes-mode detection: does the instance script reference an undeclared
//! `$state` / `$derived` / `$effect` global?

use std::collections::HashSet;

use oxc_ast::ast as oxc;

use super::ExportedNames;
use super::ast_utils::{
    collect_binding_names, extract_all_names_from_binding_pattern,
    extract_names_from_assignment_target,
};

/// The official svelte2tsx `is_rune` quirk: a `$state(...)`/`$derived(...)`/
/// `$props(...)` call that is the *direct* initializer of a variable
/// declaration whose binding name (source text) **includes** the rune base
/// name (`state`/`derived`/`props`) is treated as the canonical rune form and
/// is therefore NOT counted as a store-access global — so it does not, on its
/// own, switch the component into runes mode.
///
/// Reference: `processInstanceScriptContent.ts` `handleIdentifier`:
/// ```text
/// const is_rune =
///   (text === '$props' || text === '$derived' || text === '$state') &&
///   ts.isCallExpression(parent) &&
///   ts.isVariableDeclaration(parent.parent) &&
///   parent.parent.name.getText().includes(text.slice(1));
/// ```
///
/// Returns the base rune call when the init is the excluded canonical form, so
/// callers can still scan its *arguments* for nested rune globals (which keep
/// their own non-VariableDeclaration parent and so are not excluded).
pub(super) fn excluded_rune_init<'a>(
    init: &'a oxc::Expression,
    id: &oxc::BindingPattern,
) -> Option<&'a oxc::CallExpression<'a>> {
    let oxc::Expression::CallExpression(call) = init else {
        return None;
    };
    let oxc::Expression::Identifier(callee) = &call.callee else {
        return None;
    };
    let base = match callee.name.as_str() {
        "$state" => "state",
        "$derived" => "derived",
        "$props" => "props",
        _ => return None,
    };
    if binding_name_contains(id, base) {
        Some(call)
    } else {
        None
    }
}

/// True if any identifier bound by `pattern` contains `needle` as a substring.
/// Mirrors official's `name.getText().includes(base)` for the common simple /
/// destructuring cases.
fn binding_name_contains(pattern: &oxc::BindingPattern, needle: &str) -> bool {
    extract_all_names_from_binding_pattern(pattern)
        .iter()
        .any(|n| n.contains(needle))
}

/// Scan a rune call's arguments for nested rune globals (used when the call
/// itself is the excluded canonical form but its arguments may still contain
/// runes, e.g. `let derived1 = $derived($state(0))`).
fn detect_rune_in_call_args(call: &oxc::CallExpression, declared_names: &HashSet<String>) -> bool {
    call.arguments.iter().any(|arg| match arg {
        oxc::Argument::SpreadElement(spread) => {
            detect_rune_in_expr(&spread.argument, declared_names)
        }
        _ => detect_rune_in_expr(arg.to_expression(), declared_names),
    })
}

/// Run the whole-program rune-globals scan over the instance script body.
///
/// Upstream does this in ONE pass: every `$`-prefixed identifier *reference*
/// becomes a global, and `checkGlobalsForRunes` then tests that set for
/// membership of `['$state', '$derived', '$effect']` — there is no notion of a
/// call anywhere in it.
///
/// Reference: `ExportedNames.ts` `checkGlobalsForRunes` fed by
/// `ImplicitStoreValues.getGlobals()`.
pub(super) fn detect_runes_in_program(
    body: &[oxc::Statement],
    exported_names: &mut ExportedNames,
    declared_names: &HashSet<String>,
) {
    // Reactive assignments introduce implicit top-level bindings for rune/store
    // disambiguation, but they must not be added to the declaration set used by
    // the later reactive-statement rewrite: that pass needs to know that they
    // are new so it can turn `$: state = ...` into `let state = ...`.
    let mut rune_scope = declared_names.clone();
    for stmt in body {
        let oxc::Statement::LabeledStatement(labeled) = stmt else {
            continue;
        };
        if labeled.label.name != "$" {
            continue;
        }
        let oxc::Statement::ExpressionStatement(expr_stmt) = &labeled.body else {
            continue;
        };
        let expr = match &expr_stmt.expression {
            oxc::Expression::ParenthesizedExpression(paren) => &paren.expression,
            other => other,
        };
        if let oxc::Expression::AssignmentExpression(assign) = expr {
            rune_scope.extend(extract_names_from_assignment_target(&assign.left));
        }
    }

    if detect_rune_in_nested_body(body, &rune_scope) {
        exported_names.set_uses_runes(true);
    }
}

/// True when `name` is one of the three rune globals and is not shadowed.
///
/// Upstream's `getGlobals()` deletes the names bound by top-level variable
/// declarations, reactive declarations and imports (`state` shadows `$state`),
/// while `resolveStore` drops a reference whose literal `$state` spelling is
/// declared in an enclosing scope (a parameter named `$state`). Both are
/// carried in `declared_names`.
fn is_rune_global_ident(name: &str, declared_names: &HashSet<String>) -> bool {
    matches!(name, "$state" | "$derived" | "$effect")
        && !declared_names.contains(&name[1..])
        && !declared_names.contains(name)
}

/// Detect a reference to the `$state` / `$derived` / `$effect` globals in the
/// head position of an expression: the bare identifier itself, the object of a
/// member expression (`$state.raw`), or either of those as a call callee.
///
/// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
///   `hasRunesGlobals = isSvelte5Plus && globals.some(g => ['$state','$derived','$effect'].includes(g))`
fn detect_rune_global_ref_expr(expr: &oxc::Expression, declared_names: &HashSet<String>) -> bool {
    match expr {
        // Bare reference: `void $state`, `const a = $derived`, `{ k: $effect }`.
        oxc::Expression::Identifier(id) => is_rune_global_ident(id.name.as_str(), declared_names),
        // Member read: `$state.raw`, `$effect.pre` — called or not.
        oxc::Expression::StaticMemberExpression(mem) => {
            detect_rune_global_ref_expr(&mem.object, declared_names)
        }
        oxc::Expression::CallExpression(call) => {
            detect_rune_global_ref_expr(&call.callee, declared_names)
        }
        _ => false,
    }
}

/// Detect whether a rune global (`$state`, `$derived`, `$effect`, including
/// member reads such as `$state.raw`) is referenced anywhere in these
/// statements or in any nested function, class or arrow body.
///
/// The official svelte2tsx `checkGlobalsForRunes` works by collecting every
/// undeclared identifier referenced anywhere in the script (via the TypeScript
/// compiler's symbol walk) and then testing whether any of `$state`/`$derived`/
/// `$effect` appears. This mirrors that behaviour for the OXC AST by recursively
/// walking statements and expressions inside nested bodies.
///
/// Reference: ExportedNames.ts `checkGlobalsForRunes` + `ImplicitStoreValues.getGlobals()`
///   `this.hasRunesGlobals = isSvelte5Plus && globals.some(g => runes.includes(g))`
fn detect_rune_in_nested_body(stmts: &[oxc::Statement], declared_names: &HashSet<String>) -> bool {
    for stmt in stmts {
        if detect_rune_in_stmt(stmt, declared_names) {
            return true;
        }
    }
    false
}

/// Walk a `VariableDeclaration`, applying the official `is_rune` exclusion: the
/// canonical `let stateX = $state(...)` form is not a runes-globals trigger, but
/// nested runes in the arguments still are.
fn detect_rune_in_variable_declaration(
    var_decl: &oxc::VariableDeclaration,
    declared_names: &HashSet<String>,
) -> bool {
    var_decl.declarations.iter().any(|d| {
        d.init.as_ref().is_some_and(|e| {
            excluded_rune_init(e, &d.id).map_or_else(
                || detect_rune_in_expr(e, declared_names),
                |call| detect_rune_in_call_args(call, declared_names),
            )
        })
    })
}

/// Walk a single statement (and any nested sub-statements / expressions)
/// looking for an undeclared `$state`/`$derived`/`$effect` reference.
pub(super) fn detect_rune_in_stmt(stmt: &oxc::Statement, declared_names: &HashSet<String>) -> bool {
    match stmt {
        oxc::Statement::ExpressionStatement(es) => {
            detect_rune_in_expr(&es.expression, declared_names)
        }
        oxc::Statement::VariableDeclaration(var_decl) => {
            detect_rune_in_variable_declaration(var_decl, declared_names)
        }
        oxc::Statement::ReturnStatement(ret) => ret
            .argument
            .as_ref()
            .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Statement::BlockStatement(block) => {
            detect_rune_in_nested_body(&block.body, declared_names)
        }
        oxc::Statement::IfStatement(if_stmt) => {
            detect_rune_in_expr(&if_stmt.test, declared_names)
                || detect_rune_in_stmt(&if_stmt.consequent, declared_names)
                || if_stmt
                    .alternate
                    .as_ref()
                    .is_some_and(|s| detect_rune_in_stmt(s, declared_names))
        }
        oxc::Statement::WhileStatement(while_stmt) => {
            detect_rune_in_expr(&while_stmt.test, declared_names)
                || detect_rune_in_stmt(&while_stmt.body, declared_names)
        }
        oxc::Statement::DoWhileStatement(do_stmt) => {
            detect_rune_in_expr(&do_stmt.test, declared_names)
                || detect_rune_in_stmt(&do_stmt.body, declared_names)
        }
        oxc::Statement::ForStatement(for_stmt) => {
            for_stmt.init.as_ref().is_some_and(|init| match init {
                oxc::ForStatementInit::VariableDeclaration(vd) => vd.declarations.iter().any(|d| {
                    d.init
                        .as_ref()
                        .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                }),
                // ForStatementInit inherits Expression variants; use to_expression()
                // for all non-VariableDeclaration arms.
                _ => init
                    .as_expression()
                    .is_some_and(|expression| detect_rune_in_expr(expression, declared_names)),
            }) || for_stmt
                .test
                .as_ref()
                .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                || for_stmt
                    .update
                    .as_ref()
                    .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                || detect_rune_in_stmt(&for_stmt.body, declared_names)
        }
        oxc::Statement::LabeledStatement(labeled) => {
            detect_rune_in_stmt(&labeled.body, declared_names)
        }
        oxc::Statement::ForOfStatement(f) => {
            detect_rune_in_expr(&f.right, declared_names)
                || detect_rune_in_stmt(&f.body, declared_names)
        }
        oxc::Statement::ForInStatement(f) => {
            detect_rune_in_expr(&f.right, declared_names)
                || detect_rune_in_stmt(&f.body, declared_names)
        }
        oxc::Statement::TryStatement(t) => {
            detect_rune_in_nested_body(&t.block.body, declared_names)
                || t.handler.as_ref().is_some_and(|h| {
                    // A catch parameter named `$state` shadows the global, the
                    // same way a function parameter does.
                    let scope = h.param.as_ref().map_or_else(
                        || declared_names.clone(),
                        |p| scope_with_binding(declared_names, &p.pattern),
                    );
                    detect_rune_in_nested_body(&h.body.body, &scope)
                })
                || t.finalizer
                    .as_ref()
                    .is_some_and(|f| detect_rune_in_nested_body(&f.body, declared_names))
        }
        // `export let p = $state` / `export function f() { $effect(…) }` — the
        // `export` modifier is transparent to upstream's identifier walk.
        oxc::Statement::ExportDeclaration(export) => match &export.declaration {
            oxc::Declaration::VariableDeclaration(vd) => {
                detect_rune_in_variable_declaration(vd, declared_names)
            }
            oxc::Declaration::FunctionDeclaration(func) => func.body.as_ref().is_some_and(|body| {
                let scope = scope_with_params(declared_names, &func.params);
                detect_rune_in_nested_body(&body.statements, &scope)
            }),
            oxc::Declaration::ClassDeclaration(class) => {
                detect_rune_in_class_body(class, declared_names)
            }
            _ => false,
        },
        oxc::Statement::SwitchStatement(s) => s.cases.iter().any(|c| {
            c.test
                .as_ref()
                .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                || detect_rune_in_nested_body(&c.consequent, declared_names)
        }),
        oxc::Statement::FunctionDeclaration(func) => detect_rune_in_function(func, declared_names),
        // A `class` nested in a function/block body — its method bodies and
        // field initializers can still reference rune globals (e.g.
        // `function bar() { class Foo { foo = $state(0) } }`). Mirror the
        // top-level ClassDeclaration scan.
        oxc::Statement::ClassDeclaration(class) => detect_rune_in_class_body(class, declared_names),
        _ => false,
    }
}

/// The one class scan. A `class` statement, an `export class` and a class
/// *expression* must answer "does this class reference a rune global" the same
/// way, so every entry point calls this and none re-implements it.
pub(super) fn detect_rune_in_class_body(
    class: &oxc::Class,
    declared_names: &HashSet<String>,
) -> bool {
    if class
        .heritage
        .as_ref()
        .is_some_and(|h| detect_rune_in_expr(&h.expression, declared_names))
    {
        return true;
    }
    class.body.body.iter().any(|member| match member {
        oxc::ClassElement::MethodDefinition(method) => {
            detect_rune_in_property_key(&method.key, declared_names)
                || detect_rune_in_function(&method.value, declared_names)
        }
        oxc::ClassElement::PropertyDefinition(prop) => {
            detect_rune_in_property_key(&prop.key, declared_names)
                || prop
                    .value
                    .as_ref()
                    .is_some_and(|e| detect_rune_in_expr(e, declared_names))
        }
        oxc::ClassElement::AccessorProperty(prop) => {
            detect_rune_in_property_key(&prop.key, declared_names)
                || prop
                    .value
                    .as_ref()
                    .is_some_and(|e| detect_rune_in_expr(e, declared_names))
        }
        oxc::ClassElement::StaticBlock(block) => {
            detect_rune_in_nested_body(&block.body, declared_names)
        }
        oxc::ClassElement::TSIndexSignature(_) => false,
    })
}

/// A non-computed key is an identifier or a literal and can hold no call, so
/// this only ever fires on a computed key such as `class K { [$state(0)] = 1 }`.
fn detect_rune_in_property_key(key: &oxc::PropertyKey, declared_names: &HashSet<String>) -> bool {
    key.as_expression()
        .is_some_and(|e| detect_rune_in_expr(e, declared_names))
}

/// The one function scan: parameter defaults and the body, both under a scope
/// that already holds the parameter names, so `f($state) { $state(0) }` resolves
/// to the parameter and is not a rune. Shared by every function form.
pub(super) fn detect_rune_in_function(
    func: &oxc::Function,
    declared_names: &HashSet<String>,
) -> bool {
    let scope = scope_with_params(declared_names, &func.params);
    detect_rune_in_params(&func.params, &scope)
        || func
            .body
            .as_ref()
            .is_some_and(|body| detect_rune_in_nested_body(&body.statements, &scope))
}

/// As [`detect_rune_in_function`], for an arrow. An expression-bodied arrow
/// (`() => $state(0)`) carries the rune in its body expression, not in a
/// statement list.
pub(super) fn detect_rune_in_arrow(
    arrow: &oxc::ArrowFunctionExpression,
    declared_names: &HashSet<String>,
) -> bool {
    let scope = scope_with_params(declared_names, &arrow.params);
    if detect_rune_in_params(&arrow.params, &scope) {
        return true;
    }
    match &arrow.body {
        oxc::ArrowFunctionBody::FunctionBody(block) => {
            detect_rune_in_nested_body(&block.statements, &scope)
        }
        other => other
            .as_expression()
            .is_some_and(|e| detect_rune_in_expr(e, &scope)),
    }
}

/// Walk the default value of every parameter: `f(p = $state(0))` is a rune
/// reference the body walk never sees. A top-level default is
/// `FormalParameter::initializer`; only a default *inside* a destructuring
/// pattern is an `AssignmentPattern`, so both have to be read.
fn detect_rune_in_params(params: &oxc::FormalParameters, scope: &HashSet<String>) -> bool {
    params.items.iter().any(|p| {
        p.initializer
            .as_ref()
            .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
        oxc::ClassElement::StaticBlock(block) => {
            detect_rune_in_nested_body(&block.body, declared_names)
        }
        _ => false,
    })
}

/// Clone `base` and add the names a binding pattern introduces, so a rune name
/// shadowed by a catch parameter is treated as that binding, not as a rune.
fn scope_with_binding(base: &HashSet<String>, pattern: &oxc::BindingPattern) -> HashSet<String> {
    let mut s = base.clone();
    let mut tmp: Vec<String> = Vec::new();
    collect_binding_names(pattern, &mut tmp);
    s.extend(tmp);
    s
}

/// Clone `base` and add a function's parameter names, so a `$state`/`$derived`/
/// `$effect` shadowed by a parameter (e.g. `function bar($derived) { $derived }`)
/// resolves to the param, not to the rune. Mirrors official's scope-aware
/// global resolution.
pub(super) fn scope_with_params(
    base: &HashSet<String>,
    params: &oxc::FormalParameters,
) -> HashSet<String> {
    let mut s = base.clone();
    let mut tmp: Vec<String> = Vec::new();
    for p in &params.items {
        collect_binding_names(&p.pattern, &mut tmp);
    }
    if let Some(rest) = &params.rest {
        collect_binding_names(&rest.rest.argument, &mut tmp);
    }
    for n in tmp {
        s.insert(n);
    }
    s
}

/// Recursively detect an unshadowed `$state`/`$derived`/`$effect` reference
/// anywhere inside the given expression tree.
pub(super) fn detect_rune_in_expr(
    expr: &oxc::Expression,
    declared_names: &HashSet<String>,
) -> bool {
    // Fast-path: check if this expression itself references a rune global.
    if detect_rune_global_ref_expr(expr, declared_names) {
        return true;
    }
    match expr {
        oxc::Expression::CallExpression(call) => {
            // The callee might not be a rune but the arguments could reference one.
            detect_rune_in_expr(&call.callee, declared_names)
                || detect_rune_in_arguments(&call.arguments, declared_names)
        }
        oxc::Expression::ArrowFunctionExpression(arrow) => {
            let scope = scope_with_params(declared_names, &arrow.params);
            match &arrow.body {
                oxc::ArrowFunctionBody::FunctionBody(block) => {
                    detect_rune_in_nested_body(&block.statements, &scope)
                }
                // Concise body: `() => $state`.
                body => body
                    .as_expression()
                    .is_some_and(|e| detect_rune_in_expr(e, &scope)),
            }
        }
        oxc::Expression::FunctionExpression(func) => func.body.as_ref().is_some_and(|body| {
            let scope = scope_with_params(declared_names, &func.params);
            detect_rune_in_nested_body(&body.statements, &scope)
        }),
        oxc::Expression::ClassExpression(class) => {
            class.body.body.iter().any(|member| match member {
                oxc::ClassElement::MethodDefinition(method) => {
                    method.value.body.as_ref().is_some_and(|body| {
                        let scope = scope_with_params(declared_names, &method.value.params);
                        detect_rune_in_nested_body(&body.statements, &scope)
                    })
                }
                oxc::ClassElement::PropertyDefinition(prop) => prop
                    .value
                    .as_ref()
                    .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
                _ => false,
            })
        }
        oxc::Expression::FunctionExpression(func) => detect_rune_in_function(func, declared_names),
        oxc::Expression::ClassExpression(class) => detect_rune_in_class_body(class, declared_names),
        oxc::Expression::AssignmentExpression(assign) => {
            detect_rune_in_expr(&assign.right, declared_names)
        }
        oxc::Expression::BinaryExpression(bin) => {
            detect_rune_in_expr(&bin.left, declared_names)
                || detect_rune_in_expr(&bin.right, declared_names)
        }
        oxc::Expression::LogicalExpression(log) => {
            detect_rune_in_expr(&log.left, declared_names)
                || detect_rune_in_expr(&log.right, declared_names)
        }
        oxc::Expression::ConditionalExpression(cond) => {
            detect_rune_in_expr(&cond.test, declared_names)
                || detect_rune_in_expr(&cond.consequent, declared_names)
                || detect_rune_in_expr(&cond.alternate, declared_names)
        }
        oxc::Expression::SequenceExpression(seq) => seq
            .expressions
            .iter()
            .any(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Expression::ObjectExpression(object) => detect_rune_in_object(object, declared_names),
        oxc::Expression::ArrayExpression(array) => detect_rune_in_array(array, declared_names),
        oxc::Expression::StaticMemberExpression(mem) => {
            detect_rune_in_expr(&mem.object, declared_names)
        }
        oxc::Expression::ComputedMemberExpression(mem) => {
            detect_rune_in_expr(&mem.object, declared_names)
                || detect_rune_in_expr(&mem.expression, declared_names)
        }
        oxc::Expression::UnaryExpression(unary) => {
            detect_rune_in_expr(&unary.argument, declared_names)
        }
        oxc::Expression::NewExpression(new_expr) => {
            // e.g. `new class Counter { constructor() { this.x = $state(0) } }`
            // or `new Foo($derived(...))`.
            detect_rune_in_expr(&new_expr.callee, declared_names)
                || detect_rune_in_arguments(&new_expr.arguments, declared_names)
        }
        oxc::Expression::TemplateLiteral(tpl) => tpl
            .expressions
            .iter()
            .any(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Expression::TaggedTemplateExpression(tagged) => {
            detect_rune_in_expr(&tagged.tag, declared_names)
                || tagged
                    .quasi
                    .expressions
                    .iter()
                    .any(|e| detect_rune_in_expr(e, declared_names))
        }
        oxc::Expression::AwaitExpression(aw) => detect_rune_in_expr(&aw.argument, declared_names),
        oxc::Expression::YieldExpression(y) => y
            .argument
            .as_ref()
            .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Expression::ParenthesizedExpression(paren) => {
            detect_rune_in_expr(&paren.expression, declared_names)
        }
        oxc::Expression::TSAsExpression(ts_as) => {
            detect_rune_in_expr(&ts_as.expression, declared_names)
        }
        oxc::Expression::TSNonNullExpression(nn) => {
            detect_rune_in_expr(&nn.expression, declared_names)
        }
        // Identifier, literals, template literals without expressions, etc. → no rune
        _ => false,
    }
}

fn detect_rune_in_object(object: &oxc::ObjectExpression, declared_names: &HashSet<String>) -> bool {
    object.properties.iter().any(|property| match property {
        oxc::ObjectPropertyKind::ObjectProperty(property) => {
            detect_rune_in_expr(&property.value, declared_names)
        }
        oxc::ObjectPropertyKind::SpreadProperty(spread) => {
            detect_rune_in_expr(&spread.argument, declared_names)
        }
    })
}

fn detect_rune_in_array(array: &oxc::ArrayExpression, declared_names: &HashSet<String>) -> bool {
    array.elements.iter().any(|element| match element {
        oxc::ArrayExpressionElement::SpreadElement(spread) => {
            detect_rune_in_expr(&spread.argument, declared_names)
        }
        oxc::ArrayExpressionElement::Elision(_) => false,
        _ => detect_rune_in_expr(element.to_expression(), declared_names),
    })
}

fn detect_rune_in_arguments(arguments: &[oxc::Argument], declared_names: &HashSet<String>) -> bool {
    arguments.iter().any(|argument| match argument {
        oxc::Argument::SpreadElement(spread) => {
            detect_rune_in_expr(&spread.argument, declared_names)
        }
        _ => detect_rune_in_expr(argument.to_expression(), declared_names),
    })
}

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;

    /// A JS component with `$effect` called INSIDE a function body (not top-level)
    /// should still be detected as runes mode and emit `__sveltets_$$bindings("")`.
    /// Reference: ExportedNames.ts `checkGlobalsForRunes` which walks the entire AST.
    #[test]
    fn test_runes_effect_in_function_body() {
        let source = "<script>\nfunction myaction(node) {\n    $effect(() => {\n        // setup\n    });\n}\n</script>\n<div use:myaction>...</div>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_$$bindings"),
            "Component with $effect inside function body should be runes mode (emit __sveltets_$$bindings), got:\n{}",
            result.code
        );
        assert!(
            !result.code.contains("bindings: \"\""),
            "Runes mode must not emit `bindings: \"\"`, got:\n{}",
            result.code
        );
    }
}
