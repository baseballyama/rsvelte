use std::cell::RefCell;
use std::collections::HashMap;

use oxc_ast::ast::{Program, TSAsExpression, TSSatisfiesExpression, TSType};
use oxc_ast_visit::{Visit, walk};
use oxc_formatter::{QuoteStyle, format_program};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

use super::formatter_parse_options;
use super::text::{strip_leading_paren_pair, strip_outer_parens};
use crate::error::FormatError;
use crate::options::FormatOptions;
use crate::width::{VisualWidth, tab_width};

/// Format a single JS expression source at `line_width`. Wraps in parens to
/// force expression context (so object literals like `{a:1}` aren't parsed as
/// block statements) and strips the `( … );` wrapper from the output. With
/// `single_line`, the formatter is held on one line (`Expand::Never` + max
/// width) for spots where a break can't survive — block headers and the like.
/// The result may otherwise be multi-line, with continuation lines at
/// `oxc_formatter`'s own relative indent (measured from column 0).
/// Nested awaits do not need the statement wrapper's width compensation.
pub(super) fn has_leading_await(s: &str) -> bool {
    let rest = s.trim_start_matches(|c: char| c.is_ascii_whitespace() || c == '(');
    let Some(rest) = rest.strip_prefix("await") else {
        return false;
    };
    !matches!(
        rest.as_bytes().first(),
        Some(b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'_' | b'$')
    )
}

/// A reserved word or contextual keyword that a bare word matching the
/// identifier grammar must NOT be treated as an identifier reference: some
/// (`class`, `for`, `await` in a module) would fail to parse as a bare
/// expression, so emitting the slice verbatim would turn an error into output.
/// Conservative on purpose — a real identifier that happens to be listed here
/// (e.g. `async` used as a variable) simply falls through to the oxc path,
/// which still emits it verbatim.
fn is_reserved_ident(s: &str) -> bool {
    matches!(
        s,
        "await"
            | "break"
            | "case"
            | "catch"
            | "class"
            | "const"
            | "continue"
            | "debugger"
            | "default"
            | "delete"
            | "do"
            | "else"
            | "enum"
            | "export"
            | "extends"
            | "false"
            | "finally"
            | "for"
            | "function"
            | "if"
            | "import"
            | "in"
            | "instanceof"
            | "new"
            | "null"
            | "return"
            | "super"
            | "switch"
            | "this"
            | "throw"
            | "true"
            | "try"
            | "typeof"
            | "var"
            | "void"
            | "while"
            | "with"
            | "yield"
            | "let"
            | "static"
            | "async"
            | "of"
            | "as"
            | "satisfies"
            | "get"
            | "set"
    )
}

/// A bare ASCII identifier reference (`foo`, `_x`, `$store`, `$$props`): first
/// byte an identifier start, the rest identifier continues, and not a reserved
/// word. The oxc formatter emits such a token verbatim at any width.
fn is_plain_identifier(s: &str) -> bool {
    let b = s.as_bytes();
    let Some(&first) = b.first() else {
        return false;
    };
    if !(first.is_ascii_alphabetic() || first == b'_' || first == b'$') {
        return false;
    }
    if !b[1..]
        .iter()
        .all(|&c| c.is_ascii_alphanumeric() || c == b'_' || c == b'$')
    {
        return false;
    }
    !is_reserved_ident(s)
}

/// A plain non-negative integer literal (`0`, `42`) with no leading zero,
/// decimal point, exponent, separator, radix prefix, or bigint suffix. The oxc
/// formatter emits such a literal verbatim; the excluded forms it may normalize
/// (`1.0`, `0x1F`, `1_000`, `.5`) fall through to the full path.
fn is_plain_integer(s: &str) -> bool {
    match s.as_bytes() {
        [b'0'] => true,
        [first, rest @ ..] if first.is_ascii_digit() && *first != b'0' => {
            rest.iter().all(u8::is_ascii_digit)
        }
        _ => false,
    }
}

