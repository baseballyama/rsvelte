//! General utility functions for visitors.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/utils.js`.

use super::super::super::{Binding, BindingKind, DeclarationKind, errors};
use super::super::{AnalysisError, VisitorContext};
use crate::ast::template::{Fragment, TemplateNode};
use serde_json::Value;

/// Validate an assignment or update expression.
///
/// Corresponds to `validate_assignment` in utils.js.
///
/// # Arguments
///
/// * `node` - The assignment/update/bind node
/// * `argument` - The target being assigned to (Pattern or Expression)
/// * `context` - The visitor context
/// * `is_bind_directive` - Whether this is a bind: directive
pub fn validate_assignment(
    argument: &Value,
    context: &VisitorContext,
    is_bind_directive: bool,
) -> Result<(), AnalysisError> {
    // First validate that we're not assigning to constants
    validate_no_const_assignment(argument, context, is_bind_directive)?;

    // Handle Identifier assignments
    if let Some(name) = argument.get("name").and_then(|n| n.as_str()) {
        // Check if there's a binding for this identifier
        if let Some(binding) = context.analysis.root.scope.declarations.get(name) {
            let binding = &context.analysis.root.bindings[*binding];

            // Check for $props.id() assignment
            if context.analysis.runes {
                // TODO: Implement $props.id() check
                // if binding.node === context.state.analysis.props_id
            }

            // Check for each block item assignment
            if binding.kind == BindingKind::EachItem {
                return Err(errors::each_item_invalid_assignment());
            }

            // Check for snippet parameter assignment
            if matches!(binding.kind, BindingKind::SnippetParam) {
                return Err(errors::snippet_parameter_assignment());
            }
        }
    }

    // Handle MemberExpression with 'this' (state field assignments)
    if argument.get("type").and_then(|t| t.as_str()) == Some("MemberExpression")
        && argument
            .get("object")
            .and_then(|o| o.get("type"))
            .and_then(|t| t.as_str())
            == Some("ThisExpression")
    {
        // TODO: Implement state field validation
        // This requires tracking state fields during analysis
    }

    Ok(())
}

/// Validate that we're not assigning to a constant.
///
/// Corresponds to `validate_no_const_assignment` in utils.js.
///
/// # Arguments
///
/// * `argument` - The target being assigned to
/// * `context` - The visitor context
/// * `is_binding` - Whether this is a bind: directive
pub fn validate_no_const_assignment(
    argument: &Value,
    context: &VisitorContext,
    is_binding: bool,
) -> Result<(), AnalysisError> {
    let arg_type = argument.get("type").and_then(|t| t.as_str());

    match arg_type {
        Some("ArrayPattern") => {
            if let Some(elements) = argument.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        validate_no_const_assignment(element, context, is_binding)?;
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = argument.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if property.get("type").and_then(|t| t.as_str()) == Some("Property") {
                        if let Some(value) = property.get("value") {
                            validate_no_const_assignment(value, context, is_binding)?;
                        }
                    }
                }
            }
        }
        Some("Identifier") => {
            if let Some(name) = argument.get("name").and_then(|n| n.as_str()) {
                if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
                    let binding = &context.analysis.root.bindings[*binding_idx];

                    if binding.declaration_kind == DeclarationKind::Import
                        || (binding.declaration_kind == DeclarationKind::Const
                            && binding.kind != BindingKind::EachItem)
                    {
                        let thing = if binding.declaration_kind == DeclarationKind::Import {
                            "import"
                        } else {
                            "constant"
                        };

                        if is_binding {
                            return Err(errors::constant_binding(thing));
                        } else {
                            return Err(errors::constant_assignment(thing));
                        }
                    }
                }
            }
        }
        _ => {}
    }

    Ok(())
}

/// Validate that a control flow block opening is correct.
///
/// Corresponds to `validate_opening_tag` in utils.js.
///
/// In legacy mode, whitespace is allowed between `{` and the expected character.
/// In Svelte 5, it must be `{` immediately followed by the expected character.
///
/// # Arguments
///
/// * `start` - Start position of the block
/// * `source` - The source code
/// * `expected` - Expected character after `{`
pub fn validate_opening_tag(
    start: usize,
    source: &str,
    expected: char,
) -> Result<(), AnalysisError> {
    if start + 1 < source.len() {
        let chars: Vec<char> = source[start..].chars().collect();
        if chars.len() > 1 && chars[1] != expected {
            return Err(errors::block_unexpected_character(&expected.to_string()));
        }
    }
    Ok(())
}

/// Validate that a block is not empty (warn if only whitespace).
///
/// Corresponds to `validate_block_not_empty` in utils.js.
///
/// # Arguments
///
/// * `fragment` - The fragment to check
pub fn validate_block_not_empty(fragment: Option<&Fragment>) -> Result<(), AnalysisError> {
    if let Some(fragment) = fragment {
        // If the block has exactly one text node that's only whitespace, warn
        if fragment.nodes.len() == 1 {
            if let TemplateNode::Text(text) = &fragment.nodes[0] {
                if text.raw.trim().is_empty() {
                    // TODO: Add warning system
                    // w.block_empty(node)
                }
            }
        }
    }
    Ok(())
}

