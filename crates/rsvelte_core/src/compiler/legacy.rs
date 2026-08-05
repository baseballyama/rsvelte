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

use crate::ast::js::Expression;
use crate::ast::span::SourceLocation;
use crate::ast::{
    AnimateDirective, AttachTag, Attribute, AttributeNode, AttributeValue, AttributeValuePart,
    AwaitBlock, BindDirective, ClassDirective, Comment, Component, ConstTag, DebugTag, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, LetDirective, OnDirective, RegularElement,
    RenderTag, Root, Script, SlotElement, SnippetBlock, SpreadAttribute, StyleDirective,
    SvelteComponentElement, SvelteDynamicElement, SvelteElement, TemplateNode, Text, TitleElement,
    TransitionDirective, UseDirective,
};

/// Insert ESTree fields into an existing `Map`, in written order.
///
/// `serde_json` is built with `preserve_order`, so insertion order *is* the JSON
/// key order and therefore part of the legacy AST's compatibility contract. The
/// macro expands to plain sequential `insert` calls, keeping source order and
/// wire order identical. `"key": value` wraps `value` in `json!`; `"key" =>
/// value` inserts an existing `Value` verbatim.
macro_rules! estree_fields {
    ($obj:ident, $key:literal : $value:expr $(, $($rest:tt)*)?) => {
        $obj.insert($key.to_string(), json!($value));
        $( estree_fields!($obj, $($rest)*); )?
    };
    ($obj:ident, $key:literal => $value:expr $(, $($rest:tt)*)?) => {
        $obj.insert($key.to_string(), $value);
        $( estree_fields!($obj, $($rest)*); )?
    };
    ($obj:ident $(,)?) => {};
}

/// `estree_fields!` for a fresh object; evaluates to the built `Value::Object`.
macro_rules! estree_obj {
    ($($fields:tt)*) => {{
        let mut obj = Map::new();
        estree_fields!(obj, $($fields)*);
        Value::Object(obj)
    }};
}

// Regex patterns for whitespace handling
static REGEX_STARTS_WITH_WHITESPACE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[ \t\r\n]+").unwrap());
static REGEX_ENDS_WITH_WHITESPACE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"[ \t\r\n]+$").unwrap());
static REGEX_NOT_WHITESPACE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^ \t\r\n]").unwrap());

/// Converter from UTF-8 byte positions to UTF-16 code unit positions.
///
/// Public so the modern parse output paths (`wasm::parse_svelte`, the
/// `rsvelte_napi` bindings, and the raw-transfer envelope encoder) can reuse
/// the same remap the legacy path already applies, keeping every public AST
/// surface on svelte/compiler's UTF-16 offsets.
pub struct Utf8ToUtf16 {
    /// One UTF-16 offset per source byte (plus a trailing entry). `u32` rather
    /// than `usize` because source positions are u32-bounded across the compiler
    /// — this halves the per-byte table on 64-bit targets.
    utf16_pos: Vec<u32>,
    /// (byte offset, utf16 offset) for each line start
    line_starts_byte: Vec<usize>,
    line_starts_utf16: Vec<usize>,
}

impl Utf8ToUtf16 {
    pub fn new(source: &str) -> Self {
        let mut utf16_pos = Vec::with_capacity(source.len() + 1);
        let mut utf16_idx = 0usize;
        let mut line_starts_byte = vec![0];
        let mut line_starts_utf16 = vec![0];
        let mut byte_idx = 0;

        for c in source.chars() {
            let utf8_len = c.len_utf8();
            let utf16_len = c.len_utf16();
            for _ in 0..utf8_len {
                utf16_pos.push(utf16_idx as u32);
            }
            utf16_idx += utf16_len;
            byte_idx += utf8_len;

            if c == '\n' {
                line_starts_byte.push(byte_idx);
                line_starts_utf16.push(utf16_idx);
            }
        }
        utf16_pos.push(utf16_idx as u32);
        Self {
            utf16_pos,
            line_starts_byte,
            line_starts_utf16,
        }
    }

    #[doc(hidden)]
    pub fn convert(&self, utf8_pos: usize) -> usize {
        if utf8_pos >= self.utf16_pos.len() {
            self.utf16_pos.last().copied().unwrap_or(0) as usize
        } else {
            self.utf16_pos[utf8_pos] as usize
        }
    }

