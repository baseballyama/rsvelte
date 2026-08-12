//! CSS visitor functions for printing CSS AST nodes.
//!
//! This module contains visitor functions for each CSS AST node type.
//! Each visitor is responsible for writing the appropriate CSS source code
//! representation to the context.
//!
//! Reference: `svelte/packages/svelte/src/compiler/print/index.js` (lines 172-325)

use super::Context;
use serde_json::Value;

/// Visit a CSS node and generate appropriate code.
///
/// This function dispatches to the appropriate visitor based on the node type.
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The CSS node to visit (as JSON value)
pub fn visit_css_node(context: &mut Context, node: &Value) {
    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Atrule" => visit_atrule(context, node),
            "AttributeSelector" => visit_attribute_selector(context, node),
            "Block" => visit_block(context, node),
            "ClassSelector" => visit_class_selector(context, node),
            "ComplexSelector" => visit_complex_selector(context, node),
            "Declaration" => visit_declaration(context, node),
            "IdSelector" => visit_id_selector(context, node),
            "NestingSelector" => visit_nesting_selector(context, node),
            "Nth" => visit_nth(context, node),
            "Percentage" => visit_percentage(context, node),
            "PseudoClassSelector" => visit_pseudo_class_selector(context, node),
            "PseudoElementSelector" => visit_pseudo_element_selector(context, node),
            "RelativeSelector" => visit_relative_selector(context, node),
            "Rule" => visit_rule(context, node),
            "SelectorList" => visit_selector_list(context, node),
            "TypeSelector" => visit_type_selector(context, node),
            _ => {
                // Unknown node type, skip
            }
        }
    }
}

/// Visit an at-rule (e.g., @media, @keyframes).
///
/// Format: `@name prelude { block }` or `@name prelude;`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The Atrule node
fn visit_atrule(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        // For @font-face, the CSS parser may incorrectly parse declarations as selectors.
        // Use source text extraction as a workaround when source is available.
        if name == "font-face"
            && let Some(source) = context.source
        {
            let start = node
                .get("start")
                .and_then(|s| s.as_u64())
                .map(|n| n as usize);
            let end = node.get("end").and_then(|e| e.as_u64()).map(|n| n as usize);
            if let (Some(s), Some(e)) = (start, end)
                && s < e
                && e <= source.len()
            {
                // Extract and reformat the @font-face block from source
                let raw = &source[s..e];
                let reformatted = reformat_font_face(raw);
                context.write(&reformatted);
                return;
            }
        }

        context.write("@");
        context.write(name);

        if let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
            && !prelude.is_empty()
        {
            context.write(" ");
            context.write(prelude);
        }

        if let Some(block) = node.get("block") {
            if !block.is_null() {
                context.write(" ");
                visit_block(context, block);
            } else {
                context.write(";");
            }
        } else {
            context.write(";");
        }
    }
}

/// Reformat a @font-face block from raw source text.
fn reformat_font_face(raw: &str) -> String {
    // Parse the raw text: @font-face { declarations }
    let mut result = String::from("@font-face {");

    // Find the opening brace
    if let Some(brace_pos) = raw.find('{') {
        let inner = &raw[brace_pos + 1..];
        // Find the closing brace
        if let Some(close_pos) = inner.rfind('}') {
            let declarations_text = inner[..close_pos].trim();

            if !declarations_text.is_empty() {
                // Split by semicolons to get declarations
                for decl in declarations_text.split(';') {
                    let decl = decl.trim();
                    if !decl.is_empty() {
                        result.push_str("\n\t");
                        result.push_str(decl);
                        result.push(';');
                    }
                }
            }

            result.push_str("\n}");
        } else {
            result.push('}');
        }
    } else {
        result.push('}');
    }

    result
}

/// Visit an attribute selector (e.g., [name="value"]).
///
/// Format: `[name]`, `[name="value"]`, `[name="value" i]`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The AttributeSelector node
fn visit_attribute_selector(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write("[");
        context.write(name);

        if let Some(matcher) = node.get("matcher").and_then(|m| m.as_str()) {
            context.write(matcher);
            if let Some(value) = node.get("value").and_then(|v| v.as_str()) {
                // Value includes quotes if originally quoted
                context.write(value);

                if let Some(flags) = node.get("flags").and_then(|f| f.as_str()) {
                    context.write(" ");
                    context.write(flags);
                }
            }
        }

        context.write("]");
    }
}

