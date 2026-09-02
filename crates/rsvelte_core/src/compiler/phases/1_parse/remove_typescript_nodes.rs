//! TypeScript node removal.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/remove_typescript_nodes.js`
//!
//! It provides functionality to remove TypeScript-specific AST nodes from JavaScript code.
//! This is necessary because Svelte needs to work with pure JavaScript, and TypeScript
//! annotations need to be stripped out during parsing.

use crate::error::ParseError;

// ───────────────────────────────────────────────────────────────────────────
// Typed transform (arena-based, no serde_json::Value round-trip)
// ───────────────────────────────────────────────────────────────────────────
//
// `remove_typescript_nodes_typed` mutates the arena-backed `JsNode` tree in place
// so that a TS `<script>` can stay `Expression::Typed` through Phase-2 analyze
// without ever building a `serde_json::Value` for the whole program (the
// expensive `as_json()` round trip the old Value path required).
//
// Design notes (see also the parser conversion in `read/expression.rs`):
//   * The `as`/`satisfies`/`!` assertion wrappers are PRESERVED at parse time
//     (so `parse()` output mirrors svelte/compiler) and unwrapped here — the
//     `TSAsExpression`/`TSSatisfiesExpression`/`TSNonNullExpression` arm below
//     replaces each wrapper with its inner expression, mirroring upstream's
//     `context.visit(node.expression)`. (`<T>x` type assertions and `f<T>`
//     instantiation expressions are still unwrapped at parse time, so they never
//     reach here.) The typed enum has no `returnType`/`accessibility`/`readonly`/…
//     fields, so there is nothing else to strip.
//   * The other TS cases that CAN reach a typed node are: type-only
//     import/export (whole or per-specifier), `declare` variable declarations,
//     `TSEnumDeclaration`, and `TSModuleDeclaration` (namespace) — handled
//     structurally below.
//   * The opaque `type_annotation` blobs on Identifier/ObjectPattern/ArrayPattern
//     ARE cleared, along with an identifier's TS `optional` marker: analyze
//     never reads either, but `compile()` serializes this same stripped tree as
//     `result.ast`, which upstream's catch-all visitor leaves with no
//     `typeAnnotation` / `optional` key at all.
//   * The `Program.ignore_comment_map` is preserved automatically: we never
//     rebuild the `Program` node, only mutate its body entries in place.

use crate::ast::arena::{IdRange, JsNodeId, ParseArena};
use crate::ast::typed_expr::{JsNode, TsMemberModifiers};

/// Recurse the typed TS strip into the arena node addressed by `id`.
///
/// Centralizes the single documented `unsafe` access used by the recursion.
#[inline]
fn recurse_node_id(id: JsNodeId, arena: &ParseArena) -> Result<(), ParseError> {
    // SAFETY: the parse arena is single-threaded (`!Sync`) and the typed AST is
    // an acyclic tree, so no two recursion frames address the same node; the
    // `&mut JsNode` returned here is the only live mutable borrow of that node.
    // The transform only ever appends to the arena (`alloc_js_*`), and the arena
    // stores each node in its own `Box` / each child range in its own boxed
    // slice, so those appends never move data behind references held by
    // outer recursion frames.
    let node = unsafe { arena.get_js_node_mut(id) };
    remove_typescript_nodes_typed(node, arena)
}

/// Recurse the typed TS strip into every child of `range`.
#[inline]
fn recurse_range(range: IdRange, arena: &ParseArena) -> Result<(), ParseError> {
    if range.is_empty() {
        return Ok(());
    }
    // SAFETY: see `recurse_node_id` — single-threaded, acyclic, append-only.
    // The returned `&mut [JsNode]` points into a stable boxed slice that the
    // append-only `alloc_js_*` calls performed during recursion never move.
    let children = unsafe { arena.get_js_children_mut(range) };
    for child in children {
        remove_typescript_nodes_typed(child, arena)?;
    }
    Ok(())
}

const DECORATOR_FEATURE: &str = "decorators (related TSC proposal is not stage 4 yet)";

