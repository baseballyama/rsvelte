//! The parentheses around a type, which acorn-typescript keeps as a `TSParenthesizedType` and
//! the tree drops. In a type, parentheses wrap a type, a function type's parameters or an import
//! type's string, so a type the program's tokens enclose in `(` and `)` had them.

use oxc_parser::{Kind, Token};

use super::shape::Shape;

/// Each type of `shape` in parentheses, by its order among the nodes, with the span of each pair
/// from the innermost out.
pub(super) fn parenthesized(shape: &Shape, tokens: &[Token]) -> Vec<(u32, Vec<[u32; 2]>)> {
    let mut found = Vec::new();
    for (index, node) in shape.nodes.iter().enumerate() {
        if !is_type(node.kind) {
            continue;
        }
        let mut pairs = Vec::new();
        let (mut start, mut end) = (node.start, node.end);
        loop {
            let before = tokens.partition_point(|token| token.end() <= start);
            let after = tokens.partition_point(|token| token.start() < end);
            let (Some(open), Some(close)) = (
                before.checked_sub(1).map(|at| tokens[at]),
                tokens.get(after),
            ) else {
                break;
            };
            if open.kind() != Kind::LParen || close.kind() != Kind::RParen {
                break;
            }
            (start, end) = (open.start(), close.end());
            pairs.push([start, end]);
        }
        if !pairs.is_empty() {
            found.push((index as u32, pairs));
        }
    }
    found
}

/// Whether a node of `kind` is a type.
fn is_type(kind: &str) -> bool {
    kind.starts_with("TS")
        && (kind.ends_with("Type")
            || kind.ends_with("Keyword")
            || matches!(
                kind,
                "TSTypeReference"
                    | "TSTypeQuery"
                    | "TSTypeOperator"
                    | "TSTypeLiteral"
                    | "TSTypePredicate"
            ))
}

#[cfg(test)]
mod tests;
