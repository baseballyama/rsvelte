//! JavaScript AST node types.
//!
//! These types represent JavaScript/ESTree AST nodes that can be
//! serialized to JavaScript source code.

use super::arena::{ExprId, StmtId};
use compact_str::CompactString;
use smallvec::SmallVec;
use std::fmt;

/// A complete JavaScript program.
#[derive(Debug, Clone)]
pub struct JsProgram {
    pub body: Vec<JsStatement>,
}

impl JsProgram {
    pub fn new() -> Self {
        Self { body: Vec::new() }
    }

    pub fn with_body(body: Vec<JsStatement>) -> Self {
        Self { body }
    }

    pub fn push(&mut self, stmt: JsStatement) {
        self.body.push(stmt);
    }
}

impl Default for JsProgram {
    fn default() -> Self {
        Self::new()
    }
}

/// A JavaScript statement.
#[derive(Debug, Clone)]
pub enum JsStatement {
    /// Import declaration
    Import(JsImportDeclaration),
    /// Export default declaration
    ExportDefault(JsExportDefault),
    /// Export named declaration
    ExportNamed(JsExportNamed),
    /// Variable declaration (let, const, var)
    VariableDeclaration(JsVariableDeclaration),
    /// Function declaration
    FunctionDeclaration(JsFunctionDeclaration),
    /// Expression statement
    Expression(JsExpressionStatement),
    /// Return statement
    Return(JsReturnStatement),
    /// If statement
    If(JsIfStatement),
    /// For statement
    For(JsForStatement),
    /// For-of statement
    ForOf(JsForOfStatement),
    /// While statement
    While(JsWhileStatement),
    /// Do-while statement
    DoWhile(JsDoWhileStatement),
    /// Switch statement
    Switch(JsSwitchStatement),
    /// Block statement
    Block(JsBlockStatement),
    /// Empty statement
    Empty,
    /// Debugger statement
    Debugger,
    /// Labeled statement
    Labeled(JsLabeledStatement),
    /// Break statement
    Break(Option<CompactString>),
    /// Continue statement
    Continue(Option<CompactString>),
    /// Throw statement
    Throw(ExprId),
    /// Try statement
    Try(JsTryStatement),
    /// Raw JavaScript code (as a statement, output verbatim)
    Raw(CompactString),
    /// Raw JavaScript code with source mapping info.
    /// `source_offset` is the byte offset in the original source where this code starts.
    /// The codegen uses this to generate per-line source mappings.
    RawMapped {
        code: CompactString,
        source_offset: u32,
    },
}

/// Import declaration.
#[derive(Debug, Clone)]
pub struct JsImportDeclaration {
    pub source: CompactString,
    pub specifiers: Vec<JsImportSpecifier>,
}

/// Import specifier types.
#[derive(Debug, Clone)]
pub enum JsImportSpecifier {
    /// import * as name from 'source'
    Namespace(CompactString),
    /// import name from 'source'
    Default(CompactString),
    /// import { imported as local } from 'source'
    Named {
        imported: CompactString,
        local: CompactString,
    },
    /// import 'source' (side effect only)
    SideEffect,
}

/// Export default declaration.
#[derive(Debug, Clone)]
pub struct JsExportDefault {
    pub declaration: JsExportDefaultDeclaration,
}

/// What can be exported as default.
#[derive(Debug, Clone)]
pub enum JsExportDefaultDeclaration {
    Function(JsFunctionDeclaration),
    Expression(ExprId),
}

/// Export named declaration.
#[derive(Debug, Clone)]
pub struct JsExportNamed {
    pub declaration: Option<JsVariableDeclaration>,
    pub specifiers: Vec<JsExportSpecifier>,
}

/// Export specifier.
#[derive(Debug, Clone)]
pub struct JsExportSpecifier {
    pub local: CompactString,
    pub exported: CompactString,
}

/// Variable declaration.
#[derive(Debug, Clone)]
pub struct JsVariableDeclaration {
    pub kind: JsVariableKind,
    pub declarations: Vec<JsVariableDeclarator>,
}

