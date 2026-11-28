//! An untyped `$props()` object pattern, which svelte2tsx types as `$$ComponentProps` from the
//! pattern's syntax alone.

use oxc_ast::ast::{
    Argument, BindingPattern, CallExpression, Expression, ObjectPattern, PropertyKey,
};
use oxc_parser::Kind;
use rsvelte_svelte_syntax::syntax_tree::TokenType;
use rsvelte_typescript_tree::{document_span, node_span};

use super::super::{Buffer, Builder, Node, NodeIdentifier, Span};
use super::Edit;

impl Builder<'_> {
    /// Declares `$$ComponentProps` for `object` and types the pattern with it: before `statement`
    /// and after the pattern's `end` in TypeScript, in `JSDoc` at the declarator's start `at` in
    /// JavaScript. Without a prop, svelte2tsx declares nothing and its props read as `any`.
    pub(super) fn untyped_props(
        &mut self,
        object: &ObjectPattern<'_>,
        [statement, at, end]: [u32; 3],
        edits: &mut Buffer<Edit>,
    ) -> NodeIdentifier {
        let mut properties = Buffer::new(0);
        let mut unknown = object.rest.is_some();
        for property in &object.properties {
            let (value, default) = match &property.value {
                BindingPattern::AssignmentPattern(assignment) => {
                    (&assignment.left, Some(&assignment.right))
                }
                value => (value, None),
            };
            let (PropertyKey::StaticIdentifier(key), BindingPattern::BindingIdentifier(_)) =
                (&property.key, value)
            else {
                unknown = true;
                continue;
            };
            let name = self
                .tree
                .push(Node::UnmappedSource(document_span(key.span)));
            let (separator, value) = match default {
                Some(default) => ("?: ", self.default_type(default)),
                None => (": ", self.tree.push(Node::Identifier("any"))),
            };
            let separator = self.tree.push(Node::Identifier(separator));
            let parts = self.tree.list(&[name, separator, value]);
            properties.push(self.tree.push(Node::Parts(parts)));
        }
        let value = match (properties.is_empty(), unknown) {
            (true, false) => return self.tree.push(Node::Identifier("any")),
            (true, true) => self.tree.push(Node::Identifier("Record<string, any>")),
            (false, unknown) => {
                let properties = self.tree.list(&properties);
                let literal = self.tree.push(Node::InlineTypeLiteral(properties));
                if unknown {
                    let rest = self.tree.push(Node::Identifier(" & Record<string, any>"));
                    let parts = self.tree.list(&[literal, rest]);
                    self.tree.push(Node::Parts(parts))
                } else {
                    literal
                }
            }
        };
        let name = self.tree.push(Node::Identifier("$$ComponentProps"));
        // svelte2tsx writes the alias between ignore comments, and the `JSDoc` at TypeScript's
        // `pos` of the declarator, after the token before it, where svelte-check reports what is
        // found in it.
        let (alias, annotation, [alias_at, annotation_at]) = if self.tree.javascript {
            let tokens = &self.component.tokens;
            let written = tokens
                .before(at)
                .map(|token| tokens.get(token).span.end_offset)
                .expect("a declarator follows its keyword or a comma");
            let value = self.tree.push(Node::Located {
                value,
                open: Span::new(written, written),
                close: None,
            });
            let definition = self.one_line(["/** @typedef {", "} $$ComponentProps */"], value);
            (definition, Node::DeclaredType(name), [at, at])
        } else {
            let alias = self.one_line(["type $$ComponentProps = ", "; "], value);
            let alias = self.tree.push(Node::IgnoredRange(alias));
            (alias, Node::TypeAnnotation(name), [statement, end])
        };
        for (node, at) in [
            (alias, alias_at),
            (self.tree.push(annotation), annotation_at),
        ] {
            edits.push(Edit {
                span: Span::new(at, at),
                replacement: Some(node),
            });
        }
        name
    }

    /// `value` between `before` and `after`, on the line of the statement it precedes, as
    /// svelte2tsx writes it, so that a comment directive before the statement still reaches it.
    fn one_line(
        &mut self,
        [before, after]: [&'static str; 2],
        value: NodeIdentifier,
    ) -> NodeIdentifier {
        let before = self.tree.push(Node::Identifier(before));
        let after = self.tree.push(Node::Identifier(after));
        let parts = self.tree.list(&[before, value, after]);
        self.tree.push(Node::Parts(parts))
    }

    /// svelte2tsx's type for a prop's default, read from its syntax.
    fn default_type(&mut self, default: &Expression<'_>) -> NodeIdentifier {
        let initializer = match default {
            _ if self.parenthesized(default, 1) => None,
            Expression::CallExpression(call) if calls_bindable(call) => call
                .arguments
                .first()
                .and_then(Argument::as_expression)
                .filter(|argument| !self.parenthesized(argument, 2)),
            default => Some(default),
        };
        let text = match initializer {
            Some(Expression::TSAsExpression(cast)) => {
                return self
                    .tree
                    .push(Node::UnmappedSource(node_span(&cast.type_annotation)));
            }
            Some(Expression::Identifier(name)) if name.name != "undefined" => {
                let name = self
                    .tree
                    .push(Node::UnmappedSource(document_span(name.span)));
                return self.tree.push(Node::TypeQuery(name));
            }
            Some(Expression::StringLiteral(_)) => "string",
            Some(Expression::NumericLiteral(_)) => "number",
            Some(Expression::BooleanLiteral(_)) => "boolean",
            Some(Expression::ArrowFunctionExpression(_)) => "Function",
            Some(Expression::ObjectExpression(_)) => "Record<string, any>",
            Some(Expression::ArrayExpression(_)) => "any[]",
            _ => "any",
        };
        self.tree.push(Node::Identifier(text))
    }

    /// Whether the `depth`th opening token before `expression` is a parenthesis: the tree drops the
    /// parentheses that svelte2tsx's syntax checks see. An argument has its call's at depth 1.
    fn parenthesized(&self, expression: &Expression<'_>, depth: usize) -> bool {
        let tokens = &self.component.tokens;
        let mut offset = node_span(expression).start_offset;
        (0..depth).all(|_| {
            let Some(token) = tokens.before(offset).map(|token| tokens.get(token)) else {
                return false;
            };
            offset = token.span.start_offset;
            token.kind == TokenType::JavaScript(Kind::LParen)
        })
    }
}

/// svelte2tsx's `$bindable(…)`: a call of that identifier as written.
fn calls_bindable(call: &CallExpression<'_>) -> bool {
    matches!(&call.callee, Expression::Identifier(callee) if callee.name == "$bindable")
}
