//! Raw-transfer envelope format for `parse()`.
//!
//! Inspired by oxc's `raw_transfer` mode: encode the AST into a single
//! contiguous binary buffer, cross the NAPI boundary as one `Buffer`,
//! and let the JS side decode each node by reading bytes via
//! `DataView`. Avoids `JSON.parse`'s tokenization cost — the dominant
//! overhead in the rsvelte + svelte-eslint-parser pipeline.
//!
//! ## Coverage
//!
//! - **Binary**: `Root`, `Fragment`, every `TemplateNode` variant
//!   (Text, Comment, ExpressionTag, HtmlTag, ConstTag, DebugTag,
//!   RenderTag, AttachTag, IfBlock, EachBlock, AwaitBlock, KeyBlock,
//!   SnippetBlock, RegularElement, Component, TitleElement,
//!   SlotElement, SvelteBody/Document/Fragment/Boundary/Head/Options/
//!   Self/Window, SvelteComponent, SvelteElement), every `Attribute`
//!   variant (Attribute, SpreadAttribute, AttachTag-as-attr, all eight
//!   directives), `AttributeValue` and `AttributeValuePart`, `Script`,
//!   `JsComment`, `SourceLocation`, and every one of the **74 JsNode
//!   variants** (estree expressions and statements, plus a handful of
//!   TS bridge variants).
//! - **JSON fallback (`TAG_JSON`)**: the entire `StyleSheet` sub-tree,
//!   `SvelteOptions`, `TransitionDirective`/`AnimateDirective`
//!   `metadata`, and `Root.js`. These are rare and have many optional
//!   fields; switching them to dedicated tags is a follow-up.
//!
//! ## Envelope v1 layout
//!
//! ```text
//! offset  size  field
//! 0       4     magic        "RPV1" (0x31_56_50_52 LE)
//! 4       4     version      u32 LE
//! 8       4     total_len    u32 LE — matches buffer.byteLength
//! 12      4     root_offset  u32 LE — start of the root node
//! 16      4     source_len   u32 LE
//! 20      4     flags        u32 LE — see FLAG_* constants
//! 24..    var   body         packed node stream
//! ```
//!
//! ## Per-node layout
//!
//! Every node begins with a 9-byte preamble:
//!
//! ```text
//! 0   1   tag    u8
//! 1   4   start  u32 LE
//! 5   4   end    u32 LE
//! ```
//!
//! followed by a payload whose shape depends on the tag. See the
//! `write_*` helpers below for the canonical wire layouts.

use serde::Serialize;

use crate::ast::arena::{IdRange, JsNodeId, ParseArena};
use crate::ast::template::*;
use crate::ast::typed_expr::{JsNode, LiteralValue, Loc, RegexValue, TemplateElementValue};

pub const MAGIC: u32 = 0x3156_5052; // "RPV1" little-endian
pub const VERSION: u32 = 1;
pub const HEADER_LEN: usize = 24;

// Header `flags` word (offset 20):
//   bit 0 — every JsNode in this envelope has `loc == None`. The decoder
//           can skip the per-node loc-flag byte and reconstruct `loc`
//           as absent without reading any payload.
//   bit 1 — the CSS `StyleSheet` body has been omitted. The encoder
//           writes only the outer `start` / `end` and the decoder
//           reconstructs an empty stub: `{ type: "StyleSheet", start,
//           end, attributes: [], children: [], content: { start, end,
//           styles: "", comment: null } }`. Use when the downstream
//           pipeline re-parses the `<style>` content with its own
//           CSS parser (e.g. `svelte-eslint-parser` uses postcss).
pub const FLAG_JSNODE_NO_LOC: u32 = 1 << 0;
pub const FLAG_CSS_STUB_ONLY: u32 = 1 << 1;

// ---------------------------------------------------------------------------
// Tag identifiers
// ---------------------------------------------------------------------------
//
// Layout:
//   0x00..0x0F  framework
//   0x10..0x1F  text / tags
//   0x20..0x3F  element variants
//   0x40..0x4F  script / options / misc
//   0x50..0x6F  attributes / directives / attribute values
//   0x70..0x7F  block variants
//   0x80..0xCB  JsNode (estree) variants
//
// Reserved ranges leave room for future growth without renumbering.

pub const TAG_JSON: u8 = 0x00;
pub const TAG_ROOT: u8 = 0x01;
pub const TAG_FRAGMENT: u8 = 0x02;
pub const TAG_JS_COMMENT: u8 = 0x03;

pub const TAG_TEXT: u8 = 0x10;
pub const TAG_COMMENT: u8 = 0x11;
pub const TAG_EXPRESSION_TAG: u8 = 0x12;
pub const TAG_HTML_TAG: u8 = 0x13;
pub const TAG_CONST_TAG: u8 = 0x14;
pub const TAG_DEBUG_TAG: u8 = 0x15;
pub const TAG_RENDER_TAG: u8 = 0x16;
pub const TAG_ATTACH_TAG: u8 = 0x17;
pub const TAG_DECLARATION_TAG: u8 = 0x18;

pub const TAG_REGULAR_ELEMENT: u8 = 0x20;
pub const TAG_COMPONENT: u8 = 0x21;
pub const TAG_TITLE_ELEMENT: u8 = 0x22;
pub const TAG_SLOT_ELEMENT: u8 = 0x23;
pub const TAG_SVELTE_BODY: u8 = 0x24;
pub const TAG_SVELTE_DOCUMENT: u8 = 0x25;
pub const TAG_SVELTE_FRAGMENT: u8 = 0x26;
pub const TAG_SVELTE_BOUNDARY: u8 = 0x27;
pub const TAG_SVELTE_HEAD: u8 = 0x28;
pub const TAG_SVELTE_OPTIONS_EL: u8 = 0x29;
pub const TAG_SVELTE_SELF: u8 = 0x2A;
pub const TAG_SVELTE_WINDOW: u8 = 0x2B;
pub const TAG_SVELTE_COMPONENT: u8 = 0x2C;
pub const TAG_SVELTE_ELEMENT: u8 = 0x2D;

pub const TAG_SCRIPT: u8 = 0x40;
pub const TAG_SVELTE_OPTIONS: u8 = 0x41;

pub const TAG_ATTRIBUTE: u8 = 0x50;
pub const TAG_SPREAD_ATTRIBUTE: u8 = 0x51;
// 0x17 (TAG_ATTACH_TAG) is reused when AttachTag appears in an attribute list.
pub const TAG_BIND_DIRECTIVE: u8 = 0x52;
pub const TAG_ON_DIRECTIVE: u8 = 0x53;
pub const TAG_CLASS_DIRECTIVE: u8 = 0x54;
pub const TAG_STYLE_DIRECTIVE: u8 = 0x55;
pub const TAG_TRANSITION_DIRECTIVE: u8 = 0x56;
pub const TAG_ANIMATE_DIRECTIVE: u8 = 0x57;
pub const TAG_USE_DIRECTIVE: u8 = 0x58;
pub const TAG_LET_DIRECTIVE: u8 = 0x59;

// `AttributeValue::True` doesn't carry start/end (the JSON form is
// just the boolean literal `true`), so it gets a tag without a
// preamble — see `write_attribute_value`.
pub const ATTRVAL_TRUE: u8 = 0x60;
pub const ATTRVAL_EXPRESSION: u8 = 0x61;
pub const ATTRVAL_SEQUENCE: u8 = 0x62;

pub const TAG_IF_BLOCK: u8 = 0x70;
pub const TAG_EACH_BLOCK: u8 = 0x71;
pub const TAG_AWAIT_BLOCK: u8 = 0x72;
pub const TAG_KEY_BLOCK: u8 = 0x73;
pub const TAG_SNIPPET_BLOCK: u8 = 0x74;

