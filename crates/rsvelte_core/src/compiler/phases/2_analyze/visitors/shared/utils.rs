//! General utility functions for visitors.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/utils.js`.

use super::super::super::{Binding, BindingKind, DeclarationKind, Scope, errors, warnings};
use super::super::{AnalysisError, VisitorContext};
use crate::ast::template::{Fragment, TemplateNode};
use crate::ast::typed_expr::{JsNode, LiteralValue};
use lazy_static::lazy_static;
use regex::Regex;

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

/// Enforce the `experimental_async` / `legacy_await_invalid` gate for awaits in
/// template expressions.
///
/// Upstream every template expression context (expression tags, block
/// conditions, directives, attributes, `{@const}` …) sets
/// `state.expression = node.metadata.expression`, so the `AwaitExpression`
/// analyze visitor takes the `suspend = true` branch and errors unless
/// a) `experimental.async` is enabled and b) the component is in runes mode
/// (AwaitExpression.js L26-42). Function boundaries reset `expression` to
/// `null` (shared/function.js L19-23) — mirrored by `in_template_function`.
pub(crate) fn validate_template_await(
    context: &VisitorContext,
    node: &JsNode,
) -> Result<(), AnalysisError> {
    if context.in_template_function {
        return Ok(());
    }
    if !context.analysis.experimental_async {
        return Err(AnalysisError::validation_at(
            "experimental_async",
            "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`",
            node.start().unwrap_or(0),
            node.end().unwrap_or(0),
        ));
    }
    if !context.analysis.runes {
        return Err(AnalysisError::validation_at(
            "legacy_await_invalid",
            "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless in runes mode",
            node.start().unwrap_or(0),
            node.end().unwrap_or(0),
        ));
    }
    Ok(())
}

