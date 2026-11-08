//! `svelte/prefer-derived-over-derived-by`.
//!
//! `svelte/prefer-derived-over-derived-by` — disallow unnecessary
//! `$derived.by()` when `$derived()` is sufficient. Port of the
//! eslint-plugin-svelte rule.
//!
//! The rule fires on a `$derived.by(fn)` call whose single argument is a
//! parameter-less, non-async, non-generator arrow/function expression that
//! merely returns a single expression — either a concise arrow body or a block
//! body containing exactly one `return <expr>;`. The autofix removes `.by`, the
//! function head and the block tail and keeps everything else in place (so a
//! return type moves to `$derived<T>`), and is withheld when that would change
//! the code or drop a comment.
//!
//! Dual-registered: upstream lints one `Program` spanning the whole component,
//! so [`ScriptRule`] covers the `<script>` blocks and standalone modules while
//! [`Rule::check_root`] covers the template expressions.

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::js_tokens::{Token, TokenKind, tokenize};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-derived-over-derived-by",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow unnecessary `$derived.by()` when `$derived()` is sufficient",
    options_schema: None,
};

const MESSAGE: &str =
    "Unnecessary use of `$derived.by()`. Use `$derived()` directly for simple expressions.";

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// Whether `callee` is a non-computed member expression `$derived.by`.
fn is_derived_by_callee(callee: &Value) -> bool {
    node_type(callee) == Some("MemberExpression")
        && callee.get("computed").and_then(Value::as_bool) != Some(true)
        && callee.get("object").and_then(ident_name) == Some("$derived")
        && callee.get("property").and_then(ident_name) == Some("by")
}

/// Whether `arg` is a parameter-less, non-async, non-generator
/// arrow/function expression. Returns the node type when so.
fn simple_thunk_kind(arg: &Value) -> Option<&str> {
    let kind = node_type(arg)?;
    if kind != "ArrowFunctionExpression" && kind != "FunctionExpression" {
        return None;
    }
    let params_empty = arg
        .get("params")
        .and_then(Value::as_array)
        .is_some_and(std::vec::Vec::is_empty);
    if !params_empty {
        return None;
    }
    if arg.get("async").and_then(Value::as_bool) == Some(true) {
        return None;
    }
    if arg.get("generator").and_then(Value::as_bool) == Some(true) {
        return None;
    }
    Some(kind)
}

/// Whether `text` is only whitespace and comments.
fn only_trivia(text: &str) -> bool {
    let mut chars = text.chars().peekable();
    while let Some(c) = chars.next() {
        if c.is_whitespace() || c == '\u{feff}' {
            continue;
        }
        if c != '/' {
            return false;
        }
        match chars.peek() {
            Some('/') => {
                chars.next();
                for c in chars.by_ref() {
                    if matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}') {
                        break;
                    }
                }
            }
            Some('*') => {
                chars.next();
                let mut star = false;
                loop {
                    let Some(c) = chars.next() else { return true };
                    if star && c == '/' {
                        break;
                    }
                    star = c == '*';
                }
            }
            _ => return false,
        }
    }
    true
}

/// Whether the block holds anything besides `stmt` and trivia. rsvelte's
/// `ESTree` conversion drops a function body's directive prologue, so
/// `'use strict'; return a;` serializes as a lone `return` — which upstream,
/// where a directive is an ordinary statement, counts as two.
fn block_has_hidden_statements(source: &str, block: &Value, stmt: &Value) -> bool {
    let (Some(block_start), Some(block_end)) = (node_start(block), node_end(block)) else {
        return false;
    };
    let (Some(stmt_start), Some(stmt_end)) = (node_start(stmt), node_end(stmt)) else {
        return false;
    };
    let gaps = [
        (block_start as usize + 1, stmt_start as usize),
        (stmt_end as usize, (block_end as usize).saturating_sub(1)),
    ];
    gaps.iter().any(|&(start, end)| {
        start <= end
            && end <= source.len()
            && source.is_char_boundary(start)
            && source.is_char_boundary(end)
            && !only_trivia(&source[start..end])
    })
}

