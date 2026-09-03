//! Helper functions for the print module.
//!
//! This module provides utility functions used during the printing process,
//! such as formatting blocks and handling attributes.

use super::{Context, PrintError};
use crate::compiler::phases::phase3_transform::shared::json_field::Field;
use std::cell::RefCell;
use std::fmt::Write as _;

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
            | "command"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "keygen"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Every ESTree `type` string the fallback JSON printer can represent.
///
/// Kept next to the `match` it mirrors so that dropping an arm makes
/// `estree_supported_node_types_all_print` fail instead of silently widening
/// the unsupported set.
pub const SUPPORTED_ESTREE_NODE_TYPES: &[&str] = &[
    "Identifier",
    "Literal",
    "MemberExpression",
    "BinaryExpression",
    "LogicalExpression",
    "CallExpression",
    "ArrayExpression",
    "ObjectExpression",
    "ArrowFunctionExpression",
    "FunctionExpression",
    "UnaryExpression",
    "UpdateExpression",
    "ConditionalExpression",
    "TemplateLiteral",
    "ArrayPattern",
    "ObjectPattern",
    "RestElement",
    "SpreadElement",
    "AssignmentPattern",
    "AssignmentExpression",
    "SequenceExpression",
    "ThisExpression",
    "NewExpression",
    "ChainExpression",
    "AwaitExpression",
    "YieldExpression",
    "ParenthesizedExpression",
    "Property",
    "Super",
    "MetaProperty",
    "ImportExpression",
    "TaggedTemplateExpression",
    "PrivateIdentifier",
    "ClassExpression",
    "ClassDeclaration",
    "ClassBody",
    "MethodDefinition",
    "PropertyDefinition",
    "StaticBlock",
    "BlockStatement",
    "ExpressionStatement",
    "EmptyStatement",
    "DebuggerStatement",
    "ReturnStatement",
    "ThrowStatement",
    "BreakStatement",
    "ContinueStatement",
    "LabeledStatement",
    "VariableDeclaration",
    "VariableDeclarator",
    "FunctionDeclaration",
    "IfStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "WhileStatement",
    "DoWhileStatement",
    "SwitchStatement",
    "SwitchCase",
    "TryStatement",
    "CatchClause",
    "ImportDeclaration",
    "ExportNamedDeclaration",
    "ExportDefaultDeclaration",
    "ExportAllDeclaration",
];

thread_local! {
    /// Node descriptions this thread's in-flight print has failed to represent.
    static UNSUPPORTED_NODES: RefCell<Vec<String>> = const { RefCell::new(Vec::new()) };
}

/// Run `f` with a fresh unsupported-node sink, returning what it recorded.
///
/// The generator is reached through ~40 infallible `Context`-writing visitors,
/// so the failure travels out of band and is turned into a hard error at the
/// `print` boundary rather than being threaded through every visitor.
pub fn with_unsupported_sink<R>(f: impl FnOnce() -> R) -> (R, Vec<String>) {
    let saved = UNSUPPORTED_NODES.with(|sink| std::mem::take(&mut *sink.borrow_mut()));
    let result = f();
    let recorded = UNSUPPORTED_NODES.with(|sink| std::mem::replace(&mut *sink.borrow_mut(), saved));
    (result, recorded)
}

/// Build the `PrintError` for a non-empty batch of recorded nodes.
pub fn unsupported_nodes_error(recorded: &[String]) -> PrintError {
    PrintError::UnsupportedNode(format!(
        "{} node(s) the ESTree printer cannot represent: {}",
        recorded.len(),
        recorded.join(", ")
    ))
}

fn record_unsupported_node(node: &serde_json::Value, node_type: Option<&str>) {
    let start = node.field("start").and_then(serde_json::Value::as_u64);
    let end = node.field("end").and_then(serde_json::Value::as_u64);
    let location = match (start, end) {
        (Some(start), Some(end)) => format!(" at {start}..{end}"),
        (Some(start), None) => format!(" at {start}"),
        _ => String::new(),
    };
    let description = format!("{}{}", node_type.unwrap_or("<missing type>"), location);
    UNSUPPORTED_NODES.with(|sink| sink.borrow_mut().push(description));
}

/// Convert ESTree JSON to JavaScript source code string.
///
/// This function converts an ESTree-formatted JSON value (serde_json::Value)
/// into its JavaScript source code representation.
///
/// Node types outside [`SUPPORTED_ESTREE_NODE_TYPES`] are recorded in the
/// ambient sink installed by [`with_unsupported_sink`], which the `print` entry
/// point turns into an error; the placeholder text this returns for them must
/// never reach a caller as a success.
///
/// # Arguments
///
/// * `node` - The ESTree node as JSON
///
/// # Returns
///
/// Returns the formatted JavaScript code as a string.
pub fn estree_to_string(node: &serde_json::Value) -> String {
    let mut generator = EstreeGenerator::new();
    generator.generate_node(node);
    generator.output
}

/// Print an ESTree JSON node, failing on any type outside
/// [`SUPPORTED_ESTREE_NODE_TYPES`] instead of substituting a comment for it.
pub fn try_estree_to_string(node: &serde_json::Value) -> Result<String, PrintError> {
    let (output, recorded) = with_unsupported_sink(|| estree_to_string(node));
    if recorded.is_empty() {
        Ok(output)
    } else {
        Err(unsupported_nodes_error(&recorded))
    }
}

/// ECMAScript expression precedence; a higher value binds tighter.
///
/// The fallback printer has no source text to copy parentheses from, so it has
/// to reconstruct them from the tree.
mod precedence {
    pub const SEQUENCE: u8 = 1;
    pub const ASSIGNMENT: u8 = 2;
    pub const CONDITIONAL: u8 = 3;
    pub const COALESCE: u8 = 4;
    pub const LOGICAL_OR: u8 = 4;
    pub const LOGICAL_AND: u8 = 5;
    pub const BITWISE_OR: u8 = 6;
    pub const BITWISE_XOR: u8 = 7;
    pub const BITWISE_AND: u8 = 8;
    pub const EQUALITY: u8 = 9;
    pub const RELATIONAL: u8 = 10;
    pub const SHIFT: u8 = 11;
    pub const ADDITIVE: u8 = 12;
    pub const MULTIPLICATIVE: u8 = 13;
    pub const EXPONENTIAL: u8 = 14;
    pub const UNARY: u8 = 15;
    pub const POSTFIX: u8 = 16;
    pub const CALL: u8 = 17;
    pub const PRIMARY: u8 = 18;
}

/// The precedence of a binary operator, or `None` if it is not one.
fn binary_operator_precedence(operator: &str) -> Option<u8> {
    Some(match operator {
        "??" => precedence::COALESCE,
        "||" => precedence::LOGICAL_OR,
        "&&" => precedence::LOGICAL_AND,
        "|" => precedence::BITWISE_OR,
        "^" => precedence::BITWISE_XOR,
        "&" => precedence::BITWISE_AND,
        "==" | "!=" | "===" | "!==" => precedence::EQUALITY,
        "<" | ">" | "<=" | ">=" | "in" | "instanceof" => precedence::RELATIONAL,
        "<<" | ">>" | ">>>" => precedence::SHIFT,
        "+" | "-" => precedence::ADDITIVE,
        "*" | "/" | "%" => precedence::MULTIPLICATIVE,
        "**" => precedence::EXPONENTIAL,
        _ => return None,
    })
}

/// `??` may not sit next to `&&` or `||` unparenthesized, however the two
/// precedences compare.
fn mixed_logical_min(parent_operator: &str, child: &serde_json::Value, min_precedence: u8) -> u8 {
    let child_operator =
        (child.field("type").and_then(|t| t.as_str()) == Some("LogicalExpression")).then(|| {
            child
                .field("operator")
                .and_then(|o| o.as_str())
                .unwrap_or("")
        });
    match (parent_operator, child_operator) {
        ("??", Some("&&" | "||")) | ("&&" | "||", Some("??")) => precedence::PRIMARY,
        _ => min_precedence,
    }
}

