// Decoder for the parse envelope (`napi_raw_parse.rs`).
//
// Reads the rsvelte raw-transfer buffer and reconstructs the same JS
// object graph that `JSON.parse(napi.parse(source))` produces. Heavy
// nodes (Expression sub-trees, the CSS StyleSheet, SvelteOptions)
// still travel as inline JSON behind `TAG_JSON` — those slices are
// handed to `JSON.parse` on the spot. Everything else is read by
// `DataView`, so we skip the per-byte tokenization that JSON.parse
// performs on most of the AST.
//
// Wire format: see `napi_raw_parse.rs` for the canonical reference.

'use strict';

const { isWindowOutOfBounds, windowOutOfBoundsMessage } = require('./lib/bounds-check.js');

const MAGIC = 0x3156_5052; // "RPV1" little-endian
// Bumped for the function-node AST-fidelity changes (FunctionExpression field
// reorder, `typeParameters` on function-like nodes, Identifier `optional`);
// v4 adds the object-method `typeParameters`-after-`body` flag byte.
// Keep in lockstep with `napi_raw_parse.rs`'s `VERSION`.
const VERSION = 4;
const HEADER_LEN = 24;

// Tags — must mirror napi_raw_parse.rs.
const TAG_JSON = 0x00;
const TAG_ROOT = 0x01;
const TAG_FRAGMENT = 0x02;
const TAG_JS_COMMENT = 0x03;

const TAG_TEXT = 0x10;
const TAG_COMMENT = 0x11;
const TAG_EXPRESSION_TAG = 0x12;
const TAG_HTML_TAG = 0x13;
const TAG_CONST_TAG = 0x14;
const TAG_DEBUG_TAG = 0x15;
const TAG_RENDER_TAG = 0x16;
const TAG_ATTACH_TAG = 0x17;

const TAG_REGULAR_ELEMENT = 0x20;
const TAG_COMPONENT = 0x21;
const TAG_TITLE_ELEMENT = 0x22;
const TAG_SLOT_ELEMENT = 0x23;
const TAG_SVELTE_BODY = 0x24;
const TAG_SVELTE_DOCUMENT = 0x25;
const TAG_SVELTE_FRAGMENT = 0x26;
const TAG_SVELTE_BOUNDARY = 0x27;
const TAG_SVELTE_HEAD = 0x28;
const TAG_SVELTE_OPTIONS_EL = 0x29;
const TAG_SVELTE_SELF = 0x2a;
const TAG_SVELTE_WINDOW = 0x2b;
const TAG_SVELTE_COMPONENT = 0x2c;
const TAG_SVELTE_ELEMENT = 0x2d;

const TAG_SCRIPT = 0x40;
// const TAG_SVELTE_OPTIONS = 0x41; — currently encoded as TAG_JSON.

const TAG_ATTRIBUTE = 0x50;
const TAG_SPREAD_ATTRIBUTE = 0x51;
const TAG_BIND_DIRECTIVE = 0x52;
const TAG_ON_DIRECTIVE = 0x53;
const TAG_CLASS_DIRECTIVE = 0x54;
const TAG_STYLE_DIRECTIVE = 0x55;
const TAG_TRANSITION_DIRECTIVE = 0x56;
const TAG_ANIMATE_DIRECTIVE = 0x57;
const TAG_USE_DIRECTIVE = 0x58;
const TAG_LET_DIRECTIVE = 0x59;

const ATTRVAL_TRUE = 0x60;
const ATTRVAL_EXPRESSION = 0x61;
const ATTRVAL_SEQUENCE = 0x62;

// Header flag bits — see napi_raw_parse::FLAG_*.
const FLAG_JSNODE_NO_LOC = 1 << 0;
const FLAG_CSS_STUB_ONLY = 1 << 1;

const TAG_IF_BLOCK = 0x70;
const TAG_EACH_BLOCK = 0x71;
const TAG_AWAIT_BLOCK = 0x72;
const TAG_KEY_BLOCK = 0x73;
const TAG_SNIPPET_BLOCK = 0x74;

// JsNode (estree) tags — 0x80..0xCC. Mirrors `napi_raw_parse.rs`.
const JS_IDENTIFIER = 0x80;
const JS_PRIVATE_IDENTIFIER = 0x81;
const JS_LITERAL = 0x82;
const JS_BINARY_EXPRESSION = 0x83;
const JS_LOGICAL_EXPRESSION = 0x84;
const JS_UNARY_EXPRESSION = 0x85;
const JS_CONDITIONAL_EXPRESSION = 0x86;
const JS_CALL_EXPRESSION = 0x87;
const JS_MEMBER_EXPRESSION = 0x88;
const JS_NEW_EXPRESSION = 0x89;
const JS_FUNCTION_EXPRESSION = 0x8a;
const JS_CLASS_EXPRESSION = 0x8b;
const JS_ARROW_FUNCTION_EXPRESSION = 0x8c;
const JS_ASSIGNMENT_EXPRESSION = 0x8d;
const JS_UPDATE_EXPRESSION = 0x8e;
const JS_SEQUENCE_EXPRESSION = 0x8f;
const JS_ARRAY_EXPRESSION = 0x90;
const JS_OBJECT_EXPRESSION = 0x91;
const JS_TEMPLATE_LITERAL = 0x92;
const JS_TAGGED_TEMPLATE_EXPRESSION = 0x93;
const JS_TEMPLATE_ELEMENT = 0x94;
const JS_THIS_EXPRESSION = 0x95;
const JS_SUPER = 0x96;
const JS_IMPORT_EXPRESSION = 0x97;
const JS_AWAIT_EXPRESSION = 0x98;
const JS_YIELD_EXPRESSION = 0x99;
const JS_CHAIN_EXPRESSION = 0x9a;
const JS_META_PROPERTY = 0x9b;
const JS_SPREAD_ELEMENT = 0x9c;
const JS_OBJECT_PATTERN = 0x9d;
const JS_ARRAY_PATTERN = 0x9e;
const JS_ASSIGNMENT_PATTERN = 0x9f;
const JS_REST_ELEMENT = 0xa0;
const JS_PROPERTY = 0xa1;
const JS_PROGRAM = 0xa2;
const JS_EXPRESSION_STATEMENT = 0xa3;
const JS_BLOCK_STATEMENT = 0xa4;
const JS_VARIABLE_DECLARATION = 0xa5;
const JS_VARIABLE_DECLARATOR = 0xa6;
const JS_FUNCTION_DECLARATION = 0xa7;
const JS_CLASS_DECLARATION = 0xa8;
const JS_RETURN_STATEMENT = 0xa9;
const JS_THROW_STATEMENT = 0xaa;
const JS_IF_STATEMENT = 0xab;
const JS_FOR_STATEMENT = 0xac;
const JS_FOR_OF_STATEMENT = 0xad;
const JS_FOR_IN_STATEMENT = 0xae;
const JS_WHILE_STATEMENT = 0xaf;
const JS_DO_WHILE_STATEMENT = 0xb0;
const JS_TRY_STATEMENT = 0xb1;
const JS_CATCH_CLAUSE = 0xb2;
const JS_SWITCH_STATEMENT = 0xb3;
const JS_SWITCH_CASE = 0xb4;
const JS_LABELED_STATEMENT = 0xb5;
const JS_BREAK_STATEMENT = 0xb6;
const JS_CONTINUE_STATEMENT = 0xb7;
const JS_EMPTY_STATEMENT = 0xb8;
const JS_DEBUGGER_STATEMENT = 0xb9;
const JS_IMPORT_DECLARATION = 0xba;
const JS_IMPORT_SPECIFIER = 0xbb;
const JS_IMPORT_DEFAULT_SPECIFIER = 0xbc;
const JS_IMPORT_NAMESPACE_SPECIFIER = 0xbd;
const JS_EXPORT_NAMED_DECLARATION = 0xbe;
const JS_EXPORT_DEFAULT_DECLARATION = 0xbf;
const JS_EXPORT_SPECIFIER = 0xc0;
const JS_CLASS_BODY = 0xc1;
const JS_METHOD_DEFINITION = 0xc2;
const JS_PROPERTY_DEFINITION = 0xc3;
const JS_STATIC_BLOCK = 0xc4;
const JS_DECORATOR = 0xc5;
const JS_TS_TYPE_ANNOTATION = 0xc6;
const JS_TS_ENUM_DECLARATION = 0xc7;
const JS_TS_MODULE_DECLARATION = 0xc8;
const JS_COMMENT = 0xc9;
const JS_NULL = 0xca;
// 0xcb was the former whole-node JS_RAW_JSON escape (removed — TS type
// annotations now ride a per-node trailer; see readOptTypeAnnotation).
const JS_TS_PARAMETER_PROPERTY = 0xcc;
const JS_TS_AS_EXPRESSION = 0xcd;
const JS_TS_SATISFIES_EXPRESSION = 0xce;
const JS_TS_NON_NULL_EXPRESSION = 0xcf;
const JS_TS_TYPE_ASSERTION = 0xd0;
const JS_TS_INSTANTIATION_EXPRESSION = 0xd1;

