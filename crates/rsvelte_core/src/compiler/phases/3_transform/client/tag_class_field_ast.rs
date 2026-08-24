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
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType, Span};

use crate::compiler::phases::phase3_transform::shared::js_scan;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static CLASS_TAG_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based wrapper for class-field + `this.field` tagging.
/// Returns `None` if there's nothing to wrap (no class, no
/// tag-eligible callee, parse failure, or every match already
/// tagged).
/// Test-only entry point: with no original to consult, the label falls back to the
/// accessor-pair heuristic alone, which is what the cases below pin down.
#[cfg(test)]
fn wrap_state_derived_with_tag_class_fields_ast(source: &str) -> Option<String> {
    wrap_state_derived_with_tag_class_fields_ast_from(source, "")
}

/// `original` is the script as the user wrote it, before the class lowering. The
/// generated accessor pair over a public field is byte-identical to a hand-written
/// one over a private field, so only the original says which name the label takes.
pub fn wrap_state_derived_with_tag_class_fields_ast_from(
    source: &str,
    original: &str,
) -> Option<String> {
    if memchr::memmem::find(source.as_bytes(), b"$.state").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$.derived").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$.proxy").is_none()
    {
        return None;
    }
    // A prefilter for the AST rewrite below: `class\tK` is a class too, so the
    // needle is the keyword, never the keyword plus one ASCII space (#3470).
    if !js_scan::contains_identifier(source, "class") {
        return None;
    }

    ast_rewrite::rewrite_once(
        &CLASS_TAG_ALLOC,
        source,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        false,
        |program| {
            let ctx = ClassTagCtx {
                source,
                declared_private: collect_declared_private_fields(original),
            };
            let mut replacements: Vec<Edit> = Vec::new();
            for stmt in &program.body {
                walk_statement_for_classes(stmt, &ctx, &mut replacements);
            }
            replacements
        },
    )
}

struct ClassTagCtx<'s> {
    source: &'s str,
    /// `(class name, field name without the `#`)` for every private field the
    /// user wrote themselves.
    declared_private: rustc_hash::FxHashSet<(String, String)>,
}

/// Parse the pre-lowering script and record which `#field`s it declared. Best
/// effort: an unparseable original just leaves the accessor heuristic alone.
fn collect_declared_private_fields(original: &str) -> rustc_hash::FxHashSet<(String, String)> {
    let mut out = rustc_hash::FxHashSet::default();
    if memchr::memmem::find(original.as_bytes(), b"#").is_none() {
        return out;
    }
    let allocator = Allocator::default();
    for source_type in [SourceType::mjs(), SourceType::mjs().with_typescript(true)] {
        let ret = oxc_parser::Parser::new(&allocator, original, source_type)
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();
        if !ret.diagnostics.is_empty() {
            continue;
        }
        let mut collector = PrivateFieldCollector { out: &mut out };
        oxc_ast_visit::Visit::visit_program(&mut collector, &ret.program);
        break;
    }
    out
}

struct PrivateFieldCollector<'o> {
    out: &'o mut rustc_hash::FxHashSet<(String, String)>,
}

impl<'a> oxc_ast_visit::Visit<'a> for PrivateFieldCollector<'_> {
    fn visit_class(&mut self, class: &Class<'a>) {
        let class_name = class
            .id
            .as_ref()
            .map(|i| i.name.as_str())
            .unwrap_or("[class]");
        for el in &class.body.body {
            if let ClassElement::PropertyDefinition(prop) = el
                && let PropertyKey::PrivateIdentifier(id) = &prop.key
            {
                self.out
                    .insert((class_name.to_string(), id.name.to_string()));
            }
        }
        oxc_ast_visit::walk::walk_class(self, class);
    }
}