/// Variable declaration kind.
#[derive(Debug, Clone, Copy)]
pub enum JsVariableKind {
    Var,
    Let,
    Const,
}

impl JsVariableKind {
    #[inline]
    pub fn as_str(&self) -> &'static str {
        match self {
            JsVariableKind::Var => "var",
            JsVariableKind::Let => "let",
            JsVariableKind::Const => "const",
        }
    }
}

impl fmt::Display for JsVariableKind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Variable declarator (name = init).
#[derive(Debug, Clone)]
pub struct JsVariableDeclarator {
    pub id: JsPattern,
    pub init: Option<ExprId>,
}

/// Function declaration.
#[derive(Debug, Clone)]
pub struct JsFunctionDeclaration {
    pub id: Option<CompactString>,
    pub params: SmallVec<[JsPattern; 3]>,
    pub body: JsBlockStatement,
    pub is_async: bool,
    pub is_generator: bool,
}

/// Expression statement.
#[derive(Debug, Clone)]
pub struct JsExpressionStatement {
    pub expression: ExprId,
}

/// Return statement.
#[derive(Debug, Clone)]
pub struct JsReturnStatement {
    pub argument: Option<ExprId>,
}

/// If statement.
#[derive(Debug, Clone)]
pub struct JsIfStatement {
    pub test: ExprId,
    pub consequent: StmtId,
    pub alternate: Option<StmtId>,
}

/// For statement.
#[derive(Debug, Clone)]
pub struct JsForStatement {
    pub init: Option<JsForInit>,
    pub test: Option<ExprId>,
    pub update: Option<ExprId>,
    pub body: StmtId,
}

/// For loop initializer.
#[derive(Debug, Clone)]
pub enum JsForInit {
    Variable(JsVariableDeclaration),
    Expression(ExprId),
}

/// For-of statement. Also represents `for...in` when `is_for_in` is set (the
/// two share a structure; codegen emits ` in ` vs ` of ` accordingly).
#[derive(Debug, Clone)]
pub struct JsForOfStatement {
    pub left: JsForOfLeft,
    pub right: ExprId,
    pub body: StmtId,
    pub is_await: bool,
    /// `true` for `for (… in …)`, `false` for `for (… of …)`.
    pub is_for_in: bool,
}

/// Left side of for-of statement.
#[derive(Debug, Clone)]
pub enum JsForOfLeft {
    Variable(JsVariableDeclaration),
    Pattern(JsPattern),
}

/// While statement.
#[derive(Debug, Clone)]
pub struct JsWhileStatement {
    pub test: ExprId,
    pub body: StmtId,
}

/// Do-while statement.
#[derive(Debug, Clone)]
pub struct JsDoWhileStatement {
    pub test: ExprId,
    pub body: StmtId,
}

/// Block statement.
#[derive(Debug, Clone)]
pub struct JsBlockStatement {
    pub body: Vec<JsStatement>,
}

impl JsBlockStatement {
    pub fn new() -> Self {
        Self { body: Vec::new() }
    }

    pub fn with_body(body: Vec<JsStatement>) -> Self {
        Self { body }
    }

    pub fn push(&mut self, stmt: JsStatement) {
        self.body.push(stmt);
    }
}

impl Default for JsBlockStatement {
    fn default() -> Self {
        Self::new()
    }
}

/// Labeled statement.
#[derive(Debug, Clone)]
pub struct JsLabeledStatement {
    pub label: CompactString,
    pub body: StmtId,
}

/// Try statement.
#[derive(Debug, Clone)]
pub struct JsTryStatement {
    pub block: JsBlockStatement,
    pub handler: Option<JsCatchClause>,
    pub finalizer: Option<JsBlockStatement>,
}

/// Switch statement.
#[derive(Debug, Clone)]
pub struct JsSwitchStatement {
    pub discriminant: ExprId,
    pub cases: Vec<JsSwitchCase>,
}

