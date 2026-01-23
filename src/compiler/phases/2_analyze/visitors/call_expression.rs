//! CallExpression visitor.
//!
//! Analyzes function call expressions, particularly rune calls.
//!
//! Corresponds to Svelte's `2-analyze/visitors/CallExpression.js`.

use super::super::errors;
use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a call expression.
///
/// This visitor handles rune calls ($state, $derived, $effect, $props, etc.)
/// and validates their usage context.
///
/// # Arguments
///
/// * `node` - The CallExpression node (as JSON Value)
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Get the rune name if this is a rune call
    let rune = get_rune(node, context);

    // Check for spread arguments in runes (not allowed except for $inspect)
    if let Some(ref rune_name) = rune
        && rune_name != "$inspect"
        && let Some(arguments) = node.get("arguments").and_then(|a| a.as_array())
    {
        for arg in arguments {
            if arg.get("type").and_then(|t| t.as_str()) == Some("SpreadElement") {
                return Err(errors::rune_invalid_spread(rune_name));
            }
        }
    }

    // Validate specific runes
    match rune.as_deref() {
        None => {
            // Not a rune - check if it's a safe identifier call
            if let Some(callee) = node.get("callee")
                && !super::shared::utils::is_safe_identifier(callee, context)
            {
                context.analysis.needs_context = true;
            }
        }

        Some("$bindable") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$bindable",
                    "zero or one arguments",
                ));
            }

            // Check placement: must be inside $props() destructuring
            if !is_bindable_valid_placement(context) {
                return Err(errors::bindable_invalid_location());
            }

            // We need context in case the bound prop is stale
            context.analysis.needs_context = true;
        }

        Some("$host") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$host"));
            } else if context.analysis.custom_element.is_none() {
                // TODO: Check ast_type === 'module'
                return Err(errors::host_invalid_placement());
            }
        }

        Some("$props") => {
            if context.has_props_rune {
                return Err(errors::props_duplicate("$props"));
            }

            context.has_props_rune = true;

            // Check placement: must be top-level VariableDeclarator in instance script
            if !is_props_valid_placement(context) {
                return Err(errors::props_invalid_placement());
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$props"));
            }
        }

        Some("$props.id") => {
            if context.analysis.props_id.is_some() {
                return Err(errors::props_duplicate("$props.id"));
            }

            // Check placement: must be a VariableDeclarator with Identifier id at top level
            if !is_props_id_valid_placement(context) {
                return Err(errors::props_id_invalid_placement());
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$props.id"));
            }

            // Store the props_id identifier name
            if let Some(parent) = get_parent(context, 1)
                && let Some(id_name) = parent
                    .get("id")
                    .and_then(|id| id.get("name"))
                    .and_then(|n| n.as_str())
            {
                context.analysis.props_id = Some(id_name.to_string());
            }
        }

        Some("$state") | Some("$state.raw") | Some("$derived") | Some("$derived.by") => {
            // Check valid placement
            if !is_state_or_derived_valid_placement(context) {
                return Err(errors::state_invalid_placement(rune.as_deref().unwrap()));
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            let rune_name = rune.as_deref().unwrap();
            if rune_name == "$derived" || rune_name == "$derived.by" {
                if arg_count != 1 {
                    return Err(errors::rune_invalid_arguments_length(
                        rune_name,
                        "exactly one argument",
                    ));
                }
            } else if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    rune_name,
                    "zero or one arguments",
                ));
            }
        }

        Some("$effect") | Some("$effect.pre") => {
            // Check placement: must be an ExpressionStatement
            if !is_effect_valid_placement(context) {
                return Err(errors::effect_invalid_placement());
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    rune.as_deref().unwrap(),
                    "exactly one argument",
                ));
            }

            // $effect needs context
            context.analysis.needs_context = true;
        }

        Some("$effect.tracking") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 0 {
                return Err(errors::rune_invalid_arguments("$effect.tracking"));
            }

            // TODO: Set expression.has_state = true when we have expression metadata
        }

        Some("$effect.root") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$effect.root",
                    "exactly one argument",
                ));
            }
        }

        Some("$effect.pending") => {
            // TODO: Set expression.has_state = true when we have expression metadata
        }

        Some("$inspect") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count < 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$inspect",
                    "one or more arguments",
                ));
            }
        }

        Some("$inspect().with") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$inspect().with",
                    "exactly one argument",
                ));
            }
        }

        Some("$inspect.trace") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$inspect.trace",
                    "zero or one arguments",
                ));
            }

            // Check placement: must be first statement in function body
            if !is_inspect_trace_valid_placement(context) {
                return Err(errors::inspect_trace_invalid_placement());
            }

            // Check that it's not in a generator function
            if is_inside_generator_function(context) {
                return Err(errors::inspect_trace_generator());
            }

            // TODO: In dev mode, set scope.tracing
            // For now, just mark that we use tracing
            context.analysis.tracing = true;
        }

        Some("$state.eager") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$state.eager",
                    "exactly one argument",
                ));
            }
        }

        Some("$state.snapshot") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$state.snapshot",
                    "exactly one argument",
                ));
            }
        }

        _ => {
            // Unknown rune or non-rune call
        }
    }

    // Track expression metadata for non-rune calls
    // Check if this call is pure (we need to do this before borrowing expression mutably)
    let is_pure_call = node
        .get("callee")
        .map(|callee| super::shared::utils::is_pure(callee, context))
        .unwrap_or(false);

    if let Some(expression) = context.current_expression() {
        let has_dependencies = !expression.dependencies.is_empty();

        if !is_pure_call || has_dependencies {
            expression.has_call = true;
            expression.has_state = true;
        }
    }

    // TODO: Handle $derived expression tracking for async deriveds
    // TODO: Handle $inspect expression tracking

    // Visit children (callee and arguments)
    // This is equivalent to context.next() in the JavaScript implementation
    if let Some(callee) = node.get("callee") {
        super::script::walk_js_node(callee, context)?;
    }

    if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
        for arg in arguments {
            super::script::walk_js_node(arg, context)?;
        }
    }

    Ok(())
}

