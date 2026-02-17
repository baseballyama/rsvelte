//! Server-side expression tag visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::try_constant_fold_full;
use super::super::types::{ConstantFoldResult, OutputPart};
use crate::ast::template::ExpressionTag;
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::escape_html;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_expression_tag(
        &mut self,
        tag: &ExpressionTag,
    ) -> Result<(), TransformError> {
        let start = tag.start as usize;
        let end = tag.end as usize;

        if start + 1 < end && end <= self.source.len() {
            let expr_source = self.source[start + 1..end - 1].trim().to_string();
            // Strip TypeScript syntax (e.g., non-null assertions `!`)
            let expr_source = self.strip_ts_from_expr(&expr_source);

            // First, try constant variable lookup and folding
            let folded = self.try_fold_with_constants(&expr_source);

            match folded {
                ConstantFoldResult::Null => {
                    // Skip null expressions entirely
                }
                ConstantFoldResult::Constant(content) => {
                    // Output constant with HTML escaping (matches official compiler's
                    // escape_html() call on evaluated values)
                    self.output_parts
                        .push(OutputPart::Html(escape_html(&content)));
                }
                ConstantFoldResult::Dynamic => {
                    // Dynamic expression - needs escaping
                    // Transform store subscriptions ($store -> $.store_get())
                    let transformed = self.transform_store_refs(&expr_source);
                    // Transform rune calls that need server-side handling
                    let transformed = Self::transform_rune_in_template_expr(&transformed);
                    self.output_parts.push(OutputPart::Expression(transformed));
                }
            }
        }

        Ok(())
    }

    /// Try to fold an expression using known constant variables.
    pub(crate) fn try_fold_with_constants(&self, expr: &str) -> ConstantFoldResult {
        let trimmed = expr.trim();

        // First check if it's a simple variable that we know is constant
        if let Some(value) = self.constant_vars.get(trimmed) {
            return ConstantFoldResult::Constant(value.clone());
        }

        // Handle nullish coalescing with variable lookup
        if let Some(idx) = trimmed.find("??") {
            let left = trimmed[..idx].trim();
            let right = trimmed[idx + 2..].trim();

            // Try to fold left side with constants
            match self.try_fold_with_constants(left) {
                ConstantFoldResult::Null => {
                    // Left is null, evaluate right
                    return self.try_fold_with_constants(right);
                }
                ConstantFoldResult::Constant(val) => {
                    // Left is a non-null constant, use it
                    return ConstantFoldResult::Constant(val);
                }
                ConstantFoldResult::Dynamic => {
                    // Left is dynamic, can't fold
                }
            }
        }

        // Fall back to generic constant folding
        try_constant_fold_full(trimmed)
    }
}
