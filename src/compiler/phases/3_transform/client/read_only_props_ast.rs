//! AST-based rewrite of read-only prop references —
//! `localName` → `$$props.propName` (or `$$props['propName']` for
//! non-identifier prop names).
//!
//! Replaces the regex-based scan in
//! `props_transforms::transform_read_only_props` (~190 LOC). The
//! text predecessor uses a per-name regex with manual boundary
//! checks and a dozen guard predicates (preceded by `.` / `$`,
//! inside string literal, getter/setter name, declaration,
//! destructuring brace, declaration comma, destructuring pattern,
//! function-param shadow via `is_in_function_param_or_shadowed`,
//! non-shorthand property key, shorthand property).
//!
//! `oxc_semantic` (via `scope_analysis::is_locally_shadowed`)
//! gives a precise shadowing answer. Property-key positions,
//! getter/setter names, member-access property side, and binding
//! identifiers are all naturally not `IdentifierReference`s.
//! Already-wrapped (`$$props.localName`) is also natural — the
//! `localName` in `$$props.localName` is the property side of a
//! static member, not an `IdentifierReference`.
//!
//! ## Mapping (preserved exactly vs text version)
//!
//! | Source                    | Replacement                              |
//! |---------------------------|------------------------------------------|
//! | `localName` (read)        | `$$props.propName`                       |
//! | `localName` (non-ident)   | `$$props['propName']`                    |
//! | `{ localName }` shorthand | `{ localName: $$props.propName }`        |
//! | `{ localName: x }` key    | unchanged (property key untouched)       |
//! | `obj.localName`           | unchanged (property side untouched)      |
//! | `let localName = …`       | unchanged (BindingIdentifier)            |
//! | `function f(localName) { localName }` | unchanged (shadow)           |
//! | inside string literal     | unchanged (AST doesn't enter strings)    |
//!
//! ## Return shape
//!
//! Returns `Some(rewritten)` when at least one position was
//! wrapped. Returns `None` if `read_only_props` is empty, no
//! prop substring appears, the source fails to parse, the input
//! starts with a bare `{` (BlockStatement ambiguity — same bail
//! as `state_reads_ast`), or nothing matched. Callers fall back
//! to the text scanner on `None`.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use rustc_hash::FxHashSet;

use super::props_transforms::is_valid_js_identifier;
use super::scope_analysis::is_locally_shadowed;

