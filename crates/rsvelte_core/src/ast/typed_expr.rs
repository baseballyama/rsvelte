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

/// The bulk of [`JsNode::Program`], held behind one `Box` so a per-script node
/// does not set the width of every `JsNode` in the arena.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct ProgramMetadata {
    /// Leading comments on the Program node (e.g. from HTML comments before script tag).
    pub leading_comments: Option<Vec<Value>>,
    /// Trailing comments on the Program node (all JS comments in the program).
    pub trailing_comments: Option<Vec<Value>>,
    /// Map from a JS AST node's absolute `start` offset to the raw `svelte-ignore`
    /// comment value texts that were attached to it as leading comments (at any
    /// depth in this program). This lets Phase-2 analyze surface `svelte-ignore`
    /// suppression for typed nodes without materializing them as `JsNode::Raw`
    /// just to carry a `leadingComments` array. Empty when the script has no
    /// `svelte-ignore` comments (the common case). Internal-only: not serialized.
    pub ignore_comment_map: Vec<(u32, Vec<CompactString>)>,
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
    /// Base-10 digits, no `_` separators and no trailing `n`.
    BigInt(CompactString),
    Bool(bool),
    Null,
    /// Boxed: a regex payload is two `CompactString`s, and inlining it would
    /// widen every `JsNode` by 24 bytes for a variant that is vanishingly rare.
    Regex(Box<RegexValue>),
}

impl Serialize for LiteralValue {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::String(s) => serializer.serialize_str(s),
            Self::Number(n) => {
                if n.fract() == 0.0 && n.abs() < i64::MAX as f64 {
                    match format!("{n:.0}").parse::<i64>() {
                        Ok(integer) => serializer.serialize_i64(integer),
                        Err(_) => serializer.serialize_f64(*n),
                    }
                } else {
                    serializer.serialize_f64(*n)
                }
            }
            Self::Bool(b) => serializer.serialize_bool(*b),
            // ESTree JSON: a bigint's `value` is null; the digits live in the
            // sibling `bigint` entry the Literal serializer adds.
            Self::BigInt(_) => serializer.serialize_none(),
            Self::Null => serializer.serialize_none(),
            Self::Regex(_) => {
                // Regex value serializes as empty object in ESTree
                let map = serializer.serialize_map(Some(0))?;
                map.end()
            }
        }
    }
}

/// TypeScript accessibility, spelled as acorn-typescript spells it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TsAccessibility {
    Private,
    Protected,
    Public,
}

impl TsAccessibility {
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Private => "private",
            Self::Protected => "protected",
            Self::Public => "public",
        }
    }

    #[must_use]
    pub fn from_keyword(value: &str) -> Option<Self> {
        match value {
            "private" => Some(Self::Private),
            "protected" => Some(Self::Protected),
            "public" => Some(Self::Public),
            _ => None,
        }
    }
}

/// Class-member modifiers, as acorn-typescript reports them: each is emitted
/// **only where the source wrote it**, so absence and `false` are different
/// facts and every consumer must skip rather than emit a `false`.
///
/// One field on the two member variants rather than seven, because a field is
/// priced on the type: `JsNode` is one enum and every variant pays its widest.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct TsMemberModifiers {
    pub r#abstract: bool,
    pub accessor: bool,
    pub declare: bool,
    pub definite: bool,
    pub optional: bool,
    pub readonly: bool,
    pub r#override: bool,
    pub accessibility: Option<TsAccessibility>,
}

