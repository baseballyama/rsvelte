//! Legacy AST conversion.
//!
//! Transform modern Svelte 5 AST into the legacy Svelte 4 format.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/legacy.js`
//!
//! ## Differences from Svelte
//!
//! - **UTF-8 to UTF-16 conversion**: This implementation converts UTF-8 byte positions
//!   (used internally by Rust) to UTF-16 code unit positions (expected by JavaScript).
//!   Svelte's original legacy.js doesn't need this conversion since JavaScript strings
//!   are natively UTF-16.
//! - **Comment attachment**: The `leadingComments` and `trailingComments` fields for
//!   ESTree-style comment attachment are not yet fully implemented. OXC provides
//!   comments separately from the AST, requiring additional logic to attach them.

use regex::Regex;
use serde_json::{Map, Value, json};
use std::sync::LazyLock;

use crate::ast::{
    AnimateDirective, AttachTag, Attribute, AttributeNode, AttributeValue, AttributeValuePart,
    AwaitBlock, BindDirective, ClassDirective, Comment, Component, ConstTag, DebugTag, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, LetDirective, OnDirective, RegularElement,
    RenderTag, Root, Script, SlotElement, SnippetBlock, SpreadAttribute, StyleDirective,
    SvelteComponentElement, SvelteDynamicElement, SvelteElement, TemplateNode, Text, TitleElement,
    TransitionDirective, UseDirective,
};

// Regex patterns for whitespace handling
static REGEX_STARTS_WITH_WHITESPACE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[ \t\r\n]+").unwrap());
static REGEX_ENDS_WITH_WHITESPACE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"[ \t\r\n]+$").unwrap());
static REGEX_NOT_WHITESPACE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^ \t\r\n]").unwrap());

/// Converter from UTF-8 byte positions to UTF-16 code unit positions.
struct Utf8ToUtf16 {
    utf16_pos: Vec<usize>,
    /// (byte offset, utf16 offset) for each line start
    line_starts_byte: Vec<usize>,
    line_starts_utf16: Vec<usize>,
}

impl Utf8ToUtf16 {
    fn new(source: &str) -> Self {
        let mut utf16_pos = Vec::with_capacity(source.len() + 1);
        let mut utf16_idx = 0;
        let mut line_starts_byte = vec![0];
        let mut line_starts_utf16 = vec![0];
        let mut byte_idx = 0;

        for c in source.chars() {
            let utf8_len = c.len_utf8();
            let utf16_len = c.len_utf16();
            for _ in 0..utf8_len {
                utf16_pos.push(utf16_idx);
            }
            utf16_idx += utf16_len;
            byte_idx += utf8_len;

            if c == '\n' {
                line_starts_byte.push(byte_idx);
                line_starts_utf16.push(utf16_idx);
            }
        }
        utf16_pos.push(utf16_idx);
        Self {
            utf16_pos,
            line_starts_byte,
            line_starts_utf16,
        }
    }

    fn convert(&self, utf8_pos: usize) -> usize {
        if utf8_pos >= self.utf16_pos.len() {
            *self.utf16_pos.last().unwrap_or(&0)
        } else {
            self.utf16_pos[utf8_pos]
        }
    }

    /// Convert a column from byte offset to UTF-16 code unit offset within a line.
    /// line is 1-based, column is 0-based byte offset from line start.
    fn convert_column(&self, line: usize, byte_column: usize) -> usize {
        if line == 0 || line > self.line_starts_byte.len() {
            return byte_column;
        }

        let line_start_byte = self.line_starts_byte[line - 1];
        let line_start_utf16 = self.line_starts_utf16[line - 1];

        // Calculate absolute byte position
        let abs_byte_pos = line_start_byte + byte_column;

        // Convert to UTF-16 position
        let abs_utf16_pos = self.convert(abs_byte_pos);

        // Return column as offset from line start in UTF-16
        abs_utf16_pos.saturating_sub(line_start_utf16)
    }
}

/// Recursively convert positions in JSON from UTF-8 to UTF-16.
fn convert_positions_to_utf16(value: &mut Value, pos_conv: &Utf8ToUtf16) {
    match value {
        Value::Object(map) => {
            if let Some(Value::Number(n)) = map.get("start")
                && let Some(pos) = n.as_u64()
            {
                map.insert("start".to_string(), json!(pos_conv.convert(pos as usize)));
            }
            if let Some(Value::Number(n)) = map.get("end")
                && let Some(pos) = n.as_u64()
            {
                map.insert("end".to_string(), json!(pos_conv.convert(pos as usize)));
            }
            if let Some(Value::Number(n)) = map.get("character")
                && let Some(pos) = n.as_u64()
            {
                map.insert(
                    "character".to_string(),
                    json!(pos_conv.convert(pos as usize)),
                );
            }

            // Convert column in loc objects (loc has line and column fields)
            if map.contains_key("line")
                && map.contains_key("column")
                && let (Some(Value::Number(line)), Some(Value::Number(col))) =
                    (map.get("line"), map.get("column"))
                && let (Some(line_num), Some(col_num)) = (line.as_u64(), col.as_u64())
            {
                let new_col = pos_conv.convert_column(line_num as usize, col_num as usize);
                map.insert("column".to_string(), json!(new_col));
            }

            for v in map.values_mut() {
                convert_positions_to_utf16(v, pos_conv);
            }
        }
        Value::Array(arr) => {
            for item in arr {
                convert_positions_to_utf16(item, pos_conv);
            }
        }
        _ => {}
    }
}

/// Convert a modern AST to legacy AST format.
pub fn convert_to_legacy(source: &str, ast: Root) -> Value {
    // Set the serialize arena so that as_json() calls can resolve JsNodeIds
    unsafe { crate::ast::arena::set_serialize_arena(&ast.arena as *const _) };
    let result = convert_to_legacy_inner(source, ast);
    crate::ast::arena::clear_serialize_arena();
    result
}