fn walk_statement_for_classes<'a>(
    stmt: &Statement<'a>,
    ctx: &ClassTagCtx<'_>,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    match stmt {
        Statement::ClassDeclaration(class) => {
            handle_class(class, ctx, replacements);
        }
        Statement::ExportDeclaration(e) => {
            if let Declaration::ClassDeclaration(class) = &e.declaration {
                handle_class(class, ctx, replacements);
            } else if let Declaration::VariableDeclaration(vd) = &e.declaration {
                for decl in &vd.declarations {
                    if let Some(init) = &decl.init {
                        walk_expression_for_classes(init, ctx, replacements);
                    }
                }
            }
        }
        Statement::ExportDefaultDeclaration(e) => {
            if let ExportDefaultDeclarationKind::ClassDeclaration(class) = &e.declaration {
                handle_class(class, ctx, replacements);
            } else if let Some(expr) = e.declaration.as_expression() {
                walk_expression_for_classes(expr, ctx, replacements);
            }
        }
        Statement::BlockStatement(b) => {
            for s in &b.body {
                walk_statement_for_classes(s, ctx, replacements);
            }
        }
        Statement::FunctionDeclaration(f) => {
            if let Some(body) = &f.body {
                for s in &body.statements {
                    walk_statement_for_classes(s, ctx, replacements);
                }
            }
        }
        Statement::IfStatement(s) => {
            walk_statement_for_classes(&s.consequent, ctx, replacements);
            if let Some(alt) = &s.alternate {
                walk_statement_for_classes(alt, ctx, replacements);
            }
        }
        Statement::ForStatement(s) => {
            walk_statement_for_classes(&s.body, ctx, replacements);
        }
        Statement::ForInStatement(s) => {
            walk_statement_for_classes(&s.body, ctx, replacements);
        }
        Statement::ForOfStatement(s) => {
            walk_statement_for_classes(&s.body, ctx, replacements);
        }
        Statement::WhileStatement(s) => {
            walk_statement_for_classes(&s.body, ctx, replacements);
        }
        Statement::DoWhileStatement(s) => {
            walk_statement_for_classes(&s.body, ctx, replacements);
        }
        Statement::TryStatement(s) => {
            for stmt in &s.block.body {
                walk_statement_for_classes(stmt, ctx, replacements);
            }
            if let Some(handler) = &s.handler {
                for stmt in &handler.body.body {
                    walk_statement_for_classes(stmt, ctx, replacements);
                }
            }
            if let Some(finalizer) = &s.finalizer {
                for stmt in &finalizer.body {
                    walk_statement_for_classes(stmt, ctx, replacements);
                }
            }
        }
        Statement::ExpressionStatement(es) => {
            walk_expression_for_classes(&es.expression, ctx, replacements);
        }
        Statement::VariableDeclaration(vd) => {
            for decl in &vd.declarations {
                if let Some(init) = &decl.init {
                    walk_expression_for_classes(init, ctx, replacements);
                }
            }
        }
        _ => {}
    }
}

fn walk_expression_for_classes<'a>(
    expr: &Expression<'a>,
    ctx: &ClassTagCtx<'_>,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    match expr {
        Expression::ClassExpression(class) => {
            handle_class(class, ctx, replacements);
        }
        Expression::ParenthesizedExpression(p) => {
            walk_expression_for_classes(&p.expression, ctx, replacements);
        }
        Expression::AssignmentExpression(a) => {
            walk_expression_for_classes(&a.right, ctx, replacements);
        }
        Expression::SequenceExpression(s) => {
            for e in &s.expressions {
                walk_expression_for_classes(e, ctx, replacements);
            }
        }
        _ => {}
    }
}

fn handle_class<'a>(
    class: &Class<'a>,
    ctx: &ClassTagCtx<'_>,
    replacements: &mut Vec<(u32, u32, String)>,
) {
    let source = ctx.source;
    // Upstream's fallback for a class with no id (`ClassBody.js:82`).
    let class_name = class
        .id
        .as_ref()
        .map(|i| i.name.as_str())
        .unwrap_or("[class]");

    let mut originally_public = compute_originally_public(class, source);
    originally_public.retain(|(backing, _)| {
        !ctx.declared_private
            .contains(&(class_name.to_string(), backing.clone()))
    });

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

/// Map each private backing field to the public name it was lowered from.
///
/// The label upstream prints is `get_name(definition.key)` on the **original**
/// key (`phases/nodes.js:157`), which this pass no longer has: a public
/// `count = $state()` is already `#_count` plus an accessor pair. The pair is
/// therefore matched back — the generated setter body is exactly
/// `$.set(this.#backing, value[, true])` — and its key supplies the name,
/// including the `String(value)` spelling of a literal key.
fn compute_originally_public<'a>(class: &Class<'a>, source: &str) -> Vec<(String, String)> {
    let mut result = Vec::new();
    for el in &class.body.body {
        let ClassElement::MethodDefinition(method) = el else {
            continue;
        };
        if method.kind != MethodDefinitionKind::Set {
            continue;
        }
        let Some(public_name) = property_key_name(&method.key) else {
            continue;
        };
        let Some(body) = &method.value.body else {
            continue;
        };
        let body_text = &source[body.span.start as usize..body.span.end as usize];
        if let Some(backing) = generated_setter_backing(body_text) {
            result.push((backing, public_name));
        }
    }
    result
}

