//! `$effect.pending()` → `0` for the server module transform.
//!
//! Nothing tracks pending async work on the server, so upstream's server
//! `CallExpression` visitor folds the call to `0`. The instance-script path
//! already does this; the module path reused the *client* transform and so
//! emitted `$.eager($.pending)` into server output, calling a client-only
//! runtime export.
//!
//! A declarator initializer is `void 0` instead, because upstream's server
//! `VariableDeclaration` reads the rune's own first argument (`b.void0` when
//! there is none) rather than visiting the call.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::super::shared::ast_rewrite::{self, Edit};

thread_local! {
    static EFFECT_PENDING_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

pub(crate) fn transform_effect_pending_ast(source: &str, is_ts: bool) -> Option<String> {
    memchr::memmem::find(source.as_bytes(), b"$effect.pending")?;
    ast_rewrite::rewrite_once(
        &EFFECT_PENDING_ALLOC,
        source,
        if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        },
        ParseOptions::default(),
        false,
        |program| {
            let mut collector = Collector {
                edits: Vec::new(),
                declarator_inits: rustc_hash::FxHashSet::default(),
            };
            collector.visit_program(program);
            collector.edits
        },
    )
}

struct Collector {
    edits: Vec<Edit>,
    declarator_inits: rustc_hash::FxHashSet<(u32, u32)>,
}

impl<'a> Visit<'a> for Collector {
    fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'a>) {
        if let Some(init) = &declarator.init {
            let span = init.span();
            self.declarator_inits.insert((span.start, span.end));
        }
        walk::walk_variable_declarator(self, declarator);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        walk::walk_call_expression(self, call);

        let Expression::StaticMemberExpression(member) = &call.callee else {
            return;
        };
        let Expression::Identifier(object) = &member.object else {
            return;
        };
        if object.name != "$effect" || member.property.name != "pending" {
            return;
        }
        let folded = if self
            .declarator_inits
            .contains(&(call.span.start, call.span.end))
        {
            "void 0"
        } else {
            "0"
        };
        self.edits
            .push((call.span.start, call.span.end, folded.to_string()));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_declarator_initializer_folds_to_void_0() {
        assert_eq!(
            transform_effect_pending_ast("let x = $effect.pending();", false).unwrap(),
            "let x = void 0;"
        );
    }

    #[test]
    fn every_other_position_folds_to_zero() {
        assert_eq!(
            transform_effect_pending_ast("const o = { p: $effect.pending() };", false).unwrap(),
            "const o = { p: 0 };"
        );
        assert_eq!(
            transform_effect_pending_ast("class K { x = $effect.pending(); }", false).unwrap(),
            "class K { x = 0; }"
        );
    }

    #[test]
    fn leaves_the_same_bytes_in_a_string_alone() {
        assert!(transform_effect_pending_ast(r#"let s = "$effect.pending()";"#, false).is_none());
    }
}
