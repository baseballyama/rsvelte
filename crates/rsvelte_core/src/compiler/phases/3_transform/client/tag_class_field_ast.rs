//! AST-based dev-mode signal tagging for class fields and
//! `this.field` / `this.#field` assignments.
//!
//! Extends the declarator pass (`tag_declarator_ast`) with the two
//! remaining shapes still handled by `wrap_state_derived_with_tag`'s
//! text scanner:
//!
//! 1. Class field declarations: `#field = $.state(...)` →
//!    `#field = $.tag($.state(...), 'ClassName.#field')`.
//!    For compiler-converted public fields (a getter+setter pair
//!    referencing `$.set(this.#field)` exists in the class body),
//!    the label drops the `#` to match the user-visible name.
//!
//! 2. `this.field = $.state(...)` assignments inside class methods
//!    (constructor, methods, getters/setters). Label uses the same
//!    originally-public heuristic. The text predecessor probed the
//!    *entire output* for setter / getter strings, which is fine
//!    here too since the heuristic is per-class.
//!
//! The text predecessor's idempotency check (rhs already begins with
//! `$.tag(`) is preserved naturally: this AST pass skips any init
//! whose callee is already `$.tag` / `$.tag_proxy`.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{GetSpan, SourceType, Span};

thread_local! {
    static CLASS_TAG_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based wrapper for class-field + `this.field` tagging.
/// Returns `None` if there's nothing to wrap (no class, no
/// tag-eligible callee, parse failure, or every match already
/// tagged).
pub fn wrap_state_derived_with_tag_class_fields_ast(source: &str) -> Option<String> {
    if memchr::memmem::find(source.as_bytes(), b"$.state").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$.derived").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$.proxy").is_none()
    {
        return None;
    }
    memchr::memmem::find(source.as_bytes(), b"class ")?;

    CLASS_TAG_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs())
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut replacements = Vec::new();
        for stmt in &parser_ret.program.body {
            walk_statement_for_classes(stmt, source, &mut replacements);
        }

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        replacements.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = source.to_string();
        for (start, end, rewrite) in &replacements {
            out.replace_range(*start as usize..*end as usize, rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

fn walk_statement_for_classes<'a>(
    stmt: &Statement<'a>,
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    match stmt {
        Statement::ClassDeclaration(class) => {
            handle_class(class, source, replacements);
        }
        Statement::ExportNamedDeclaration(e) => {
            if let Some(Declaration::ClassDeclaration(class)) = &e.declaration {
                handle_class(class, source, replacements);
            } else if let Some(Declaration::VariableDeclaration(vd)) = &e.declaration {
                for decl in &vd.declarations {
                    if let Some(init) = &decl.init {
                        walk_expression_for_classes(init, source, replacements);
                    }
                }
            }
        }
        Statement::ExportDefaultDeclaration(e) => {
            if let ExportDefaultDeclarationKind::ClassDeclaration(class) = &e.declaration {
                handle_class(class, source, replacements);
            } else if let Some(expr) = e.declaration.as_expression() {
                walk_expression_for_classes(expr, source, replacements);
            }
        }
        Statement::BlockStatement(b) => {
            for s in &b.body {
                walk_statement_for_classes(s, source, replacements);
            }
        }
        Statement::FunctionDeclaration(f) => {
            if let Some(body) = &f.body {
                for s in &body.statements {
                    walk_statement_for_classes(s, source, replacements);
                }
            }
        }
        Statement::IfStatement(s) => {
            walk_statement_for_classes(&s.consequent, source, replacements);
            if let Some(alt) = &s.alternate {
                walk_statement_for_classes(alt, source, replacements);
            }
        }
        Statement::ForStatement(s) => {
            walk_statement_for_classes(&s.body, source, replacements);
        }
        Statement::ForInStatement(s) => {
            walk_statement_for_classes(&s.body, source, replacements);
        }
        Statement::ForOfStatement(s) => {
            walk_statement_for_classes(&s.body, source, replacements);
        }
        Statement::WhileStatement(s) => {
            walk_statement_for_classes(&s.body, source, replacements);
        }
        Statement::DoWhileStatement(s) => {
            walk_statement_for_classes(&s.body, source, replacements);
        }
        Statement::TryStatement(s) => {
            for stmt in &s.block.body {
                walk_statement_for_classes(stmt, source, replacements);
            }
            if let Some(handler) = &s.handler {
                for stmt in &handler.body.body {
                    walk_statement_for_classes(stmt, source, replacements);
                }
            }
            if let Some(finalizer) = &s.finalizer {
                for stmt in &finalizer.body {
                    walk_statement_for_classes(stmt, source, replacements);
                }
            }
        }
        Statement::ExpressionStatement(es) => {
            walk_expression_for_classes(&es.expression, source, replacements);
        }
        Statement::VariableDeclaration(vd) => {
            for decl in &vd.declarations {
                if let Some(init) = &decl.init {
                    walk_expression_for_classes(init, source, replacements);
                }
            }
        }
        _ => {}
    }
}

fn walk_expression_for_classes<'a>(
    expr: &Expression<'a>,
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    match expr {
        Expression::ClassExpression(class) => {
            handle_class(class, source, replacements);
        }
        Expression::ParenthesizedExpression(p) => {
            walk_expression_for_classes(&p.expression, source, replacements);
        }
        Expression::AssignmentExpression(a) => {
            walk_expression_for_classes(&a.right, source, replacements);
        }
        Expression::SequenceExpression(s) => {
            for e in &s.expressions {
                walk_expression_for_classes(e, source, replacements);
            }
        }
        _ => {}
    }
}

