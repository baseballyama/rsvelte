//! General utility functions for visitors.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/utils.js`.

use super::super::super::{Binding, BindingKind, DeclarationKind, Scope, errors, warnings};
use super::super::{AnalysisError, VisitorContext};
use crate::ast::template::{Fragment, TemplateNode};
use lazy_static::lazy_static;
use regex::Regex;
use serde_json::Value;

lazy_static! {
    /// Regular expression for illegal attribute characters.
    ///
    /// Pattern: /^[0-9-.]|[\^$@%&#?!|()[\]{}^*+~;]/
    /// - Matches if name starts with digit, hyphen, or dot
    /// - Or contains any of: ^$@%&#?!|()[]{}*+~;
    ///
    /// Corresponds to `regex_illegal_attribute_character` in patterns.js.
    pub static ref REGEX_ILLEGAL_ATTRIBUTE_CHARACTER: Regex =
        Regex::new(r"(^[0-9\-.])|([\^$@%&#?!|()\[\]{}*+~;])").unwrap();
}

/// Get the name from an AST node (Identifier, Literal, or PrivateIdentifier).
///
/// Corresponds to `get_name` in nodes.js.
///
/// # Arguments
///
/// * `node` - The AST node (Identifier, Literal, or PrivateIdentifier)
///
/// # Returns
///
/// The name as a string, or None if the node type is not supported
fn get_name(node: &Value) -> Option<String> {
    match node.get("type").and_then(|t| t.as_str()) {
        Some("Literal") => {
            // Return the literal value as a string
            node.get("value").map(|value| value.to_string())
        }
        Some("PrivateIdentifier") => {
            // Return '#' + name
            node.get("name")
                .and_then(|n| n.as_str())
                .map(|name| format!("#{}", name))
        }
        Some("Identifier") => {
            // Return the identifier name
            node.get("name").and_then(|n| n.as_str()).map(String::from)
        }
        _ => None,
    }
}

/// Get a parent node from the path, handling TypeScript wrapper nodes.
///
/// Corresponds to `get_parent` in utils/ast.js.
///
/// # Arguments
///
/// * `path` - The AST path (stack of nodes)
/// * `at` - The index to access (supports negative indexing)
///
/// # Returns
///
/// The parent node at the given index, skipping TypeScript wrapper nodes
fn get_parent(path: &[Value], at: isize) -> Option<&Value> {
    let len = path.len() as isize;
    let index = if at < 0 { len + at } else { at };

    if index < 0 || index >= len {
        return None;
    }

    let node = &path[index as usize];

    // Skip TypeScript wrapper nodes
    match node.get("type").and_then(|t| t.as_str()) {
        Some("TSNonNullExpression") | Some("TSAsExpression") => {
            // Get the next node in the appropriate direction
            let next_index = if at < 0 { at - 1 } else { at + 1 };
            get_parent(path, next_index)
        }
        _ => Some(node),
    }
}

/// Get the rune name from a CallExpression node.
///
/// Wrapper around the phase 3 get_rune implementation that works with JSON values.
/// Corresponds to `get_rune` in scope.js.
///
/// # Arguments
///
/// * `node` - The CallExpression node
/// * `scope` - The current scope
///
/// # Returns
///
/// The rune name (e.g., "$state", "$derived.by", "$effect.tracking") or None
fn get_rune_from_json(node: &Value, scope: &Scope) -> Option<String> {
    // Check if node is a CallExpression
    if node.get("type").and_then(|t| t.as_str()) != Some("CallExpression") {
        return None;
    }

    let callee = node.get("callee")?;
    let keypath = get_global_keypath(callee, scope)?;

    // Check if it's a valid rune
    if !is_rune(&keypath) {
        return None;
    }

    Some(keypath)
}

