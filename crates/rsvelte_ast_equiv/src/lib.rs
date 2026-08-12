//! Semantic-equivalence comparison for generated JavaScript.
//!
//! Two compiler outputs are *equivalent* when they parse to the same program
//! modulo pure formatting. The comparison is: parse both with OXC, print both
//! with one fixed set of codegen options, compare the printed text — plus a
//! separate comparison of the comments that carry meaning for downstream tools.
//!
//! What collapses (formatting): whitespace, line breaks, indentation, quote
//! style, optional semicolons, optional parentheses, numeric literal spelling,
//! string escape spelling, property shorthand, trailing commas.
//!
//! What does not collapse: everything else, including differences that a human
//! would call "equivalent but written differently" (`let a = 1, b = 2` versus
//! two declarations, `export { a, b }` versus `export { b, a }`). The
//! comparator is deliberately conservative in that direction — a false
//! "different" costs an investigation, a false "equivalent" ships a bug.
//!
//! A source that does not parse is a hard failure. It is never downgraded to a
//! text comparison: silently swapping in a weaker check is how a gate stops
//! gating.

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
use oxc_parser::Parser;
use oxc_span::SourceType;

/// Which language the input is written in.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Dialect {
    /// ES module JavaScript — compiler output (`client.js`, `server.js`).
    #[default]
    Esm,
    /// TSX — `svelte2tsx` output.
    Tsx,
}

/// How comments participate in the comparison.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum CommentPolicy {
    /// Compare the meaningful comments (see [`is_meaningful_comment`]) as an
    /// ordered list. Prose comments are ignored.
    #[default]
    Meaningful,
    /// Ignore comments entirely.
    Ignore,
}

/// Comparison options.
#[derive(Debug, Clone, Copy, Default)]
pub struct Options {
    pub dialect: Dialect,
    pub comments: CommentPolicy,
}

impl Options {
    #[must_use]
    pub const fn with_dialect(mut self, dialect: Dialect) -> Self {
        self.dialect = dialect;
        self
    }

    #[must_use]
    pub const fn with_comments(mut self, comments: CommentPolicy) -> Self {
        self.comments = comments;
        self
    }
}

/// The canonical form of one input.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Canonical {
    /// Canonically printed program text.
    pub code: String,
    /// Meaningful comments in source order, whitespace-normalized. Empty under
    /// [`CommentPolicy::Ignore`].
    pub comments: Vec<String>,
}

/// The input could not be parsed.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseFailure {
    pub message: String,
}

impl std::fmt::Display for ParseFailure {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for ParseFailure {}

/// Which of the two inputs a result refers to.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Side {
    Left,
    Right,
}

impl std::fmt::Display for Side {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(match self {
            Self::Left => "left",
            Self::Right => "right",
        })
    }
}

/// The outcome of comparing two inputs.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Comparison {
    Equivalent,
    CodeDiffers {
        left: String,
        right: String,
    },
    CommentsDiffer {
        left: Vec<String>,
        right: Vec<String>,
    },
    Unparseable {
        side: Side,
        failure: ParseFailure,
    },
}

impl Comparison {
    #[must_use]
    pub const fn is_equivalent(&self) -> bool {
        matches!(self, Self::Equivalent)
    }
}

/// Canonicalize with the default options.
///
/// # Errors
/// Returns [`ParseFailure`] if OXC cannot parse the input.
pub fn canonicalize(code: &str) -> Result<Canonical, ParseFailure> {
    canonicalize_with(code, Options::default())
}

