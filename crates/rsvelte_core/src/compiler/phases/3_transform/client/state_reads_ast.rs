//! AST-based rewrite of state-var reads to `$.get(state_var)`.
//!
//! Covers `expression_utils::transform_state_in_expr` (~600 LOC
//! char-by-char scanner). The text predecessor tracks string /
//! template / comment state and applies a dozen guard predicates
//! (`preceded_by_dot`, `preceded_by_hash`, `already_wrapped`,
//! `in_set_first_arg`, `in_update_arg`, `in_update_pre_arg`,
//! `in_mutate_first_arg`, `in_param_position`,
//! `is_assignment_target`, `is_getter_setter_name`,
//! `is_property_key`, `is_shorthand_property`, three different
//! `is_shadowed_*` checks).
//!
//! `oxc_semantic` (via `scope_analysis::is_locally_shadowed`)
//! replaces the three shadow checks precisely. Most other guards
//! are natural in the AST visitor (property side of a static
//! member isn't an IdentifierReference; PropertyKey isn't; etc.).
//! The `$.set(` / `$.update(` / `$.update_pre(` / `$.mutate(`
//! first-arg / `$.get(` / `$.safe_get(` already-wrapped checks
//! are handled via parent-context tracking on
//! `visit_call_expression`.
//!
//! ## Mapping (preserved exactly vs text version)
//!
//! | Source              | Replacement     | Notes                                       |
//! |---------------------|-----------------|---------------------------------------------|
//! | `count`             | `$.get(count)`  | bare read (top-level / unshadowed)          |
//! | `count + 1`         | `$.get(count) + 1` | inside an expression                   |
//! | `obj.count`         | unchanged       | property side never visited                 |
//! | `{ count: 1 }`      | unchanged       | property key never visited                  |
//! | `{ count }`         | unchanged       | shorthand SKIPPED (matches text version)    |
//! | `count = 5`         | unchanged       | LHS skipped (downstream wraps assignment)   |
//! | `count++`           | unchanged       | UpdateExpression arg skipped                |
//! | `function f(count) { count }` | unchanged | function param shadow                  |
//! | `let count; count`  | unchanged       | local-decl shadow (inner) / wrap (root)     |
//! | `$.get(count)`      | unchanged       | already wrapped                             |
//! | `$.set(count, …)`   | unchanged       | first arg of $.set                          |
//! | `$.update(count)`   | unchanged       | first arg of $.update                       |
//! | `$.update_pre(count)` | unchanged     | first arg of $.update_pre                   |
//! | `$.mutate(count, …)` | unchanged      | first arg of $.mutate                       |
//!
//! `non_reactive_vars` filters out names that should NOT be
//! wrapped (e.g. legacy let bindings flagged non-reactive). Names
//! in this list are treated as if not in `state_vars`.
//!
//! ## Return shape
//!
//! Returns `Some(rewritten)` when at least one read was wrapped.
//! Returns `None` if `state_vars` is empty (or fully filtered),
//! no state-var substring appears, the source fails to parse, or
//! nothing matched. Callers fall back to the text predecessor on
//! `None`.
//!
//! ## Idempotency
//!
//! After wrap, the IdentifierReference becomes the first arg of a
//! `$.get(...)` CallExpression. `visit_call_expression` skip
//! detection ensures the visitor doesn't re-wrap. The text
//! predecessor's `chars_match("$.get(")` already-wrapped guard
//! also no-ops on AST output.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use oxc_syntax::symbol::SymbolId;
use rustc_hash::FxHashSet;

use super::scope_analysis::{find_state_var_symbols, is_state_var_reference_or_unresolved};

thread_local! {
    static STATE_READS_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Returns true if `s` contains a `;` at brace-depth zero (i.e.
/// outside any `{...}`, `[...]`, `(...)` and string / template
/// contents). Used to distinguish a statement-block body
/// `{ a; b; }` from an object literal `{ a: 1, b: 2 }`.
fn contains_top_level_semicolon(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut depth: i32 = 0;
    let mut in_string: Option<u8> = None;
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];
        if let Some(q) = in_string {
            if c == b'\\' && i + 1 < bytes.len() {
                i += 2;
                continue;
            }
            if c == q {
                in_string = None;
            }
            i += 1;
            continue;
        }
        match c {
            b'"' | b'\'' | b'`' => in_string = Some(c),
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b';' if depth <= 1 => {
                // depth==1 means we're INSIDE the outer `{...}` —
                // a `;` at this depth is a statement separator
                // inside the block. depth==0 only happens if `s`
                // doesn't start with `{`, but we still treat that
                // as top-level too.
                return true;
            }
            _ => {}
        }
        i += 1;
    }
    false
}

