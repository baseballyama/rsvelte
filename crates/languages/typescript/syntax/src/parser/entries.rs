//! The parser's entry points.

use rsvelte_kernel::source::positions::Span;

use super::{NodeIdentifier, Parser, R, SyntaxTree, T};

/// Parses `range` of `source_text` as a module body.
///
/// # Errors
///
/// [`ParseError`](super::ParseError) at the first lexical or syntax error, or at syntax this parser
/// does not support.
pub fn parse_program(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    range: Span,
    typescript: bool,
) -> R<NodeIdentifier> {
    // Svelte components average a token per 4.8 bytes (the lossless corpus test prints both).
    syntax_tree.tokens.reserve(range.len() as usize / 4);
    program(
        Parser::new(syntax_tree, source_text, range, typescript)?,
        range,
    )
}

/// [`parse_program`] for a `.jsx` or `.tsx` document, whose expressions may be JSX.
///
/// # Errors
///
/// [`ParseError`](super::ParseError) at the first lexical or syntax error, or at syntax this parser
/// does not support.
pub fn parse_jsx_program(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    range: Span,
    typescript: bool,
) -> R<NodeIdentifier> {
    let mut p = Parser::new(syntax_tree, source_text, range, typescript)?;
    p.jsx = true;
    program(p, range)
}

fn program(mut p: Parser<'_, '_>, range: Span) -> R<NodeIdentifier> {
    let body = p.open();
    while p.token.t != T::Eof {
        let s = p.statement()?;
        p.item(s);
    }
    let program = p.close(body, |syntax_tree, body| syntax_tree.program(body, range));
    p.done()?;
    Ok(program)
}

/// Parses `range` of `source_text` as exactly one expression.
///
/// # Errors
///
/// [`ParseError`](super::ParseError) at the first lexical or syntax error, or if a token follows
/// the expression.
pub fn parse_expression(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    range: Span,
    typescript: bool,
) -> R<NodeIdentifier> {
    let mut p = Parser::new(syntax_tree, source_text, range, typescript)?;
    let e = p.expression()?;
    if p.token.t != T::Eof {
        return p.fail("unexpected token after expression");
    }
    p.done()?;
    Ok(e)
}

/// Parses `range` of `source_text` as a comma-separated list of parameters without the parentheses
/// (`a, { b }, c = 1`): the names an embedding language's syntax declares, like Vue's `v-for`
/// alias.
///
/// # Errors
///
/// [`ParseError`](super::ParseError) at the first lexical or syntax error, or if a token follows
/// the list.
pub fn parse_parameters(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    range: Span,
    typescript: bool,
) -> R<Vec<NodeIdentifier>> {
    let mut p = Parser::new(syntax_tree, source_text, range, typescript)?;
    let mut parameters = Vec::new();
    while p.token.t != T::Eof {
        parameters.push(p.param()?);
        if !p.eat(T::Comma)? {
            break;
        }
    }
    if p.token.t != T::Eof {
        return p.fail("unexpected token after parameters");
    }
    p.done()?;
    Ok(parameters)
}

/// Parses the longest expression starting at `start` and returns it with the start of the next
/// token.
///
/// Reads no further than `limit`. Embedding languages use this to find where an
/// expression ends: `{count}` ends where the parser stops, not at a brace found by scanning.
///
/// # Errors
///
/// [`ParseError`](super::ParseError) at the first lexical or syntax error before the expression
/// ends.
pub fn parse_expression_prefix(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    start: u32,
    limit: u32,
    typescript: bool,
) -> R<(NodeIdentifier, u32)> {
    let mut p = Parser::new(
        syntax_tree,
        source_text,
        Span::new(start, limit),
        typescript,
    )?;
    let e = p.expression()?;
    let next = if p.token.t == T::Eof {
        limit
    } else {
        p.token.span.start_offset
    };
    p.done()?;
    Ok((e, next))
}

/// Parses the `let` or `const` declaration starting at `start` (no `;`) and returns it with the
/// start of the next token, like [`parse_expression_prefix`].
///
/// Svelte's `{let a = 1}` tag ends where the declaration does.
///
/// # Errors
///
/// [`ParseError`](super::ParseError) at the first lexical or syntax error before the declaration
/// ends.
pub fn parse_declaration_prefix(
    syntax_tree: &mut SyntaxTree,
    source_text: &str,
    start: u32,
    limit: u32,
    typescript: bool,
) -> R<(NodeIdentifier, u32)> {
    let mut p = Parser::new(
        syntax_tree,
        source_text,
        Span::new(start, limit),
        typescript,
    )?;
    let d = p.var_declaration()?;
    let next = if p.token.t == T::Eof {
        limit
    } else {
        p.token.span.start_offset
    };
    p.done()?;
    Ok((d, next))
}
