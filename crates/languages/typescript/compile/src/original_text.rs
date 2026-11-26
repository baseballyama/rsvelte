//! The text TypeScript's emit prints a literal with, which is not always its source text.

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

    /// The scanner's text for a hexadecimal bigint: its digits lowercased, without separators
    /// (`scanner.ts:1378`). Any other bigint's is its decimal value plus `n` (`scanner.ts:1869`),
    /// which the printer gives one without a raw.
    fn scanned_hexadecimal(&self, raw: &str) -> Option<&'o str> {
        let digits = raw.strip_prefix("0x").or_else(|| raw.strip_prefix("0X"))?;
        let digits: String = digits.chars().filter(|c| *c != '_').collect();
        Some(
            self.allocator
                .alloc_str(&format!("0x{}", digits.to_ascii_lowercase())),
        )
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
        it.raw = (it.raw)
            .and_then(|raw| self.scanned_hexadecimal(&raw))
            .map(Into::into);
    }
}

/// `TokenFlags.IsInvalid` of a number the parser accepts: `Octal` (`010`) and
/// `ContainsLeadingZero` (`08`, `09.5`), both a `0` followed by a digit (`scanner.ts:1236`).
/// `ContainsInvalidSeparator` and `ContainsInvalidEscape` are parse errors here.
const fn is_invalid(raw: &str) -> bool {
    matches!(raw.as_bytes(), [b'0', b'0'..=b'9', ..])
}
