//! `sortTailwindcss.functions` support for the native `.svelte` path: sort the
//! Tailwind class strings passed to wrapper calls like `cn(...)` / `cva(...)`.
//!
//! Two positions mirror what oxfmt's `.svelte` pipeline sorts (verified against
//! the real `oxfmt` + `prettier-plugin-tailwindcss` oracle):
//!
//!   1. `<script>` bodies — string and template literals inside a
//!      `CallExpression` whose callee is a bare identifier in `functions`. The
//!      descent stops at a nested `CallExpression`, so `cn(a, notcn("…"))` sorts
//!      only `a`; a nested call is sorted only if its own callee matches.
//!   2. `class` (and configured `attributes`) mustache values — *every* string
//!      and template literal in the expression, regardless of any enclosing call.
//!      This mirrors the plugin's `transformSvelte`, which is not function-gated.
//!
//! Template literals with `${…}` are sorted per static quasi; the token abutting
//! an interpolation is pinned so `cn(\`flex m-2 ${x}\`)` keeps its structure.
//!
//! Only class tokens are reordered (via the shared class sorter, so the native
//! and JS-sidecar paths both apply). The surrounding source is re-parsed and
//! re-printed unchanged, keeping quote/format decisions with oxc.

use oxc_allocator::Allocator;
use oxc_ast::ast::{CallExpression, Expression, StringLiteral, TemplateLiteral};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{GetSpan, SourceType};

use crate::options::{ClassSorter, FormatOptions};

/// Rewrite Tailwind class literals inside `functions` calls in a `<script>` body.
/// Returns the rewritten body when anything changed, else `None`.
pub(crate) fn sort_script_functions(body: &str, options: &FormatOptions) -> Option<String> {
    if options.class_sorter.is_none() || options.tailwind_functions.is_empty() {
        return None;
    }
    rewrite(body, false, false, options)
}

/// Rewrite every Tailwind class literal in a `class`-attribute mustache
/// expression. Returns the rewritten expression source when anything changed.
pub(crate) fn sort_class_expression(expr_src: &str, options: &FormatOptions) -> Option<String> {
    // `rewrite` returns `None` when no class sorter is configured.
    rewrite(expr_src, true, true, options)
}

/// Parse `src` (optionally wrapped in `(...)` so a bare object/expression parses),
/// collect the class-literal spans to sort, and splice the sorted values back in.
fn rewrite(src: &str, wrap: bool, sort_all: bool, options: &FormatOptions) -> Option<String> {
    let sorter = options.class_sorter.as_ref()?;
    let buf = if wrap {
        format!("({src})")
    } else {
        src.to_string()
    };

    let allocator = Allocator::default();
    // `.ts` is a superset of JS and matches the `<script>` parse dialect; only
    // string/template spans are read, so the dialect never affects the result.
    let source_type = SourceType::from_extension("ts").unwrap_or_else(|_| SourceType::ts());
    let parsed = Parser::new(&allocator, &buf, source_type)
        .with_options(ParseOptions {
            preserve_parens: false,
            ..ParseOptions::default()
        })
        .parse();
    if !parsed.diagnostics.is_empty() {
        return None;
    }

    let mut collector = Collector {
        functions: &options.tailwind_functions,
        sort_all,
        call_matched: Vec::new(),
        edits: Vec::new(),
    };
    collector.visit_program(&parsed.program);
    if collector.edits.is_empty() {
        return None;
    }

    // Apply right-to-left so earlier byte offsets stay valid.
    let mut edits = collector.edits;
    edits.sort_unstable_by_key(|e| std::cmp::Reverse(e.start()));
    let mut out = buf.clone();
    let mut changed = false;
    for edit in edits {
        let (start, end) = (edit.start() as usize, edit.end() as usize);
        let replacement = match edit {
            Edit::StringLit { .. } => {
                // The span includes its delimiters (`"` or `'`); sort the inner.
                let quote = &out[start..start + 1];
                let inner = &out[start + 1..end - 1];
                format!("{quote}{}{quote}", sorter(inner))
            }
            // A template quasi span is the raw text between delimiters.
            Edit::Quasi {
                ignore_first,
                ignore_last,
                ..
            } => sort_quasi(&out[start..end], ignore_first, ignore_last, sorter),
        };
        if replacement == out[start..end] {
            continue;
        }
        out.replace_range(start..end, &replacement);
        changed = true;
    }
    if !changed {
        return None;
    }
    if wrap {
        // Strip the `(` / `)` added above; only inner literals were edited, so the
        // wrapper delimiters are still the first and last bytes.
        Some(out[1..out.len() - 1].to_string())
    } else {
        Some(out)
    }
}

