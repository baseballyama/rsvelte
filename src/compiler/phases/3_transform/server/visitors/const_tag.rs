//! Server-side const tag visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::ConstTag;
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_const_tag(&mut self, tag: &ConstTag) -> Result<(), TransformError> {
        // Get the declaration from the source
        let start = tag.declaration.start().unwrap_or(0) as usize;
        let end = tag.declaration.end().unwrap_or(0) as usize;
        if end > start && end <= self.source.len() {
            let mut declaration_source = self.source[start..end].trim().to_string();

            // Strip TypeScript type annotations from const declarations
            // e.g., `area: number = box.width * box.height` -> `area = box.width * box.height`
            if self.is_typescript && !declaration_source.is_empty() {
                // Wrap as a variable declaration for the TS parser
                let wrapped = format!("const {};", declaration_source);
                let stripped =
                    crate::compiler::phases::phase2_analyze::types::strip_typescript(&wrapped);
                // Unwrap back: remove "const " prefix and ";" suffix
                let stripped = stripped.trim();
                if let Some(rest) = stripped.strip_prefix("const ") {
                    declaration_source = rest.trim_end_matches(';').trim().to_string();
                }
            }

            // Try to extract the variable name and value for constant folding.
            // If the value is a simple literal, add it to constant_vars so subsequent
            // expression tags can fold references to this const.
            if let Some(eq_idx) = declaration_source.find('=') {
                let var_name = declaration_source[..eq_idx].trim();
                let var_value = declaration_source[eq_idx + 1..].trim();

                // Only simple identifiers (no destructuring)
                if var_name
                    .chars()
                    .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                    && !var_name.is_empty()
                {
                    // Try to evaluate the value using existing constants
                    if let Some(folded) = super::super::helpers::try_evaluate_with_constants(
                        var_value,
                        &self.constant_vars,
                    ) {
                        self.constant_vars.insert(var_name.to_string(), folded);
                    }
                }
            }

            self.output_parts
                .push(OutputPart::ConstDeclaration(declaration_source));
        }
        Ok(())
    }
}
