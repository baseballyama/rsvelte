//! The syntax oxc parses and acorn, the parser of a host that reports as acorn does, rejects:
//! acorn throws where it stops, and acorn-typescript where a TypeScript rule fails.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    ClassElement, Declaration, Statement, VariableDeclarationKind, WithClauseKeyword,
};
use oxc_ast_visit::Visit;
use oxc_parser::{Kind, Token};
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use crate::TypeScriptReader;
use crate::syntax_error::{SyntaxError, Unreserved, UnreservedWords};

mod ambient;
mod names;

/// Why acorn rejects a part.
#[derive(Clone, Copy, Debug)]
pub(crate) enum Rejection {
    /// acorn stops at a token of syntax it does not parse.
    Unexpected,
    /// `override` in a class that extends nothing.
    Override,
    /// `export declare global { … }`.
    ExportedGlobal,
    /// A decorator's `@`, a character acorn does not read.
    At,
    /// U+0085 or U+200B, which oxc reads as whitespace, as tsc does, and ECMAScript does not.
    NextLine,
    ZeroWidthSpace,
    /// `eval` or `arguments` where acorn checks a name in strict mode: one a declaration, an
    /// import or a parameter list binds, or the name of a function without a body, which
    /// acorn-typescript checks as a name assigned.
    StrictName {
        name: names::Restricted,
        binds: bool,
    },
    /// A word acorn refuses as a name, read as one in an ambient context.
    Reserved(names::ReservedWord),
    /// An initializer in an ambient context, where only a `const` without a type may have one.
    AmbientInitializer,
    /// A word acorn rejects as it reads it, which oxc's parser leaves to its checker.
    Unreserved(Unreserved),
    /// A `const`'s initializer in an ambient context that is not a literal or an enum reference.
    AmbientConstInitializer,
    /// A token acorn's lexer rejects as it reads it: a number, or an escape that strict code
    /// forbids.
    Lexed(&'static str),
    /// A `#` that no name follows: acorn names the character after it.
    Character(char),
}

impl Rejection {
    fn message(self) -> std::borrow::Cow<'static, str> {
        let message = match self {
            Self::Unexpected => "Unexpected token",
            Self::Override => concat!(
                "This member cannot have an 'override' modifier because its containing class does ",
                "not extend another class."
            ),
            Self::ExportedGlobal => "'export declare' must be followed by an ambient declaration.",
            Self::At => "Unexpected character '@'",
            Self::NextLine => "Unexpected character '\u{85}'",
            Self::ZeroWidthSpace => "Unexpected character '\u{200B}'",
            Self::StrictName { name, binds } => name.message(binds),
            Self::Reserved(word) => word.message(),
            Self::AmbientInitializer => "Initializers are not allowed in ambient contexts.",
            Self::Unreserved(word) => word.message(),
            Self::AmbientConstInitializer => concat!(
                "A 'const' initializer in an ambient context must be a string or numeric literal ",
                "or literal enum reference."
            ),
            Self::Lexed(message) => message,
            Self::Character(character) => {
                return std::borrow::Cow::Owned(format!("Unexpected character '{character}'"));
            }
        };
        std::borrow::Cow::Borrowed(message)
    }
}

/// Where acorn rejects, and why.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Stop {
    pub(crate) at: u32,
    why: Rejection,
}

impl Stop {
    const fn at(at: u32, why: Rejection) -> Self {
        Self { at, why }
    }

    pub(crate) const fn shifted(self, shift: u32) -> Self {
        Self {
            at: self.at + shift,
            why: self.why,
        }
    }
}