/// An atomic literal the oxc formatter always emits verbatim at any width:
/// the keyword primaries `this` / `true` / `false` / `null`, or a plain
/// integer. Unlike a general numeric/string literal these need no quote or
/// numeric normalization.
fn is_simple_literal(s: &str) -> bool {
    matches!(s, "this" | "true" | "false" | "null") || is_plain_integer(s)
}

/// An identifier-shaped ASCII token, ignoring reserved-word status. Used for the
/// non-head segments of a member chain, where reserved words are valid property
/// names (`a.class`, `a.for`).
fn is_ident_shaped(s: &str) -> bool {
    let b = s.as_bytes();
    let Some(&first) = b.first() else {
        return false;
    };
    (first.is_ascii_alphabetic() || first == b'_' || first == b'$')
        && b[1..]
            .iter()
            .all(|&c| c.is_ascii_alphanumeric() || c == b'_' || c == b'$')
}

/// A pure dotted member chain of ASCII identifiers (`a.b.c`, `this.x.y`,
/// `$page.data.title`) that fits within `line_width`. The head must be a real
/// identifier reference (or `this`); each later segment is any identifier-shaped
/// token. oxc emits such a chain verbatim only while it fits — an over-wide
/// pure-property chain breaks onto `\n  .seg` continuation lines — so the width
/// guard is load-bearing. `?.` chains and any segment with whitespace/comments
/// are excluded (they contain non-identifier bytes).
fn is_member_chain_within_width(s: &str, line_width: oxc_formatter_core::LineWidth) -> bool {
    if !s.contains('.') {
        return false;
    }
    // Every segment is a pure-ASCII identifier token, so the whole slice is
    // ASCII and its byte length equals its display width. A line exactly at the
    // print width still fits (the formatter overflows only strictly beyond it).
    if s.len() > line_width.value() as usize {
        return false;
    }
    let mut segs = s.split('.');
    let Some(head) = segs.next() else {
        return false;
    };
    if !(is_plain_identifier(head) || head == "this") {
        return false;
    }
    segs.all(is_ident_shaped)
}

/// Fast path for [`format_expr_core`]: if the trimmed source is a token the oxc
/// formatter would emit unchanged, return that slice so the parse+format
/// round-trip can be skipped. The predicate is strict — it must never accept an
/// expression whose formatted form would differ from its verbatim source, so
/// anything not provably identity-formatted returns `None` and falls through to
/// the full path. Atomic tokens (identifiers, simple literals) are
/// width-independent; a member chain is verbatim only within `line_width`.
pub(super) fn trivial_expr_verbatim(
    expr_source: &str,
    line_width: oxc_formatter_core::LineWidth,
) -> Option<&str> {
    let s = expr_source.trim();
    if is_plain_identifier(s) || is_simple_literal(s) || is_member_chain_within_width(s, line_width)
    {
        return Some(s);
    }
    None
}

/// Per-file cache of formatted expression results. A single component reuses
/// the same interpolation many times (30% of non-trivial expression formats in
/// the corpus are exact intra-file repeats — e.g. `{item.href}` once per
/// each-loop iteration site), so caching the oxc round-trip's output skips the
/// repeat parse+format entirely.
///
/// The key is everything that determines [`format_expr_core`]'s output and can
/// vary between two calls within one file: the raw source slice, the print
/// width, the single-line flag, and the quote style (an attribute-embedded
/// expression is formatted single-quoted, the same slice elsewhere double).
/// Every other output-affecting option (indent, semicolons, TS dialect) is
/// constant for the whole file, so it need not be keyed. Cleared per file at
/// [`crate::format_with_arenas`] entry, so it never mixes two documents.
///
/// Invariant: within one `format_with_arenas` scope every `format_expr_core`
/// call shares the same non-keyed options — only the keyed fields differ — and a
/// nested `format_with_arenas` (the collapse `<pre>` re-entry) clears the memo on
/// entry, so a sub-document formatted with different options cannot read a
/// parent's cached entry.
/// The `bool` after `single_line` is the TS/JS dialect (`options.typescript`):
/// the #682 retry re-formats the same expression source in the other dialect, so
/// the dialect must key the cache even though `clear_expr_memo()` already runs
/// per attempt — belt-and-suspenders against a future change to the clear timing
/// silently returning a JS-formatted result for a TS retry.
type ExprMemoKey = (String, u16, bool, bool, QuoteStyle);
thread_local! {
    static EXPR_MEMO: RefCell<HashMap<ExprMemoKey, String>> = RefCell::new(HashMap::new());
}