/// `get_name(node)` from `phases/nodes.js`: a literal key prints as
/// `String(value)`, an identifier as its name.
fn property_key_name<'a>(key: &PropertyKey<'a>) -> Option<String> {
    match key {
        PropertyKey::StaticIdentifier(id) => Some(id.name.to_string()),
        PropertyKey::PrivateIdentifier(id) => Some(format!("#{}", id.name)),
        PropertyKey::NumericLiteral(lit) => Some(lit.raw.as_ref()?.to_string()),
        PropertyKey::StringLiteral(lit) => Some(lit.value.to_string()),
        _ => None,
    }
}

/// The backing field of a *generated* accessor: the body has to be exactly the
/// `$.set(this.#backing, value[, true])` statement `emit_class_field` writes, so
/// a hand-written setter over a genuinely private field keeps its `#` label.
fn generated_setter_backing(body_text: &str) -> Option<String> {
    let compact: String = body_text.split_whitespace().collect::<Vec<_>>().join(" ");
    let inner = compact
        .strip_prefix("{ $.set(this.#")?
        .strip_suffix("}")?
        .trim_end();
    let inner = inner.strip_suffix(';')?;
    let (backing, rest) = inner.split_once(',')?;
    if !matches!(rest.trim_end_matches(')').trim(), "value" | "value, true") {
        return None;
    }
    if backing.is_empty()
        || !backing
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
    {
        return None;
    }
    Some(backing.to_string())
}

fn handle_property_definition<'a>(
    prop: &PropertyDefinition<'a>,
    class_name: &str,
    originally_public: &[(String, String)],
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
    let label = match originally_public
        .iter()
        .find(|(backing, _)| backing == field_name)
    {
        Some((_, public_name)) => format!("{}.{}", class_name, public_name),
        None => format!("{}.#{}", class_name, field_name),
    };

    replacements.push(tag_edit(
        source,
        prop.span().start,
        prop.key.span().end,
        init_span,
        tag_fn,
        &label,
    ));
}

/// The `$.tag(...)` wrap for one value. A comment between the `=` and the value
/// moves inside the call, and the call is reflowed only when that region spans a
/// line: esrap keeps a one-line comment inline, but a `//` comment placed inline
/// would swallow the rest of the call.
fn tag_edit(
    source: &str,
    stmt_start: u32,
    lhs_end: u32,
    init_span: Span,
    tag_fn: &str,
    label: &str,
) -> Edit {
    let init_text = &source[init_span.start as usize..init_span.end as usize];
    let flat = (
        init_span.start,
        init_span.end,
        format!("{}({}, '{}')", tag_fn, init_text, label),
    );
    let Some(eq) = assignment_eq_offset(source, lhs_end, init_span.start) else {
        return flat;
    };
    let separator = &source[eq as usize + 1..init_span.start as usize];
    let comment = separator.trim();
    if comment.is_empty() {
        return flat;
    }
    if !separator.contains('\n') {
        return (
            eq + 1,
            init_span.end,
            format!(" {tag_fn}({comment} {init_text}, '{label}')"),
        );
    }

    let indent = line_indent(source, stmt_start);
    let arg_indent = format!("{}\t", indent);
    let comment = comment
        .lines()
        .map(str::trim)
        .collect::<Vec<_>>()
        .join(&format!("\n{}", arg_indent));
    // The value moves one level deeper, so its own continuation lines follow.
    let init_text = init_text.replace('\n', "\n\t");
    (
        eq + 1,
        init_span.end,
        format!(
            " {tag_fn}(\n{arg_indent}{comment}\n{arg_indent}{init_text},\n{arg_indent}'{label}'\n{indent})"
        ),
    )
}

/// Offset of the `=` separating a field / assignment target from its value,
/// skipping comments so an `=` inside one is not mistaken for it.
fn assignment_eq_offset(source: &str, from: u32, to: u32) -> Option<u32> {
    let bytes = source.as_bytes();
    let end = to as usize;
    let mut i = from as usize;
    while i < end {
        match bytes[i] {
            b'/' if bytes.get(i + 1) == Some(&b'/') => {
                while i < end && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i < end && !(bytes[i] == b'*' && bytes.get(i + 1) == Some(&b'/')) {
                    i += 1;
                }
                i += 2;
            }
            b'=' => return Some(i as u32),
            _ => i += 1,
        }
    }
    None
}