/// Ensure that a variable declaration doesn't conflict with module imports.
///
/// Corresponds to `ensure_no_module_import_conflict` in utils.js.
///
/// # Arguments
///
/// * `id` - The variable declarator pattern (Identifier, ArrayPattern, ObjectPattern)
/// * `context` - The visitor context
pub fn ensure_no_module_import_conflict(
    id: &Value,
    _context: &VisitorContext,
) -> Result<(), AnalysisError> {
    // Extract identifiers from the pattern
    let identifiers = extract_identifiers(id);

    for _name in identifiers {
        // Check if this name conflicts with a module import
        // TODO: Implement proper module scope checking
        // For now, just check if the name exists in module scope
        // This requires tracking module scope separately from instance scope
    }

    Ok(())
}

/// Extract all identifier names from a pattern.
fn extract_identifiers(pattern: &Value) -> Vec<String> {
    let mut names = Vec::new();

    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        names.extend(extract_identifiers(element));
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        names.extend(extract_identifiers(value));
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                names.extend(extract_identifiers(left));
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                names.extend(extract_identifiers(argument));
            }
        }
        _ => {}
    }

    names
}

/// Check if an identifier expression is "safe" (doesn't require component context).
///
/// Corresponds to `is_safe_identifier` in utils.js.
///
/// A "safe" identifier means the `foo` in `foo.bar` or `foo()` will not call
/// functions that require component context to exist.
///
/// # Arguments
///
/// * `expression` - The expression to check
/// * `context` - The visitor context
pub fn is_safe_identifier(expression: &Value, context: &VisitorContext) -> bool {
    // Navigate to the base identifier through MemberExpression chain
    let mut node = expression;
    while node.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(object) = node.get("object") {
            node = object;
        } else {
            break;
        }
    }

    // Must be an Identifier at the base
    if node.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return false;
    }

    let name = match node.get("name").and_then(|n| n.as_str()) {
        Some(n) => n,
        None => return false,
    };

    // Look up the binding
    let binding = match context.analysis.root.scope.declarations.get(name) {
        Some(idx) => &context.analysis.root.bindings[*idx],
        None => return true, // No binding means it's a global, which is safe
    };

    // Check if it's a store subscription ($store)
    if binding.kind == BindingKind::StoreSub {
        // Recursively check the underlying store (remove $)
        if name.starts_with('$') {
            let store_name = &name[1..];
            if context
                .analysis
                .root
                .scope
                .declarations
                .get(store_name)
                .is_some()
            {
                // Create a synthetic identifier for the store
                let store_expr = serde_json::json!({
                    "type": "Identifier",
                    "name": store_name
                });
                return is_safe_identifier(&store_expr, context);
            }
        }
    }

    // Safe if it's not an import, prop, bindable_prop, or rest_prop
    binding.declaration_kind != DeclarationKind::Import
        && !matches!(
            binding.kind,
            BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
        )
}

/// Check if an expression is pure (has no side effects).
///
/// Corresponds to `is_pure` in utils.js.
///
/// # Arguments
///
/// * `node` - The expression to check
/// * `context` - The visitor context
pub fn is_pure(node: &Value, context: &VisitorContext) -> bool {
    let node_type = match node.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return false,
    };

    // Literals are always pure
    if node_type == "Literal" {
        return true;
    }

    // Check CallExpression
    if node_type == "CallExpression" {
        // Check if callee is pure
        if let Some(callee) = node.get("callee") {
            if !is_pure(callee, context) {
                return false;
            }
        } else {
            return false;
        }

        // Check if all arguments are pure
        if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
            for arg in arguments {
                let arg_to_check =
                    if arg.get("type").and_then(|t| t.as_str()) == Some("SpreadElement") {
                        arg.get("argument").unwrap_or(arg)
                    } else {
                        arg
                    };

                if !is_pure(arg_to_check, context) {
                    return false;
                }
            }
        }

        return true;
    }

    // Must be Identifier or MemberExpression
    if node_type != "Identifier" && node_type != "MemberExpression" {
        return false;
    }

    // Check if it's $effect.tracking (not pure)
    // TODO: Implement rune detection
    // if (get_rune(b.call(node), context.state.scope) === '$effect.tracking') {
    //     return false;
    // }

    // Navigate to the leftmost node
    let mut left = node;
    while left.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(object) = left.get("object") {
            left = object;
        } else {
            break;
        }
    }

    // Check if base is an Identifier
    if left.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        if let Some(name) = left.get("name").and_then(|n| n.as_str()) {
            let binding = context.analysis.root.scope.declarations.get(name);
            if binding.is_none() {
                return true; // Globals are assumed to be safe
            }
        }
    } else if is_pure(left, context) {
        return true;
    }

    false
}