/// Get the global keypath for an expression (e.g., "$state", "$derived.by", "$effect.tracking").
///
/// Corresponds to `get_global_keypath` in scope.js.
///
/// # Arguments
///
/// * `node` - The expression node
/// * `scope` - The current scope
///
/// # Returns
///
/// The keypath string or None if not a global
fn get_global_keypath(node: &Value, scope: &Scope) -> Option<String> {
    let mut n = node;
    let mut joined = String::new();

    // Traverse MemberExpression chain
    while n.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        // Must be non-computed
        if n.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
            return None;
        }

        // Property must be Identifier
        let property = n.get("property")?;
        if property.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }

        let property_name = property.get("name").and_then(|n| n.as_str())?;
        joined = format!(".{}{}", property_name, joined);

        n = n.get("object")?;
    }

    // Handle CallExpression() pattern
    if n.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
        && n.get("callee")
            .and_then(|c| c.get("type"))
            .and_then(|t| t.as_str())
            == Some("Identifier")
    {
        joined = format!("(){}", joined);
        n = n.get("callee")?;
    }

    // Must end with an Identifier
    if n.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return None;
    }

    let name = n.get("name").and_then(|n| n.as_str())?;

    // Check if it's shadowed by a local binding
    if scope.declarations.contains_key(name) {
        return None;
    }

    Some(format!("{}{}", name, joined))
}