// JsNode tags: 0x80..0xCB — 74 variants in JsNode enum declaration order.
pub const JS_IDENTIFIER: u8 = 0x80;
pub const JS_PRIVATE_IDENTIFIER: u8 = 0x81;
pub const JS_LITERAL: u8 = 0x82;
pub const JS_BINARY_EXPRESSION: u8 = 0x83;
pub const JS_LOGICAL_EXPRESSION: u8 = 0x84;
pub const JS_UNARY_EXPRESSION: u8 = 0x85;
pub const JS_CONDITIONAL_EXPRESSION: u8 = 0x86;
pub const JS_CALL_EXPRESSION: u8 = 0x87;
pub const JS_MEMBER_EXPRESSION: u8 = 0x88;
pub const JS_NEW_EXPRESSION: u8 = 0x89;
pub const JS_FUNCTION_EXPRESSION: u8 = 0x8A;
pub const JS_CLASS_EXPRESSION: u8 = 0x8B;
pub const JS_ARROW_FUNCTION_EXPRESSION: u8 = 0x8C;
pub const JS_ASSIGNMENT_EXPRESSION: u8 = 0x8D;
pub const JS_UPDATE_EXPRESSION: u8 = 0x8E;
pub const JS_SEQUENCE_EXPRESSION: u8 = 0x8F;
pub const JS_ARRAY_EXPRESSION: u8 = 0x90;
pub const JS_OBJECT_EXPRESSION: u8 = 0x91;
pub const JS_TEMPLATE_LITERAL: u8 = 0x92;
pub const JS_TAGGED_TEMPLATE_EXPRESSION: u8 = 0x93;
pub const JS_TEMPLATE_ELEMENT: u8 = 0x94;
pub const JS_THIS_EXPRESSION: u8 = 0x95;
pub const JS_SUPER: u8 = 0x96;
pub const JS_IMPORT_EXPRESSION: u8 = 0x97;
pub const JS_AWAIT_EXPRESSION: u8 = 0x98;
pub const JS_YIELD_EXPRESSION: u8 = 0x99;
pub const JS_CHAIN_EXPRESSION: u8 = 0x9A;
pub const JS_META_PROPERTY: u8 = 0x9B;
pub const JS_SPREAD_ELEMENT: u8 = 0x9C;
pub const JS_OBJECT_PATTERN: u8 = 0x9D;
pub const JS_ARRAY_PATTERN: u8 = 0x9E;
pub const JS_ASSIGNMENT_PATTERN: u8 = 0x9F;
pub const JS_REST_ELEMENT: u8 = 0xA0;
pub const JS_PROPERTY: u8 = 0xA1;
pub const JS_PROGRAM: u8 = 0xA2;
pub const JS_EXPRESSION_STATEMENT: u8 = 0xA3;
pub const JS_BLOCK_STATEMENT: u8 = 0xA4;
pub const JS_VARIABLE_DECLARATION: u8 = 0xA5;
pub const JS_VARIABLE_DECLARATOR: u8 = 0xA6;
pub const JS_FUNCTION_DECLARATION: u8 = 0xA7;
pub const JS_CLASS_DECLARATION: u8 = 0xA8;
pub const JS_RETURN_STATEMENT: u8 = 0xA9;
pub const JS_THROW_STATEMENT: u8 = 0xAA;
pub const JS_IF_STATEMENT: u8 = 0xAB;
pub const JS_FOR_STATEMENT: u8 = 0xAC;
pub const JS_FOR_OF_STATEMENT: u8 = 0xAD;
pub const JS_FOR_IN_STATEMENT: u8 = 0xAE;
pub const JS_WHILE_STATEMENT: u8 = 0xAF;
pub const JS_DO_WHILE_STATEMENT: u8 = 0xB0;
pub const JS_TRY_STATEMENT: u8 = 0xB1;
pub const JS_CATCH_CLAUSE: u8 = 0xB2;
pub const JS_SWITCH_STATEMENT: u8 = 0xB3;
pub const JS_SWITCH_CASE: u8 = 0xB4;
pub const JS_LABELED_STATEMENT: u8 = 0xB5;
pub const JS_BREAK_STATEMENT: u8 = 0xB6;
pub const JS_CONTINUE_STATEMENT: u8 = 0xB7;
pub const JS_EMPTY_STATEMENT: u8 = 0xB8;
pub const JS_DEBUGGER_STATEMENT: u8 = 0xB9;
pub const JS_IMPORT_DECLARATION: u8 = 0xBA;
pub const JS_IMPORT_SPECIFIER: u8 = 0xBB;
pub const JS_IMPORT_DEFAULT_SPECIFIER: u8 = 0xBC;
pub const JS_IMPORT_NAMESPACE_SPECIFIER: u8 = 0xBD;
pub const JS_EXPORT_NAMED_DECLARATION: u8 = 0xBE;
pub const JS_EXPORT_DEFAULT_DECLARATION: u8 = 0xBF;
pub const JS_EXPORT_SPECIFIER: u8 = 0xC0;
pub const JS_CLASS_BODY: u8 = 0xC1;
pub const JS_METHOD_DEFINITION: u8 = 0xC2;
pub const JS_PROPERTY_DEFINITION: u8 = 0xC3;
pub const JS_STATIC_BLOCK: u8 = 0xC4;
pub const JS_DECORATOR: u8 = 0xC5;
pub const JS_TS_TYPE_ANNOTATION: u8 = 0xC6;
pub const JS_TS_ENUM_DECLARATION: u8 = 0xC7;
pub const JS_TS_MODULE_DECLARATION: u8 = 0xC8;
pub const JS_COMMENT: u8 = 0xC9;
// Special sentinels for the JsNode null/raw fallback variants — they
// don't fit the normal preamble-with-positions shape.
pub const JS_NULL: u8 = 0xCA;
pub const JS_RAW_JSON: u8 = 0xCB;

// LiteralValue inner tag (within a JS_LITERAL payload).
const LV_NULL: u8 = 0;
const LV_BOOL_FALSE: u8 = 1;
const LV_BOOL_TRUE: u8 = 2;
const LV_NUMBER_I64: u8 = 3;
const LV_NUMBER_F64: u8 = 4;
const LV_STRING: u8 = 5;
const LV_REGEX: u8 = 6;

// ---------------------------------------------------------------------------
// Writer trait + Vec impl
// ---------------------------------------------------------------------------

/// Append-only byte writer. Mirrors `napi_raw::Writer` but stays
/// independent so the compile envelope and the parse envelope can
/// evolve separately.
pub trait Writer {
    fn write_bytes(&mut self, bytes: &[u8]);
    fn position(&self) -> usize;
    fn patch_u32(&mut self, offset: usize, value: u32);
}

impl Writer for Vec<u8> {
    #[inline]
    fn write_bytes(&mut self, bytes: &[u8]) {
        self.extend_from_slice(bytes);
    }
    #[inline]
    fn position(&self) -> usize {
        self.len()
    }
    #[inline]
    fn patch_u32(&mut self, offset: usize, value: u32) {
        self[offset..offset + 4].copy_from_slice(&value.to_le_bytes());
    }
}

#[inline]
fn write_u8<W: Writer>(w: &mut W, v: u8) {
    w.write_bytes(&[v]);
}
#[inline]
fn write_u32<W: Writer>(w: &mut W, v: u32) {
    w.write_bytes(&v.to_le_bytes());
}
#[inline]
fn write_bool<W: Writer>(w: &mut W, v: bool) {
    w.write_bytes(&[u8::from(v)]);
}
#[inline]
fn write_str<W: Writer>(w: &mut W, s: &str) {
    write_u32(w, s.len() as u32);
    w.write_bytes(s.as_bytes());
}
#[inline]
fn write_opt_str<W: Writer>(w: &mut W, s: Option<&str>) {
    match s {
        Some(s) => {
            write_u8(w, 1);
            write_str(w, s);
        }
        None => write_u8(w, 0),
    }
}
#[inline]
fn write_preamble<W: Writer>(w: &mut W, tag: u8, start: u32, end: u32) {
    write_u8(w, tag);
    write_u32(w, conv_off(start));
    write_u32(w, conv_off(end));
}

/// Serialize a `SourceLocation` as 24 bytes — flattens the nested
/// `{ start: {line, column, character}, end: {…} }` JSON shape into
/// six u32s. The decoder rebuilds the object form.
fn write_source_location<W: Writer>(w: &mut W, loc: &crate::ast::span::SourceLocation) {
    write_u32(w, loc.start.line);
    write_u32(w, conv_col(loc.start.line, loc.start.column));
    write_u32(w, conv_off(loc.start.character));
    write_u32(w, loc.end.line);
    write_u32(w, conv_col(loc.end.line, loc.end.column));
    write_u32(w, conv_off(loc.end.character));
}
fn write_opt_source_location<W: Writer>(w: &mut W, loc: Option<&crate::ast::span::SourceLocation>) {
    match loc {
        Some(loc) => {
            write_u8(w, 1);
            write_source_location(w, loc);
        }
        None => write_u8(w, 0),
    }
}

/// Write a list of `CompactString` modifiers as `[u32 count][str…]`.
fn write_modifiers<W: Writer>(w: &mut W, mods: &[compact_str::CompactString]) {
    write_u32(w, mods.len() as u32);
    for m in mods {
        write_str(w, m.as_str());
    }
}

// ---------------------------------------------------------------------------
// TAG_JSON — fallback for nodes whose shape we haven't tagged yet
// ---------------------------------------------------------------------------

/// Stream a `Serialize` value as length-prefixed JSON behind
/// `TAG_JSON`. Used by callers that need to inline a sub-tree as
/// JSON (`StyleSheet`, `SvelteOptions`, directive `metadata`, …).
fn write_json_node<W: Writer, T: Serialize + ?Sized>(
    w: &mut W,
    start: u32,
    end: u32,
    value: &T,
) -> std::io::Result<()> {
    write_preamble(w, TAG_JSON, start, end);
    let len_slot = w.position();
    write_u32(w, 0);
    let payload_start = w.position();
    struct WriterAdapter<'a, W2: Writer>(&'a mut W2);
    impl<W2: Writer> std::io::Write for WriterAdapter<'_, W2> {
        #[inline]
        fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
            self.0.write_bytes(bytes);
            Ok(bytes.len())
        }
        #[inline]
        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }
    let mut shim = WriterAdapter(w);
    if offset_remap_active() {
        // The embedded JSON sub-tree carries byte offsets too; remap them to
        // UTF-16 so the whole envelope is consistent (#793). Only pay the
        // serialize-to-Value round-trip when a remap is actually active.
        let mut json_value = serde_json::to_value(value).map_err(std::io::Error::other)?;
        OFFSET_CONV.with(|c| {
            if let Some(conv) = &*c.borrow() {
                crate::compiler::legacy::convert_positions_to_utf16(&mut json_value, conv);
            }
        });
        serde_json::to_writer(&mut shim, &json_value).map_err(std::io::Error::other)?;
    } else {
        serde_json::to_writer(&mut shim, value).map_err(std::io::Error::other)?;
    }
    let payload_end = shim.0.position();
    w.patch_u32(len_slot, (payload_end - payload_start) as u32);
    Ok(())
}