/// The single returned expression node of a simple thunk, if it returns one:
/// a concise arrow body, or a block body of exactly one `return <expr>;`.
fn returned_expression(arg: &Value, kind: &str, source: &str) -> Option<Value> {
    let body = arg.get("body")?;
    if kind == "ArrowFunctionExpression" && node_type(body) != Some("BlockStatement") {
        return Some(body.clone());
    }
    if node_type(body) == Some("BlockStatement") {
        let stmts = body.get("body").and_then(Value::as_array)?;
        if stmts.len() == 1 {
            let stmt = &stmts[0];
            if node_type(stmt) == Some("ReturnStatement")
                && let Some(argument) = stmt.get("argument")
                && !argument.is_null()
                && !block_has_hidden_statements(source, body, stmt)
            {
                return Some(argument.clone());
            }
        }
    }
    None
}

/// One reportable call: its range and the fix edits, if the fix is safe.
type Report = (u32, u32, Option<Vec<TextEdit>>);

fn collect(node: &Value, source: &str, reports: &mut Vec<Report>) {
    if node_type(node) != Some("CallExpression") {
        return;
    }
    let Some(callee) = node.get("callee") else {
        return;
    };
    if !is_derived_by_callee(callee) {
        return;
    }
    let Some(args) = node.get("arguments").and_then(Value::as_array) else {
        return;
    };
    if args.len() != 1 {
        return;
    }
    let arg = &args[0];
    let Some(kind) = simple_thunk_kind(arg) else {
        return;
    };
    let Some(expr) = returned_expression(arg, kind, source) else {
        return;
    };
    let (Some(call_start), Some(call_end)) = (node_start(node), node_end(node)) else {
        return;
    };
    let edits = fix_edits(node, callee, arg, &expr, source);
    reports.push((call_start, call_end, edits));
}

fn present<'a>(node: &'a Value, key: &str) -> Option<&'a Value> {
    node.get(key).filter(|v| !v.is_null())
}

fn span(node: &Value) -> Option<(u32, u32)> {
    Some((node_start(node)?, node_end(node)?))
}

/// A token of the call's source with its absolute offsets.
struct Tok<'a> {
    start: u32,
    end: u32,
    token: Token<'a>,
}

impl Tok<'_> {
    fn is_punct(&self, text: &str) -> bool {
        self.token.kind == TokenKind::Punctuator && self.token.text == text
    }
}

fn tokens_of(source: &str, start: u32, end: u32) -> Option<Vec<Tok<'_>>> {
    let text = source.get(start as usize..end as usize)?;
    let base = text.as_ptr() as usize;
    tokenize(text)
        .into_iter()
        .map(|token| {
            let offset = u32::try_from(token.text.as_ptr() as usize - base).ok()?;
            let len = u32::try_from(token.text.len()).ok()?;
            Some(Tok {
                start: start + offset,
                end: start + offset + len,
                token,
            })
        })
        .collect()
}

/// `getParenthesizedRange`: widen `range` over each `( … )` pair whose opening
/// paren is not before `parent_start`.
fn parenthesized_range(tokens: &[Tok<'_>], range: (u32, u32), parent_start: u32) -> (u32, u32) {
    let mut range = range;
    loop {
        let before = tokens
            .iter()
            .rev()
            .find(|t| !t.token.is_comment() && t.end <= range.0);
        let after = tokens
            .iter()
            .find(|t| !t.token.is_comment() && t.start >= range.1);
        match (before, after) {
            (Some(b), Some(a)) if b.is_punct("(") && a.is_punct(")") && b.start >= parent_start => {
                range = (b.start, a.end);
            }
            _ => return range,
        }
    }
}

type Visitor<'a, 'f> = dyn FnMut(&'a Value, Option<(&'a Value, &str)>) -> bool + 'f;

/// Visit `node` and every node under it with the parent and key it hangs
/// from, not descending below a node for which `f` returns `false`.
fn visit<'a>(node: &'a Value, f: &mut Visitor<'a, '_>) {
    fn children<'a>(node: &'a Value, f: &mut Visitor<'a, '_>) {
        let Some(obj) = node.as_object() else {
            return;
        };
        for (key, value) in obj {
            if key == "loc" {
                continue;
            }
            let items: &[Value] = match value {
                Value::Array(items) => items,
                Value::Object(_) => std::slice::from_ref(value),
                _ => continue,
            };
            for child in items {
                if node_type(child).is_some() && f(child, Some((node, key.as_str()))) {
                    children(child, f);
                }
            }
        }
    }
    if f(node, None) {
        children(node, f);
    }
}

fn is_plain_function(node: &Value) -> bool {
    matches!(
        node_type(node),
        Some("FunctionExpression" | "FunctionDeclaration")
    )
}