    /// Resolve a UTF-8 byte offset to a `(line, column, character)` triple where
    /// `line` is 1-based, and `column`/`character` are UTF-16 code-unit offsets
    /// (column measured from the line start). The precomputed per-byte table +
    /// binary search over line starts make this O(log lines), so converting many
    /// warning positions costs O(warnings) rather than O(sum of byte offsets).
    pub fn position(&self, byte_offset: usize) -> (usize, usize, usize) {
        let character = self.convert(byte_offset);
        // 1-based line = number of line starts at or before the offset; the
        // first entry is 0, so this is always >= 1.
        let line = self.line_starts_byte.partition_point(|&s| s <= byte_offset);
        let column = character - self.line_starts_utf16[line - 1];
        (line, column, character)
    }

    /// Convert a column from byte offset to UTF-16 code unit offset within a line.
    /// line is 1-based, column is 0-based byte offset from line start.
    #[doc(hidden)]
    pub fn convert_column(&self, line: usize, byte_column: usize) -> usize {
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
pub fn convert_positions_to_utf16(value: &mut Value, pos_conv: &Utf8ToUtf16) {
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
    // RAII install of the serialize arena so as_json() calls can resolve
    // JsNodeIds. The guard restores the prior pointer on drop, preserving
    // any outer scope (e.g. when this is invoked from inside `compile()`).
    //
    // SAFETY: `ast.arena` lives until `ast` is dropped at the end of
    // `convert_to_legacy_inner`, which runs *before* the guard is
    // dropped because `_guard` is declared first.
    let _guard = unsafe { crate::ast::arena::SerializeArenaGuard::new(&ast.arena as *const _) };
    convert_to_legacy_inner(source, ast)
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
    let html = estree_obj! {
        "type": "Fragment",
        "start": start,
        "end": end,
        "children" => children_json(source, &fragment_nodes, &[]),
    };
    estree_fields!(result, "html" => html);

    // Convert instance script
    if let Some(instance) = ast.instance {
        let mut script = convert_script(&instance);
        // Remove attributes field from instance
        script.remove("attributes");
        result.insert("instance".to_string(), Value::Object(script));
    }

    // Convert module script
    if let Some(module) = ast.module {
        let mut script = convert_script(&module);
        // Remove attributes field from module
        script.remove("attributes");
        result.insert("module".to_string(), Value::Object(script));
    }

    // Convert CSS
    if let Some(css) = ast.css {
        result.insert("css".to_string(), convert_css(&css));
    }

    // Emit `_comments` mirroring upstream `legacy.js`. The legacy AST uses
    // `_comments` (not `comments`) because the prettier plugin sniffs for
    // a top-level `comments` field. See upstream commit `92e2fc120`.
    if !ast.comments.is_empty() {
        let comments_value: Vec<Value> = ast
            .comments
            .iter()
            .map(serde_json::to_value)
            .collect::<Result<_, _>>()
            .unwrap_or_default();
        result.insert("_comments".to_string(), Value::Array(comments_value));
    }

    // Convert all positions from UTF-8 to UTF-16
    let pos_conv = Utf8ToUtf16::new(source);
    let mut final_result = Value::Object(result);
    convert_positions_to_utf16(&mut final_result, &pos_conv);

    final_result
}

/// Convert a `Script` AST node into the legacy JSON shape.
///
/// Returns a `Map` (not a `Value::Object`) so callers can mutate fields
/// directly — e.g. removing the `attributes` field for instance/module
/// scripts — without round-tripping through `as_object_mut().unwrap()`.
fn convert_script(script: &Script) -> Map<String, Value> {
    let mut result = Map::new();
    estree_fields!(
        result,
        "type": "Script",
        "start": script.start,
        "end": script.end,
        "context": script.context,
        "content" => script.content.as_json().clone(),
    );
    result
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
        TemplateNode::DeclarationTag(decl_tag) => convert_declaration_tag(decl_tag),
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
    estree_fields!(result, "type": "Text", "start": text.start, "end": text.end);
    if !in_style {
        estree_fields!(result, "raw": text.raw.as_ref());
    }
    estree_fields!(result, "data": text.data.as_ref());
    Value::Object(result)
}

fn convert_comment(comment: &Comment) -> Value {
    // Extract svelte-ignore directives
    let ignores = extract_svelte_ignore(&comment.data);

    estree_obj! {
        "type": "Comment",
        "start": comment.start,
        "end": comment.end,
        "data": comment.data.as_str(),
        "ignores": ignores,
    }
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
    // An expression tag whose parent is an Attribute is the `{id}` shorthand.
    let ty = if path.last() == Some(&"Attribute") {
        "AttributeShorthand"
    } else {
        "MustacheTag"
    };

    estree_obj! {
        "type": ty,
        "start": expr_tag.start,
        "end": expr_tag.end,
        "expression" => expr_tag.expression.as_json().clone(),
    }
}

fn convert_html_tag(html_tag: &HtmlTag) -> Value {
    estree_obj! {
        "type": "RawMustacheTag",
        "start": html_tag.start,
        "end": html_tag.end,
        "expression" => html_tag.expression.as_json().clone(),
    }
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

        return estree_obj! {
            "type": "ConstTag",
            "start": const_tag.start,
            "end": const_tag.end,
            "expression": json!({
                "type": "AssignmentExpression",
                "start": decl_start + 6, // Skip 'const '
                "end": decl_end,
                "operator": "=",
                "left": id,
                "right": init
            }),
        };
    }

    // Fallback
    json!({
        "type": "ConstTag",
        "start": const_tag.start,
        "end": const_tag.end,
        "expression": const_tag.declaration.as_json()
    })
}

/// Convert a `DeclarationTag` (`{let x = …}` / `{const x = …}`, Svelte 5.56.0
/// #18282) to legacy AST shape. The legacy AST mirrors the modern AST 1:1 for
/// this node (`type: "DeclarationTag"`, with the parsed `VariableDeclaration`
/// preserved under `declaration`); the `{@const}`-style synthesized
/// `AssignmentExpression` is intentionally NOT emitted because legacy
/// consumers (svelte2tsx, etc.) expect the declaration kind (`let` / `const`)
/// and may have multiple declarators.
fn convert_declaration_tag(decl_tag: &crate::ast::template::DeclarationTag) -> Value {
    estree_obj! {
        "type": "DeclarationTag",
        "start": decl_tag.start,
        "end": decl_tag.end,
        "declaration" => decl_tag.declaration.as_json().clone(),
    }
}

fn convert_debug_tag(debug_tag: &DebugTag) -> Value {
    estree_obj! {
        "type": "DebugTag",
        "start": debug_tag.start,
        "end": debug_tag.end,
        "identifiers": debug_tag
            .identifiers
            .iter()
            .map(|e| e.as_json().clone())
            .collect::<Vec<_>>(),
    }
}

fn convert_render_tag(render_tag: &RenderTag) -> Value {
    estree_obj! {
        "type": "RenderTag",
        "start": render_tag.start,
        "end": render_tag.end,
        "expression" => render_tag.expression.as_json().clone(),
    }
}

fn convert_attach_tag(attach_tag: &AttachTag) -> Value {
    estree_obj! {
        "type": "AttachTag",
        "start": attach_tag.start,
        "end": attach_tag.end,
        "expression" => attach_tag.expression.as_json().clone(),
    }
}

fn convert_if_block(source: &str, if_block: &IfBlock) -> Value {
    let mut else_block = None;

    if let Some(ref alternate) = if_block.alternate {
        // The child list whose first node gives the ElseBlock start; an else-if
        // chain unwraps to the inner if's consequent. Borrowed, not cloned — only
        // the first node's start is read here.
        let start_nodes: &[TemplateNode] = if alternate.nodes.len() == 1
            && let TemplateNode::IfBlock(inner_if) = &alternate.nodes[0]
            && inner_if.elseif
        {
            &inner_if.consequent.nodes
        } else {
            &alternate.nodes
        };

        let end = find_last_brace_before(source, if_block.end as usize);
        let start = start_nodes
            .first()
            .map(|n| get_node_start(n) as usize)
            .unwrap_or(end);

        // Remove surrounding whitespace from nodes
        let mut alt_nodes = alternate.nodes.clone();
        remove_surrounding_whitespace_nodes(&mut alt_nodes);

        else_block = Some(estree_obj! {
            "type": "ElseBlock",
            "start": start,
            "end": end,
            "children" => children_json(source, &alt_nodes, &[]),
        });
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
    estree_fields!(
        result,
        "type": "IfBlock",
        "start": start,
        "end": if_block.end,
        "expression" => if_block.test.as_json().clone(),
        "children" => children_json(source, &consequent_nodes, &[]),
    );
    if let Some(else_block) = else_block {
        estree_fields!(result, "else" => else_block);
    }
    if if_block.elseif {
        estree_fields!(result, "elseif": true);
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

        else_block = Some(estree_obj! {
            "type": "ElseBlock",
            "start": start,
            "end": end,
            "children" => children_json(source, &fallback_nodes, &[]),
        });
    }

    let mut body_nodes = each_block.body.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut body_nodes);

    let mut result = Map::new();
    estree_fields!(
        result,
        "type": "EachBlock",
        "start": each_block.start,
        "end": each_block.end,
        "children" => children_json(source, &body_nodes, &[]),
        "context" => each_block
            .context
            .as_ref()
            .map(|c| c.as_json().clone())
            .unwrap_or(json!(null)),
        "expression" => each_block.expression.as_json().clone(),
    );
    if let Some(ref index) = each_block.index {
        estree_fields!(result, "index": index.as_str());
    }
    if let Some(ref key) = each_block.key {
        estree_fields!(result, "key" => key.as_json().clone());
    }
    if let Some(else_block) = else_block {
        estree_fields!(result, "else" => else_block);
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

    // A branch that is absent in the source is emitted as a skipped placeholder.
    let skipped = |ty: &str| {
        estree_obj! {
            "type": ty,
            "start": json!(null),
            "end": json!(null),
            "children": [] as [Value; 0],
            "skip": true,
        }
    };

    let mut pending_block = skipped("PendingBlock");
    let mut then_block = skipped("ThenBlock");
    let mut catch_block = skipped("CatchBlock");

    if let Some(ref pending) = await_block.pending {
        let first_start = pending.nodes.first().map(|n| get_node_start(n) as usize);
        let last_end = pending.nodes.last().map(|n| get_node_end(n) as usize);

        let start = first_start.unwrap_or_else(|| find_closing_brace_after(source, expr_end));
        let end = last_end.unwrap_or(start);

        pending_block = estree_obj! {
            "type": "PendingBlock",
            "start": start,
            "end": end,
            "children" => children_json(source, &pending.nodes, &[]),
            "skip": false,
        };
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

        then_block = estree_obj! {
            "type": "ThenBlock",
            "start": start,
            "end": end,
            "children" => children_json(source, &then.nodes, &[]),
            "skip": false,
        };
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

        catch_block = estree_obj! {
            "type": "CatchBlock",
            "start": start,
            "end": end,
            "children" => children_json(source, &catch.nodes, &[]),
            "skip": false,
        };
    }

    estree_obj! {
        "type": "AwaitBlock",
        "start": await_block.start,
        "end": await_block.end,
        "expression" => await_block.expression.as_json().clone(),
        "value" => await_block
            .value
            .as_ref()
            .map(|v| v.as_json().clone())
            .unwrap_or(json!(null)),
        "error" => await_block
            .error
            .as_ref()
            .map(|e| e.as_json().clone())
            .unwrap_or(json!(null)),
        "pending" => pending_block,
        "then" => then_block,
        "catch" => catch_block,
    }
}

fn convert_key_block(source: &str, key_block: &KeyBlock) -> Value {
    let mut fragment_nodes = key_block.fragment.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut fragment_nodes);

    estree_obj! {
        "type": "KeyBlock",
        "start": key_block.start,
        "end": key_block.end,
        "expression" => key_block.expression.as_json().clone(),
        "children" => children_json(source, &fragment_nodes, &[]),
    }
}

fn convert_snippet_block(source: &str, snippet_block: &SnippetBlock) -> Value {
    let mut body_nodes = snippet_block.body.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut body_nodes);

