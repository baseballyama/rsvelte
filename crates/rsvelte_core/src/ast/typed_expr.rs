use compact_str::CompactString;
use serde::Serialize;
use serde::ser::{SerializeMap, Serializer};
use serde_json::Value;

use super::arena::{IdRange, JsNodeId, ParseArena};

#[derive(Debug, Clone, PartialEq)]
pub struct SourcePosition {
    pub line: u32,
    pub column: u32,
    pub character: Option<u32>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Loc {
    pub start: SourcePosition,
    pub end: SourcePosition,
}

impl Serialize for Loc {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut map = serializer.serialize_map(Some(2))?;
        map.serialize_entry("start", &self.start)?;
        map.serialize_entry("end", &self.end)?;
        map.end()
    }
}

impl Serialize for SourcePosition {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let len = if self.character.is_some() { 3 } else { 2 };
        let mut map = serializer.serialize_map(Some(len))?;
        map.serialize_entry("line", &self.line)?;
        map.serialize_entry("column", &self.column)?;
        if let Some(ch) = self.character {
            map.serialize_entry("character", &ch)?;
        }
        map.end()
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct RegexValue {
    pub pattern: CompactString,
    pub flags: CompactString,
}

#[derive(Debug, Clone, PartialEq)]
pub struct TemplateElementValue {
    pub raw: CompactString,
    pub cooked: Option<CompactString>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum LiteralValue {
    String(CompactString),
    Number(f64),
    Bool(bool),
    Null,
    Regex(RegexValue),
}

impl Serialize for LiteralValue {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            LiteralValue::String(s) => serializer.serialize_str(s),
            LiteralValue::Number(n) => {
                if n.fract() == 0.0 && n.abs() < i64::MAX as f64 {
                    serializer.serialize_i64(*n as i64)
                } else {
                    serializer.serialize_f64(*n)
                }
            }
            LiteralValue::Bool(b) => serializer.serialize_bool(*b),
            LiteralValue::Null => serializer.serialize_none(),
            LiteralValue::Regex(_) => {
                // Regex value serializes as empty object in ESTree
                let map = serializer.serialize_map(Some(0))?;
                map.end()
            }
        }
    }
}

#[derive(Debug, Clone, PartialEq, Default)]
pub enum JsNode {
    Identifier {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        name: CompactString,
        /// Opaque, output-only TS `typeAnnotation` boundary blob (ESTree
        /// `TSTypeAnnotation`). Analyze never walks into it; it exists solely so
        /// a TS-annotated binding/declarator identifier can route through the
        /// typed walker while still serializing its annotation verbatim. `None`
        /// for the overwhelming majority of identifiers (serializes identically
        /// to an un-annotated id — no stray `typeAnnotation` key).
        type_annotation: Option<Box<serde_json::Value>>,
    },
    PrivateIdentifier {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        name: CompactString,
    },
    Literal {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        value: LiteralValue,
        raw: CompactString,
        regex: Option<RegexValue>,
    },
    BinaryExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        left: JsNodeId,
        operator: CompactString,
        right: JsNodeId,
    },
    LogicalExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        left: JsNodeId,
        operator: CompactString,
        right: JsNodeId,
    },
    UnaryExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        operator: CompactString,
        prefix: bool,
        argument: JsNodeId,
    },
    ConditionalExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        test: JsNodeId,
        consequent: JsNodeId,
        alternate: JsNodeId,
    },
    CallExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        callee: JsNodeId,
        arguments: IdRange,
        optional: bool,
    },
    MemberExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        object: JsNodeId,
        property: JsNodeId,
        computed: bool,
        optional: bool,
    },
    NewExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        callee: JsNodeId,
        arguments: IdRange,
    },
    FunctionExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        id: Option<JsNodeId>,
        params: IdRange,
        body: Option<JsNodeId>,
        generator: bool,
        r#async: bool,
        expression: bool,
    },
    ClassExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        id: Option<JsNodeId>,
        super_class: Option<JsNodeId>,
        body: JsNodeId,
    },
    ArrowFunctionExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        id: Option<JsNodeId>,
        params: IdRange,
        body: JsNodeId,
        expression: bool,
        generator: bool,
        r#async: bool,
    },
    AssignmentExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        operator: CompactString,
        left: JsNodeId,
        right: JsNodeId,
    },
    UpdateExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        operator: CompactString,
        prefix: bool,
        argument: JsNodeId,
    },
    SequenceExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expressions: IdRange,
    },
    ArrayExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        elements: Vec<Option<JsNode>>,
    },
    ObjectExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        properties: IdRange,
    },
    TemplateLiteral {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        quasis: IdRange,
        expressions: IdRange,
    },
    TaggedTemplateExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        tag: JsNodeId,
        quasi: JsNodeId,
    },
    TemplateElement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        tail: bool,
        value: TemplateElementValue,
    },
    ThisExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    Super {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    ImportExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        source: JsNodeId,
    },
    AwaitExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        argument: JsNodeId,
    },
    YieldExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        delegate: bool,
        argument: Option<JsNodeId>,
    },
    ChainExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expression: JsNodeId,
    },
    MetaProperty {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        meta: JsNodeId,
        property: JsNodeId,
    },
    SpreadElement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        argument: JsNodeId,
    },
    // Patterns
    ObjectPattern {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        properties: IdRange,
        /// Opaque, output-only TS `typeAnnotation` boundary blob for an
        /// annotated destructuring declarator id (`let { a }: T = …`). Analyze
        /// never walks into it; it lets such a pattern route through the typed
        /// walker while serializing its annotation verbatim. `None` for the
        /// overwhelming majority of object patterns (serializes identically to
        /// an un-annotated pattern — no stray `typeAnnotation` key).
        type_annotation: Option<Box<serde_json::Value>>,
    },
    ArrayPattern {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        elements: Vec<Option<JsNode>>,
        /// See `ObjectPattern::type_annotation`. Opaque output-only TS annotation
        /// for an annotated array-destructuring declarator id (`let [ a ]: T = …`).
        type_annotation: Option<Box<serde_json::Value>>,
    },
    AssignmentPattern {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        left: JsNodeId,
        right: JsNodeId,
    },
    RestElement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        argument: JsNodeId,
    },
    Property {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        key: JsNodeId,
        value: JsNodeId,
        kind: CompactString,
        method: bool,
        shorthand: bool,
        computed: bool,
    },
    // Statements
    Program {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        body: IdRange,
        source_type: CompactString,
        /// Leading comments on the Program node (e.g. from HTML comments before script tag).
        leading_comments: Option<Vec<Value>>,
        /// Trailing comments on the Program node (all JS comments in the program).
        trailing_comments: Option<Vec<Value>>,
        /// Map from a JS AST node's absolute `start` offset to the raw `svelte-ignore`
        /// comment value texts that were attached to it as leading comments (at any
        /// depth in this program). This lets Phase-2 analyze surface `svelte-ignore`
        /// suppression for typed nodes without materializing them as `JsNode::Raw`
        /// just to carry a `leadingComments` array. Empty when the script has no
        /// `svelte-ignore` comments (the common case). Internal-only: not serialized.
        ignore_comment_map: Vec<(u32, Vec<CompactString>)>,
    },
    ExpressionStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expression: JsNodeId,
    },
    BlockStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        body: IdRange,
    },
    VariableDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        declarations: IdRange,
        kind: CompactString,
        declare: bool,
    },
    VariableDeclarator {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        id: JsNodeId,
        init: Option<JsNodeId>,
    },
    FunctionDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        id: Option<JsNodeId>,
        params: IdRange,
        body: Option<JsNodeId>,
        generator: bool,
        r#async: bool,
    },
    ClassDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        id: Option<JsNodeId>,
        super_class: Option<JsNodeId>,
        body: JsNodeId,
        declare: bool,
        r#abstract: bool,
        implements: bool,
        decorators: IdRange,
    },
    ReturnStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        argument: Option<JsNodeId>,
    },
    ThrowStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        argument: JsNodeId,
    },
    IfStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        test: JsNodeId,
        consequent: JsNodeId,
        alternate: Option<JsNodeId>,
    },
    ForStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        init: Option<JsNodeId>,
        test: Option<JsNodeId>,
        update: Option<JsNodeId>,
        body: JsNodeId,
    },
    ForOfStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        r#await: bool,
        left: JsNodeId,
        right: JsNodeId,
        body: JsNodeId,
    },
    ForInStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        left: JsNodeId,
        right: JsNodeId,
        body: JsNodeId,
    },
    WhileStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        test: JsNodeId,
        body: JsNodeId,
    },
    DoWhileStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        test: JsNodeId,
        body: JsNodeId,
    },
    TryStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        block: JsNodeId,
        handler: Option<JsNodeId>,
        finalizer: Option<JsNodeId>,
    },
    CatchClause {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        param: Option<JsNodeId>,
        body: JsNodeId,
    },
    SwitchStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        discriminant: JsNodeId,
        cases: IdRange,
    },
    SwitchCase {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        test: Option<JsNodeId>,
        consequent: IdRange,
    },
    LabeledStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        label: JsNodeId,
        body: JsNodeId,
    },
    BreakStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        label: Option<JsNodeId>,
    },
    ContinueStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        label: Option<JsNodeId>,
    },
    EmptyStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    DebuggerStatement {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    // Import/Export
    ImportDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        specifiers: IdRange,
        source: JsNodeId,
        import_kind: Option<CompactString>,
        attributes: IdRange,
    },
    ImportSpecifier {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        imported: JsNodeId,
        local: JsNodeId,
        import_kind: Option<CompactString>,
    },
    ImportDefaultSpecifier {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        local: JsNodeId,
    },
    ImportNamespaceSpecifier {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        local: JsNodeId,
    },
    ExportNamedDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        declaration: Option<JsNodeId>,
        specifiers: IdRange,
        source: Option<JsNodeId>,
        export_kind: Option<CompactString>,
        attributes: IdRange,
    },
    ExportDefaultDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        declaration: JsNodeId,
    },
    ExportSpecifier {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        local: JsNodeId,
        exported: JsNodeId,
        export_kind: Option<CompactString>,
    },
    // Class-related
    ClassBody {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        body: IdRange,
    },
    MethodDefinition {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        key: JsNodeId,
        value: JsNodeId,
        kind: CompactString,
        r#static: bool,
        computed: bool,
    },
    PropertyDefinition {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        key: JsNodeId,
        value: Option<JsNodeId>,
        r#static: bool,
        computed: bool,
        /// TS `accessor` field modifier — preserved so the TS stripper can
        /// raise `typescript_invalid_feature` (the round-trip must be lossless;
        /// dropping it silently accepts an unsupported feature).
        accessor: bool,
    },
    StaticBlock {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        body: IdRange,
    },
    Decorator {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    // TypeScript (minimal, for remove_typescript_nodes detection)
    TSTypeAnnotation {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        type_annotation: JsNodeId,
    },
    TSEnumDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    // TS parameter property (`constructor(private x)` / `readonly x`). Only ever
    // constructed when an accessibility/readonly modifier is present, so its
    // presence is always an unsupported-feature error (raised by the TS stripper).
    TSParameterProperty {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    TSModuleDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        body: Option<JsNodeId>,
    },
    // Comment (used in Program.comments array, type is "Line" or "Block")
    Comment {
        start: u32,
        end: u32,
        comment_type: CompactString,
        value: CompactString,
    },
    // Null placeholder
    #[default]
    Null,
}

// ── Serialize ──────────────────────────────────────────────────────────

macro_rules! ser_loc {
    ($map:ident, $loc:expr) => {
        if let Some(loc) = $loc {
            $map.serialize_entry("loc", loc)?;
        }
    };
}

