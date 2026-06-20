//! Server `EachBlock` visitor — the Rust port of
//! `3-transform/server/visitors/EachBlock.js` (sync, unkeyed path).
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
//! KNOWN GAPs:
//! - keyed each (`node.key`) and the animation path — not handled (the unkeyed
//!   SSR shape is identical, so this is only a correctness concern for keyed
//!   hydration markers upstream doesn't actually special-case on the server).
//! - destructuring `node.context` patterns (only identifier `as item` handled);
//!   a destructure falls back to a re-parsed source-slice pattern.
//! - async each (`node.metadata.expression.is_async()` → `create_child_block`).

use crate::ast::template::EachBlock;
use crate::compiler::phases::phase3_transform::builders::B;
use crate::compiler::phases::phase3_transform::builders::{BinaryOperator, UpdateOperator};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::{BindingPattern, Statement, VariableDeclarationKind};

use super::shared::{BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, TemplateEntry, build_fragment_body};

/// Visit a `{#each expr as ctx, i}...{/each}` block (sync, unkeyed, no fallback).
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

    let collection = state.visit_expr(&node.expression);
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

        for stmt in statements {
            state.template.push(TemplateEntry::Stmt(stmt));
        }
        state
            .template
            .push(TemplateEntry::Literal(BLOCK_CLOSE.to_string()));
    } else {
        // Sync, no-fallback path (写经):
        //   template.push(block_open); statements.push(for_loop);
        //   template.push(...statements, block_close)
        state
            .template
            .push(TemplateEntry::Literal(BLOCK_OPEN.to_string()));
        statements.push(for_loop);
        for stmt in statements {
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
