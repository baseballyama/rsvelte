//! DeclarationTag client transform visitor.
//!
//! Mirrors `phases/3-transform/client/visitors/DeclarationTag.js` from the
//! upstream Svelte compiler (Svelte 5.56.0 #18282).
//!
//! The new `{let x = …}` / `{const x = …}` template syntax declares a
//! mutable / immutable binding that lives inside the surrounding block's
//! template scope. The transform reuses the same rune-rewrite pipeline that
//! handles instance-script declarations so `let x = $state(1)` lowers to
//! `let x = $.state(1)`, `let y = $derived(x * 2)` lowers to
//! `let y = $.derived(() => $.get(x) * 2)`, and so on. The lowered
//! declaration is pushed onto `state.consts` so it sits at the start of the
//! enclosing block body, just like a `{@const}`.
//!
//! The async-blocker path (`metadata.promises_id` set) is intentionally not
//! covered yet — those `async-declaration-tag*` fixtures continue to fail
//! and are left for a follow-up so the synchronous path can land first.

use crate::ast::template::DeclarationTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{JsExpr, JsStatement};

/// Visit a declaration tag.
///
/// Extracts the tag's source text (between the outer `{` and `}`), runs it
/// through the shared instance-script rune-rewrite pipeline, and emits the
/// transformed declaration as a raw statement in `state.consts`. The raw
/// emission path is used because the rewritten text already carries all of
/// the runtime wiring (`$.state(...)`, `$.derived(...)`, `$.get(...)`, etc.)
/// and the AST round-trip would lose that work.
pub fn declaration_tag(node: &DeclarationTag, context: &mut ComponentContext) {
    let source = &context.state.analysis.source;
    let start = node.start as usize;
    let end = node.end as usize;
    if start >= end || end > source.len() {
        return;
    }
    let raw = &source[start..end];
    // Strip the surrounding `{` and `}`. Conservative: only strip a single
    // `{` / `}` pair on each side.
    let body = raw
        .strip_prefix('{')
        .and_then(|s| s.strip_suffix('}'))
        .unwrap_or(raw)
        .trim();
    if body.is_empty() {
        return;
    }

    // Ensure the statement ends with `;` so the rune-rewriting pipeline (which
    // expects script-like input) can parse and re-emit it cleanly.
    let mut script_input = String::with_capacity(body.len() + 2);
    script_input.push_str(body);
    if !body.ends_with(';') {
        script_input.push(';');
    }
    script_input.push('\n');

    let transformed = crate::compiler::phases::phase3_transform::client::transform_instance_script_for_visitors_pub(
        &script_input,
        context.state.analysis,
        context.state.options.dev,
        &[],
    );

    let trimmed = transformed.trim();
    if trimmed.is_empty() {
        return;
    }

    // Async path (Svelte 5.56.0 #18282 `add_async_declaration`): when the
    // declaration's initializer is awaited or depends on an async binding,
    // lower it to a bare `let name;` plus an assignment thunk collected into
    // `state.async_consts` (emitted as `var promises_N = $.run([...])`), with
    // blocker-wait thunks for cross-group dependencies. The rune-rewrite
    // pipeline above already produced the exact lowered RHS (e.g.
    // `$.state($.proxy(await id))` / `await $.async_derived(() => …)`); we just
    // restructure it. Reuses `add_const_declaration`, which is upstream's
    // `add_async_declaration` for the single-binding case.
    if try_emit_async_declaration(node, trimmed, context).is_some() {
        return;
    }

    // A multi-declarator declaration tag (`{let a = …, b = …}`) is lowered by
    // the instance-script transform into separate `let`/`const` statements
    // (`let a = …;\nlet b = …;`). Upstream keeps it as one comma-separated
    // declaration, so rejoin them — continuation declarators go on their own
    // line indented one extra level, which matches esrap's output once the
    // codegen re-indents the raw block. Only genuine top-level-comma
    // declarations are rejoined. (Svelte 5.56.1 #18348.)
    let raw = if body_has_top_level_comma(body) {
        rejoin_declarators(trimmed)
    } else {
        trimmed.to_string()
    };

    context.state.consts.push(JsStatement::Raw(raw.into()));
}

