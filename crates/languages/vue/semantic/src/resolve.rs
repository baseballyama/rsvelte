//! Name resolution: one scope analysis over the script and the template, and the binding types
//! compileScript derives from the script.
//!
//! The template is evaluated in the script's top-level scope, and each `v-for` opens a scope
//! declaring its aliases for the element it sits on ([`host::TemplateHost`]). Lint rules,
//! compilation and the type-check projection all read this one resolution.

use std::cell::RefCell;

use oxc_ast::ast::{
    BindingIdentifier, BindingPattern, CallExpression, Expression, ImportDeclarationSpecifier,
    ImportOrExportKind, ModuleExportName, ObjectPropertyKind, Program, PropertyKey, Statement,
    VariableDeclarationKind, VariableDeclarator,
};
use oxc_semantic::{ReferenceId, ScopeId, Scoping, SymbolId};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rsvelte_vue_syntax::syntax_tree::{
    AttributeKind, DirectiveName, SingleFileComponent, TemplateNode, TemplateNodeIdentifier,
};
use rustc_hash::FxHashMap;

use crate::compiler_syntax_tree::{CompilerNodeIdentifier, CompilerSyntaxTree};

mod host;

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

/// Where the script calls `defineProps`: its statement, and the declarator when it is one.
#[derive(Clone, Copy, Debug)]
struct DefinePropsAt {
    statement: usize,
    declarator: Option<usize>,
}

/// The `defineProps(…)` call of the script.
#[derive(Clone, Copy, Debug)]
pub struct DefineProps<'a> {
    pub call: &'a CallExpression<'a>,
    /// The runtime declaration (the call's argument).
    pub runtime: Option<&'a Expression<'a>>,
    /// The statement holding the call.
    pub statement: &'a Statement<'a>,
    /// `const props = defineProps(…)`: the declared name.
    pub declaration: Option<&'a BindingIdentifier<'a>>,
}

#[derive(Debug)]
pub struct Resolution {
    semantic: Semantic,
    program: ProgramIdentifier,
    /// compileScript's `bindingMetadata`: by name, as the template compiler looks names up.
    bindings: FxHashMap<Box<str>, BindingType>,
    define_props: Option<DefinePropsAt>,
    /// The scope each `v-for` element opens for its aliases.
    for_scopes: FxHashMap<CompilerNodeIdentifier, ScopeId>,
}

impl Resolution {
    #[must_use]
    pub const fn semantic(&self) -> &Semantic {
        &self.semantic
    }

    #[must_use]
    pub fn tree(&self) -> &Tree {
        self.semantic.tree()
    }

    #[must_use]
    pub fn scoping(&self) -> &Scoping {
        self.semantic.scoping()
    }

    #[must_use]
    pub fn binding_type(&self, name: &str) -> Option<BindingType> {
        self.bindings.get(name).copied()
    }

    /// The script's top-level scope, where the template's names resolve.
    #[must_use]
    pub fn root_scope(&self) -> ScopeId {
        self.scoping().root_scope_id()
    }

    /// The symbol `reference` resolves to; `None` for a global.
    #[must_use]
    pub fn symbol_of(&self, reference: ReferenceId) -> Option<SymbolId> {
        self.scoping().get_reference(reference).symbol_id()
    }

    /// Whether `symbol` is a `v-for` alias.
    #[must_use]
    pub fn is_alias(&self, symbol: SymbolId) -> bool {
        let scope = self.scoping().symbol_scope_id(symbol);
        self.for_scopes.values().any(|&s| s == scope)
    }

    /// The scope a `v-for` element opens, which its aliases are declared in.
    #[must_use]
    pub fn for_scope(&self, element: CompilerNodeIdentifier) -> Option<ScopeId> {
        self.for_scopes.get(&element).copied()
    }

    #[must_use]
    pub fn define_props(&self) -> Option<DefineProps<'_>> {
        let at = self.define_props?;
        let statement = &self.tree().get_program(self.program).body[at.statement];
        let (call, declaration) = match (statement, at.declarator) {
            (Statement::ExpressionStatement(s), None) => (call(&s.expression)?, None),
            (Statement::VariableDeclaration(d), Some(i)) => {
                let d = &d.declarations[i];
                let declaration = match &d.id {
                    BindingPattern::BindingIdentifier(id) => Some(&**id),
                    _ => None,
                };
                (call(d.init.as_ref()?)?, declaration)
            }
            _ => unreachable!("where `binding_metadata` found the call"),
        };
        Some(DefineProps {
            call,
            runtime: first_argument(call),
            statement,
            declaration,
        })
    }
}