impl TsMemberModifiers {
    /// The `(name, written)` pairs in the order acorn-typescript emits them.
    #[must_use]
    pub const fn flags(&self) -> [(&'static str, bool); 7] {
        [
            ("abstract", self.r#abstract),
            ("accessor", self.accessor),
            ("declare", self.declare),
            ("definite", self.definite),
            ("optional", self.optional),
            ("readonly", self.readonly),
            ("override", self.r#override),
        ]
    }
}

#[derive(Debug, Clone, PartialEq, Default)]
pub enum JsNode {
    Identifier {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        name: CompactString,
        /// TS optional-parameter marker (`b?: T`). acorn-typescript emits
        /// `optional: true` after `name` (before `typeAnnotation`) and omits it
        /// when false, so this serializes only when `true`. `false` for the
        /// overwhelming majority of identifiers.
        optional: bool,
        /// Opaque, output-only TS `typeAnnotation` boundary blob (`ESTree`
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
        /// Boxed for the same reason as [`LiteralValue::Regex`].
        regex: Option<Box<RegexValue>>,
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
        /// Opaque, output-only TS `typeParameters` blob (`<T, U>`), serialized
        /// verbatim (acorn-typescript emits it between `async` and `params`).
        /// `None` for the overwhelming majority (non-generic) functions.
        type_parameters: Option<Box<serde_json::Value>>,
        /// Object-method values carry generics on the inner function, but
        /// acorn-typescript appends `typeParameters` *after* `body` there (like
        /// arrows) rather than in the declaration/expression slot before `params`.
        type_parameters_after_body: bool,
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
        /// Opaque, output-only TS `typeParameters` blob (`<T,>`). Unlike
        /// declarations/expressions, acorn-typescript appends it *after* `body`
        /// for arrows. `None` for the overwhelming majority (non-generic) arrows.
        type_parameters: Option<Box<serde_json::Value>>,
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
        elements: Vec<Option<Self>>,
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
        /// The second argument, empty when the source wrote none. Held as a
        /// range because acorn-typescript spells it as an `arguments` list.
        options: IdRange,
        /// Which parser upstream ran: acorn always writes `options` (null when
        /// absent), acorn-typescript writes `arguments` and omits it when empty.
        ts: bool,
    },
    /// One entry of an `import`/`export`'s `with { … }` clause. The span runs
    /// from the key to the end of the value, not to the clause's brace.
    ImportAttribute {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        key: JsNodeId,
        value: JsNodeId,
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
        elements: Vec<Option<Self>>,
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
        metadata: Box<ProgramMetadata>,
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
        // Always `false`: acorn only ever sets `expression: true` on arrow function
        // bodies without a block; declarations always have a block body.
        expression: bool,
        /// Opaque, output-only TS `typeParameters` blob (`<T, U>`), serialized
        /// verbatim (acorn-typescript emits it between `async` and `params`).
        /// `None` for the overwhelming majority (non-generic) functions.
        type_parameters: Option<Box<serde_json::Value>>,
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
    ExportAllDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        exported: Option<JsNodeId>,
        source: JsNodeId,
        export_kind: Option<CompactString>,
        attributes: IdRange,
    },
    ExportDefaultDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        declaration: JsNodeId,
        /// `Some("value")` under acorn-typescript, which stamps a kind on every
        /// export; acorn stamps none, so this is a fact about the parser.
        export_kind: Option<CompactString>,
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
        modifiers: TsMemberModifiers,
    },
    PropertyDefinition {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        key: JsNodeId,
        value: Option<JsNodeId>,
        r#static: bool,
        computed: bool,
        /// TS member modifiers — preserved so the TS stripper can raise
        /// `typescript_invalid_feature` on `accessor` (the round-trip must be
        /// lossless; dropping one silently accepts an unsupported feature) and
        /// so `parse()` reports the same field set acorn-typescript does.
        modifiers: TsMemberModifiers,
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
    /// TypeScript declarations are kept as their complete ESTree object so the
    /// public `parse()` API can expose nested TS nodes (and their comments).
    /// Compilation removes the whole declaration before Phase 2.
    TSEnumDeclaration {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    TSTypeAliasDeclaration {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    TSInterfaceDeclaration {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    /// TypeScript-only STATEMENT forms. Upstream's parser emits each one and its
    /// eraser leaves it alone, so the public parse() output has to carry it whole
    /// for the same reason the declarations above do.
    TSImportEqualsDeclaration {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    TSExportAssignment {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    TSNamespaceExportDeclaration {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    /// A class-body index signature. Opaque for the same reason: nothing walks
    /// into it and its shape is acorn-typescript's.
    TSIndexSignature {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    /// An abstract method's bodyless `value`, retained whole for the same
    /// reason: nothing walks into it and its shape is acorn-typescript's, not
    /// a `FunctionExpression`'s.
    TSDeclareMethod {
        start: u32,
        end: u32,
        value: Box<Value>,
    },
    // TS parameter property (`constructor(private x)` / `readonly x`). Only ever
    // constructed when an accessibility/readonly modifier is present, so its
    // presence is always an unsupported-feature error (raised by the TS stripper).
    TSParameterProperty {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
    },
    // `namespace N { … }` / `declare module 'x' { … }`. `body` is a
    // `TSModuleBlock`, or — for the dotted `namespace A.B { … }`, which
    // acorn-typescript parses as `A` whose body is `B` — another
    // `TSModuleDeclaration`.
    TSModuleDeclaration {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        // An `Identifier`, or a `Literal` for `module 'x'`.
        id: Option<JsNodeId>,
        declare: bool,
        global: bool,
        body: Option<JsNodeId>,
    },
    TSModuleBlock {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        body: IdRange,
    },
    // TS assertion expression wrappers. Preserved at parse time to mirror
    // svelte/compiler's public `parse()` AST (acorn-typescript keeps them);
    // `remove_typescript_nodes` erases them at compile time. `type_annotation`
    // is the opaque, output-only type node (e.g. `TSTypeReference` for
    // `as const`), serialized verbatim — analyze never walks into it.
    TSAsExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expression: JsNodeId,
        type_annotation: Box<Value>,
    },
    TSSatisfiesExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expression: JsNodeId,
        type_annotation: Box<Value>,
    },
    TSNonNullExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expression: JsNodeId,
    },
    // Old-style cast `<T>x`. svelte/compiler serializes `typeAnnotation` BEFORE
    // `expression` (see the Serialize impl).
    TSTypeAssertion {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expression: JsNodeId,
        type_annotation: Box<Value>,
    },
    // Explicit type-argument instantiation `f<T>`. Carries `type_arguments`
    // (a `TSTypeParameterInstantiation` type node) rather than a single type.
    TSInstantiationExpression {
        start: u32,
        end: u32,
        loc: Option<Box<Loc>>,
        expression: JsNodeId,
        type_arguments: Box<Value>,
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

/// Helper: serialize the TS member modifiers that the source actually wrote.
/// A modifier that was not written is ABSENT, not `false` — acorn-typescript
/// emits no key at all, so emitting `false` is its own divergence.
macro_rules! ser_member_modifiers {
    ($map:ident, $modifiers:expr) => {{
        let modifiers = $modifiers;
        for (name, written) in modifiers.flags() {
            if written {
                $map.serialize_entry(name, &true)?;
            }
        }
        if let Some(accessibility) = modifiers.accessibility {
            $map.serialize_entry("accessibility", accessibility.as_str())?;
        }
    }};
}

/// Helper: serialize a `JsNodeId` field by resolving through the arena.
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

/// Helper: serialize an `IdRange` field as a JSON array by resolving children through the arena.
macro_rules! ser_children {
    ($map:ident, $key:expr, $range:expr) => {
        crate::ast::arena::with_current_serialize_arena(|arena| {
            $map.serialize_entry($key, arena.get_js_children(*$range))
        })?
    };
}

/// Helper: emit `trailingComments` / `leadingComments` for the node at `$start`
/// from the arena's comment side table (populated by `from_value` on the
/// `parse()` path). A no-op on the compile path (the table is empty), so it must
/// be the LAST thing written before `map.end()` to match the `ESTree` field order.
/// `$type` is part of the key because a span does not identify a node: an
/// `ExpressionStatement` in semicolon-free source has exactly its expression's.
macro_rules! ser_comments {
    ($map:ident, $type:expr, $start:expr, $end:expr) => {
        if let Some((leading, trailing)) =
            crate::ast::arena::try_with_current_serialize_arena(|arena| {
                if arena.has_node_comments() {
                    arena.node_comments($type, $start, $end)
                } else {
                    None
                }
            })
            .flatten()
        {
            if let Some(tc) = trailing {
                $map.serialize_entry("trailingComments", &tc)?;
            }
            if let Some(lc) = leading {
                $map.serialize_entry("leadingComments", &lc)?;
            }
        }
    };
}

/// Clone an opaque TypeScript declaration subtree and materialize comments from
/// the parse-only arena side table on every nested ESTree node. Unlike ordinary
/// typed children, these nodes are serialized from `Value`, so their serializers
/// cannot consult `ser_comments!` individually.
fn opaque_ts_with_comments(value: &Value) -> Value {
    let mut value = value.clone();
    crate::ast::arena::try_with_current_serialize_arena(|arena| {
        if !arena.has_node_comments() {
            return;
        }

        fn apply(value: &mut Value, arena: &ParseArena) {
            let Value::Object(obj) = value else {
                return;
            };
            let key = obj
                .get("type")
                .and_then(|v| v.as_str())
                .zip(obj.get("start").and_then(Value::as_u64))
                .zip(obj.get("end").and_then(Value::as_u64));
            if let Some(((node_type, start), end)) = key
                && let Some((leading, trailing)) =
                    arena.node_comments(node_type, start as u32, end as u32)
            {
                if let Some(trailing) = trailing {
                    obj.insert("trailingComments".to_string(), Value::Array(trailing));
                }
                if let Some(leading) = leading {
                    obj.insert("leadingComments".to_string(), Value::Array(leading));
                }
            }

            for (field, child) in obj.iter_mut() {
                if matches!(field.as_str(), "leadingComments" | "trailingComments") {
                    continue;
                }
                match child {
                    Value::Object(_) => apply(child, arena),
                    Value::Array(items) => {
                        for item in items {
                            apply(item, arena);
                        }
                    }
                    _ => {}
                }
            }
        }

        apply(&mut value, arena);
    });
    value
}

// The `serialize_map` length is serde_json's `Map::with_capacity` argument, so
// each arm passes its unconditional entry count — without it every node's map
// starts at capacity 0 and rehashes its way up.
impl Serialize for JsNode {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Identifier {
                start,
                end,
                loc,
                name,
                optional,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "Identifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("name", name.as_str())?;
                if *optional {
                    map.serialize_entry("optional", &true)?;
                }
                if let Some(ta) = type_annotation {
                    map.serialize_entry("typeAnnotation", ta.as_ref())?;
                }
                ser_comments!(map, "Identifier", *start, *end);
                map.end()
            }
            Self::PrivateIdentifier {
                start,
                end,
                loc,
                name,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "PrivateIdentifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("name", name.as_str())?;
                ser_comments!(map, "PrivateIdentifier", *start, *end);
                map.end()
            }
            Self::Literal {
                start,
                end,
                loc,
                value,
                raw,
                regex,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "Literal")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("value", value)?;
                map.serialize_entry("raw", raw.as_str())?;
                if let LiteralValue::BigInt(digits) = value {
                    map.serialize_entry("bigint", digits.as_str())?;
                }
                if let Some(regex) = regex {
                    let mut regex_map = serde_json::Map::new();
                    regex_map.insert(
                        "pattern".to_string(),
                        Value::String(regex.pattern.to_string()),
                    );
                    regex_map.insert("flags".to_string(), Value::String(regex.flags.to_string()));
                    map.serialize_entry("regex", &Value::Object(regex_map))?;
                }
                ser_comments!(map, "Literal", *start, *end);
                map.end()
            }
            Self::BinaryExpression {
                start,
                end,
                loc,
                left,
                operator,
                right,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "BinaryExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                map.serialize_entry("operator", operator.as_str())?;
                ser_node!(map, "right", right);
                ser_comments!(map, "BinaryExpression", *start, *end);
                map.end()
            }
            Self::LogicalExpression {
                start,
                end,
                loc,
                left,
                operator,
                right,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "LogicalExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                map.serialize_entry("operator", operator.as_str())?;
                ser_node!(map, "right", right);
                ser_comments!(map, "LogicalExpression", *start, *end);
                map.end()
            }
            Self::UnaryExpression {
                start,
                end,
                loc,
                operator,
                prefix,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "UnaryExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("operator", operator.as_str())?;
                map.serialize_entry("prefix", prefix)?;
                ser_node!(map, "argument", argument);
                ser_comments!(map, "UnaryExpression", *start, *end);
                map.end()
            }
            Self::ConditionalExpression {
                start,
                end,
                loc,
                test,
                consequent,
                alternate,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "ConditionalExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "consequent", consequent);
                ser_node!(map, "alternate", alternate);
                ser_comments!(map, "ConditionalExpression", *start, *end);
                map.end()
            }
            Self::CallExpression {
                start,
                end,
                loc,
                callee,
                arguments,
                optional,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "CallExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "callee", callee);
                ser_children!(map, "arguments", arguments);
                map.serialize_entry("optional", optional)?;
                ser_comments!(map, "CallExpression", *start, *end);
                map.end()
            }
            Self::MemberExpression {
                start,
                end,
                loc,
                object,
                property,
                computed,
                optional,
            } => {
                let mut map = serializer.serialize_map(Some(7))?;
                map.serialize_entry("type", "MemberExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "object", object);
                ser_node!(map, "property", property);
                map.serialize_entry("computed", computed)?;
                map.serialize_entry("optional", optional)?;
                ser_comments!(map, "MemberExpression", *start, *end);
                map.end()
            }
            Self::NewExpression {
                start,
                end,
                loc,
                callee,
                arguments,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "NewExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "callee", callee);
                ser_children!(map, "arguments", arguments);
                ser_comments!(map, "NewExpression", *start, *end);
                map.end()
            }
            Self::FunctionExpression {
                start,
                end,
                loc,
                id,
                params,
                body,
                generator,
                r#async,
                expression,
                type_parameters,
                type_parameters_after_body,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "FunctionExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                map.serialize_entry("expression", expression)?;
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                if let Some(tp) = type_parameters
                    && !type_parameters_after_body
                {
                    map.serialize_entry("typeParameters", tp.as_ref())?;
                }
                ser_children!(map, "params", params);
                ser_opt_node!(map, "body", body);
                if let Some(tp) = type_parameters
                    && *type_parameters_after_body
                {
                    map.serialize_entry("typeParameters", tp.as_ref())?;
                }
                ser_comments!(map, "FunctionExpression", *start, *end);
                map.end()
            }
            Self::ClassExpression {
                start,
                end,
                loc,
                id,
                super_class,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ClassExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                ser_opt_node!(map, "superClass", super_class);
                ser_node!(map, "body", body);
                ser_comments!(map, "ClassExpression", *start, *end);
                map.end()
            }
            Self::ArrowFunctionExpression {
                start,
                end,
                loc,
                id,
                params,
                body,
                expression,
                generator,
                r#async,
                type_parameters,
            } => {
                let mut map = serializer.serialize_map(Some(7))?;
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
                // acorn-typescript appends `typeParameters` after `body` for arrows.
                if let Some(tp) = type_parameters {
                    map.serialize_entry("typeParameters", tp.as_ref())?;
                }
                ser_comments!(map, "ArrowFunctionExpression", *start, *end);
                map.end()
            }
            Self::AssignmentExpression {
                start,
                end,
                loc,
                operator,
                left,
                right,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "AssignmentExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("operator", operator.as_str())?;
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                ser_comments!(map, "AssignmentExpression", *start, *end);
                map.end()
            }
            Self::UpdateExpression {
                start,
                end,
                loc,
                operator,
                prefix,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "UpdateExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("operator", operator.as_str())?;
                map.serialize_entry("prefix", prefix)?;
                ser_node!(map, "argument", argument);
                ser_comments!(map, "UpdateExpression", *start, *end);
                map.end()
            }
            Self::SequenceExpression {
                start,
                end,
                loc,
                expressions,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "SequenceExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "expressions", expressions);
                ser_comments!(map, "SequenceExpression", *start, *end);
                map.end()
            }
            Self::ArrayExpression {
                start,
                end,
                loc,
                elements,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ArrayExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                // Elements can be null (elision) - serialize as array of Option<JsNode>
                map.serialize_entry("elements", elements)?;
                ser_comments!(map, "ArrayExpression", *start, *end);
                map.end()
            }
            Self::ObjectExpression {
                start,
                end,
                loc,
                properties,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "ObjectExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "properties", properties);
                ser_comments!(map, "ObjectExpression", *start, *end);
                map.end()
            }
            Self::TemplateLiteral {
                start,
                end,
                loc,
                quasis,
                expressions,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "TemplateLiteral")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                // Acorn creates `expressions` before `quasis`, and zimmerframe
                // visits fields in insertion order. Comment attachment depends
                // on that walk order, so keep the public AST in the same order.
                ser_children!(map, "expressions", expressions);
                ser_children!(map, "quasis", quasis);
                ser_comments!(map, "TemplateLiteral", *start, *end);
                map.end()
            }
            Self::TaggedTemplateExpression {
                start,
                end,
                loc,
                tag,
                quasi,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "TaggedTemplateExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "tag", tag);
                ser_node!(map, "quasi", quasi);
                ser_comments!(map, "TaggedTemplateExpression", *start, *end);
                map.end()
            }
            Self::TemplateElement {
                start,
                end,
                loc,
                tail,
                value,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "TemplateElement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("tail", tail)?;
                let mut val_map = serde_json::Map::new();
                val_map.insert("raw".to_string(), Value::String(value.raw.to_string()));
                val_map.insert(
                    "cooked".to_string(),
                    value
                        .cooked
                        .as_ref()
                        .map_or_else(|| Value::Null, |s| Value::String(s.to_string())),
                );
                map.serialize_entry("value", &Value::Object(val_map))?;
                ser_comments!(map, "TemplateElement", *start, *end);
                map.end()
            }
            Self::ThisExpression { start, end, loc } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "ThisExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_comments!(map, "ThisExpression", *start, *end);
                map.end()
            }
            Self::Super { start, end, loc } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "Super")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_comments!(map, "Super", *start, *end);
                map.end()
            }
            Self::ImportAttribute {
                start,
                end,
                loc,
                key,
                value,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "ImportAttribute")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "key", key);
                ser_node!(map, "value", value);
                ser_comments!(map, "ImportAttribute", *start, *end);
                map.end()
            }
            Self::ImportExpression {
                start,
                end,
                loc,
                source,
                options,
                ts,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "ImportExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "source", source);
                if *ts {
                    if !options.is_empty() {
                        ser_children!(map, "arguments", options);
                    }
                } else if options.is_empty() {
                    map.serialize_entry("options", &None::<()>)?;
                } else {
                    crate::ast::arena::with_current_serialize_arena(|arena| {
                        map.serialize_entry("options", &arena.get_js_children(*options)[0])
                    })?;
                }
                ser_comments!(map, "ImportExpression", *start, *end);
                map.end()
            }
            Self::AwaitExpression {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "AwaitExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                ser_comments!(map, "AwaitExpression", *start, *end);
                map.end()
            }
            Self::YieldExpression {
                start,
                end,
                loc,
                delegate,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "YieldExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("delegate", delegate)?;
                ser_opt_node!(map, "argument", argument);
                ser_comments!(map, "YieldExpression", *start, *end);
                map.end()
            }
            Self::ChainExpression {
                start,
                end,
                loc,
                expression,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ChainExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                ser_comments!(map, "ChainExpression", *start, *end);
                map.end()
            }
            Self::MetaProperty {
                start,
                end,
                loc,
                meta,
                property,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "MetaProperty")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "meta", meta);
                ser_node!(map, "property", property);
                ser_comments!(map, "MetaProperty", *start, *end);
                map.end()
            }
            Self::SpreadElement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "SpreadElement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                ser_comments!(map, "SpreadElement", *start, *end);
                map.end()
            }
            Self::ObjectPattern {
                start,
                end,
                loc,
                properties,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "ObjectPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "properties", properties);
                if let Some(ta) = type_annotation {
                    map.serialize_entry("typeAnnotation", ta.as_ref())?;
                }
                ser_comments!(map, "ObjectPattern", *start, *end);
                map.end()
            }
            Self::ArrayPattern {
                start,
                end,
                loc,
                elements,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ArrayPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("elements", elements)?;
                if let Some(ta) = type_annotation {
                    map.serialize_entry("typeAnnotation", ta.as_ref())?;
                }
                ser_comments!(map, "ArrayPattern", *start, *end);
                map.end()
            }
            Self::AssignmentPattern {
                start,
                end,
                loc,
                left,
                right,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "AssignmentPattern")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                ser_comments!(map, "AssignmentPattern", *start, *end);
                map.end()
            }
            Self::RestElement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "RestElement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                ser_comments!(map, "RestElement", *start, *end);
                map.end()
            }
            Self::Property {
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
                let mut map = serializer.serialize_map(Some(9))?;
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
                ser_comments!(map, "Property", *start, *end);
                map.end()
            }
            Self::Program {
                start,
                end,
                loc,
                body,
                source_type,
                metadata,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "Program")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                map.serialize_entry("sourceType", source_type.as_str())?;
                if let Some(tc) = &metadata.trailing_comments {
                    map.serialize_entry("trailingComments", tc)?;
                }
                if let Some(lc) = &metadata.leading_comments {
                    map.serialize_entry("leadingComments", lc)?;
                }
                map.end()
            }
            Self::ExpressionStatement {
                start,
                end,
                loc,
                expression,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ExpressionStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                ser_comments!(map, "ExpressionStatement", *start, *end);
                map.end()
            }
            Self::BlockStatement {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "BlockStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                ser_comments!(map, "BlockStatement", *start, *end);
                map.end()
            }
            Self::VariableDeclaration {
                start,
                end,
                loc,
                declarations,
                kind,
                declare,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "VariableDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "declarations", declarations);
                map.serialize_entry("kind", kind.as_str())?;
                if *declare {
                    map.serialize_entry("declare", &true)?;
                }
                ser_comments!(map, "VariableDeclaration", *start, *end);
                map.end()
            }
            Self::VariableDeclarator {
                start,
                end,
                loc,
                id,
                init,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "VariableDeclarator")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "id", id);
                ser_opt_node!(map, "init", init);
                ser_comments!(map, "VariableDeclarator", *start, *end);
                map.end()
            }
            Self::FunctionDeclaration {
                start,
                end,
                loc,
                id,
                params,
                body,
                generator,
                r#async,
                expression,
                type_parameters,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "FunctionDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "id", id);
                map.serialize_entry("expression", expression)?;
                map.serialize_entry("generator", generator)?;
                map.serialize_entry("async", r#async)?;
                if let Some(tp) = type_parameters {
                    map.serialize_entry("typeParameters", tp.as_ref())?;
                }
                ser_children!(map, "params", params);
                ser_opt_node!(map, "body", body);
                ser_comments!(map, "FunctionDeclaration", *start, *end);
                map.end()
            }
            Self::ClassDeclaration {
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
                let mut map = serializer.serialize_map(Some(4))?;
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
                ser_comments!(map, "ClassDeclaration", *start, *end);
                map.end()
            }
            Self::ReturnStatement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "ReturnStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "argument", argument);
                ser_comments!(map, "ReturnStatement", *start, *end);
                map.end()
            }
            Self::ThrowStatement {
                start,
                end,
                loc,
                argument,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ThrowStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "argument", argument);
                ser_comments!(map, "ThrowStatement", *start, *end);
                map.end()
            }
            Self::IfStatement {
                start,
                end,
                loc,
                test,
                consequent,
                alternate,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "IfStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "consequent", consequent);
                ser_opt_node!(map, "alternate", alternate);
                ser_comments!(map, "IfStatement", *start, *end);
                map.end()
            }
            Self::ForStatement {
                start,
                end,
                loc,
                init,
                test,
                update,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ForStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "init", init);
                ser_opt_node!(map, "test", test);
                ser_opt_node!(map, "update", update);
                ser_node!(map, "body", body);
                ser_comments!(map, "ForStatement", *start, *end);
                map.end()
            }
            Self::ForOfStatement {
                start,
                end,
                loc,
                r#await,
                left,
                right,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(7))?;
                map.serialize_entry("type", "ForOfStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("await", r#await)?;
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                ser_node!(map, "body", body);
                ser_comments!(map, "ForOfStatement", *start, *end);
                map.end()
            }
            Self::ForInStatement {
                start,
                end,
                loc,
                left,
                right,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(6))?;
                map.serialize_entry("type", "ForInStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "left", left);
                ser_node!(map, "right", right);
                ser_node!(map, "body", body);
                ser_comments!(map, "ForInStatement", *start, *end);
                map.end()
            }
            Self::WhileStatement {
                start,
                end,
                loc,
                test,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "WhileStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "body", body);
                ser_comments!(map, "WhileStatement", *start, *end);
                map.end()
            }
            Self::DoWhileStatement {
                start,
                end,
                loc,
                test,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "DoWhileStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "test", test);
                ser_node!(map, "body", body);
                ser_comments!(map, "DoWhileStatement", *start, *end);
                map.end()
            }
            Self::TryStatement {
                start,
                end,
                loc,
                block,
                handler,
                finalizer,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "TryStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "block", block);
                ser_opt_node!(map, "handler", handler);
                ser_opt_node!(map, "finalizer", finalizer);
                ser_comments!(map, "TryStatement", *start, *end);
                map.end()
            }
            Self::CatchClause {
                start,
                end,
                loc,
                param,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "CatchClause")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "param", param);
                ser_node!(map, "body", body);
                ser_comments!(map, "CatchClause", *start, *end);
                map.end()
            }
            Self::SwitchStatement {
                start,
                end,
                loc,
                discriminant,
                cases,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "SwitchStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "discriminant", discriminant);
                ser_children!(map, "cases", cases);
                ser_comments!(map, "SwitchStatement", *start, *end);
                map.end()
            }
            Self::SwitchCase {
                start,
                end,
                loc,
                test,
                consequent,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "SwitchCase")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "test", test);
                ser_children!(map, "consequent", consequent);
                ser_comments!(map, "SwitchCase", *start, *end);
                map.end()
            }
            Self::LabeledStatement {
                start,
                end,
                loc,
                label,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "LabeledStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                // Acorn assigns `body` before `label` while finishing a
                // labeled statement. Zimmerframe walks object fields in
                // insertion order, and comment ownership depends on that
                // order (for example `$ /* comment */ : value = 1`).
                ser_node!(map, "body", body);
                ser_node!(map, "label", label);
                ser_comments!(map, "LabeledStatement", *start, *end);
                map.end()
            }
            Self::BreakStatement {
                start,
                end,
                loc,
                label,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "BreakStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "label", label);
                ser_comments!(map, "BreakStatement", *start, *end);
                map.end()
            }
            Self::ContinueStatement {
                start,
                end,
                loc,
                label,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "ContinueStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_opt_node!(map, "label", label);
                ser_comments!(map, "ContinueStatement", *start, *end);
                map.end()
            }
            Self::EmptyStatement { start, end, loc } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "EmptyStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_comments!(map, "EmptyStatement", *start, *end);
                map.end()
            }
            Self::DebuggerStatement { start, end, loc } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "DebuggerStatement")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_comments!(map, "DebuggerStatement", *start, *end);
                map.end()
            }
            Self::ImportDeclaration {
                start,
                end,
                loc,
                specifiers,
                source,
                import_kind,
                attributes,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ImportDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "specifiers", specifiers);
                ser_node!(map, "source", source);
                if let Some(ik) = import_kind {
                    map.serialize_entry("importKind", ik.as_str())?;
                }
                // acorn always emits `attributes`; acorn-typescript emits it
                // only where the source wrote an `assert`/`with` clause, and
                // `importKind` is set for TypeScript programs alone.
                if import_kind.is_none() || !attributes.is_empty() {
                    ser_children!(map, "attributes", attributes);
                }
                ser_comments!(map, "ImportDeclaration", *start, *end);
                map.end()
            }
            Self::ImportSpecifier {
                start,
                end,
                loc,
                imported,
                local,
                import_kind,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "ImportSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "imported", imported);
                ser_node!(map, "local", local);
                if let Some(ik) = import_kind {
                    map.serialize_entry("importKind", ik.as_str())?;
                }
                ser_comments!(map, "ImportSpecifier", *start, *end);
                map.end()
            }
            Self::ImportDefaultSpecifier {
                start,
                end,
                loc,
                local,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ImportDefaultSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "local", local);
                ser_comments!(map, "ImportDefaultSpecifier", *start, *end);
                map.end()
            }
            Self::ImportNamespaceSpecifier {
                start,
                end,
                loc,
                local,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ImportNamespaceSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "local", local);
                ser_comments!(map, "ImportNamespaceSpecifier", *start, *end);
                map.end()
            }
            Self::ExportNamedDeclaration {
                start,
                end,
                loc,
                declaration,
                specifiers,
                source,
                export_kind,
                attributes,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
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
                // See `ImportDeclaration`: the field's presence is a fact about
                // which parser upstream ran, and `exportKind` is the same fact.
                if export_kind.is_none() || !attributes.is_empty() {
                    ser_children!(map, "attributes", attributes);
                }
                ser_comments!(map, "ExportNamedDeclaration", *start, *end);
                map.end()
            }
            Self::ExportAllDeclaration {
                start,
                end,
                loc,
                exported,
                source,
                export_kind,
                attributes,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "ExportAllDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                if let Some(ek) = export_kind {
                    map.serialize_entry("exportKind", ek.as_str())?;
                }
                ser_opt_node!(map, "exported", exported);
                ser_node!(map, "source", source);
                // See `ImportDeclaration`: acorn always writes `attributes`,
                // acorn-typescript only where a `with` clause exists.
                if export_kind.is_none() || !attributes.is_empty() {
                    ser_children!(map, "attributes", attributes);
                }
                ser_comments!(map, "ExportAllDeclaration", *start, *end);
                map.end()
            }
            Self::ExportDefaultDeclaration {
                start,
                end,
                loc,
                declaration,
                export_kind,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "ExportDefaultDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                if let Some(ek) = export_kind {
                    map.serialize_entry("exportKind", ek.as_str())?;
                }
                ser_node!(map, "declaration", declaration);
                ser_comments!(map, "ExportDefaultDeclaration", *start, *end);
                map.end()
            }
            Self::ExportSpecifier {
                start,
                end,
                loc,
                local,
                exported,
                export_kind,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "ExportSpecifier")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "local", local);
                ser_node!(map, "exported", exported);
                if let Some(ek) = export_kind {
                    map.serialize_entry("exportKind", ek.as_str())?;
                }
                ser_comments!(map, "ExportSpecifier", *start, *end);
                map.end()
            }
            Self::ClassBody {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "ClassBody")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                ser_comments!(map, "ClassBody", *start, *end);
                map.end()
            }
            Self::MethodDefinition {
                start,
                end,
                loc,
                key,
                value,
                kind,
                r#static,
                computed,
                modifiers,
            } => {
                let mut map = serializer.serialize_map(Some(8))?;
                map.serialize_entry("type", "MethodDefinition")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("static", r#static)?;
                map.serialize_entry("computed", computed)?;
                map.serialize_entry("kind", kind.as_str())?;
                ser_node!(map, "key", key);
                ser_node!(map, "value", value);
                ser_member_modifiers!(map, modifiers);
                ser_comments!(map, "MethodDefinition", *start, *end);
                map.end()
            }
            Self::PropertyDefinition {
                start,
                end,
                loc,
                key,
                value,
                r#static,
                computed,
                modifiers,
            } => {
                let mut map = serializer.serialize_map(Some(7))?;
                map.serialize_entry("type", "PropertyDefinition")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                map.serialize_entry("static", r#static)?;
                map.serialize_entry("computed", computed)?;
                ser_member_modifiers!(map, modifiers);
                ser_node!(map, "key", key);
                ser_opt_node!(map, "value", value);
                ser_comments!(map, "PropertyDefinition", *start, *end);
                map.end()
            }
            Self::StaticBlock {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "StaticBlock")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                ser_comments!(map, "StaticBlock", *start, *end);
                map.end()
            }
            Self::Decorator { start, end, loc } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "Decorator")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_comments!(map, "Decorator", *start, *end);
                map.end()
            }
            Self::TSTypeAnnotation {
                start,
                end,
                loc,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "TSTypeAnnotation")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "typeAnnotation", type_annotation);
                ser_comments!(map, "TSTypeAnnotation", *start, *end);
                map.end()
            }
            Self::TSParameterProperty { start, end, loc } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "TSParameterProperty")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_comments!(map, "TSParameterProperty", *start, *end);
                map.end()
            }
            Self::TSEnumDeclaration { value, .. }
            | Self::TSTypeAliasDeclaration { value, .. }
            | Self::TSInterfaceDeclaration { value, .. }
            | Self::TSImportEqualsDeclaration { value, .. }
            | Self::TSExportAssignment { value, .. }
            | Self::TSNamespaceExportDeclaration { value, .. }
            | Self::TSIndexSignature { value, .. }
            | Self::TSDeclareMethod { value, .. } => {
                opaque_ts_with_comments(value).serialize(serializer)
            }
            Self::TSModuleDeclaration {
                start,
                end,
                loc,
                id,
                declare,
                global,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(3))?;
                map.serialize_entry("type", "TSModuleDeclaration")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                // acorn-typescript omits both flags when false.
                if *global {
                    map.serialize_entry("global", &true)?;
                }
                if let Some(id) = id {
                    ser_node!(map, "id", id);
                }
                if let Some(b) = body {
                    ser_node!(map, "body", b);
                }
                if *declare {
                    map.serialize_entry("declare", &true)?;
                }
                ser_comments!(map, "TSModuleDeclaration", *start, *end);
                map.end()
            }
            Self::TSModuleBlock {
                start,
                end,
                loc,
                body,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "TSModuleBlock")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_children!(map, "body", body);
                ser_comments!(map, "TSModuleBlock", *start, *end);
                map.end()
            }
            Self::TSAsExpression {
                start,
                end,
                loc,
                expression,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "TSAsExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                map.serialize_entry("typeAnnotation", type_annotation.as_ref())?;
                ser_comments!(map, "TSAsExpression", *start, *end);
                map.end()
            }
            Self::TSSatisfiesExpression {
                start,
                end,
                loc,
                expression,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "TSSatisfiesExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                map.serialize_entry("typeAnnotation", type_annotation.as_ref())?;
                ser_comments!(map, "TSSatisfiesExpression", *start, *end);
                map.end()
            }
            Self::TSNonNullExpression {
                start,
                end,
                loc,
                expression,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", "TSNonNullExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                ser_comments!(map, "TSNonNullExpression", *start, *end);
                map.end()
            }
            Self::TSTypeAssertion {
                start,
                end,
                loc,
                expression,
                type_annotation,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "TSTypeAssertion")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                // svelte/compiler emits `typeAnnotation` before `expression` here.
                map.serialize_entry("typeAnnotation", type_annotation.as_ref())?;
                ser_node!(map, "expression", expression);
                ser_comments!(map, "TSTypeAssertion", *start, *end);
                map.end()
            }
            Self::TSInstantiationExpression {
                start,
                end,
                loc,
                expression,
                type_arguments,
            } => {
                let mut map = serializer.serialize_map(Some(5))?;
                map.serialize_entry("type", "TSInstantiationExpression")?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                ser_loc!(map, loc);
                ser_node!(map, "expression", expression);
                map.serialize_entry("typeArguments", type_arguments.as_ref())?;
                ser_comments!(map, "TSInstantiationExpression", *start, *end);
                map.end()
            }
            Self::Comment {
                start,
                end,
                comment_type,
                value,
            } => {
                let mut map = serializer.serialize_map(Some(4))?;
                map.serialize_entry("type", comment_type.as_str())?;
                map.serialize_entry("start", start)?;
                map.serialize_entry("end", end)?;
                map.serialize_entry("value", value.as_str())?;
                map.end()
            }
            Self::Null => serializer.serialize_none(),
        }
    }
}

