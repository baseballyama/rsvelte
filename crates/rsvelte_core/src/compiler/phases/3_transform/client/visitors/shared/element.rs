//! Element attribute handling utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js`.

use crate::ast::template::{
    AttributeValue, AttributeValuePart, ClassDirective, ExpressionTag,
    RegularElement as RegularElementNode, StyleDirective,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
#[cfg(test)]
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{
    JsExpr, JsObjectMember, JsPattern, JsStatement, JsTemplateLiteral,
};
use crate::compiler::phases::phase3_transform::shared::template::sanitize_template_string;

use super::utils::build_expression;

/// Check if a class attribute value needs to be wrapped in $.clsx().
///
/// Corresponds to the condition in Attribute.js for setting needs_clsx:
/// - The value is a single Expression (not a Sequence or True)
/// - The expression type is NOT Literal, TemplateLiteral, or BinaryExpression
///
/// This is needed for class={x} where x is a variable, array, or object,
/// because Svelte's clsx function normalizes these to proper class strings.
fn needs_clsx(attr_value: &AttributeValue) -> bool {
    // Helper to check if an expression type needs clsx
    let expr_needs_clsx = |expr_type: &str| -> bool {
        // Needs clsx if NOT a simple literal, template literal, or binary expression
        !matches!(
            expr_type,
            "Literal" | "TemplateLiteral" | "BinaryExpression"
        )
    };

    match attr_value {
        AttributeValue::Expression(expr_tag) => {
            // Get expression type - only unquoted class={expr} needs clsx
            // Quoted class="{expr}" (Sequence) does NOT need clsx per official compiler
            let expr_type = expr_tag.expression.node_type().unwrap_or("");
            expr_needs_clsx(expr_type)
        }
        // Sequence (quoted attributes), True, or other forms don't need clsx
        _ => false,
    }
}

/// Build an attribute value expression.
///
/// Corresponds to `build_attribute_value` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js`.
///
/// # Arguments
///
/// * `value` - The attribute value (True, Expression, or Sequence)
/// * `context` - The component context
/// * `memoize` - Function to memoize complex expressions
///
/// # Returns
///
/// Returns the attribute value expression and whether it contains state references.
pub fn build_attribute_value<F>(
    value: &AttributeValue,
    context: &mut ComponentContext,
    mut memoize: F,
) -> AttributeValueResult
where
    F: FnMut(JsExpr, &ExpressionMetadata) -> JsExpr,
{
    match value {
        AttributeValue::True(_) => AttributeValueResult {
            value: b::boolean(true),
            has_state: false,
        },

        AttributeValue::Expression(expr_tag) => {
            // Extract the expression from the ExpressionTag using the full expression converter
            let expression = extract_expression_from_tag_with_context(expr_tag, context);
            let mut metadata = extract_metadata_from_tag(expr_tag);

            // Check for reactive state using the comprehensive check that considers transforms
            let has_reactive_state =
                super::utils::expression_has_reactive_state(&expr_tag.expression, context);

            // The Phase 2 cached `has_call` is the narrow "non-pure callee"
            // flag (matches the official compiler). Component prop / dynamic
            // CSS prop memoisation reads this through the closure passed to
            // `build_attribute_value`, so feeding it the broad walk would
            // wrap pure calls like `<Child prop={encodeURIComponent('x')}>`
            // in `$.derived(...)` (regresses the `purity` snapshot fixture).
            let has_call = expr_tag.metadata.expression.has_call();

            // Apply transforms via build_expression (handles props: x -> x())
            let transformed = build_expression(context, &expression, &metadata);

            // Also check if the expression references variables that are blocked by async promises.
            // In the official compiler, this is handled via binding.blocker and is_async(),
            // which causes has_state to include blocked variables.
            let has_blockers = context
                .state
                .has_blockers_for_expr(&transformed, &context.arena);
            let has_state = has_reactive_state || has_call || has_blockers;

            // Update metadata with correct has_state and has_call values.
            // has_call is stored with purity consideration so that downstream memoizers
            // (e.g. per-chunk memoizer in process_regular_attribute) behave correctly.
            metadata.set_has_state(has_state);
            metadata.set_has_call(has_call);

            // Memoize if needed
            let memoized = memoize(transformed, &metadata);

            AttributeValueResult {
                value: memoized,
                has_state,
            }
        }

        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            // Single part - handle as simple value
            match &parts[0] {
                AttributeValuePart::Text(text) => AttributeValueResult {
                    value: b::string(text.data.as_str()),
                    has_state: false,
                },

                AttributeValuePart::ExpressionTag(expr_tag) => {
                    let expression = extract_expression_from_tag_with_context(expr_tag, context);
                    let mut metadata = extract_metadata_from_tag(expr_tag);

                    // Check for reactive state using the comprehensive check that considers transforms
                    let has_reactive_state =
                        super::utils::expression_has_reactive_state(&expr_tag.expression, context);

                    // Use Phase 2's narrow has_call (matches the official
                    // compiler) — see the matching comment in the
                    // `AttributeValue::Expression` arm above for why.
                    let has_call = expr_tag.metadata.expression.has_call();

                    // Apply transforms via build_expression (handles props: x -> x())
                    let transformed = build_expression(context, &expression, &metadata);

                    // Also check for blocked async variables
                    let has_blockers = context
                        .state
                        .has_blockers_for_expr(&transformed, &context.arena);
                    let has_state = has_reactive_state || has_call || has_blockers;

                    // Update metadata with correct has_state and has_call values.
                    metadata.set_has_state(has_state);
                    metadata.set_has_call(has_call);

                    let memoized = memoize(transformed, &metadata);

                    AttributeValueResult {
                        value: memoized,
                        has_state,
                    }
                }
            }
        }

        AttributeValue::Sequence(parts) => {
            // Multiple parts - build template literal
            build_template_chunk(parts, context, memoize)
        }
    }
}

/// Result of building an attribute value.
#[derive(Debug)]
pub struct AttributeValueResult {
    /// The JavaScript expression for the attribute value
    pub value: JsExpr,

    /// Whether the value contains reactive state references
    pub has_state: bool,
}