    let mut result = Map::new();
    estree_fields!(
        result,
        "type": "SnippetBlock",
        "start": snippet_block.start,
        "end": snippet_block.end,
        "expression" => snippet_block.expression.as_json().clone(),
        "parameters": snippet_block
            .parameters
            .iter()
            .map(|p| p.as_json().clone())
            .collect::<Vec<_>>(),
        "children" => children_json(source, &body_nodes, &[]),
    );
    if let Some(ref type_params) = snippet_block.type_params {
        estree_fields!(result, "typeParams": type_params.as_str());
    }
    Value::Object(result)
}

// Element / InlineComponent / Slot (below) don't carry a `name_loc` in the
// legacy format, unlike their modern-AST counterparts.

/// `type`, `start`, `end`, `name`, `attributes`, `children` — the key order the
/// legacy AST uses for elements whose tag name comes from the source.
fn convert_element_like(
    source: &str,
    ty: &str,
    name: &str,
    start: u32,
    end: u32,
    attributes: &[Attribute],
    nodes: &[TemplateNode],
    path: &[&str],
) -> Value {
    estree_obj! {
        "type": ty,
        "start": start,
        "end": end,
        "name": name,
        "attributes" => attrs_json(source, attributes),
        "children" => children_json(source, nodes, path),
    }
}