/// Helper: serialize a JsNodeId field by resolving through the arena.
macro_rules! ser_node {
    ($map:ident, $key:expr, $id:expr) => {
        crate::ast::arena::with_current_serialize_arena(|arena| {
            $map.serialize_entry($key, arena.get_js_node(*$id))
        })?
    };
}

/// Helper: serialize an Option<JsNodeId> field (Some -> resolved node, None -> null).
macro_rules! ser_opt_node {
    ($map:ident, $key:expr, $opt:expr) => {
        match $opt {
            Some(id) => crate::ast::arena::with_current_serialize_arena(|arena| {
                $map.serialize_entry($key, arena.get_js_node(*id))
            })?,
            None => $map.serialize_entry($key, &Value::Null)?,
        }
    };
}

/// Helper: serialize an IdRange field as a JSON array by resolving children through the arena.
macro_rules! ser_children {
    ($map:ident, $key:expr, $range:expr) => {
        crate::ast::arena::with_current_serialize_arena(|arena| {
            $map.serialize_entry($key, arena.get_js_children(*$range))
        })?
    };
}

impl Serialize for JsNode {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            JsNode::Identifier {
                start,
                end,
                loc,
                name,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Identifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("name", name.as_str())?;
                if let Some(ta) = type_annotation {
                    map.serialize_entry("typeAnnotation", ta.as_ref())?;
                }
                map.end()
            }
            JsNode::PrivateIdentifier {
                start,
                end,
                loc,
                name,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "PrivateIdentifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("name", name.as_str())?;
                map.end()
            }
            JsNode::Literal {
                start,
                end,
                loc,
                value,
                raw,
                regex,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Literal")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("value", value)?;
                map.serialize_entry("raw", raw.as_str())?;
                if let Some(regex) = regex {
                    let mut regex_map = serde_json::Map::new();
                    regex_map.insert(
                        "pattern".to_string(),
                        Value::String(regex.pattern.to_string()),
                    );
                    regex_map.insert("flags".to_string(), Value::String(regex.flags.to_string()));
                    map.serialize_entry("regex", &Value::Object(regex_map))?;
                }
                map.end()
            }
            JsNode::BinaryExpression {
                start,
                end,
                loc,
                left,
                operator,
                right,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "BinaryExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                map.serialize_entry("operator", operator.as_str())?;
                ser_node!(map, "right", right);
                map.end()
            }
            JsNode::LogicalExpression {
                start,
                end,
                loc,
                left,
                operator,
                right,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "LogicalExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                map.serialize_entry("operator", operator.as_str())?;
                ser_node!(map, "right", right);
                map.end()
            }
            JsNode::UnaryExpression {
                start,
                end,
                loc,
                operator,
                prefix,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "UnaryExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("operator", operator.as_str())?;
                map.serialize_entry("prefix", prefix)?;
                ser_node!(map, "argument", argument);
                map.end()
            }
            JsNode::ConditionalExpression {
                start,
                end,
                loc,
                test,
                consequent,
                alternate,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ConditionalExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "consequent", consequent);
                ser_node!(map, "alternate", alternate);
                map.end()
            }
            JsNode::CallExpression {
                start,
                end,
                loc,
                callee,
                arguments,
                optional,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "CallExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "callee", callee);
                ser_children!(map, "arguments", arguments);
                map.serialize_entry("optional", optional)?;
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "MemberExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "object", object);
                ser_node!(map, "property", property);
                map.serialize_entry("computed", computed)?;
                map.serialize_entry("optional", optional)?;
                map.end()
            }
            JsNode::NewExpression {
                start,
                end,
                loc,
                callee,
                arguments,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "NewExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "callee", callee);
                ser_children!(map, "arguments", arguments);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "FunctionExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                map.serialize_entry("expression", expression)?;
                ser_children!(map, "params", params);
                ser_opt_node!(map, "body", body);
                map.end()
            }
            JsNode::ClassExpression {
                start,
                end,
                loc,
                id,
                super_class,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ClassExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                ser_opt_node!(map, "superClass", super_class);
                ser_node!(map, "body", body);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ArrowFunctionExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                map.serialize_entry("expression", expression)?;
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                ser_children!(map, "params", params);
                ser_node!(map, "body", body);
                map.end()
            }
            JsNode::AssignmentExpression {
                start,
                end,
                loc,
                operator,
                left,
                right,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "AssignmentExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("operator", operator.as_str())?;
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                map.end()
            }
            JsNode::UpdateExpression {
                start,
                end,
                loc,
                operator,
                prefix,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "UpdateExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("operator", operator.as_str())?;
                map.serialize_entry("prefix", prefix)?;
                ser_node!(map, "argument", argument);
                map.end()
            }
            JsNode::SequenceExpression {
                start,
                end,
                loc,
                expressions,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "SequenceExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "expressions", expressions);
                map.end()
            }
            JsNode::ArrayExpression {
                start,
                end,
                loc,
                elements,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ArrayExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                // Elements can be null (elision) - serialize as array of Option<JsNode>
                map.serialize_entry("elements", elements)?;
                map.end()
            }
            JsNode::ObjectExpression {
                start,
                end,
                loc,
                properties,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ObjectExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "properties", properties);
                map.end()
            }
            JsNode::TemplateLiteral {
                start,
                end,
                loc,
                quasis,
                expressions,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TemplateLiteral")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "quasis", quasis);
                ser_children!(map, "expressions", expressions);
                map.end()
            }
            JsNode::TaggedTemplateExpression {
                start,
                end,
                loc,
                tag,
                quasi,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TaggedTemplateExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "tag", tag);
                ser_node!(map, "quasi", quasi);
                map.end()
            }
            JsNode::TemplateElement {
                start,
                end,
                loc,
                tail,
                value,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TemplateElement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("tail", tail)?;
                let mut val_map = serde_json::Map::new();
                val_map.insert("raw".to_string(), Value::String(value.raw.to_string()));
                val_map.insert(
                    "cooked".to_string(),
                    match &value.cooked {
                        Some(s) => Value::String(s.to_string()),
                        None => Value::Null,
                    },
                );
                map.serialize_entry("value", &Value::Object(val_map))?;
                map.end()
            }
            JsNode::ThisExpression { start, end, loc } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ThisExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.end()
            }
            JsNode::Super { start, end, loc } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Super")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.end()
            }
            JsNode::ImportExpression {
                start,
                end,
                loc,
                source,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ImportExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "source", source);
                map.serialize_entry("options", &None::<()>)?;
                map.end()
            }
            JsNode::AwaitExpression {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "AwaitExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                map.end()
            }
            JsNode::YieldExpression {
                start,
                end,
                loc,
                delegate,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "YieldExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("delegate", delegate)?;
                ser_opt_node!(map, "argument", argument);
                map.end()
            }
            JsNode::ChainExpression {
                start,
                end,
                loc,
                expression,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ChainExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                map.end()
            }
            JsNode::MetaProperty {
                start,
                end,
                loc,
                meta,
                property,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "MetaProperty")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "meta", meta);
                ser_node!(map, "property", property);
                map.end()
            }
            JsNode::SpreadElement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "SpreadElement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                map.end()
            }
            JsNode::ObjectPattern {
                start,
                end,
                loc,
                properties,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ObjectPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "properties", properties);
                if let Some(ta) = type_annotation {
                    map.serialize_entry("typeAnnotation", ta.as_ref())?;
                }
                map.end()
            }
            JsNode::ArrayPattern {
                start,
                end,
                loc,
                elements,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ArrayPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("elements", elements)?;
                if let Some(ta) = type_annotation {
                    map.serialize_entry("typeAnnotation", ta.as_ref())?;
                }
                map.end()
            }
            JsNode::AssignmentPattern {
                start,
                end,
                loc,
                left,
                right,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "AssignmentPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                map.end()
            }
            JsNode::RestElement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "RestElement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Property")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("method", method)?;
                map.serialize_entry("shorthand", shorthand)?;
                map.serialize_entry("computed", computed)?;
                ser_node!(map, "key", key);
                ser_node!(map, "value", value);
                map.serialize_entry("kind", kind.as_str())?;
                map.end()
            }
            JsNode::Program {
                start,
                end,
                loc,
                body,
                source_type,
                leading_comments,
                trailing_comments,
                // Internal analyze-only metadata; never part of the ESTree output.
                ignore_comment_map: _,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Program")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                map.serialize_entry("sourceType", source_type.as_str())?;
                if let Some(tc) = trailing_comments {
                    map.serialize_entry("trailingComments", tc)?;
                }
                if let Some(lc) = leading_comments {
                    map.serialize_entry("leadingComments", lc)?;
                }
                map.end()
            }
            JsNode::ExpressionStatement {
                start,
                end,
                loc,
                expression,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ExpressionStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                map.end()
            }
            JsNode::BlockStatement {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "BlockStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                map.end()
            }
            JsNode::VariableDeclaration {
                start,
                end,
                loc,
                declarations,
                kind,
                declare,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "VariableDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "declarations", declarations);
                map.serialize_entry("kind", kind.as_str())?;
                if *declare {
                    map.serialize_entry("declare", &true)?;
                }
                map.end()
            }
            JsNode::VariableDeclarator {
                start,
                end,
                loc,
                id,
                init,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "VariableDeclarator")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "id", id);
                ser_opt_node!(map, "init", init);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "FunctionDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                ser_children!(map, "params", params);
                ser_opt_node!(map, "body", body);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ClassDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                ser_opt_node!(map, "superClass", super_class);
                ser_node!(map, "body", body);
                if *declare {
                    map.serialize_entry("declare", &true)?;
                }
                if *r#abstract {
                    map.serialize_entry("abstract", &true)?;
                }
                if *implements {
                    map.serialize_entry("implements", &true)?;
                }
                if !decorators.is_empty() {
                    ser_children!(map, "decorators", decorators);
                }
                map.end()
            }
            JsNode::ReturnStatement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ReturnStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "argument", argument);
                map.end()
            }
            JsNode::ThrowStatement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ThrowStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                map.end()
            }
            JsNode::IfStatement {
                start,
                end,
                loc,
                test,
                consequent,
                alternate,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "IfStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "consequent", consequent);
                ser_opt_node!(map, "alternate", alternate);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ForStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "init", init);
                ser_opt_node!(map, "test", test);
                ser_opt_node!(map, "update", update);
                ser_node!(map, "body", body);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ForOfStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("await", r#await)?;
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                ser_node!(map, "body", body);
                map.end()
            }
            JsNode::ForInStatement {
                start,
                end,
                loc,
                left,
                right,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ForInStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                ser_node!(map, "body", body);
                map.end()
            }
            JsNode::WhileStatement {
                start,
                end,
                loc,
                test,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "WhileStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "body", body);
                map.end()
            }
            JsNode::DoWhileStatement {
                start,
                end,
                loc,
                test,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "DoWhileStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "body", body);
                map.end()
            }
            JsNode::TryStatement {
                start,
                end,
                loc,
                block,
                handler,
                finalizer,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TryStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "block", block);
                ser_opt_node!(map, "handler", handler);
                ser_opt_node!(map, "finalizer", finalizer);
                map.end()
            }
            JsNode::CatchClause {
                start,
                end,
                loc,
                param,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "CatchClause")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "param", param);
                ser_node!(map, "body", body);
                map.end()
            }
            JsNode::SwitchStatement {
                start,
                end,
                loc,
                discriminant,
                cases,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "SwitchStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "discriminant", discriminant);
                ser_children!(map, "cases", cases);
                map.end()
            }
            JsNode::SwitchCase {
                start,
                end,
                loc,
                test,
                consequent,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "SwitchCase")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "test", test);
                ser_children!(map, "consequent", consequent);
                map.end()
            }
            JsNode::LabeledStatement {
                start,
                end,
                loc,
                label,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "LabeledStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "label", label);
                ser_node!(map, "body", body);
                map.end()
            }
            JsNode::BreakStatement {
                start,
                end,
                loc,
                label,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "BreakStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "label", label);
                map.end()
            }
            JsNode::ContinueStatement {
                start,
                end,
                loc,
                label,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ContinueStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "label", label);
                map.end()
            }
            JsNode::EmptyStatement { start, end, loc } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "EmptyStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.end()
            }
            JsNode::DebuggerStatement { start, end, loc } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "DebuggerStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ImportDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "specifiers", specifiers);
                ser_node!(map, "source", source);
                if let Some(ik) = import_kind {
                    map.serialize_entry("importKind", ik.as_str())?;
                }
                ser_children!(map, "attributes", attributes);
                map.end()
            }
            JsNode::ImportSpecifier {
                start,
                end,
                loc,
                imported,
                local,
                import_kind,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ImportSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "imported", imported);
                ser_node!(map, "local", local);
                if let Some(ik) = import_kind {
                    map.serialize_entry("importKind", ik.as_str())?;
                }
                map.end()
            }
            JsNode::ImportDefaultSpecifier {
                start,
                end,
                loc,
                local,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ImportDefaultSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "local", local);
                map.end()
            }
            JsNode::ImportNamespaceSpecifier {
                start,
                end,
                loc,
                local,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ImportNamespaceSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "local", local);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ExportNamedDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "declaration", declaration);
                ser_children!(map, "specifiers", specifiers);
                ser_opt_node!(map, "source", source);
                if let Some(ek) = export_kind {
                    map.serialize_entry("exportKind", ek.as_str())?;
                }
                ser_children!(map, "attributes", attributes);
                map.end()
            }
            JsNode::ExportDefaultDeclaration {
                start,
                end,
                loc,
                declaration,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ExportDefaultDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "declaration", declaration);
                map.end()
            }
            JsNode::ExportSpecifier {
                start,
                end,
                loc,
                local,
                exported,
                export_kind,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ExportSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "local", local);
                ser_node!(map, "exported", exported);
                if let Some(ek) = export_kind {
                    map.serialize_entry("exportKind", ek.as_str())?;
                }
                map.end()
            }
            JsNode::ClassBody {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ClassBody")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                map.end()
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
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "MethodDefinition")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("static", r#static)?;
                map.serialize_entry("computed", computed)?;
                map.serialize_entry("kind", kind.as_str())?;
                ser_node!(map, "key", key);
                ser_node!(map, "value", value);
                map.end()
            }
            JsNode::PropertyDefinition {
                start,
                end,
                loc,
                key,
                value,
                r#static,
                computed,
                accessor,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "PropertyDefinition")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("static", r#static)?;
                map.serialize_entry("computed", computed)?;
                map.serialize_entry("accessor", accessor)?;
                ser_node!(map, "key", key);
                ser_opt_node!(map, "value", value);
                map.end()
            }
            JsNode::StaticBlock {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "StaticBlock")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                map.end()
            }
            JsNode::Decorator { start, end, loc } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Decorator")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.end()
            }
            JsNode::TSTypeAnnotation {
                start,
                end,
                loc,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TSTypeAnnotation")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "typeAnnotation", type_annotation);
                map.end()
            }
            JsNode::TSParameterProperty { start, end, loc } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TSParameterProperty")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.end()
            }
            JsNode::TSEnumDeclaration { start, end, loc } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TSEnumDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.end()
            }
            JsNode::TSModuleDeclaration {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "TSModuleDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                if let Some(b) = body {
                    ser_node!(map, "body", b);
                }
                map.end()
            }
            JsNode::Comment {
                start,
                end,
                comment_type,
                value,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", comment_type.as_str())?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                map.serialize_entry("value", value.as_str())?;
                map.end()
            }
            JsNode::Null => serializer.serialize_none(),
        }
    }
}