/// `usesThisOrNewTarget`: `this` / `new.target` outside any nested non-arrow
/// function.
fn uses_this_or_new_target(body: &Value) -> bool {
    let mut found = false;
    visit(body, &mut |node, _| {
        if found {
            return false;
        }
        match node_type(node) {
            Some("ThisExpression") => found = true,
            Some("MetaProperty") if node.get("meta").and_then(ident_name) == Some("new") => {
                found = true;
            }
            _ => {}
        }
        !found && !is_plain_function(node)
    });
    found
}

/// Whether an `Identifier` hanging from `parent.key` reads a binding.
fn is_reference(parent: Option<(&Value, &str)>) -> bool {
    let Some((parent, key)) = parent else {
        return true;
    };
    let computed = parent.get("computed").and_then(Value::as_bool) == Some(true);
    match (node_type(parent), key) {
        (Some("MemberExpression"), "property")
        | (
            Some("Property" | "MethodDefinition" | "PropertyDefinition" | "AccessorProperty"),
            "key",
        ) => computed,
        (Some("MetaProperty"), _)
        | (Some("LabeledStatement" | "BreakStatement" | "ContinueStatement"), "label")
        | (
            Some(
                "VariableDeclarator"
                | "FunctionDeclaration"
                | "FunctionExpression"
                | "ClassDeclaration"
                | "ClassExpression",
            ),
            "id",
        ) => false,
        _ => true,
    }
}

/// Whether `body` references `name`. With `stop_at_functions`, nested
/// non-arrow functions (which bind their own `arguments`) are not entered.
/// Inner bindings that shadow `name` are not resolved, so a shadowed use also
/// counts.
fn references(body: &Value, name: &str, stop_at_functions: bool) -> bool {
    let mut found = false;
    visit(body, &mut |node, parent| {
        if found {
            return false;
        }
        if ident_name(node) == Some(name) && is_reference(parent) {
            found = true;
        }
        !found && !(stop_at_functions && is_plain_function(node))
    });
    found
}

/// `usesOwnBindings`: `arguments`, the function's own name, `this` or
/// `new.target`, each of which `$derived()` would rebind.
fn uses_own_bindings(function: &Value) -> bool {
    let Some(body) = function.get("body") else {
        return false;
    };
    if references(body, "arguments", true) {
        return true;
    }
    if let Some(name) = present(function, "id").and_then(ident_name)
        && references(body, name, false)
    {
        return true;
    }
    uses_this_or_new_target(body)
}

/// Port of upstream's `fix(fixer)`; `None` where upstream returns `null`.
fn fix_edits(
    call: &Value,
    callee: &Value,
    arg: &Value,
    expr: &Value,
    source: &str,
) -> Option<Vec<TextEdit>> {
    let text = |node: &Value| -> Option<&str> {
        let (start, end) = span(node)?;
        source.get(start as usize..end as usize)
    };
    let type_arguments = present(call, "typeArguments").or_else(|| present(call, "typeParameters"));
    // typescript-eslint has no `TSParenthesizedType`; its type node is the inner one.
    let return_type = present(arg, "returnType").map(|rt| {
        let mut ty = present(rt, "typeAnnotation").unwrap_or(rt);
        while node_type(ty) == Some("TSParenthesizedType") {
            match present(ty, "typeAnnotation") {
                Some(inner) => ty = inner,
                None => break,
            }
        }
        ty
    });
    if present(arg, "typeParameters").is_some()
        || return_type.is_some_and(|rt| node_type(rt) == Some("TSTypePredicate"))
    {
        return None;
    }
    if let (Some(type_arguments), Some(return_type)) = (type_arguments, return_type)
        && text(type_arguments)? != format!("<{}>", text(return_type)?)
    {
        return None;
    }
    if node_type(arg) == Some("FunctionExpression") && uses_own_bindings(arg) {
        return None;
    }

    let (call_start, call_end) = span(call)?;
    let tokens = tokens_of(source, call_start, call_end)?;
    let (arg_start, arg_end) = span(arg)?;
    let body = arg.get("body")?;
    let block = node_type(body) == Some("BlockStatement");
    let expr_range = span(expr)?;
    // The kept text starts at the first token or comment after the `return`
    // keyword (the first token of the expression's parent) or after the arrow
    // of a concise body.
    let (before_end, expr_parent_start) = if block {
        let stmt_start = node_start(body.get("body")?.as_array()?.first()?)?;
        let keyword = tokens.iter().find(|t| t.start >= stmt_start)?;
        (keyword.end, stmt_start)
    } else {
        let body_start = node_start(body)?;
        let arrow = tokens
            .iter()
            .rev()
            .find(|t| t.end <= body_start && t.start >= arg_start && t.is_punct("=>"))?;
        (arrow.end, arg_start)
    };
    let kept_start = tokens.iter().find(|t| t.start >= before_end)?.start;
    let kept_end = if block {
        parenthesized_range(&tokens, expr_range, expr_parent_start).1
    } else {
        arg_end
    };
    let type_text = match (type_arguments, return_type) {
        (None, Some(rt)) => format!("<{}>", text(rt)?),
        _ => String::new(),
    };
    let removed = [
        (node_end(callee.get("object")?)?, node_end(callee)?),
        (arg_start, kept_start),
        (kept_end, arg_end),
    ];
    let kept_type_range = if type_text.is_empty() {
        None
    } else {
        return_type.and_then(span)
    };
    let loses_comment = tokens.iter().filter(|t| t.token.is_comment()).any(|c| {
        !kept_type_range.is_some_and(|(s, e)| s <= c.start && c.end <= e)
            && removed.iter().any(|&(s, e)| s <= c.start && c.end <= e)
    });
    if loses_comment {
        return None;
    }
    // A sequence expression would otherwise become multiple arguments.
    let needs_parens = node_type(expr) == Some("SequenceExpression")
        && parenthesized_range(&tokens, expr_range, expr_parent_start).0 == expr_range.0;
    let edit = |(start, end): (u32, u32), new_text: &str| TextEdit {
        start,
        end,
        new_text: new_text.to_string(),
    };
    Some(vec![
        edit(removed[0], &type_text),
        edit(removed[1], if needs_parens { "(" } else { "" }),
        edit(removed[2], if needs_parens { ")" } else { "" }),
    ])
}