fn convert_to_legacy_inner(source: &str, ast: Root) -> Value {
    let mut result = Map::new();

    // Calculate html fragment start/end
    let (start, end) = if !ast.fragment.nodes.is_empty() {
        let first_start = get_node_start(&ast.fragment.nodes[0]);
        let last_end = get_node_end(ast.fragment.nodes.last().unwrap());

        // Trim whitespace from start and end
        let mut start = first_start as usize;
        let mut end = last_end as usize;

        let source_bytes = source.as_bytes();
        while start < source.len()
            && source_bytes
                .get(start)
                .is_some_and(|&b| b.is_ascii_whitespace())
        {
            start += 1;
        }
        while end > 0
            && source_bytes
                .get(end - 1)
                .is_some_and(|&b| b.is_ascii_whitespace())
        {
            end -= 1;
        }

        (Some(start as u32), Some(end as u32))
    } else {
        (None, None)
    };

    // Convert fragment nodes, inserting svelte:options back if needed
    let mut fragment_nodes = ast.fragment.nodes.clone();
    if let Some(ref options) = ast.options {
        // Find the correct position to insert options
        let idx = fragment_nodes
            .iter()
            .position(|node| options.end <= get_node_start(node))
            .unwrap_or(fragment_nodes.len());

        // Create a SvelteOptions node to insert
        let options_node = TemplateNode::SvelteOptions(SvelteElement {
            start: options.start,
            end: options.end,
            name: "svelte:options".into(),
            name_loc: None,
            attributes: options
                .attributes
                .iter()
                .map(|a| Attribute::Attribute(a.clone()))
                .collect(),
            fragment: Fragment::default(),
        });
        fragment_nodes.insert(idx, options_node);
    }

    // Build html fragment
    let mut html = Map::new();
    html.insert("type".to_string(), json!("Fragment"));
    html.insert("start".to_string(), json!(start));
    html.insert("end".to_string(), json!(end));
    html.insert(
        "children".to_string(),
        json!(
            fragment_nodes
                .iter()
                .map(|node| convert_node(source, node, &[]))
                .collect::<Vec<_>>()
        ),
    );
    result.insert("html".to_string(), Value::Object(html));

    // Convert instance script
    if let Some(instance) = ast.instance {
        let mut script = convert_script(&instance);
        // Remove attributes field from instance
        script.as_object_mut().unwrap().remove("attributes");
        result.insert("instance".to_string(), script);
    }

    // Convert module script
    if let Some(module) = ast.module {
        let mut script = convert_script(&module);
        // Remove attributes field from module
        script.as_object_mut().unwrap().remove("attributes");
        result.insert("module".to_string(), script);
    }

    // Convert CSS
    if let Some(css) = ast.css {
        result.insert("css".to_string(), convert_css(&css));
    }

    // Convert all positions from UTF-8 to UTF-16
    let pos_conv = Utf8ToUtf16::new(source);
    let mut final_result = Value::Object(result);
    convert_positions_to_utf16(&mut final_result, &pos_conv);

    final_result
}

fn convert_script(script: &Script) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Script"));
    result.insert("start".to_string(), json!(script.start));
    result.insert("end".to_string(), json!(script.end));
    result.insert("context".to_string(), json!(script.context));
    result.insert("content".to_string(), script.content.as_json().clone());
    Value::Object(result)
}

fn convert_css(css: &crate::ast::css::StyleSheet) -> Value {
    let mut result = serde_json::to_value(css).unwrap();

    // Change type from StyleSheet to Style
    if let Value::Object(map) = &mut result {
        map.insert("type".to_string(), json!("Style"));

        // Convert children selectors
        if let Some(Value::Array(children)) = map.get_mut("children") {
            for child in children {
                convert_css_node(child);
            }
        }
    }

    result
}

fn convert_css_node(node: &mut Value) {
    if let Value::Object(map) = node {
        // Remove metadata
        map.remove("metadata");

        // Convert ComplexSelector to Selector
        if map.get("type") == Some(&json!("ComplexSelector")) {
            map.insert("type".to_string(), json!("Selector"));

            // Flatten children: extract combinator and selectors from each RelativeSelector
            if let Some(Value::Array(relative_selectors)) = map.remove("children") {
                let mut new_children = Vec::new();
                for rs in relative_selectors {
                    if let Value::Object(rs_map) = rs {
                        // Add combinator if present
                        if let Some(combinator) = rs_map.get("combinator")
                            && !combinator.is_null()
                        {
                            new_children.push(combinator.clone());
                        }
                        // Add selectors
                        if let Some(Value::Array(selectors)) = rs_map.get("selectors") {
                            for selector in selectors {
                                new_children.push(selector.clone());
                            }
                        }
                    }
                }
                map.insert("children".to_string(), Value::Array(new_children));
            }
        }

        // Recursively process children
        for (_, v) in map.iter_mut() {
            match v {
                Value::Object(_) => convert_css_node(v),
                Value::Array(arr) => {
                    for item in arr {
                        convert_css_node(item);
                    }
                }
                _ => {}
            }
        }
    }
}