fn handle_class<'a>(class: &Class<'a>, source: &str, replacements: &mut Vec<(u32, u32, String)>) {
    let class_name = class
        .id
        .as_ref()
        .map(|i| i.name.as_str())
        .unwrap_or("Unknown");

    let originally_public = compute_originally_public(class, source);

    for el in &class.body.body {
        match el {
            ClassElement::PropertyDefinition(prop) => {
                handle_property_definition(
                    prop,
                    class_name,
                    &originally_public,
                    source,
                    replacements,
                );
            }
            ClassElement::MethodDefinition(method) => {
                if let Some(body) = &method.value.body {
                    for stmt in &body.statements {
                        walk_method_stmt_for_this_assigns(
                            stmt,
                            class_name,
                            &originally_public,
                            source,
                            replacements,
                        );
                    }
                }
            }
            _ => {}
        }
    }
}

/// Compute the set of private field base-names (without `#`) that
/// look like compiler-converted public fields: i.e. a `set name(v)`
/// method exists whose body calls `$.set(this.#name, ...)`.
fn compute_originally_public<'a>(class: &Class<'a>, source: &str) -> Vec<String> {
    let mut result = Vec::new();
    for el in &class.body.body {
        let ClassElement::MethodDefinition(method) = el else {
            continue;
        };
        if method.kind != MethodDefinitionKind::Set {
            continue;
        }
        let PropertyKey::StaticIdentifier(setter_name) = &method.key else {
            continue;
        };
        let base_name = setter_name.name.as_str();
        let Some(body) = &method.value.body else {
            continue;
        };
        let body_text = &source[body.span.start as usize..body.span.end as usize];
        let needle = format!("$.set(this.#{}", base_name);
        if body_text.contains(&needle) {
            result.push(base_name.to_string());
        }
    }
    result
}

fn handle_property_definition<'a>(
    prop: &PropertyDefinition<'a>,
    class_name: &str,
    originally_public: &[String],
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    let PropertyKey::PrivateIdentifier(pid) = &prop.key else {
        return;
    };
    let Some(init) = &prop.value else {
        return;
    };
    let Some((tag_fn, init_span)) = classify_tag_target(init) else {
        return;
    };

    let field_name = pid.name.as_str();
    let label = if originally_public.iter().any(|s| s.as_str() == field_name) {
        format!("{}.{}", class_name, field_name)
    } else {
        format!("{}.#{}", class_name, field_name)
    };

    let init_text = &source[init_span.start as usize..init_span.end as usize];
    let rewrite = format!("{}({}, '{}')", tag_fn, init_text, label);
    replacements.push((init_span.start, init_span.end, rewrite));
}

