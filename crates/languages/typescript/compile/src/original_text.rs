//! The text TypeScript's emit prints a literal with, which is not always its source text.

use std::borrow::Cow;

use oxc_allocator::Allocator;
use oxc_ast::ast::{BigIntLiteral, Expression, NumericLiteral, Program, StaticMemberExpression};
use oxc_ast_visit::{VisitMut, walk_mut};

/// TypeScript's `canUseOriginalText` (6.0.3 at 050880ce59, `src/compiler/utilities.ts:2036`).
///
/// Where it does not allow a literal's source text, the emit prints the text the scanner keeps.
/// A bigint never keeps its text; a number keeps it unless `TokenFlags.IsInvalid` holds. The
/// separators an ES2021 target allows stay. A number a property access follows gets the dot the
/// emit writes after it, as `with_dot` says.
pub struct OriginalText<'o> {
    allocator: &'o Allocator,
    source_text: &'o str,
}

impl std::fmt::Debug for OriginalText<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("OriginalText").finish_non_exhaustive()
    }
}

impl<'o> OriginalText<'o> {
    #[must_use]
    pub const fn new(allocator: &'o Allocator) -> Self {
        Self {
            allocator,
            source_text: "",
        }
    }
}

impl<'o> VisitMut<'o> for OriginalText<'o> {
    fn visit_program(&mut self, it: &mut Program<'o>) {
        self.source_text = it.source_text;
        walk_mut::walk_program(self, it);
    }

    fn visit_numeric_literal(&mut self, it: &mut NumericLiteral<'o>) {
        // The scanner's text for an invalid number is `"" + value`, which the printer gives one
        // without a raw.
        if it.raw.is_some_and(|raw| is_invalid(&raw)) {
            it.raw = None;
        }
    }

    fn visit_static_member_expression(&mut self, it: &mut StaticMemberExpression<'o>) {
        walk_mut::walk_static_member_expression(self, it);
        if !it.optional
            && let Expression::NumericLiteral(number) = &mut it.object
            && self.dot_follows(number.span.end, it.property.span.start)
            && let Some(text) = with_dot(number)
        {
            number.raw = Some(self.allocator.alloc_str(&text).into());
        }
    }

    fn visit_big_int_literal(&mut self, it: &mut BigIntLiteral<'o>) {
        it.raw = it.raw.and_then(|raw| match scanned_hexadecimal(&raw)? {
            Cow::Borrowed(_) => Some(raw),
            Cow::Owned(text) => Some(self.allocator.alloc_str(&text).into()),
        });
    }
}

/// `TokenFlags.IsInvalid` of a number the parser accepts: `Octal` (`010`) and
/// `ContainsLeadingZero` (`08`, `09.5`), both a `0` followed by a digit (`scanner.ts:1236`).
/// `ContainsInvalidSeparator` and `ContainsInvalidEscape` are parse errors here.
const fn is_invalid(raw: &str) -> bool {
    matches!(raw.as_bytes(), [b'0', b'0'..=b'9', ..])
}

/// The scanner's text for a hexadecimal bigint: its digits lowercased, without separators
/// (`scanner.ts:1378`). Any other bigint's is its decimal value plus `n` (`scanner.ts:1869`),
/// which the printer gives one without a raw.
fn scanned_hexadecimal(raw: &str) -> Option<Cow<'_, str>> {
    let digits = raw.strip_prefix("0x").or_else(|| raw.strip_prefix("0X"))?;
    if raw.starts_with("0x") && !digits.bytes().any(|b| b == b'_' || b.is_ascii_uppercase()) {
        return Some(Cow::Borrowed(raw));
    }
    let mut text = String::with_capacity(raw.len());
    text.push_str("0x");
    text.extend(
        digits
            .chars()
            .filter(|c| *c != '_')
            .map(|c| c.to_ascii_lowercase()),
    );
    Some(Cow::Owned(text))
}

impl OriginalText<'_> {
    /// The rest of TypeScript's `shouldEmitDotDot` (6.0.3 at 050880ce59,
    /// `src/compiler/emitter.ts:2647`), read from the source between a number's end and its
    /// property, `start..end`: the emit writes no second dot after a number in parentheses, which
    /// `mayNeedDotDotForPropertyAccess` does not see as a number, nor after a comment or a line
    /// break it writes before the dot (`hasTrailingComment`, `hasTrailingWhitespace`). The tree
    /// keeps none of the three, so only spaces may come before the dot.
    fn dot_follows(&self, start: u32, end: u32) -> bool {
        // A range outside the source is a node a transform built, which no comment, line break or
        // parenthesis precedes.
        let Some(between) = self.source_text.get(start as usize..end as usize) else {
            return true;
        };
        let before_dot = between
            .split_once('.')
            .map_or(between, |(before, _)| before);
        before_dot
            .chars()
            .all(|c| c.is_whitespace() && !matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}'))
    }
}

/// TypeScript's `mayNeedDotDotForPropertyAccess` (6.0.3 at 050880ce59,
/// `src/compiler/emitter.ts:2668`): the text of `number`, which a property access follows, with a
/// dot after it, where the text has no radix prefix, no dot and no exponent. The text is the raw,
/// or for a number without one `"" + value`, which has a dot or an exponent unless it is an
/// integer below 1e21.
fn with_dot(number: &NumericLiteral<'_>) -> Option<String> {
    let Some(raw) = number.raw else {
        let integer = number.value.fract() == 0.0 && number.value.abs() < 1e21;
        return integer.then(|| format!("{}.", number.value));
    };
    let prefixed = matches!(
        raw.as_bytes(),
        [b'0', b'x' | b'X' | b'b' | b'B' | b'o' | b'O', ..]
    );
    let dotted = raw.bytes().any(|b| matches!(b, b'.' | b'e' | b'E'));
    (!prefixed && !dotted).then(|| format!("{raw}."))
}