/// Check if there's a variable declaration for the given name in the current function's
/// scope chain by looking at the JS AST path.
///
/// This walks the js_path looking for FunctionDeclaration/FunctionExpression/ArrowFunctionExpression
/// nodes and checks if their bodies contain a VariableDeclaration with the given name.
///
/// This is used to detect if a component-level constant is being shadowed by a local variable.
fn has_shadowing_declaration_in_path(
    js_path: &[super::super::JsPathEntry],
    name: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    // Walk the path from innermost to outermost
    for node in js_path.iter().rev() {
        let node_type = node.get_type_str();

        match node_type {
            Some("FunctionDeclaration")
            | Some("FunctionExpression")
            | Some("ArrowFunctionExpression") => {
                // Non-function ancestors never leave the cheap `get_type_str()`
                // path above; a function ancestor resolves its body and params
                // through the arena, so it is not serialized into a
                // `serde_json::Value` either.
                if let Some(js_node) = node.as_js_node()
                    && function_declares_name_node(js_node, name, arena)
                {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Typed mirror of the function-ancestor check above: body first, then params.
fn function_declares_name_node(
    func: &JsNode,
    name: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    let (params, body) = match func {
        JsNode::FunctionDeclaration { params, body, .. }
        | JsNode::FunctionExpression { params, body, .. } => (*params, *body),
        JsNode::ArrowFunctionExpression { params, body, .. } => (*params, Some(*body)),
        _ => return false,
    };

    if let Some(body) = body
        && has_variable_declaration_node(arena.get_js_node(body), name, arena)
    {
        return true;
    }
    for param in arena.get_js_children(params) {
        if pattern_declares_name_node(param, name, arena) {
            return true;
        }
    }
    false
}

/// Typed mirror of `has_variable_declaration`: only a block body can declare
/// anything (an arrow with an expression body cannot).
fn has_variable_declaration_node(
    body: &JsNode,
    name: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    match body {
        JsNode::BlockStatement { body, .. } => arena
            .get_js_children(*body)
            .iter()
            .any(|stmt| statement_declares_name_node(stmt, name, arena)),
        _ => false,
    }
}

/// Typed mirror of `statement_declares_name`.
///
/// The JSON version reaches only the fields named below, so this one does too —
/// notably it does NOT look at a `for` statement's `init` or a `for…of`/`for…in`
/// `left`, which means `for (let x = …)` does not count as a shadowing
/// declaration. That is existing behaviour and is preserved deliberately.
fn statement_declares_name_node(
    stmt: &JsNode,
    name: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    let walk = |id: crate::ast::arena::JsNodeId| {
        statement_declares_name_node(arena.get_js_node(id), name, arena)
    };
    let walk_opt = |id: &Option<crate::ast::arena::JsNodeId>| id.is_some_and(&walk);

    match stmt {
        // Only `let` / `var` shadow; `const` does not.
        JsNode::VariableDeclaration {
            declarations, kind, ..
        } => {
            (kind.as_str() == "let" || kind.as_str() == "var")
                && arena.get_js_children(*declarations).iter().any(|decl| {
                    matches!(decl, JsNode::VariableDeclarator { id, .. }
                        if pattern_declares_name_node(arena.get_js_node(*id), name, arena))
                })
        }

        // A named function declaration binds its own name, but its body is a
        // different scope and is not descended into.
        JsNode::FunctionDeclaration { id, .. } => id.is_some_and(|id| {
            matches!(arena.get_js_node(id), JsNode::Identifier { name: n, .. } if n.as_str() == name)
        }),

        JsNode::BlockStatement { body, .. } => arena
            .get_js_children(*body)
            .iter()
            .any(|s| statement_declares_name_node(s, name, arena)),

        JsNode::IfStatement {
            consequent,
            alternate,
            ..
        } => walk(*consequent) || walk_opt(alternate),

        JsNode::ForStatement { body, .. }
        | JsNode::ForInStatement { body, .. }
        | JsNode::ForOfStatement { body, .. }
        | JsNode::WhileStatement { body, .. }
        | JsNode::DoWhileStatement { body, .. } => walk(*body),

        JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } => {
            if walk(*block) {
                return true;
            }
            if let Some(handler) = handler
                && let JsNode::CatchClause { body, .. } = arena.get_js_node(*handler)
                && walk(*body)
            {
                return true;
            }
            walk_opt(finalizer)
        }

        JsNode::SwitchStatement { cases, .. } => {
            arena.get_js_children(*cases).iter().any(|case| {
                matches!(case, JsNode::SwitchCase { consequent, .. }
                    if arena
                        .get_js_children(*consequent)
                        .iter()
                        .any(|s| statement_declares_name_node(s, name, arena)))
            })
        }

        _ => false,
    }
}

/// Typed mirror of `pattern_declares_name`.
fn pattern_declares_name_node(
    pattern: &JsNode,
    name: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    match pattern {
        JsNode::Identifier { name: n, .. } => n.as_str() == name,
        // Only a `Property`'s value is inspected, matching the JSON version's
        // `prop.get("value")` (a `{ ...rest }` entry has no `value` key).
        JsNode::ObjectPattern { properties, .. } => {
            arena.get_js_children(*properties).iter().any(|prop| {
                matches!(prop, JsNode::Property { value, .. }
                    if pattern_declares_name_node(arena.get_js_node(*value), name, arena))
            })
        }
        JsNode::ArrayPattern { elements, .. } => elements
            .iter()
            .flatten()
            .any(|elem| pattern_declares_name_node(elem, name, arena)),
        JsNode::AssignmentPattern { left, .. } => {
            pattern_declares_name_node(arena.get_js_node(*left), name, arena)
        }
        JsNode::RestElement { argument, .. } => {
            pattern_declares_name_node(arena.get_js_node(*argument), name, arena)
        }
        _ => false,
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
fn get_parent(path: &[super::super::JsPathEntry], at: isize) -> Option<&super::super::JsPathEntry> {
    let len = path.len() as isize;
    let index = if at < 0 { len + at } else { at };

    if index < 0 || index >= len {
        return None;
    }

    let node = &path[index as usize];

    // Skip TypeScript wrapper nodes
    match node.get_type_str() {
        Some("TSNonNullExpression") | Some("TSAsExpression") => {
            // Get the next node in the appropriate direction
            let next_index = if at < 0 { at - 1 } else { at + 1 };
            get_parent(path, next_index)
        }
        _ => Some(node),
    }
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
    // Only the second char matters — collecting `source[start..]` into a
    // `Vec<char>` (the previous implementation) allocates ~4 bytes per
    // byte of remaining source for every tag opening. On template-heavy
    // input that single hot-path accounts for ~33% of phase-2 analyze
    // self time (jemalloc dominated by `Vec::from_iter`).
    if start + 1 < source.len() {
        let mut chars = source[start..].chars();
        chars.next();
        if let Some(second) = chars.next()
            && second != expected
        {
            // avoid a sea of red and only mark the first few characters
            return Err(errors::block_unexpected_character(&expected.to_string())
                .at(start as u32, start as u32 + 5));
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
            return Ok(Some(warnings::block_empty().at(text.start, text.end)));
        }
    }
    Ok(None)
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

/// Check if the current context is inside an element.
pub fn is_inside_element(context: &VisitorContext) -> bool {
    context.path.iter().any(|node| {
        matches!(
            node,
            TemplateNode::RegularElement(_) | TemplateNode::SvelteElement(_)
        )
    })
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

/// Check if an Identifier node is a reference, using typed `JsPathEntry` accessors.
///
/// This is a specialized version of `is_reference` for Identifier nodes that avoids
/// converting `JsPathEntry` to `Value`. It uses `get_type_str()`, `get_field_bool()`,
/// and position-based child field comparison.
///
/// `ident_start` is the `start` position of the Identifier node.
pub fn is_reference_for_identifier_typed(
    ident_start: u32,
    parent: Option<&super::super::JsPathEntry>,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    let parent = match parent {
        Some(p) => p,
        None => return true,
    };

    let parent_type = parent.get_type_str();

    match parent_type {
        // Disregard `bar` in `foo.bar`
        Some("MemberExpression") => {
            let computed = parent.get_field_bool("computed").unwrap_or(false);
            if computed {
                return true;
            }
            // Check if identifier is the object (not the property)
            parent
                .get_child_field_start("object", arena)
                .is_some_and(|obj_start| ident_start == obj_start)
        }

        // Disregard the `foo` in `class {foo(){}}` but keep it in `class {[foo](){}}`
        Some("MethodDefinition") => parent.get_field_bool("computed").unwrap_or(false),

        // Disregard the `meta` in `import.meta`
        Some("MetaProperty") => parent
            .get_child_field_start("meta", arena)
            .is_some_and(|meta_start| ident_start == meta_start),

        // Disregard the `foo` in `class {foo=bar}` but keep in `class {[foo]=bar}` and `class {bar=foo}`
        Some("PropertyDefinition") => {
            let computed = parent.get_field_bool("computed").unwrap_or(false);
            if computed {
                return true;
            }
            // Check if identifier is the value (not the key)
            parent
                .get_child_field_start("value", arena)
                .is_some_and(|val_start| ident_start == val_start)
        }

        // Disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
        Some("Property") => {
            let computed = parent.get_field_bool("computed").unwrap_or(false);
            if computed {
                return true;
            }
            // Check if identifier is the value (not the key)
            parent
                .get_child_field_start("value", arena)
                .is_some_and(|val_start| ident_start == val_start)
        }

        // Disregard the `bar` in `export { foo as bar }` or
        // the foo in `import { foo as bar }`
        Some("ExportSpecifier") | Some("ImportSpecifier") => parent
            .get_child_field_start("local", arena)
            .is_some_and(|local_start| ident_start == local_start),

        // Disregard the `foo` in `foo: while (...) { ... break foo; ... continue foo;}`
        Some("LabeledStatement") | Some("BreakStatement") | Some("ContinueStatement") => false,

        // Default: it's a reference
        _ => true,
    }
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
/// Get the leftmost identifier name from a MemberExpression chain.
/// Returns None if the base is not an Identifier. Corresponds to `object` in ast.js.
pub fn object_node(expression: &JsNode, arena: &crate::ast::arena::ParseArena) -> Option<String> {
    let mut current = expression;
    while let JsNode::MemberExpression { object, .. } = current {
        current = arena.get_js_node(*object);
    }
    if let JsNode::Identifier { name, .. } = current {
        Some(name.to_string())
    } else {
        None
    }
}

/// Extracts the name from an Identifier, PrivateIdentifier, or Literal node.
fn get_name_node(node: &JsNode) -> Option<String> {
    match node {
        JsNode::Literal { value, .. } => match value {
            LiteralValue::String(s) => Some(s.to_string()),
            LiteralValue::Number(n) => Some(n.to_string()),
            LiteralValue::Bool(b) => Some(b.to_string()),
            LiteralValue::Null => Some("null".to_string()),
            LiteralValue::Regex(r) => Some(format!("/{}/{}", r.pattern, r.flags)),
        },
        JsNode::PrivateIdentifier { name, .. } => Some(format!("#{}", name)),
        JsNode::Identifier { name, .. } => Some(name.to_string()),
        _ => None,
    }
}

/// Get the global keypath for an expression (e.g., "$state", "$derived.by", "$effect.tracking").
fn get_global_keypath_node(
    node: &JsNode,
    scope: &Scope,
    arena: &crate::ast::arena::ParseArena,
) -> Option<String> {
    match node {
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            if *computed {
                return None;
            }
            // Property must be Identifier
            let prop_node = arena.get_js_node(*property);
            let property_name = match prop_node {
                JsNode::Identifier { name, .. } => name.as_str(),
                _ => return None,
            };

            // Recurse on object, then append .property
            let obj_node = arena.get_js_node(*object);
            let mut base = get_global_keypath_node(obj_node, scope, arena)?;
            base.push('.');
            base.push_str(property_name);
            Some(base)
        }
        JsNode::CallExpression { callee, .. } => {
            // For CallExpression, check if callee is an Identifier
            if let JsNode::Identifier { name, .. } = arena.get_js_node(*callee) {
                if scope.declarations.contains_key(name.as_str()) {
                    return None;
                }
                let mut result = String::with_capacity(name.len() + 2);
                result.push_str(name);
                result.push_str("()");
                Some(result)
            } else {
                None
            }
        }
        JsNode::Identifier { name, .. } => {
            if scope.declarations.contains_key(name.as_str()) {
                None
            } else {
                Some(name.to_string())
            }
        }
        _ => None,
    }
}

/// Get the rune name from a CallExpression node, if it's a rune call.
pub fn get_rune_from_node(
    node: &JsNode,
    scope: &Scope,
    arena: &crate::ast::arena::ParseArena,
) -> Option<String> {
    match node {
        JsNode::CallExpression { callee, .. } => {
            let callee_node = arena.get_js_node(*callee);
            let keypath = get_global_keypath_node(callee_node, scope, arena)?;
            if !super::function::is_rune(&keypath) {
                return None;
            }
            Some(keypath)
        }
        _ => None,
    }
}

/// Check if an expression is pure (has no side effects).
pub fn is_pure_node(node: &JsNode, context: &VisitorContext) -> bool {
    let arena = context.parse_arena;
    match node {
        JsNode::Literal { .. } => true,
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            if !is_pure_node(arena.get_js_node(*callee), context) {
                return false;
            }
            for arg in arena.get_js_children(*arguments) {
                let arg_to_check = match arg {
                    JsNode::SpreadElement { argument, .. } => arena.get_js_node(*argument),
                    other => other,
                };
                if !is_pure_node(arg_to_check, context) {
                    return false;
                }
            }
            true
        }
        JsNode::Identifier { name, .. } => {
            // Check if it's $effect.tracking (not pure) - not applicable for bare Identifier
            // Check if base is a global (no binding means safe)
            let binding = context.analysis.root.find_binding_any_scope(name.as_str());
            binding.is_none()
        }
        JsNode::MemberExpression { object, .. } => {
            // Check if it's $effect.tracking (not pure)
            if let Some(keypath) =
                get_global_keypath_node(node, &context.analysis.root.scope, arena)
                && keypath == "$effect.tracking"
            {
                return false;
            }

            // Navigate to the leftmost node
            let mut left: &JsNode = arena.get_js_node(*object);
            while let JsNode::MemberExpression {
                object: inner_obj, ..
            } = left
            {
                left = arena.get_js_node(*inner_obj);
            }

            if let JsNode::Identifier { name, .. } = left {
                let binding = context.analysis.root.find_binding_any_scope(name.as_str());
                binding.is_none()
            } else {
                is_pure_node(left, context)
            }
        }
        _ => false,
    }
}

/// Check if an identifier expression is "safe" (doesn't require component context).
///
/// A "safe" identifier means the `foo` in `foo.bar` or `foo()` will not call
/// functions that require component context to exist.
pub fn is_safe_identifier_node(expression: &JsNode, context: &VisitorContext) -> bool {
    let arena = context.parse_arena;
    // Navigate to the base identifier through MemberExpression chain
    let mut node = expression;
    while let JsNode::MemberExpression { object, .. } = node {
        node = arena.get_js_node(*object);
    }

    // Must be an Identifier at the base
    match node {
        JsNode::Identifier { name, .. } => is_safe_identifier_name(name.as_str(), context),
        _ => false,
    }
}

/// Binding half of `is_safe_identifier_node`: a `$store` subscription inherits
/// the safety of the store binding it desugars to.
fn is_safe_identifier_name(name: &str, context: &VisitorContext) -> bool {
    // Use the current scope so function parameters correctly shadow props.
    let binding_idx = if context.scope > 0 {
        context.analysis.root.get_binding(name, context.scope)
    } else {
        context.analysis.root.find_binding_any_scope(name)
    };
    let binding = match binding_idx {
        Some(idx) => &context.analysis.root.bindings[idx],
        None => return true, // No binding means it's a global, which is safe
    };

    if binding.kind == BindingKind::StoreSub
        && let Some(store_name) = name.strip_prefix('$')
        && context
            .analysis
            .root
            .scope
            .declarations
            .contains_key(store_name)
    {
        return is_safe_identifier_name(store_name, context);
    }

    // Safe if it's not an import, prop, bindable_prop, or rest_prop
    binding.declaration_kind != DeclarationKind::Import
        && !matches!(
            binding.kind,
            BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
        )
}

/// Reject assignments to `const` bindings. Corresponds to
/// `validate_no_const_assignment` in utils.js.
pub fn validate_no_const_assignment_node(
    node_span: (u32, u32),
    argument: &JsNode,
    context: &VisitorContext,
    is_binding: bool,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match argument {
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                validate_no_const_assignment_node(node_span, elem, context, is_binding)?;
            }
        }
        JsNode::ObjectPattern { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                match property {
                    JsNode::Property { value, .. } => {
                        validate_no_const_assignment_node(
                            node_span,
                            arena.get_js_node(*value),
                            context,
                            is_binding,
                        )?;
                    }
                    JsNode::RestElement { argument, .. } => {
                        validate_no_const_assignment_node(
                            node_span,
                            arena.get_js_node(*argument),
                            context,
                            is_binding,
                        )?;
                    }
                    _ => {}
                }
            }
        }
        JsNode::Identifier { name, .. } => {
            let binding_idx = context
                .analysis
                .root
                .get_binding(name, context.scope)
                .or_else(|| {
                    let instance_scope_idx = context.analysis.root.instance_scope_index;
                    if instance_scope_idx > 0 {
                        context.analysis.root.get_binding(name, instance_scope_idx)
                    } else {
                        None
                    }
                })
                .or_else(|| {
                    context
                        .analysis
                        .root
                        .scope
                        .declarations
                        .get(name.as_str())
                        .copied()
                });

            if let Some(idx) = binding_idx {
                let binding = &context.analysis.root.bindings[idx];

                if binding.kind == BindingKind::SnippetParam {
                    return Err(errors::snippet_parameter_assignment());
                }

                if context.function_depth > 1 {
                    let has_local_shadowing = has_shadowing_declaration_in_path(
                        &context.js_path,
                        name,
                        context.parse_arena,
                    );
                    if has_local_shadowing {
                        return Ok(());
                    }
                }

                if binding.declaration_kind == DeclarationKind::Import
                    || (binding.declaration_kind == DeclarationKind::Const
                        && binding.kind != BindingKind::EachItem)
                {
                    let thing = if binding.declaration_kind == DeclarationKind::Import {
                        "import"
                    } else {
                        "constant"
                    };

                    let error = if is_binding {
                        errors::constant_binding(thing)
                    } else {
                        errors::constant_assignment(thing)
                    };
                    return Err(error.at(node_span.0, node_span.1));
                }
            }
        }
        _ => {}
    }

    Ok(())
}

/// Validate an assignment / update target. Corresponds to `validate_assignment`
/// in utils.js.
pub fn validate_assignment_node(
    node_span: (u32, u32),
    argument: &JsNode,
    context: &VisitorContext,
    is_bind_directive: bool,
) -> Result<(), AnalysisError> {
    validate_no_const_assignment_node(node_span, argument, context, is_bind_directive)?;

    // Handle Identifier assignments
    if let Some(name) = argument.name() {
        let binding_idx = context
            .analysis
            .root
            .get_binding(name, context.scope)
            .or_else(|| context.analysis.root.find_binding_any_scope(name));

        if let Some(binding_idx) = binding_idx {
            let binding = &context.analysis.root.bindings[binding_idx];

            if context.analysis.runes
                && let Some(ref props_id) = context.analysis.props_id
                && &binding.name == props_id
            {
                return Err(errors::constant_assignment("$props.id()").at(node_span.0, node_span.1));
            }

            // See the matching guard in `validate_assignment`: only fire the
            // each-item error when the binding is lexically visible from the
            // assignment site, so root-scope pollution can't misresolve a
            // same-named local (e.g. a `for`-loop variable inside a
            // `$derived.by` callback) to a template each item.
            if context.analysis.runes
                && binding.kind == BindingKind::EachItem
                && context
                    .analysis
                    .root
                    .is_scope_ancestor_of(binding.scope_index, context.scope)
            {
                return Err(errors::each_item_invalid_assignment());
            }

            if matches!(binding.kind, BindingKind::SnippetParam) {
                return Err(errors::snippet_parameter_assignment());
            }
        }
    }

    let arena = context.parse_arena;

    // Handle MemberExpression with 'this' (state field assignments)
    if let JsNode::MemberExpression {
        object,
        property,
        computed,
        ..
    } = argument
        && matches!(arena.get_js_node(*object), JsNode::ThisExpression { .. })
    {
        let prop_node = arena.get_js_node(*property);
        let name = if *computed && !matches!(prop_node, JsNode::Literal { .. }) {
            None
        } else {
            get_name_node(prop_node)
        };

        if let Some(ref field_name) = name
            && let Some(field) = context.state_fields.get(field_name)
            && field.node.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression")
        {
            let mut i = context.js_path.len();
            while i > 0 {
                i -= 1;
                let parent = &context.js_path[i];
                let parent_type = parent.get_type_str();

                if matches!(
                    parent_type,
                    Some("FunctionDeclaration")
                        | Some("FunctionExpression")
                        | Some("ArrowFunctionExpression")
                ) {
                    if let Some(grandparent) = get_parent(&context.js_path, (i as isize) - 1)
                        && grandparent.get_type_str() == Some("MethodDefinition")
                        && grandparent.get_field_str("kind") == Some("constructor")
                    {
                        let node_start = argument.start();
                        let field_start = field
                            .node
                            .get("start")
                            .and_then(|s| s.as_u64())
                            .map(|n| n as u32);

                        if let (Some(ns), Some(fs)) = (node_start, field_start)
                            && ns < fs
                        {
                            return Err(errors::state_field_invalid_assignment()
                                .at(node_span.0, node_span.1));
                        }
                    }
                    break;
                }
            }
        }
    }

    Ok(())
}

/// Extract all identifier names from a pattern.
pub fn extract_identifiers_node(
    pattern: &JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> Vec<String> {
    let mut names = Vec::new();

    match pattern {
        JsNode::Identifier { name, .. } => {
            names.push(name.to_string());
        }
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                names.extend(extract_identifiers_node(elem, arena));
            }
        }
        JsNode::ObjectPattern { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                if let Some(value_id) = property.value_node() {
                    names.extend(extract_identifiers_node(arena.get_js_node(value_id), arena));
                }
                // Handle RestElement in object pattern
                if let JsNode::RestElement { argument, .. } = property {
                    names.extend(extract_identifiers_node(
                        arena.get_js_node(*argument),
                        arena,
                    ));
                }
            }
        }
        JsNode::AssignmentPattern { left, .. } => {
            names.extend(extract_identifiers_node(arena.get_js_node(*left), arena));
        }
        JsNode::RestElement { argument, .. } => {
            names.extend(extract_identifiers_node(
                arena.get_js_node(*argument),
                arena,
            ));
        }
        _ => {}
    }

    names
}

/// Collect all identifier names from a pattern (identifier, object, array, rest, assignment).
pub fn collect_all_identifier_names_from_pattern_node(
    pattern: &JsNode,
    names: &mut Vec<String>,
    arena: &crate::ast::arena::ParseArena,
) {
    match pattern {
        JsNode::Identifier { name, .. } => {
            names.push(name.to_string());
        }
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::RestElement { argument, .. } => {
                        collect_all_identifier_names_from_pattern_node(
                            arena.get_js_node(*argument),
                            names,
                            arena,
                        );
                    }
                    JsNode::Property { value, .. } => {
                        collect_all_identifier_names_from_pattern_node(
                            arena.get_js_node(*value),
                            names,
                            arena,
                        );
                    }
                    _ => {}
                }
            }
        }
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                collect_all_identifier_names_from_pattern_node(elem, names, arena);
            }
        }
        JsNode::AssignmentPattern { left, .. } => {
            collect_all_identifier_names_from_pattern_node(arena.get_js_node(*left), names, arena);
        }
        JsNode::RestElement { argument, .. } => {
            collect_all_identifier_names_from_pattern_node(
                arena.get_js_node(*argument),
                names,
                arena,
            );
        }
        _ => {}
    }
}