// LiteralValue inner tag (within a JS_LITERAL payload).
const LV_NULL = 0;
const LV_BOOL_FALSE = 1;
const LV_BOOL_TRUE = 2;
const LV_NUMBER_I64 = 3;
const LV_NUMBER_F64 = 4;
const LV_STRING = 5;
const LV_REGEX = 6;

// Element tag -> serialised `type` string. The decoder uses this
// table for the shared element shape (RegularElement, Component, …).
const ELEMENT_TYPE_NAMES = Object.create(null);
ELEMENT_TYPE_NAMES[TAG_REGULAR_ELEMENT] = 'RegularElement';
ELEMENT_TYPE_NAMES[TAG_COMPONENT] = 'Component';
ELEMENT_TYPE_NAMES[TAG_TITLE_ELEMENT] = 'TitleElement';
ELEMENT_TYPE_NAMES[TAG_SLOT_ELEMENT] = 'SlotElement';
ELEMENT_TYPE_NAMES[TAG_SVELTE_BODY] = 'SvelteBody';
ELEMENT_TYPE_NAMES[TAG_SVELTE_DOCUMENT] = 'SvelteDocument';
ELEMENT_TYPE_NAMES[TAG_SVELTE_FRAGMENT] = 'SvelteFragment';
ELEMENT_TYPE_NAMES[TAG_SVELTE_BOUNDARY] = 'SvelteBoundary';
ELEMENT_TYPE_NAMES[TAG_SVELTE_HEAD] = 'SvelteHead';
ELEMENT_TYPE_NAMES[TAG_SVELTE_OPTIONS_EL] = 'SvelteOptions';
ELEMENT_TYPE_NAMES[TAG_SVELTE_SELF] = 'SvelteSelf';
ELEMENT_TYPE_NAMES[TAG_SVELTE_WINDOW] = 'SvelteWindow';
ELEMENT_TYPE_NAMES[TAG_SVELTE_COMPONENT] = 'SvelteComponent';
ELEMENT_TYPE_NAMES[TAG_SVELTE_ELEMENT] = 'SvelteElement';

const textDecoder = new TextDecoder('utf-8');

// Node's `Buffer.prototype.toString('utf8', start, end)` is ~2× faster
// than `TextDecoder.decode(subarray)` for the short ASCII strings that
// dominate an AST (identifier names, operators, literal raw strings).
// Use it when the input is a Node Buffer; fall back to `TextDecoder`
// for plain `Uint8Array` (browser / non-Node callers).
const hasBuffer = typeof Buffer !== 'undefined';

class EnvelopeError extends Error {}

/**
 * Decode a parse envelope produced by `napi.parseEnvelope(source)`.
 *
 * @param {Buffer | Uint8Array} buf
 * @returns {object} the root AST node, shape-compatible with `JSON.parse(napi.parse(source))`.
 */
function decodeParseEnvelope(buf) {
	if (!buf || typeof buf.byteLength !== 'number' || buf.byteLength < HEADER_LEN) {
		throw new EnvelopeError('parse envelope: buffer too small');
	}
	const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	const magic = view.getUint32(0, true);
	if (magic !== MAGIC) {
		throw new EnvelopeError(
			`parse envelope: bad magic 0x${magic.toString(16)} (expected 0x${MAGIC.toString(16)})`,
		);
	}
	const version = view.getUint32(4, true);
	if (version !== VERSION) {
		throw new EnvelopeError(
			`parse envelope: unsupported version ${version} (expected ${VERSION})`,
		);
	}
	const totalLen = view.getUint32(8, true);
	if (totalLen !== buf.byteLength) {
		throw new EnvelopeError(
			`parse envelope: total_len ${totalLen} != buffer.byteLength ${buf.byteLength}`,
		);
	}
	const rootOffset = view.getUint32(12, true);
	const flags = view.getUint32(20, true);
	const skipJsNodeLoc = (flags & FLAG_JSNODE_NO_LOC) !== 0;
	const cssStubOnly = (flags & FLAG_CSS_STUB_ONLY) !== 0;
	const bytes =
		buf instanceof Uint8Array
			? buf
			: new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
	// Stash the fastest string-decode primitive directly on `ctx`. Node
	// `Buffer.toString('utf8', start, end)` is ~2× faster than
	// `TextDecoder.decode(typedArray.subarray(start, end))` for the
	// short ASCII strings that dominate an AST.
	const isBuffer = hasBuffer && Buffer.isBuffer(bytes);
	const ctx = { view, bytes, pos: rootOffset, isBuffer, skipJsNodeLoc, cssStubOnly };
	return readNode(ctx);
}

// ---------------------------------------------------------------------------
// Cursor helpers — every read advances `ctx.pos`.
// ---------------------------------------------------------------------------

function readU8(ctx) {
	const v = ctx.view.getUint8(ctx.pos);
	ctx.pos += 1;
	return v;
}
function readU32(ctx) {
	const v = ctx.view.getUint32(ctx.pos, true);
	ctx.pos += 4;
	return v;
}
function readBool(ctx) {
	return readU8(ctx) !== 0;
}

/**
 * Validate that the byte window `[start, start + len)` lies fully inside
 * `ctx.bytes` (see `./lib/bounds-check.js`, shared with `envelope.js`'s
 * `assertWindow`, for why this must throw rather than let
 * `Buffer.toString`/`Uint8Array.subarray` clamp silently — M-012).
 *
 * @param {object} ctx
 * @param {number} start
 * @param {number} len
 * @param {string} label
 */
function assertWindow(ctx, start, len, label) {
	if (isWindowOutOfBounds(start, len, ctx.bytes.byteLength)) {
		throw new EnvelopeError(
			`parse envelope: ${windowOutOfBoundsMessage(label, start, len, ctx.bytes.byteLength)}`,
		);
	}
}

function readStr(ctx) {
	const len = readU32(ctx);
	const start = ctx.pos;
	const end = start + len;
	assertWindow(ctx, start, len, 'string');
	ctx.pos = end;
	// Branch is monomorphic per envelope: V8 specialises after warmup.
	return ctx.isBuffer
		? ctx.bytes.toString('utf8', start, end)
		: textDecoder.decode(ctx.bytes.subarray(start, end));
}
function readOptStr(ctx) {
	return readU8(ctx) === 0 ? null : readStr(ctx);
}
function readSourceLocation(ctx) {
	return {
		start: { line: readU32(ctx), column: readU32(ctx), character: readU32(ctx) },
		end: { line: readU32(ctx), column: readU32(ctx), character: readU32(ctx) },
	};
}
function readOptSourceLocation(ctx) {
	return readU8(ctx) === 0 ? null : readSourceLocation(ctx);
}
function readModifiers(ctx) {
	const count = readU32(ctx);
	const out = new Array(count);
	for (let i = 0; i < count; i++) out[i] = readStr(ctx);
	return out;
}

/** Read a length-prefixed JSON payload (no preamble). */
function readInlineJson(ctx) {
	const len = readU32(ctx);
	const start = ctx.pos;
	const end = start + len;
	assertWindow(ctx, start, len, 'inline JSON');
	ctx.pos = end;
	if (len === 0) return null;
	return JSON.parse(
		ctx.isBuffer
			? ctx.bytes.toString('utf8', start, end)
			: textDecoder.decode(ctx.bytes.subarray(start, end)),
	);
}

/** Read the TAG_JSON variant — preamble already consumed. */
function readJsonNodePayload(ctx) {
	return readInlineJson(ctx);
}

