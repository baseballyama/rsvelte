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
                    // Svelte 5.52+: rewrite bare reads of `$derived` bindings
                    // to calls (e.g. `count` -> `count()`).
                    //
                    // NOTE: This runs BEFORE `transform_rune_in_template_expr` so
                    // that `wrap_derived_reads_in_script_inner` can see
                    // `$state.eager(<arg>)` in its original form and skip
                    // identifier-wrapping inside the eager call. Upstream's
                    // server visitor for `$state.eager` returns
                    // `node.arguments[0]` WITHOUT visiting it, so identifiers
                    // inside the eager call don't get the `()` derived-read
                    // wrap. The rune transform then unwraps the
                    // `$state.eager(...)` afterwards, leaving the unwrapped
                    // argument with its original identifiers.
                    let transformed = self.wrap_derived_reads(&transformed);
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
                        // Mirror upstream's `AwaitExpression.js` parent walk:
                        // `$.save(...)` only wraps when the path from the
                        // `AwaitExpression` back up hits a metadata-bearing
                        // non-Fragment / non-ExpressionTag parent — i.e. when
                        // the immediate template parent of this ExpressionTag
                        // is a RegularElement / TitleElement / SelectElement
                        // (where upstream uses `process_children` inline,
                        // keeping the element on top of the path). Every
                        // Fragment-bodied parent (root component fragment,
                        // IfBlock / EachBlock / KeyBlock / SnippetBlock /
                        // AwaitBlock body, SvelteHead, SvelteElement,
                        // SvelteBoundary, Component slot) goes through
                        // Fragment first, so the top-of-path stays `Fragment`
                        // and `save` is skipped — the surrounding async
                        // child_block already wraps the await.
                        //
                        // The `in_block_body` flag tracks this precisely:
                        // element visitors toggle it off for their direct
                        // children iteration; everywhere else it stays at the
                        // constructor default (`true` = "no save").
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
    let bytes = expr.as_bytes();
    let len = bytes.len();

    // Fast path: if no comment starters exist, return as-is
    if memchr::memmem::find(bytes, b"/*").is_none() && memchr::memmem::find(bytes, b"//").is_none()
    {
        return expr.to_string();
    }

    let mut result = String::with_capacity(expr.len());
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
            // Copy valid UTF-8 character (may be multi-byte)
            let start = i;
            let b = bytes[i];
            if b < 0x80 {
                i += 1;
            } else if b < 0xE0 {
                i += 2;
            } else if b < 0xF0 {
                i += 3;
            } else {
                i += 4;
            }
            let end = i.min(len);
            result.push_str(&expr[start..end]);
        }
    }
    let trimmed = result.trim().to_string();
    if trimmed.is_empty() {
        expr.to_string()
    } else {
        trimmed
    }
}