/// Build a template chunk from text and expression parts.
///
/// Creates a template literal like `foo ${expr} bar`.
/// If all expressions can be evaluated at compile time, returns a string literal.
fn build_template_chunk<F>(
    values: &[AttributeValuePart],
    context: &mut ComponentContext,
    mut memoize: F,
) -> AttributeValueResult
where
    F: FnMut(JsExpr, &ExpressionMetadata) -> JsExpr,
{
    use super::utils::get_literal_value;

    // Pre-allocate for typical attribute value complexity
    let mut quasis = Vec::new();
    let mut expressions = Vec::new();
    let mut has_state = false;
    let mut current_text = String::with_capacity(64);

    for part in values {
        match part {
            AttributeValuePart::Text(text) => {
                current_text.push_str(&text.data);
            }

            AttributeValuePart::ExpressionTag(expr_tag) => {
                // Try to evaluate at compile time (constant folding)
                if let Some(lit_value) = get_literal_value(&expr_tag.expression, context) {
                    // Successfully evaluated - fold into current text
                    if let Some(val) = lit_value {
                        current_text.push_str(&val);
                    }
                    // For None (null/undefined), we just skip adding to the string
                    continue;
                }

                // Cannot fold - push the accumulated text as a quasi
                quasis.push(b::quasi(sanitize_template_string(&current_text), false));
                current_text.clear();

                // Build the expression using full context-aware conversion
                let expression = extract_expression_from_tag_with_context(expr_tag, context);
                let mut metadata = extract_metadata_from_tag(expr_tag);

                // Phase 3 needs the broad "any CallExpression in the tree" check
                // for memoisation decisions; see `expression_tag_has_call`.
                let chunk_has_call = expression_tag_has_call(expr_tag);
                metadata.set_has_call(chunk_has_call);

                // Update metadata.has_state with comprehensive reactive state check
                // (the analysis-phase metadata may not account for transforms registered later)
                let chunk_has_state =
                    super::utils::expression_has_reactive_state(&expr_tag.expression, context)
                        || chunk_has_call;
                metadata.set_has_state(chunk_has_state);

                let built = build_expression(context, &expression, &metadata);
                let memoized = memoize(built, &metadata);

                // Matches Svelte JS: `if (!evaluated.is_defined) value = b.logical('??', value, b.literal(''))`.
                // JS uses `scope.evaluate(value).is_defined` on the MEMOIZED form - for memoized placeholders
                // like `$0` this evaluates as unknown, so `?? ''` is added.
                let is_defined = if let JsExpr::Identifier(name) = &memoized {
                    // Memoized placeholders ($0, $1, ...) are never statically defined
                    let is_memo_placeholder = name.starts_with('$')
                        && name.len() > 1
                        && name.chars().skip(1).all(|c| c.is_ascii_digit());
                    if is_memo_placeholder {
                        false
                    } else {
                        super::utils::is_expression_defined(&expr_tag.expression, context)
                    }
                } else {
                    super::utils::is_js_expr_defined(&memoized, &context.arena)
                };
                let final_value = if is_defined {
                    memoized
                } else {
                    b::logical_str(&context.arena, "??", memoized, b::string(""))
                };

                expressions.push(final_value);

                // Check for reactive state using both analysis metadata AND transforms
                // The analysis-phase metadata may not account for transforms registered
                // during the transform phase (e.g., each block item transforms)
                if metadata.has_state()
                    || metadata.has_await()
                    || super::utils::expression_has_reactive_state(&expr_tag.expression, context)
                {
                    has_state = true;
                }
            }
        }
    }

    // Push the final text
    quasis.push(b::quasi(sanitize_template_string(&current_text), true));

    // If no expressions remain (all were folded), return a simple string
    if expressions.is_empty() {
        let all_text: String = quasis.iter().map(|q| q.cooked.as_str()).collect();
        return AttributeValueResult {
            value: b::string(&all_text),
            has_state: false,
        };
    }

    AttributeValueResult {
        value: JsExpr::TemplateLiteral(JsTemplateLiteral {
            quasis,
            expressions,
        }),
        has_state,
    }
}

/// Extract the JavaScript expression from an ExpressionTag.
///
/// This function converts the parsed ExpressionTag to a JsExpr using the
/// expression_converter module.
fn extract_expression_from_tag_with_context(
    expr_tag: &ExpressionTag,
    context: &mut ComponentContext,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    // Use the expression converter to properly convert the expression
    convert_expression(&expr_tag.expression, context)
}

/// Extract metadata from an ExpressionTag.
///
/// Compute Phase-3 metadata flags by walking the expression's JSON.
///
/// `expr_tag.metadata.expression` (set by Phase 2) is **not** reliable
/// for the ExpressionTags that live inside attribute / style-directive
/// `AttributeValue::Sequence` parts, because the parent visitors only
/// walk the inner expression with a scratch `ExpressionMetadata` and
/// throw it away. Reading the field would yield all-default flags and
/// silently break things like `<p style:font-size="{settings.fontSize}px">`,
/// which then loses its `($.get(...), $.untrack(() => ...))` legacy-state
/// untrack wrapper.
///
/// The cheaper "use the cached metadata" path is fine for the
/// standalone-expression call sites (where the ExpressionTag visitor
/// did run in Phase 2) but we don't currently distinguish those, so do
/// the broad walk here for every consumer.
///
/// `has_state` / `dynamic` are reset; the caller recomputes `has_state`
/// via `expression_has_reactive_state(...)` so transforms registered
/// later in the pipeline are accounted for.
fn extract_metadata_from_tag(expr_tag: &ExpressionTag) -> ExpressionMetadata {
    let mut metadata = ExpressionMetadata::default();

    let val = expr_tag.expression.as_json();
    if !is_literal_value(val) {
        let mut has_call = false;
        let mut has_member = false;
        let mut has_assignment = false;
        let mut has_await = false;
        walk_metadata_flags(
            val,
            &mut has_call,
            &mut has_member,
            &mut has_assignment,
            &mut has_await,
        );
        metadata.set_has_call(has_call);
        metadata.set_has_member_expression(has_member);
        metadata.set_has_assignment(has_assignment);
        metadata.set_has_await(has_await);
    }
    metadata
}

