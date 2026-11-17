use oxc_allocator::Allocator;
use oxc_ast::ast::{
    Comment, Expression, FormalParameter, FormalParameters, Program, Statement,
    TSTypeParameterDeclaration, VariableDeclaration,
};
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::{Visit, VisitMut};
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Kind, Parser, Token};
use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

mod check;
mod parentheses;
mod program;
mod recorded;
pub use program::Rejected;
pub use recorded::{Part as RecordedPart, Recorded};

/// No rule unchecked: the list a host starts with.
const NOTHING: &[&str] = &[];

use crate::acorn_grammar::Rejection;
use crate::syntax_error::SyntaxError;
use crate::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier,
    ProgramIdentifier, Trees, TypeParametersIdentifier,
};

/// Parses parts of one document into its arena.
pub struct Builder<'a> {
    allocator: &'a Allocator,
    source_text: &'a str,
    programs: Vec<Program<'a>>,
    expressions: Vec<Expression<'a>>,
    patterns: Vec<FormalParameter<'a>>,
    parameters: Vec<FormalParameters<'a>>,
    declarations: Vec<VariableDeclaration<'a>>,
    type_parameters: Vec<TSTypeParameterDeclaration<'a>>,
    comments: Vec<Comment>,
    recorded: RecordedPart<'a>,
    wrapped: String,
    unchecked: &'static &'static [&'static str],
    unchecked_errors: Vec<SyntaxError>,
    as_acorn: bool,
    acorn_rejection: Option<(u32, Rejection)>,
    parentheses: Vec<(oxc_span::Span, u8)>,
}

/// The tree of a part the builder just read.
#[derive(Clone, Copy)]
enum Part<'b, 'a> {
    Program(&'b Program<'a>),
    Expression(&'b Expression<'a>),
    Statement(&'b Statement<'a>),
}

impl<'a> Part<'_, 'a> {
    fn walk<V: Visit<'a>>(self, visitor: &mut V) {
        match self {
            Self::Program(program) => visitor.visit_program(program),
            Self::Expression(expression) => visitor.visit_expression(expression),
            Self::Statement(statement) => visitor.visit_statement(statement),
        }
    }
}

impl std::fmt::Debug for Builder<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Builder")
            .field("programs", &self.programs.len())
            .field("expressions", &self.expressions.len())
            .finish_non_exhaustive()
    }
}

impl<'a> Builder<'a> {
    pub(crate) const fn new(allocator: &'a Allocator, source_text: &'a str) -> Self {
        Self {
            allocator,
            source_text,
            programs: Vec::new(),
            expressions: Vec::new(),
            patterns: Vec::new(),
            parameters: Vec::new(),
            declarations: Vec::new(),
            type_parameters: Vec::new(),
            comments: Vec::new(),
            recorded: RecordedPart {
                tokens: &[],
                comments: &[],
                shift: 0,
            },
            wrapped: String::new(),
            unchecked: &NOTHING,
            unchecked_errors: Vec::new(),
            as_acorn: false,
            acorn_rejection: None,
            parentheses: Vec::new(),
        }
    }

    /// Lets the parts break the TypeScript grammar rules with these error codes, which oxc checks
    /// and the host's own parser does not.
    pub const fn leave_unchecked(&mut self, codes: &'static &'static [&'static str]) {
        self.unchecked = codes;
    }

    /// Reads the parts as acorn, which the host's compiler parses with: lets pass an error where
    /// acorn reads the text, and records where acorn first stops in syntax oxc parses, which
    /// [`crate::Tree::acorn_rejection`] reads.
    pub const fn read_as_acorn(&mut self) {
        self.as_acorn = true;
    }

    pub(crate) fn finish(self) -> Trees<'a> {
        Trees {
            source_text: self.source_text,
            programs: self.programs,
            expressions: self.expressions,
            patterns: self.patterns,
            parameters: self.parameters,
            declarations: self.declarations,
            type_parameters: self.type_parameters,
            comments: self.comments,
            rare: (self.acorn_rejection.is_some() || !self.parentheses.is_empty()).then(|| {
                let mut parentheses = self.parentheses;
                parentheses.sort_unstable_by_key(|&(span, _)| (span.start, span.end));
                Box::new(crate::Rare {
                    acorn_rejection: self.acorn_rejection,
                    parentheses,
                })
            }),
            unchecked: self.unchecked,
            unchecked_errors: (!self.unchecked_errors.is_empty())
                .then(|| Box::new(self.unchecked_errors)),
            as_acorn: self.as_acorn,
        }
    }

