use std::borrow::Cow;

use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_typescript_syntax::operators::UnaryOperator;
use rsvelte_typescript_syntax::syntax_tree::flag;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

/// `b.call` for `$.method(…)`.
pub(crate) fn runtime_call(
    out: &mut SyntaxTree,
    method: &str,
    arguments: Vec<Option<NodeIdentifier>>,
) -> NodeIdentifier {
    let arguments = call_arguments(out, arguments);
    out.runtime("$", method, &arguments)
}

/// `b.call`'s arguments: trailing missing ones are dropped, inner ones are `void 0`.
pub(crate) fn call_arguments(
    out: &mut SyntaxTree,
    arguments: Vec<Option<NodeIdentifier>>,
) -> Vec<NodeIdentifier> {
    let mut arguments = arguments;
    while matches!(arguments.last(), Some(None)) {
        arguments.pop();
    }
    arguments
        .into_iter()
        .map(|a| {
            a.unwrap_or_else(|| {
                let zero = out.write_number(0.0, SourceLocation::SYNTHETIC);
                out.unary(UnaryOperator::Void, zero, SourceLocation::SYNTHETIC)
            })
        })
        .collect()
}

/// `b.unthunk`: `(a, b) => f(a, b)` is `f`.
pub(crate) fn unthunk(out: &SyntaxTree, arrow: NodeIdentifier) -> NodeIdentifier {
    let Kind::Arrow {
        parameters,
        body,
        expression_body: true,
        is_async: false,
        ..
    } = out.kind(arrow)
    else {
        return arrow;
    };
    let Kind::Call {
        callee,
        arguments,
        optional: false,
        ..
    } = out.kind(body)
    else {
        return arrow;
    };
    // Upstream names a runtime function `$.name` as one identifier.
    let runtime = matches!(
        out.kind(callee),
        Kind::Member { object, computed: false, optional: false, .. }
            if out.is_identifier(object) && out.name(object) == "$"
    );
    let same = (out.is_identifier(callee) || runtime)
        && parameters.len() == arguments.len()
        && parameters.iter().zip(arguments).all(|(&p, &a)| {
            out.is_identifier(p) && out.is_identifier(a) && out.name(p) == out.name(a)
        });
    if same { callee } else { arrow }
}

/// `b.init(name, value)` as esrap prints it: the shorthand `{ name }` when the value is that
/// identifier.
pub(crate) fn init_property(
    out: &mut SyntaxTree,
    name: &str,
    value: NodeIdentifier,
) -> NodeIdentifier {
    let key = property_key(out, name);
    let shorthand = out.is_identifier(key) && out.is_identifier(value) && out.name(value) == name;
    out.property(
        key,
        value,
        if shorthand { flag::SHORTHAND } else { 0 },
        SourceLocation::SYNTHETIC,
    )
}

/// `{ name }` for each exported name, as both targets hand the exports over.
pub(crate) fn export_properties<'a>(
    out: &'a mut SyntaxTree,
    javascript: &'a SyntaxTree,
    exports: &'a [NodeIdentifier],
) -> impl Iterator<Item = NodeIdentifier> + 'a {
    exports.iter().map(|&name| {
        let name = javascript.name(name);
        let value = out.identifier(name);
        init_property(out, name, value)
    })
}

/// Upstream's `prop_alias`: the name a `$props()` key reads, `String(key.value)` for a literal.
pub(crate) fn prop_alias<'s>(
    javascript: &'s SyntaxTree,
    source_text: &'s str,
    key: NodeIdentifier,
) -> Cow<'s, str> {
    match javascript.kind(key) {
        Kind::Identifier(_) => Cow::Borrowed(javascript.name(key)),
        Kind::Number(value) => Cow::Owned(rsvelte_typescript_semantic::number::number(value)),
        _ => Cow::Borrowed(javascript.str_value(key, source_text)),
    }
}

/// `b.key(name)`: an identifier key when `name` is one, a string key otherwise.
pub(crate) fn property_key(out: &mut SyntaxTree, name: &str) -> NodeIdentifier {
    if is_valid_identifier(name) {
        out.identifier(name)
    } else {
        out.write_string(name)
    }
}

/// `b.get` / `b.set`: `get name() { … }` or `set name(parameter) { … }`, as `flags` says.
pub(crate) fn accessor(
    out: &mut SyntaxTree,
    name: &str,
    parameters: &[NodeIdentifier],
    body: &[NodeIdentifier],
    flags: u8,
) -> NodeIdentifier {
    let key = property_key(out, name);
    let block = out.block(body, SourceLocation::SYNTHETIC);
    let function = out.function(
        false,
        None,
        parameters,
        block,
        false,
        SourceLocation::SYNTHETIC,
    );
    out.property(key, function, flags, SourceLocation::SYNTHETIC)
}

/// `get name() { return value; }`
pub(crate) fn getter(out: &mut SyntaxTree, name: &str, value: NodeIdentifier) -> NodeIdentifier {
    let ret = out.return_(Some(value), SourceLocation::SYNTHETIC);
    accessor(out, name, &[], &[ret], flag::GETTER)
}

/// Upstream `regex_is_valid_identifier`: `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`.
fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

pub(crate) fn is_simple_expression(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> bool {
    match syntax_tree.kind(e) {
        Kind::String
        | Kind::Regex { .. }
        | Kind::Number(_)
        | Kind::Boolean(_)
        | Kind::Null
        | Kind::Identifier(_)
        | Kind::Arrow { .. }
        | Kind::Function {
            declaration: false, ..
        } => true,
        Kind::Conditional {
            test,
            consequent,
            alternate,
        } => {
            is_simple_expression(syntax_tree, test)
                && is_simple_expression(syntax_tree, consequent)
                && is_simple_expression(syntax_tree, alternate)
        }
        Kind::Binary(_, l, r) | Kind::Logical(_, l, r) => {
            is_simple_expression(syntax_tree, l) && is_simple_expression(syntax_tree, r)
        }
        _ => false,
    }
}
