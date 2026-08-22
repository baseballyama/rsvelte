//! `$state.eager(x)` → `$.eager(() => x)` for module scripts.
//!
//! The module pipeline lowered every other `$state*` rune and left this one
//! alone, so a `.svelte.(js|ts)` module kept `$state.eager(` in its output and
//! referenced an undefined global at run time. Upstream builds
//! `b.call('$.eager', b.thunk(value))`, so a zero-argument call of an identifier
//! loses the arrow.

use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_span::GetSpan;

use super::ast_rewrite::Edit;
use super::destructure_transforms::unthunk_string;

pub(super) fn collect_eager_edits(program: &Program<'_>, source: &str) -> Vec<Edit> {
    let mut collector = EagerCollector {
        source,
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

struct EagerCollector<'a> {
    source: &'a str,
    edits: Vec<Edit>,
}

impl<'a> Visit<'a> for EagerCollector<'_> {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        walk::walk_call_expression(self, call);

        let Expression::StaticMemberExpression(member) = &call.callee else {
            return;
        };
        let Expression::Identifier(obj) = &member.object else {
            return;
        };
        if obj.name != "$state" || member.property.name != "eager" {
            return;
        }
        let Some(arg) = call.arguments.first().and_then(|a| a.as_expression()) else {
            return;
        };
        let span = arg.span();
        let arg_text = self.source[span.start as usize..span.end as usize].trim();
        self.edits.push((
            call.span.start,
            call.span.end,
            format!("$.eager({})", unthunk_string(arg_text)),
        ));
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use oxc_allocator::Allocator;
    use oxc_parser::ParseOptions;
    use oxc_span::SourceType;

    use super::super::ast_rewrite;
    use super::*;

    thread_local! {
        static TEST_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
    }

    fn run(source: &str) -> Option<String> {
        memchr::memmem::find(source.as_bytes(), b"$state.eager")?;
        ast_rewrite::rewrite_once(
            &TEST_ALLOC,
            source,
            SourceType::mjs(),
            ParseOptions::default(),
            false,
            |program| collect_eager_edits(program, source),
        )
    }

    #[test]
    fn thunks_the_argument() {
        assert_eq!(
            run("let x = $state.eager(o);").unwrap(),
            "let x = $.eager(() => o);"
        );
    }

    #[test]
    fn unthunks_a_bare_call() {
        assert_eq!(
            run("let x = $state.eager(f());").unwrap(),
            "let x = $.eager(f);"
        );
    }

    #[test]
    fn leaves_the_same_bytes_in_a_string_alone() {
        assert!(run(r#"let s = "$state.eager(o)";"#).is_none());
    }
}