/// True when a `{...}` string is a STATEMENT BLOCK rather than an object
/// literal, detected by its first inner token being a statement keyword in
/// statement position — i.e. NOT immediately followed by `:` (which would make
/// it an object-literal key like `{ if: 1 }`). Catches single-statement blocks
/// such as `{ if (x) { y(); } }` whose only `;` is nested, so
/// `contains_top_level_semicolon` misses it and the block would otherwise be
/// mis-wrapped in `(...)` as an object literal and fail to parse.
fn inner_is_block_statement(s: &str) -> bool {
    let Some(inner) = s.trim().strip_prefix('{') else {
        return false;
    };
    let inner = inner.trim_start();
    // A nested block `{ { … } }` or an empty statement `{ ; }` is a block.
    if inner.starts_with('{') || inner.starts_with(';') {
        return true;
    }
    const KEYWORDS: &[&str] = &[
        "if", "for", "while", "do", "switch", "try", "return", "throw", "break", "continue",
        "const", "let", "var", "function", "class", "debugger", "with",
    ];
    for kw in KEYWORDS {
        if let Some(rest) = inner.strip_prefix(kw) {
            // Word boundary after the keyword (so `letter` isn't matched as `let`).
            let boundary = rest
                .chars()
                .next()
                .is_none_or(|c| !c.is_alphanumeric() && c != '_' && c != '$');
            // Not an object key (`kw:`).
            if boundary && !rest.trim_start().starts_with(':') {
                return true;
            }
        }
    }
    false
}