/// Try to emit a `{let x = …}` / `{const x = …}` declaration tag via the
/// async-declaration lowering (`add_const_declaration` = upstream's
/// `add_async_declaration`). Returns `Some(())` when handled (the declaration
/// is a single simple-identifier declarator whose initializer is awaited or
/// blocked by an async binding), otherwise `None` so the caller falls back to
/// the synchronous text path.
fn try_emit_async_declaration(
    node: &DeclarationTag,
    lowered: &str,
    context: &mut ComponentContext,
) -> Option<()> {
    let decl_json = node.declaration.as_json();
    let decls = decl_json.get("declarations")?.as_array()?;
    // Only the single simple-identifier declarator shape is handled here;
    // multi-declarator / destructuring async tags fall back to the sync path.
    if decls.len() != 1 {
        return None;
    }
    let d = decls[0].as_object()?;
    let id = d.get("id")?;
    if id.get("type")?.as_str()? != "Identifier" {
        return None;
    }
    let name = id.get("name")?.as_str()?;
    let init = d.get("init").filter(|i| !i.is_null())?;

    // Identifiers referenced by the initializer, for async-blocker lookup.
    let mut init_refs: Vec<String> = Vec::new();
    collect_init_identifiers(init, &mut init_refs);

    let has_await = node.metadata.expression.has_await();
    let has_blocker = {
        let bm = context.state.blocker_map.borrow();
        let cbm = context.state.const_blocker_map.borrow();
        init_refs
            .iter()
            .any(|r| bm.contains_key(r) || cbm.contains_key(r))
    };
    // Purely synchronous declarations stay on the text path (which preserves
    // the user's `let`/`const` keyword verbatim).
    if !has_await && !has_blocker {
        return None;
    }

    // Extract the lowered RHS from `<kind> <name> = <RHS>;`. The first ` = ` is
    // the declarator assignment (arrow `=>` and the RHS body never produce a
    // bare ` = ` before it for these shapes).
    let eq = lowered.find(" = ")?;
    let rhs = lowered[eq + 3..]
        .trim_end()
        .trim_end_matches(';')
        .trim()
        .to_string();
    if rhs.is_empty() {
        return None;
    }

    super::const_tag::add_const_declaration(
        context,
        name,
        JsExpr::Raw(rhs.into()),
        &node.metadata.expression,
        &init_refs,
    );
    Some(())
}

/// Recursively collect identifier names referenced anywhere in a JSON
/// expression (over-collecting member-property names is harmless — they won't
/// match a blocker-map entry).
fn collect_init_identifiers(value: &serde_json::Value, out: &mut Vec<String>) {
    match value {
        serde_json::Value::Object(map) => {
            if map.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                && let Some(n) = map.get("name").and_then(|n| n.as_str())
            {
                let n = n.to_string();
                if !out.contains(&n) {
                    out.push(n);
                }
            }
            for (k, v) in map {
                if k != "type" {
                    collect_init_identifiers(v, out);
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr {
                collect_init_identifiers(v, out);
            }
        }
        _ => {}
    }
}

/// Whether a declaration body has a top-level comma (a multi-declarator
/// declaration), ignoring commas inside strings or `()` / `[]` / `{}` nesting.
fn body_has_top_level_comma(body: &str) -> bool {
    let bytes = body.as_bytes();
    let mut depth = 0i32;
    let mut in_string = false;
    let mut string_ch = 0u8;
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            if c == string_ch && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
        } else {
            match c {
                b'"' | b'\'' | b'`' => {
                    in_string = true;
                    string_ch = c;
                }
                b'(' | b'[' | b'{' => depth += 1,
                b')' | b']' | b'}' => depth -= 1,
                b',' if depth == 0 => return true,
                _ => {}
            }
        }
        i += 1;
    }
    false
}

/// Rejoin instance-script-split `let` / `const` statements
/// (`let a = …;\nlet b = …;`) into one comma-separated declaration with each
/// continuation declarator on its own line indented one level deeper. Returns
/// the input unchanged unless it is a run of single-line, same-kind
/// declarations.
fn rejoin_declarators(s: &str) -> String {
    let lines: Vec<&str> = s.lines().filter(|l| !l.trim().is_empty()).collect();
    if lines.len() < 2 {
        return s.to_string();
    }
    let kind = {
        let first = lines[0].trim_start();
        if first.starts_with("let ") {
            "let "
        } else if first.starts_with("const ") {
            "const "
        } else {
            return s.to_string();
        }
    };
    let mut declarators = Vec::with_capacity(lines.len());
    for line in &lines {
        let Some(rest) = line.trim().strip_prefix(kind) else {
            return s.to_string();
        };
        declarators.push(rest.strip_suffix(';').unwrap_or(rest).trim().to_string());
    }
    let mut out = String::from(kind);
    for (i, d) in declarators.iter().enumerate() {
        if i > 0 {
            out.push_str(",\n\t");
        }
        out.push_str(d);
    }
    out.push(';');
    out
}
