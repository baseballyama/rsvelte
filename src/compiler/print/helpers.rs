//! Helper functions for the print module.
//!
//! This module provides utility functions used during the printing process,
//! such as formatting blocks and handling attributes.

use super::Context;

/// Threshold for when content should be formatted on separate lines.
///
/// If the measured length of content exceeds this threshold, it will be
/// formatted with newlines and indentation instead of inline.
pub const LINE_BREAK_THRESHOLD: usize = 50;

/// Format a block of content with optional inline formatting.
///
/// This function processes a node in a child context and decides whether to
/// format it inline or with newlines and indentation.
///
/// # Arguments
///
/// * `context` - The parent context to append to
/// * `visit_fn` - A function that visits the node and writes to the context
/// * `allow_inline` - Whether to allow inline formatting
///
/// # Behavior
///
/// - If the child context is empty, nothing is added
/// - If `allow_inline` is true and the child is single-line, it's appended inline
/// - Otherwise, the content is formatted with newlines and indentation
pub fn block<F>(context: &mut Context, visit_fn: F, allow_inline: bool)
where
    F: FnOnce(&mut Context),
{
    let mut child_context = context.child();
    visit_fn(&mut child_context);

    if child_context.empty() {
        return;
    }

    if allow_inline && !child_context.multiline {
        context.append(&child_context);
    } else {
        context.indent();
        context.newline();
        context.append(&child_context);
        context.dedent();
        context.newline();
    }
}

/// Check if an HTML element is void (self-closing).
///
/// Void elements in HTML5 do not have closing tags.
///
/// # Arguments
///
/// * `name` - The element name to check
///
/// # Returns
///
/// Returns true if the element is a void element.
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name.to_lowercase().as_str(),
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Convert ESTree JSON to JavaScript source code string.
///
/// This function converts an ESTree-formatted JSON value (serde_json::Value)
/// into its JavaScript source code representation.
///
/// # Arguments
///
/// * `node` - The ESTree node as JSON
///
/// # Returns
///
/// Returns the formatted JavaScript code as a string.
#[allow(dead_code)]
pub fn estree_to_string(node: &serde_json::Value) -> String {
    let mut generator = EstreeGenerator::new();
    generator.generate_node(node);
    generator.output
}

/// ESTree to JavaScript code generator.
#[allow(dead_code)]
struct EstreeGenerator {
    output: String,
}

impl EstreeGenerator {
    fn new() -> Self {
        Self {
            output: String::new(),
        }
    }

    fn generate_node(&mut self, node: &serde_json::Value) {
        let node_type = node.get("type").and_then(|t| t.as_str());

        match node_type {
            Some("Identifier") => self.generate_identifier(node),
            Some("Literal") => self.generate_literal(node),
            Some("MemberExpression") => self.generate_member_expression(node),
            Some("BinaryExpression") => self.generate_binary_expression(node),
            Some("LogicalExpression") => self.generate_logical_expression(node),
            Some("CallExpression") => self.generate_call_expression(node),
            Some("ArrayExpression") => self.generate_array_expression(node),
            Some("ObjectExpression") => self.generate_object_expression(node),
            Some("ArrowFunctionExpression") => self.generate_arrow_function(node),
            Some("FunctionExpression") => self.generate_function_expression(node),
            Some("UnaryExpression") => self.generate_unary_expression(node),
            Some("UpdateExpression") => self.generate_update_expression(node),
            Some("ConditionalExpression") => self.generate_conditional_expression(node),
            Some("TemplateLiteral") => self.generate_template_literal(node),
            Some("ArrayPattern") => self.generate_array_pattern(node),
            Some("ObjectPattern") => self.generate_object_pattern(node),
            Some("RestElement") => self.generate_rest_element(node),
            Some("SpreadElement") => self.generate_spread_element(node),
            Some("AssignmentPattern") => self.generate_assignment_pattern(node),
            Some("AssignmentExpression") => self.generate_assignment_expression(node),
            Some("SequenceExpression") => self.generate_sequence_expression(node),
            Some("ThisExpression") => self.output.push_str("this"),
            Some("NewExpression") => self.generate_new_expression(node),
            Some("ChainExpression") => {
                if let Some(expr) = node.get("expression") {
                    self.generate_node(expr);
                }
            }
            Some("AwaitExpression") => {
                self.output.push_str("await ");
                if let Some(arg) = node.get("argument") {
                    self.generate_node(arg);
                }
            }
            Some("YieldExpression") => {
                self.output.push_str("yield");
                if node
                    .get("delegate")
                    .and_then(|d| d.as_bool())
                    .unwrap_or(false)
                {
                    self.output.push('*');
                }
                if let Some(arg) = node.get("argument") {
                    self.output.push(' ');
                    self.generate_node(arg);
                }
            }
            Some("ParenthesizedExpression") => {
                self.output.push('(');
                if let Some(expr) = node.get("expression") {
                    self.generate_node(expr);
                }
                self.output.push(')');
            }
            Some("Property") => self.generate_property(node),
            _ => {
                // Fallback for unknown node types
                self.output.push_str("/* unknown */");
            }
        }
    }

