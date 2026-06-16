//! AST-based dev-mode signal tagging for module scripts
//! (`.svelte.js` / `.svelte.ts`).
//!
//! In dev mode, declarations of the form
//!
//! ```text
//! let X = $.state(...)
//! let X = $.derived(...)
//! let X = $.proxy(...)
//! let X = $.state($.proxy(...))
//! ```
//!
//! get wrapped with `$.tag(...)` / `$.tag_proxy(...)` so that
//! `$inspect.trace()` can surface the binding name to the user. The
//! result is e.g. `let X = $.tag($.state(...), 'X')`.
//!
//! Replaces the **declarator subset** of
//! `rune_transforms::wrap_state_derived_with_tag` (a ~370-line
//! char-by-char scanner). Class fields (`#field = ...`), `this.field
//! = ...` assignments, and a few related shapes are left for
//! follow-up PRs — this nibble covers `let` / `const` / `var`
//! declarators (including comma-separated declarators, which are
//! handled naturally by the AST visitor since they're still
//! `VariableDeclarator` nodes).
//!
//! The text predecessor walked backwards from each `$.state(`
//! occurrence to extract the binding name, then matched closing
//! parens via a brace tracker. Both heuristics were fragile under
//! string / template / regex contexts. The OXC parser knows about
//! all of those, and the binding name comes straight off the
//! `BindingIdentifier`.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_TAG_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based wrapper that tags `$.state(...)` / `$.derived(...)` /
/// `$.proxy(...)` declarator initialisers with their binding name.
/// Returns `None` if there's nothing to wrap (no match, parse
/// failure, or every match was already tagged).
pub fn wrap_state_derived_with_tag_declarators_ast(source: &str, is_ts: bool) -> Option<String> {
    // Fast probe — bail unless one of the three tag-eligible
    // callees appears anywhere.
    if memchr::memmem::find(source.as_bytes(), b"$.state").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$.derived").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$.proxy").is_none()
    {
        return None;
    }

    ast_rewrite::rewrite_once(
        &MODULE_TAG_ALLOC,
        source,
        if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        },
        ParseOptions::default(),
        false,
        |program| {
            let mut replacements: Vec<Edit> = Vec::new();
            for stmt in &program.body {
                walk_statement_for_declarators(stmt, source, &mut replacements);
            }
            replacements
        },
    )
}

/// Recursive top-down walk that finds VariableDeclarations anywhere
/// in the program (top-level, inside function bodies, inside blocks,
/// inside class methods, …) and emits replacements for their
/// tag-eligible declarators.
///
/// We don't reuse `oxc_ast_visit::Visit` here because we only need
/// `VariableDeclaration` and the recursion is shallow.
fn walk_statement_for_declarators<'a>(
    stmt: &Statement<'a>,
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    match stmt {
        Statement::VariableDeclaration(var_decl) => {
            handle_variable_declaration(var_decl, source, replacements);
        }
        Statement::BlockStatement(block) => {
            for s in &block.body {
                walk_statement_for_declarators(s, source, replacements);
            }
        }
        Statement::FunctionDeclaration(f) => {
            if let Some(body) = &f.body {
                for s in &body.statements {
                    walk_statement_for_declarators(s, source, replacements);
                }
            }
        }
        Statement::IfStatement(s) => {
            walk_statement_for_declarators(&s.consequent, source, replacements);
            if let Some(alt) = &s.alternate {
                walk_statement_for_declarators(alt, source, replacements);
            }
        }
        Statement::ForStatement(s) => {
            walk_statement_for_declarators(&s.body, source, replacements);
            // The init can be a VariableDeclaration too.
            if let Some(ForStatementInit::VariableDeclaration(var_decl)) = &s.init {
                handle_variable_declaration(var_decl, source, replacements);
            }
        }
        Statement::ForInStatement(s) => {
            walk_statement_for_declarators(&s.body, source, replacements);
        }
        Statement::ForOfStatement(s) => {
            walk_statement_for_declarators(&s.body, source, replacements);
        }
        Statement::WhileStatement(s) => {
            walk_statement_for_declarators(&s.body, source, replacements);
        }
        Statement::DoWhileStatement(s) => {
            walk_statement_for_declarators(&s.body, source, replacements);
        }
        Statement::TryStatement(s) => {
            for stmt in &s.block.body {
                walk_statement_for_declarators(stmt, source, replacements);
            }
            if let Some(handler) = &s.handler {
                for stmt in &handler.body.body {
                    walk_statement_for_declarators(stmt, source, replacements);
                }
            }
            if let Some(finalizer) = &s.finalizer {
                for stmt in &finalizer.body {
                    walk_statement_for_declarators(stmt, source, replacements);
                }
            }
        }
        // Class bodies contain method definitions; method bodies are
        // function bodies whose statements we walk just like
        // top-level. Property definitions / class fields are
        // intentionally not handled here — that's a follow-up PR.
        Statement::ClassDeclaration(_) => {}
        _ => {}
    }
}

