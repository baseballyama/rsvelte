use compact_str::CompactString;
use serde::Serialize;
use serde::ser::{SerializeMap, Serializer};
use serde_json::Value;

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
        loc: Option<Loc>,
        name: CompactString,
    },
    PrivateIdentifier {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        name: CompactString,
    },
    Literal {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        value: LiteralValue,
        raw: CompactString,
        regex: Option<RegexValue>,
    },
    BinaryExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        left: Box<JsNode>,
        operator: CompactString,
        right: Box<JsNode>,
    },
    LogicalExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        left: Box<JsNode>,
        operator: CompactString,
        right: Box<JsNode>,
    },
    UnaryExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        operator: CompactString,
        prefix: bool,
        argument: Box<JsNode>,
    },
    ConditionalExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        test: Box<JsNode>,
        consequent: Box<JsNode>,
        alternate: Box<JsNode>,
    },
    CallExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        callee: Box<JsNode>,
        arguments: Vec<JsNode>,
        optional: bool,
    },
    MemberExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        object: Box<JsNode>,
        property: Box<JsNode>,
        computed: bool,
        optional: bool,
    },
    NewExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        callee: Box<JsNode>,
        arguments: Vec<JsNode>,
    },
    FunctionExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        id: Option<Box<JsNode>>,
        params: Vec<JsNode>,
        body: Option<Box<JsNode>>,
        generator: bool,
        r#async: bool,
        expression: bool,
    },
    ClassExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        id: Option<Box<JsNode>>,
        super_class: Option<Box<JsNode>>,
        body: Box<JsNode>,
    },
    ArrowFunctionExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        id: Option<Box<JsNode>>,
        params: Vec<JsNode>,
        body: Box<JsNode>,
        expression: bool,
        generator: bool,
        r#async: bool,
    },
    AssignmentExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        operator: CompactString,
        left: Box<JsNode>,
        right: Box<JsNode>,
    },
    UpdateExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        operator: CompactString,
        prefix: bool,
        argument: Box<JsNode>,
    },
    SequenceExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        expressions: Vec<JsNode>,
    },
    ArrayExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        elements: Vec<Option<JsNode>>,
    },
    ObjectExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        properties: Vec<JsNode>,
    },
    TemplateLiteral {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        quasis: Vec<JsNode>,
        expressions: Vec<JsNode>,
    },
    TaggedTemplateExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        tag: Box<JsNode>,
        quasi: Box<JsNode>,
    },
    TemplateElement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        tail: bool,
        value: TemplateElementValue,
    },
    ThisExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
    },
    Super {
        start: u32,
        end: u32,
        loc: Option<Loc>,
    },
    ImportExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        source: Box<JsNode>,
    },
    AwaitExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        argument: Box<JsNode>,
    },
    YieldExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        delegate: bool,
        argument: Option<Box<JsNode>>,
    },
    ChainExpression {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        expression: Box<JsNode>,
    },
    MetaProperty {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        meta: Box<JsNode>,
        property: Box<JsNode>,
    },
    SpreadElement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        argument: Box<JsNode>,
    },
    // Patterns
    ObjectPattern {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        properties: Vec<JsNode>,
    },
    ArrayPattern {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        elements: Vec<Option<JsNode>>,
    },
    AssignmentPattern {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        left: Box<JsNode>,
        right: Box<JsNode>,
    },
    RestElement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        argument: Box<JsNode>,
    },
    Property {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        key: Box<JsNode>,
        value: Box<JsNode>,
        kind: CompactString,
        method: bool,
        shorthand: bool,
        computed: bool,
    },
    // Statements
    Program {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        body: Vec<JsNode>,
        source_type: CompactString,
    },
    ExpressionStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        expression: Box<JsNode>,
    },
    BlockStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        body: Vec<JsNode>,
    },
    VariableDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        declarations: Vec<JsNode>,
        kind: CompactString,
        declare: bool,
    },
    VariableDeclarator {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        id: Box<JsNode>,
        init: Option<Box<JsNode>>,
    },
    FunctionDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        id: Option<Box<JsNode>>,
        params: Vec<JsNode>,
        body: Option<Box<JsNode>>,
        generator: bool,
        r#async: bool,
    },
    ClassDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        id: Option<Box<JsNode>>,
        super_class: Option<Box<JsNode>>,
        body: Box<JsNode>,
        declare: bool,
        r#abstract: bool,
        implements: bool,
        decorators: Vec<JsNode>,
    },
    ReturnStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        argument: Option<Box<JsNode>>,
    },
    ThrowStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        argument: Box<JsNode>,
    },
    IfStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        test: Box<JsNode>,
        consequent: Box<JsNode>,
        alternate: Option<Box<JsNode>>,
    },
    ForStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        init: Option<Box<JsNode>>,
        test: Option<Box<JsNode>>,
        update: Option<Box<JsNode>>,
        body: Box<JsNode>,
    },
    ForOfStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        r#await: bool,
        left: Box<JsNode>,
        right: Box<JsNode>,
        body: Box<JsNode>,
    },
    ForInStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        left: Box<JsNode>,
        right: Box<JsNode>,
        body: Box<JsNode>,
    },
    WhileStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        test: Box<JsNode>,
        body: Box<JsNode>,
    },
    DoWhileStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        test: Box<JsNode>,
        body: Box<JsNode>,
    },
    TryStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        block: Box<JsNode>,
        handler: Option<Box<JsNode>>,
        finalizer: Option<Box<JsNode>>,
    },
    CatchClause {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        param: Option<Box<JsNode>>,
        body: Box<JsNode>,
    },
    SwitchStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        discriminant: Box<JsNode>,
        cases: Vec<JsNode>,
    },
    SwitchCase {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        test: Option<Box<JsNode>>,
        consequent: Vec<JsNode>,
    },
    LabeledStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        label: Box<JsNode>,
        body: Box<JsNode>,
    },
    BreakStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        label: Option<Box<JsNode>>,
    },
    ContinueStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        label: Option<Box<JsNode>>,
    },
    EmptyStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
    },
    DebuggerStatement {
        start: u32,
        end: u32,
        loc: Option<Loc>,
    },
    // Import/Export
    ImportDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        specifiers: Vec<JsNode>,
        source: Box<JsNode>,
        import_kind: Option<CompactString>,
        attributes: Vec<JsNode>,
    },
    ImportSpecifier {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        imported: Box<JsNode>,
        local: Box<JsNode>,
        import_kind: Option<CompactString>,
    },
    ImportDefaultSpecifier {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        local: Box<JsNode>,
    },
    ImportNamespaceSpecifier {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        local: Box<JsNode>,
    },
    ExportNamedDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        declaration: Option<Box<JsNode>>,
        specifiers: Vec<JsNode>,
        source: Option<Box<JsNode>>,
        export_kind: Option<CompactString>,
        attributes: Vec<JsNode>,
    },
    ExportDefaultDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        declaration: Box<JsNode>,
    },
    ExportSpecifier {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        local: Box<JsNode>,
        exported: Box<JsNode>,
        export_kind: Option<CompactString>,
    },
    // Class-related
    ClassBody {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        body: Vec<JsNode>,
    },
    MethodDefinition {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        key: Box<JsNode>,
        value: Box<JsNode>,
        kind: CompactString,
        r#static: bool,
        computed: bool,
    },
    PropertyDefinition {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        key: Box<JsNode>,
        value: Option<Box<JsNode>>,
        r#static: bool,
        computed: bool,
    },
    StaticBlock {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        body: Vec<JsNode>,
    },
    Decorator {
        start: u32,
        end: u32,
        loc: Option<Loc>,
    },
    // TypeScript (minimal, for remove_typescript_nodes detection)
    TSTypeAnnotation {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        type_annotation: Box<JsNode>,
    },
    TSEnumDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
    },
    TSModuleDeclaration {
        start: u32,
        end: u32,
        loc: Option<Loc>,
        body: Option<Box<JsNode>>,
    },
    // Comment (used in Program.comments array, type is "Line" or "Block")
    Comment {
        start: u32,
        end: u32,
        comment_type: CompactString,
        value: CompactString,
    },
    // Fallback for unknown/opaque JSON nodes
    Raw(Value),
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

