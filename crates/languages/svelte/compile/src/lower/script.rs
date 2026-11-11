//! Shared rune rewriting with a target parameter.
//!
//! The rewrite runs over a copy of the input in the output arena: the copy keeps the analysis's
//! reference and symbol ids, so each identifier still resolves through [`Resolution`].

mod classes;
mod declarators;
mod exports;
mod props;
mod stores;
mod writes;

pub(super) use classes::Classes;
pub(super) use exports::Export;
use oxc_allocator::{CloneIn, GetAllocator, TakeIn, Vec as ArenaVec};
use oxc_ast::ast::{
    Argument, ArrowFunctionExpression, ClassBody, Declaration, Expression, Function,
    IdentifierReference, ImportDeclaration, MethodDefinition, ObjectProperty, Program, Statement,
    SwitchCase, VariableDeclaration, VariableDeclarator, WithClause, WithClauseKeyword,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::{ReferenceId, SymbolId};
use oxc_span::Span;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
use rsvelte_typescript_compile::strip::is_type_only;
use rustc_hash::{FxHashMap, FxHashSet};

use super::javascript::member_root;
use super::names::Names;
use super::{Builder, Target, span_of, unsupported};
use crate::lower::builder::Runtime;

pub(super) struct ScriptRewrite<'r, 'o> {
    pub b: &'r Builder<'o>,
    pub target: Target,
    pub accessors: bool,
    pub rest_reads: Option<&'r FxHashSet<ReferenceId>>,
    pub res: &'r Resolution,
    /// How the client reads the names the template declares, for those in scope (upstream's
    /// per-block `transform`, keyed by symbol instead of by name).
    pub template: Option<&'r FxHashMap<SymbolId, Read>>,
    /// A snippet a component holds and the outer name it shadows, which the client reads instead.
    pub shadows: Option<&'r FxHashMap<SymbolId, SymbolId>>,
    /// The store subscriptions (`$name`).
    pub stores: &'r [String],
    /// The store subscription a client mutation reads untracked (upstream's `mutate` transform).
    pub untracked: Option<ReferenceId>,
    /// The `{#each}` items of a store's collection, with the subscription a mutation of each
    /// invalidates.
    pub invalidates: Option<&'r FxHashMap<SymbolId, &'r str>>,
    /// The value written is an element's, which upstream never proxies.
    pub primitive: bool,
    pub classes: Classes,
    /// The names a script takes for what it declares, such as a nested destructured derived's;
    /// a template's rewrite declares none.
    pub names: Option<&'r Names>,
}

/// How a name the template declares is read on the client.
#[derive(Clone, Debug)]
pub(super) enum Read {
    Plain,
    /// `$.get(object).name`: a name a destructured `{@const}` declares in `object`.
    Field(Box<str>),
    /// `$.get(name)`
    Get,
    /// `name()`
    Call,
}

impl Read {
    pub(super) const fn get_if(through_get: bool) -> Self {
        if through_get { Self::Get } else { Self::Plain }
    }
}

impl<'o> ScriptRewrite<'_, 'o> {
    /// `e`, copied into the output and rewritten.
    pub(super) fn expression(&mut self, e: &Expression<'_>) -> Expression<'o> {
        let mut e = e.clone_in_with_semantic_ids(self.b.allocator());
        self.visit_expression(&mut e);
        e
    }

    pub(super) fn statement(&mut self, s: &Statement<'_>) -> Statement<'o> {
        let mut s = s.clone_in_with_semantic_ids(self.b.allocator());
        self.visit_statement(&mut s);
        s
    }

    pub(super) fn declarator(&mut self, d: &VariableDeclarator<'_>) -> VariableDeclarator<'o> {
        let mut d = d.clone_in_with_semantic_ids(self.b.allocator());
        self.visit_variable_declarator(&mut d);
        d
    }

    /// Upstream `build_getter` / the `read` transforms, by binding kind and target.
    fn read(&self, identifier: &IdentifierReference<'_>) -> Option<Expression<'o>> {
        let b = self.b;
        if self.target == Target::Client
            && let Some(reads) = self.rest_reads
            && identifier
                .reference_id
                .get()
                .is_some_and(|r| reads.contains(&r))
        {
            return Some(b.id("$$props"));
        }
        if self.is_store(identifier) {
            return Some(self.store_read(identifier));
        }
        let symbol = self.res.symbol(identifier)?;
        let symbol = (self.shadows.and_then(|m| m.get(&symbol)))
            .copied()
            .unwrap_or(symbol);
        self.read_symbol(symbol, &identifier.name, identifier.span)
    }

    pub(in crate::lower) fn read_symbol(
        &self,
        symbol: SymbolId,
        name: &str,
        span: Span,
    ) -> Option<Expression<'o>> {
        let b = self.b;
        let info = self.res.binding(symbol);
        let x = || b.id_at(name, span);
        // Upstream reads a `var` that may be read before its declaration runs safely.
        let var = || {
            (self.res.scoping().symbol_flags(symbol))
                .contains(oxc_syntax::symbol::SymbolFlags::FunctionScopedVariable)
        };
        let get = || b.runtime(if var() { "safe_get" } else { "get" }, [x()]);
        match (self.target, info.kind) {
            (Target::Client, BindingKind::State | BindingKind::RawState)
                if self.res.is_state_source(symbol) =>
            {
                Some(get())
            }
            (Target::Client, BindingKind::Derived | BindingKind::DerivedBy) => Some(get()),
            (Target::Client, BindingKind::Property | BindingKind::BindableProperty) => {
                if is_prop_source(self.res, self.accessors, symbol) {
                    return Some(b.call(x(), []));
                }
                let key = info.prop_key?;
                Some(b.member_key(b.id("$$props"), &super::javascript::prop_alias(key)))
            }
            (
                Target::Client,
                BindingKind::Each
                | BindingKind::StaticIndex
                | BindingKind::KeyedIndex
                | BindingKind::Snippet
                | BindingKind::Template,
            ) => {
                let Some(read) = self.template.and_then(|m| m.get(&symbol)) else {
                    unreachable!("a template name is read only inside its block")
                };
                match read {
                    Read::Plain => None,
                    Read::Get => Some(b.runtime("get", [x()])),
                    Read::Call => Some(b.call(x(), [])),
                    Read::Field(object) => Some(b.member(b.runtime("get", [b.id(object)]), name)),
                }
            }
            (Target::Server, BindingKind::Derived | BindingKind::DerivedBy) if var() => {
                let Expression::CallExpression(mut call) = b.call(x(), []) else {
                    unreachable!("a call builds a call")
                };
                call.optional = true;
                let call = oxc_ast::ast::ChainElement::CallExpression(call);
                Some(Expression::new_chain_expression(Span::default(), call, b))
            }
            (Target::Server, BindingKind::Derived | BindingKind::DerivedBy) => {
                Some(b.call(x(), []))
            }
            _ => None,
        }
    }

    /// A rune call's lowering, or `None` when `it` is no rune this rewrite lowers.
    fn rune(&mut self, it: &mut Expression<'o>) -> Option<Expression<'o>> {
        let b = self.b;
        let name = match (self.target, self.res.rune(it)?.0) {
            (Target::Client, "$host") => return Some(b.member(b.id("$$props"), "$$host")),
            (Target::Server, "$host") => return Some(b.void0()),
            (Target::Client, "$effect.pending") => {
                return Some(b.runtime("eager", [b.member(b.id("$"), "pending")]));
            }
            (Target::Server, "$effect.pending") => return Some(b.number(0.0)),
            (Target::Client, "$effect.tracking") => return Some(b.runtime("effect_tracking", [])),
            (Target::Server, "$effect.tracking") => return Some(b.boolean(false)),
            // Upstream's server keeps no effect, so the root's cleanup does nothing.
            (Target::Server, "$effect.root") => {
                return Some(b.arrow_block(b.params(std::iter::empty()), [], false));
            }
            (Target::Client, "$effect.root") => "effect_root",
            (_, "$state.snapshot") => "snapshot",
            (Target::Client, "$effect") => "user_effect",
            (Target::Client, "$effect.pre") => "user_pre_effect",
            _ => return None,
        };
        let Expression::CallExpression(call) = it else {
            unreachable!("a rune is a call")
        };
        let mut arguments = call.arguments.take_in(b);
        for argument in &mut arguments {
            self.visit_argument(argument);
        }
        Some(b.call(
            b.member(b.id("$"), name),
            arguments_to_expressions(arguments),
        ))
    }
}

fn arguments_to_expressions<'o>(
    arguments: ArenaVec<'o, Argument<'o>>,
) -> impl Iterator<Item = Expression<'o>> {
    arguments.into_iter().map(|a| match a {
        Argument::SpreadElement(_) => unreachable!("a rune takes no spread"),
        a => a.into_expression(),
    })
}

impl<'o> ScriptRewrite<'_, 'o> {
    fn rewrite_expression(&mut self, it: &mut Expression<'o>) {
        let rewritten = match it {
            Expression::Identifier(identifier) => match self.read(identifier) {
                Some(e) => e,
                None => return,
            },
            Expression::PrivateFieldExpression(_) => match self.class_read(it) {
                Some(e) => e,
                None => return walk_mut::walk_expression(self, it),
            },
            Expression::AssignmentExpression(_) => {
                match (self.class_assign(it))
                    .or_else(|| self.store_assign(it))
                    .or_else(|| self.assign(it))
                {
                    Some(e) => e,
                    None => return walk_mut::walk_expression(self, it),
                }
            }
            Expression::UpdateExpression(_) => {
                match (self.class_update(it))
                    .or_else(|| self.store_update(it))
                    .or_else(|| self.update(it))
                {
                    Some(e) => e,
                    None => return walk_mut::walk_expression(self, it),
                }
            }
            Expression::CallExpression(_) => match self.rune(it) {
                Some(e) => e,
                None => return walk_mut::walk_expression(self, it),
            },
            _ => return walk_mut::walk_expression(self, it),
        };
        *it = rewritten;
    }
}

impl<'o> VisitMut<'o> for ScriptRewrite<'_, 'o> {
    fn visit_expression(&mut self, it: &mut Expression<'o>) {
        // Upstream's `mutate` transform of an `{#each}` item of a store's collection.
        if let Some(invalidate) = self.invalidation(it) {
            self.rewrite_expression(it);
            *it = self.b.sequence([it.take_in(self.b), invalidate]);
            return;
        }
        self.rewrite_expression(it);
    }

    fn visit_object_property(&mut self, it: &mut ObjectProperty<'o>) {
        // `{ count }` stops being shorthand when `count` reads through a transform.
        if it.shorthand
            && let Expression::Identifier(identifier) = &it.value
            && let Some(read) = self.read(identifier)
        {
            it.value = read;
            it.shorthand = false;
            return;
        }
        walk_mut::walk_object_property(self, it);
    }

    // esrap prints `import {} from "x"` as `import "x"`.
    fn visit_import_declaration(&mut self, it: &mut ImportDeclaration<'o>) {
        if it.specifiers.as_ref().is_some_and(|s| s.is_empty()) {
            it.specifiers = None;
        }
        walk_mut::walk_import_declaration(self, it);
    }

    // esrap prints every import attribute list with `with`.
    fn visit_with_clause(&mut self, it: &mut WithClause<'o>) {
        it.keyword = WithClauseKeyword::With;
    }

    // esrap prints no empty statement in a block or program body.
    fn visit_statements(&mut self, it: &mut ArenaVec<'o, Statement<'o>>) {
        walk_mut::walk_statements(self, it);
        it.retain(|s| !matches!(s, Statement::EmptyStatement(_)));
    }

    // A `switch` case keeps its empty statements.
    fn visit_switch_case(&mut self, it: &mut SwitchCase<'o>) {
        if let Some(test) = &mut it.test {
            self.visit_expression(test);
        }
        for statement in &mut it.consequent {
            self.visit_statement(statement);
        }
    }

    fn visit_statement(&mut self, it: &mut Statement<'o>) {
        // Upstream server `ExpressionStatement`: an effect renders nothing.
        if self.target == Target::Server && is_effect(self.res, it) {
            *it = Statement::new_empty_statement(oxc_span::GetSpan::span(it), self.b);
            return;
        }
        walk_mut::walk_statement(self, it);
    }

    fn visit_class_body(&mut self, it: &mut ClassBody<'o>) {
        self.class_body(it);
    }

    fn visit_method_definition(&mut self, it: &mut MethodDefinition<'o>) {
        self.class_method(it);
    }

    fn visit_function(&mut self, it: &mut Function<'o>, flags: ScopeFlags) {
        self.class_function(it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &mut ArrowFunctionExpression<'o>) {
        self.class_arrow(it);
    }

    fn visit_variable_declaration(&mut self, it: &mut VariableDeclaration<'o>) {
        if !declarators::lower_destructured_declaration(self, it) {
            walk_mut::walk_variable_declaration(self, it);
        }
    }

    // Upstream lowers a state or derived declaration in a nested function the same way.
    fn visit_variable_declarator(&mut self, it: &mut VariableDeclarator<'o>) {
        if !declarators::lower_value_declarator(self, it) {
            walk_mut::walk_variable_declarator(self, it);
        }
    }
}

/// Upstream `is_prop_source`; a custom element's accessors read every prop through its signal.
fn is_prop_source(res: &Resolution, accessors: bool, symbol: SymbolId) -> bool {
    res.is_prop_source(symbol)
        || (accessors
            && matches!(
                res.binding(symbol).kind,
                BindingKind::Property | BindingKind::BindableProperty
            ))
}

/// The `$bindable` prop with a signal that a write through a member of `object` writes:
/// upstream's `mutate` transform then tells the parent, `prop((prop().x = value), true)`.
pub(super) fn bindable_root<'e>(
    res: &Resolution,
    accessors: bool,
    object: &'e Expression<'e>,
) -> Option<&'e IdentifierReference<'e>> {
    let root = member_root(object)?;
    let symbol = res.symbol(root)?;
    (res.binding(symbol).kind == BindingKind::BindableProperty
        && is_prop_source(res, accessors, symbol))
    .then_some(root)
}

/// Upstream server `ExpressionStatement`: an effect statement renders nothing.
fn is_effect(res: &Resolution, statement: &Statement<'_>) -> bool {
    matches!(statement, Statement::ExpressionStatement(s)
        if res.rune(&s.expression).is_some_and(|(r, _)| matches!(r, "$effect" | "$effect.pre" | "$effect.root")))
}

/// Upstream `should_proxy` on a value it has already visited, where a prop's name has become a
/// call or a member read and so proxies whatever its default.
#[must_use]
pub(super) fn should_proxy_read(res: &Resolution, e: &Expression<'_>) -> bool {
    let prop = match e {
        Expression::Identifier(identifier) => res.symbol(identifier).is_some_and(|symbol| {
            matches!(
                res.binding(symbol).kind,
                BindingKind::Property | BindingKind::BindableProperty
            )
        }),
        _ => false,
    };
    prop || res.should_proxy(e)
}

/// Which script is lowered; the instance's exports are collected while it is.
pub(super) enum ScriptContext<'e, 't> {
    Instance {
        exports: &'e mut Vec<Export<'t>>,
    },
    Module,
    /// A `.svelte.js` module, which keeps its imports where they are and its types for
    /// TypeScript's emit.
    File,
}

/// Upstream `analysis.props_id`: the name `const id = $props.id()` declares.
pub(super) fn props_id(program: &Program<'_>, res: &Resolution) -> Option<String> {
    program.body.iter().find_map(|statement| {
        let d = match statement {
            Statement::VariableDeclaration(d) => d,
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::VariableDeclaration(d) => d,
                _ => return None,
            },
            _ => return None,
        };
        d.declarations.iter().find_map(|d| {
            let init = d.init.as_ref()?;
            (res.rune(init)?.0 == "$props.id")
                .then(|| d.id.get_binding_identifier())
                .flatten()
                .map(|id| id.name.to_string())
        })
    })
}

