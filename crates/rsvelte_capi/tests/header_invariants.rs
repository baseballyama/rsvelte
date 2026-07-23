//! Header-level invariants — catches accidental removal/renaming of
//! exported symbols even if the generated header drifts.
//!
//! Drift between committed header and lib.rs is caught separately by
//! the build script (when RSVELTE_CAPI_CHECK_HEADER=1, in CI).

use std::fmt::Write as _;
use std::path::PathBuf;

fn header() -> String {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("include")
        .join("rsvelte.h");
    std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("could not read {}: {e}", path.display()))
}

#[test]
fn required_exports_are_present() {
    let h = header();
    for symbol in [
        // Functions
        "rsvelte_version",
        "rsvelte_free",
        "rsvelte_free_raw",
        "rsvelte_compile",
        "rsvelte_compile_module",
        "rsvelte_compile_into",
        "rsvelte_compile_module_into",
        "rsvelte_compile_with_callbacks",
        "rsvelte_compile_module_with_callbacks",
        // Structs
        "struct RsvelteBuf",
        "struct RsvelteCallbacks",
        "struct RsvelteCssHashInput",
        "struct RsvelteStr",
        // Struct fields (renaming any breaks every wrapper)
        "*data",
        "len",
        "cap",
    ] {
        assert!(
            h.contains(symbol),
            "include/rsvelte.h is missing `{symbol}` — was an export removed or renamed?"
        );
    }
}

#[test]
fn header_is_cpp_safe() {
    let h = header();
    assert!(
        h.contains("extern \"C\""),
        "header must guard with extern \"C\" for C++ callers"
    );
    assert!(
        h.contains("__cplusplus"),
        "header must use __cplusplus guard"
    );
}

#[test]
fn header_has_include_guard() {
    let h = header();
    assert!(h.contains("#ifndef RSVELTE_H"));
    assert!(h.contains("#define RSVELTE_H"));
    assert!(h.contains("#endif"));
}

/// Re-run cbindgen in-process and verify the committed header exactly
/// matches it. Belt-and-braces with the build script's check.
#[test]
fn header_matches_freshly_generated() {
    let crate_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let config =
        cbindgen::Config::from_file(crate_dir.join("cbindgen.toml")).expect("cbindgen.toml");
    let bindings = cbindgen::Builder::new()
        .with_crate(&crate_dir)
        .with_config(config)
        .generate()
        .expect("cbindgen generate");
    let mut buf = Vec::new();
    bindings.write(&mut buf);
    let generated = String::from_utf8(buf).expect("utf-8");

    let committed = header();

    if normalize(&committed) != normalize(&generated) {
        panic!(
            "include/rsvelte.h drifted from cbindgen output.\n\
             Re-run `cargo build -p rsvelte_capi` and commit the changes.\n\n\
             --- diff (committed vs generated) ---\n{}",
            simple_diff(&normalize(&committed), &normalize(&generated))
        );
    }
}

fn normalize(s: &str) -> String {
    s.replace("\r\n", "\n")
}

/// Tiny line-level diff. Avoids pulling in another dev-dep.
fn simple_diff(a: &str, b: &str) -> String {
    let a: Vec<&str> = a.lines().collect();
    let b: Vec<&str> = b.lines().collect();
    let mut out = String::new();
    let max = a.len().max(b.len());
    for i in 0..max {
        let la = a.get(i).copied().unwrap_or("<EOF>");
        let lb = b.get(i).copied().unwrap_or("<EOF>");
        if la != lb {
            let _ = writeln!(out, "- {la}\n+ {lb}");
        }
    }
    out
}