/**
 * Read an optional TS `typeAnnotation` trailer: a flag byte, then (when set) a
 * length-prefixed JSON blob. Mirrors `write_opt_type_annotation` in
 * `napi_raw_parse.rs`. Returns `null` when absent.
 */
function readOptTypeAnnotation(ctx) {
	if (readU8(ctx) === 0) return null;
	return readInlineJson(ctx);
}

// ---------------------------------------------------------------------------
// Dispatch on tag
// ---------------------------------------------------------------------------

function readNode(ctx) {
	const tag = readU8(ctx);
	const start = readU32(ctx);
	const end = readU32(ctx);
	return readNodeBody(ctx, tag, start, end);
}

function readNodeBody(ctx, tag, start, end) {
	switch (tag) {
		case TAG_JSON:
			return readJsonNodePayload(ctx);

		case TAG_ROOT:
			return readRoot(ctx, start, end);
		case TAG_FRAGMENT:
			return readFragment(ctx); // start/end of fragment are sentinels
		case TAG_JS_COMMENT:
			return readJsComment(ctx, start, end);

		case TAG_TEXT:
			return readText(ctx, start, end);
		case TAG_COMMENT:
			return readComment(ctx, start, end);
		case TAG_EXPRESSION_TAG:
			return readExpressionTag(ctx, start, end);
		case TAG_HTML_TAG:
			return readSingleExprTag(ctx, 'HtmlTag', start, end);
		case TAG_CONST_TAG:
			return readConstTag(ctx, start, end);
		case TAG_DEBUG_TAG:
			return readDebugTag(ctx, start, end);
		case TAG_RENDER_TAG:
			return readSingleExprTag(ctx, 'RenderTag', start, end);
		case TAG_ATTACH_TAG:
			return readSingleExprTag(ctx, 'AttachTag', start, end);

		case TAG_REGULAR_ELEMENT:
		case TAG_COMPONENT:
		case TAG_TITLE_ELEMENT:
		case TAG_SLOT_ELEMENT:
		case TAG_SVELTE_BODY:
		case TAG_SVELTE_DOCUMENT:
		case TAG_SVELTE_FRAGMENT:
		case TAG_SVELTE_BOUNDARY:
		case TAG_SVELTE_HEAD:
		case TAG_SVELTE_OPTIONS_EL:
		case TAG_SVELTE_SELF:
		case TAG_SVELTE_WINDOW:
			return readElement(ctx, ELEMENT_TYPE_NAMES[tag], start, end);
		case TAG_SVELTE_COMPONENT:
			return readSvelteComponentElement(ctx, start, end);
		case TAG_SVELTE_ELEMENT:
			return readSvelteDynamicElement(ctx, start, end);

		case TAG_SCRIPT:
			return readScript(ctx, start, end);

		case TAG_ATTRIBUTE:
			return readAttributeNode(ctx, start, end);
		case TAG_SPREAD_ATTRIBUTE:
			return readSpreadAttribute(ctx, start, end);
		case TAG_BIND_DIRECTIVE:
			return readBindDirective(ctx, start, end);
		case TAG_ON_DIRECTIVE:
			return readOnDirective(ctx, start, end);
		case TAG_CLASS_DIRECTIVE:
			return readClassDirective(ctx, start, end);
		case TAG_STYLE_DIRECTIVE:
			return readStyleDirective(ctx, start, end);
		case TAG_TRANSITION_DIRECTIVE:
			return readTransitionDirective(ctx, start, end);
		case TAG_ANIMATE_DIRECTIVE:
			return readAnimateDirective(ctx, start, end);
		case TAG_USE_DIRECTIVE:
			return readUseDirective(ctx, start, end);
		case TAG_LET_DIRECTIVE:
			return readLetDirective(ctx, start, end);

		case TAG_IF_BLOCK:
			return readIfBlock(ctx, start, end);
		case TAG_EACH_BLOCK:
			return readEachBlock(ctx, start, end);
		case TAG_AWAIT_BLOCK:
			return readAwaitBlock(ctx, start, end);
		case TAG_KEY_BLOCK:
			return readKeyBlock(ctx, start, end);
		case TAG_SNIPPET_BLOCK:
			return readSnippetBlock(ctx, start, end);

		// ----- JsNode (estree) ----------------------------------------
		case JS_NULL:
			return null;
		case JS_IDENTIFIER:
			return readJsIdentifier(ctx, start, end);
		case JS_PRIVATE_IDENTIFIER:
			return readJsPrivateIdentifier(ctx, start, end);
		case JS_LITERAL:
			return readJsLiteral(ctx, start, end);
		case JS_BINARY_EXPRESSION:
			return readJsBinaryLike(ctx, 'BinaryExpression', start, end);
		case JS_LOGICAL_EXPRESSION:
			return readJsBinaryLike(ctx, 'LogicalExpression', start, end);
		case JS_UNARY_EXPRESSION:
			return readJsUnaryExpression(ctx, start, end);
		case JS_CONDITIONAL_EXPRESSION:
			return readJsConditionalExpression(ctx, start, end);
		case JS_CALL_EXPRESSION:
			return readJsCallExpression(ctx, start, end);
		case JS_MEMBER_EXPRESSION:
			return readJsMemberExpression(ctx, start, end);
		case JS_NEW_EXPRESSION:
			return readJsNewExpression(ctx, start, end);
		case JS_FUNCTION_EXPRESSION:
			return readJsFunctionExpression(ctx, start, end);
		case JS_CLASS_EXPRESSION:
			return readJsClassExpression(ctx, start, end);
		case JS_ARROW_FUNCTION_EXPRESSION:
			return readJsArrowFunctionExpression(ctx, start, end);
		case JS_ASSIGNMENT_EXPRESSION:
			return readJsAssignmentExpression(ctx, start, end);
		case JS_UPDATE_EXPRESSION:
			return readJsUpdateExpression(ctx, start, end);
		case JS_SEQUENCE_EXPRESSION:
			return readJsSequenceExpression(ctx, start, end);
		case JS_ARRAY_EXPRESSION:
			return readJsArrayExpression(ctx, start, end);
		case JS_OBJECT_EXPRESSION:
			return readJsObjectExpression(ctx, start, end);
		case JS_TEMPLATE_LITERAL:
			return readJsTemplateLiteral(ctx, start, end);
		case JS_TAGGED_TEMPLATE_EXPRESSION:
			return readJsTaggedTemplateExpression(ctx, start, end);
		case JS_TEMPLATE_ELEMENT:
			return readJsTemplateElement(ctx, start, end);
		case JS_THIS_EXPRESSION:
			return readJsBareExpr(ctx, 'ThisExpression', start, end);
		case JS_SUPER:
			return readJsBareExpr(ctx, 'Super', start, end);
		case JS_IMPORT_EXPRESSION:
			return readJsImportExpression(ctx, start, end);
		case JS_AWAIT_EXPRESSION:
			return readJsAwaitExpression(ctx, start, end);
		case JS_YIELD_EXPRESSION:
			return readJsYieldExpression(ctx, start, end);
		case JS_CHAIN_EXPRESSION:
			return readJsChainExpression(ctx, start, end);
		case JS_META_PROPERTY:
			return readJsMetaProperty(ctx, start, end);
		case JS_SPREAD_ELEMENT:
			return readJsSpreadElement(ctx, start, end);
		case JS_OBJECT_PATTERN:
			return readJsObjectPattern(ctx, start, end);
		case JS_ARRAY_PATTERN:
			return readJsArrayPattern(ctx, start, end);
		case JS_ASSIGNMENT_PATTERN:
			return readJsAssignmentPattern(ctx, start, end);
		case JS_REST_ELEMENT:
			return readJsRestElement(ctx, start, end);
		case JS_PROPERTY:
			return readJsProperty(ctx, start, end);
		case JS_PROGRAM:
			return readJsProgram(ctx, start, end);
		case JS_EXPRESSION_STATEMENT:
			return readJsExpressionStatement(ctx, start, end);
		case JS_BLOCK_STATEMENT:
			return readJsBlockStatement(ctx, start, end);
		case JS_VARIABLE_DECLARATION:
			return readJsVariableDeclaration(ctx, start, end);
		case JS_VARIABLE_DECLARATOR:
			return readJsVariableDeclarator(ctx, start, end);
		case JS_FUNCTION_DECLARATION:
			return readJsFunctionDeclaration(ctx, start, end);
		case JS_CLASS_DECLARATION:
			return readJsClassDeclaration(ctx, start, end);
		case JS_RETURN_STATEMENT:
			return readJsReturnStatement(ctx, start, end);
		case JS_THROW_STATEMENT:
			return readJsThrowStatement(ctx, start, end);
		case JS_IF_STATEMENT:
			return readJsIfStatement(ctx, start, end);
		case JS_FOR_STATEMENT:
			return readJsForStatement(ctx, start, end);
		case JS_FOR_OF_STATEMENT:
			return readJsForOfStatement(ctx, start, end);
		case JS_FOR_IN_STATEMENT:
			return readJsForInStatement(ctx, start, end);
		case JS_WHILE_STATEMENT:
			return readJsWhileStatement(ctx, start, end);
		case JS_DO_WHILE_STATEMENT:
			return readJsDoWhileStatement(ctx, start, end);
		case JS_TRY_STATEMENT:
			return readJsTryStatement(ctx, start, end);
		case JS_CATCH_CLAUSE:
			return readJsCatchClause(ctx, start, end);
		case JS_SWITCH_STATEMENT:
			return readJsSwitchStatement(ctx, start, end);
		case JS_SWITCH_CASE:
			return readJsSwitchCase(ctx, start, end);
		case JS_LABELED_STATEMENT:
			return readJsLabeledStatement(ctx, start, end);
		case JS_BREAK_STATEMENT:
			return readJsBreakStatement(ctx, start, end);
		case JS_CONTINUE_STATEMENT:
			return readJsContinueStatement(ctx, start, end);
		case JS_EMPTY_STATEMENT:
			return readJsBareExpr(ctx, 'EmptyStatement', start, end);
		case JS_DEBUGGER_STATEMENT:
			return readJsBareExpr(ctx, 'DebuggerStatement', start, end);
		case JS_IMPORT_DECLARATION:
			return readJsImportDeclaration(ctx, start, end);
		case JS_IMPORT_SPECIFIER:
			return readJsImportSpecifier(ctx, start, end);
		case JS_IMPORT_DEFAULT_SPECIFIER:
			return readJsImportDefaultSpecifier(ctx, start, end);
		case JS_IMPORT_NAMESPACE_SPECIFIER:
			return readJsImportNamespaceSpecifier(ctx, start, end);
		case JS_EXPORT_NAMED_DECLARATION:
			return readJsExportNamedDeclaration(ctx, start, end);
		case JS_EXPORT_DEFAULT_DECLARATION:
			return readJsExportDefaultDeclaration(ctx, start, end);
		case JS_EXPORT_SPECIFIER:
			return readJsExportSpecifier(ctx, start, end);
		case JS_CLASS_BODY:
			return readJsClassBody(ctx, start, end);
		case JS_METHOD_DEFINITION:
			return readJsMethodDefinition(ctx, start, end);
		case JS_PROPERTY_DEFINITION:
			return readJsPropertyDefinition(ctx, start, end);
		case JS_STATIC_BLOCK:
			return readJsStaticBlock(ctx, start, end);
		case JS_DECORATOR:
			return readJsBareExpr(ctx, 'Decorator', start, end);
		case JS_TS_TYPE_ANNOTATION:
			return readJsTSTypeAnnotation(ctx, start, end);
		case JS_TS_ENUM_DECLARATION:
			return readJsBareExpr(ctx, 'TSEnumDeclaration', start, end);
		case JS_TS_PARAMETER_PROPERTY:
			return readJsBareExpr(ctx, 'TSParameterProperty', start, end);
		case JS_TS_MODULE_DECLARATION:
			return readJsTSModuleDeclaration(ctx, start, end);
		case JS_TS_AS_EXPRESSION:
			return readJsTSAssertion(ctx, 'TSAsExpression', start, end, true);
		case JS_TS_SATISFIES_EXPRESSION:
			return readJsTSAssertion(ctx, 'TSSatisfiesExpression', start, end, true);
		case JS_TS_NON_NULL_EXPRESSION:
			return readJsTSAssertion(ctx, 'TSNonNullExpression', start, end, false);
		case JS_TS_TYPE_ASSERTION:
			return readJsTSTypeAssertion(ctx, start, end);
		case JS_TS_INSTANTIATION_EXPRESSION:
			return readJsTSInstantiationExpression(ctx, start, end);
		case JS_COMMENT:
			return readJsComment_(ctx, start, end);

		default:
			throw new EnvelopeError(
				`parse envelope: unknown tag 0x${tag.toString(16)} at offset ${ctx.pos - 9}`,
			);
	}
}