/// `type`, `name`, `start`, `end`, `attributes`, `children` — the key order the
/// legacy AST uses for `<svelte:*>` elements, whose name is a fixed literal.
fn convert_svelte_element_like(
    source: &str,
    ty: &str,
    name: &str,
    element: &SvelteElement,
    nodes: &[TemplateNode],
) -> Value {
    estree_obj! {
        "type": ty,
        "name": name,
        "start": element.start,
        "end": element.end,
        "attributes" => attrs_json(source, &element.attributes),
        "children" => children_json(source, nodes, &[]),
    }
}

fn convert_regular_element(source: &str, element: &RegularElement) -> Value {
    let path: &[&str] = if element.name.as_str() == "style" {
        &["style"]
    } else {
        &[]
    };

    convert_element_like(
        source,
        "Element",
        element.name.as_str(),
        element.start,
        element.end,
        &element.attributes,
        &element.fragment.nodes,
        path,
    )
}

fn convert_component(source: &str, component: &Component) -> Value {
    convert_element_like(
        source,
        "InlineComponent",
        component.name.as_str(),
        component.start,
        component.end,
        &component.attributes,
        &component.fragment.nodes,
        &[],
    )
}

fn convert_title_element(source: &str, title: &TitleElement) -> Value {
    estree_obj! {
        "type": "Title",
        "name": "title",
        "start": title.start,
        "end": title.end,
        "attributes" => attrs_json(source, &title.attributes),
        "children" => children_json(source, &title.fragment.nodes, &[]),
    }
}