/// Get the rune name from a callee expression, if it's a rune call.
fn get_rune_name_node(callee: &JsNode, context: &VisitorContext) -> Option<String> {
    let arena = context.parse_arena;
    match callee {
        JsNode::Identifier { name, .. } => {
            if super::function::is_rune(name)
                && !context
                    .analysis
                    .root
                    .scope
                    .declarations
                    .contains_key(name.as_str())
            {
                return Some(name.to_string());
            }
            None
        }
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            if *computed {
                return None;
            }
            let obj_name = match arena.get_js_node(*object) {
                JsNode::Identifier { name, .. } => name.as_str(),
                _ => return None,
            };
            let prop_name = match arena.get_js_node(*property) {
                JsNode::Identifier { name, .. } => name.as_str(),
                _ => return None,
            };
            let full_name = format!("{}.{}", obj_name, prop_name);
            if super::function::is_rune(&full_name)
                && !context
                    .analysis
                    .root
                    .scope
                    .declarations
                    .contains_key(obj_name)
            {
                return Some(full_name);
            }
            None
        }
        _ => None,
    }
}

/// Visit a JavaScript expression (typed JsNode) and track identifier references.
pub fn walk_js_expression_node(
    expression: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match expression {
        JsNode::Identifier {
            name, start, end, ..
        } => {
            // Handle legacy mode special variables
            if !context.analysis.runes {
                if name == "$$props" {
                    context.analysis.uses_props = true;
                }
                if name == "$$restProps" {
                    context.analysis.uses_rest_props = true;
                }
            }
            if name == "$$slots" {
                context.analysis.uses_slots = true;
            }

            // Bare `$` and `$$xxx` (other than the reserved `$$props` /
            // `$$restProps` / `$$slots`) are illegal as variable names.
            // Mirrors `visit_identifier_inner` for the JS-side identifier
            // visitor, but we re-check here because template
            // ExpressionTags walk straight through `walk_js_expression_node`
            // and never hit the JS identifier visitor.
            if name == "$"
                || (name.starts_with("$$")
                    && name != "$$props"
                    && name != "$$restProps"
                    && name != "$$slots")
            {
                return Err(
                    super::super::super::errors::global_reference_invalid(name).at(*start, *end)
                );
            }

            // Check for store scoped subscription errors
            if name.starts_with('$') && !name.starts_with("$$") && name != "$" {
                let store_name = &name[1..];
                if !store_name.is_empty()
                    && !super::function::is_rune(name)
                    && context.function_depth > 0
                    && let Some(&binding_idx) =
                        context.analysis.root.scope.declarations.get(store_name)
                {
                    let binding = &context.analysis.root.bindings[binding_idx];
                    // Compare against the real instance scope index, not a hardcoded `1`:
                    // a function declaration in `<script context="module">` shifts the
                    // instance scope deeper, so a hardcoded `1` would treat an
                    // instance-scope store as nested (false-positive
                    // `store_invalid_scoped_subscription`). Mirrors upstream's
                    // `owner !== instance.scope` check. See the matching guard in
                    // `walk_js_expression`.
                    let instance_scope = context.analysis.root.instance_scope_index;
                    if binding.scope_index > instance_scope
                        && binding.scope_index <= context.function_depth + instance_scope
                    {
                        return Err(
                            super::super::super::errors::store_invalid_scoped_subscription(),
                        );
                    }
                }
            }

            // Look up binding
            if let Some(binding_idx) = context
                .analysis
                .root
                .get_binding(name, context.scope)
                .or_else(|| context.analysis.root.find_binding_any_scope(name))
            {
                let is_template_reference =
                    matches!(context.ast_type, super::super::AstType::Template);
                context.analysis.root.bindings[binding_idx].add_reference(
                    *start,
                    *end,
                    is_template_reference,
                    false,
                    false,
                );

                if is_template_reference && context.function_depth == 0 {
                    context.analysis.root.bindings[binding_idx].has_direct_template_read = true;
                }

                let binding = &context.analysis.root.bindings[binding_idx];
                // Skip references in runes mode - only used by legacy build_expression
                if !context.analysis.runes {
                    metadata.references.insert(binding_idx);
                }

                if matches!(
                    binding.kind,
                    BindingKind::State | BindingKind::RawState | BindingKind::Derived
                ) {
                    metadata.set_has_state(true);
                }

                metadata.dependencies.insert(binding_idx);

                // Mirror `Identifier.js` L162-191: a `{@const}` binding cannot
                // be referenced from inside a named snippet declared at the
                // same level when `experimental.async` is on. The JS-side
                // identifier visitor performs this check for script
                // identifiers; template expression tags walk through here
                // and never hit it, so re-run the check.
                if binding.kind == BindingKind::Template && context.analysis.experimental_async {
                    super::super::identifier::check_const_tag_snippet_reference_public(
                        name.as_str(),
                        binding_idx,
                        context,
                    )?;
                }
            }
        }
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            metadata.set_has_member_expression(true);

            if !is_pure_node(expression, context) {
                metadata.set_has_state(true);
            }

            if !is_safe_identifier_node(expression, context) {
                context.analysis.needs_context = true;
            }

            // Legacy mode $$props/$$restProps check
            if !context.analysis.runes {
                let mut base: &JsNode = expression;
                while let JsNode::MemberExpression { object: obj, .. } = base {
                    base = arena.get_js_node(*obj);
                }
                if let JsNode::Identifier { name, .. } = base
                    && (name == "$$props" || name == "$$restProps")
                {
                    context.analysis.needs_context = true;
                }
            }

            // Recursively visit object and property
            walk_js_expression_node(arena.get_js_node(*object), context, metadata)?;
            if *computed {
                walk_js_expression_node(arena.get_js_node(*property), context, metadata)?;
            }
        }
        JsNode::CallExpression {
            callee,
            arguments,
            start,
            end,
            ..
        } => {
            let callee_node = arena.get_js_node(*callee);
            let rune_name = get_rune_name_node(callee_node, context);

            if let Some(ref rn) = rune_name
                && matches!(
                    rn.as_str(),
                    "$state" | "$state.raw" | "$derived" | "$derived.by"
                )
                && context.in_const_tag
            {
                return Err(errors::state_invalid_placement(rn).at(*start, *end));
            }

            if rune_name.is_none() && !is_safe_identifier_node(callee_node, context) {
                context.analysis.needs_context = true;
            }

            // `$effect` / `$effect.pre` always need the component context
            // (upstream CallExpression.js cases `$effect`/`$effect.pre` →
            // `needs_context = true`). This matters for a rune used only inside
            // a template directive (e.g. `{@attach … $effect(…)}`), which would
            // otherwise leave the component without its `$.push`/`$.pop`.
            if let Some(ref rn) = rune_name
                && matches!(rn.as_str(), "$effect" | "$effect.pre")
            {
                context.analysis.needs_context = true;
            }

            walk_js_expression_node(callee_node, context, metadata)?;
            for arg in arena.get_js_children(*arguments) {
                walk_js_expression_node(arg, context, metadata)?;
            }

            let callee_is_pure = is_pure_node(callee_node, context);
            if !callee_is_pure || !metadata.dependencies.is_empty() {
                metadata.set_has_call(true);
                metadata.set_has_state(true);
            }
        }
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            walk_js_expression_node(arena.get_js_node(*left), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*right), context, metadata)?;
        }
        JsNode::UnaryExpression { argument, .. } => {
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        JsNode::AwaitExpression { argument, .. } => {
            metadata.set_has_await(true);
            // See the `Some("AwaitExpression")` arm in `walk_js_expression` —
            // mirrors upstream AwaitExpression.js L26-42 (suspend gate).
            validate_template_await(context, expression)?;
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        JsNode::UpdateExpression {
            argument,
            start,
            end,
            ..
        } => {
            let arg_node = arena.get_js_node(*argument);
            validate_assignment_node((*start, *end), arg_node, context, false)?;
            walk_js_expression_node(arg_node, context, metadata)?;
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*test), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*consequent), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*alternate), context, metadata)?;
        }
        JsNode::ArrayExpression { elements, .. } => {
            for elem in elements.iter().flatten() {
                walk_js_expression_node(elem, context, metadata)?;
            }
        }
        JsNode::ObjectExpression { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                if let Some(value_id) = property.value_node() {
                    walk_js_expression_node(arena.get_js_node(value_id), context, metadata)?;
                }
                if let Some(key_id) = property.key()
                    && property.computed()
                {
                    walk_js_expression_node(arena.get_js_node(key_id), context, metadata)?;
                }
                // Handle SpreadElement in object (rest/spread). Like the
                // top-level SpreadElement arm, a spread marks the enclosing
                // expression `has_call` + `has_state` (upstream SpreadElement.js).
                if let JsNode::SpreadElement { argument, .. } = property {
                    metadata.set_has_call(true);
                    metadata.set_has_state(true);
                    walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
                }
            }
        }
        JsNode::SequenceExpression { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                walk_js_expression_node(expr, context, metadata)?;
            }
        }
        JsNode::AssignmentExpression {
            left,
            right,
            start,
            end,
            ..
        } => {
            let left_node = arena.get_js_node(*left);
            let right_node = arena.get_js_node(*right);
            validate_assignment_node((*start, *end), left_node, context, false)?;
            super::super::assignment_expression::mark_binding_mutation_node(left_node, context);
            walk_js_expression_node(left_node, context, metadata)?;
            walk_js_expression_node(right_node, context, metadata)?;
            metadata.set_has_assignment(true);
        }
        JsNode::ArrowFunctionExpression { params, body, .. }
        | JsNode::FunctionExpression {
            params,
            body: Some(body),
            ..
        }
        | JsNode::FunctionDeclaration {
            params,
            body: Some(body),
            ..
        } => {
            context.function_depth += 1;

            let decl_undo_mark = context.decl_undo_log.len();

            let saved_scope = context.scope;
            let temp_scope_idx = context.analysis.root.all_scopes.len();
            let temp_scope =
                crate::compiler::phases::phase2_analyze::scope::Scope::new(Some(context.scope));
            context.analysis.root.all_scopes.push(temp_scope);
            context.scope = temp_scope_idx;

            // Register parameters
            for param in arena.get_js_children(*params) {
                let mut param_names = Vec::new();
                collect_all_identifier_names_from_pattern_node(param, &mut param_names, arena);

                for param_name in param_names {
                    let temp_binding =
                        crate::compiler::phases::phase2_analyze::Binding::with_declaration_kind(
                            param_name.clone(),
                            crate::compiler::phases::phase2_analyze::BindingKind::Normal,
                            crate::compiler::phases::phase2_analyze::DeclarationKind::Param,
                            context.function_depth + 1,
                        );
                    let temp_binding_idx = context.analysis.root.push_binding(temp_binding);

                    context.analysis.root.all_scopes[temp_scope_idx]
                        .declarations
                        .insert(param_name.clone(), temp_binding_idx);

                    let prev = context
                        .analysis
                        .root
                        .scope
                        .declarations
                        .insert(param_name.clone(), temp_binding_idx);
                    context.decl_undo_log.push((param_name, prev));
                }
            }

            let saved_in_template_function = context.in_template_function;
            context.in_template_function = true;
            for param in arena.get_js_children(*params) {
                walk_parameter_evaluations(param, context, metadata)?;
            }

            let saved_expression = context.expression;
            context.expression = None;
            // Awaits inside a function body are not suspending (upstream sets
            // `expression: null` on function entry — function.js L19-23).
            // Visit function body
            let mut inner_metadata = crate::ast::template::ExpressionMetadata::default();
            walk_js_expression_node(arena.get_js_node(*body), context, &mut inner_metadata)?;

            // Propagate references and has_state, but NOT dependencies.
            //
            // Upstream's `visit_function` (2-analyze/visitors/shared/function.js)
            // enters function bodies with `context.next({ ..., expression: null })`,
            // so identifiers referenced *inside* a nested function never get added
            // to the enclosing expression's `dependencies` (Identifier.js only adds
            // when `context.state.expression` is non-null). Propagating
            // `inner_metadata.dependencies` here over-collects — in particular it
            // pulls in a callback parameter that *shadows* an each-block item
            // (e.g. `items.filter((item) => …)`), which wrongly flips
            // EACH_ITEM_REACTIVE on. References and has_state are still propagated
            // to preserve existing reactivity behaviour for captured outer state.
            if !context.analysis.runes {
                for ref_idx in &inner_metadata.references {
                    metadata.references.insert(*ref_idx);
                }
            }
            if inner_metadata.has_state() {
                metadata.set_has_state(true);
            }

            context.in_template_function = saved_in_template_function;
            context.expression = saved_expression;
            context.scope = saved_scope;
            while context.decl_undo_log.len() > decl_undo_mark {
                let (name, prev) = context.decl_undo_log.pop().unwrap();
                match prev {
                    Some(idx) => {
                        context.analysis.root.scope.declarations.insert(name, idx);
                    }
                    None => {
                        context.analysis.root.scope.declarations.remove(&name);
                    }
                }
            }
            context.function_depth -= 1;
        }
        JsNode::FunctionExpression { body: None, .. }
        | JsNode::FunctionDeclaration { body: None, .. } => {
            // No body - nothing to walk
        }
        JsNode::BlockStatement { body, .. } => {
            for stmt in arena.get_js_children(*body) {
                walk_js_statement_node(stmt, context, metadata)?;
            }
        }
        JsNode::ExpressionStatement {
            expression: expr, ..
        } => {
            walk_js_expression_node(arena.get_js_node(*expr), context, metadata)?;
        }
        JsNode::SpreadElement { argument, .. } => {
            // Mirrors upstream's SpreadElement analyze visitor: `[...x]` is
            // treated like `[...x.values()]`, whose result is unknown at
            // compile time, so the enclosing expression is both `has_call` and
            // `has_state`.
            metadata.set_has_call(true);
            metadata.set_has_state(true);
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        JsNode::TemplateLiteral { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                walk_js_expression_node(expr, context, metadata)?;
            }
        }
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            walk_js_expression_node(arena.get_js_node(*tag), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*quasi), context, metadata)?;
        }
        JsNode::NewExpression {
            callee, arguments, ..
        } => {
            context.analysis.needs_context = true;
            walk_js_expression_node(arena.get_js_node(*callee), context, metadata)?;
            for arg in arena.get_js_children(*arguments) {
                walk_js_expression_node(arg, context, metadata)?;
            }
        }
        JsNode::ChainExpression {
            expression: expr, ..
        } => {
            walk_js_expression_node(arena.get_js_node(*expr), context, metadata)?;
        }
        JsNode::ImportExpression { source, .. } => {
            walk_js_expression_node(arena.get_js_node(*source), context, metadata)?;
        }
        JsNode::YieldExpression {
            argument: Some(arg),
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*arg), context, metadata)?;
        }
        JsNode::YieldExpression { argument: None, .. } => {}
        // Literals and other leaf nodes - no recursion needed
        _ => {}
    }

    Ok(())
}

