fn main() {
    println!("cargo::rustc-check-cfg=cfg(feature, values(\"napi\"))");
    #[cfg(feature = "napi")]
    napi_build::setup();

    // Read the Svelte version from the submodule's package.json
    // so that the generated code can include the correct version string.
    let svelte_pkg = std::path::Path::new("svelte/packages/svelte/package.json");
    if svelte_pkg.exists()
        && let Ok(contents) = std::fs::read_to_string(svelte_pkg)
    {
        // Simple JSON parsing for "version": "X.Y.Z"
        if let Some(start) = contents.find("\"version\"") {
            let rest = &contents[start..];
            if let Some(colon) = rest.find(':') {
                let after_colon = rest[colon + 1..].trim_start();
                if after_colon.starts_with('"') {
                    let version_start = 1;
                    if let Some(version_end) = after_colon[version_start..].find('"') {
                        let version = &after_colon[version_start..version_start + version_end];
                        println!("cargo::rustc-env=SVELTE_VERSION={}", version);
                    }
                }
            }
        }
    }
    // Fallback: if the submodule doesn't exist, the env var won't be set
    // and the code will use a default.
}