fn convert_slot_element(source: &str, slot: &SlotElement) -> Value {
    convert_element_like(
        source,
        "Slot",
        slot.name.as_str(),
        slot.start,
        slot.end,
        &slot.attributes,
        &slot.fragment.nodes,
        &[],
    )
}

fn convert_svelte_body(source: &str, element: &SvelteElement) -> Value {
    convert_svelte_element_like(
        source,
        "Body",
        "svelte:body",
        element,
        &element.fragment.nodes,
    )
}

fn convert_svelte_component(source: &str, element: &SvelteComponentElement) -> Value {
    estree_obj! {
        "type": "InlineComponent",
        "name": "svelte:component",
        "start": element.start,
        "end": element.end,
        "expression" => element.expression.as_json().clone(),
        "attributes" => attrs_json(source, &element.attributes),
        "children" => children_json(source, &element.fragment.nodes, &[]),
    }
}

fn convert_svelte_document(source: &str, element: &SvelteElement) -> Value {
    convert_svelte_element_like(
        source,
        "Document",
        "svelte:document",
        element,
        &element.fragment.nodes,
    )
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

    estree_obj! {
        "type": "Element",
        "name": "svelte:element",
        "start": element.start,
        "end": element.end,
        "tag" => tag,
        "attributes" => attrs_json(source, &element.attributes),
        "children" => children_json(source, &element.fragment.nodes, &[]),
    }
}

fn convert_svelte_fragment(source: &str, element: &SvelteElement) -> Value {
    convert_svelte_element_like(
        source,
        "SlotTemplate",
        "svelte:fragment",
        element,
        &element.fragment.nodes,
    )
}