// ---------------------------------------------------------------------------
// JsNode (estree) decoders
// ---------------------------------------------------------------------------

function readTypedLoc(ctx) {
	// Fast path: when the envelope advertised that no JsNode carries
	// `loc`, the encoder skipped every loc-flag byte. Mirror that here.
	if (ctx.skipJsNodeLoc) return null;
	if (readU8(ctx) === 0) return null;
	const startLine = readU32(ctx);
	const startCol = readU32(ctx);
	const startChar = readU8(ctx) !== 0 ? readU32(ctx) : null;
	const endLine = readU32(ctx);
	const endCol = readU32(ctx);
	const endChar = readU8(ctx) !== 0 ? readU32(ctx) : null;
	const startPos = { line: startLine, column: startCol };
	if (startChar !== null) startPos.character = startChar;
	const endPos = { line: endLine, column: endCol };
	if (endChar !== null) endPos.character = endChar;
	return { start: startPos, end: endPos };
}

function readLiteralValue(ctx) {
	const tag = readU8(ctx);
	switch (tag) {
		case LV_NULL:
			return null;
		case LV_BOOL_FALSE:
			return false;
		case LV_BOOL_TRUE:
			return true;
		case LV_NUMBER_I64: {
			// Two 32-bit reads — BigInt then to Number (preserves sign for negatives within JS-safe range).
			const lo = readU32(ctx);
			const hi = readU32(ctx);
			const sign = hi >>> 31;
			if (sign === 0) return hi * 0x100000000 + lo;
			// Two's complement: subtract 2^64.
			return (hi - 0x100000000) * 0x100000000 + lo;
		}
		case LV_NUMBER_F64: {
			const dv = ctx.view;
			const v = dv.getFloat64(ctx.pos, true);
			ctx.pos += 8;
			return v;
		}
		case LV_STRING:
			return readStr(ctx);
		case LV_REGEX:
			return {}; // Literal.regex value is serialised as an empty object upstream.
		default:
			throw new EnvelopeError(`parse envelope: bad LiteralValue tag 0x${tag.toString(16)}`);
	}
}

function readRegex(ctx) {
	if (readU8(ctx) === 0) return null;
	const pattern = readStr(ctx);
	const flags = readStr(ctx);
	return { pattern, flags };
}

function readTemplateElementValue(ctx) {
	const raw = readStr(ctx);
	const cooked = readU8(ctx) !== 0 ? readStr(ctx) : null;
	return { raw, cooked };
}

function readChildArray(ctx) {
	const count = readU32(ctx);
	const out = new Array(count);
	for (let i = 0; i < count; i++) out[i] = readNode(ctx);
	return out;
}

function readNullableChildArray(ctx) {
	// `Vec<Option<JsNode>>` — element is null when the flag byte is 0.
	const count = readU32(ctx);
	const out = new Array(count);
	for (let i = 0; i < count; i++) {
		out[i] = readU8(ctx) !== 0 ? readNode(ctx) : null;
	}
	return out;
}

function readOptNode(ctx) {
	return readU8(ctx) !== 0 ? readNode(ctx) : null;
}

function readJsIdentifier(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const name = readStr(ctx);
	const optional = readBool(ctx);
	const node = { type: 'Identifier', start, end };
	if (loc !== null) node.loc = loc;
	node.name = name;
	if (optional) node.optional = true;
	const typeAnnotation = readOptTypeAnnotation(ctx);
	if (typeAnnotation !== null) node.typeAnnotation = typeAnnotation;
	return node;
}

function readJsPrivateIdentifier(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const name = readStr(ctx);
	const node = { type: 'PrivateIdentifier', start, end };
	if (loc !== null) node.loc = loc;
	node.name = name;
	return node;
}