/// Canonicalize one input.
///
/// # Errors
/// Returns [`ParseFailure`] if OXC cannot parse the input.
pub fn canonicalize_with(code: &str, options: Options) -> Result<Canonical, ParseFailure> {
    let allocator = Allocator::new();
    let source_type = match options.dialect {
        Dialect::Esm => SourceType::mjs(),
        Dialect::Tsx => SourceType::tsx(),
    };
    let parsed = Parser::new(&allocator, code, source_type).parse();
    if parsed.panicked || !parsed.diagnostics.is_empty() {
        let message = parsed
            .diagnostics
            .first()
            .map_or_else(|| "parser panicked".to_string(), ToString::to_string);
        return Err(ParseFailure { message });
    }

    let comments = match options.comments {
        CommentPolicy::Ignore => Vec::new(),
        CommentPolicy::Meaningful => parsed
            .program
            .comments
            .iter()
            .filter_map(|comment| {
                let content = comment.content_span().source_text(code);
                (!comment.is_normal() || is_meaningful_comment(content))
                    .then(|| normalize_comment_text(content))
            })
            .collect(),
    };

    // Under `Meaningful`, printing annotations keeps `/* #__PURE__ */` & friends
    // positionally anchored; they are also listed in `comments`, which is
    // redundant but only ever makes the comparison stricter. Under `Ignore` they
    // have to be off too — an annotation left in the printed text is a comment
    // difference reported as a code difference, which is precisely what the
    // caller asked not to see.
    let codegen_options = CodegenOptions {
        single_quote: true,
        comments: CommentOptions {
            normal: false,
            jsdoc: false,
            annotation: options.comments == CommentPolicy::Meaningful,
            legal: LegalComment::None,
        },
        ..Default::default()
    };
    let code = Codegen::new()
        .with_options(codegen_options)
        .build(&parsed.program)
        .code
        .trim()
        .to_string();

    Ok(Canonical { code, comments })
}

/// Compare two inputs with the default options.
#[must_use]
pub fn compare(left: &str, right: &str) -> Comparison {
    compare_with(left, right, Options::default())
}

/// Compare two inputs.
#[must_use]
pub fn compare_with(left: &str, right: &str, options: Options) -> Comparison {
    let left = match canonicalize_with(left, options) {
        Ok(canonical) => canonical,
        Err(failure) => {
            return Comparison::Unparseable {
                side: Side::Left,
                failure,
            };
        }
    };
    let right = match canonicalize_with(right, options) {
        Ok(canonical) => canonical,
        Err(failure) => {
            return Comparison::Unparseable {
                side: Side::Right,
                failure,
            };
        }
    };
    if left.code != right.code {
        return Comparison::CodeDiffers {
            left: left.code,
            right: right.code,
        };
    }
    if left.comments != right.comments {
        return Comparison::CommentsDiffer {
            left: left.comments,
            right: right.comments,
        };
    }
    Comparison::Equivalent
}

/// Byte offset of the first difference between two canonical strings.
#[must_use]
pub fn first_difference(left: &str, right: &str) -> Option<usize> {
    let (left, right) = (left.as_bytes(), right.as_bytes());
    let common = left
        .iter()
        .zip(right)
        .position(|(a, b)| a != b)
        .unwrap_or_else(|| left.len().min(right.len()));
    (common < left.len() || common < right.len()).then_some(common)
}

/// Toolchain directives that OXC does not classify itself but that change what
/// a downstream tool does. OXC already flags legal / `JSDoc` / `#__PURE__` /
/// `#__NO_SIDE_EFFECTS__` / webpack / vite / turbopack / coverage comments via
/// `Comment::is_normal`, so this list only covers the rest.
const MEANINGFUL_COMMENT_PREFIXES: &[&str] = &[
    "svelte-ignore",
    "@component",
    "@ts-",
    "eslint-disable",
    "eslint-enable",
    "eslint-env",
    "prettier-ignore",
    "# sourceMappingURL=",
    "# sourceURL=",
];

/// Whether a comment's content carries meaning for a downstream tool.
///
/// Prose comments are formatting; a linter suppression or a bundler hint is
/// not. Callers must additionally treat every comment OXC itself classifies
/// (`!Comment::is_normal()`) as meaningful.
#[must_use]
pub fn is_meaningful_comment(content: &str) -> bool {
    let content = content.trim_start_matches(['*', ' ', '\t', '\r', '\n']);
    MEANINGFUL_COMMENT_PREFIXES
        .iter()
        .any(|prefix| content.starts_with(prefix))
}