/// Visit a CSS block (e.g., { ... }).
///
/// Format:
/// ```css
/// {
///   child1
///   child2
/// }
/// ```
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The Block node
fn visit_block(context: &mut Context, node: &Value) {
    context.write("{");

    if let Some(children) = node.get("children").and_then(|c| c.as_array())
        && !children.is_empty()
    {
        context.indent();
        context.newline();

        let mut started = false;

        for child in children {
            if started {
                context.newline();
            }

            visit_css_node(context, child);

            started = true;
        }

        context.dedent();
        context.newline();
    }

    context.write("}");
}

/// Visit a class selector (e.g., .class-name).
///
/// Format: `.class-name`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The ClassSelector node
fn visit_class_selector(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write(".");
        context.write(name);
    }
}

/// Visit a complex selector (e.g., a b c).
///
/// Format: Multiple relative selectors joined together
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The ComplexSelector node
fn visit_complex_selector(context: &mut Context, node: &Value) {
    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        for selector in children {
            visit_css_node(context, selector);
        }
    }
}

/// Visit a CSS declaration (e.g., property: value;).
///
/// Format: `property: value;`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The Declaration node
fn visit_declaration(context: &mut Context, node: &Value) {
    if let Some(property) = node.get("property").and_then(|p| p.as_str())
        && let Some(value) = node.get("value").and_then(|v| v.as_str())
    {
        context.write(property);
        context.write(": ");
        context.write(value);
        context.write(";");
    }
}

/// Visit an ID selector (e.g., #id).
///
/// Format: `#id`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The IdSelector node
fn visit_id_selector(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write("#");
        context.write(name);
    }
}

/// Visit a nesting selector (&).
///
/// Format: `&`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `_node` - The NestingSelector node
fn visit_nesting_selector(context: &mut Context, _node: &Value) {
    context.write("&");
}

/// Visit an nth expression (e.g., 2n+1).
///
/// Format: `2n+1`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The Nth node
fn visit_nth(context: &mut Context, node: &Value) {
    if let Some(value) = node.get("value").and_then(|v| v.as_str()) {
        context.write(value);
    }
}

/// Visit a percentage value (e.g., 50%).
///
/// Format: `50%`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The Percentage node
fn visit_percentage(context: &mut Context, node: &Value) {
    if let Some(value) = node.get("value").and_then(|v| v.as_str()) {
        // `value` already contains the trailing `%` (the parser captures the
        // `%` as part of the literal — same shape as upstream's Percentage
        // AST). Mirrors upstream commit `ca3f35bf7` which fixed
        // double-printing here.
        context.write(value);
    }
}

/// Visit a pseudo-class selector (e.g., :hover, :is()).
///
/// Format: `:name` or `:name(arg1, arg2)`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The PseudoClassSelector node
fn visit_pseudo_class_selector(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write(":");
        context.write(name);

        if let Some(args) = node.get("args")
            && !args.is_null()
        {
            context.write("(");

            if let Some(children) = args.get("children").and_then(|c| c.as_array()) {
                let mut started = false;

                for arg in children {
                    if started {
                        context.write(", ");
                    }

                    visit_css_node(context, arg);

                    started = true;
                }
            }

            context.write(")");
        }
    }
}

/// Visit a pseudo-element selector (e.g., ::before).
///
/// Format: `::name`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The PseudoElementSelector node
fn visit_pseudo_element_selector(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write("::");
        context.write(name);
    }
}

/// Visit a relative selector (e.g., > b in a > b).
///
/// Format: ` ` (descendant), ` > `, ` + `, ` ~ `, etc., followed by selectors
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The RelativeSelector node
fn visit_relative_selector(context: &mut Context, node: &Value) {
    if let Some(combinator) = node.get("combinator")
        && !combinator.is_null()
        && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
    {
        if name == " " {
            context.write(" ");
        } else {
            context.write(" ");
            context.write(name);
            context.write(" ");
        }
    }

    if let Some(selectors) = node.get("selectors").and_then(|s| s.as_array()) {
        if selectors.is_empty() {
            // Empty selectors array - try to extract from source text.
            // This happens for keyframe selectors like "50%" that the parser
            // doesn't store as typed selector nodes.
            if let Some(source) = context.source
                && let Some(s) = node
                    .get("start")
                    .and_then(|s| s.as_u64())
                    .map(|n| n as usize)
                && let Some(e) = node.get("end").and_then(|e| e.as_u64()).map(|n| n as usize)
                && s < e
                && e <= source.len()
            {
                let text = source[s..e].trim();
                context.write(text);
            }
        } else {
            for selector in selectors {
                visit_css_node(context, selector);
            }
        }
    }
}

/// Visit a CSS rule (selector + block).
///
/// Format:
/// ```css
/// selector1,
/// selector2 {
///   declarations
/// }
/// ```
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The Rule node
fn visit_rule(context: &mut Context, node: &Value) {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
    {
        let mut started = false;

        for selector in children {
            if started {
                context.write(",");
                context.newline();
            }

            visit_css_node(context, selector);
            started = true;
        }
    }

    context.write(" ");

    if let Some(block) = node.get("block") {
        visit_css_node(context, block);
    }
}