/// A single `case` / `default` clause of a switch statement.
#[derive(Debug, Clone)]
pub struct JsSwitchCase {
    /// The case test expression, or `None` for the `default:` clause.
    pub test: Option<ExprId>,
    pub consequent: Vec<JsStatement>,
}

/// Catch clause.
#[derive(Debug, Clone)]
pub struct JsCatchClause {
    pub param: Option<JsPattern>,
    pub body: JsBlockStatement,
}

/// A JavaScript expression.
#[derive(Debug, Clone)]
pub enum JsExpr {
    /// Identifier
    Identifier(CompactString),
    /// Literal value
    Literal(JsLiteral),
    /// Template literal
    TemplateLiteral(JsTemplateLiteral),
    /// Tagged template expression
    TaggedTemplate(JsTaggedTemplate),
    /// Array expression
    Array(JsArrayExpression),
    /// Object expression
    Object(JsObjectExpression),
    /// Function expression
    Function(JsFunctionExpression),
    /// Arrow function expression
    Arrow(JsArrowFunction),
    /// Call expression
    Call(JsCallExpression),
    /// New expression
    New(JsNewExpression),
    /// Member expression
    Member(JsMemberExpression),
    /// Binary expression
    Binary(JsBinaryExpression),
    /// Logical expression
    Logical(JsLogicalExpression),
    /// Unary expression
    Unary(JsUnaryExpression),
    /// Update expression (++, --)
    Update(JsUpdateExpression),
    /// Assignment expression
    Assignment(JsAssignmentExpression),
    /// Conditional expression (ternary)
    Conditional(JsConditionalExpression),
    /// Sequence expression (comma operator)
    Sequence(JsSequenceExpression),
    /// Spread element (...expr)
    Spread(ExprId),
    /// This expression
    This,
    /// `super` keyword (as a member/call base, e.g. `super.foo()` / `super()`).
    Super,
    /// Meta property `meta.property` (e.g. `import.meta`, `new.target`). Both
    /// parts are keyword/identifier tokens, so it is a terminal leaf.
    MetaProperty(CompactString, CompactString),
    /// Dynamic import call `import(source[, options])`. The source/options are
    /// held as already-converted sub-expressions and emitted lazily by codegen
    /// (replacing the old eager `generate_expr` + `Raw` stringification). Treated
    /// as a terminal in the analysis passes (await / transform / reactive-ref
    /// collection), mirroring the opaque `Raw` it replaced, so the sub-expressions
    /// are not re-transformed after conversion.
    ImportExpression {
        source: ExprId,
        options: Option<ExprId>,
    },
    /// Await expression
    Await(ExprId),
    /// Yield expression
    Yield(JsYieldExpression),
    /// Class expression
    Class(JsClassExpression),
    /// Chain expression (optional chaining)
    Chain(JsChainExpression),
    /// Void expression
    Void(ExprId),
    /// Raw JavaScript code (as a string)
    Raw(CompactString),
    /// Expression with source span (start, end byte offsets in original source).
    /// Used for source map generation. The codegen emits the inner expression
    /// and records start/end mappings.
    Spanned(ExprId, u32, u32),
}

/// Literal value.
#[derive(Debug, Clone)]
pub enum JsLiteral {
    String(CompactString),
    Number(f64),
    /// BigInt literal, stored as its raw source text including the trailing `n`
    /// (e.g. `123n`, `0x1fn`) so the exact representation is preserved.
    BigInt(CompactString),
    Boolean(bool),
    Null,
    Undefined,
    Regex {
        pattern: CompactString,
        flags: CompactString,
    },
}

/// Template literal.
#[derive(Debug, Clone)]
pub struct JsTemplateLiteral {
    pub quasis: Vec<JsTemplateElement>,
    pub expressions: Vec<JsExpr>,
}

/// Tagged template expression.
/// Example: css`color: red;`
#[derive(Debug, Clone)]
pub struct JsTaggedTemplate {
    pub tag: ExprId,
    pub quasi: JsTemplateLiteral,
}

