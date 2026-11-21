//! Acorn's check of a destructuring pattern as a whole, which it makes before it checks the
//! elements.

use oxc_parser::{Kind, Token};

/// Where acorn's check of the destructuring pattern around `start` fails: at the `(` of its first
/// element whose operand is parenthesized and is not a simple target, which acorn records as it
/// reads the elements and raises before it checks any of them. The pattern is the innermost array
/// or object around `start` that `=` assigns to.
pub(super) fn parenthesized_element(start: u32, tokens: &[Token]) -> Option<u32> {
    let mut open = Vec::new();
    for (index, token) in tokens.iter().enumerate() {
        match token.kind() {
            Kind::LParen | Kind::LBrack | Kind::LCurly => open.push(index),
            Kind::RParen | Kind::RBrack | Kind::RCurly => {
                let opener = open.pop()?;
                let assigned = tokens.get(index + 1).is_some_and(|t| t.kind() == Kind::Eq);
                if assigned
                    && matches!(tokens[opener].kind(), Kind::LBrack | Kind::LCurly)
                    && (tokens[opener].start()..token.end()).contains(&start)
                {
                    return first_parenthesized(tokens, opener, index);
                }
            }
            _ => {}
        }
    }
    None
}

/// [`parenthesized_element`] in the pattern `tokens[open..=close]`, and in the patterns nested in
/// it, which acorn reads with the same record. An element that is itself an assignment, or a
/// default, records nothing, and neither does a parenthesized operand a subscript follows.
fn first_parenthesized(tokens: &[Token], open: usize, close: usize) -> Option<u32> {
    let object = tokens[open].kind() == Kind::LCurly;
    let mut from = open + 1;
    while from < close {
        let end = top_level(tokens, from, close)
            .find(|&index| tokens[index].kind() == Kind::Comma)
            .unwrap_or(close);
        let mut operand = from + usize::from(tokens[from].kind() == Kind::Dot3);
        if object
            && let Some(colon) =
                top_level(tokens, operand, end).find(|&index| tokens[index].kind() == Kind::Colon)
        {
            operand = colon + 1;
        }
        let assigns = top_level(tokens, operand, end).any(|index| tokens[index].kind() == Kind::Eq);
        if operand < end && !assigns {
            let group_end = closing(tokens, operand);
            let after = group_end
                .map(|index| index + 1)
                .filter(|&index| index < end);
            match tokens[operand].kind() {
                Kind::LBrack | Kind::LCurly if after.is_none() => {
                    if let Some(at) = first_parenthesized(tokens, operand, group_end?) {
                        return Some(at);
                    }
                }
                Kind::LParen => {
                    let subscript =
                        after.is_some_and(|index| starts_subscript(tokens[index].kind()));
                    if !subscript && !is_simple_target(&tokens[operand + 1..group_end?]) {
                        return Some(tokens[operand].start());
                    }
                }
                _ => {}
            }
        }
        from = end + 1;
    }
    None
}

/// Whether `tokens` are acorn's simple assignment target: an identifier or a member expression
/// that is not an optional chain, inside any parentheses.
fn is_simple_target(mut tokens: &[Token]) -> bool {
    while tokens.first().is_some_and(|t| t.kind() == Kind::LParen)
        && closing(tokens, 0) == Some(tokens.len() - 1)
    {
        tokens = &tokens[1..tokens.len() - 1];
    }
    let mut top = top_level(tokens, 0, tokens.len());
    let Some(operand) = top.next() else {
        return false;
    };
    let kind = tokens[operand].kind();
    let identifier = kind == Kind::Ident || kind.is_contextual_keyword();
    // `new`, `typeof`, `await` and the like make an operand that is no member's object.
    if kind.is_any_keyword() && !identifier && !matches!(kind, Kind::This | Kind::Super) {
        return false;
    }
    let mut member = None;
    while let Some(index) = top.next() {
        member = Some(match tokens[index].kind() {
            Kind::Dot => top
                .next()
                .is_some_and(|name| tokens[name].kind().is_identifier_name()),
            Kind::LBrack => true,
            Kind::LParen => false,
            kind if kind.is_template_start_of_tagged_template() => false,
            _ => return false,
        });
    }
    member.unwrap_or(identifier)
}

/// Whether a token of `kind` after an operand starts a subscript of it.
const fn starts_subscript(kind: Kind) -> bool {
    matches!(
        kind,
        Kind::Dot | Kind::QuestionDot | Kind::LBrack | Kind::LParen
    ) || kind.is_template_start_of_tagged_template()
}

/// The indices of the tokens of `tokens[from..to]` outside the groups they open, each group by
/// its opening token.
fn top_level(tokens: &[Token], from: usize, to: usize) -> impl Iterator<Item = usize> + '_ {
    std::iter::successors(Some(from), move |&index| {
        Some(closing(tokens, index).unwrap_or(index) + 1)
    })
    .take_while(move |&index| index < to)
}

/// The index of the token that closes the group `tokens[open]` opens, or none when it opens none.
fn closing(tokens: &[Token], open: usize) -> Option<usize> {
    if !matches!(
        tokens.get(open)?.kind(),
        Kind::LParen | Kind::LBrack | Kind::LCurly
    ) {
        return None;
    }
    let mut depth = 0usize;
    for (index, token) in tokens.iter().enumerate().skip(open) {
        match token.kind() {
            Kind::LParen | Kind::LBrack | Kind::LCurly => depth += 1,
            Kind::RParen | Kind::RBrack | Kind::RCurly => {
                depth -= 1;
                if depth == 0 {
                    return Some(index);
                }
            }
            _ => {}
        }
    }
    None
}
