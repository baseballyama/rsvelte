//! Server-side text node visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::collapse_whitespace;
use super::super::types::OutputPart;
use crate::ast::template::Text;
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::escape_html;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_text(
        &mut self,
        text: &Text,
        _is_root: bool,
    ) -> Result<(), TransformError> {
        let data = &text.data;

        if data.trim().is_empty() {
            // Whitespace-only text becomes a single space if not empty
            if !data.is_empty() {
                self.output_parts.push(OutputPart::Html(" ".to_string()));
            }
        } else {
            // Collapse all whitespace sequences (including newlines) to single spaces
            // This matches the behavior of clean_nodes in the official compiler
            let collapsed = collapse_whitespace(data);
            self.output_parts
                .push(OutputPart::Html(escape_html(&collapsed)));
        }
        Ok(())
    }
}
