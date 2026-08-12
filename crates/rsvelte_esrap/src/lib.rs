//! `rsvelte_esrap` — a Rust port of [esrap](https://github.com/Rich-Harris/esrap)
//! that prints an **oxc** AST to JavaScript with esrap's exact layout.
//!
//! ## Why
//!
//! The official Svelte compiler builds an `ESTree` and prints it once with esrap.
//! rsvelte's Phase 3 instead generates JS by string surgery — splicing edits
//! into source text across hundreds of passes — which is both the root cause of
//! a class of formatting divergences and a large share of client-transform time.
//! The durable fix is the same architecture upstream uses: build an output AST
//! and print it once. This crate is that printer.
//!
//! ## Model
//!
//! Printing is two internal layers, mirroring esrap:
//! - a command buffer with a flattening driver (whitespace/indent
//!   sentinels + literal strings), and
//! - a context the visitors push commands onto, tracking the
//!   `multiline` signal used to choose layouts.
//!
//! The printer walks the oxc AST. Where esrap dispatches through a
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

#![deny(missing_docs)]

mod command;
mod context;
mod pool;
mod printer;

#[cfg(test)]
mod internal_tests;

pub use command::Mapping;

use oxc_ast::ast::Program;

/// Options controlling output layout. Defaults match esrap's defaults and
/// rsvelte's conventions (tab indent, single quotes).
#[derive(Debug, Clone)]
pub struct PrintOptions {
    /// The indentation unit for one level (always `"\t"`).
    indent: String,
    /// Keep `EmptyStatement` (`;`) nodes in statement-list bodies instead of
    /// filtering them (esrap's default, matching the server AST). The rsvelte
    /// client `to_oxc` path parses string-codegen `Raw` chunks whose `;;` become
    /// real `EmptyStatement` nodes that the official *compiler* output keeps, so
    /// that path sets this to byte-match. Default `false` (filter, = esrap/server).
    keep_empty_statements: bool,
    /// Treat the top-level `Program` as carrying no location, like the
    /// builder-made program upstream hands esrap. Its statement list then
    /// discards every pending comment (esrap's `!node.loc` branch), so only a
    /// nested body that does carry one re-finds its own comments. Only a caller
    /// whose nested bodies keep real locations may set this — otherwise the
    /// comments have nothing to be recovered by. Default `false`.
    unlocated_program: bool,
}

impl Default for PrintOptions {
    fn default() -> Self {
        Self {
            indent: String::from("\t"),
            keep_empty_statements: false,
            unlocated_program: false,
        }
    }
}

impl PrintOptions {
    /// Control whether empty statements are retained in statement lists.
    #[must_use]
    pub const fn with_empty_statements(mut self, keep: bool) -> Self {
        self.keep_empty_statements = keep;
        self
    }

    /// Treat the top-level `Program` as carrying no location, like the
    /// builder-made program upstream hands esrap: its statement list then
    /// discards every pending comment, and only a nested body that does carry a
    /// location re-finds its own. Only a caller whose nested bodies keep real
    /// locations may set this — otherwise nothing can recover the comments.
    #[must_use]
    pub const fn with_unlocated_program(mut self, unlocated: bool) -> Self {
        self.unlocated_program = unlocated;
        self
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
    let line_starts = printer::line_starts(source);
    let comments = printer::build_comments(program, source, &line_starts);
    let mut printer = printer::Printer::with_comments(options, comments, line_starts);
    let mut ctx = context::Context::new();
    printer.print_program(program, &mut ctx);
    let commands = ctx.into_commands();
    let code = command::print(&commands, &options.indent);
    pool::recycle(commands);
    code
}

/// Print a program whose comment coordinates and source-map coordinates live in two different buffers.
///
/// This is the shape a *reassembled* program has, where the
/// nodes carrying comments were parsed from generated chunks rather than from
/// the original file.
///
/// * `comment_source` is the buffer the program's comment spans (and the spans
///   of the nodes those comments attach to) index into.
/// * `loc_base` splits the two: spans below it are synthesized nodes that carry
///   no location, exactly like a missing `node.loc` in esrap, and take part in
///   no comment placement.
/// * `map_source` (when `Some`) is the buffer source-map line/columns resolve
///   against, with `loc_map` translating comment-space offsets back into it —
///   sorted and disjoint, one entry per chunk, a `None` third field meaning the
///   chunk has no original-source anchor. `map_source: None` prints without
///   source-map anchors.
///
/// A chunk maps to a single point, so source-map *resolution* inside a chunk is
/// chunk-granular, not statement-granular.
pub fn print_split(
    program: &Program<'_>,
    comment_source: &str,
    loc_base: u32,
    map_source: Option<&str>,
    loc_map: &[(u32, u32, Option<u32>)],
    options: &PrintOptions,
) -> PrintWithMap {
    let line_starts = printer::line_starts(comment_source);
    let comments = printer::build_comments(program, comment_source, &line_starts);
    let map_line_starts = map_source.map(printer::line_starts).unwrap_or_default();
    let mut printer = printer::Printer::with_comments(options, comments, line_starts)
        .with_split_coordinates(map_line_starts, loc_base, loc_map);
    let mut ctx = context::Context::new();
    printer.print_program(program, &mut ctx);
    let commands = ctx.into_commands();
    let output = if map_source.is_some() {
        let (code, mappings) = command::flatten_with_map(&commands, &options.indent);
        PrintWithMap { code, mappings }
    } else {
        PrintWithMap {
            code: command::print(&commands, &options.indent),
            mappings: Vec::new(),
        }
    };
    pool::recycle(commands);
    output
}

/// The decoded result of [`print_with_map`].
#[non_exhaustive]
#[derive(Debug, Clone)]
pub struct PrintWithMap {
    /// The generated source text (identical to what [`print_with`] returns).
    pub code: String,
    /// Source-map mappings in generated order (line/column pairs are 0-based;
    /// the flat list replaces esrap's per-line `sourceMapEncodeMappings: false` shape).
    pub mappings: Vec<Mapping>,
}

/// Print `program` to JavaScript, returning both the code and decoded source-map mappings.
///
/// The emitted code is byte-identical to what
/// [`print_with`] returns — `Location` anchors only carry mapping data, never
/// add text.
pub fn print_with_map(program: &Program<'_>, source: &str, options: &PrintOptions) -> PrintWithMap {
    let line_starts = printer::line_starts(source);
    let comments = printer::build_comments(program, source, &line_starts);
    let mut printer = printer::Printer::with_comments(options, comments, line_starts);
    let mut ctx = context::Context::new();
    printer.print_program(program, &mut ctx);
    let commands = ctx.into_commands();
    let (code, mappings) = command::flatten_with_map(&commands, &options.indent);
    pool::recycle(commands);
    PrintWithMap { code, mappings }
}
