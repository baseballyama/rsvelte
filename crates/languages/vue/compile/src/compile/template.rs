//! compiler-core for the templates the parser reads, building an oxc tree instead of text.
//!
//! It reads the template's HIR ([`rsvelte_vue_semantic::compiler_syntax_tree`]), which is
//! `baseParse`'s tree. What is ported: the node transforms of `getBaseTransformPreset` in upstream
//! order, `cacheStatic`, `createRootCodegen` and `generate`.
//!
//! The port keeps upstream's two mutable trees, the template nodes and their codegen nodes, as two
//! arenas, because the algorithm rewrites both in place (`replaceNode`, `convertToBlock`,
//! `injectProperty`, caching, hoisting). It also keeps the helper registry as upstream's counted,
//! insertion-ordered map: which helpers the import names, and in which order, falls out of exactly
//! when each transform adds and removes one.

use oxc_ast::ast::Expression;
use oxc_semantic::ReferenceId;
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::index::IndexVector;
use rsvelte_kernel::newtype_index;
use rsvelte_typescript_tree::{ExpressionIdentifier, ParametersIdentifier, Tree};
use rsvelte_vue_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, NodeKind, PropertyIdentifier, PropertyKind, TagType,
};
use rsvelte_vue_semantic::resolve::{BindingType, Resolution};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};

use super::R;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum Helper {
    Fragment,
    OpenBlock,
    CreateElementBlock,
    CreateElementVNode,
    CreateComment,
    CreateText,
    ToDisplayString,
    RenderList,
    Unref,
    WithDirectives,
    VModelText,
    VModelCheckbox,
    VModelRadio,
    VModelSelect,
    NormalizeProps,
    GuardReactiveProps,
    MergeProps,
    WithModifiers,
    WithKeys,
}

impl Helper {
    /// The name `vue` exports it under (`helperNameMap`).
    #[must_use]
    pub(crate) const fn name(self) -> &'static str {
        match self {
            Self::Fragment => "Fragment",
            Self::OpenBlock => "openBlock",
            Self::CreateElementBlock => "createElementBlock",
            Self::CreateElementVNode => "createElementVNode",
            Self::CreateComment => "createCommentVNode",
            Self::CreateText => "createTextVNode",
            Self::ToDisplayString => "toDisplayString",
            Self::RenderList => "renderList",
            Self::Unref => "unref",
            Self::WithDirectives => "withDirectives",
            Self::VModelText => "vModelText",
            Self::VModelCheckbox => "vModelCheckbox",
            Self::VModelRadio => "vModelRadio",
            Self::VModelSelect => "vModelSelect",
            Self::NormalizeProps => "normalizeProps",
            Self::GuardReactiveProps => "guardReactiveProps",
            Self::MergeProps => "mergeProps",
            Self::WithModifiers => "withModifiers",
            Self::WithKeys => "withKeys",
        }
    }
}

/// `@vue/shared` `PatchFlags`.
mod patch {
    pub(super) const TEXT: i32 = 1;
    pub(super) const PROPS: i32 = 8;
    pub(super) const FULL_PROPS: i32 = 16;
    pub(super) const NEED_HYDRATION: i32 = 32;
    pub(super) const STABLE_FRAGMENT: i32 = 64;
    pub(super) const KEYED_FRAGMENT: i32 = 128;
    pub(super) const UNKEYED_FRAGMENT: i32 = 256;
    pub(super) const NEED_PATCH: i32 = 512;
    pub(super) const CACHED: i32 = -1;
}

/// `ConstantTypes`.
const NOT_CONSTANT: u8 = 0;
const CAN_SKIP_PATCH: u8 = 1;
const CAN_CACHE: u8 = 2;
const CAN_STRINGIFY: u8 = 3;

newtype_index!(
    /// A template node in [`Transform::tree`].
    struct TransformNodeIdentifier;
);
newtype_index!(
    /// A codegen node in [`Transform::codegen`].
    struct CodegenIdentifier;
);

/// A template expression after `processExpression`.
#[derive(Clone, Copy, Debug)]
struct Exp {
    node: ExpressionIdentifier,
    /// For a compound expression, the lowest of its identifiers' (what `getConstantType` reads).
    const_type: u8,
    /// Upstream returns a `COMPOUND_EXPRESSION` (a non-trivial expression naming an identifier),
    /// which `getGeneratedPropsConstantType` never treats as constant.
    compound: bool,
    /// An inline `v-on` statement: `$event` is a local name in it.
    event_local: bool,
}

#[derive(Debug)]
enum Property {
    Static {
        name: String,
        /// `None` for a bare attribute.
        value: Option<String>,
        identifier: PropertyIdentifier,
    },
    Dir {
        name: DirectiveName,
        arg: String,
        /// `None` only for `v-else`: [`Transform::parse_props`] refuses another directive
        /// without a value.
        raw: Option<ExpressionIdentifier>,
        exp: Option<Exp>,
        identifier: PropertyIdentifier,
    },
}