/// `program` is the script's program (or an empty one); `compiler_syntax_tree` is the template,
/// `None` without one.
#[must_use]
pub fn resolve(
    tree: &Tree,
    program: ProgramIdentifier,
    compiler_syntax_tree: Option<&CompilerSyntaxTree>,
) -> Resolution {
    let mut for_scopes = FxHashMap::default();
    let semantic = Semantic::build(tree.clone(), |tree, builder| {
        let host = host::TemplateHost {
            tree,
            compiler_syntax_tree,
            for_scopes: RefCell::new(FxHashMap::default()),
        };
        let built = builder.build_with_host(tree.get_program(program), &host);
        for_scopes = host.for_scopes.take();
        built
    });
    let (bindings, define_props) = binding_metadata(semantic.tree().get_program(program));
    Resolution {
        semantic,
        program,
        bindings,
        define_props,
        for_scopes,
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
    program: &Program<'_>,
) -> (FxHashMap<Box<str>, BindingType>, Option<DefinePropsAt>) {
    let (vue_aliases, imports) = user_imports(program);
    let mut setup: Vec<(&str, BindingType)> = Vec::new();
    let mut define_props = None;
    let mut runtime = None;
    for (index, statement) in program.body.iter().enumerate() {
        match statement {
            Statement::ExpressionStatement(s) if is_define_props(&s.expression) => {
                define_props = Some(DefinePropsAt {
                    statement: index,
                    declarator: None,
                });
                runtime = call(&s.expression).and_then(first_argument);
            }
            Statement::VariableDeclaration(d) => {
                for (i, declarator) in d.declarations.iter().enumerate() {
                    if let Some(init) = &declarator.init
                        && is_define_props(init)
                    {
                        define_props = Some(DefinePropsAt {
                            statement: index,
                            declarator: Some(i),
                        });
                        runtime = call(init).and_then(first_argument);
                    }
                }
                walk_declaration(
                    d.kind == VariableDeclarationKind::Const,
                    &d.declarations,
                    &vue_aliases,
                    &mut setup,
                );
            }
            Statement::FunctionDeclaration(f) => {
                setup.extend(
                    f.id.as_ref()
                        .map(|id| (id.name.as_str(), BindingType::SetupConst)),
                );
            }
            _ => {}
        }
    }
    let prop_keys = runtime.map_or_else(Vec::new, object_keys);
    // compileScript fills `bindingMetadata` in this order; a later entry overwrites.
    let mut out = FxHashMap::default();
    for k in prop_keys {
        out.entry(k.into()).or_insert(BindingType::Props);
    }
    for (k, t) in imports.into_iter().chain(setup) {
        out.insert(k.into(), t);
    }
    (out, define_props)
}

/// A string with a lone surrogate names nothing the template can reach.
fn module_export_name<'a>(name: &'a ModuleExportName<'a>) -> Option<&'a str> {
    match name {
        ModuleExportName::IdentifierName(n) => Some(n.name.as_str()),
        ModuleExportName::IdentifierReference(n) => Some(n.name.as_str()),
        ModuleExportName::StringLiteral(s) => s.value.as_str(),
    }
}

/// The script's value imports: the local names of what it imports from `vue` (by imported name),
/// and each import's binding type.
fn user_imports<'a>(
    program: &'a Program<'a>,
) -> (FxHashMap<&'a str, &'a str>, Vec<(&'a str, BindingType)>) {
    let mut vue_aliases = FxHashMap::default();
    let mut imports = Vec::new();
    for statement in &program.body {
        let Statement::ImportDeclaration(import) = statement else {
            continue;
        };
        if import.import_kind == ImportOrExportKind::Type {
            continue;
        }
        let Some(from) = import.source.value.as_str() else {
            continue;
        };
        for specifier in import.specifiers.iter().flatten() {
            let (local, imported) = match specifier {
                ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => (&s.local, "default"),
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => (&s.local, "*"),
                ImportDeclarationSpecifier::ImportSpecifier(s) => {
                    if s.import_kind == ImportOrExportKind::Type {
                        continue;
                    }
                    let Some(imported) = module_export_name(&s.imported) else {
                        continue;
                    };
                    (&s.local, imported)
                }
            };
            let local = local.name.as_str();
            if from == "vue" {
                vue_aliases.insert(imported, local);
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
            imports.push((local, t));
        }
    }
    (vue_aliases, imports)
}

/// compiler-sfc `walkDeclaration` for one variable declaration. Destructured declarators are not
/// classified yet.
fn walk_declaration<'a>(
    is_const: bool,
    declarations: &'a [VariableDeclarator<'a>],
    vue_aliases: &FxHashMap<&str, &str>,
    out: &mut Vec<(&'a str, BindingType)>,
) {
    let alias = |name: &str| vue_aliases.get(name).copied();
    let reactive = alias("reactive");
    let init = |d: &'a VariableDeclarator<'a>| d.init.as_ref().map(unwrap_typescript);
    let all_literal = is_const
        && declarations.iter().all(|d| {
            matches!(d.id, BindingPattern::BindingIdentifier(_)) && init(d).is_some_and(is_static)
        });
    for d in declarations {
        let BindingPattern::BindingIdentifier(name) = &d.id else {
            continue;
        };
        let initializer = init(d);
        let callee = initializer.and_then(call_name);
        let is_macro = is_const && callee.is_some_and(|c| DEFINE_MACROS.contains(&c));
        let t = if all_literal || (is_const && initializer.is_some_and(is_static)) {
            BindingType::LiteralConst
        } else if callee.is_some() && callee == reactive {
            if is_const {
                BindingType::SetupReactiveConst
            } else {
                BindingType::SetupLet
            }
        } else if is_macro
            || (is_const && initializer.is_some_and(|i| can_never_be_ref(i, reactive)))
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
        out.push((name.name.as_str(), t));
    }
}

/// compiler-sfc `unwrapTSNode`.
#[must_use]
pub fn unwrap_typescript<'a>(mut e: &'a Expression<'a>) -> &'a Expression<'a> {
    loop {
        e = match e {
            Expression::TSAsExpression(t) => &t.expression,
            Expression::TSSatisfiesExpression(t) => &t.expression,
            Expression::TSNonNullExpression(t) => &t.expression,
            Expression::TSTypeAssertion(t) => &t.expression,
            _ => return e,
        };
    }
}

