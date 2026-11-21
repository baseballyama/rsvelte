use rsvelte_configuration_loading::Loader;
use rsvelte_configuration_loading::process::ProcessLoader;
use rsvelte_plugin_interface::{FunctionReference, TextContract};

use crate::Directory;

static CONTRACT: TextContract = TextContract {
    identifier: "example.name",
    version: 2,
    arguments: &["name"],
};

#[test]
fn callback_and_input_errors_leave_the_runtime_usable() {
    let directory = Directory::new();
    let path = directory.write(
        "config.mjs",
        "
        export default {plugins: {example: {callback: ({name}) => {
            if (name === 'bad') throw Error('bad document');
            return 'ok-' + name;
        }}}};
    ",
    );
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
}