function readJsLiteral(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const value = readLiteralValue(ctx);
	const raw = readStr(ctx);
	const regex = readRegex(ctx);
	const node = { type: 'Literal', start, end };
	if (loc !== null) node.loc = loc;
	node.value = value;
	node.raw = raw;
	if (regex !== null) node.regex = regex;
	return node;
}

function readJsBinaryLike(ctx, typeName, start, end) {
	const loc = readTypedLoc(ctx);
	const left = readNode(ctx);
	const operator = readStr(ctx);
	const right = readNode(ctx);
	const node = { type: typeName, start, end };
	if (loc !== null) node.loc = loc;
	node.left = left;
	node.operator = operator;
	node.right = right;
	return node;
}

function readJsUnaryExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const operator = readStr(ctx);
	const prefix = readBool(ctx);
	const argument = readNode(ctx);
	const node = { type: 'UnaryExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.operator = operator;
	node.prefix = prefix;
	node.argument = argument;
	return node;
}

function readJsConditionalExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const test = readNode(ctx);
	const consequent = readNode(ctx);
	const alternate = readNode(ctx);
	const node = { type: 'ConditionalExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.test = test;
	node.consequent = consequent;
	node.alternate = alternate;
	return node;
}

function readJsCallExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const callee = readNode(ctx);
	const args = readChildArray(ctx);
	const optional = readBool(ctx);
	const node = { type: 'CallExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.callee = callee;
	node.arguments = args;
	node.optional = optional;
	return node;
}

function readJsMemberExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const object = readNode(ctx);
	const property = readNode(ctx);
	const computed = readBool(ctx);
	const optional = readBool(ctx);
	const node = { type: 'MemberExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.object = object;
	node.property = property;
	node.computed = computed;
	node.optional = optional;
	return node;
}

function readJsNewExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const callee = readNode(ctx);
	const args = readChildArray(ctx);
	const node = { type: 'NewExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.callee = callee;
	node.arguments = args;
	return node;
}

function readJsFunctionExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const id = readOptNode(ctx);
	const expression = readBool(ctx);
	const generator = readBool(ctx);
	const asyncFlag = readBool(ctx);
	const typeParameters = readOptTypeAnnotation(ctx);
	const params = readChildArray(ctx);
	const body = readOptNode(ctx);
	// Object-method inner functions carry `typeParameters` after `body` (acorn).
	const typeParametersAfterBody = readBool(ctx);
	const node = { type: 'FunctionExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.id = id;
	node.expression = expression;
	node.generator = generator;
	node.async = asyncFlag;
	if (typeParameters !== null && !typeParametersAfterBody) node.typeParameters = typeParameters;
	node.params = params;
	node.body = body;
	if (typeParameters !== null && typeParametersAfterBody) node.typeParameters = typeParameters;
	return node;
}

function readJsClassExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const id = readOptNode(ctx);
	const superClass = readOptNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'ClassExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.id = id;
	node.superClass = superClass;
	node.body = body;
	return node;
}

function readJsArrowFunctionExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const id = readOptNode(ctx);
	const expression = readBool(ctx);
	const generator = readBool(ctx);
	const asyncFlag = readBool(ctx);
	const params = readChildArray(ctx);
	const body = readNode(ctx);
	const typeParameters = readOptTypeAnnotation(ctx);
	const node = { type: 'ArrowFunctionExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.id = id;
	node.expression = expression;
	node.generator = generator;
	node.async = asyncFlag;
	node.params = params;
	node.body = body;
	if (typeParameters !== null) node.typeParameters = typeParameters;
	return node;
}

function readJsAssignmentExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const operator = readStr(ctx);
	const left = readNode(ctx);
	const right = readNode(ctx);
	const node = { type: 'AssignmentExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.operator = operator;
	node.left = left;
	node.right = right;
	return node;
}

function readJsUpdateExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const operator = readStr(ctx);
	const prefix = readBool(ctx);
	const argument = readNode(ctx);
	const node = { type: 'UpdateExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.operator = operator;
	node.prefix = prefix;
	node.argument = argument;
	return node;
}

function readJsSequenceExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const expressions = readChildArray(ctx);
	const node = { type: 'SequenceExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.expressions = expressions;
	return node;
}

function readJsArrayExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const elements = readNullableChildArray(ctx);
	const node = { type: 'ArrayExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.elements = elements;
	return node;
}

function readJsObjectExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const properties = readChildArray(ctx);
	const node = { type: 'ObjectExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.properties = properties;
	return node;
}

function readJsTemplateLiteral(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const quasis = readChildArray(ctx);
	const expressions = readChildArray(ctx);
	const node = { type: 'TemplateLiteral', start, end };
	if (loc !== null) node.loc = loc;
	node.quasis = quasis;
	node.expressions = expressions;
	return node;
}

function readJsTaggedTemplateExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const tag = readNode(ctx);
	const quasi = readNode(ctx);
	const node = { type: 'TaggedTemplateExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.tag = tag;
	node.quasi = quasi;
	return node;
}

function readJsTemplateElement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const tail = readBool(ctx);
	const value = readTemplateElementValue(ctx);
	const node = { type: 'TemplateElement', start, end };
	if (loc !== null) node.loc = loc;
	node.tail = tail;
	node.value = value;
	return node;
}

function readJsBareExpr(ctx, typeName, start, end) {
	const loc = readTypedLoc(ctx);
	const node = { type: typeName, start, end };
	if (loc !== null) node.loc = loc;
	return node;
}

function readJsImportExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const source = readNode(ctx);
	const node = { type: 'ImportExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.source = source;
	// The upstream serializer also adds `options: null`. Match that.
	node.options = null;
	return node;
}

function readJsAwaitExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const argument = readNode(ctx);
	const node = { type: 'AwaitExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.argument = argument;
	return node;
}

function readJsYieldExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const delegate = readBool(ctx);
	const argument = readOptNode(ctx);
	const node = { type: 'YieldExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.delegate = delegate;
	node.argument = argument;
	return node;
}

function readJsChainExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const expression = readNode(ctx);
	const node = { type: 'ChainExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.expression = expression;
	return node;
}

// TS assertion wrappers (`x as T` / `x satisfies T` / `x!`). As/Satisfies carry
// a `typeAnnotation` trailer; NonNull does not (`hasTypeAnnotation` is false).
function readJsTSAssertion(ctx, typeName, start, end, hasTypeAnnotation) {
	const loc = readTypedLoc(ctx);
	const expression = readNode(ctx);
	const node = { type: typeName, start, end };
	if (loc !== null) node.loc = loc;
	node.expression = expression;
	if (hasTypeAnnotation) {
		const typeAnnotation = readOptTypeAnnotation(ctx);
		if (typeAnnotation !== null) node.typeAnnotation = typeAnnotation;
	}
	return node;
}

function readJsTSTypeAssertion(ctx, start, end) {
	// Wire order: loc, expression, typeAnnotation — but svelte/compiler emits
	// `typeAnnotation` before `expression`, so build the object in that order.
	const loc = readTypedLoc(ctx);
	const expression = readNode(ctx);
	const typeAnnotation = readOptTypeAnnotation(ctx);
	const node = { type: 'TSTypeAssertion', start, end };
	if (loc !== null) node.loc = loc;
	if (typeAnnotation !== null) node.typeAnnotation = typeAnnotation;
	node.expression = expression;
	return node;
}

function readJsTSInstantiationExpression(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const expression = readNode(ctx);
	const typeArguments = readOptTypeAnnotation(ctx);
	const node = { type: 'TSInstantiationExpression', start, end };
	if (loc !== null) node.loc = loc;
	node.expression = expression;
	if (typeArguments !== null) node.typeArguments = typeArguments;
	return node;
}

function readJsMetaProperty(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const meta = readNode(ctx);
	const property = readNode(ctx);
	const node = { type: 'MetaProperty', start, end };
	if (loc !== null) node.loc = loc;
	node.meta = meta;
	node.property = property;
	return node;
}

function readJsSpreadElement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const argument = readNode(ctx);
	const node = { type: 'SpreadElement', start, end };
	if (loc !== null) node.loc = loc;
	node.argument = argument;
	return node;
}

