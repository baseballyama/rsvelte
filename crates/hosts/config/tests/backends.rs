use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_config::process::ProcessLoader;
use rsvelte_config::{FunctionReference, JsonLoader, Loader, TextContract};

static CONTRACT: TextContract = TextContract {
    identifier: "svelte.compile.css-hash",
    version: 1,
    arguments: &["name", "filename", "css"],
};

#[derive(serde::Deserialize)]
struct FunctionOptions {
    #[serde(rename = "cssHash")]
    function: FunctionReference,
}

struct Directory(PathBuf);

impl Directory {
    fn new() -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let path = std::env::temp_dir().join(format!(
            "rsvelte-config-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir_all(&path).expect("create test directory");
        Self(path)
    }

    fn write(&self, filename: &str, text: &str) -> PathBuf {
        let path = self.0.join(filename);
        std::fs::write(&path, text).expect("write test input");
        path
    }
}

impl Drop for Directory {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove test directory");
    }
}

fn node() -> ProcessLoader {
    ProcessLoader::node("node".into(), Vec::new())
}

#[test]
fn json_needs_no_process_and_rejects_runtime_functions() {
    let directory = Directory::new();
    let path = directory.write("config.json", r#"{"plugins":{"example":{"enabled":true}}}"#);
    let loaded = JsonLoader.load(&path).expect("load JSON");
    assert_eq!(
        loaded.configuration.plugins["example"].get(),
        r#"{"enabled":true}"#
    );
    loaded
        .functions
        .resolve(
            &FunctionReference::Runtime { handle: "0".into() },
            &CONTRACT,
        )
        .expect_err("JSON cannot supply runtime functions");
    let invalid = directory.write("invalid.json", r#"{"unknown":true}"#);
    JsonLoader
        .load(&invalid)
        .expect_err("unknown configuration field");
}

#[test]
fn node_evaluates_imports_async_factories_and_retains_functions() {
    let directory = Directory::new();
    directory.write("helper.mjs", "export const prefix = 'custom-';");
    let path = directory.write(
        "config.mts",
        "
import { prefix } from './helper.mjs';
type Input = { name: string; filename: string; css: string };
console.log('config log goes to stderr');
let calls = 0;
export default async () => ({ plugins: { example: {
  cssHash: async ({name, filename, css}: Input) => `${prefix}${name}-${filename}-${css}-${++calls}`
} } });
",
    );
    let loaded = node().load(&path).expect("load TS config");
    let options: FunctionOptions =
        serde_json::from_str(loaded.configuration.plugins["example"].get())
            .expect("function reference");
    let function = loaded
        .functions
        .resolve(&options.function, &CONTRACT)
        .expect("resolve function");
    drop(loaded);
    assert_eq!(
        function
            .call(&["é", "file.svelte", "p{}"])
            .expect("first call"),
        "custom-é-file.svelte-p{}-1"
    );
    assert_eq!(
        function
            .call(&["a", "file.svelte", "p{}"])
            .expect("second call"),
        "custom-a-file.svelte-p{}-2"
    );
    function
        .call(&["wrong arity"])
        .expect_err("wrong argument count");
}

#[test]
fn node_reports_load_and_callback_failures() {
    let directory = Directory::new();
    for (name, source) in [
        ("throws.mjs", "throw new Error('load failure');"),
        (
            "cycle.mjs",
            "const config = {}; config.self = config; export default config;",
        ),
        (
            "undefined.mjs",
            "export default {plugins: {example: undefined}};",
        ),
    ] {
        node()
            .load(&directory.write(name, source))
            .expect_err("invalid configuration");
    }
    for (name, function) in [
        ("throws", "() => {throw new Error('call failure')}"),
        ("number", "() => 42"),
    ] {
        let source = format!("export default {{plugins: {{example: {{callback: {function}}}}}}};");
        let loaded = node()
            .load(&directory.write(&format!("{name}.mjs"), &source))
            .expect("load function");
        let function = loaded
            .functions
            .resolve(
                &FunctionReference::Runtime { handle: "0".into() },
                &CONTRACT,
            )
            .expect("resolve");
        function
            .call(&["a", "b", "c"])
            .expect_err("callback failure");
        let error = function
            .call(&["a", "b", "c"])
            .expect_err("callback still fails");
        assert!(error.to_string().contains("Error:"));
    }
}

#[test]
fn custom_loaders_use_the_same_protocol_and_check_versions() {
    let directory = Directory::new();
    let config = directory.write("config.custom", "custom input");
    for version in [1, 99] {
        let script = directory.write(
            &format!("loader-{version}.mjs"),
            &format!(
                r"
import {{createInterface}} from 'node:readline';
for await (const line of createInterface({{input:process.stdin}})) {{
 const request=JSON.parse(line);
 if (request.operation !== 'load') throw new Error('unexpected operation');
 const result = {{plugins: {{custom: {{accepted:true}}}}}};
 process.stdout.write(JSON.stringify({{version:{version},result}})+'\n');
}}
"
            ),
        );
        let loader = ProcessLoader::new("node".into(), vec![script.to_string_lossy().into_owned()]);
        let result = loader.load(&config);
        if version == 1 {
            assert!(
                result
                    .expect("custom loader")
                    .configuration
                    .plugins
                    .contains_key("custom")
            );
        } else {
            result.expect_err("protocol version mismatch");
        }
    }
}

#[test]
fn stalled_loaders_time_out_and_broken_frames_fail() {
    let directory = Directory::new();
    let config = directory.write("config.custom", "input");
    let stalled = directory.write("stalled.mjs", "setInterval(() => {}, 1000);");
    let mut loader =
        ProcessLoader::new("node".into(), vec![stalled.to_string_lossy().into_owned()]);
    loader.response_timeout = std::time::Duration::from_millis(50);
    let error = loader
        .load(&config)
        .expect_err("stalled loader must time out");
    assert!(error.to_string().contains("timed out"), "{error}");
    for (name, source) in [
        ("eof", "process.exit(0);"),
        ("invalid", "process.stdout.write('not JSON\\n');"),
        (
            "oversized",
            "process.stdout.write('x'.repeat(16 * 1024 * 1024 + 1));",
        ),
    ] {
        let script = directory.write(&format!("{name}.mjs"), source);
        let loader = ProcessLoader::new("node".into(), vec![script.to_string_lossy().into_owned()]);
        assert!(loader.load(&config).is_err(), "{name}");
    }
}

#[cfg(unix)]
fn native_library(directory: &Directory) -> PathBuf {
    let source = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/native.c");
    let library = directory.0.join("functions.so");
    let output = Command::new("cc")
        .args(["-shared", "-fPIC", "-o"])
        .arg(&library)
        .arg(source)
        .output()
        .expect("C compiler for ABI integration tests");
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    library
}

#[cfg(unix)]
#[test]
fn native_functions_keep_the_library_alive_and_validate_contracts() {
    let directory = Directory::new();
    native_library(&directory);
    let loaded = JsonLoader
        .load(&directory.write("config.json", r#"{"plugins":{}}"#))
        .expect("JSON");
    let reference = |symbol: &str| FunctionReference::Native {
        library: "functions.so".into(),
        symbol: symbol.into(),
    };
    let function = loaded
        .functions
        .resolve(&reference("css_hash"), &CONTRACT)
        .expect("native function");
    for symbol in [
        "bad_version",
        "bad_contract",
        "bad_size",
        "not_thread_safe",
        "null_entry",
        "missing",
    ] {
        assert!(
            loaded
                .functions
                .resolve(&reference(symbol), &CONTRACT)
                .is_err(),
            "{symbol}"
        );
    }
    for symbol in ["invalid_utf8", "too_long", "failed"] {
        let function = loaded
            .functions
            .resolve(&reference(symbol), &CONTRACT)
            .expect("valid descriptor");
        assert!(function.call(&["a", "b", "c"]).is_err(), "{symbol}");
    }
    drop(loaded);
    std::thread::scope(|scope| {
        for _ in 0..4 {
            let function = &function;
            scope.spawn(move || {
                assert_eq!(
                    function
                        .call(&["é", "file.svelte", "p{}"])
                        .expect("native call"),
                    "native-é"
                );
            });
        }
    });
}