// ── from_value ─────────────────────────────────────────────────────────

fn get_u32(obj: &serde_json::Map<String, Value>, key: &str) -> u32 {
    obj.get(key).and_then(|v| v.as_u64()).unwrap_or(0) as u32
}

fn get_str(obj: &serde_json::Map<String, Value>, key: &str) -> CompactString {
    obj.get(key).and_then(|v| v.as_str()).unwrap_or("").into()
}

fn get_bool(obj: &serde_json::Map<String, Value>, key: &str) -> bool {
    obj.get(key).and_then(|v| v.as_bool()).unwrap_or(false)
}

fn convert_loc(obj: &serde_json::Map<String, Value>) -> Option<Box<Loc>> {
    let loc_val = obj.get("loc")?;
    let loc_obj = loc_val.as_object()?;
    let start_obj = loc_obj.get("start")?.as_object()?;
    let end_obj = loc_obj.get("end")?.as_object()?;

    Some(Box::new(Loc {
        start: SourcePosition {
            line: get_u32(start_obj, "line"),
            column: get_u32(start_obj, "column"),
            character: start_obj
                .get("character")
                .and_then(|v| v.as_u64())
                .map(|n| n as u32),
        },
        end: SourcePosition {
            line: get_u32(end_obj, "line"),
            column: get_u32(end_obj, "column"),
            character: end_obj
                .get("character")
                .and_then(|v| v.as_u64())
                .map(|n| n as u32),
        },
    }))
}

thread_local! {
    static DESER_ARENA: std::cell::RefCell<ParseArena> = std::cell::RefCell::new(ParseArena::new());
}

/// Run `f` against either the active serialize arena (during compile) or the
/// fallback DESER_ARENA (tests / standalone). The two `deser_alloc_*` helpers
/// below are thin wrappers around this combinator.
fn with_deser_arena<R>(f: impl FnOnce(&ParseArena) -> R) -> R {
    if crate::ast::arena::has_serialize_arena() {
        crate::ast::arena::with_current_serialize_arena(f)
    } else {
        DESER_ARENA.with(|a| f(&a.borrow()))
    }
}

/// Allocate a JsNode during deserialization.
fn deser_alloc_node(node: JsNode) -> JsNodeId {
    with_deser_arena(|arena| arena.alloc_js_node(node))
}

fn deser_alloc_children(nodes: Vec<JsNode>) -> IdRange {
    with_deser_arena(|arena| arena.alloc_js_children(nodes))
}

fn convert_child(obj: &serde_json::Map<String, Value>, key: &str) -> JsNodeId {
    match obj.get(key) {
        Some(val @ Value::Object(_)) => deser_alloc_node(JsNode::from_value(val.clone())),
        _ => deser_alloc_node(JsNode::Null),
    }
}

fn convert_optional_child(obj: &serde_json::Map<String, Value>, key: &str) -> Option<JsNodeId> {
    match obj.get(key) {
        Some(val @ Value::Object(_)) => Some(deser_alloc_node(JsNode::from_value(val.clone()))),
        _ => None,
    }
}

fn convert_array(obj: &serde_json::Map<String, Value>, key: &str) -> IdRange {
    match obj.get(key) {
        Some(Value::Array(arr)) => {
            let nodes: Vec<JsNode> = arr.iter().map(|v| JsNode::from_value(v.clone())).collect();
            deser_alloc_children(nodes)
        }
        _ => IdRange::empty(),
    }
}

fn convert_nullable_array(obj: &serde_json::Map<String, Value>, key: &str) -> Vec<Option<JsNode>> {
    match obj.get(key) {
        Some(Value::Array(arr)) => arr
            .iter()
            .map(|v| {
                if v.is_null() {
                    None
                } else {
                    Some(JsNode::from_value(v.clone()))
                }
            })
            .collect(),
        _ => Vec::new(),
    }
}