    fn generate_identifier(&mut self, node: &serde_json::Value) {
        if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
            self.output.push_str(name);
        }
    }

    fn generate_literal(&mut self, node: &serde_json::Value) {
        if let Some(raw) = node.get("raw").and_then(|r| r.as_str()) {
            self.output.push_str(raw);
        } else if let Some(value) = node.get("value") {
            match value {
                serde_json::Value::String(s) => {
                    self.output.push('"');
                    for c in s.chars() {
                        match c {
                            '"' => self.output.push_str("\\\""),
                            '\\' => self.output.push_str("\\\\"),
                            '\n' => self.output.push_str("\\n"),
                            '\r' => self.output.push_str("\\r"),
                            '\t' => self.output.push_str("\\t"),
                            _ => self.output.push(c),
                        }
                    }
                    self.output.push('"');
                }
                serde_json::Value::Number(n) => {
                    self.output.push_str(&n.to_string());
                }
                serde_json::Value::Bool(b) => {
                    self.output.push_str(if *b { "true" } else { "false" });
                }
                serde_json::Value::Null => {
                    self.output.push_str("null");
                }
                _ => {}
            }
        }
    }

    fn generate_member_expression(&mut self, node: &serde_json::Value) {
        if let Some(object) = node.get("object") {
            let needs_parens = object.get("type").and_then(|t| t.as_str()) == Some("Literal")
                && object.get("value").and_then(|v| v.as_f64()).is_some();

            if needs_parens {
                self.output.push('(');
            }
            self.generate_node(object);
            if needs_parens {
                self.output.push(')');
            }
        }

        let optional = node
            .get("optional")
            .and_then(|o| o.as_bool())
            .unwrap_or(false);
        let computed = node
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);

        if optional {
            self.output.push_str("?.");
        } else if !computed {
            self.output.push('.');
        }

        if computed {
            if !optional {
                self.output.push('[');
            }
            if let Some(property) = node.get("property") {
                self.generate_node(property);
            }
            self.output.push(']');
        } else if let Some(property) = node.get("property") {
            if let Some(name) = property.get("name").and_then(|n| n.as_str()) {
                self.output.push_str(name);
            }
        }
    }

    fn generate_binary_expression(&mut self, node: &serde_json::Value) {
        if let Some(left) = node.get("left") {
            self.generate_node_with_parens(left);
        }

        if let Some(op) = node.get("operator").and_then(|o| o.as_str()) {
            self.output.push(' ');
            self.output.push_str(op);
            self.output.push(' ');
        }

        if let Some(right) = node.get("right") {
            self.generate_node_with_parens(right);
        }
    }

    fn generate_logical_expression(&mut self, node: &serde_json::Value) {
        if let Some(left) = node.get("left") {
            self.generate_node(left);
        }

        if let Some(op) = node.get("operator").and_then(|o| o.as_str()) {
            self.output.push(' ');
            self.output.push_str(op);
            self.output.push(' ');
        }

        if let Some(right) = node.get("right") {
            self.generate_node(right);
        }
    }

    fn generate_call_expression(&mut self, node: &serde_json::Value) {
        if let Some(callee) = node.get("callee") {
            let callee_type = callee.get("type").and_then(|t| t.as_str());
            let needs_parens = matches!(
                callee_type,
                Some("ArrowFunctionExpression") | Some("FunctionExpression")
            );

            if needs_parens {
                self.output.push('(');
            }
            self.generate_node(callee);
            if needs_parens {
                self.output.push(')');
            }
        }

        let optional = node
            .get("optional")
            .and_then(|o| o.as_bool())
            .unwrap_or(false);
        if optional {
            self.output.push_str("?.");
        }

        self.output.push('(');
        if let Some(args) = node.get("arguments").and_then(|a| a.as_array()) {
            for (i, arg) in args.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_node(arg);
            }
        }
        self.output.push(')');
    }

    fn generate_array_expression(&mut self, node: &serde_json::Value) {
        self.output.push('[');
        if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
            for (i, elem) in elements.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                if elem.is_null() {
                    // Hole in array
                } else {
                    self.generate_node(elem);
                }
            }
        }
        self.output.push(']');
    }

    fn generate_object_expression(&mut self, node: &serde_json::Value) {
        self.output.push_str("{ ");
        if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
            for (i, prop) in properties.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_property(prop);
            }
        }
        self.output.push_str(" }");
    }

    fn generate_property(&mut self, node: &serde_json::Value) {
        let prop_type = node.get("type").and_then(|t| t.as_str());

        if prop_type == Some("SpreadElement") {
            self.output.push_str("...");
            if let Some(arg) = node.get("argument") {
                self.generate_node(arg);
            }
            return;
        }

        let kind = node.get("kind").and_then(|k| k.as_str()).unwrap_or("init");
        let computed = node
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);
        let shorthand = node
            .get("shorthand")
            .and_then(|s| s.as_bool())
            .unwrap_or(false);

        if shorthand {
            if let Some(value) = node.get("value") {
                self.generate_node(value);
            }
            return;
        }

        if kind == "get" {
            self.output.push_str("get ");
        } else if kind == "set" {
            self.output.push_str("set ");
        }

        if computed {
            self.output.push('[');
        }

        if let Some(key) = node.get("key") {
            self.generate_node(key);
        }

        if computed {
            self.output.push(']');
        }

        self.output.push_str(": ");

        if let Some(value) = node.get("value") {
            self.generate_node(value);
        }
    }

    fn generate_arrow_function(&mut self, node: &serde_json::Value) {
        let is_async = node.get("async").and_then(|a| a.as_bool()).unwrap_or(false);
        if is_async {
            self.output.push_str("async ");
        }

        if let Some(params) = node.get("params").and_then(|p| p.as_array()) {
            if params.len() == 1
                && params[0].get("type").and_then(|t| t.as_str()) == Some("Identifier")
            {
                self.generate_node(&params[0]);
            } else {
                self.output.push('(');
                for (i, param) in params.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    self.generate_node(param);
                }
                self.output.push(')');
            }
        }

        self.output.push_str(" => ");

        if let Some(body) = node.get("body") {
            let body_type = body.get("type").and_then(|t| t.as_str());
            if body_type == Some("BlockStatement") {
                self.generate_block_statement(body);
            } else {
                // Expression body - wrap objects in parens
                if body_type == Some("ObjectExpression") {
                    self.output.push('(');
                    self.generate_node(body);
                    self.output.push(')');
                } else {
                    self.generate_node(body);
                }
            }
        }
    }

    fn generate_function_expression(&mut self, node: &serde_json::Value) {
        let is_async = node.get("async").and_then(|a| a.as_bool()).unwrap_or(false);
        let is_generator = node
            .get("generator")
            .and_then(|g| g.as_bool())
            .unwrap_or(false);

        if is_async {
            self.output.push_str("async ");
        }

        self.output.push_str("function");

        if is_generator {
            self.output.push('*');
        }

        if let Some(id) = node.get("id") {
            if !id.is_null() {
                self.output.push(' ');
                self.generate_node(id);
            }
        }

        self.output.push('(');
        if let Some(params) = node.get("params").and_then(|p| p.as_array()) {
            for (i, param) in params.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_node(param);
            }
        }
        self.output.push(')');

        self.output.push_str(" ");
        if let Some(body) = node.get("body") {
            self.generate_block_statement(body);
        }
    }

    fn generate_block_statement(&mut self, _node: &serde_json::Value) {
        self.output.push_str("{ /* block */ }");
    }

    fn generate_unary_expression(&mut self, node: &serde_json::Value) {
        let prefix = node.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);
        let op = node.get("operator").and_then(|o| o.as_str()).unwrap_or("");

        if prefix {
            self.output.push_str(op);
            if matches!(op, "typeof" | "void" | "delete") {
                self.output.push(' ');
            }
            if let Some(arg) = node.get("argument") {
                self.generate_node(arg);
            }
        } else {
            if let Some(arg) = node.get("argument") {
                self.generate_node(arg);
            }
            self.output.push_str(op);
        }
    }

    fn generate_update_expression(&mut self, node: &serde_json::Value) {
        let prefix = node.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);
        let op = node.get("operator").and_then(|o| o.as_str()).unwrap_or("");

        if prefix {
            self.output.push_str(op);
            if let Some(arg) = node.get("argument") {
                self.generate_node(arg);
            }
        } else {
            if let Some(arg) = node.get("argument") {
                self.generate_node(arg);
            }
            self.output.push_str(op);
        }
    }

    fn generate_conditional_expression(&mut self, node: &serde_json::Value) {
        if let Some(test) = node.get("test") {
            self.generate_node(test);
        }
        self.output.push_str(" ? ");
        if let Some(consequent) = node.get("consequent") {
            self.generate_node(consequent);
        }
        self.output.push_str(" : ");
        if let Some(alternate) = node.get("alternate") {
            self.generate_node(alternate);
        }
    }

    fn generate_template_literal(&mut self, node: &serde_json::Value) {
        self.output.push('`');

        if let Some(quasis) = node.get("quasis").and_then(|q| q.as_array()) {
            let expressions = node.get("expressions").and_then(|e| e.as_array());

            for (i, quasi) in quasis.iter().enumerate() {
                if let Some(raw) = quasi
                    .get("value")
                    .and_then(|v| v.get("raw"))
                    .and_then(|r| r.as_str())
                {
                    self.output.push_str(raw);
                }

                if let Some(exprs) = expressions {
                    if i < exprs.len() {
                        self.output.push_str("${");
                        self.generate_node(&exprs[i]);
                        self.output.push('}');
                    }
                }
            }
        }

        self.output.push('`');
    }

    fn generate_array_pattern(&mut self, node: &serde_json::Value) {
        self.output.push('[');
        if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
            for (i, elem) in elements.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                if elem.is_null() {
                    // Hole in pattern
                } else {
                    self.generate_node(elem);
                }
            }
        }
        self.output.push(']');
    }

    fn generate_object_pattern(&mut self, node: &serde_json::Value) {
        self.output.push_str("{ ");
        if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
            for (i, prop) in properties.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }

                let prop_type = prop.get("type").and_then(|t| t.as_str());
                if prop_type == Some("RestElement") {
                    self.output.push_str("...");
                    if let Some(arg) = prop.get("argument") {
                        self.generate_node(arg);
                    }
                } else {
                    let shorthand = prop
                        .get("shorthand")
                        .and_then(|s| s.as_bool())
                        .unwrap_or(false);
                    let computed = prop
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false);

                    if shorthand {
                        if let Some(value) = prop.get("value") {
                            self.generate_node(value);
                        }
                    } else {
                        if computed {
                            self.output.push('[');
                        }
                        if let Some(key) = prop.get("key") {
                            self.generate_node(key);
                        }
                        if computed {
                            self.output.push(']');
                        }
                        self.output.push_str(": ");
                        if let Some(value) = prop.get("value") {
                            self.generate_node(value);
                        }
                    }
                }
            }
        }
        self.output.push_str(" }");
    }

    fn generate_rest_element(&mut self, node: &serde_json::Value) {
        self.output.push_str("...");
        if let Some(arg) = node.get("argument") {
            self.generate_node(arg);
        }
    }

    fn generate_spread_element(&mut self, node: &serde_json::Value) {
        self.output.push_str("...");
        if let Some(arg) = node.get("argument") {
            self.generate_node(arg);
        }
    }

    fn generate_assignment_pattern(&mut self, node: &serde_json::Value) {
        if let Some(left) = node.get("left") {
            self.generate_node(left);
        }
        self.output.push_str(" = ");
        if let Some(right) = node.get("right") {
            self.generate_node(right);
        }
    }

    fn generate_assignment_expression(&mut self, node: &serde_json::Value) {
        if let Some(left) = node.get("left") {
            self.generate_node(left);
        }
        if let Some(op) = node.get("operator").and_then(|o| o.as_str()) {
            self.output.push(' ');
            self.output.push_str(op);
            self.output.push(' ');
        }
        if let Some(right) = node.get("right") {
            self.generate_node(right);
        }
    }

    fn generate_sequence_expression(&mut self, node: &serde_json::Value) {
        if let Some(expressions) = node.get("expressions").and_then(|e| e.as_array()) {
            for (i, expr) in expressions.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_node(expr);
            }
        }
    }

    fn generate_new_expression(&mut self, node: &serde_json::Value) {
        self.output.push_str("new ");
        if let Some(callee) = node.get("callee") {
            self.generate_node(callee);
        }
        self.output.push('(');
        if let Some(args) = node.get("arguments").and_then(|a| a.as_array()) {
            for (i, arg) in args.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_node(arg);
            }
        }
        self.output.push(')');
    }

    fn generate_node_with_parens(&mut self, node: &serde_json::Value) {
        let node_type = node.get("type").and_then(|t| t.as_str());
        let needs_parens = matches!(
            node_type,
            Some("BinaryExpression") | Some("ConditionalExpression") | Some("AssignmentExpression")
        );

        if needs_parens {
            self.output.push('(');
        }
        self.generate_node(node);
        if needs_parens {
            self.output.push(')');
        }
    }
}

