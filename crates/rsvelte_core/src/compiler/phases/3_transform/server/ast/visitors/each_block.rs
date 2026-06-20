//! Server `EachBlock` visitor — the Rust port of
//! `3-transform/server/visitors/EachBlock.js` (sync path, keyed + unkeyed).
//!
//! Upstream (写経):
//! ```js
//! export function EachBlock(node, context) {
//!     const collection = context.visit(node.expression);
//!     const index = contains_group_binding || !node.index ? meta.index : b.id(node.index);
//!     const array_id = state.scope.root.unique('each_array');     // `each_array`
//!     let statements = [b.const(array_id, b.call('$.ensure_array_like', collection))];
//!     const each = [];
//!     if (node.context) each.push(b.let(node.context, b.member(array_id, index, true)));
//!     if (index.name !== node.index && node.index != null) each.push(b.let(node.index, index));
//!     each.push(...context.visit(node.body).body);
//!     const for_loop = b.for(
//!         b.declaration('let', [b.declarator(index, 0), b.declarator('$$length', b.member(array_id, 'length'))]),
//!         b.binary('<', index, b.id('$$length')),
//!         b.update('++', index, false),
//!         b.block(each)
//!     );
//!     if (node.fallback) {
//!         // statements.push(b.if(arr.length !== 0, b.block([push('<!--[-->'), for_loop]), fallback_with('<!--[!-->')))
//!     } else {
//!         state.template.push(block_open);                        // `<!--[-->`
//!         statements.push(for_loop);
//!     }
//!     state.template.push(...create_child_block(statements, ...), block_close);  // sync: statements + `<!--]-->`
//! }
//! ```
//!
//! The `{:else}` fallback branch IS ported: when `node.fallback` is present, the
//! loop is wrapped in `if (each_array.length !== 0) { push('<!--[-->'); <loop> }
//! else { push('<!--[!-->'); <fallback> }` followed by `push('<!--]-->')`.
//!
//! Keyed each (`{#each items as item (item.id)}`) renders IDENTICALLY to
//! unkeyed on the server: upstream's `EachBlock.js` server visitor never reads
//! `node.key` (the key only drives client-side keyed reconciliation), so we
//! likewise ignore `node.key` here and the same for-loop / fallback shape is
//! emitted. No special-casing is needed — the visitor already never references
//! `node.key`.
//!
//! ## Async path (写经 `metadata.expression.is_async()` → `create_child_block`)
//!
//! When the iterable expression carries top-level-await blockers or an inline
//! `await` (`node.metadata.expression.is_async()`), the assembled each statements
//! (`const each_array = …; <for-loop>` — or the fallback `if/else`) are wrapped
//! via [`create_child_block`]: blockers → `$$renderer.async_block([…], …)`,
//! `has_await` → a `child_block(async ($$renderer) => { … })` arrow. The
//! surrounding `<!--[-->` / `<!--]-->` (and `<!--[!-->` for the fallback) markers
//! stay OUTSIDE the wrap — exactly as in the sync path — because upstream's
//! `EachBlock.js` only routes `statements` (the const + loop / fallback-if)
//! through `create_child_block`, then pushes `block_close` after.
//!
//! An await-bearing iterable is `$.save`-wrapped via [`save_wrap_expr_text`]:
//! `await Promise.resolve([…])` → `(await $.save(Promise.resolve([…])))()`, used
//! as the argument to `$.ensure_array_like(...)`. Sync each-blocks (no blockers,
//! no await) pass through `create_child_block` verbatim — output is UNCHANGED.
//!
//! KNOWN GAPs:
//! - the animation path (`animate:` directive) — not handled. The SSR shape is
//!   identical to a plain keyed each (animations are client-only), so this is
//!   not a server-output concern.
//! - destructuring `node.context` patterns (only identifier `as item` handled);
//!   a destructure falls back to a re-parsed source-slice pattern.

use crate::ast::template::EachBlock;
use crate::compiler::phases::phase3_transform::builders::B;
use crate::compiler::phases::phase3_transform::builders::{BinaryOperator, UpdateOperator};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::{BindingPattern, Statement, VariableDeclarationKind};

use super::shared::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, TemplateEntry, build_fragment_body,
    create_child_block, expr_text_blockers, save_wrap_expr_text, text_has_await,
};