fn convert_svelte_boundary(source: &str, element: &SvelteElement) -> Value {
    let mut fragment_nodes = element.fragment.nodes.clone();
    remove_surrounding_whitespace_nodes(&mut fragment_nodes);

    convert_svelte_element_like(
        source,
        "SvelteBoundary",
        "svelte:boundary",
        element,
        &fragment_nodes,
    )
}

fn convert_svelte_head(source: &str, element: &SvelteElement) -> Value {
    convert_svelte_element_like(
        source,
        "Head",
        "svelte:head",
        element,
        &element.fragment.nodes,
    )
}

fn convert_svelte_options(element: &SvelteElement) -> Value {
    estree_obj! {
        "type": "Options",
        "name": "svelte:options",
        "start": element.start,
        "end": element.end,
        "attributes": element
            .attributes
            .iter()
            .filter_map(|a| {
                if let Attribute::Attribute(attr) = a {
                    Some(convert_attribute_node(attr))
                } else {
                    None
                }
            })
            .collect::<Vec<_>>(),
    }
}

fn convert_svelte_self(source: &str, element: &SvelteElement) -> Value {
    convert_svelte_element_like(
        source,
        "InlineComponent",
        "svelte:self",
        element,
        &element.fragment.nodes,
    )
}

fn convert_svelte_window(source: &str, element: &SvelteElement) -> Value {
    convert_svelte_element_like(
        source,
        "Window",
        "svelte:window",
        element,
        &element.fragment.nodes,
    )
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
    estree_fields!(
        result,
        "type": "Attribute",
        "start": attr.start,
        "end": attr.end,
        "name": attr.name.as_str(),
    );
    push_name_loc(&mut result, attr.name_loc.as_ref());
    estree_fields!(result, "value" => value);
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
    estree_obj! {
        "type": "Spread",
        "start": spread.start,
        "end": spread.end,
        "expression" => spread.expression.as_json().clone(),
    }
}

fn convert_bind_directive(bind: &BindDirective) -> Value {
    let mut result = directive_head(
        bind.start,
        bind.end,
        "Binding",
        &bind.name,
        bind.name_loc.as_ref(),
    );

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

    estree_fields!(
        result,
        "expression" => expression,
        "modifiers": bind.modifiers,
    );
    Value::Object(result)
}

fn convert_on_directive(on: &OnDirective) -> Value {
    let mut result = directive_head(
        on.start,
        on.end,
        "EventHandler",
        &on.name,
        on.name_loc.as_ref(),
    );
    estree_fields!(
        result,
        "expression" => on
            .expression
            .as_ref()
            .map(|e| e.as_json().clone())
            .unwrap_or(json!(null)),
        "modifiers": on.modifiers,
    );
    Value::Object(result)
}

fn convert_class_directive(class: &ClassDirective) -> Value {
    let mut result = directive_head(
        class.start,
        class.end,
        "Class",
        &class.name,
        class.name_loc.as_ref(),
    );
    estree_fields!(
        result,
        "expression" => class.expression.as_json().clone(),
        "modifiers": [] as [Value; 0],
    );
    Value::Object(result)
}

fn convert_style_directive(_source: &str, style: &StyleDirective) -> Value {
    let mustache = |expr_tag: &ExpressionTag| {
        estree_obj! {
            "type": "MustacheTag",
            "start": expr_tag.start,
            "end": expr_tag.end,
            "expression" => expr_tag.expression.as_json().clone(),
        }
    };

    let value = match &style.value {
        AttributeValue::True(true) => json!(true),
        AttributeValue::True(false) => json!(false),
        AttributeValue::Expression(expr_tag) => json!([mustache(expr_tag)]),
        AttributeValue::Sequence(parts) => {
            json!(
                parts
                    .iter()
                    .map(|part| match part {
                        AttributeValuePart::Text(text) => convert_text(text, &[]),
                        AttributeValuePart::ExpressionTag(expr_tag) => mustache(expr_tag),
                    })
                    .collect::<Vec<_>>()
            )
        }
    };

    let mut result = Map::new();
    estree_fields!(
        result,
        "type": "StyleDirective",
        "start": style.start,
        "end": style.end,
        "name": style.name.as_str(),
    );
    push_name_loc(&mut result, style.name_loc.as_ref());
    estree_fields!(
        result,
        "value" => value,
        "modifiers": style.modifiers,
    );
    Value::Object(result)
}

