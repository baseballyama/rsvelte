//! `rsvelte_esrap` — a Rust port of [esrap](https://github.com/Rich-Harris/esrap)
//! that prints an **oxc** AST to JavaScript with esrap's exact layout.
//!
//! ## Why
//!
//! The official Svelte compiler builds an ESTree and prints it once with esrap.
//! rsvelte's Phase 3 instead generates JS by string surgery — splicing edits
//! into source text across hundreds of passes — which is both the root cause of
//! a class of formatting divergences and, per `docs/phase3-perf-baseline.md`,
//! ~68% of client-transform time. The durable fix is the same architecture
//! upstream uses: build an output AST and print it once. This crate is that
//! printer (plan: `docs/phase3-ast-refactor-plan.md`, step 0).
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
        }
    }
}

/// Print `program` to JavaScript with the default options.
pub fn print(program: &Program<'_>) -> String {
    print_with(program, &PrintOptions::default())
}

/// Print `program` to JavaScript with explicit options.
pub fn print_with(program: &Program<'_>, options: &PrintOptions) -> String {
    let mut printer = printer::Printer::new(options);
    let mut ctx = context::Context::new();
    printer.print_program(program, &mut ctx);
    command::print(&ctx.into_commands(), &options.indent)
}