impl JsNode {
    pub fn from_value(value: Value) -> Self {
        match value {
            Value::Null => JsNode::Null,
            Value::Object(ref obj) => {
                let type_str = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
                let start = get_u32(obj, "start");
                let end = get_u32(obj, "end");
                let loc = convert_loc(obj);

                match type_str {
                    "Identifier" => JsNode::Identifier {
                        start,
                        end,
                        loc,
                        name: get_str(obj, "name"),
                        type_annotation: obj.get("typeAnnotation").cloned().map(Box::new),
                    },
                    "PrivateIdentifier" => JsNode::PrivateIdentifier {
                        start,
                        end,
                        loc,
                        name: get_str(obj, "name"),
                    },
                    "Literal" => {
                        let regex =
                            obj.get("regex")
                                .and_then(|r| r.as_object())
                                .map(|r| RegexValue {
                                    pattern: get_str(r, "pattern"),
                                    flags: get_str(r, "flags"),
                                });
                        let lit_value = match obj.get("value") {
                            Some(Value::String(s)) => LiteralValue::String(s.as_str().into()),
                            Some(Value::Number(n)) => {
                                LiteralValue::Number(n.as_f64().unwrap_or(0.0))
                            }
                            Some(Value::Bool(b)) => LiteralValue::Bool(*b),
                            Some(Value::Null) => LiteralValue::Null,
                            Some(Value::Object(_)) => match &regex {
                                Some(r) => LiteralValue::Regex(r.clone()),
                                None => LiteralValue::Null,
                            },
                            _ => LiteralValue::Null,
                        };
                        JsNode::Literal {
                            start,
                            end,
                            loc,
                            value: lit_value,
                            raw: get_str(obj, "raw"),
                            regex,
                        }
                    }
                    "BinaryExpression" => JsNode::BinaryExpression {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        operator: get_str(obj, "operator"),
                        right: convert_child(obj, "right"),
                    },
                    "LogicalExpression" => JsNode::LogicalExpression {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        operator: get_str(obj, "operator"),
                        right: convert_child(obj, "right"),
                    },
                    "UnaryExpression" => JsNode::UnaryExpression {
                        start,
                        end,
                        loc,
                        operator: get_str(obj, "operator"),
                        prefix: get_bool(obj, "prefix"),
                        argument: convert_child(obj, "argument"),
                    },
                    "ConditionalExpression" => JsNode::ConditionalExpression {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        consequent: convert_child(obj, "consequent"),
                        alternate: convert_child(obj, "alternate"),
                    },
                    "CallExpression" => JsNode::CallExpression {
                        start,
                        end,
                        loc,
                        callee: convert_child(obj, "callee"),
                        arguments: convert_array(obj, "arguments"),
                        optional: get_bool(obj, "optional"),
                    },
                    "MemberExpression" => JsNode::MemberExpression {
                        start,
                        end,
                        loc,
                        object: convert_child(obj, "object"),
                        property: convert_child(obj, "property"),
                        computed: get_bool(obj, "computed"),
                        optional: get_bool(obj, "optional"),
                    },
                    "NewExpression" => JsNode::NewExpression {
                        start,
                        end,
                        loc,
                        callee: convert_child(obj, "callee"),
                        arguments: convert_array(obj, "arguments"),
                    },
                    "FunctionExpression" => JsNode::FunctionExpression {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        params: convert_array(obj, "params"),
                        body: convert_optional_child(obj, "body"),
                        generator: get_bool(obj, "generator"),
                        r#async: get_bool(obj, "async"),
                        expression: get_bool(obj, "expression"),
                    },
                    "ClassExpression" => JsNode::ClassExpression {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        super_class: convert_optional_child(obj, "superClass"),
                        body: convert_child(obj, "body"),
                    },
                    "ArrowFunctionExpression" => JsNode::ArrowFunctionExpression {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        params: convert_array(obj, "params"),
                        body: convert_child(obj, "body"),
                        expression: get_bool(obj, "expression"),
                        generator: get_bool(obj, "generator"),
                        r#async: get_bool(obj, "async"),
                    },
                    "AssignmentExpression" => JsNode::AssignmentExpression {
                        start,
                        end,
                        loc,
                        operator: get_str(obj, "operator"),
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                    },
                    "UpdateExpression" => JsNode::UpdateExpression {
                        start,
                        end,
                        loc,
                        operator: get_str(obj, "operator"),
                        prefix: get_bool(obj, "prefix"),
                        argument: convert_child(obj, "argument"),
                    },
                    "SequenceExpression" => JsNode::SequenceExpression {
                        start,
                        end,
                        loc,
                        expressions: convert_array(obj, "expressions"),
                    },
                    "ArrayExpression" => JsNode::ArrayExpression {
                        start,
                        end,
                        loc,
                        elements: convert_nullable_array(obj, "elements"),
                    },
                    "ObjectExpression" => JsNode::ObjectExpression {
                        start,
                        end,
                        loc,
                        properties: convert_array(obj, "properties"),
                    },
                    "TemplateLiteral" => JsNode::TemplateLiteral {
                        start,
                        end,
                        loc,
                        quasis: convert_array(obj, "quasis"),
                        expressions: convert_array(obj, "expressions"),
                    },
                    "TaggedTemplateExpression" => JsNode::TaggedTemplateExpression {
                        start,
                        end,
                        loc,
                        tag: convert_child(obj, "tag"),
                        quasi: convert_child(obj, "quasi"),
                    },
                    "TemplateElement" => {
                        let value_obj = obj.get("value").and_then(|v| v.as_object());
                        let tev = TemplateElementValue {
                            raw: value_obj.map(|v| get_str(v, "raw")).unwrap_or_default(),
                            cooked: value_obj.and_then(|v| {
                                v.get("cooked").and_then(|c| c.as_str()).map(|s| s.into())
                            }),
                        };
                        JsNode::TemplateElement {
                            start,
                            end,
                            loc,
                            tail: get_bool(obj, "tail"),
                            value: tev,
                        }
                    }
                    "ThisExpression" => JsNode::ThisExpression { start, end, loc },
                    "Super" => JsNode::Super { start, end, loc },
                    "ImportExpression" => JsNode::ImportExpression {
                        start,
                        end,
                        loc,
                        source: convert_child(obj, "source"),
                    },
                    "AwaitExpression" => JsNode::AwaitExpression {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "YieldExpression" => JsNode::YieldExpression {
                        start,
                        end,
                        loc,
                        delegate: get_bool(obj, "delegate"),
                        argument: convert_optional_child(obj, "argument"),
                    },
                    "ChainExpression" => JsNode::ChainExpression {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                    },
                    "MetaProperty" => JsNode::MetaProperty {
                        start,
                        end,
                        loc,
                        meta: convert_child(obj, "meta"),
                        property: convert_child(obj, "property"),
                    },
                    "SpreadElement" => JsNode::SpreadElement {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "ObjectPattern" => JsNode::ObjectPattern {
                        start,
                        end,
                        loc,
                        properties: convert_array(obj, "properties"),
                        type_annotation: obj.get("typeAnnotation").cloned().map(Box::new),
                    },
                    "ArrayPattern" => JsNode::ArrayPattern {
                        start,
                        end,
                        loc,
                        elements: convert_nullable_array(obj, "elements"),
                        type_annotation: obj.get("typeAnnotation").cloned().map(Box::new),
                    },
                    "AssignmentPattern" => JsNode::AssignmentPattern {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                    },
                    "RestElement" => JsNode::RestElement {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "Property" => JsNode::Property {
                        start,
                        end,
                        loc,
                        key: convert_child(obj, "key"),
                        value: convert_child(obj, "value"),
                        kind: get_str(obj, "kind"),
                        method: get_bool(obj, "method"),
                        shorthand: get_bool(obj, "shorthand"),
                        computed: get_bool(obj, "computed"),
                    },
                    "Program" => JsNode::Program {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                        source_type: get_str(obj, "sourceType"),
                        leading_comments: obj
                            .get("leadingComments")
                            .and_then(|v| v.as_array().cloned()),
                        trailing_comments: obj
                            .get("trailingComments")
                            .and_then(|v| v.as_array().cloned()),
                        // Reconstructed-from-Value programs carry no analyze-only
                        // svelte-ignore map; comment-bearing nodes in that path keep
                        // their leadingComments and go through the Value walker.
                        ignore_comment_map: Vec::new(),
                    },
                    "ExpressionStatement" => JsNode::ExpressionStatement {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                    },
                    "BlockStatement" => JsNode::BlockStatement {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                    },
                    "VariableDeclaration" => JsNode::VariableDeclaration {
                        start,
                        end,
                        loc,
                        declarations: convert_array(obj, "declarations"),
                        kind: get_str(obj, "kind"),
                        declare: get_bool(obj, "declare"),
                    },
                    "VariableDeclarator" => JsNode::VariableDeclarator {
                        start,
                        end,
                        loc,
                        id: convert_child(obj, "id"),
                        init: convert_optional_child(obj, "init"),
                    },
                    "FunctionDeclaration" => JsNode::FunctionDeclaration {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        params: convert_array(obj, "params"),
                        body: convert_optional_child(obj, "body"),
                        generator: get_bool(obj, "generator"),
                        r#async: get_bool(obj, "async"),
                    },
                    "ClassDeclaration" => JsNode::ClassDeclaration {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        super_class: convert_optional_child(obj, "superClass"),
                        body: convert_child(obj, "body"),
                        declare: get_bool(obj, "declare"),
                        r#abstract: get_bool(obj, "abstract"),
                        implements: get_bool(obj, "implements"),
                        decorators: convert_array(obj, "decorators"),
                    },
                    "ReturnStatement" => JsNode::ReturnStatement {
                        start,
                        end,
                        loc,
                        argument: convert_optional_child(obj, "argument"),
                    },
                    "ThrowStatement" => JsNode::ThrowStatement {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "IfStatement" => JsNode::IfStatement {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        consequent: convert_child(obj, "consequent"),
                        alternate: convert_optional_child(obj, "alternate"),
                    },
                    "ForStatement" => JsNode::ForStatement {
                        start,
                        end,
                        loc,
                        init: convert_optional_child(obj, "init"),
                        test: convert_optional_child(obj, "test"),
                        update: convert_optional_child(obj, "update"),
                        body: convert_child(obj, "body"),
                    },
                    "ForOfStatement" => JsNode::ForOfStatement {
                        start,
                        end,
                        loc,
                        r#await: get_bool(obj, "await"),
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                        body: convert_child(obj, "body"),
                    },
                    "ForInStatement" => JsNode::ForInStatement {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                        body: convert_child(obj, "body"),
                    },
                    "WhileStatement" => JsNode::WhileStatement {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        body: convert_child(obj, "body"),
                    },
                    "DoWhileStatement" => JsNode::DoWhileStatement {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        body: convert_child(obj, "body"),
                    },
                    "TryStatement" => JsNode::TryStatement {
                        start,
                        end,
                        loc,
                        block: convert_child(obj, "block"),
                        handler: convert_optional_child(obj, "handler"),
                        finalizer: convert_optional_child(obj, "finalizer"),
                    },
                    "CatchClause" => JsNode::CatchClause {
                        start,
                        end,
                        loc,
                        param: convert_optional_child(obj, "param"),
                        body: convert_child(obj, "body"),
                    },
                    "SwitchStatement" => JsNode::SwitchStatement {
                        start,
                        end,
                        loc,
                        discriminant: convert_child(obj, "discriminant"),
                        cases: convert_array(obj, "cases"),
                    },
                    "SwitchCase" => JsNode::SwitchCase {
                        start,
                        end,
                        loc,
                        test: convert_optional_child(obj, "test"),
                        consequent: convert_array(obj, "consequent"),
                    },
                    "LabeledStatement" => JsNode::LabeledStatement {
                        start,
                        end,
                        loc,
                        label: convert_child(obj, "label"),
                        body: convert_child(obj, "body"),
                    },
                    "BreakStatement" => JsNode::BreakStatement {
                        start,
                        end,
                        loc,
                        label: convert_optional_child(obj, "label"),
                    },
                    "ContinueStatement" => JsNode::ContinueStatement {
                        start,
                        end,
                        loc,
                        label: convert_optional_child(obj, "label"),
                    },
                    "EmptyStatement" => JsNode::EmptyStatement { start, end, loc },
                    "DebuggerStatement" => JsNode::DebuggerStatement { start, end, loc },
                    "ImportDeclaration" => JsNode::ImportDeclaration {
                        start,
                        end,
                        loc,
                        specifiers: convert_array(obj, "specifiers"),
                        source: convert_child(obj, "source"),
                        import_kind: obj
                            .get("importKind")
                            .and_then(|v| v.as_str())
                            .map(|s| s.into()),
                        attributes: convert_array(obj, "attributes"),
                    },
                    "ImportSpecifier" => JsNode::ImportSpecifier {
                        start,
                        end,
                        loc,
                        imported: convert_child(obj, "imported"),
                        local: convert_child(obj, "local"),
                        import_kind: obj
                            .get("importKind")
                            .and_then(|v| v.as_str())
                            .map(|s| s.into()),
                    },
                    "ImportDefaultSpecifier" => JsNode::ImportDefaultSpecifier {
                        start,
                        end,
                        loc,
                        local: convert_child(obj, "local"),
                    },
                    "ImportNamespaceSpecifier" => JsNode::ImportNamespaceSpecifier {
                        start,
                        end,
                        loc,
                        local: convert_child(obj, "local"),
                    },
                    "ExportNamedDeclaration" => JsNode::ExportNamedDeclaration {
                        start,
                        end,
                        loc,
                        declaration: convert_optional_child(obj, "declaration"),
                        specifiers: convert_array(obj, "specifiers"),
                        source: convert_optional_child(obj, "source"),
                        export_kind: obj
                            .get("exportKind")
                            .and_then(|v| v.as_str())
                            .map(|s| s.into()),
                        attributes: convert_array(obj, "attributes"),
                    },
                    "ExportDefaultDeclaration" => JsNode::ExportDefaultDeclaration {
                        start,
                        end,
                        loc,
                        declaration: convert_child(obj, "declaration"),
                    },
                    "ExportSpecifier" => JsNode::ExportSpecifier {
                        start,
                        end,
                        loc,
                        local: convert_child(obj, "local"),
                        exported: convert_child(obj, "exported"),
                        export_kind: obj
                            .get("exportKind")
                            .and_then(|v| v.as_str())
                            .map(|s| s.into()),
                    },
                    "ClassBody" => JsNode::ClassBody {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                    },
                    "MethodDefinition" => JsNode::MethodDefinition {
                        start,
                        end,
                        loc,
                        key: convert_child(obj, "key"),
                        value: convert_child(obj, "value"),
                        kind: get_str(obj, "kind"),
                        r#static: get_bool(obj, "static"),
                        computed: get_bool(obj, "computed"),
                    },
                    "PropertyDefinition" => JsNode::PropertyDefinition {
                        start,
                        end,
                        loc,
                        key: convert_child(obj, "key"),
                        value: convert_optional_child(obj, "value"),
                        r#static: get_bool(obj, "static"),
                        computed: get_bool(obj, "computed"),
                        accessor: get_bool(obj, "accessor"),
                    },
                    "StaticBlock" => JsNode::StaticBlock {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                    },
                    "Decorator" => JsNode::Decorator { start, end, loc },
                    "TSTypeAnnotation" => JsNode::TSTypeAnnotation {
                        start,
                        end,
                        loc,
                        type_annotation: convert_child(obj, "typeAnnotation"),
                    },
                    "TSParameterProperty" => JsNode::TSParameterProperty { start, end, loc },
                    "TSEnumDeclaration" => JsNode::TSEnumDeclaration { start, end, loc },
                    "TSModuleDeclaration" => JsNode::TSModuleDeclaration {
                        start,
                        end,
                        loc,
                        body: convert_optional_child(obj, "body"),
                    },
                    "Line" | "Block" => JsNode::Comment {
                        start,
                        end,
                        comment_type: type_str.into(),
                        value: get_str(obj, "value"),
                    },
                    // `from_value` is total over every ESTree/TS node type that
                    // appears in the corpus (0 fallbacks across ~12k entries incl.
                    // all svelte tests + real-world libs). An unhandled type here
                    // means a genuine gap to add an arm for, not a silent blob.
                    other => unreachable!("from_value: unhandled node type `{other}`"),
                }
            }
            other => unreachable!("from_value: non-node JSON value `{other:?}`"),
        }
    }

    pub fn node_type(&self) -> Option<&str> {
        match self {
            JsNode::Identifier { .. } => Some("Identifier"),
            JsNode::PrivateIdentifier { .. } => Some("PrivateIdentifier"),
            JsNode::Literal { .. } => Some("Literal"),
            JsNode::BinaryExpression { .. } => Some("BinaryExpression"),
            JsNode::LogicalExpression { .. } => Some("LogicalExpression"),
            JsNode::UnaryExpression { .. } => Some("UnaryExpression"),
            JsNode::ConditionalExpression { .. } => Some("ConditionalExpression"),
            JsNode::CallExpression { .. } => Some("CallExpression"),
            JsNode::MemberExpression { .. } => Some("MemberExpression"),
            JsNode::NewExpression { .. } => Some("NewExpression"),
            JsNode::FunctionExpression { .. } => Some("FunctionExpression"),
            JsNode::ClassExpression { .. } => Some("ClassExpression"),
            JsNode::ArrowFunctionExpression { .. } => Some("ArrowFunctionExpression"),
            JsNode::AssignmentExpression { .. } => Some("AssignmentExpression"),
            JsNode::UpdateExpression { .. } => Some("UpdateExpression"),
            JsNode::SequenceExpression { .. } => Some("SequenceExpression"),
            JsNode::ArrayExpression { .. } => Some("ArrayExpression"),
            JsNode::ObjectExpression { .. } => Some("ObjectExpression"),
            JsNode::TemplateLiteral { .. } => Some("TemplateLiteral"),
            JsNode::TaggedTemplateExpression { .. } => Some("TaggedTemplateExpression"),
            JsNode::TemplateElement { .. } => Some("TemplateElement"),
            JsNode::ThisExpression { .. } => Some("ThisExpression"),
            JsNode::Super { .. } => Some("Super"),
            JsNode::ImportExpression { .. } => Some("ImportExpression"),
            JsNode::AwaitExpression { .. } => Some("AwaitExpression"),
            JsNode::YieldExpression { .. } => Some("YieldExpression"),
            JsNode::ChainExpression { .. } => Some("ChainExpression"),
            JsNode::MetaProperty { .. } => Some("MetaProperty"),
            JsNode::SpreadElement { .. } => Some("SpreadElement"),
            JsNode::ObjectPattern { .. } => Some("ObjectPattern"),
            JsNode::ArrayPattern { .. } => Some("ArrayPattern"),
            JsNode::AssignmentPattern { .. } => Some("AssignmentPattern"),
            JsNode::RestElement { .. } => Some("RestElement"),
            JsNode::Property { .. } => Some("Property"),
            JsNode::Program { .. } => Some("Program"),
            JsNode::ExpressionStatement { .. } => Some("ExpressionStatement"),
            JsNode::BlockStatement { .. } => Some("BlockStatement"),
            JsNode::VariableDeclaration { .. } => Some("VariableDeclaration"),
            JsNode::VariableDeclarator { .. } => Some("VariableDeclarator"),
            JsNode::FunctionDeclaration { .. } => Some("FunctionDeclaration"),
            JsNode::ClassDeclaration { .. } => Some("ClassDeclaration"),
            JsNode::ReturnStatement { .. } => Some("ReturnStatement"),
            JsNode::ThrowStatement { .. } => Some("ThrowStatement"),
            JsNode::IfStatement { .. } => Some("IfStatement"),
            JsNode::ForStatement { .. } => Some("ForStatement"),
            JsNode::ForOfStatement { .. } => Some("ForOfStatement"),
            JsNode::ForInStatement { .. } => Some("ForInStatement"),
            JsNode::WhileStatement { .. } => Some("WhileStatement"),
            JsNode::DoWhileStatement { .. } => Some("DoWhileStatement"),
            JsNode::TryStatement { .. } => Some("TryStatement"),
            JsNode::CatchClause { .. } => Some("CatchClause"),
            JsNode::SwitchStatement { .. } => Some("SwitchStatement"),
            JsNode::SwitchCase { .. } => Some("SwitchCase"),
            JsNode::LabeledStatement { .. } => Some("LabeledStatement"),
            JsNode::BreakStatement { .. } => Some("BreakStatement"),
            JsNode::ContinueStatement { .. } => Some("ContinueStatement"),
            JsNode::EmptyStatement { .. } => Some("EmptyStatement"),
            JsNode::DebuggerStatement { .. } => Some("DebuggerStatement"),
            JsNode::ImportDeclaration { .. } => Some("ImportDeclaration"),
            JsNode::ImportSpecifier { .. } => Some("ImportSpecifier"),
            JsNode::ImportDefaultSpecifier { .. } => Some("ImportDefaultSpecifier"),
            JsNode::ImportNamespaceSpecifier { .. } => Some("ImportNamespaceSpecifier"),
            JsNode::ExportNamedDeclaration { .. } => Some("ExportNamedDeclaration"),
            JsNode::ExportDefaultDeclaration { .. } => Some("ExportDefaultDeclaration"),
            JsNode::ExportSpecifier { .. } => Some("ExportSpecifier"),
            JsNode::ClassBody { .. } => Some("ClassBody"),
            JsNode::MethodDefinition { .. } => Some("MethodDefinition"),
            JsNode::PropertyDefinition { .. } => Some("PropertyDefinition"),
            JsNode::StaticBlock { .. } => Some("StaticBlock"),
            JsNode::Decorator { .. } => Some("Decorator"),
            JsNode::TSTypeAnnotation { .. } => Some("TSTypeAnnotation"),
            JsNode::TSParameterProperty { .. } => Some("TSParameterProperty"),
            JsNode::TSEnumDeclaration { .. } => Some("TSEnumDeclaration"),
            JsNode::TSModuleDeclaration { .. } => Some("TSModuleDeclaration"),
            JsNode::Comment { comment_type, .. } => Some(comment_type.as_str()),
            JsNode::Null => None,
        }
    }

    pub fn start(&self) -> Option<u32> {
        match self {
            JsNode::Null => None,
            JsNode::Comment { start, .. } => Some(*start),
            _ => {
                // All named variants have start as first field
                Some(self.get_start_inner())
            }
        }
    }

    pub fn end(&self) -> Option<u32> {
        match self {
            JsNode::Null => None,
            JsNode::Comment { end, .. } => Some(*end),
            _ => Some(self.get_end_inner()),
        }
    }

    /// Get the identifier name if this is an Identifier node.
    #[inline]
    pub fn identifier_name(&self) -> Option<&str> {
        match self {
            JsNode::Identifier { name, .. } => Some(name.as_str()),
            _ => None,
        }
    }

    // ── Typed Accessor Methods ─────────────────────────────────────────

    /// Get the "name" field for nodes that have one (Identifier, PrivateIdentifier).
    #[inline]
    pub fn name(&self) -> Option<&str> {
        match self {
            JsNode::Identifier { name, .. } | JsNode::PrivateIdentifier { name, .. } => {
                Some(name.as_str())
            }
            _ => None,
        }
    }

    /// Get the "body" field as an IdRange (for Program, BlockStatement, ClassBody, StaticBlock).
    #[inline]
    pub fn body_stmts(&self) -> IdRange {
        match self {
            JsNode::Program { body, .. }
            | JsNode::BlockStatement { body, .. }
            | JsNode::ClassBody { body, .. }
            | JsNode::StaticBlock { body, .. } => *body,
            _ => IdRange::empty(),
        }
    }

    /// Get the "body" field as a JsNodeId (for ArrowFunctionExpression, ForStatement, etc).
    #[inline]
    pub fn body_node(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ArrowFunctionExpression { body, .. }
            | JsNode::ForStatement { body, .. }
            | JsNode::ForOfStatement { body, .. }
            | JsNode::ForInStatement { body, .. }
            | JsNode::WhileStatement { body, .. }
            | JsNode::DoWhileStatement { body, .. }
            | JsNode::LabeledStatement { body, .. }
            | JsNode::CatchClause { body, .. }
            | JsNode::ClassExpression { body, .. }
            | JsNode::ClassDeclaration { body, .. } => Some(*body),
            JsNode::FunctionExpression { body, .. } | JsNode::FunctionDeclaration { body, .. } => {
                *body
            }
            JsNode::TSModuleDeclaration { body, .. } => *body,
            _ => None,
        }
    }

    /// Get "declarations" for VariableDeclaration.
    #[inline]
    pub fn declarations(&self) -> IdRange {
        match self {
            JsNode::VariableDeclaration { declarations, .. } => *declarations,
            _ => IdRange::empty(),
        }
    }

    /// Get "callee" for CallExpression, NewExpression.
    #[inline]
    pub fn callee(&self) -> Option<JsNodeId> {
        match self {
            JsNode::CallExpression { callee, .. } | JsNode::NewExpression { callee, .. } => {
                Some(*callee)
            }
            _ => None,
        }
    }

    /// Get "arguments" for CallExpression, NewExpression.
    #[inline]
    pub fn call_arguments(&self) -> IdRange {
        match self {
            JsNode::CallExpression { arguments, .. } | JsNode::NewExpression { arguments, .. } => {
                *arguments
            }
            _ => IdRange::empty(),
        }
    }

    /// Get "left" for BinaryExpression, LogicalExpression, AssignmentExpression, AssignmentPattern,
    /// ForOfStatement, ForInStatement.
    #[inline]
    pub fn left(&self) -> Option<JsNodeId> {
        match self {
            JsNode::BinaryExpression { left, .. }
            | JsNode::LogicalExpression { left, .. }
            | JsNode::AssignmentExpression { left, .. }
            | JsNode::AssignmentPattern { left, .. }
            | JsNode::ForOfStatement { left, .. }
            | JsNode::ForInStatement { left, .. } => Some(*left),
            _ => None,
        }
    }

    /// Get "right" for BinaryExpression, LogicalExpression, AssignmentExpression, AssignmentPattern,
    /// ForOfStatement, ForInStatement.
    #[inline]
    pub fn right(&self) -> Option<JsNodeId> {
        match self {
            JsNode::BinaryExpression { right, .. }
            | JsNode::LogicalExpression { right, .. }
            | JsNode::AssignmentExpression { right, .. }
            | JsNode::AssignmentPattern { right, .. }
            | JsNode::ForOfStatement { right, .. }
            | JsNode::ForInStatement { right, .. } => Some(*right),
            _ => None,
        }
    }

    /// Get "properties" for ObjectExpression, ObjectPattern.
    #[inline]
    pub fn properties(&self) -> IdRange {
        match self {
            JsNode::ObjectExpression { properties, .. }
            | JsNode::ObjectPattern { properties, .. } => *properties,
            _ => IdRange::empty(),
        }
    }

    /// Get "elements" for ArrayExpression, ArrayPattern (nullable elements).
    #[inline]
    pub fn elements(&self) -> &[Option<JsNode>] {
        match self {
            JsNode::ArrayExpression { elements, .. } | JsNode::ArrayPattern { elements, .. } => {
                elements
            }
            _ => &[],
        }
    }

    /// Get "params" for FunctionExpression, FunctionDeclaration, ArrowFunctionExpression.
    #[inline]
    pub fn params(&self) -> IdRange {
        match self {
            JsNode::FunctionExpression { params, .. }
            | JsNode::FunctionDeclaration { params, .. }
            | JsNode::ArrowFunctionExpression { params, .. } => *params,
            _ => IdRange::empty(),
        }
    }

    /// Get "object" for MemberExpression.
    #[inline]
    pub fn object(&self) -> Option<JsNodeId> {
        match self {
            JsNode::MemberExpression { object, .. } => Some(*object),
            _ => None,
        }
    }

    /// Get "property" for MemberExpression, MetaProperty.
    #[inline]
    pub fn property(&self) -> Option<JsNodeId> {
        match self {
            JsNode::MemberExpression { property, .. } | JsNode::MetaProperty { property, .. } => {
                Some(*property)
            }
            _ => None,
        }
    }

    /// Get "computed" for MemberExpression, Property, MethodDefinition, PropertyDefinition.
    #[inline]
    pub fn computed(&self) -> bool {
        match self {
            JsNode::MemberExpression { computed, .. }
            | JsNode::Property { computed, .. }
            | JsNode::MethodDefinition { computed, .. }
            | JsNode::PropertyDefinition { computed, .. } => *computed,
            _ => false,
        }
    }

    /// Get "optional" for CallExpression, MemberExpression.
    #[inline]
    pub fn optional(&self) -> bool {
        match self {
            JsNode::CallExpression { optional, .. } | JsNode::MemberExpression { optional, .. } => {
                *optional
            }
            _ => false,
        }
    }

    /// Get "operator" for BinaryExpression, LogicalExpression, UnaryExpression,
    /// AssignmentExpression, UpdateExpression.
    #[inline]
    pub fn operator(&self) -> Option<&str> {
        match self {
            JsNode::BinaryExpression { operator, .. }
            | JsNode::LogicalExpression { operator, .. }
            | JsNode::UnaryExpression { operator, .. }
            | JsNode::AssignmentExpression { operator, .. }
            | JsNode::UpdateExpression { operator, .. } => Some(operator.as_str()),
            _ => None,
        }
    }

    /// Get "prefix" for UnaryExpression, UpdateExpression.
    #[inline]
    pub fn prefix(&self) -> bool {
        match self {
            JsNode::UnaryExpression { prefix, .. } | JsNode::UpdateExpression { prefix, .. } => {
                *prefix
            }
            _ => false,
        }
    }

    /// Get "test" for ConditionalExpression, IfStatement, SwitchCase.
    #[inline]
    pub fn test(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ConditionalExpression { test, .. }
            | JsNode::IfStatement { test, .. }
            | JsNode::WhileStatement { test, .. }
            | JsNode::DoWhileStatement { test, .. } => Some(*test),
            JsNode::ForStatement { test, .. } | JsNode::SwitchCase { test, .. } => *test,
            _ => None,
        }
    }

    /// Get "consequent" for ConditionalExpression, IfStatement.
    #[inline]
    pub fn consequent(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ConditionalExpression { consequent, .. }
            | JsNode::IfStatement { consequent, .. } => Some(*consequent),
            _ => None,
        }
    }

    /// Get "consequent" items for SwitchCase.
    #[inline]
    pub fn consequent_stmts(&self) -> IdRange {
        match self {
            JsNode::SwitchCase { consequent, .. } => *consequent,
            _ => IdRange::empty(),
        }
    }

    /// Get "alternate" for ConditionalExpression, IfStatement.
    #[inline]
    pub fn alternate(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ConditionalExpression { alternate, .. } => Some(*alternate),
            JsNode::IfStatement { alternate, .. } => *alternate,
            _ => None,
        }
    }

