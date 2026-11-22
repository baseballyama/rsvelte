//! Loads a JavaScript or TypeScript oxfmt or oxlint configuration file with Node.js, as their
//! Node.js command lines load it.

use std::path::Path;
use std::process::{Command, Stdio};

use serde_json::Value;

/// Prints the default export of the file named by its one argument as JSON, as oxfmt's and
/// oxlint's `importJsConfig` takes it.
const LOADER: &str = r#"
import { pathToFileURL } from "node:url";

// The answer is this process's output; anything the configuration logs goes to the errors.
console.log = console.error;
try {
	const { default: config } = await import(pathToFileURL(process.argv[1]).href);
	if (config === undefined) throw new Error("Configuration file has no default export.");
	if (typeof config !== "object" || config === null || Array.isArray(config))
		throw new Error("Configuration file must have a default export that is an object.");
	process.stdout.write(JSON.stringify(config));
} catch (error) {
	process.stderr.write(String(error?.message ?? error));
	process.exitCode = 1;
}
"#;

pub(super) struct Node;

impl oxfmt::HostConfigLoader for Node {
    fn load(&self, path: &Path) -> Result<Value, String> {
        load(path)
    }
}

impl oxlint::cli::HostConfigLoader for Node {
    fn load(&self, path: &Path) -> Result<Value, String> {
        load(path)
    }
}

fn load(path: &Path) -> Result<Value, String> {
    let output = Command::new("node")
        .args(["--input-type=module", "--eval", LOADER])
        .arg(path)
        .stdin(Stdio::null())
        .output()
        .map_err(|error| {
            format!("a JavaScript or TypeScript configuration needs `node`: {error}")
        })?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr)
            .trim_end()
            .to_owned());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}
