//! `rsvelte_esrap` — a Rust port of [esrap](https://github.com/Rich-Harris/esrap)
//! that prints an **oxc** AST to JavaScript with esrap's exact layout.
//!
//! ## Why
//!
//! The official Svelte compiler builds an ESTree and prints it once with esrap.
//! rsvelte's Phase 3 instead generates JS by string surgery — splicing edits
//! into source text across hundreds of passes — which is both the root cause of
//! a class of formatting divergences and a large share of client-transform time.
//! The durable fix is the same architecture upstream uses: build an output AST
//! and print it once. This crate is that printer.
//!
//! ## Model
//!
//! Printing is two layers, mirroring esrap:
//! - a [`command`] buffer with a flattening driver (whitespace/indent
//!   sentinels + literal strings), and
//! - a [`context::Context`] the visitors push commands onto, tracking the
//!   `multiline` signal used to choose layouts.
//!
//! The visitor ([`printer`]) walks the oxc AST. Where esrap dispatches through a
//! `visitors[node.type]` map, this port matches on oxc node kinds; the layout
//! logic (precedence-based parens, `sequence`, `body`, length-based line
//! breaking) is ported 1:1.
//!
//! ## Conformance
//!
//! The official compiler's snapshot outputs (`_expected/**/*.js`, themselves
//! esrap-printed) are the conformance corpus: parse one with oxc, re-print with
//! this crate, and assert byte-identity. The `golden` integration test reports
//! the round-trip rate; it only ever ratchets up as visitor coverage grows.

pub mod command;
pub mod context;
pub mod printer;

use oxc_ast::ast::Program;

/// Options controlling output layout. Defaults match esrap's defaults and
/// rsvelte's conventions (tab indent, single quotes).
#[derive(Debug, Clone)]
pub struct PrintOptions {
    /// The indentation unit for one level (default `"\t"`).
    pub indent: String,
    /// Preferred quote character for string literals without a preserved `raw`
    /// (default single quote).
    pub quote: QuoteStyle,
    /// Keep `EmptyStatement` (`;`) nodes in statement-list bodies instead of
    /// filtering them (esrap's default, matching the server AST). The rsvelte
    /// client `to_oxc` path parses string-codegen `Raw` chunks whose `;;` become
    /// real `EmptyStatement` nodes that the official *compiler* output keeps, so
    /// that path sets this to byte-match. Default `false` (filter, = esrap/server).
    pub keep_empty_statements: bool,
}

/// Quote preference for synthesized string literals.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum QuoteStyle {
    Single,
    Double,
}

impl Default for PrintOptions {
    fn default() -> Self {
        Self {
            indent: String::from("\t"),
            quote: QuoteStyle::Single,
            keep_empty_statements: false,
        }
    }
}

/// Print `program` to JavaScript with the default options, interleaving the
/// program's comments. `source` is the text it was parsed from (needed for the
/// comment bodies and line numbers).
pub fn print(program: &Program<'_>, source: &str) -> String {
    print_with(program, source, &PrintOptions::default())
}

/// Print `program` to JavaScript with explicit options, interleaving comments.
pub fn print_with(program: &Program<'_>, source: &str, options: &PrintOptions) -> String {
    let comments = printer::build_comments(program, source);
    let mut printer =
        printer::Printer::with_comments(options, comments, printer::line_starts(source));
    let mut ctx = context::Context::new();
    printer.print_program(program, &mut ctx);
    command::print(&ctx.into_commands(), &options.indent)
}

/// A synthetic comment injected by a [`CommentHooks`] callback (esrap's
/// `BaseComment`). `block` chooses `/* … */` vs `// …`; `value` is the interior
/// text (without delimiters).
#[derive(Debug, Clone)]
pub struct SynthComment {
    pub block: bool,
    pub value: String,
}

impl SynthComment {
    /// A `// value` line comment.
    pub fn line(value: impl Into<String>) -> Self {
        Self {
            block: false,
            value: value.into(),
        }
    }

    /// A `/* value */` block comment.
    pub fn block(value: impl Into<String>) -> Self {
        Self {
            block: true,
            value: value.into(),
        }
    }
}

/// A callback that returns the synthetic comments to attach to a statement
/// (esrap's `getLeadingComments` / `getTrailingComments` options).
pub type CommentCallback<'h> = Box<dyn Fn(&oxc_ast::ast::Statement) -> Vec<SynthComment> + 'h>;

/// Caller hooks that inject synthetic comments around statements, mirroring
/// esrap's `getLeadingComments` / `getTrailingComments` options. Each callback
/// receives the statement node and returns the comments to emit (leading
/// comments precede the node; trailing comments follow it on the same line).
#[derive(Default)]
pub struct CommentHooks<'h> {
    pub get_leading: Option<CommentCallback<'h>>,
    pub get_trailing: Option<CommentCallback<'h>>,
}

/// Like [`print_with`], but invokes `hooks` to inject synthetic leading/trailing
/// comments per statement (esrap's `getLeadingComments`/`getTrailingComments`).
pub fn print_with_hooks(
    program: &Program<'_>,
    source: &str,
    options: &PrintOptions,
    hooks: &CommentHooks<'_>,
) -> String {
    let comments = printer::build_comments(program, source);
    let mut printer =
        printer::Printer::with_comments(options, comments, printer::line_starts(source))
            .with_hooks(hooks);
    let mut ctx = context::Context::new();
    printer.print_program(program, &mut ctx);
    command::print(&ctx.into_commands(), &options.indent)
}

/// Print `program` to JavaScript with the default options, returning both the
/// code and decoded source-map mappings. The emitted code is byte-identical to
/// [`print()`] — `Location` anchors only carry mapping data, never add text.
pub fn print_with_map(program: &Program<'_>, source: &str) -> PrintWithMap {
    print_with_map_opts(program, source, &PrintOptions::default())
}

/// The decoded result of [`print_with_map`].
#[derive(Debug, Clone)]
pub struct PrintWithMap {
    /// The generated source text (identical to what [`print_with`] returns).
    pub code: String,
    /// Source-map mappings: one entry per generated line, each a list of
    /// `[generated_column, source_index, source_line_0based, source_column_0based]`
    /// segments. Matches esrap's `sourceMapEncodeMappings: false` shape.
    pub mappings: Vec<Vec<command::Segment>>,
}

/// Like [`print_with_map`] but with explicit options.
pub fn print_with_map_opts(
    program: &Program<'_>,
    source: &str,
    options: &PrintOptions,
) -> PrintWithMap {
    let comments = printer::build_comments(program, source);
    let mut printer =
        printer::Printer::with_comments(options, comments, printer::line_starts(source));
    let mut ctx = context::Context::new();
    printer.print_program(program, &mut ctx);
    let (code, mappings) = command::flatten_with_map(&ctx.into_commands(), &options.indent);
    PrintWithMap { code, mappings }
}
