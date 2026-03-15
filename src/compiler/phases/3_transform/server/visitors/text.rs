//! Server-side text node visitor.

use super::super::ServerCodeGenerator;
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
            let can_remove_entirely = self.namespace == "svg";
            if !data.is_empty() && !can_remove_entirely {
                self.output_parts.push(OutputPart::Html(" ".to_string()));
            }
        } else {
            // Collapse only leading and trailing whitespace sequences to single spaces.
            // Internal whitespace is preserved as-is.
            // This matches the official compiler's clean_nodes behavior:
            // - replace leading whitespace with single space
            // - replace trailing whitespace with single space
            // - preserve internal whitespace (for CSS white-space: pre-line support
            //   and default slot content that might go into a <pre> tag)
            let collapsed = collapse_leading_trailing_ws(data);
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

/// Collapse only leading and trailing whitespace of a text string to single spaces.
/// Internal whitespace (between non-whitespace characters) is preserved.
/// This matches the official compiler's clean_nodes behavior.
fn collapse_leading_trailing_ws(s: &str) -> String {
    fn is_collapsible(c: char) -> bool {
        c != '\u{00A0}' && c.is_whitespace()
    }

    let leading_len = s.chars().take_while(|c| is_collapsible(*c)).count();
    let trailing_len = s.chars().rev().take_while(|c| is_collapsible(*c)).count();

    if leading_len == 0 && trailing_len == 0 {
        return s.to_string();
    }

    let leading_bytes: usize = s.chars().take(leading_len).map(|c| c.len_utf8()).sum();
    let trailing_bytes: usize = s
        .chars()
        .rev()
        .take(trailing_len)
        .map(|c| c.len_utf8())
        .sum();

    let content_start = leading_bytes;
    let content_end = s.len() - trailing_bytes;

    let mut result = String::with_capacity(s.len());
    if leading_len > 0 {
        result.push(' ');
    }
    if content_start < content_end {
        result.push_str(&s[content_start..content_end]);
    }
    if trailing_len > 0 {
        result.push(' ');
    }
    result
}