impl Serialize for JsNode {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            JsNode::Identifier {
                start,
                end,
                loc,
                name,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Identifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("name", name.as_str())?;
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
                map.serialize_entry("left", &**left)?;
                map.serialize_entry("operator", operator.as_str())?;
                map.serialize_entry("right", &**right)?;
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
                map.serialize_entry("left", &**left)?;
                map.serialize_entry("operator", operator.as_str())?;
                map.serialize_entry("right", &**right)?;
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
                map.serialize_entry("argument", &**argument)?;
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
                map.serialize_entry("test", &**test)?;
                map.serialize_entry("consequent", &**consequent)?;
                map.serialize_entry("alternate", &**alternate)?;
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
                map.serialize_entry("callee", &**callee)?;
                map.serialize_entry("arguments", arguments)?;
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
                map.serialize_entry("object", &**object)?;
                map.serialize_entry("property", &**property)?;
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
                map.serialize_entry("callee", &**callee)?;
                map.serialize_entry("arguments", arguments)?;
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
                match id {
                    Some(id) => map.serialize_entry("id", &**id)?,
                    None => map.serialize_entry("id", &Value::Null)?,
                }
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                map.serialize_entry("expression", expression)?;
                map.serialize_entry("params", params)?;
                match body {
                    Some(body) => map.serialize_entry("body", &**body)?,
                    None => map.serialize_entry("body", &Value::Null)?,
                }
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
                match id {
                    Some(id) => map.serialize_entry("id", &**id)?,
                    None => map.serialize_entry("id", &Value::Null)?,
                }
                match super_class {
                    Some(sc) => map.serialize_entry("superClass", &**sc)?,
                    None => map.serialize_entry("superClass", &Value::Null)?,
                }
                map.serialize_entry("body", &**body)?;
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
                match id {
                    Some(id) => map.serialize_entry("id", &**id)?,
                    None => map.serialize_entry("id", &Value::Null)?,
                }
                map.serialize_entry("expression", expression)?;
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                map.serialize_entry("params", params)?;
                map.serialize_entry("body", &**body)?;
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
                map.serialize_entry("left", &**left)?;
                map.serialize_entry("right", &**right)?;
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
                map.serialize_entry("argument", &**argument)?;
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
                map.serialize_entry("expressions", expressions)?;
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
                map.serialize_entry("properties", properties)?;
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
                map.serialize_entry("quasis", quasis)?;
                map.serialize_entry("expressions", expressions)?;
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
                map.serialize_entry("tag", &**tag)?;
                map.serialize_entry("quasi", &**quasi)?;
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
                map.serialize_entry("source", &**source)?;
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
                map.serialize_entry("argument", &**argument)?;
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
                match argument {
                    Some(arg) => map.serialize_entry("argument", &**arg)?,
                    None => map.serialize_entry("argument", &Value::Null)?,
                }
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
                map.serialize_entry("expression", &**expression)?;
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
                map.serialize_entry("meta", &**meta)?;
                map.serialize_entry("property", &**property)?;
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
                map.serialize_entry("argument", &**argument)?;
                map.end()
            }
            JsNode::ObjectPattern {
                start,
                end,
                loc,
                properties,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ObjectPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("properties", properties)?;
                map.end()
            }
            JsNode::ArrayPattern {
                start,
                end,
                loc,
                elements,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "ArrayPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("elements", elements)?;
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
                map.serialize_entry("left", &**left)?;
                map.serialize_entry("right", &**right)?;
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
                map.serialize_entry("argument", &**argument)?;
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
                map.serialize_entry("key", &**key)?;
                map.serialize_entry("value", &**value)?;
                map.serialize_entry("kind", kind.as_str())?;
                map.end()
            }
            JsNode::Program {
                start,
                end,
                loc,
                body,
                source_type,
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "Program")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("body", body)?;
                map.serialize_entry("sourceType", source_type.as_str())?;
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
                map.serialize_entry("expression", &**expression)?;
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
                map.serialize_entry("body", body)?;
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
                map.serialize_entry("declarations", declarations)?;
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
                map.serialize_entry("id", &**id)?;
                match init {
                    Some(init) => map.serialize_entry("init", &**init)?,
                    None => map.serialize_entry("init", &Value::Null)?,
                }
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
                match id {
                    Some(id) => map.serialize_entry("id", &**id)?,
                    None => map.serialize_entry("id", &Value::Null)?,
                }
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                map.serialize_entry("params", params)?;
                match body {
                    Some(body) => map.serialize_entry("body", &**body)?,
                    None => map.serialize_entry("body", &Value::Null)?,
                }
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
                match id {
                    Some(id) => map.serialize_entry("id", &**id)?,
                    None => map.serialize_entry("id", &Value::Null)?,
                }
                match super_class {
                    Some(sc) => map.serialize_entry("superClass", &**sc)?,
                    None => map.serialize_entry("superClass", &Value::Null)?,
                }
                map.serialize_entry("body", &**body)?;
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
                    map.serialize_entry("decorators", decorators)?;
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
                match argument {
                    Some(arg) => map.serialize_entry("argument", &**arg)?,
                    None => map.serialize_entry("argument", &Value::Null)?,
                }
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
                map.serialize_entry("argument", &**argument)?;
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
                map.serialize_entry("test", &**test)?;
                map.serialize_entry("consequent", &**consequent)?;
                match alternate {
                    Some(alt) => map.serialize_entry("alternate", &**alt)?,
                    None => map.serialize_entry("alternate", &Value::Null)?,
                }
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
                match init {
                    Some(init) => map.serialize_entry("init", &**init)?,
                    None => map.serialize_entry("init", &Value::Null)?,
                }
                match test {
                    Some(test) => map.serialize_entry("test", &**test)?,
                    None => map.serialize_entry("test", &Value::Null)?,
                }
                match update {
                    Some(update) => map.serialize_entry("update", &**update)?,
                    None => map.serialize_entry("update", &Value::Null)?,
                }
                map.serialize_entry("body", &**body)?;
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
                map.serialize_entry("left", &**left)?;
                map.serialize_entry("right", &**right)?;
                map.serialize_entry("body", &**body)?;
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
                map.serialize_entry("left", &**left)?;
                map.serialize_entry("right", &**right)?;
                map.serialize_entry("body", &**body)?;
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
                map.serialize_entry("test", &**test)?;
                map.serialize_entry("body", &**body)?;
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
                map.serialize_entry("test", &**test)?;
                map.serialize_entry("body", &**body)?;
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
                map.serialize_entry("block", &**block)?;
                match handler {
                    Some(h) => map.serialize_entry("handler", &**h)?,
                    None => map.serialize_entry("handler", &Value::Null)?,
                }
                match finalizer {
                    Some(f) => map.serialize_entry("finalizer", &**f)?,
                    None => map.serialize_entry("finalizer", &Value::Null)?,
                }
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
                match param {
                    Some(p) => map.serialize_entry("param", &**p)?,
                    None => map.serialize_entry("param", &Value::Null)?,
                }
                map.serialize_entry("body", &**body)?;
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
                map.serialize_entry("discriminant", &**discriminant)?;
                map.serialize_entry("cases", cases)?;
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
                match test {
                    Some(t) => map.serialize_entry("test", &**t)?,
                    None => map.serialize_entry("test", &Value::Null)?,
                }
                map.serialize_entry("consequent", consequent)?;
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
                map.serialize_entry("label", &**label)?;
                map.serialize_entry("body", &**body)?;
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
                match label {
                    Some(l) => map.serialize_entry("label", &**l)?,
                    None => map.serialize_entry("label", &Value::Null)?,
                }
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
                match label {
                    Some(l) => map.serialize_entry("label", &**l)?,
                    None => map.serialize_entry("label", &Value::Null)?,
                }
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
                map.serialize_entry("specifiers", specifiers)?;
                map.serialize_entry("source", &**source)?;
                if let Some(ik) = import_kind {
                    map.serialize_entry("importKind", ik.as_str())?;
                }
                map.serialize_entry("attributes", attributes)?;
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
                map.serialize_entry("imported", &**imported)?;
                map.serialize_entry("local", &**local)?;
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
                map.serialize_entry("local", &**local)?;
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
                map.serialize_entry("local", &**local)?;
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
                match declaration {
                    Some(d) => map.serialize_entry("declaration", &**d)?,
                    None => map.serialize_entry("declaration", &Value::Null)?,
                }
                map.serialize_entry("specifiers", specifiers)?;
                match source {
                    Some(s) => map.serialize_entry("source", &**s)?,
                    None => map.serialize_entry("source", &Value::Null)?,
                }
                if let Some(ek) = export_kind {
                    map.serialize_entry("exportKind", ek.as_str())?;
                }
                map.serialize_entry("attributes", attributes)?;
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
                map.serialize_entry("declaration", &**declaration)?;
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
                map.serialize_entry("local", &**local)?;
                map.serialize_entry("exported", &**exported)?;
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
                map.serialize_entry("body", body)?;
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
                map.serialize_entry("key", &**key)?;
                map.serialize_entry("value", &**value)?;
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
            } => {
                let mut map = serializer.serialize_map(None)?;
                map.serialize_entry("type", "PropertyDefinition")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("static", r#static)?;
                map.serialize_entry("computed", computed)?;
                map.serialize_entry("key", &**key)?;
                match value {
                    Some(v) => map.serialize_entry("value", &**v)?,
                    None => map.serialize_entry("value", &Value::Null)?,
                }
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
                map.serialize_entry("body", body)?;
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
                map.serialize_entry("typeAnnotation", &**type_annotation)?;
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
                    map.serialize_entry("body", &**b)?;
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
            JsNode::Raw(value) => value.serialize(serializer),
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

fn convert_loc(obj: &serde_json::Map<String, Value>) -> Option<Loc> {
    let loc_val = obj.get("loc")?;
    let loc_obj = loc_val.as_object()?;
    let start_obj = loc_obj.get("start")?.as_object()?;
    let end_obj = loc_obj.get("end")?.as_object()?;

    Some(Loc {
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
    })
}

fn convert_child(obj: &serde_json::Map<String, Value>, key: &str) -> Box<JsNode> {
    match obj.get(key) {
        Some(Value::Object(_)) => Box::new(JsNode::from_value(obj.get(key).unwrap().clone())),
        _ => Box::new(JsNode::Null),
    }
}

fn convert_optional_child(obj: &serde_json::Map<String, Value>, key: &str) -> Option<Box<JsNode>> {
    match obj.get(key) {
        Some(Value::Object(_)) => Some(Box::new(JsNode::from_value(obj.get(key).unwrap().clone()))),
        _ => None,
    }
}

fn convert_array(obj: &serde_json::Map<String, Value>, key: &str) -> Vec<JsNode> {
    match obj.get(key) {
        Some(Value::Array(arr)) => arr.iter().map(|v| JsNode::from_value(v.clone())).collect(),
        _ => Vec::new(),
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
                            Some(Value::Object(_)) if regex.is_some() => {
                                LiteralValue::Regex(regex.clone().unwrap())
                            }
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
                    },
                    "ArrayPattern" => JsNode::ArrayPattern {
                        start,
                        end,
                        loc,
                        elements: convert_nullable_array(obj, "elements"),
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
                    _ => JsNode::Raw(value),
                }
            }
            _ => JsNode::Raw(value),
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
            JsNode::TSEnumDeclaration { .. } => Some("TSEnumDeclaration"),
            JsNode::TSModuleDeclaration { .. } => Some("TSModuleDeclaration"),
            JsNode::Comment { comment_type, .. } => Some(comment_type.as_str()),
            JsNode::Raw(v) => v.get("type").and_then(|t| t.as_str()),
            JsNode::Null => None,
        }
    }

    pub fn start(&self) -> Option<u32> {
        match self {
            JsNode::Null => None,
            JsNode::Raw(v) => v.get("start").and_then(|s| s.as_u64()).map(|n| n as u32),
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
            JsNode::Raw(v) => v.get("end").and_then(|e| e.as_u64()).map(|n| n as u32),
            JsNode::Comment { end, .. } => Some(*end),
            _ => Some(self.get_end_inner()),
        }
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
            | JsNode::TSEnumDeclaration { start, .. }
            | JsNode::TSModuleDeclaration { start, .. }
            | JsNode::Comment { start, .. } => *start,
            JsNode::Raw(_) | JsNode::Null => 0,
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
            | JsNode::TSEnumDeclaration { end, .. }
            | JsNode::TSModuleDeclaration { end, .. }
            | JsNode::Comment { end, .. } => *end,
            JsNode::Raw(_) | JsNode::Null => 0,
        }
    }

    pub fn to_value(&self) -> Value {
        serde_json::to_value(self).unwrap_or(Value::Null)
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
        let node = JsNode::from_value(json.clone());
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
    fn test_null_and_raw_fallback() {
        assert_eq!(JsNode::from_value(Value::Null), JsNode::Null);
        let unknown = serde_json::json!({"type": "SomeUnknownNode", "start": 0, "end": 1});
        let node = JsNode::from_value(unknown.clone());
        matches!(node, JsNode::Raw(_));
    }
}