/// Drop the previous attempt's cached expression results. Called once per format
/// attempt (up to two per file when the #682 TS retry fires).
pub(crate) fn clear_expr_memo() {
    EXPR_MEMO.with(|m| m.borrow_mut().clear());
}

pub(super) fn format_expr_core(
    expr_source: &str,
    options: &FormatOptions,
    line_width: oxc_formatter_core::LineWidth,
    single_line: bool,
) -> Result<String, FormatError> {
    if let Some(out) = trivial_expr_verbatim(expr_source, line_width) {
        return Ok(out.to_string());
    }
    let key: ExprMemoKey = (
        expr_source.to_string(),
        line_width.value(),
        single_line,
        options.typescript,
        options.js.quote_style,
    );
    if let Some(cached) = EXPR_MEMO.with(|m| m.borrow().get(&key).cloned()) {
        return Ok(cached);
    }
    let allocator = crate::scratch::acquire();

    // The wrapper and source type used to parse the expression snippet vary
    // depending on whether the file is TypeScript and whether the expression
    // starts with `await`:
    //
    // Case A — TypeScript + leading `await`:
    //   Use `const _rsvelte_x_ = (expr);` with `SourceType::ts().with_module(true)`.
    //
    //   `with_module(true)` is required so `await` is always a keyword: in
    //   `Unambiguous` mode a snippet without `import`/`export` is classified as
    //   a Script where `await` is a regular identifier.
    //
    //   The `const` wrapper (instead of the plain `(expr);`) prevents OXC from
    //   breaking a nested-await member chain across lines.  When the same
    //   expression appears as a top-level ExpressionStatement, OXC breaks it
    //   (`(await (await a.nested).one);` → multi-line); as a const initializer
    //   OXC keeps it on one line.  The const wrapper is only used when `await`
    //   is the outer expression; applying its width compensation to nested awaits
    //   would suppress correct inner breaking.
    //
    //   The const-wrapper prefix is exactly 20 characters (`const _rsvelte_x_ = `).
    //   We pass `line_width + 20` to the formatter so OXC's break decision is
    //   based on `len(expr)` rather than `20 + len(expr)`.  This offset is exact
    //   for the single-line case (the only case that matters here — multi-line
    //   await expressions inside Svelte templates are extremely rare and the
    //   const-wrapper context keeps them inline anyway).
    //
    //   Note: OXC already emits a space after `await` when the argument is a
    //   parenthesized expression (`await (x)`, not `await(x)`), so no post-pass
    //   is needed.
    //
    // Case B — TypeScript, no leading `await`:
    //   Use `(expr);` with `SourceType::ts().with_module(true)`.
    //   `with_module(true)` ensures consistent TS parsing (e.g., type casts),
    //   Nested awaits remain inside their own expression context, so no const
    //   wrapper is needed.
    //
    // Case C — JavaScript:
    //   Use `(expr);` with `SourceType::default()` (Unambiguous).
    //   JavaScript template expressions cannot contain `await` as a keyword
    //   (template tags are synchronous), so no special handling is needed.
    const TS_CONST_PREFIX: &str = "const _rsvelte_x_ = ";
    // TS_CONST_PREFIX.len() == 20
    const TS_CONST_PREFIX_LEN: u16 = 20;

    let expr_has_await = options.typescript && has_leading_await(expr_source);

    let (wrapped, source_type, use_const_wrapper) = if expr_has_await {
        // Case A: TS + leading await — use const wrapper to avoid multi-line breaking
        let wrapped = format!("{TS_CONST_PREFIX}({expr_source});");
        let source_type = SourceType::ts().with_module(true);
        (wrapped, source_type, true)
    } else if options.typescript {
        // Case B: TS, no leading await — plain paren wrapper, still ESM for consistency
        let wrapped = format!("({expr_source});");
        let source_type = SourceType::ts().with_module(true);
        (wrapped, source_type, false)
    } else {
        // Case C: JS
        let wrapped = format!("({expr_source});");
        let source_type = SourceType::default();
        (wrapped, source_type, false)
    };

    let parser_ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
    }

    // Detect a top-level sequence (comma) expression — only needed for the JS
    // `(expr);` wrapper.  For the TS const wrapper, OXC naturally keeps the
    // parens that make a sequence expression valid in a const initializer
    // (`const _rsvelte_x_ = (a, b);`), so no extra detection is required.
    //
    // For the JS wrapper, oxc_formatter intentionally re-adds the outer parens
    // of a top-level `SequenceExpression` (its `NeedsParentheses` impl returns
    // true for an `ExpressionStatement` parent), and prettier-plugin-svelte
    // keeps them — so `{((a = 1), '')}` must stay parenthesized. Stripping
    // them below would wrongly emit `{(a = 1), ''}` (#799).
    //
    // A top-level ASSIGNMENT expression behaves identically: in expression
    // position (mustache / attribute value / block header) prettier-plugin-svelte
    // always wraps it in exactly one pair — `{x = 5}` → `{(x = 5)}`,
    // `{(y = [])}` → `{(y = [])}` — whereas OXC at statement position strips the
    // parens. Treat both the same way: strip every redundant outer pair, then
    // re-wrap once.
    let is_top_paren_wrapped = !use_const_wrapper
        && matches!(
            parser_ret.program.body.first(),
            Some(oxc_ast::ast::Statement::ExpressionStatement(stmt))
                if matches!(
                    stmt.expression,
                    oxc_ast::ast::Expression::SequenceExpression(_)
                        | oxc_ast::ast::Expression::AssignmentExpression(_)
                )
        );

    // Detect an object literal that is the HEAD of a larger expression — the
    // object of a member access or callee of a call (`{ … }[key]`, `{ … }.foo`,
    // `{ … }()`). OXC parenthesizes the leading object because at statement
    // position a bare `{` would start a block, so it emits `({ … })[key]`. In a
    // mustache/attribute value the expression is in expression position, so
    // prettier-plugin-svelte keeps no parens (`{ … }[key]`). `strip_outer_parens`
    // can't help here because the formatted string ends with `]`/`.`/`)` of the
    // postfix, not the wrapper `)`. Flag it so the leading pair is stripped below.
    let leading_object_head = !use_const_wrapper
        && matches!(
            parser_ret.program.body.first(),
            Some(oxc_ast::ast::Statement::ExpressionStatement(stmt))
                if expr_has_object_head(&stmt.expression)
        );
    let object_type_assertion = !use_const_wrapper
        && matches!(
            parser_ret.program.body.first(),
            Some(oxc_ast::ast::Statement::ExpressionStatement(stmt))
                if expr_is_object_type_assertion(&stmt.expression)
        );

    let mut js = options.js.clone();
    // Compensate for the const-wrapper prefix: tell OXC the line is `prefix_len`
    // characters wider than the target so its break decision is based on the
    // expression length alone.
    if use_const_wrapper {
        let lw = line_width.value().saturating_add(TS_CONST_PREFIX_LEN);
        js.line_width =
            oxc_formatter_core::LineWidth::try_from(lw).unwrap_or(options.js.line_width);
    } else {
        js.line_width = line_width;
    }
    if single_line {
        js.expand = oxc_formatter::Expand::Never;
    }
    let formatted = format_program(allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    // Template-position `x as A | B` / `x satisfies A | B`: oxc ties the union's
    // leading-`|` break to the `as`/`satisfies` annotation break, so once the
    // annotation moves to its own line the union always expands. The oxfmt
    // oracle formats template expressions with prettier's estree printer, which
    // keeps the union flat on the annotation line when it fits (only `<script>`
    // blocks — a separate `format_program` path — share oxc's behaviour). No
    // print width reaches that layout in oxc, so reflow the flat form here when
    // the flat line fits. The proper fix is a separate-group `as` layout in
    // oxc_formatter upstream.
    //
    // Skipped on the const-wrapper (await) path: there oxc lays out at
    // `line_width + 20` and the wrapper prefix is stripped afterwards, so the
    // reflow's column/budget measurement would not match the final output — an
    // `as`-union inside a template `await` expression is vanishingly rare, so
    // leaving oxc's form is the safe choice.
    let formatted = if !use_const_wrapper && program_has_as_or_satisfies_union(&parser_ret.program)
    {
        reflow_flat_as_satisfies_unions(
            &formatted,
            line_width.value() as usize,
            tab_width(options),
            source_type,
        )
    } else {
        formatted
    };

    let s = formatted.trim_end().trim_end_matches(';').trim_end();
    // With semicolons set to "as needed", OXC prefixes expression statements
    // such as arrow functions with an ASI guard. Template expressions are not
    // statement-position code, so carrying that guard into `{...}` is invalid.
    let s = s.strip_prefix(';').unwrap_or(s);

    let result = if use_const_wrapper {
        // Strip the `const _rsvelte_x_ = ` prefix that was added as a wrapper.
        // OXC may strip the inner parens we added (e.g. `(expr)` → `expr`) or
        // keep them when needed for disambiguation (e.g. sequence expressions
        // `(a, b)` stay parenthesized inside a const initializer).
        //
        // Two cases depending on whether OXC kept the expression inline:
        //
        // Inline: `const _rsvelte_x_ = expr` → strip the `prefix ` (with space).
        //
        // Multiline: `const _rsvelte_x_ =\n  firstLine\n  continuation`
        //   → strip `const _rsvelte_x_ =\n` and trim leading whitespace from the
        //   first continuation line (OXC indents at 2 spaces), yielding
        //   `firstLine\n  continuation` — the same shape the old `(expr);` wrapper
        //   produced after outer-paren stripping.
        if let Some(rest) = s.strip_prefix(TS_CONST_PREFIX) {
            // Inline case: `const _rsvelte_x_ = expr`
            rest.to_string()
        } else if let Some(rest) = s.strip_prefix("const _rsvelte_x_ =\n") {
            // Multiline case: value on next line(s), indented by OXC
            rest.trim_start().to_string()
        } else {
            // Fallback (shouldn't occur): return unchanged
            s.to_string()
        }
    } else {
        // prettier-plugin-svelte keeps exactly ONE set of outer parens around a
        // top-level sequence (comma) expression in both mustache/attribute values
        // AND block headers (`{#if (a, b)}`). Normalise to exactly one pair by
        // stripping all redundant outer pairs then re-wrapping once. (#799)
        if is_top_paren_wrapped {
            let mut inner = s.trim();
            loop {
                let stripped = strip_outer_parens(inner).trim();
                if stripped == inner {
                    break;
                }
                inner = stripped;
            }
            format!("({inner})")
        } else if leading_object_head || object_type_assertion {
            // Strip the leading `( … )` pair OXC wrapped around the head object,
            // keeping the postfix or type operator verbatim.
            strip_leading_paren_pair(s).unwrap_or_else(|| s.to_string())
        } else {
            strip_outer_parens(s).trim().to_string()
        }
    };
    EXPR_MEMO.with(|m| m.borrow_mut().insert(key, result.clone()));
    Ok(result)
}

