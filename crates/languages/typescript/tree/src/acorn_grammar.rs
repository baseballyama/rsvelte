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

use crate::syntax_error::{Acorn, SyntaxError};

mod ambient;
mod names;

pub(crate) use names::head_checked_at;

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
    /// An initializer in an ambient context, where only a `const` without a type may have one.
    AmbientInitializer,
    /// A `const`'s initializer in an ambient context that is not a literal or an enum reference.
    AmbientConstInitializer,
}

impl Rejection {
    const fn message(self) -> &'static str {
        match self {
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
            Self::AmbientInitializer => "Initializers are not allowed in ambient contexts.",
            Self::AmbientConstInitializer => concat!(
                "A 'const' initializer in an ambient context must be a string or numeric literal ",
                "or literal enum reference."
            ),
        }
    }
}

/// Where acorn rejects, and why. acorn raises once it has read up to `raised`, which orders the
/// rejection among the errors it meets; that is past `at` where it checks a node after reading it.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Stop {
    pub(crate) at: u32,
    pub(crate) raised: u32,
    why: Rejection,
}

impl Stop {
    const fn at(at: u32, why: Rejection) -> Self {
        Self {
            at,
            raised: at,
            why,
        }
    }

    pub(crate) const fn shifted(self, shift: u32) -> Self {
        Self {
            at: self.at + shift,
            raised: self.raised + shift,
            why: self.why,
        }
    }
}

/// Where acorn rejects a node of a kind it does not parse, and why; `None` for one it parses. A
/// TypeScript part is read by acorn-typescript, which knows `assert` and checks TypeScript's
/// rules; `tokens` are the part's.
fn stop(kind: AstKind<'_>, typescript: bool, tokens: &[Token]) -> Option<(u32, Rejection)> {
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
            if clause.keyword == WithClauseKeyword::Assert && !typescript =>
        {
            let braces = tokens.partition_point(|token| token.start() < clause.span.start);
            unexpected(braces.checked_sub(1).map(|keyword| tokens[keyword].start()))
        }
        // Decorators and `accessor` fields are acorn-typescript's alone. acorn stops at the `@`,
        // and reads `accessor` as the field's name and stops at the token after it.
        AstKind::Decorator(decorator) if !typescript => Some((decorator.span.start, Rejection::At)),
        AstKind::AccessorProperty(property) if !typescript => {
            let first = tokens.partition_point(|token| token.start() < property.span.start);
            unexpected(
                tokens[first..]
                    .iter()
                    .skip_while(|token| token.kind() != Kind::Accessor)
                    .nth(1)
                    .map(Token::start),
            )
        }
        AstKind::Class(class) if typescript && class.heritage.is_none() => class
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
        AstKind::ExportDeclaration(export) if typescript => match &export.declaration {
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
    typescript: bool,
    tokens: &'t [Token],
    pub(crate) first: Option<Stop>,
    /// How many `declare`d declarations are around the walk, each of which puts what it holds in
    /// an ambient context.
    ambient: u32,
    /// The namespace the next part of a dotted namespace name declares, whose name acorn does
    /// not check.
    dotted: Option<oxc_span::Span>,
}

impl<'t> Unsupported<'t> {
    pub(crate) const fn new(typescript: bool, tokens: &'t [Token]) -> Self {
        Self {
            typescript,
            tokens,
            first: None,
            ambient: 0,
            dotted: None,
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
        let mut found = stop(kind, self.typescript, self.tokens).map(|(at, why)| Stop::at(at, why));
        // oxc's checker reports these names and initializers outside an ambient context itself.
        if self.ambient > 0 {
            found = self.ambient_stop(kind, found);
        }
        if let Some(found) = found
            && self.first.is_none_or(|first| found.raised < first.raised)
        {
            self.first = Some(found);
        }
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
            ambient::initializer(kind),
        ]
        .into_iter()
        .flatten()
        .min_by_key(|found| found.raised)
    }
}

/// Where acorn stops at the first whitespace in `irregular`, the spans oxc lists in `text`, that
/// ECMAScript does not allow; `shift` moves them into the document.
pub(crate) fn whitespace(text: &str, irregular: &[oxc_span::Span], shift: u32) -> Option<Stop> {
    irregular.iter().find_map(|span| {
        let rejection = match text.get(span.start as usize..)?.chars().next()? {
            '\u{85}' => Rejection::NextLine,
            '\u{200B}' => Rejection::ZeroWidthSpace,
            _ => return None,
        };
        Some(Stop::at(span.start + shift, rejection))
    })
}

/// What acorn throws where it rejects.
pub(crate) fn rejection(Stop { at, raised, why }: Stop) -> SyntaxError {
    let message = why.message();
    let acorn_message = std::borrow::Cow::Borrowed(message);
    SyntaxError {
        diagnostic: Diagnostic::error("parse_error", message, Span::new(at, at)),
        acorn: Some(if raised == at {
            Acorn::Fails {
                message: acorn_message,
                at,
            }
        } else {
            Acorn::FailsLater {
                message: acorn_message,
                at,
                raised,
            }
        }),
        typescript_code: None,
        typescript_eslint_at: None,
    }
}

#[cfg(test)]
mod tests;