/// AST-based rewrite of state-var reads to `$.get(...)`. See
/// module docs for the precise contract.
pub fn transform_state_reads_ast(
    source: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }
    // Pre-filter: anything in non_reactive_vars is excluded.
    let effective: Vec<&str> = state_vars
        .iter()
        .filter(|v| !non_reactive_vars.iter().any(|n| n == *v))
        .map(|v| v.as_str())
        .collect();
    if effective.is_empty() {
        return None;
    }
    // Fast probe — bail unless at least one effective state-var
    // substring appears.
    if !effective
        .iter()
        .any(|v| memchr::memmem::find(source.as_bytes(), v.as_bytes()).is_some())
    {
        return None;
    }
    // Bare-object-literal handling: input starting with `{` AND
    // matching closing `}` (a single expression, not a statement
    // block) parses as a `BlockStatement` (shorthand invisible).
    // Wrap with `(...)` to force expression context and adjust
    // span offsets when applying replacements.
    //
    // We distinguish from a statement block (e.g. an arrow-callback
    // body `{ $.set(...); if (...) {...} }`) by checking that the
    // input has no top-level `;` — block bodies contain statements
    // separated by `;`, object literals don't.
    let trimmed = source.trim();
    let needs_paren_wrap = trimmed.starts_with('{')
        && trimmed.ends_with('}')
        && !contains_top_level_semicolon(trimmed)
        && !inner_is_block_statement(trimmed);
    let leading_ws = source.len() - source.trim_start().len();
    let parse_source: std::borrow::Cow<str> = if needs_paren_wrap {
        let trimmed_start = &source[leading_ws..];
        let trailing_ws = trimmed_start.len() - trimmed_start.trim_end().len();
        let core = &trimmed_start[..trimmed_start.len() - trailing_ws];
        std::borrow::Cow::Owned(format!(
            "{}({}){}",
            &source[..leading_ws],
            core,
            &source[source.len() - trailing_ws..]
        ))
    } else {
        std::borrow::Cow::Borrowed(source)
    };
    let span_offset: i32 = if needs_paren_wrap { 1 } else { 0 };

    STATE_READS_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, &parse_source, SourceType::mjs())
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }
        let program: &Program = allocator.alloc(parser_ret.program);
        let semantic_ret = SemanticBuilder::new().build(program);
        let semantic = &semantic_ret.semantic;
        let effective_names: Vec<String> = effective.iter().map(|s| s.to_string()).collect();
        let state_var_symbols = find_state_var_symbols(semantic, &effective_names);

        let mut collector = StateReadsCollector {
            semantic,
            effective: &effective,
            effective_names: &effective_names,
            state_var_symbols,
            replacements: Vec::new(),
            skip_spans: FxHashSet::default(),
        };
        collector.visit_program(program);

        let mut replacements = collector.replacements;
        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        replacements.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = source.to_string();
        for (start, end, rewrite) in &replacements {
            let s = (*start as i32 - span_offset) as usize;
            let e = (*end as i32 - span_offset) as usize;
            out.replace_range(s..e, rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct StateReadsCollector<'a, 'sem> {
    semantic: &'sem Semantic<'sem>,
    effective: &'a [&'a str],
    effective_names: &'a [String],
    state_var_symbols: FxHashSet<SymbolId>,
    replacements: Vec<(u32, u32, String)>,
    /// Spans of identifier references claimed by a parent-context
    /// handler (assignment LHS, update target, first arg of $.set
    /// / $.update / $.update_pre / $.mutate, shorthand-property
    /// value position).
    skip_spans: FxHashSet<u32>,
}

impl<'a, 'sem> StateReadsCollector<'a, 'sem> {
    fn is_effective(&self, name: &str) -> bool {
        self.effective.contains(&name)
    }

    fn skip(&mut self, ident: &IdentifierReference) {
        self.skip_spans.insert(ident.span.start);
    }
}

impl<'a, 'sem, 'ast> Visit<'ast> for StateReadsCollector<'a, 'sem> {
    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        if self.skip_spans.contains(&ident.span.start) {
            return;
        }
        let name = ident.name.as_str();
        if !self.is_effective(name) {
            return;
        }
        if !is_state_var_reference_or_unresolved(
            self.semantic,
            ident,
            &self.state_var_symbols,
            self.effective_names,
        ) {
            return;
        }
        self.replacements
            .push((ident.span.start, ident.span.end, format!("$.get({})", name)));
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        // LHS identifier: handled by the assignment-rewrite passes
        // (`transform_state_assignments` family). Don't wrap the
        // bare-identifier read at the LHS position.
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left {
            self.skip(id);
        }
        // For member targets like `obj.x = 1`, the `obj`
        // identifier IS a read that should be wrapped (if obj is a
        // state var). Member-mutation downstream wraps the
        // mutation site; the obj READ at the LHS still needs
        // `$.get(obj)` so that the member access works on the
        // unwrapped object. We DON'T skip those.
        walk::walk_assignment_expression(self, expr);
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        // `count++` / `++count` — the `count` here is an
        // UpdateExpression target, handled by
        // `transform_state_update_assigns_ast`. Don't wrap.
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument {
            self.skip_spans.insert(id.span.start);
        }
        walk::walk_update_expression(self, expr);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // First-arg skip for `$.set(x, …)`, `$.update(x, …)`,
        // `$.update_pre(x, …)`, `$.mutate(x, …)` — those are the
        // *targets* of already-AST-emitted wraps. Also for
        // `$.get(x)` and `$.safe_get(x)` — already wrapped.
        if let Expression::StaticMemberExpression(member) = &call.callee
            && let Expression::Identifier(obj) = &member.object
            && obj.name == "$"
        {
            let prop = member.property.name.as_str();
            let skip_first_arg = matches!(
                prop,
                "set" | "update" | "update_pre" | "mutate" | "get" | "safe_get"
            );
            if skip_first_arg && let Some(Argument::Identifier(id)) = call.arguments.first() {
                self.skip(id);
            }
        }
        walk::walk_call_expression(self, call);
    }

    fn visit_object_property(&mut self, prop: &ObjectProperty<'ast>) {
        // Shorthand property `{ count }` — text version EXPANDS
        // this to `{ count: $.get(count) }`. Emitting just
        // `{ $.get(count) }` would be invalid JS, so we replace
        // the whole ObjectProperty span and skip the inner
        // identifier from re-wrapping.
        let shorthand_eligible = prop.shorthand
            && matches!(&prop.key, PropertyKey::StaticIdentifier(k) if self.is_effective(&k.name));
        if shorthand_eligible
            && let PropertyKey::StaticIdentifier(key) = &prop.key
            && let Expression::Identifier(value_ident) = &prop.value
            && is_state_var_reference_or_unresolved(
                self.semantic,
                value_ident,
                &self.state_var_symbols,
                self.effective_names,
            )
        {
            let name = key.name.as_str();
            self.replacements.push((
                prop.span.start,
                prop.span.end,
                format!("{}: $.get({})", name, name),
            ));
            self.skip(value_ident);
            // Still descend into method-body etc.
            walk::walk_object_property(self, prop);
            return;
        }
        walk::walk_object_property(self, prop);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn wraps_bare_read() {
        let out = transform_state_reads_ast("count;", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "$.get(count);");
    }

    #[test]
    fn wraps_in_expression() {
        let out = transform_state_reads_ast("let x = count + 1;", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "let x = $.get(count) + 1;");
    }

    #[test]
    fn skips_member_property_position() {
        // `obj.count` — `count` is a property name, not a reference.
        assert!(transform_state_reads_ast("obj.count;", &ssv(&["count"]), &[]).is_none());
    }

    #[test]
    fn wraps_member_object_base() {
        // `count.x` — `count` IS a reference (the object); should
        // wrap.
        let out = transform_state_reads_ast("let x = count.foo;", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "let x = $.get(count).foo;");
    }

    #[test]
    fn skips_assignment_lhs() {
        // `count = 5` — LHS skipped (downstream wraps assignment).
        assert!(transform_state_reads_ast("count = 5;", &ssv(&["count"]), &[]).is_none());
    }

    #[test]
    fn wraps_assignment_rhs() {
        // `x = count` — `count` on RHS IS a read.
        let out = transform_state_reads_ast("x = count;", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "x = $.get(count);");
    }

    #[test]
    fn skips_update_expression_target() {
        // `count++` / `++count` — UpdateExpression target.
        assert!(transform_state_reads_ast("count++;", &ssv(&["count"]), &[]).is_none());
        assert!(transform_state_reads_ast("++count;", &ssv(&["count"]), &[]).is_none());
    }

    #[test]
    fn skips_function_param_shadow() {
        assert!(
            transform_state_reads_ast(
                "let count; function f(count) { return count; }",
                &ssv(&["count"]),
                &[]
            )
            .is_none()
        );
    }

    #[test]
    fn skips_arrow_param_shadow() {
        assert!(
            transform_state_reads_ast(
                "let count; const f = (count) => count;",
                &ssv(&["count"]),
                &[]
            )
            .is_none()
        );
    }

    #[test]
    fn skips_for_loop_var_shadow() {
        assert!(
            transform_state_reads_ast(
                "let count; for (let count of items) { count; }",
                &ssv(&["count"]),
                &[]
            )
            .is_none()
        );
    }

    #[test]
    fn skips_nested_let_shadow() {
        let out = transform_state_reads_ast(
            "let count; count; { let count = 0; count; } count;",
            &ssv(&["count"]),
            &[],
        )
        .unwrap();
        // Outer two refs wrapped, inner shadowed.
        assert!(out.contains("$.get(count); { let count = 0; count; } $.get(count);"));
    }

    #[test]
    fn skips_already_wrapped() {
        // `$.get(count)` — `count` in first-arg position is
        // skipped to avoid double-wrap.
        assert!(transform_state_reads_ast("$.get(count);", &ssv(&["count"]), &[]).is_none());
        assert!(transform_state_reads_ast("$.safe_get(count);", &ssv(&["count"]), &[]).is_none());
    }

    #[test]
    fn skips_inside_set_first_arg() {
        // `$.set(count, 5)` — count is the assignment target.
        let out = transform_state_reads_ast("$.set(count, 5);", &ssv(&["count"]), &[])
            .unwrap_or_default();
        // `count` first-arg skipped; literal `5` has no state ref.
        // → no replacements at all.
        assert_eq!(out, "");
    }

    #[test]
    fn wraps_inside_set_second_arg() {
        // `$.set(other, count)` — count in 2nd arg position is a
        // read.
        let out = transform_state_reads_ast("$.set(other, count);", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "$.set(other, $.get(count));");
    }

    #[test]
    fn skips_inside_update_first_arg() {
        let out = transform_state_reads_ast("$.update(count);", &ssv(&["count"]), &[])
            .unwrap_or_default();
        assert_eq!(out, "");
    }

    #[test]
    fn skips_inside_update_pre_first_arg() {
        let out = transform_state_reads_ast("$.update_pre(count);", &ssv(&["count"]), &[])
            .unwrap_or_default();
        assert_eq!(out, "");
    }

    #[test]
    fn skips_inside_mutate_first_arg() {
        let out = transform_state_reads_ast("$.mutate(count, x);", &ssv(&["count"]), &[])
            .unwrap_or_default();
        assert_eq!(out, "");
    }

    #[test]
    fn wraps_inside_mutate_second_arg() {
        let out =
            transform_state_reads_ast("$.mutate(other, count);", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "$.mutate(other, $.get(count));");
    }

    #[test]
    fn skips_property_key_position() {
        assert!(
            transform_state_reads_ast("let x = { count: 1 };", &ssv(&["count"]), &[]).is_none()
        );
    }

    #[test]
    fn bare_object_literal_input_handled_via_paren_wrap() {
        // Input starting with `{` is parsed as a parenthesized
        // expression by wrapping with `(...)`. Spans get offset
        // by 1 when applying replacements.
        let out =
            transform_state_reads_ast("{ checked: show, count }", &ssv(&["show", "count"]), &[])
                .unwrap();
        assert_eq!(out, "{ checked: $.get(show), count: $.get(count) }");
    }

    #[test]
    fn shorthand_property_expands() {
        // Text version EXPANDS `{ count }` to
        // `{ count: $.get(count) }`. AST helper follows suit.
        let out = transform_state_reads_ast("let x = { count };", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "let x = { count: $.get(count) };");
    }

    #[test]
    fn shorthand_with_other_props() {
        let out =
            transform_state_reads_ast("let x = { a: 1, count, b: 2 };", &ssv(&["count"]), &[])
                .unwrap();
        assert_eq!(out, "let x = { a: 1, count: $.get(count), b: 2 };");
    }

    #[test]
    fn skips_getter_setter_name_position() {
        // `get count() { … }` — name is a method name, not a ref.
        let src = "class C { get count() { return 1; } }";
        assert!(transform_state_reads_ast(src, &ssv(&["count"]), &[]).is_none());
    }

    #[test]
    fn skips_inside_string_literal() {
        let src = r#"let s = "count + 1";"#;
        assert!(transform_state_reads_ast(src, &ssv(&["count"]), &[]).is_none());
    }

    #[test]
    fn wraps_inside_template_expression() {
        let src = "let s = `value: ${count}`;";
        let out = transform_state_reads_ast(src, &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "let s = `value: ${$.get(count)}`;");
    }

    #[test]
    fn non_reactive_var_excluded() {
        // `count` is in state_vars but also in non_reactive_vars
        // → effective set is empty → no wrap.
        assert!(transform_state_reads_ast("count;", &ssv(&["count"]), &ssv(&["count"])).is_none());
    }

    #[test]
    fn handles_multiple_state_vars() {
        let out =
            transform_state_reads_ast("let x = a + b * c;", &ssv(&["a", "b", "c"]), &[]).unwrap();
        assert_eq!(out, "let x = $.get(a) + $.get(b) * $.get(c);");
    }

    #[test]
    fn skips_var_not_in_state_vars() {
        assert!(transform_state_reads_ast("y;", &ssv(&["x"]), &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_state_reads_ast("function f( {", &ssv(&["count"]), &[]).is_none());
    }

    #[test]
    fn empty_state_vars_returns_none() {
        assert!(transform_state_reads_ast("count;", &[], &[]).is_none());
    }

    #[test]
    fn rest_spread_wraps() {
        // `f(...count)` — `count` is an argument, gets wrapped.
        let out = transform_state_reads_ast("f(...count);", &ssv(&["count"]), &[]).unwrap();
        assert_eq!(out, "f(...$.get(count));");
    }

    #[test]
    fn complex_smoke() {
        // Multiple state-var cases in one snippet. Need an outer
        // `let count` so symbol-identity matching has an outermost
        // binding.
        let src = r#"
            let count;
            let r = count + 1;
            function inner(count) { return count + 1; }
            $.set(count, 5);
            $.update(count);
            let o = { count };
            obj.count = 5;
            count.x;
        "#;
        let out = transform_state_reads_ast(src, &ssv(&["count"]), &[]).unwrap();
        // Outer let: wrap.
        assert!(out.contains("let r = $.get(count) + 1;"));
        // Inner function: shadow, skip both refs.
        assert!(out.contains("function inner(count) { return count + 1; }"));
        // $.set / $.update first arg: skip.
        assert!(out.contains("$.set(count, 5);"));
        assert!(out.contains("$.update(count);"));
        // Shorthand: expanded.
        assert!(out.contains("let o = { count: $.get(count) };"));
        // Property key in member assign: not a ref, untouched.
        assert!(out.contains("obj.count = 5;"));
        // Member base read: wrap.
        assert!(out.contains("$.get(count).x;"));
    }
}
