//! JavaScript the tree accepts but a module (strict mode code) rejects. Svelte parses every
//! expression as a module and Prettier parses `<script>` as one, so either fails on it.

use std::collections::HashSet;

use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::lexer::T;
use rsvelte_typescript_syntax::operators::{BinaryOperator, UnaryOperator};
use rsvelte_typescript_syntax::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, flag};

/// The first construct in `tree` that strict mode code rejects.
///
/// # Errors
///
/// [`Unsupported`] naming that construct.
pub fn refuse_strict_errors(tree: &SyntaxTree, source_text: &str) -> Result<(), Unsupported> {
    for token in tree.tokens.iter() {
        let text = token.span.text(source_text);
        let wrong = match token.kind {
            T::Number | T::BigInt => number_error(text),
            T::String | T::Template { .. } => escape_error(text),
            T::Regex => regex_error(text),
            _ => None,
        };
        if let Some(what) = wrong {
            return Err(Unsupported::at(what, token.span));
        }
    }
    let parents = tree.parents();
    for index in 0..tree.len() {
        let Ok(index) = u32::try_from(index) else {
            break;
        };
        let node = NodeIdentifier(index);
        if let Some(what) = node_error(tree, source_text, &parents, node) {
            return Err(Unsupported::at(what, tree.source_location(node)));
        }
    }
    Ok(())
}

/// Legacy octal (`07`) and a `_` that does not sit between two digits.
fn number_error(text: &str) -> Option<&'static str> {
    let b = text.as_bytes();
    if b.len() > 1 && b[0] == b'0' && (b[1].is_ascii_digit() || b[1] == b'_') {
        return Some("a legacy octal number");
    }
    let (digits, is_digit): (&[u8], fn(u8) -> bool) = match b {
        [b'0', b'x' | b'X', rest @ ..] => (rest, |c| c.is_ascii_hexdigit()),
        [b'0', b'o' | b'O' | b'b' | b'B', rest @ ..] => (rest, |c| c.is_ascii_digit()),
        _ => (b, |c| c.is_ascii_digit()),
    };
    let misplaced = digits.iter().enumerate().any(|(i, &c)| {
        c == b'_'
            && !(i > 0
                && is_digit(digits[i - 1])
                && digits.get(i + 1).is_some_and(|&n| is_digit(n)))
    });
    misplaced.then_some("a misplaced numeric separator")
}

/// An octal escape, `\8`, `\9`, or a malformed `\x` / `\u` escape.
fn escape_error(text: &str) -> Option<&'static str> {
    let b = text.as_bytes();
    let mut i = 0;
    while i < b.len() {
        if b[i] != b'\\' {
            i += 1;
            continue;
        }
        let next = b.get(i + 1).copied();
        let bad = match next {
            Some(b'0') => b.get(i + 2).is_some_and(u8::is_ascii_digit),
            Some(b'1'..=b'9') => true,
            Some(b'x') => !b
                .get(i + 2..i + 4)
                .is_some_and(|h| h.iter().all(u8::is_ascii_hexdigit)),
            Some(b'u') => !unicode_escape_ok(&b[i + 2..]),
            _ => false,
        };
        if bad {
            return Some("an escape strict mode rejects");
        }
        i += 2;
    }
    None
}

fn unicode_escape_ok(rest: &[u8]) -> bool {
    rest.strip_prefix(b"{").map_or_else(
        || {
            rest.get(..4)
                .is_some_and(|h| h.iter().all(u8::is_ascii_hexdigit))
        },
        |braced| {
            let digits = braced.iter().take_while(|c| c.is_ascii_hexdigit()).count();
            let value = std::str::from_utf8(&braced[..digits])
                .ok()
                .and_then(|h| u32::from_str_radix(h, 16).ok());
            digits > 0 && braced.get(digits) == Some(&b'}') && value.is_some_and(|v| v <= 0x10_FFFF)
        },
    )
}

/// The parts of regular expression validation that are not ported: named groups and `\p`.
fn regex_error(text: &str) -> Option<&'static str> {
    let flags = &text[text.rfind('/').map_or(text.len(), |i| i + 1)..];
    if flags.contains(['u', 'v']) && (text.contains("\\p{") || text.contains("\\P{")) {
        return Some("a regular expression property escape");
    }
    text.matches("(?<")
        .nth(1)
        .map(|_| "a regular expression with several named groups")
}

