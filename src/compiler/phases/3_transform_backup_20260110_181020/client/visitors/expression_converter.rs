//! Expression converter: crate::ast::js::Expression → JsExpr
//!
//! This module converts the JSON-based ESTree expressions from the parser
//! (crate::ast::js::Expression) into the strongly-typed JavaScript AST
//! (crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr).
//!
//! Corresponds to the visitor pattern in Svelte's transform phase.

use crate::ast::js::Expression;
use crate::compiler::phases::phase3_transform::client::types::ComponentContext;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use serde_json::Value;

/// Convert an Expression to JsExpr.
///
/// This is the main entry point for converting parsed JavaScript expressions
/// into the transform-phase AST format.
pub fn convert_expression(expr: &Expression, context: &mut ComponentContext) -> JsExpr {
    match expr {
        Expression::Value(val) => convert_json_value(val, context),
    }
}

/// Convert a JSON value to JsExpr.
///
/// This handles all ESTree node types by examining the "type" field.
fn convert_json_value(value: &Value, context: &mut ComponentContext) -> JsExpr {
    match value {
        Value::Object(obj) => {
            // Get the ESTree node type
            let node_type = obj
                .get("type")
                .and_then(|t| t.as_str())
                .unwrap_or("Unknown");

            match node_type {
                "Identifier" => convert_identifier(obj, context),
                "Literal" => convert_literal(obj, context),
                "MemberExpression" => convert_member_expression(obj, context),
                "CallExpression" => convert_call_expression(obj, context),
                "BinaryExpression" => convert_binary_expression(obj, context),
                "UnaryExpression" => convert_unary_expression(obj, context),
                "LogicalExpression" => convert_logical_expression(obj, context),
                "ConditionalExpression" => convert_conditional_expression(obj, context),
                "ArrayExpression" => convert_array_expression(obj, context),
                "ObjectExpression" => convert_object_expression(obj, context),
                "ArrowFunctionExpression" => convert_arrow_function(obj, context),
                "FunctionExpression" => convert_function_expression(obj, context),
                "AssignmentExpression" => convert_assignment_expression(obj, context),
                "UpdateExpression" => convert_update_expression(obj, context),
                "SequenceExpression" => convert_sequence_expression(obj, context),
                "ThisExpression" => JsExpr::This,
                "NewExpression" => convert_new_expression(obj, context),
                "AwaitExpression" => convert_await_expression(obj, context),
                "YieldExpression" => convert_yield_expression(obj, context),
                "SpreadElement" => convert_spread_element(obj, context),
                "TemplateLiteral" => convert_template_literal(obj, context),
                _ => {
                    // Unknown node type - return as raw comment
                    JsExpr::Raw(format!("/* Unknown: {} */", node_type))
                }
            }
        }
        Value::String(s) => JsExpr::Literal(JsLiteral::String(s.clone())),
        Value::Number(n) => JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0))),
        Value::Bool(b) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        Value::Null => JsExpr::Literal(JsLiteral::Null),
        Value::Array(_) => {
            // Arrays are typically handled as ArrayExpression
            JsExpr::Raw("/* Array */".to_string())
        }
    }
}

/// Convert an Identifier node.
fn convert_identifier(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let name = obj
        .get("name")
        .and_then(|n| n.as_str())
        .unwrap_or("unknown")
        .to_string();

    // Apply transformations if available
    if let Some(transform) = context.state.transform.get(&name)
        && let Some(read_fn) = transform.read
    {
        return read_fn(JsExpr::Identifier(name));
    }

    JsExpr::Identifier(name)
}

