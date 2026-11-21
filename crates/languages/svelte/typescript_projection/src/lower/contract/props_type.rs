//! What types a `$props()` declaration: its TypeScript annotation, or in JavaScript the comment
//! svelte2tsx reads before it.

use oxc_ast::ast::{Comment, Program, VariableDeclaration, VariableDeclarator};
use oxc_syntax::identifier::is_white_space_single_line;
use oxc_syntax::line_terminator::is_line_terminator;
use rsvelte_typescript_tree::document_span;

use super::super::{Buffer, Builder, Node, NodeIdentifier, Span};
use super::{Edit, PropsAnnotation};

#[derive(Clone, Copy)]
pub(in super::super) enum PropsType {
    Annotation(PropsAnnotation),
    /// A one-line `/** @type {{ … }} */`, which svelte2tsx turns into the definition of
    /// `$$ComponentProps`: `tag` is its `@type` and `close` its `*/`.
    ObjectComment {
        tag: Span,
        close: Span,
    },
    /// Another `JSDoc` comment that mentions `@type`, whose cast of `({})` svelte2tsx makes the
    /// props.
    JsDoc(Span),
    /// A plain comment that mentions `@type`: TypeScript reads svelte2tsx's `comment({})` as `{}`.
    Plain,
}

impl Builder<'_> {
    pub(super) fn props_type(
        &self,
        program: &Program<'_>,
        declaration: &VariableDeclaration<'_>,
        declarator: &VariableDeclarator<'_>,
    ) -> Option<PropsType> {
        if let Some(annotation) = declarator.type_annotation.as_deref() {
            return Some(PropsType::Annotation(PropsAnnotation::of(annotation)));
        }
        if !self.tree.javascript {
            return None;
        }
        let text = |comment: &Comment| document_span(comment.span).text(self.source);
        let comment = [declarator.span.start, declaration.span.start]
            .into_iter()
            .find_map(|token| type_comment(&program.comments, token, text))?;
        let span = document_span(comment.span);
        if let Some(tag) = object_type_tag(text(comment)) {
            return Some(PropsType::ObjectComment {
                tag: Span::new(span.start_offset + tag, span.start_offset + tag + 5),
                close: Span::new(span.end_offset - 2, span.end_offset),
            });
        }
        Some(if comment.is_jsdoc() {
            PropsType::JsDoc(span)
        } else {
            PropsType::Plain
        })
    }

    /// The props type that `typed` writes, with the edits that write it.
    pub(super) fn typed_props(
        &mut self,
        typed: PropsType,
        statement: u32,
        edits: &mut Buffer<Edit>,
    ) -> NodeIdentifier {
        match typed {
            PropsType::Annotation(annotation) => self.props_alias(annotation, statement, edits),
            PropsType::ObjectComment { tag, close } => {
                edits.push(Edit {
                    span: tag,
                    replacement: Some(self.tree.push(Node::Identifier("@typedef"))),
                });
                edits.push(Edit {
                    span: close,
                    replacement: Some(self.tree.push(Node::Identifier(
                        " $$ComponentProps */ /** @type {$$ComponentProps} */",
                    ))),
                });
                self.tree.push(Node::Identifier("$$ComponentProps"))
            }
            // The comment moves to the cast, the one copy TypeScript checks, and the declaration
            // reads the cast's type where the comment was.
            PropsType::JsDoc(comment) => {
                let name = self.props_name();
                let value = self.tree.push(Node::CommentCast(comment));
                self.scratch
                    .push(self.tree.push(Node::Const { name, value }));
                let value = self.tree.push(Node::TypeQuery(name));
                edits.push(Edit {
                    span: comment,
                    replacement: Some(self.tree.push(Node::DeclaredType(value))),
                });
                value
            }
            PropsType::Plain => self.tree.push(Node::Identifier("{}")),
        }
    }
}

