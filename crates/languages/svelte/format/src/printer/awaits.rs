//! The `await`s outside an await context (TS1308), which oxc reads as await expressions and
//! Prettier's parsers do not always.

use oxc_ast::ast::{
    AccessorProperty, ArrowFunctionExpression, AwaitExpression, ForOfStatement, Function,
    PropertyDefinition, StaticBlock, TSEnumMember, TSModuleBlock,
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Kind;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_svelte_syntax::syntax_tree::{Component, TokenType};
use rsvelte_typescript_tree::document_span;

use super::{R, Span, Unsupported, in_typescript};

/// Refuses a script oxc formats whose `await` outside an await context Prettier prints otherwise:
/// typescript-estree reads `await (…)` there as a call of `await`, `babel-ts` throws on any such
/// `await`, and a `for await` there prints its body apart.
pub(super) fn refuse_misread_awaits(
    c: &Component,
    source_text: &str,
    unparsed_scripts: &[Span],
) -> R<()> {
    for script in c.module.iter().chain(&c.instance) {
        if unparsed_scripts.contains(&script.content) {
            continue;
        }
        let mut find = Find {
            c,
            typescript: in_typescript(script, source_text),
            allowed: true,
            found: None,
        };
        find.visit_program(c.javascript.get_program(script.program));
        if let Some((span, reason)) = find.found {
            return Err(Unsupported::at(reason, span));
        }
    }
    Ok(())
}

struct Find<'c> {
    c: &'c Component,
    typescript: bool,
    /// Whether an `await` here is an operator: at the top of a module, in an async function and
    /// in a static block.
    allowed: bool,
    found: Option<(Span, &'static str)>,
}

impl Find<'_> {
    fn within(&mut self, allowed: bool, visit: impl FnOnce(&mut Self)) {
        let outer = std::mem::replace(&mut self.allowed, allowed);
        visit(self);
        self.allowed = outer;
    }

    /// Whether `(` follows the `await` that starts at `start`.
    fn called(&self, start: u32) -> bool {
        let tokens = &self.c.tokens;
        let next = (tokens.at(start))
            .and_then(|keyword| tokens.after(tokens.get(keyword).span.end_offset));
        next.is_some_and(|next| tokens.get(next).kind == TokenType::JavaScript(Kind::LParen))
    }

    fn find(&mut self, span: oxc_span::Span, reason: &'static str) {
        self.found
            .get_or_insert_with(|| (document_span(span), reason));
    }
}

impl<'a> Visit<'a> for Find<'_> {
    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        self.within(it.r#async, |f| walk::walk_function(f, it, flags));
    }

    fn visit_arrow_function_expression(&mut self, it: &ArrowFunctionExpression<'a>) {
        self.within(it.r#async, |f| walk::walk_arrow_function_expression(f, it));
    }

    fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
        self.visit_decorators(&it.decorators);
        self.visit_property_key(&it.key);
        if let Some(value) = &it.value {
            self.within(false, |f| f.visit_expression(value));
        }
    }

    fn visit_accessor_property(&mut self, it: &AccessorProperty<'a>) {
        self.visit_decorators(&it.decorators);
        self.visit_property_key(&it.key);
        if let Some(value) = &it.value {
            self.within(false, |f| f.visit_expression(value));
        }
    }

    fn visit_static_block(&mut self, it: &StaticBlock<'a>) {
        self.within(true, |f| walk::walk_static_block(f, it));
    }

    fn visit_ts_enum_member(&mut self, it: &TSEnumMember<'a>) {
        self.within(false, |f| walk::walk_ts_enum_member(f, it));
    }

    fn visit_ts_module_block(&mut self, it: &TSModuleBlock<'a>) {
        self.within(false, |f| walk::walk_ts_module_block(f, it));
    }

    fn visit_await_expression(&mut self, it: &AwaitExpression<'a>) {
        if !self.allowed {
            if !self.typescript {
                self.find(
                    it.span,
                    "an `await` outside an async function, which `babel-ts` throws on",
                );
            } else if self.called(it.span.start) {
                self.find(
                    it.span,
                    "`await (…)` outside an async function, which Prettier reads as a call",
                );
            }
        }
        walk::walk_await_expression(self, it);
    }

    fn visit_for_of_statement(&mut self, it: &ForOfStatement<'a>) {
        if it.r#await && !self.allowed {
            self.find(it.span, "a `for await` outside an async function");
        }
        walk::walk_for_of_statement(self, it);
    }
}

#[cfg(test)]
mod tests;
