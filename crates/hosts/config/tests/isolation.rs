use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_config::process::ProcessLoader;
use rsvelte_config::{FunctionReference, Loader, TextContract};

static CONTRACT: TextContract = TextContract {
    identifier: "example.name",
    version: 2,
    arguments: &["name"],
};

#[test]
fn callback_and_input_errors_leave_the_runtime_usable() {
    static NEXT: AtomicUsize = AtomicUsize::new(0);
    let directory = std::env::temp_dir().join(format!(
        "rsvelte-config-isolation-{}-{}",
        std::process::id(),
        NEXT.fetch_add(1, Ordering::Relaxed)
    ));
    std::fs::create_dir_all(&directory).expect("test directory");
    let path = directory.join("config.mjs");
    std::fs::write(
        &path,
        "
        export default {plugins: {example: {callback: ({name}) => {
            if (name === 'bad') throw Error('bad document');
            return 'ok-' + name;
        }}}};
    ",
    )
    .expect("config");
    let loaded = ProcessLoader::node("node".into(), Vec::new())
        .load(&path)
        .expect("runtime");
    let function = loaded
        .functions
        .resolve(
            &FunctionReference::Runtime { handle: "0".into() },
            &CONTRACT,
        )
        .expect("function");
    let error = function.call(&["bad"]).expect_err("callback exception");
    assert!(error.to_string().contains("bad document"));
    let large = "x".repeat(16 * 1024 * 1024);
    let error = function.call(&[&large]).expect_err("oversized request");
    assert!(error.to_string().contains("request is too large"));
    assert_eq!(function.call(&["good"]).expect("next document"), "ok-good");
    drop(function);
    drop(loaded);
    std::fs::remove_dir_all(directory).expect("remove test directory");
}