/// Inline an `Expression` as a binary JsNode sub-tree when typed; fall
/// back to JSON for the legacy `Value` representation.
fn write_expression<W: Writer>(
    w: &mut W,
    expr: &crate::ast::js::Expression,
) -> std::io::Result<()> {
    use crate::ast::js::Expression;
    match expr {
        Expression::Typed(te) => crate::ast::arena::with_current_serialize_arena(|arena| {
            write_js_node(w, &te.node, arena)
        }),
        Expression::Lazy { start, end, .. } => write_json_node(w, *start, *end, expr),
        Expression::Value(_) => write_json_node(w, u32::MAX, u32::MAX, expr),
    }
}
fn write_opt_expression<W: Writer>(
    w: &mut W,
    expr: Option<&crate::ast::js::Expression>,
) -> std::io::Result<()> {
    match expr {
        Some(e) => {
            write_u8(w, 1);
            write_expression(w, e)
        }
        None => {
            write_u8(w, 0);
            Ok(())
        }
    }
}

// ---------------------------------------------------------------------------
// JsNode helpers
// ---------------------------------------------------------------------------

// Skip the loc-flag write when the encoder is in "no JsNode loc" mode.
// Set by `encode_root_into` when the caller passed `skip_expression_loc`,
// which guarantees every JsNode has `loc: None`.
thread_local! {
    static SKIP_JSNODE_LOC: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
    // Emit only a stub for the `Root.css` payload. Mirrors
    // `FLAG_CSS_STUB_ONLY` in the envelope header — set when the
    // caller opts into `skip_css_ast`, which omits the full
    // `StyleSheet` body from the wire.
    static SKIP_CSS_AST: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
}
fn jsnode_loc_elided() -> bool {
    SKIP_JSNODE_LOC.with(|c| c.get())
}
fn css_stub_only() -> bool {
    SKIP_CSS_AST.with(|c| c.get())
}

thread_local! {
    // Byte -> UTF-16 offset converter for the current encode. `Some` only when
    // the source contains non-ASCII; for ASCII source byte == UTF-16 so it is
    // left `None` and every conversion below is a zero-cost identity (#793).
    static OFFSET_CONV: std::cell::RefCell<Option<crate::compiler::legacy::Utf8ToUtf16>> =
        const { std::cell::RefCell::new(None) };
}

/// Convert an absolute byte offset to a UTF-16 code-unit offset (identity when
/// no converter is installed, i.e. ASCII source).
#[inline]
fn conv_off(v: u32) -> u32 {
    // `u32::MAX` is the "no span" sentinel (e.g. legacy `Value` expressions);
    // never remap it.
    if v == u32::MAX {
        return v;
    }
    OFFSET_CONV.with(|c| match &*c.borrow() {
        Some(conv) => conv.convert(v as usize) as u32,
        None => v,
    })
}

/// Convert a byte column (0-based, within `line`) to a UTF-16 column.
#[inline]
fn conv_col(line: u32, col: u32) -> u32 {
    OFFSET_CONV.with(|c| match &*c.borrow() {
        Some(conv) => conv.convert_column(line as usize, col as usize) as u32,
        None => col,
    })
}

/// Whether an offset remap is active for the current encode.
#[inline]
fn offset_remap_active() -> bool {
    OFFSET_CONV.with(|c| c.borrow().is_some())
}

/// `typed_expr::Loc` — emits a flag byte + 6 u32s (with optional
/// `character`) when `loc.is_some()`. When the envelope-level
/// `FLAG_JSNODE_NO_LOC` flag is set the encoder skips this call
/// entirely and the decoder reciprocates by skipping the read.
fn write_typed_loc<W: Writer>(w: &mut W, loc: Option<&Loc>) {
    if jsnode_loc_elided() {
        return;
    }
    match loc {
        Some(l) => {
            write_u8(w, 1);
            write_u32(w, l.start.line);
            write_u32(w, conv_col(l.start.line, l.start.column));
            match l.start.character {
                Some(c) => {
                    write_u8(w, 1);
                    write_u32(w, conv_off(c));
                }
                None => write_u8(w, 0),
            }
            write_u32(w, l.end.line);
            write_u32(w, conv_col(l.end.line, l.end.column));
            match l.end.character {
                Some(c) => {
                    write_u8(w, 1);
                    write_u32(w, conv_off(c));
                }
                None => write_u8(w, 0),
            }
        }
        None => write_u8(w, 0),
    }
}

fn write_literal_value<W: Writer>(w: &mut W, v: &LiteralValue) {
    match v {
        LiteralValue::Null => write_u8(w, LV_NULL),
        LiteralValue::Bool(false) => write_u8(w, LV_BOOL_FALSE),
        LiteralValue::Bool(true) => write_u8(w, LV_BOOL_TRUE),
        LiteralValue::Number(n) => {
            if n.fract() == 0.0 && n.abs() < i64::MAX as f64 {
                write_u8(w, LV_NUMBER_I64);
                w.write_bytes(&(*n as i64).to_le_bytes());
            } else {
                write_u8(w, LV_NUMBER_F64);
                w.write_bytes(&n.to_le_bytes());
            }
        }
        LiteralValue::String(s) => {
            write_u8(w, LV_STRING);
            write_str(w, s.as_str());
        }
        LiteralValue::Regex(_) => write_u8(w, LV_REGEX),
    }
}

fn write_regex<W: Writer>(w: &mut W, regex: Option<&RegexValue>) {
    match regex {
        Some(r) => {
            write_u8(w, 1);
            write_str(w, r.pattern.as_str());
            write_str(w, r.flags.as_str());
        }
        None => write_u8(w, 0),
    }
}

fn write_template_element_value<W: Writer>(w: &mut W, v: &TemplateElementValue) {
    write_str(w, v.raw.as_str());
    match &v.cooked {
        Some(c) => {
            write_u8(w, 1);
            write_str(w, c.as_str());
        }
        None => write_u8(w, 0),
    }
}

fn write_node_id<W: Writer>(w: &mut W, id: JsNodeId, arena: &ParseArena) -> std::io::Result<()> {
    write_js_node(w, arena.get_js_node(id), arena)
}

fn write_opt_node_id<W: Writer>(
    w: &mut W,
    id: Option<JsNodeId>,
    arena: &ParseArena,
) -> std::io::Result<()> {
    match id {
        Some(i) => {
            write_u8(w, 1);
            write_node_id(w, i, arena)
        }
        None => {
            write_u8(w, 0);
            Ok(())
        }
    }
}

fn write_id_range<W: Writer>(w: &mut W, range: IdRange, arena: &ParseArena) -> std::io::Result<()> {
    let children = arena.get_js_children(range);
    write_u32(w, children.len() as u32);
    for child in children {
        write_js_node(w, child, arena)?;
    }
    Ok(())
}

/// `Vec<Option<JsNode>>` — used by `ArrayExpression` / `ArrayPattern`.
fn write_node_array<W: Writer>(
    w: &mut W,
    nodes: &[Option<JsNode>],
    arena: &ParseArena,
) -> std::io::Result<()> {
    write_u32(w, nodes.len() as u32);
    for n in nodes {
        match n {
            Some(node) => {
                write_u8(w, 1);
                write_js_node(w, node, arena)?;
            }
            None => write_u8(w, 0),
        }
    }
    Ok(())
}

/// Emit `[u8 has_value][u32 json_len][json bytes]` for a rare
/// structured optional that we don't have a dedicated binary tag for
/// yet (directive `metadata`, JsNode::Program comment arrays, …).
fn write_opt_inline_json<W: Writer, T: Serialize>(
    w: &mut W,
    value: Option<&T>,
) -> std::io::Result<()> {
    match value {
        Some(v) => {
            write_u8(w, 1);
            let len_slot = w.position();
            write_u32(w, 0);
            let p0 = w.position();
            struct A<'a, W2: Writer>(&'a mut W2);
            impl<W2: Writer> std::io::Write for A<'_, W2> {
                fn write(&mut self, b: &[u8]) -> std::io::Result<usize> {
                    self.0.write_bytes(b);
                    Ok(b.len())
                }
                fn flush(&mut self) -> std::io::Result<()> {
                    Ok(())
                }
            }
            let mut shim = A(w);
            serde_json::to_writer(&mut shim, v).map_err(std::io::Error::other)?;
            let p1 = shim.0.position();
            w.patch_u32(len_slot, (p1 - p0) as u32);
        }
        None => write_u8(w, 0),
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Template-node encoders
// ---------------------------------------------------------------------------

fn write_text<W: Writer>(w: &mut W, t: &Text) {
    write_preamble(w, TAG_TEXT, t.start, t.end);
    write_str(w, t.raw.as_str());
    write_str(w, t.data.as_str());
}

fn write_comment<W: Writer>(w: &mut W, c: &Comment) {
    write_preamble(w, TAG_COMMENT, c.start, c.end);
    write_str(w, c.data.as_str());
}

fn write_expression_tag<W: Writer>(w: &mut W, t: &ExpressionTag) -> std::io::Result<()> {
    write_preamble(w, TAG_EXPRESSION_TAG, t.start, t.end);
    write_expression(w, &t.expression)
}