/// Document-relative span of the earliest decorator in `program`, or `None`.
///
/// Only a class *declaration* carries decorators in the typed tree; a decorated
/// member has no `JsNode` field to hold them, so the OXC program is the only
/// place the rest of them can still be seen.
pub(crate) fn first_decorator_span(
    program: &oxc_ast::ast::Program<'_>,
    offset: usize,
) -> Option<(usize, usize)> {
    use oxc_ast_visit::Visit;

    // A decorator is always spelled with `@`, so this skips the walk entirely
    // for the scripts that cannot contain one.
    memchr::memchr(b'@', program.source_text.as_bytes())?;

    struct Scan {
        first: Option<(u32, u32)>,
    }

    impl<'a> Visit<'a> for Scan {
        fn visit_decorator(&mut self, decorator: &oxc_ast::ast::Decorator<'a>) {
            if self
                .first
                .is_none_or(|(start, _)| decorator.span.start < start)
            {
                self.first = Some((decorator.span.start, decorator.span.end));
            }
        }

        // Upstream's `ExportDefaultDeclaration` visitor returns the node instead
        // of `context.next()`, so nothing under a default export is ever visited.
        fn visit_export_default_declaration(
            &mut self,
            _decl: &oxc_ast::ast::ExportDefaultDeclaration<'a>,
        ) {
        }
    }

    let mut scan = Scan { first: None };
    scan.visit_program(program);
    scan.first
        .map(|(start, end)| (offset + start as usize, offset + end as usize))
}

/// The upstream `Decorator` visitor error, for a span already in document coordinates.
pub(crate) fn decorator_error(span: (usize, usize)) -> ParseError {
    ParseError::typescript_invalid_feature(DECORATOR_FEATURE, span)
}

/// Build a typed `EmptyStatement` carrying `node`'s span (the span is irrelevant
/// to analyze, which treats every `EmptyStatement` as a no-op, but we keep it for
/// faithfulness).
#[inline]
fn typed_empty_statement(node: &JsNode) -> JsNode {
    JsNode::EmptyStatement {
        start: node.start().unwrap_or(0),
        end: node.end().unwrap_or(0),
        loc: None,
    }
}