#[derive(Debug)]
enum Node {
    Root(Vec<TransformNodeIdentifier>),
    Element {
        tag: String,
        props: Vec<Property>,
        children: Vec<TransformNodeIdentifier>,
        codegen: Option<CodegenIdentifier>,
    },
    Text(String),
    Interpolation(Exp),
    /// Adjacent text and interpolations, merged by `transformText`.
    Compound(Vec<TransformNodeIdentifier>),
    If {
        branches: Vec<TransformNodeIdentifier>,
        codegen: Option<CodegenIdentifier>,
    },
    Branch {
        condition: Option<Exp>,
        children: Vec<TransformNodeIdentifier>,
    },
    For {
        source: Exp,
        parameters: ParametersIdentifier,
        children: Vec<TransformNodeIdentifier>,
        codegen: Option<CodegenIdentifier>,
    },
    TextCall {
        content: TransformNodeIdentifier,
        codegen: CodegenIdentifier,
    },
}

#[derive(Debug, Clone)]
enum VChildren {
    /// The only child, a text, interpolation or compound, passed as is.
    Node(TransformNodeIdentifier),
    List(Vec<TransformNodeIdentifier>),
    Codegen(CodegenIdentifier),
}

#[derive(Debug, Clone)]
enum Lit {
    String(String),
    Number(f64),
    Boolean(bool),
    /// `void 0`.
    Undefined,
}

#[derive(Debug, Clone)]
enum Codegen {
    VNode {
        /// `None`: `Fragment`.
        tag: Option<String>,
        props: Option<CodegenIdentifier>,
        children: Option<VChildren>,
        patch_flag: Option<i32>,
        dynamic_props: Option<CodegenIdentifier>,
        /// `withDirectives`' list: the element's runtime directives.
        directives: Option<CodegenIdentifier>,
        is_block: bool,
        disable_tracking: bool,
        /// `needsPatch`: a `v-for` that turns it from a block into a plain vnode adds
        /// `NEED_PATCH`.
        needs_patch: bool,
    },
    Call {
        callee: Helper,
        arguments: Vec<CodegenIdentifier>,
    },
    /// Keys are static.
    Object(Vec<(String, CodegenIdentifier)>),
    Array(Vec<CodegenIdentifier>),
    /// A helper's local name, as a value (a runtime directive).
    Helper(Helper),
    NodeArray(Vec<TransformNodeIdentifier>),
    /// `stringifyDynamicPropertyNames`.
    PropertyNames(Vec<String>),
    /// A simple expression the compiler wrote.
    Lit {
        lit: Lit,
        const_type: u8,
    },
    Exp(Exp),
    /// `$event => (exp)` for an inline statement; `(...arguments) => (exp && exp(...arguments))`
    /// for a cached member expression.
    Handler {
        exp: Exp,
        inline: bool,
    },
    /// `v-model`'s `$event => ((x).value = $event)` for a ref `x` as written, or
    /// `$event => ((exp) = $event)` for a member expression after `processExpression`.
    ModelUpdate {
        target: Exp,
        is_ref: bool,
    },
    Function {
        parameters: ParametersIdentifier,
        returns: CodegenIdentifier,
    },
    Conditional {
        test: Exp,
        consequent: CodegenIdentifier,
        alternate: CodegenIdentifier,
    },
    Cache {
        index: usize,
        value: CodegenIdentifier,
        /// `needArraySpread`: `[...(_cache[i] || …)]`.
        spread: bool,
    },
    Hoisted(usize),
    /// A template node, generated through `genNode`.
    Node(TransformNodeIdentifier),
}

#[derive(Clone, Copy, Debug)]
struct RefInfo {
    /// Declared inside the template (a `v-for` alias, a nested function's parameter).
    local: bool,
    write: bool,
}

fn ref_info(res: &Resolution, reference: ReferenceId) -> RefInfo {
    let r = res.scoping().get_reference(reference);
    let symbol = r.symbol_id();
    RefInfo {
        local: symbol.is_some_and(|s| res.scoping().symbol_scope_id(s) != res.root_scope()),
        write: r.is_write(),
    }
}

/// A compiled template, ready for [`Compiled::generate`].
#[derive(Debug)]
pub(crate) struct Compiled {
    tree: IndexVector<TransformNodeIdentifier, Node>,
    codegen: IndexVector<CodegenIdentifier, Codegen>,
    root_codegen: Option<CodegenIdentifier>,
    pub helpers: Vec<Helper>,
    hoists: Vec<CodegenIdentifier>,
}