/// A name strict mode reserves, or `eval` / `arguments` bound or assigned.
fn identifier_error(
    tree: &SyntaxTree,
    parents: &[NodeIdentifier],
    node: NodeIdentifier,
) -> Option<&'static str> {
    let name = tree.name(node);
    let reserved = matches!(
        name,
        "implements"
            | "interface"
            | "let"
            | "package"
            | "private"
            | "protected"
            | "public"
            | "static"
            | "yield"
            | "await"
            // Keywords the tree reads as names where a name is bound.
            | "true"
            | "false"
            | "null"
            | "this"
            | "super"
    );
    if matches!(name, "eval" | "arguments") && is_bound(tree, parents, node) {
        return Some("`eval` or `arguments` bound or assigned");
    }
    (reserved && !is_property_name(tree, parents[node.index()], node))
        .then_some("a name strict mode reserves")
}

fn node_error(
    tree: &SyntaxTree,
    source_text: &str,
    parents: &[NodeIdentifier],
    node: NodeIdentifier,
) -> Option<&'static str> {
    match tree.kind(node) {
        Kind::Identifier(_) => identifier_error(tree, parents, node),
        Kind::Assign(_, target, _) => pattern_has_optional_chain(tree, target)
            .then_some("an optional chain as a target")
            .or_else(|| {
                parenthesized_pattern(tree, source_text, target)
                    .then_some("a destructuring pattern in parentheses")
            }),
        Kind::If {
            consequent,
            alternate,
            ..
        } => [Some(consequent), alternate]
            .into_iter()
            .flatten()
            .any(|c| is_declaration(tree, c))
            .then_some("a declaration as the body of `if`"),
        Kind::Block(statements) => statements
            .iter()
            .any(|&s| {
                matches!(
                    tree.kind(s),
                    Kind::Import { .. } | Kind::ExportNamed(_) | Kind::ExportDefault(_)
                )
            })
            .then_some("`import` or `export` inside a block")
            .or_else(|| {
                // A function body is checked with its parameters.
                let parent = parents[node.index()];
                let body_of_function = parent != NodeIdentifier::NONE
                    && matches!(tree.kind(parent), Kind::Function { body, .. } | Kind::Arrow { body, .. } if body == node);
                (!body_of_function)
                    .then(|| declarations_error(tree, statements, &HashSet::new()))
                    .flatten()
            }),
        Kind::Program(statements) => declarations_error(tree, statements, &HashSet::new()),
        Kind::Rest(argument) => matches!(tree.kind(argument), Kind::AssignPattern(..))
            .then_some("a default value after `...`"),
        Kind::Update { arg, .. } => {
            if matches!(tree.kind(arg), Kind::Identifier(_) | Kind::Member { .. }) {
                has_optional_chain(tree, arg).then_some("an optional chain as a target")
            } else {
                Some("an update of something that is not a name or a member")
            }
        }
        Kind::New { callee, .. } => {
            has_optional_chain(tree, callee).then_some("an optional chain after `new`")
        }
        Kind::Unary(UnaryOperator::Delete, argument) => {
            matches!(tree.kind(argument), Kind::Identifier(_)).then_some("`delete` of a name")
        }
        Kind::Binary(BinaryOperator::Exp, left, _) => {
            (matches!(tree.kind(left), Kind::Unary(..) | Kind::Await(_))
                && !parenthesized(tree, source_text, left))
            .then_some("a unary operand of `**`")
        }
        Kind::Object(properties) => {
            let proto = properties
                .iter()
                .filter(|&&p| is_proto(tree, source_text, p))
                .count();
            (proto > 1).then_some("`__proto__` twice")
        }
        Kind::ArrayPattern(items) => {
            rest_then_comma(tree, source_text, items).then_some("a comma after a rest element")
        }
        Kind::Function {
            parameters, body, ..
        }
        | Kind::Arrow {
            parameters, body, ..
        } => parameters_error(tree, source_text, parameters, body),
        Kind::ObjectPattern(items) => items
            .last()
            .is_some_and(|&r| {
                matches!(tree.kind(r), Kind::Rest(a)
                    if matches!(tree.kind(a), Kind::ObjectPattern(_) | Kind::ArrayPattern(_)))
            })
            .then_some("a pattern after `...` in an object pattern")
            .or_else(|| {
                rest_then_comma(tree, source_text, items).then_some("a comma after a rest element")
            }),
        _ => None,
    }
}

