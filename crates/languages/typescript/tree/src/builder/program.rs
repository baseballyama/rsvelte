use oxc_ast::ast::Program;
use oxc_diagnostics::Diagnostics;
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Kind, Parser};
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use super::{Part, TreeBuilder, parentheses};
use crate::ProgramIdentifier;
use crate::acorn_grammar::{rejection, whitespace};
use crate::syntax_error::{SyntaxError, acorn, syntax_error, typescript_eslint_at};

impl<'a> TreeBuilder<'a> {
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
        (self.read_program(text, range.start_offset, source_type, |_| false))
            .map_err(|read| read.error)
    }

    /// [`Self::program`], for a host that reports another error than the first, or whose own
    /// parser tolerates some of oxc's errors.
    ///
    /// # Errors
    ///
    /// Every error oxc reported, in order, with the program oxc recovered when no error stopped
    /// it.
    pub fn program_or_errors(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, Rejected> {
        self.program_or_errors_keeping(range, source_type, |_| true)
    }

    /// [`Self::program_or_errors`], keeping the program oxc recovered only when `keep` accepts
    /// its errors.
    fn program_or_errors_keeping(
        &mut self,
        range: Span,
        source_type: SourceType,
        keep: fn(&Diagnostics) -> bool,
    ) -> Result<ProgramIdentifier, Rejected> {
        let text = &self.source_text[..range.end_offset as usize];
        let start = range.start_offset;
        self.read_program(text, start, source_type, keep)
            .map_err(|rejected| {
                let program = (rejected.recovered).map(|program| &self.programs[program].0);
                let errors = rejected.diagnostics.into_iter().map(|e| {
                    let at = program.and_then(|program| {
                        typescript_eslint_at(&e, |locator| Part::Program(program).walk(locator))
                    });
                    let mut error = syntax_error([e], text, &[], start, 0);
                    error.typescript_eslint_at = at;
                    error
                });
                Rejected {
                    errors: errors.collect(),
                    recovered: rejected.recovered,
                }
            })
    }

    /// [`Self::program`] as TypeScript's error-tolerant parser reads it, for a host that projects
    /// a script whatever its errors: oxc's program, or, when an error stops oxc, each statement
    /// that parses, with the tokens no statement reads as [`Holes`].
    pub fn program_with_holes(&mut self, range: Span, source_type: SourceType) -> WithHoles {
        // A token oxc's lexer cannot finish ends oxc's program there, where TypeScript reads on.
        let whole = |diagnostics: &Diagnostics| Unfinished::last(diagnostics).is_none();
        let errors = match self.program_or_errors_keeping(range, source_type, whole) {
            Ok(program) => {
                return WithHoles {
                    program,
                    holes: Holes::default(),
                    errors: Vec::new(),
                };
            }
            Err(Rejected {
                errors,
                recovered: Some(program),
            }) => {
                return WithHoles {
                    program,
                    holes: Holes::default(),
                    errors,
                };
            }
            Err(Rejected { errors, .. }) => errors,
        };
        let text = &self.source_text[..range.end_offset as usize];
        let mut body = oxc_allocator::Vec::new_in(&self.allocator);
        let mut comments = oxc_allocator::Vec::new_in(&self.allocator);
        let mut tokens = oxc_allocator::Vec::new_in(&self.allocator);
        let mut holes = Vec::new();
        // The tokens skipped since the last statement that parsed.
        let mut hole: Option<Span> = None;
        let mut at = range.start_offset;
        while at < range.end_offset {
            let read = Parser::new(self.allocator, text, source_type)
                .with_options(parentheses::options(false))
                .with_config(TokensParserConfig)
                .parse_statement_at(at);
            let error = match read {
                Ok(statement) => {
                    holes.extend(hole.take());
                    body.push(statement.statement);
                    comments.extend(statement.comments);
                    tokens.extend(statement.tokens);
                    at = statement.end;
                    continue;
                }
                Err(error) => error,
            };
            let Some((read, skipped, next)) = skip(
                &error.tokens,
                &error.diagnostics,
                (at, text, range.end_offset),
            ) else {
                break;
            };
            if !skipped.is_empty() {
                let start = hole.map_or(skipped.start_offset, |hole| hole.start_offset);
                hole = Some(Span::new(start, skipped.end_offset));
            }
            tokens.extend_from_slice(read);
            at = next;
        }
        holes.extend(hole);
        let program = Program::new(
            oxc_span::Span::new(range.start_offset, range.end_offset),
            source_type,
            self.source_text,
            comments,
            None,
            oxc_allocator::Vec::new_in(&self.allocator),
            body,
            &self.nodes(),
        );
        let recorded =
            oxc_allocator::Vec::from_iter_in(program.comments.iter().cloned(), &self.allocator);
        let tokens = tokens.into_arena_slice();
        self.record(tokens, recorded.into_arena_slice(), 0);
        WithHoles {
            program: self.push_program(program, tokens),
            holes: Holes(holes),
            errors,
        }
    }

    /// Parses `text[start..]`, where `text` is the document up to the program's end, with oxc's
    /// errors when it fails, and, when `keep_recovered` accepts them, the program oxc recovered
    /// unless an error stopped it.
    fn read_program(
        &mut self,
        text: &'a str,
        start: u32,
        source_type: SourceType,
        keep_recovered: fn(&Diagnostics) -> bool,
    ) -> Result<ProgramIdentifier, Box<Read>> {
        let parsed = Parser::new(self.allocator, text, source_type)
            .with_options(parentheses::options(false))
            .with_config(TokensParserConfig)
            .with_start(start)
            .parse();
        if parsed.fatal_error {
            let acorn = (parsed.diagnostics.first())
                .and_then(|first| acorn(first, text, (&parsed.tokens, None), |_| {}));
            let mut error = syntax_error(parsed.diagnostics.iter().cloned(), text, &[], start, 0);
            error.acorn = acorn;
            let stop = (self.as_acorn)
                .then(|| whitespace(text, &parsed.irregular_whitespaces, 0))
                .flatten();
            if let Some(stop) = stop.filter(|stop| stop.0 <= error.acorn_raised_at()) {
                error = rejection(stop);
            }
            return Err(Box::new(Read {
                error,
                diagnostics: parsed.diagnostics,
                recovered: None,
            }));
        }
        let part = Part::Program(&parsed.program);
        let rejection = match self.check(
            &parsed.diagnostics,
            (text, start, 0),
            (&parsed.tokens, None, &parsed.irregular_whitespaces),
            (part, source_type),
        ) {
            Ok(()) => None,
            Err(error) if keep_recovered(&parsed.diagnostics) => Some(error),
            Err(error) => {
                return Err(Box::new(Read {
                    error,
                    diagnostics: parsed.diagnostics,
                    recovered: None,
                }));
            }
        };
        let mut program = parsed.program;
        // The program keeps its comments; the part keeps a copy, as few programs have many.
        let comments =
            oxc_allocator::Vec::from_iter_in(program.comments.iter().cloned(), &self.allocator);
        let comments = comments.into_arena_slice();
        let tokens = parsed.tokens.into_arena_slice();
        self.record(tokens, comments, 0);
        // Its spans are the document's, so a task that reads text at a span reads the document.
        program.source_text = self.source_text;
        let identifier = self.push_program(program, tokens);
        match rejection {
            None => Ok(identifier),
            Some(error) => Err(Box::new(Read {
                error,
                diagnostics: parsed.diagnostics,
                recovered: Some(identifier),
            })),
        }
    }
}