fn walk_parameter_evaluations(
    param: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match param {
        JsNode::AssignmentPattern { left, right, .. } => {
            walk_parameter_evaluations(arena.get_js_node(*left), context, metadata)?;
            walk_parameter_expression(arena.get_js_node(*right), context, metadata)?;
        }
        JsNode::RestElement { argument, .. } => {
            walk_parameter_evaluations(arena.get_js_node(*argument), context, metadata)?;
        }
        JsNode::ObjectPattern { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                match property {
                    JsNode::Property {
                        key,
                        value,
                        computed,
                        ..
                    } => {
                        if *computed {
                            walk_parameter_expression(arena.get_js_node(*key), context, metadata)?;
                        }
                        walk_parameter_evaluations(arena.get_js_node(*value), context, metadata)?;
                    }
                    JsNode::RestElement { argument, .. } => {
                        walk_parameter_evaluations(
                            arena.get_js_node(*argument),
                            context,
                            metadata,
                        )?;
                    }
                    _ => {}
                }
            }
        }
        JsNode::ArrayPattern { elements, .. } => {
            for element in elements.iter().flatten() {
                walk_parameter_evaluations(element, context, metadata)?;
            }
        }
        _ => {}
    }
    Ok(())
}

fn walk_parameter_expression(
    expression: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let mut evaluated = crate::ast::template::ExpressionMetadata::default();
    walk_js_expression_node(expression, context, &mut evaluated)?;
    let has_state = evaluated.has_state();
    metadata.dependencies.extend(evaluated.dependencies);
    metadata.references.extend(evaluated.references);
    if has_state {
        metadata.set_has_state(true);
    }
    Ok(())
}