function readJsObjectPattern(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const properties = readChildArray(ctx);
	const node = { type: 'ObjectPattern', start, end };
	if (loc !== null) node.loc = loc;
	node.properties = properties;
	const typeAnnotation = readOptTypeAnnotation(ctx);
	if (typeAnnotation !== null) node.typeAnnotation = typeAnnotation;
	return node;
}

function readJsArrayPattern(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const elements = readNullableChildArray(ctx);
	const node = { type: 'ArrayPattern', start, end };
	if (loc !== null) node.loc = loc;
	node.elements = elements;
	const typeAnnotation = readOptTypeAnnotation(ctx);
	if (typeAnnotation !== null) node.typeAnnotation = typeAnnotation;
	return node;
}

function readJsAssignmentPattern(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const left = readNode(ctx);
	const right = readNode(ctx);
	const node = { type: 'AssignmentPattern', start, end };
	if (loc !== null) node.loc = loc;
	node.left = left;
	node.right = right;
	return node;
}

function readJsRestElement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const argument = readNode(ctx);
	const node = { type: 'RestElement', start, end };
	if (loc !== null) node.loc = loc;
	node.argument = argument;
	return node;
}

function readJsProperty(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const method = readBool(ctx);
	const shorthand = readBool(ctx);
	const computed = readBool(ctx);
	const key = readNode(ctx);
	const value = readNode(ctx);
	const kind = readStr(ctx);
	const node = { type: 'Property', start, end };
	if (loc !== null) node.loc = loc;
	node.method = method;
	node.shorthand = shorthand;
	node.computed = computed;
	node.key = key;
	node.value = value;
	node.kind = kind;
	return node;
}

function readJsProgram(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const body = readChildArray(ctx);
	const sourceType = readStr(ctx);
	const trailing = readU8(ctx) !== 0 ? readInlineJson(ctx) : undefined;
	const leading = readU8(ctx) !== 0 ? readInlineJson(ctx) : undefined;
	const node = { type: 'Program', start, end };
	if (loc !== null) node.loc = loc;
	node.body = body;
	node.sourceType = sourceType;
	if (trailing !== undefined) node.trailingComments = trailing;
	if (leading !== undefined) node.leadingComments = leading;
	return node;
}

function readJsExpressionStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const expression = readNode(ctx);
	const node = { type: 'ExpressionStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.expression = expression;
	return node;
}

function readJsBlockStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const body = readChildArray(ctx);
	const node = { type: 'BlockStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.body = body;
	return node;
}

function readJsVariableDeclaration(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const declarations = readChildArray(ctx);
	const kind = readStr(ctx);
	const declare = readBool(ctx);
	const node = { type: 'VariableDeclaration', start, end };
	if (loc !== null) node.loc = loc;
	node.declarations = declarations;
	node.kind = kind;
	if (declare) node.declare = true;
	return node;
}

function readJsVariableDeclarator(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const id = readNode(ctx);
	const init = readOptNode(ctx);
	const node = { type: 'VariableDeclarator', start, end };
	if (loc !== null) node.loc = loc;
	node.id = id;
	node.init = init;
	return node;
}

function readJsFunctionDeclaration(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const id = readOptNode(ctx);
	const expression = readBool(ctx);
	const generator = readBool(ctx);
	const asyncFlag = readBool(ctx);
	const typeParameters = readOptTypeAnnotation(ctx);
	const params = readChildArray(ctx);
	const body = readOptNode(ctx);
	const node = { type: 'FunctionDeclaration', start, end };
	if (loc !== null) node.loc = loc;
	node.id = id;
	node.expression = expression;
	node.generator = generator;
	node.async = asyncFlag;
	if (typeParameters !== null) node.typeParameters = typeParameters;
	node.params = params;
	node.body = body;
	return node;
}

function readJsClassDeclaration(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const id = readOptNode(ctx);
	const superClass = readOptNode(ctx);
	const body = readNode(ctx);
	const declare = readBool(ctx);
	const abstractFlag = readBool(ctx);
	const implementsFlag = readBool(ctx);
	const decorators = readChildArray(ctx);
	const node = { type: 'ClassDeclaration', start, end };
	if (loc !== null) node.loc = loc;
	node.id = id;
	node.superClass = superClass;
	node.body = body;
	if (declare) node.declare = true;
	if (abstractFlag) node.abstract = true;
	if (implementsFlag) node.implements = true;
	if (decorators.length > 0) node.decorators = decorators;
	return node;
}

function readJsReturnStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const argument = readOptNode(ctx);
	const node = { type: 'ReturnStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.argument = argument;
	return node;
}

function readJsThrowStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const argument = readNode(ctx);
	const node = { type: 'ThrowStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.argument = argument;
	return node;
}

function readJsIfStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const test = readNode(ctx);
	const consequent = readNode(ctx);
	const alternate = readOptNode(ctx);
	const node = { type: 'IfStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.test = test;
	node.consequent = consequent;
	node.alternate = alternate;
	return node;
}

function readJsForStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const init = readOptNode(ctx);
	const test = readOptNode(ctx);
	const update = readOptNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'ForStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.init = init;
	node.test = test;
	node.update = update;
	node.body = body;
	return node;
}

function readJsForOfStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const awaitFlag = readBool(ctx);
	const left = readNode(ctx);
	const right = readNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'ForOfStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.await = awaitFlag;
	node.left = left;
	node.right = right;
	node.body = body;
	return node;
}

function readJsForInStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const left = readNode(ctx);
	const right = readNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'ForInStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.left = left;
	node.right = right;
	node.body = body;
	return node;
}

function readJsWhileStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const test = readNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'WhileStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.test = test;
	node.body = body;
	return node;
}

function readJsDoWhileStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const test = readNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'DoWhileStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.test = test;
	node.body = body;
	return node;
}

function readJsTryStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const block = readNode(ctx);
	const handler = readOptNode(ctx);
	const finalizer = readOptNode(ctx);
	const node = { type: 'TryStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.block = block;
	node.handler = handler;
	node.finalizer = finalizer;
	return node;
}

function readJsCatchClause(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const param = readOptNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'CatchClause', start, end };
	if (loc !== null) node.loc = loc;
	node.param = param;
	node.body = body;
	return node;
}

function readJsSwitchStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const discriminant = readNode(ctx);
	const cases = readChildArray(ctx);
	const node = { type: 'SwitchStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.discriminant = discriminant;
	node.cases = cases;
	return node;
}

function readJsSwitchCase(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const test = readOptNode(ctx);
	const consequent = readChildArray(ctx);
	const node = { type: 'SwitchCase', start, end };
	if (loc !== null) node.loc = loc;
	node.test = test;
	node.consequent = consequent;
	return node;
}

function readJsLabeledStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const label = readNode(ctx);
	const body = readNode(ctx);
	const node = { type: 'LabeledStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.label = label;
	node.body = body;
	return node;
}

function readJsBreakStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const label = readOptNode(ctx);
	const node = { type: 'BreakStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.label = label;
	return node;
}

function readJsContinueStatement(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const label = readOptNode(ctx);
	const node = { type: 'ContinueStatement', start, end };
	if (loc !== null) node.loc = loc;
	node.label = label;
	return node;
}

function readJsImportDeclaration(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const specifiers = readChildArray(ctx);
	const source = readNode(ctx);
	const importKind = readOptStr(ctx);
	const attributes = readChildArray(ctx);
	const node = { type: 'ImportDeclaration', start, end };
	if (loc !== null) node.loc = loc;
	node.specifiers = specifiers;
	node.source = source;
	if (importKind !== null) node.importKind = importKind;
	node.attributes = attributes;
	return node;
}

function readJsImportSpecifier(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const imported = readNode(ctx);
	const local = readNode(ctx);
	const importKind = readOptStr(ctx);
	const node = { type: 'ImportSpecifier', start, end };
	if (loc !== null) node.loc = loc;
	node.imported = imported;
	node.local = local;
	if (importKind !== null) node.importKind = importKind;
	return node;
}

function readJsImportDefaultSpecifier(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const local = readNode(ctx);
	const node = { type: 'ImportDefaultSpecifier', start, end };
	if (loc !== null) node.loc = loc;
	node.local = local;
	return node;
}