// ── from_value ─────────────────────────────────────────────────────────

fn get_u32(obj: &serde_json::Map<String, Value>, key: &str) -> u32 {
    obj.get(key)
        .and_then(serde_json::Value::as_u64)
        .and_then(|value| u32::try_from(value).ok())
        .unwrap_or(0)
}

fn get_str(obj: &serde_json::Map<String, Value>, key: &str) -> CompactString {
    obj.get(key).and_then(|v| v.as_str()).unwrap_or("").into()
}

fn get_bool(obj: &serde_json::Map<String, Value>, key: &str) -> bool {
    obj.get(key)
        .and_then(serde_json::Value::as_bool)
        .unwrap_or(false)
}

/// The round-trip through the `Value` blob is where these used to be dropped:
/// the blob emitted them and the typed variant had nowhere to put them, so a
/// written `readonly` survived exactly as far as `from_value`.
fn member_modifiers_from_value(obj: &serde_json::Map<String, Value>) -> TsMemberModifiers {
    TsMemberModifiers {
        r#abstract: get_bool(obj, "abstract"),
        accessor: get_bool(obj, "accessor"),
        declare: get_bool(obj, "declare"),
        definite: get_bool(obj, "definite"),
        optional: get_bool(obj, "optional"),
        readonly: get_bool(obj, "readonly"),
        r#override: get_bool(obj, "override"),
        accessibility: obj
            .get("accessibility")
            .and_then(serde_json::Value::as_str)
            .and_then(TsAccessibility::from_keyword),
    }
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
                .and_then(serde_json::Value::as_u64)
                .and_then(|n| u32::try_from(n).ok()),
        },
        end: SourcePosition {
            line: get_u32(end_obj, "line"),
            column: get_u32(end_obj, "column"),
            character: end_obj
                .get("character")
                .and_then(serde_json::Value::as_u64)
                .and_then(|n| u32::try_from(n).ok()),
        },
    }))
}

thread_local! {
    static DESER_ARENA: std::cell::RefCell<ParseArena> = std::cell::RefCell::new(ParseArena::new());
}

/// Run `f` against either the active serialize arena (during compile) or the
/// fallback `DESER_ARENA` (tests / standalone). The two `deser_alloc_*` helpers
/// below are thin wrappers around this combinator.
fn with_deser_arena<R>(f: impl FnOnce(&ParseArena) -> R) -> R {
    if crate::ast::arena::has_serialize_arena() {
        crate::ast::arena::with_current_serialize_arena(f)
    } else {
        DESER_ARENA.with(|a| f(&a.borrow()))
    }
}

/// Allocate a `JsNode` during deserialization.
fn deser_alloc_node(node: JsNode) -> JsNodeId {
    with_deser_arena(|arena| arena.alloc_js_node(node))
}

fn deser_alloc_children(nodes: Vec<JsNode>) -> IdRange {
    with_deser_arena(|arena| arena.alloc_js_children(nodes))
}

/// Same arena selection as `from_value`, for builders that construct the typed
/// node directly instead of going through a `Value`.
#[must_use]
pub fn alloc_deser_node(node: JsNode) -> JsNodeId {
    deser_alloc_node(node)
}

#[must_use]
pub fn alloc_deser_children(nodes: Vec<JsNode>) -> IdRange {
    deser_alloc_children(nodes)
}

/// `from_value`'s child rule: anything that is not a JSON object becomes `Null`.
#[must_use]
pub fn child_node_from_value(value: Value) -> JsNode {
    match value {
        Value::Object(_) => JsNode::from_value(value),
        _ => JsNode::Null,
    }
}

