use std::fmt;

use oxc_ast::ast::{Expression, Statement};
use rsvelte_typescript_tree::JsString;

use crate::lower::Builder;

#[cfg(test)]
mod tests;

/// Upstream `build_template`, folded as it is written: adjacent text and expressions become one
/// `$$renderer.push(`…`)`, which a statement ends.
pub(super) struct Template<'b, 'o> {
    b: &'b Builder<'o>,
    statements: Vec<Statement<'o>>,
    /// The pending push's cooked quasis, one more than its expressions; empty when none is open.
    strings: Vec<JsString>,
    expressions: Vec<Expression<'o>>,
}

impl<'b, 'o> Template<'b, 'o> {
    pub(super) const fn new(b: &'b Builder<'o>) -> Self {
        Self {
            b,
            statements: Vec::new(),
            strings: Vec::new(),
            expressions: Vec::new(),
        }
    }

    fn last(&mut self) -> &mut JsString {
        if self.strings.is_empty() {
            self.strings.push(JsString::new());
        }
        self.strings.last_mut().expect("pushed above")
    }

    pub(super) fn text(&mut self, text: &str) {
        self.last().push_str(text);
    }

    pub(super) fn js_text(&mut self, text: &JsString) {
        self.last().push_js(text);
    }

    /// [`Self::js_text`] with `map` applied to each text run.
    pub(super) fn js_text_mapped(
        &mut self,
        text: &JsString,
        map: impl Fn(&str) -> std::borrow::Cow<'_, str>,
    ) {
        self.last().push_js_mapped(text, map);
    }

    pub(super) fn text_fmt(&mut self, text: fmt::Arguments<'_>) {
        fmt::Write::write_fmt(self.last(), text).expect("a `JsString` takes any text");
    }

    pub(super) fn expression(&mut self, expression: Expression<'o>) {
        self.last();
        self.expressions.push(expression);
        self.strings.push(JsString::new());
    }

    /// A template literal's cooked quasis and expressions, spliced into the pending push.
    pub(super) fn quasis(&mut self, quasis: Vec<JsString>, expressions: Vec<Expression<'o>>) {
        let mut quasis = quasis.into_iter();
        self.js_text(&quasis.next().expect("at least one quasi"));
        self.strings.extend(quasis);
        self.expressions.extend(expressions);
    }

    pub(super) fn statement(&mut self, statement: Statement<'o>) {
        self.flush();
        self.statements.push(statement);
    }

    pub(super) fn statements(&mut self, statements: impl IntoIterator<Item = Statement<'o>>) {
        self.flush();
        self.statements.extend(statements);
    }

    pub(super) fn finish(mut self) -> Vec<Statement<'o>> {
        self.flush();
        self.statements
    }

    fn flush(&mut self) {
        if self.strings.is_empty() {
            return;
        }
        let b = self.b;
        let template = b.js_template(&self.strings, self.expressions.drain(..));
        self.strings.clear();
        let push = b.call(b.member(b.id("$$renderer"), "push"), [template]);
        self.statements.push(b.statement(push));
    }
}