fn convert_transition_directive(transition: &TransitionDirective) -> Value {
    let mut result = directive_head(
        transition.start,
        transition.end,
        "Transition",
        &transition.name,
        transition.name_loc.as_ref(),
    );
    estree_fields!(
        result,
        "expression" => optional_expression(transition.expression.as_ref()),
        "modifiers": transition.modifiers,
        "intro": transition.intro,
        "outro": transition.outro,
    );
    Value::Object(result)
}

fn convert_animate_directive(animate: &AnimateDirective) -> Value {
    let mut result = directive_head(
        animate.start,
        animate.end,
        "Animation",
        &animate.name,
        animate.name_loc.as_ref(),
    );
    estree_fields!(
        result,
        "expression" => optional_expression(animate.expression.as_ref()),
        "modifiers": [] as [Value; 0],
    );
    Value::Object(result)
}

fn convert_use_directive(use_dir: &UseDirective) -> Value {
    let mut result = directive_head(
        use_dir.start,
        use_dir.end,
        "Action",
        &use_dir.name,
        use_dir.name_loc.as_ref(),
    );
    estree_fields!(
        result,
        "expression" => optional_expression(use_dir.expression.as_ref()),
        "modifiers": [] as [Value; 0],
    );
    Value::Object(result)
}

fn convert_let_directive(let_dir: &LetDirective) -> Value {
    let mut result = directive_head(
        let_dir.start,
        let_dir.end,
        "Let",
        &let_dir.name,
        let_dir.name_loc.as_ref(),
    );
    estree_fields!(
        result,
        "expression" => optional_expression(let_dir.expression.as_ref()),
    );
    Value::Object(result)
}

// Helper functions

fn attrs_json(source: &str, attributes: &[Attribute]) -> Value {
    json!(
        attributes
            .iter()
            .map(|a| convert_attribute(source, a))
            .collect::<Vec<_>>()
    )
}

fn children_json(source: &str, nodes: &[TemplateNode], path: &[&str]) -> Value {
    json!(
        nodes
            .iter()
            .map(|n| convert_node(source, n, path))
            .collect::<Vec<_>>()
    )
}

/// `name_loc` is emitted only when the modern AST carries one, and always
/// directly after `name`.
fn push_name_loc(obj: &mut Map<String, Value>, name_loc: Option<&SourceLocation>) {
    if let Some(name_loc) = name_loc {
        obj.insert(
            "name_loc".to_string(),
            serde_json::to_value(name_loc).unwrap(),
        );
    }
}

/// The `start`, `end`, `type`, `name`, `name_loc` prefix shared by every legacy
/// directive node. Callers append the node-specific fields.
fn directive_head(
    start: u32,
    end: u32,
    ty: &str,
    name: &str,
    name_loc: Option<&SourceLocation>,
) -> Map<String, Value> {
    let mut obj = Map::new();
    estree_fields!(obj, "start": start, "end": end, "type": ty, "name": name);
    push_name_loc(&mut obj, name_loc);
    obj
}

fn optional_expression(expression: Option<&Expression>) -> Value {
    expression
        .map(|e| e.as_json().clone())
        .unwrap_or(json!(null))
}

/// Common start/end span accessors for `TemplateNode` variants. Replaces a
/// pair of 28-arm matches (one per accessor) with a single merged-arm
/// implementation — every variant's inner node carries plain `start`/`end`
/// fields, and the 8 `Svelte*` variants sharing the `SvelteElement` inner
/// type merge into one arm each.
trait Spanned {
    fn start(&self) -> u32;
    fn end(&self) -> u32;
}