/// The precedence of an expression node as printed by [`EstreeGenerator`].
fn node_precedence(node: &serde_json::Value) -> u8 {
    match node.field("type").and_then(|t| t.as_str()) {
        Some("SequenceExpression") => precedence::SEQUENCE,
        Some("AssignmentExpression")
        | Some("ArrowFunctionExpression")
        | Some("YieldExpression") => precedence::ASSIGNMENT,
        Some("ConditionalExpression") => precedence::CONDITIONAL,
        Some("BinaryExpression") | Some("LogicalExpression") => node
            .field("operator")
            .and_then(|o| o.as_str())
            .and_then(binary_operator_precedence)
            .unwrap_or(precedence::PRIMARY),
        Some("UnaryExpression") | Some("AwaitExpression") => precedence::UNARY,
        Some("UpdateExpression") => {
            if node
                .field("prefix")
                .and_then(|p| p.as_bool())
                .unwrap_or(true)
            {
                precedence::UNARY
            } else {
                precedence::POSTFIX
            }
        }
        Some("CallExpression")
        | Some("MemberExpression")
        | Some("NewExpression")
        | Some("TaggedTemplateExpression")
        | Some("ImportExpression") => precedence::CALL,
        Some("ChainExpression") => node
            .field("expression")
            .map(node_precedence)
            .unwrap_or(precedence::CALL),
        _ => precedence::PRIMARY,
    }
}

