//! JavaScript AST node types.
//!
//! These types represent JavaScript/ESTree AST nodes that can be
//! serialized to JavaScript source code.

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
    Throw(Box<JsExpr>),
    /// Try statement
    Try(JsTryStatement),
    /// Raw JavaScript code (as a statement, output verbatim)
    Raw(CompactString),
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
    Expression(Box<JsExpr>),
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

impl fmt::Display for JsVariableKind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JsVariableKind::Var => write!(f, "var"),
            JsVariableKind::Let => write!(f, "let"),
            JsVariableKind::Const => write!(f, "const"),
        }
    }
}

/// Variable declarator (name = init).
#[derive(Debug, Clone)]
pub struct JsVariableDeclarator {
    pub id: JsPattern,
    pub init: Option<Box<JsExpr>>,
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
    pub expression: Box<JsExpr>,
}

/// Return statement.
#[derive(Debug, Clone)]
pub struct JsReturnStatement {
    pub argument: Option<Box<JsExpr>>,
}

/// If statement.
#[derive(Debug, Clone)]
pub struct JsIfStatement {
    pub test: Box<JsExpr>,
    pub consequent: Box<JsStatement>,
    pub alternate: Option<Box<JsStatement>>,
}

/// For statement.
#[derive(Debug, Clone)]
pub struct JsForStatement {
    pub init: Option<JsForInit>,
    pub test: Option<Box<JsExpr>>,
    pub update: Option<Box<JsExpr>>,
    pub body: Box<JsStatement>,
}

/// For loop initializer.
#[derive(Debug, Clone)]
pub enum JsForInit {
    Variable(JsVariableDeclaration),
    Expression(Box<JsExpr>),
}

/// For-of statement.
#[derive(Debug, Clone)]
pub struct JsForOfStatement {
    pub left: JsForOfLeft,
    pub right: Box<JsExpr>,
    pub body: Box<JsStatement>,
    pub is_await: bool,
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
    pub test: Box<JsExpr>,
    pub body: Box<JsStatement>,
}

/// Do-while statement.
#[derive(Debug, Clone)]
pub struct JsDoWhileStatement {
    pub test: Box<JsExpr>,
    pub body: Box<JsStatement>,
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
    pub body: Box<JsStatement>,
}

/// Try statement.
#[derive(Debug, Clone)]
pub struct JsTryStatement {
    pub block: JsBlockStatement,
    pub handler: Option<JsCatchClause>,
    pub finalizer: Option<JsBlockStatement>,
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
    Spread(Box<JsExpr>),
    /// This expression
    This,
    /// Await expression
    Await(Box<JsExpr>),
    /// Yield expression
    Yield(JsYieldExpression),
    /// Class expression
    Class(JsClassExpression),
    /// Chain expression (optional chaining)
    Chain(JsChainExpression),
    /// Void expression
    Void(Box<JsExpr>),
    /// Raw JavaScript code (as a string)
    Raw(CompactString),
}

/// Literal value.
#[derive(Debug, Clone)]
pub enum JsLiteral {
    String(CompactString),
    Number(f64),
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
    pub tag: Box<JsExpr>,
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
    SpreadElement(Box<JsExpr>),
}

/// Object property.
#[derive(Debug, Clone)]
pub struct JsProperty {
    pub key: JsPropertyKey,
    pub value: Box<JsExpr>,
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
    Computed(Box<JsExpr>),
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
    Expression(Box<JsExpr>),
    Block(JsBlockStatement),
}

/// Call expression.
#[derive(Debug, Clone)]
pub struct JsCallExpression {
    pub callee: Box<JsExpr>,
    pub arguments: Vec<JsExpr>,
    pub optional: bool,
}

/// New expression.
#[derive(Debug, Clone)]
pub struct JsNewExpression {
    pub callee: Box<JsExpr>,
    pub arguments: Vec<JsExpr>,
}

