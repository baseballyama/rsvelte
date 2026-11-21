//! Sorts Tailwind CSS classes with the prettier-plugin-tailwindcss of the formatted file's
//! project, run by Node.js, as oxfmt sorts them. The plugin and its version are the project's.

use std::io::{BufRead, BufReader, Write};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::{Mutex, PoisonError};

use oxfmt::HostTailwindSorter;
use serde_json::{Value, json};

/// Reads one request per line, `{ options, classes }`, and answers each with one line,
/// `{ sorted }` or `{ error }`. It sorts as oxfmt's `sortTailwindClasses` does.
const SORTER: &str = r#"
import { createInterface } from "node:readline";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// The answers are this process's output; anything the plugin logs goes to the errors.
console.log = console.error;
const modules = new Map();
const sorters = new Map();

function load(filepath) {
	let path;
	try {
		path = createRequire(filepath).resolve("prettier-plugin-tailwindcss/sorter");
	} catch {
		throw new Error(
			"sortTailwindcss needs prettier-plugin-tailwindcss, with its `sorter` entry point, " +
				"in the project of this file",
		);
	}
	if (!modules.has(path)) modules.set(path, import(pathToFileURL(path).href));
	return modules.get(path);
}

for await (const line of createInterface({ input: process.stdin })) {
	const { options, classes } = JSON.parse(line);
	let answer;
	try {
		const { createSorter } = await load(options.filepath);
		const settings = {
			filepath: options.filepath,
			stylesheetPath: options.tailwindStylesheet,
			configPath: options.tailwindConfig,
			preserveWhitespace: options.tailwindPreserveWhitespace,
			preserveDuplicates: options.tailwindPreserveDuplicates,
		};
		// One sorter per project and settings: creating one loads the project's Tailwind CSS.
		const key = JSON.stringify(settings);
		if (!sorters.has(key)) sorters.set(key, createSorter(settings));
		answer = { sorted: (await sorters.get(key)).sortClassAttributes(classes) };
	} catch (error) {
		answer = { error: String(error?.message ?? error) };
	}
	process.stdout.write(JSON.stringify(answer) + "\n");
}
"#;

/// The Node.js process, started at the first sort and shared by every file.
#[derive(Default)]
pub(super) struct Tailwind(Mutex<Option<Result<Process, String>>>);

impl HostTailwindSorter for Tailwind {
    fn sort(&self, options: &Value, classes: Vec<String>) -> Result<Vec<String>, String> {
        let mut state = self.0.lock().unwrap_or_else(PoisonError::into_inner);
        let process = match state.get_or_insert_with(Process::start) {
            Ok(process) => process,
            Err(error) => return Err(error.clone()),
        };
        let answer = process.ask(options, &classes).unwrap_or_else(|broken| {
            let error = format!("the Node.js process sorting Tailwind CSS classes {broken}");
            *state = Some(Err(error.clone()));
            Err(error)
        });
        drop(state);
        answer
    }
}

pub(super) struct Process {
    child: Child,
    input: Option<ChildStdin>,
    output: BufReader<ChildStdout>,
}

impl Process {
    fn start() -> Result<Self, String> {
        let mut child = Command::new("node")
            .args(["--input-type=module", "--eval", SORTER])
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|error| {
                format!("sortTailwindcss sorts with Node.js, which did not start: {error}")
            })?;
        let input = child.stdin.take();
        let output = BufReader::new(child.stdout.take().expect("piped"));
        Ok(Self {
            child,
            input,
            output,
        })
    }

    /// The process's answer, or how the process broke.
    fn ask(
        &mut self,
        options: &Value,
        classes: &[String],
    ) -> Result<Result<Vec<String>, String>, String> {
        let mut request = json!({ "options": options, "classes": classes }).to_string();
        request.push('\n');
        let input = self.input.as_mut().ok_or("has no input")?;
        input
            .write_all(request.as_bytes())
            .and_then(|()| input.flush())
            .map_err(|error| format!("took no request: {error}"))?;
        let mut line = String::new();
        let read = (self.output.read_line(&mut line))
            .map_err(|error| format!("gave no answer: {error}"))?;
        if read == 0 {
            return Err("ended".to_owned());
        }
        let answer: Value =
            serde_json::from_str(&line).map_err(|error| format!("answered {line:?}: {error}"))?;
        Ok(match (&answer["sorted"], &answer["error"]) {
            (Value::Array(sorted), _) => sorted
                .iter()
                .map(|list| list.as_str().map(str::to_owned))
                .collect::<Option<_>>()
                .ok_or_else(|| format!("the Tailwind CSS sorter answered {line:?}")),
            (_, Value::String(error)) => Err(error.clone()),
            _ => Err(format!("the Tailwind CSS sorter answered {line:?}")),
        })
    }
}

impl Drop for Process {
    fn drop(&mut self) {
        // Without its input, the process reads its last line and ends.
        drop(self.input.take());
        drop(self.child.wait());
    }
}
