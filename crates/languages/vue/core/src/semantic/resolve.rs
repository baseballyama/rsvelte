//! Name resolution: one scope analysis over the script and the template, and the binding types
//! compileScript derives from the script.
//!
//! The template contributes [`HostRoot`]s: each expression is evaluated in the script's top-level
//! scope, and each `v-for` opens a [`HostScope`] declaring its aliases for the element it sits on.
//! Lint rules, compilation and the type-check projection all read this one resolution.

use rsvelte_kernel::source::interning::Atom;
use rsvelte_typescript::scope::{self, HostRoot, HostScope, Semantic};
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use crate::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, NodeKind, PropertyKind,
};
use crate::syntax_tree::{
    AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent, TemplateNode,
    TemplateNodeIdentifier,
};

/// compiler-core's `BindingTypes`, the ones `<script setup>` produces.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BindingType {
    /// A key of `defineProps`' runtime declaration.
    Props,
    SetupLet,
    SetupConst,
    SetupReactiveConst,
    SetupMaybeRef,
    SetupRef,
    LiteralConst,
}

#[derive(Debug)]
pub struct Resolution {
    pub sem: Semantic,
    /// compileScript's `bindingMetadata`: by name, as the template compiler looks names up.
    pub bindings: FxHashMap<Atom, BindingType>,
    /// The `defineProps(…)` call, if the script makes one.
    pub define_props: Option<DefineProps>,
    /// The template's scope roots, in document order (what [`scope::analyze`] was given).
    pub host: Vec<HostRoot>,
}

#[derive(Clone, Copy, Debug)]
pub struct DefineProps {
    pub call: NodeIdentifier,
    /// The runtime declaration (the call's argument).
    pub runtime: Option<NodeIdentifier>,
    /// The statement holding the call.
    pub statement: NodeIdentifier,
    /// `const props = defineProps(…)`: the declared name.
    pub declaration: Option<NodeIdentifier>,
}

impl Resolution {
    #[must_use]
    pub fn binding_type(&self, name: Atom) -> Option<BindingType> {
        self.bindings.get(&name).copied()
    }
}

/// `program` is the script's program (or an empty one); `compiler_syntax_tree` is the template,
/// `None` without one.
#[must_use]
pub fn resolve(
    javascript: &SyntaxTree,
    program: NodeIdentifier,
    compiler_syntax_tree: Option<&CompilerSyntaxTree>,
    source_text: &str,
) -> Resolution {
    resolve_with_module(javascript, program, None, compiler_syntax_tree, source_text)
}

#[must_use]
pub fn resolve_with_module(
    javascript: &SyntaxTree,
    program: NodeIdentifier,
    module: Option<NodeIdentifier>,
    compiler_syntax_tree: Option<&CompilerSyntaxTree>,
    source_text: &str,
) -> Resolution {
    let host = compiler_syntax_tree.map_or_else(Vec::new, template_roots);
    let sem = scope::analyze_enclosed(javascript, module, program, &host);
    let (bindings, define_props) = binding_metadata(javascript, source_text, program);
    Resolution {
        sem,
        bindings,
        define_props,
        host,
    }
}

/// The template's scope roots, in document order.
#[must_use]
pub fn template_roots(compiler_syntax_tree: &CompilerSyntaxTree) -> Vec<HostRoot> {
    let mut out = Vec::new();
    for &n in compiler_syntax_tree.root() {
        node_roots(compiler_syntax_tree, n, &mut out);
    }
    out
}