/// Typed entry point. Mirrors upstream `remove_typescript_nodes` but operates
/// directly on the arena-backed typed tree.
pub fn remove_typescript_nodes_typed(
    node: &mut JsNode,
    arena: &ParseArena,
) -> Result<(), ParseError> {
    match node.node_type() {
        // Decorators are not supported.
        Some("Decorator") => {
            return Err(decorator_error((
                node.start().unwrap_or(0) as usize,
                node.end().unwrap_or(0) as usize,
            )));
        }

        // Enums are not supported.
        Some("TSEnumDeclaration") => {
            return Err(ParseError::typescript_invalid_feature(
                "enums",
                (
                    node.start().unwrap_or(0) as usize,
                    node.end().unwrap_or(0) as usize,
                ),
            ));
        }

        // Type aliases and interfaces exist only for public parse() fidelity;
        // compilation removes the whole declaration before analysis.
        Some("TSTypeAliasDeclaration") | Some("TSInterfaceDeclaration") => {
            *node = typed_empty_statement(node);
            return Ok(());
        }

        // TS parameter properties (`constructor(private x)` / `readonly x`) are
        // not supported. The typed `TSParameterProperty` node is only ever built
        // when a modifier is present, so its presence is always an error
        // (mirrors the Value mutator's `has_modifiers` check).
        Some("TSParameterProperty") => {
            return Err(ParseError::typescript_invalid_feature(
                "accessibility modifiers on constructor parameters",
                (
                    node.start().unwrap_or(0) as usize,
                    node.end().unwrap_or(0) as usize,
                ),
            ));
        }

        // `accessor` class fields are not supported (mirrors the Value mutator).
        Some("PropertyDefinition") => {
            if let JsNode::PropertyDefinition {
                modifiers: TsMemberModifiers { accessor: true, .. },
                start,
                end,
                ..
            } = node
            {
                return Err(ParseError::typescript_invalid_feature(
                    "accessor fields (related TSC proposal is not stage 4 yet)",
                    (*start as usize, *end as usize),
                ));
            }
        }

        // Namespaces / modules: error if they contain non-type nodes, else strip.
        Some("TSModuleDeclaration") => {
            return strip_ts_module_declaration_typed(node, arena);
        }

        // Filter out type-only imports.
        Some("ImportDeclaration") => {
            return strip_import_declaration_typed(node, arena);
        }

        // Filter out type-only exports.
        Some("ExportNamedDeclaration") => {
            return strip_export_named_declaration_typed(node, arena);
        }

        // Remove declared variables (`declare const x`).
        Some("VariableDeclaration") => {
            if let JsNode::VariableDeclaration { declare: true, .. } = node {
                *node = typed_empty_statement(node);
                return Ok(());
            }
        }

        // Remove declared classes (`declare class C`). The typed class path is
        // only taken for non-declare classes, so this is defensive.
        Some("ClassDeclaration") => {
            if let JsNode::ClassDeclaration { declare: true, .. } = node {
                *node = typed_empty_statement(node);
                return Ok(());
            }
        }

        // Remove the leading `this` parameter from functions. (The typed function
        // path emits only `params.items`, so this is effectively defensive — a
        // typed function never actually carries a `this` param.)
        Some("FunctionExpression") | Some("FunctionDeclaration") => {
            remove_this_param_typed(node, arena);
        }

        // Unwrap TS assertion wrappers (`x as T` / `x satisfies T` / `x!` /
        // `<T>x` / `x<T>`), replacing the wrapper with its inner expression and
        // continuing the strip into it. Mirrors upstream `context.visit(node.expression)`.
        Some("TSAsExpression")
        | Some("TSSatisfiesExpression")
        | Some("TSNonNullExpression")
        | Some("TSTypeAssertion")
        | Some("TSInstantiationExpression") => {
            let inner_id = match node {
                JsNode::TSAsExpression { expression, .. }
                | JsNode::TSSatisfiesExpression { expression, .. }
                | JsNode::TSNonNullExpression { expression, .. }
                | JsNode::TSTypeAssertion { expression, .. }
                | JsNode::TSInstantiationExpression { expression, .. } => *expression,
                _ => unreachable!("node_type matched a TS assertion variant"),
            };
            *node = arena.get_js_node(inner_id).clone();
            return remove_typescript_nodes_typed(node, arena);
        }

        // Every node needing structural rewriting is handled above; the rest just
        // recurse. The TS assertion wrappers can never fall through here — the
        // arm above returns early for them.
        _ => {}
    }

    clear_type_annotation(node);

    // Recurse into children.
    visit_typed_children(node, arena)
}

/// Drop the output-only TS annotation upstream's catch-all visitor deletes
/// (`delete n.typeAnnotation` / `delete n.optional`). `result.ast` is
/// serialized from this tree, so an annotation left here reaches a public
/// output; nothing else reads either field.
fn clear_type_annotation(node: &mut JsNode) {
    match node {
        JsNode::Identifier {
            optional,
            type_annotation,
            ..
        } => {
            *optional = false;
            *type_annotation = None;
        }
        JsNode::ObjectPattern {
            type_annotation, ..
        }
        | JsNode::ArrayPattern {
            type_annotation, ..
        } => *type_annotation = None,
        _ => {}
    }
}

/// Strip a `TSModuleDeclaration` (typed). Mirrors upstream: visit every body
/// entry, and error when any of them survived the visit. Upstream compares the
/// visited entry against the `b.empty` singleton, so an `EmptyStatement` the
/// source itself wrote is *not* a match — hence the pre-visit node type.
fn strip_ts_module_declaration_typed(
    node: &mut JsNode,
    arena: &ParseArena,
) -> Result<(), ParseError> {
    let body_id = match node {
        JsNode::TSModuleDeclaration { body, .. } => *body,
        _ => None,
    };

    if let Some(body_id) = body_id {
        // Typed module body is a `BlockStatement { body: [...] }` wrapper.
        let block = arena.get_js_node(body_id);
        let stmts_range = match block {
            JsNode::BlockStatement { body, .. } => *body,
            _ => IdRange::empty(),
        };
        let was_empty_statement: Vec<bool> = arena
            .get_js_children(stmts_range)
            .iter()
            .map(|entry| entry.node_type() == Some("EmptyStatement"))
            .collect();
        recurse_range(stmts_range, arena)?;
        let has_non_type_nodes = arena
            .get_js_children(stmts_range)
            .iter()
            .zip(&was_empty_statement)
            .any(|(entry, was_empty)| *was_empty || entry.node_type() != Some("EmptyStatement"));
        if has_non_type_nodes {
            return Err(ParseError::typescript_invalid_feature(
                "namespaces with non-type nodes",
                (
                    node.start().unwrap_or(0) as usize,
                    node.end().unwrap_or(0) as usize,
                ),
            ));
        }
    }

    *node = typed_empty_statement(node);
    Ok(())
}

