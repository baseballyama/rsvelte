//! Functions, imports and control statements.

use rsvelte_typescript_syntax::lexer::T;
use rsvelte_typescript_syntax::syntax_tree::Control;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier};

use super::Script;
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl Script<'_, '_> {
    pub(super) fn function(
        &mut self,
        node: NodeIdentifier,
        name: Option<NodeIdentifier>,
        parameters: &[NodeIdentifier],
        body: NodeIdentifier,
        first: Option<Token>,
    ) {
        let tokens = &self.layout.tokens;
        let is_paren = |t: Token| tokens.is(t, T::LParen);
        let left = match parameters.first() {
            Some(&p) => self.before_node_matching(p, is_paren),
            None if body.is_none() => first.and_then(|f| {
                if is_paren(f) {
                    Some(f)
                } else {
                    let from = name
                        .and_then(|n| self.span(n))
                        .map_or_else(|| tokens.span(f).end_offset, |s| s.end_offset);
                    tokens.after_matching(from, is_paren)
                }
            }),
            None => self
                .before_node(body)
                .and_then(|b| tokens.before_matching(tokens.span(b).start_offset, is_paren)),
        };
        let Some(f) = first else {
            return;
        };
        let body_base = if tokens.is_punctuator(f) {
            self.parent(node).and_then(|p| self.first(p))
        } else {
            let name_start = name.and_then(|n| self.span(n)).map(|s| s.start_offset);
            let mut offset = 0;
            let between: Vec<Token> = left
                .map(|l| tokens.between(f, l).collect())
                .unwrap_or_default();
            for t in between {
                let tokens = &self.layout.tokens;
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
        let right = self.closing(parameters.last().copied(), left, T::RParen);
        self.layout.offset(left, 1, body_base);
        self.list_from(left, &self.items(parameters), right, 1);
        let body_token = self.first(body);
        self.layout.offset(body_token, 0, body_base);
    }

    pub(super) fn import(
        &mut self,
        node: NodeIdentifier,
        specifiers: &[NodeIdentifier],
        source: NodeIdentifier,
        first: Option<Token>,
    ) {
        let js = self.javascript;
        let (Some(import), Some(source_token)) = (first, self.first(source)) else {
            return;
        };
        let tokens = &self.layout.tokens;
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
        for &specifier in specifiers {
            if matches!(js.kind(specifier), Kind::ImportNamed { .. }) {
                named.push(specifier);
            } else if let Some(span) = self.span(specifier) {
                let remove: Vec<Token> = tokens.within(span).skip(1).collect();
                before.retain(|t| !remove.contains(t));
            }
        }
        if let (Some(&first_named), Some(&last_named)) = (named.first(), named.last()) {
            let left = self.before_node(first_named);
            let right = self.after_node_matching(last_named, |t| tokens.is(t, T::RBrace));
            if let (Some(l), Some(r)) = (left, right) {
                before.retain(|&t| !(t > l && t <= r));
            }
            self.list_from(left, &self.items(&named), right, 1);
        }
        let tokens = &self.layout.tokens;
        let braces = before
            .iter()
            .all(|&t| tokens.is(t, T::LBrace) || tokens.is(t, T::RBrace));
        self.layout.offset_all(before, u32::from(!braces), first);
        if from_token.is_some() {
            self.layout.offset(from_token, 0, first);
            self.layout.offset_all(after, 1, from_token);
        }
        self.attributes(node, source, first);
    }

    /// `with { … }` after a module source.
    pub(super) fn attributes(
        &mut self,
        node: NodeIdentifier,
        source: NodeIdentifier,
        first: Option<Token>,
    ) {
        let tokens = &self.layout.tokens;
        let Some(span) = self.span(node) else {
            return;
        };
        let (Some(last), Some(source_last)) = (
            tokens.last_matching(span, |t| !tokens.is(t, T::Semi)),
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
    pub(super) fn specifier(&mut self, node: NodeIdentifier) {
        let Some(span) = self.span(node) else {
            return;
        };
        let mut tokens: Vec<Token> = self.layout.tokens.within(span).collect();
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

    #[expect(clippy::too_many_lines, reason = "one arm per statement")]
    pub(super) fn control(
        &mut self,
        node: NodeIdentifier,
        control: Control<'_>,
        first: Option<Token>,
    ) {
        let tokens = &self.layout.tokens;
        match control {
            Control::Try {
                block,
                handler,
                finalizer,
            } => {
                let block_token = self.first(block);
                self.layout.offset(block_token, 0, first);
                if let Some(handler) = handler {
                    let catch = self.first(handler);
                    self.layout.offset(catch, 0, first);
                }
                if let Some(finalizer) = finalizer {
                    let finally = self.before_node(finalizer);
                    let finally_block = self.first(finalizer);
                    self.layout.offset(finally, 0, first);
                    self.layout.offset(finally_block, 0, first);
                }
            }
            Control::Catch { parameter, body } => {
                if let Some(parameter) = parameter {
                    let left = self.before_node(parameter);
                    let right = self.after_node(parameter);
                    self.layout.offset(left, 1, first);
                    self.list_from(left, &[self.node(parameter)], right, 1);
                }
                let body_token = self.first(body);
                self.layout.offset(body_token, 0, first);
            }
            Control::While { test, body, is_do } => {
                if is_do {
                    let while_token = self.after_node_matching(body, |t| !tokens.is(t, T::RParen));
                    let left = while_token.and_then(|w| tokens.after(w));
                    let right = self.after_node(test);
                    self.body(body, first);
                    self.layout.offset(while_token, 0, first);
                    self.layout.offset(left, 1, while_token);
                    self.list_from(left, &[self.node(test)], right, 1);
                } else {
                    let left = first.and_then(|f| tokens.after(f));
                    let right = self.before_node_matching(body, |t| tokens.is(t, T::RParen));
                    self.layout.offset(left, 1, first);
                    self.layout.offset(right, 0, left);
                    self.body(body, first);
                }
            }
            Control::ForEach {
                left: binding,
                body,
                is_await,
                ..
            } => {
                let await_token = if is_await {
                    first.and_then(|f| tokens.after(f))
                } else {
                    None
                };
                let left = await_token.or(first).and_then(|t| tokens.after(t));
                let left_token = self.first(binding);
                let in_or_of = self.after_node_matching(binding, |t| !tokens.is(t, T::RParen));
                let right_token = in_or_of.and_then(|t| tokens.after(t));
                let right = self.before_node_matching(body, |t| !tokens.is(t, T::LParen));
                self.layout.offset(await_token, 0, first);
                self.layout.offset(left, 1, first);
                self.layout.offset(left_token, 1, left);
                self.layout.offset(in_or_of, 1, left_token);
                self.layout.offset(right_token, 1, left_token);
                self.layout.offset(right, 0, left);
                self.body(body, first);
            }
            Control::Switch {
                discriminant,
                cases,
            } => {
                let parens = self.outer(discriminant);
                let left = parens.map(|(l, _)| l);
                let right = parens.map(|(_, r)| r);
                let left_brace = right.and_then(|r| tokens.after(r));
                let right_brace = self.last(node);
                self.layout.offset(left, 1, first);
                self.list_from(left, &[self.node(discriminant)], right, 1);
                self.layout.offset(left_brace, 0, first);
                let offset = self.layout.options.switch_case;
                self.list_from(left_brace, &self.items(cases), right_brace, offset);
            }
            Control::Case { test, consequent } => {
                if let Some(test) = test {
                    let test_tokens = self.outer(test);
                    let colon = test_tokens.and_then(|(_, l)| tokens.after(l));
                    self.layout.offset(test_tokens.map(|(f, _)| f), 1, first);
                    self.layout.offset(colon, 1, first);
                } else {
                    let colon = first.and_then(|f| tokens.after(f));
                    self.layout.offset(colon, 1, first);
                }
                if let [only] = consequent
                    && matches!(self.javascript.kind(*only), Kind::Block(_))
                {
                    let block = self.first(*only);
                    self.layout.offset(block, 0, first);
                } else {
                    for &statement in consequent {
                        let token = self.outer(statement).map(|(f, _)| f);
                        self.layout.offset(token, 1, first);
                    }
                }
            }
            Control::Jump { label: Some(_), .. } => {
                let next = first.and_then(|f| tokens.after(f));
                self.layout.offset(next, 1, first);
            }
            Control::Labeled { .. } => {
                let colon = first.and_then(|f| tokens.after(f));
                let body = colon.and_then(|c| tokens.after(c));
                self.layout.offset(colon, 1, first);
                self.layout.offset(body, 1, first);
            }
            Control::ExportList {
                specifiers, source, ..
            } => {
                let Some(export) = first else {
                    return;
                };
                let left_braces: Vec<Token> =
                    specifiers.first().and_then(|&s| self.first(s)).map_or_else(
                        || tokens.after(export).into_iter().collect(),
                        |s| tokens.between(export, s).collect(),
                    );
                let is_close = |t: Token| tokens.is(t, T::RBrace);
                let right_brace = source.map_or_else(
                    || {
                        self.span(node)
                            .and_then(|s| tokens.last_matching(s, is_close))
                    },
                    |source| self.before_node_matching(source, is_close),
                );
                let base = left_braces.last().copied();
                self.layout.offset_all(left_braces, 0, first);
                self.list_from(base, &self.items(specifiers), right_brace, 1);
                if let (Some(source), Some(right_brace)) = (source, right_brace) {
                    let tokens = &self.layout.tokens;
                    let Some(source_token) = self.first(source) else {
                        return;
                    };
                    let mut between: Vec<Token> =
                        tokens.between(right_brace, source_token).collect();
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
            Control::ExportSpecifier { .. } => self.specifier(node),
            Control::ExportAll {
                source, exported, ..
            } => {
                let (Some(export), Some(source_token)) = (first, self.first(source)) else {
                    return;
                };
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
                if exported.is_none() {
                    self.layout.offset_all(before.to_vec(), 1, first);
                } else if let Some(as_index) = before.iter().position(|&t| tokens.text(t) == "as") {
                    self.layout
                        .offset_all(before[..as_index].to_vec(), 1, first);
                    let base = as_index.checked_sub(1).map(|i| before[i]);
                    self.layout.offset_all(before[as_index..].to_vec(), 1, base);
                }
                self.layout.offset(Some(from), 0, first);
                self.layout.offset_all(after, 1, Some(from));
                self.attributes(node, source, first);
            }
            Control::Throw(_) => {
                let next = first.and_then(|f| tokens.after(f));
                self.layout.offset(next, 1, first);
            }
            Control::Jump { .. } | Control::Debugger => {}
        }
    }
}