/// Collapse whitespace runs, and the leading `*` of `JSDoc` continuation lines,
/// so that re-indenting or re-wrapping a comment is not a difference.
fn normalize_comment_text(content: &str) -> String {
    let mut out = String::with_capacity(content.len());
    for line in content.lines() {
        for word in line.trim_start().trim_start_matches('*').split_whitespace() {
            if !out.is_empty() {
                out.push(' ');
            }
            out.push_str(word);
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[track_caller]
    fn assert_equivalent(left: &str, right: &str) {
        let result = compare(left, right);
        assert!(
            result.is_equivalent(),
            "expected equivalent, got {result:?}\n  left:  {left}\n  right: {right}"
        );
    }

    #[track_caller]
    fn assert_different(left: &str, right: &str) {
        let result = compare(left, right);
        assert!(
            !result.is_equivalent(),
            "expected a reported difference, got Equivalent\n  left:  {left}\n  right: {right}"
        );
        assert!(
            !matches!(result, Comparison::Unparseable { .. }),
            "expected a difference, got a parse failure: {result:?}"
        );
    }

    // ------------------------------------------------------------------
    // Formatting-only differences must collapse.
    // ------------------------------------------------------------------

    #[test]
    fn whitespace_and_semicolons_collapse() {
        assert_equivalent("let x = 1;\nlet y = 2;", "let x=1\n\n\tlet y=2");
    }

    #[test]
    fn quote_style_collapses() {
        assert_equivalent(r#"let x = "hi";"#, "let x = 'hi';");
    }

    #[test]
    fn redundant_parens_collapse() {
        assert_equivalent("let x = (1) + (2);", "let x = 1 + 2;");
        assert_equivalent("(null)?.foo;", "null?.foo;");
        assert_equivalent("let x = new (class {})();", "let x = new class {}();");
    }

    #[test]
    fn numeric_literal_spelling_collapses() {
        assert_equivalent("let x = .5;", "let x = 0.5;");
        assert_equivalent("let x = 1e3;", "let x = 1000;");
        assert_equivalent("let x = 0x10;", "let x = 16;");
    }

    #[test]
    fn string_escape_spelling_collapses() {
        assert_equivalent(r"let x = '\x41';", "let x = 'A';");
        assert_equivalent(r"let x = 'A';", "let x = 'A';");
    }

    #[test]
    fn property_shorthand_and_computed_keys_collapse() {
        assert_equivalent("let o = { a };", "let o = { a: a };");
        assert_equivalent("let o = { a: 1, };", "let o = { a: 1 };");
        assert_equivalent("f(a, b,);", "f(a, b);");
    }

    #[test]
    fn prose_comments_are_ignored() {
        assert_equivalent("let x = 1; // note\nlet y = 2;", "let x = 1;\nlet y = 2;");
        assert_equivalent("/* note */ let x = 1;", "let x = 1;");
    }

    // ------------------------------------------------------------------
    // Semantic differences must never be reported as equivalent. This is the
    // direction that matters: a false "equivalent" ships a bug silently.
    // ------------------------------------------------------------------

    #[test]
    fn parens_that_change_grouping_are_different() {
        assert_different("let x = (a || b) && c;", "let x = a || (b && c);");
        assert_different("let x = a - (b - c);", "let x = a - b - c;");
        // A sequence expression as one argument, versus two arguments.
        assert_different("f((a, b));", "f(a, b);");
    }

    #[test]
    fn parens_that_change_unary_and_update_are_different() {
        assert_different("let y = -(-x);", "let y = --x;");
        assert_different("let y = +(+x);", "let y = ++x;");
    }

    #[test]
    fn new_expression_grouping_is_different() {
        // `new (f())` constructs the *return value* of `f()`; `new f()`
        // constructs `f` itself.
        assert_different("let x = new (f())();", "let x = new f()();");
    }

    #[test]
    fn optional_chain_grouping_is_different() {
        // `(a?.b)()` calls with an undefined `this` and throws when `a` is
        // nullish; `a?.b()` short-circuits the whole call.
        assert_different("(a?.b)();", "a?.b();");
        assert_different("(a?.b).c;", "a?.b.c;");
    }

    #[test]
    fn automatic_semicolon_insertion_is_different() {
        assert_different(
            "function f() { return\n  x; }",
            "function f() { return x; }",
        );
        assert_different("let a = b\n(c);", "let a = b;\n(c);");
    }

    #[test]
    fn template_literal_newlines_are_different() {
        assert_different("let x = `a\nb`;", "let x = `a b`;");
        assert_different("let x = `<p> </p>`;", "let x = `<p></p>`;");
        assert_different("let x = `a${ b }c`;", "let x = `a${ c }b`;");
    }

    #[test]
    fn directive_prologue_is_different() {
        assert_different(
            "function f() { 'use strict'; return this; }",
            "function f() { return this; }",
        );
        // A parenthesized string is an ordinary expression statement, not a
        // directive, so it does not put the function into strict mode.
        assert_different(
            "function f() { 'use strict'; return this; }",
            "function f() { ('use strict'); return this; }",
        );
    }

    #[test]
    fn labels_are_different() {
        assert_different(
            "outer: for (;;) { for (;;) break outer; }",
            "outer: for (;;) { for (;;) break; }",
        );
        assert_different("a: b: c();", "a: c();");
    }

    #[test]
    fn optional_catch_binding_is_different() {
        // Conservative: the two behave alike, but the AST differs and a port
        // that changes this is changing its output, which we want to see.
        assert_different("try { f(); } catch {}", "try { f(); } catch (e) {}");
    }

    #[test]
    fn export_specifier_order_is_different() {
        // Conservative in the other direction too: reordering named exports is
        // unobservable at runtime, yet reported. Accepted — see module docs.
        assert_different("export { a, b };", "export { b, a };");
        assert_different("export { a as b };", "export { b as a };");
    }

    #[test]
    fn declaration_kind_and_grouping_are_different() {
        assert_different("var x = 1;", "let x = 1;");
        assert_different("let x = 1;", "const x = 1;");
        assert_different("let x = 1, y = 2;", "let x = 1;\nlet y = 2;");
    }

    #[test]
    fn operator_identity_is_different() {
        assert_different("let x = a ?? b;", "let x = a || b;");
        assert_different("let x = a === b;", "let x = a == b;");
        assert_different("let x = a?.b;", "let x = a.b;");
        assert_different("a ||= b;", "a = a || b;");
    }

    #[test]
    fn literal_identity_is_different() {
        assert_different("let x = -0;", "let x = 0;");
        assert_different("let x = 1n;", "let x = 1;");
        assert_different("let x = void 0;", "let x = undefined;");
        assert_different("let x = 0.1 + 0.2;", "let x = 0.3;");
    }

    #[test]
    fn statement_presence_and_order_are_different() {
        assert_different("$.push(); $.pop();", "$.push();");
        assert_different("a(); b();", "b(); a();");
        assert_different("let o = { a: 1, b: 2 };", "let o = { b: 2, a: 1 };");
    }

    #[test]
    fn identifiers_and_string_contents_are_different() {
        assert_different(
            "var node_1 = $.first_child(f);",
            "var node = $.first_child(f);",
        );
        assert_different(
            "$.set_class(div, 'svelte-abc');",
            "$.set_class(div, 'svelte-xyz');",
        );
        assert_different("await f();", "f();");
    }

    // ------------------------------------------------------------------
    // Comments that a downstream tool acts on.
    // ------------------------------------------------------------------

    #[test]
    fn meaningful_comments_are_compared() {
        assert_different("// svelte-ignore a11y_click_events\nel();", "el();");
        assert_different(
            "/** @component docs */\nexport default function App() {}",
            "export default function App() {}",
        );
        assert_different("/* @__PURE__ */ f();", "f();");
        assert_different(
            "import(/* webpackChunkName: 'a' */ './a.js');",
            "import('./a.js');",
        );
        assert_different("// @ts-expect-error\nf();", "f();");
    }

    #[test]
    fn meaningful_comment_reformatting_is_not_a_difference() {
        assert_equivalent(
            "/**\n * @component\n *   docs\n */\nexport default function App() {}",
            "/** @component docs */\nexport default function App() {}",
        );
    }

    #[test]
    fn comment_policy_ignore_drops_meaningful_comments() {
        let options = Options::default().with_comments(CommentPolicy::Ignore);
        assert!(
            compare_with(
                "// svelte-ignore a11y_click_events\nel();",
                "el();",
                options
            )
            .is_equivalent()
        );
    }

    #[test]
    fn comment_policy_ignore_drops_every_kind_of_comment() {
        // Ignore has to reach the printed text too. Annotations are the ones
        // that leak: OXC prints them next to the call they apply to, so an
        // annotation the two sides disagree about surfaces as a code
        // difference — which is how a real corpus entry (bits-ui's
        // `menubar.svelte.ts`, where the official compiler drops a
        // `/* @__PURE__ */` that rsvelte keeps) failed a comparison that had
        // asked for comments to be ignored.
        let options = Options::default().with_comments(CommentPolicy::Ignore);
        for (left, right) in [
            ("let m = /* @__PURE__ */ new Map();", "let m = new Map();"),
            (
                "/* #__NO_SIDE_EFFECTS__ */ function f() {}",
                "function f() {}",
            ),
            ("/** @type {number} */\nlet x = 1;", "let x = 1;"),
            ("/** @component docs */\nlet x = 1;", "let x = 1;"),
            ("// svelte-ignore a11y_x\nlet x = 1;", "let x = 1;"),
            ("/** @license MIT */\nlet x = 1;", "let x = 1;"),
            (
                "import(/* webpackChunkName: 'a' */ './a.js');",
                "import('./a.js');",
            ),
        ] {
            let result = compare_with(left, right, options);
            assert!(
                result.is_equivalent(),
                "comments must not reach the comparison under Ignore, got {result:?}\n  left: {left}"
            );
        }
    }

    #[test]
    fn is_meaningful_comment_classifies_directives() {
        assert!(is_meaningful_comment(" svelte-ignore a11y_x"));
        assert!(is_meaningful_comment("* @component hello"));
        assert!(is_meaningful_comment(" @ts-nocheck"));
        assert!(is_meaningful_comment(" eslint-disable-next-line no-var"));
        assert!(is_meaningful_comment("# sourceMappingURL=x.map"));
        assert!(!is_meaningful_comment(" a plain note"));
        assert!(!is_meaningful_comment(" svelte is nice"));
    }

    // ------------------------------------------------------------------
    // Parse failure is a failure, never a downgrade to text matching.
    // ------------------------------------------------------------------

    #[test]
    fn unparseable_input_is_reported_per_side() {
        assert!(matches!(
            compare("let x = ;", "let x = 1;"),
            Comparison::Unparseable {
                side: Side::Left,
                ..
            }
        ));
        assert!(matches!(
            compare("let x = 1;", "let x = ;"),
            Comparison::Unparseable {
                side: Side::Right,
                ..
            }
        ));
        // Both unparseable: still a failure, never "equivalent because the
        // text happens to match".
        assert!(!compare("let x = ;", "let x = ;").is_equivalent());
    }

    #[test]
    fn typescript_needs_the_tsx_dialect() {
        let ts = "let x: number = 1;";
        assert!(matches!(compare(ts, ts), Comparison::Unparseable { .. }));
        let options = Options::default().with_dialect(Dialect::Tsx);
        assert!(compare_with(ts, ts, options).is_equivalent());
    }

    #[test]
    fn first_difference_locates_the_split() {
        assert_eq!(first_difference("abc", "abc"), None);
        assert_eq!(first_difference("abc", "abd"), Some(2));
        assert_eq!(first_difference("abc", "ab"), Some(2));
    }
}