struct Transform<'a> {
    javascript: &'a Tree,
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    /// The render function is `setup`'s closure and reads bindings directly.
    inline: bool,
    tree: IndexVector<TransformNodeIdentifier, Node>,
    codegen: IndexVector<CodegenIdentifier, Codegen>,
    helpers: Vec<(Helper, u32)>,
    hoists: Vec<CodegenIdentifier>,
    cached: usize,
    /// `context.scopes.vFor`: the `v-for`s being traversed.
    v_for: u32,
}

/// # Errors
///
/// [`Unsupported`] for a template construct the port does not cover.
pub(crate) fn transform(
    javascript: &Tree,
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    res: &Resolution,
    inline: bool,
) -> R<Compiled> {
    let mut t = Transform {
        javascript,
        compiler_syntax_tree,
        source_text,
        res,
        inline,
        tree: IndexVector::new(),
        codegen: IndexVector::new(),
        helpers: Vec::new(),
        hoists: Vec::new(),
        cached: 0,
        v_for: 0,
    };
    let children = t.parse_children(compiler_syntax_tree.root())?;
    let root = t.push(Node::Root(children));
    t.traverse(root, None)?;
    let single = t.single_element_root(root);
    t.walk_static(root, single);
    let root_codegen = t.root_codegen(root);
    Ok(Compiled {
        root_codegen,
        helpers: t.helpers.iter().map(|&(h, _)| h).collect(),
        hoists: t.hoists,
        tree: t.tree,
        codegen: t.codegen,
    })
}

impl Transform<'_> {
    fn push(&mut self, n: Node) -> TransformNodeIdentifier {
        self.tree.push(n)
    }

    fn push_codegen(&mut self, c: Codegen) -> CodegenIdentifier {
        self.codegen.push(c)
    }

    fn helper(&mut self, h: Helper) {
        if let Some(e) = self.helpers.iter_mut().find(|e| e.0 == h) {
            e.1 += 1;
        } else {
            self.helpers.push((h, 1));
        }
    }

    fn remove_helper(&mut self, h: Helper) {
        if let Some(i) = self.helpers.iter().position(|e| e.0 == h) {
            if self.helpers[i].1 <= 1 {
                self.helpers.remove(i);
            } else {
                self.helpers[i].1 -= 1;
            }
        }
    }

    fn children_of(&self, n: TransformNodeIdentifier) -> &[TransformNodeIdentifier] {
        match &self.tree[n] {
            Node::Root(children)
            | Node::Element { children, .. }
            | Node::Branch { children, .. }
            | Node::For { children, .. } => children,
            _ => &[],
        }
    }

    fn children_mut(&mut self, n: TransformNodeIdentifier) -> &mut Vec<TransformNodeIdentifier> {
        match &mut self.tree[n] {
            Node::Root(children)
            | Node::Element { children, .. }
            | Node::Branch { children, .. }
            | Node::For { children, .. } => children,
            _ => unreachable!("only a container has children"),
        }
    }

    fn codegen_of(&self, n: TransformNodeIdentifier) -> Option<CodegenIdentifier> {
        match &self.tree[n] {
            Node::Element { codegen, .. }
            | Node::If { codegen, .. }
            | Node::For { codegen, .. } => *codegen,
            Node::TextCall { codegen, .. } => Some(*codegen),
            _ => None,
        }
    }

    fn lit(&mut self, lit: Lit, const_type: u8) -> CodegenIdentifier {
        self.push_codegen(Codegen::Lit { lit, const_type })
    }
}

enum PropertyView {
    Static(String, String, PropertyIdentifier),
    Dir(
        DirectiveName,
        String,
        Option<ExpressionIdentifier>,
        Option<Exp>,
        PropertyIdentifier,
    ),
}

impl PropertyView {
    const fn identifier(&self) -> PropertyIdentifier {
        match self {
            Self::Static(.., identifier) | Self::Dir(.., identifier) => *identifier,
        }
    }
}

struct VNodeArgs {
    tag: Option<String>,
    props: Option<CodegenIdentifier>,
    children: Option<VChildren>,
    patch_flag: Option<i32>,
    dynamic_props: Option<CodegenIdentifier>,
    directives: Option<CodegenIdentifier>,
    is_block: bool,
    disable_tracking: bool,
    needs_patch: bool,
}

enum Exit {
    Element(TransformNodeIdentifier),
    Text(TransformNodeIdentifier),
    If {
        if_node: TransformNodeIdentifier,
        branch: TransformNodeIdentifier,
        key: usize,
    },
    For(TransformNodeIdentifier),
}

mod events;
use events::{is_keyboard_event, is_on, is_reserved, resolve_modifiers};

mod rewrite;
use rewrite::ExpRewrite;

mod branches;
mod directives;
mod elements;
mod expressions;
mod hoist;
mod loops;
mod traverse;

mod generate;
use generate::is_object_bind;
use rsvelte_vue_semantic::expressions::{
    Parent, camelize, can_prefix, collect_identifiers, is_simple_identifier, to_handler_key,
};
