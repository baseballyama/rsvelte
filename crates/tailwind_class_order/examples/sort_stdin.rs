//! Reads one class-attribute value per line from stdin, writes the sorted value
//! per line to stdout. Used by the oracle-parity harness to compare this crate
//! against `prettier-plugin-tailwindcss` over a real corpus.

use std::io::{self, BufRead, Write};

fn main() {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut out = io::BufWriter::new(stdout.lock());
    for line in stdin.lock().lines() {
        let line = line.unwrap();
        writeln!(out, "{}", tailwind_class_order::sort_class_string(&line)).unwrap();
    }
}