fn expr_is_object_type_assertion(expr: &oxc_ast::ast::Expression) -> bool {
    use oxc_ast::ast::Expression as E;

    match expr {
        E::TSAsExpression(expr) => matches!(expr.expression, E::ObjectExpression(_)),
        E::TSSatisfiesExpression(expr) => matches!(expr.expression, E::ObjectExpression(_)),
        _ => false,
    }
}

/// AST gate for [`reflow_flat_as_satisfies_unions`]: does the program contain
/// any `x as A | B` / `x satisfies A | B` whose annotation is a ≥2-member union?
/// Only such expressions produce oxc's leading-`|` layout that the reflow
/// targets, so the (structural, non-node-mapped) string pass runs only when the
/// AST confirms the construct genuinely exists.
fn program_has_as_or_satisfies_union(program: &Program<'_>) -> bool {
    struct Finder {
        found: bool,
    }
    impl<'a> Visit<'a> for Finder {
        fn visit_ts_as_expression(&mut self, expr: &TSAsExpression<'a>) {
            self.found |= is_multi_member_union(&expr.type_annotation);
            walk::walk_ts_as_expression(self, expr);
        }
        fn visit_ts_satisfies_expression(&mut self, expr: &TSSatisfiesExpression<'a>) {
            self.found |= is_multi_member_union(&expr.type_annotation);
            walk::walk_ts_satisfies_expression(self, expr);
        }
    }
    let mut finder = Finder { found: false };
    finder.visit_program(program);
    finder.found
}