/// Validate an identifier name (check for invalid $ prefixes).
///
/// Corresponds to `validate_identifier_name` in utils.js.
///
/// # Arguments
///
/// * `binding` - The binding to validate
/// * `function_depth` - The current function depth (for legacy mode compatibility)
pub fn validate_identifier_name(
    binding: &Binding,
    function_depth: Option<usize>,
) -> Result<(), AnalysisError> {
    let declaration_kind = binding.declaration_kind;

    // Only validate if not synthetic, param, rest_param, and at appropriate depth
    if declaration_kind != DeclarationKind::Synthetic
        && declaration_kind != DeclarationKind::Param
        && declaration_kind != DeclarationKind::RestParam
        && function_depth.map_or(true, |depth| depth <= 1)
    {
        let name = &binding.name;

        // Check for bare '$'
        if name == "$" {
            return Err(errors::dollar_binding_invalid());
        }

        // Check for names starting with '$'
        if name.starts_with('$') {
            // TODO: Filter out type imports in migration script
            // For now, allow all $ prefixed names
            return Err(errors::dollar_prefix_invalid());
        }
    }

    Ok(())
}

/// Validate an export statement.
///
/// Corresponds to `validate_export` in utils.js.
///
/// Checks that the exported name is not a derived or reassigned state variable.
///
/// # Arguments
///
/// * `name` - The exported name
/// * `context` - The visitor context
pub fn validate_export(name: &str, context: &VisitorContext) -> Result<(), AnalysisError> {
    if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
        let binding = &context.analysis.root.bindings[*binding_idx];

        // Cannot export derived state
        if binding.kind == BindingKind::Derived {
            return Err(errors::derived_invalid_export());
        }

        // Cannot export reassigned state
        if matches!(binding.kind, BindingKind::State | BindingKind::RawState) && binding.reassigned
        {
            return Err(errors::state_invalid_export());
        }
    }

    Ok(())
}

// Utility functions for context checking (already present in the file)

/// Check if the current context is inside a specific block type.
pub fn is_inside_block(context: &VisitorContext, block_type: &str) -> bool {
    context.path.iter().any(|node| {
        matches!(
            (node, block_type),
            (TemplateNode::IfBlock(_), "if")
                | (TemplateNode::EachBlock(_), "each")
                | (TemplateNode::AwaitBlock(_), "await")
                | (TemplateNode::KeyBlock(_), "key")
                | (TemplateNode::SnippetBlock(_), "snippet")
        )
    })
}

/// Check if the current context is inside a component.
pub fn is_inside_component(context: &VisitorContext) -> bool {
    context.path.iter().any(|node| {
        matches!(
            node,
            TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::SvelteSelf(_)
        )
    })
}

/// Check if the current context is inside an element.
pub fn is_inside_element(context: &VisitorContext) -> bool {
    context.path.iter().any(|node| {
        matches!(
            node,
            TemplateNode::RegularElement(_) | TemplateNode::SvelteElement(_)
        )
    })
}

/// Get the closest ancestor element name.
pub fn get_closest_element<'a>(context: &'a VisitorContext<'a>) -> Option<&'a str> {
    for node in context.path.iter().rev() {
        if let TemplateNode::RegularElement(element) = node {
            return Some(&element.name);
        }
    }
    None
}

/// Check if a name is a valid JavaScript identifier.
pub fn is_valid_identifier(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let first = name.chars().next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    name.chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Check if an element is a void element (self-closing).
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name,
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

/// Check if an element is an SVG element.
pub fn is_svg_element(name: &str) -> bool {
    matches!(
        name,
        "svg"
            | "g"
            | "path"
            | "rect"
            | "circle"
            | "ellipse"
            | "line"
            | "polyline"
            | "polygon"
            | "text"
            | "tspan"
            | "textPath"
            | "image"
            | "use"
            | "defs"
            | "symbol"
            | "clipPath"
            | "mask"
            | "pattern"
            | "marker"
            | "linearGradient"
            | "radialGradient"
            | "stop"
            | "filter"
            | "feBlend"
            | "feColorMatrix"
            | "feComponentTransfer"
            | "feComposite"
            | "feConvolveMatrix"
            | "feDiffuseLighting"
            | "feDisplacementMap"
            | "feFlood"
            | "feGaussianBlur"
            | "feImage"
            | "feMerge"
            | "feMergeNode"
            | "feMorphology"
            | "feOffset"
            | "feSpecularLighting"
            | "feTile"
            | "feTurbulence"
            | "animate"
            | "animateMotion"
            | "animateTransform"
            | "set"
            | "foreignObject"
    )
}

/// Check if an element is a MathML element.
pub fn is_mathml_element(name: &str) -> bool {
    matches!(
        name,
        "math"
            | "mi"
            | "mn"
            | "mo"
            | "ms"
            | "mspace"
            | "mtext"
            | "menclose"
            | "merror"
            | "mfenced"
            | "mfrac"
            | "mpadded"
            | "mphantom"
            | "mroot"
            | "mrow"
            | "msqrt"
            | "mstyle"
            | "mmultiscripts"
            | "mover"
            | "mprescripts"
            | "msub"
            | "msubsup"
            | "msup"
            | "munder"
            | "munderover"
            | "mtable"
            | "mtd"
            | "mtr"
            | "maction"
            | "annotation"
            | "annotation-xml"
            | "semantics"
    )
}