/// Single-pass walk that sets the four AST-derived flags on which
/// Phase 3 memoisation / untrack wrapping decisions depend. Mirrors the
/// pre-bd01699 `ast_extract_metadata_flags` helper.
fn walk_metadata_flags(
    val: &serde_json::Value,
    has_call: &mut bool,
    has_member: &mut bool,
    has_assignment: &mut bool,
    has_await: &mut bool,
) {
    if *has_call && *has_member && *has_assignment && *has_await {
        return;
    }
    match val {
        serde_json::Value::Object(obj) => {
            if let Some(t) = obj.get("type").and_then(|t| t.as_str()) {
                match t {
                    "CallExpression" => *has_call = true,
                    // A spread `...x` is treated like `...x.values()` — it may
                    // invoke a getter/iterator — so it counts as a call. Mirrors
                    // upstream `2-analyze/visitors/SpreadElement.js`, which sets
                    // `has_call = true`. This makes a legacy attribute value with a
                    // spread (`{ ...props }`) get the `(deps, $.untrack(...))`
                    // dependency wrapping from `build_expression`.
                    "SpreadElement" => *has_call = true,
                    "MemberExpression" => *has_member = true,
                    "AssignmentExpression" | "UpdateExpression" => *has_assignment = true,
                    "AwaitExpression" => *has_await = true,
                    "ArrowFunctionExpression" | "FunctionExpression" | "FunctionDeclaration" => {
                        return;
                    }
                    _ => {}
                }
            }
            for v in obj.values() {
                walk_metadata_flags(v, has_call, has_member, has_assignment, has_await);
                if *has_call && *has_member && *has_assignment && *has_await {
                    return;
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr {
                walk_metadata_flags(v, has_call, has_member, has_assignment, has_await);
                if *has_call && *has_member && *has_assignment && *has_await {
                    return;
                }
            }
        }
        _ => {}
    }
}

/// True when the ExpressionTag contains a `CallExpression` somewhere in
/// its tree (excluding nested function bodies). Phase 3 uses this broad
/// definition for memoisation decisions; the cached
/// `expr_tag.metadata.expression.has_call()` set by Phase 2 follows the
/// official compiler's narrower "non-pure callee" semantics, which is
/// not yet what the rest of Phase 3 expects.
pub fn expression_tag_has_call(expr_tag: &ExpressionTag) -> bool {
    let val = expr_tag.expression.as_json();
    if is_literal_value(val) {
        false
    } else {
        json_contains_call(val)
    }
}

/// True when `val` (or any descendant, except inside function bodies)
/// contains a `CallExpression`. Mirrors the broad recursive check that
/// `extract_metadata_from_tag` used before bd01699.
fn json_contains_call(val: &serde_json::Value) -> bool {
    match val {
        serde_json::Value::Object(obj) => {
            if let Some(t) = obj.get("type").and_then(|t| t.as_str()) {
                if t == "CallExpression" {
                    return true;
                }
                // Don't recurse into function bodies — matches Phase 2's
                // walker, which also stops at function boundaries.
                if matches!(
                    t,
                    "ArrowFunctionExpression" | "FunctionExpression" | "FunctionDeclaration"
                ) {
                    return false;
                }
            }
            obj.values().any(json_contains_call)
        }
        serde_json::Value::Array(arr) => arr.iter().any(json_contains_call),
        _ => false,
    }
}

/// Check if a JSON value represents a literal (non-reactive) value.
///
/// Literals include: numbers, strings, booleans, null, undefined.
/// `extract_metadata_from_tag` short-circuits on these so it never walks
/// the JSON looking for `CallExpression`.
fn is_literal_value(val: &serde_json::Value) -> bool {
    match val {
        serde_json::Value::Null => true,
        serde_json::Value::Bool(_) => true,
        serde_json::Value::Number(_) => true,
        serde_json::Value::String(_) => true,
        serde_json::Value::Object(obj) => {
            // Check if this is a Literal AST node
            if let Some(serde_json::Value::String(node_type)) = obj.get("type") {
                matches!(
                    node_type.as_str(),
                    "Literal"
                        | "NumericLiteral"
                        | "StringLiteral"
                        | "BooleanLiteral"
                        | "NullLiteral"
                )
            } else {
                false
            }
        }
        serde_json::Value::Array(_) => false,
    }
}

/// Build attribute setter.
///
/// Creates a call to set an attribute on an element.
pub fn build_set_attribute(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    element: JsExpr,
    name: &str,
    value: JsExpr,
) -> JsStatement {
    b::stmt(
        arena,
        b::call(
            arena,
            b::member_path(arena, "$.set_attribute"),
            vec![element, b::string(name), value],
        ),
    )
}

/// Build an object from class directives.
///
/// Corresponds to `build_class_directives_object` in RegularElement.js.
/// Creates an object like `{ foo: condition(), bar: otherCondition() }`.
///
/// Note: The expressions in class directives need to be converted to function calls
/// if they reference props (e.g., `foo` becomes `foo()`).
///
/// When the directives contain function calls or reactive state, the resulting object
/// is memoized via `context.state.memoizer.add_memoized()`, which causes the template_effect
/// to use `($0) => ...` parameter syntax with `[() => object]` as the values array.
pub fn build_class_directives_object(
    class_directives: &[&ClassDirective],
    context: &mut ComponentContext,
) -> (JsExpr, bool) {
    build_class_directives_object_with_memoizer(class_directives, context, None)
}

/// Build class directives object with an optional external memoizer.
///
/// When `external_memoizer` is Some, it is used for memoization instead of
/// `context.state.memoizer`. This matches the official compiler where
/// `build_class_directives_object` takes an optional `memoizer` parameter:
/// - Called from `build_attribute_effect`: passes the local memoizer
/// - Called from `build_set_class`: no memoizer (uses None, result returned as-is)
pub fn build_class_directives_object_with_memoizer(
    class_directives: &[&ClassDirective],
    context: &mut ComponentContext,
    external_memoizer: Option<&mut Memoizer>,
) -> (JsExpr, bool) {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    let mut properties = Vec::with_capacity(class_directives.len());
    let mut has_state = false;
    let mut has_call_or_state = false;
    let mut has_await = false;

    for directive in class_directives {
        // Check if this directive has reactive state
        let directive_has_state =
            super::utils::expression_has_reactive_state(&directive.expression, context);

        // Phase 2's `ClassDirective` visitor already cached this on
        // `directive.metadata.expression.has_call()`, so consume the cached
        // value rather than re-walking the expression.
        let directive_has_call = directive.metadata.expression.has_call();

        // Check if directive has await
        has_await = has_await || directive.metadata.expression.has_await();

        if directive_has_state || directive_has_call {
            has_state = true;
        }

        has_call_or_state = has_call_or_state || directive_has_call;

        // Convert the expression using the expression converter
        let expression = convert_expression(&directive.expression, context);

        // Apply transforms to handle prop -> prop() calls in legacy mode
        // This ensures props are called as functions: { foo: foo() } instead of { foo }
        let expression = super::utils::apply_transforms_to_expression(&expression, context);

        properties.push(b::prop(
            &context.arena,
            directive.name.to_string(),
            expression,
        ));
    }

    let directives_obj = b::object(properties);

    // Memoize the object if it has calls or await, matching the official Svelte compiler:
    // `const should_memoize = metadata.has_call || metadata.has_await || (memoize_if_state && metadata.has_state);`
    // Note: `memoize_if_state = false` by default in `build_class_directives_object`, so we only
    // memoize based on has_call or has_await. Props without calls (e.g., `class:foo` shorthand)
    // have has_state=true but has_call=false and should NOT be memoized.
    let has_call = has_call_or_state; // has_call_or_state only includes directive_has_call now
    let result_expr = if has_call || has_await {
        if let Some(memoizer) = external_memoizer {
            memoizer.add(directives_obj, has_call, has_await, false, has_state)
        } else {
            context.state.memoizer.add_memoized(
                directives_obj,
                has_call,
                has_await,
                false,
                has_state,
            )
        }
    } else {
        directives_obj
    };

    (result_expr, has_state)
}

/// Build an object from style directives.
///
/// Corresponds to `build_style_directives_object` in RegularElement.js.
/// Creates either:
/// - A simple object `{ color: value }` for normal styles
/// - An array `[normal, important]` if there are !important modifiers
pub fn build_style_directives_object(
    style_directives: &[&StyleDirective],
    context: &mut ComponentContext,
) -> JsExpr {
    build_style_directives_object_with_memoizer(style_directives, context, None)
}

/// Build style directives object with an optional external memoizer.
///
/// When `external_memoizer` is Some, it is used for memoization instead of
/// `context.state.memoizer`. This matches the official compiler where
/// `build_style_directives_object` takes an optional `memoizer` parameter.
pub fn build_style_directives_object_with_memoizer(
    style_directives: &[&StyleDirective],
    context: &mut ComponentContext,
    external_memoizer: Option<&mut Memoizer>,
) -> JsExpr {
    let mut normal_properties = Vec::with_capacity(style_directives.len());
    let mut important_properties = Vec::new();
    let mut has_call = false;
    let mut has_state = false;
    let mut has_await = false;

    for directive in style_directives {
        // Track metadata for memoization decision
        let expr = &get_directive_expression(directive);
        has_call = has_call || super::utils::expression_has_call(expr, context);
        has_state = has_state
            || super::utils::expression_has_reactive_state(expr, context)
            || super::utils::expression_has_call(expr, context);
        has_await = has_await || super::utils::expression_has_await(expr);

        // Build the expression for this directive
        let expression = if matches!(&directive.value, AttributeValue::True(true)) {
            // style:color shorthand - apply transforms to get proper prop() calls
            // This matches the official compiler which uses build_getter(b.id(d.name), context.state)
            super::utils::apply_transforms_to_expression(&b::id(directive.name.as_str()), context)
        } else {
            // style:color={value} or style:color="value"
            let result = build_attribute_value(&directive.value, context, |expr, _| expr);
            result.value
        };

        // Check if this has the !important modifier
        let is_important = directive
            .modifiers
            .iter()
            .any(|m| m.as_str() == "important");

        if is_important {
            important_properties.push(b::prop(
                &context.arena,
                directive.name.to_string(),
                expression,
            ));
        } else {
            normal_properties.push(b::prop(
                &context.arena,
                directive.name.to_string(),
                expression,
            ));
        }
    }

    let normal_obj = b::object(normal_properties);

    let directives = if important_properties.is_empty() {
        normal_obj
    } else {
        // Return [normal, important] array
        b::array(vec![normal_obj, b::object(important_properties)])
    };

    // Memoize through the memoizer, matching the official compiler's behavior:
    // return memoizer.add(directives, metadata)
    // This ensures style directive objects with function calls get $N parameter references
    if let Some(memoizer) = external_memoizer {
        memoizer.add(directives, has_call, has_await, false, has_state)
    } else {
        context
            .state
            .memoizer
            .add_memoized(directives, has_call, has_await, false, has_state)
    }
}

/// Check if an AttributeValue contains an await expression.
fn attr_has_await_expr(attr_value: &AttributeValue) -> bool {
    match attr_value {
        AttributeValue::True(_) => false,
        AttributeValue::Expression(expr_tag) => {
            super::utils::expression_has_await(&expr_tag.expression)
        }
        AttributeValue::Sequence(parts) => parts.iter().any(|part| match part {
            AttributeValuePart::Text(_) => false,
            AttributeValuePart::ExpressionTag(expr_tag) => {
                super::utils::expression_has_await(&expr_tag.expression)
            }
        }),
    }
}

/// Build class handling for an element with class attribute and/or class directives.
///
/// Corresponds to `build_set_class` in shared/element.js.
///
/// This function handles the complete class attribute + class directives processing:
/// 1. Builds the class value from the attribute (if any)
/// 2. Adds CSS hash to the class value if the element is scoped
/// 3. Creates a `let classes;` declaration if there's state
/// 4. Generates `$.set_class(element, flags, class_value, css_hash, prev, next)` call
/// 5. Wraps in assignment `classes = $.set_class(...)` if there's state
/// 6. Pushes to either init (static) or update (dynamic)
///
/// # Arguments
///
/// * `element` - The element node
/// * `node_id` - The identifier for the element (e.g., "div")
/// * `class_attribute` - The class attribute value (if any), or None for class directives only
/// * `class_directives` - The class directives (class:foo, class:bar, etc.)
/// * `context` - The component context
/// * `is_html` - Whether this is an HTML element (vs SVG)
/// * `css_hash` - The CSS scoping hash (empty string if no CSS)
/// * `is_scoped` - Whether the element needs CSS scoping
pub fn build_set_class(
    _element: &RegularElementNode,
    node_id: &str,
    class_attribute: Option<&AttributeValue>,
    class_directives: &[&ClassDirective],
    context: &mut ComponentContext,
    is_html: bool,
    css_hash: &str,
    is_scoped: bool,
) {
    // Build the class value from the attribute
    let (mut class_value, mut has_state) = if let Some(attr_value) = class_attribute {
        // Check if we need to wrap in $.clsx() before building the value
        let should_clsx = needs_clsx(attr_value);

        // In the official compiler, the memoize callback in build_set_class calls
        // `context.state.analysis.memoizer.add(value, metadata)` per-expression.
        // This means each individual expression inside a template literal is memoized
        // separately (e.g., `myHelper(y())` becomes `$0`), not the whole template.
        //
        // To work around Rust borrow checker (context is mutably borrowed by
        // build_attribute_value, and the closure also needs context.state.memoizer),
        // we temporarily take the memoizer out of context, use it in the closure,
        // then put it back.
        let mut memoizer = std::mem::take(&mut context.state.memoizer);
        let mut any_has_call = false;
        let mut any_has_await = false;
        // SAFETY: `JsArena` allocates via interior mutability (`UnsafeCell`)
        // with nodes behind stable `Box`es, so a shared `&JsArena` stays valid
        // while `context` is reborrowed mutably by `build_attribute_value`. The
        // arena outlives this borrow; traversal is single-threaded (no aliasing).
        let arena_ref_elem = unsafe { &*(&context.arena as *const _) };
        let result = build_attribute_value(attr_value, context, |expr, metadata| {
            let has_call = metadata.has_call();
            let has_await = metadata.has_await();
            let has_state = metadata.has_state();
            if has_call {
                any_has_call = true;
            }
            if has_await {
                any_has_await = true;
            }
            // Wrap in $.clsx() BEFORE memoization so it becomes part of the memoized source.
            // In the official compiler, clsx wrapping happens per-expression inside the memoize
            // callback, so the memoized array contains `() => $.clsx(expr)` and the callback
            // parameter `$0` already has the clsx'd value.
            let expr_to_memoize = if should_clsx {
                b::call(
                    arena_ref_elem,
                    b::member_path(arena_ref_elem, "$.clsx"),
                    vec![expr],
                )
            } else {
                expr
            };
            memoizer.add_memoized(
                expr_to_memoize,
                has_call,
                has_await,
                false, // memoize_if_state
                has_state,
            )
        });
        // Restore the memoizer
        context.state.memoizer = memoizer;
        let value = result.value;
        // Include has_call in has_state check: in the official compiler, the CallExpression
        // analyze visitor sets has_state = true for non-pure calls, ensuring memoized expressions
        // (which reference $N template_effect parameters) go to update, not init.
        (value, result.has_state || any_has_await || any_has_call)
    } else {
        // No class attribute - use empty string
        (b::string(""), false)
    };

    // Build class directives (previous_id, prev, next) BEFORE handling CSS hash
    // This matches the official implementation order in shared/element.js
    let mut previous_id: Option<String> = None;
    let mut prev: Option<JsExpr> = None;
    let mut next: Option<JsExpr> = None;

    if !class_directives.is_empty() {
        let (obj, directives_has_state) = build_class_directives_object(class_directives, context);
        next = Some(obj);
        has_state = has_state || directives_has_state;

        if has_state {
            let id = context.state.memoizer.generate_id("classes");
            // Add variable declaration: let classes;
            context
                .state
                .init
                .push(b::let_decl(&context.arena, &id, None));
            prev = Some(b::id(&id));
            previous_id = Some(id);
        } else {
            prev = Some(b::empty_object());
        }
    }

    // Handle CSS hash - this comes AFTER class directives processing
    // Matches official implementation: shared/element.js lines 186-200
    let mut css_hash_expr: Option<JsExpr> = None;

    if is_scoped && !css_hash.is_empty() {
        // Check if class_value is a literal string
        match &class_value {
            JsExpr::Literal(
                crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral::String(s),
            ) => {
                // Append CSS hash to the class value
                if s.is_empty() {
                    class_value = b::string(css_hash);
                } else {
                    class_value = b::string(format!("{} {}", s, css_hash));
                }
            }
            // A quote-preserving string literal (`class={"draggable"}`) is just as
            // static — fold the hash into the string rather than passing it as a
            // separate `$.set_class` argument (matches upstream, which sees a plain
            // string `Literal`).
            JsExpr::Literal(
                crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral::RawString {
                    value,
                    ..
                },
            ) => {
                if value.is_empty() {
                    class_value = b::string(css_hash);
                } else {
                    class_value = b::string(format!("{} {}", value, css_hash));
                }
            }
            _ => {
                // Dynamic class value - use css_hash as separate argument
                css_hash_expr = Some(b::string(css_hash));
            }
        }
    }

    // If no css_hash but we have class directives (next), set css_hash to null
    // This matches official implementation: if (!css_hash && next) css_hash = b.null;
    if css_hash_expr.is_none() && next.is_some() {
        css_hash_expr = Some(b::null());
    }

    // Build the $.set_class call
    // $.set_class(element, flags, class_value, css_hash, prev, next)
    // Uses call_trimmed to strip trailing undefined/null args (matching b.call behavior)
    let flags = if is_html {
        b::number(1.0)
    } else {
        b::number(0.0)
    };
    let node_expr = b::id(node_id);

    let set_class_call = b::call_trimmed(
        &context.arena,
        b::member_path(&context.arena, "$.set_class"),
        vec![
            node_expr,
            flags,
            class_value,
            css_hash_expr.unwrap_or_else(|| b::undefined(&context.arena)),
            prev.unwrap_or_else(|| b::undefined(&context.arena)),
            next.unwrap_or_else(|| b::undefined(&context.arena)),
        ],
    );

    // Wrap in assignment if we have a previous_id
    let set_class_expr = if let Some(ref id) = previous_id {
        b::assign(&context.arena, b::id(id), set_class_call)
    } else {
        set_class_call
    };

    // Push to either update (has_state) or init (static)
    if has_state {
        context
            .state
            .update
            .push(b::stmt(&context.arena, set_class_expr));
    } else {
        context
            .state
            .init
            .push(b::stmt(&context.arena, set_class_expr));
    }
}

/// Legacy function for backwards compatibility - use build_set_class instead.
pub fn build_set_class_call(
    _element: &RegularElementNode,
    node_expr: JsExpr,
    class_directives: &[&ClassDirective],
    context: &mut ComponentContext,
    is_html: bool,
    css_hash: &str,
) -> JsExpr {
    // Extract node_id from node_expr
    let node_id = match &node_expr {
        JsExpr::Identifier(name) => name.clone(),
        _ => "node".into(),
    };

    // Build class directives object: { foo: condition(), bar: otherCondition() }
    let (class_obj, _has_state) = build_class_directives_object(class_directives, context);

    // Flags: 1 for HTML, 0 for SVG
    let flags = if is_html {
        b::number(1.0)
    } else {
        b::number(0.0)
    };

    // Class attribute value (empty string if no class attribute)
    let class_attr = b::string("");

    // CSS hash for scoping (null if no hash)
    let css_binding = if css_hash.is_empty() {
        b::null()
    } else {
        b::string(css_hash)
    };

    // Previous state (empty object for initial render)
    let prev = b::empty_object();

    // $.set_class(element, flags, class_attr, css_hash, prev, next)
    b::call(
        &context.arena,
        b::member_path(&context.arena, "$.set_class"),
        vec![
            b::id(node_id.clone()),
            flags,
            class_attr,
            css_binding,
            prev,
            class_obj,
        ],
    )
}

/// Build a $.set_style() call for an element with style directives (legacy version).
///
/// Corresponds to `build_set_style` in shared/element.js.
///
/// Generates: `$.set_style(element, style_attr, prev, next)`
/// Where:
/// - style_attr: The static style attribute value (or "")
/// - prev: Previous style directives state (or {})
/// - next: Current style directives object
pub fn build_set_style_call(
    node_expr: JsExpr,
    style_directives: &[&StyleDirective],
    context: &mut ComponentContext,
) -> JsExpr {
    // Build style directives object
    let style_obj = build_style_directives_object(style_directives, context);

    // Style attribute value (empty string if no style attribute)
    let style_attr = b::string("");

    // Previous state (empty object for initial render)
    let prev = b::empty_object();

    // $.set_style(element, style_attr, prev, next)
    b::call(
        &context.arena,
        b::member_path(&context.arena, "$.set_style"),
        vec![node_expr, style_attr, prev, style_obj],
    )
}

/// Build style handling for an element with style attribute and/or style directives.
///
/// Corresponds to `build_set_style` in shared/element.js.
///
/// This function handles the complete style attribute + style directives processing:
/// 1. Builds the style value from the attribute with memoization
/// 2. Creates a `let styles;` declaration if there's state with style directives
/// 3. Generates `$.set_style(element, style_value, prev, next)` call
/// 4. Wraps in assignment `styles = $.set_style(...)` if there's state with style directives
/// 5. Pushes to either init (static) or update (dynamic)
///
/// # Arguments
///
/// * `node_id` - The identifier for the element (e.g., "div")
/// * `style_attribute` - The style attribute value (if any), or None for style directives only
/// * `style_directives` - The style directives (style:color, style:font-size, etc.)
/// * `context` - The component context
pub fn build_set_style(
    node_id: &str,
    style_attribute: Option<&AttributeValue>,
    style_directives: &[&StyleDirective],
    context: &mut ComponentContext,
) {
    // Build the style value from the attribute with memoization of inner expressions
    // We need to directly build the value and memoize, rather than use the closure-based
    // build_attribute_value, because we need access to context.state.memoizer
    let (style_value, mut has_state) = if let Some(attr_value) = style_attribute {
        build_style_attribute_value_with_memoization(attr_value, context)
    } else {
        // No style attribute - use empty string
        (b::string(""), false)
    };

    // Generate previous_id for style directives state tracking
    let mut previous_id: Option<String> = None;
    let mut prev: JsExpr = b::empty_object();
    let mut next: Option<JsExpr> = None;

    if !style_directives.is_empty() {
        // Build style directives object
        next = Some(build_style_directives_object(style_directives, context));

        // Check if any style directive has state, non-pure function calls, or async blockers
        // In the official compiler, has_call implies has_state for template_effect routing
        // Also check for async blockers - variables that depend on async promises should be
        // treated as having state so they end up in template_effect with proper promise deps
        for directive in style_directives {
            let expr = &get_directive_expression(directive);
            if super::utils::expression_has_reactive_state(expr, context)
                || super::utils::expression_has_call(expr, context)
            {
                has_state = true;
                break;
            }
            // Check for async blockers: convert directive expression to JS and check blockers
            let js_expr = if matches!(&directive.value, AttributeValue::True(true)) {
                b::id(directive.name.as_str())
            } else {
                let result = build_attribute_value(&directive.value, context, |expr, _| expr);
                result.value
            };
            if context
                .state
                .has_blockers_for_expr(&js_expr, &context.arena)
            {
                has_state = true;
                break;
            }
        }

        if has_state {
            let id = context.state.memoizer.generate_id("styles");
            context
                .state
                .init
                .push(b::let_decl(&context.arena, &id, None));
            prev = b::id(&id);
            previous_id = Some(id);
        }

        // Upstream `StyleDirective.js` (analyze) adds a SHORTHAND directive's
        // binding to `metadata.expression.dependencies` rather than `references`,
        // and the client `Memoizer.check_blockers` only walks `references`. As a
        // result a `$.set_style` whose directives are ALL shorthand never
        // contributes a `$$promises[N]` blocker to its `$.template_effect`. Record
        // the shorthand directive names so the Rust blocker scan (which works off
        // the literal update-statement identifiers) can exclude them. If ANY
        // directive in this set is non-shorthand, upstream merges its references
        // into the shared metadata and the whole `set_style` blocks, so we record
        // nothing.
        if has_state
            && style_directives
                .iter()
                .all(|d| matches!(&d.value, AttributeValue::True(true)))
        {
            for d in style_directives {
                let name = d.name.to_string();
                if !context.state.style_shorthand_blocker_names.contains(&name) {
                    context.state.style_shorthand_blocker_names.push(name);
                }
            }
        }
    }

    // Build the $.set_style call
    let mut args = vec![b::id(node_id), style_value];

    // Only add prev and next if we have style directives
    if let Some(next_obj) = next {
        args.push(prev);
        args.push(next_obj);
    }

    let set_style = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.set_style"),
        args,
    );

    // Wrap in assignment if we have a previous_id
    let set_style_expr = if let Some(ref id) = previous_id {
        b::assign(&context.arena, b::id(id), set_style)
    } else {
        set_style
    };

    // Push to either update (has_state) or init (static)
    if has_state {
        context
            .state
            .update
            .push(b::stmt(&context.arena, set_style_expr));
    } else {
        context
            .state
            .init
            .push(b::stmt(&context.arena, set_style_expr));
    }
}

/// Build a style attribute value with proper memoization of inner expressions.
///
/// This function builds the style value while memoizing expressions that contain
/// function calls. Unlike build_attribute_value which uses a closure, this function
/// directly accesses the memoizer to avoid borrow checker issues.
///
/// For example, `style="background-color: {getColor()};"` produces:
/// - Value: `\`background-color: ${$0 ?? ''};\``
/// - The expression `getColor()` is added to memoizer's sync_values
fn build_style_attribute_value_with_memoization(
    attr_value: &AttributeValue,
    context: &mut ComponentContext,
) -> (JsExpr, bool) {
    use crate::ast::template::AttributeValuePart;
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    match attr_value {
        AttributeValue::True(_) => (b::boolean(true), false),

        AttributeValue::Expression(expr_tag) => {
            // Single expression value - analyze all properties in one pass
            let converted = convert_expression(&expr_tag.expression, context);
            let expr_props =
                super::utils::analyze_expression_properties(&expr_tag.expression, context);
            let has_call = expr_props.has_call;
            let has_state = expr_props.has_state;
            let has_member = expr_props.has_member;

            // Build the expression with transforms applied
            let mut metadata = ExpressionMetadata::default();
            metadata.set_has_state(has_state);
            metadata.set_has_call(has_call);
            metadata.set_has_member_expression(has_member);
            let built = build_expression(context, &converted, &metadata);

            // Memoize if has call
            let value = context.state.memoizer.add_memoized(
                built, has_call, false, // has_await
                false, // memoize_if_state
                has_state,
            );

            (value, has_state || has_call)
        }

        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            // Single part - handle as simple value (avoid wrapping in template literal)
            match &parts[0] {
                AttributeValuePart::Text(text) => (b::string(text.data.as_str()), false),
                AttributeValuePart::ExpressionTag(expr_tag) => {
                    let converted = convert_expression(&expr_tag.expression, context);
                    let expr_props =
                        super::utils::analyze_expression_properties(&expr_tag.expression, context);
                    let has_call = expr_props.has_call;
                    let expr_has_state = expr_props.has_state;
                    let has_member = expr_props.has_member;

                    let mut metadata = ExpressionMetadata::default();
                    metadata.set_has_state(expr_has_state);
                    metadata.set_has_call(has_call);
                    metadata.set_has_member_expression(has_member);
                    let built = build_expression(context, &converted, &metadata);

                    let value = context.state.memoizer.add_memoized(
                        built,
                        has_call,
                        false, // has_await
                        false, // memoize_if_state
                        expr_has_state,
                    );

                    (value, expr_has_state || has_call)
                }
            }
        }

        AttributeValue::Sequence(parts) => {
            // Template literal with multiple parts
            // Following the official Svelte compiler's build_template_chunk logic:
            // 1. Literal expressions are inlined directly into the quasi text
            // 2. Known constant identifiers (scope.evaluate().is_known) are inlined
            // 3. Only unknown/reactive expressions become template literal interpolations
            let mut quasis = Vec::with_capacity(parts.len() + 1);
            let mut expressions = Vec::with_capacity(parts.len());
            let mut has_state = false;
            let mut current_text = String::new();

            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        current_text.push_str(&text.data);
                    }
                    AttributeValuePart::ExpressionTag(expr_tag) => {
                        // Check if the expression can be evaluated to a known constant value.
                        // This matches the official compiler's build_template_chunk logic:
                        // - Literal nodes are inlined directly (lines 121-124)
                        // - Identifiers referencing constant bindings are evaluated via
                        //   scope.evaluate() and inlined if is_known (lines 135-163)
                        if let Some(lit_value) =
                            super::utils::get_literal_value(&expr_tag.expression, context)
                        {
                            if let Some(val) = lit_value {
                                current_text.push_str(&val);
                            }
                            // None means null/undefined - skip (matching official: if value != null)
                            continue;
                        }

                        // Push accumulated text as quasi
                        quasis.push(b::quasi(sanitize_template_string(&current_text), false));
                        current_text.clear();

                        // Convert and build the expression
                        let converted = convert_expression(&expr_tag.expression, context);
                        let expr_props = super::utils::analyze_expression_properties(
                            &expr_tag.expression,
                            context,
                        );
                        let has_call = expr_props.has_call;
                        let expr_has_state = expr_props.has_state;
                        let has_member = expr_props.has_member;

                        let mut metadata = ExpressionMetadata::default();
                        metadata.set_has_state(expr_has_state);
                        metadata.set_has_call(has_call);
                        metadata.set_has_member_expression(has_member);
                        let built = build_expression(context, &converted, &metadata);

                        // Memoize the expression if it has a function call
                        let value = context.state.memoizer.add_memoized(
                            built,
                            has_call,
                            false, // has_await
                            false, // memoize_if_state
                            expr_has_state,
                        );

                        // Add ?? '' where necessary (only if not guaranteed to be defined).
                        //
                        // The official Svelte compiler checks `state.scope.evaluate(value).is_defined`
                        // on the *post-transform* value. For memoized values (`$N` identifiers
                        // produced by `memoizer.add(...)`), the scope can't evaluate the
                        // synthetic name, so it falls through to "not defined" and adds `?? ''`.
                        //
                        // We mirror that here: if the value is a memoized synthetic identifier
                        // (`$0`, `$1`, ...), treat it as not-defined.
                        let is_memo_id = if let JsExpr::Identifier(name) = &value {
                            name.starts_with('$')
                                && name.len() > 1
                                && name.chars().skip(1).all(|c| c.is_ascii_digit())
                        } else {
                            false
                        };
                        let is_defined = if is_memo_id {
                            false
                        } else if let JsExpr::Identifier(_) = &value {
                            super::utils::is_expression_defined(&expr_tag.expression, context)
                        } else {
                            super::utils::is_js_expr_defined(&value, &context.arena)
                        };
                        let final_value = if is_defined {
                            value
                        } else {
                            b::logical_str(&context.arena, "??", value, b::string(""))
                        };
                        expressions.push(final_value);

                        if has_call || expr_has_state {
                            has_state = true;
                        }
                    }
                }
            }

            // If all expressions were inlined (no template interpolations),
            // return a plain string instead of a template literal
            if expressions.is_empty() {
                return (b::string(&current_text), false);
            }

            // Push final quasi
            quasis.push(b::quasi(sanitize_template_string(&current_text), true));

            let value = JsExpr::TemplateLiteral(JsTemplateLiteral {
                quasis,
                expressions,
            });
            (value, has_state)
        }
    }
}