impl Spanned for TemplateNode<'_> {
    fn start(&self) -> u32 {
        match self {
            TemplateNode::Text(n) => n.start,
            TemplateNode::Comment(n) => n.start,
            TemplateNode::ExpressionTag(n) => n.start,
            TemplateNode::HtmlTag(n) => n.start,
            TemplateNode::ConstTag(n) => n.start,
            TemplateNode::DeclarationTag(n) => n.start,
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
            TemplateNode::SvelteComponent(n) => n.start,
            TemplateNode::SvelteElement(n) => n.start,
            TemplateNode::SvelteBody(n)
            | TemplateNode::SvelteDocument(n)
            | TemplateNode::SvelteFragment(n)
            | TemplateNode::SvelteBoundary(n)
            | TemplateNode::SvelteHead(n)
            | TemplateNode::SvelteOptions(n)
            | TemplateNode::SvelteSelf(n)
            | TemplateNode::SvelteWindow(n) => n.start,
        }
    }

    fn end(&self) -> u32 {
        match self {
            TemplateNode::Text(n) => n.end,
            TemplateNode::Comment(n) => n.end,
            TemplateNode::ExpressionTag(n) => n.end,
            TemplateNode::HtmlTag(n) => n.end,
            TemplateNode::ConstTag(n) => n.end,
            TemplateNode::DeclarationTag(n) => n.end,
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
            TemplateNode::SvelteComponent(n) => n.end,
            TemplateNode::SvelteElement(n) => n.end,
            TemplateNode::SvelteBody(n)
            | TemplateNode::SvelteDocument(n)
            | TemplateNode::SvelteFragment(n)
            | TemplateNode::SvelteBoundary(n)
            | TemplateNode::SvelteHead(n)
            | TemplateNode::SvelteOptions(n)
            | TemplateNode::SvelteSelf(n)
            | TemplateNode::SvelteWindow(n) => n.end,
        }
    }
}

fn get_node_start(node: &TemplateNode) -> u32 {
    node.start()
}

fn get_node_end(node: &TemplateNode) -> u32 {
    node.end()
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

#[cfg(test)]
mod utf16_offset_tests {
    use super::{Utf8ToUtf16, convert_positions_to_utf16};
    use crate::ast::arena::with_serialize_arena;
    use crate::compiler::phases::phase1_parse::{ParseOptions, parse};
    use serde_json::Value;

    /// Walk the AST JSON and, for every `Identifier`, assert that the UTF-16
    /// slice `[start, end)` of the source equals the identifier's `name`.
    fn assert_identifiers_utf16_aligned(value: &Value, utf16: &[u16]) {
        match value {
            Value::Object(map) => {
                if map.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                    && let (Some(name), Some(start), Some(end)) = (
                        map.get("name").and_then(|v| v.as_str()),
                        map.get("start").and_then(|v| v.as_u64()),
                        map.get("end").and_then(|v| v.as_u64()),
                    )
                {
                    let (s, e) = (start as usize, end as usize);
                    assert!(
                        e <= utf16.len(),
                        "end {e} out of bounds (len {})",
                        utf16.len()
                    );
                    let slice = String::from_utf16(&utf16[s..e]).unwrap();
                    assert_eq!(
                        slice, name,
                        "identifier '{name}' span {s}..{e} sliced to '{slice}'"
                    );
                }
                for v in map.values() {
                    assert_identifiers_utf16_aligned(v, utf16);
                }
            }
            Value::Array(arr) => {
                for v in arr {
                    assert_identifiers_utf16_aligned(v, utf16);
                }
            }
            _ => {}
        }
    }

    /// Mirrors exactly what `wasm::parse_svelte` / `napi::parse` do for the
    /// non-ASCII path: serialize the modern AST to a Value and remap byte
    /// offsets to UTF-16 (#793).
    #[test]
    fn modern_parse_emits_utf16_offsets() {
        // 'あ' is 3 UTF-8 bytes but 1 UTF-16 code unit.
        let src = "<script>\n  const あ = 1;\n  const target = あ;\n</script>\n<p>{target}</p>";
        let ast = parse(
            src,
            &oxc_allocator::Allocator::default(),
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .unwrap();
        let mut value = with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap());
        let conv = Utf8ToUtf16::new(src);
        convert_positions_to_utf16(&mut value, &conv);

        let utf16: Vec<u16> = src.encode_utf16().collect();
        assert_identifiers_utf16_aligned(&value, &utf16);
    }

    #[test]
    fn ascii_offsets_unchanged_by_remap() {
        let src = "<script>\n  const target = 1;\n</script>\n<p>{target}</p>";
        let ast = parse(
            src,
            &oxc_allocator::Allocator::default(),
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .unwrap();
        let before = with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap());
        let mut after = before.clone();
        let conv = Utf8ToUtf16::new(src);
        convert_positions_to_utf16(&mut after, &conv);
        // For pure-ASCII source the remap must be a no-op.
        assert_eq!(before, after);
    }
}