/// ESTree to JavaScript code generator.
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
        let node_type = node.field("type").and_then(|t| t.as_str());

        match node_type {
            Some("Identifier") => self.generate_identifier(node),
            Some("Literal") => self.generate_literal(node),
            Some("MemberExpression") => self.generate_member_expression(node),
            Some("BinaryExpression") => self.generate_binary_expression(node),
            Some("LogicalExpression") => self.generate_binary_expression(node),
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
                if let Some(expr) = node.field("expression") {
                    self.generate_node(expr);
                }
            }
            Some("AwaitExpression") => {
                self.output.push_str("await ");
                if let Some(arg) = node.field("argument") {
                    self.generate_expression(arg, precedence::UNARY);
                }
            }
            Some("YieldExpression") => {
                self.output.push_str("yield");
                if node
                    .field("delegate")
                    .and_then(|d| d.as_bool())
                    .unwrap_or(false)
                {
                    self.output.push('*');
                }
                if let Some(arg) = node.field("argument") {
                    self.output.push(' ');
                    self.generate_expression(arg, precedence::ASSIGNMENT);
                }
            }
            Some("ParenthesizedExpression") => {
                self.output.push('(');
                if let Some(expr) = node.field("expression") {
                    self.generate_node(expr);
                }
                self.output.push(')');
            }
            Some("Property") => self.generate_property(node),
            Some("Super") => self.output.push_str("super"),
            Some("MetaProperty") => {
                if let Some(meta) = node.field("meta") {
                    self.generate_node(meta);
                }
                self.output.push('.');
                if let Some(property) = node.field("property") {
                    self.generate_node(property);
                }
            }
            Some("ImportExpression") => self.generate_import_expression(node),
            Some("TaggedTemplateExpression") => {
                if let Some(tag) = node.field("tag") {
                    self.generate_node(tag);
                }
                if let Some(quasi) = node.field("quasi") {
                    self.generate_node(quasi);
                }
            }
            Some("PrivateIdentifier") => {
                self.output.push('#');
                if let Some(name) = node.field("name").and_then(|n| n.as_str()) {
                    self.output.push_str(name);
                }
            }
            Some("ClassExpression") | Some("ClassDeclaration") => self.generate_class(node),
            Some("ClassBody") => self.generate_class_body(node),
            Some("MethodDefinition") => self.generate_method_definition(node),
            Some("PropertyDefinition") => self.generate_property_definition(node),
            Some("StaticBlock") => {
                self.output.push_str("static ");
                self.generate_block_statement(node);
            }
            Some("BlockStatement") => self.generate_block_statement(node),
            Some("ExpressionStatement") => {
                if let Some(expr) = node.field("expression") {
                    self.generate_expression_statement(expr);
                }
                self.output.push(';');
            }
            Some("EmptyStatement") => self.output.push(';'),
            Some("DebuggerStatement") => self.output.push_str("debugger;"),
            Some("ReturnStatement") => self.generate_return_or_throw(node, "return"),
            Some("ThrowStatement") => self.generate_return_or_throw(node, "throw"),
            Some("BreakStatement") => self.generate_break_or_continue(node, "break"),
            Some("ContinueStatement") => self.generate_break_or_continue(node, "continue"),
            Some("LabeledStatement") => {
                if let Some(label) = node.field("label") {
                    self.generate_node(label);
                }
                self.output.push_str(": ");
                if let Some(body) = node.field("body") {
                    self.generate_node(body);
                }
            }
            Some("VariableDeclaration") => self.generate_variable_declaration(node, true),
            Some("VariableDeclarator") => self.generate_variable_declarator(node),
            Some("FunctionDeclaration") => self.generate_function_expression(node),
            Some("IfStatement") => self.generate_if_statement(node),
            Some("ForStatement") => self.generate_for_statement(node),
            Some("ForInStatement") => self.generate_for_in_of_statement(node, "in"),
            Some("ForOfStatement") => self.generate_for_in_of_statement(node, "of"),
            Some("WhileStatement") => {
                self.output.push_str("while (");
                if let Some(test) = node.field("test") {
                    self.generate_node(test);
                }
                self.output.push_str(") ");
                self.generate_body_statement(node.field("body"));
            }
            Some("DoWhileStatement") => {
                self.output.push_str("do ");
                self.generate_body_statement(node.field("body"));
                self.output.push_str(" while (");
                if let Some(test) = node.field("test") {
                    self.generate_node(test);
                }
                self.output.push_str(");");
            }
            Some("SwitchStatement") => self.generate_switch_statement(node),
            Some("SwitchCase") => self.generate_switch_case(node),
            Some("TryStatement") => self.generate_try_statement(node),
            Some("CatchClause") => self.generate_catch_clause(node),
            Some("ImportDeclaration") => self.generate_import_declaration(node),
            Some("ExportNamedDeclaration")
            | Some("ExportDefaultDeclaration")
            | Some("ExportAllDeclaration") => self.generate_export_declaration(node),
            _ => {
                record_unsupported_node(node, node_type);
                self.output.push_str("/* unknown */");
            }
        }
    }

    fn generate_identifier(&mut self, node: &serde_json::Value) {
        if let Some(name) = node.field("name").and_then(|n| n.as_str()) {
            self.output.push_str(name);
        }
    }

    fn generate_literal(&mut self, node: &serde_json::Value) {
        if let Some(raw) = node.field("raw").and_then(|r| r.as_str()) {
            self.output.push_str(raw);
        } else if let Some(value) = node.field("value") {
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
        if let Some(object) = node.field("object") {
            // A numeric literal receiver needs parens even though it is primary.
            let needs_parens = (object.field("type").and_then(|t| t.as_str()) == Some("Literal")
                && object.field("value").and_then(|v| v.as_f64()).is_some())
                || node_precedence(object) < precedence::CALL;

            if needs_parens {
                self.output.push('(');
            }
            self.generate_node(object);
            if needs_parens {
                self.output.push(')');
            }
        }

        let optional = node
            .field("optional")
            .and_then(|o| o.as_bool())
            .unwrap_or(false);
        let computed = node
            .field("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);

        if optional {
            self.output.push_str("?.");
        } else if !computed {
            self.output.push('.');
        }

        if computed {
            // Optional computed access prints as `obj?.[key]`: the `?.` above
            // plus a full `[ … ]`. The opening bracket must always be emitted
            // (previously it was skipped when `optional`, yielding the invalid
            // `obj?.key]`). M-037.
            self.output.push('[');
            if let Some(property) = node.field("property") {
                self.generate_node(property);
            }
            self.output.push(']');
        } else if let Some(property) = node.field("property")
            && let Some(name) = property.field("name").and_then(|n| n.as_str())
        {
            self.output.push_str(name);
        }
    }

    fn generate_binary_expression(&mut self, node: &serde_json::Value) {
        let operator = node
            .field("operator")
            .and_then(|o| o.as_str())
            .unwrap_or("");
        let own = binary_operator_precedence(operator).unwrap_or(precedence::PRIMARY);
        // `**` is the one right-associative binary operator.
        let (left_min, right_min) = if operator == "**" {
            (own + 1, own)
        } else {
            (own, own + 1)
        };

        if let Some(left) = node.field("left") {
            self.generate_expression(left, mixed_logical_min(operator, left, left_min));
        }
        if !operator.is_empty() {
            let _ = write!(self.output, " {operator} ");
        }
        if let Some(right) = node.field("right") {
            self.generate_expression(right, mixed_logical_min(operator, right, right_min));
        }
    }

    fn generate_call_expression(&mut self, node: &serde_json::Value) {
        if let Some(callee) = node.field("callee") {
            // A `function`/`class` callee also has to be parenthesized so the
            // call does not read as a declaration.
            let min = match callee.field("type").and_then(|t| t.as_str()) {
                Some("FunctionExpression") | Some("ClassExpression") => precedence::PRIMARY + 1,
                _ => precedence::CALL,
            };
            self.generate_expression(callee, min);
        }

        let optional = node
            .field("optional")
            .and_then(|o| o.as_bool())
            .unwrap_or(false);
        if optional {
            self.output.push_str("?.");
        }

        self.output.push('(');
        if let Some(args) = node.field("arguments").and_then(|a| a.as_array()) {
            for (i, arg) in args.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_expression(arg, precedence::ASSIGNMENT);
            }
        }
        self.output.push(')');
    }

    fn generate_array_expression(&mut self, node: &serde_json::Value) {
        self.output.push('[');
        if let Some(elements) = node.field("elements").and_then(|e| e.as_array()) {
            for (i, elem) in elements.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                if elem.is_null() {
                    // Hole in array
                } else {
                    self.generate_expression(elem, precedence::ASSIGNMENT);
                }
            }
        }
        self.output.push(']');
    }

    fn generate_object_expression(&mut self, node: &serde_json::Value) {
        self.output.push_str("{ ");
        if let Some(properties) = node.field("properties").and_then(|p| p.as_array()) {
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
        let prop_type = node.field("type").and_then(|t| t.as_str());

        if prop_type == Some("SpreadElement") {
            self.output.push_str("...");
            if let Some(arg) = node.field("argument") {
                self.generate_node(arg);
            }
            return;
        }

        let kind = node
            .field("kind")
            .and_then(|k| k.as_str())
            .unwrap_or("init");
        let computed = node
            .field("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);
        let shorthand = node
            .field("shorthand")
            .and_then(|s| s.as_bool())
            .unwrap_or(false);

        if shorthand {
            if let Some(value) = node.field("value") {
                self.generate_node(value);
            }
            return;
        }

        // `get`/`set`/method properties carry their function inline: writing
        // `get a: function () {}` instead is a syntax error, not a formatting
        // difference.
        let is_method = kind == "get"
            || kind == "set"
            || node
                .field("method")
                .and_then(|m| m.as_bool())
                .unwrap_or(false);

        if is_method {
            self.generate_method_definition(node);
            return;
        }

        if computed {
            self.output.push('[');
        }

        if let Some(key) = node.field("key") {
            self.generate_node(key);
        }

        if computed {
            self.output.push(']');
        }

        self.output.push_str(": ");

        if let Some(value) = node.field("value") {
            self.generate_expression(value, precedence::ASSIGNMENT);
        }
    }

    fn generate_arrow_function(&mut self, node: &serde_json::Value) {
        let is_async = node
            .field("async")
            .and_then(|a| a.as_bool())
            .unwrap_or(false);
        if is_async {
            self.output.push_str("async ");
        }

        if let Some(params) = node.field("params").and_then(|p| p.as_array()) {
            if params.len() == 1
                && params[0].field("type").and_then(|t| t.as_str()) == Some("Identifier")
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

        if let Some(body) = node.field("body") {
            let body_type = body.field("type").and_then(|t| t.as_str());
            if body_type == Some("BlockStatement") {
                self.generate_block_statement(body);
            } else {
                // An expression body opening with `{` would read as a block
                // body — `({ x } = o)` and `({ x })` alike.
                self.wrap_if_it_opens_with(
                    |generator| {
                        generator.generate_expression(body, precedence::ASSIGNMENT);
                    },
                    &["{"],
                );
            }
        }
    }

    fn generate_function_expression(&mut self, node: &serde_json::Value) {
        let is_async = node
            .field("async")
            .and_then(|a| a.as_bool())
            .unwrap_or(false);
        let is_generator = node
            .field("generator")
            .and_then(|g| g.as_bool())
            .unwrap_or(false);

        if is_async {
            self.output.push_str("async ");
        }

        self.output.push_str("function");

        if is_generator {
            self.output.push('*');
        }

        if let Some(id) = node.field("id")
            && !id.is_null()
        {
            self.output.push(' ');
            self.generate_node(id);
        }

        self.output.push('(');
        if let Some(params) = node.field("params").and_then(|p| p.as_array()) {
            for (i, param) in params.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_node(param);
            }
        }
        self.output.push(')');

        self.output.push(' ');
        if let Some(body) = node.field("body") {
            self.generate_block_statement(body);
        }
    }

    /// A statement may not start with `{`, `function` or `class`; the same
    /// expression written there needs parentheses that the tree does not carry.
    fn generate_expression_statement(&mut self, expr: &serde_json::Value) {
        self.wrap_if_it_opens_with(
            |generator| generator.generate_node(expr),
            &["{", "function", "class"],
        );
    }

    /// Parenthesize what `emit` wrote if it opens with a token the surrounding
    /// position reads as something else. Which token that is depends on the
    /// position, so the caller names them.
    fn wrap_if_it_opens_with(&mut self, emit: impl FnOnce(&mut Self), openers: &[&str]) {
        let start = self.output.len();
        emit(self);
        if openers
            .iter()
            .any(|opener| self.output[start..].starts_with(opener))
        {
            self.output.insert(start, '(');
            self.output.push(')');
        }
    }

    fn generate_import_expression(&mut self, node: &serde_json::Value) {
        self.output.push_str("import(");
        if let Some(source) = node.field("source") {
            self.generate_node(source);
        }
        // ESTree moved the second argument from `arguments` to `options`;
        // whichever spelling carries it must not be dropped.
        if let Some(options) = node.field("options").filter(|o| !o.is_null()) {
            self.output.push_str(", ");
            self.generate_node(options);
        } else if let Some(arguments) = node.field("arguments").and_then(|a| a.as_array()) {
            for argument in arguments {
                self.output.push_str(", ");
                self.generate_node(argument);
            }
        }
        self.output.push(')');
    }

    fn generate_block_statement(&mut self, node: &serde_json::Value) {
        let body = node.field("body").and_then(|b| b.as_array());
        match body {
            Some(statements) if !statements.is_empty() => {
                self.output.push_str("{ ");
                self.generate_statement_list(statements);
                self.output.push_str(" }");
            }
            _ => self.output.push_str("{}"),
        }
    }

    /// Print statements onto one line, which is the only shape this generator
    /// has — it carries no indentation state.
    fn generate_statement_list(&mut self, statements: &[serde_json::Value]) {
        for (i, statement) in statements.iter().enumerate() {
            if i > 0 {
                self.output.push(' ');
            }
            self.generate_node(statement);
        }
    }

    /// Print a nested statement, bracing a non-block so that the enclosing
    /// construct still reads as one statement.
    fn generate_body_statement(&mut self, body: Option<&serde_json::Value>) {
        let Some(body) = body else {
            self.output.push_str("{}");
            return;
        };
        if body.field("type").and_then(|t| t.as_str()) == Some("BlockStatement") {
            self.generate_block_statement(body);
        } else {
            self.output.push_str("{ ");
            self.generate_node(body);
            self.output.push_str(" }");
        }
    }

    fn generate_return_or_throw(&mut self, node: &serde_json::Value, keyword: &str) {
        self.output.push_str(keyword);
        if let Some(argument) = node.field("argument")
            && !argument.is_null()
        {
            self.output.push(' ');
            self.generate_node(argument);
        }
        self.output.push(';');
    }

    fn generate_break_or_continue(&mut self, node: &serde_json::Value, keyword: &str) {
        self.output.push_str(keyword);
        if let Some(label) = node.field("label")
            && !label.is_null()
        {
            self.output.push(' ');
            self.generate_node(label);
        }
        self.output.push(';');
    }

    fn generate_variable_declaration(&mut self, node: &serde_json::Value, terminate: bool) {
        let kind = node
            .field("kind")
            .and_then(|k| k.as_str())
            .unwrap_or("const");
        self.output.push_str(kind);
        self.output.push(' ');
        if let Some(declarations) = node.field("declarations").and_then(|d| d.as_array()) {
            for (i, declaration) in declarations.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_node(declaration);
            }
        }
        if terminate {
            self.output.push(';');
        }
    }

    fn generate_variable_declarator(&mut self, node: &serde_json::Value) {
        if let Some(id) = node.field("id") {
            self.generate_node(id);
        }
        if let Some(init) = node.field("init")
            && !init.is_null()
        {
            self.output.push_str(" = ");
            self.generate_expression(init, precedence::ASSIGNMENT);
        }
    }

    fn generate_if_statement(&mut self, node: &serde_json::Value) {
        self.output.push_str("if (");
        if let Some(test) = node.field("test") {
            self.generate_node(test);
        }
        self.output.push_str(") ");

        let alternate = node.field("alternate").filter(|a| !a.is_null());
        if alternate.is_some() {
            // Braced unconditionally: a bare `if (a) if (b) c();` consequent
            // would otherwise capture this statement's `else`.
            self.generate_body_statement(node.field("consequent"));
        } else if let Some(consequent) = node.field("consequent") {
            self.generate_node(consequent);
        }

        if let Some(alternate) = alternate {
            self.output.push_str(" else ");
            self.generate_node(alternate);
        }
    }

    fn generate_for_statement(&mut self, node: &serde_json::Value) {
        self.output.push_str("for (");
        if let Some(init) = node.field("init").filter(|i| !i.is_null()) {
            self.generate_for_head(init);
        }
        self.output.push_str("; ");
        if let Some(test) = node.field("test").filter(|t| !t.is_null()) {
            self.generate_node(test);
        }
        self.output.push_str("; ");
        if let Some(update) = node.field("update").filter(|u| !u.is_null()) {
            self.generate_node(update);
        }
        self.output.push_str(") ");
        self.generate_body_statement(node.field("body"));
    }

    fn generate_for_in_of_statement(&mut self, node: &serde_json::Value, operator: &str) {
        self.output.push_str("for ");
        if node
            .field("await")
            .and_then(|a| a.as_bool())
            .unwrap_or(false)
        {
            self.output.push_str("await ");
        }
        self.output.push('(');
        if let Some(left) = node.field("left") {
            self.generate_for_head(left);
        }
        let _ = write!(self.output, " {operator} ");
        if let Some(right) = node.field("right") {
            self.generate_node(right);
        }
        self.output.push_str(") ");
        self.generate_body_statement(node.field("body"));
    }

    /// A declaration in a `for` head carries no terminator of its own.
    fn generate_for_head(&mut self, node: &serde_json::Value) {
        if node.field("type").and_then(|t| t.as_str()) == Some("VariableDeclaration") {
            self.generate_variable_declaration(node, false);
        } else {
            self.generate_node(node);
        }
    }

    fn generate_switch_statement(&mut self, node: &serde_json::Value) {
        self.output.push_str("switch (");
        if let Some(discriminant) = node.field("discriminant") {
            self.generate_node(discriminant);
        }
        self.output.push_str(") ");
        match node.field("cases").and_then(|c| c.as_array()) {
            Some(cases) if !cases.is_empty() => {
                self.output.push_str("{ ");
                self.generate_statement_list(cases);
                self.output.push_str(" }");
            }
            _ => self.output.push_str("{}"),
        }
    }

    fn generate_switch_case(&mut self, node: &serde_json::Value) {
        match node.field("test").filter(|t| !t.is_null()) {
            Some(test) => {
                self.output.push_str("case ");
                self.generate_node(test);
                self.output.push(':');
            }
            None => self.output.push_str("default:"),
        }
        if let Some(consequent) = node.field("consequent").and_then(|c| c.as_array())
            && !consequent.is_empty()
        {
            self.output.push(' ');
            self.generate_statement_list(consequent);
        }
    }

    fn generate_try_statement(&mut self, node: &serde_json::Value) {
        self.output.push_str("try ");
        if let Some(block) = node.field("block") {
            self.generate_block_statement(block);
        }
        if let Some(handler) = node.field("handler")
            && !handler.is_null()
        {
            self.output.push(' ');
            self.generate_node(handler);
        }
        if let Some(finalizer) = node.field("finalizer")
            && !finalizer.is_null()
        {
            self.output.push_str(" finally ");
            self.generate_block_statement(finalizer);
        }
    }

    fn generate_catch_clause(&mut self, node: &serde_json::Value) {
        self.output.push_str("catch ");
        if let Some(param) = node.field("param")
            && !param.is_null()
        {
            self.output.push('(');
            self.generate_node(param);
            self.output.push_str(") ");
        }
        if let Some(body) = node.field("body") {
            self.generate_block_statement(body);
        }
    }

    fn generate_class(&mut self, node: &serde_json::Value) {
        self.output.push_str("class");
        if let Some(id) = node.field("id")
            && !id.is_null()
        {
            self.output.push(' ');
            self.generate_node(id);
        }
        if let Some(super_class) = node.field("superClass")
            && !super_class.is_null()
        {
            self.output.push_str(" extends ");
            self.generate_node(super_class);
        }
        self.output.push(' ');
        match node.field("body") {
            Some(body) => self.generate_class_body(body),
            None => self.output.push_str("{}"),
        }
    }

    fn generate_class_body(&mut self, node: &serde_json::Value) {
        match node.field("body").and_then(|b| b.as_array()) {
            Some(members) if !members.is_empty() => {
                self.output.push_str("{ ");
                self.generate_statement_list(members);
                self.output.push_str(" }");
            }
            _ => self.output.push_str("{}"),
        }
    }

    fn generate_method_definition(&mut self, node: &serde_json::Value) {
        if node
            .field("static")
            .and_then(|s| s.as_bool())
            .unwrap_or(false)
        {
            self.output.push_str("static ");
        }
        let value = node.field("value");
        if let Some(value) = value {
            if value
                .field("async")
                .and_then(|a| a.as_bool())
                .unwrap_or(false)
            {
                self.output.push_str("async ");
            }
            match node.field("kind").and_then(|k| k.as_str()) {
                Some("get") => self.output.push_str("get "),
                Some("set") => self.output.push_str("set "),
                _ => {}
            }
            if value
                .field("generator")
                .and_then(|g| g.as_bool())
                .unwrap_or(false)
            {
                self.output.push('*');
            }
        }
        self.generate_member_key(node);
        self.output.push('(');
        if let Some(params) = value
            .and_then(|v| v.field("params"))
            .and_then(|p| p.as_array())
        {
            for (i, param) in params.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_node(param);
            }
        }
        self.output.push_str(") ");
        match value.and_then(|v| v.field("body")) {
            Some(body) => self.generate_block_statement(body),
            None => self.output.push_str("{}"),
        }
    }

    fn generate_property_definition(&mut self, node: &serde_json::Value) {
        if node
            .field("static")
            .and_then(|s| s.as_bool())
            .unwrap_or(false)
        {
            self.output.push_str("static ");
        }
        self.generate_member_key(node);
        if let Some(value) = node.field("value")
            && !value.is_null()
        {
            self.output.push_str(" = ");
            self.generate_node(value);
        }
        self.output.push(';');
    }

    fn generate_member_key(&mut self, node: &serde_json::Value) {
        let computed = node
            .field("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);
        if computed {
            self.output.push('[');
        }
        if let Some(key) = node.field("key") {
            self.generate_node(key);
        }
        if computed {
            self.output.push(']');
        }
    }

    fn generate_import_declaration(&mut self, node: &serde_json::Value) {
        self.output.push_str("import ");

        let mut default_import = None;
        let mut namespace_import = None;
        let mut named_imports = Vec::new();

        if let Some(specifiers) = node.field("specifiers").and_then(|s| s.as_array()) {
            for specifier in specifiers {
                match specifier.field("type").and_then(|t| t.as_str()) {
                    Some("ImportDefaultSpecifier") => {
                        default_import = specifier.field("local").map(estree_to_string);
                    }
                    Some("ImportNamespaceSpecifier") => {
                        namespace_import = specifier
                            .field("local")
                            .map(|local| format!("* as {}", estree_to_string(local)));
                    }
                    Some("ImportSpecifier") => {
                        let imported = specifier
                            .field("imported")
                            .map(estree_to_string)
                            .unwrap_or_default();
                        let local = specifier
                            .field("local")
                            .map(estree_to_string)
                            .unwrap_or_default();
                        if imported == local {
                            named_imports.push(imported);
                        } else {
                            named_imports.push(format!("{imported} as {local}"));
                        }
                    }
                    _ => {}
                }
            }
        }

        let mut clauses = Vec::new();
        if let Some(default_import) = default_import {
            clauses.push(default_import);
        }
        if let Some(namespace_import) = namespace_import {
            clauses.push(namespace_import);
        } else if !named_imports.is_empty() {
            clauses.push(format!("{{ {} }}", named_imports.join(", ")));
        }

        // A side-effect import has no clause and therefore no `from`.
        if !clauses.is_empty() {
            self.output.push_str(&clauses.join(", "));
            self.output.push_str(" from ");
        }

        if let Some(source) = node.field("source") {
            self.generate_node(source);
        }
        self.output.push(';');
    }

    fn generate_export_declaration(&mut self, node: &serde_json::Value) {
        let node_type = node.field("type").and_then(|t| t.as_str());

        if node_type == Some("ExportDefaultDeclaration") {
            self.output.push_str("export default ");
            if let Some(declaration) = node.field("declaration") {
                self.generate_node(declaration);
                // A declaration terminates itself; an expression does not.
                let declares = matches!(
                    declaration.field("type").and_then(|t| t.as_str()),
                    Some("FunctionDeclaration") | Some("ClassDeclaration")
                );
                if !declares {
                    self.output.push(';');
                }
            }
            return;
        }

        self.output.push_str("export ");

        if node_type == Some("ExportAllDeclaration") {
            self.output.push('*');
            if let Some(exported) = node.field("exported")
                && !exported.is_null()
            {
                self.output.push_str(" as ");
                self.generate_node(exported);
            }
            self.output.push_str(" from ");
            if let Some(source) = node.field("source") {
                self.generate_node(source);
            }
            self.output.push(';');
            return;
        }

        if let Some(declaration) = node.field("declaration")
            && !declaration.is_null()
        {
            self.generate_node(declaration);
            return;
        }

        if let Some(specifiers) = node.field("specifiers").and_then(|s| s.as_array())
            && !specifiers.is_empty()
        {
            self.output.push_str("{ ");
            for (i, specifier) in specifiers.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                let exported = specifier
                    .field("exported")
                    .map(estree_to_string)
                    .unwrap_or_default();
                let local = specifier
                    .field("local")
                    .map(estree_to_string)
                    .unwrap_or_default();
                if exported == local {
                    self.output.push_str(&exported);
                } else {
                    let _ = write!(self.output, "{local} as {exported}");
                }
            }
            self.output.push_str(" }");
        }

        if let Some(source) = node.field("source")
            && !source.is_null()
        {
            self.output.push_str(" from ");
            self.generate_node(source);
        }

        self.output.push(';');
    }

    fn generate_unary_expression(&mut self, node: &serde_json::Value) {
        let prefix = node
            .field("prefix")
            .and_then(|p| p.as_bool())
            .unwrap_or(true);
        let op = node
            .field("operator")
            .and_then(|o| o.as_str())
            .unwrap_or("");

        if prefix {
            self.output.push_str(op);
            if matches!(op, "typeof" | "void" | "delete") {
                self.output.push(' ');
            }
            if let Some(arg) = node.field("argument") {
                self.generate_expression(arg, precedence::UNARY);
            }
        } else {
            if let Some(arg) = node.field("argument") {
                self.generate_expression(arg, precedence::UNARY);
            }
            self.output.push_str(op);
        }
    }

    fn generate_update_expression(&mut self, node: &serde_json::Value) {
        let prefix = node
            .field("prefix")
            .and_then(|p| p.as_bool())
            .unwrap_or(true);
        let op = node
            .field("operator")
            .and_then(|o| o.as_str())
            .unwrap_or("");

        if prefix {
            self.output.push_str(op);
            if let Some(arg) = node.field("argument") {
                self.generate_expression(arg, precedence::POSTFIX);
            }
        } else {
            if let Some(arg) = node.field("argument") {
                self.generate_expression(arg, precedence::POSTFIX);
            }
            self.output.push_str(op);
        }
    }

    fn generate_conditional_expression(&mut self, node: &serde_json::Value) {
        if let Some(test) = node.field("test") {
            self.generate_expression(test, precedence::CONDITIONAL + 1);
        }
        self.output.push_str(" ? ");
        if let Some(consequent) = node.field("consequent") {
            self.generate_expression(consequent, precedence::ASSIGNMENT);
        }
        self.output.push_str(" : ");
        if let Some(alternate) = node.field("alternate") {
            self.generate_expression(alternate, precedence::ASSIGNMENT);
        }
    }

    fn generate_template_literal(&mut self, node: &serde_json::Value) {
        self.output.push('`');

        if let Some(quasis) = node.field("quasis").and_then(|q| q.as_array()) {
            let expressions = node.field("expressions").and_then(|e| e.as_array());

            for (i, quasi) in quasis.iter().enumerate() {
                if let Some(raw) = quasi
                    .field("value")
                    .and_then(|v| v.field("raw"))
                    .and_then(|r| r.as_str())
                {
                    self.output.push_str(raw);
                }

                if let Some(exprs) = expressions
                    && i < exprs.len()
                {
                    self.output.push_str("${");
                    self.generate_node(&exprs[i]);
                    self.output.push('}');
                }
            }
        }

        self.output.push('`');
    }

    fn generate_array_pattern(&mut self, node: &serde_json::Value) {
        self.output.push('[');
        if let Some(elements) = node.field("elements").and_then(|e| e.as_array()) {
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
        if let Some(properties) = node.field("properties").and_then(|p| p.as_array()) {
            for (i, prop) in properties.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }

                let prop_type = prop.field("type").and_then(|t| t.as_str());
                if prop_type == Some("RestElement") {
                    self.output.push_str("...");
                    if let Some(arg) = prop.field("argument") {
                        self.generate_node(arg);
                    }
                } else {
                    let shorthand = prop
                        .field("shorthand")
                        .and_then(|s| s.as_bool())
                        .unwrap_or(false);
                    let computed = prop
                        .field("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false);

                    if shorthand {
                        if let Some(value) = prop.field("value") {
                            self.generate_expression(value, precedence::ASSIGNMENT);
                        }
                    } else {
                        if computed {
                            self.output.push('[');
                        }
                        if let Some(key) = prop.field("key") {
                            self.generate_node(key);
                        }
                        if computed {
                            self.output.push(']');
                        }
                        self.output.push_str(": ");
                        if let Some(value) = prop.field("value") {
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
        if let Some(arg) = node.field("argument") {
            self.generate_expression(arg, precedence::ASSIGNMENT);
        }
    }

    fn generate_spread_element(&mut self, node: &serde_json::Value) {
        self.output.push_str("...");
        if let Some(arg) = node.field("argument") {
            self.generate_expression(arg, precedence::ASSIGNMENT);
        }
    }

    fn generate_assignment_pattern(&mut self, node: &serde_json::Value) {
        if let Some(left) = node.field("left") {
            self.generate_node(left);
        }
        self.output.push_str(" = ");
        if let Some(right) = node.field("right") {
            self.generate_node(right);
        }
    }

    fn generate_assignment_expression(&mut self, node: &serde_json::Value) {
        if let Some(left) = node.field("left") {
            self.generate_node(left);
        }
        if let Some(op) = node.field("operator").and_then(|o| o.as_str()) {
            self.output.push(' ');
            self.output.push_str(op);
            self.output.push(' ');
        }
        if let Some(right) = node.field("right") {
            self.generate_expression(right, precedence::ASSIGNMENT);
        }
    }

    fn generate_sequence_expression(&mut self, node: &serde_json::Value) {
        if let Some(expressions) = node.field("expressions").and_then(|e| e.as_array()) {
            for (i, expr) in expressions.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_expression(expr, precedence::ASSIGNMENT);
            }
        }
    }

    fn generate_new_expression(&mut self, node: &serde_json::Value) {
        self.output.push_str("new ");
        if let Some(callee) = node.field("callee") {
            // `new f()()` must not re-read as `new (f()())`.
            let min = match callee.field("type").and_then(|t| t.as_str()) {
                Some("CallExpression") => precedence::PRIMARY + 1,
                _ => precedence::CALL,
            };
            self.generate_expression(callee, min);
        }
        self.output.push('(');
        if let Some(args) = node.field("arguments").and_then(|a| a.as_array()) {
            for (i, arg) in args.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.generate_expression(arg, precedence::ASSIGNMENT);
            }
        }
        self.output.push(')');
    }

    /// Print `node` as an operand, parenthesizing it when its own precedence
    /// is looser than the position it lands in.
    fn generate_expression(&mut self, node: &serde_json::Value, min_precedence: u8) {
        if node_precedence(node) < min_precedence {
            self.output.push('(');
            self.generate_node(node);
            self.output.push(')');
        } else {
            self.generate_node(node);
        }
    }
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
    let value = expr.as_json();
    if let Some(obj) = value.as_object()
        && obj.field("type") == Some(&serde_json::Value::String("Identifier".to_string()))
        && let Some(expr_name) = obj.field("name").and_then(|v| v.as_str())
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
    let value = expr.as_json();
    estree_to_string(value)
}

/// Convert an Expression to string using source text when available.
///
/// Falls back to the ESTree-based generator if source is not available or
/// the expression doesn't have valid start/end positions.
pub fn source_expression_to_string(
    expr: &crate::ast::js::Expression,
    source: Option<&str>,
) -> String {
    if let Some(src) = source {
        match expr {
            crate::ast::js::Expression::Typed(typed) => {
                if let (Some(start), Some(end)) = (typed.node.start(), typed.node.end()) {
                    let start = start as usize;
                    let end = end as usize;
                    if start < end && end <= src.len() {
                        return src[start..end].to_string();
                    }
                }
            }
            crate::ast::js::Expression::Lazy { .. } => {
                panic!("Expression::Lazy must be resolved before printing");
            }
        }
    }
    expression_to_string(expr)
}

/// Format a VariableDeclaration for ConstTag output.
///
/// Generates "const x = expr;" from the AST, using source text for the
/// declarator's init expression when available.
pub fn format_variable_declaration_from_source(
    expr: &crate::ast::js::Expression,
    source: Option<&str>,
) -> String {
    let json = expr.as_json();

    // Extract kind (should be "const")
    let kind = json
        .field("kind")
        .and_then(|k| k.as_str())
        .unwrap_or("const");

    if let Some(declarations) = json.field("declarations").and_then(|d| d.as_array()) {
        let mut result = format!("{} ", kind);

        for (i, decl) in declarations.iter().enumerate() {
            if i > 0 {
                result.push_str(", ");
            }

            // Get the declarator's start..end from source if available
            let decl_start = decl
                .field("start")
                .and_then(|s| s.as_u64())
                .map(|n| n as usize);
            let decl_end = decl
                .field("end")
                .and_then(|e| e.as_u64())
                .map(|n| n as usize);

            if let (Some(src), Some(s), Some(e)) = (source, decl_start, decl_end)
                && s < e
                && e <= src.len()
            {
                result.push_str(&src[s..e]);
                continue;
            }

            // Fallback: construct from AST
            if let Some(id) = decl.field("id") {
                result.push_str(&estree_to_string(id));
            }
            if let Some(init) = decl.field("init")
                && !init.is_null()
            {
                result.push_str(" = ");
                result.push_str(&estree_to_string(init));
            }
        }

        // Svelte 5.54.1 (upstream commit `7123bf3a1` "fix: remove trailing
        // semicolon from {@const} tag printer") dropped the trailing `;`
        // because `{@const x = expr}` is a closed template tag, not a JS
        // statement that needs a terminator. Source-extracted declarators
        // also already exclude the trailing `;` (the span ends before it).
        return result;
    }

    // Fallback
    expression_to_string(expr)
}

/// Format a Program node (script content) using original source text.
///
/// Extracts each statement's text from the source, normalizes indentation to tabs,
/// and preserves blank lines between statements.
pub fn format_program_from_source(program: &crate::ast::js::Expression, source: &str) -> String {
    // Collect (start, end) pairs from the program body
    let positions = get_program_body_positions(program);

    if positions.is_empty() {
        // Fallback
        return format_program(program.as_json());
    }

    let mut lines = Vec::new();
    let mut prev_end: Option<usize> = None;

    for (s, e) in &positions {
        let s = *s;
        let e = *e;

        if s >= e || e > source.len() {
            continue;
        }

        // Check for blank lines between statements
        if let Some(pe) = prev_end {
            let between = &source[pe..s];
            let newline_count = between.chars().filter(|c| *c == '\n').count();
            if newline_count > 1 {
                lines.push(String::new()); // blank line
            }
        }

        // Determine the base indentation from the source position
        let base_indent = get_column_indent(source, s);

        let stmt_text = &source[s..e];
        let normalized = strip_base_indent(stmt_text, base_indent);
        lines.push(normalized);
        prev_end = Some(e);
    }

    if lines.is_empty() {
        format_program(program.as_json())
    } else {
        lines.join("\n")
    }
}

/// Get (start, end) positions of each statement in a Program body.
fn get_program_body_positions(program: &crate::ast::js::Expression) -> Vec<(usize, usize)> {
    // Use JSON representation to access body statements.
    // The typed path would require ParseArena to resolve IdRange;
    // as_json() handles arena resolution internally via to_value().
    let json = program.as_json();
    if let Some(body) = json.field("body").and_then(|v| v.as_array()) {
        return body
            .iter()
            .filter_map(|stmt| {
                let s = stmt.field("start").and_then(|s| s.as_u64())? as usize;
                let e = stmt.field("end").and_then(|e| e.as_u64())? as usize;
                Some((s, e))
            })
            .collect();
    }

    Vec::new()
}

/// Get the indentation at a particular position in the source.
/// Counts backwards from the position to the most recent newline to find the column,
/// then determines how many indent units (tabs or spaces) precede the position.
fn get_column_indent(source: &str, pos: usize) -> usize {
    // Find the start of the current line
    let before = &source[..pos];
    let line_start = before.rfind('\n').map(|i| i + 1).unwrap_or(0);
    let prefix = &source[line_start..pos];

    // Count leading whitespace characters
    prefix.len() - prefix.trim_start().len()
}

/// Strip a given number of indentation characters from each line of text.
/// The first line is assumed to have 0 leading indent (since start position
/// is at the first token character), so only subsequent lines are stripped.
fn strip_base_indent(text: &str, base_indent: usize) -> String {
    let text_lines: Vec<&str> = text.lines().collect();
    if text_lines.is_empty() {
        return String::new();
    }

    let mut result_lines = Vec::new();
    for (i, line) in text_lines.iter().enumerate() {
        if i == 0 {
            // First line: no stripping needed (start pos is at token)
            result_lines.push(line.to_string());
        } else if line.trim().is_empty() {
            result_lines.push(String::new());
        } else {
            // Strip base_indent characters from the beginning
            let stripped = if line.len() > base_indent {
                &line[base_indent..]
            } else {
                line.trim_start()
            };
            result_lines.push(stripped.to_string());
        }
    }

    result_lines.join("\n")
}

/// Format a Program node (script content) to JavaScript source code.
///
/// # Arguments
///
/// * `program` - The ESTree Program node
///
/// # Returns
///
/// Returns the formatted JavaScript code as a string.
pub fn format_program(program: &serde_json::Value) -> String {
    // For a Program node, we need to handle the body array
    if let Some(body) = program.field("body").and_then(|v| v.as_array()) {
        if body.is_empty() {
            return String::new();
        }

        let mut result = String::new();
        for (i, stmt) in body.iter().enumerate() {
            if i > 0 {
                result.push('\n');
            }
            result.push_str(&estree_to_string(stmt));
        }
        result
    } else {
        // Fallback: treat as expression
        estree_to_string(program)
    }
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
    fn test_member_expression_optional_computed() {
        // M-037: `obj?.[key]` must keep its opening bracket (was printing the
        // invalid `obj?.key]`).
        let member = |optional: bool, computed: bool| {
            serde_json::json!({
                "type": "MemberExpression",
                "object": { "type": "Identifier", "name": "obj" },
                "property": { "type": "Identifier", "name": "key" },
                "optional": optional,
                "computed": computed,
            })
        };
        assert_eq!(estree_to_string(&member(true, true)), "obj?.[key]");
        assert_eq!(estree_to_string(&member(false, true)), "obj[key]");
        assert_eq!(estree_to_string(&member(true, false)), "obj?.key");
        assert_eq!(estree_to_string(&member(false, false)), "obj.key");
    }

    /// A minimal node plus its expected printing, for every entry of
    /// `SUPPORTED_ESTREE_NODE_TYPES`.
    fn sample_node(node_type: &str) -> Option<(serde_json::Value, &'static str)> {
        use serde_json::json;
        let ident = |name: &str| json!({ "type": "Identifier", "name": name });
        let one = json!({ "type": "Literal", "raw": "1", "value": 1 });
        let expr_stmt = || json!({ "type": "ExpressionStatement", "expression": { "type": "CallExpression", "callee": ident("f"), "arguments": [], "optional": false } });
        let return_one = || json!({ "type": "ReturnStatement", "argument": one });
        let block_of = |body: serde_json::Value| json!({ "type": "BlockStatement", "body": body });
        let empty_class_body = || json!({ "type": "ClassBody", "body": [] });
        let declaration = |kind: &str| json!({ "type": "VariableDeclaration", "kind": kind, "declarations": [{ "type": "VariableDeclarator", "id": ident("i"), "init": one }] });
        let switch_case =
            || json!({ "type": "SwitchCase", "test": one, "consequent": [expr_stmt()] });
        let catch_clause = || json!({ "type": "CatchClause", "param": ident("e"), "body": { "type": "BlockStatement", "body": [] } });

        let pair = match node_type {
            "Identifier" => (ident("a"), "a"),
            "Literal" => (json!({ "type": "Literal", "value": "s" }), "\"s\""),
            "MemberExpression" => (
                json!({ "type": "MemberExpression", "object": ident("obj"), "property": ident("key"), "computed": false, "optional": false }),
                "obj.key",
            ),
            "BinaryExpression" => (
                json!({ "type": "BinaryExpression", "operator": "+", "left": ident("a"), "right": ident("b") }),
                "a + b",
            ),
            "LogicalExpression" => (
                json!({ "type": "LogicalExpression", "operator": "&&", "left": ident("a"), "right": ident("b") }),
                "a && b",
            ),
            "CallExpression" => (
                json!({ "type": "CallExpression", "callee": ident("f"), "arguments": [ident("a")], "optional": false }),
                "f(a)",
            ),
            "ArrayExpression" => (
                json!({ "type": "ArrayExpression", "elements": [ident("a"), ident("b")] }),
                "[a, b]",
            ),
            "ObjectExpression" => (
                json!({ "type": "ObjectExpression", "properties": [{ "type": "Property", "kind": "init", "key": ident("a"), "value": ident("b"), "computed": false, "shorthand": false }] }),
                "{ a: b }",
            ),
            "ArrowFunctionExpression" => (
                json!({ "type": "ArrowFunctionExpression", "async": false, "params": [ident("x")], "body": ident("x") }),
                "x => x",
            ),
            "FunctionExpression" => (
                json!({ "type": "FunctionExpression", "async": false, "generator": false, "id": null, "params": [], "body": { "type": "BlockStatement", "body": [] } }),
                "function() {}",
            ),
            "UnaryExpression" => (
                json!({ "type": "UnaryExpression", "operator": "!", "prefix": true, "argument": ident("a") }),
                "!a",
            ),
            "UpdateExpression" => (
                json!({ "type": "UpdateExpression", "operator": "++", "prefix": false, "argument": ident("a") }),
                "a++",
            ),
            "ConditionalExpression" => (
                json!({ "type": "ConditionalExpression", "test": ident("a"), "consequent": ident("b"), "alternate": ident("c") }),
                "a ? b : c",
            ),
            "TemplateLiteral" => (
                json!({ "type": "TemplateLiteral", "quasis": [{ "type": "TemplateElement", "value": { "raw": "x" } }], "expressions": [] }),
                "`x`",
            ),
            "ArrayPattern" => (
                json!({ "type": "ArrayPattern", "elements": [ident("a"), ident("b")] }),
                "[a, b]",
            ),
            "ObjectPattern" => (
                json!({ "type": "ObjectPattern", "properties": [{ "type": "Property", "key": ident("a"), "value": ident("b"), "computed": false, "shorthand": false }] }),
                "{ a: b }",
            ),
            "RestElement" => (
                json!({ "type": "RestElement", "argument": ident("rest") }),
                "...rest",
            ),
            "SpreadElement" => (
                json!({ "type": "SpreadElement", "argument": ident("items") }),
                "...items",
            ),
            "AssignmentPattern" => (
                json!({ "type": "AssignmentPattern", "left": ident("a"), "right": one }),
                "a = 1",
            ),
            "AssignmentExpression" => (
                json!({ "type": "AssignmentExpression", "operator": "=", "left": ident("a"), "right": ident("b") }),
                "a = b",
            ),
            "SequenceExpression" => (
                json!({ "type": "SequenceExpression", "expressions": [ident("a"), ident("b")] }),
                "a, b",
            ),
            "ThisExpression" => (json!({ "type": "ThisExpression" }), "this"),
            "NewExpression" => (
                json!({ "type": "NewExpression", "callee": ident("A"), "arguments": [] }),
                "new A()",
            ),
            "ChainExpression" => (
                json!({ "type": "ChainExpression", "expression": { "type": "MemberExpression", "object": ident("obj"), "property": ident("key"), "computed": false, "optional": true } }),
                "obj?.key",
            ),
            "AwaitExpression" => (
                json!({ "type": "AwaitExpression", "argument": ident("a") }),
                "await a",
            ),
            "YieldExpression" => (
                json!({ "type": "YieldExpression", "delegate": false, "argument": ident("a") }),
                "yield a",
            ),
            "ParenthesizedExpression" => (
                json!({ "type": "ParenthesizedExpression", "expression": ident("a") }),
                "(a)",
            ),
            "Property" => (
                json!({ "type": "Property", "kind": "init", "key": ident("a"), "value": ident("b"), "computed": false, "shorthand": false }),
                "a: b",
            ),
            "Super" => (json!({ "type": "Super" }), "super"),
            "MetaProperty" => (
                json!({ "type": "MetaProperty", "meta": ident("import"), "property": ident("meta") }),
                "import.meta",
            ),
            "ImportExpression" => (
                json!({ "type": "ImportExpression", "source": { "type": "Literal", "raw": "'x'", "value": "x" }, "options": ident("o") }),
                "import('x', o)",
            ),
            "TaggedTemplateExpression" => (
                json!({ "type": "TaggedTemplateExpression", "tag": ident("tag"), "quasi": { "type": "TemplateLiteral", "quasis": [{ "type": "TemplateElement", "value": { "raw": "x" } }], "expressions": [] } }),
                "tag`x`",
            ),
            "PrivateIdentifier" => (json!({ "type": "PrivateIdentifier", "name": "x" }), "#x"),
            "ClassExpression" => (
                json!({ "type": "ClassExpression", "id": null, "superClass": null, "body": empty_class_body() }),
                "class {}",
            ),
            "ClassDeclaration" => (
                json!({ "type": "ClassDeclaration", "id": ident("A"), "superClass": ident("B"), "body": empty_class_body() }),
                "class A extends B {}",
            ),
            "ClassBody" => (
                json!({ "type": "ClassBody", "body": [{ "type": "PropertyDefinition", "static": false, "computed": false, "key": ident("a"), "value": one }] }),
                "{ a = 1; }",
            ),
            "MethodDefinition" => (
                json!({ "type": "MethodDefinition", "static": true, "kind": "get", "computed": false, "key": ident("a"), "value": { "type": "FunctionExpression", "async": false, "generator": false, "id": null, "params": [], "body": block_of(json!([return_one()])) } }),
                "static get a() { return 1; }",
            ),
            "PropertyDefinition" => (
                json!({ "type": "PropertyDefinition", "static": false, "computed": false, "key": { "type": "PrivateIdentifier", "name": "x" }, "value": one }),
                "#x = 1;",
            ),
            "StaticBlock" => (
                json!({ "type": "StaticBlock", "body": [expr_stmt()] }),
                "static { f(); }",
            ),
            "BlockStatement" => (
                block_of(json!([expr_stmt(), return_one()])),
                "{ f(); return 1; }",
            ),
            "ExpressionStatement" => (expr_stmt(), "f();"),
            "EmptyStatement" => (json!({ "type": "EmptyStatement" }), ";"),
            "DebuggerStatement" => (json!({ "type": "DebuggerStatement" }), "debugger;"),
            "ReturnStatement" => (return_one(), "return 1;"),
            "ThrowStatement" => (
                json!({ "type": "ThrowStatement", "argument": ident("e") }),
                "throw e;",
            ),
            "BreakStatement" => (
                json!({ "type": "BreakStatement", "label": ident("outer") }),
                "break outer;",
            ),
            "ContinueStatement" => (
                json!({ "type": "ContinueStatement", "label": null }),
                "continue;",
            ),
            "LabeledStatement" => (
                json!({ "type": "LabeledStatement", "label": ident("$"), "body": expr_stmt() }),
                "$: f();",
            ),
            "VariableDeclaration" => (declaration("let"), "let i = 1;"),
            "VariableDeclarator" => (
                json!({ "type": "VariableDeclarator", "id": ident("i"), "init": one }),
                "i = 1",
            ),
            "FunctionDeclaration" => (
                json!({ "type": "FunctionDeclaration", "async": false, "generator": false, "id": ident("f"), "params": [ident("a")], "body": block_of(json!([return_one()])) }),
                "function f(a) { return 1; }",
            ),
            "IfStatement" => (
                // A bare `if` consequent must be braced once an `else` follows,
                // or the inner `if` would capture it.
                json!({ "type": "IfStatement", "test": ident("a"), "consequent": json!({ "type": "IfStatement", "test": ident("b"), "consequent": expr_stmt(), "alternate": null }), "alternate": expr_stmt() }),
                "if (a) { if (b) f(); } else f();",
            ),
            "ForStatement" => (
                json!({ "type": "ForStatement", "init": declaration("let"), "test": ident("a"), "update": ident("b"), "body": block_of(json!([expr_stmt()])) }),
                "for (let i = 1; a; b) { f(); }",
            ),
            "ForInStatement" => (
                json!({ "type": "ForInStatement", "left": json!({ "type": "VariableDeclaration", "kind": "const", "declarations": [{ "type": "VariableDeclarator", "id": ident("k"), "init": null }] }), "right": ident("o"), "body": block_of(json!([])) }),
                "for (const k in o) {}",
            ),
            "ForOfStatement" => (
                json!({ "type": "ForOfStatement", "await": true, "left": ident("x"), "right": ident("o"), "body": block_of(json!([])) }),
                "for await (x of o) {}",
            ),
            "WhileStatement" => (
                json!({ "type": "WhileStatement", "test": ident("a"), "body": expr_stmt() }),
                "while (a) { f(); }",
            ),
            "DoWhileStatement" => (
                json!({ "type": "DoWhileStatement", "test": ident("a"), "body": block_of(json!([expr_stmt()])) }),
                "do { f(); } while (a);",
            ),
            "SwitchStatement" => (
                json!({ "type": "SwitchStatement", "discriminant": ident("a"), "cases": [switch_case()] }),
                "switch (a) { case 1: f(); }",
            ),
            "SwitchCase" => (switch_case(), "case 1: f();"),
            "TryStatement" => (
                json!({ "type": "TryStatement", "block": block_of(json!([expr_stmt()])), "handler": catch_clause(), "finalizer": block_of(json!([expr_stmt()])) }),
                "try { f(); } catch (e) {} finally { f(); }",
            ),
            "CatchClause" => (catch_clause(), "catch (e) {}"),
            "ImportDeclaration" => (
                json!({ "type": "ImportDeclaration", "specifiers": [], "source": { "type": "Literal", "raw": "'x'", "value": "x" } }),
                "import 'x';",
            ),
            "ExportNamedDeclaration" => (
                json!({ "type": "ExportNamedDeclaration", "declaration": null, "specifiers": [{ "type": "ExportSpecifier", "local": ident("a"), "exported": ident("b") }], "source": null }),
                "export { a as b };",
            ),
            "ExportDefaultDeclaration" => (
                json!({ "type": "ExportDefaultDeclaration", "declaration": ident("a") }),
                "export default a;",
            ),
            "ExportAllDeclaration" => (
                json!({ "type": "ExportAllDeclaration", "exported": ident("ns"), "source": { "type": "Literal", "raw": "'x'", "value": "x" } }),
                "export * as ns from 'x';",
            ),
            _ => return None,
        };
        Some(pair)
    }

    #[test]
    fn estree_supported_node_types_all_print() {
        for node_type in SUPPORTED_ESTREE_NODE_TYPES {
            let (node, expected) = sample_node(node_type)
                .unwrap_or_else(|| panic!("no sample node for supported type `{node_type}`"));
            let printed = try_estree_to_string(&node)
                .unwrap_or_else(|e| panic!("supported type `{node_type}` errored: {e}"));
            assert_eq!(printed, expected, "printing `{node_type}`");
            // A supported type that prints a comment is printing a placeholder:
            // `BlockStatement` used to be on this list while emitting
            // `{ /* block */ }`, which the exact-text comparison above cannot
            // tell apart from a real printing on its own.
            assert!(
                !printed.contains("/*"),
                "`{node_type}` printed the placeholder comment `{printed}`"
            );
        }
    }

    #[test]
    fn injected_unknown_node_type_is_an_error() {
        // Negative control for the test above: the same harness must reject a
        // type the generator does not handle.
        let node = serde_json::json!({
            "type": "TSNonNullExpression",
            "start": 12,
            "end": 20,
            "expression": { "type": "Identifier", "name": "a" },
        });
        let err = try_estree_to_string(&node).expect_err("unknown node type must not succeed");
        let message = err.to_string();
        assert!(message.contains("TSNonNullExpression"), "{message}");
        assert!(message.contains("12..20"), "{message}");
    }

    #[test]
    fn unknown_node_nested_in_a_supported_one_is_an_error() {
        let node = serde_json::json!({
            "type": "CallExpression",
            "callee": { "type": "Identifier", "name": "f" },
            "arguments": [{ "type": "TSSatisfiesExpression", "start": 3 }],
            "optional": false,
        });
        let err = try_estree_to_string(&node).expect_err("nested unknown node must not succeed");
        assert!(err.to_string().contains("TSSatisfiesExpression"));
    }

    #[test]
    fn unsupported_sink_does_not_leak_between_scopes() {
        let bogus = serde_json::json!({ "type": "NotARealNodeType" });
        assert!(try_estree_to_string(&bogus).is_err());
        // A later call in the same thread must not inherit the recorded node.
        assert_eq!(
            try_estree_to_string(&serde_json::json!({ "type": "ThisExpression" })).unwrap(),
            "this"
        );
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

        assert_eq!(ctx.to_string(), "\n\tline1\n\tline2\n");
        assert!(ctx.multiline);
    }

    #[test]
    fn test_block_no_inline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(&mut ctx, |c| c.write("content"), false);

        assert_eq!(ctx.to_string(), "\n\tcontent\n");
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