fn walk_method_stmt_for_this_assigns<'a>(
    stmt: &Statement<'a>,
    class_name: &str,
    originally_public: &[String],
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    match stmt {
        Statement::ExpressionStatement(es) => {
            walk_method_expr_for_this_assigns(
                &es.expression,
                class_name,
                originally_public,
                source,
                replacements,
            );
        }
        Statement::BlockStatement(b) => {
            for s in &b.body {
                walk_method_stmt_for_this_assigns(
                    s,
                    class_name,
                    originally_public,
                    source,
                    replacements,
                );
            }
        }
        Statement::IfStatement(s) => {
            walk_method_stmt_for_this_assigns(
                &s.consequent,
                class_name,
                originally_public,
                source,
                replacements,
            );
            if let Some(alt) = &s.alternate {
                walk_method_stmt_for_this_assigns(
                    alt,
                    class_name,
                    originally_public,
                    source,
                    replacements,
                );
            }
        }
        Statement::ForStatement(s) => {
            walk_method_stmt_for_this_assigns(
                &s.body,
                class_name,
                originally_public,
                source,
                replacements,
            );
        }
        Statement::ForInStatement(s) => {
            walk_method_stmt_for_this_assigns(
                &s.body,
                class_name,
                originally_public,
                source,
                replacements,
            );
        }
        Statement::ForOfStatement(s) => {
            walk_method_stmt_for_this_assigns(
                &s.body,
                class_name,
                originally_public,
                source,
                replacements,
            );
        }
        Statement::WhileStatement(s) => {
            walk_method_stmt_for_this_assigns(
                &s.body,
                class_name,
                originally_public,
                source,
                replacements,
            );
        }
        Statement::DoWhileStatement(s) => {
            walk_method_stmt_for_this_assigns(
                &s.body,
                class_name,
                originally_public,
                source,
                replacements,
            );
        }
        Statement::TryStatement(s) => {
            for st in &s.block.body {
                walk_method_stmt_for_this_assigns(
                    st,
                    class_name,
                    originally_public,
                    source,
                    replacements,
                );
            }
            if let Some(handler) = &s.handler {
                for st in &handler.body.body {
                    walk_method_stmt_for_this_assigns(
                        st,
                        class_name,
                        originally_public,
                        source,
                        replacements,
                    );
                }
            }
            if let Some(finalizer) = &s.finalizer {
                for st in &finalizer.body {
                    walk_method_stmt_for_this_assigns(
                        st,
                        class_name,
                        originally_public,
                        source,
                        replacements,
                    );
                }
            }
        }
        _ => {}
    }
}

fn walk_method_expr_for_this_assigns<'a>(
    expr: &Expression<'a>,
    class_name: &str,
    originally_public: &[String],
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    if let Expression::AssignmentExpression(a) = expr {
        handle_this_assignment(a, class_name, originally_public, source, replacements);
        walk_method_expr_for_this_assigns(
            &a.right,
            class_name,
            originally_public,
            source,
            replacements,
        );
    } else if let Expression::SequenceExpression(s) = expr {
        for e in &s.expressions {
            walk_method_expr_for_this_assigns(
                e,
                class_name,
                originally_public,
                source,
                replacements,
            );
        }
    } else if let Expression::ParenthesizedExpression(p) = expr {
        walk_method_expr_for_this_assigns(
            &p.expression,
            class_name,
            originally_public,
            source,
            replacements,
        );
    }
}

fn handle_this_assignment<'a>(
    a: &AssignmentExpression<'a>,
    class_name: &str,
    originally_public: &[String],
    source: &str,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    if a.operator != oxc_syntax::operator::AssignmentOperator::Assign {
        return;
    }
    // Extract field name from `this.field` or `this.#field`.
    let field_name: String = match &a.left {
        AssignmentTarget::StaticMemberExpression(m) => {
            if !is_this(&m.object) {
                return;
            }
            m.property.name.to_string()
        }
        AssignmentTarget::PrivateFieldExpression(pf) => {
            if !is_this(&pf.object) {
                return;
            }
            format!("#{}", pf.field.name)
        }
        _ => return,
    };

    let Some((tag_fn, init_span)) = classify_tag_target(&a.right) else {
        return;
    };

    let label = if let Some(base_name) = field_name.strip_prefix('#') {
        if originally_public.iter().any(|s| s.as_str() == base_name) {
            format!("{}.{}", class_name, base_name)
        } else {
            format!("{}.{}", class_name, field_name)
        }
    } else {
        format!("{}.{}", class_name, field_name)
    };

    let init_text = &source[init_span.start as usize..init_span.end as usize];
    let rewrite = format!("{}({}, '{}')", tag_fn, init_text, label);
    replacements.push((init_span.start, init_span.end, rewrite));
}

