use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_typescript::operators::UnaryOperator;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

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

/// `b.init(name, value)` as esrap prints it: an identifier key when `name` is one, a string
/// key otherwise, and the shorthand `{ name }` when the value is that identifier.
pub(crate) fn init_property(
    out: &mut SyntaxTree,
    name: &str,
    value: NodeIdentifier,
) -> NodeIdentifier {
    if !is_valid_identifier(name) {
        let key = out.write_string(name);
        return out.property(key, value, 0, SourceLocation::SYNTHETIC);
    }
    let key = out.identifier(name);
    let shorthand = matches!(out.kind(value), Kind::Identifier(_)) && out.name(value) == name;
    out.property(
        key,
        value,
        if shorthand { flag::SHORTHAND } else { 0 },
        SourceLocation::SYNTHETIC,
    )
}

/// Upstream `regex_is_valid_identifier`: `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`.
fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}
