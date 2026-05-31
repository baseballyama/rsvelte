//! Server-side render tag ({@render}) visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::RenderTag;
use crate::compiler::phases::phase3_transform::TransformError;
use serde_json::Value;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_render_tag(&mut self, tag: &RenderTag) -> Result<(), TransformError> {
        // Get the expression type
        let expr_type = tag.expression.node_type().unwrap_or("");
        let is_optional = expr_type == "ChainExpression";

        // Get the expression JSON for deep access
        let expr_json = tag.expression.as_json();

        // Get the inner call for ChainExpression - clone to avoid lifetime issues
        let call_json: Value = if is_optional {
            match expr_json.get("expression") {
                Some(v) => v.clone(),
                None => return Ok(()),
            }
        } else {
            expr_json.clone()
        };

        let call_type = call_json
            .get("type")
            .and_then(|t: &Value| t.as_str())
            .unwrap_or("");
        if call_type != "CallExpression" {
            return Ok(());
        }

        // Get callee position
        let callee = match call_json.get("callee") {
            Some(c) => c,
            None => return Ok(()),
        };

        let c_start = callee
            .get("start")
            .and_then(|s: &Value| s.as_u64())
            .unwrap_or(0) as usize;
        let c_end = callee
            .get("end")
            .and_then(|s: &Value| s.as_u64())
            .unwrap_or(0) as usize;

        if c_end <= c_start || c_end > self.source.len() {
            return Ok(());
        }

        let callee_str = self.source[c_start..c_end].trim().to_string();
        // Strip TypeScript and transform store references in callee
        let callee_str = self.strip_ts_from_expr(&callee_str);
        let callee_str = self.transform_store_refs(&callee_str);

        // Wrap the callee in parentheses if it's not a simple expression
        // (e.g., `(optional ?? snippets.bar)($$renderer)` needs the parens)
        let callee_type = callee
            .get("type")
            .and_then(|t: &Value| t.as_str())
            .unwrap_or("");
        let callee_str = if matches!(
            callee_type,
            "SequenceExpression"
                | "LogicalExpression"
                | "BinaryExpression"
                | "ConditionalExpression"
                | "AssignmentExpression"
                | "ArrowFunctionExpression"
        ) {
            format!("({})", callee_str)
        } else {
            callee_str
        };

        // Get arguments
        let mut arg_strs = Vec::new();
        if let Some(args) = call_json
            .get("arguments")
            .and_then(|a: &Value| a.as_array())
        {
            for arg in args {
                let a_start = arg
                    .get("start")
                    .and_then(|s: &Value| s.as_u64())
                    .unwrap_or(0) as usize;
                let a_end = arg.get("end").and_then(|s: &Value| s.as_u64()).unwrap_or(0) as usize;
                if a_end > a_start && a_end <= self.source.len() {
                    let arg_str = self.source[a_start..a_end].trim().to_string();
                    let arg_str = self.strip_ts_from_expr(&arg_str);
                    let arg_str = self.transform_store_refs(&arg_str);
                    arg_strs.push(arg_str);
                }
            }
        }

        // Build the call: snippet($$renderer, ...args) or snippet?.($$renderer, ...args)
        let call_str = if is_optional {
            if arg_strs.is_empty() {
                format!("{}?.($$renderer)", callee_str)
            } else {
                format!("{}?.($$renderer, {})", callee_str, arg_strs.join(", "))
            }
        } else if arg_strs.is_empty() {
            format!("{}($$renderer)", callee_str)
        } else {
            format!("{}($$renderer, {})", callee_str, arg_strs.join(", "))
        };

        // Add the render call
        self.output_parts.push(OutputPart::RenderCall {
            call_str,
            skip_boundary: self.skip_hydration_boundaries,
        });

        Ok(())
    }
}