fn node_roots(
    compiler_syntax_tree: &CompilerSyntaxTree,
    n: CompilerNodeIdentifier,
    out: &mut Vec<HostRoot>,
) {
    match &compiler_syntax_tree.node(n).kind {
        NodeKind::Text(_) | NodeKind::Comment { .. } => {}
        NodeKind::Interpolation { expression } => out.push(HostRoot::Expression(*expression)),
        NodeKind::Element(el) => {
            let mut inner = Vec::new();
            let mut for_exp = None;
            for p in compiler_syntax_tree.props(el.props) {
                if let PropertyKind::Directive(d) = &p.kind {
                    match &d.exp {
                        DirectiveExpression::None => {}
                        DirectiveExpression::Expression(e) => inner.push(HostRoot::Expression(*e)),
                        DirectiveExpression::For(f) => for_exp = Some(f),
                    }
                }
            }
            for &k in compiler_syntax_tree.children(el.children) {
                node_roots(compiler_syntax_tree, k, &mut inner);
            }
            match for_exp {
                // vue-eslint-parser: the aliases are visible on the whole element.
                Some(f) => {
                    out.push(HostRoot::Expression(f.source));
                    out.push(HostRoot::Scope(HostScope {
                        node: f.parameters.first().copied(),
                        parameters: f.parameters.clone(),
                        body: inner,
                    }));
                }
                None => out.extend(inner),
            }
        }
    }
}

const DEFINE_MACROS: &[&str] = &["defineProps", "defineEmits", "withDefaults", "defineSlots"];
const REF_CALLS: &[&str] = &[
    "ref",
    "computed",
    "shallowRef",
    "customRef",
    "toRef",
    "useTemplateRef",
];

/// compileScript's binding metadata for a `<script setup>` program: the user's imports, then the
/// setup bindings (`walkDeclaration`), with `defineProps`' keys as `props` where nothing else
/// claims the name.
fn binding_metadata(
    syntax_tree: &SyntaxTree,
    source_text: &str,
    program: NodeIdentifier,
) -> (FxHashMap<Atom, BindingType>, Option<DefineProps>) {
    let Kind::Program(body) = syntax_tree.kind(program) else {
        unreachable!("a script parses to a program")
    };
    let (vue_aliases, imports) = user_imports(syntax_tree, source_text, body);
    let mut setup: Vec<(Atom, BindingType)> = Vec::new();
    let mut define_props = None;
    for &statement in body {
        match syntax_tree.kind(statement) {
            Kind::ExpressionStatement(e) if is_define_props(syntax_tree, e) => {
                define_props = Some(DefineProps {
                    call: e,
                    runtime: first_arg(syntax_tree, e),
                    statement,
                    declaration: None,
                });
            }
            Kind::VariableDeclaration { kind, declarations } => {
                for &d in declarations {
                    if let Kind::Declarator {
                        identifier,
                        initializer: Some(i),
                    } = syntax_tree.kind(d)
                        && is_define_props(syntax_tree, i)
                    {
                        define_props = Some(DefineProps {
                            call: i,
                            runtime: first_arg(syntax_tree, i),
                            statement,
                            declaration: Some(identifier),
                        });
                    }
                }
                walk_declaration(
                    syntax_tree,
                    kind == flag::CONST,
                    declarations,
                    &vue_aliases,
                    &mut setup,
                );
            }
            Kind::Function {
                name: Some(n),
                declaration: true,
                ..
            } => setup.extend(syntax_tree.atom(n).map(|a| (a, BindingType::SetupConst))),
            _ => {}
        }
    }
    let prop_keys = define_props
        .and_then(|d| d.runtime)
        .map_or_else(Vec::new, |r| object_keys(syntax_tree, source_text, r));
    // compileScript fills `bindingMetadata` in this order; a later entry overwrites.
    let mut out = FxHashMap::default();
    for k in prop_keys {
        out.entry(k).or_insert(BindingType::Props);
    }
    for (k, t) in imports.into_iter().chain(setup) {
        out.insert(k, t);
    }
    (out, define_props)
}