/// Template literal element.
#[derive(Debug, Clone)]
pub struct JsTemplateElement {
    pub raw: CompactString,
    pub cooked: CompactString,
    pub tail: bool,
}

/// Array expression.
#[derive(Debug, Clone)]
pub struct JsArrayExpression {
    pub elements: Vec<Option<JsExpr>>,
}

/// Object expression.
#[derive(Debug, Clone)]
pub struct JsObjectExpression {
    pub properties: Vec<JsObjectMember>,
}

/// Object member (property or spread).
#[derive(Debug, Clone)]
pub enum JsObjectMember {
    Property(JsProperty),
    SpreadElement(ExprId),
}

/// Object property.
#[derive(Debug, Clone)]
pub struct JsProperty {
    pub key: JsPropertyKey,
    pub value: ExprId,
    pub kind: JsPropertyKind,
    pub computed: bool,
    pub shorthand: bool,
    /// When true and value is a function expression, emit as method shorthand:
    /// `name(params) { body }` instead of `name: function(params) { body }`.
    pub method: bool,
}

/// Property key.
#[derive(Debug, Clone)]
pub enum JsPropertyKey {
    Identifier(CompactString),
    Literal(JsLiteral),
    Computed(ExprId),
}

/// Property kind.
#[derive(Debug, Clone, Copy)]
pub enum JsPropertyKind {
    Init,
    Get,
    Set,
}

/// Function expression.
#[derive(Debug, Clone)]
pub struct JsFunctionExpression {
    pub id: Option<CompactString>,
    pub params: SmallVec<[JsPattern; 3]>,
    pub body: JsBlockStatement,
    pub is_async: bool,
    pub is_generator: bool,
}

/// Arrow function expression.
#[derive(Debug, Clone)]
pub struct JsArrowFunction {
    pub params: SmallVec<[JsPattern; 3]>,
    pub body: JsArrowBody,
    pub is_async: bool,
}

/// Arrow function body.
#[derive(Debug, Clone)]
pub enum JsArrowBody {
    Expression(ExprId),
    Block(JsBlockStatement),
}

/// Call expression.
#[derive(Debug, Clone)]
pub struct JsCallExpression {
    pub callee: ExprId,
    pub arguments: Vec<JsExpr>,
    pub optional: bool,
}

/// New expression.
#[derive(Debug, Clone)]
pub struct JsNewExpression {
    pub callee: ExprId,
    pub arguments: Vec<JsExpr>,
}

/// Member expression.
#[derive(Debug, Clone)]
pub struct JsMemberExpression {
    pub object: ExprId,
    pub property: JsMemberProperty,
    pub computed: bool,
    pub optional: bool,
}

/// Member expression property.
#[derive(Debug, Clone)]
pub enum JsMemberProperty {
    Identifier(CompactString),
    Expression(ExprId),
    PrivateIdentifier(CompactString),
}

/// Binary expression.
#[derive(Debug, Clone)]
pub struct JsBinaryExpression {
    pub operator: JsBinaryOp,
    pub left: ExprId,
    pub right: ExprId,
}

/// Binary operator.
#[derive(Debug, Clone, Copy)]
pub enum JsBinaryOp {
    // Arithmetic
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    Pow,
    // Comparison
    Eq,
    Ne,
    StrictEq,
    StrictNe,
    Lt,
    Le,
    Gt,
    Ge,
    // Bitwise
    BitAnd,
    BitOr,
    BitXor,
    Shl,
    Shr,
    UShr,
    // Other
    In,
    InstanceOf,
}

