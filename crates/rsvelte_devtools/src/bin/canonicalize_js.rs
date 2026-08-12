//! Development canonicalizer for JavaScript supplied on stdin.
//!
//! Used by the verify-svelte-compat skill's compare-app.mjs to do semantic
//! comparison of compiler outputs that differ only in formatting.
//!
//! Usage: cat input.js | `canonicalize_js` > canonical.js
//!
//! Exits 2 when the input does not parse. Callers must treat that as an
//! unusable comparison rather than falling back to a text diff.

// Defined per-bin rather than once in the lib so that linking the `rsvelte_core`
// rlib never imposes an allocator on the consumer.
#[cfg(all(
    feature = "jemalloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use std::io::{Read, Write};

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).ok();

    let canonical = match rsvelte_ast_equiv::canonicalize(&input) {
        Ok(canonical) => canonical,
        Err(failure) => {
            eprintln!("canonicalize_js: input does not parse: {failure}");
            std::process::exit(2);
        }
    };

    // Meaningful comments are part of the equivalence, so they have to reach a
    // consumer that only sees this stream.
    let mut out = canonical.code;
    for comment in &canonical.comments {
        out.push_str("\n//= ");
        out.push_str(comment);
    }
    std::io::stdout().write_all(out.as_bytes()).ok();
}
