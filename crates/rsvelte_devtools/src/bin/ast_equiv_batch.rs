//! Batch semantic comparison of file pairs, for the corpus gates.
//!
//! Reads a JSON array of `{ "id", "left", "right" }` on stdin and writes a JSON
//! array of verdicts on stdout. The corpus driver is JavaScript and the
//! comparator is Rust; going through one batched process keeps a single
//! definition of "equivalent" instead of a second one written in acorn.
//!
//! Usage: echo '[{"id":"a","left":"x.js","right":"y.js"}]' | `ast_equiv_batch` [--tsx] [--comments]

// Defined per-bin rather than once in the lib so that linking the `rsvelte_core`
// rlib never imposes an allocator on the consumer.
#[cfg(all(
    feature = "jemalloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use rayon::prelude::*;
use rsvelte_ast_equiv::{Comparison, Dialect, Options};
use serde::{Deserialize, Serialize};
use std::io::Read;

#[derive(Deserialize)]
struct Pair {
    id: String,
    left: String,
    right: String,
}

#[derive(Serialize)]
struct Verdict {
    id: String,
    verdict: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    side: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

fn read_side(path: &str) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| format!("{path}: {e}"))
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let mut options = Options::default();
    if args.iter().any(|a| a == "--tsx") {
        options = options.with_dialect(Dialect::Tsx);
    }
    // Comments are part of the equivalence but rsvelte does not preserve them
    // yet (see compatibility/GATES.md#ast-equivalence), so callers opt in explicitly.
    if !args.iter().any(|a| a == "--comments") {
        options = options.with_comments(rsvelte_ast_equiv::CommentPolicy::Ignore);
    }

    let mut input = String::new();
    if let Err(e) = std::io::stdin().read_to_string(&mut input) {
        eprintln!("ast_equiv_batch: cannot read stdin: {e}");
        std::process::exit(2);
    }
    let pairs: Vec<Pair> = match serde_json::from_str(&input) {
        Ok(pairs) => pairs,
        Err(e) => {
            eprintln!("ast_equiv_batch: stdin is not a JSON array of pairs: {e}");
            std::process::exit(2);
        }
    };

    let verdicts: Vec<Verdict> = pairs
        .par_iter()
        .map(|pair| {
            let (left, right) = match (read_side(&pair.left), read_side(&pair.right)) {
                (Ok(left), Ok(right)) => (left, right),
                (Err(e), _) | (_, Err(e)) => {
                    return Verdict {
                        id: pair.id.clone(),
                        verdict: "unreadable",
                        side: None,
                        message: Some(e),
                    };
                }
            };
            let (verdict, side, message) =
                match rsvelte_ast_equiv::compare_with(&left, &right, options) {
                    Comparison::Equivalent => ("equivalent", None, None),
                    Comparison::CodeDiffers { .. } => ("code-differs", None, None),
                    Comparison::CommentsDiffer { left, right } => (
                        "comments-differ",
                        None,
                        Some(format!("left {left:?} vs right {right:?}")),
                    ),
                    Comparison::Unparseable { side, failure } => {
                        ("unparseable", Some(side.to_string()), Some(failure.message))
                    }
                };
            Verdict {
                id: pair.id.clone(),
                verdict,
                side,
                message,
            }
        })
        .collect();

    match serde_json::to_string(&verdicts) {
        Ok(json) => println!("{json}"),
        Err(e) => {
            eprintln!("ast_equiv_batch: cannot serialize verdicts: {e}");
            std::process::exit(2);
        }
    }
}