/// The script's value imports: the local names of what it imports from `vue` (by imported name),
/// and each import's binding type.
fn user_imports<'a>(
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    body: &[NodeIdentifier],
) -> (FxHashMap<&'a str, &'a str>, Vec<(Atom, BindingType)>) {
    let mut vue_aliases = FxHashMap::default();
    let mut imports = Vec::new();
    for &statement in body {
        let Kind::Import {
            specifiers,
            source,
            type_only: false,
            ..
        } = syntax_tree.kind(statement)
        else {
            continue;
        };
        let from = syntax_tree.str_value(source, source_text);
        for &sp in specifiers {
            let (local, imported) = match syntax_tree.kind(sp) {
                Kind::ImportDefault(l) => (l, "default"),
                Kind::ImportNamespace(l) => (l, "*"),
                Kind::ImportNamed { imported, local } => (local, syntax_tree.name(imported)),
                _ => continue,
            };
            if from == "vue" {
                vue_aliases.insert(imported, syntax_tree.name(local));
            }
            #[expect(
                clippy::case_sensitive_file_extension_comparisons,
                reason = "compileScript's `endsWith('.vue')` is case-sensitive"
            )]
            let from_sfc = from.ends_with(".vue");
            let t = if imported == "*" || (imported == "default" && from_sfc) || from == "vue" {
                BindingType::SetupConst
            } else {
                BindingType::SetupMaybeRef
            };
            imports.extend(syntax_tree.atom(local).map(|a| (a, t)));
        }
    }
    (vue_aliases, imports)
}

/// compiler-sfc `walkDeclaration` for one variable declaration. Destructured declarators are not
/// classified yet.
fn walk_declaration(
    syntax_tree: &SyntaxTree,
    is_const: bool,
    declarations: &[NodeIdentifier],
    vue_aliases: &FxHashMap<&str, &str>,
    out: &mut Vec<(Atom, BindingType)>,
) {
    let alias = |name: &str| vue_aliases.get(name).copied();
    let reactive = alias("reactive");
    let all_literal = is_const
        && declarations.iter().all(|&d| match syntax_tree.kind(d) {
            Kind::Declarator {
                identifier,
                initializer,
            } => {
                matches!(syntax_tree.kind(identifier), Kind::Identifier(_))
                    && initializer.is_some_and(|i| is_static(syntax_tree, i))
            }
            _ => false,
        });
    for &d in declarations {
        let Kind::Declarator {
            identifier,
            initializer,
        } = syntax_tree.kind(d)
        else {
            continue;
        };
        let Some(name) = syntax_tree
            .atom(identifier)
            .filter(|_| matches!(syntax_tree.kind(identifier), Kind::Identifier(_)))
        else {
            continue;
        };
        let callee = initializer.and_then(|i| call_name(syntax_tree, i));
        let is_macro = is_const && callee.is_some_and(|c| DEFINE_MACROS.contains(&c));
        let t = if all_literal
            || (is_const && initializer.is_some_and(|i| is_static(syntax_tree, i)))
        {
            BindingType::LiteralConst
        } else if callee.is_some() && callee == reactive {
            if is_const {
                BindingType::SetupReactiveConst
            } else {
                BindingType::SetupLet
            }
        } else if is_macro
            || (is_const && initializer.is_some_and(|i| can_never_be_ref(syntax_tree, i, reactive)))
        {
            if callee == Some("defineProps") {
                BindingType::SetupReactiveConst
            } else {
                BindingType::SetupConst
            }
        } else if is_const {
            let makes_ref = callee.is_some_and(|c| {
                REF_CALLS.iter().any(|r| alias(r) == Some(c)) || c == "defineModel"
            });
            if makes_ref {
                BindingType::SetupRef
            } else {
                BindingType::SetupMaybeRef
            }
        } else {
            BindingType::SetupLet
        };
        out.push((name, t));
    }
}

