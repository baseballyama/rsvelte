fn main() {
    // Only the NAPI cdylib build needs link-arg setup (e.g. macOS
    // `-undefined dynamic_lookup` so the addon resolves Node's symbols at load
    // time). A no-op for every other build.
    println!("cargo::rustc-check-cfg=cfg(feature, values(\"napi\"))");
    #[cfg(feature = "napi")]
    napi_build::setup();
}
