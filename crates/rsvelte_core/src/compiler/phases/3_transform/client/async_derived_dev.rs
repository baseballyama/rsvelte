//! Dev-mode `label` / `location` arguments for `$.async_derived(...)`.
//!
//! Mirrors `3-transform/client/visitors/VariableDeclaration.js` (`:211`, `:245`):
//! `$.async_derived(thunk, dev && name, location ? location : undefined)`, where
//! `location` is `locate_node(init)` unless `svelte-ignore await_waterfall`
//! covers the declaration. The runtime gates the warning on
//! `location !== undefined`, so omitting the argument disarms `await_waterfall`
//! rather than merely losing a label.
//!
//! The locations are collected from the ORIGINAL script text, because the
//! client instance-script pipeline walks a post-rune-transform script whose
//! spans no longer map to component source.

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};
use rustc_hash::FxHashMap;

use super::expression_utils::contains_direct_await_in_expression;
use crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore;

/// `filename:line:column` for every async `$derived(...)` declarator in one
/// script, keyed by each name the declarator binds. `None` marks a declaration
/// covered by `svelte-ignore await_waterfall` — upstream still emits the label
/// there, only the location is dropped.
#[derive(Debug, Default)]
pub(super) struct AsyncDerivedLocations {
    by_name: FxHashMap<String, Option<String>>,
}

impl AsyncDerivedLocations {
    /// `Some(None)` is a declaration we found and deliberately have no location
    /// for; `None` is a name we never saw, which the caller must not silently
    /// turn into the ignored form.
    pub(super) fn lookup(&self, name: &str) -> Option<Option<&str>> {
        self.by_name.get(name).map(|l| l.as_deref())
    }
}

/// The `, 'label'[, 'location']` tail of an `$.async_derived(...)` call.
///
/// `locations` is `None` for a non-dev build, in which case upstream drops both
/// arguments.
pub(super) fn dev_args(
    locations: Option<&AsyncDerivedLocations>,
    label: &str,
    lookup_name: &str,
) -> String {
    let Some(locations) = locations else {
        return String::new();
    };
    match locations.lookup(lookup_name) {
        Some(Some(location)) => format!(", {}, {}", quote(label), quote(location)),
        _ => format!(", {}", quote(label)),
    }
}

fn quote(value: &str) -> String {
    let mut out = String::with_capacity(value.len() + 2);
    out.push('\'');
    for ch in value.chars() {
        if ch == '\'' || ch == '\\' {
            out.push('\\');
        }
        out.push(ch);
    }
    out.push('\'');
    out
}

/// Upstream's `[$derived object]` / `[$derived iterable]` label for a
/// destructured declaration (`VariableDeclaration.js:252`).
pub(super) fn destructured_label(is_array_pattern: bool) -> &'static str {
    if is_array_pattern {
        "[$derived iterable]"
    } else {
        "[$derived object]"
    }
}

/// Collect the locations for one script.
///
/// * `outer_source` — the text line/column are measured against (the component
///   source for a `.svelte` file, the module itself for `.svelte.js`).
/// * `script_start` — offset of `script_text` inside `outer_source`.
/// * `script_text` — the script exactly as the user wrote it, before any
///   TypeScript stripping or rune rewriting.
///
/// Only top-level statements are walked: a suspending `await` anywhere deeper is
/// a `js_parse_error` ("await outside an async function"), so no async `$derived`
/// can be declared there.
pub(super) fn collect(
    outer_source: &str,
    script_start: u32,
    script_text: &str,
    filename: &str,
    is_typescript: bool,
    runes: bool,
) -> AsyncDerivedLocations {
    let mut out = AsyncDerivedLocations::default();
    let bytes = script_text.as_bytes();
    if memchr::memmem::find(bytes, b"$derived").is_none()
        || memchr::memmem::find(bytes, b"await").is_none()
    {
        return out;
    }

    let allocator = Allocator::default();
    let source_type = if is_typescript {
        SourceType::ts()
    } else {
        SourceType::mjs()
    };
    let parsed = Parser::new(&allocator, script_text, source_type).parse();
    if parsed.panicked {
        return out;
    }
    let program = &parsed.program;

    let sanitized_filename = filename.replace('/', "/\u{200b}");
    let mut prev_end: u32 = 0;

    for statement in &program.body {
        let (span, declaration) = match statement {
            Statement::VariableDeclaration(decl) => (decl.span, Some(&**decl)),
            Statement::ExportDeclaration(export) => (
                export.span,
                match &export.declaration {
                    Declaration::VariableDeclaration(decl) => Some(&**decl),
                    _ => None,
                },
            ),
            other => {
                prev_end = other.span().end;
                continue;
            }
        };
        let statement_start = span.start;
        let statement_end = span.end;

        if let Some(declaration) = declaration {
            let ignored = declaration_ignores_waterfall(
                script_text,
                program,
                prev_end,
                statement_start,
                runes,
            );
            for declarator in &declaration.declarations {
                let Some(call) = async_derived_call(script_text, declarator) else {
                    continue;
                };
                let location = (!ignored).then(|| {
                    let (line, column) =
                        line_and_column(outer_source, script_start + call.span.start);
                    format!("{sanitized_filename}:{line}:{column}")
                });
                let mut names = Vec::new();
                collect_bound_names(&declarator.id, &mut names);
                for name in names {
                    out.by_name.insert(name, location.clone());
                }
            }
        }

        prev_end = statement_end;
    }

    out
}