/// Get the rune name from a CallExpression node, if it is a rune call.
///
/// Returns Some(rune_name) if the call is a rune, None otherwise.
///
/// # Arguments
///
/// * `node` - The CallExpression node
/// * `context` - The visitor context
fn get_rune(node: &Value, context: &VisitorContext) -> Option<String> {
    if node.get("type").and_then(|t| t.as_str()) != Some("CallExpression") {
        return None;
    }

    let callee = node.get("callee")?;
    let keypath = get_global_keypath(callee, context)?;

    if super::shared::function::is_rune(&keypath) {
        Some(keypath)
    } else {
        None
    }
}

/// Get the global keypath of an expression.
///
/// This handles member expressions like `$state.raw` and call expressions like `$inspect().with`.
///
/// Returns the full keypath string, or None if it's not a global identifier.
///
/// # Arguments
///
/// * `node` - The expression node
/// * `context` - The visitor context
fn get_global_keypath(node: &Value, context: &VisitorContext) -> Option<String> {
    let mut n = node;
    let mut joined = String::new();

    // Handle MemberExpression chain
    while n.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        // Must not be computed
        if n.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
            return None;
        }

        // Property must be an Identifier
        let property = n.get("property")?;
        if property.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }

        let prop_name = property.get("name").and_then(|n| n.as_str())?;
        joined = format!(".{}{}", prop_name, joined);

        n = n.get("object")?;
    }

    // Handle CallExpression (for patterns like `$inspect().with`)
    if n.get("type").and_then(|t| t.as_str()) == Some("CallExpression") {
        let callee = n.get("callee")?;
        if callee.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }
        joined = format!("(){}", joined);
        n = callee;
    }

    // Must be an Identifier at the base
    if n.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return None;
    }

    let name = n.get("name").and_then(|n| n.as_str())?;

    // Check if it's a binding (if so, it's not a rune)
    if context.analysis.root.scope.declarations.contains_key(name) {
        return None;
    }

    Some(format!("{}{}", name, joined))
}