/// Whether `node` is a name a declaration, parameter or assignment binds.
fn is_bound(tree: &SyntaxTree, parents: &[NodeIdentifier], node: NodeIdentifier) -> bool {
    let parent = parents[node.index()];
    if parent == NodeIdentifier::NONE {
        return false;
    }
    match tree.kind(parent) {
        Kind::Declarator { identifier, .. } => identifier == node,
        Kind::Function {
            name, parameters, ..
        } => name == Some(node) || parameters.contains(&node),
        Kind::Arrow { parameters, .. } => parameters.contains(&node),
        Kind::AssignPattern(left, _) | Kind::Assign(_, left, _) => left == node,
        Kind::Update { .. }
        | Kind::ArrayPattern(_)
        | Kind::Rest(_)
        | Kind::ImportDefault(_)
        | Kind::ImportNamespace(_) => true,
        Kind::ImportNamed { local, .. } => local == node,
        Kind::Property { value, .. } => {
            value == node
                && parents.get(parent.index()).is_some_and(|&g| {
                    g != NodeIdentifier::NONE && matches!(tree.kind(g), Kind::ObjectPattern(_))
                })
        }
        _ => false,
    }
}

fn is_property_name(tree: &SyntaxTree, parent: NodeIdentifier, node: NodeIdentifier) -> bool {
    if parent == NodeIdentifier::NONE {
        return false;
    }
    match tree.kind(parent) {
        Kind::Member {
            property,
            computed: false,
            ..
        } => property == node,
        Kind::Property {
            key,
            computed: false,
            shorthand: false,
            ..
        } => key == node,
        Kind::ImportNamed { imported, local } => imported == node && imported != local,
        Kind::MetaProperty { .. } => true,
        _ => false,
    }
}

fn has_optional_chain(tree: &SyntaxTree, mut node: NodeIdentifier) -> bool {
    loop {
        // `(a?.b).c`: the chain ended at the parentheses.
        if tree.flags(node) & flag::GROUPED != 0 {
            return false;
        }
        match tree.kind(node) {
            Kind::Member { optional: true, .. } | Kind::Call { optional: true, .. } => return true,
            Kind::Member { object, .. } => node = object,
            Kind::Call { callee, .. } => node = callee,
            _ => return false,
        }
    }
}

/// [`has_optional_chain`] for any target a destructuring pattern assigns to.
fn pattern_has_optional_chain(tree: &SyntaxTree, node: NodeIdentifier) -> bool {
    match tree.kind(node) {
        Kind::ArrayPattern(items) | Kind::ObjectPattern(items) => {
            items.iter().any(|&i| pattern_has_optional_chain(tree, i))
        }
        Kind::Property { value, .. } => pattern_has_optional_chain(tree, value),
        Kind::Rest(a) | Kind::AssignPattern(a, _) => pattern_has_optional_chain(tree, a),
        _ => has_optional_chain(tree, node),
    }
}

/// `({ a }) = 1`, `[([a])] = b`: a pattern inside a target written in parentheses.
fn parenthesized_pattern(tree: &SyntaxTree, source_text: &str, node: NodeIdentifier) -> bool {
    match tree.kind(node) {
        Kind::ArrayPattern(items) | Kind::ObjectPattern(items) => {
            parenthesized(tree, source_text, node)
                || items
                    .iter()
                    .any(|&i| parenthesized_pattern(tree, source_text, i))
        }
        Kind::Property { value, .. } => parenthesized_pattern(tree, source_text, value),
        Kind::Rest(a) | Kind::AssignPattern(a, _) => parenthesized_pattern(tree, source_text, a),
        _ => false,
    }
}

/// A lexical or function declaration, which strict mode code does not allow as a lone body.
fn is_declaration(tree: &SyntaxTree, node: NodeIdentifier) -> bool {
    match tree.kind(node) {
        Kind::VariableDeclaration { kind, .. } => kind != flag::VAR,
        Kind::Function {
            declaration: true, ..
        } => true,
        _ => false,
    }
}

/// Whether `(` and `)` wrap `node` in the source.
fn parenthesized(tree: &SyntaxTree, source_text: &str, node: NodeIdentifier) -> bool {
    let Some(span) = tree.source_location(node).span() else {
        return false;
    };
    source_text[..span.start_offset as usize]
        .trim_end()
        .ends_with('(')
        && source_text[span.end_offset as usize..]
            .trim_start()
            .starts_with(')')
}