/// Visit a `{#each expr as ctx, i (key)}...{/each}` block (sync; keyed or
/// unkeyed, with or without a `{:else}` fallback). The key is ignored on the
/// server — see the module docs.
pub fn visit_each_block<'a>(node: &EachBlock, state: &mut ServerTransformState<'a>) {
    let counter = state.each_index;
    state.each_index += 1;

    let array_var = if counter == 0 {
        "each_array".to_string()
    } else {
        format!("each_array_{counter}")
    };

    // Resolve the loop index name + optional alias, mirroring upstream:
    //   index = (contains_group_binding || !node.index) ? meta.index : node.index
    //   alias emitted as `let node.index = index` when index.name !== node.index
    let user_index = node.index.as_ref().map(|s| s.to_string());
    let (index_var, index_alias): (String, Option<String>) =
        if node.metadata.contains_group_binding || user_index.is_none() {
            let meta_index = node.metadata.index.clone().unwrap_or_else(|| {
                if counter == 0 {
                    "$$index".to_string()
                } else {
                    format!("$$index_{counter}")
                }
            });
            (meta_index, user_index)
        } else {
            (user_index.unwrap(), None)
        };

    // Async detection on the iterable (写经 `node.metadata.expression`):
    // blockers drive `$$renderer.async_block([…], …)`, an inline `await` drives a
    // `child_block(async …)` arrow + a `$.save`-wrapped collection argument.
    let iterable_src = state.expr_source(&node.expression).map(|s| s.to_string());
    let blocker_indices: Vec<usize> = iterable_src
        .as_deref()
        .map(|s| expr_text_blockers(state, s))
        .unwrap_or_default();
    let has_await = iterable_src.as_deref().is_some_and(text_has_await);

    // The collection argument to `$.ensure_array_like(...)`: an await-bearing
    // iterable is `$.save`-wrapped (`(await $.save(expr))()`); otherwise the
    // plain read-wrapped expression.
    let collection = if has_await {
        save_wrap_expr_text(state, iterable_src.as_deref().unwrap_or(""))
    } else {
        state.visit_expr(&node.expression)
    };
    let b = state.b;

    // statements[0] = const each_array = $.ensure_array_like(collection);
    let mut statements: Vec<Statement<'a>> =
        vec![b.const_id(&array_var, b.call("$.ensure_array_like", vec![collection]))];

    // Loop body: `let ctx = each_array[index]; [let alias = index;] ...body`.
    let mut each_body: Vec<Statement<'a>> = Vec::new();
    if let Some(ctx) = &node.context {
        let ctx_pat = context_pattern(ctx, state);
        let access = b.member_computed(b.id(&array_var), b.id(&index_var));
        each_body.push(b.let_decl(ctx_pat, Some(access)));
    }
    if let Some(alias) = &index_alias {
        each_body.push(b.let_id(alias, Some(b.id(&index_var))));
    }
    // EachBlock body IS an `is_text_first` parent (upstream `clean_nodes`).
    each_body.extend(build_fragment_body(&node.body, true, state));

    let for_loop = build_for_loop(b, &array_var, &index_var, b.block(each_body));

    if node.fallback.is_some() {
        // `{:else}` fallback path (写经 upstream):
        //   statements.push(b.if(
        //     b.binary('!==', b.member(array_id, 'length'), b.literal(0)),
        //     b.block([push('<!--[-->'), for_loop]),
        //     fallback_block_with_unshifted_push('<!--[!-->')))
        //   state.template.push(...statements, block_close)
        //
        // Re-borrow `b` after `state` is used again below; build the consequent
        // (open-marker push + the loop) and the alternate (fallback body with a
        // leading `<!--[!-->` push) first.
        let fallback = node.fallback.as_ref().unwrap();

        // Consequent: `{ $$renderer.push('<!--[-->'); <for_loop> }`.
        let b = state.b;
        let open_push = b.stmt(b.call("$$renderer.push", vec![b.string(BLOCK_OPEN)]));
        let consequent = b.block(vec![open_push, for_loop]);

        // Alternate: the fallback fragment body with a leading
        // `$$renderer.push('<!--[!-->')`. The fallback fragment's parent is the
        // EachBlock node, so it IS an `is_text_first` parent (upstream
        // `clean_nodes`: `parent.type === 'EachBlock'`) — a text-first fallback
        // gets a leading `<!---->` anchor, same as the loop body.
        let mut fallback_body = build_fragment_body(fallback, true, state);
        let b = state.b;
        let open_else_push = b.stmt(b.call("$$renderer.push", vec![b.string(BLOCK_OPEN_ELSE)]));
        fallback_body.insert(0, open_else_push);
        let alternate = b.block(fallback_body);

        let test = b.binary(
            BinaryOperator::StrictInequality,
            b.member(b.id(&array_var), "length"),
            b.number(0.0),
        );
        let if_stmt = b.if_stmt(test, consequent, Some(alternate));
        statements.push(if_stmt);

        // `create_child_block` wraps the const + if/else when async; sync passes
        // through verbatim. The `<!--]-->` close stays OUTSIDE the wrap. (No
        // `<!--[-->` open in the fallback path — the markers live inside the
        // if/else arms.)
        let wrapped = create_child_block(state, statements, &blocker_indices, has_await);
        for stmt in wrapped {
            state.template.push(TemplateEntry::Stmt(stmt));
        }
        state
            .template
            .push(TemplateEntry::Literal(BLOCK_CLOSE.to_string()));
    } else {
        // No-fallback path (写经):
        //   template.push(block_open); statements.push(for_loop);
        //   template.push(...create_child_block(statements, …), block_close)
        // The `<!--[-->` open + `<!--]-->` close markers stay OUTSIDE the async
        // `create_child_block` wrap — only the const + for-loop go inside.
        state
            .template
            .push(TemplateEntry::Literal(BLOCK_OPEN.to_string()));
        statements.push(for_loop);
        let wrapped = create_child_block(state, statements, &blocker_indices, has_await);
        for stmt in wrapped {
            state.template.push(TemplateEntry::Stmt(stmt));
        }
        state
            .template
            .push(TemplateEntry::Literal(BLOCK_CLOSE.to_string()));
    }
}