/// One literal to rewrite in the source buffer.
enum Edit {
    /// A string literal; `start..end` spans the quotes.
    StringLit { start: u32, end: u32 },
    /// A template quasi; `start..end` spans the raw text (no delimiters).
    /// `ignore_first` / `ignore_last` pin the boundary token that abuts a `${…}`,
    /// mirroring `prettier-plugin-tailwindcss`'s `sortClasses`.
    Quasi {
        start: u32,
        end: u32,
        ignore_first: bool,
        ignore_last: bool,
    },
}

impl Edit {
    fn start(&self) -> u32 {
        match self {
            Edit::StringLit { start, .. } | Edit::Quasi { start, .. } => *start,
        }
    }
    fn end(&self) -> u32 {
        match self {
            Edit::StringLit { end, .. } | Edit::Quasi { end, .. } => *end,
        }
    }
}

/// Sort one template quasi's class tokens, pinning the boundary token adjacent to
/// a `${…}` (`ignore_first` / `ignore_last`) and preserving the quasi's leading /
/// trailing whitespace — the separators between a class and the interpolation.
fn sort_quasi(raw: &str, ignore_first: bool, ignore_last: bool, sorter: &ClassSorter) -> String {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return raw.to_string();
    }
    let lead = &raw[..raw.len() - raw.trim_start().len()];
    let trail = &raw[raw.trim_end().len()..];

    let mut tokens: Vec<&str> = trimmed.split_whitespace().collect();
    let pinned_first = (ignore_first && !tokens.is_empty()).then(|| tokens.remove(0));
    let pinned_last = (ignore_last && !tokens.is_empty()).then(|| tokens.pop().unwrap());

    let mut parts: Vec<String> = Vec::new();
    if let Some(f) = pinned_first {
        parts.push(f.to_string());
    }
    if !tokens.is_empty() {
        parts.push(sorter(&tokens.join(" ")));
    }
    if let Some(l) = pinned_last {
        parts.push(l.to_string());
    }
    format!("{lead}{}{trail}", parts.join(" "))
}

struct Collector<'f> {
    functions: &'f [String],
    /// `true` = sort every literal (class-attribute mode); `false` = only inside a
    /// matched call (script `functions` mode).
    sort_all: bool,
    /// Match state of each enclosing `CallExpression`; the innermost decides.
    call_matched: Vec<bool>,
    edits: Vec<Edit>,
}

impl Collector<'_> {
    fn should_sort(&self) -> bool {
        self.sort_all || self.call_matched.last() == Some(&true)
    }
}

impl<'a> Visit<'a> for Collector<'_> {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        let matched = match &call.callee {
            Expression::Identifier(id) => self.functions.iter().any(|f| f == id.name.as_str()),
            _ => false,
        };
        self.call_matched.push(matched);
        walk::walk_call_expression(self, call);
        self.call_matched.pop();
    }

    fn visit_string_literal(&mut self, lit: &StringLiteral<'a>) {
        if self.should_sort() {
            let span = lit.span();
            self.edits.push(Edit::StringLit {
                start: span.start,
                end: span.end,
            });
        }
    }

    fn visit_template_literal(&mut self, tpl: &TemplateLiteral<'a>) {
        if self.should_sort() {
            // Sort each quasi's static text; the token abutting a `${…}` is pinned
            // so it stays contiguous with the interpolation (`cn(\`a ${x}b c\`)`).
            let exprs = tpl.expressions.len();
            for (i, quasi) in tpl.quasis.iter().enumerate() {
                let raw = quasi.value.raw.as_str();
                self.edits.push(Edit::Quasi {
                    start: quasi.span.start,
                    end: quasi.span.end,
                    ignore_first: i > 0 && !starts_with_ws(raw),
                    ignore_last: i < exprs && !ends_with_ws(raw),
                });
            }
        }
        // Still walk the `${…}` expressions to reach nested calls.
        walk::walk_template_literal(self, tpl);
    }
}

fn starts_with_ws(s: &str) -> bool {
    s.chars().next().is_some_and(char::is_whitespace)
}

fn ends_with_ws(s: &str) -> bool {
    s.chars().next_back().is_some_and(char::is_whitespace)
}
