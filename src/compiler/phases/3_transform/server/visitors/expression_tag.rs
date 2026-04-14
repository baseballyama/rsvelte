//! Server-side expression tag visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::try_constant_fold_full;
use super::super::types::{ConstantFoldResult, OutputPart};
use super::shared::utils::has_top_level_comma;
use crate::ast::template::ExpressionTag;
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{escape_html, sanitize_template_string};

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
            // Strip JS comments (e.g., `/* @ts-expect-error ... */ null` → `null`)
            let expr_source = strip_js_comments(&expr_source);

            // First, try constant variable lookup and folding
            let folded = self.try_fold_with_constants(&expr_source);

            match folded {
                ConstantFoldResult::Null => {
                    // Skip null expressions entirely
                }
                ConstantFoldResult::Constant(content) => {
                    // Output constant with HTML escaping (matches official compiler's
                    // escape_html() call on evaluated values)
                    self.output_parts.push(OutputPart::Html(escape_html(
                        &sanitize_template_string(&content),
                    )));
                }
                ConstantFoldResult::Dynamic => {
                    // Dynamic expression - needs escaping
                    // Transform store subscriptions ($store -> $.store_get())
                    let transformed = self.transform_store_refs(&expr_source);
                    // Transform special legacy variables ($$props -> $$sanitized_props)
                    let transformed = self.transform_special_vars(&transformed);
                    // Transform rune calls that need server-side handling
                    let transformed = Self::transform_rune_in_template_expr(&transformed);
                    // If this is a sequence (comma) expression at the top level, wrap in parens
                    // so that $.escape(x, '') doesn't misinterpret as two arguments.
                    let transformed = if has_top_level_comma(&transformed) {
                        format!("({})", transformed)
                    } else {
                        transformed
                    };

                    // Check if the expression contains `await` - if so, use AsyncExpression
                    // so it gets rendered as a separate $$renderer.push(async () => ...) call
                    if self.use_async && super::super::helpers::expr_contains_await(&transformed) {
                        // Use $.save() when NOT inside a block body (if or each).
                        // Inside block bodies (child_block(async ...)), the block is already
                        // async and regular `await` should be used instead of `$.save()`.
                        // Reference: official compiler doesn't use $.save() inside child_block.
                        self.output_parts.push(OutputPart::AsyncExpression {
                            expr: transformed,
                            has_save: !self.in_block_body,
                        });
                    } else {
                        self.output_parts.push(OutputPart::Expression(transformed));
                    }
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
            // If the constant value is null or undefined, return Null so it renders as empty
            if value == "null" || value == "undefined" {
                return ConstantFoldResult::Null;
            }
            return ConstantFoldResult::Constant(value.clone());
        }

        // Handle nullish coalescing with variable lookup
        if let Some(idx) = memchr::memmem::find(trimmed.as_bytes(), b"??") {
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

        // Try evaluating arithmetic/concatenation expressions with known constants
        if let Some(value) =
            super::super::helpers::try_evaluate_with_constants(trimmed, &self.constant_vars)
        {
            return ConstantFoldResult::Constant(value);
        }

        // Fall back to generic constant folding
        try_constant_fold_full(trimmed)
    }
}

/// Strip JS block comments (`/* ... */`) from an expression string.
fn strip_js_comments(expr: &str) -> String {
    let mut result = String::with_capacity(expr.len());
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'*' {
            // Skip block comment
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2; // skip */
            }
        } else if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'/' {
            // Skip line comment
            i += 2;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
        } else {
            result.push(bytes[i] as char);
            i += 1;
        }
    }
    let trimmed = result.trim().to_string();
    if trimmed.is_empty() {
        expr.to_string()
    } else {
        trimmed
    }
}