/// Script statements share rune lowering; imports go to `hoisted`.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] for an export the instance script cannot lower, and
/// upstream's errors for the exports it can.
pub(super) fn lower_script<'t, 'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    program: &'t Program<'t>,
    hoisted: &mut Vec<Statement<'o>>,
    names: &Names,
    mut context: ScriptContext<'_, 't>,
) -> Result<Vec<Statement<'o>>, Diagnostic> {
    let instance = matches!(context, ScriptContext::Instance { .. });
    let mut out = Vec::with_capacity(program.body.len());
    for statement in &program.body {
        for _ in 0..writes::pattern_arrays(statement) {
            names.generate("$$array");
        }
        // Upstream erases the types before it analyzes the component.
        // A module's types are TypeScript's emit to erase, once it is lowered.
        if is_type_only(statement) && !matches!(context, ScriptContext::File) {
            continue;
        }
        match statement {
            Statement::ExportDeclaration(export)
                if let ScriptContext::Instance { exports } = &mut context =>
            {
                exports::check_declaration(rw.res, statement, &export.declaration, exports)?;
                match &export.declaration {
                    Declaration::VariableDeclaration(d) => {
                        lower_declaration(rw, d, true, &mut out, hoisted, names);
                    }
                    declaration => {
                        let mut declaration =
                            declaration.clone_in_with_semantic_ids(rw.b.allocator());
                        rw.visit_declaration(&mut declaration);
                        out.push(Statement::from(declaration));
                    }
                }
            }
            Statement::ExportNamedDeclaration(export)
                if let ScriptContext::Instance { exports } = &mut context =>
            {
                exports::check_specifiers(rw.res, export, exports)?;
            }
            // TypeScript keeps an export of types only as `export {}`, which oxc's emit drops.
            Statement::ExportNamedDeclaration(export)
                if matches!(context, ScriptContext::File)
                    && !export.export_kind.is_type()
                    && !export.specifiers.is_empty()
                    && is_type_only(statement) =>
            {
                let mut kept = rw.statement(statement);
                if let Statement::ExportNamedDeclaration(export) = &mut kept {
                    export.specifiers.clear();
                }
                out.push(kept);
            }
            Statement::ImportDeclaration(_) if matches!(context, ScriptContext::File) => {
                out.push(rw.statement(statement));
            }
            Statement::ImportDeclaration(_) => hoisted.push(rw.statement(statement)),
            // Upstream drops a re-export of everything, which names nothing the component can
            // export.
            Statement::ExportAllDeclaration(_) if instance => {}
            // Upstream turns these into the component's exports; copying them would put an
            // `export` inside the component function.
            Statement::ExportDefaultDeclaration(_) | Statement::ExportFromDeclaration(_)
                if instance =>
            {
                return unsupported("an export from the instance script", span_of(statement));
            }
            Statement::VariableDeclaration(d) => {
                lower_declaration(rw, d, instance, &mut out, hoisted, names);
            }
            // Upstream server `ExpressionStatement`: an effect renders nothing.
            Statement::EmptyStatement(_) => {}
            _ if rw.target == Target::Server && is_effect(rw.res, statement) => {}
            _ => out.push(rw.statement(statement)),
        }
    }
    Ok(out)
}