/// Strip type-only imports (typed). Whole `import type {...}` → empty; otherwise
/// drop `import { type X }` specifiers, emptying the import if none remain.
fn strip_import_declaration_typed(node: &mut JsNode, arena: &ParseArena) -> Result<(), ParseError> {
    let (is_type, spec_range) = match node {
        JsNode::ImportDeclaration {
            import_kind,
            specifiers,
            ..
        } => (import_kind.as_deref() == Some("type"), *specifiers),
        _ => (false, IdRange::empty()),
    };

    if is_type {
        *node = typed_empty_statement(node);
        return Ok(());
    }

    if !spec_range.is_empty() {
        let specs = arena.get_js_children(spec_range);
        let any_type = specs.iter().any(specifier_import_kind_is_type);
        if any_type {
            let kept: Vec<JsNode> = specs
                .iter()
                .filter(|s| !specifier_import_kind_is_type(s))
                .cloned()
                .collect();
            if kept.is_empty() {
                *node = typed_empty_statement(node);
                return Ok(());
            }
            let new_range = arena.alloc_js_children(kept);
            if let JsNode::ImportDeclaration { specifiers, .. } = node {
                *specifiers = new_range;
            }
        }
    }
    Ok(())
}

/// Strip type-only named exports (typed).
fn strip_export_named_declaration_typed(
    node: &mut JsNode,
    arena: &ParseArena,
) -> Result<(), ParseError> {
    let (is_type, declaration, spec_range) = match node {
        JsNode::ExportNamedDeclaration {
            export_kind,
            declaration,
            specifiers,
            ..
        } => (
            export_kind.as_deref() == Some("type"),
            *declaration,
            *specifiers,
        ),
        _ => (false, None, IdRange::empty()),
    };

    if is_type {
        *node = typed_empty_statement(node);
        return Ok(());
    }

    // Upstream visits the declaration BEFORE deciding, so an export whose
    // declaration only becomes empty during the visit (`export namespace N { … }`)
    // is emptied too; leaving it makes the export count as a component export.
    if let Some(decl_id) = declaration {
        recurse_node_id(decl_id, arena)?;
        if arena.get_js_node(decl_id).node_type() == Some("EmptyStatement") {
            *node = typed_empty_statement(node);
        }
        return Ok(());
    }

    // An export left with no specifiers — including one written with none
    // (`export {}`) — is empty, mirroring `if (specifiers.length === 0)`.
    let specs = arena.get_js_children(spec_range);
    if specs.iter().all(specifier_export_kind_is_type) {
        *node = typed_empty_statement(node);
        return Ok(());
    }
    if specs.iter().any(specifier_export_kind_is_type) {
        let kept: Vec<JsNode> = specs
            .iter()
            .filter(|s| !specifier_export_kind_is_type(s))
            .cloned()
            .collect();
        let new_range = arena.alloc_js_children(kept);
        if let JsNode::ExportNamedDeclaration { specifiers, .. } = node {
            *specifiers = new_range;
        }
    }

    Ok(())
}

#[inline]
fn specifier_import_kind_is_type(spec: &JsNode) -> bool {
    match spec {
        JsNode::ImportSpecifier { import_kind, .. } => import_kind.as_deref() == Some("type"),
        _ => false,
    }
}

#[inline]
fn specifier_export_kind_is_type(spec: &JsNode) -> bool {
    match spec {
        JsNode::ExportSpecifier { export_kind, .. } => export_kind.as_deref() == Some("type"),
        _ => false,
    }
}