    /// The document, in the arena.
    #[must_use]
    pub const fn source_text(&self) -> &'a str {
        self.source_text
    }

    /// Builds the nodes a host makes itself, such as the declaration a `{@const}` tag stands for.
    #[must_use]
    pub fn nodes(&self) -> AstBuilder<'a> {
        AstBuilder::new(self.allocator)
    }

    /// The arena, for a host that copies nodes into it or builds them with its own constructors.
    #[must_use]
    pub const fn allocator(&self) -> &'a Allocator {
        self.allocator
    }

    /// The tokens and comments of the part read last, in document order.
    #[must_use]
    pub const fn recorded(&self) -> RecordedPart<'a> {
        self.recorded
    }

    /// Parses the expression that starts at `start` in the document up to `limit`, as if it
    /// ended there, and returns where it ends.
    ///
    /// # Errors
    ///
    /// The first syntax error in the expression.
    pub fn read_expression_before(
        &mut self,
        start: u32,
        limit: u32,
        source_type: SourceType,
    ) -> Result<(Expression<'a>, u32), SyntaxError> {
        let text = &self.source_text[..limit as usize];
        let parsed = Parser::new(self.allocator, text, source_type)
            .with_options(parentheses::options(false))
            .with_config(TokensParserConfig)
            .parse_expression_at(start)
            .map_err(|error| self.fatal(error, text, start, 0))?;
        let part = Part::Expression(&parsed.expression);
        self.check(
            &parsed.diagnostics,
            (text, start, 0),
            (
                &parsed.tokens,
                parsed.next_token,
                &parsed.irregular_whitespaces,
            ),
            (part, source_type),
        )?;
        // Upstream refuses a sequence as an attribute's value unless parentheses wrap it.
        if let Expression::SequenceExpression(sequence) = &parsed.expression {
            let pairs = (parsed.tokens.iter())
                .take_while(|t| t.kind() == Kind::LParen && t.start() < sequence.span.start)
                .count();
            if pairs > 0 {
                self.record_parentheses(sequence.span, u8::try_from(pairs).unwrap_or(u8::MAX));
            }
        }
        self.comments.extend_from_slice(&parsed.comments);
        self.record(
            parsed.tokens.into_arena_slice(),
            parsed.comments.into_arena_slice(),
            0,
        );
        Ok((parsed.expression, parsed.end))
    }

    /// How many comments the parts read so far have, to [`Self::rewind`] to.
    #[must_use]
    pub const fn mark(&self) -> usize {
        self.comments.len()
    }

    /// Forgets the comments of the parts read after `mark`, for a host that reads a part again.
    pub fn rewind(&mut self, mark: usize) {
        self.comments.truncate(mark);
    }

    /// Parses the statement that starts at `start`, such as the declaration of a `{let a = 1}`
    /// tag, and returns where it ends.
    ///
    /// # Errors
    ///
    /// The first syntax error in the statement.
    pub fn read_statement_at(
        &mut self,
        start: u32,
        source_type: SourceType,
    ) -> Result<(Statement<'a>, u32), SyntaxError> {
        let parsed = Parser::new(self.allocator, self.source_text, source_type)
            .with_options(parentheses::options(false))
            .with_config(TokensParserConfig)
            .parse_statement_at(start)
            .map_err(|error| self.fatal(error, self.source_text, start, 0))?;
        let part = Part::Statement(&parsed.statement);
        self.check(
            &parsed.diagnostics,
            (self.source_text, start, 0),
            (
                &parsed.tokens,
                parsed.next_token,
                &parsed.irregular_whitespaces,
            ),
            (part, source_type),
        )?;
        self.comments.extend_from_slice(&parsed.comments);
        self.record(
            parsed.tokens.into_arena_slice(),
            parsed.comments.into_arena_slice(),
            0,
        );
        Ok((parsed.statement, parsed.end))
    }

    /// Parses `range` of the document as one binding pattern and its type annotation, such as
    /// `{ a, b }: Item` after an `{#each … as`.
    ///
    /// # Errors
    ///
    /// The first syntax error, or a range that is not one pattern.
    pub fn pattern(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<PatternIdentifier, SyntaxError> {
        let pattern = self.read_pattern(range, source_type)?;
        Ok(self.keep_pattern(pattern))
    }

    /// [`Self::pattern`], for a host that takes the pattern apart.
    ///
    /// # Errors
    ///
    /// The first syntax error, or a range that is not one pattern.
    pub fn read_pattern(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<FormalParameter<'a>, SyntaxError> {
        let parameters = self.read_parameters(range, source_type)?;
        let mut items = parameters.items.into_iter();
        match (items.next(), items.next(), parameters.rest) {
            (Some(pattern), None, None) => Ok(pattern),
            _ => Err(refused("expected one pattern", range)),
        }
    }

    /// Parses `range` of the document as a parameter list without its parentheses, such as a
    /// snippet's.
    ///
    /// # Errors
    ///
    /// The first syntax error.
    pub fn parameters(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<ParametersIdentifier, SyntaxError> {
        let parameters = self.read_parameters(range, source_type)?;
        let identifier = ParametersIdentifier::at(self.parameters.len());
        self.parameters.push(parameters);
        Ok(identifier)
    }

    /// Parses `range` of the document as a type parameter list without its angle brackets, such
    /// as a Svelte `<script generics="…">`'s.
    ///
    /// # Errors
    ///
    /// The first syntax error.
    pub fn type_parameters(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<TypeParametersIdentifier, SyntaxError> {
        // An arrow's `<T extends …>` would read as a type assertion, so a function expression.
        // The wrapper's own tokens: `function` and `<` first, and `>`, `(`, `)`, `{` and `}` last.
        let (expression, shift) = self.read_wrapped(
            range,
            source_type,
            ("function<", 2),
            (">(){}", 5),
            false,
            ("expected type parameters", |e| {
                matches!(e, Expression::FunctionExpression(_))
            }),
        )?;
        let parameters = match expression {
            Expression::FunctionExpression(function) => function.unbox().type_parameters,
            _ => None,
        };
        let Some(mut parameters) = parameters.map(oxc_allocator::Box::unbox) else {
            return Err(refused("expected type parameters", range));
        };
        Shift(shift).visit_ts_type_parameter_declaration(&mut parameters);
        let identifier = TypeParametersIdentifier::at(self.type_parameters.len());
        self.type_parameters.push(parameters);
        Ok(identifier)
    }

    /// The parameters of `(…) => 0` around `range`: oxc reads a parameter list only in a function.
    fn read_parameters(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<FormalParameters<'a>, SyntaxError> {
        // The wrapper's own tokens: `(` first, and `)`, `=>` and `0` last.
        let (expression, shift) = self.read_wrapped(
            range,
            source_type,
            ("(", 1),
            (")=>0", 3),
            true,
            ("expected a pattern", |e| {
                matches!(e, Expression::ArrowFunctionExpression(_))
            }),
        )?;
        let Expression::ArrowFunctionExpression(arrow) = expression else {
            return Err(refused("expected a pattern", range));
        };
        let mut parameters = arrow.unbox().params.unbox();
        Shift(shift).visit_formal_parameters(&mut parameters);
        Ok(parameters)
    }

    /// Parses `range` between `open` and `close` as one expression, keeping the tokens and
    /// comments of `range` only, and returns it with how far its spans are from the document's.
    /// Each of `open` and `close` comes with the number of tokens it is. An expression that is not
    /// the wrapper's own kind is not one part, whatever its end.
    fn read_wrapped(
        &mut self,
        range: Span,
        source_type: SourceType,
        (open, opening_tokens): (&str, usize),
        (close, closing_tokens): (&str, usize),
        parenthesized: bool,
        (expected, wrapper): (&str, fn(&Expression<'a>) -> bool),
    ) -> Result<(Expression<'a>, u32), SyntaxError> {
        // The wrapped text's opening stands where the bytes before the range are.
        let Some(shift) = range.start_offset.checked_sub(open.len() as u32) else {
            return Err(refused("a part cannot start the document", range));
        };
        self.wrapped.clear();
        self.wrapped.push_str(open);
        self.wrapped.push_str(range.text(self.source_text));
        self.wrapped.push_str(close);
        let text = self.allocator.alloc_str(&self.wrapped);
        let mut parsed = Parser::new(self.allocator, text, source_type)
            .with_options(parentheses::options(parenthesized))
            .with_config(TokensParserConfig)
            .parse_expression_at(0)
            .map_err(|error| self.fatal(error, text, 0, shift))?;
        if parenthesized {
            let recorded = &mut self.parentheses;
            parentheses::strip(self.allocator, &mut parsed.expression, shift, recorded);
        }
        let part = Part::Expression(&parsed.expression);
        self.check(
            &parsed.diagnostics,
            (text, 0, shift),
            (
                &parsed.tokens,
                parsed.next_token,
                &parsed.irregular_whitespaces,
            ),
            (part, source_type),
        )?;
        if !wrapper(&parsed.expression) {
            return Err(refused(expected, range));
        }
        if parsed.end as usize != text.len() {
            return Err(refused(
                "unexpected token",
                Span::new(parsed.end + shift, range.end_offset),
            ));
        }
        let tokens = parsed.tokens.into_arena_slice();
        let inner = tokens
            .get(opening_tokens..tokens.len().saturating_sub(closing_tokens))
            .unwrap_or(&[]);
        self.comments.extend(parsed.comments.iter().map(|comment| {
            let mut comment = comment.clone();
            Shift(shift).visit_span(&mut comment.span);
            comment.attached_to += shift;
            comment
        }));
        self.record(inner, parsed.comments.into_arena_slice(), shift);
        Ok((parsed.expression, shift))
    }

    /// A parameter list read so far, for a host that checks its shape before the tree is done.
    #[must_use]
    pub fn get_parameters(&self, identifier: ParametersIdentifier) -> &FormalParameters<'a> {
        &self.parameters[identifier.index()]
    }

    /// An expression kept so far, for a host that checks its shape before the tree is done.
    #[must_use]
    pub fn get_expression(&self, identifier: ExpressionIdentifier) -> &Expression<'a> {
        &self.expressions[identifier.index()]
    }

    pub fn keep_expression(&mut self, expression: Expression<'a>) -> ExpressionIdentifier {
        let identifier = ExpressionIdentifier::at(self.expressions.len());
        self.expressions.push(expression);
        identifier
    }

    /// Keeps a program built in [`Builder::nodes`]'s arena, such as one a compiler writes.
    pub fn keep_program(&mut self, program: Program<'a>) -> ProgramIdentifier {
        let identifier = ProgramIdentifier::at(self.programs.len());
        self.programs.push(program);
        identifier
    }

    /// Keeps a parameter list built in [`Builder::nodes`]'s arena, such as aliases a compiler
    /// writes.
    pub fn keep_parameters(&mut self, parameters: FormalParameters<'a>) -> ParametersIdentifier {
        let identifier = ParametersIdentifier::at(self.parameters.len());
        self.parameters.push(parameters);
        identifier
    }

    pub fn keep_pattern(&mut self, pattern: FormalParameter<'a>) -> PatternIdentifier {
        let identifier = PatternIdentifier::at(self.patterns.len());
        self.patterns.push(pattern);
        identifier
    }

    pub fn keep_declaration(
        &mut self,
        declaration: VariableDeclaration<'a>,
    ) -> DeclarationIdentifier {
        let identifier = DeclarationIdentifier::at(self.declarations.len());
        self.declarations.push(declaration);
        identifier
    }

    /// Keeps `tokens` and `comments`, `shift` bytes later, as the part read last.
    const fn record(&mut self, tokens: &'a [Token], comments: &'a [Comment], shift: u32) {
        self.recorded = RecordedPart {
            tokens,
            comments,
            shift,
        };
    }
}

/// A part that oxc read but that is not the one the host asked for, which acorn would not say.
#[cold]
fn refused(message: &str, span: Span) -> SyntaxError {
    SyntaxError {
        diagnostic: Diagnostic::error("parse_error", message, span),
        acorn: None,
        typescript_code: None,
        typescript_eslint_at: None,
    }
}

/// Moves every span of a tree parsed from wrapped text to where its text is in the document.
struct Shift(u32);

impl VisitMut<'_> for Shift {
    fn visit_span(&mut self, it: &mut oxc_span::Span) {
        it.start += self.0;
        it.end += self.0;
    }
}