/// What oxc read of a program the host's parser rejects.
#[derive(Debug)]
pub struct Rejected {
    /// Every error oxc reported, in order.
    pub errors: Vec<SyntaxError>,
    /// The program oxc recovered; `None` when an error stopped it.
    pub recovered: Option<ProgramIdentifier>,
}

/// [`TreeBuilder::program_with_holes`]'s program.
#[derive(Debug)]
pub struct WithHoles {
    pub program: ProgramIdentifier,
    pub holes: Holes,
    /// Every error oxc reported reading the whole program, in order.
    pub errors: Vec<SyntaxError>,
}

/// The ranges of a program's text that no statement of it reads, which a projection copies as
/// they are, so TypeScript reads them as the source has them.
#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct Holes(Vec<Span>);

impl Holes {
    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    /// Whether `span` is inside a hole.
    #[must_use]
    pub fn contains(&self, span: Span) -> bool {
        let after = self
            .0
            .partition_point(|hole| hole.end_offset < span.end_offset);
        self.0
            .get(after)
            .is_some_and(|hole| hole.start_offset <= span.start_offset)
    }

    pub fn iter(&self) -> impl Iterator<Item = Span> + '_ {
        self.0.iter().copied()
    }
}

/// What TypeScript's statement list skips after a statement that stopped at `at` in `text`, whose
/// program ends at `end`: the tokens it read, the text they cover, and where the next statement
/// starts. `None` when nothing is left to read.
fn skip<'t>(
    tokens: &'t [oxc_parser::Token],
    diagnostics: &Diagnostics,
    (at, text, end): (u32, &str, u32),
) -> Option<(&'t [oxc_parser::Token], Span, u32)> {
    let covered = |read: &[oxc_parser::Token], until: u32| {
        Span::new(read.first().map_or(at, oxc_parser::Token::start), until)
    };
    // TypeScript's scanner reads on past the token it cannot finish where the lexer gave up on the
    // rest; the tokens from there on are the lexer's guesses.
    let stopped_the_lexer =
        |label: &oxc_span::Span| tokens.last().is_none_or(|last| last.start() <= label.start);
    if let Some((unfinished, label)) =
        Unfinished::last(diagnostics).filter(|(_, label)| stopped_the_lexer(label))
    {
        let read = &tokens[..tokens.partition_point(|token| token.start() < label.start)];
        let next = unfinished.resume(label, text, end);
        return Some((read, covered(read, next), next));
    }
    // Otherwise to the token the statement stopped at, or past it when it stopped at its first.
    let (&stop, read) = tokens.split_last()?;
    let read_end = read.last().map_or(at, oxc_parser::Token::end);
    Some(match stop.kind() {
        Kind::Eof => (read, covered(read, read_end), end),
        _ if stop.start() > at => (read, covered(read, read_end), stop.start()),
        _ => (tokens, covered(tokens, stop.end()), stop.end()),
    })
}