fn is_this(expr: &Expression) -> bool {
    matches!(expr, Expression::ThisExpression(_))
}

/// Same shape as `tag_declarator_ast::classify_tag_target`.
fn classify_tag_target<'a>(init: &Expression<'a>) -> Option<(&'static str, Span)> {
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
    fn wraps_private_state_field() {
        let src = "class Counter { #count = $.state(0); }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert_eq!(
            out,
            "class Counter { #count = $.tag($.state(0), 'Counter.#count'); }"
        );
    }

    #[test]
    fn wraps_private_derived_field() {
        let src = "class C { #x = $.derived(() => 1); }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert_eq!(out, "class C { #x = $.tag($.derived(() => 1), 'C.#x'); }");
    }

    #[test]
    fn wraps_private_proxy_field_with_tag_proxy() {
        let src = "class C { #p = $.proxy({}); }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert_eq!(out, "class C { #p = $.tag_proxy($.proxy({}), 'C.#p'); }");
    }

    #[test]
    fn label_drops_hash_when_originally_public() {
        // Compiler-converted public field: paired setter calls
        // `$.set(this.#count, ...)`.
        let src = "class C { #count = $.state(0); get count() { return $.get(this.#count); } set count(v) { $.set(this.#count, v, true); } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("$.tag($.state(0), 'C.count')"));
        assert!(!out.contains("'C.#count'"));
    }

    #[test]
    fn this_private_assignment_wraps() {
        let src = "class C { constructor() { this.#count = $.state(0); } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("this.#count = $.tag($.state(0), 'C.#count')"));
    }

    #[test]
    fn this_public_assignment_wraps() {
        let src = "class C { constructor() { this.count = $.state(0); } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("this.count = $.tag($.state(0), 'C.count')"));
    }

    #[test]
    fn this_private_assign_drops_hash_when_originally_public() {
        // Constructor assignment + paired getter/setter.
        let src = "class C { constructor() { this.#count = $.state(0); } get count() { return $.get(this.#count); } set count(v) { $.set(this.#count, v, true); } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("this.#count = $.tag($.state(0), 'C.count')"));
    }

    #[test]
    fn skips_already_tagged() {
        let src = "class C { #x = $.tag($.state(0), 'C.#x'); }";
        assert!(wrap_state_derived_with_tag_class_fields_ast(src).is_none());
    }

    #[test]
    fn skips_already_tag_proxy() {
        let src = "class C { #p = $.tag_proxy($.proxy({}), 'C.#p'); }";
        assert!(wrap_state_derived_with_tag_class_fields_ast(src).is_none());
    }

    #[test]
    fn no_class_returns_none() {
        let src = "let x = $.state(0);";
        assert!(wrap_state_derived_with_tag_class_fields_ast(src).is_none());
    }

    #[test]
    fn anonymous_class_uses_unknown() {
        // Class expression with no id — label uses "Unknown".
        let src = "let C = class { #x = $.state(0); };";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("'Unknown.#x'"));
    }

    #[test]
    fn unrelated_callee_skipped() {
        let src = "class C { #x = $.snapshot(0); }";
        assert!(wrap_state_derived_with_tag_class_fields_ast(src).is_none());
    }

    #[test]
    fn public_class_field_no_tag() {
        // PUBLIC class field (no `#`) with a $.state init is NOT
        // tagged by this pass (it's not a private field). The text
        // predecessor only fired on private-prefix `#` in the class
        // body branch.
        let src = "class C { x = $.state(0); }";
        assert!(wrap_state_derived_with_tag_class_fields_ast(src).is_none());
    }

    #[test]
    fn nested_block_in_constructor() {
        let src = "class C { constructor() { if (cond) { this.#x = $.state(0); } } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("this.#x = $.tag($.state(0), 'C.#x')"));
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = "class C { #x = $.state(0); foo() { return 'class X { #y = $.state(0) }'; } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        // The real field gets wrapped:
        assert!(out.contains("$.tag($.state(0), 'C.#x')"));
        // The string-literal contents stay verbatim:
        assert!(out.contains("'class X { #y = $.state(0) }'"));
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            wrap_state_derived_with_tag_class_fields_ast("class C { #x = $.state( }").is_none()
        );
    }
}