/// `for (let index = 0, $$length = array.length; index < $$length; index++) body`.
fn build_for_loop<'a>(
    b: B<'a>,
    array_var: &str,
    index_var: &str,
    body: Statement<'a>,
) -> Statement<'a> {
    let init = b.var_decl_multi_node(
        VariableDeclarationKind::Let,
        vec![
            (index_var, Some(b.number(0.0))),
            ("$$length", Some(b.member(b.id(array_var), "length"))),
        ],
    );
    let test = b.binary(BinaryOperator::LessThan, b.id(index_var), b.id("$$length"));
    let update = b.update(UpdateOperator::Increment, false, b.id(index_var));
    b.for_stmt(Some(init), Some(test), Some(update), body)
}

/// Build a binding pattern for the each context. Identifier contexts map to
/// `b.id_pat(name)`; destructuring patterns are re-parsed from their source
/// span (KNOWN GAP fallback) so the column-faithful pattern survives.
fn context_pattern<'a>(
    ctx: &crate::ast::js::Expression,
    state: &ServerTransformState<'a>,
) -> BindingPattern<'a> {
    if let Some(name) = ctx.identifier_name() {
        return state.b.id_pat(name);
    }
    // Fallback: re-parse the source slice as `let <pattern> = 0;` and steal the
    // pattern. Only reached for destructuring contexts (KNOWN GAP).
    if let (Some(start), Some(end)) = (ctx.start(), ctx.end()) {
        let slice = state.source[start as usize..end as usize].trim();
        if let Some(pat) = reparse_binding_pattern(slice, state.allocator, state.b) {
            return pat;
        }
    }
    state.b.id_pat("$$item")
}

/// Re-parse a binding pattern from `src` (e.g. `{ a, b }`) by wrapping it in a
/// `let <src> = 0;` declaration and extracting the declarator's pattern.
fn reparse_binding_pattern<'a>(
    src: &str,
    allocator: &'a oxc_allocator::Allocator,
    _b: B<'a>,
) -> Option<BindingPattern<'a>> {
    let wrapped = allocator.alloc_str(&format!("let {src} = 0;"));
    let ret = oxc_parser::Parser::new(allocator, wrapped, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return None;
    }
    for stmt in ret.program.body {
        if let Statement::VariableDeclaration(mut vd) = stmt {
            if let Some(decl) = vd.declarations.pop() {
                return Some(decl.id);
            }
        }
    }
    None
}
