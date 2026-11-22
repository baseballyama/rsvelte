//! svelte2tsx's `getName`: the event a key of `$$Events` or of a typed dispatcher names.

use oxc_ast::ast::{Declaration, Expression, PropertyKey, Statement, TSPropertySignature};
use oxc_parser::Kind;
use rsvelte_svelte_syntax::syntax_tree::TokenType;
use rsvelte_typescript_tree::node_span;

use super::super::super::{Builder, Span};

/// A property signature whose key svelte2tsx's `getName` throws on.
#[derive(Clone, Copy)]
pub(super) struct UnnamedKey {
    property: Span,
    key: Span,
    computed: bool,
}

/// The message of svelte2tsx's `getName` for a key that does not name an event.
pub(super) const UNNAMED_EVENT: &str = "The ComponentEvents interface can only have \
    properties of type Identifier, StringLiteral or ComputedPropertyName. In case of \
    ComputedPropertyName, it must be a const declared within the component and initialized with \
    a string.";

/// svelte2tsx's `getName` of an event's key: the identifier or the string, or the string a
/// top-level variable named in brackets holds; `None` for a string this side cannot hold.
/// `statements` are the instance's top-level ones.
pub(super) fn event_name<'a>(
    statements: &[Statement<'a>],
    property: &TSPropertySignature<'a>,
) -> Result<Option<&'a str>, UnnamedKey> {
    let name = match &property.key {
        PropertyKey::StaticIdentifier(name) if !property.computed => Some(name.name.as_str()),
        PropertyKey::StringLiteral(name) if !property.computed => return Ok(name.value.as_str()),
        PropertyKey::Identifier(variable) if property.computed => {
            top_level_string(statements, variable.name.as_str())
        }
        _ => None,
    };
    name.map(Some).ok_or_else(|| UnnamedKey {
        property: node_span(property),
        key: node_span(&property.key),
        computed: property.computed,
    })
}

/// The string a top-level variable is initialized to, from its first declaration, as
/// svelte2tsx's `getVariableAtTopLevel` finds it.
fn top_level_string<'a>(statements: &[Statement<'a>], name: &str) -> Option<&'a str> {
    statements
        .iter()
        .filter_map(|statement| match statement {
            Statement::VariableDeclaration(declaration) => Some(declaration),
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::VariableDeclaration(declaration) => Some(declaration),
                _ => None,
            },
            _ => None,
        })
        .flat_map(|declaration| &declaration.declarations)
        .find(|declarator| {
            declarator
                .id
                .get_binding_identifier()
                .is_some_and(|binding| binding.name == name)
        })
        .and_then(|declarator| match &declarator.init {
            Some(Expression::StringLiteral(value)) => value.value.as_str(),
            _ => None,
        })
}

impl Builder<'_> {
    /// The key as svelte2tsx's `ComputedPropertyName` spans it: with its brackets, which the
    /// AST leaves out.
    pub(super) fn key_span(
        &self,
        UnnamedKey {
            property,
            key,
            computed,
        }: UnnamedKey,
    ) -> Span {
        if !computed {
            return key;
        }
        let open = self
            .component
            .tokens
            .within(Span::new(property.start_offset, key.start_offset))
            .iter()
            .rfind(|token| token.kind == TokenType::JavaScript(Kind::LBrack));
        let close = self
            .component
            .tokens
            .within(Span::new(key.end_offset, property.end_offset))
            .iter()
            .find(|token| token.kind == TokenType::JavaScript(Kind::RBrack));
        let (Some(open), Some(close)) = (open, close) else {
            unreachable!("a computed key is in brackets");
        };
        Span::new(open.span.start_offset, close.span.end_offset)
    }
}
