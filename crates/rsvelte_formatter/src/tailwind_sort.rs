//! `sortTailwindcss.functions` support for the native `.svelte` path: sort the
//! Tailwind class strings passed to wrapper calls like `cn(...)` / `cva(...)`.
//!
//! Two positions mirror what oxfmt's `.svelte` pipeline sorts (verified against
//! the real `oxfmt` + `prettier-plugin-tailwindcss` oracle):
//!
//!   1. `<script>` bodies — string / no-substitution template literals inside a
//!      `CallExpression` whose callee is a bare identifier in `functions`. The
//!      descent stops at a nested `CallExpression`, so `cn(a, notcn("…"))` sorts
//!      only `a`; a nested call is sorted only if its own callee matches.
//!   2. `class` (and configured `attributes`) mustache values — *every* string /
//!      no-substitution template literal in the expression, regardless of any
//!      enclosing call. This mirrors the plugin's `transformSvelte`, which is not
//!      function-gated.
//!
//! Only the literal's inner tokens are reordered (via the shared class sorter, so
//! the native and JS-sidecar paths both apply). The surrounding source is
//! re-parsed and re-printed unchanged, keeping quote/format decisions with oxc.

use oxc_allocator::Allocator;
use oxc_ast::ast::{CallExpression, Expression, StringLiteral, TemplateLiteral};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{GetSpan, SourceType};

use crate::options::FormatOptions;

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
        spans: Vec::new(),
    };
    collector.visit_program(&parsed.program);
    if collector.spans.is_empty() {
        return None;
    }

    // Apply right-to-left so earlier byte offsets stay valid.
    let mut spans = collector.spans;
    spans.sort_unstable_by_key(|s| std::cmp::Reverse(s.0));
    let mut out = buf.clone();
    let mut changed = false;
    for (start, end) in spans {
        let (start, end) = (start as usize, end as usize);
        // The literal span includes its delimiters (`"`, `'`, or `` ` ``).
        let quote = &out[start..start + 1];
        let inner = &out[start + 1..end - 1];
        let sorted = sorter(inner);
        if sorted == inner {
            continue;
        }
        let replacement = format!("{quote}{sorted}{quote}");
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

struct Collector<'f> {
    functions: &'f [String],
    /// `true` = sort every literal (class-attribute mode); `false` = only inside a
    /// matched call (script `functions` mode).
    sort_all: bool,
    /// Match state of each enclosing `CallExpression`; the innermost decides.
    call_matched: Vec<bool>,
    spans: Vec<(u32, u32)>,
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
            self.spans.push((span.start, span.end));
        }
    }

    fn visit_template_literal(&mut self, tpl: &TemplateLiteral<'a>) {
        // Only a substitution-free `` `…` `` is a plain class list. Templates with
        // `${…}` are left to their `${}` expressions, which are still walked.
        if self.should_sort() && tpl.expressions.is_empty() && tpl.quasis.len() == 1 {
            let span = tpl.span();
            self.spans.push((span.start, span.end));
        }
        walk::walk_template_literal(self, tpl);
    }
}