impl JsBinaryOp {
    #[inline]
    pub fn as_str(&self) -> &'static str {
        match self {
            JsBinaryOp::Add => "+",
            JsBinaryOp::Sub => "-",
            JsBinaryOp::Mul => "*",
            JsBinaryOp::Div => "/",
            JsBinaryOp::Mod => "%",
            JsBinaryOp::Pow => "**",
            JsBinaryOp::Eq => "==",
            JsBinaryOp::Ne => "!=",
            JsBinaryOp::StrictEq => "===",
            JsBinaryOp::StrictNe => "!==",
            JsBinaryOp::Lt => "<",
            JsBinaryOp::Le => "<=",
            JsBinaryOp::Gt => ">",
            JsBinaryOp::Ge => ">=",
            JsBinaryOp::BitAnd => "&",
            JsBinaryOp::BitOr => "|",
            JsBinaryOp::BitXor => "^",
            JsBinaryOp::Shl => "<<",
            JsBinaryOp::Shr => ">>",
            JsBinaryOp::UShr => ">>>",
            JsBinaryOp::In => "in",
            JsBinaryOp::InstanceOf => "instanceof",
        }
    }
}

impl fmt::Display for JsBinaryOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Logical expression.
#[derive(Debug, Clone)]
pub struct JsLogicalExpression {
    pub operator: JsLogicalOp,
    pub left: ExprId,
    pub right: ExprId,
}

/// Logical operator.
#[derive(Debug, Clone, Copy)]
pub enum JsLogicalOp {
    And,
    Or,
    NullishCoalescing,
}

impl JsLogicalOp {
    #[inline]
    pub fn as_str(&self) -> &'static str {
        match self {
            JsLogicalOp::And => "&&",
            JsLogicalOp::Or => "||",
            JsLogicalOp::NullishCoalescing => "??",
        }
    }
}

impl fmt::Display for JsLogicalOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Unary expression.
#[derive(Debug, Clone)]
pub struct JsUnaryExpression {
    pub operator: JsUnaryOp,
    pub argument: ExprId,
    pub prefix: bool,
}

/// Unary operator.
#[derive(Debug, Clone, Copy)]
pub enum JsUnaryOp {
    Minus,
    Plus,
    Not,
    BitNot,
    TypeOf,
    Void,
    Delete,
}

impl JsUnaryOp {
    #[inline]
    pub fn as_str(&self) -> &'static str {
        match self {
            JsUnaryOp::Minus => "-",
            JsUnaryOp::Plus => "+",
            JsUnaryOp::Not => "!",
            JsUnaryOp::BitNot => "~",
            JsUnaryOp::TypeOf => "typeof",
            JsUnaryOp::Void => "void",
            JsUnaryOp::Delete => "delete",
        }
    }
}

impl fmt::Display for JsUnaryOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Update expression.
#[derive(Debug, Clone)]
pub struct JsUpdateExpression {
    pub operator: JsUpdateOp,
    pub argument: ExprId,
    pub prefix: bool,
}

/// Update operator.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum JsUpdateOp {
    Increment,
    Decrement,
}

impl JsUpdateOp {
    #[inline]
    pub fn as_str(&self) -> &'static str {
        match self {
            JsUpdateOp::Increment => "++",
            JsUpdateOp::Decrement => "--",
        }
    }
}

impl fmt::Display for JsUpdateOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Assignment expression.
#[derive(Debug, Clone)]
pub struct JsAssignmentExpression {
    pub operator: JsAssignmentOp,
    pub left: ExprId,
    pub right: ExprId,
}

/// Assignment operator.
#[derive(Debug, Clone, Copy)]
pub enum JsAssignmentOp {
    Assign,
    AddAssign,
    SubAssign,
    MulAssign,
    DivAssign,
    ModAssign,
    PowAssign,
    ShlAssign,
    ShrAssign,
    UShrAssign,
    BitAndAssign,
    BitOrAssign,
    BitXorAssign,
    AndAssign,
    OrAssign,
    NullishAssign,
}

