//! How JavaScript constructs lay out their tokens, node by node as `ESLint` visits `ESTree`.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    ClassType, FormalParameters, FunctionType, TSNamespaceDeclarationBody, TSThisParameter,
};
use oxc_ast_visit::Visit;
use oxc_parser::Kind;
use oxc_span::{GetSpan, Span as OxcSpan};
use rsvelte_kernel::source::positions::Span;

use super::layout::{Item, Layout};
use super::tokens::{Token, Tokens};

pub(super) struct Script<'s, 'a> {
    pub layout: &'s mut Layout<'a>,
    /// The nodes around the one being laid out, outermost first.
    ancestors: Vec<AstKind<'a>>,
}

impl<'a> Visit<'a> for Script<'_, 'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.enter(kind);
        self.ancestors.push(kind);
    }

    fn leave_node(&mut self, _kind: AstKind<'a>) {
        self.ancestors.pop();
    }
}

/// The document's position type of an oxc span.
pub(super) const fn span(node: OxcSpan) -> Span {
    crate::rules::node_span(node)
}

/// The entries of a parameter list as `ESTree` lists them: `this`, the parameters, the rest.
pub(super) fn parameter_spans(
    this: Option<&TSThisParameter<'_>>,
    parameters: &FormalParameters<'_>,
) -> Vec<OxcSpan> {
    this.map(|t| t.span)
        .into_iter()
        .chain(parameters.items.iter().map(|p| p.span))
        .chain(parameters.rest.as_ref().map(|r| r.span))
        .collect()
}

impl<'s, 'a> Script<'s, 'a> {
    pub(super) const fn new(layout: &'s mut Layout<'a>) -> Self {
        Self {
            layout,
            ancestors: Vec::new(),
        }
    }
}