/// Helper to get the expression from a style directive value.
fn get_directive_expression(directive: &StyleDirective) -> crate::ast::js::Expression {
    use crate::ast::js::Expression;

    match &directive.value {
        AttributeValue::Expression(expr_tag) => expr_tag.expression.clone(),
        AttributeValue::True(_) => {
            // For style:color shorthand, create an identifier expression
            Expression::from_json(serde_json::json!({
                "type": "Identifier",
                "name": directive.name.to_string()
            }))
        }
        AttributeValue::Sequence(parts) => {
            // For sequence, check if there are any expression tags
            for part in parts {
                if let crate::ast::template::AttributeValuePart::ExpressionTag(expr_tag) = part {
                    return expr_tag.expression.clone();
                }
            }
            // Static text - return a literal
            Expression::from_json(serde_json::Value::Null)
        }
    }
}

/// Build an attribute effect for elements with spread attributes.
///
/// Corresponds to `build_attribute_effect` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js`.
///
/// When an element has spread attributes, we use `$.attribute_effect()` to handle
/// all attributes and event handlers together. This ensures proper order is maintained
/// and event handlers can be overridden by spreads.
///
/// # Arguments
///
/// * `attributes` - Regular attributes and spread attributes
/// * `class_directives` - Class directives (class:foo)
/// * `style_directives` - Style directives (style:color)
/// * `context` - The component context
/// * `element_id` - The element identifier
/// * `css_hash` - The CSS hash for scoping
///
/// # Example Output
///
/// ```js
/// var event_handler = () => $.set(changed, 'a');
/// $.attribute_effect(div, ($0) => ({ ...$0, ona: event_handler }), [() => get_rest()]);
/// ```
pub fn build_attribute_effect(
    attributes: &[&crate::ast::template::Attribute],
    class_directives: &[&ClassDirective],
    style_directives: &[&StyleDirective],
    context: &mut ComponentContext,
    element_id: JsExpr,
    css_hash: &str,
    should_remove_defaults: bool,
    ignore_hydration: bool,
) {
    use crate::ast::template::Attribute;
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    // Create a local memoizer for this attribute effect
    // This extracts complex expressions (like function calls) and replaces them with $0, $1, etc.
    let mut local_memoizer = Memoizer::new();

    // Pre-allocate based on number of attributes
    let mut properties: Vec<JsObjectMember> = Vec::with_capacity(attributes.len());
    let mut event_handler_decls: Vec<JsStatement> = Vec::new();

    for attribute in attributes {
        match attribute {
            Attribute::Attribute(attr) => {
                // Build the attribute value with local memoization
                let attr_has_await = attr_has_await_expr(&attr.value);
                let result = build_attribute_value(&attr.value, context, |expr, metadata| {
                    // Use the local memoizer to extract complex expressions
                    local_memoizer.add(
                        expr,
                        metadata.has_call(),
                        attr_has_await || metadata.has_await(),
                        false, // memoize_if_state
                        metadata.has_state(),
                    )
                });

                // Note: build_attribute_value already applies transforms via build_expression(),
                // so we do NOT call apply_transforms_to_expression again here.
                let transformed_value = result.value;

                if is_event_attribute_node(attr) {
                    // Check if the value is an arrow function or function expression
                    if is_function_expression(&transformed_value) {
                        // Give the event handler a stable ID so it isn't removed and readded on every update
                        let id = context.state.memoizer.generate_id("event_handler");
                        event_handler_decls.push(b::var_decl(
                            &context.arena,
                            &id,
                            Some(transformed_value),
                        ));
                        properties.push(b::prop(&context.arena, attr.name.to_string(), b::id(&id)));
                    } else {
                        properties.push(b::prop(
                            &context.arena,
                            attr.name.to_string(),
                            transformed_value,
                        ));
                    }
                } else {
                    properties.push(b::prop(
                        &context.arena,
                        attr.name.to_string(),
                        transformed_value,
                    ));
                }
            }
            Attribute::SpreadAttribute(spread) => {
                // Convert the spread expression
                let spread_expr = convert_expression(&spread.expression, context);
                // Apply transforms to handle state variables ($.get() wrapping)
                let transformed_expr =
                    super::utils::apply_transforms_to_expression(&spread_expr, context);

                // Check if the spread expression has function calls or reactive state
                let has_call = super::utils::expression_has_call(&spread.expression, context);
                let has_state =
                    super::utils::expression_has_reactive_state(&spread.expression, context);

                // Check if spread expression has await
                let spread_has_await = super::utils::expression_has_await(&spread.expression);

                // Memoize the spread expression if it has calls (like getter functions)
                // This ensures the expression is only evaluated once per render cycle
                let memoized_expr = local_memoizer.add(
                    transformed_expr,
                    has_call,
                    spread_has_await,
                    false, // memoize_if_state
                    has_state,
                );

                properties.push(b::spread(&context.arena, memoized_expr));
            }
            _ => {}
        }
    }

    // Add class directives (using the local memoizer, matching official compiler)
    if !class_directives.is_empty() {
        let (class_obj, _has_state) = build_class_directives_object_with_memoizer(
            class_directives,
            context,
            Some(&mut local_memoizer),
        );
        // Use $.CLASS as the key - using computed property
        properties.push(b::prop_computed(
            &context.arena,
            b::member_path(&context.arena, "$.CLASS"),
            class_obj,
        ));
    }

    // Add style directives (using the local memoizer, matching official compiler)
    if !style_directives.is_empty() {
        let style_obj = build_style_directives_object_with_memoizer(
            style_directives,
            context,
            Some(&mut local_memoizer),
        );
        // Use $.STYLE as the key - using computed property
        properties.push(b::prop_computed(
            &context.arena,
            b::member_path(&context.arena, "$.STYLE"),
            style_obj,
        ));
    }

    // Add event handler declarations first
    for decl in event_handler_decls {
        context.state.init.push(decl);
    }

    // Get memoizer parameters ($0, $1, etc.) and sync/async values
    let params = local_memoizer.apply();
    let sync_values = local_memoizer.sync_values(&context.arena);
    let async_values = local_memoizer.async_values(&context.arena);

    // Get blockers from expression metadata
    let blocker_exprs = context
        .state
        .get_blockers_for_expr(&b::object(properties.clone()), &context.arena);
    let blockers = if !blocker_exprs.is_empty() {
        Some(b::array(blocker_exprs))
    } else {
        None
    };

    // Convert params (JsExpr) to patterns (JsPattern) for arrow function
    let param_patterns: Vec<JsPattern> = params
        .iter()
        .filter_map(|p| {
            if let JsExpr::Identifier(name) = p {
                Some(JsPattern::Identifier(name.clone()))
            } else {
                None
            }
        })
        .collect();

    // Build the attribute effect call
    // $.attribute_effect(element, ($0, $1...) => ({ ...attrs }), sync_values?, async_values?, blockers?, css_hash?, should_remove_defaults?, ignore_hydration?)
    let obj = b::object(properties);
    let arrow = b::arrow(&context.arena, param_patterns, obj);

    let mut args = vec![element_id, arrow];

    // Add sync_values if we have memoized expressions
    // Otherwise, we still need to add placeholders if css_hash is present or should_remove_defaults
    let has_memoized = sync_values.is_some();
    let has_async = async_values.is_some();
    let has_blockers = blockers.is_some();

    if has_memoized
        || has_async
        || has_blockers
        || !css_hash.is_empty()
        || should_remove_defaults
        || ignore_hydration
    {
        // Add sync_values (or undefined if none)
        args.push(sync_values.unwrap_or_else(|| b::undefined(&context.arena)));

        // Add async_values if present
        if has_async
            || has_blockers
            || !css_hash.is_empty()
            || should_remove_defaults
            || ignore_hydration
        {
            args.push(async_values.unwrap_or_else(|| b::undefined(&context.arena)));
        }

        // Add blockers if present
        if has_blockers || !css_hash.is_empty() || should_remove_defaults || ignore_hydration {
            args.push(blockers.unwrap_or_else(|| b::undefined(&context.arena)));
        }

        // Add CSS hash if present, or undefined if we need should_remove_defaults or ignore_hydration
        if !css_hash.is_empty() {
            args.push(b::string(css_hash));
        } else if should_remove_defaults || ignore_hydration {
            args.push(b::undefined(&context.arena));
        }

        // Add should_remove_defaults if true, or undefined if ignore_hydration needs to be added
        if should_remove_defaults {
            args.push(b::boolean(true));
        } else if ignore_hydration {
            args.push(b::undefined(&context.arena));
        }

        // Add ignore_hydration if true
        if ignore_hydration {
            args.push(b::boolean(true));
        }
    }

    context.state.init.push(b::stmt(
        &context.arena,
        b::call_trimmed(
            &context.arena,
            b::member_path(&context.arena, "$.attribute_effect"),
            args,
        ),
    ));
}

