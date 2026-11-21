//! PoC: `rsvelte poc-format-lint [--check]`: `format` and `lint` over the current directory in
//! one kernel run, so each Svelte, JavaScript and TypeScript file is parsed once.
//!
//! oxfmt walks, resolves each file's options, writes and reports; the kernel formats the files
//! oxfmt would format as JS/TS or through the Svelte host, from the parse lint shares.

use std::collections::{HashMap, HashSet};
use std::io::IsTerminal;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::{Arc, Mutex};

use oxfmt::share::{FormatPlan, FormatResult, Preformatted, SourceFormatter};
use oxfmt::{HostFormatters, Language};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::output::render_stylish;

use super::format::{Svelte, svelte_options};
use super::{LINT, installation};
use crate::commands::{files, print_report};
use crate::{configuration, configured_registry, usage};

const FORMAT_TASK: &str = "poc.format";

type Results = Mutex<HashMap<PathBuf, (String, FormatResult)>>;

struct SharedFormat {
    plans: HashMap<PathBuf, FormatPlan>,
    formatter: SourceFormatter,
    results: Arc<Results>,
}

impl std::fmt::Debug for SharedFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("SharedFormat")
    }
}

impl Task for SharedFormat {
    fn identifier(&self) -> &'static str {
        FORMAT_TASK
    }

    fn applies(&self, document: &Document) -> bool {
        self.plans.contains_key(Path::new(&document.path))
    }

    fn run(&self, context: &DocumentContext<'_>, _: &mut TaskOutput) {
        let path = Path::new(&context.document.path);
        let plan = &self.plans[path];
        let result = if plan.is_js() {
            match context.get::<rsvelte_typescript_tree::Parsed>() {
                Ok(script) => self.formatter.format_program(
                    script.tree.allocator(),
                    script.tree.get_program(script.root),
                    plan,
                ),
                Err(_) => None,
            }
        } else {
            plan.host_options().and_then(|options| {
                let options = svelte_options(&options).ok()?;
                if rsvelte_svelte_format::unported(&options).is_some() {
                    return None;
                }
                let formatted = rsvelte_svelte_format::format_document(context, &options).ok()?;
                Some(plan.host_result(context.source_text(), Ok(formatted)))
            })
        };
        // A file left out is formatted by oxfmt as usual, with its own parse.
        if let Some(result) = result {
            let entry = (context.source_text().to_owned(), result);
            self.results.lock().expect("no panic under the lock").insert(path.to_owned(), entry);
        }
    }
}

struct Computed(Arc<Results>);

impl Preformatted for Computed {
    fn result(&self, path: &Path, source_text: &str) -> Option<FormatResult> {
        let (text, result) = self.0.lock().expect("no panic under the lock").remove(path)?;
        (text == source_text).then_some(result)
    }
}

#[allow(unsafe_code)]
fn cpu() -> f64 {
    // SAFETY: getrusage writes the struct it is given.
    let mut usage: libc::rusage = unsafe { std::mem::zeroed() };
    unsafe { libc::getrusage(libc::RUSAGE_SELF, &raw mut usage) };
    usage.ru_utime.tv_sec as f64 + f64::from(usage.ru_utime.tv_usec) / 1e6
}

pub(super) fn format_and_lint(check: bool) -> ExitCode {
    let arguments: &[&str] = if check { &["--check"] } else { &[] };
    let command = match oxfmt::cli::format_command()
        .run_inner(bpaf::Args::from(arguments).set_name("rsvelte format"))
    {
        Ok(command) => command,
        Err(_) => return usage("oxfmt arguments"),
    };
    oxfmt::cli::init_rayon(command.runtime_options.threads);
    let hosts = HostFormatters::default().with(Language::Svelte, Svelte);
    let runner = oxfmt::cli::WalkRunner::new(command).with_hosts(hosts);
    let clock = std::time::Instant::now();
    let mut marks = Vec::new();
    let Ok(plans) = runner.plans() else {
        return ExitCode::from(2);
    };
    let plans: HashMap<PathBuf, FormatPlan> = (plans.into_iter())
        .filter(|plan| plan.is_js() || plan.host_options().is_some())
        .map(|plan| (plan.path().to_owned(), plan))
        .collect();
    marks.push(("plans", cpu()));
    let results = Arc::new(Results::default());
    let (mut reg, _) =
        match configured_registry(&configuration::Options::default(), &[], installation(LINT)) {
            Ok(configured) => configured,
            Err(error) => return usage(&error),
        };
    let here = std::env::current_dir().expect("current directory");
    let found = match files::find(&["."], &files::Walk { ignore_files: &[] }, &|path| {
        files::applies(&reg, LINT, path)
    }) {
        Ok(found) => found,
        Err(e) => return usage(&e),
    };
    let linted: HashSet<PathBuf> = found.iter().map(|file| here.join(file)).collect();
    let linted_for_tasks = Arc::new(linted.clone());
    reg.wrap_document_tasks(|task| {
        Box::new(OnlyFor {
            task,
            files: Arc::clone(&linted_for_tasks),
        })
    });
    let mut paths: Vec<PathBuf> = linted.iter().cloned().collect();
    paths.extend(plans.keys().filter(|p| !linted.contains(*p)).cloned());
    paths.sort();
    reg.task(SharedFormat {
        plans,
        formatter: SourceFormatter::new(rayon::current_num_threads()),
        results: Arc::clone(&results),
    });
    let tasks = [LINT, &[FORMAT_TASK]].concat();
    let documents = match files::read_all(&reg, paths, &tasks) {
        Ok(documents) => documents,
        Err(e) => return usage(&e),
    };
    marks.push(("lint walk + read", cpu()));
    let results_of_run = match files::run(&reg, &documents, &tasks) {
        Ok(results) => results,
        Err(code) => return code,
    };
    marks.push(("kernel run", cpu()));
    if std::env::var_os("POC_STATS").is_some() {
        let computed = results.lock().expect("no panic under the lock").len();
        eprintln!("poc: {} documents, {computed} formatted from the shared parse", documents.len());
    }
    let format = runner.with_preformatted(Arc::new(Computed(results))).run();
    marks.push(("oxfmt run", cpu()));
    if std::env::var_os("POC_STATS").is_some() {
        eprintln!("poc marks: {marks:?}");
    }
    let lint = print_report(render_stylish(
        &documents,
        &results_of_run,
        std::io::stdout().is_terminal(),
    ));
    if format.exit_code() != 0 {
        ExitCode::from(format.exit_code())
    } else {
        lint
    }
}

/// A lint task that runs only on the files lint walked to.
struct OnlyFor {
    task: Box<dyn Task>,
    files: Arc<HashSet<PathBuf>>,
}

impl std::fmt::Debug for OnlyFor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.task.identifier())
    }
}

impl Task for OnlyFor {
    fn identifier(&self) -> &'static str {
        self.task.identifier()
    }

    fn applies(&self, document: &Document) -> bool {
        self.files.contains(Path::new(&document.path)) && self.task.applies(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        self.task.run(context, out);
    }
}
