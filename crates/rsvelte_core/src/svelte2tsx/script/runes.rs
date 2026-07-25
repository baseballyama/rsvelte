//! Runes-mode detection: does the instance script reference an undeclared
//! `$state` / `$derived` / `$effect` global?

use std::collections::HashSet;

use oxc_ast::ast as oxc;

use super::ExportedNames;
use super::ast_utils::{collect_binding_names, extract_all_names_from_binding_pattern};

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

pub(super) fn detect_runes_call(
    declarator: &oxc::VariableDeclarator,
    exported_names: &mut ExportedNames,
    declared_names: &HashSet<String>,
) {
    if let Some(ref init) = declarator.init {
        // Apply the official `is_rune` exclusion: the canonical
        // `let stateX = $state(...)` form does not, by itself, trigger runes
        // mode — but nested runes in the arguments still do.
        if let Some(call) = excluded_rune_init(init, &declarator.id) {
            if detect_rune_in_call_args(call, declared_names) {
                exported_names.set_uses_runes(true);
            }
            return;
        }
        // `detect_rune_in_expr` subsumes `detect_rune_global_call_expr`: it
        // fast-paths to the top-level check first, then recurses into nested
        // function/arrow bodies. This catches patterns like:
        //   `const action = (node) => { $effect(() => { … }); }`
        // which the original top-level-only check missed.
        // Reference: ExportedNames.ts `checkGlobalsForRunes` which walks the
        // entire TS AST (not just top-level statements).
        if detect_rune_in_expr(init, declared_names) {
            exported_names.set_uses_runes(true);
        }
    }
}

/// Detect `$state(...)`, `$derived(...)`, `$effect(...)` — including member-call
/// variants such as `$state.raw(...)`, `$effect.pre(...)` — anywhere as an
/// expression (not just as a VariableDeclarator init).
///
/// Mirrors the official `isRunesMode` `hasRunesGlobals` check which looks for
/// undeclared `$state`/`$derived`/`$effect` identifiers in the instance scope.
/// We check both direct calls (`$state(v)`) and member calls (`$state.raw(v)`)
/// since both reference the `$state` global.
///
/// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
///   `hasRunesGlobals = isSvelte5Plus && globals.some(g => ['$state','$derived','$effect'].includes(g))`
fn detect_rune_global_call_expr(expr: &oxc::Expression, declared_names: &HashSet<String>) -> bool {
    match expr {
        // Direct call: $state(...), $derived(...), $effect(...)
        oxc::Expression::CallExpression(call) => {
            match &call.callee {
                // $state(...), $derived(...), $effect(...)
                oxc::Expression::Identifier(id)
                    if matches!(id.name.as_str(), "$state" | "$derived" | "$effect") =>
                {
                    // Not a rune if either the store base (`$state` is a
                    // store-sub of a declared `state`) OR the full `$state`
                    // identifier itself is declared (e.g. shadowed by a param
                    // named `$derived`).
                    let base = &id.name[1..]; // "$state" -> "state"
                    !declared_names.contains(base) && !declared_names.contains(id.name.as_str())
                }
                // Member call: $state.raw(...), $effect.pre(...), etc.
                // The object identifier must be $state/$derived/$effect.
                oxc::Expression::StaticMemberExpression(mem) => {
                    if let oxc::Expression::Identifier(obj) = &mem.object
                        && matches!(obj.name.as_str(), "$state" | "$derived" | "$effect")
                    {
                        let base = &obj.name[1..];
                        !declared_names.contains(base)
                            && !declared_names.contains(obj.name.as_str())
                    } else {
                        false
                    }
                }
                _ => false,
            }
        }
        _ => false,
    }
}