fn is_proto(tree: &SyntaxTree, source_text: &str, property: NodeIdentifier) -> bool {
    let Kind::Property {
        key,
        computed: false,
        shorthand: false,
        method: false,
        getter: false,
        setter: false,
        ..
    } = tree.kind(property)
    else {
        return false;
    };
    match tree.kind(key) {
        Kind::Identifier(_) => tree.name(key) == "__proto__",
        Kind::String => tree.source_location(key).span().is_some_and(|s: Span| {
            let raw = s.text(source_text);
            raw.len() >= 2 && &raw[1..raw.len() - 1] == "__proto__"
        }),
        _ => false,
    }
}

fn rest_then_comma(tree: &SyntaxTree, source_text: &str, items: &[NodeIdentifier]) -> bool {
    let Some((&last, init)) = items.split_last() else {
        return false;
    };
    // A rest element before another item is the same error.
    if init.iter().any(|&i| matches!(tree.kind(i), Kind::Rest(_))) {
        return true;
    }
    matches!(tree.kind(last), Kind::Rest(_))
        && tree.source_location(last).span().is_some_and(|s| {
            source_text[s.end_offset as usize..]
                .trim_start()
                .starts_with(',')
        })
}

/// The names a binding pattern declares.
fn bound_names<'t>(tree: &'t SyntaxTree, node: NodeIdentifier, out: &mut Vec<&'t str>) {
    match tree.kind(node) {
        Kind::Identifier(_) => out.push(tree.name(node)),
        Kind::ArrayPattern(items) | Kind::ObjectPattern(items) => {
            for &i in items {
                bound_names(tree, i, out);
            }
        }
        Kind::Property { value, .. } => bound_names(tree, value, out),
        Kind::Rest(a) | Kind::AssignPattern(a, _) => bound_names(tree, a, out),
        _ => {}
    }
}

/// A name declared twice in one statement list where one of the declarations is `let`, `const`
/// or a function, or a `let`/`const` that repeats a parameter. Declarations nested deeper
/// (hoisted `var`) are not followed.
fn declarations_error(
    tree: &SyntaxTree,
    statements: &[NodeIdentifier],
    parameters: &HashSet<&str>,
) -> Option<&'static str> {
    let (mut lexical, mut vars, mut functions) = (Vec::new(), Vec::new(), Vec::new());
    for &s in statements {
        let s = match tree.kind(s) {
            Kind::ExportNamed(d) => d,
            _ => s,
        };
        match tree.kind(s) {
            Kind::VariableDeclaration { kind, declarations } => {
                let out = if kind == flag::VAR {
                    &mut vars
                } else {
                    &mut lexical
                };
                for &d in declarations {
                    if let Kind::Declarator { identifier, .. } = tree.kind(d) {
                        bound_names(tree, identifier, out);
                    }
                }
            }
            Kind::Function {
                name: Some(n),
                declaration: true,
                ..
            } => functions.push(tree.name(n)),
            _ => {}
        }
    }
    let mut seen = HashSet::new();
    let clash = !lexical.iter().all(|n| seen.insert(*n))
        || vars.iter().chain(&functions).any(|n| seen.contains(n))
        || lexical.iter().any(|n| parameters.contains(n));
    clash.then_some("a name declared twice")
}

/// A parameter named twice, a comma after a rest parameter, or `"use strict"` in the body of a
/// function whose parameters are not plain names.
fn parameters_error(
    tree: &SyntaxTree,
    source_text: &str,
    parameters: &[NodeIdentifier],
    body: NodeIdentifier,
) -> Option<&'static str> {
    if rest_then_comma(tree, source_text, parameters) {
        return Some("a comma after a rest element");
    }
    let mut names = Vec::new();
    for &p in parameters {
        bound_names(tree, p, &mut names);
    }
    let mut seen = HashSet::new();
    if !names.iter().all(|n| seen.insert(*n)) {
        return Some("a parameter named twice");
    }
    let simple = parameters
        .iter()
        .all(|&p| matches!(tree.kind(p), Kind::Identifier(_)));
    // An overload or a declared function has no body.
    if body.is_none() {
        return None;
    }
    let Kind::Block(statements) = tree.kind(body) else {
        return None;
    };
    if let Some(what) = declarations_error(tree, statements, &seen) {
        return Some(what);
    }
    let use_strict = statements.iter().any(|&s| {
        let Kind::ExpressionStatement(e) = tree.kind(s) else {
            return false;
        };
        matches!(tree.kind(e), Kind::String)
            && tree.source_location(e).span().is_some_and(|span| {
                let raw = span.text(source_text);
                raw.len() >= 2 && &raw[1..raw.len() - 1] == "use strict"
            })
    });
    (use_strict && !simple).then_some("\"use strict\" after parameters that are not plain names")
}

#[cfg(test)]
mod tests;