fn write_html_tag<W: Writer>(w: &mut W, t: &HtmlTag) -> std::io::Result<()> {
    write_preamble(w, TAG_HTML_TAG, t.start, t.end);
    write_expression(w, &t.expression)
}

fn write_const_tag<W: Writer>(w: &mut W, t: &ConstTag) -> std::io::Result<()> {
    write_preamble(w, TAG_CONST_TAG, t.start, t.end);
    write_expression(w, &t.declaration)
}

fn write_declaration_tag<W: Writer>(w: &mut W, t: &DeclarationTag) -> std::io::Result<()> {
    // `{let x = …}` / `{const x = …}` carries a `VariableDeclaration`
    // expression — mirrors `write_const_tag` since the envelope shape is
    // identical (start/end + declaration). Svelte 5.56.0 #18282.
    write_preamble(w, TAG_DECLARATION_TAG, t.start, t.end);
    write_expression(w, &t.declaration)
}

fn write_debug_tag<W: Writer>(w: &mut W, t: &DebugTag) -> std::io::Result<()> {
    write_preamble(w, TAG_DEBUG_TAG, t.start, t.end);
    write_u32(w, t.identifiers.len() as u32);
    for id in &t.identifiers {
        write_expression(w, id)?;
    }
    Ok(())
}

fn write_render_tag<W: Writer>(w: &mut W, t: &RenderTag) -> std::io::Result<()> {
    write_preamble(w, TAG_RENDER_TAG, t.start, t.end);
    write_expression(w, &t.expression)
}

fn write_attach_tag<W: Writer>(w: &mut W, t: &AttachTag) -> std::io::Result<()> {
    write_preamble(w, TAG_ATTACH_TAG, t.start, t.end);
    write_expression(w, &t.expression)
}

// Elements share the same shape: name + attributes + fragment, with
// optional extras (e.g. SvelteComponent adds `expression`).
fn write_element_common<W: Writer>(
    w: &mut W,
    name: &str,
    name_loc: Option<&crate::ast::span::SourceLocation>,
    attributes: &[Attribute],
    fragment: &Fragment,
) -> std::io::Result<()> {
    write_str(w, name);
    write_opt_source_location(w, name_loc);
    write_u32(w, attributes.len() as u32);
    for a in attributes {
        write_attribute(w, a)?;
    }
    write_fragment(w, fragment)
}

fn write_regular_element<W: Writer>(w: &mut W, e: &RegularElement) -> std::io::Result<()> {
    write_preamble(w, TAG_REGULAR_ELEMENT, e.start, e.end);
    write_element_common(
        w,
        e.name.as_str(),
        e.name_loc.as_ref(),
        &e.attributes,
        &e.fragment,
    )
}

fn write_component<W: Writer>(w: &mut W, e: &Component) -> std::io::Result<()> {
    write_preamble(w, TAG_COMPONENT, e.start, e.end);
    write_element_common(
        w,
        e.name.as_str(),
        e.name_loc.as_ref(),
        &e.attributes,
        &e.fragment,
    )
}

fn write_title_element<W: Writer>(w: &mut W, e: &TitleElement) -> std::io::Result<()> {
    write_preamble(w, TAG_TITLE_ELEMENT, e.start, e.end);
    write_element_common(
        w,
        e.name.as_str(),
        e.name_loc.as_ref(),
        &e.attributes,
        &e.fragment,
    )
}

fn write_slot_element<W: Writer>(w: &mut W, e: &SlotElement) -> std::io::Result<()> {
    write_preamble(w, TAG_SLOT_ELEMENT, e.start, e.end);
    write_element_common(
        w,
        e.name.as_str(),
        e.name_loc.as_ref(),
        &e.attributes,
        &e.fragment,
    )
}

fn write_svelte_element<W: Writer>(w: &mut W, tag: u8, e: &SvelteElement) -> std::io::Result<()> {
    write_preamble(w, tag, e.start, e.end);
    write_element_common(
        w,
        e.name.as_str(),
        e.name_loc.as_ref(),
        &e.attributes,
        &e.fragment,
    )
}

fn write_svelte_component_element<W: Writer>(
    w: &mut W,
    e: &SvelteComponentElement,
) -> std::io::Result<()> {
    write_preamble(w, TAG_SVELTE_COMPONENT, e.start, e.end);
    write_element_common(
        w,
        e.name.as_str(),
        e.name_loc.as_ref(),
        &e.attributes,
        &e.fragment,
    )?;
    write_expression(w, &e.expression)
}

fn write_svelte_dynamic_element<W: Writer>(
    w: &mut W,
    e: &SvelteDynamicElement,
) -> std::io::Result<()> {
    write_preamble(w, TAG_SVELTE_ELEMENT, e.start, e.end);
    write_element_common(
        w,
        e.name.as_str(),
        e.name_loc.as_ref(),
        &e.attributes,
        &e.fragment,
    )?;
    write_expression(w, &e.tag)
}

// Blocks

fn write_if_block<W: Writer>(w: &mut W, b: &IfBlock) -> std::io::Result<()> {
    write_preamble(w, TAG_IF_BLOCK, b.start, b.end);
    write_bool(w, b.elseif);
    write_expression(w, &b.test)?;
    write_fragment(w, &b.consequent)?;
    match &b.alternate {
        Some(f) => {
            write_u8(w, 1);
            write_fragment(w, f)?;
        }
        None => write_u8(w, 0),
    }
    Ok(())
}

fn write_each_block<W: Writer>(w: &mut W, b: &EachBlock) -> std::io::Result<()> {
    write_preamble(w, TAG_EACH_BLOCK, b.start, b.end);
    write_expression(w, &b.expression)?;
    write_fragment(w, &b.body)?;
    write_opt_expression(w, b.context.as_ref())?;
    match &b.fallback {
        Some(f) => {
            write_u8(w, 1);
            write_fragment(w, f)?;
        }
        None => write_u8(w, 0),
    }
    write_opt_str(w, b.index.as_deref());
    write_opt_expression(w, b.key.as_ref())?;
    Ok(())
}

fn write_await_block<W: Writer>(w: &mut W, b: &AwaitBlock) -> std::io::Result<()> {
    write_preamble(w, TAG_AWAIT_BLOCK, b.start, b.end);
    write_expression(w, &b.expression)?;
    write_opt_expression(w, b.value.as_ref())?;
    write_opt_expression(w, b.error.as_ref())?;
    for frag in [&b.pending, &b.then, &b.catch] {
        match frag {
            Some(f) => {
                write_u8(w, 1);
                write_fragment(w, f)?;
            }
            None => write_u8(w, 0),
        }
    }
    Ok(())
}

fn write_key_block<W: Writer>(w: &mut W, b: &KeyBlock) -> std::io::Result<()> {
    write_preamble(w, TAG_KEY_BLOCK, b.start, b.end);
    write_expression(w, &b.expression)?;
    write_fragment(w, &b.fragment)
}

fn write_snippet_block<W: Writer>(w: &mut W, b: &SnippetBlock) -> std::io::Result<()> {
    write_preamble(w, TAG_SNIPPET_BLOCK, b.start, b.end);
    write_expression(w, &b.expression)?;
    write_opt_str(w, b.type_params.as_deref());
    write_u32(w, b.parameters.len() as u32);
    for p in &b.parameters {
        write_expression(w, p)?;
    }
    write_fragment(w, &b.body)
}

// TemplateNode dispatch

fn write_template_node<W: Writer>(w: &mut W, node: &TemplateNode) -> std::io::Result<()> {
    match node {
        TemplateNode::Text(n) => {
            write_text(w, n);
            Ok(())
        }
        TemplateNode::Comment(n) => {
            write_comment(w, n);
            Ok(())
        }
        TemplateNode::TitleElement(n) => write_title_element(w, n),
        TemplateNode::SlotElement(n) => write_slot_element(w, n),
        TemplateNode::SvelteBody(n) => write_svelte_element(w, TAG_SVELTE_BODY, n),
        TemplateNode::SvelteDocument(n) => write_svelte_element(w, TAG_SVELTE_DOCUMENT, n),
        TemplateNode::SvelteFragment(n) => write_svelte_element(w, TAG_SVELTE_FRAGMENT, n),
        TemplateNode::SvelteBoundary(n) => write_svelte_element(w, TAG_SVELTE_BOUNDARY, n),
        TemplateNode::SvelteHead(n) => write_svelte_element(w, TAG_SVELTE_HEAD, n),
        TemplateNode::SvelteOptions(n) => write_svelte_element(w, TAG_SVELTE_OPTIONS_EL, n),
        TemplateNode::SvelteSelf(n) => write_svelte_element(w, TAG_SVELTE_SELF, n),
        TemplateNode::SvelteWindow(n) => write_svelte_element(w, TAG_SVELTE_WINDOW, n),
        TemplateNode::ExpressionTag(n) => write_expression_tag(w, n),
        TemplateNode::HtmlTag(n) => write_html_tag(w, n),
        TemplateNode::ConstTag(n) => write_const_tag(w, n),
        TemplateNode::DeclarationTag(n) => write_declaration_tag(w, n),
        TemplateNode::DebugTag(n) => write_debug_tag(w, n),
        TemplateNode::RenderTag(n) => write_render_tag(w, n),
        TemplateNode::AttachTag(n) => write_attach_tag(w, n),
        TemplateNode::IfBlock(n) => write_if_block(w, n),
        TemplateNode::EachBlock(n) => write_each_block(w, n),
        TemplateNode::AwaitBlock(n) => write_await_block(w, n),
        TemplateNode::KeyBlock(n) => write_key_block(w, n),
        TemplateNode::SnippetBlock(n) => write_snippet_block(w, n),
        TemplateNode::RegularElement(n) => write_regular_element(w, n),
        TemplateNode::Component(n) => write_component(w, n),
        TemplateNode::SvelteComponent(n) => write_svelte_component_element(w, n),
        TemplateNode::SvelteElement(n) => write_svelte_dynamic_element(w, n),
    }
}