/// The `$derived(<expr with a suspending await>)` initializer, if this
/// declarator has one. `$derived.by` is excluded exactly as upstream's
/// `async_deriveds` set is (`2-analyze/visitors/CallExpression.js:245`).
fn async_derived_call<'a>(
    script_text: &str,
    declarator: &'a VariableDeclarator<'a>,
) -> Option<&'a CallExpression<'a>> {
    let Some(Expression::CallExpression(call)) = &declarator.init else {
        return None;
    };
    let Expression::Identifier(callee) = &call.callee else {
        return None;
    };
    if callee.name != "$derived" || call.arguments.len() != 1 {
        return None;
    }
    let arg_span = call.arguments[0].span();
    let arg_text = script_text.get(arg_span.start as usize..arg_span.end as usize)?;
    contains_direct_await_in_expression(arg_text.trim()).then_some(&**call)
}

/// The first name a pattern binds — the key `collect` registered every async
/// `$derived` under, and the only one a destructured declaration can be looked
/// up by.
pub(super) fn first_bound_name(pattern: &BindingPattern<'_>) -> Option<String> {
    let mut names = Vec::new();
    collect_bound_names(pattern, &mut names);
    names.into_iter().next()
}

fn collect_bound_names(pattern: &BindingPattern<'_>, out: &mut Vec<String>) {
    match pattern {
        BindingPattern::BindingIdentifier(id) => out.push(id.name.to_string()),
        BindingPattern::ObjectPattern(obj) => {
            for prop in &obj.properties {
                collect_bound_names(&prop.value, out);
            }
            if let Some(rest) = &obj.rest {
                collect_bound_names(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(arr) => {
            for element in arr.elements.iter().flatten() {
                collect_bound_names(element, out);
            }
            if let Some(rest) = &arr.rest {
                collect_bound_names(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(assign) => collect_bound_names(&assign.left, out),
    }
}

/// Whether a `svelte-ignore await_waterfall` comment attaches to the statement
/// starting at `statement_start`.
///
/// Mirrors acorn's leading-comment attachment (`1-parse/acorn.js:206`): every
/// comment before the node, except a first one that acorn would have claimed as
/// the *trailing* comment of the previous statement (`:240`).
fn declaration_ignores_waterfall(
    script_text: &str,
    program: &Program<'_>,
    prev_end: u32,
    statement_start: u32,
    runes: bool,
) -> bool {
    let mut first = true;
    for comment in &program.comments {
        if comment.span.start < prev_end || comment.span.end > statement_start {
            continue;
        }
        let claimed_as_trailing = first
            && script_text
                .get(prev_end as usize..comment.span.start as usize)
                .is_some_and(|gap| gap.chars().all(|c| matches!(c, ',' | ')' | ' ' | '\t')));
        first = false;
        if claimed_as_trailing {
            continue;
        }
        let content = comment.content_span();
        let Some(text) = script_text.get(content.start as usize..content.end as usize) else {
            continue;
        };
        if extract_svelte_ignore(text, runes)
            .iter()
            .any(|code| code == "await_waterfall")
        {
            return true;
        }
    }
    false
}

/// 1-based line and 0-based column, counted in UTF-16 code units so the result
/// matches `locate-character`'s (upstream `locate_node`).
fn line_and_column(source: &str, offset: u32) -> (usize, usize) {
    let offset = (offset as usize).min(source.len());
    let before = &source[..offset];
    let line = before.matches('\n').count() + 1;
    let line_start = before.rfind('\n').map_or(0, |p| p + 1);
    let column = source[line_start..offset]
        .chars()
        .map(char::len_utf16)
        .sum();
    (line, column)
}