/// Check if an attribute node is an event attribute (starts with "on").
fn is_event_attribute_node(attr: &crate::ast::template::AttributeNode) -> bool {
    attr.name.starts_with("on")
}

/// Check if an expression is a function expression (arrow or function).
fn is_function_expression(expr: &JsExpr) -> bool {
    matches!(expr, JsExpr::Arrow(_) | JsExpr::Function(_))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Text;
    use crate::compiler::ComponentAnalysis;
    use std::rc::Rc;

    #[test]
    fn test_build_attribute_value_true() {
        // Create a minimal context (this would need proper setup in real tests)
        let analysis = ComponentAnalysis::new("", &Default::default());
        let scope = crate::compiler::phases::phase2_analyze::scope::Scope::new(None);
        let scope_root = crate::compiler::phases::phase2_analyze::scope::ScopeRoot::new();
        let options = Rc::new(TransformOptions::default());
        let parse_arena = crate::ast::arena::ParseArena::new();
        let state = ComponentClientTransformState::new(
            &parse_arena,
            &scope,
            &scope_root,
            &analysis,
            b::id("node"),
            options,
        );
        let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        let value = AttributeValue::True(true);
        let result = build_attribute_value(&value, &mut context, |expr, _| expr);

        assert!(!result.has_state);
        match result.value {
            JsExpr::Literal(JsLiteral::Boolean(true)) => {}
            _ => panic!("Expected true literal"),
        }
    }

    #[test]
    fn test_build_attribute_value_text() {
        let analysis = ComponentAnalysis::new("", &Default::default());
        let scope = crate::compiler::phases::phase2_analyze::scope::Scope::new(None);
        let scope_root = crate::compiler::phases::phase2_analyze::scope::ScopeRoot::new();
        let options = Rc::new(TransformOptions::default());
        let parse_arena = crate::ast::arena::ParseArena::new();
        let state = ComponentClientTransformState::new(
            &parse_arena,
            &scope,
            &scope_root,
            &analysis,
            b::id("node"),
            options,
        );
        let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        let value = AttributeValue::Sequence(vec![AttributeValuePart::Text(Text {
            data: "hello".into(),
            raw: "hello".into(),
            start: 0,
            end: 5,
        })]);

        let result = build_attribute_value(&value, &mut context, |expr, _| expr);

        assert!(!result.has_state);
        match result.value {
            JsExpr::Literal(JsLiteral::String(s)) => assert_eq!(s, "hello"),
            _ => panic!("Expected string literal"),
        }
    }

    #[test]
    fn test_is_literal_value_number() {
        // Number AST node: { "type": "Literal", "value": 5 }
        let val = serde_json::json!({
            "type": "Literal",
            "value": 5
        });
        assert!(
            is_literal_value(&val),
            "Literal number should be detected as literal"
        );
    }

    #[test]
    fn test_is_literal_value_identifier() {
        // Identifier AST node: { "type": "Identifier", "name": "foo" }
        let val = serde_json::json!({
            "type": "Identifier",
            "name": "foo"
        });
        assert!(
            !is_literal_value(&val),
            "Identifier should not be detected as literal"
        );
    }

    #[test]
    fn test_is_literal_value_raw_number() {
        // Raw JSON number
        let val = serde_json::json!(5);
        assert!(
            is_literal_value(&val),
            "Raw number should be detected as literal"
        );
    }

    #[test]
    fn test_parse_literal_attribute() {
        // Test that literal attributes (a={5}) are correctly parsed
        // and recognized as non-reactive (has_state = false)
        let input = "<Test a={5} />";
        let result = crate::parse(input, Default::default()).unwrap();

        // Find the Component node
        let mut found_component = false;
        for node in &result.fragment.nodes {
            if let crate::ast::template::TemplateNode::Component(comp) = node {
                found_component = true;
                assert_eq!(comp.name.to_string(), "Test");

                for attr in &comp.attributes {
                    if let crate::ast::template::Attribute::Attribute(a) = attr {
                        assert_eq!(a.name.as_str(), "a");

                        // The attribute value should be an Expression
                        if let crate::ast::template::AttributeValue::Expression(expr_tag) = &a.value
                        {
                            let val = expr_tag.expression.as_json();

                            // Should be recognized as a literal
                            assert!(
                                is_literal_value(val),
                                "Numeric literal should be detected as literal"
                            );

                            // Metadata should have has_state = false
                            let metadata = extract_metadata_from_tag(expr_tag);
                            assert!(!metadata.has_state(), "Literal value should not have state");
                        } else {
                            panic!("Expected Expression attribute value");
                        }
                    }
                }
            }
        }
        assert!(found_component, "Should find Component node");
    }
}