fn write_fragment<W: Writer>(w: &mut W, f: &Fragment) -> std::io::Result<()> {
    // Fragments don't carry start/end of their own — they're keyed off
    // their containing node. The preamble keeps the dispatch pattern
    // uniform; positions are sentinels.
    write_preamble(w, TAG_FRAGMENT, u32::MAX, u32::MAX);
    write_u32(w, f.nodes.len() as u32);
    for child in &f.nodes {
        write_template_node(w, child)?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Attributes & directives
// ---------------------------------------------------------------------------

fn write_attribute_value<W: Writer>(w: &mut W, v: &AttributeValue) -> std::io::Result<()> {
    match v {
        AttributeValue::True(_) => write_u8(w, ATTRVAL_TRUE),
        AttributeValue::Expression(expr_tag) => {
            write_u8(w, ATTRVAL_EXPRESSION);
            write_expression_tag(w, expr_tag)?;
        }
        AttributeValue::Sequence(parts) => {
            write_u8(w, ATTRVAL_SEQUENCE);
            write_u32(w, parts.len() as u32);
            for p in parts {
                write_attribute_value_part(w, p)?;
            }
        }
    }
    Ok(())
}

fn write_attribute_value_part<W: Writer>(w: &mut W, p: &AttributeValuePart) -> std::io::Result<()> {
    match p {
        AttributeValuePart::Text(t) => {
            write_text(w, t);
            Ok(())
        }
        AttributeValuePart::ExpressionTag(t) => write_expression_tag(w, t),
    }
}

fn write_attribute_node<W: Writer>(w: &mut W, n: &AttributeNode) -> std::io::Result<()> {
    write_preamble(w, TAG_ATTRIBUTE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_attribute_value(w, &n.value)
}

fn write_spread_attribute<W: Writer>(w: &mut W, n: &SpreadAttribute) -> std::io::Result<()> {
    write_preamble(w, TAG_SPREAD_ATTRIBUTE, n.start, n.end);
    write_expression(w, &n.expression)
}

fn write_bind_directive<W: Writer>(w: &mut W, n: &BindDirective) -> std::io::Result<()> {
    write_preamble(w, TAG_BIND_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_expression(w, &n.expression)?;
    write_modifiers(w, &n.modifiers);
    Ok(())
}

fn write_on_directive<W: Writer>(w: &mut W, n: &OnDirective) -> std::io::Result<()> {
    write_preamble(w, TAG_ON_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_opt_expression(w, n.expression.as_ref())?;
    write_modifiers(w, &n.modifiers);
    Ok(())
}

fn write_class_directive<W: Writer>(w: &mut W, n: &ClassDirective) -> std::io::Result<()> {
    write_preamble(w, TAG_CLASS_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_expression(w, &n.expression)
}

fn write_style_directive<W: Writer>(w: &mut W, n: &StyleDirective) -> std::io::Result<()> {
    write_preamble(w, TAG_STYLE_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_attribute_value(w, &n.value)?;
    write_modifiers(w, &n.modifiers);
    Ok(())
}

fn write_transition_directive<W: Writer>(
    w: &mut W,
    n: &TransitionDirective,
) -> std::io::Result<()> {
    write_preamble(w, TAG_TRANSITION_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_opt_expression(w, n.expression.as_ref())?;
    write_modifiers(w, &n.modifiers);
    write_bool(w, n.intro);
    write_bool(w, n.outro);
    write_opt_inline_json(w, n.metadata.as_ref())
}

fn write_animate_directive<W: Writer>(w: &mut W, n: &AnimateDirective) -> std::io::Result<()> {
    write_preamble(w, TAG_ANIMATE_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_opt_expression(w, n.expression.as_ref())?;
    write_opt_inline_json(w, n.metadata.as_ref())
}

fn write_use_directive<W: Writer>(w: &mut W, n: &UseDirective) -> std::io::Result<()> {
    write_preamble(w, TAG_USE_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_opt_expression(w, n.expression.as_ref())
}

fn write_let_directive<W: Writer>(w: &mut W, n: &LetDirective) -> std::io::Result<()> {
    write_preamble(w, TAG_LET_DIRECTIVE, n.start, n.end);
    write_str(w, n.name.as_str());
    write_opt_source_location(w, n.name_loc.as_ref());
    write_opt_expression(w, n.expression.as_ref())
}

fn write_attribute<W: Writer>(w: &mut W, a: &Attribute) -> std::io::Result<()> {
    match a {
        Attribute::Attribute(n) => write_attribute_node(w, n),
        Attribute::SpreadAttribute(n) => write_spread_attribute(w, n),
        // Reuses the standalone `AttachTag` encoding; the JSON shape
        // is identical (only `type/start/end/expression`).
        Attribute::AttachTag(n) => write_attach_tag(w, n),
        Attribute::BindDirective(n) => write_bind_directive(w, n),
        Attribute::OnDirective(n) => write_on_directive(w, n),
        Attribute::ClassDirective(n) => write_class_directive(w, n),
        Attribute::StyleDirective(n) => write_style_directive(w, n),
        Attribute::TransitionDirective(n) => write_transition_directive(w, n),
        Attribute::AnimateDirective(n) => write_animate_directive(w, n),
        Attribute::UseDirective(n) => write_use_directive(w, n),
        Attribute::LetDirective(n) => write_let_directive(w, n),
    }
}

// ---------------------------------------------------------------------------
// Script / SvelteOptions / JsComment
// ---------------------------------------------------------------------------

fn write_script<W: Writer>(w: &mut W, s: &Script) -> std::io::Result<()> {
    write_preamble(w, TAG_SCRIPT, s.start, s.end);
    let ctx = match s.context {
        ScriptContext::Default => 0u8,
        ScriptContext::Module => 1u8,
    };
    write_u8(w, ctx);
    write_expression(w, &s.content)?;
    write_u32(w, s.attributes.len() as u32);
    for a in &s.attributes {
        write_attribute_node(w, a)?;
    }
    Ok(())
}

fn write_js_comment<W: Writer>(w: &mut W, c: &JsComment) {
    write_preamble(w, TAG_JS_COMMENT, c.start, c.end);
    let kind = match c.kind {
        JsCommentKind::Line => 0u8,
        JsCommentKind::Block => 1u8,
    };
    write_u8(w, kind);
    write_str(w, c.value.as_str());
    write_source_location(w, &c.loc);
}

// `SvelteOptions` and `CssOption` have many optional fields — emit
// the whole struct as inline JSON. A dedicated encoder is easy to add
// later if profiling shows they appear often enough to matter.
fn write_svelte_options<W: Writer>(w: &mut W, o: &SvelteOptions) -> std::io::Result<()> {
    write_json_node(w, o.start, o.end, o)
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

fn write_root<W: Writer>(w: &mut W, root: &Root) -> std::io::Result<()> {
    write_preamble(w, TAG_ROOT, root.start, root.end);
    match &root.css {
        Some(css) => {
            write_u8(w, 1);
            if css_stub_only() {
                // Only the outer `start` / `end` cross the wire — the
                // decoder fills in the rest of the StyleSheet stub.
                // Skipped tag carries the positions so the buffer
                // doesn't need a separate fast-path branch.
                write_preamble(w, TAG_JSON, css.start, css.end);
                write_u32(w, 0); // empty JSON payload
            } else {
                write_json_node(w, u32::MAX, u32::MAX, &**css)?;
            }
        }
        None => write_u8(w, 0),
    }
    // `Root.js`: `Vec<serde_json::Value>` — almost always empty in
    // modern mode. One length-prefixed JSON blob for the whole vec.
    write_json_node(w, u32::MAX, u32::MAX, &root.js)?;
    write_fragment(w, &root.fragment)?;
    match &root.options {
        Some(opt) => {
            write_u8(w, 1);
            write_svelte_options(w, opt)?;
        }
        None => write_u8(w, 0),
    }
    write_u32(w, root.comments.len() as u32);
    for c in &root.comments {
        write_js_comment(w, c);
    }
    match &root.instance {
        Some(s) => {
            write_u8(w, 1);
            write_script(w, s)?;
        }
        None => write_u8(w, 0),
    }
    match &root.module {
        Some(s) => {
            write_u8(w, 1);
            write_script(w, s)?;
        }
        None => write_u8(w, 0),
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// JsNode (estree) — 74-variant dispatcher
// ---------------------------------------------------------------------------

fn write_js_node<W: Writer>(w: &mut W, node: &JsNode, arena: &ParseArena) -> std::io::Result<()> {
    match node {
        JsNode::Identifier {
            start,
            end,
            loc,
            name,
        } => {
            write_preamble(w, JS_IDENTIFIER, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_str(w, name.as_str());
        }
        JsNode::PrivateIdentifier {
            start,
            end,
            loc,
            name,
        } => {
            write_preamble(w, JS_PRIVATE_IDENTIFIER, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_str(w, name.as_str());
        }
        JsNode::Literal {
            start,
            end,
            loc,
            value,
            raw,
            regex,
        } => {
            write_preamble(w, JS_LITERAL, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_literal_value(w, value);
            write_str(w, raw.as_str());
            write_regex(w, regex.as_ref());
        }
        JsNode::BinaryExpression {
            start,
            end,
            loc,
            left,
            operator,
            right,
        } => {
            write_preamble(w, JS_BINARY_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *left, arena)?;
            write_str(w, operator.as_str());
            write_node_id(w, *right, arena)?;
        }
        JsNode::LogicalExpression {
            start,
            end,
            loc,
            left,
            operator,
            right,
        } => {
            write_preamble(w, JS_LOGICAL_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *left, arena)?;
            write_str(w, operator.as_str());
            write_node_id(w, *right, arena)?;
        }
        JsNode::UnaryExpression {
            start,
            end,
            loc,
            operator,
            prefix,
            argument,
        } => {
            write_preamble(w, JS_UNARY_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_str(w, operator.as_str());
            write_bool(w, *prefix);
            write_node_id(w, *argument, arena)?;
        }
        JsNode::ConditionalExpression {
            start,
            end,
            loc,
            test,
            consequent,
            alternate,
        } => {
            write_preamble(w, JS_CONDITIONAL_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *test, arena)?;
            write_node_id(w, *consequent, arena)?;
            write_node_id(w, *alternate, arena)?;
        }
        JsNode::CallExpression {
            start,
            end,
            loc,
            callee,
            arguments,
            optional,
        } => {
            write_preamble(w, JS_CALL_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *callee, arena)?;
            write_id_range(w, *arguments, arena)?;
            write_bool(w, *optional);
        }
        JsNode::MemberExpression {
            start,
            end,
            loc,
            object,
            property,
            computed,
            optional,
        } => {
            write_preamble(w, JS_MEMBER_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *object, arena)?;
            write_node_id(w, *property, arena)?;
            write_bool(w, *computed);
            write_bool(w, *optional);
        }
        JsNode::NewExpression {
            start,
            end,
            loc,
            callee,
            arguments,
        } => {
            write_preamble(w, JS_NEW_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *callee, arena)?;
            write_id_range(w, *arguments, arena)?;
        }
        JsNode::FunctionExpression {
            start,
            end,
            loc,
            id,
            params,
            body,
            generator,
            r#async,
            expression,
        } => {
            write_preamble(w, JS_FUNCTION_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *id, arena)?;
            write_bool(w, *generator);
            write_bool(w, *r#async);
            write_bool(w, *expression);
            write_id_range(w, *params, arena)?;
            write_opt_node_id(w, *body, arena)?;
        }
        JsNode::ClassExpression {
            start,
            end,
            loc,
            id,
            super_class,
            body,
        } => {
            write_preamble(w, JS_CLASS_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *id, arena)?;
            write_opt_node_id(w, *super_class, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::ArrowFunctionExpression {
            start,
            end,
            loc,
            id,
            params,
            body,
            expression,
            generator,
            r#async,
        } => {
            write_preamble(w, JS_ARROW_FUNCTION_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *id, arena)?;
            write_bool(w, *expression);
            write_bool(w, *generator);
            write_bool(w, *r#async);
            write_id_range(w, *params, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::AssignmentExpression {
            start,
            end,
            loc,
            operator,
            left,
            right,
        } => {
            write_preamble(w, JS_ASSIGNMENT_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_str(w, operator.as_str());
            write_node_id(w, *left, arena)?;
            write_node_id(w, *right, arena)?;
        }
        JsNode::UpdateExpression {
            start,
            end,
            loc,
            operator,
            prefix,
            argument,
        } => {
            write_preamble(w, JS_UPDATE_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_str(w, operator.as_str());
            write_bool(w, *prefix);
            write_node_id(w, *argument, arena)?;
        }
        JsNode::SequenceExpression {
            start,
            end,
            loc,
            expressions,
        } => {
            write_preamble(w, JS_SEQUENCE_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *expressions, arena)?;
        }
        JsNode::ArrayExpression {
            start,
            end,
            loc,
            elements,
        } => {
            write_preamble(w, JS_ARRAY_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_array(w, elements, arena)?;
        }
        JsNode::ObjectExpression {
            start,
            end,
            loc,
            properties,
        } => {
            write_preamble(w, JS_OBJECT_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *properties, arena)?;
        }
        JsNode::TemplateLiteral {
            start,
            end,
            loc,
            quasis,
            expressions,
        } => {
            write_preamble(w, JS_TEMPLATE_LITERAL, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *quasis, arena)?;
            write_id_range(w, *expressions, arena)?;
        }
        JsNode::TaggedTemplateExpression {
            start,
            end,
            loc,
            tag,
            quasi,
        } => {
            write_preamble(w, JS_TAGGED_TEMPLATE_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *tag, arena)?;
            write_node_id(w, *quasi, arena)?;
        }
        JsNode::TemplateElement {
            start,
            end,
            loc,
            tail,
            value,
        } => {
            write_preamble(w, JS_TEMPLATE_ELEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_bool(w, *tail);
            write_template_element_value(w, value);
        }
        JsNode::ThisExpression { start, end, loc } => {
            write_preamble(w, JS_THIS_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
        }
        JsNode::Super { start, end, loc } => {
            write_preamble(w, JS_SUPER, *start, *end);
            write_typed_loc(w, loc.as_deref());
        }
        JsNode::ImportExpression {
            start,
            end,
            loc,
            source,
        } => {
            write_preamble(w, JS_IMPORT_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *source, arena)?;
        }
        JsNode::AwaitExpression {
            start,
            end,
            loc,
            argument,
        } => {
            write_preamble(w, JS_AWAIT_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *argument, arena)?;
        }
        JsNode::YieldExpression {
            start,
            end,
            loc,
            delegate,
            argument,
        } => {
            write_preamble(w, JS_YIELD_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_bool(w, *delegate);
            write_opt_node_id(w, *argument, arena)?;
        }
        JsNode::ChainExpression {
            start,
            end,
            loc,
            expression,
        } => {
            write_preamble(w, JS_CHAIN_EXPRESSION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *expression, arena)?;
        }
        JsNode::MetaProperty {
            start,
            end,
            loc,
            meta,
            property,
        } => {
            write_preamble(w, JS_META_PROPERTY, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *meta, arena)?;
            write_node_id(w, *property, arena)?;
        }
        JsNode::SpreadElement {
            start,
            end,
            loc,
            argument,
        } => {
            write_preamble(w, JS_SPREAD_ELEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *argument, arena)?;
        }
        JsNode::ObjectPattern {
            start,
            end,
            loc,
            properties,
        } => {
            write_preamble(w, JS_OBJECT_PATTERN, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *properties, arena)?;
        }
        JsNode::ArrayPattern {
            start,
            end,
            loc,
            elements,
        } => {
            write_preamble(w, JS_ARRAY_PATTERN, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_array(w, elements, arena)?;
        }
        JsNode::AssignmentPattern {
            start,
            end,
            loc,
            left,
            right,
        } => {
            write_preamble(w, JS_ASSIGNMENT_PATTERN, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *left, arena)?;
            write_node_id(w, *right, arena)?;
        }
        JsNode::RestElement {
            start,
            end,
            loc,
            argument,
        } => {
            write_preamble(w, JS_REST_ELEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *argument, arena)?;
        }
        JsNode::Property {
            start,
            end,
            loc,
            key,
            value,
            kind,
            method,
            shorthand,
            computed,
        } => {
            write_preamble(w, JS_PROPERTY, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_bool(w, *method);
            write_bool(w, *shorthand);
            write_bool(w, *computed);
            write_node_id(w, *key, arena)?;
            write_node_id(w, *value, arena)?;
            write_str(w, kind.as_str());
        }
        JsNode::Program {
            start,
            end,
            loc,
            body,
            source_type,
            leading_comments,
            trailing_comments,
            // Internal analyze-only metadata; not part of the serialized AST.
            ignore_comment_map: _,
        } => {
            write_preamble(w, JS_PROGRAM, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *body, arena)?;
            write_str(w, source_type.as_str());
            write_opt_inline_json(w, trailing_comments.as_ref())?;
            write_opt_inline_json(w, leading_comments.as_ref())?;
        }
        JsNode::ExpressionStatement {
            start,
            end,
            loc,
            expression,
        } => {
            write_preamble(w, JS_EXPRESSION_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *expression, arena)?;
        }
        JsNode::BlockStatement {
            start,
            end,
            loc,
            body,
        } => {
            write_preamble(w, JS_BLOCK_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *body, arena)?;
        }
        JsNode::VariableDeclaration {
            start,
            end,
            loc,
            declarations,
            kind,
            declare,
        } => {
            write_preamble(w, JS_VARIABLE_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *declarations, arena)?;
            write_str(w, kind.as_str());
            write_bool(w, *declare);
        }
        JsNode::VariableDeclarator {
            start,
            end,
            loc,
            id,
            init,
        } => {
            write_preamble(w, JS_VARIABLE_DECLARATOR, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *id, arena)?;
            write_opt_node_id(w, *init, arena)?;
        }
        JsNode::FunctionDeclaration {
            start,
            end,
            loc,
            id,
            params,
            body,
            generator,
            r#async,
        } => {
            write_preamble(w, JS_FUNCTION_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *id, arena)?;
            write_bool(w, *generator);
            write_bool(w, *r#async);
            write_id_range(w, *params, arena)?;
            write_opt_node_id(w, *body, arena)?;
        }
        JsNode::ClassDeclaration {
            start,
            end,
            loc,
            id,
            super_class,
            body,
            declare,
            r#abstract,
            implements,
            decorators,
        } => {
            write_preamble(w, JS_CLASS_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *id, arena)?;
            write_opt_node_id(w, *super_class, arena)?;
            write_node_id(w, *body, arena)?;
            write_bool(w, *declare);
            write_bool(w, *r#abstract);
            write_bool(w, *implements);
            write_id_range(w, *decorators, arena)?;
        }
        JsNode::ReturnStatement {
            start,
            end,
            loc,
            argument,
        } => {
            write_preamble(w, JS_RETURN_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *argument, arena)?;
        }
        JsNode::ThrowStatement {
            start,
            end,
            loc,
            argument,
        } => {
            write_preamble(w, JS_THROW_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *argument, arena)?;
        }
        JsNode::IfStatement {
            start,
            end,
            loc,
            test,
            consequent,
            alternate,
        } => {
            write_preamble(w, JS_IF_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *test, arena)?;
            write_node_id(w, *consequent, arena)?;
            write_opt_node_id(w, *alternate, arena)?;
        }
        JsNode::ForStatement {
            start,
            end,
            loc,
            init,
            test,
            update,
            body,
        } => {
            write_preamble(w, JS_FOR_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *init, arena)?;
            write_opt_node_id(w, *test, arena)?;
            write_opt_node_id(w, *update, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::ForOfStatement {
            start,
            end,
            loc,
            r#await,
            left,
            right,
            body,
        } => {
            write_preamble(w, JS_FOR_OF_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_bool(w, *r#await);
            write_node_id(w, *left, arena)?;
            write_node_id(w, *right, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::ForInStatement {
            start,
            end,
            loc,
            left,
            right,
            body,
        } => {
            write_preamble(w, JS_FOR_IN_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *left, arena)?;
            write_node_id(w, *right, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::WhileStatement {
            start,
            end,
            loc,
            test,
            body,
        } => {
            write_preamble(w, JS_WHILE_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *test, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::DoWhileStatement {
            start,
            end,
            loc,
            test,
            body,
        } => {
            write_preamble(w, JS_DO_WHILE_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *test, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::TryStatement {
            start,
            end,
            loc,
            block,
            handler,
            finalizer,
        } => {
            write_preamble(w, JS_TRY_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *block, arena)?;
            write_opt_node_id(w, *handler, arena)?;
            write_opt_node_id(w, *finalizer, arena)?;
        }
        JsNode::CatchClause {
            start,
            end,
            loc,
            param,
            body,
        } => {
            write_preamble(w, JS_CATCH_CLAUSE, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *param, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::SwitchStatement {
            start,
            end,
            loc,
            discriminant,
            cases,
        } => {
            write_preamble(w, JS_SWITCH_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *discriminant, arena)?;
            write_id_range(w, *cases, arena)?;
        }
        JsNode::SwitchCase {
            start,
            end,
            loc,
            test,
            consequent,
        } => {
            write_preamble(w, JS_SWITCH_CASE, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *test, arena)?;
            write_id_range(w, *consequent, arena)?;
        }
        JsNode::LabeledStatement {
            start,
            end,
            loc,
            label,
            body,
        } => {
            write_preamble(w, JS_LABELED_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *label, arena)?;
            write_node_id(w, *body, arena)?;
        }
        JsNode::BreakStatement {
            start,
            end,
            loc,
            label,
        } => {
            write_preamble(w, JS_BREAK_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *label, arena)?;
        }
        JsNode::ContinueStatement {
            start,
            end,
            loc,
            label,
        } => {
            write_preamble(w, JS_CONTINUE_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *label, arena)?;
        }
        JsNode::EmptyStatement { start, end, loc } => {
            write_preamble(w, JS_EMPTY_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
        }
        JsNode::DebuggerStatement { start, end, loc } => {
            write_preamble(w, JS_DEBUGGER_STATEMENT, *start, *end);
            write_typed_loc(w, loc.as_deref());
        }
        JsNode::ImportDeclaration {
            start,
            end,
            loc,
            specifiers,
            source,
            import_kind,
            attributes,
        } => {
            write_preamble(w, JS_IMPORT_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *specifiers, arena)?;
            write_node_id(w, *source, arena)?;
            write_opt_str(w, import_kind.as_deref());
            write_id_range(w, *attributes, arena)?;
        }
        JsNode::ImportSpecifier {
            start,
            end,
            loc,
            imported,
            local,
            import_kind,
        } => {
            write_preamble(w, JS_IMPORT_SPECIFIER, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *imported, arena)?;
            write_node_id(w, *local, arena)?;
            write_opt_str(w, import_kind.as_deref());
        }
        JsNode::ImportDefaultSpecifier {
            start,
            end,
            loc,
            local,
        } => {
            write_preamble(w, JS_IMPORT_DEFAULT_SPECIFIER, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *local, arena)?;
        }
        JsNode::ImportNamespaceSpecifier {
            start,
            end,
            loc,
            local,
        } => {
            write_preamble(w, JS_IMPORT_NAMESPACE_SPECIFIER, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *local, arena)?;
        }
        JsNode::ExportNamedDeclaration {
            start,
            end,
            loc,
            declaration,
            specifiers,
            source,
            export_kind,
            attributes,
        } => {
            write_preamble(w, JS_EXPORT_NAMED_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *declaration, arena)?;
            write_id_range(w, *specifiers, arena)?;
            write_opt_node_id(w, *source, arena)?;
            write_opt_str(w, export_kind.as_deref());
            write_id_range(w, *attributes, arena)?;
        }
        JsNode::ExportDefaultDeclaration {
            start,
            end,
            loc,
            declaration,
        } => {
            write_preamble(w, JS_EXPORT_DEFAULT_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *declaration, arena)?;
        }
        JsNode::ExportSpecifier {
            start,
            end,
            loc,
            local,
            exported,
            export_kind,
        } => {
            write_preamble(w, JS_EXPORT_SPECIFIER, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *local, arena)?;
            write_node_id(w, *exported, arena)?;
            write_opt_str(w, export_kind.as_deref());
        }
        JsNode::ClassBody {
            start,
            end,
            loc,
            body,
        } => {
            write_preamble(w, JS_CLASS_BODY, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *body, arena)?;
        }
        JsNode::MethodDefinition {
            start,
            end,
            loc,
            key,
            value,
            kind,
            r#static,
            computed,
        } => {
            write_preamble(w, JS_METHOD_DEFINITION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_bool(w, *r#static);
            write_bool(w, *computed);
            write_str(w, kind.as_str());
            write_node_id(w, *key, arena)?;
            write_node_id(w, *value, arena)?;
        }
        JsNode::PropertyDefinition {
            start,
            end,
            loc,
            key,
            value,
            r#static,
            computed,
        } => {
            write_preamble(w, JS_PROPERTY_DEFINITION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_bool(w, *r#static);
            write_bool(w, *computed);
            write_node_id(w, *key, arena)?;
            write_opt_node_id(w, *value, arena)?;
        }
        JsNode::StaticBlock {
            start,
            end,
            loc,
            body,
        } => {
            write_preamble(w, JS_STATIC_BLOCK, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_id_range(w, *body, arena)?;
        }
        JsNode::Decorator { start, end, loc } => {
            write_preamble(w, JS_DECORATOR, *start, *end);
            write_typed_loc(w, loc.as_deref());
        }
        JsNode::TSTypeAnnotation {
            start,
            end,
            loc,
            type_annotation,
        } => {
            write_preamble(w, JS_TS_TYPE_ANNOTATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_node_id(w, *type_annotation, arena)?;
        }
        JsNode::TSEnumDeclaration { start, end, loc } => {
            write_preamble(w, JS_TS_ENUM_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
        }
        JsNode::TSModuleDeclaration {
            start,
            end,
            loc,
            body,
        } => {
            write_preamble(w, JS_TS_MODULE_DECLARATION, *start, *end);
            write_typed_loc(w, loc.as_deref());
            write_opt_node_id(w, *body, arena)?;
        }
        JsNode::Comment {
            start,
            end,
            comment_type,
            value,
        } => {
            write_preamble(w, JS_COMMENT, *start, *end);
            write_str(w, comment_type.as_str());
            write_str(w, value.as_str());
        }
        // `Raw(Value)` and `Null` don't carry positions, so they use
        // dedicated sentinel tags without the usual preamble pair.
        JsNode::Raw(value) => {
            write_preamble(w, JS_RAW_JSON, u32::MAX, u32::MAX);
            let len_slot = w.position();
            write_u32(w, 0);
            let p0 = w.position();
            struct A<'a, W2: Writer>(&'a mut W2);
            impl<W2: Writer> std::io::Write for A<'_, W2> {
                fn write(&mut self, b: &[u8]) -> std::io::Result<usize> {
                    self.0.write_bytes(b);
                    Ok(b.len())
                }
                fn flush(&mut self) -> std::io::Result<()> {
                    Ok(())
                }
            }
            let mut shim = A(w);
            if offset_remap_active() {
                // A `Raw` sub-tree (e.g. a typed function parameter, or a whole
                // typed arrow lowered to legacy JSON) carries byte offsets too.
                // Remap them to UTF-16 so the envelope stays consistent with the
                // JSON `parse` path (#793, #908). Without this, every descendant
                // of a typed-parameter arrow keeps its byte offsets and drifts
                // past any preceding non-ASCII source.
                let mut json_value = value.clone();
                OFFSET_CONV.with(|c| {
                    if let Some(conv) = &*c.borrow() {
                        crate::compiler::legacy::convert_positions_to_utf16(&mut json_value, conv);
                    }
                });
                serde_json::to_writer(&mut shim, &json_value).map_err(std::io::Error::other)?;
            } else {
                serde_json::to_writer(&mut shim, value).map_err(std::io::Error::other)?;
            }
            let p1 = shim.0.position();
            w.patch_u32(len_slot, (p1 - p0) as u32);
        }
        JsNode::Null => {
            write_preamble(w, JS_NULL, u32::MAX, u32::MAX);
        }
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Top-level entry points
// ---------------------------------------------------------------------------

/// Encode a parsed `Root` AST into a fresh `Vec<u8>` envelope.
pub fn encode_root_to_vec(root: &Root, source: &str) -> Vec<u8> {
    encode_root_to_vec_with_flags(root, source, false, false)
}

/// Encode a parsed `Root` AST with caller-supplied envelope flags.
///
/// - `skip_jsnode_loc` mirrors `ParseOptions::skip_expression_loc` —
///   it tells the encoder/decoder to elide the per-JsNode loc-flag
///   byte, since every JsNode is guaranteed to have `loc == None`.
/// - `skip_css_ast` omits the CSS `StyleSheet` body from the wire; the
///   decoder reconstructs a `{ type: "StyleSheet", start, end }` stub.
pub fn encode_root_to_vec_with_flags(
    root: &Root,
    source: &str,
    skip_jsnode_loc: bool,
    skip_css_ast: bool,
) -> Vec<u8> {
    let cap = HEADER_LEN + source.len().saturating_mul(20).max(4096);
    let mut buf: Vec<u8> = Vec::with_capacity(cap);
    encode_root_into(&mut buf, root, source, skip_jsnode_loc, skip_css_ast);
    buf
}

/// Backwards-compatible wrapper for the 3-argument variant.
pub fn encode_root_to_vec_with_options(
    root: &Root,
    source: &str,
    skip_jsnode_loc: bool,
) -> Vec<u8> {
    encode_root_to_vec_with_flags(root, source, skip_jsnode_loc, false)
}

/// Write the envelope into `writer`. The writer must start empty.
pub fn encode_root_into<W: Writer>(
    writer: &mut W,
    root: &Root,
    source: &str,
    skip_jsnode_loc: bool,
    skip_css_ast: bool,
) {
    debug_assert_eq!(writer.position(), 0, "encoder expects an empty writer");

    writer.write_bytes(&MAGIC.to_le_bytes());
    writer.write_bytes(&VERSION.to_le_bytes());
    writer.write_bytes(&[0u8; 4]); // total_len  — patched at the end
    writer.write_bytes(&[0u8; 4]); // root_offset — patched after the header
    write_u32(writer, source.len() as u32);
    let mut flags: u32 = 0;
    if skip_jsnode_loc {
        flags |= FLAG_JSNODE_NO_LOC;
    }
    if skip_css_ast {
        flags |= FLAG_CSS_STUB_ONLY;
    }
    write_u32(writer, flags);
    debug_assert_eq!(writer.position(), HEADER_LEN);

    let root_off = writer.position() as u32;
    writer.patch_u32(12, root_off);

    // RAII guards: reset the per-encode thread-locals even on panic.
    struct Guard {
        prev_loc: bool,
        prev_css: bool,
        prev_conv: Option<crate::compiler::legacy::Utf8ToUtf16>,
    }
    impl Drop for Guard {
        fn drop(&mut self) {
            SKIP_JSNODE_LOC.with(|c| c.set(self.prev_loc));
            SKIP_CSS_AST.with(|c| c.set(self.prev_css));
            OFFSET_CONV.with(|c| *c.borrow_mut() = self.prev_conv.take());
        }
    }
    let prev_loc = SKIP_JSNODE_LOC.with(|c| c.replace(skip_jsnode_loc));
    let prev_css = SKIP_CSS_AST.with(|c| c.replace(skip_css_ast));
    // Install a byte->UTF-16 converter only for non-ASCII source (#793).
    let new_conv = if source.is_ascii() {
        None
    } else {
        Some(crate::compiler::legacy::Utf8ToUtf16::new(source))
    };
    let prev_conv = OFFSET_CONV.with(|c| c.replace(new_conv));
    let _guard = Guard {
        prev_loc,
        prev_css,
        prev_conv,
    };

    let _ = crate::ast::arena::with_serialize_arena(&root.arena, || write_root(writer, root));

    let total = writer.position() as u32;
    writer.patch_u32(8, total);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase1_parse::{ParseOptions, parse};

    #[test]
    fn header_layout_minimal() {
        let src = "<h1>Hello</h1>";
        let ast = parse(src, ParseOptions::default()).unwrap();
        let buf = encode_root_to_vec(&ast, src);

        assert!(buf.len() >= HEADER_LEN);
        assert_eq!(&buf[0..4], &MAGIC.to_le_bytes());
        assert_eq!(u32::from_le_bytes(buf[4..8].try_into().unwrap()), VERSION);
        assert_eq!(
            u32::from_le_bytes(buf[8..12].try_into().unwrap()) as usize,
            buf.len()
        );

        let root_off = u32::from_le_bytes(buf[12..16].try_into().unwrap()) as usize;
        // Root must be the binary TAG_ROOT, not the JSON fallback.
        assert_eq!(buf[root_off], TAG_ROOT);
    }

    /// #908: a typed arrow parameter (`(r: number[]) => …`) is lowered to a
    /// `JsNode::Raw` JSON sub-tree. That JSON carries byte offsets, which must
    /// be remapped to UTF-16 like every other span when the source contains
    /// non-ASCII characters — otherwise the whole arrow (params + body) drifts
    /// past the preceding multibyte text and `source.slice(start, end)` breaks.
    #[test]
    fn typed_arrow_raw_json_offsets_are_utf16() {
        use std::collections::HashSet;

        // 4 multibyte chars precede the typed arrow, so a leaked byte offset
        // would be shifted by +8 (4 chars × 2 extra bytes) versus UTF-16.
        let src = concat!(
            "<script lang=\"ts\">\n",
            "  const \u{30E9}\u{30D9}\u{30EB} = \"\u{3042}\";\n",
            "  let last = 0;\n",
            "  const set = (r: number[]) => { last = r.length; };\n",
            "</script>\n",
            "<p>{\u{30E9}\u{30D9}\u{30EB}}{last}{set}</p>",
        );
        let ast = parse(src, ParseOptions::default()).unwrap();

        // Canonical UTF-16 offsets — exactly what the JSON `parse` path emits.
        let valid: HashSet<i64> = crate::ast::arena::with_serialize_arena(&ast.arena, || {
            let mut value = serde_json::to_value(&ast).unwrap();
            let conv = crate::compiler::legacy::Utf8ToUtf16::new(src);
            crate::compiler::legacy::convert_positions_to_utf16(&mut value, &conv);
            let mut set = HashSet::new();
            collect_offsets(&value, &mut set);
            set
        });

        let buf = encode_root_to_vec(&ast, src);
        // Raw-JSON sub-trees are the only place `"start":`/`"end":` appears as
        // text in the binary envelope (typed nodes store offsets as raw u32).
        let text = String::from_utf8_lossy(&buf);
        let mut checked = 0usize;
        for key in ["\"start\":", "\"end\":"] {
            let mut from = 0;
            while let Some(rel) = text[from..].find(key) {
                let num_start = from + rel + key.len();
                let digits: String = text[num_start..]
                    .chars()
                    .take_while(|c| c.is_ascii_digit())
                    .collect();
                from = num_start;
                if let Ok(n) = digits.parse::<i64>() {
                    assert!(
                        valid.contains(&n),
                        "envelope raw-JSON offset {n} is not a UTF-16 node offset \
                         (byte offsets leaked — #908)"
                    );
                    checked += 1;
                }
            }
        }
        assert!(
            checked > 0,
            "expected the typed arrow to produce raw-JSON offsets to check"
        );
    }

    fn collect_offsets(value: &serde_json::Value, out: &mut std::collections::HashSet<i64>) {
        match value {
            serde_json::Value::Object(map) => {
                for (k, v) in map {
                    if (k == "start" || k == "end")
                        && let Some(n) = v.as_i64()
                    {
                        out.insert(n);
                    }
                    collect_offsets(v, out);
                }
            }
            serde_json::Value::Array(items) => {
                for it in items {
                    collect_offsets(it, out);
                }
            }
            _ => {}
        }
    }

    #[test]
    fn flag_byte_set_when_requested() {
        let src = "<p>{x}</p>";
        let ast = parse(
            src,
            ParseOptions {
                skip_expression_loc: true,
                ..ParseOptions::default()
            },
        )
        .unwrap();
        let buf = encode_root_to_vec_with_options(&ast, src, true);
        let flags = u32::from_le_bytes(buf[20..24].try_into().unwrap());
        assert!(flags & FLAG_JSNODE_NO_LOC != 0);
    }
}