impl<'a> Script<'_, 'a> {
    /// The parent of the node being laid out.
    pub(super) fn parent(&self) -> Option<AstKind<'a>> {
        self.ancestors.last().copied()
    }

    /// The ancestors of the node being laid out, nearest first.
    pub(super) fn ancestors(&self) -> impl Iterator<Item = AstKind<'a>> + '_ {
        self.ancestors.iter().rev().copied()
    }

    pub(super) const fn tokens(&self) -> &Tokens<'a> {
        &self.layout.tokens
    }

    pub(super) fn first(&self, node: OxcSpan) -> Option<Token> {
        self.tokens().first(span(node))
    }

    pub(super) fn last(&self, node: OxcSpan) -> Option<Token> {
        self.tokens().last(span(node))
    }

    /// `getFirstAndLastTokens(node)`.
    pub(super) fn outer(&self, node: OxcSpan) -> Option<(Token, Token)> {
        self.tokens().outer(span(node), 0)
    }

    pub(super) fn outer_first(&self, node: OxcSpan) -> Option<Token> {
        self.outer(node).map(|(f, _)| f)
    }

    pub(super) fn before_node(&self, node: OxcSpan) -> Option<Token> {
        self.tokens().before_offset(node.start)
    }

    pub(super) fn after_node(&self, node: OxcSpan) -> Option<Token> {
        self.tokens().after_offset(node.end)
    }

    pub(super) fn after_node_matching(
        &self,
        node: OxcSpan,
        f: impl Fn(Token) -> bool,
    ) -> Option<Token> {
        self.tokens().after_matching(node.end, f)
    }

    pub(super) fn before_node_matching(
        &self,
        node: OxcSpan,
        f: impl Fn(Token) -> bool,
    ) -> Option<Token> {
        self.tokens().before_matching(node.start, f)
    }

    pub(super) fn after(&self, token: Option<Token>) -> Option<Token> {
        self.tokens().after(token?)
    }

    pub(super) fn is(&self, token: Option<Token>, kind: Kind) -> bool {
        token.is_some_and(|t| self.tokens().is(t, kind))
    }

    pub(super) fn text(&self, token: Token) -> &str {
        self.tokens().text(token)
    }

    pub(super) const fn item(node: OxcSpan) -> Item {
        Item::Node(span(node))
    }

    pub(super) fn items(nodes: impl IntoIterator<Item = OxcSpan>) -> Vec<Option<Item>> {
        nodes.into_iter().map(|n| Some(Self::item(n))).collect()
    }

    /// Lays out one node before its children, as `ESLint` calls its handlers on entering it.
    fn enter(&mut self, kind: AstKind<'a>) {
        if self.is_statement(kind) {
            self.semicolon(kind.span());
        }
        if is_expression(kind) || is_parenthesizable_type(kind) {
            self.parentheses(kind.span());
        }
        self.lay_out(kind);
    }

    /// A namespace that is the body of another, `B` in `namespace A.B {}`: `ESTree` has one
    /// declaration named `A.B`.
    pub(super) fn is_inner_namespace(&self, kind: AstKind<'a>) -> bool {
        let AstKind::TSNamespaceDeclaration(inner) = kind else {
            return false;
        };
        matches!(
            self.parent(),
            Some(AstKind::TSNamespaceDeclaration(outer))
                if matches!(&outer.body, TSNamespaceDeclarationBody::TSNamespaceDeclaration(b)
                    if std::ptr::eq(&raw const **b, inner))
        )
    }

    /// `:statement`, `PropertyDefinition` and the TypeScript declarations and members whose `;`
    /// upstream places.
    fn is_statement(&self, kind: AstKind<'a>) -> bool {
        match kind {
            AstKind::Function(f) => f.r#type == FunctionType::FunctionDeclaration,
            AstKind::Class(c) => c.r#type == ClassType::ClassDeclaration,
            AstKind::MethodDefinition(m) => m.r#type.is_abstract(),
            AstKind::TSNamespaceDeclaration(_) => !self.is_inner_namespace(kind),
            AstKind::BlockStatement(_)
            | AstKind::ExpressionStatement(_)
            | AstKind::Directive(_)
            | AstKind::IfStatement(_)
            | AstKind::DoWhileStatement(_)
            | AstKind::WhileStatement(_)
            | AstKind::ForStatement(_)
            | AstKind::ForInStatement(_)
            | AstKind::ForOfStatement(_)
            | AstKind::ContinueStatement(_)
            | AstKind::BreakStatement(_)
            | AstKind::ReturnStatement(_)
            | AstKind::WithStatement(_)
            | AstKind::SwitchStatement(_)
            | AstKind::LabeledStatement(_)
            | AstKind::ThrowStatement(_)
            | AstKind::TryStatement(_)
            | AstKind::DebuggerStatement(_)
            | AstKind::EmptyStatement(_)
            | AstKind::VariableDeclaration(_)
            | AstKind::ImportDeclaration(_)
            | AstKind::ExportDeclaration(_)
            | AstKind::ExportNamedDeclaration(_)
            | AstKind::ExportFromDeclaration(_)
            | AstKind::ExportDefaultDeclaration(_)
            | AstKind::ExportAllDeclaration(_)
            | AstKind::PropertyDefinition(_)
            | AstKind::AccessorProperty(_)
            | AstKind::TSTypeAliasDeclaration(_)
            | AstKind::TSInterfaceDeclaration(_)
            | AstKind::TSEnumDeclaration(_)
            | AstKind::TSEnumMember(_)
            | AstKind::TSExternalModuleDeclaration(_)
            | AstKind::TSGlobalDeclaration(_)
            | AstKind::TSImportEqualsDeclaration(_)
            | AstKind::TSNamespaceExportDeclaration(_)
            | AstKind::TSTypeParameterDeclaration(_)
            | AstKind::TSPropertySignature(_)
            | AstKind::TSIndexSignature(_)
            | AstKind::TSMethodSignature(_)
            | AstKind::TSCallSignatureDeclaration(_)
            | AstKind::TSConstructSignatureDeclaration(_) => true,
            _ => false,
        }
    }

    /// `:statement`: a semicolon that ends its line stays with the statement's first token.
    pub(super) fn semicolon(&mut self, node: OxcSpan) {
        let (Some(first), Some(last)) = (self.first(node), self.last(node)) else {
            return;
        };
        let tokens = self.tokens();
        if tokens.is(last, Kind::Semicolon) && first != last {
            let line = |t: Token| tokens.line(tokens.span(t).start_offset);
            if tokens
                .after(last)
                .is_none_or(|next| line(last) < line(next))
            {
                self.layout.offset(Some(last), 0, Some(first));
            }
        }
    }

    /// `:expression`: parentheses around the syntax at `node`.
    pub(super) fn parentheses(&mut self, node: OxcSpan) {
        let tokens = self.tokens();
        let (Some(mut first), Some(mut left), Some(mut right)) = (
            tokens.first(span(node)),
            tokens.before_offset(node.start),
            tokens.after_offset(node.end),
        ) else {
            return;
        };
        loop {
            let tokens = self.tokens();
            if !(tokens.is(left, Kind::LParen) && tokens.is(right, Kind::RParen)) {
                return;
            }
            self.layout.offset(Some(first), 1, Some(left));
            self.layout.offset(Some(right), 0, Some(left));
            first = left;
            let tokens = self.tokens();
            match (tokens.before(left), tokens.after(right)) {
                (Some(l), Some(r)) => (left, right) = (l, r),
                _ => return,
            }
        }
    }

    /// The body's first token: a block stays at `base`, a statement is indented.
    pub(super) fn body(&mut self, body: OxcSpan, base: Option<Token>) {
        let first = self.first(body);
        let offset = u32::from(!self.is(first, Kind::LCurly));
        self.layout.offset(first, offset, base);
    }
}