/// Visit a JavaScript statement (typed JsNode) and track identifier references.
pub fn walk_js_statement_node(
    statement: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match statement {
        JsNode::ExpressionStatement { expression, .. } => {
            walk_js_expression_node(arena.get_js_node(*expression), context, metadata)?;
        }
        JsNode::ReturnStatement {
            argument: Some(arg),
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*arg), context, metadata)?;
        }
        JsNode::ReturnStatement { argument: None, .. } => {}
        JsNode::IfStatement {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*test), context, metadata)?;
            walk_js_statement_node(arena.get_js_node(*consequent), context, metadata)?;
            if let Some(alt) = alternate {
                walk_js_statement_node(arena.get_js_node(*alt), context, metadata)?;
            }
        }
        JsNode::BlockStatement { body, .. } => {
            for stmt in arena.get_js_children(*body) {
                walk_js_statement_node(stmt, context, metadata)?;
            }
        }
        JsNode::VariableDeclaration { declarations, .. } => {
            for decl in arena.get_js_children(*declarations) {
                // Walk init before registering the binding
                if let Some(init_id) = decl.init() {
                    walk_js_expression_node(arena.get_js_node(init_id), context, metadata)?;
                }

                // Register declared variables as temporary bindings
                if let Some(id_id) = decl.id() {
                    let mut names = Vec::new();
                    collect_all_identifier_names_from_pattern_node(
                        arena.get_js_node(id_id),
                        &mut names,
                        arena,
                    );
                    for name in names {
                        let temp_binding =
                            crate::compiler::phases::phase2_analyze::Binding::with_declaration_kind(
                                name.clone(),
                                crate::compiler::phases::phase2_analyze::BindingKind::Normal,
                                crate::compiler::phases::phase2_analyze::DeclarationKind::Let,
                                context.function_depth + 1,
                            );
                        let temp_binding_idx = context.analysis.root.push_binding(temp_binding);

                        if let Some(scope) = context.analysis.root.all_scopes.get_mut(context.scope)
                        {
                            scope.declarations.insert(name.clone(), temp_binding_idx);
                        }

                        let prev = context
                            .analysis
                            .root
                            .scope
                            .declarations
                            .insert(name.clone(), temp_binding_idx);
                        context.decl_undo_log.push((name, prev));
                    }
                }
            }
        }
        JsNode::ForStatement { body, .. }
        | JsNode::ForInStatement { body, .. }
        | JsNode::ForOfStatement { body, .. } => {
            walk_js_statement_node(arena.get_js_node(*body), context, metadata)?;
        }
        JsNode::WhileStatement { test, body, .. } | JsNode::DoWhileStatement { test, body, .. } => {
            walk_js_expression_node(arena.get_js_node(*test), context, metadata)?;
            walk_js_statement_node(arena.get_js_node(*body), context, metadata)?;
        }
        JsNode::FunctionDeclaration { .. } => {
            // Walk function declarations like function expressions
            walk_js_expression_node(statement, context, metadata)?;
        }
        JsNode::SwitchStatement {
            discriminant,
            cases,
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*discriminant), context, metadata)?;
            for case in arena.get_js_children(*cases) {
                if let Some(test_id) = case.test() {
                    walk_js_expression_node(arena.get_js_node(test_id), context, metadata)?;
                }
                for stmt in arena.get_js_children(case.consequent_stmts()) {
                    walk_js_statement_node(stmt, context, metadata)?;
                }
            }
        }
        JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } => {
            walk_js_statement_node(arena.get_js_node(*block), context, metadata)?;
            if let Some(handler_id) = handler {
                let handler_node = arena.get_js_node(*handler_id);
                if let Some(body_id) = handler_node.body_node() {
                    walk_js_statement_node(arena.get_js_node(body_id), context, metadata)?;
                }
            }
            if let Some(fin) = finalizer {
                walk_js_statement_node(arena.get_js_node(*fin), context, metadata)?;
            }
        }
        JsNode::ThrowStatement { argument, .. } => {
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        _ => {}
    }

    Ok(())
}