/// Get the parent node at a specific offset in the path.
///
/// # Arguments
///
/// * `context` - The visitor context
/// * `offset` - The offset from the end (1 for immediate parent, 2 for grandparent, etc.)
///
/// # Returns
///
/// Returns the parent node at the specified offset, or None if the offset is out of bounds.
///
/// # Example
///
/// ```
/// // If js_path = [Program, VariableDeclarator, CallExpression]
/// // get_parent(context, 1) returns VariableDeclarator
/// // get_parent(context, 2) returns Program
/// // get_parent(context, 3) returns None
/// ```
fn get_parent<'a>(context: &'a VisitorContext, offset: usize) -> Option<&'a Value> {
    let index = context.js_path.len().checked_sub(offset + 1)?;
    context.js_path.get(index)
}

/// Check if $bindable is in a valid placement.
///
/// Must be inside an AssignmentPattern in an ObjectPattern in a VariableDeclarator
/// that is initialized with $props().
///
/// Valid structure:
/// ```js
/// let { x = $bindable() } = $props();
/// //        ^^^^^^^^^^^^ CallExpression ($bindable)
/// //    ^^^^^^^^^^^^^^^^ AssignmentPattern
/// //  ^^^^^^^^^^^^^^^^^^ ObjectPattern
/// //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ VariableDeclarator (init = $props())
/// ```
fn is_bindable_valid_placement(context: &VisitorContext) -> bool {
    // Check path: [..., VariableDeclarator, ObjectPattern, AssignmentPattern, CallExpression]
    let len = context.js_path.len();

    if len < 4 {
        return false;
    }

    // Current node should be CallExpression ($bindable call)
    // Parent should be AssignmentPattern
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    if parent.get("type").and_then(|t| t.as_str()) != Some("AssignmentPattern") {
        return false;
    }

    // Grandparent should be ObjectPattern (or ArrayPattern)
    let grandparent = match get_parent(context, 2) {
        Some(p) => p,
        None => return false,
    };

    let gp_type = grandparent.get("type").and_then(|t| t.as_str());
    if !matches!(gp_type, Some("ObjectPattern") | Some("ArrayPattern")) {
        return false;
    }

    // Great-grandparent should be VariableDeclarator
    let great_grandparent = match get_parent(context, 3) {
        Some(p) => p,
        None => return false,
    };

    if great_grandparent.get("type").and_then(|t| t.as_str()) != Some("VariableDeclarator") {
        return false;
    }

    // Check that VariableDeclarator init is $props()
    if let Some(init) = great_grandparent.get("init") {
        let rune = get_rune(init, context);
        return rune.as_deref() == Some("$props");
    }

    false
}

/// Check if $props is in a valid placement.
///
/// Must be a VariableDeclarator at the top level of the instance script,
/// and not inside a ConstTag.
///
/// Valid:
/// ```js
/// let props = $props();
/// ```
///
/// Invalid:
/// ```js
/// if (condition) {
///   let props = $props(); // Not at top level
/// }
/// ```
///
/// ```svelte
/// {#const x = $props()} // Inside ConstTag
/// ```
fn is_props_valid_placement(context: &VisitorContext) -> bool {
    // Parent must be VariableDeclarator
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    if parent.get("type").and_then(|t| t.as_str()) != Some("VariableDeclarator") {
        return false;
    }

    // Check we're at the root scope (top level)
    // We need to check that we're not deeply nested in the JS AST
    // The path should be: Program -> VariableDeclaration -> VariableDeclarator -> CallExpression

    // Walk up to find Program or detect non-top-level nesting
    let mut current_offset = 2; // Start from VariableDeclaration
    loop {
        let ancestor = match get_parent(context, current_offset) {
            Some(a) => a,
            None => return false,
        };

        let ancestor_type = ancestor.get("type").and_then(|t| t.as_str());

        match ancestor_type {
            Some("Program") => {
                // We reached the top level - this is valid
                break;
            }
            Some("BlockStatement")
            | Some("IfStatement")
            | Some("ForStatement")
            | Some("WhileStatement")
            | Some("FunctionDeclaration")
            | Some("FunctionExpression")
            | Some("ArrowFunctionExpression")
            | Some("ClassDeclaration")
            | Some("ClassBody") => {
                // Nested inside a block or function - invalid
                return false;
            }
            _ => {
                // Continue walking up
                current_offset += 1;
                if current_offset > 20 {
                    // Safety limit to prevent infinite loops
                    return false;
                }
            }
        }
    }

    // Check we're not inside a ConstTag (template node)
    for node in &context.path {
        if matches!(node, crate::ast::template::TemplateNode::ConstTag(_)) {
            return false;
        }
    }

    true
}