/// Remove a leading `this` parameter from a typed function node, if present.
fn remove_this_param_typed(node: &mut JsNode, arena: &ParseArena) {
    let params = match node {
        JsNode::FunctionExpression { params, .. } | JsNode::FunctionDeclaration { params, .. } => {
            *params
        }
        _ => return,
    };
    if params.is_empty() {
        return;
    }
    let items = arena.get_js_children(params);
    let first_is_this =
        matches!(items.first(), Some(JsNode::Identifier { name, .. }) if name == "this");
    if !first_is_this {
        return;
    }
    let kept: Vec<JsNode> = items.iter().skip(1).cloned().collect();
    let new_range = arena.alloc_js_children(kept);
    match node {
        JsNode::FunctionExpression { params, .. } | JsNode::FunctionDeclaration { params, .. } => {
            *params = new_range;
        }
        _ => {}
    }
}

/// Recurse into every JS child of a typed node.
fn visit_typed_children(node: &mut JsNode, arena: &ParseArena) -> Result<(), ParseError> {
    // Recurse into a single child by id.
    macro_rules! rec_id {
        ($id:expr) => {{
            recurse_node_id($id, arena)?;
        }};
    }
    macro_rules! rec_opt {
        ($opt:expr) => {{
            if let Some(id) = $opt {
                rec_id!(id);
            }
        }};
    }
    // Recurse into every child of a range.
    macro_rules! rec_range {
        ($range:expr) => {{
            recurse_range($range, arena)?;
        }};
    }

    match node {
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. }
        | JsNode::AssignmentExpression { left, right, .. }
        | JsNode::AssignmentPattern { left, right, .. } => {
            let (l, r) = (*left, *right);
            rec_id!(l);
            rec_id!(r);
        }
        // `for (… of/in …) <body>` — the `body` MUST be recursed too, or a TS
        // assertion in the loop body (e.g. `(x as T).p = …`) would leak past the
        // strip into codegen.
        JsNode::ForOfStatement {
            left, right, body, ..
        }
        | JsNode::ForInStatement {
            left, right, body, ..
        } => {
            let (l, r, b) = (*left, *right, *body);
            rec_id!(l);
            rec_id!(r);
            rec_id!(b);
        }
        JsNode::UnaryExpression { argument, .. }
        | JsNode::UpdateExpression { argument, .. }
        | JsNode::AwaitExpression { argument, .. }
        | JsNode::ThrowStatement { argument, .. }
        | JsNode::SpreadElement { argument, .. }
        | JsNode::RestElement { argument, .. } => {
            rec_id!(*argument);
        }
        JsNode::YieldExpression { argument, .. } | JsNode::ReturnStatement { argument, .. } => {
            rec_opt!(*argument);
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            let (t, c, a) = (*test, *consequent, *alternate);
            rec_id!(t);
            rec_id!(c);
            rec_id!(a);
        }
        JsNode::IfStatement {
            test,
            consequent,
            alternate,
            ..
        } => {
            let (t, c, a) = (*test, *consequent, *alternate);
            rec_id!(t);
            rec_id!(c);
            rec_opt!(a);
        }
        JsNode::CallExpression {
            callee, arguments, ..
        }
        | JsNode::NewExpression {
            callee, arguments, ..
        } => {
            let (c, args) = (*callee, *arguments);
            rec_id!(c);
            rec_range!(args);
        }
        JsNode::MemberExpression {
            object, property, ..
        } => {
            let (o, p) = (*object, *property);
            rec_id!(o);
            rec_id!(p);
        }
        JsNode::MetaProperty { meta, property, .. } => {
            let (m, p) = (*meta, *property);
            rec_id!(m);
            rec_id!(p);
        }
        JsNode::FunctionExpression {
            id, params, body, ..
        }
        | JsNode::FunctionDeclaration {
            id, params, body, ..
        } => {
            let (i, p, b) = (*id, *params, *body);
            rec_opt!(i);
            rec_range!(p);
            rec_opt!(b);
        }
        JsNode::ArrowFunctionExpression {
            id, params, body, ..
        } => {
            let (i, p, b) = (*id, *params, *body);
            rec_opt!(i);
            rec_range!(p);
            rec_id!(b);
        }
        JsNode::ClassExpression {
            id,
            super_class,
            body,
            ..
        } => {
            let (i, s, b) = (*id, *super_class, *body);
            rec_opt!(i);
            rec_opt!(s);
            rec_id!(b);
        }
        JsNode::ClassDeclaration {
            id,
            super_class,
            body,
            decorators,
            ..
        } => {
            // `decorators` carries `JsNode::Decorator` entries that must raise the
            // "decorators not supported" error when present.
            let (i, s, b, d) = (*id, *super_class, *body, *decorators);
            rec_opt!(i);
            rec_opt!(s);
            rec_id!(b);
            rec_range!(d);
        }
        JsNode::SequenceExpression { expressions, .. } => {
            rec_range!(*expressions);
        }
        JsNode::TemplateLiteral {
            quasis,
            expressions,
            ..
        } => {
            let (q, e) = (*quasis, *expressions);
            rec_range!(q);
            rec_range!(e);
        }
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            let (t, q) = (*tag, *quasi);
            rec_id!(t);
            rec_id!(q);
        }
        JsNode::ArrayExpression { elements, .. } | JsNode::ArrayPattern { elements, .. } => {
            for el in elements.iter_mut().flatten() {
                remove_typescript_nodes_typed(el, arena)?;
            }
        }
        JsNode::ObjectExpression { properties, .. } | JsNode::ObjectPattern { properties, .. } => {
            rec_range!(*properties);
        }
        JsNode::ImportExpression { source, .. } => {
            rec_id!(*source);
        }
        JsNode::ChainExpression { expression, .. }
        | JsNode::ExpressionStatement { expression, .. } => {
            rec_id!(*expression);
        }
        JsNode::Property { key, value, .. } | JsNode::MethodDefinition { key, value, .. } => {
            let (k, v) = (*key, *value);
            rec_id!(k);
            rec_id!(v);
        }
        JsNode::PropertyDefinition { key, value, .. } => {
            let (k, v) = (*key, *value);
            rec_id!(k);
            rec_opt!(v);
        }
        JsNode::Program { body, .. }
        | JsNode::BlockStatement { body, .. }
        | JsNode::ClassBody { body, .. }
        | JsNode::StaticBlock { body, .. } => {
            rec_range!(*body);
        }
        JsNode::VariableDeclaration { declarations, .. } => {
            rec_range!(*declarations);
        }
        JsNode::VariableDeclarator { id, init, .. } => {
            let (i, n) = (*id, *init);
            rec_id!(i);
            rec_opt!(n);
        }
        JsNode::ForStatement {
            init,
            test,
            update,
            body,
            ..
        } => {
            let (i, t, u, b) = (*init, *test, *update, *body);
            rec_opt!(i);
            rec_opt!(t);
            rec_opt!(u);
            rec_id!(b);
        }
        JsNode::WhileStatement { test, body, .. } | JsNode::DoWhileStatement { test, body, .. } => {
            let (t, b) = (*test, *body);
            rec_id!(t);
            rec_id!(b);
        }
        JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } => {
            let (bl, h, f) = (*block, *handler, *finalizer);
            rec_id!(bl);
            rec_opt!(h);
            rec_opt!(f);
        }
        JsNode::CatchClause { param, body, .. } => {
            let (p, b) = (*param, *body);
            rec_opt!(p);
            rec_id!(b);
        }
        JsNode::SwitchStatement {
            discriminant,
            cases,
            ..
        } => {
            let (d, c) = (*discriminant, *cases);
            rec_id!(d);
            rec_range!(c);
        }
        JsNode::SwitchCase {
            test, consequent, ..
        } => {
            let (t, c) = (*test, *consequent);
            rec_opt!(t);
            rec_range!(c);
        }
        JsNode::LabeledStatement { label, body, .. } => {
            let (l, b) = (*label, *body);
            rec_id!(l);
            rec_id!(b);
        }
        JsNode::ExportDefaultDeclaration { declaration, .. } => {
            rec_id!(*declaration);
        }
        // Childless / type-only / handled-elsewhere variants: nothing to recurse.
        _ => {}
    }

    Ok(())
}
