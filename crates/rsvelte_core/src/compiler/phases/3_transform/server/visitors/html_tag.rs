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