/// Check if $props.id is in a valid placement.
///
/// Must be a VariableDeclarator with an Identifier id at the top level.
///
/// Valid:
/// ```js
/// let id = $props.id();
/// ```
///
/// Invalid:
/// ```js
/// let { x } = $props.id(); // Destructuring not allowed
/// ```
fn is_props_id_valid_placement(context: &VisitorContext) -> bool {
    // Parent must be VariableDeclarator
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    if parent.get("type").and_then(|t| t.as_str()) != Some("VariableDeclarator") {
        return false;
    }

    // The id field of VariableDeclarator must be an Identifier (not ObjectPattern or ArrayPattern)
    if let Some(id) = parent.get("id") {
        let id_type = id.get("type").and_then(|t| t.as_str());
        if id_type != Some("Identifier") {
            return false;
        }
    } else {
        return false;
    }

    // Check we're at the root scope (top level) - same logic as is_props_valid_placement
    let mut current_offset = 2; // Start from VariableDeclaration
    loop {
        let ancestor = match get_parent(context, current_offset) {
            Some(a) => a,
            None => return false,
        };

        let ancestor_type = ancestor.get("type").and_then(|t| t.as_str());

        match ancestor_type {
            Some("Program") => {
                break;
            }
            Some("BlockStatement")
            | Some("IfStatement")
            | Some("ForStatement")
            | Some("WhileStatement")
            | Some("FunctionDeclaration")
            | Some("FunctionExpression")
            | Some("ArrowFunctionExpression")
            | Some("ClassDeclaration")
            | Some("ClassBody") => {
                return false;
            }
            _ => {
                current_offset += 1;
                if current_offset > 20 {
                    return false;
                }
            }
        }
    }

    true
}

/// Check if $state/$derived is in a valid placement.
///
/// Valid placements:
/// - VariableDeclarator (not in ConstTag)
/// - PropertyDefinition (non-static, non-computed)
/// - AssignmentExpression in constructor (this.property = $state(...))
///
/// Valid examples:
/// ```js
/// let x = $state(0);  // VariableDeclarator
/// ```
///
/// ```js
/// class Foo {
///   x = $state(0);  // PropertyDefinition
/// }
/// ```
///
/// ```js
/// class Foo {
///   constructor() {
///     this.x = $state(0);  // AssignmentExpression in constructor
///   }
/// }
/// ```
fn is_state_or_derived_valid_placement(context: &VisitorContext) -> bool {
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    let parent_type = parent.get("type").and_then(|t| t.as_str());

    match parent_type {
        Some("VariableDeclarator") => {
            // Check not in ConstTag
            for node in &context.path {
                if matches!(node, crate::ast::template::TemplateNode::ConstTag(_)) {
                    return false;
                }
            }
            true
        }

        Some("PropertyDefinition") => {
            // Must be non-static and non-computed
            let is_static = parent
                .get("static")
                .and_then(|s| s.as_bool())
                .unwrap_or(false);
            let is_computed = parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            !is_static && !is_computed
        }

        Some("AssignmentExpression") => {
            // Check if this is a valid class property assignment at constructor root
            is_class_property_assignment_at_constructor_root(parent, context)
        }

        _ => false,
    }
}

/// Check if an assignment is `this.property = $state(...)` at constructor root.
///
/// This validates the pattern where a class property is initialized in the constructor
/// using `this.property = $state(...)`.
fn is_class_property_assignment_at_constructor_root(
    node: &Value,
    context: &VisitorContext,
) -> bool {
    // Check assignment operator is '='
    if node.get("operator").and_then(|o| o.as_str()) != Some("=") {
        return false;
    }

    // Check left side is MemberExpression with 'this'
    let left = match node.get("left") {
        Some(l) => l,
        None => return false,
    };

    if left.get("type").and_then(|t| t.as_str()) != Some("MemberExpression") {
        return false;
    }

    let object = left.get("object");
    if object.and_then(|o| o.get("type")).and_then(|t| t.as_str()) != Some("ThisExpression") {
        return false;
    }

    // Check property is Identifier, PrivateIdentifier, or Literal
    let property = left.get("property");
    let property_type = property
        .and_then(|p| p.get("type"))
        .and_then(|t| t.as_str());
    let is_computed = left
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    if !matches!(
        property_type,
        Some("Identifier") | Some("PrivateIdentifier") | Some("Literal")
    ) && (property_type != Some("Identifier") || is_computed)
    {
        return false;
    }

    // Check path: AssignmentExpression (-1) -> ExpressionStatement (-2) ->
    //             BlockStatement (-3) -> FunctionExpression (-4) -> MethodDefinition (-5)
    let parent_5 = match get_parent(context, 5) {
        Some(p) => p,
        None => return false,
    };

    if parent_5.get("type").and_then(|t| t.as_str()) != Some("MethodDefinition") {
        return false;
    }

    // Check it's a constructor
    parent_5.get("kind").and_then(|k| k.as_str()) == Some("constructor")
}