fn handle_variable_declaration<'a>(
    var_decl: &VariableDeclaration<'a>,
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    for decl in &var_decl.declarations {
        // Only single-identifier bindings produce a clean name to
        // tag with. Destructuring patterns are passed through
        // untouched (matches the text predecessor — it couldn't
        // extract a single name there either).
        let BindingPattern::BindingIdentifier(id) = &decl.id else {
            continue;
        };
        let name = id.name.as_str();

        let Some(init) = &decl.init else {
            continue;
        };
        let Some((tag_fn, init_span)) = classify_tag_target(init) else {
            continue;
        };

        let init_text = &source[init_span.start as usize..init_span.end as usize];
        let rewrite = format!("{}({}, '{}')", tag_fn, init_text, name);
        replacements.push((init_span.start, init_span.end, rewrite));
    }
}

/// Classify an initializer expression into the tag-eligible bucket:
/// returns `Some(("$.tag", span))` for `$.state(...)` / `$.derived(...)`,
/// `Some(("$.tag_proxy", span))` for `$.proxy(...)`. Returns `None`
/// for anything else (including already-tagged inits — `$.tag(...)`
/// and `$.tag_proxy(...)` calls are *not* re-wrapped).
fn classify_tag_target<'a>(init: &Expression<'a>) -> Option<(&'static str, oxc_span::Span)> {
    let Expression::CallExpression(call) = init else {
        return None;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return None;
    };
    let Expression::Identifier(obj) = &member.object else {
        return None;
    };
    if obj.name != "$" {
        return None;
    }
    let prop = member.property.name.as_str();
    let tag_fn = match prop {
        // Already wrapped — skip so the fixed-point isn't necessary
        // and we don't double-tag in re-runs of the helper.
        "tag" | "tag_proxy" => return None,
        "state" | "derived" => "$.tag",
        "proxy" => "$.tag_proxy",
        _ => return None,
    };
    Some((tag_fn, call.span()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wraps_state_with_tag() {
        let out =
            wrap_state_derived_with_tag_declarators_ast("let x = $.state(0);", false).unwrap();
        assert_eq!(out, "let x = $.tag($.state(0), 'x');");
    }

    #[test]
    fn wraps_derived_with_tag() {
        let out = wrap_state_derived_with_tag_declarators_ast("let y = $.derived(() => 1);", false)
            .unwrap();
        assert_eq!(out, "let y = $.tag($.derived(() => 1), 'y');");
    }

    #[test]
    fn wraps_proxy_with_tag_proxy() {
        let out =
            wrap_state_derived_with_tag_declarators_ast("let p = $.proxy({a: 1});", false).unwrap();
        assert_eq!(out, "let p = $.tag_proxy($.proxy({a: 1}), 'p');");
    }

    #[test]
    fn wraps_state_proxy_combo_with_tag() {
        // $.state($.proxy(...)) — the OUTER call is $.state, so we
        // wrap with $.tag (not $.tag_proxy). Matches text version.
        let out =
            wrap_state_derived_with_tag_declarators_ast("let x = $.state($.proxy({a: 1}));", false)
                .unwrap();
        assert_eq!(out, "let x = $.tag($.state($.proxy({a: 1})), 'x');");
    }

    #[test]
    fn skips_already_tagged() {
        let src = "let x = $.tag($.state(0), 'x');";
        assert!(wrap_state_derived_with_tag_declarators_ast(src, false).is_none());
    }

    #[test]
    fn skips_already_tag_proxy() {
        let src = "let p = $.tag_proxy($.proxy({}), 'p');";
        assert!(wrap_state_derived_with_tag_declarators_ast(src, false).is_none());
    }

    #[test]
    fn handles_const_and_var() {
        let out =
            wrap_state_derived_with_tag_declarators_ast("const x = $.state(0);", false).unwrap();
        assert_eq!(out, "const x = $.tag($.state(0), 'x');");

        let out =
            wrap_state_derived_with_tag_declarators_ast("var x = $.state(0);", false).unwrap();
        assert_eq!(out, "var x = $.tag($.state(0), 'x');");
    }

    #[test]
    fn handles_comma_declarators() {
        // The second declarator should be tagged independently.
        let out =
            wrap_state_derived_with_tag_declarators_ast("let a = setup(), b = $.state(0);", false)
                .unwrap();
        assert_eq!(out, "let a = setup(), b = $.tag($.state(0), 'b');");
    }

    #[test]
    fn skips_destructuring() {
        // Destructuring patterns don't have a single name; leave
        // them untouched (mirrors the text predecessor).
        let src = "let { x } = obj;";
        assert!(wrap_state_derived_with_tag_declarators_ast(src, false).is_none());
    }

    #[test]
    fn skips_non_dollar_callee() {
        // `$.something_else(...)` — not in the tag-eligible set.
        let src = "let x = $.snapshot(obj);";
        assert!(wrap_state_derived_with_tag_declarators_ast(src, false).is_none());

        // Bare `state(...)` — not a `$.X` callee.
        let src = "let x = state(0);";
        assert!(wrap_state_derived_with_tag_declarators_ast(src, false).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "let x = $.state(0);";"#;
        assert!(wrap_state_derived_with_tag_declarators_ast(src, false).is_none());
    }

    #[test]
    fn handles_declarator_inside_function_body() {
        let src = "function f() { let x = $.state(0); }";
        let out = wrap_state_derived_with_tag_declarators_ast(src, false).unwrap();
        assert_eq!(out, "function f() { let x = $.tag($.state(0), 'x'); }");
    }

    #[test]
    fn handles_declarator_inside_block_in_function() {
        let src = "function f() { if (cond) { let x = $.state(0); } }";
        let out = wrap_state_derived_with_tag_declarators_ast(src, false).unwrap();
        assert_eq!(
            out,
            "function f() { if (cond) { let x = $.tag($.state(0), 'x'); } }"
        );
    }

    #[test]
    fn handles_declarator_inside_for_init() {
        let src = "for (let x = $.state(0); ; ) {}";
        let out = wrap_state_derived_with_tag_declarators_ast(src, false).unwrap();
        assert_eq!(out, "for (let x = $.tag($.state(0), 'x'); ; ) {}");
    }

    #[test]
    fn ts_source_works() {
        let src = "let x: number = $.state(0);";
        let out = wrap_state_derived_with_tag_declarators_ast(src, true).unwrap();
        assert_eq!(out, "let x: number = $.tag($.state(0), 'x');");
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(wrap_state_derived_with_tag_declarators_ast("let x = $.state(", false).is_none());
    }

    #[test]
    fn no_op_without_keyword() {
        assert!(wrap_state_derived_with_tag_declarators_ast("let x = 1;", false).is_none());
    }
}