/// Member expression.
#[derive(Debug, Clone)]
pub struct JsMemberExpression {
    pub object: Box<JsExpr>,
    pub property: JsMemberProperty,
    pub computed: bool,
    pub optional: bool,
}

/// Member expression property.
#[derive(Debug, Clone)]
pub enum JsMemberProperty {
    Identifier(CompactString),
    Expression(Box<JsExpr>),
    PrivateIdentifier(CompactString),
}

/// Binary expression.
#[derive(Debug, Clone)]
pub struct JsBinaryExpression {
    pub operator: JsBinaryOp,
    pub left: Box<JsExpr>,
    pub right: Box<JsExpr>,
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

impl fmt::Display for JsBinaryOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
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
        };
        write!(f, "{}", s)
    }
}

/// Logical expression.
#[derive(Debug, Clone)]
pub struct JsLogicalExpression {
    pub operator: JsLogicalOp,
    pub left: Box<JsExpr>,
    pub right: Box<JsExpr>,
}

/// Logical operator.
#[derive(Debug, Clone, Copy)]
pub enum JsLogicalOp {
    And,
    Or,
    NullishCoalescing,
}

impl fmt::Display for JsLogicalOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            JsLogicalOp::And => "&&",
            JsLogicalOp::Or => "||",
            JsLogicalOp::NullishCoalescing => "??",
        };
        write!(f, "{}", s)
    }
}

/// Unary expression.
#[derive(Debug, Clone)]
pub struct JsUnaryExpression {
    pub operator: JsUnaryOp,
    pub argument: Box<JsExpr>,
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

impl fmt::Display for JsUnaryOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            JsUnaryOp::Minus => "-",
            JsUnaryOp::Plus => "+",
            JsUnaryOp::Not => "!",
            JsUnaryOp::BitNot => "~",
            JsUnaryOp::TypeOf => "typeof",
            JsUnaryOp::Void => "void",
            JsUnaryOp::Delete => "delete",
        };
        write!(f, "{}", s)
    }
}

/// Update expression.
#[derive(Debug, Clone)]
pub struct JsUpdateExpression {
    pub operator: JsUpdateOp,
    pub argument: Box<JsExpr>,
    pub prefix: bool,
}

/// Update operator.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum JsUpdateOp {
    Increment,
    Decrement,
}

impl fmt::Display for JsUpdateOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            JsUpdateOp::Increment => "++",
            JsUpdateOp::Decrement => "--",
        };
        write!(f, "{}", s)
    }
}

/// Assignment expression.
#[derive(Debug, Clone)]
pub struct JsAssignmentExpression {
    pub operator: JsAssignmentOp,
    pub left: Box<JsExpr>,
    pub right: Box<JsExpr>,
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

impl fmt::Display for JsAssignmentOp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
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
        };
        write!(f, "{}", s)
    }
}

/// Conditional expression (ternary).
#[derive(Debug, Clone)]
pub struct JsConditionalExpression {
    pub test: Box<JsExpr>,
    pub consequent: Box<JsExpr>,
    pub alternate: Box<JsExpr>,
}

/// Sequence expression.
#[derive(Debug, Clone)]
pub struct JsSequenceExpression {
    pub expressions: Vec<JsExpr>,
}

/// Yield expression.
#[derive(Debug, Clone)]
pub struct JsYieldExpression {
    pub argument: Option<Box<JsExpr>>,
    pub delegate: bool,
}

/// Class expression.
#[derive(Debug, Clone)]
pub struct JsClassExpression {
    pub id: Option<CompactString>,
    pub super_class: Option<Box<JsExpr>>,
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
    pub value: Option<Box<JsExpr>>,
    pub computed: bool,
    pub is_static: bool,
}

/// Chain expression (optional chaining).
#[derive(Debug, Clone)]
pub struct JsChainExpression {
    pub expression: Box<JsExpr>,
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
    pub right: Box<JsExpr>,
}