/// A top-level declaration. Upstream's instance gives each declarator its own declaration.
fn lower_declaration<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    declaration: &VariableDeclaration<'_>,
    split: bool,
    out: &mut Vec<Statement<'o>>,
    hoisted: &mut Vec<Statement<'o>>,
    names: &Names,
) {
    let b = rw.b;
    let mut lowered = Vec::with_capacity(declaration.declarations.len());
    for (i, d) in declaration.declarations.iter().enumerate() {
        lower_declarator(rw, d, &mut lowered, hoisted, names);
        if (split || i + 1 == declaration.declarations.len()) && !lowered.is_empty() {
            let mut statement = b.declaration(declaration.kind, std::mem::take(&mut lowered));
            if let Statement::VariableDeclaration(d) = &mut statement {
                d.span = declaration.span;
            }
            out.push(statement);
        }
    }
}

fn lower_declarator<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    d: &VariableDeclarator<'_>,
    out: &mut Vec<VariableDeclarator<'o>>,
    hoisted: &mut Vec<Statement<'o>>,
    names: &Names,
) {
    let rune = d
        .init
        .as_ref()
        .and_then(|init| rw.res.rune(init))
        .map(|(rune, _)| rune);
    // Upstream declares `$props.id()` first in the component instead.
    if rune == Some("$props.id") {
        return;
    }
    if matches!(rune, Some("$derived" | "$derived.by")) && !d.id.is_binding_identifier() {
        declarators::lower_destructured_derived(rw, d, out, names);
        return;
    }
    if rune != Some("$props") {
        out.push(rw.declarator(d));
        return;
    }
    match rw.target {
        Target::Server => {
            let pattern = props::server_props_pattern(rw, &d.id);
            let mut declarator = rw.b.declarator(pattern, Some(rw.b.id("$$props")));
            declarator.span = d.span;
            out.push(declarator);
        }
        Target::Client => props::lower_client_props(rw, &d.id, out, hoisted, names),
    }
}