fn convert_node(source: &str, node: &TemplateNode, path: &[&str]) -> Value {
    match node {
        TemplateNode::Text(text) => convert_text(text, path),
        TemplateNode::Comment(comment) => convert_comment(comment),
        TemplateNode::ExpressionTag(expr_tag) => convert_expression_tag(expr_tag, path),
        TemplateNode::HtmlTag(html_tag) => convert_html_tag(html_tag),
        TemplateNode::ConstTag(const_tag) => convert_const_tag(const_tag),
        TemplateNode::DebugTag(debug_tag) => convert_debug_tag(debug_tag),
        TemplateNode::RenderTag(render_tag) => convert_render_tag(render_tag),
        TemplateNode::AttachTag(attach_tag) => convert_attach_tag(attach_tag),
        TemplateNode::IfBlock(if_block) => convert_if_block(source, if_block),
        TemplateNode::EachBlock(each_block) => convert_each_block(source, each_block),
        TemplateNode::AwaitBlock(await_block) => convert_await_block(source, await_block),
        TemplateNode::KeyBlock(key_block) => convert_key_block(source, key_block),
        TemplateNode::SnippetBlock(snippet_block) => convert_snippet_block(source, snippet_block),
        TemplateNode::RegularElement(element) => convert_regular_element(source, element),
        TemplateNode::Component(component) => convert_component(source, component),
        TemplateNode::TitleElement(title) => convert_title_element(source, title),
        TemplateNode::SlotElement(slot) => convert_slot_element(source, slot),
        TemplateNode::SvelteBody(element) => convert_svelte_body(source, element),
        TemplateNode::SvelteComponent(element) => convert_svelte_component(source, element),
        TemplateNode::SvelteDocument(element) => convert_svelte_document(source, element),
        TemplateNode::SvelteElement(element) => convert_svelte_element(source, element),
        TemplateNode::SvelteFragment(element) => convert_svelte_fragment(source, element),
        TemplateNode::SvelteBoundary(element) => convert_svelte_boundary(source, element),
        TemplateNode::SvelteHead(element) => convert_svelte_head(source, element),
        TemplateNode::SvelteOptions(element) => convert_svelte_options(element),
        TemplateNode::SvelteSelf(element) => convert_svelte_self(source, element),
        TemplateNode::SvelteWindow(element) => convert_svelte_window(source, element),
    }
}

fn convert_text(text: &Text, path: &[&str]) -> Value {
    // In style elements, we omit the 'raw' field
    let in_style = path.last() == Some(&"style");

    let mut result = Map::new();
    result.insert("type".to_string(), json!("Text"));
    result.insert("start".to_string(), json!(text.start));
    result.insert("end".to_string(), json!(text.end));
    if !in_style {
        result.insert("raw".to_string(), json!(text.raw.as_str()));
    }
    result.insert("data".to_string(), json!(text.data.as_str()));
    Value::Object(result)
}

fn convert_comment(comment: &Comment) -> Value {
    // Extract svelte-ignore directives
    let ignores = extract_svelte_ignore(&comment.data);

    let mut result = Map::new();
    result.insert("type".to_string(), json!("Comment"));
    result.insert("start".to_string(), json!(comment.start));
    result.insert("end".to_string(), json!(comment.end));
    result.insert("data".to_string(), json!(comment.data.as_str()));
    result.insert("ignores".to_string(), json!(ignores));
    Value::Object(result)
}

fn extract_svelte_ignore(data: &str) -> Vec<String> {
    let trimmed = data.trim();
    if let Some(rest) = trimmed.strip_prefix("svelte-ignore") {
        let rest = rest.trim();
        if rest.is_empty() {
            return Vec::new();
        }
        // Split by whitespace or comma and filter empty, trimming each token
        rest.split(|c: char| c.is_whitespace() || c == ',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .collect()
    } else {
        Vec::new()
    }
}

fn convert_expression_tag(expr_tag: &ExpressionTag, path: &[&str]) -> Value {
    // Check if parent is an Attribute and starts with {
    let in_attribute = path.last() == Some(&"Attribute");

    let mut result = Map::new();
    if in_attribute {
        // This is an AttributeShorthand
        result.insert("type".to_string(), json!("AttributeShorthand"));
    } else {
        result.insert("type".to_string(), json!("MustacheTag"));
    }
    result.insert("start".to_string(), json!(expr_tag.start));
    result.insert("end".to_string(), json!(expr_tag.end));
    result.insert(
        "expression".to_string(),
        expr_tag.expression.as_json().clone(),
    );
    Value::Object(result)
}

fn convert_html_tag(html_tag: &HtmlTag) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("RawMustacheTag"));
    result.insert("start".to_string(), json!(html_tag.start));
    result.insert("end".to_string(), json!(html_tag.end));
    result.insert(
        "expression".to_string(),
        html_tag.expression.as_json().clone(),
    );
    Value::Object(result)
}

fn convert_const_tag(const_tag: &ConstTag) -> Value {
    // Convert ConstTag to legacy format with AssignmentExpression
    let declaration = &const_tag.declaration.as_json();

    // Extract the declarator from the VariableDeclaration
    if let Some(declarations) = declaration.get("declarations").and_then(|d| d.as_array())
        && let Some(first_decl) = declarations.first()
    {
        let id = first_decl.get("id").cloned().unwrap_or(json!(null));
        let init = first_decl.get("init").cloned().unwrap_or(json!(null));

        // Remove typeAnnotation from id
        let mut id = id;
        if let Value::Object(ref mut id_map) = id {
            id_map.remove("typeAnnotation");
        }

        // Calculate start position (after 'const ')
        let decl_start = declaration
            .get("start")
            .and_then(|s| s.as_u64())
            .unwrap_or(0);
        let decl_end = declaration.get("end").and_then(|s| s.as_u64()).unwrap_or(0);

        let mut result = Map::new();
        result.insert("type".to_string(), json!("ConstTag"));
        result.insert("start".to_string(), json!(const_tag.start));
        result.insert("end".to_string(), json!(const_tag.end));
        result.insert(
            "expression".to_string(),
            json!({
                "type": "AssignmentExpression",
                "start": decl_start + 6, // Skip 'const '
                "end": decl_end,
                "operator": "=",
                "left": id,
                "right": init
            }),
        );
        return Value::Object(result);
    }

    // Fallback
    json!({
        "type": "ConstTag",
        "start": const_tag.start,
        "end": const_tag.end,
        "expression": const_tag.declaration.as_json()
    })
}

