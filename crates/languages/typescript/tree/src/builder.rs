use oxc_allocator::Allocator;
use oxc_ast::ast::{
    Comment, Expression, FormalParameter, FormalParameters, Program, Statement,
    TSTypeParameterDeclaration, VariableDeclaration,
};
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::VisitMut;
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Kind, ParseOptions, Parser, Token};
use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use crate::syntax_error::{SyntaxError, syntax_error};
use crate::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier,
    ProgramIdentifier, Trees, TypeParametersIdentifier,
};

/// A token or a comment of the part a [`Builder`] read last.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Recorded {
    /// The token's kind; `None` for a comment.
    pub kind: Option<Kind>,
    pub span: Span,
}

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
    recorded: Vec<Recorded>,
    wrapped: String,
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
            recorded: Vec::new(),
            wrapped: String::new(),
        }
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
    pub fn recorded(&self) -> &[Recorded] {
        &self.recorded
    }

    /// Parses `range` of the document as a program, such as the body of a `<script>` element.
    ///
    /// # Errors
    ///
    /// The first syntax error.
    pub fn program(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, SyntaxError> {
        let text = &self.source_text[..range.end_offset as usize];
        self.parse_program(text, range.start_offset, source_type)
    }

    /// Parses `text[start..]`, where `text` is the document up to the program's end.
    pub(crate) fn parse_program(
        &mut self,
        text: &'a str,
        start: u32,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, SyntaxError> {
        let parsed = Parser::new(self.allocator, text, source_type)
            .with_options(options())
            .with_config(TokensParserConfig)
            .with_start(start)
            .parse();
        if !parsed.diagnostics.is_empty() {
            return Err(syntax_error(parsed.diagnostics, start, 0));
        }
        self.record(&parsed.tokens, &parsed.program.comments, 0);
        let mut program = parsed.program;
        // Its spans are the document's, so a task that reads text at a span reads the document.
        program.source_text = self.source_text;
        let identifier = ProgramIdentifier::at(self.programs.len());
        self.programs.push(program);
        Ok(identifier)
    }

    /// Parses the expression that starts at `start`, and returns where it ends.
    ///
    /// # Errors
    ///
    /// The first syntax error in the expression.
    pub fn expression_at(
        &mut self,
        start: u32,
        source_type: SourceType,
    ) -> Result<(ExpressionIdentifier, u32), SyntaxError> {
        let (expression, end) = self.read_expression_at(start, source_type)?;
        Ok((self.keep_expression(expression), end))
    }

    /// [`Self::expression_at`], for a host that takes the expression apart.
    ///
    /// # Errors
    ///
    /// The first syntax error in the expression.
    pub fn read_expression_at(
        &mut self,
        start: u32,
        source_type: SourceType,
    ) -> Result<(Expression<'a>, u32), SyntaxError> {
        self.read_expression_before(start, self.source_text.len() as u32, source_type)
    }

    /// [`Self::read_expression_at`] in the document up to `limit`, as if it ended there.
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
            .with_options(options())
            .with_config(TokensParserConfig)
            .parse_expression_at(start)
            .map_err(|errors| syntax_error(errors, start, 0))?;
        self.record(&parsed.tokens, &parsed.comments, 0);
        self.comments.extend_from_slice(&parsed.comments);
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
    ) -> Result<(Statement<'a>, u32), Diagnostic> {
        let parsed = Parser::new(self.allocator, self.source_text, source_type)
            .with_options(options())
            .with_config(TokensParserConfig)
            .parse_statement_at(start)
            .map_err(|errors| syntax_error(errors, start, 0).diagnostic)?;
        self.record(&parsed.tokens, &parsed.comments, 0);
        self.comments.extend_from_slice(&parsed.comments);
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
    ) -> Result<PatternIdentifier, Diagnostic> {
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
    ) -> Result<FormalParameter<'a>, Diagnostic> {
        let parameters = self.read_parameters(range, source_type)?;
        let mut items = parameters.items.into_iter();
        match (items.next(), items.next(), parameters.rest) {
            (Some(pattern), None, None) => Ok(pattern),
            _ => Err(Diagnostic::error(
                "parse_error",
                "expected one pattern",
                range,
            )),
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
    ) -> Result<ParametersIdentifier, Diagnostic> {
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
    ) -> Result<TypeParametersIdentifier, Diagnostic> {
        // An arrow's `<T extends …>` would read as a type assertion, so a function expression.
        // The wrapper's own tokens: `function` and `<` first, and `>`, `(`, `)`, `{` and `}` last.
        let (expression, shift) = self.read_wrapped(
            range,
            source_type,
            ("function<", 2),
            (">(){}", 5),
            ("expected type parameters", |e| {
                matches!(e, Expression::FunctionExpression(_))
            }),
        )?;
        let parameters = match expression {
            Expression::FunctionExpression(function) => function.unbox().type_parameters,
            _ => None,
        };
        let Some(mut parameters) = parameters.map(oxc_allocator::Box::unbox) else {
            return Err(Diagnostic::error(
                "parse_error",
                "expected type parameters",
                range,
            ));
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
    ) -> Result<FormalParameters<'a>, Diagnostic> {
        // The wrapper's own tokens: `(` first, and `)`, `=>` and `0` last.
        let (expression, shift) = self.read_wrapped(
            range,
            source_type,
            ("(", 1),
            (")=>0", 3),
            ("expected a pattern", |e| {
                matches!(e, Expression::ArrowFunctionExpression(_))
            }),
        )?;
        let Expression::ArrowFunctionExpression(arrow) = expression else {
            return Err(Diagnostic::error(
                "parse_error",
                "expected a pattern",
                range,
            ));
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
        (expected, wrapper): (&str, fn(&Expression<'a>) -> bool),
    ) -> Result<(Expression<'a>, u32), Diagnostic> {
        // The wrapped text's opening stands where the bytes before the range are.
        let Some(shift) = range.start_offset.checked_sub(open.len() as u32) else {
            return Err(Diagnostic::error(
                "parse_error",
                "a part cannot start the document",
                range,
            ));
        };
        self.wrapped.clear();
        self.wrapped.push_str(open);
        self.wrapped.push_str(range.text(self.source_text));
        self.wrapped.push_str(close);
        let text = self.allocator.alloc_str(&self.wrapped);
        let parsed = Parser::new(self.allocator, text, source_type)
            .with_options(options())
            .with_config(TokensParserConfig)
            .parse_expression_at(0)
            .map_err(|errors| syntax_error(errors, 0, shift).diagnostic)?;
        if !wrapper(&parsed.expression) {
            return Err(Diagnostic::error("parse_error", expected, range));
        }
        if parsed.end as usize != text.len() {
            return Err(Diagnostic::error(
                "parse_error",
                "unexpected token",
                Span::new(parsed.end + shift, range.end_offset),
            ));
        }
        let tokens = &parsed.tokens;
        let inner = tokens
            .get(opening_tokens..tokens.len().saturating_sub(closing_tokens))
            .unwrap_or(&[]);
        self.record(inner, &parsed.comments, shift);
        self.comments.extend(parsed.comments.iter().map(|comment| {
            let mut comment = comment.clone();
            Shift(shift).visit_span(&mut comment.span);
            comment.attached_to += shift;
            comment
        }));
        Ok((parsed.expression, shift))
    }

    /// A parameter list read so far, for a host that checks its shape before the tree is done.
    #[must_use]
    pub fn get_parameters(&self, identifier: ParametersIdentifier) -> &FormalParameters<'a> {
        &self.parameters[identifier.index()]
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
    fn record(&mut self, tokens: &[Token], comments: &[Comment], shift: u32) {
        self.recorded.clear();
        let mut comments = comments.iter().peekable();
        for token in tokens {
            while let Some(comment) = comments.next_if(|c| c.span.start < token.start()) {
                self.recorded.push(Recorded {
                    kind: None,
                    span: span(comment.span, shift),
                });
            }
            self.recorded.push(Recorded {
                kind: Some(token.kind()),
                span: span(token.span(), shift),
            });
        }
        self.recorded.extend(comments.map(|comment| Recorded {
            kind: None,
            span: span(comment.span, shift),
        }));
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

const fn span(span: oxc_span::Span, shift: u32) -> Span {
    Span::new(span.start + shift, span.end + shift)
}

/// `ESTree` has no parentheses, and the formatter requires that they are not kept. Regular
/// expressions are validated, as acorn validates them.
fn options() -> ParseOptions {
    ParseOptions {
        preserve_parens: false,
        parse_regular_expression: true,
        ..ParseOptions::default()
    }
}
