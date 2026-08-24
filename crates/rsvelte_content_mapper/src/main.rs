//! `rsvelte-content-mapper` — the stdio entry point TypeScript spawns.

use std::io::{stdin, stdout};

fn main() {
    if let Err(e) = rsvelte_content_mapper::server::serve(stdin(), stdout()) {
        eprintln!("rsvelte-content-mapper: {e}");
        std::process::exit(1);
    }
}
