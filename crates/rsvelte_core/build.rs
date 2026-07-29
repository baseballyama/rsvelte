fn main() {
    let pinned_version = include_str!("svelte-version.txt").trim();
    println!("cargo::rerun-if-changed=svelte-version.txt");
    println!("cargo::rustc-env=SVELTE_VERSION={pinned_version}");

    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap_or_default();
    let svelte_pkg = std::path::Path::new(&manifest_dir)
        .join("../../submodules/svelte/packages/svelte/package.json");
    println!("cargo::rerun-if-changed={}", svelte_pkg.display());
    if svelte_pkg.exists()
        && let Ok(contents) = std::fs::read_to_string(&svelte_pkg)
        && let Some(version) = package_version(&contents)
    {
        assert_eq!(
            version, pinned_version,
            "crates/rsvelte_core/svelte-version.txt must match the Svelte submodule"
        );
    }
}

fn package_version(contents: &str) -> Option<&str> {
    let rest = &contents[contents.find("\"version\"")?..];
    let after_colon = rest[rest.find(':')? + 1..].trim_start();
    let after_quote = after_colon.strip_prefix('"')?;
    Some(&after_quote[..after_quote.find('"')?])
}