    /// Get "init" for VariableDeclarator, ForStatement.
    #[inline]
    pub fn init(&self) -> Option<JsNodeId> {
        match self {
            JsNode::VariableDeclarator { init, .. } | JsNode::ForStatement { init, .. } => *init,
            _ => None,
        }
    }

    /// Get "id" for VariableDeclarator, FunctionDeclaration, FunctionExpression,
    /// ClassDeclaration, ClassExpression.
    #[inline]
    pub fn id(&self) -> Option<JsNodeId> {
        match self {
            JsNode::VariableDeclarator { id, .. } => Some(*id),
            JsNode::FunctionDeclaration { id, .. }
            | JsNode::FunctionExpression { id, .. }
            | JsNode::ClassDeclaration { id, .. }
            | JsNode::ClassExpression { id, .. }
            | JsNode::ArrowFunctionExpression { id, .. } => *id,
            _ => None,
        }
    }

    /// Get "argument" for UnaryExpression, UpdateExpression, SpreadElement, RestElement,
    /// ReturnStatement, ThrowStatement, AwaitExpression, YieldExpression.
    #[inline]
    pub fn argument(&self) -> Option<JsNodeId> {
        match self {
            JsNode::UnaryExpression { argument, .. }
            | JsNode::UpdateExpression { argument, .. }
            | JsNode::SpreadElement { argument, .. }
            | JsNode::RestElement { argument, .. }
            | JsNode::ThrowStatement { argument, .. }
            | JsNode::AwaitExpression { argument, .. } => Some(*argument),
            JsNode::ReturnStatement { argument, .. } | JsNode::YieldExpression { argument, .. } => {
                *argument
            }
            _ => None,
        }
    }

