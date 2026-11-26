//! The text TypeScript's emit prints a literal with, which is not always its source text.

use std::borrow::Cow;

use oxc_allocator::Allocator;
use oxc_ast::ast::{BigIntLiteral, NumericLiteral};
use oxc_ast_visit::VisitMut;

/// TypeScript's `canUseOriginalText` (6.0.3 at 050880ce59, `src/compiler/utilities.ts:2036`).
///
/// Where it does not allow a literal's source text, the emit prints the text the scanner keeps.
/// A bigint never keeps its text; a number keeps it unless `TokenFlags.IsInvalid` holds. The
/// separators an ES2021 target allows stay.
pub struct OriginalText<'o> {
    allocator: &'o Allocator,
}

impl std::fmt::Debug for OriginalText<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("OriginalText").finish_non_exhaustive()
    }
}

impl<'o> OriginalText<'o> {
    #[must_use]
    pub const fn new(allocator: &'o Allocator) -> Self {
        Self { allocator }
    }
}

impl<'o> VisitMut<'o> for OriginalText<'o> {
    fn visit_numeric_literal(&mut self, it: &mut NumericLiteral<'o>) {
        // The scanner's text for an invalid number is `"" + value`, which the printer gives one
        // without a raw.
        if it.raw.is_some_and(|raw| is_invalid(&raw)) {
            it.raw = None;
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