/// Visit a selector list (e.g., a, b, c).
///
/// Format: `a, b, c`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The SelectorList node
fn visit_selector_list(context: &mut Context, node: &Value) {
    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        let mut started = false;
        for selector in children {
            if started {
                context.write(", ");
            }

            visit_css_node(context, selector);
            started = true;
        }
    }
}

/// Visit a type selector (e.g., div, p).
///
/// Format: `div`
///
/// # Arguments
///
/// * `context` - The context to write to
/// * `node` - The TypeSelector node
fn visit_type_selector(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write(name);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use serde_json::json;

    #[test]
    fn test_visit_type_selector() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "TypeSelector",
            "name": "div"
        });
        visit_type_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "div");
    }

    #[test]
    fn test_visit_class_selector() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "ClassSelector",
            "name": "my-class"
        });
        visit_class_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), ".my-class");
    }

    #[test]
    fn test_visit_id_selector() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "IdSelector",
            "name": "my-id"
        });
        visit_id_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "#my-id");
    }

    #[test]
    fn test_visit_declaration() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Declaration",
            "property": "color",
            "value": "red"
        });
        visit_declaration(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "color: red;");
    }

    #[test]
    fn test_visit_attribute_selector_simple() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "AttributeSelector",
            "name": "disabled",
            "matcher": null,
            "value": null,
            "flags": null
        });
        visit_attribute_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "[disabled]");
    }

    #[test]
    fn test_visit_attribute_selector_with_value() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "AttributeSelector",
            "name": "type",
            "matcher": "=",
            "value": "\"text\"",
            "flags": null
        });
        visit_attribute_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "[type=\"text\"]");
    }

    #[test]
    fn test_visit_attribute_selector_with_flags() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "AttributeSelector",
            "name": "class",
            "matcher": "~=",
            "value": "\"btn\"",
            "flags": "i"
        });
        visit_attribute_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "[class~=\"btn\" i]");
    }

    #[test]
    fn test_visit_pseudo_class_selector_simple() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "PseudoClassSelector",
            "name": "hover",
            "args": null
        });
        visit_pseudo_class_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), ":hover");
    }

    #[test]
    fn test_visit_pseudo_element_selector() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "PseudoElementSelector",
            "name": "before"
        });
        visit_pseudo_element_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "::before");
    }

    #[test]
    fn test_visit_nesting_selector() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "NestingSelector",
            "name": "&"
        });
        visit_nesting_selector(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "&");
    }

    #[test]
    fn test_visit_percentage() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Percentage",
            "value": "50%"
        });
        visit_percentage(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "50%");
    }

    #[test]
    fn test_visit_nth() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Nth",
            "value": "2n+1"
        });
        visit_nth(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "2n+1");
    }

    #[test]
    fn test_visit_block_empty() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Block",
            "children": []
        });
        visit_block(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "{}");
    }

    #[test]
    fn test_visit_block_with_declarations() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Block",
            "children": [
                {
                    "type": "Declaration",
                    "property": "color",
                    "value": "red"
                },
                {
                    "type": "Declaration",
                    "property": "font-size",
                    "value": "16px"
                }
            ]
        });
        visit_block(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "{\n\tcolor: red;\n\tfont-size: 16px;\n}");
    }

    #[test]
    fn test_visit_atrule_without_block() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Atrule",
            "name": "import",
            "prelude": "url('style.css')",
            "block": null
        });
        visit_atrule(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "@import url('style.css');");
    }

    #[test]
    fn test_visit_atrule_with_block() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Atrule",
            "name": "media",
            "prelude": "screen and (min-width: 768px)",
            "block": {
                "type": "Block",
                "children": []
            }
        });
        visit_atrule(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "@media screen and (min-width: 768px) {}");
    }

    #[test]
    fn test_visit_simple_rule() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);
        let node = json!({
            "type": "Rule",
            "prelude": {
                "type": "SelectorList",
                "children": [
                    {
                        "type": "ComplexSelector",
                        "children": [
                            {
                                "type": "RelativeSelector",
                                "combinator": null,
                                "selectors": [
                                    {
                                        "type": "TypeSelector",
                                        "name": "div"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "block": {
                "type": "Block",
                "children": [
                    {
                        "type": "Declaration",
                        "property": "color",
                        "value": "blue"
                    }
                ]
            }
        });
        visit_rule(&mut ctx, &node);
        assert_eq!(ctx.to_string(), "div {\n\tcolor: blue;\n}");
    }
}