/// `:expression`: an `ESTree` type that ends with `Expression` or `Literal`, an identifier, or a
/// meta property.
const fn is_expression(kind: AstKind<'_>) -> bool {
    match kind {
        AstKind::Function(f) => matches!(
            f.r#type,
            FunctionType::FunctionExpression | FunctionType::TSEmptyBodyFunctionExpression
        ),
        AstKind::Class(c) => matches!(c.r#type, ClassType::ClassExpression),
        AstKind::IdentifierReference(_)
        | AstKind::BindingIdentifier(_)
        | AstKind::IdentifierName(_)
        | AstKind::LabelIdentifier(_)
        | AstKind::TSThisParameter(_)
        | AstKind::TSIndexSignatureName(_)
        | AstKind::BooleanLiteral(_)
        | AstKind::NullLiteral(_)
        | AstKind::NumericLiteral(_)
        | AstKind::StringLiteral(_)
        | AstKind::BigIntLiteral(_)
        | AstKind::RegExpLiteral(_)
        | AstKind::TemplateLiteral(_)
        | AstKind::ThisExpression(_)
        | AstKind::ArrayExpression(_)
        | AstKind::ObjectExpression(_)
        | AstKind::ComputedMemberExpression(_)
        | AstKind::StaticMemberExpression(_)
        | AstKind::PrivateFieldExpression(_)
        | AstKind::CallExpression(_)
        | AstKind::NewExpression(_)
        | AstKind::ImportMeta(_)
        | AstKind::NewTarget(_)
        | AstKind::UpdateExpression(_)
        | AstKind::UnaryExpression(_)
        | AstKind::BinaryExpression(_)
        | AstKind::PrivateInExpression(_)
        | AstKind::LogicalExpression(_)
        | AstKind::ConditionalExpression(_)
        | AstKind::AssignmentExpression(_)
        | AstKind::SequenceExpression(_)
        | AstKind::AwaitExpression(_)
        | AstKind::ChainExpression(_)
        | AstKind::ArrowFunctionExpression(_)
        | AstKind::YieldExpression(_)
        | AstKind::ImportExpression(_)
        | AstKind::TaggedTemplateExpression(_)
        | AstKind::TSAsExpression(_)
        | AstKind::TSSatisfiesExpression(_)
        | AstKind::TSNonNullExpression(_)
        | AstKind::TSInstantiationExpression(_) => true,
        _ => false,
    }
}

/// The type syntax whose parentheses upstream lays out.
const fn is_parenthesizable_type(kind: AstKind<'_>) -> bool {
    matches!(
        kind,
        AstKind::TSAnyKeyword(_)
            | AstKind::TSArrayType(_)
            | AstKind::TSBigIntKeyword(_)
            | AstKind::TSBooleanKeyword(_)
            | AstKind::TSConditionalType(_)
            | AstKind::TSConstructorType(_)
            | AstKind::TSFunctionType(_)
            | AstKind::TSImportType(_)
            | AstKind::TSIndexedAccessType(_)
            | AstKind::TSInferType(_)
            | AstKind::TSIntersectionType(_)
            | AstKind::TSIntrinsicKeyword(_)
            | AstKind::TSLiteralType(_)
            | AstKind::TSMappedType(_)
            | AstKind::TSNamedTupleMember(_)
            | AstKind::TSNeverKeyword(_)
            | AstKind::TSNullKeyword(_)
            | AstKind::TSNumberKeyword(_)
            | AstKind::TSObjectKeyword(_)
            | AstKind::TSOptionalType(_)
            | AstKind::TSRestType(_)
            | AstKind::TSStringKeyword(_)
            | AstKind::TSSymbolKeyword(_)
            | AstKind::TSTemplateLiteralType(_)
            | AstKind::TSThisType(_)
            | AstKind::TSTupleType(_)
            | AstKind::TSTypeLiteral(_)
            | AstKind::TSTypeOperator(_)
            | AstKind::TSTypePredicate(_)
            | AstKind::TSTypeQuery(_)
            | AstKind::TSTypeReference(_)
            | AstKind::TSUndefinedKeyword(_)
            | AstKind::TSUnionType(_)
            | AstKind::TSUnknownKeyword(_)
            | AstKind::TSVoidKeyword(_)
    )
}

mod declarations;
mod forms;
mod kinds;
mod types;
mod typescript;