/// svelte2tsx's comment before `token`: the last that mentions `@type` among TypeScript's leading
/// comments there, which are the comments from the first one after a line break.
fn type_comment<'c, 's>(
    comments: &'c [Comment],
    token: u32,
    text: impl Fn(&Comment) -> &'s str,
) -> Option<&'c Comment> {
    let leading = leading(comments, token);
    let first = leading.iter().position(Comment::preceded_by_newline)?;
    leading[first..]
        .iter()
        .rev()
        .find(|comment| mentions_type(text(comment)))
}

/// Where svelte2tsx writes before the token at `token`: before the comments oxc attaches to it.
pub(super) fn before_comments(comments: &[Comment], token: u32) -> u32 {
    leading(comments, token)
        .first()
        .map_or(token, |comment| comment.span.start)
}

/// The comments oxc attaches to the token at `token`, in order.
fn leading(comments: &[Comment], token: u32) -> &[Comment] {
    let end = comments.partition_point(|comment| comment.span.start < token);
    let start = comments[..end]
        .iter()
        .rposition(|comment| !(comment.is_leading() && comment.attached_to == token))
        .map_or(0, |before| before + 1);
    &comments[start..end]
}

/// svelte2tsx's `/@type\b/`.
fn mentions_type(text: &str) -> bool {
    text.match_indices("@type").any(|(at, tag)| {
        !text[at + tag.len()..]
            .chars()
            .next()
            .is_some_and(|c| c.is_ascii_alphanumeric() || c == '_')
    })
}

/// The offset of `@type` in `comment` when it matches svelte2tsx's
/// `/\/\*\*[^@]*?@type\s*{\s*{.*}\s*}\s*\*\//`, the comment it renames `$$ComponentProps`.
fn object_type_tag(comment: &str) -> Option<u32> {
    let matches_at = |open: usize| {
        let body = &comment[open + 3..];
        let tag = body.find('@')?;
        let rest = body[tag..].strip_prefix("@type")?;
        let rest = skip_space(rest).strip_prefix('{')?;
        let rest = skip_space(rest).strip_prefix('{')?;
        let line = rest.find(is_line_terminator).unwrap_or(rest.len());
        rest[..line]
            .match_indices('}')
            .any(|(at, _)| {
                skip_space(&rest[at + 1..])
                    .strip_prefix('}')
                    .is_some_and(|rest| skip_space(rest).starts_with("*/"))
            })
            .then_some(open + 3 + tag)
    };
    let at = comment
        .match_indices("/**")
        .find_map(|(open, _)| matches_at(open))?;
    // svelte2tsx edits the first `@type` of the comment.
    let first = comment.find("@type").unwrap_or(at);
    u32::try_from(first).ok()
}

/// `text` after a regular expression's `\s*`.
fn skip_space(text: &str) -> &str {
    text.trim_start_matches(|c| is_white_space_single_line(c) || is_line_terminator(c))
}

#[cfg(test)]
mod tests {
    use super::{mentions_type, object_type_tag};

    #[test]
    fn a_comment_mentions_type_where_svelte2tsx_s_pattern_finds_it() {
        assert!(mentions_type("/** @type {X} */"));
        assert!(mentions_type("// @type"));
        assert!(!mentions_type("/** @typedef {X} Y */"));
        assert!(mentions_type("/** @typedef {X} Y @type {X} */"));
    }

    #[test]
    fn only_a_one_line_object_type_is_renamed() {
        assert_eq!(object_type_tag("/** @type {{ n: number }} */"), Some(4));
        assert_eq!(object_type_tag("/** @type { { n: number } } */"), Some(4));
        assert_eq!(object_type_tag("/** @type {Props} */"), None);
        assert_eq!(object_type_tag("/* @type {{ n: number }} */"), None);
        assert_eq!(
            object_type_tag("/** @param {number} x @type {{ n: number }} */"),
            None
        );
        assert_eq!(
            object_type_tag("/**\n * @type {{\n *   n: number\n * }}\n */"),
            None
        );
        assert_eq!(object_type_tag("/** @type {{ n: number }}\n */"), Some(4));
    }
}
