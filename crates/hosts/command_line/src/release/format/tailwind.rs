//! Sorts Tailwind CSS classes with the prettier-plugin-tailwindcss of the formatted file's
//! project, run by Node.js, as oxfmt sorts them. The plugin and its version are the project's.

use std::io::{BufRead, BufReader, Write};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::{Arc, Mutex, PoisonError};

use oxfmt::HostTailwindSorter;
use rsvelte_svelte_format::tailwind::ClassSorter;
use serde_json::{Value, json};

/// Reads one request per line, `{ options, classes }`, `{ options, lists }` or
/// `{ options, names }`, and answers each with one line, `{ sorted }` or `{ error }`. It sorts
/// `classes` as oxfmt's `sortTailwindClasses` does, gives each of `lists` in Tailwind CSS's order
/// with whether Tailwind CSS knows each class, as `[class, known]`, and tells whether each of
/// `names` is an attribute whose classes sort, as the plugin's matcher does.
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

// The plugin's `createMatcher` and `parseRegex`: an entry that is not a regular expression is a
// name. Its expressions are made once per file, as the plugin makes them, since a `g` one keeps
// state between tests.
function matchAttributes(attributes, names) {
	const exact = new Set(["class"]);
	const patterns = [];
	for (const attribute of attributes) {
		let pattern = null;
		const last = attribute.lastIndexOf("/");
		if (attribute.startsWith("/") && last > 0) {
			try {
				pattern = new RegExp(attribute.slice(1, last), attribute.slice(last + 1));
			} catch {}
		}
		if (pattern) patterns.push(pattern);
		else exact.add(attribute);
	}
	return names
		.map((name) => name ?? undefined)
		.map((name) => exact.has(name) || patterns.some((pattern) => pattern.test(name)));
}

for await (const line of createInterface({ input: process.stdin })) {
	const { options, classes, lists, names } = JSON.parse(line);
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
		const sorter = (settings) => {
			const key = JSON.stringify(settings);
			if (!sorters.has(key)) sorters.set(key, createSorter(settings));
			return sorters.get(key);
		};
		if (names) {
			answer = { sorted: matchAttributes(options.tailwindAttributes ?? [], names) };
		} else if (classes) {
			answer = { sorted: (await sorter(settings)).sortClassAttributes(classes) };
		} else {
			const preserving = await sorter({ ...settings, preserveDuplicates: true });
			const ordered = preserving.sortClassLists(lists);
			// A class Tailwind CSS knows is one the sorter removes the second of.
			const distinct = [...new Set(lists.flat())];
			const pairs = (await sorter({ ...settings, preserveDuplicates: false })).sortClassLists(
				distinct.map((name) => [name, name]),
			);
			const known = new Map(distinct.map((name, i) => [name, pairs[i].length === 1]));
			answer = { sorted: ordered.map((list) => list.map((name) => [name, known.get(name)])) };
		}
	} catch (error) {
		answer = { error: String(error?.message ?? error) };
	}
	process.stdout.write(JSON.stringify(answer) + "\n");
}
"#;

/// The Node.js process, started at the first sort and shared by every file.
#[derive(Clone, Default)]
pub(super) struct Tailwind(Arc<Mutex<Option<Result<Process, String>>>>);

impl Tailwind {
    /// The `sorted` answer to `request`, a request without its `options`.
    fn ask(&self, options: &Value, mut request: Value) -> Result<Value, String> {
        request["options"] = options.clone();
        let mut state = self.0.lock().unwrap_or_else(PoisonError::into_inner);
        let process = match state.get_or_insert_with(Process::start) {
            Ok(process) => process,
            Err(error) => return Err(error.clone()),
        };
        let answer = process.ask(&request).unwrap_or_else(|broken| {
            let error = format!("the Node.js process sorting Tailwind CSS classes {broken}");
            *state = Some(Err(error.clone()));
            Err(error)
        });
        drop(state);
        answer
    }
}

impl HostTailwindSorter for Tailwind {
    fn sort(&self, options: &Value, classes: Vec<String>) -> Result<Vec<String>, String> {
        let sorted = self.ask(options, json!({ "classes": classes }))?;
        serde_json::from_value(sorted.clone())
            .map_err(|error| format!("the Tailwind CSS sorter answered {sorted}: {error}"))
    }
}

/// The sorter of one Svelte file, whose options name its project.
pub(super) struct ForFile {
    pub(super) tailwind: Tailwind,
    pub(super) options: Value,
}

impl ClassSorter for ForFile {
    fn sort(&self, lists: Vec<String>) -> Result<Vec<String>, String> {
        self.tailwind.sort(&self.options, lists)
    }

    fn order(&self, lists: Vec<Vec<String>>) -> Result<Vec<Vec<(String, bool)>>, String> {
        let sorted = self
            .tailwind
            .ask(&self.options, json!({ "lists": lists }))?;
        serde_json::from_value(sorted.clone())
            .map_err(|error| format!("the Tailwind CSS sorter answered {sorted}: {error}"))
    }

    fn match_attributes(&self, names: Vec<Option<String>>) -> Result<Vec<bool>, String> {
        let matched = self
            .tailwind
            .ask(&self.options, json!({ "names": names }))?;
        serde_json::from_value(matched.clone())
            .map_err(|error| format!("the Tailwind CSS sorter answered {matched}: {error}"))
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
    fn ask(&mut self, request: &Value) -> Result<Result<Value, String>, String> {
        let mut request = request.to_string();
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
            (Value::Array(_), _) => Ok(answer["sorted"].clone()),
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
