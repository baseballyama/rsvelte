//! CallExpression visitor.
//!
//! Analyzes function call expressions, particularly rune calls.
//!
//! Corresponds to Svelte's `2-analyze/visitors/CallExpression.js`.

use super::super::errors;
use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

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

    // Check if it's a binding (if so, it's not a rune/global)
    // This matches the official Svelte compiler's get_global_keypath in scope.js (L1408-1409):
    //   const binding = scope.get(n.name);
    //   if (binding !== null) return null;
    //
    // We check if the EXACT name (e.g., "$derived") has a binding.
    // We do NOT check the unprefixed name (e.g., "derived") here - that check is
    // handled by detect_store_subscriptions which creates StoreSub bindings when appropriate.
    // Checking the unprefixed name here would incorrectly treat runes as non-runes when
    // the unprefixed name is imported (e.g., `import { derived } from 'svelte/store'`
    // should not prevent `$derived()` from being treated as a rune).
    if context.analysis.root.find_binding_any_scope(name).is_some() {
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
    context.js_path.get(index).map(|entry| &**entry)
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

    // Grandparent might be Property (in object destructuring) or ObjectPattern/ArrayPattern directly
    let mut offset = 2;
    let grandparent = match get_parent(context, offset) {
        Some(p) => p,
        None => return false,
    };

    let gp_type = grandparent.get("type").and_then(|t| t.as_str());

    // If grandparent is Property, skip it and look at the next ancestor
    if gp_type == Some("Property") {
        offset += 1;
        let next_ancestor = match get_parent(context, offset) {
            Some(p) => p,
            None => return false,
        };
        let next_type = next_ancestor.get("type").and_then(|t| t.as_str());
        if !matches!(next_type, Some("ObjectPattern") | Some("ArrayPattern")) {
            return false;
        }
    } else if !matches!(gp_type, Some("ObjectPattern") | Some("ArrayPattern")) {
        return false;
    }

    // Next ancestor should be VariableDeclarator
    offset += 1;
    let var_declarator = match get_parent(context, offset) {
        Some(p) => p,
        None => return false,
    };

    if var_declarator.get("type").and_then(|t| t.as_str()) != Some("VariableDeclarator") {
        return false;
    }

    // Check that VariableDeclarator init is $props()
    if let Some(init) = var_declarator.get("init") {
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
    // DeclarationTag (`{let x = $state(...)}` / `{const x = $derived(...)}`,
    // Svelte 5.56.0 #18282) is a valid placement regardless of the immediate
    // JS-AST parent shape: the analyze visitor walks the init expression
    // directly via `walk_js_expression_node`, so `get_parent` may not surface
    // the synthesized VariableDeclarator. Checking the template path here
    // covers both the modern (typed-AST) and JSON-fallback walk paths.
    for node in &context.path {
        if matches!(node, crate::ast::template::TemplateNode::DeclarationTag(_)) {
            return true;
        }
    }

    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    let parent_type = parent.get("type").and_then(|t| t.as_str());

    match parent_type {
        Some("VariableDeclarator") => {
            // `{@const x = $state(...)}` is rejected — `{@const}` declarations
            // hold an `AssignmentExpression`, not a `VariableDeclarator`, but
            // visitors that synthesize a declarator (`build_const_variable_declaration`)
            // can land us here. `{let x = $state(...)}` / `{const x = $state(...)}`
            // (DeclarationTag, Svelte 5.56.0 #18282) are explicitly allowed —
            // they're the canonical template-side declaration form.
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
/// using `this.property = $state(...)` or `this.#field = $state(...)`.
///
/// Note: For private field assignments like `this.#count = $state(0)`, the parser
/// may produce `left: null` because `PrivateFieldExpression` is not handled by
/// `convert_assignment_target_for_program`. In this case, we still accept the
/// placement as long as we can confirm we're in a constructor.
fn is_class_property_assignment_at_constructor_root(
    node: &Value,
    context: &VisitorContext,
) -> bool {
    // Check assignment operator is '='
    if node.get("operator").and_then(|o| o.as_str()) != Some("=") {
        return false;
    }

    // First, verify we're inside a constructor method.
    // Path: AssignmentExpression (-1) -> ExpressionStatement (-2) ->
    //       BlockStatement (-3) -> FunctionExpression (-4) -> MethodDefinition (-5)
    let parent_5 = match get_parent(context, 5) {
        Some(p) => p,
        None => return false,
    };

    if parent_5.get("type").and_then(|t| t.as_str()) != Some("MethodDefinition") {
        return false;
    }

    if parent_5.get("kind").and_then(|k| k.as_str()) != Some("constructor") {
        return false;
    }

    // Check left side: MemberExpression with 'this' object.
    // If left is null (private field expression not handled by parser), we still
    // accept the placement since we confirmed we're in a constructor.
    let left = match node.get("left") {
        Some(l) if !l.is_null() => l,
        _ => return true, // Accept: we're in constructor, left is null (private field)
    };

    let left_type = left.get("type").and_then(|t| t.as_str());
    if left_type != Some("MemberExpression") {
        return false;
    }

    let object = left.get("object");
    if object.and_then(|o| o.get("type")).and_then(|t| t.as_str()) != Some("ThisExpression") {
        return false;
    }

    // Check property type: must be (Identifier && !computed) || PrivateIdentifier || Literal
    // This mirrors the official Svelte compiler's is_class_property_assignment_at_constructor_root
    let computed = left
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);
    if let Some(property) = left.get("property") {
        let prop_type = property.get("type").and_then(|t| t.as_str());
        match prop_type {
            Some("Identifier") if !computed => true,
            Some("PrivateIdentifier") => true,
            Some("Literal") => true,
            _ => false,
        }
    } else {
        false
    }
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

    // Check it's the first statement in the block by comparing source positions:
    // distinct AST nodes have distinct `start` offsets within a single parse.
    if let Some(body) = grandparent.get("body").and_then(|b| b.as_array())
        && let Some(first) = body.first()
    {
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
        let node_type = node.get_type_str();

        if matches!(
            node_type,
            Some("FunctionDeclaration") | Some("FunctionExpression")
        ) {
            if node.get_field_bool("generator").unwrap_or(false) {
                return true;
            }
            return false;
        }
    }

    false
}

/// Visit a call expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let JsNode::CallExpression {
        callee, arguments, ..
    } = node
    else {
        return Ok(());
    };

    let arena = context.parse_arena;
    let callee_node = arena.get_js_node(*callee);
    let args = arena.get_js_children(*arguments);
    let arg_count = args.len();

    let rune = super::shared::utils::get_rune_from_node(node, &context.analysis.root.scope, arena);

    // Check for spread arguments in runes (not allowed except for $inspect)
    if let Some(ref rune_name) = rune
        && rune_name != "$inspect"
    {
        for arg in args {
            if matches!(arg, JsNode::SpreadElement { .. }) {
                return Err(errors::rune_invalid_spread(rune_name));
            }
        }
    }

    // Validate specific runes
    match rune.as_deref() {
        None if !super::shared::utils::is_safe_identifier_node(callee_node, context) => {
            context.analysis.needs_context = true;
        }
        Some("$bindable") => {
            if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$bindable",
                    "zero or one arguments",
                ));
            }
            if !is_bindable_valid_placement(context) {
                return Err(errors::bindable_invalid_location());
            }
            context.analysis.needs_context = true;
        }
        Some("$host") => {
            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$host"));
            } else if context.analysis.custom_element.is_none() {
                return Err(errors::host_invalid_placement());
            }
        }
        Some("$props") => {
            if context.has_props_rune {
                return Err(errors::props_duplicate("$props"));
            }
            context.has_props_rune = true;
            if context.ast_type != super::AstType::Instance || !is_props_valid_placement(context) {
                return Err(errors::props_invalid_placement());
            }
            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$props"));
            }
        }
        Some("$props.id") => {
            if context.analysis.props_id.is_some() {
                return Err(errors::props_duplicate("$props.id"));
            }
            if !is_props_id_valid_placement(context) {
                return Err(errors::props_id_invalid_placement());
            }
            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$props.id"));
            }
            // Get parent VariableDeclarator to extract id name
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
            if !is_state_or_derived_valid_placement(context) {
                return Err(errors::state_invalid_placement(rune.as_deref().unwrap()));
            }
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
            if !is_effect_valid_placement(context) {
                return Err(errors::effect_invalid_placement());
            }
            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    rune.as_deref().unwrap(),
                    "exactly one argument",
                ));
            }
            context.analysis.needs_context = true;
        }
        Some("$effect.tracking") if arg_count != 0 => {
            return Err(errors::rune_invalid_arguments("$effect.tracking"));
        }
        Some("$effect.root") if arg_count != 1 => {
            return Err(errors::rune_invalid_arguments_length(
                "$effect.root",
                "exactly one argument",
            ));
        }
        Some("$effect.pending") => {}
        Some("$inspect") if arg_count < 1 => {
            return Err(errors::rune_invalid_arguments_length(
                "$inspect",
                "one or more arguments",
            ));
        }
        Some("$inspect().with") if arg_count != 1 => {
            return Err(errors::rune_invalid_arguments_length(
                "$inspect().with",
                "exactly one argument",
            ));
        }
        Some("$inspect.trace") => {
            if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$inspect.trace",
                    "zero or one arguments",
                ));
            }
            if !is_inspect_trace_valid_placement(context) {
                return Err(errors::inspect_trace_invalid_placement());
            }
            if is_inside_generator_function(context) {
                return Err(errors::inspect_trace_generator());
            }
            if context.analysis.dev {
                context.analysis.tracing = true;
            }
        }
        Some("$state.eager") if arg_count != 1 => {
            return Err(errors::rune_invalid_arguments_length(
                "$state.eager",
                "exactly one argument",
            ));
        }
        Some("$state.snapshot") if arg_count != 1 => {
            return Err(errors::rune_invalid_arguments_length(
                "$state.snapshot",
                "exactly one argument",
            ));
        }
        _ => {}
    }

    // Track expression metadata for non-rune calls
    let is_pure_call = super::shared::utils::is_pure_node(callee_node, context);
    if let Some(expression) = context.current_expression() {
        let has_dependencies = !expression.dependencies.is_empty();
        if !is_pure_call || has_dependencies {
            expression.set_has_call(true);
            expression.set_has_state(true);
        }
    }

    // For $derived and $inspect, increment function_depth when visiting arguments
    let increment_depth = matches!(rune.as_deref(), Some("$derived") | Some("$inspect"));
    // For `$derived(...)` (not `$derived.by`), mirror upstream's
    // `derived_function_depth: function_depth + 1` (CallExpression.js L245-253)
    // so the AwaitExpression visitor can detect awaits directly inside
    // `$derived(...)` (the `suspend` / `experimental_async` gate).
    let is_derived_rune = matches!(rune.as_deref(), Some("$derived"));

    // Visit children (callee and arguments)
    super::script::walk_js_node_typed(callee_node, context)?;

    if increment_depth {
        context.function_depth += 1;
    }
    let saved_derived_function_depth = context.derived_function_depth;
    if is_derived_rune {
        context.derived_function_depth = context.function_depth;
    }
    for arg in args {
        super::script::walk_js_node_typed(arg, context)?;
    }
    if is_derived_rune {
        context.derived_function_depth = saved_derived_function_depth;
    }
    if increment_depth {
        context.function_depth -= 1;
    }

    Ok(())
}