fn convert_debug_tag(debug_tag: &DebugTag) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("DebugTag"));
    result.insert("start".to_string(), json!(debug_tag.start));
    result.insert("end".to_string(), json!(debug_tag.end));
    result.insert(
        "identifiers".to_string(),
        json!(
            debug_tag
                .identifiers
                .iter()
                .map(|e| e.as_json().clone())
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_render_tag(render_tag: &RenderTag) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("RenderTag"));
    result.insert("start".to_string(), json!(render_tag.start));
    result.insert("end".to_string(), json!(render_tag.end));
    result.insert(
        "expression".to_string(),
        render_tag.expression.as_json().clone(),
    );
    Value::Object(result)
}

fn convert_attach_tag(attach_tag: &AttachTag) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("AttachTag"));
    result.insert("start".to_string(), json!(attach_tag.start));
    result.insert("end".to_string(), json!(attach_tag.end));
    result.insert(
        "expression".to_string(),
        attach_tag.expression.as_json().clone(),
    );
    Value::Object(result)
}

fn convert_if_block(source: &str, if_block: &IfBlock) -> Value {
    let mut else_block = None;

    if let Some(ref alternate) = if_block.alternate {
        let mut nodes = alternate.nodes.clone();

        // Check if this is an else-if chain
        if nodes.len() == 1
            && let TemplateNode::IfBlock(inner_if) = &nodes[0]
            && inner_if.elseif
        {
            // Get children from the inner if block's consequent
            nodes = inner_if.consequent.nodes.clone();
        }

        let end = find_last_brace_before(source, if_block.end as usize);
        let start = nodes
            .first()
            .map(|n| get_node_start(n) as usize)
            .unwrap_or(end);

        // Remove surrounding whitespace from nodes
        let mut legacy_nodes: Vec<Value> = Vec::new();
        let mut alt_nodes = alternate.nodes.clone();
        remove_surrounding_whitespace_nodes(&mut alt_nodes);

        for node in &alt_nodes {
            legacy_nodes.push(convert_node(source, node, &[]));
        }

        else_block = Some(json!({
            "type": "ElseBlock",
            "start": start,
            "end": end,
            "children": legacy_nodes
        }));
    }

    // Calculate start position for elseif blocks
    let start = if if_block.elseif {
        if_block
            .consequent
            .nodes
            .first()
            .map(get_node_start)
            .unwrap_or_else(|| find_last_brace_before(source, if_block.end as usize) as u32)
    } else {
        if_block.start
    };

    // Remove surrounding whitespace from consequent
    let mut consequent_nodes = if_block.consequent.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut consequent_nodes);

    let mut result = Map::new();
    result.insert("type".to_string(), json!("IfBlock"));
    result.insert("start".to_string(), json!(start));
    result.insert("end".to_string(), json!(if_block.end));
    result.insert("expression".to_string(), if_block.test.as_json().clone());
    result.insert(
        "children".to_string(),
        json!(
            consequent_nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    if let Some(else_block) = else_block {
        result.insert("else".to_string(), else_block);
    }
    if if_block.elseif {
        result.insert("elseif".to_string(), json!(true));
    }
    Value::Object(result)
}

fn convert_each_block(source: &str, each_block: &EachBlock) -> Value {
    let mut else_block = None;

    if let Some(ref fallback) = each_block.fallback {
        let end = find_last_brace_before(source, each_block.end as usize);
        let start = fallback
            .nodes
            .first()
            .map(|n| get_node_start(n) as usize)
            .unwrap_or(end);

        let mut fallback_nodes = fallback.nodes.clone();
        remove_surrounding_whitespace_nodes(&mut fallback_nodes);

        else_block = Some(json!({
            "type": "ElseBlock",
            "start": start,
            "end": end,
            "children": fallback_nodes.iter().map(|n| convert_node(source, n, &[])).collect::<Vec<_>>()
        }));
    }

    let mut body_nodes = each_block.body.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut body_nodes);

    let mut result = Map::new();
    result.insert("type".to_string(), json!("EachBlock"));
    result.insert("start".to_string(), json!(each_block.start));
    result.insert("end".to_string(), json!(each_block.end));
    result.insert(
        "children".to_string(),
        json!(
            body_nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "context".to_string(),
        each_block
            .context
            .as_ref()
            .map(|c| c.as_json().clone())
            .unwrap_or(json!(null)),
    );
    result.insert(
        "expression".to_string(),
        each_block.expression.as_json().clone(),
    );
    if let Some(ref index) = each_block.index {
        result.insert("index".to_string(), json!(index.as_str()));
    }
    if let Some(ref key) = each_block.key {
        result.insert("key".to_string(), key.as_json().clone());
    }
    if let Some(else_block) = else_block {
        result.insert("else".to_string(), else_block);
    }
    Value::Object(result)
}

fn convert_await_block(source: &str, await_block: &AwaitBlock) -> Value {
    // Get expression end position
    let expr_end = await_block
        .expression
        .as_json()
        .get("end")
        .and_then(|e| e.as_u64())
        .unwrap_or(await_block.start as u64) as usize;

    let mut pending_block = json!({
        "type": "PendingBlock",
        "start": null,
        "end": null,
        "children": [],
        "skip": true
    });

    let mut then_block = json!({
        "type": "ThenBlock",
        "start": null,
        "end": null,
        "children": [],
        "skip": true
    });

    let mut catch_block = json!({
        "type": "CatchBlock",
        "start": null,
        "end": null,
        "children": [],
        "skip": true
    });

    if let Some(ref pending) = await_block.pending {
        let first_start = pending.nodes.first().map(|n| get_node_start(n) as usize);
        let last_end = pending.nodes.last().map(|n| get_node_end(n) as usize);

        let start = first_start.unwrap_or_else(|| find_closing_brace_after(source, expr_end));
        let end = last_end.unwrap_or(start);

        pending_block = json!({
            "type": "PendingBlock",
            "start": start,
            "end": end,
            "children": pending.nodes.iter().map(|n| convert_node(source, n, &[])).collect::<Vec<_>>(),
            "skip": false
        });
    }

    let pending_end = pending_block
        .get("end")
        .and_then(|e| e.as_u64())
        .map(|e| e as usize);

    if let Some(ref then) = await_block.then {
        let first_start = then.nodes.first().map(|n| get_node_start(n) as usize);
        let last_end = then.nodes.last().map(|n| get_node_end(n) as usize);

        let start = pending_end
            .or(first_start)
            .unwrap_or_else(|| find_closing_brace_after(source, expr_end));

        // In legacy format, empty then blocks in error recovery have end = await_block.start - 2
        let end = last_end.unwrap_or_else(|| {
            if then.nodes.is_empty() {
                // Error recovery case: end points backwards
                await_block.start.saturating_sub(2) as usize
            } else {
                find_closing_brace_after(source, pending_end.unwrap_or(expr_end))
            }
        });

        then_block = json!({
            "type": "ThenBlock",
            "start": start,
            "end": end,
            "children": then.nodes.iter().map(|n| convert_node(source, n, &[])).collect::<Vec<_>>(),
            "skip": false
        });
    }

    let then_end = then_block
        .get("end")
        .and_then(|e| e.as_u64())
        .map(|e| e as usize);

    if let Some(ref catch) = await_block.catch {
        let first_start = catch.nodes.first().map(|n| get_node_start(n) as usize);
        let last_end = catch.nodes.last().map(|n| get_node_end(n) as usize);

        let start = then_end
            .or(pending_end)
            .or(first_start)
            .unwrap_or_else(|| find_closing_brace_after(source, expr_end));

        // In legacy format, empty catch blocks in error recovery have end = await_block.start - 2
        let end = last_end.unwrap_or_else(|| {
            if catch.nodes.is_empty() {
                // Error recovery case: end points backwards
                await_block.start.saturating_sub(2) as usize
            } else {
                find_closing_brace_after(source, then_end.or(pending_end).unwrap_or(expr_end))
            }
        });

        catch_block = json!({
            "type": "CatchBlock",
            "start": start,
            "end": end,
            "children": catch.nodes.iter().map(|n| convert_node(source, n, &[])).collect::<Vec<_>>(),
            "skip": false
        });
    }

    let mut result = Map::new();
    result.insert("type".to_string(), json!("AwaitBlock"));
    result.insert("start".to_string(), json!(await_block.start));
    result.insert("end".to_string(), json!(await_block.end));
    result.insert(
        "expression".to_string(),
        await_block.expression.as_json().clone(),
    );
    result.insert(
        "value".to_string(),
        await_block
            .value
            .as_ref()
            .map(|v| v.as_json().clone())
            .unwrap_or(json!(null)),
    );
    result.insert(
        "error".to_string(),
        await_block
            .error
            .as_ref()
            .map(|e| e.as_json().clone())
            .unwrap_or(json!(null)),
    );
    result.insert("pending".to_string(), pending_block);
    result.insert("then".to_string(), then_block);
    result.insert("catch".to_string(), catch_block);
    Value::Object(result)
}

fn convert_key_block(source: &str, key_block: &KeyBlock) -> Value {
    let mut fragment_nodes = key_block.fragment.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut fragment_nodes);

    let mut result = Map::new();
    result.insert("type".to_string(), json!("KeyBlock"));
    result.insert("start".to_string(), json!(key_block.start));
    result.insert("end".to_string(), json!(key_block.end));
    result.insert(
        "expression".to_string(),
        key_block.expression.as_json().clone(),
    );
    result.insert(
        "children".to_string(),
        json!(
            fragment_nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_snippet_block(source: &str, snippet_block: &SnippetBlock) -> Value {
    let mut body_nodes = snippet_block.body.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut body_nodes);

    let mut result = Map::new();
    result.insert("type".to_string(), json!("SnippetBlock"));
    result.insert("start".to_string(), json!(snippet_block.start));
    result.insert("end".to_string(), json!(snippet_block.end));
    result.insert(
        "expression".to_string(),
        snippet_block.expression.as_json().clone(),
    );
    result.insert(
        "parameters".to_string(),
        json!(
            snippet_block
                .parameters
                .iter()
                .map(|p| p.as_json().clone())
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            body_nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    if let Some(ref type_params) = snippet_block.type_params {
        result.insert("typeParams".to_string(), json!(type_params.as_str()));
    }
    Value::Object(result)
}

fn convert_regular_element(source: &str, element: &RegularElement) -> Value {
    let path = if element.name.as_str() == "style" {
        vec!["style"]
    } else {
        vec![]
    };

    let mut result = Map::new();
    result.insert("type".to_string(), json!("Element"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert("name".to_string(), json!(element.name.as_str()));
    // Legacy format does not include name_loc for elements
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &path))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_component(source: &str, component: &Component) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("InlineComponent"));
    result.insert("start".to_string(), json!(component.start));
    result.insert("end".to_string(), json!(component.end));
    result.insert("name".to_string(), json!(component.name.as_str()));
    // Legacy format does not include name_loc for components
    result.insert(
        "attributes".to_string(),
        json!(
            component
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            component
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_title_element(source: &str, title: &TitleElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Title"));
    result.insert("name".to_string(), json!("title"));
    result.insert("start".to_string(), json!(title.start));
    result.insert("end".to_string(), json!(title.end));
    result.insert(
        "attributes".to_string(),
        json!(
            title
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            title
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_slot_element(source: &str, slot: &SlotElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Slot"));
    result.insert("start".to_string(), json!(slot.start));
    result.insert("end".to_string(), json!(slot.end));
    result.insert("name".to_string(), json!(slot.name.as_str()));
    // Legacy format does not include name_loc for slots
    result.insert(
        "attributes".to_string(),
        json!(
            slot.attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            slot.fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_body(source: &str, element: &SvelteElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Body"));
    result.insert("name".to_string(), json!("svelte:body"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_component(source: &str, element: &SvelteComponentElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("InlineComponent"));
    result.insert("name".to_string(), json!("svelte:component"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "expression".to_string(),
        element.expression.as_json().clone(),
    );
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_document(source: &str, element: &SvelteElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Document"));
    result.insert("name".to_string(), json!("svelte:document"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_element(source: &str, element: &SvelteDynamicElement) -> Value {
    // Check if tag is a literal string and source doesn't have braces
    let tag_start = element
        .tag
        .as_json()
        .get("start")
        .and_then(|s| s.as_u64())
        .unwrap_or(0) as usize;
    let has_braces = tag_start > 0 && source.as_bytes().get(tag_start - 1) == Some(&b'{');

    let tag = if !has_braces {
        if let Some(value) = element.tag.as_json().get("value").and_then(|v| v.as_str()) {
            json!(value)
        } else {
            element.tag.as_json().clone()
        }
    } else {
        element.tag.as_json().clone()
    };

    let mut result = Map::new();
    result.insert("type".to_string(), json!("Element"));
    result.insert("name".to_string(), json!("svelte:element"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert("tag".to_string(), tag);
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_fragment(source: &str, element: &SvelteElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("SlotTemplate"));
    result.insert("name".to_string(), json!("svelte:fragment"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_boundary(source: &str, element: &SvelteElement) -> Value {
    let mut fragment_nodes = element.fragment.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut fragment_nodes);

    let mut result = Map::new();
    result.insert("type".to_string(), json!("SvelteBoundary"));
    result.insert("name".to_string(), json!("svelte:boundary"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            fragment_nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_head(source: &str, element: &SvelteElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Head"));
    result.insert("name".to_string(), json!("svelte:head"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_options(element: &SvelteElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Options"));
    result.insert("name".to_string(), json!("svelte:options"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .filter_map(|a| {
                    if let Attribute::Attribute(attr) = a {
                        Some(convert_attribute_node(attr))
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_self(source: &str, element: &SvelteElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("InlineComponent"));
    result.insert("name".to_string(), json!("svelte:self"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_svelte_window(source: &str, element: &SvelteElement) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Window"));
    result.insert("name".to_string(), json!("svelte:window"));
    result.insert("start".to_string(), json!(element.start));
    result.insert("end".to_string(), json!(element.end));
    result.insert(
        "attributes".to_string(),
        json!(
            element
                .attributes
                .iter()
                .map(|a| convert_attribute(source, a))
                .collect::<Vec<_>>()
        ),
    );
    result.insert(
        "children".to_string(),
        json!(
            element
                .fragment
                .nodes
                .iter()
                .map(|n| convert_node(source, n, &[]))
                .collect::<Vec<_>>()
        ),
    );
    Value::Object(result)
}

fn convert_attribute(source: &str, attr: &Attribute) -> Value {
    match attr {
        Attribute::Attribute(node) => convert_attribute_node(node),
        Attribute::SpreadAttribute(spread) => convert_spread_attribute(spread),
        Attribute::AttachTag(attach) => convert_attach_tag(attach),
        Attribute::BindDirective(bind) => convert_bind_directive(bind),
        Attribute::OnDirective(on) => convert_on_directive(on),
        Attribute::ClassDirective(class) => convert_class_directive(class),
        Attribute::StyleDirective(style) => convert_style_directive(source, style),
        Attribute::TransitionDirective(transition) => convert_transition_directive(transition),
        Attribute::AnimateDirective(animate) => convert_animate_directive(animate),
        Attribute::UseDirective(use_dir) => convert_use_directive(use_dir),
        Attribute::LetDirective(let_dir) => convert_let_directive(let_dir),
    }
}

fn convert_attribute_node(attr: &AttributeNode) -> Value {
    let value = convert_attribute_value(&attr.value, attr.start, &attr.name);

    let mut result = Map::new();
    result.insert("type".to_string(), json!("Attribute"));
    result.insert("start".to_string(), json!(attr.start));
    result.insert("end".to_string(), json!(attr.end));
    result.insert("name".to_string(), json!(attr.name.as_str()));
    if let Some(ref name_loc) = attr.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    result.insert("value".to_string(), value);
    Value::Object(result)
}

fn convert_attribute_value(value: &AttributeValue, attr_start: u32, _attr_name: &str) -> Value {
    match value {
        AttributeValue::True(true) => json!(true),
        AttributeValue::True(false) => json!(false),
        AttributeValue::Expression(expr_tag) => {
            // Check if this is a shorthand attribute like {id}
            // A shorthand is when the expression is directly after the attribute start (the `{`)
            // i.e., expr_tag.start == attr_start + 1 (for `{id}`, attr starts at `{`, expr at `id`)
            // For named attributes like `foo={bar}`, the expression is further away
            let is_shorthand = expr_tag.start == attr_start + 1;

            if is_shorthand {
                // Shorthand attribute: {id} -> AttributeShorthand
                json!([convert_expression_tag(expr_tag, &["Attribute"])])
            } else {
                // Named attribute with expression value: b={''} -> MustacheTag
                json!([convert_expression_tag(expr_tag, &[])])
            }
        }
        AttributeValue::Sequence(parts) => {
            json!(
                parts
                    .iter()
                    .map(|part| match part {
                        AttributeValuePart::Text(text) => convert_text(text, &[]),
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            convert_expression_tag(expr_tag, &[])
                        }
                    })
                    .collect::<Vec<_>>()
            )
        }
    }
}

fn convert_spread_attribute(spread: &SpreadAttribute) -> Value {
    let mut result = Map::new();
    result.insert("type".to_string(), json!("Spread"));
    result.insert("start".to_string(), json!(spread.start));
    result.insert("end".to_string(), json!(spread.end));
    result.insert(
        "expression".to_string(),
        spread.expression.as_json().clone(),
    );
    Value::Object(result)
}

fn convert_bind_directive(bind: &BindDirective) -> Value {
    let mut result = Map::new();
    result.insert("start".to_string(), json!(bind.start));
    result.insert("end".to_string(), json!(bind.end));
    result.insert("type".to_string(), json!("Binding"));
    result.insert("name".to_string(), json!(bind.name.as_str()));
    if let Some(ref name_loc) = bind.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }

    // For shorthand bindings (bind:foo), strip the loc field from expression
    let mut expression = bind.expression.as_json().clone();
    let is_shorthand = expression
        .get("type")
        .and_then(|t| t.as_str())
        .is_some_and(|t| t == "Identifier")
        && expression
            .get("name")
            .and_then(|n| n.as_str())
            .is_some_and(|n| n == bind.name.as_str());
    if is_shorthand && let Value::Object(ref mut expr_map) = expression {
        expr_map.remove("loc");
    }

    result.insert("expression".to_string(), expression);
    result.insert("modifiers".to_string(), json!(bind.modifiers));
    Value::Object(result)
}

fn convert_on_directive(on: &OnDirective) -> Value {
    let mut result = Map::new();
    result.insert("start".to_string(), json!(on.start));
    result.insert("end".to_string(), json!(on.end));
    result.insert("type".to_string(), json!("EventHandler"));
    result.insert("name".to_string(), json!(on.name.as_str()));
    if let Some(ref name_loc) = on.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    result.insert(
        "expression".to_string(),
        on.expression
            .as_ref()
            .map(|e| e.as_json().clone())
            .unwrap_or(json!(null)),
    );
    result.insert("modifiers".to_string(), json!(on.modifiers));
    Value::Object(result)
}

fn convert_class_directive(class: &ClassDirective) -> Value {
    let mut result = Map::new();
    result.insert("start".to_string(), json!(class.start));
    result.insert("end".to_string(), json!(class.end));
    result.insert("type".to_string(), json!("Class"));
    result.insert("name".to_string(), json!(class.name.as_str()));
    if let Some(ref name_loc) = class.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    result.insert("expression".to_string(), class.expression.as_json().clone());
    result.insert("modifiers".to_string(), json!([]));
    Value::Object(result)
}

fn convert_style_directive(_source: &str, style: &StyleDirective) -> Value {
    let value = match &style.value {
        AttributeValue::True(true) => json!(true),
        AttributeValue::True(false) => json!(false),
        AttributeValue::Expression(expr_tag) => {
            json!([{
                "type": "MustacheTag",
                "start": expr_tag.start,
                "end": expr_tag.end,
                "expression": expr_tag.expression.as_json().clone()
            }])
        }
        AttributeValue::Sequence(parts) => {
            json!(
                parts
                    .iter()
                    .map(|part| match part {
                        AttributeValuePart::Text(text) => convert_text(text, &[]),
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            json!({
                                "type": "MustacheTag",
                                "start": expr_tag.start,
                                "end": expr_tag.end,
                                "expression": expr_tag.expression.as_json().clone()
                            })
                        }
                    })
                    .collect::<Vec<_>>()
            )
        }
    };

    let mut result = Map::new();
    result.insert("type".to_string(), json!("StyleDirective"));
    result.insert("start".to_string(), json!(style.start));
    result.insert("end".to_string(), json!(style.end));
    result.insert("name".to_string(), json!(style.name.as_str()));
    if let Some(ref name_loc) = style.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    result.insert("value".to_string(), value);
    result.insert("modifiers".to_string(), json!(style.modifiers));
    Value::Object(result)
}

fn convert_transition_directive(transition: &TransitionDirective) -> Value {
    let mut result = Map::new();
    result.insert("start".to_string(), json!(transition.start));
    result.insert("end".to_string(), json!(transition.end));
    result.insert("type".to_string(), json!("Transition"));
    result.insert("name".to_string(), json!(transition.name.as_str()));
    if let Some(ref name_loc) = transition.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    if let Some(ref expression) = transition.expression {
        result.insert("expression".to_string(), expression.as_json().clone());
    } else {
        result.insert("expression".to_string(), json!(null));
    }
    result.insert("modifiers".to_string(), json!(transition.modifiers));
    result.insert("intro".to_string(), json!(transition.intro));
    result.insert("outro".to_string(), json!(transition.outro));
    Value::Object(result)
}

fn convert_animate_directive(animate: &AnimateDirective) -> Value {
    let mut result = Map::new();
    result.insert("start".to_string(), json!(animate.start));
    result.insert("end".to_string(), json!(animate.end));
    result.insert("type".to_string(), json!("Animation"));
    result.insert("name".to_string(), json!(animate.name.as_str()));
    if let Some(ref name_loc) = animate.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    if let Some(ref expression) = animate.expression {
        result.insert("expression".to_string(), expression.as_json().clone());
    } else {
        result.insert("expression".to_string(), json!(null));
    }
    result.insert("modifiers".to_string(), json!([]));
    Value::Object(result)
}

fn convert_use_directive(use_dir: &UseDirective) -> Value {
    let mut result = Map::new();
    result.insert("start".to_string(), json!(use_dir.start));
    result.insert("end".to_string(), json!(use_dir.end));
    result.insert("type".to_string(), json!("Action"));
    result.insert("name".to_string(), json!(use_dir.name.as_str()));
    if let Some(ref name_loc) = use_dir.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    if let Some(ref expression) = use_dir.expression {
        result.insert("expression".to_string(), expression.as_json().clone());
    } else {
        result.insert("expression".to_string(), json!(null));
    }
    result.insert("modifiers".to_string(), json!([]));
    Value::Object(result)
}

fn convert_let_directive(let_dir: &LetDirective) -> Value {
    let mut result = Map::new();
    result.insert("start".to_string(), json!(let_dir.start));
    result.insert("end".to_string(), json!(let_dir.end));
    result.insert("type".to_string(), json!("Let"));
    result.insert("name".to_string(), json!(let_dir.name.as_str()));
    if let Some(ref name_loc) = let_dir.name_loc {
        result.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
    if let Some(ref expression) = let_dir.expression {
        result.insert("expression".to_string(), expression.as_json().clone());
    } else {
        result.insert("expression".to_string(), json!(null));
    }
    Value::Object(result)
}

// Helper functions

fn get_node_start(node: &TemplateNode) -> u32 {
    match node {
        TemplateNode::Text(n) => n.start,
        TemplateNode::Comment(n) => n.start,
        TemplateNode::ExpressionTag(n) => n.start,
        TemplateNode::HtmlTag(n) => n.start,
        TemplateNode::ConstTag(n) => n.start,
        TemplateNode::DebugTag(n) => n.start,
        TemplateNode::RenderTag(n) => n.start,
        TemplateNode::AttachTag(n) => n.start,
        TemplateNode::IfBlock(n) => n.start,
        TemplateNode::EachBlock(n) => n.start,
        TemplateNode::AwaitBlock(n) => n.start,
        TemplateNode::KeyBlock(n) => n.start,
        TemplateNode::SnippetBlock(n) => n.start,
        TemplateNode::RegularElement(n) => n.start,
        TemplateNode::Component(n) => n.start,
        TemplateNode::TitleElement(n) => n.start,
        TemplateNode::SlotElement(n) => n.start,
        TemplateNode::SvelteBody(n) => n.start,
        TemplateNode::SvelteComponent(n) => n.start,
        TemplateNode::SvelteDocument(n) => n.start,
        TemplateNode::SvelteElement(n) => n.start,
        TemplateNode::SvelteFragment(n) => n.start,
        TemplateNode::SvelteBoundary(n) => n.start,
        TemplateNode::SvelteHead(n) => n.start,
        TemplateNode::SvelteOptions(n) => n.start,
        TemplateNode::SvelteSelf(n) => n.start,
        TemplateNode::SvelteWindow(n) => n.start,
    }
}

fn get_node_end(node: &TemplateNode) -> u32 {
    match node {
        TemplateNode::Text(n) => n.end,
        TemplateNode::Comment(n) => n.end,
        TemplateNode::ExpressionTag(n) => n.end,
        TemplateNode::HtmlTag(n) => n.end,
        TemplateNode::ConstTag(n) => n.end,
        TemplateNode::DebugTag(n) => n.end,
        TemplateNode::RenderTag(n) => n.end,
        TemplateNode::AttachTag(n) => n.end,
        TemplateNode::IfBlock(n) => n.end,
        TemplateNode::EachBlock(n) => n.end,
        TemplateNode::AwaitBlock(n) => n.end,
        TemplateNode::KeyBlock(n) => n.end,
        TemplateNode::SnippetBlock(n) => n.end,
        TemplateNode::RegularElement(n) => n.end,
        TemplateNode::Component(n) => n.end,
        TemplateNode::TitleElement(n) => n.end,
        TemplateNode::SlotElement(n) => n.end,
        TemplateNode::SvelteBody(n) => n.end,
        TemplateNode::SvelteComponent(n) => n.end,
        TemplateNode::SvelteDocument(n) => n.end,
        TemplateNode::SvelteElement(n) => n.end,
        TemplateNode::SvelteFragment(n) => n.end,
        TemplateNode::SvelteBoundary(n) => n.end,
        TemplateNode::SvelteHead(n) => n.end,
        TemplateNode::SvelteOptions(n) => n.end,
        TemplateNode::SvelteSelf(n) => n.end,
        TemplateNode::SvelteWindow(n) => n.end,
    }
}

fn find_last_brace_before(source: &str, pos: usize) -> usize {
    let bytes = source.as_bytes();
    for i in (0..pos).rev() {
        if bytes.get(i) == Some(&b'{') {
            return i;
        }
    }
    pos
}

fn find_closing_brace_after(source: &str, pos: usize) -> usize {
    let bytes = source.as_bytes();
    for i in pos..source.len() {
        if bytes.get(i) == Some(&b'}') {
            return i + 1;
        }
    }
    pos
}

/// Remove surrounding whitespace text nodes from a list of nodes.
fn remove_surrounding_whitespace_nodes(nodes: &mut Vec<TemplateNode>) {
    // Handle first node
    if let Some(TemplateNode::Text(first)) = nodes.first_mut() {
        if !REGEX_NOT_WHITESPACE.is_match(&first.data) {
            nodes.remove(0);
        } else {
            let new_data = REGEX_STARTS_WITH_WHITESPACE.replace(&first.data, "");
            first.data = new_data.to_string().into();
            first.raw = first.data.clone();
        }
    }

    // Handle last node
    if let Some(TemplateNode::Text(last)) = nodes.last_mut() {
        if !REGEX_NOT_WHITESPACE.is_match(&last.data) {
            nodes.pop();
        } else {
            let new_data = REGEX_ENDS_WITH_WHITESPACE.replace(&last.data, "");
            last.data = new_data.to_string().into();
            last.raw = last.data.clone();
        }
    }
}
