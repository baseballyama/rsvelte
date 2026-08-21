//! `const x = $.snapshot(a)` → `const x = a` on the `compileModule` server path.
//!
//! The client module transform has already lowered `$state.snapshot(x)` to
//! `$.snapshot(x)`. Upstream keeps that call everywhere except a variable
//! declarator initializer, because `VariableDeclaration.js` reads the rune's own
//! first argument instead of visiting the call — so `return $state.snapshot(r)`
//! and `this.o = $state.snapshot(r)` keep the wrap and `const p = …` does not.
//!
//! This replaces a text scan that found the declaration keyword by walking back
//! over the declarator name, so it only ever saw the FIRST declarator:
//! `let y = 0, x = $state.snapshot(o)` kept a wrap upstream strips.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::super::shared::ast_rewrite::{self, Edit};

thread_local! {
    static SNAPSHOT_DECL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

pub(super) fn strip_snapshot_declarator_init(source: &str, is_ts: bool) -> Option<String> {
    memchr::memmem::find(source.as_bytes(), b"$.snapshot(")?;
    ast_rewrite::rewrite_once(
        &SNAPSHOT_DECL_ALLOC,
        source,
        if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        },
        ParseOptions::default(),
        false,
        |program| {
            let mut collector = Collector { edits: Vec::new() };
            collector.visit_program(program);
            collector.edits
        },
    )
}

struct Collector {
    edits: Vec<Edit>,
}

/// The sole argument of a `$.snapshot(…)` call, if `expr` is exactly that call.
fn snapshot_argument<'a, 'b>(expr: &'b Expression<'a>) -> Option<&'b Expression<'a>> {
    // Upstream's acorn builds no `ParenthesizedExpression`, so `= ($.snapshot(x))`
    // is the same declarator initializer as `= $.snapshot(x)` (#3248).
    let Expression::CallExpression(call) = expr.without_parentheses() else {
        return None;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return None;
    };
    let Expression::Identifier(object) = &member.object else {
        return None;
    };
    if object.name != "$" || member.property.name != "snapshot" {
        return None;
    }
    // A second `true` argument is the `state_snapshot_uncloneable` opt-out, which
    // upstream never emits in a declarator — leave that call alone.
    if call.arguments.len() != 1 {
        return None;
    }
    call.arguments.first()?.as_expression()
}

impl<'a> Visit<'a> for Collector {
    fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'a>) {
        if let Some(init) = &declarator.init
            && let Some(arg) = snapshot_argument(init)
        {
            // Delete the wrapper on either side rather than replacing the whole
            // initializer, so an edit collected inside the argument survives.
            let (call, arg) = (init.span(), arg.span());
            self.edits.push((call.start, arg.start, String::new()));
            self.edits.push((arg.end, call.end, String::new()));
        }
        walk::walk_variable_declarator(self, declarator);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_a_declarator_initializer_in_any_position() {
        assert_eq!(
            strip_snapshot_declarator_init("let y = 0, x = $.snapshot(o);", false).unwrap(),
            "let y = 0, x = o;"
        );
        assert_eq!(
            strip_snapshot_declarator_init("const p = $.snapshot(this.rect);", false).unwrap(),
            "const p = this.rect;"
        );
    }

    #[test]
    fn keeps_every_other_position() {
        assert!(strip_snapshot_declarator_init("return $.snapshot(r);", false).is_none());
        assert!(strip_snapshot_declarator_init("this.o = $.snapshot(r);", false).is_none());
        assert!(
            strip_snapshot_declarator_init("const c = cond ? $.snapshot(a) : b;", false).is_none()
        );
    }

    #[test]
    fn keeps_the_uncloneable_opt_out_form() {
        assert!(strip_snapshot_declarator_init("const p = $.snapshot(r, true);", false).is_none());
    }
}