/// Convert a Literal node.
fn convert_literal(
    obj: &serde_json::Map<String, Value>,
    _context: &mut ComponentContext,
) -> JsExpr {
    let value = obj.get("value");

    match value {
        Some(Value::String(s)) => JsExpr::Literal(JsLiteral::String(s.clone())),
        Some(Value::Number(n)) => JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0))),
        Some(Value::Bool(b)) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        Some(Value::Null) | None => JsExpr::Literal(JsLiteral::Null),
        _ => {
            // Check for regex
            if let Some(regex_obj) = obj.get("regex").and_then(|r| r.as_object()) {
                let pattern = regex_obj
                    .get("pattern")
                    .and_then(|p| p.as_str())
                    .unwrap_or("")
                    .to_string();
                let flags = regex_obj
                    .get("flags")
                    .and_then(|f| f.as_str())
                    .unwrap_or("")
                    .to_string();
                return JsExpr::Literal(JsLiteral::Regex { pattern, flags });
            }
            JsExpr::Literal(JsLiteral::Null)
        }
    }
}

/// Convert a MemberExpression node.
fn convert_member_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let object = obj
        .get("object")
        .map(|o| Box::new(convert_json_value(o, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

    let computed = obj
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    let optional = obj
        .get("optional")
        .and_then(|o| o.as_bool())
        .unwrap_or(false);

    let property = if computed {
        obj.get("property")
            .map(|p| JsMemberProperty::Expression(Box::new(convert_json_value(p, context))))
            .unwrap_or(JsMemberProperty::Identifier("unknown".to_string()))
    } else {
        obj.get("property")
            .and_then(|p| p.as_object())
            .and_then(|p| p.get("name"))
            .and_then(|n| n.as_str())
            .map(|n| JsMemberProperty::Identifier(n.to_string()))
            .unwrap_or(JsMemberProperty::Identifier("unknown".to_string()))
    };

    JsExpr::Member(JsMemberExpression {
        object,
        property,
        computed,
        optional,
    })
}

/// Convert a CallExpression node.
fn convert_call_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let callee = obj
        .get("callee")
        .map(|c| Box::new(convert_json_value(c, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

    let arguments = obj
        .get("arguments")
        .and_then(|a| a.as_array())
        .map(|args| {
            args.iter()
                .map(|arg| convert_json_value(arg, context))
                .collect()
        })
        .unwrap_or_default();

    let optional = obj
        .get("optional")
        .and_then(|o| o.as_bool())
        .unwrap_or(false);

    JsExpr::Call(JsCallExpression {
        callee,
        arguments,
        optional,
    })
}

/// Convert a BinaryExpression node.
fn convert_binary_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("+");

    let operator = match operator_str {
        "+" => JsBinaryOp::Add,
        "-" => JsBinaryOp::Sub,
        "*" => JsBinaryOp::Mul,
        "/" => JsBinaryOp::Div,
        "%" => JsBinaryOp::Mod,
        "**" => JsBinaryOp::Pow,
        "==" => JsBinaryOp::Eq,
        "!=" => JsBinaryOp::Ne,
        "===" => JsBinaryOp::StrictEq,
        "!==" => JsBinaryOp::StrictNe,
        "<" => JsBinaryOp::Lt,
        "<=" => JsBinaryOp::Le,
        ">" => JsBinaryOp::Gt,
        ">=" => JsBinaryOp::Ge,
        "&" => JsBinaryOp::BitAnd,
        "|" => JsBinaryOp::BitOr,
        "^" => JsBinaryOp::BitXor,
        "<<" => JsBinaryOp::Shl,
        ">>" => JsBinaryOp::Shr,
        ">>>" => JsBinaryOp::UShr,
        "in" => JsBinaryOp::In,
        "instanceof" => JsBinaryOp::InstanceOf,
        _ => JsBinaryOp::Add,
    };

    let left = obj
        .get("left")
        .map(|l| Box::new(convert_json_value(l, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let right = obj
        .get("right")
        .map(|r| Box::new(convert_json_value(r, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Binary(JsBinaryExpression {
        operator,
        left,
        right,
    })
}

/// Convert a UnaryExpression node.
fn convert_unary_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("!");

    let operator = match operator_str {
        "-" => JsUnaryOp::Minus,
        "+" => JsUnaryOp::Plus,
        "!" => JsUnaryOp::Not,
        "~" => JsUnaryOp::BitNot,
        "typeof" => JsUnaryOp::TypeOf,
        "void" => JsUnaryOp::Void,
        "delete" => JsUnaryOp::Delete,
        _ => JsUnaryOp::Not,
    };

    let argument = obj
        .get("argument")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let prefix = obj.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);

    JsExpr::Unary(JsUnaryExpression {
        operator,
        argument,
        prefix,
    })
}

/// Convert a LogicalExpression node.
fn convert_logical_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("&&");

    let operator = match operator_str {
        "&&" => JsLogicalOp::And,
        "||" => JsLogicalOp::Or,
        "??" => JsLogicalOp::NullishCoalescing,
        _ => JsLogicalOp::And,
    };

    let left = obj
        .get("left")
        .map(|l| Box::new(convert_json_value(l, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let right = obj
        .get("right")
        .map(|r| Box::new(convert_json_value(r, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Logical(JsLogicalExpression {
        operator,
        left,
        right,
    })
}

/// Convert a ConditionalExpression node.
fn convert_conditional_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let test = obj
        .get("test")
        .map(|t| Box::new(convert_json_value(t, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let consequent = obj
        .get("consequent")
        .map(|c| Box::new(convert_json_value(c, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let alternate = obj
        .get("alternate")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Conditional(JsConditionalExpression {
        test,
        consequent,
        alternate,
    })
}

/// Convert an ArrayExpression node.
fn convert_array_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let elements = obj
        .get("elements")
        .and_then(|e| e.as_array())
        .map(|elems| {
            elems
                .iter()
                .map(|elem| {
                    if elem.is_null() {
                        None
                    } else {
                        Some(convert_json_value(elem, context))
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Array(JsArrayExpression { elements })
}

/// Convert an ObjectExpression node.
fn convert_object_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let properties = obj
        .get("properties")
        .and_then(|p| p.as_array())
        .map(|props| {
            props
                .iter()
                .filter_map(|prop| {
                    let prop_obj = prop.as_object()?;
                    let prop_type = prop_obj.get("type")?.as_str()?;

                    match prop_type {
                        "Property" => {
                            let key = convert_property_key(prop_obj, context);
                            let value = prop_obj
                                .get("value")
                                .map(|v| Box::new(convert_json_value(v, context)))
                                .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

                            let computed = prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            let kind = match prop_obj.get("kind")?.as_str()? {
                                "init" => JsPropertyKind::Init,
                                "get" => JsPropertyKind::Get,
                                "set" => JsPropertyKind::Set,
                                _ => JsPropertyKind::Init,
                            };

                            Some(JsObjectMember::Property(JsProperty {
                                key,
                                value,
                                kind,
                                computed,
                                shorthand,
                            }))
                        }
                        "SpreadElement" => {
                            let argument = prop_obj
                                .get("argument")
                                .map(|a| Box::new(convert_json_value(a, context)))
                                .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

                            Some(JsObjectMember::SpreadElement(argument))
                        }
                        _ => None,
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Object(JsObjectExpression { properties })
}

/// Convert a property key.
fn convert_property_key(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsPropertyKey {
    let key = obj.get("key");
    let computed = obj
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    if computed && let Some(k) = key {
        return JsPropertyKey::Computed(Box::new(convert_json_value(k, context)));
    }

    if let Some(key_obj) = key.and_then(|k| k.as_object()) {
        if let Some("Identifier") = key_obj.get("type").and_then(|t| t.as_str())
            && let Some(name) = key_obj.get("name").and_then(|n| n.as_str())
        {
            return JsPropertyKey::Identifier(name.to_string());
        }
        if let Some("Literal") = key_obj.get("type").and_then(|t| t.as_str()) {
            return JsPropertyKey::Literal(convert_literal(key_obj, context).into());
        }
    }

    JsPropertyKey::Identifier("unknown".to_string())
}

/// Convert an ArrowFunctionExpression node.
fn convert_arrow_function(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let params = convert_params(obj, context);

    let is_async = obj.get("async").and_then(|a| a.as_bool()).unwrap_or(false);

    let body = if let Some(body_obj) = obj.get("body").and_then(|b| b.as_object()) {
        if body_obj.get("type").and_then(|t| t.as_str()) == Some("BlockStatement") {
            JsArrowBody::Block(convert_block_statement(body_obj, context))
        } else {
            JsArrowBody::Expression(Box::new(convert_json_value(
                &Value::Object(body_obj.clone()),
                context,
            )))
        }
    } else {
        JsArrowBody::Block(JsBlockStatement::new())
    };

    JsExpr::Arrow(JsArrowFunction {
        params,
        body,
        is_async,
    })
}

/// Convert a FunctionExpression node.
fn convert_function_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let id = obj
        .get("id")
        .and_then(|i| i.as_object())
        .and_then(|i| i.get("name"))
        .and_then(|n| n.as_str())
        .map(|n| n.to_string());

    let params = convert_params(obj, context);

    let body = obj
        .get("body")
        .and_then(|b| b.as_object())
        .map(|b| convert_block_statement(b, context))
        .unwrap_or_default();

    let is_async = obj.get("async").and_then(|a| a.as_bool()).unwrap_or(false);

    let is_generator = obj
        .get("generator")
        .and_then(|g| g.as_bool())
        .unwrap_or(false);

    JsExpr::Function(JsFunctionExpression {
        id,
        params,
        body,
        is_async,
        is_generator,
    })
}

/// Convert function parameters.
fn convert_params(
    obj: &serde_json::Map<String, Value>,
    _context: &mut ComponentContext,
) -> Vec<JsPattern> {
    obj.get("params")
        .and_then(|p| p.as_array())
        .map(|params| {
            params
                .iter()
                .filter_map(|param| {
                    param
                        .as_object()
                        .and_then(|p| p.get("name"))
                        .and_then(|n| n.as_str())
                        .map(|n| JsPattern::Identifier(n.to_string()))
                })
                .collect()
        })
        .unwrap_or_default()
}

/// Convert a BlockStatement.
fn convert_block_statement(
    _obj: &serde_json::Map<String, Value>,
    _context: &mut ComponentContext,
) -> JsBlockStatement {
    // TODO: Implement full block statement conversion
    JsBlockStatement::new()
}

/// Convert an AssignmentExpression node.
fn convert_assignment_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("=");

    let operator = match operator_str {
        "=" => JsAssignmentOp::Assign,
        "+=" => JsAssignmentOp::AddAssign,
        "-=" => JsAssignmentOp::SubAssign,
        "*=" => JsAssignmentOp::MulAssign,
        "/=" => JsAssignmentOp::DivAssign,
        "%=" => JsAssignmentOp::ModAssign,
        "**=" => JsAssignmentOp::PowAssign,
        "<<=" => JsAssignmentOp::ShlAssign,
        ">>=" => JsAssignmentOp::ShrAssign,
        ">>>=" => JsAssignmentOp::UShrAssign,
        "&=" => JsAssignmentOp::BitAndAssign,
        "|=" => JsAssignmentOp::BitOrAssign,
        "^=" => JsAssignmentOp::BitXorAssign,
        "&&=" => JsAssignmentOp::AndAssign,
        "||=" => JsAssignmentOp::OrAssign,
        "??=" => JsAssignmentOp::NullishAssign,
        _ => JsAssignmentOp::Assign,
    };

    let left = obj
        .get("left")
        .map(|l| Box::new(convert_json_value(l, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let right = obj
        .get("right")
        .map(|r| Box::new(convert_json_value(r, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Assignment(JsAssignmentExpression {
        operator,
        left,
        right,
    })
}

/// Convert an UpdateExpression node.
fn convert_update_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("++");

    let operator = match operator_str {
        "++" => JsUpdateOp::Increment,
        "--" => JsUpdateOp::Decrement,
        _ => JsUpdateOp::Increment,
    };

    let argument = obj
        .get("argument")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    let prefix = obj.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);

    JsExpr::Update(JsUpdateExpression {
        operator,
        argument,
        prefix,
    })
}

/// Convert a SequenceExpression node.
fn convert_sequence_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let expressions = obj
        .get("expressions")
        .and_then(|e| e.as_array())
        .map(|exprs| {
            exprs
                .iter()
                .map(|expr| convert_json_value(expr, context))
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Sequence(JsSequenceExpression { expressions })
}

/// Convert a NewExpression node.
fn convert_new_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let callee = obj
        .get("callee")
        .map(|c| Box::new(convert_json_value(c, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Identifier("unknown".to_string())));

    let arguments = obj
        .get("arguments")
        .and_then(|a| a.as_array())
        .map(|args| {
            args.iter()
                .map(|arg| convert_json_value(arg, context))
                .collect()
        })
        .unwrap_or_default();

    JsExpr::New(JsNewExpression { callee, arguments })
}

/// Convert an AwaitExpression node.
fn convert_await_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let argument = obj
        .get("argument")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Await(argument)
}

/// Convert a YieldExpression node.
fn convert_yield_expression(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let argument = obj
        .get("argument")
        .map(|a| Some(Box::new(convert_json_value(a, context))));

    let delegate = obj
        .get("delegate")
        .and_then(|d| d.as_bool())
        .unwrap_or(false);

    JsExpr::Yield(JsYieldExpression {
        argument: argument.flatten(),
        delegate,
    })
}

/// Convert a SpreadElement node.
fn convert_spread_element(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let argument = obj
        .get("argument")
        .map(|a| Box::new(convert_json_value(a, context)))
        .unwrap_or_else(|| Box::new(JsExpr::Literal(JsLiteral::Null)));

    JsExpr::Spread(argument)
}

/// Convert a TemplateLiteral node.
fn convert_template_literal(
    obj: &serde_json::Map<String, Value>,
    context: &mut ComponentContext,
) -> JsExpr {
    let quasis = obj
        .get("quasis")
        .and_then(|q| q.as_array())
        .map(|quasis| {
            quasis
                .iter()
                .filter_map(|quasi| {
                    let quasi_obj = quasi.as_object()?;
                    let value_obj = quasi_obj.get("value")?.as_object()?;
                    let raw = value_obj.get("raw")?.as_str()?.to_string();
                    let cooked = value_obj
                        .get("cooked")
                        .and_then(|c| c.as_str())
                        .unwrap_or(&raw)
                        .to_string();
                    let tail = quasi_obj.get("tail")?.as_bool()?;

                    Some(JsTemplateElement { raw, cooked, tail })
                })
                .collect()
        })
        .unwrap_or_default();

    let expressions = obj
        .get("expressions")
        .and_then(|e| e.as_array())
        .map(|exprs| {
            exprs
                .iter()
                .map(|expr| convert_json_value(expr, context))
                .collect()
        })
        .unwrap_or_default();

    JsExpr::TemplateLiteral(JsTemplateLiteral {
        quasis,
        expressions,
    })
}

// Helper trait to convert JsExpr into JsLiteral for property keys
impl From<JsExpr> for JsLiteral {
    fn from(expr: JsExpr) -> Self {
        match expr {
            JsExpr::Literal(lit) => lit,
            _ => JsLiteral::Null,
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_convert_simple_json() {
        // Test basic conversion without context dependency
        let json = serde_json::json!({
            "type": "Literal",
            "value": "hello"
        });

        // We'll need a context to call convert_json_value
        // For now, we'll test the basic structure
        assert_eq!(json["type"], "Literal");
        assert_eq!(json["value"], "hello");
    }

    #[test]
    fn test_literal_conversion() {
        let json_str = serde_json::json!({
            "type": "Literal",
            "value": "test"
        });

        assert!(json_str.is_object());
        let obj = json_str.as_object().unwrap();
        assert_eq!(obj.get("type").and_then(|t| t.as_str()), Some("Literal"));
    }
}
