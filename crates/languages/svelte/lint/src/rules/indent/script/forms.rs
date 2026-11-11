//! Functions, imports, exports and control statements.

use oxc_ast::AstKind;
use oxc_ast::ast::{Function, ImportDeclarationSpecifier, Statement};
use oxc_parser::Kind;
use oxc_span::{GetSpan, Span as OxcSpan};

use super::{Script, parameter_spans};
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl<'a> Script<'_, 'a> {
    #[expect(clippy::too_many_lines, reason = "one arm per statement")]
    pub(super) fn lay_out_form(&mut self, kind: AstKind<'a>, first: Option<Token>) {
        let node = kind.span();
        match kind {
            AstKind::Function(n) => self.function(n, first),
            AstKind::IfStatement(n) => {
                let tokens = self.tokens();
                let left = self.after(first);
                let consequent = n.consequent.span();
                let right = self.before_node_matching(consequent, |t| tokens.is(t, Kind::RParen));
                self.layout.offset(left, 1, first);
                self.layout.offset(right, 0, left);
                self.body(consequent, first);
                if let Some(alternate) = &n.alternate {
                    let tokens = self.tokens();
                    let else_token =
                        self.after_node_matching(consequent, |t| !tokens.is(t, Kind::RParen));
                    self.layout.offset(else_token, 0, first);
                    self.body(alternate.span(), else_token);
                }
            }
            AstKind::ImportDeclaration(n) => {
                let specifiers = n.specifiers.as_ref().map_or(&[][..], |s| s.as_slice());
                self.import(node, specifiers, n.source.span, first);
            }
            AstKind::ImportSpecifier(_) | AstKind::ExportSpecifier(_) => self.specifier(node),
            AstKind::ImportNamespaceSpecifier(_) => {
                let tokens: Vec<Token> = self.tokens().within(super::span(node)).skip(1).collect();
                self.layout.offset_all(tokens, 1, first);
            }
            AstKind::ImportAttribute(n) => {
                let Some((key_first, key_last)) = self.outer(n.key.span()) else {
                    return;
                };
                if let Some(f) = first {
                    let prefix: Vec<Token> = self.tokens().between(f, key_first).collect();
                    self.layout.offset_all(prefix, 0, first);
                }
                self.layout.offset(Some(key_first), 0, first);
                if let Some(init) = self.first(n.value.span) {
                    let mut tokens: Vec<Token> = self.tokens().between(key_last, init).collect();
                    tokens.push(init);
                    self.layout.offset_all(tokens, 1, Some(key_last));
                }
            }
            AstKind::ImportExpression(n) => {
                let right = self.last(node);
                let tokens = self.tokens();
                let left = first.and_then(|f| {
                    tokens.after_matching(tokens.span(f).end_offset, |t| tokens.is(t, Kind::LParen))
                });
                self.layout.offset(left, 1, first);
                self.list_from(left, &[Some(Self::item(n.source.span()))], right, 1);
            }
            AstKind::ExportDefaultDeclaration(n) => {
                let declaration_token = self.outer_first(n.declaration.span());
                if let (Some(f), Some(d)) = (first, declaration_token) {
                    let tokens: Vec<Token> = self.tokens().between(f, d).collect();
                    self.layout.offset_all(tokens, 1, first);
                }
                self.layout.offset(declaration_token, 1, first);
            }
            AstKind::ExportDeclaration(n) => {
                let declaration_token = self.first(n.declaration.span());
                self.layout.offset(declaration_token, 1, first);
            }
            AstKind::ExportNamedDeclaration(n) => {
                let specifiers: Vec<OxcSpan> = n.specifiers.iter().map(|s| s.span).collect();
                self.export_list(node, &specifiers, None, first);
            }
            AstKind::ExportFromDeclaration(n) => {
                let specifiers: Vec<OxcSpan> = n.specifiers.iter().map(|s| s.span).collect();
                self.export_list(node, &specifiers, Some(n.source.span), first);
            }
            AstKind::ExportAllDeclaration(n) => {
                let source = n.source.span;
                let (Some(export), Some(source_token)) = (first, self.first(source)) else {
                    return;
                };
                let tokens = self.tokens();
                let between: Vec<Token> = tokens.between(export, source_token).collect();
                let Some(from_index) = between.iter().position(|&t| tokens.text(t) == "from")
                else {
                    return;
                };
                let from = between[from_index];
                let before = &between[..from_index];
                let after: Vec<Token> = between[from_index + 1..]
                    .iter()
                    .copied()
                    .chain([source_token])
                    .collect();
                if n.exported.is_none() {
                    self.layout.offset_all(before.iter().copied(), 1, first);
                } else if let Some(as_index) = before.iter().position(|&t| tokens.text(t) == "as") {
                    self.layout
                        .offset_all(before[..as_index].iter().copied(), 1, first);
                    let base = as_index.checked_sub(1).map(|i| before[i]);
                    self.layout
                        .offset_all(before[as_index..].iter().copied(), 1, base);
                }
                self.layout.offset(Some(from), 0, first);
                self.layout.offset_all(after, 1, Some(from));
                self.attributes(node, source, first);
            }
            AstKind::TryStatement(n) => {
                let block_token = self.first(n.block.span);
                self.layout.offset(block_token, 0, first);
                if let Some(handler) = &n.handler {
                    let catch = self.first(handler.span);
                    self.layout.offset(catch, 0, first);
                }
                if let Some(finalizer) = &n.finalizer {
                    let finally = self.before_node(finalizer.span);
                    let finally_block = self.first(finalizer.span);
                    self.layout.offset(finally, 0, first);
                    self.layout.offset(finally_block, 0, first);
                }
            }
            AstKind::CatchClause(n) => {
                if let Some(parameter) = &n.param {
                    let left = self.before_node(parameter.span);
                    let right = self.after_node(parameter.span);
                    self.layout.offset(left, 1, first);
                    self.list_from(left, &[Some(Self::item(parameter.span))], right, 1);
                }
                let body_token = self.first(n.body.span);
                self.layout.offset(body_token, 0, first);
            }
            AstKind::CatchParameter(n) if n.type_annotation.is_some() => {
                // The binding's range holds its annotation, so parentheses are around it.
                self.parentheses(n.span);
            }
            AstKind::WhileStatement(n) => self.while_statement(n.body.span(), first),
            AstKind::WithStatement(n) => self.while_statement(n.body.span(), first),
            AstKind::DoWhileStatement(n) => {
                let tokens = self.tokens();
                let body = n.body.span();
                let while_token = self.after_node_matching(body, |t| !tokens.is(t, Kind::RParen));
                let left = self.after(while_token);
                let right = self.after_node(n.test.span());
                self.body(body, first);
                self.layout.offset(while_token, 0, first);
                self.layout.offset(left, 1, while_token);
                self.list_from(left, &[Some(Self::item(n.test.span()))], right, 1);
            }
            AstKind::ForStatement(n) => {
                let tokens = self.tokens();
                let left = self.after(first);
                let body = n.body.span();
                let right = self.before_node_matching(body, |t| !tokens.is(t, Kind::LParen));
                self.layout.offset(left, 1, first);
                let items = [
                    n.init.as_ref().map(GetSpan::span),
                    n.test.as_ref().map(GetSpan::span),
                    n.update.as_ref().map(GetSpan::span),
                ]
                .map(|s| s.map(Self::item));
                self.list_from(left, &items, right, 1);
                self.body(body, first);
            }
            AstKind::ForInStatement(n) => {
                self.for_each(false, n.left.span(), n.body.span(), first);
            }
            AstKind::ForOfStatement(n) => {
                self.for_each(n.r#await, n.left.span(), n.body.span(), first);
            }
            AstKind::SwitchStatement(n) => {
                let parens = self.outer(n.discriminant.span());
                let left = parens.map(|(l, _)| l);
                let right = parens.map(|(_, r)| r);
                let left_brace = self.after(right);
                let right_brace = self.last(node);
                self.layout.offset(left, 1, first);
                self.list_from(left, &[Some(Self::item(n.discriminant.span()))], right, 1);
                self.layout.offset(left_brace, 0, first);
                let offset = self.layout.options.switch_case;
                let cases = Self::items(n.cases.iter().map(|c| c.span));
                self.list_from(left_brace, &cases, right_brace, offset);
            }
            AstKind::SwitchCase(n) => {
                if let Some(test) = &n.test {
                    let test_tokens = self.outer(test.span());
                    let colon = self.after(test_tokens.map(|(_, l)| l));
                    self.layout.offset(test_tokens.map(|(f, _)| f), 1, first);
                    self.layout.offset(colon, 1, first);
                } else {
                    let colon = self.after(first);
                    self.layout.offset(colon, 1, first);
                }
                if let [Statement::BlockStatement(only)] = n.consequent.as_slice() {
                    let block = self.first(only.span);
                    self.layout.offset(block, 0, first);
                } else {
                    for statement in &n.consequent {
                        let token = self.outer_first(statement.span());
                        self.layout.offset(token, 1, first);
                    }
                }
            }
            AstKind::LabeledStatement(_) => {
                let colon = self.after(first);
                let body = self.after(colon);
                self.layout.offset(colon, 1, first);
                self.layout.offset(body, 1, first);
            }
            _ => self.lay_out_typescript(kind, first),
        }
    }

    fn function(&mut self, function: &Function<'a>, first: Option<Token>) {
        let parameters = parameter_spans(function.this_param.as_deref(), &function.params);
        let tokens = self.tokens();
        let is_paren = |t: Token| tokens.is(t, Kind::LParen);
        let left = match parameters.first() {
            Some(&p) => self.before_node_matching(p, is_paren),
            None => match (&function.return_type, &function.body) {
                (_, None) => first.and_then(|f| {
                    if is_paren(f) {
                        Some(f)
                    } else {
                        let from = function
                            .id
                            .as_ref()
                            .map_or_else(|| tokens.span(f).end_offset, |n| n.span.end);
                        tokens.after_matching(from, is_paren)
                    }
                }),
                (Some(returns), Some(_)) => self.before_node_matching(returns.span, is_paren),
                (None, Some(body)) => self
                    .before_node(body.span)
                    .and_then(|b| tokens.before_matching(tokens.span(b).start_offset, is_paren)),
            },
        };
        let Some(f) = first else {
            return;
        };
        let body_base = if tokens.is_punctuator(f) {
            // A method's value starts at its parameters; its body aligns with the method.
            self.parent().and_then(|p| self.first(p.span()))
        } else {
            let name_start = function.id.as_ref().map(|n| n.span.start);
            let mut offset = 0;
            let between: Vec<Token> = left
                .map(|l| tokens.between(f, l).collect())
                .unwrap_or_default();
            for t in between {
                let tokens = self.tokens();
                if tokens.text(t) == "<" {
                    break;
                }
                if tokens.text(t) == "*" || Some(tokens.span(t).start_offset) == name_start {
                    offset = 1;
                }
                self.layout.offset(Some(t), offset, first);
            }
            first
        };
        let right = self.closing(parameters.last().copied(), left, Kind::RParen);
        self.layout.offset(left, 1, body_base);
        self.list_from(left, &Self::items(parameters), right, 1);
        let body_token = function.body.as_ref().and_then(|b| self.first(b.span));
        self.layout.offset(body_token, 0, body_base);
    }

    fn import(
        &mut self,
        node: OxcSpan,
        specifiers: &[ImportDeclarationSpecifier<'a>],
        source: OxcSpan,
        first: Option<Token>,
    ) {
        let (Some(import), Some(source_token)) = (first, self.first(source)) else {
            return;
        };
        let tokens = self.tokens();
        let between: Vec<Token> = tokens.between(import, source_token).collect();
        let from = between.iter().rposition(|&t| tokens.text(t) == "from");
        // Without `from`, the source counts as a token before it.
        let split = from.unwrap_or(between.len());
        let from_token = from.map(|i| between[i]);
        let mut before: Vec<Token> = between[..split].to_vec();
        let after: Vec<Token> = if from.is_some() {
            between[split + 1..]
                .iter()
                .copied()
                .chain([source_token])
                .collect()
        } else {
            before.push(source_token);
            Vec::new()
        };
        let mut named = Vec::new();
        for specifier in specifiers {
            if let ImportDeclarationSpecifier::ImportSpecifier(s) = specifier {
                named.push(s.span);
            } else if let (Some(f), Some(l)) =
                (self.first(specifier.span()), self.last(specifier.span()))
            {
                // A default or namespace specifier keeps only its first token.
                before.retain(|&t| !(t > f && t <= l));
            }
        }
        if let (Some(&first_named), Some(&last_named)) = (named.first(), named.last()) {
            let tokens = self.tokens();
            let left = self.before_node(first_named);
            let right = self.after_node_matching(last_named, |t| tokens.is(t, Kind::RCurly));
            if let (Some(l), Some(r)) = (left, right) {
                before.retain(|&t| !(t > l && t <= r));
            }
            self.list_from(left, &Self::items(named), right, 1);
        }
        let tokens = self.tokens();
        let braces = before
            .iter()
            .all(|&t| tokens.is(t, Kind::LCurly) || tokens.is(t, Kind::RCurly));
        self.layout.offset_all(before, u32::from(!braces), first);
        if from_token.is_some() {
            self.layout.offset(from_token, 0, first);
            self.layout.offset_all(after, 1, from_token);
        }
        self.attributes(node, source, first);
    }

    /// `with { … }` after a module source.
    fn attributes(&mut self, node: OxcSpan, source: OxcSpan, first: Option<Token>) {
        let tokens = self.tokens();
        let (Some(last), Some(source_last)) = (
            tokens.last_matching(super::span(node), |t| !tokens.is(t, Kind::Semicolon)),
            self.last(source),
        ) else {
            return;
        };
        let mut assertion: Vec<Token> = tokens.between(source_last, last).collect();
        if assertion.is_empty() {
            return;
        }
        let keyword = assertion.remove(0);
        self.layout.offset(Some(keyword), 0, first);
        if !assertion.is_empty() {
            let open = assertion.remove(0);
            self.layout.offset(Some(open), 1, Some(keyword));
            let items: Vec<Option<Item>> =
                assertion.iter().map(|&t| Some(Item::Token(t))).collect();
            self.list_from(Some(open), &items, Some(last), 1);
        }
    }

    /// `ImportSpecifier` and `ExportSpecifier`.
    fn specifier(&mut self, node: OxcSpan) {
        let mut tokens: Vec<Token> = self.tokens().within(super::span(node)).collect();
        if tokens.is_empty() {
            return;
        }
        let mut first = tokens.remove(0);
        if self.text(first) == "type" && !tokens.is_empty() {
            let type_token = first;
            first = tokens.remove(0);
            self.layout.offset(Some(first), 0, Some(type_token));
        }
        self.layout.offset_all(tokens, 1, Some(first));
    }

    /// `export { … }`, with `from` and a source when it has one.
    fn export_list(
        &mut self,
        node: OxcSpan,
        specifiers: &[OxcSpan],
        source: Option<OxcSpan>,
        first: Option<Token>,
    ) {
        let Some(export) = first else {
            return;
        };
        let tokens = self.tokens();
        let left_braces: Vec<Token> = specifiers.first().and_then(|&s| self.first(s)).map_or_else(
            || tokens.after(export).into_iter().collect(),
            |s| tokens.between(export, s).collect(),
        );
        let is_close = |t: Token| tokens.is(t, Kind::RCurly);
        let right_brace = source.map_or_else(
            || tokens.last_matching(super::span(node), is_close),
            |source| self.before_node_matching(source, is_close),
        );
        let base = left_braces.last().copied();
        self.layout.offset_all(left_braces, 0, first);
        self.list_from(
            base,
            &Self::items(specifiers.iter().copied()),
            right_brace,
            1,
        );
        if let (Some(source), Some(right_brace)) = (source, right_brace) {
            let Some(source_token) = self.first(source) else {
                return;
            };
            let mut between: Vec<Token> =
                self.tokens().between(right_brace, source_token).collect();
            if between.is_empty() {
                return;
            }
            let from = between.remove(0);
            between.push(source_token);
            self.layout.offset(Some(from), 0, first);
            self.layout.offset_all(between, 1, Some(from));
            self.attributes(node, source, first);
        }
    }

    /// `WhileStatement` and `WithStatement`.
    fn while_statement(&mut self, body: OxcSpan, first: Option<Token>) {
        let tokens = self.tokens();
        let left = self.after(first);
        let right = self.before_node_matching(body, |t| tokens.is(t, Kind::RParen));
        self.layout.offset(left, 1, first);
        self.layout.offset(right, 0, left);
        self.body(body, first);
    }

    /// `ForInStatement` and `ForOfStatement`.
    fn for_each(&mut self, is_await: bool, binding: OxcSpan, body: OxcSpan, first: Option<Token>) {
        let tokens = self.tokens();
        let await_token = if is_await { self.after(first) } else { None };
        let left = self.after(await_token.or(first));
        let left_token = self.first(binding);
        let in_or_of = self.after_node_matching(binding, |t| !tokens.is(t, Kind::RParen));
        let right_token = self.after(in_or_of);
        let right = self.before_node_matching(body, |t| !tokens.is(t, Kind::LParen));
        self.layout.offset(await_token, 0, first);
        self.layout.offset(left, 1, first);
        self.layout.offset(left_token, 1, left);
        self.layout.offset(in_or_of, 1, left_token);
        self.layout.offset(right_token, 1, left_token);
        self.layout.offset(right, 0, left);
        self.body(body, first);
    }
}