/// Format JavaScript/TypeScript expression using oxc_codegen.
///
/// This function converts an oxc AST expression into a string representation.
///
/// # Arguments
///
/// * `_expr` - The oxc expression to format
///
/// # Returns
///
/// Returns the formatted expression as a string.
#[allow(dead_code)]
pub fn format_expression(_expr: &oxc_ast::ast::Expression) -> String {
    // TODO: This is a simplified implementation
    // We need to properly integrate oxc_codegen
    // For now, return a placeholder
    "/* expression */".to_string()
}

/// Format JavaScript/TypeScript statement using oxc_codegen.
///
/// This function converts an oxc AST statement into a string representation.
///
/// # Arguments
///
/// * `_stmt` - The oxc statement to format
///
/// # Returns
///
/// Returns the formatted statement as a string.
#[allow(dead_code)]
pub fn format_statement(_stmt: &oxc_ast::ast::Statement) -> String {
    // TODO: This is a simplified implementation
    // We need to properly integrate oxc_codegen
    // For now, return a placeholder
    "/* statement */".to_string()
}

/// Escape a string for use in HTML attributes.
///
/// This escapes quotes and special characters for safe attribute values.
///
/// # Arguments
///
/// * `s` - The string to escape
///
/// # Returns
///
/// Returns the escaped string.
#[allow(dead_code)]
pub fn escape_attribute_value(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// Escape a string for use in HTML text content.
///
/// This escapes HTML special characters.
///
/// # Arguments
///
/// * `s` - The string to escape
///
/// # Returns
///
/// Returns the escaped string.
#[allow(dead_code)]
pub fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// Check if expression is a simple identifier matching the given name (for shorthand syntax).
///
/// This is used to determine if directives can use shorthand syntax.
/// For example, `bind:value={value}` can be shortened to `bind:value`.
///
/// # Arguments
///
/// * `expr` - The expression
/// * `name` - The directive name to compare against
///
/// # Returns
///
/// Returns true if the expression is an Identifier with the same name.
pub fn is_shorthand_identifier(expr: &crate::ast::js::Expression, name: &str) -> bool {
    let crate::ast::js::Expression::Value(value) = expr;
    if let Some(obj) = value.as_object()
        && obj.get("type") == Some(&serde_json::Value::String("Identifier".to_string()))
        && let Some(expr_name) = obj.get("name").and_then(|v| v.as_str())
    {
        return expr_name == name;
    }
    false
}

/// Convert an Expression to string using estree format.
///
/// # Arguments
///
/// * `expr` - The expression to convert
///
/// # Returns
///
/// Returns the formatted JavaScript code as a string.
pub fn expression_to_string(expr: &crate::ast::js::Expression) -> String {
    let crate::ast::js::Expression::Value(value) = expr;
    estree_to_string(value)
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;

    #[test]
    fn test_is_void_element() {
        assert!(is_void_element("input"));
        assert!(is_void_element("br"));
        assert!(is_void_element("img"));
        assert!(is_void_element("INPUT")); // Case insensitive
        assert!(!is_void_element("div"));
        assert!(!is_void_element("span"));
    }

    #[test]
    fn test_escape_attribute_value() {
        assert_eq!(escape_attribute_value("hello"), "hello");
        assert_eq!(escape_attribute_value("a\"b"), "a&quot;b");
        assert_eq!(escape_attribute_value("a<b>c"), "a&lt;b&gt;c");
        assert_eq!(escape_attribute_value("a&b"), "a&amp;b");
    }

    #[test]
    fn test_escape_html() {
        assert_eq!(escape_html("hello"), "hello");
        assert_eq!(escape_html("a<b>c"), "a&lt;b&gt;c");
        assert_eq!(escape_html("a&b"), "a&amp;b");
    }

    #[test]
    fn test_block_inline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(&mut ctx, |c| c.write("short"), true);

        assert_eq!(ctx.to_string(), "short");
        assert!(!ctx.multiline);
    }

    #[test]
    fn test_block_multiline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(
            &mut ctx,
            |c| {
                c.write("line1");
                c.newline();
                c.write("line2");
            },
            true,
        );

        assert_eq!(ctx.to_string(), "\n  line1\n  line2\n");
        assert!(ctx.multiline);
    }

    #[test]
    fn test_block_no_inline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(&mut ctx, |c| c.write("content"), false);

        assert_eq!(ctx.to_string(), "\n  content\n");
        assert!(ctx.multiline);
    }

    #[test]
    fn test_block_empty() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(&mut ctx, |_c| {}, true);

        assert_eq!(ctx.to_string(), "");
        assert!(!ctx.multiline);
    }
}
