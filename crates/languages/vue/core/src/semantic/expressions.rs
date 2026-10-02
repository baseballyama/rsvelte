use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

/// `@vue/shared` `GLOBALS_ALLOWED`.
const GLOBALS_ALLOWED: &[&str] = &[
    "Infinity",
    "undefined",
    "NaN",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "Math",
    "Number",
    "Date",
    "Array",
    "Object",
    "Boolean",
    "String",
    "RegExp",
    "Map",
    "Set",
    "JSON",
    "Intl",
    "BigInt",
    "console",
    "Error",
    "Symbol",
];

#[must_use]
pub fn can_prefix(name: &str) -> bool {
    !is_global(name) && name != "require"
}

/// `@vue/shared` `camelize`: `-x` becomes `X` for a word character `x`.
#[must_use]
pub fn camelize(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '-'
            && let Some(&n) = chars.peek()
            && (n.is_ascii_alphanumeric() || n == '_')
        {
            out.push(n.to_ascii_uppercase());
            chars.next();
        } else {
            out.push(c);
        }
    }
    out
}

/// `toHandlerKey`: `on` and the name with its first character upper-cased.
pub fn to_handler_key(s: &str) -> String {
    let mut chars = s.chars();
    chars.next().map_or_else(String::new, |f| {
        format!("on{}{}", f.to_uppercase(), chars.as_str())
    })
}

/// compiler-core `isSimpleIdentifier`.
#[must_use]
pub fn is_simple_identifier(s: &str) -> bool {
    let mut b = s.bytes();
    b.next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == b'_' || c == b'$')
        && b.all(|c| c.is_ascii_alphanumeric() || c == b'_' || c == b'$')
}

/// Every identifier `walkIdentifiers` visits with `includeAll`, with its parent, but static object
/// keys (`isStaticPropertyKey`).
pub fn collect_identifiers(
    syntax_tree: &SyntaxTree,
    n: NodeIdentifier,
    parent: Option<NodeIdentifier>,
    out: &mut Vec<(NodeIdentifier, Option<NodeIdentifier>)>,
) {
    match syntax_tree.kind(n) {
        Kind::Identifier(_) => out.push((n, parent)),
        Kind::Property {
            key,
            value,
            computed,
            shorthand,
            ..
        } => {
            if computed {
                collect_identifiers(syntax_tree, key, Some(n), out);
            }
            if shorthand && !computed {
                out.push((value, Some(n)));
            } else {
                collect_identifiers(syntax_tree, value, Some(n), out);
            }
        }
        _ => {
            let mut children = Vec::new();
            syntax_tree.for_each_child(n, |k| children.push(k));
            for k in children {
                collect_identifiers(syntax_tree, k, Some(n), out);
            }
        }
    }
}

#[must_use]
pub fn is_global(name: &str) -> bool {
    GLOBALS_ALLOWED.contains(&name)
}
