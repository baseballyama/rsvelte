use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    let crate_dir = env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
    let header_path = PathBuf::from(&crate_dir).join("include").join("rsvelte.h");

    println!("cargo:rerun-if-changed=src/lib.rs");
    println!("cargo:rerun-if-changed=cbindgen.toml");
    println!("cargo:rerun-if-changed=include/rsvelte.h");
    println!("cargo:rerun-if-env-changed=RSVELTE_CAPI_CHECK_HEADER");

    let config = cbindgen::Config::from_file(PathBuf::from(&crate_dir).join("cbindgen.toml"))
        .expect("cbindgen.toml");

    let bindings = match cbindgen::Builder::new()
        .with_crate(&crate_dir)
        .with_config(config)
        .generate()
    {
        Ok(b) => b,
        Err(e) => {
            println!("cargo:warning=cbindgen failed: {e}");
            return;
        }
    };

    let mut generated = Vec::new();
    bindings.write(&mut generated);
    let generated_str = String::from_utf8(generated).expect("cbindgen output is UTF-8");

    if env::var("RSVELTE_CAPI_CHECK_HEADER").as_deref() == Ok("1") {
        // CI mode — refuse to overwrite, fail loudly when committed
        // header is stale. Catches every FFI break (function signature,
        // struct layout, doc comments on exported items, etc.).
        let existing = fs::read_to_string(&header_path).unwrap_or_default();
        if normalize(&existing) != normalize(&generated_str) {
            panic!(
                "include/rsvelte.h is out of date — re-run `cargo build -p rsvelte_capi` \
                 locally and commit the updated header. (RSVELTE_CAPI_CHECK_HEADER=1)"
            );
        }
    } else {
        if let Err(e) = fs::write(&header_path, generated_str.as_bytes()) {
            println!("cargo:warning=failed to write {}: {}", header_path.display(), e);
        }
    }
}

/// Strip platform-specific line endings so the check is portable across
/// Windows checkouts that may rewrite LF to CRLF.
fn normalize(s: &str) -> String {
    s.replace("\r\n", "\n")
}