fn is_multi_member_union(ty: &TSType<'_>) -> bool {
    matches!(ty, TSType::TSUnionType(u) if u.types.len() >= 2)
}

/// Collapse oxc's leading-`|` union expansion back onto the `as`/`satisfies`
/// annotation line when the flat form fits, reproducing prettier's `as`-layout
/// (the oxfmt oracle for template expressions).
///
/// Robustness: a leading-`|` line run is only reflowed when it lies inside the
/// span of a real `as`/`satisfies` union type annotation, found by **re-parsing
/// the formatted text** and reading each annotation node's span directly. This
/// prevents rewriting look-alike `| `-prefixed lines that are actually the body
/// of a multi-line template literal or block comment sharing the expression with
/// a genuine `as`-union sibling — the string/comment content is not a type node,
/// so no union span covers it. Runs with a multi-line member (the union span
/// then extends past the last collected `| ` line) or whose flat form overflows
/// `budget` are left expanded, matching the oracle for long unions.
fn reflow_flat_as_satisfies_unions(
    formatted: &str,
    budget: usize,
    tw: usize,
    source_type: SourceType,
) -> String {
    let union_spans = as_satisfies_union_spans(formatted, source_type);
    if union_spans.is_empty() {
        return formatted.to_string();
    }

    let lines: Vec<&str> = formatted.split('\n').collect();
    // Byte offset of the start of each line (lines were split on '\n').
    let mut line_start = Vec::with_capacity(lines.len());
    let mut acc = 0usize;
    for l in &lines {
        line_start.push(acc);
        acc += l.len() + 1;
    }

    let covered_by_union = |start: usize, end: usize| {
        union_spans
            .iter()
            .any(|&(us, ue)| us >= start && us <= end && ue >= start && ue <= end)
    };

    let mut out: Vec<String> = Vec::with_capacity(lines.len());
    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        let anchored = {
            let t = line.trim_end();
            t.ends_with(" as") || t.ends_with(" satisfies")
        };
        if anchored
            && let Some((flat_line, consumed)) =
                try_flatten_union_block(tw, &lines, &line_start, i + 1, budget, &covered_by_union)
        {
            out.push(line.to_string());
            out.push(flat_line);
            i += 1 + consumed;
            continue;
        }
        out.push(line.to_string());
        i += 1;
    }
    out.join("\n")
}

