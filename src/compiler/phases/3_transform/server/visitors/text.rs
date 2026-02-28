//! Server-side text node visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::collapse_whitespace;
use super::super::types::OutputPart;
use crate::ast::template::Text;
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{escape_html, sanitize_template_string};

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_text(
        &mut self,
        text: &Text,
        _is_root: bool,
    ) -> Result<(), TransformError> {
        let data = &text.data;

        // When preserveWhitespace is set, output text as-is without collapsing
        if self.preserve_whitespace {
            if !data.is_empty() {
                let sanitized = sanitize_template_string(data);
                self.output_parts
                    .push(OutputPart::Html(escape_html(&sanitized)));
            }
            return Ok(());
        }

        // Non-breaking space (U+00A0) is NOT collapsible whitespace - treat as content
        let is_whitespace_only = data.chars().all(|c| c != '\u{00A0}' && c.is_whitespace());
        if is_whitespace_only {
            // Whitespace-only text becomes a single space if not empty,
            // but in SVG/MathML namespace or certain HTML elements (select, tr, table, etc.),
            // whitespace-only text nodes are entirely removed.
            // This matches the `can_remove_entirely` logic in the official compiler's clean_nodes.
            let can_remove_entirely = self.namespace == "svg" || self.namespace == "mathml";
            if !data.is_empty() && !can_remove_entirely {
                self.output_parts.push(OutputPart::Html(" ".to_string()));
            }
        } else {
            // Collapse all whitespace sequences (including newlines) to single spaces
            // This matches the behavior of clean_nodes in the official compiler
            let collapsed = collapse_whitespace(data);
            // First sanitize for template literal context (escape backslashes, backticks, ${),
            // then escape HTML special characters (& and <).
            // Order matters: sanitize first so that HTML entities (&amp;) aren't double-escaped.
            let sanitized = sanitize_template_string(&collapsed);
            self.output_parts
                .push(OutputPart::Html(escape_html(&sanitized)));
        }
        Ok(())
    }
}