/// Check if $effect is in a valid placement.
///
/// Must be an ExpressionStatement.
///
/// Valid:
/// ```js
/// $effect(() => { ... });
/// ```
///
/// Invalid:
/// ```js
/// let x = $effect(() => { ... });  // Not an ExpressionStatement
/// ```
fn is_effect_valid_placement(context: &VisitorContext) -> bool {
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    parent.get("type").and_then(|t| t.as_str()) == Some("ExpressionStatement")
}

/// Check if $inspect.trace is in a valid placement.
///
/// Must be the first statement in a function body.
///
/// Valid:
/// ```js
/// function foo() {
///   $inspect.trace();  // First statement
///   // ...
/// }
/// ```
///
/// Invalid:
/// ```js
/// function foo() {
///   let x = 1;
///   $inspect.trace();  // Not first statement
/// }
/// ```
fn is_inspect_trace_valid_placement(context: &VisitorContext) -> bool {
    // Parent: ExpressionStatement
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    if parent.get("type").and_then(|t| t.as_str()) != Some("ExpressionStatement") {
        return false;
    }

    // Grandparent: BlockStatement
    let grandparent = match get_parent(context, 2) {
        Some(p) => p,
        None => return false,
    };

    if grandparent.get("type").and_then(|t| t.as_str()) != Some("BlockStatement") {
        return false;
    }

    // Great-grandparent: Function (FunctionDeclaration, FunctionExpression, or ArrowFunctionExpression)
    let fn_node = match get_parent(context, 3) {
        Some(p) => p,
        None => return false,
    };

    let fn_type = fn_node.get("type").and_then(|t| t.as_str());
    if !matches!(
        fn_type,
        Some("FunctionDeclaration") | Some("FunctionExpression") | Some("ArrowFunctionExpression")
    ) {
        return false;
    }

    // Check it's the first statement in the block
    if let Some(body) = grandparent.get("body").and_then(|b| b.as_array())
        && let Some(first) = body.first()
    {
        // Compare by checking if the types and positions match
        // Since we can't directly compare Value pointers, we compare serialized forms
        let first_str = serde_json::to_string(first).ok();
        let parent_str = serde_json::to_string(parent).ok();

        if first_str.is_some() && first_str == parent_str {
            return true;
        }

        // Alternative: compare start positions
        let first_start = first.get("start").and_then(|s| s.as_u64());
        let parent_start = parent.get("start").and_then(|s| s.as_u64());

        return first_start.is_some() && first_start == parent_start;
    }

    false
}

/// Check if we're inside a generator function.
///
/// This walks up the JavaScript AST path to find a function with `generator: true`.
///
/// Valid (not inside generator):
/// ```js
/// function foo() {
///   $inspect.trace();
/// }
/// ```
///
/// Invalid (inside generator):
/// ```js
/// function* foo() {
///   $inspect.trace();  // Error: cannot use in generator
/// }
/// ```
fn is_inside_generator_function(context: &VisitorContext) -> bool {
    // Walk up the JS path to find a function
    for node in context.js_path.iter().rev() {
        let node_type = node.get("type").and_then(|t| t.as_str());

        if matches!(
            node_type,
            Some("FunctionDeclaration") | Some("FunctionExpression")
        ) {
            // Check if it's a generator
            if node
                .get("generator")
                .and_then(|g| g.as_bool())
                .unwrap_or(false)
            {
                return true;
            }

            // Stop at first function (don't check outer functions)
            return false;
        }
    }

    false
}