/// How TypeScript's scanner reads on past a token it cannot finish, by the error it reports.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Unfinished {
    /// A string ends at the line terminator.
    Line,
    /// A regular expression ends at the first unbalanced bracket of its line.
    RegularExpression,
    /// An invalid character is skipped alone.
    Character,
    /// A template or a block comment runs to the end of the text.
    Script,
}

impl Unfinished {
    /// The last token the lexer could not finish in `diagnostics`, with its label.
    fn last(diagnostics: &Diagnostics) -> Option<(Self, oxc_span::Span)> {
        diagnostics.iter().rev().find_map(|diagnostic| {
            if diagnostic.code.scope.as_deref() != Some("TS") {
                return None;
            }
            let unfinished = match diagnostic.code.number.as_deref()? {
                "1002" => Self::Line,
                "1161" => Self::RegularExpression,
                "1127" => Self::Character,
                "1160" | "1010" => Self::Script,
                _ => return None,
            };
            let label = diagnostic.labels.first()?;
            let start = label.offset();
            Some((unfinished, oxc_span::Span::new(start, start + label.len())))
        })
    }

    /// Where TypeScript's scanner reads on after the token oxc's lexer labelled `label`, in `text`
    /// whose program ends at `end`. The lexer's label of an unfinished string or regular
    /// expression takes the line terminator in, and starts at the invalid character.
    fn resume(self, label: oxc_span::Span, text: &str, end: u32) -> u32 {
        match self {
            Self::Line => label.end.min(end),
            Self::RegularExpression => unterminated_regular_expression_end(text, label.start, end),
            Self::Character => text[label.start as usize..]
                .chars()
                .next()
                .map_or(end, |c| label.start + c.len_utf8() as u32),
            Self::Script => end,
        }
    }
}

/// Where TypeScript's `reScanSlashToken` ends a regular expression that starts with the `/` at
/// `slash` and has no closing `/` before the line terminator: at the first `)`, `]` or `}` its
/// groups, classes and quantifiers leave unbalanced, without the whitespace and `;` before it.
fn unterminated_regular_expression_end(text: &str, slash: u32, end: u32) -> u32 {
    let body = slash as usize + 1;
    let line = &text[body..end as usize];
    let line = &line[..line
        .find(['\n', '\r', '\u{2028}', '\u{2029}'])
        .unwrap_or(line.len())];
    let (mut escaped, mut class_depth, mut in_quantifier, mut group_depth) =
        (false, 0u32, false, 0u32);
    let mut stop = line.len();
    for (at, byte) in line.bytes().enumerate() {
        if escaped {
            escaped = false;
        } else if byte == b'\\' {
            escaped = true;
        } else if byte == b'[' {
            class_depth += 1;
        } else if byte == b']' && class_depth > 0 {
            class_depth -= 1;
        } else if class_depth == 0 {
            match byte {
                b'{' => in_quantifier = true,
                b'}' if in_quantifier => in_quantifier = false,
                _ if in_quantifier => {}
                b'(' => group_depth += 1,
                b')' if group_depth > 0 => group_depth -= 1,
                b')' | b']' | b'}' => {
                    stop = at;
                    break;
                }
                _ => {}
            }
        }
    }
    let kept = line[..stop].trim_end_matches(|c| c == ';' || is_typescript_white_space(c));
    (body + kept.len()) as u32
}

/// TypeScript's `isWhiteSpaceSingleLine`; the line has no line terminator left to trim.
const fn is_typescript_white_space(c: char) -> bool {
    matches!(
        c,
        ' ' | '\t' | '\u{b}' | '\u{c}' | '\u{a0}' | '\u{85}' | '\u{1680}'
    ) || matches!(c, '\u{2000}'..='\u{200b}')
        || matches!(c, '\u{202f}' | '\u{205f}' | '\u{3000}' | '\u{feff}')
}

/// [`TreeBuilder::read_program`]'s rejection.
struct Read {
    error: SyntaxError,
    diagnostics: Diagnostics,
    recovered: Option<ProgramIdentifier>,
}
