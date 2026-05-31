//! Server-side HTML tag ({@html}) visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use super::shared::utils::has_top_level_comma;
use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_html_tag(&mut self, tag: &HtmlTag) -> Result<(), TransformError> {
        // Get the expression from HtmlTag
        let start = tag.expression.start().unwrap_or(0) as usize;
        let end = tag.expression.end().unwrap_or(0) as usize;

        if end > start && end <= self.source.len() {
            let expr = self.source[start..end].trim().to_string();

            // Apply the same dynamic-expression transforms as the regular
            // `{expr}` (ExpressionTag) server path. Crucially this includes
            // `wrap_derived_reads`: on the server, `$derived` bindings are getter
            // functions, so `{@html post.html}` where `post` is `$derived(...)`
            // must become `$.html(post().html)`. Without it the expression read
            // `post.html` (a function's `.html`) is `undefined` and the tag
            // renders empty. `{@html}` differs from `{expr}` only in that it is
            // NOT HTML-escaped, so we skip the escape/constant-fold branch.
            let expr = self.strip_ts_from_expr(&expr);
            let expr = self.transform_store_refs(&expr);
            let expr = self.transform_special_vars(&expr);
            let expr = self.wrap_derived_reads(&expr);
            let expr = Self::transform_rune_in_template_expr(&expr);

            // If the expression is a comma/sequence expression at the top level,
            // wrap it in parens so $.html((f = 0, '')) is a single-argument call.
            let expr = if has_top_level_comma(&expr) {
                format!("({})", expr)
            } else {
                expr
            };
            self.output_parts.push(OutputPart::HtmlExpression(expr));
        } else {
            self.output_parts.push(OutputPart::Comment);
        }
        Ok(())
    }
}