/// Where acorn rejects a node of a kind it does not parse, and why; `None` for one it parses.
/// `typescript` reads a TypeScript part first: acorn-typescript knows its syntax and checks its
/// rules. `tokens` are the part's.
fn stop(
    kind: AstKind<'_>,
    typescript: Option<TypeScriptReader>,
    tokens: &[Token],
) -> Option<(u32, Rejection)> {
    let javascript = typescript.is_none();
    let rules = typescript == Some(TypeScriptReader::AcornTypescript);
    let unexpected = |at: Option<u32>| at.map(|at| (at, Rejection::Unexpected));
    match kind {
        // `using x` and `await using x`: acorn reads `using` as a name and stops at the binding.
        AstKind::VariableDeclaration(declaration)
            if matches!(
                declaration.kind,
                VariableDeclarationKind::Using | VariableDeclarationKind::AwaitUsing
            ) =>
        {
            unexpected(
                declaration
                    .declarations
                    .first()
                    .map(|declarator| declarator.id.span().start),
            )
        }
        // `import defer * as x` and `import source x`: acorn reads the phase as the default
        // import and stops at what follows it.
        AstKind::ImportDeclaration(import) if import.phase.is_some() => unexpected(
            import
                .specifiers
                .as_ref()
                .and_then(|specifiers| specifiers.first())
                .map(|specifier| specifier.span().start),
        ),
        // `assert { … }`: acorn knows only `with` for import attributes, and stops at the keyword,
        // the token before the clause's braces.
        AstKind::WithClause(clause)
            if clause.keyword == WithClauseKeyword::Assert && javascript =>
        {
            let braces = tokens.partition_point(|token| token.start() < clause.span.start);
            unexpected(braces.checked_sub(1).map(|keyword| tokens[keyword].start()))
        }
        // Decorators and `accessor` fields are acorn-typescript's alone. acorn stops at the `@`,
        // and reads `accessor` as the field's name and stops at the token after it.
        AstKind::Decorator(decorator) if javascript => Some((decorator.span.start, Rejection::At)),
        AstKind::AccessorProperty(property) if javascript => {
            let first = tokens.partition_point(|token| token.start() < property.span.start);
            unexpected(
                tokens[first..]
                    .iter()
                    .skip_while(|token| token.kind() != Kind::Accessor)
                    .nth(1)
                    .map(Token::start),
            )
        }
        // acorn-typescript reads a TypeScript keyword as its own token, where acorn expects a class
        // name.
        AstKind::Class(class)
            if rules
                && (class.id.as_ref()).is_some_and(|id| names::typescript_keyword(&id.name)) =>
        {
            unexpected(class.id.as_ref().map(|id| id.span.start))
        }
        AstKind::Class(class) if rules && class.heritage.is_none() => class
            .body
            .body
            .iter()
            .find(|member| match member {
                ClassElement::MethodDefinition(method) => method.r#override,
                ClassElement::PropertyDefinition(property) => property.r#override,
                ClassElement::AccessorProperty(accessor) => accessor.r#override,
                ClassElement::StaticBlock(_) | ClassElement::TSIndexSignature(_) => false,
            })
            .map(|member| (member.span().start, Rejection::Override)),
        AstKind::ExportDeclaration(export) if rules => match &export.declaration {
            Declaration::TSGlobalDeclaration(global) if global.declare => {
                Some((global.global_span.start, Rejection::ExportedGlobal))
            }
            _ => None,
        },
        // A function declared as the body of a statement: acorn reads module code, which is
        // strict, and stops at the declaration.
        _ => unexpected(
            bodies(kind)
                .into_iter()
                .flatten()
                .find_map(|body| match body {
                    Statement::FunctionDeclaration(function) => Some(function.span.start),
                    _ => None,
                }),
        ),
    }
}

/// Where acorn's lexer rejects the literal `kind` in strict code, which oxc can read without a
/// diagnostic: a number with a leading zero, or a string with an escape.
fn lexed_literal(kind: AstKind<'_>, typescript: Option<TypeScriptReader>) -> Option<Stop> {
    let (span, raw) = match kind {
        AstKind::NumericLiteral(number)
            if matches!(number.raw?.as_bytes(), [b'0', b'0'..=b'9', ..]) =>
        {
            (number.span, number.raw?)
        }
        // Each escape is longer than what it stands for.
        AstKind::StringLiteral(string) if string.raw?.len() != string.value.len() + 2 => {
            (string.span, string.raw?)
        }
        _ => return None,
    };
    // acorn rejects the token as it reads it, which places the error among the others.
    let why = crate::syntax_error::lexer_failure(&raw, 0, typescript)?;
    Some(Stop::at(span.start, why))
}