function readJsImportNamespaceSpecifier(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const local = readNode(ctx);
	const node = { type: 'ImportNamespaceSpecifier', start, end };
	if (loc !== null) node.loc = loc;
	node.local = local;
	return node;
}

function readJsExportNamedDeclaration(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const declaration = readOptNode(ctx);
	const specifiers = readChildArray(ctx);
	const source = readOptNode(ctx);
	const exportKind = readOptStr(ctx);
	const attributes = readChildArray(ctx);
	const node = { type: 'ExportNamedDeclaration', start, end };
	if (loc !== null) node.loc = loc;
	node.declaration = declaration;
	node.specifiers = specifiers;
	node.source = source;
	if (exportKind !== null) node.exportKind = exportKind;
	node.attributes = attributes;
	return node;
}

function readJsExportDefaultDeclaration(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const declaration = readNode(ctx);
	const node = { type: 'ExportDefaultDeclaration', start, end };
	if (loc !== null) node.loc = loc;
	node.declaration = declaration;
	return node;
}

function readJsExportSpecifier(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const local = readNode(ctx);
	const exported = readNode(ctx);
	const exportKind = readOptStr(ctx);
	const node = { type: 'ExportSpecifier', start, end };
	if (loc !== null) node.loc = loc;
	node.local = local;
	node.exported = exported;
	if (exportKind !== null) node.exportKind = exportKind;
	return node;
}

function readJsClassBody(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const body = readChildArray(ctx);
	const node = { type: 'ClassBody', start, end };
	if (loc !== null) node.loc = loc;
	node.body = body;
	return node;
}

function readJsMethodDefinition(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const staticFlag = readBool(ctx);
	const computed = readBool(ctx);
	const kind = readStr(ctx);
	const key = readNode(ctx);
	const value = readNode(ctx);
	const node = { type: 'MethodDefinition', start, end };
	if (loc !== null) node.loc = loc;
	node.static = staticFlag;
	node.computed = computed;
	node.kind = kind;
	node.key = key;
	node.value = value;
	return node;
}

function readJsPropertyDefinition(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const staticFlag = readBool(ctx);
	const computed = readBool(ctx);
	const key = readNode(ctx);
	const value = readOptNode(ctx);
	const node = { type: 'PropertyDefinition', start, end };
	if (loc !== null) node.loc = loc;
	node.static = staticFlag;
	node.computed = computed;
	node.key = key;
	node.value = value;
	return node;
}

function readJsStaticBlock(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const body = readChildArray(ctx);
	const node = { type: 'StaticBlock', start, end };
	if (loc !== null) node.loc = loc;
	node.body = body;
	return node;
}

function readJsTSTypeAnnotation(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const typeAnnotation = readNode(ctx);
	const node = { type: 'TSTypeAnnotation', start, end };
	if (loc !== null) node.loc = loc;
	node.typeAnnotation = typeAnnotation;
	return node;
}

function readJsTSModuleDeclaration(ctx, start, end) {
	const loc = readTypedLoc(ctx);
	const body = readOptNode(ctx);
	const node = { type: 'TSModuleDeclaration', start, end };
	if (loc !== null) node.loc = loc;
	if (body !== null) node.body = body;
	return node;
}

function readJsComment_(ctx, start, end) {
	// JsNode::Comment emits `{type: <"Line"|"Block">, start, end, value}` —
	// the type tag itself carries the discriminator.
	const commentType = readStr(ctx);
	const value = readStr(ctx);
	return { type: commentType, start, end, value };
}

// ---------------------------------------------------------------------------
// Concrete decoders
// ---------------------------------------------------------------------------

function readRoot(ctx, start, end) {
	const root = { css: null, js: null, start, end, type: 'Root', fragment: null, options: null };
	if (readU8(ctx) === 0) {
		root.css = null;
	} else if (ctx.cssStubOnly) {
		// `FLAG_CSS_STUB_ONLY` — the encoder wrote a TAG_JSON preamble
		// with an empty payload; the only information that survives is
		// the outer `start` / `end`. Rebuild the minimal StyleSheet
		// shape consumers expect.
		const tag = readU8(ctx);
		const cssStart = readU32(ctx);
		const cssEnd = readU32(ctx);
		const len = readU32(ctx);
		ctx.pos += len;
		void tag;
		root.css = {
			type: 'StyleSheet',
			start: cssStart,
			end: cssEnd,
			attributes: [],
			children: [],
			content: { start: cssStart, end: cssEnd, styles: '', comment: null },
		};
	} else {
		root.css = readJsonNodeWithPreamble(ctx);
	}
	root.js = readJsonNodeWithPreamble(ctx);
	root.fragment = readFragmentDirect(ctx);
	root.options = readU8(ctx) === 0 ? null : readJsonNodeWithPreamble(ctx);
	const commentsCount = readU32(ctx);
	if (commentsCount > 0) {
		const comments = new Array(commentsCount);
		for (let i = 0; i < commentsCount; i++) comments[i] = readNode(ctx);
		root.comments = comments;
	}
	if (readU8(ctx) !== 0) root.instance = readNode(ctx);
	if (readU8(ctx) !== 0) root.module = readNode(ctx);
	return root;
}

function readJsonNodeWithPreamble(ctx) {
	// Read a TAG_JSON node where the preamble lives at the current
	// cursor (used by Root for child slots — css, js, options).
	const tag = readU8(ctx);
	const _start = readU32(ctx);
	const _end = readU32(ctx);
	void _start;
	void _end;
	if (tag !== TAG_JSON) {
		throw new EnvelopeError(
			`parse envelope: expected TAG_JSON child but got 0x${tag.toString(16)}`,
		);
	}
	return readJsonNodePayload(ctx);
}

function readFragment(ctx) {
	const count = readU32(ctx);
	const nodes = new Array(count);
	for (let i = 0; i < count; i++) nodes[i] = readNode(ctx);
	return { type: 'Fragment', nodes };
}

function readFragmentDirect(ctx) {
	// Expect the TAG_FRAGMENT preamble at the cursor.
	const tag = readU8(ctx);
	const _start = readU32(ctx);
	const _end = readU32(ctx);
	void _start;
	void _end;
	if (tag !== TAG_FRAGMENT) {
		throw new EnvelopeError(
			`parse envelope: expected TAG_FRAGMENT but got 0x${tag.toString(16)}`,
		);
	}
	return readFragment(ctx);
}

function readJsComment(ctx, start, end) {
	const kindByte = readU8(ctx);
	const kind = kindByte === 1 ? 'Block' : 'Line';
	const value = readStr(ctx);
	const loc = readSourceLocation(ctx);
	return { type: kind, start, end, value, loc };
}

function readText(ctx, start, end) {
	const raw = readStr(ctx);
	const data = readStr(ctx);
	return { type: 'Text', start, end, raw, data };
}

function readComment(ctx, start, end) {
	const data = readStr(ctx);
	return { type: 'Comment', start, end, data };
}

function readExpressionTag(ctx, start, end) {
	const expression = readNode(ctx);
	return { type: 'ExpressionTag', start, end, expression };
}

function readSingleExprTag(ctx, typeName, start, end) {
	const expression = readNode(ctx);
	return { type: typeName, start, end, expression };
}

function readConstTag(ctx, start, end) {
	const declaration = readNode(ctx);
	return { type: 'ConstTag', start, end, declaration };
}

function readDebugTag(ctx, start, end) {
	const count = readU32(ctx);
	const identifiers = new Array(count);
	for (let i = 0; i < count; i++) identifiers[i] = readNode(ctx);
	return { type: 'DebugTag', start, end, identifiers };
}

// ---- Elements -------------------------------------------------------------

function readElementCommon(ctx) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const attrCount = readU32(ctx);
	const attributes = new Array(attrCount);
	for (let i = 0; i < attrCount; i++) attributes[i] = readNode(ctx);
	const fragment = readFragmentDirect(ctx);
	return { name, name_loc, attributes, fragment };
}

function readElement(ctx, typeName, start, end) {
	const { name, name_loc, attributes, fragment } = readElementCommon(ctx);
	const node = { type: typeName, start, end, name, attributes, fragment };
	if (name_loc !== null) node.name_loc = name_loc;
	return node;
}