    /// Get "expression" for ExpressionStatement, ChainExpression.
    #[inline]
    pub fn expression_node(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ExpressionStatement { expression, .. }
            | JsNode::ChainExpression { expression, .. } => Some(*expression),
            _ => None,
        }
    }

    /// Get "expressions" for SequenceExpression, TemplateLiteral.
    #[inline]
    pub fn expressions(&self) -> IdRange {
        match self {
            JsNode::SequenceExpression { expressions, .. }
            | JsNode::TemplateLiteral { expressions, .. } => *expressions,
            _ => IdRange::empty(),
        }
    }

    /// Get "key" for Property, MethodDefinition, PropertyDefinition.
    #[inline]
    pub fn key(&self) -> Option<JsNodeId> {
        match self {
            JsNode::Property { key, .. }
            | JsNode::MethodDefinition { key, .. }
            | JsNode::PropertyDefinition { key, .. } => Some(*key),
            _ => None,
        }
    }

    /// Get "value" as a JsNodeId for Property, MethodDefinition, PropertyDefinition.
    #[inline]
    pub fn value_node(&self) -> Option<JsNodeId> {
        match self {
            JsNode::Property { value, .. } | JsNode::MethodDefinition { value, .. } => Some(*value),
            JsNode::PropertyDefinition { value, .. } => *value,
            _ => None,
        }
    }

    /// Get "shorthand" for Property.
    #[inline]
    pub fn shorthand(&self) -> bool {
        match self {
            JsNode::Property { shorthand, .. } => *shorthand,
            _ => false,
        }
    }

    /// Get "method" for Property.
    #[inline]
    pub fn method(&self) -> bool {
        match self {
            JsNode::Property { method, .. } => *method,
            _ => false,
        }
    }

    /// Get "kind" for VariableDeclaration, Property, MethodDefinition.
    #[inline]
    pub fn kind(&self) -> Option<&str> {
        match self {
            JsNode::VariableDeclaration { kind, .. }
            | JsNode::Property { kind, .. }
            | JsNode::MethodDefinition { kind, .. } => Some(kind.as_str()),
            _ => None,
        }
    }

    /// Check if the node is async (FunctionExpression, FunctionDeclaration, ArrowFunctionExpression).
    #[inline]
    pub fn is_async(&self) -> bool {
        match self {
            JsNode::FunctionExpression { r#async, .. }
            | JsNode::FunctionDeclaration { r#async, .. }
            | JsNode::ArrowFunctionExpression { r#async, .. } => *r#async,
            _ => false,
        }
    }

    /// Check if the node is a generator.
    #[inline]
    pub fn is_generator(&self) -> bool {
        match self {
            JsNode::FunctionExpression { generator, .. }
            | JsNode::FunctionDeclaration { generator, .. }
            | JsNode::ArrowFunctionExpression { generator, .. } => *generator,
            _ => false,
        }
    }

    /// Get "raw" for Literal.
    #[inline]
    pub fn raw(&self) -> Option<&str> {
        match self {
            JsNode::Literal { raw, .. } => Some(raw.as_str()),
            _ => None,
        }
    }

    /// Get the LiteralValue for Literal nodes.
    #[inline]
    pub fn literal_value(&self) -> Option<&LiteralValue> {
        match self {
            JsNode::Literal { value, .. } => Some(value),
            _ => None,
        }
    }

    /// Get "specifiers" for ImportDeclaration, ExportNamedDeclaration.
    #[inline]
    pub fn specifiers(&self) -> IdRange {
        match self {
            JsNode::ImportDeclaration { specifiers, .. }
            | JsNode::ExportNamedDeclaration { specifiers, .. } => *specifiers,
            _ => IdRange::empty(),
        }
    }

    /// Get "source" for ImportDeclaration, ImportExpression.
    #[inline]
    pub fn source(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ImportDeclaration { source, .. } | JsNode::ImportExpression { source, .. } => {
                Some(*source)
            }
            JsNode::ExportNamedDeclaration { source, .. } => *source,
            _ => None,
        }
    }

    /// Get "local" for ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier, ExportSpecifier.
    #[inline]
    pub fn local(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ImportSpecifier { local, .. }
            | JsNode::ImportDefaultSpecifier { local, .. }
            | JsNode::ImportNamespaceSpecifier { local, .. }
            | JsNode::ExportSpecifier { local, .. } => Some(*local),
            _ => None,
        }
    }

    /// Get "imported" for ImportSpecifier.
    #[inline]
    pub fn imported(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ImportSpecifier { imported, .. } => Some(*imported),
            _ => None,
        }
    }

    /// Get "exported" for ExportSpecifier.
    #[inline]
    pub fn exported(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ExportSpecifier { exported, .. } => Some(*exported),
            _ => None,
        }
    }

    /// Get "declaration" for ExportNamedDeclaration, ExportDefaultDeclaration.
    #[inline]
    pub fn declaration(&self) -> Option<JsNodeId> {
        match self {
            JsNode::ExportDefaultDeclaration { declaration, .. } => Some(*declaration),
            JsNode::ExportNamedDeclaration { declaration, .. } => *declaration,
            _ => None,
        }
    }

    /// Get "quasis" for TemplateLiteral.
    #[inline]
    pub fn quasis(&self) -> IdRange {
        match self {
            JsNode::TemplateLiteral { quasis, .. } => *quasis,
            _ => IdRange::empty(),
        }
    }

    /// Get "tag" for TaggedTemplateExpression.
    #[inline]
    pub fn tag(&self) -> Option<JsNodeId> {
        match self {
            JsNode::TaggedTemplateExpression { tag, .. } => Some(*tag),
            _ => None,
        }
    }

    /// Get "discriminant" for SwitchStatement.
    #[inline]
    pub fn discriminant(&self) -> Option<JsNodeId> {
        match self {
            JsNode::SwitchStatement { discriminant, .. } => Some(*discriminant),
            _ => None,
        }
    }

    /// Get "cases" for SwitchStatement.
    #[inline]
    pub fn cases(&self) -> IdRange {
        match self {
            JsNode::SwitchStatement { cases, .. } => *cases,
            _ => IdRange::empty(),
        }
    }

    /// Check if this is an expression type (not a statement/declaration).
    #[inline]
    pub fn is_expression(&self) -> bool {
        matches!(
            self,
            JsNode::Identifier { .. }
                | JsNode::PrivateIdentifier { .. }
                | JsNode::Literal { .. }
                | JsNode::BinaryExpression { .. }
                | JsNode::LogicalExpression { .. }
                | JsNode::UnaryExpression { .. }
                | JsNode::ConditionalExpression { .. }
                | JsNode::CallExpression { .. }
                | JsNode::MemberExpression { .. }
                | JsNode::NewExpression { .. }
                | JsNode::FunctionExpression { .. }
                | JsNode::ClassExpression { .. }
                | JsNode::ArrowFunctionExpression { .. }
                | JsNode::AssignmentExpression { .. }
                | JsNode::UpdateExpression { .. }
                | JsNode::SequenceExpression { .. }
                | JsNode::ArrayExpression { .. }
                | JsNode::ObjectExpression { .. }
                | JsNode::TemplateLiteral { .. }
                | JsNode::TaggedTemplateExpression { .. }
                | JsNode::ThisExpression { .. }
                | JsNode::Super { .. }
                | JsNode::ImportExpression { .. }
                | JsNode::AwaitExpression { .. }
                | JsNode::YieldExpression { .. }
                | JsNode::ChainExpression { .. }
                | JsNode::MetaProperty { .. }
                | JsNode::SpreadElement { .. }
        )
    }

    /// Check if this is a pattern (ObjectPattern, ArrayPattern, etc).
    #[inline]
    pub fn is_pattern(&self) -> bool {
        matches!(
            self,
            JsNode::ObjectPattern { .. }
                | JsNode::ArrayPattern { .. }
                | JsNode::AssignmentPattern { .. }
                | JsNode::RestElement { .. }
        )
    }

    /// Check if this is a function-like node (FunctionExpression, ArrowFunction, FunctionDeclaration).
    #[inline]
    pub fn is_function(&self) -> bool {
        matches!(
            self,
            JsNode::FunctionExpression { .. }
                | JsNode::ArrowFunctionExpression { .. }
                | JsNode::FunctionDeclaration { .. }
        )
    }

    fn get_start_inner(&self) -> u32 {
        match self {
            JsNode::Identifier { start, .. }
            | JsNode::PrivateIdentifier { start, .. }
            | JsNode::Literal { start, .. }
            | JsNode::BinaryExpression { start, .. }
            | JsNode::LogicalExpression { start, .. }
            | JsNode::UnaryExpression { start, .. }
            | JsNode::ConditionalExpression { start, .. }
            | JsNode::CallExpression { start, .. }
            | JsNode::MemberExpression { start, .. }
            | JsNode::NewExpression { start, .. }
            | JsNode::FunctionExpression { start, .. }
            | JsNode::ClassExpression { start, .. }
            | JsNode::ArrowFunctionExpression { start, .. }
            | JsNode::AssignmentExpression { start, .. }
            | JsNode::UpdateExpression { start, .. }
            | JsNode::SequenceExpression { start, .. }
            | JsNode::ArrayExpression { start, .. }
            | JsNode::ObjectExpression { start, .. }
            | JsNode::TemplateLiteral { start, .. }
            | JsNode::TaggedTemplateExpression { start, .. }
            | JsNode::TemplateElement { start, .. }
            | JsNode::ThisExpression { start, .. }
            | JsNode::Super { start, .. }
            | JsNode::ImportExpression { start, .. }
            | JsNode::AwaitExpression { start, .. }
            | JsNode::YieldExpression { start, .. }
            | JsNode::ChainExpression { start, .. }
            | JsNode::MetaProperty { start, .. }
            | JsNode::SpreadElement { start, .. }
            | JsNode::ObjectPattern { start, .. }
            | JsNode::ArrayPattern { start, .. }
            | JsNode::AssignmentPattern { start, .. }
            | JsNode::RestElement { start, .. }
            | JsNode::Property { start, .. }
            | JsNode::Program { start, .. }
            | JsNode::ExpressionStatement { start, .. }
            | JsNode::BlockStatement { start, .. }
            | JsNode::VariableDeclaration { start, .. }
            | JsNode::VariableDeclarator { start, .. }
            | JsNode::FunctionDeclaration { start, .. }
            | JsNode::ClassDeclaration { start, .. }
            | JsNode::ReturnStatement { start, .. }
            | JsNode::ThrowStatement { start, .. }
            | JsNode::IfStatement { start, .. }
            | JsNode::ForStatement { start, .. }
            | JsNode::ForOfStatement { start, .. }
            | JsNode::ForInStatement { start, .. }
            | JsNode::WhileStatement { start, .. }
            | JsNode::DoWhileStatement { start, .. }
            | JsNode::TryStatement { start, .. }
            | JsNode::CatchClause { start, .. }
            | JsNode::SwitchStatement { start, .. }
            | JsNode::SwitchCase { start, .. }
            | JsNode::LabeledStatement { start, .. }
            | JsNode::BreakStatement { start, .. }
            | JsNode::ContinueStatement { start, .. }
            | JsNode::EmptyStatement { start, .. }
            | JsNode::DebuggerStatement { start, .. }
            | JsNode::ImportDeclaration { start, .. }
            | JsNode::ImportSpecifier { start, .. }
            | JsNode::ImportDefaultSpecifier { start, .. }
            | JsNode::ImportNamespaceSpecifier { start, .. }
            | JsNode::ExportNamedDeclaration { start, .. }
            | JsNode::ExportDefaultDeclaration { start, .. }
            | JsNode::ExportSpecifier { start, .. }
            | JsNode::ClassBody { start, .. }
            | JsNode::MethodDefinition { start, .. }
            | JsNode::PropertyDefinition { start, .. }
            | JsNode::StaticBlock { start, .. }
            | JsNode::Decorator { start, .. }
            | JsNode::TSTypeAnnotation { start, .. }
            | JsNode::TSParameterProperty { start, .. }
            | JsNode::TSEnumDeclaration { start, .. }
            | JsNode::TSModuleDeclaration { start, .. }
            | JsNode::Comment { start, .. } => *start,
            JsNode::Null => 0,
        }
    }

    fn get_end_inner(&self) -> u32 {
        match self {
            JsNode::Identifier { end, .. }
            | JsNode::PrivateIdentifier { end, .. }
            | JsNode::Literal { end, .. }
            | JsNode::BinaryExpression { end, .. }
            | JsNode::LogicalExpression { end, .. }
            | JsNode::UnaryExpression { end, .. }
            | JsNode::ConditionalExpression { end, .. }
            | JsNode::CallExpression { end, .. }
            | JsNode::MemberExpression { end, .. }
            | JsNode::NewExpression { end, .. }
            | JsNode::FunctionExpression { end, .. }
            | JsNode::ClassExpression { end, .. }
            | JsNode::ArrowFunctionExpression { end, .. }
            | JsNode::AssignmentExpression { end, .. }
            | JsNode::UpdateExpression { end, .. }
            | JsNode::SequenceExpression { end, .. }
            | JsNode::ArrayExpression { end, .. }
            | JsNode::ObjectExpression { end, .. }
            | JsNode::TemplateLiteral { end, .. }
            | JsNode::TaggedTemplateExpression { end, .. }
            | JsNode::TemplateElement { end, .. }
            | JsNode::ThisExpression { end, .. }
            | JsNode::Super { end, .. }
            | JsNode::ImportExpression { end, .. }
            | JsNode::AwaitExpression { end, .. }
            | JsNode::YieldExpression { end, .. }
            | JsNode::ChainExpression { end, .. }
            | JsNode::MetaProperty { end, .. }
            | JsNode::SpreadElement { end, .. }
            | JsNode::ObjectPattern { end, .. }
            | JsNode::ArrayPattern { end, .. }
            | JsNode::AssignmentPattern { end, .. }
            | JsNode::RestElement { end, .. }
            | JsNode::Property { end, .. }
            | JsNode::Program { end, .. }
            | JsNode::ExpressionStatement { end, .. }
            | JsNode::BlockStatement { end, .. }
            | JsNode::VariableDeclaration { end, .. }
            | JsNode::VariableDeclarator { end, .. }
            | JsNode::FunctionDeclaration { end, .. }
            | JsNode::ClassDeclaration { end, .. }
            | JsNode::ReturnStatement { end, .. }
            | JsNode::ThrowStatement { end, .. }
            | JsNode::IfStatement { end, .. }
            | JsNode::ForStatement { end, .. }
            | JsNode::ForOfStatement { end, .. }
            | JsNode::ForInStatement { end, .. }
            | JsNode::WhileStatement { end, .. }
            | JsNode::DoWhileStatement { end, .. }
            | JsNode::TryStatement { end, .. }
            | JsNode::CatchClause { end, .. }
            | JsNode::SwitchStatement { end, .. }
            | JsNode::SwitchCase { end, .. }
            | JsNode::LabeledStatement { end, .. }
            | JsNode::BreakStatement { end, .. }
            | JsNode::ContinueStatement { end, .. }
            | JsNode::EmptyStatement { end, .. }
            | JsNode::DebuggerStatement { end, .. }
            | JsNode::ImportDeclaration { end, .. }
            | JsNode::ImportSpecifier { end, .. }
            | JsNode::ImportDefaultSpecifier { end, .. }
            | JsNode::ImportNamespaceSpecifier { end, .. }
            | JsNode::ExportNamedDeclaration { end, .. }
            | JsNode::ExportDefaultDeclaration { end, .. }
            | JsNode::ExportSpecifier { end, .. }
            | JsNode::ClassBody { end, .. }
            | JsNode::MethodDefinition { end, .. }
            | JsNode::PropertyDefinition { end, .. }
            | JsNode::StaticBlock { end, .. }
            | JsNode::Decorator { end, .. }
            | JsNode::TSTypeAnnotation { end, .. }
            | JsNode::TSParameterProperty { end, .. }
            | JsNode::TSEnumDeclaration { end, .. }
            | JsNode::TSModuleDeclaration { end, .. }
            | JsNode::Comment { end, .. } => *end,
            JsNode::Null => 0,
        }
    }

    /// Return the ESTree "type" string for this node.
    #[inline]
    pub fn type_str(&self) -> &str {
        match self {
            JsNode::Identifier { .. } => "Identifier",
            JsNode::PrivateIdentifier { .. } => "PrivateIdentifier",
            JsNode::Literal { .. } => "Literal",
            JsNode::BinaryExpression { .. } => "BinaryExpression",
            JsNode::LogicalExpression { .. } => "LogicalExpression",
            JsNode::UnaryExpression { .. } => "UnaryExpression",
            JsNode::ConditionalExpression { .. } => "ConditionalExpression",
            JsNode::CallExpression { .. } => "CallExpression",
            JsNode::MemberExpression { .. } => "MemberExpression",
            JsNode::NewExpression { .. } => "NewExpression",
            JsNode::FunctionExpression { .. } => "FunctionExpression",
            JsNode::ClassExpression { .. } => "ClassExpression",
            JsNode::ArrowFunctionExpression { .. } => "ArrowFunctionExpression",
            JsNode::AssignmentExpression { .. } => "AssignmentExpression",
            JsNode::UpdateExpression { .. } => "UpdateExpression",
            JsNode::SequenceExpression { .. } => "SequenceExpression",
            JsNode::ArrayExpression { .. } => "ArrayExpression",
            JsNode::ObjectExpression { .. } => "ObjectExpression",
            JsNode::TemplateLiteral { .. } => "TemplateLiteral",
            JsNode::TaggedTemplateExpression { .. } => "TaggedTemplateExpression",
            JsNode::TemplateElement { .. } => "TemplateElement",
            JsNode::ThisExpression { .. } => "ThisExpression",
            JsNode::Super { .. } => "Super",
            JsNode::ImportExpression { .. } => "ImportExpression",
            JsNode::AwaitExpression { .. } => "AwaitExpression",
            JsNode::YieldExpression { .. } => "YieldExpression",
            JsNode::ChainExpression { .. } => "ChainExpression",
            JsNode::MetaProperty { .. } => "MetaProperty",
            JsNode::SpreadElement { .. } => "SpreadElement",
            JsNode::ObjectPattern { .. } => "ObjectPattern",
            JsNode::ArrayPattern { .. } => "ArrayPattern",
            JsNode::AssignmentPattern { .. } => "AssignmentPattern",
            JsNode::RestElement { .. } => "RestElement",
            JsNode::Property { .. } => "Property",
            JsNode::Program { .. } => "Program",
            JsNode::ExpressionStatement { .. } => "ExpressionStatement",
            JsNode::BlockStatement { .. } => "BlockStatement",
            JsNode::VariableDeclaration { .. } => "VariableDeclaration",
            JsNode::VariableDeclarator { .. } => "VariableDeclarator",
            JsNode::FunctionDeclaration { .. } => "FunctionDeclaration",
            JsNode::ClassDeclaration { .. } => "ClassDeclaration",
            JsNode::ReturnStatement { .. } => "ReturnStatement",
            JsNode::ThrowStatement { .. } => "ThrowStatement",
            JsNode::IfStatement { .. } => "IfStatement",
            JsNode::ForStatement { .. } => "ForStatement",
            JsNode::ForOfStatement { .. } => "ForOfStatement",
            JsNode::ForInStatement { .. } => "ForInStatement",
            JsNode::WhileStatement { .. } => "WhileStatement",
            JsNode::DoWhileStatement { .. } => "DoWhileStatement",
            JsNode::TryStatement { .. } => "TryStatement",
            JsNode::CatchClause { .. } => "CatchClause",
            JsNode::SwitchStatement { .. } => "SwitchStatement",
            JsNode::SwitchCase { .. } => "SwitchCase",
            JsNode::LabeledStatement { .. } => "LabeledStatement",
            JsNode::BreakStatement { .. } => "BreakStatement",
            JsNode::ContinueStatement { .. } => "ContinueStatement",
            JsNode::EmptyStatement { .. } => "EmptyStatement",
            JsNode::DebuggerStatement { .. } => "DebuggerStatement",
            JsNode::ImportDeclaration { .. } => "ImportDeclaration",
            JsNode::ImportSpecifier { .. } => "ImportSpecifier",
            JsNode::ImportDefaultSpecifier { .. } => "ImportDefaultSpecifier",
            JsNode::ImportNamespaceSpecifier { .. } => "ImportNamespaceSpecifier",
            JsNode::ExportNamedDeclaration { .. } => "ExportNamedDeclaration",
            JsNode::ExportDefaultDeclaration { .. } => "ExportDefaultDeclaration",
            JsNode::ExportSpecifier { .. } => "ExportSpecifier",
            JsNode::ClassBody { .. } => "ClassBody",
            JsNode::MethodDefinition { .. } => "MethodDefinition",
            JsNode::PropertyDefinition { .. } => "PropertyDefinition",
            JsNode::StaticBlock { .. } => "StaticBlock",
            JsNode::Decorator { .. } => "Decorator",
            JsNode::TSTypeAnnotation { .. } => "TSTypeAnnotation",
            JsNode::TSParameterProperty { .. } => "TSParameterProperty",
            JsNode::TSEnumDeclaration { .. } => "TSEnumDeclaration",
            JsNode::TSModuleDeclaration { .. } => "TSModuleDeclaration",
            JsNode::Comment { .. } => "Comment",
            JsNode::Null => "Null",
        }
    }

    /// Get a string field by name (for js_path queries).
    ///
    /// Supports common fields: "name", "operator", "kind", "sourceType", "exportKind", "importKind".
    pub fn get_field_str(&self, field: &str) -> Option<&str> {
        match field {
            "name" => match self {
                JsNode::Identifier { name, .. } | JsNode::PrivateIdentifier { name, .. } => {
                    Some(name.as_str())
                }
                _ => None,
            },
            "operator" => match self {
                JsNode::BinaryExpression { operator, .. }
                | JsNode::LogicalExpression { operator, .. }
                | JsNode::UnaryExpression { operator, .. }
                | JsNode::AssignmentExpression { operator, .. }
                | JsNode::UpdateExpression { operator, .. } => Some(operator.as_str()),
                _ => None,
            },
            "kind" => match self {
                JsNode::VariableDeclaration { kind, .. }
                | JsNode::Property { kind, .. }
                | JsNode::MethodDefinition { kind, .. } => Some(kind.as_str()),
                _ => None,
            },
            "sourceType" => match self {
                JsNode::Program { source_type, .. } => Some(source_type.as_str()),
                _ => None,
            },
            "type" => Some(self.type_str()),
            _ => None,
        }
    }

    /// Get a boolean field by name (for js_path queries).
    pub fn get_field_bool(&self, field: &str) -> Option<bool> {
        match field {
            "computed" => match self {
                JsNode::MemberExpression { computed, .. }
                | JsNode::Property { computed, .. }
                | JsNode::MethodDefinition { computed, .. }
                | JsNode::PropertyDefinition { computed, .. } => Some(*computed),
                _ => None,
            },
            "optional" => match self {
                JsNode::CallExpression { optional, .. }
                | JsNode::MemberExpression { optional, .. } => Some(*optional),
                _ => None,
            },
            "generator" => match self {
                JsNode::FunctionDeclaration { generator, .. }
                | JsNode::FunctionExpression { generator, .. }
                | JsNode::ArrowFunctionExpression { generator, .. } => Some(*generator),
                _ => None,
            },
            "async" => match self {
                JsNode::FunctionDeclaration { r#async, .. }
                | JsNode::FunctionExpression { r#async, .. }
                | JsNode::ArrowFunctionExpression { r#async, .. } => Some(*r#async),
                _ => None,
            },
            "static" => match self {
                JsNode::MethodDefinition { r#static, .. }
                | JsNode::PropertyDefinition { r#static, .. } => Some(*r#static),
                _ => None,
            },
            "prefix" => match self {
                JsNode::UnaryExpression { prefix, .. }
                | JsNode::UpdateExpression { prefix, .. } => Some(*prefix),
                _ => None,
            },
            "shorthand" => match self {
                JsNode::Property { shorthand, .. } => Some(*shorthand),
                _ => None,
            },
            "method" => match self {
                JsNode::Property { method, .. } => Some(*method),
                _ => None,
            },
            _ => None,
        }
    }

    /// Get a u64 field by name (for start/end positions).
    pub fn get_field_u64(&self, field: &str) -> Option<u64> {
        match field {
            "start" => self.start().map(|v| v as u64),
            "end" => self.end().map(|v| v as u64),
            _ => None,
        }
    }

    /// Get the start position of a child node field by name.
    ///
    /// Resolves the child `JsNodeId` through the given arena and returns
    /// the child's start position. Used for positional equality checks
    /// (e.g., "is this identifier the `object` of a MemberExpression?").
    pub fn get_child_field_start(
        &self,
        field: &str,
        arena: &crate::ast::arena::ParseArena,
    ) -> Option<u32> {
        match field {
            "object" => match self {
                JsNode::MemberExpression { object, .. } => arena.get_js_node(*object).start(),
                _ => None,
            },
            "property" => match self {
                JsNode::MemberExpression { property, .. } => arena.get_js_node(*property).start(),
                _ => None,
            },
            "value" => match self {
                JsNode::Property { value, .. } => arena.get_js_node(*value).start(),
                JsNode::PropertyDefinition { value: Some(v), .. } => arena.get_js_node(*v).start(),
                _ => None,
            },
            "meta" => match self {
                JsNode::MetaProperty { meta, .. } => arena.get_js_node(*meta).start(),
                _ => None,
            },
            "local" => match self {
                JsNode::ExportSpecifier { local, .. }
                | JsNode::ImportSpecifier { local, .. }
                | JsNode::ImportDefaultSpecifier { local, .. }
                | JsNode::ImportNamespaceSpecifier { local, .. } => {
                    arena.get_js_node(*local).start()
                }
                _ => None,
            },
            "left" => match self {
                JsNode::AssignmentExpression { left, .. } => arena.get_js_node(*left).start(),
                _ => None,
            },
            "id" => match self {
                JsNode::VariableDeclarator { id, .. } => arena.get_js_node(*id).start(),
                _ => None,
            },
            "callee" => match self {
                JsNode::CallExpression { callee, .. } => arena.get_js_node(*callee).start(),
                _ => None,
            },
            _ => None,
        }
    }

    /// Get the end position of a child node field by name.
    ///
    /// Like `get_child_field_start` but returns end position.
    pub fn get_child_field_end(
        &self,
        field: &str,
        arena: &crate::ast::arena::ParseArena,
    ) -> Option<u32> {
        match field {
            "id" => match self {
                JsNode::VariableDeclarator { id, .. } => arena.get_js_node(*id).end(),
                _ => None,
            },
            _ => None,
        }
    }

    /// Get the callee JsNode reference for a CallExpression.
    ///
    /// Returns the resolved callee node. Used for typed rune checks.
    pub fn get_callee<'a>(&self, arena: &'a crate::ast::arena::ParseArena) -> Option<&'a JsNode> {
        match self {
            JsNode::CallExpression { callee, .. } => Some(arena.get_js_node(*callee)),
            _ => None,
        }
    }

    pub fn to_value(&self) -> Value {
        use crate::ast::arena::{has_serialize_arena, with_serialize_arena};
        if has_serialize_arena() {
            serde_json::to_value(self).unwrap_or(Value::Null)
        } else {
            // Fall back to the deserialization arena (used in tests and from_value roundtrips).
            DESER_ARENA.with(|a| {
                with_serialize_arena(&a.borrow(), || {
                    serde_json::to_value(self).unwrap_or(Value::Null)
                })
            })
        }
    }

    /// Serialize the node directly to a JSON string, skipping the intermediate
    /// `Value` allocation that `to_value().to_string()` would otherwise build.
    ///
    /// Matches `node.to_value().to_string()` byte-for-byte (both use the same
    /// `Serialize` impl), but cuts the cost of building and dropping a `Value`
    /// tree just to re-serialize it.
    pub fn to_json_string(&self) -> String {
        use crate::ast::arena::{has_serialize_arena, with_serialize_arena};
        if has_serialize_arena() {
            serde_json::to_string(self).unwrap_or_else(|_| "null".to_string())
        } else {
            DESER_ARENA.with(|a| {
                with_serialize_arena(&a.borrow(), || {
                    serde_json::to_string(self).unwrap_or_else(|_| "null".to_string())
                })
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_identifier_roundtrip() {
        let json = serde_json::json!({
            "type": "Identifier",
            "start": 0,
            "end": 3,
            "name": "foo"
        });
        let node = JsNode::from_value(json);
        let back = node.to_value();
        assert_eq!(back["type"], "Identifier");
        assert_eq!(back["name"], "foo");
        assert_eq!(back["start"], 0);
        assert_eq!(back["end"], 3);
    }

    #[test]
    fn test_literal_number_roundtrip() {
        let json = serde_json::json!({
            "type": "Literal",
            "start": 0,
            "end": 2,
            "value": 42,
            "raw": "42"
        });
        let node = JsNode::from_value(json);
        let back = node.to_value();
        assert_eq!(back["type"], "Literal");
        assert_eq!(back["value"], 42);
        assert_eq!(back["raw"], "42");
    }

    #[test]
    fn test_binary_expression_roundtrip() {
        let json = serde_json::json!({
            "type": "BinaryExpression",
            "start": 0,
            "end": 5,
            "left": { "type": "Identifier", "start": 0, "end": 1, "name": "a" },
            "operator": "+",
            "right": { "type": "Literal", "start": 4, "end": 5, "value": 1, "raw": "1" }
        });
        let node = JsNode::from_value(json);
        assert_eq!(node.node_type(), Some("BinaryExpression"));
        let back = node.to_value();
        assert_eq!(back["left"]["name"], "a");
        assert_eq!(back["operator"], "+");
    }

    #[test]
    fn test_null() {
        assert_eq!(JsNode::from_value(Value::Null), JsNode::Null);
    }

    #[test]
    #[should_panic(expected = "unhandled node type")]
    fn test_unknown_node_type_panics() {
        // `from_value` is total over real inputs; an unknown type is a genuine
        // gap that must surface loudly rather than degrade to an opaque blob.
        let unknown = serde_json::json!({"type": "SomeUnknownNode", "start": 0, "end": 1});
        let _ = JsNode::from_value(unknown);
    }
}