fn line_indent(source: &str, pos: u32) -> &str {
    let line_start = source[..pos as usize].rfind('\n').map_or(0, |i| i + 1);
    let line = &source[line_start..];
    let width = line.len() - line.trim_start_matches([' ', '\t']).len();
    &line[..width]
}

fn walk_method_stmt_for_this_assigns<'a>(
    stmt: &Statement<'a>,
    class_name: &str,
    originally_public: &[(String, String)],
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
    originally_public: &[(String, String)],
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
    originally_public: &[(String, String)],
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

    let label = match field_name.strip_prefix('#').and_then(|backing| {
        originally_public
            .iter()
            .find(|(name, _)| name == backing)
            .map(|(_, public_name)| public_name)
    }) {
        Some(public_name) => format!("{}.{}", class_name, public_name),
        None => format!("{}.{}", class_name, field_name),
    };

    replacements.push(tag_edit(
        source,
        a.span().start,
        a.left.span().end,
        init_span,
        tag_fn,
        &label,
    ));
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
    fn reflows_a_field_whose_value_carries_a_comment() {
        let src = "class C {\n\t#n = // c\n\t$.state(0);\n}";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert_eq!(
            out,
            "class C {\n\t#n = $.tag(\n\t\t// c\n\t\t$.state(0),\n\t\t'C.#n'\n\t);\n}"
        );
    }

    #[test]
    fn reflows_a_this_assignment_whose_value_carries_a_comment() {
        let src =
            "class C {\n\t#n;\n\tconstructor() {\n\t\tthis.#n = // c\n\t\t$.state(0);\n\t}\n}";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(
            out.contains("this.#n = $.tag(\n\t\t\t// c\n\t\t\t$.state(0),\n\t\t\t'C.#n'\n\t\t);"),
            "got: {out}"
        );
    }

    #[test]
    fn keeps_a_field_on_one_line_without_a_comment() {
        let src = "class C {\n\t#n = $.state(0);\n}";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert_eq!(out, "class C {\n\t#n = $.tag($.state(0), 'C.#n');\n}");
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
        // Compiler-converted public field: the generated setter body is exactly
        // `$.set(this.#count, value, true)`.
        let src = "class C { #count = $.state(0); get count() { return $.get(this.#count); } set count(value) { $.set(this.#count, value, true); } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("$.tag($.state(0), 'C.count')"));
        assert!(!out.contains("'C.#count'"));
    }

    #[test]
    fn label_keeps_hash_for_a_hand_written_accessor_over_a_private_field() {
        // `set count(val) { this.#count = val }` lowers to a setter whose body
        // is NOT the generated one, so `#count` was written as private.
        let src = "class C { #count = $.state(0); get count() { return $.get(this.#count); } set count(val) { $.set(this.#count, val, true); } }";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("$.tag($.state(0), 'C.#count')"), "got: {out}");
    }

    #[test]
    fn the_original_settles_a_hand_written_accessor_the_heuristic_cannot() {
        // Both spellings lower to the same text; only the original says which is which.
        let generated = "class C { #count = $.state(0); get count() { return $.get(this.#count); } set count(value) { $.set(this.#count, value, true); } }";
        let from_public = wrap_state_derived_with_tag_class_fields_ast_from(
            generated,
            "class C { count = $state(0); }",
        )
        .unwrap();
        assert!(from_public.contains("'C.count'"), "got: {from_public}");

        let from_private = wrap_state_derived_with_tag_class_fields_ast_from(
            generated,
            "class C { #count = $state(0); get count() { return this.#count; } set count(value) { this.#count = value; } }",
        )
        .unwrap();
        assert!(from_private.contains("'C.#count'"), "got: {from_private}");
    }

    #[test]
    fn an_unparseable_original_leaves_the_heuristic_alone() {
        let generated = "class C { #count = $.state(0); get count() { return $.get(this.#count); } set count(value) { $.set(this.#count, value, true); } }";
        let out =
            wrap_state_derived_with_tag_class_fields_ast_from(generated, "class C { #count =")
                .unwrap();
        assert!(out.contains("'C.count'"), "got: {out}");
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
        let src = "class C { constructor() { this.#count = $.state(0); } get count() { return $.get(this.#count); } set count(value) { $.set(this.#count, value, true); } }";
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
    fn anonymous_class_uses_the_upstream_placeholder() {
        let src = "let C = class { #x = $.state(0); };";
        let out = wrap_state_derived_with_tag_class_fields_ast(src).unwrap();
        assert!(out.contains("'[class].#x'"), "got: {out}");
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