// Children are taken out of the map rather than cloned: `from_value` owns the
// object, and cloning each child re-copies the whole subtree at every level.
fn convert_child(obj: &mut serde_json::Map<String, Value>, key: &str) -> JsNodeId {
    match obj.remove(key) {
        Some(val @ Value::Object(_)) => deser_alloc_node(JsNode::from_value(val)),
        _ => deser_alloc_node(JsNode::Null),
    }
}

fn convert_optional_child(obj: &mut serde_json::Map<String, Value>, key: &str) -> Option<JsNodeId> {
    match obj.remove(key) {
        Some(val @ Value::Object(_)) => Some(deser_alloc_node(JsNode::from_value(val))),
        _ => None,
    }
}

fn convert_array(obj: &mut serde_json::Map<String, Value>, key: &str) -> IdRange {
    match obj.remove(key) {
        Some(Value::Array(arr)) => {
            let nodes: Vec<JsNode> = arr.into_iter().map(JsNode::from_value).collect();
            deser_alloc_children(nodes)
        }
        _ => IdRange::empty(),
    }
}

fn convert_nullable_array(
    obj: &mut serde_json::Map<String, Value>,
    key: &str,
) -> Vec<Option<JsNode>> {
    match obj.remove(key) {
        Some(Value::Array(arr)) => arr
            .into_iter()
            .map(|v| {
                if v.is_null() {
                    None
                } else {
                    Some(JsNode::from_value(v))
                }
            })
            .collect(),
        _ => Vec::new(),
    }
}