fn is_define_props(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> bool {
    call_name(syntax_tree, e) == Some("defineProps")
}

fn first_arg(syntax_tree: &SyntaxTree, call: NodeIdentifier) -> Option<NodeIdentifier> {
    match syntax_tree.kind(call) {
        Kind::Call { arguments, .. } => arguments.first().copied(),
        _ => None,
    }
}

/// compiler-sfc `isCallOf`: a call whose callee is a plain identifier.
#[must_use]
pub fn call_name(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> Option<&str> {
    match syntax_tree.kind(e) {
        Kind::Call { callee, .. } if matches!(syntax_tree.kind(callee), Kind::Identifier(_)) => {
            Some(syntax_tree.name(callee))
        }
        _ => None,
    }
}

/// compiler-sfc `getObjectOrArrayExpressionKeys`.
/// A key no identifier of the document spells has no atom, and no template name can need it.
fn object_keys(syntax_tree: &SyntaxTree, source_text: &str, e: NodeIdentifier) -> Vec<Atom> {
    match syntax_tree.kind(e) {
        Kind::Object(props) => props
            .iter()
            .filter_map(|&p| match syntax_tree.kind(p) {
                Kind::Property {
                    key,
                    computed: false,
                    ..
                } => match syntax_tree.kind(key) {
                    Kind::Identifier(a) => Some(a),
                    Kind::String => syntax_tree
                        .atoms
                        .lookup(syntax_tree.str_value(key, source_text)),
                    _ => None,
                },
                _ => None,
            })
            .collect(),
        Kind::Array(items) => items
            .iter()
            .filter(|&&i| matches!(syntax_tree.kind(i), Kind::String))
            .filter_map(|&i| {
                syntax_tree
                    .atoms
                    .lookup(syntax_tree.str_value(i, source_text))
            })
            .collect(),
        _ => Vec::new(),
    }
}

/// compiler-sfc `isStaticNode`.
#[must_use]
pub fn is_static(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> bool {
    match syntax_tree.kind(e) {
        Kind::Unary(_, a) => is_static(syntax_tree, a),
        Kind::Binary(_, l, r) | Kind::Logical(_, l, r) => {
            is_static(syntax_tree, l) && is_static(syntax_tree, r)
        }
        Kind::Conditional {
            test,
            consequent,
            alternate,
        } => {
            is_static(syntax_tree, test)
                && is_static(syntax_tree, consequent)
                && is_static(syntax_tree, alternate)
        }
        Kind::Sequence(list) => list.iter().all(|&x| is_static(syntax_tree, x)),
        Kind::Template { expressions, .. } => {
            expressions.iter().all(|&x| is_static(syntax_tree, x))
        }
        Kind::String | Kind::Number(_) | Kind::Boolean(_) | Kind::Null => true,
        _ => false,
    }
}

/// compiler-sfc `canNeverBeRef`.
fn can_never_be_ref(syntax_tree: &SyntaxTree, e: NodeIdentifier, reactive: Option<&str>) -> bool {
    if reactive.is_some() && call_name(syntax_tree, e) == reactive {
        return true;
    }
    match syntax_tree.kind(e) {
        // The last five are `isLiteralNode`: every `*Literal` type, template literals included.
        Kind::Unary(..)
        | Kind::Binary(..)
        | Kind::Array(_)
        | Kind::Object(_)
        | Kind::Function { .. }
        | Kind::Arrow { .. }
        | Kind::Update { .. }
        | Kind::String
        | Kind::Number(_)
        | Kind::Boolean(_)
        | Kind::Null
        | Kind::Template { .. } => true,
        Kind::Sequence(list) => list
            .last()
            .is_some_and(|&l| can_never_be_ref(syntax_tree, l, reactive)),
        _ => false,
    }
}

/// The `v-if` / `v-else-if` / `v-else` directive of an element, if any.
#[must_use]
pub fn if_directive(c: &SingleFileComponent, n: TemplateNodeIdentifier) -> Option<DirectiveName> {
    let TemplateNode::Element { attributes, .. } = c.node(n) else {
        return None;
    };
    c.attributes(*attributes)
        .iter()
        .find_map(|a| match &a.kind {
            AttributeKind::Directive(d)
                if matches!(
                    d.name,
                    DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else
                ) =>
            {
                Some(d.name)
            }
            _ => None,
        })
}