function readSvelteComponentElement(ctx, start, end) {
	const { name, name_loc, attributes, fragment } = readElementCommon(ctx);
	const expression = readNode(ctx);
	const node = {
		type: 'SvelteComponent',
		start,
		end,
		name,
		attributes,
		fragment,
		expression,
	};
	if (name_loc !== null) node.name_loc = name_loc;
	return node;
}

function readSvelteDynamicElement(ctx, start, end) {
	const { name, name_loc, attributes, fragment } = readElementCommon(ctx);
	const tagExpr = readNode(ctx);
	const node = {
		type: 'SvelteElement',
		start,
		end,
		name,
		attributes,
		fragment,
		tag: tagExpr,
	};
	if (name_loc !== null) node.name_loc = name_loc;
	return node;
}

// ---- Script ---------------------------------------------------------------

function readScript(ctx, start, end) {
	const ctxByte = readU8(ctx);
	const context = ctxByte === 1 ? 'module' : 'default';
	const content = readNode(ctx);
	const attrCount = readU32(ctx);
	const attributes = new Array(attrCount);
	for (let i = 0; i < attrCount; i++) attributes[i] = readNode(ctx);
	return { type: 'Script', start, end, context, content, attributes };
}

// ---- Attributes -----------------------------------------------------------

function readAttributeValue(ctx) {
	const tag = readU8(ctx);
	if (tag === ATTRVAL_TRUE) return true;
	if (tag === ATTRVAL_EXPRESSION) {
		// The encoded form is a full ExpressionTag preamble + payload.
		return readNode(ctx);
	}
	if (tag === ATTRVAL_SEQUENCE) {
		const count = readU32(ctx);
		const parts = new Array(count);
		for (let i = 0; i < count; i++) parts[i] = readAttributeValuePart(ctx);
		return parts;
	}
	throw new EnvelopeError(`parse envelope: bad attribute-value tag 0x${tag.toString(16)}`);
}

function readAttributeValuePart(ctx) {
	// The encoded form is the next node — either TAG_TEXT or TAG_EXPRESSION_TAG.
	return readNode(ctx);
}

function readAttributeNode(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const value = readAttributeValue(ctx);
	const node = { type: 'Attribute', start, end, name, value };
	if (name_loc !== null) node.name_loc = name_loc;
	return node;
}

function readSpreadAttribute(ctx, start, end) {
	const expression = readNode(ctx);
	return { type: 'SpreadAttribute', start, end, expression };
}

function readBindDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const expression = readNode(ctx);
	const modifiers = readModifiers(ctx);
	const node = { start, end, type: 'BindDirective', name, expression, modifiers };
	if (name_loc !== null) node.name_loc = name_loc;
	return node;
}

function readOnDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const hasExpr = readU8(ctx) !== 0;
	const expression = hasExpr ? readNode(ctx) : undefined;
	const modifiers = readModifiers(ctx);
	const node = { type: 'OnDirective', start, end, name };
	if (name_loc !== null) node.name_loc = name_loc;
	if (expression !== undefined) node.expression = expression;
	node.modifiers = modifiers;
	return node;
}

function readClassDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const expression = readNode(ctx);
	const node = { type: 'ClassDirective', start, end, name, expression };
	if (name_loc !== null) node.name_loc = name_loc;
	return node;
}

function readStyleDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const value = readAttributeValue(ctx);
	const modifiers = readModifiers(ctx);
	const node = { type: 'StyleDirective', start, end, name, value, modifiers };
	if (name_loc !== null) node.name_loc = name_loc;
	return node;
}

function readTransitionDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const hasExpr = readU8(ctx) !== 0;
	const expression = hasExpr ? readNode(ctx) : undefined;
	const modifiers = readModifiers(ctx);
	const intro = readBool(ctx);
	const outro = readBool(ctx);
	const hasMeta = readU8(ctx) !== 0;
	const metadata = hasMeta ? readInlineJson(ctx) : undefined;
	const node = { type: 'TransitionDirective', start, end, name };
	if (name_loc !== null) node.name_loc = name_loc;
	if (expression !== undefined) node.expression = expression;
	node.modifiers = modifiers;
	node.intro = intro;
	node.outro = outro;
	if (metadata !== undefined) node.metadata = metadata;
	return node;
}

function readAnimateDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const hasExpr = readU8(ctx) !== 0;
	const expression = hasExpr ? readNode(ctx) : undefined;
	const hasMeta = readU8(ctx) !== 0;
	const metadata = hasMeta ? readInlineJson(ctx) : undefined;
	const node = { type: 'AnimateDirective', start, end, name };
	if (name_loc !== null) node.name_loc = name_loc;
	if (expression !== undefined) node.expression = expression;
	if (metadata !== undefined) node.metadata = metadata;
	return node;
}

function readUseDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const hasExpr = readU8(ctx) !== 0;
	const expression = hasExpr ? readNode(ctx) : undefined;
	const node = { type: 'UseDirective', start, end, name };
	if (name_loc !== null) node.name_loc = name_loc;
	if (expression !== undefined) node.expression = expression;
	return node;
}

function readLetDirective(ctx, start, end) {
	const name = readStr(ctx);
	const name_loc = readOptSourceLocation(ctx);
	const hasExpr = readU8(ctx) !== 0;
	const expression = hasExpr ? readNode(ctx) : undefined;
	const node = { type: 'LetDirective', start, end, name };
	if (name_loc !== null) node.name_loc = name_loc;
	if (expression !== undefined) node.expression = expression;
	return node;
}

// ---- Blocks ---------------------------------------------------------------

function readIfBlock(ctx, start, end) {
	const elseif = readBool(ctx);
	const test = readNode(ctx);
	const consequent = readFragmentDirect(ctx);
	const hasAlt = readU8(ctx) !== 0;
	const alternate = hasAlt ? readFragmentDirect(ctx) : null;
	return { type: 'IfBlock', elseif, start, end, test, consequent, alternate };
}

function readEachBlock(ctx, start, end) {
	const expression = readNode(ctx);
	const body = readFragmentDirect(ctx);
	const hasCtx = readU8(ctx) !== 0;
	const context = hasCtx ? readNode(ctx) : null;
	const hasFallback = readU8(ctx) !== 0;
	const fallback = hasFallback ? readFragmentDirect(ctx) : undefined;
	const index = readOptStr(ctx);
	const hasKey = readU8(ctx) !== 0;
	const key = hasKey ? readNode(ctx) : undefined;
	const node = { type: 'EachBlock', start, end, expression, body, context };
	if (fallback !== undefined) node.fallback = fallback;
	if (index !== null) node.index = index;
	if (key !== undefined) node.key = key;
	return node;
}

function readAwaitBlock(ctx, start, end) {
	const expression = readNode(ctx);
	const hasValue = readU8(ctx) !== 0;
	const value = hasValue ? readNode(ctx) : null;
	const hasError = readU8(ctx) !== 0;
	const error = hasError ? readNode(ctx) : null;
	const hasPending = readU8(ctx) !== 0;
	const pending = hasPending ? readFragmentDirect(ctx) : null;
	const hasThen = readU8(ctx) !== 0;
	const thenFrag = hasThen ? readFragmentDirect(ctx) : null;
	const hasCatch = readU8(ctx) !== 0;
	const catchFrag = hasCatch ? readFragmentDirect(ctx) : null;
	return {
		type: 'AwaitBlock',
		start,
		end,
		expression,
		value,
		error,
		pending,
		then: thenFrag,
		catch: catchFrag,
	};
}

function readKeyBlock(ctx, start, end) {
	const expression = readNode(ctx);
	const fragment = readFragmentDirect(ctx);
	return { type: 'KeyBlock', start, end, expression, fragment };
}

function readSnippetBlock(ctx, start, end) {
	const expression = readNode(ctx);
	const typeParams = readOptStr(ctx);
	const paramCount = readU32(ctx);
	const parameters = new Array(paramCount);
	for (let i = 0; i < paramCount; i++) parameters[i] = readNode(ctx);
	const body = readFragmentDirect(ctx);
	const node = { type: 'SnippetBlock', start, end, expression, parameters, body };
	if (typeParams !== null) node.typeParams = typeParams;
	return node;
}

module.exports = { decodeParseEnvelope, EnvelopeError };