impl JsAssignmentOp {
    #[inline]
    pub fn as_str(&self) -> &'static str {
        match self {
            JsAssignmentOp::Assign => "=",
            JsAssignmentOp::AddAssign => "+=",
            JsAssignmentOp::SubAssign => "-=",
            JsAssignmentOp::MulAssign => "*=",
            JsAssignmentOp::DivAssign => "/=",
            JsAssignmentOp::ModAssign => "%=",
            JsAssignmentOp::PowAssign => "**=",
            JsAssignmentOp::ShlAssign => "<<=",
            JsAssignmentOp::ShrAssign => ">>=",
            JsAssignmentOp::UShrAssign => ">>>=",
            JsAssignmentOp::BitAndAssign => "&=",
            JsAssignmentOp::BitOrAssign => "|=",
            JsAssignmentOp::BitXorAssign => "^=",
            JsAssignmentOp::AndAssign => "&&=",
            JsAssignmentOp::OrAssign => "||=",
            JsAssignmentOp::NullishAssign => "??=",
        }
    }
}

impl fmt::Display for JsAssignmentOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Conditional expression (ternary).
#[derive(Debug, Clone)]
pub struct JsConditionalExpression {
    pub test: ExprId,
    pub consequent: ExprId,
    pub alternate: ExprId,
}

/// Sequence expression.
#[derive(Debug, Clone)]
pub struct JsSequenceExpression {
    pub expressions: Vec<JsExpr>,
}

/// Yield expression.
#[derive(Debug, Clone)]
pub struct JsYieldExpression {
    pub argument: Option<ExprId>,
    pub delegate: bool,
}

/// Class expression.
#[derive(Debug, Clone)]
pub struct JsClassExpression {
    pub id: Option<CompactString>,
    pub super_class: Option<ExprId>,
    pub body: JsClassBody,
}

/// Class body.
#[derive(Debug, Clone)]
pub struct JsClassBody {
    pub body: Vec<JsClassMember>,
}

/// Class member.
#[derive(Debug, Clone)]
pub enum JsClassMember {
    Method(JsMethodDefinition),
    Property(JsPropertyDefinition),
    StaticBlock(JsBlockStatement),
}

/// Method definition.
#[derive(Debug, Clone)]
pub struct JsMethodDefinition {
    pub key: JsPropertyKey,
    pub value: JsFunctionExpression,
    pub kind: JsMethodKind,
    pub computed: bool,
    pub is_static: bool,
}

/// Method kind.
#[derive(Debug, Clone, Copy)]
pub enum JsMethodKind {
    Constructor,
    Method,
    Get,
    Set,
}

/// Property definition.
#[derive(Debug, Clone)]
pub struct JsPropertyDefinition {
    pub key: JsPropertyKey,
    pub value: Option<ExprId>,
    pub computed: bool,
    pub is_static: bool,
}

/// Chain expression (optional chaining).
#[derive(Debug, Clone)]
pub struct JsChainExpression {
    pub expression: ExprId,
}

/// Pattern (for destructuring and function params).
#[derive(Debug, Clone)]
pub enum JsPattern {
    /// Simple identifier
    Identifier(CompactString),
    /// Array destructuring
    Array(JsArrayPattern),
    /// Object destructuring
    Object(JsObjectPattern),
    /// Rest element
    Rest(Box<JsPattern>),
    /// Assignment pattern (default value)
    Assignment(JsAssignmentPattern),
}

/// Array pattern.
#[derive(Debug, Clone)]
pub struct JsArrayPattern {
    pub elements: Vec<Option<JsPattern>>,
}

/// Object pattern.
#[derive(Debug, Clone)]
pub struct JsObjectPattern {
    pub properties: Vec<JsObjectPatternProperty>,
}

/// Object pattern property.
#[derive(Debug, Clone)]
pub enum JsObjectPatternProperty {
    Property {
        key: JsPropertyKey,
        value: JsPattern,
        computed: bool,
        shorthand: bool,
    },
    Rest(Box<JsPattern>),
}

/// Assignment pattern (default value).
#[derive(Debug, Clone)]
pub struct JsAssignmentPattern {
    pub left: Box<JsPattern>,
    pub right: ExprId,
}