/// Detect rune globals used as top-level ExpressionStatements in the instance
/// script, e.g. `$effect(() => { ... })`.
///
/// These don't have a VariableDeclarator so `detect_runes_call` misses them.
/// Reference: official svelte2tsx `hasRunesGlobals` which checks ALL undeclared
/// `$state`/`$derived`/`$effect` references in the instance script scope.
pub(super) fn detect_runes_expr_stmt(
    expr_stmt: &oxc::ExpressionStatement,
    exported_names: &mut ExportedNames,
    declared_names: &HashSet<String>,
) {
    // Use the recursive walker so runes nested in arrow/function bodies are also
    // detected (e.g. `setTimeout(() => { $effect(() => {}) })`).
    // `detect_rune_in_expr` fast-paths to `detect_rune_global_call_expr` first.
    if detect_rune_in_expr(&expr_stmt.expression, declared_names) {
        exported_names.set_uses_runes(true);
    }
}

/// Detect whether any rune global call (`$state`, `$derived`, `$effect` including
/// member variants such as `$state.raw`, `$effect.pre`) appears anywhere inside
/// a function, class, or arrow-function body — even when not at the top level.
///
/// The official svelte2tsx `checkGlobalsForRunes` works by collecting every
/// undeclared identifier referenced anywhere in the script (via the TypeScript
/// compiler's symbol walk) and then testing whether any of `$state`/`$derived`/
/// `$effect` appears. This mirrors that behaviour for the OXC AST by recursively
/// walking statements and expressions inside nested bodies.
///
/// Reference: ExportedNames.ts `checkGlobalsForRunes` + `ImplicitStoreValues.getGlobals()`
///   `this.hasRunesGlobals = isSvelte5Plus && globals.some(g => runes.includes(g))`
pub(super) fn detect_rune_in_nested_body(
    stmts: &[oxc::Statement],
    declared_names: &HashSet<String>,
) -> bool {
    for stmt in stmts {
        if detect_rune_in_stmt(stmt, declared_names) {
            return true;
        }
    }
    false
}