fn emit(ctx: &mut LintContext, mut reports: Vec<Report>) {
    reports.sort_unstable_by_key(|r| (r.0, r.1));
    reports.dedup_by_key(|r| (r.0, r.1));
    for (call_start, call_end, edits) in reports {
        match edits {
            Some(edits) => {
                let fix = Fix {
                    message: MESSAGE.to_string(),
                    edits,
                };
                ctx.report_with_fix(call_start, call_end, MESSAGE, fix);
            }
            None => ctx.report(call_start, call_end, MESSAGE),
        }
    }
}

#[derive(Default)]
pub struct PreferDerivedOverDerivedBy;

impl ScriptRule for PreferDerivedOverDerivedBy {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let source = ctx.source();
        let mut reports: Vec<Report> = Vec::new();
        program.walk(|node, _| collect(node, source, &mut reports));
        emit(ctx, reports);
    }
}

/// Template pass: `$derived.by(…)` inside template expressions. The `<script>`
/// programs are covered by `check_program`, so this walks only the fragment.
impl Rule for PreferDerivedOverDerivedBy {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &rsvelte_core::ast::template::Root) {
        let source = ctx.source();
        // The template pass is not runes-gated by the engine, and upstream's
        // `runes: [true, 'undetermined']` condition must still hold here.
        if !crate::runes_mode::component_runes_mode(
            ctx.config().svelte_features_runes(),
            root,
            source,
        ) {
            return;
        }
        let fragment = ctx.template_fragment_json();
        let mut reports: Vec<Report> = Vec::new();
        walk_js(&fragment, |node, _| collect(node, source, &mut reports));
        emit(ctx, reports);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn detects_derived_by_callee() {
        assert!(is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "$derived" },
            "property": { "type": "Identifier", "name": "by" }
        })));
        // computed member access does not match
        assert!(!is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": true,
            "object": { "type": "Identifier", "name": "$derived" },
            "property": { "type": "Identifier", "name": "by" }
        })));
        // wrong object / property
        assert!(!is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "$derived" },
            "property": { "type": "Identifier", "name": "from" }
        })));
        assert!(!is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "derived" },
            "property": { "type": "Identifier", "name": "by" }
        })));
    }

    #[test]
    fn simple_thunk_kind_filters() {
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "ArrowFunctionExpression",
                "params": [], "async": false, "generator": false
            })),
            Some("ArrowFunctionExpression")
        );
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "FunctionExpression",
                "params": [], "async": false, "generator": false
            })),
            Some("FunctionExpression")
        );
        // params present
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "ArrowFunctionExpression",
                "params": [{ "type": "Identifier", "name": "x" }],
                "async": false, "generator": false
            })),
            None
        );
        // async
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "ArrowFunctionExpression",
                "params": [], "async": true, "generator": false
            })),
            None
        );
        // generator
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "FunctionExpression",
                "params": [], "async": false, "generator": true
            })),
            None
        );
        // not a function
        assert_eq!(
            simple_thunk_kind(&json!({ "type": "Identifier", "name": "f" })),
            None
        );
    }

    #[test]
    fn returned_expression_concise_arrow() {
        let arg = json!({
            "type": "ArrowFunctionExpression",
            "params": [], "async": false, "generator": false,
            "body": { "type": "MemberExpression", "start": 10, "end": 13 }
        });
        let expr = returned_expression(&arg, "ArrowFunctionExpression", "").unwrap();
        assert_eq!(node_type(&expr), Some("MemberExpression"));
    }

    #[test]
    fn returned_expression_block_single_return() {
        let arg = json!({
            "type": "ArrowFunctionExpression",
            "params": [], "async": false, "generator": false,
            "body": {
                "type": "BlockStatement",
                "body": [
                    { "type": "ReturnStatement",
                      "argument": { "type": "Identifier", "name": "a", "start": 5, "end": 6 } }
                ]
            }
        });
        let expr = returned_expression(&arg, "ArrowFunctionExpression", "").unwrap();
        assert_eq!(node_type(&expr), Some("Identifier"));
    }

    #[test]
    fn returned_expression_rejects_multi_statement_and_bare_return() {
        // multi-statement block
        let multi = json!({
            "type": "ArrowFunctionExpression",
            "body": {
                "type": "BlockStatement",
                "body": [
                    { "type": "VariableDeclaration" },
                    { "type": "ReturnStatement", "argument": { "type": "Identifier" } }
                ]
            }
        });
        assert!(returned_expression(&multi, "ArrowFunctionExpression", "").is_none());

        // bare `return;`
        let bare = json!({
            "type": "ArrowFunctionExpression",
            "body": {
                "type": "BlockStatement",
                "body": [ { "type": "ReturnStatement", "argument": null } ]
            }
        });
        assert!(returned_expression(&bare, "ArrowFunctionExpression", "").is_none());

        // block-bodied arrow but the single statement is not a return
        let no_return = json!({
            "type": "ArrowFunctionExpression",
            "body": {
                "type": "BlockStatement",
                "body": [ { "type": "ExpressionStatement" } ]
            }
        });
        assert!(returned_expression(&no_return, "ArrowFunctionExpression", "").is_none());
    }

    #[test]
    fn only_trivia_classifies_gaps() {
        assert!(only_trivia(""));
        assert!(only_trivia(" \n\t"));
        assert!(only_trivia("// hi\n\u{a0}/* a */ "));
        assert!(!only_trivia("'use strict';"));
        assert!(!only_trivia("/* a */ \"use strict\";"));
        assert!(!only_trivia("/x/"));
    }

    #[test]
    fn hidden_statements_detected_from_the_gaps() {
        let source = "() => {\n\t'use strict';\n\treturn a;\n}";
        let block = json!({ "type": "BlockStatement", "start": 6, "end": 35 });
        let stmt = json!({ "type": "ReturnStatement", "start": 24, "end": 33 });
        assert!(block_has_hidden_statements(source, &block, &stmt));

        let plain = "() => {\n\treturn a;\n}";
        let block = json!({ "type": "BlockStatement", "start": 6, "end": 20 });
        let stmt = json!({ "type": "ReturnStatement", "start": 9, "end": 18 });
        assert!(!block_has_hidden_statements(plain, &block, &stmt));

        // a comment on either side is not a statement
        let commented = "() => { /* a */ return a; // b\n}";
        let block = json!({ "type": "BlockStatement", "start": 6, "end": 32 });
        let stmt = json!({ "type": "ReturnStatement", "start": 16, "end": 25 });
        assert!(!block_has_hidden_statements(commented, &block, &stmt));
    }

    fn fixed(source: &str) -> String {
        let config = crate::LintConfig::empty().with_override(META.name, Severity::Error);
        crate::runner::fix_source_at(source, &config, "Comp.svelte").output
    }

    /// `(input, eslint-plugin-svelte 3.24.1 --fix output)` per declaration.
    const JS_CASES: &[(&str, &str)] = &[
        ("$derived.by(() => ({ x: a }))", "$derived(({ x: a }))"),
        ("$derived.by(() => { return (a, b); })", "$derived((a, b))"),
        ("$derived.by(() => { return a, b; })", "$derived((a, b))"),
        ("$derived.by(() => (a, b))", "$derived((a, b))"),
        ("$derived.by(() => /* keep */ a)", "$derived(/* keep */ a)"),
        (
            "$derived.by(() => { return /* keep */ a; })",
            "$derived(/* keep */ a)",
        ),
        (
            "$derived.by(() => { return a; /* lost */ })",
            "$derived.by(() => { return a; /* lost */ })",
        ),
        (
            "$derived /* lost */ .by(() => a)",
            "$derived /* lost */ .by(() => a)",
        ),
        (
            "$derived.by(function () { return this; })",
            "$derived.by(function () { return this; })",
        ),
        (
            "$derived.by(function () { return arguments.length; })",
            "$derived.by(function () { return arguments.length; })",
        ),
        (
            "$derived.by(function f() { return f; })",
            "$derived.by(function f() { return f; })",
        ),
        (
            "$derived.by(function () { return () => this; })",
            "$derived.by(function () { return () => this; })",
        ),
        (
            "$derived.by(function () { return function () { return this; }; })",
            "$derived(function () { return this; })",
        ),
        (
            "$derived.by(function () { return ((a)); })",
            "$derived(((a)))",
        ),
        (
            "$derived.by(() => { return ((a + b)) })",
            "$derived(((a + b)))",
        ),
        ("$derived.by(function g() { return a; })", "$derived(a)"),
        (
            "$derived.by(function () { return new.target; })",
            "$derived.by(function () { return new.target; })",
        ),
        (
            "$derived.by(function () { return { arguments: 1 }.arguments; })",
            "$derived({ arguments: 1 }.arguments)",
        ),
        (
            "$derived.by(function () { return function () { return arguments; }; })",
            "$derived(function () { return arguments; })",
        ),
        (
            "$derived.by(() => { return a // trailing\n\t})",
            "$derived.by(() => { return a // trailing\n\t})",
        ),
        (
            "$derived.by(() => {\n\t\t/* only a comment */\n\t\treturn a;\n\t})",
            "$derived.by(() => {\n\t\t/* only a comment */\n\t\treturn a;\n\t})",
        ),
    ];

    const TS_CASES: &[(&str, &str)] = &[
        (
            "$derived.by((): number => a as number)",
            "$derived<number>(a as number)",
        ),
        (
            "$derived.by(() => a satisfies number)",
            "$derived(a satisfies number)",
        ),
        (
            "$derived.by<number>((): number => a)",
            "$derived<number>(a)",
        ),
        (
            "$derived.by<string>((): number => a)",
            "$derived.by<string>((): number => a)",
        ),
        (
            "$derived.by(<T,>(): number => a)",
            "$derived.by(<T,>(): number => a)",
        ),
        (
            "$derived.by((): a is number => true)",
            "$derived.by((): a is number => true)",
        ),
        (
            "$derived.by((): /* c */ number => a)",
            "$derived.by((): /* c */ number => a)",
        ),
        (
            "$derived.by(function (): number { return a; })",
            "$derived<number>(a)",
        ),
        ("$derived.by<number>(() => a)", "$derived<number>(a)"),
        (
            "$derived.by((): Array<number> => [a])",
            "$derived<Array<number>>([a])",
        ),
        (
            "$derived.by((): (() => number) => () => a)",
            "$derived<() => number>(() => a)",
        ),
    ];

    fn check(lang: &str, cases: &[(&str, &str)]) {
        for (input, expected) in cases {
            let wrap = |call: &str| {
                format!(
                    "<script{lang}>\n\tlet a = $state(1);\n\tlet b = $state(2);\n\tlet v = {call};\n</script>\n"
                )
            };
            assert_eq!(fixed(&wrap(input)), wrap(expected), "{input}");
        }
    }

    #[test]
    fn autofix_matches_upstream_js() {
        check("", JS_CASES);
    }

    #[test]
    fn autofix_matches_upstream_ts() {
        check(" lang=\"ts\"", TS_CASES);
    }

    #[test]
    fn template_sequence_keeps_its_parens() {
        let src = "<script>\n\tlet a = $state(1);\n\tlet b = $state(2);\n</script>\n\n{$derived.by(() => (a, b))}\n";
        assert_eq!(
            fixed(src),
            "<script>\n\tlet a = $state(1);\n\tlet b = $state(2);\n</script>\n\n{$derived((a, b))}\n"
        );
    }
}