/// Check if a string is a valid rune name.
///
/// # Arguments
///
/// * `name` - The name to check
///
/// # Returns
///
/// `true` if the name is a valid rune
fn is_rune(name: &str) -> bool {
    matches!(
        name,
        "$state"
            | "$state.raw"
            | "$state.snapshot"
            | "$derived"
            | "$derived.by"
            | "$effect"
            | "$effect.pre"
            | "$effect.tracking"
            | "$effect.root"
            | "$props"
            | "$bindable"
            | "$inspect"
            | "$inspect.trace"
            | "$host"
    )
}

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
        // Use scope chain lookup to find the binding (respects lexical scoping)
        // This is important for snippet parameters which are declared in child scopes
        let binding_idx = context
            .analysis
            .root
            .get_binding(name, context.scope)
            .or_else(|| {
                // Fallback to searching all scopes when scope tracking isn't available
                // This handles cases like snippet parameters where context.scope may not
                // be properly updated during template analysis
                context.analysis.root.find_binding_any_scope(name)
            });

        if let Some(binding_idx) = binding_idx {
            let binding = &context.analysis.root.bindings[binding_idx];

            // Check for $props.id() assignment
            if context.analysis.runes
                && let Some(ref props_id) = context.analysis.props_id
                && &binding.name == props_id
            {
                return Err(errors::constant_assignment("$props.id()"));
            }

            // Check for each block item assignment (only in runes mode)
            // In legacy mode, binding to each items is allowed
            if context.analysis.runes && binding.kind == BindingKind::EachItem {
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
        // Get the property name
        let name = if argument
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
            && argument
                .get("property")
                .and_then(|p| p.get("type"))
                .and_then(|t| t.as_str())
                != Some("Literal")
        {
            None
        } else {
            argument.get("property").and_then(get_name)
        };

        // Check if this is a state field
        if let Some(ref field_name) = name
            && let Some(field) = context.state_fields.get(field_name)
            && field.node.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression")
        {
            // Check we're not assigning to a state field before its declaration in the constructor
            // Walk up the path to find if we're in a constructor
            let mut i = context.js_path.len();
            while i > 0 {
                i -= 1;
                let parent = &context.js_path[i];
                let parent_type = parent.get("type").and_then(|t| t.as_str());

                if matches!(
                    parent_type,
                    Some("FunctionDeclaration")
                        | Some("FunctionExpression")
                        | Some("ArrowFunctionExpression")
                ) {
                    // Get the grandparent
                    if let Some(grandparent) = get_parent(&context.js_path, (i as isize) - 1)
                        && grandparent.get("type").and_then(|t| t.as_str())
                            == Some("MethodDefinition")
                        && grandparent.get("kind").and_then(|k| k.as_str()) == Some("constructor")
                    {
                        // We're in a constructor - check if assignment is before field declaration
                        let node_start = argument.get("start").and_then(|s| s.as_u64());
                        let field_start = field.node.get("start").and_then(|s| s.as_u64());

                        if let (Some(node_start), Some(field_start)) = (node_start, field_start)
                            && node_start < field_start
                        {
                            return Err(errors::state_field_invalid_assignment());
                        }
                    }

                    break;
                }
            }
        }
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
                    if property.get("type").and_then(|t| t.as_str()) == Some("Property")
                        && let Some(value) = property.get("value")
                    {
                        validate_no_const_assignment(value, context, is_binding)?;
                    }
                }
            }
        }
        Some("Identifier") => {
            if let Some(name) = argument.get("name").and_then(|n| n.as_str()) {
                // Use scope chain lookup to find the correct binding
                // This respects lexical scoping - inner bindings shadow outer ones
                //
                // First try current scope, then fall back to root scope
                let binding_idx = context
                    .analysis
                    .root
                    .get_binding(name, context.scope)
                    .or_else(|| {
                        // Fallback to root scope declarations
                        context.analysis.root.scope.declarations.get(name).copied()
                    });

                if let Some(idx) = binding_idx {
                    let binding = &context.analysis.root.bindings[idx];

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
/// Returns Some(warning) if the block is "empty" (only whitespace), None otherwise.
///
/// # Arguments
///
/// * `fragment` - The fragment to check
pub fn validate_block_not_empty(
    fragment: Option<&Fragment>,
) -> Result<Option<warnings::AnalysisWarning>, AnalysisError> {
    if let Some(fragment) = fragment {
        // If the block has exactly one text node that's only whitespace, warn
        if fragment.nodes.len() == 1
            && let TemplateNode::Text(text) = &fragment.nodes[0]
            && !text.raw.is_empty()
            && text.raw.trim().is_empty()
        {
            return Ok(Some(warnings::block_empty()));
        }
    }
    Ok(None)
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
pub fn extract_identifiers(pattern: &Value) -> Vec<String> {
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

    // Look up the binding - search all scopes
    let binding = match context.analysis.root.find_binding_any_scope(name) {
        Some(idx) => &context.analysis.root.bindings[idx],
        None => return true, // No binding means it's a global, which is safe
    };

    // Check if it's a store subscription ($store)
    if binding.kind == BindingKind::StoreSub {
        // Recursively check the underlying store (remove $)
        if let Some(store_name) = name.strip_prefix('$')
            && context
                .analysis
                .root
                .scope
                .declarations
                .contains_key(store_name)
        {
            // Create a synthetic identifier for the store
            let store_expr = serde_json::json!({
                "type": "Identifier",
                "name": store_name
            });
            return is_safe_identifier(&store_expr, context);
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
    // Create a synthetic CallExpression to check with get_rune
    let call_node = serde_json::json!({
        "type": "CallExpression",
        "callee": node
    });

    if let Some(rune) = get_rune_from_json(&call_node, &context.analysis.root.scope)
        && rune == "$effect.tracking"
    {
        return false;
    }

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
        && function_depth.is_none_or(|depth| depth <= 1)
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

/// Determine whether an AST node is a reference.
///
/// Corresponds to the `is-reference` npm package.
///
/// A reference is an identifier that is being read from (as opposed to written to,
/// or being used as a property key, etc).
///
/// # Arguments
///
/// * `node` - The AST node to check
/// * `parent` - The parent AST node
///
/// # Returns
///
/// `true` if the node is a reference, `false` otherwise
pub fn is_reference(node: &Value, parent: Option<&Value>) -> bool {
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Handle MemberExpression
    if node_type == Some("MemberExpression") {
        let computed = node
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);
        if !computed && let Some(object) = node.get("object") {
            return is_reference(object, Some(node));
        }
        return false;
    }

    // Only Identifier nodes can be references
    if node_type != Some("Identifier") {
        return false;
    }

    // No parent means it's a reference
    let parent = match parent {
        Some(p) => p,
        None => return true,
    };

    let parent_type = parent.get("type").and_then(|t| t.as_str());

    match parent_type {
        // Disregard `bar` in `foo.bar`
        Some("MemberExpression") => {
            let computed = parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                return true;
            }
            // Check if node is the object (not the property)
            if let Some(object) = parent.get("object") {
                return nodes_equal(node, object);
            }
            false
        }

        // Disregard the `foo` in `class {foo(){}}` but keep it in `class {[foo](){}}`
        Some("MethodDefinition") => parent
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false),

        // Disregard the `meta` in `import.meta`
        Some("MetaProperty") => {
            if let Some(meta) = parent.get("meta") {
                nodes_equal(meta, node)
            } else {
                false
            }
        }

        // Disregard the `foo` in `class {foo=bar}` but keep it in `class {[foo]=bar}` and `class {bar=foo}`
        Some("PropertyDefinition") => {
            let computed = parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                return true;
            }
            // Check if node is the value (not the key)
            if let Some(value) = parent.get("value") {
                return nodes_equal(node, value);
            }
            false
        }

        // Disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
        Some("Property") => {
            let computed = parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                return true;
            }
            // Check if node is the value (not the key)
            if let Some(value) = parent.get("value") {
                return nodes_equal(node, value);
            }
            false
        }

        // Disregard the `bar` in `export { foo as bar }` or
        // the foo in `import { foo as bar }`
        Some("ExportSpecifier") | Some("ImportSpecifier") => {
            if let Some(local) = parent.get("local") {
                nodes_equal(node, local)
            } else {
                false
            }
        }

        // Disregard the `foo` in `foo: while (...) { ... break foo; ... continue foo;}`
        Some("LabeledStatement") | Some("BreakStatement") | Some("ContinueStatement") => false,

        // Default: it's a reference
        _ => true,
    }
}

/// Check if two JSON AST nodes are equal by comparing their identity.
///
/// This is a simplified version that compares the name field for Identifiers.
fn nodes_equal(a: &Value, b: &Value) -> bool {
    // For simplicity, compare by pointer address if available
    // Otherwise, compare by name for Identifiers
    if let (Some(a_name), Some(b_name)) = (
        a.get("name").and_then(|n| n.as_str()),
        b.get("name").and_then(|n| n.as_str()),
    ) {
        return a_name == b_name;
    }

    // For other nodes, we can't reliably compare equality
    // In the JavaScript version, this uses object reference equality
    false
}

/// Validate an attribute name.
///
/// Checks for:
/// - Invalid characters (numbers/hyphen/dot at start, special chars)
/// - Illegal colons (except XML namespaces and Svelte directives)
///
/// Corresponds to `validate_attribute_name` in shared/attribute.js.
///
/// # Arguments
///
/// * `name` - The attribute name to validate
///
/// # Returns
///
/// Ok if valid, Err with appropriate warning/error otherwise
pub fn validate_attribute_name(
    name: &str,
) -> Result<(), crate::compiler::phases::phase2_analyze::warnings::AnalysisWarning> {
    use crate::compiler::phases::phase2_analyze::warnings;

    // Check for illegal colon (excluding XML namespaces)
    // Svelte directives (on:, bind:, etc.) are not regular attributes,
    // so they won't be validated here
    if name.contains(':')
        && !name.starts_with("xmlns:")
        && !name.starts_with("xlink:")
        && !name.starts_with("xml:")
    {
        return Err(warnings::attribute_illegal_colon());
    }

    Ok(())
}

/// Check if an attribute name contains invalid characters.
///
/// Returns true if the name:
/// - Starts with a digit, hyphen, or dot
/// - Contains special characters: ^$@%&#?!|()[]{}*+~;
///
/// Corresponds to checking `regex_illegal_attribute_character` in element.js.
///
/// # Arguments
///
/// * `name` - The attribute name to check
pub fn is_invalid_attribute_name(name: &str) -> bool {
    REGEX_ILLEGAL_ATTRIBUTE_CHARACTER.is_match(name)
}

/// Extract the identifier name from a parameter node.
///
/// Handles simple identifiers and patterns (extracting the first identifier).
fn extract_identifier_name(param: &Value) -> Option<String> {
    match param.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => param.get("name").and_then(|n| n.as_str()).map(String::from),
        Some("AssignmentPattern") => {
            // Default parameter: param = defaultValue
            if let Some(left) = param.get("left") {
                extract_identifier_name(left)
            } else {
                None
            }
        }
        Some("RestElement") => {
            // Rest parameter: ...param
            if let Some(argument) = param.get("argument") {
                extract_identifier_name(argument)
            } else {
                None
            }
        }
        // For object/array destructuring, we don't extract individual names
        // as they're more complex patterns
        _ => None,
    }
}

/// Visit a JavaScript expression and track identifier references.
///
/// Corresponds to walking expressions in Svelte's utils.js.
///
/// # Arguments
///
/// * `expression` - The JavaScript expression to visit
/// * `context` - The visitor context
/// * `metadata` - Expression metadata to populate
pub fn walk_js_expression(
    expression: &Value,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let expr_type = expression.get("type").and_then(|t| t.as_str());

    match expr_type {
        Some("Identifier") => {
            if let Some(name) = expression.get("name").and_then(|n| n.as_str()) {
                // Check for store scoped subscription errors
                // When we see a $xxx identifier inside a function, check if xxx
                // refers to a locally-scoped variable that shadows an outer store
                //
                // Note: The root.scope.declarations lookup returns the OUTER binding
                // (module/instance scope) due to how declarations are collected.
                // We only error if the only binding for the store name is in a nested scope
                // (scope_index > 1). If there's an outer store binding, the $store reference
                // in the template is valid because it refers to that outer binding.
                // The shadowing check for references INSIDE nested functions is handled by
                // the Identifier visitor with proper context.
                if name.starts_with('$') && !name.starts_with("$$") && name != "$" {
                    let store_name = &name[1..];
                    if !store_name.is_empty()
                        && !super::function::is_rune(name)
                        && context.function_depth > 0
                    {
                        // Check if the store binding is in a nested scope
                        // This catches cases where the ONLY binding for store_name is nested
                        // (e.g., {#each items as item}{$item}{/each} where item is EachItem)
                        if let Some(&binding_idx) =
                            context.analysis.root.scope.declarations.get(store_name)
                        {
                            let binding = &context.analysis.root.bindings[binding_idx];
                            // If the binding's scope_index is > 1 (deeper than instance scope),
                            // AND we're inside that nested scope, it's a shadowing error
                            // Scope 0 = module, Scope 1 = instance, Scope 2+ = nested
                            //
                            // We need to check if we're actually inside the scope where this
                            // binding is declared. function_depth gives us an approximation:
                            // - In template: function_depth = 0
                            // - In event handler (first level function): function_depth = 1
                            // - In nested function: function_depth >= 2
                            // Only error if scope_index > 1 AND we're deep enough to be in that scope
                            if binding.scope_index > 1
                                && binding.scope_index <= context.function_depth + 1
                            {
                                return Err(
                                    super::super::super::errors::store_invalid_scoped_subscription(
                                    ),
                                );
                            }
                        }
                    }
                }

                // Look up binding
                if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name) {
                    let binding = &context.analysis.root.bindings[binding_idx];

                    // Add to references
                    metadata.references.insert(binding_idx);

                    // Check if it's state
                    if matches!(
                        binding.kind,
                        BindingKind::State | BindingKind::RawState | BindingKind::Derived
                    ) {
                        metadata.set_has_state(true);
                    }

                    // Add to dependencies
                    metadata.dependencies.insert(binding_idx);
                }
            }
        }
        Some("MemberExpression") => {
            // Check if this identifier is "safe" (doesn't require component context)
            // If it's not safe, we need to track that this component needs context
            // Corresponds to MemberExpression.js line 23-24
            if !is_safe_identifier(expression, context) {
                context.analysis.needs_context = true;
            }

            // Recursively visit object and property
            if let Some(object) = expression.get("object") {
                walk_js_expression(object, context, metadata)?;
            }
            if let Some(property) = expression.get("property")
                && expression
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
            {
                walk_js_expression(property, context, metadata)?;
            }
        }
        Some("CallExpression") => {
            // Check if the callee is safe (doesn't require component context)
            // Corresponds to CallExpression.js line 30-33
            if let Some(callee) = expression.get("callee") {
                // Only check if it's not a rune
                let is_rune = callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                    && callee
                        .get("name")
                        .and_then(|n| n.as_str())
                        .is_some_and(|name| name.starts_with('$'));

                if !is_rune && !is_safe_identifier(callee, context) {
                    context.analysis.needs_context = true;
                }

                walk_js_expression(callee, context, metadata)?;
            }
            if let Some(arguments) = expression.get("arguments").and_then(|a| a.as_array()) {
                for arg in arguments {
                    walk_js_expression(arg, context, metadata)?;
                }
            }
        }
        Some("BinaryExpression") | Some("LogicalExpression") => {
            // Visit left and right
            if let Some(left) = expression.get("left") {
                walk_js_expression(left, context, metadata)?;
            }
            if let Some(right) = expression.get("right") {
                walk_js_expression(right, context, metadata)?;
            }
        }
        Some("UnaryExpression") => {
            // Visit argument
            if let Some(argument) = expression.get("argument") {
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("UpdateExpression") => {
            // Validate assignment before visiting argument
            // Use validate_assignment to catch snippet parameter assignments and other errors
            if let Some(argument) = expression.get("argument") {
                validate_assignment(argument, context, false)?;
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("ConditionalExpression") => {
            // Visit test, consequent, and alternate
            if let Some(test) = expression.get("test") {
                walk_js_expression(test, context, metadata)?;
            }
            if let Some(consequent) = expression.get("consequent") {
                walk_js_expression(consequent, context, metadata)?;
            }
            if let Some(alternate) = expression.get("alternate") {
                walk_js_expression(alternate, context, metadata)?;
            }
        }
        Some("ArrayExpression") => {
            // Visit elements
            if let Some(elements) = expression.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        walk_js_expression(element, context, metadata)?;
                    }
                }
            }
        }
        Some("ObjectExpression") => {
            // Visit properties
            if let Some(properties) = expression.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        walk_js_expression(value, context, metadata)?;
                    }
                    if let Some(key) = property.get("key")
                        && property
                            .get("computed")
                            .and_then(|c| c.as_bool())
                            .unwrap_or(false)
                    {
                        walk_js_expression(key, context, metadata)?;
                    }
                }
            }
        }
        Some("SequenceExpression") => {
            // Visit expressions
            if let Some(expressions) = expression.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    walk_js_expression(expr, context, metadata)?;
                }
            }
        }
        Some("AssignmentExpression") => {
            // Validate assignment before visiting
            // Use validate_assignment to catch snippet parameter assignments and other errors
            if let Some(left) = expression.get("left") {
                validate_assignment(left, context, false)?;
                // Track mutations for all bindings being assigned to
                // This is important for legacy mode state promotion
                super::super::assignment_expression::mark_binding_mutation(left, context);
                walk_js_expression(left, context, metadata)?;
            }
            if let Some(right) = expression.get("right") {
                walk_js_expression(right, context, metadata)?;
            }
            // Mark expression as having assignment
            metadata.set_has_assignment(true);
        }
        Some("ArrowFunctionExpression") | Some("FunctionExpression") => {
            // Increment function depth for nested functions
            // This is important for detecting scoped store subscriptions
            context.function_depth += 1;

            // Extract parameters and register them as temporary scoped bindings
            // This allows us to detect when $store refers to a local parameter
            let mut temp_param_bindings: Vec<(String, usize)> = Vec::new();

            if let Some(params) = expression.get("params").and_then(|p| p.as_array()) {
                for param in params {
                    if let Some(param_name) = extract_identifier_name(param) {
                        // Check if this parameter shadows an existing binding
                        if let Some(&existing_idx) =
                            context.analysis.root.scope.declarations.get(&param_name)
                        {
                            // Create a temporary binding for the parameter at non-root scope
                            let temp_binding_idx = context.analysis.root.bindings.len();
                            let temp_binding = crate::compiler::phases::phase2_analyze::Binding::with_declaration_kind(
                                param_name.clone(),
                                crate::compiler::phases::phase2_analyze::BindingKind::Normal,
                                crate::compiler::phases::phase2_analyze::DeclarationKind::Param,
                                context.function_depth, // Use function_depth as scope index (non-zero means nested)
                            );
                            context.analysis.root.bindings.push(temp_binding);

                            // Temporarily override the binding in the scope
                            context
                                .analysis
                                .root
                                .scope
                                .declarations
                                .insert(param_name.clone(), temp_binding_idx);

                            // Track for cleanup
                            temp_param_bindings.push((param_name, existing_idx));
                        }
                    }
                }
            }

            // Visit function body
            if let Some(body) = expression.get("body") {
                walk_js_expression(body, context, metadata)?;
            }

            // Restore original bindings
            for (param_name, original_idx) in temp_param_bindings {
                context
                    .analysis
                    .root
                    .scope
                    .declarations
                    .insert(param_name, original_idx);
            }

            // Restore function depth
            context.function_depth -= 1;
        }
        Some("BlockStatement") => {
            // Visit statements in block
            if let Some(body) = expression.get("body").and_then(|b| b.as_array()) {
                for stmt in body {
                    walk_js_statement(stmt, context, metadata)?;
                }
            }
        }
        Some("ExpressionStatement") => {
            // Visit expression
            if let Some(expr) = expression.get("expression") {
                walk_js_expression(expr, context, metadata)?;
            }
        }
        // Literals and other leaf nodes - no recursion needed
        _ => {}
    }

    Ok(())
}

