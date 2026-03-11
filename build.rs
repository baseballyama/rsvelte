fn main() {
    println!("cargo::rustc-check-cfg=cfg(feature, values(\"napi\"))");
    #[cfg(feature = "napi")]
    napi_build::setup();
}