/// Re-parse the formatted text and collect the byte spans (into `formatted`) of
/// every `as`/`satisfies` node's ≥2-member union type annotation.
fn as_satisfies_union_spans(formatted: &str, source_type: SourceType) -> Vec<(usize, usize)> {
    let allocator = crate::scratch::acquire();
    let parsed = Parser::new(allocator, formatted, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parsed.diagnostics.is_empty() {
        return Vec::new();
    }
    struct Collector {
        spans: Vec<(usize, usize)>,
    }
    impl<'a> Visit<'a> for Collector {
        fn visit_ts_as_expression(&mut self, expr: &TSAsExpression<'a>) {
            if is_multi_member_union(&expr.type_annotation) {
                let s = expr.type_annotation.span();
                self.spans.push((s.start as usize, s.end as usize));
            }
            walk::walk_ts_as_expression(self, expr);
        }
        fn visit_ts_satisfies_expression(&mut self, expr: &TSSatisfiesExpression<'a>) {
            if is_multi_member_union(&expr.type_annotation) {
                let s = expr.type_annotation.span();
                self.spans.push((s.start as usize, s.end as usize));
            }
            walk::walk_ts_satisfies_expression(self, expr);
        }
    }
    let mut c = Collector { spans: Vec::new() };
    c.visit_program(&parsed.program);
    c.spans
}

/// Try to read a leading-`|` union block starting at line `start`. On success
/// returns the single flattened line and how many source lines it consumed.
fn try_flatten_union_block(
    tw: usize,
    lines: &[&str],
    line_start: &[usize],
    start: usize,
    budget: usize,
    covered_by_union: &impl Fn(usize, usize) -> bool,
) -> Option<(String, usize)> {
    let first = lines.get(start)?;
    let w = first.len() - first.trim_start().len();
    let indent = &first[..w];
    if !first[w..].starts_with("| ") {
        return None;
    }

    let mut members: Vec<&str> = Vec::new();
    let mut n = 0;
    while let Some(l) = lines.get(start + n) {
        let lw = l.len() - l.trim_start().len();
        if lw == w && l[lw..].starts_with("| ") {
            members.push(&l[lw + 2..]);
            n += 1;
        } else {
            break;
        }
    }
    // A union has ≥2 members; a single `| X` line is not the shape we reflow.
    if members.len() < 2 {
        return None;
    }
    // The collected `| ` lines must fall inside one real union type annotation
    // span — otherwise this is a look-alike inside a template literal / comment.
    // The union span starts on the first member line and ends on the last.
    let last = start + n - 1;
    let block_start = line_start[start];
    let block_end = line_start[last] + lines[last].len();
    if !covered_by_union(block_start, block_end) {
        return None;
    }
    // A deeper following line means the last member broke across lines — keep the
    // whole block expanded (the oracle does too).
    if let Some(next) = lines.get(start + n)
        && !next.trim().is_empty()
        && next.len() - next.trim_start().len() > w
    {
        return None;
    }
    // A member that opens a block/call/generic is itself multi-line: don't flatten.
    if members
        .iter()
        .any(|m| matches!(m.trim_end().chars().last(), Some('{' | '(' | '[' | '<')))
    {
        return None;
    }

    let flat_body = members.join(" | ");
    let flat_line = format!("{indent}{flat_body}");
    if flat_line.visual_width(tw) > budget {
        return None;
    }
    Some((flat_line, n))
}

/// Returns `true` when `expr` is a member access or call whose left-most leaf
/// (walking down `.object` / `.callee`) is an object literal — i.e. the shape
/// `{ … }[key]` / `{ … }.foo` / `{ … }()` that OXC parenthesizes at statement
/// position but prettier keeps bare in expression position. A bare object (with
/// no postfix) returns `false`: that case is handled by `strip_outer_parens`.
fn expr_has_object_head(expr: &oxc_ast::ast::Expression) -> bool {
    use oxc_ast::ast::{ChainElement, Expression as E};
    // The top node must be a postfix wrapper, not a bare object.
    let mut cur = match expr {
        E::ComputedMemberExpression(_)
        | E::StaticMemberExpression(_)
        | E::PrivateFieldExpression(_)
        | E::CallExpression(_)
        | E::TaggedTemplateExpression(_)
        | E::ChainExpression(_) => expr,
        _ => return false,
    };
    loop {
        cur = match cur {
            E::ObjectExpression(_) => return true,
            E::ComputedMemberExpression(m) => &m.object,
            E::StaticMemberExpression(m) => &m.object,
            E::PrivateFieldExpression(m) => &m.object,
            E::CallExpression(c) => &c.callee,
            E::TaggedTemplateExpression(t) => &t.tag,
            E::ChainExpression(ch) => match &ch.expression {
                ChainElement::CallExpression(c) => &c.callee,
                ChainElement::ComputedMemberExpression(m) => &m.object,
                ChainElement::StaticMemberExpression(m) => &m.object,
                ChainElement::PrivateFieldExpression(m) => &m.object,
                _ => return false,
            },
            _ => return false,
        };
    }
}