/// The statements `kind` holds as its bodies, outside any block.
pub(crate) const fn bodies(kind: AstKind<'_>) -> [Option<&Statement<'_>>; 2] {
    match kind {
        AstKind::IfStatement(it) => [Some(&it.consequent), it.alternate.as_ref()],
        AstKind::LabeledStatement(it) => [Some(&it.body), None],
        AstKind::WhileStatement(it) => [Some(&it.body), None],
        AstKind::DoWhileStatement(it) => [Some(&it.body), None],
        AstKind::ForStatement(it) => [Some(&it.body), None],
        AstKind::ForInStatement(it) => [Some(&it.body), None],
        AstKind::ForOfStatement(it) => [Some(&it.body), None],
        AstKind::WithStatement(it) => [Some(&it.body), None],
        _ => [None, None],
    }
}

/// Visits each of the nodes `$ty`, counting the ambient context a `declare`d one opens.
macro_rules! ambient_at {
    ($($visit:ident($ty:ident) => $walk:ident;)*) => {$(
        fn $visit(&mut self, it: &oxc_ast::ast::$ty<'a>) {
            let declared = u32::from(it.declare);
            self.ambient += declared;
            oxc_ast_visit::walk::$walk(self, it);
            self.ambient -= declared;
        }
    )*};
}

/// The first rejection acorn raises in the part it walks.
pub(crate) struct Unsupported<'t> {
    /// What reads the part first when it is TypeScript.
    typescript: Option<TypeScriptReader>,
    tokens: &'t [Token],
    pub(crate) first: Option<Stop>,
    /// How many `declare`d declarations are around the walk, each of which puts what it holds in
    /// an ambient context.
    ambient: u32,
    /// How many types are around the walk, whose names acorn-typescript reads without a check.
    types: u32,
    /// The namespace the next part of a dotted namespace name declares, whose name acorn does
    /// not check.
    dotted: Option<oxc_span::Span>,
    unreserved: UnreservedWords,
}

impl<'t> Unsupported<'t> {
    pub(crate) fn new(typescript: Option<TypeScriptReader>, tokens: &'t [Token]) -> Self {
        Self {
            typescript,
            tokens,
            first: None,
            ambient: 0,
            types: 0,
            dotted: None,
            unreserved: UnreservedWords::new(),
        }
    }
}

impl<'a> Visit<'a> for Unsupported<'_> {
    // oxc's checker opens an ambient context at each of these nodes that is `declare`d
    // (`SemanticBuilder::enter_ambient_context`), and acorn-typescript reads what a `declare`d
    // declaration holds in one.
    ambient_at! {
        visit_variable_declaration(VariableDeclaration) => walk_variable_declaration;
        visit_class(Class) => walk_class;
        visit_property_definition(PropertyDefinition) => walk_property_definition;
        visit_ts_namespace_declaration(TSNamespaceDeclaration) => walk_ts_namespace_declaration;
        visit_ts_external_module_declaration(TSExternalModuleDeclaration)
            => walk_ts_external_module_declaration;
        visit_ts_global_declaration(TSGlobalDeclaration) => walk_ts_global_declaration;
        visit_ts_type_alias_declaration(TSTypeAliasDeclaration) => walk_ts_type_alias_declaration;
        visit_ts_interface_declaration(TSInterfaceDeclaration) => walk_ts_interface_declaration;
        visit_ts_enum_declaration(TSEnumDeclaration) => walk_ts_enum_declaration;
    }

    fn enter_node(&mut self, kind: AstKind<'a>) {
        let mut found = (self.unreserved.enter(kind))
            .map(|(at, why)| (at, Rejection::Unreserved(why)))
            .or_else(|| stop(kind, self.typescript, self.tokens))
            .map(|(at, why)| Stop::at(at, why))
            .or_else(|| lexed_literal(kind, self.typescript));
        // oxc's checker reports these names and initializers outside an ambient context itself, and
        // in one only acorn-typescript checks them.
        if self.typescript == Some(TypeScriptReader::AcornTypescript) && self.ambient > 0 {
            found = self.ambient_stop(kind, found);
        }
        if let Some(found) = found
            && self.first.is_none_or(|first| found.at < first.at)
        {
            self.first = Some(found);
        }
    }

    fn visit_ts_type(&mut self, it: &oxc_ast::ast::TSType<'a>) {
        self.types += 1;
        oxc_ast_visit::walk::walk_ts_type(self, it);
        self.types -= 1;
    }

    fn visit_function(
        &mut self,
        it: &oxc_ast::ast::Function<'a>,
        flags: oxc_syntax::scope::ScopeFlags,
    ) {
        let declared = u32::from(it.declare);
        self.ambient += declared;
        oxc_ast_visit::walk::walk_function(self, it, flags);
        self.ambient -= declared;
    }
}