/// Visit a JavaScript statement and track identifier references.
///
/// Helper for walk_js_expression when encountering BlockStatement.
pub fn walk_js_statement(
    statement: &Value,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let stmt_type = statement.get("type").and_then(|t| t.as_str());

    match stmt_type {
        Some("ExpressionStatement") => {
            if let Some(expr) = statement.get("expression") {
                walk_js_expression(expr, context, metadata)?;
            }
        }
        Some("ReturnStatement") => {
            if let Some(argument) = statement.get("argument") {
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("IfStatement") => {
            if let Some(test) = statement.get("test") {
                walk_js_expression(test, context, metadata)?;
            }
            if let Some(consequent) = statement.get("consequent") {
                walk_js_statement(consequent, context, metadata)?;
            }
            if let Some(alternate) = statement.get("alternate") {
                walk_js_statement(alternate, context, metadata)?;
            }
        }
        Some("BlockStatement") => {
            if let Some(body) = statement.get("body").and_then(|b| b.as_array()) {
                for stmt in body {
                    walk_js_statement(stmt, context, metadata)?;
                }
            }
        }
        Some("VariableDeclaration") => {
            if let Some(declarations) = statement.get("declarations").and_then(|d| d.as_array()) {
                for decl in declarations {
                    if let Some(init) = decl.get("init") {
                        walk_js_expression(init, context, metadata)?;
                    }
                }
            }
        }
        Some("ForStatement") | Some("ForInStatement") | Some("ForOfStatement") => {
            if let Some(body) = statement.get("body") {
                walk_js_statement(body, context, metadata)?;
            }
        }
        Some("WhileStatement") | Some("DoWhileStatement") => {
            if let Some(test) = statement.get("test") {
                walk_js_expression(test, context, metadata)?;
            }
            if let Some(body) = statement.get("body") {
                walk_js_statement(body, context, metadata)?;
            }
        }
        _ => {}
    }

    Ok(())
}

/// Extract the object from a member expression chain.
///
/// For `a.b.c`, returns the identifier `a`.
/// For non-member expressions, returns the node itself if it's an Identifier.
///
/// Corresponds to `object` in ast.js.
///
/// # Arguments
///
/// * `expression` - The expression node
///
/// # Returns
///
/// The outermost identifier, or None if not found
pub fn object(expression: &Value) -> Option<Value> {
    let mut current = expression.clone();

    // Walk up the member expression chain
    while current.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(obj) = current.get("object") {
            current = obj.clone();
        } else {
            break;
        }
    }

    // Return the identifier if found
    if current.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        Some(current)
    } else {
        None
    }
}