thread_local! {
    static READ_ONLY_PROPS_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of read-only prop references. See module
/// docs for the precise contract.
pub fn transform_read_only_props_ast(
    source: &str,
    read_only_props: &[(String, String)],
) -> Option<String> {
    if read_only_props.is_empty() {
        return None;
    }
    if !read_only_props
        .iter()
        .any(|(local, _)| memchr::memmem::find(source.as_bytes(), local.as_bytes()).is_some())
    {
        return None;
    }
    // Same ambiguity bail as `state_reads_ast` — a bare `{ … }` at
    // the start of input parses as BlockStatement.
    if source.trim_start().starts_with('{') {
        return None;
    }

    READ_ONLY_PROPS_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs())
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

        let mut collector = ReadOnlyPropsCollector {
            semantic,
            read_only_props,
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
            out.replace_range(*start as usize..*end as usize, rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct ReadOnlyPropsCollector<'a, 'sem> {
    semantic: &'sem Semantic<'sem>,
    read_only_props: &'a [(String, String)],
    replacements: Vec<(u32, u32, String)>,
    skip_spans: FxHashSet<u32>,
}

impl<'a, 'sem> ReadOnlyPropsCollector<'a, 'sem> {
    /// Returns the `prop_name` for the given local name, if any.
    fn prop_name_for(&self, local_name: &str) -> Option<&'a str> {
        self.read_only_props
            .iter()
            .find(|(l, _)| l == local_name)
            .map(|(_, p)| p.as_str())
    }

    /// Build the `$$props.foo` or `$$props['foo']` replacement.
    fn build_access(prop_name: &str) -> String {
        if is_valid_js_identifier(prop_name) {
            format!("$$props.{}", prop_name)
        } else {
            format!("$$props['{}']", prop_name)
        }
    }

    fn skip(&mut self, ident: &IdentifierReference) {
        self.skip_spans.insert(ident.span.start);
    }
}

impl<'a, 'sem, 'ast> Visit<'ast> for ReadOnlyPropsCollector<'a, 'sem> {
    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        if self.skip_spans.contains(&ident.span.start) {
            return;
        }
        let Some(prop_name) = self.prop_name_for(&ident.name) else {
            return;
        };
        if is_locally_shadowed(self.semantic, ident) {
            return;
        }
        self.replacements.push((
            ident.span.start,
            ident.span.end,
            Self::build_access(prop_name),
        ));
    }

    fn visit_object_property(&mut self, prop: &ObjectProperty<'ast>) {
        // Shorthand `{ localName }` → `{ localName: $$props.propName }`.
        if prop.shorthand
            && let PropertyKey::StaticIdentifier(key) = &prop.key
            && let Some(prop_name) = self.prop_name_for(&key.name)
            && let Expression::Identifier(value_ident) = &prop.value
            && !is_locally_shadowed(self.semantic, value_ident)
        {
            let access = Self::build_access(prop_name);
            self.replacements.push((
                prop.span.start,
                prop.span.end,
                format!("{}: {}", key.name.as_str(), access),
            ));
            self.skip(value_ident);
            walk::walk_object_property(self, prop);
            return;
        }
        walk::walk_object_property(self, prop);
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        // Bare-LHS assignment isn't typical for read-only props
        // (they're read-only by definition). Match the text
        // version's behavior: skip the LHS so we don't break the
        // assignment. The text version effectively skipped it via
        // `is_assignment_target` and downstream passes complain
        // about read-only writes separately.
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left {
            self.skip(id);
        }
        walk::walk_assignment_expression(self, expr);
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        // Same rationale as assignment LHS.
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument {
            self.skip_spans.insert(id.span.start);
        }
        walk::walk_update_expression(self, expr);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pp(pairs: &[(&str, &str)]) -> Vec<(String, String)> {
        pairs
            .iter()
            .map(|(l, p)| (l.to_string(), p.to_string()))
            .collect()
    }

    #[test]
    fn bare_read() {
        let out = transform_read_only_props_ast("count;", &pp(&[("count", "count")])).unwrap();
        assert_eq!(out, "$$props.count;");
    }

    #[test]
    fn renamed_local() {
        // local `c` maps to prop `count`.
        let out = transform_read_only_props_ast("c;", &pp(&[("c", "count")])).unwrap();
        assert_eq!(out, "$$props.count;");
    }

    #[test]
    fn non_identifier_prop_uses_brackets() {
        // prop name `is-a-thing` isn't a valid identifier.
        let out = transform_read_only_props_ast("thing;", &pp(&[("thing", "is-a-thing")])).unwrap();
        assert_eq!(out, "$$props['is-a-thing'];");
    }

    #[test]
    fn read_in_expression() {
        let out = transform_read_only_props_ast("let x = count + 1;", &pp(&[("count", "count")]))
            .unwrap();
        assert_eq!(out, "let x = $$props.count + 1;");
    }

    #[test]
    fn shorthand_expands() {
        let out = transform_read_only_props_ast("let o = { count };", &pp(&[("count", "count")]))
            .unwrap();
        assert_eq!(out, "let o = { count: $$props.count };");
    }

    #[test]
    fn shorthand_with_renamed_prop() {
        // Local `c` maps to prop `count`. Shorthand `{ c }`
        // expands to `{ c: $$props.count }`.
        let out = transform_read_only_props_ast("let o = { c };", &pp(&[("c", "count")])).unwrap();
        assert_eq!(out, "let o = { c: $$props.count };");
    }

    #[test]
    fn skips_member_property_side() {
        // `obj.count` — `count` is a property name.
        assert!(transform_read_only_props_ast("obj.count;", &pp(&[("count", "count")])).is_none());
    }

    #[test]
    fn wraps_member_object_base() {
        // `count.foo` — `count` IS a reference (the object).
        let out = transform_read_only_props_ast("let x = count.foo;", &pp(&[("count", "count")]))
            .unwrap();
        assert_eq!(out, "let x = $$props.count.foo;");
    }

    #[test]
    fn skips_property_key() {
        // `{ count: 1 }` — count is a key.
        assert!(
            transform_read_only_props_ast("let o = { count: 1 };", &pp(&[("count", "count")]))
                .is_none()
        );
    }

    #[test]
    fn skips_declaration() {
        // BindingIdentifier — not visited.
        assert!(
            transform_read_only_props_ast("let count = 0;", &pp(&[("count", "count")])).is_none()
        );
        assert!(
            transform_read_only_props_ast("const count = 0;", &pp(&[("count", "count")])).is_none()
        );
    }

    #[test]
    fn skips_function_param_shadow() {
        assert!(
            transform_read_only_props_ast(
                "function f(count) { return count; }",
                &pp(&[("count", "count")])
            )
            .is_none()
        );
    }

    #[test]
    fn skips_arrow_param_shadow() {
        assert!(
            transform_read_only_props_ast(
                "const f = (count) => count;",
                &pp(&[("count", "count")])
            )
            .is_none()
        );
    }

    #[test]
    fn skips_for_loop_var_shadow() {
        assert!(
            transform_read_only_props_ast(
                "for (let count of items) { count; }",
                &pp(&[("count", "count")])
            )
            .is_none()
        );
    }

    #[test]
    fn skips_assignment_lhs() {
        // Assignment LHS is skipped (matches text version's
        // is_assignment_target guard).
        let out = transform_read_only_props_ast("count = 5;", &pp(&[("count", "count")]));
        // LHS skipped, no other refs → None
        assert!(out.is_none());
    }

    #[test]
    fn skips_update_expression() {
        // `count++` — argument skipped.
        assert!(transform_read_only_props_ast("count++;", &pp(&[("count", "count")])).is_none());
        assert!(transform_read_only_props_ast("++count;", &pp(&[("count", "count")])).is_none());
    }

    #[test]
    fn skips_already_wrapped_dot_access() {
        // `$$props.count` — count is a property name there.
        assert!(
            transform_read_only_props_ast("$$props.count;", &pp(&[("count", "count")])).is_none()
        );
    }

    #[test]
    fn skips_inside_string_literal() {
        let src = r#"let s = "count value";"#;
        assert!(transform_read_only_props_ast(src, &pp(&[("count", "count")])).is_none());
    }

    #[test]
    fn wraps_inside_template_expression() {
        let src = "let s = `value: ${count}`;";
        let out = transform_read_only_props_ast(src, &pp(&[("count", "count")])).unwrap();
        assert_eq!(out, "let s = `value: ${$$props.count}`;");
    }

    #[test]
    fn skips_getter_method_name() {
        // class with `get count()` — `count` there is a method
        // name (PropertyKey kind=Get).
        let src = "class C { get count() { return 1; } }";
        assert!(transform_read_only_props_ast(src, &pp(&[("count", "count")])).is_none());
    }

    #[test]
    fn multiple_pairs() {
        // Two prop pairs, both get wrapped.
        let out =
            transform_read_only_props_ast("let x = a + b;", &pp(&[("a", "alpha"), ("b", "beta")]))
                .unwrap();
        assert_eq!(out, "let x = $$props.alpha + $$props.beta;");
    }

    #[test]
    fn bare_object_literal_input_bails() {
        // BlockStatement ambiguity — bail to text scanner.
        assert!(
            transform_read_only_props_ast(
                "{ checked, count }",
                &pp(&[("count", "count"), ("checked", "checked")])
            )
            .is_none()
        );
    }

    #[test]
    fn empty_pairs_returns_none() {
        assert!(transform_read_only_props_ast("count;", &[]).is_none());
    }

    #[test]
    fn no_local_substring_returns_none() {
        assert!(transform_read_only_props_ast("let x = 1;", &pp(&[("count", "count")])).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_read_only_props_ast("function f( {", &pp(&[("count", "count")])).is_none()
        );
    }

    #[test]
    fn complex_smoke() {
        let src = r#"
            let r = count + 1;
            function inner(count) { return count; }
            let o = { count };
            obj.count = 5;
            count.x;
        "#;
        let out = transform_read_only_props_ast(src, &pp(&[("count", "count")])).unwrap();
        assert!(out.contains("let r = $$props.count + 1;"));
        assert!(out.contains("function inner(count) { return count; }"));
        assert!(out.contains("let o = { count: $$props.count };"));
        assert!(out.contains("obj.count = 5;"));
        assert!(out.contains("$$props.count.x;"));
    }
}