impl Unsupported<'_> {
    /// The first of `found` and what acorn-typescript rejects at `kind` in an ambient context.
    #[cold]
    fn ambient_stop(&mut self, kind: AstKind<'_>, found: Option<Stop>) -> Option<Stop> {
        let nested = self.dotted.take_if(|next| *next == kind.span()).is_some();
        if let Some(next) = names::dotted(kind) {
            self.dotted = Some(next);
        }
        [
            found,
            names::strict_name(kind, nested),
            names::reserved(kind, self.types > 0),
            ambient::initializer(kind),
        ]
        .into_iter()
        .flatten()
        .min_by_key(|found| found.at)
    }
}

/// Where acorn stops at the first whitespace in `irregular`, the spans oxc lists in `text`, that
/// ECMAScript does not allow; `shift` moves them into the document.
fn whitespace(text: &str, irregular: &[oxc_span::Span], shift: u32) -> Option<Stop> {
    irregular.iter().find_map(|span| {
        let rejection = match text.get(span.start as usize..)?.chars().next()? {
            '\u{85}' => Rejection::NextLine,
            '\u{200B}' => Rejection::ZeroWidthSpace,
            _ => return None,
        };
        Some(Stop::at(span.start + shift, rejection))
    })
}

/// Whether acorn's lexer can reject `token` where oxc read it: a number, a string with an escape,
/// an `@`, or a `#`.
fn may_reject(token: &Token) -> bool {
    let kind = token.kind();
    kind.is_number()
        || (kind == Kind::Str && token.escaped())
        || matches!(
            kind,
            Kind::At | Kind::PrivateIdentifier | Kind::Undetermined
        )
}

/// Where acorn first stops in a part oxc read of `text`, before its parser looks at the tokens
/// that start at `starts`: at whitespace in `irregular` that ECMAScript does not allow, or at a
/// token its lexer rejects as it reads it, which orders the rejection by where the token starts.
/// `shift` moves it into the document.
pub(crate) fn lexed(
    text: &str,
    starts: impl IntoIterator<Item = u32>,
    (irregular, typescript): (&[oxc_span::Span], Option<TypeScriptReader>),
    shift: u32,
) -> Option<Stop> {
    let token = starts.into_iter().find_map(|start| {
        let why = crate::syntax_error::lexer_failure(text, start, typescript)?;
        Some(Stop::at(start + shift, why))
    });
    whitespace(text, irregular, shift)
        .into_iter()
        .chain(token)
        .min_by_key(|stop| stop.at)
}

/// Where the tokens acorn may reject start, of a part and of the token its parser read to end it.
pub(crate) fn read(tokens: &[Token], next: Option<Token>) -> impl Iterator<Item = u32> {
    let part = tokens
        .iter()
        .filter(|token| may_reject(token))
        .map(Token::start);
    part.chain(next.filter(may_reject).map(|token| token.start()))
}

/// The starts of `tokens` that oxc read before it stopped, and of the token it stopped at, which
/// `diagnostics` label first: acorn has read that token when its parser fails there.
pub(crate) fn read_before_stopping(
    text: &str,
    tokens: &[Token],
    diagnostics: &[oxc_diagnostics::OxcDiagnostic],
) -> impl Iterator<Item = u32> {
    let stopped = (diagnostics.first())
        .and_then(|error| error.labels.first())
        .and_then(|label| {
            let rest = text.get(label.offset() as usize..)?;
            let blank = rest.len() - rest.trim_start_matches([' ', '\t']).len();
            Some(label.offset() + u32::try_from(blank).ok()?)
        })
        // A label inside a token oxc read is not where a token starts.
        .filter(|&at| tokens.last().is_none_or(|token| token.end() <= at));
    tokens
        .iter()
        .filter(|token| may_reject(token))
        .map(Token::start)
        .chain(stopped)
}

/// What acorn throws where it rejects.
pub(crate) fn rejection(Stop { at, why }: Stop) -> SyntaxError {
    let message = why.message();
    SyntaxError {
        diagnostic: Diagnostic::error("parse_error", message.to_string(), Span::new(at, at)),
        acorn_stops_at: None,
        typescript_code: None,
        redeclared_at: None,
        typescript_eslint_at: None,
    }
}

#[cfg(test)]
mod tests;
