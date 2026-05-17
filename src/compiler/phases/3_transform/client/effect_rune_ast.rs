//! AST-based `$effect` rune rewrites for module scripts
//! (`.svelte.js` / `.svelte.ts`).
//!
//! Replaces the text-based `rune_transforms::apply_effect_rune_transforms`
//! single-pass byte scanner. The text version blindly rewrites byte
//! patterns regardless of lexical context — so `let s = "$effect("`
//! would be (incorrectly) rewritten to `let s = "$.user_effect("`.
//! The AST visitor only descends into expression positions, never
//! into string-literal contents, so it can't make that class of
//! mistake.
//!
//! Patterns rewritten (callee swap unless noted):
//!
//! | Source                | Replacement                |
//! |-----------------------|----------------------------|
//! | `$effect(fn)`         | `$.user_effect(fn)`        |
//! | `$effect.pre(fn)`     | `$.user_pre_effect(fn)`    |
//! | `$effect.root(fn)`    | `$.effect_root(fn)`        |
//! | `$effect.tracking()`  | `$.effect_tracking()`      |
//! | `$effect.pending()`   | `$.eager($.pending)` (whole-call swap) |

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::SourceType;

thread_local! {
    static MODULE_EFFECT_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$effect.*` call expressions. Returns `None`
/// when nothing changed (no `$effect` in source, parse error, no
/// matching call site), so the caller keeps its existing `String`.
pub fn apply_effect_rune_transforms_ast(source: &str, is_ts: bool) -> Option<String> {
    // Fast probe — most module scripts don't use $effect at all.
    memchr::memmem::find(source.as_bytes(), b"$effect")?;

    MODULE_EFFECT_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let source_type = if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        };
        let parser_ret = Parser::new(&allocator, source, source_type).parse();
        if !parser_ret.errors.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = EffectRuneCollector {
            replacements: Vec::new(),
        };
        collector.visit_program(&parser_ret.program);
        let mut replacements = collector.replacements;

        if replacements.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        // Non-overlapping by construction (every replacement is a
        // distinct call expression callee span or a distinct whole
        // call span). Right-to-left apply preserves offsets.
        replacements.sort_by_key(|r| std::cmp::Reverse(r.0));
        let mut out = source.to_string();
        for (start, end, rewrite) in &replacements {
            out.replace_range(*start as usize..*end as usize, rewrite);
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct EffectRuneCollector {
    /// Each entry is `(span_start, span_end, replacement_string)`.
    replacements: Vec<(u32, u32, String)>,
}

impl<'a> Visit<'a> for EffectRuneCollector {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        // Walk arguments first so nested `$effect(...)` (e.g.,
        // `$effect(() => $effect.tracking())`) get rewritten too.
        walk::walk_call_expression(self, call);

        match &call.callee {
            // `$effect(...)`
            Expression::Identifier(id) if id.name == "$effect" => {
                self.replacements
                    .push((id.span.start, id.span.end, "$.user_effect".to_string()));
            }
            // `$effect.X(...)` family
            Expression::StaticMemberExpression(member) => {
                let Expression::Identifier(obj) = &member.object else {
                    return;
                };
                if obj.name != "$effect" {
                    return;
                }
                let property = member.property.name.as_str();
                match property {
                    "pre" => self.replacements.push((
                        member.span.start,
                        member.span.end,
                        "$.user_pre_effect".to_string(),
                    )),
                    "root" => self.replacements.push((
                        member.span.start,
                        member.span.end,
                        "$.effect_root".to_string(),
                    )),
                    "tracking" => self.replacements.push((
                        member.span.start,
                        member.span.end,
                        "$.effect_tracking".to_string(),
                    )),
                    "pending" => {
                        // Whole-call swap: `$effect.pending()` →
                        // `$.eager($.pending)`. The original takes no
                        // args; we discard the `()` and emit a fresh
                        // call shape.
                        self.replacements.push((
                            call.span.start,
                            call.span.end,
                            "$.eager($.pending)".to_string(),
                        ));
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rewrites_bare_effect() {
        let out = apply_effect_rune_transforms_ast("$effect(() => {});", false).unwrap();
        assert_eq!(out, "$.user_effect(() => {});");
    }

    #[test]
    fn rewrites_effect_pre() {
        let out = apply_effect_rune_transforms_ast("$effect.pre(() => {});", false).unwrap();
        assert_eq!(out, "$.user_pre_effect(() => {});");
    }

    #[test]
    fn rewrites_effect_root() {
        let out = apply_effect_rune_transforms_ast("$effect.root(() => {});", false).unwrap();
        assert_eq!(out, "$.effect_root(() => {});");
    }

    #[test]
    fn rewrites_effect_tracking() {
        let out = apply_effect_rune_transforms_ast("if ($effect.tracking()) {}", false).unwrap();
        assert_eq!(out, "if ($.effect_tracking()) {}");
    }

    #[test]
    fn rewrites_effect_pending() {
        let out = apply_effect_rune_transforms_ast("let p = $effect.pending();", false).unwrap();
        assert_eq!(out, "let p = $.eager($.pending);");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        // The whole point of going AST: the text scanner would have
        // broken these source files.
        for src in [
            r#"let s = "$effect(x)";"#,
            r#"let s = "$effect.pre(x)";"#,
            r#"let s = "$effect.tracking()";"#,
            r#"let s = "$effect.pending()";"#,
        ] {
            let out = apply_effect_rune_transforms_ast(src, false);
            assert!(out.is_none(), "should not rewrite inside string: {src}");
        }
    }

    #[test]
    fn does_not_rewrite_inside_template_literal_static() {
        let src = "let s = `$effect.tracking()`;";
        assert!(apply_effect_rune_transforms_ast(src, false).is_none());
    }

    #[test]
    fn rewrites_inside_template_literal_expression() {
        let src = "let s = `${$effect.tracking()}`;";
        let out = apply_effect_rune_transforms_ast(src, false).unwrap();
        assert_eq!(out, "let s = `${$.effect_tracking()}`;");
    }

    #[test]
    fn nested_effect_in_arrow_body() {
        let src = "$effect(() => $effect.tracking());";
        let out = apply_effect_rune_transforms_ast(src, false).unwrap();
        assert_eq!(out, "$.user_effect(() => $.effect_tracking());");
    }

    #[test]
    fn unknown_member_left_alone() {
        // `$effect.bogus()` is not a known rune — leave it; the
        // analyzer / type system will catch unknown ones elsewhere.
        let src = "$effect.bogus()";
        assert!(apply_effect_rune_transforms_ast(src, false).is_none());
    }

    #[test]
    fn ts_source_type_works() {
        let src = "let x: number = 1; $effect(() => x);";
        let out = apply_effect_rune_transforms_ast(src, true).unwrap();
        assert!(out.contains("$.user_effect(() => x)"));
    }

    #[test]
    fn parse_error_returns_none() {
        // Malformed source falls through without mutation.
        assert!(apply_effect_rune_transforms_ast("let x = $effect(", false).is_none());
    }

    #[test]
    fn no_op_when_no_effect_keyword() {
        assert!(apply_effect_rune_transforms_ast("let x = 1;", false).is_none());
    }
}
