//! The measuring half of both Rust arms: the same timing, threads and reports, so the two arms
//! differ only in the library they call.

use std::fmt::Write as _;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Instant;

/// The tasks both arms run on one component.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Task {
    /// The component to its syntax tree, scripts and template expressions included.
    Parse,
    /// `svelte/compiler`'s `compile` with `generate: 'client'`.
    Client,
    /// The same with `generate: 'server'`.
    Server,
    /// prettier-plugin-svelte's formatting.
    Format,
}

impl Task {
    fn parse(text: &str) -> Self {
        match text {
            "parse" => Self::Parse,
            "client" => Self::Client,
            "server" => Self::Server,
            "format" => Self::Format,
            _ => panic!("expected the task parse, client, server or format, found `{text}`"),
        }
    }

    fn name(self) -> &'static str {
        match self {
            Self::Parse => "parse",
            Self::Client => "client",
            Self::Server => "server",
            Self::Format => "format",
        }
    }
}

/// One arm's library, set up for one task and a list of files.
pub trait Runner: Sync {
    /// The bytes of output for file `index`, or why the task fails on it; the timed work.
    ///
    /// # Errors
    /// The task rejects the file.
    fn run(&self, index: usize) -> Result<usize, String>;
}

/// The arm's own part: its name and how it sets up a runner.
pub trait Arm {
    const NAME: &'static str;
    /// # Errors
    /// The library does not set up.
    fn runner(task: Task, files: Vec<(String, String)>) -> Result<Box<dyn Runner>, String>;
}

/// The process's peak resident set in bytes.
fn peak_resident_bytes() -> u64 {
    let mut usage = std::mem::MaybeUninit::<libc::rusage>::zeroed();
    let usage = unsafe {
        libc::getrusage(libc::RUSAGE_SELF, usage.as_mut_ptr());
        usage.assume_init()
    };
    let peak = u64::try_from(usage.ru_maxrss).expect("a peak is not negative");
    // Linux counts kibibytes, macOS bytes.
    if cfg!(target_os = "macos") {
        peak
    } else {
        peak * 1024
    }
}

fn files(inputs: &str) -> Vec<(String, String)> {
    std::fs::read_to_string(inputs)
        .unwrap_or_else(|error| panic!("{inputs}: {error}"))
        .lines()
        .filter(|line| !line.is_empty())
        .map(|path| {
            let source = std::fs::read_to_string(path).unwrap_or_else(|e| panic!("{path}: {e}"));
            (path.to_owned(), source)
        })
        .collect()
}

fn number(text: &str, what: &str) -> usize {
    text.parse()
        .unwrap_or_else(|_| panic!("{what}: expected a number, found `{text}`"))
}

/// Stack of each worker, in MiB: `TASKS_STACK_MIB`, else 64, as the pipeline of this branch gives
/// its workers.
fn worker_stack() -> usize {
    std::env::var("TASKS_STACK_MIB").map_or(64, |mib| {
        mib.parse()
            .unwrap_or_else(|_| panic!("TASKS_STACK_MIB={mib}: expected MiB"))
    }) << 20
}

/// One pass over every file on `threads` threads; returns the bytes of output.
fn pass(runner: &dyn Runner, documents: usize, threads: usize) -> usize {
    let one = |index: usize| {
        std::hint::black_box(runner.run(index)).unwrap_or_else(|error| panic!("{error}"))
    };
    if threads == 1 {
        return (0..documents).map(one).sum();
    }
    let next = AtomicUsize::new(0);
    std::thread::scope(|scope| {
        let workers: Vec<_> = (0..threads)
            .map(|_| {
                std::thread::Builder::new()
                    .stack_size(worker_stack())
                    .spawn_scoped(scope, || {
                        let mut bytes = 0;
                        loop {
                            let index = next.fetch_add(1, Ordering::Relaxed);
                            if index >= documents {
                                return bytes;
                            }
                            bytes += one(index);
                        }
                    })
                    .expect("a worker starts")
            })
            .collect();
        workers
            .into_iter()
            .map(|worker| worker.join().expect("a worker finishes"))
            .sum()
    })
}

/// The command line of an arm.
///
/// # Panics
///
/// The arguments are wrong, a file cannot be read, or the arm fails to set up.
pub fn main<A: Arm>() {
    let arguments: Vec<String> = std::env::args().collect();
    let argument = |index: usize| -> &str {
        arguments
            .get(index)
            .map_or_else(|| panic!("{}", USAGE), String::as_str)
    };
    let task = Task::parse(argument(2));
    let started = Instant::now();
    let files = files(argument(3));
    let paths: Vec<String> = files.iter().map(|(path, _)| path.clone()).collect();
    let runner = A::runner(task, files).unwrap_or_else(|error| panic!("{error}"));
    let setup_ns = started.elapsed().as_nanos();
    match argument(1) {
        "check" => {
            std::panic::set_hook(Box::new(|_| {}));
            for (index, path) in paths.iter().enumerate() {
                let result =
                    std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| runner.run(index)));
                let reason = match result {
                    Ok(Ok(_)) => continue,
                    Ok(Err(error)) => error,
                    Err(_) => "panicked".to_owned(),
                };
                println!("{path}\t{}", reason.replace(['\n', '\t'], " "));
            }
        }
        "run" => {
            let rounds = number(argument(4), "rounds");
            let threads = number(argument(5), "threads").max(1);
            let mut round_ns = Vec::with_capacity(rounds);
            let mut output = None;
            for _ in 0..rounds {
                let started = Instant::now();
                let bytes = pass(runner.as_ref(), paths.len(), threads);
                round_ns.push(started.elapsed().as_nanos());
                assert!(
                    output.is_none_or(|b| b == bytes),
                    "a round wrote {bytes} bytes, another {output:?}"
                );
                output = Some(bytes);
            }
            let mut out = String::new();
            let _ = write!(
                out,
                "{{\"arm\":\"{}\",\"task\":\"{}\",\"documents\":{},\"rounds\":{rounds},\
                 \"threads\":{threads},\"output_bytes\":{},\"setup_ns\":{setup_ns},\
                 \"round_ns\":{round_ns:?},\"peak_resident_bytes\":{}}}",
                A::NAME,
                task.name(),
                paths.len(),
                output.unwrap_or(0),
                peak_resident_bytes(),
            );
            println!("{out}");
        }
        _ => panic!("{}", USAGE),
    }
}

const USAGE: &str =
    "expected `check <task> <inputs.txt>` or `run <task> <inputs.txt> <rounds> <threads>`";