/// Walk a single statement (and any nested sub-statements / expressions)
/// looking for an undeclared `$state`/`$derived`/`$effect` reference.
fn detect_rune_in_stmt(stmt: &oxc::Statement, declared_names: &HashSet<String>) -> bool {
    match stmt {
        oxc::Statement::ExpressionStatement(es) => {
            detect_rune_in_expr(&es.expression, declared_names)
        }
        oxc::Statement::VariableDeclaration(var_decl) => var_decl.declarations.iter().any(|d| {
            d.init.as_ref().is_some_and(|e| {
                // Same `is_rune` exclusion as the top-level pass: the canonical
                // `let stateX = $state(...)` form is not a runes-globals trigger,
                // but nested runes in the arguments still are.
                if let Some(call) = excluded_rune_init(e, &d.id) {
                    detect_rune_in_call_args(call, declared_names)
                } else {
                    detect_rune_in_expr(e, declared_names)
                }
            })
        }),
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
        oxc::Statement::ForStatement(for_stmt) => {
            for_stmt.init.as_ref().is_some_and(|init| match init {
                oxc::ForStatementInit::VariableDeclaration(vd) => vd.declarations.iter().any(|d| {
                    d.init
                        .as_ref()
                        .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                }),
                // ForStatementInit inherits Expression variants; use to_expression()
                // for all non-VariableDeclaration arms.
                _ => {
                    if let Some(e) = init.as_expression() {
                        detect_rune_in_expr(e, declared_names)
                    } else {
                        false
                    }
                }
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
                || t.handler
                    .as_ref()
                    .is_some_and(|h| detect_rune_in_nested_body(&h.body.body, declared_names))
                || t.finalizer
                    .as_ref()
                    .is_some_and(|f| detect_rune_in_nested_body(&f.body, declared_names))
        }
        oxc::Statement::SwitchStatement(s) => s.cases.iter().any(|c| {
            c.test
                .as_ref()
                .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                || detect_rune_in_nested_body(&c.consequent, declared_names)
        }),
        oxc::Statement::FunctionDeclaration(func) => func.body.as_ref().is_some_and(|body| {
            let scope = scope_with_params(declared_names, &func.params);
            detect_rune_in_nested_body(&body.statements, &scope)
        }),
        // A `class` nested in a function/block body — its method bodies and
        // field initializers can still reference rune globals (e.g.
        // `function bar() { class Foo { foo = $state(0) } }`). Mirror the
        // top-level ClassDeclaration scan.
        oxc::Statement::ClassDeclaration(class) => detect_rune_in_class_body(class, declared_names),
        _ => false,
    }
}

/// Scan a class body's method bodies and property initializers for rune globals.
pub(super) fn detect_rune_in_class_body(
    class: &oxc::Class,
    declared_names: &HashSet<String>,
) -> bool {
    class.body.body.iter().any(|member| match member {
        oxc::ClassElement::MethodDefinition(method) => method
            .value
            .body
            .as_ref()
            .is_some_and(|body| detect_rune_in_nested_body(&body.statements, declared_names)),
        oxc::ClassElement::PropertyDefinition(prop) => prop
            .value
            .as_ref()
            .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
        _ => false,
    })
}

/// Recursively detect an undeclared `$state`/`$derived`/`$effect` reference
/// (including member variants) anywhere inside the given expression tree.
/// Clone `base` and add a function's parameter names, so a `$state`/`$derived`/
/// `$effect` shadowed by a parameter (e.g. `function bar($derived) { $derived(x) }`)
/// is treated as a store-sub / call of the param, not a rune. Mirrors official's
/// scope-aware global resolution.
pub(super) fn scope_with_params(
    base: &HashSet<String>,
    params: &oxc::FormalParameters,
) -> HashSet<String> {
    let mut s = base.clone();
    let mut tmp: Vec<String> = Vec::new();
    for p in params.items.iter() {
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

pub(super) fn detect_rune_in_expr(
    expr: &oxc::Expression,
    declared_names: &HashSet<String>,
) -> bool {
    // Fast-path: check if this expression itself is a rune call.
    if detect_rune_global_call_expr(expr, declared_names) {
        return true;
    }
    match expr {
        oxc::Expression::CallExpression(call) => {
            // The callee might not be a rune but the arguments could contain rune calls.
            detect_rune_in_expr(&call.callee, declared_names)
                || call.arguments.iter().any(|arg| match arg {
                    oxc::Argument::SpreadElement(spread) => {
                        detect_rune_in_expr(&spread.argument, declared_names)
                    }
                    // Argument inherits Expression variants via `@inherit Expression`;
                    // use to_expression() (panics for SpreadElement, already handled above).
                    _ => detect_rune_in_expr(arg.to_expression(), declared_names),
                })
        }
        oxc::Expression::ArrowFunctionExpression(arrow) => {
            let scope = scope_with_params(declared_names, &arrow.params);
            detect_rune_in_nested_body(&arrow.body.statements, &scope)
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
        oxc::Expression::ObjectExpression(obj) => obj.properties.iter().any(|prop| match prop {
            oxc::ObjectPropertyKind::ObjectProperty(p) => {
                detect_rune_in_expr(&p.value, declared_names)
            }
            oxc::ObjectPropertyKind::SpreadProperty(spread) => {
                detect_rune_in_expr(&spread.argument, declared_names)
            }
        }),
        oxc::Expression::ArrayExpression(arr) => arr.elements.iter().any(|el| match el {
            oxc::ArrayExpressionElement::SpreadElement(spread) => {
                detect_rune_in_expr(&spread.argument, declared_names)
            }
            oxc::ArrayExpressionElement::Elision(_) => false,
            // ArrayExpressionElement inherits Expression variants via `@inherit Expression`;
            // use to_expression() for all non-SpreadElement, non-Elision arms.
            _ => detect_rune_in_expr(el.to_expression(), declared_names),
        }),
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
                || new_expr.arguments.iter().any(|arg| match arg {
                    oxc::Argument::SpreadElement(spread) => {
                        detect_rune_in_expr(&spread.argument, declared_names)
                    }
                    _ => detect_rune_in_expr(arg.to_expression(), declared_names),
                })
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