impl JsNode {
    pub fn from_value(value: Value) -> Self {
        match value {
            Value::Object(mut owned_obj) => {
                // These parse-only declarations deliberately retain their full
                // ESTree object. Return before the ordinary typed conversion
                // removes `loc` and child fields from the owned map.
                let opaque_type = owned_obj
                    .get("type")
                    .and_then(Value::as_str)
                    .map(str::to_owned);
                if matches!(
                    opaque_type.as_deref(),
                    Some(
                        "TSTypeAliasDeclaration"
                            | "TSInterfaceDeclaration"
                            | "TSDeclareMethod"
                            | "TSEnumDeclaration"
                            | "TSImportEqualsDeclaration"
                            | "TSExportAssignment"
                            | "TSNamespaceExportDeclaration"
                            | "TSIndexSignature"
                    )
                ) {
                    let start = owned_obj
                        .get("start")
                        .and_then(Value::as_u64)
                        .unwrap_or_default() as u32;
                    let end = owned_obj
                        .get("end")
                        .and_then(Value::as_u64)
                        .unwrap_or_default() as u32;
                    let value = Box::new(Value::Object(owned_obj));
                    return match opaque_type.as_deref() {
                        Some("TSTypeAliasDeclaration") => {
                            Self::TSTypeAliasDeclaration { start, end, value }
                        }
                        Some("TSDeclareMethod") => Self::TSDeclareMethod { start, end, value },
                        Some("TSEnumDeclaration") => Self::TSEnumDeclaration { start, end, value },
                        Some("TSImportEqualsDeclaration") => {
                            Self::TSImportEqualsDeclaration { start, end, value }
                        }
                        Some("TSExportAssignment") => {
                            Self::TSExportAssignment { start, end, value }
                        }
                        Some("TSNamespaceExportDeclaration") => {
                            Self::TSNamespaceExportDeclaration { start, end, value }
                        }
                        Some("TSIndexSignature") => Self::TSIndexSignature { start, end, value },
                        _ => Self::TSInterfaceDeclaration { start, end, value },
                    };
                }

                let obj = &mut owned_obj;
                let type_str = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
                let start = get_u32(obj, "start");
                let end = get_u32(obj, "end");
                let loc = convert_loc(obj);

                // Preserve any `leadingComments`/`trailingComments` on this node
                // into the arena side table (parse path only — `Program` keeps
                // its own; every other node would otherwise drop them on the
                // typed round-trip). The gate is a single thread-local `Cell`
                // read, so the compile path (capture off) pays almost nothing.
                if type_str != "Program" && crate::ast::arena::comment_capture_active() {
                    let leading = obj
                        .get("leadingComments")
                        .and_then(|v| v.as_array().cloned());
                    let trailing = obj
                        .get("trailingComments")
                        .and_then(|v| v.as_array().cloned());
                    if leading.is_some() || trailing.is_some() {
                        with_deser_arena(|a| {
                            a.record_node_comments(type_str, start, end, leading, trailing);
                        });
                    }
                }

                match type_str {
                    "Identifier" => Self::Identifier {
                        start,
                        end,
                        loc,
                        name: get_str(obj, "name"),
                        optional: get_bool(obj, "optional"),
                        type_annotation: obj.get("typeAnnotation").cloned().map(Box::new),
                    },
                    "PrivateIdentifier" => Self::PrivateIdentifier {
                        start,
                        end,
                        loc,
                        name: get_str(obj, "name"),
                    },
                    "Literal" => {
                        let regex = obj.get("regex").and_then(|r| r.as_object()).map(|r| {
                            Box::new(RegexValue {
                                pattern: get_str(r, "pattern"),
                                flags: get_str(r, "flags"),
                            })
                        });
                        let bigint = obj.get("bigint").and_then(|b| b.as_str());
                        let lit_value = if let Some(digits) = bigint {
                            LiteralValue::BigInt(digits.into())
                        } else {
                            match obj.get("value") {
                                Some(Value::String(s)) => LiteralValue::String(s.as_str().into()),
                                Some(Value::Number(n)) => {
                                    LiteralValue::Number(n.as_f64().unwrap_or(0.0))
                                }
                                Some(Value::Bool(b)) => LiteralValue::Bool(*b),
                                Some(Value::Object(_)) => regex.as_ref().map_or_else(
                                    || LiteralValue::Null,
                                    |r| LiteralValue::Regex(r.clone()),
                                ),
                                _ => LiteralValue::Null,
                            }
                        };
                        Self::Literal {
                            start,
                            end,
                            loc,
                            value: lit_value,
                            raw: get_str(obj, "raw"),
                            regex,
                        }
                    }
                    "BinaryExpression" => Self::BinaryExpression {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        operator: get_str(obj, "operator"),
                        right: convert_child(obj, "right"),
                    },
                    "LogicalExpression" => Self::LogicalExpression {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        operator: get_str(obj, "operator"),
                        right: convert_child(obj, "right"),
                    },
                    "UnaryExpression" => Self::UnaryExpression {
                        start,
                        end,
                        loc,
                        operator: get_str(obj, "operator"),
                        prefix: get_bool(obj, "prefix"),
                        argument: convert_child(obj, "argument"),
                    },
                    "ConditionalExpression" => Self::ConditionalExpression {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        consequent: convert_child(obj, "consequent"),
                        alternate: convert_child(obj, "alternate"),
                    },
                    "CallExpression" => Self::CallExpression {
                        start,
                        end,
                        loc,
                        callee: convert_child(obj, "callee"),
                        arguments: convert_array(obj, "arguments"),
                        optional: get_bool(obj, "optional"),
                    },
                    "MemberExpression" => Self::MemberExpression {
                        start,
                        end,
                        loc,
                        object: convert_child(obj, "object"),
                        property: convert_child(obj, "property"),
                        computed: get_bool(obj, "computed"),
                        optional: get_bool(obj, "optional"),
                    },
                    "NewExpression" => Self::NewExpression {
                        start,
                        end,
                        loc,
                        callee: convert_child(obj, "callee"),
                        arguments: convert_array(obj, "arguments"),
                    },
                    "FunctionExpression" => Self::FunctionExpression {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        params: convert_array(obj, "params"),
                        body: convert_optional_child(obj, "body"),
                        generator: get_bool(obj, "generator"),
                        r#async: get_bool(obj, "async"),
                        expression: get_bool(obj, "expression"),
                        type_parameters: obj.get("typeParameters").cloned().map(Box::new),
                        type_parameters_after_body: false,
                    },
                    "ClassExpression" => Self::ClassExpression {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        super_class: convert_optional_child(obj, "superClass"),
                        body: convert_child(obj, "body"),
                    },
                    "ArrowFunctionExpression" => Self::ArrowFunctionExpression {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        params: convert_array(obj, "params"),
                        body: convert_child(obj, "body"),
                        expression: get_bool(obj, "expression"),
                        generator: get_bool(obj, "generator"),
                        r#async: get_bool(obj, "async"),
                        type_parameters: obj.get("typeParameters").cloned().map(Box::new),
                    },
                    "AssignmentExpression" => Self::AssignmentExpression {
                        start,
                        end,
                        loc,
                        operator: get_str(obj, "operator"),
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                    },
                    "UpdateExpression" => Self::UpdateExpression {
                        start,
                        end,
                        loc,
                        operator: get_str(obj, "operator"),
                        prefix: get_bool(obj, "prefix"),
                        argument: convert_child(obj, "argument"),
                    },
                    "SequenceExpression" => Self::SequenceExpression {
                        start,
                        end,
                        loc,
                        expressions: convert_array(obj, "expressions"),
                    },
                    "ArrayExpression" => Self::ArrayExpression {
                        start,
                        end,
                        loc,
                        elements: convert_nullable_array(obj, "elements"),
                    },
                    "ObjectExpression" => Self::ObjectExpression {
                        start,
                        end,
                        loc,
                        properties: convert_array(obj, "properties"),
                    },
                    "TemplateLiteral" => Self::TemplateLiteral {
                        start,
                        end,
                        loc,
                        quasis: convert_array(obj, "quasis"),
                        expressions: convert_array(obj, "expressions"),
                    },
                    "TaggedTemplateExpression" => Self::TaggedTemplateExpression {
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
                                v.get("cooked")
                                    .and_then(|c| c.as_str())
                                    .map(std::convert::Into::into)
                            }),
                        };
                        Self::TemplateElement {
                            start,
                            end,
                            loc,
                            tail: get_bool(obj, "tail"),
                            value: tev,
                        }
                    }
                    "ThisExpression" => Self::ThisExpression { start, end, loc },
                    "Super" => Self::Super { start, end, loc },
                    "ImportAttribute" => Self::ImportAttribute {
                        start,
                        end,
                        loc,
                        key: convert_child(obj, "key"),
                        value: convert_child(obj, "value"),
                    },
                    "ImportExpression" => {
                        // acorn-typescript spells the second argument as an
                        // `arguments` list and omits the key when there is
                        // none; acorn always writes `options`, null when absent.
                        let ts = !obj.contains_key("options");
                        let options = if obj.contains_key("arguments") {
                            convert_array(obj, "arguments")
                        } else {
                            match obj.remove("options") {
                                Some(v @ Value::Object(_)) => {
                                    deser_alloc_children(vec![JsNode::from_value(v)])
                                }
                                _ => IdRange::empty(),
                            }
                        };
                        Self::ImportExpression {
                            start,
                            end,
                            loc,
                            source: convert_child(obj, "source"),
                            options,
                            ts,
                        }
                    }
                    "AwaitExpression" => Self::AwaitExpression {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "YieldExpression" => Self::YieldExpression {
                        start,
                        end,
                        loc,
                        delegate: get_bool(obj, "delegate"),
                        argument: convert_optional_child(obj, "argument"),
                    },
                    "ChainExpression" => Self::ChainExpression {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                    },
                    "MetaProperty" => Self::MetaProperty {
                        start,
                        end,
                        loc,
                        meta: convert_child(obj, "meta"),
                        property: convert_child(obj, "property"),
                    },
                    "SpreadElement" => Self::SpreadElement {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "ObjectPattern" => Self::ObjectPattern {
                        start,
                        end,
                        loc,
                        properties: convert_array(obj, "properties"),
                        type_annotation: obj.get("typeAnnotation").cloned().map(Box::new),
                    },
                    "ArrayPattern" => Self::ArrayPattern {
                        start,
                        end,
                        loc,
                        elements: convert_nullable_array(obj, "elements"),
                        type_annotation: obj.get("typeAnnotation").cloned().map(Box::new),
                    },
                    "AssignmentPattern" => Self::AssignmentPattern {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                    },
                    "RestElement" => Self::RestElement {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "Property" => Self::Property {
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
                    "Program" => Self::Program {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                        source_type: get_str(obj, "sourceType"),
                        metadata: Box::new(ProgramMetadata {
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
                        }),
                    },
                    "ExpressionStatement" => Self::ExpressionStatement {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                    },
                    "BlockStatement" => Self::BlockStatement {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                    },
                    "VariableDeclaration" => Self::VariableDeclaration {
                        start,
                        end,
                        loc,
                        declarations: convert_array(obj, "declarations"),
                        kind: get_str(obj, "kind"),
                        declare: get_bool(obj, "declare"),
                    },
                    "VariableDeclarator" => Self::VariableDeclarator {
                        start,
                        end,
                        loc,
                        id: convert_child(obj, "id"),
                        init: convert_optional_child(obj, "init"),
                    },
                    "FunctionDeclaration" => Self::FunctionDeclaration {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        params: convert_array(obj, "params"),
                        body: convert_optional_child(obj, "body"),
                        generator: get_bool(obj, "generator"),
                        r#async: get_bool(obj, "async"),
                        expression: get_bool(obj, "expression"),
                        type_parameters: obj.get("typeParameters").cloned().map(Box::new),
                    },
                    "ClassDeclaration" => Self::ClassDeclaration {
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
                    "ReturnStatement" => Self::ReturnStatement {
                        start,
                        end,
                        loc,
                        argument: convert_optional_child(obj, "argument"),
                    },
                    "ThrowStatement" => Self::ThrowStatement {
                        start,
                        end,
                        loc,
                        argument: convert_child(obj, "argument"),
                    },
                    "IfStatement" => Self::IfStatement {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        consequent: convert_child(obj, "consequent"),
                        alternate: convert_optional_child(obj, "alternate"),
                    },
                    "ForStatement" => Self::ForStatement {
                        start,
                        end,
                        loc,
                        init: convert_optional_child(obj, "init"),
                        test: convert_optional_child(obj, "test"),
                        update: convert_optional_child(obj, "update"),
                        body: convert_child(obj, "body"),
                    },
                    "ForOfStatement" => Self::ForOfStatement {
                        start,
                        end,
                        loc,
                        r#await: get_bool(obj, "await"),
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                        body: convert_child(obj, "body"),
                    },
                    "ForInStatement" => Self::ForInStatement {
                        start,
                        end,
                        loc,
                        left: convert_child(obj, "left"),
                        right: convert_child(obj, "right"),
                        body: convert_child(obj, "body"),
                    },
                    "WhileStatement" => Self::WhileStatement {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        body: convert_child(obj, "body"),
                    },
                    "DoWhileStatement" => Self::DoWhileStatement {
                        start,
                        end,
                        loc,
                        test: convert_child(obj, "test"),
                        body: convert_child(obj, "body"),
                    },
                    "TryStatement" => Self::TryStatement {
                        start,
                        end,
                        loc,
                        block: convert_child(obj, "block"),
                        handler: convert_optional_child(obj, "handler"),
                        finalizer: convert_optional_child(obj, "finalizer"),
                    },
                    "CatchClause" => Self::CatchClause {
                        start,
                        end,
                        loc,
                        param: convert_optional_child(obj, "param"),
                        body: convert_child(obj, "body"),
                    },
                    "SwitchStatement" => Self::SwitchStatement {
                        start,
                        end,
                        loc,
                        discriminant: convert_child(obj, "discriminant"),
                        cases: convert_array(obj, "cases"),
                    },
                    "SwitchCase" => Self::SwitchCase {
                        start,
                        end,
                        loc,
                        test: convert_optional_child(obj, "test"),
                        consequent: convert_array(obj, "consequent"),
                    },
                    "LabeledStatement" => Self::LabeledStatement {
                        start,
                        end,
                        loc,
                        label: convert_child(obj, "label"),
                        body: convert_child(obj, "body"),
                    },
                    "BreakStatement" => Self::BreakStatement {
                        start,
                        end,
                        loc,
                        label: convert_optional_child(obj, "label"),
                    },
                    "ContinueStatement" => Self::ContinueStatement {
                        start,
                        end,
                        loc,
                        label: convert_optional_child(obj, "label"),
                    },
                    "EmptyStatement" => Self::EmptyStatement { start, end, loc },
                    "DebuggerStatement" => Self::DebuggerStatement { start, end, loc },
                    "ImportDeclaration" => Self::ImportDeclaration {
                        start,
                        end,
                        loc,
                        specifiers: convert_array(obj, "specifiers"),
                        source: convert_child(obj, "source"),
                        import_kind: obj
                            .get("importKind")
                            .and_then(|v| v.as_str())
                            .map(std::convert::Into::into),
                        attributes: convert_array(obj, "attributes"),
                    },
                    "ImportSpecifier" => Self::ImportSpecifier {
                        start,
                        end,
                        loc,
                        imported: convert_child(obj, "imported"),
                        local: convert_child(obj, "local"),
                        import_kind: obj
                            .get("importKind")
                            .and_then(|v| v.as_str())
                            .map(std::convert::Into::into),
                    },
                    "ImportDefaultSpecifier" => Self::ImportDefaultSpecifier {
                        start,
                        end,
                        loc,
                        local: convert_child(obj, "local"),
                    },
                    "ImportNamespaceSpecifier" => Self::ImportNamespaceSpecifier {
                        start,
                        end,
                        loc,
                        local: convert_child(obj, "local"),
                    },
                    "ExportNamedDeclaration" => Self::ExportNamedDeclaration {
                        start,
                        end,
                        loc,
                        declaration: convert_optional_child(obj, "declaration"),
                        specifiers: convert_array(obj, "specifiers"),
                        source: convert_optional_child(obj, "source"),
                        export_kind: obj
                            .get("exportKind")
                            .and_then(|v| v.as_str())
                            .map(std::convert::Into::into),
                        attributes: convert_array(obj, "attributes"),
                    },
                    "ExportAllDeclaration" => Self::ExportAllDeclaration {
                        start,
                        end,
                        loc,
                        exported: convert_optional_child(obj, "exported"),
                        source: convert_child(obj, "source"),
                        export_kind: obj
                            .get("exportKind")
                            .and_then(|v| v.as_str())
                            .map(std::convert::Into::into),
                        attributes: convert_array(obj, "attributes"),
                    },
                    "ExportDefaultDeclaration" => Self::ExportDefaultDeclaration {
                        start,
                        end,
                        loc,
                        declaration: convert_child(obj, "declaration"),
                        export_kind: obj
                            .get("exportKind")
                            .and_then(|v| v.as_str())
                            .map(std::convert::Into::into),
                    },
                    "ExportSpecifier" => Self::ExportSpecifier {
                        start,
                        end,
                        loc,
                        local: convert_child(obj, "local"),
                        exported: convert_child(obj, "exported"),
                        export_kind: obj
                            .get("exportKind")
                            .and_then(|v| v.as_str())
                            .map(std::convert::Into::into),
                    },
                    "ClassBody" => Self::ClassBody {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                    },
                    "MethodDefinition" => Self::MethodDefinition {
                        start,
                        end,
                        loc,
                        key: convert_child(obj, "key"),
                        value: convert_child(obj, "value"),
                        kind: get_str(obj, "kind"),
                        r#static: get_bool(obj, "static"),
                        computed: get_bool(obj, "computed"),
                        modifiers: member_modifiers_from_value(obj),
                    },
                    "PropertyDefinition" => Self::PropertyDefinition {
                        start,
                        end,
                        loc,
                        key: convert_child(obj, "key"),
                        value: convert_optional_child(obj, "value"),
                        r#static: get_bool(obj, "static"),
                        computed: get_bool(obj, "computed"),
                        modifiers: member_modifiers_from_value(obj),
                    },
                    "StaticBlock" => Self::StaticBlock {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                    },
                    "Decorator" => Self::Decorator { start, end, loc },
                    "TSTypeAnnotation" => Self::TSTypeAnnotation {
                        start,
                        end,
                        loc,
                        type_annotation: convert_child(obj, "typeAnnotation"),
                    },
                    "TSParameterProperty" => Self::TSParameterProperty { start, end, loc },
                    "TSModuleDeclaration" => Self::TSModuleDeclaration {
                        start,
                        end,
                        loc,
                        id: convert_optional_child(obj, "id"),
                        declare: obj
                            .get("declare")
                            .and_then(serde_json::Value::as_bool)
                            .unwrap_or(false),
                        global: obj
                            .get("global")
                            .and_then(serde_json::Value::as_bool)
                            .unwrap_or(false),
                        body: convert_optional_child(obj, "body"),
                    },
                    "TSModuleBlock" => Self::TSModuleBlock {
                        start,
                        end,
                        loc,
                        body: convert_array(obj, "body"),
                    },
                    "TSAsExpression" => Self::TSAsExpression {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                        type_annotation: Box::new(
                            obj.get("typeAnnotation").cloned().unwrap_or(Value::Null),
                        ),
                    },
                    "TSSatisfiesExpression" => Self::TSSatisfiesExpression {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                        type_annotation: Box::new(
                            obj.get("typeAnnotation").cloned().unwrap_or(Value::Null),
                        ),
                    },
                    "TSNonNullExpression" => Self::TSNonNullExpression {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                    },
                    "TSTypeAssertion" => Self::TSTypeAssertion {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                        type_annotation: Box::new(
                            obj.get("typeAnnotation").cloned().unwrap_or(Value::Null),
                        ),
                    },
                    "TSInstantiationExpression" => Self::TSInstantiationExpression {
                        start,
                        end,
                        loc,
                        expression: convert_child(obj, "expression"),
                        type_arguments: Box::new(
                            obj.get("typeArguments").cloned().unwrap_or(Value::Null),
                        ),
                    },
                    "Line" | "Block" => Self::Comment {
                        start,
                        end,
                        comment_type: type_str.into(),
                        value: get_str(obj, "value"),
                    },
                    // A node-position object whose `type` we don't recognize is
                    // not a real ESTree node — it is a synthetic, typeless carrier
                    // (e.g. `{ "name": "x" }`) that internal constant-folding
                    // probes deserialize via `from_value::<Expression>(..).ok()`.
                    // Degrade to `Null` so those probes fail gracefully (the fold
                    // logic treats a typeless/None node as non-foldable) rather
                    // than aborting the compile. Real compile-path nodes always
                    // carry a known `type`, so this never fires for them.
                    _ => Self::Null,
                }
            }
            // Non-object JSON in a node position is likewise a synthetic carrier.
            _ => Self::Null,
        }
    }

    #[must_use]
    pub fn node_type(&self) -> Option<&str> {
        match self {
            Self::Identifier { .. } => Some("Identifier"),
            Self::PrivateIdentifier { .. } => Some("PrivateIdentifier"),
            Self::Literal { .. } => Some("Literal"),
            Self::BinaryExpression { .. } => Some("BinaryExpression"),
            Self::LogicalExpression { .. } => Some("LogicalExpression"),
            Self::UnaryExpression { .. } => Some("UnaryExpression"),
            Self::ConditionalExpression { .. } => Some("ConditionalExpression"),
            Self::CallExpression { .. } => Some("CallExpression"),
            Self::MemberExpression { .. } => Some("MemberExpression"),
            Self::NewExpression { .. } => Some("NewExpression"),
            Self::FunctionExpression { .. } => Some("FunctionExpression"),
            Self::ClassExpression { .. } => Some("ClassExpression"),
            Self::ArrowFunctionExpression { .. } => Some("ArrowFunctionExpression"),
            Self::AssignmentExpression { .. } => Some("AssignmentExpression"),
            Self::UpdateExpression { .. } => Some("UpdateExpression"),
            Self::SequenceExpression { .. } => Some("SequenceExpression"),
            Self::ArrayExpression { .. } => Some("ArrayExpression"),
            Self::ObjectExpression { .. } => Some("ObjectExpression"),
            Self::TemplateLiteral { .. } => Some("TemplateLiteral"),
            Self::TaggedTemplateExpression { .. } => Some("TaggedTemplateExpression"),
            Self::TemplateElement { .. } => Some("TemplateElement"),
            Self::ThisExpression { .. } => Some("ThisExpression"),
            Self::Super { .. } => Some("Super"),
            Self::ImportAttribute { .. } => Some("ImportAttribute"),
            Self::ImportExpression { .. } => Some("ImportExpression"),
            Self::AwaitExpression { .. } => Some("AwaitExpression"),
            Self::YieldExpression { .. } => Some("YieldExpression"),
            Self::ChainExpression { .. } => Some("ChainExpression"),
            Self::MetaProperty { .. } => Some("MetaProperty"),
            Self::SpreadElement { .. } => Some("SpreadElement"),
            Self::ObjectPattern { .. } => Some("ObjectPattern"),
            Self::ArrayPattern { .. } => Some("ArrayPattern"),
            Self::AssignmentPattern { .. } => Some("AssignmentPattern"),
            Self::RestElement { .. } => Some("RestElement"),
            Self::Property { .. } => Some("Property"),
            Self::Program { .. } => Some("Program"),
            Self::ExpressionStatement { .. } => Some("ExpressionStatement"),
            Self::BlockStatement { .. } => Some("BlockStatement"),
            Self::VariableDeclaration { .. } => Some("VariableDeclaration"),
            Self::VariableDeclarator { .. } => Some("VariableDeclarator"),
            Self::FunctionDeclaration { .. } => Some("FunctionDeclaration"),
            Self::ClassDeclaration { .. } => Some("ClassDeclaration"),
            Self::ReturnStatement { .. } => Some("ReturnStatement"),
            Self::ThrowStatement { .. } => Some("ThrowStatement"),
            Self::IfStatement { .. } => Some("IfStatement"),
            Self::ForStatement { .. } => Some("ForStatement"),
            Self::ForOfStatement { .. } => Some("ForOfStatement"),
            Self::ForInStatement { .. } => Some("ForInStatement"),
            Self::WhileStatement { .. } => Some("WhileStatement"),
            Self::DoWhileStatement { .. } => Some("DoWhileStatement"),
            Self::TryStatement { .. } => Some("TryStatement"),
            Self::CatchClause { .. } => Some("CatchClause"),
            Self::SwitchStatement { .. } => Some("SwitchStatement"),
            Self::SwitchCase { .. } => Some("SwitchCase"),
            Self::LabeledStatement { .. } => Some("LabeledStatement"),
            Self::BreakStatement { .. } => Some("BreakStatement"),
            Self::ContinueStatement { .. } => Some("ContinueStatement"),
            Self::EmptyStatement { .. } => Some("EmptyStatement"),
            Self::DebuggerStatement { .. } => Some("DebuggerStatement"),
            Self::ImportDeclaration { .. } => Some("ImportDeclaration"),
            Self::ImportSpecifier { .. } => Some("ImportSpecifier"),
            Self::ImportDefaultSpecifier { .. } => Some("ImportDefaultSpecifier"),
            Self::ImportNamespaceSpecifier { .. } => Some("ImportNamespaceSpecifier"),
            Self::ExportNamedDeclaration { .. } => Some("ExportNamedDeclaration"),
            Self::ExportAllDeclaration { .. } => Some("ExportAllDeclaration"),
            Self::ExportDefaultDeclaration { .. } => Some("ExportDefaultDeclaration"),
            Self::ExportSpecifier { .. } => Some("ExportSpecifier"),
            Self::ClassBody { .. } => Some("ClassBody"),
            Self::MethodDefinition { .. } => Some("MethodDefinition"),
            Self::PropertyDefinition { .. } => Some("PropertyDefinition"),
            Self::StaticBlock { .. } => Some("StaticBlock"),
            Self::Decorator { .. } => Some("Decorator"),
            Self::TSTypeAnnotation { .. } => Some("TSTypeAnnotation"),
            Self::TSParameterProperty { .. } => Some("TSParameterProperty"),
            Self::TSEnumDeclaration { .. } => Some("TSEnumDeclaration"),
            Self::TSTypeAliasDeclaration { .. } => Some("TSTypeAliasDeclaration"),
            Self::TSDeclareMethod { .. } => Some("TSDeclareMethod"),
            Self::TSInterfaceDeclaration { .. } => Some("TSInterfaceDeclaration"),
            Self::TSImportEqualsDeclaration { .. } => Some("TSImportEqualsDeclaration"),
            Self::TSExportAssignment { .. } => Some("TSExportAssignment"),
            Self::TSNamespaceExportDeclaration { .. } => Some("TSNamespaceExportDeclaration"),
            Self::TSIndexSignature { .. } => Some("TSIndexSignature"),
            Self::TSModuleDeclaration { .. } => Some("TSModuleDeclaration"),
            Self::TSModuleBlock { .. } => Some("TSModuleBlock"),
            Self::TSAsExpression { .. } => Some("TSAsExpression"),
            Self::TSSatisfiesExpression { .. } => Some("TSSatisfiesExpression"),
            Self::TSNonNullExpression { .. } => Some("TSNonNullExpression"),
            Self::TSTypeAssertion { .. } => Some("TSTypeAssertion"),
            Self::TSInstantiationExpression { .. } => Some("TSInstantiationExpression"),
            Self::Comment { comment_type, .. } => Some(comment_type.as_str()),
            Self::Null => None,
        }
    }

    #[must_use]
    pub fn start(&self) -> Option<u32> {
        match self {
            Self::Null => None,
            Self::Comment { start, .. } => Some(*start),
            _ => {
                // All named variants have start as first field
                Some(self.get_start_inner())
            }
        }
    }

    #[must_use]
    pub fn end(&self) -> Option<u32> {
        match self {
            Self::Null => None,
            Self::Comment { end, .. } => Some(*end),
            _ => Some(self.get_end_inner()),
        }
    }

    /// Get the identifier name if this is an Identifier node.
    #[inline]
    #[must_use]
    pub fn identifier_name(&self) -> Option<&str> {
        match self {
            Self::Identifier { name, .. } => Some(name.as_str()),
            _ => None,
        }
    }

    // ── Typed Accessor Methods ─────────────────────────────────────────

    /// Get the "name" field for nodes that have one (Identifier, `PrivateIdentifier`).
    #[inline]
    #[must_use]
    pub fn name(&self) -> Option<&str> {
        match self {
            Self::Identifier { name, .. } | Self::PrivateIdentifier { name, .. } => {
                Some(name.as_str())
            }
            _ => None,
        }
    }

    /// Get the "body" field as an `IdRange` (for Program, `BlockStatement`, `ClassBody`, `StaticBlock`).
    #[inline]
    #[must_use]
    pub fn body_stmts(&self) -> IdRange {
        match self {
            Self::Program { body, .. }
            | Self::BlockStatement { body, .. }
            | Self::ClassBody { body, .. }
            | Self::StaticBlock { body, .. } => *body,
            _ => IdRange::empty(),
        }
    }

    /// Get the "body" field as a `JsNodeId` (for `ArrowFunctionExpression`, `ForStatement`, etc).
    #[inline]
    #[must_use]
    pub fn body_node(&self) -> Option<JsNodeId> {
        match self {
            Self::ArrowFunctionExpression { body, .. }
            | Self::ForStatement { body, .. }
            | Self::ForOfStatement { body, .. }
            | Self::ForInStatement { body, .. }
            | Self::WhileStatement { body, .. }
            | Self::DoWhileStatement { body, .. }
            | Self::LabeledStatement { body, .. }
            | Self::CatchClause { body, .. }
            | Self::ClassExpression { body, .. }
            | Self::ClassDeclaration { body, .. } => Some(*body),
            Self::FunctionExpression { body, .. } | Self::FunctionDeclaration { body, .. } => *body,
            Self::TSModuleDeclaration { body, .. } => *body,
            _ => None,
        }
    }

    /// Get "declarations" for `VariableDeclaration`.
    #[inline]
    #[must_use]
    pub fn declarations(&self) -> IdRange {
        match self {
            Self::VariableDeclaration { declarations, .. } => *declarations,
            _ => IdRange::empty(),
        }
    }

    /// Get "callee" for `CallExpression`, `NewExpression`.
    #[inline]
    #[must_use]
    pub fn callee(&self) -> Option<JsNodeId> {
        match self {
            Self::CallExpression { callee, .. } | Self::NewExpression { callee, .. } => {
                Some(*callee)
            }
            _ => None,
        }
    }

    /// Get "arguments" for `CallExpression`, `NewExpression`.
    #[inline]
    #[must_use]
    pub const fn call_arguments(&self) -> IdRange {
        match self {
            Self::CallExpression { arguments, .. } | Self::NewExpression { arguments, .. } => {
                *arguments
            }
            _ => IdRange::empty(),
        }
    }

    /// Get "left" for `BinaryExpression`, `LogicalExpression`, `AssignmentExpression`, `AssignmentPattern`,
    /// `ForOfStatement`, `ForInStatement`.
    #[inline]
    #[must_use]
    pub fn left(&self) -> Option<JsNodeId> {
        match self {
            Self::BinaryExpression { left, .. }
            | Self::LogicalExpression { left, .. }
            | Self::AssignmentExpression { left, .. }
            | Self::AssignmentPattern { left, .. }
            | Self::ForOfStatement { left, .. }
            | Self::ForInStatement { left, .. } => Some(*left),
            _ => None,
        }
    }

    /// Get "right" for `BinaryExpression`, `LogicalExpression`, `AssignmentExpression`, `AssignmentPattern`,
    /// `ForOfStatement`, `ForInStatement`.
    #[inline]
    #[must_use]
    pub fn right(&self) -> Option<JsNodeId> {
        match self {
            Self::BinaryExpression { right, .. }
            | Self::LogicalExpression { right, .. }
            | Self::AssignmentExpression { right, .. }
            | Self::AssignmentPattern { right, .. }
            | Self::ForOfStatement { right, .. }
            | Self::ForInStatement { right, .. } => Some(*right),
            _ => None,
        }
    }

    /// Get "properties" for `ObjectExpression`, `ObjectPattern`.
    #[inline]
    #[must_use]
    pub fn properties(&self) -> IdRange {
        match self {
            Self::ObjectExpression { properties, .. } | Self::ObjectPattern { properties, .. } => {
                *properties
            }
            _ => IdRange::empty(),
        }
    }

    /// Get "elements" for `ArrayExpression`, `ArrayPattern` (nullable elements).
    #[inline]
    #[must_use]
    pub fn elements(&self) -> &[Option<Self>] {
        match self {
            Self::ArrayExpression { elements, .. } | Self::ArrayPattern { elements, .. } => {
                elements
            }
            _ => &[],
        }
    }

    /// Get "params" for `FunctionExpression`, `FunctionDeclaration`, `ArrowFunctionExpression`.
    #[inline]
    #[must_use]
    pub fn params(&self) -> IdRange {
        match self {
            Self::FunctionExpression { params, .. }
            | Self::FunctionDeclaration { params, .. }
            | Self::ArrowFunctionExpression { params, .. } => *params,
            _ => IdRange::empty(),
        }
    }

    /// Get "object" for `MemberExpression`.
    #[inline]
    #[must_use]
    pub fn object(&self) -> Option<JsNodeId> {
        match self {
            Self::MemberExpression { object, .. } => Some(*object),
            _ => None,
        }
    }

    /// Get "property" for `MemberExpression`, `MetaProperty`.
    #[inline]
    #[must_use]
    pub const fn property(&self) -> Option<JsNodeId> {
        match self {
            Self::MemberExpression { property, .. } | Self::MetaProperty { property, .. } => {
                Some(*property)
            }
            _ => None,
        }
    }

    /// Get "computed" for `MemberExpression`, Property, `MethodDefinition`, `PropertyDefinition`.
    #[inline]
    #[must_use]
    pub const fn computed(&self) -> bool {
        match self {
            Self::MemberExpression { computed, .. }
            | Self::Property { computed, .. }
            | Self::MethodDefinition { computed, .. }
            | Self::PropertyDefinition { computed, .. } => *computed,
            _ => false,
        }
    }

    /// Get "optional" for `CallExpression`, `MemberExpression`.
    #[inline]
    #[must_use]
    pub const fn optional(&self) -> bool {
        match self {
            Self::CallExpression { optional, .. } | Self::MemberExpression { optional, .. } => {
                *optional
            }
            _ => false,
        }
    }

    /// Get "operator" for `BinaryExpression`, `LogicalExpression`, `UnaryExpression`,
    /// `AssignmentExpression`, `UpdateExpression`.
    #[inline]
    #[must_use]
    pub fn operator(&self) -> Option<&str> {
        match self {
            Self::BinaryExpression { operator, .. }
            | Self::LogicalExpression { operator, .. }
            | Self::UnaryExpression { operator, .. }
            | Self::AssignmentExpression { operator, .. }
            | Self::UpdateExpression { operator, .. } => Some(operator.as_str()),
            _ => None,
        }
    }

    /// Get "prefix" for `UnaryExpression`, `UpdateExpression`.
    #[inline]
    #[must_use]
    pub const fn prefix(&self) -> bool {
        match self {
            Self::UnaryExpression { prefix, .. } | Self::UpdateExpression { prefix, .. } => *prefix,
            _ => false,
        }
    }

    /// Get "test" for `ConditionalExpression`, `IfStatement`, `SwitchCase`.
    #[inline]
    #[must_use]
    pub const fn test(&self) -> Option<JsNodeId> {
        match self {
            Self::ConditionalExpression { test, .. }
            | Self::IfStatement { test, .. }
            | Self::WhileStatement { test, .. }
            | Self::DoWhileStatement { test, .. } => Some(*test),
            Self::ForStatement { test, .. } | Self::SwitchCase { test, .. } => *test,
            _ => None,
        }
    }

    /// Get "consequent" for `ConditionalExpression`, `IfStatement`.
    #[inline]
    #[must_use]
    pub fn consequent(&self) -> Option<JsNodeId> {
        match self {
            Self::ConditionalExpression { consequent, .. }
            | Self::IfStatement { consequent, .. } => Some(*consequent),
            _ => None,
        }
    }

    /// Get "consequent" items for `SwitchCase`.
    #[inline]
    #[must_use]
    pub const fn consequent_stmts(&self) -> IdRange {
        match self {
            Self::SwitchCase { consequent, .. } => *consequent,
            _ => IdRange::empty(),
        }
    }

    /// Get "alternate" for `ConditionalExpression`, `IfStatement`.
    #[inline]
    #[must_use]
    pub fn alternate(&self) -> Option<JsNodeId> {
        match self {
            Self::ConditionalExpression { alternate, .. } => Some(*alternate),
            Self::IfStatement { alternate, .. } => *alternate,
            _ => None,
        }
    }

    /// Get "init" for `VariableDeclarator`, `ForStatement`.
    #[inline]
    #[must_use]
    pub const fn init(&self) -> Option<JsNodeId> {
        match self {
            Self::VariableDeclarator { init, .. } | Self::ForStatement { init, .. } => *init,
            _ => None,
        }
    }

    /// Get "id" for `VariableDeclarator`, `FunctionDeclaration`, `FunctionExpression`,
    /// `ClassDeclaration`, `ClassExpression`.
    #[inline]
    #[must_use]
    pub const fn id(&self) -> Option<JsNodeId> {
        match self {
            Self::VariableDeclarator { id, .. } => Some(*id),
            Self::FunctionDeclaration { id, .. }
            | Self::FunctionExpression { id, .. }
            | Self::ClassDeclaration { id, .. }
            | Self::ClassExpression { id, .. }
            | Self::ArrowFunctionExpression { id, .. } => *id,
            _ => None,
        }
    }

    /// Get "argument" for `UnaryExpression`, `UpdateExpression`, `SpreadElement`, `RestElement`,
    /// `ReturnStatement`, `ThrowStatement`, `AwaitExpression`, `YieldExpression`.
    #[inline]
    #[must_use]
    pub fn argument(&self) -> Option<JsNodeId> {
        match self {
            Self::UnaryExpression { argument, .. }
            | Self::UpdateExpression { argument, .. }
            | Self::SpreadElement { argument, .. }
            | Self::RestElement { argument, .. }
            | Self::ThrowStatement { argument, .. }
            | Self::AwaitExpression { argument, .. } => Some(*argument),
            Self::ReturnStatement { argument, .. } | Self::YieldExpression { argument, .. } => {
                *argument
            }
            _ => None,
        }
    }

    /// Get "expression" for `ExpressionStatement`, `ChainExpression`.
    #[inline]
    #[must_use]
    pub fn expression_node(&self) -> Option<JsNodeId> {
        match self {
            Self::ExpressionStatement { expression, .. }
            | Self::ChainExpression { expression, .. } => Some(*expression),
            _ => None,
        }
    }

    /// Get "expressions" for `SequenceExpression`, `TemplateLiteral`.
    #[inline]
    #[must_use]
    pub fn expressions(&self) -> IdRange {
        match self {
            Self::SequenceExpression { expressions, .. }
            | Self::TemplateLiteral { expressions, .. } => *expressions,
            _ => IdRange::empty(),
        }
    }

    /// Get "key" for Property, `MethodDefinition`, `PropertyDefinition`.
    #[inline]
    #[must_use]
    pub fn key(&self) -> Option<JsNodeId> {
        match self {
            Self::Property { key, .. }
            | Self::MethodDefinition { key, .. }
            | Self::PropertyDefinition { key, .. } => Some(*key),
            _ => None,
        }
    }

    /// Get "value" as a `JsNodeId` for Property, `MethodDefinition`, `PropertyDefinition` const.
    #[inline]
    #[must_use]
    pub fn value_node(&self) -> Option<JsNodeId> {
        match self {
            Self::Property { value, .. } | Self::MethodDefinition { value, .. } => Some(*value),
            Self::PropertyDefinition { value, .. } => *value,
            _ => None,
        }
    }

    /// Get "shorthand" for Property.
    #[inline]
    #[must_use]
    pub const fn shorthand(&self) -> bool {
        match self {
            Self::Property { shorthand, .. } => *shorthand,
            _ => false,
        }
    }

    /// Get "method" for Property.
    #[inline]
    #[must_use]
    pub const fn method(&self) -> bool {
        match self {
            Self::Property { method, .. } => *method,
            _ => false,
        }
    }

    /// Get "kind" for `VariableDeclaration`, Property, `MethodDefinition`.
    #[inline]
    #[must_use]
    pub fn kind(&self) -> Option<&str> {
        match self {
            Self::VariableDeclaration { kind, .. }
            | Self::Property { kind, .. }
            | Self::MethodDefinition { kind, .. } => Some(kind.as_str()),
            _ => None,
        }
    }

    /// Check if the node is async (`FunctionExpression`, `FunctionDeclaration`, `ArrowFunctionExpression`).
    #[inline]
    #[must_use]
    pub fn is_async(&self) -> bool {
        match self {
            Self::FunctionExpression { r#async, .. }
            | Self::FunctionDeclaration { r#async, .. }
            | Self::ArrowFunctionExpression { r#async, .. } => *r#async,
            _ => false,
        }
    }

    /// Check if the node is a generator.
    #[inline]
    #[must_use]
    pub fn is_generator(&self) -> bool {
        match self {
            Self::FunctionExpression { generator, .. }
            | Self::FunctionDeclaration { generator, .. }
            | Self::ArrowFunctionExpression { generator, .. } => *generator,
            _ => false,
        }
    }

    /// Get "raw" for Literal.
    #[inline]
    #[must_use]
    pub fn raw(&self) -> Option<&str> {
        match self {
            Self::Literal { raw, .. } => Some(raw.as_str()),
            _ => None,
        }
    }

    /// Get the `LiteralValue` for Literal nodes.
    #[inline]
    #[must_use]
    pub fn literal_value(&self) -> Option<&LiteralValue> {
        match self {
            Self::Literal { value, .. } => Some(value),
            _ => None,
        }
    }

    /// Get "specifiers" for `ImportDeclaration`, `ExportNamedDeclaration`.
    #[inline]
    #[must_use]
    pub const fn specifiers(&self) -> IdRange {
        match self {
            Self::ImportDeclaration { specifiers, .. }
            | Self::ExportNamedDeclaration { specifiers, .. } => *specifiers,
            _ => IdRange::empty(),
        }
    }

    /// Get "source" for `ImportDeclaration`, `ImportExpression`.
    #[inline]
    #[must_use]
    pub fn source(&self) -> Option<JsNodeId> {
        match self {
            Self::ImportDeclaration { source, .. } | Self::ImportExpression { source, .. } => {
                Some(*source)
            }
            Self::ExportNamedDeclaration { source, .. } => *source,
            _ => None,
        }
    }

    /// Get "local" for `ImportSpecifier`, `ImportDefaultSpecifier`, `ImportNamespaceSpecifier`, `ExportSpecifier`.
    #[inline]
    #[must_use]
    pub fn local(&self) -> Option<JsNodeId> {
        match self {
            Self::ImportSpecifier { local, .. }
            | Self::ImportDefaultSpecifier { local, .. }
            | Self::ImportNamespaceSpecifier { local, .. }
            | Self::ExportSpecifier { local, .. } => Some(*local),
            _ => None,
        }
    }

    /// Get const "imported" for `ImportSpecifier`.
    #[inline]
    #[must_use]
    pub fn imported(&self) -> Option<JsNodeId> {
        match self {
            Self::ImportSpecifier { imported, .. } => Some(*imported),
            _ => None,
        }
    }

    /// Get "exported" for `ExportSpecifier`.
    #[inline]
    #[must_use]
    pub fn exported(&self) -> Option<JsNodeId> {
        match self {
            Self::ExportSpecifier { exported, .. } => Some(*exported),
            _ => None,
        }
    }

    /// Get "declaration" for `ExportNamedDeclaration`, `ExportDefaultDeclaration`.
    #[inline]
    #[must_use]
    pub fn declaration(&self) -> Option<JsNodeId> {
        match self {
            Self::ExportDefaultDeclaration { declaration, .. } => Some(*declaration),
            Self::ExportNamedDeclaration { declaration, .. } => *declaration,
            _ => None,
        }
    }

    /// Get "quasis" for `TemplateLiteral`.
    #[inline]
    #[must_use]
    pub fn quasis(&self) -> IdRange {
        match self {
            Self::TemplateLiteral { quasis, .. } => *quasis,
            _ => IdRange::empty(),
        }
    }

    /// Get "tag" for `TaggedTemplateExpression`.
    #[inline]
    #[must_use]
    pub fn tag(&self) -> Option<JsNodeId> {
        match self {
            Self::TaggedTemplateExpression { tag, .. } => Some(*tag),
            _ => None,
        }
    }

    /// Get "discriminant" for `SwitchStatement`.
    #[inline]
    #[must_use]
    pub fn discriminant(&self) -> Option<JsNodeId> {
        match self {
            Self::SwitchStatement { discriminant, .. } => Some(*discriminant),
            _ => None,
        }
    }

    /// Get "cases" for `SwitchStatement`.
    #[inline]
    #[must_use]
    pub fn cases(&self) -> IdRange {
        match self {
            Self::SwitchStatement { cases, .. } => *cases,
            _ => IdRange::empty(),
        }
    }

    /// Check if this is an expression type (not a statement/declaration).
    #[inline]
    #[must_use]
    pub fn is_expression(&self) -> bool {
        matches!(
            self,
            Self::Identifier { .. }
                | Self::PrivateIdentifier { .. }
                | Self::Literal { .. }
                | Self::BinaryExpression { .. }
                | Self::LogicalExpression { .. }
                | Self::UnaryExpression { .. }
                | Self::ConditionalExpression { .. }
                | Self::CallExpression { .. }
                | Self::MemberExpression { .. }
                | Self::NewExpression { .. }
                | Self::FunctionExpression { .. }
                | Self::ClassExpression { .. }
                | Self::ArrowFunctionExpression { .. }
                | Self::AssignmentExpression { .. }
                | Self::UpdateExpression { .. }
                | Self::SequenceExpression { .. }
                | Self::ArrayExpression { .. }
                | Self::ObjectExpression { .. }
                | Self::TemplateLiteral { .. }
                | Self::TaggedTemplateExpression { .. }
                | Self::ThisExpression { .. }
                | Self::Super { .. }
                | Self::ImportExpression { .. }
                | Self::AwaitExpression { .. }
                | Self::YieldExpression { .. }
                | Self::ChainExpression { .. }
                | Self::MetaProperty { .. }
                | Self::SpreadElement { .. }
        )
    }

    /// Check if this is a pattern (`ObjectPattern`, `ArrayPattern`, etc).
    #[inline]
    #[must_use]
    pub fn is_pattern(&self) -> bool {
        matches!(
            self,
            Self::ObjectPattern { .. }
                | Self::ArrayPattern { .. }
                | Self::AssignmentPattern { .. }
                | Self::RestElement { .. }
        )
    }

    /// Check if this is a function-like node (`FunctionExpression`, `ArrowFunction`, `FunctionDeclaration`).
    #[inline]
    #[must_use]
    pub fn is_function(&self) -> bool {
        matches!(
            self,
            Self::FunctionExpression { .. }
                | Self::ArrowFunctionExpression { .. }
                | Self::FunctionDeclaration { .. }
        )
    }

    fn get_start_inner(&self) -> u32 {
        match self {
            Self::Identifier { start, .. }
            | Self::PrivateIdentifier { start, .. }
            | Self::Literal { start, .. }
            | Self::BinaryExpression { start, .. }
            | Self::LogicalExpression { start, .. }
            | Self::UnaryExpression { start, .. }
            | Self::ConditionalExpression { start, .. }
            | Self::CallExpression { start, .. }
            | Self::MemberExpression { start, .. }
            | Self::NewExpression { start, .. }
            | Self::FunctionExpression { start, .. }
            | Self::ClassExpression { start, .. }
            | Self::ArrowFunctionExpression { start, .. }
            | Self::AssignmentExpression { start, .. }
            | Self::UpdateExpression { start, .. }
            | Self::SequenceExpression { start, .. }
            | Self::ArrayExpression { start, .. }
            | Self::ObjectExpression { start, .. }
            | Self::TemplateLiteral { start, .. }
            | Self::TaggedTemplateExpression { start, .. }
            | Self::TemplateElement { start, .. }
            | Self::ThisExpression { start, .. }
            | Self::Super { start, .. }
            | Self::ImportAttribute { start, .. }
            | Self::ImportExpression { start, .. }
            | Self::AwaitExpression { start, .. }
            | Self::YieldExpression { start, .. }
            | Self::ChainExpression { start, .. }
            | Self::MetaProperty { start, .. }
            | Self::SpreadElement { start, .. }
            | Self::ObjectPattern { start, .. }
            | Self::ArrayPattern { start, .. }
            | Self::AssignmentPattern { start, .. }
            | Self::RestElement { start, .. }
            | Self::Property { start, .. }
            | Self::Program { start, .. }
            | Self::ExpressionStatement { start, .. }
            | Self::BlockStatement { start, .. }
            | Self::VariableDeclaration { start, .. }
            | Self::VariableDeclarator { start, .. }
            | Self::FunctionDeclaration { start, .. }
            | Self::ClassDeclaration { start, .. }
            | Self::ReturnStatement { start, .. }
            | Self::ThrowStatement { start, .. }
            | Self::IfStatement { start, .. }
            | Self::ForStatement { start, .. }
            | Self::ForOfStatement { start, .. }
            | Self::ForInStatement { start, .. }
            | Self::WhileStatement { start, .. }
            | Self::DoWhileStatement { start, .. }
            | Self::TryStatement { start, .. }
            | Self::CatchClause { start, .. }
            | Self::SwitchStatement { start, .. }
            | Self::SwitchCase { start, .. }
            | Self::LabeledStatement { start, .. }
            | Self::BreakStatement { start, .. }
            | Self::ContinueStatement { start, .. }
            | Self::EmptyStatement { start, .. }
            | Self::DebuggerStatement { start, .. }
            | Self::ImportDeclaration { start, .. }
            | Self::ImportSpecifier { start, .. }
            | Self::ImportDefaultSpecifier { start, .. }
            | Self::ImportNamespaceSpecifier { start, .. }
            | Self::ExportNamedDeclaration { start, .. }
            | Self::ExportAllDeclaration { start, .. }
            | Self::ExportDefaultDeclaration { start, .. }
            | Self::ExportSpecifier { start, .. }
            | Self::ClassBody { start, .. }
            | Self::MethodDefinition { start, .. }
            | Self::PropertyDefinition { start, .. }
            | Self::StaticBlock { start, .. }
            | Self::Decorator { start, .. }
            | Self::TSTypeAnnotation { start, .. }
            | Self::TSParameterProperty { start, .. }
            | Self::TSEnumDeclaration { start, .. }
            | Self::TSTypeAliasDeclaration { start, .. }
            | Self::TSDeclareMethod { start, .. }
            | Self::TSInterfaceDeclaration { start, .. }
            | Self::TSImportEqualsDeclaration { start, .. }
            | Self::TSExportAssignment { start, .. }
            | Self::TSNamespaceExportDeclaration { start, .. }
            | Self::TSIndexSignature { start, .. }
            | Self::TSModuleDeclaration { start, .. }
            | Self::TSModuleBlock { start, .. }
            | Self::TSAsExpression { start, .. }
            | Self::TSSatisfiesExpression { start, .. }
            | Self::TSNonNullExpression { start, .. }
            | Self::TSTypeAssertion { start, .. }
            | Self::TSInstantiationExpression { start, .. }
            | Self::Comment { start, .. } => *start,
            Self::Null => 0,
        }
    }

    fn get_end_inner(&self) -> u32 {
        match self {
            Self::Identifier { end, .. }
            | Self::PrivateIdentifier { end, .. }
            | Self::Literal { end, .. }
            | Self::BinaryExpression { end, .. }
            | Self::LogicalExpression { end, .. }
            | Self::UnaryExpression { end, .. }
            | Self::ConditionalExpression { end, .. }
            | Self::CallExpression { end, .. }
            | Self::MemberExpression { end, .. }
            | Self::NewExpression { end, .. }
            | Self::FunctionExpression { end, .. }
            | Self::ClassExpression { end, .. }
            | Self::ArrowFunctionExpression { end, .. }
            | Self::AssignmentExpression { end, .. }
            | Self::UpdateExpression { end, .. }
            | Self::SequenceExpression { end, .. }
            | Self::ArrayExpression { end, .. }
            | Self::ObjectExpression { end, .. }
            | Self::TemplateLiteral { end, .. }
            | Self::TaggedTemplateExpression { end, .. }
            | Self::TemplateElement { end, .. }
            | Self::ThisExpression { end, .. }
            | Self::Super { end, .. }
            | Self::ImportAttribute { end, .. }
            | Self::ImportExpression { end, .. }
            | Self::AwaitExpression { end, .. }
            | Self::YieldExpression { end, .. }
            | Self::ChainExpression { end, .. }
            | Self::MetaProperty { end, .. }
            | Self::SpreadElement { end, .. }
            | Self::ObjectPattern { end, .. }
            | Self::ArrayPattern { end, .. }
            | Self::AssignmentPattern { end, .. }
            | Self::RestElement { end, .. }
            | Self::Property { end, .. }
            | Self::Program { end, .. }
            | Self::ExpressionStatement { end, .. }
            | Self::BlockStatement { end, .. }
            | Self::VariableDeclaration { end, .. }
            | Self::VariableDeclarator { end, .. }
            | Self::FunctionDeclaration { end, .. }
            | Self::ClassDeclaration { end, .. }
            | Self::ReturnStatement { end, .. }
            | Self::ThrowStatement { end, .. }
            | Self::IfStatement { end, .. }
            | Self::ForStatement { end, .. }
            | Self::ForOfStatement { end, .. }
            | Self::ForInStatement { end, .. }
            | Self::WhileStatement { end, .. }
            | Self::DoWhileStatement { end, .. }
            | Self::TryStatement { end, .. }
            | Self::CatchClause { end, .. }
            | Self::SwitchStatement { end, .. }
            | Self::SwitchCase { end, .. }
            | Self::LabeledStatement { end, .. }
            | Self::BreakStatement { end, .. }
            | Self::ContinueStatement { end, .. }
            | Self::EmptyStatement { end, .. }
            | Self::DebuggerStatement { end, .. }
            | Self::ImportDeclaration { end, .. }
            | Self::ImportSpecifier { end, .. }
            | Self::ImportDefaultSpecifier { end, .. }
            | Self::ImportNamespaceSpecifier { end, .. }
            | Self::ExportNamedDeclaration { end, .. }
            | Self::ExportAllDeclaration { end, .. }
            | Self::ExportDefaultDeclaration { end, .. }
            | Self::ExportSpecifier { end, .. }
            | Self::ClassBody { end, .. }
            | Self::MethodDefinition { end, .. }
            | Self::PropertyDefinition { end, .. }
            | Self::StaticBlock { end, .. }
            | Self::Decorator { end, .. }
            | Self::TSTypeAnnotation { end, .. }
            | Self::TSParameterProperty { end, .. }
            | Self::TSEnumDeclaration { end, .. }
            | Self::TSTypeAliasDeclaration { end, .. }
            | Self::TSDeclareMethod { end, .. }
            | Self::TSInterfaceDeclaration { end, .. }
            | Self::TSImportEqualsDeclaration { end, .. }
            | Self::TSExportAssignment { end, .. }
            | Self::TSNamespaceExportDeclaration { end, .. }
            | Self::TSIndexSignature { end, .. }
            | Self::TSModuleDeclaration { end, .. }
            | Self::TSModuleBlock { end, .. }
            | Self::TSAsExpression { end, .. }
            | Self::TSSatisfiesExpression { end, .. }
            | Self::TSNonNullExpression { end, .. }
            | Self::TSTypeAssertion { end, .. }
            | Self::TSInstantiationExpression { end, .. }
            | Self::Comment { end, .. } => *end,
            Self::Null => 0,
        }
    }

    /// Return the `ESTree` "type" string for this node.
    #[inline]
    #[must_use]
    pub fn type_str(&self) -> &str {
        match self {
            Self::Identifier { .. } => "Identifier",
            Self::PrivateIdentifier { .. } => "PrivateIdentifier",
            Self::Literal { .. } => "Literal",
            Self::BinaryExpression { .. } => "BinaryExpression",
            Self::LogicalExpression { .. } => "LogicalExpression",
            Self::UnaryExpression { .. } => "UnaryExpression",
            Self::ConditionalExpression { .. } => "ConditionalExpression",
            Self::CallExpression { .. } => "CallExpression",
            Self::MemberExpression { .. } => "MemberExpression",
            Self::NewExpression { .. } => "NewExpression",
            Self::FunctionExpression { .. } => "FunctionExpression",
            Self::ClassExpression { .. } => "ClassExpression",
            Self::ArrowFunctionExpression { .. } => "ArrowFunctionExpression",
            Self::AssignmentExpression { .. } => "AssignmentExpression",
            Self::UpdateExpression { .. } => "UpdateExpression",
            Self::SequenceExpression { .. } => "SequenceExpression",
            Self::ArrayExpression { .. } => "ArrayExpression",
            Self::ObjectExpression { .. } => "ObjectExpression",
            Self::TemplateLiteral { .. } => "TemplateLiteral",
            Self::TaggedTemplateExpression { .. } => "TaggedTemplateExpression",
            Self::TemplateElement { .. } => "TemplateElement",
            Self::ThisExpression { .. } => "ThisExpression",
            Self::Super { .. } => "Super",
            Self::ImportAttribute { .. } => "ImportAttribute",
            Self::ImportExpression { .. } => "ImportExpression",
            Self::AwaitExpression { .. } => "AwaitExpression",
            Self::YieldExpression { .. } => "YieldExpression",
            Self::ChainExpression { .. } => "ChainExpression",
            Self::MetaProperty { .. } => "MetaProperty",
            Self::SpreadElement { .. } => "SpreadElement",
            Self::ObjectPattern { .. } => "ObjectPattern",
            Self::ArrayPattern { .. } => "ArrayPattern",
            Self::AssignmentPattern { .. } => "AssignmentPattern",
            Self::RestElement { .. } => "RestElement",
            Self::Property { .. } => "Property",
            Self::Program { .. } => "Program",
            Self::ExpressionStatement { .. } => "ExpressionStatement",
            Self::BlockStatement { .. } => "BlockStatement",
            Self::VariableDeclaration { .. } => "VariableDeclaration",
            Self::VariableDeclarator { .. } => "VariableDeclarator",
            Self::FunctionDeclaration { .. } => "FunctionDeclaration",
            Self::ClassDeclaration { .. } => "ClassDeclaration",
            Self::ReturnStatement { .. } => "ReturnStatement",
            Self::ThrowStatement { .. } => "ThrowStatement",
            Self::IfStatement { .. } => "IfStatement",
            Self::ForStatement { .. } => "ForStatement",
            Self::ForOfStatement { .. } => "ForOfStatement",
            Self::ForInStatement { .. } => "ForInStatement",
            Self::WhileStatement { .. } => "WhileStatement",
            Self::DoWhileStatement { .. } => "DoWhileStatement",
            Self::TryStatement { .. } => "TryStatement",
            Self::CatchClause { .. } => "CatchClause",
            Self::SwitchStatement { .. } => "SwitchStatement",
            Self::SwitchCase { .. } => "SwitchCase",
            Self::LabeledStatement { .. } => "LabeledStatement",
            Self::BreakStatement { .. } => "BreakStatement",
            Self::ContinueStatement { .. } => "ContinueStatement",
            Self::EmptyStatement { .. } => "EmptyStatement",
            Self::DebuggerStatement { .. } => "DebuggerStatement",
            Self::ImportDeclaration { .. } => "ImportDeclaration",
            Self::ImportSpecifier { .. } => "ImportSpecifier",
            Self::ImportDefaultSpecifier { .. } => "ImportDefaultSpecifier",
            Self::ImportNamespaceSpecifier { .. } => "ImportNamespaceSpecifier",
            Self::ExportNamedDeclaration { .. } => "ExportNamedDeclaration",
            Self::ExportAllDeclaration { .. } => "ExportAllDeclaration",
            Self::ExportDefaultDeclaration { .. } => "ExportDefaultDeclaration",
            Self::ExportSpecifier { .. } => "ExportSpecifier",
            Self::ClassBody { .. } => "ClassBody",
            Self::MethodDefinition { .. } => "MethodDefinition",
            Self::PropertyDefinition { .. } => "PropertyDefinition",
            Self::StaticBlock { .. } => "StaticBlock",
            Self::Decorator { .. } => "Decorator",
            Self::TSTypeAnnotation { .. } => "TSTypeAnnotation",
            Self::TSParameterProperty { .. } => "TSParameterProperty",
            Self::TSEnumDeclaration { .. } => "TSEnumDeclaration",
            Self::TSTypeAliasDeclaration { .. } => "TSTypeAliasDeclaration",
            Self::TSDeclareMethod { .. } => "TSDeclareMethod",
            Self::TSInterfaceDeclaration { .. } => "TSInterfaceDeclaration",
            Self::TSImportEqualsDeclaration { .. } => "TSImportEqualsDeclaration",
            Self::TSExportAssignment { .. } => "TSExportAssignment",
            Self::TSNamespaceExportDeclaration { .. } => "TSNamespaceExportDeclaration",
            Self::TSIndexSignature { .. } => "TSIndexSignature",
            Self::TSModuleDeclaration { .. } => "TSModuleDeclaration",
            Self::TSModuleBlock { .. } => "TSModuleBlock",
            Self::TSAsExpression { .. } => "TSAsExpression",
            Self::TSSatisfiesExpression { .. } => "TSSatisfiesExpression",
            Self::TSNonNullExpression { .. } => "TSNonNullExpression",
            Self::TSTypeAssertion { .. } => "TSTypeAssertion",
            Self::TSInstantiationExpression { .. } => "TSInstantiationExpression",
            Self::Comment { .. } => "Comment",
            Self::Null => "Null",
        }
    }

    /// Get a string field by name (for `js_path` queries).
    ///
    /// Supports common fields: "name", "operator", "kind", "sourceType", "exportKind", "importKind".
    #[must_use]
    pub fn get_field_str(&self, field: &str) -> Option<&str> {
        match field {
            "name" => match self {
                Self::Identifier { name, .. } | Self::PrivateIdentifier { name, .. } => {
                    Some(name.as_str())
                }
                _ => None,
            },
            "operator" => match self {
                Self::BinaryExpression { operator, .. }
                | Self::LogicalExpression { operator, .. }
                | Self::UnaryExpression { operator, .. }
                | Self::AssignmentExpression { operator, .. }
                | Self::UpdateExpression { operator, .. } => Some(operator.as_str()),
                _ => None,
            },
            "kind" => match self {
                Self::VariableDeclaration { kind, .. }
                | Self::Property { kind, .. }
                | Self::MethodDefinition { kind, .. } => Some(kind.as_str()),
                _ => None,
            },
            "sourceType" => match self {
                Self::Program { source_type, .. } => Some(source_type.as_str()),
                _ => None,
            },
            "type" => Some(self.type_str()),
            _ => None,
        }
    }

    /// Get a boolean field by name (for `js_path` queries).
    #[must_use]
    pub fn get_field_bool(&self, field: &str) -> Option<bool> {
        match field {
            "computed" => match self {
                Self::MemberExpression { computed, .. }
                | Self::Property { computed, .. }
                | Self::MethodDefinition { computed, .. }
                | Self::PropertyDefinition { computed, .. } => Some(*computed),
                _ => None,
            },
            "optional" => match self {
                Self::CallExpression { optional, .. } | Self::MemberExpression { optional, .. } => {
                    Some(*optional)
                }
                _ => None,
            },
            "generator" => match self {
                Self::FunctionDeclaration { generator, .. }
                | Self::FunctionExpression { generator, .. }
                | Self::ArrowFunctionExpression { generator, .. } => Some(*generator),
                _ => None,
            },
            "async" => match self {
                Self::FunctionDeclaration { r#async, .. }
                | Self::FunctionExpression { r#async, .. }
                | Self::ArrowFunctionExpression { r#async, .. } => Some(*r#async),
                _ => None,
            },
            "static" => match self {
                Self::MethodDefinition { r#static, .. }
                | Self::PropertyDefinition { r#static, .. } => Some(*r#static),
                _ => None,
            },
            "prefix" => match self {
                Self::UnaryExpression { prefix, .. } | Self::UpdateExpression { prefix, .. } => {
                    Some(*prefix)
                }
                _ => None,
            },
            "shorthand" => match self {
                Self::Property { shorthand, .. } => Some(*shorthand),
                _ => None,
            },
            "method" => match self {
                Self::Property { method, .. } => Some(*method),
                _ => None,
            },
            _ => None,
        }
    }

    /// Get a u64 field by name (for start/end positions).
    #[must_use]
    pub fn get_field_u64(&self, field: &str) -> Option<u64> {
        match field {
            "start" => self.start().map(u64::from),
            "end" => self.end().map(u64::from),
            _ => None,
        }
    }

    /// Get the start position of a child node field by name.
    ///
    /// Resolves the child `JsNodeId` through the given arena and returns
    /// the child's start position. Used for positional equality checks
    /// (e.g., "is this identifier the `object` of a `MemberExpression`?").
    pub fn get_child_field_start(
        &self,
        field: &str,
        arena: &crate::ast::arena::ParseArena,
    ) -> Option<u32> {
        match field {
            "object" => match self {
                Self::MemberExpression { object, .. } => arena.get_js_node(*object).start(),
                _ => None,
            },
            "property" => match self {
                Self::MemberExpression { property, .. } => arena.get_js_node(*property).start(),
                _ => None,
            },
            "value" => match self {
                Self::Property { value, .. } => arena.get_js_node(*value).start(),
                Self::PropertyDefinition { value: Some(v), .. } => arena.get_js_node(*v).start(),
                _ => None,
            },
            "meta" => match self {
                Self::MetaProperty { meta, .. } => arena.get_js_node(*meta).start(),
                _ => None,
            },
            "local" => match self {
                Self::ExportSpecifier { local, .. }
                | Self::ImportSpecifier { local, .. }
                | Self::ImportDefaultSpecifier { local, .. }
                | Self::ImportNamespaceSpecifier { local, .. } => arena.get_js_node(*local).start(),
                _ => None,
            },
            "left" => match self {
                Self::AssignmentExpression { left, .. } => arena.get_js_node(*left).start(),
                _ => None,
            },
            "id" => match self {
                Self::VariableDeclarator { id, .. } => arena.get_js_node(*id).start(),
                _ => None,
            },
            "callee" => match self {
                Self::CallExpression { callee, .. } => arena.get_js_node(*callee).start(),
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
                Self::VariableDeclarator { id, .. } => arena.get_js_node(*id).end(),
                _ => None,
            },
            _ => None,
        }
    }

    /// Get the callee `JsNode` reference for a `CallExpression`.
    ///
    /// Returns the resolved callee node. Used for typed rune checks.
    pub fn get_callee<'a>(&self, arena: &'a crate::ast::arena::ParseArena) -> Option<&'a Self> {
        match self {
            Self::CallExpression { callee, .. } => Some(arena.get_js_node(*callee)),
            _ => None,
        }
    }

    #[must_use]
    pub fn to_value(&self) -> Value {
        #[cfg(test)]
        to_value_probe::record();
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
    #[must_use]
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
    fn test_node_comments_roundtrip() {
        // `leadingComments`/`trailingComments` on arbitrary (incl. nested) nodes
        // must survive the typed `from_value` -> `to_value` round-trip via the
        // arena comment side table, so `parse()` AST output stays comment-lossless
        // once expressions are typed. Comment on a top-level Identifier and on a
        // Literal nested inside a BinaryExpression.
        let json = serde_json::json!({
            "type": "BinaryExpression",
            "start": 0,
            "end": 7,
            "operator": "+",
            "left": {
                "type": "Identifier",
                "start": 0,
                "end": 1,
                "name": "a",
                "leadingComments": [
                    { "type": "Block", "value": " x ", "start": 0, "end": 0 }
                ]
            },
            "right": {
                "type": "Literal",
                "start": 6,
                "end": 7,
                "value": 1,
                "raw": "1",
                "trailingComments": [
                    { "type": "Line", "value": " y", "start": 8, "end": 12 }
                ]
            }
        });
        let arena = crate::ast::arena::ParseArena::new();
        let _capture = crate::ast::arena::CommentCaptureGuard::new();
        let back = crate::ast::arena::with_serialize_arena(&arena, || {
            JsNode::from_value(json.clone()).to_value()
        });
        // The Identifier's leadingComments and the nested Literal's
        // trailingComments both round-trip.
        assert_eq!(
            back["left"]["leadingComments"], json["left"]["leadingComments"],
            "leading comment on nested Identifier lost"
        );
        assert_eq!(
            back["right"]["trailingComments"], json["right"]["trailingComments"],
            "trailing comment on nested Literal lost"
        );
    }

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
    fn test_unknown_node_type_degrades_to_null() {
        // A node-position object with an unrecognized `type` is a synthetic /
        // malformed carrier, not a real node; `from_value` degrades it to `Null`
        // (used by tolerant `from_value::<Expression>(..).ok()` fold probes)
        // rather than panicking. Real compile-path nodes always carry a known type.
        let unknown = serde_json::json!({"type": "SomeUnknownNode", "start": 0, "end": 1});
        assert_eq!(JsNode::from_value(unknown), JsNode::Null);
        let typeless = serde_json::json!({"name": "x"});
        assert_eq!(JsNode::from_value(typeless), JsNode::Null);
    }
}

/// Counts `to_value` calls so a test can assert that an analysis path answers
/// off the typed AST, which the timing gates cannot settle: they sample library
/// code, 12% legacy `$:` by bytes against 69% for applications.
#[cfg(test)]
pub(crate) mod to_value_probe {
    use std::cell::Cell;

    thread_local! {
        static CALLS: Cell<u64> = const { Cell::new(0) };
    }

    pub(crate) fn record() {
        CALLS.with(|c| c.set(c.get() + 1));
    }

    pub(crate) fn reset() {
        CALLS.with(|c| c.set(0));
    }

    pub(crate) fn calls() -> u64 {
        CALLS.with(|c| c.get())
    }
}