fn is_define_props(e: &Expression<'_>) -> bool {
    call_name(e) == Some("defineProps")
}

fn call<'a>(e: &'a Expression<'a>) -> Option<&'a CallExpression<'a>> {
    match e {
        Expression::CallExpression(call) => Some(call),
        _ => None,
    }
}

fn first_argument<'a>(call: &'a CallExpression<'a>) -> Option<&'a Expression<'a>> {
    call.arguments.first()?.as_expression()
}

/// compiler-sfc `isCallOf`: a call whose callee is a plain identifier.
#[must_use]
pub fn call_name<'a>(e: &'a Expression<'a>) -> Option<&'a str> {
    match e {
        Expression::CallExpression(call) => match &call.callee {
            Expression::Identifier(callee) => Some(callee.name.as_str()),
            _ => None,
        },
        _ => None,
    }
}

/// compiler-sfc `getObjectOrArrayExpressionKeys`.
fn object_keys<'a>(e: &'a Expression<'a>) -> Vec<&'a str> {
    match e {
        Expression::ObjectExpression(object) => object
            .properties
            .iter()
            .filter_map(|p| match p {
                ObjectPropertyKind::ObjectProperty(p) if !p.computed => match &p.key {
                    PropertyKey::StaticIdentifier(key) => Some(key.name.as_str()),
                    PropertyKey::StringLiteral(key) => key.value.as_str(),
                    _ => None,
                },
                _ => None,
            })
            .collect(),
        Expression::ArrayExpression(array) => array
            .elements
            .iter()
            .filter_map(|e| match e.as_expression()? {
                Expression::StringLiteral(s) => s.value.as_str(),
                _ => None,
            })
            .collect(),
        _ => Vec::new(),
    }
}

/// compiler-sfc `isStaticNode`.
#[must_use]
pub fn is_static(e: &Expression<'_>) -> bool {
    match unwrap_typescript(e) {
        Expression::UnaryExpression(u) => is_static(&u.argument),
        Expression::BinaryExpression(b) => is_static(&b.left) && is_static(&b.right),
        Expression::LogicalExpression(l) => is_static(&l.left) && is_static(&l.right),
        Expression::ConditionalExpression(c) => {
            is_static(&c.test) && is_static(&c.consequent) && is_static(&c.alternate)
        }
        Expression::SequenceExpression(s) => s.expressions.iter().all(is_static),
        Expression::TemplateLiteral(t) => t.expressions.iter().all(is_static),
        Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_) => true,
        _ => false,
    }
}

/// compiler-sfc `canNeverBeRef`.
fn can_never_be_ref(e: &Expression<'_>, reactive: Option<&str>) -> bool {
    if reactive.is_some() && call_name(e) == reactive {
        return true;
    }
    match e {
        // The literals are `isLiteralNode`: every `*Literal` type, template literals included.
        Expression::UnaryExpression(_)
        | Expression::BinaryExpression(_)
        | Expression::ArrayExpression(_)
        | Expression::ObjectExpression(_)
        | Expression::FunctionExpression(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::UpdateExpression(_)
        | Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::TemplateLiteral(_) => true,
        Expression::SequenceExpression(s) => s
            .expressions
            .last()
            .is_some_and(|l| can_never_be_ref(l, reactive)),
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

#[cfg(test)]
mod tests;
