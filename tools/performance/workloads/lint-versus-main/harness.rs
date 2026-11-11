//! The measuring half of both arms: the same allocator, timing, threads and reports, so the two
//! arms differ only in the lint library they call.

use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::Cell;
use std::ffi::CStr;
use std::fmt::Write as _;
use std::sync::atomic::{AtomicU8, AtomicUsize, Ordering};
use std::time::Instant;

/// `rules`: the rules of the library alone; `product`: what the tool runs on top of them, such as
/// the compiler's warnings.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Mode {
    Rules,
    Product,
}

/// One arm's lint library, set up for a list of rules and a list of files.
pub trait Linter: Sync {
    /// The number of findings on file `index`; the timed work.
    fn count(&self, index: usize) -> usize;
    /// The rule of each finding on file `index`, or why the file cannot be linted.
    fn codes(&self, index: usize) -> Result<Vec<String>, String>;
}

/// The arm's own part: its name, its rule list and how it sets up a linter.
pub trait Arm {
    type Linter: Linter;
    const NAME: &'static str;
    /// Prints the arm's rules; `arguments` follow `rules`.
    fn rules(arguments: &[String]);
    /// # Errors
    /// A rule does not configure.
    fn linter(mode: Mode, rules: &[String], files: Vec<(String, String)>)
    -> Result<Self::Linter, String>;
}

// The allocator is picked once, from `LINT_ALLOCATOR`, before the first allocation returns.
static CHOICE: AtomicU8 = AtomicU8::new(0);
const SYSTEM: u8 = 1;
const MIMALLOC: u8 = 2;

thread_local! {
    static ALLOCATIONS: Cell<(u64, u64)> = const { Cell::new((0, 0)) };
}

fn choice() -> u8 {
    let known = CHOICE.load(Ordering::Relaxed);
    if known != 0 {
        return known;
    }
    // `getenv` does not allocate, so it is safe inside the allocator.
    let value = unsafe { libc::getenv(c"LINT_ALLOCATOR".as_ptr()) };
    let picked = if !value.is_null() && unsafe { CStr::from_ptr(value) }.to_bytes() == b"mimalloc"
    {
        MIMALLOC
    } else {
        SYSTEM
    };
    CHOICE.store(picked, Ordering::Relaxed);
    picked
}

fn counted(bytes: usize) {
    // A thread being torn down has no counters left; its allocations are not measured.
    let _ = ALLOCATIONS.try_with(|cell| {
        let (count, total) = cell.get();
        cell.set((count + 1, total + bytes as u64));
    });
}

/// The system allocator or mimalloc, as `LINT_ALLOCATOR` says, counting each thread's
/// allocations.
pub struct Allocator;

unsafe impl GlobalAlloc for Allocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        counted(layout.size());
        if choice() == MIMALLOC {
            unsafe { mimalloc::MiMalloc.alloc(layout) }
        } else {
            unsafe { System.alloc(layout) }
        }
    }

    unsafe fn alloc_zeroed(&self, layout: Layout) -> *mut u8 {
        counted(layout.size());
        if choice() == MIMALLOC {
            unsafe { mimalloc::MiMalloc.alloc_zeroed(layout) }
        } else {
            unsafe { System.alloc_zeroed(layout) }
        }
    }

    unsafe fn dealloc(&self, pointer: *mut u8, layout: Layout) {
        if choice() == MIMALLOC {
            unsafe { mimalloc::MiMalloc.dealloc(pointer, layout) }
        } else {
            unsafe { System.dealloc(pointer, layout) }
        }
    }

    unsafe fn realloc(&self, pointer: *mut u8, layout: Layout, size: usize) -> *mut u8 {
        counted(size);
        if choice() == MIMALLOC {
            unsafe { mimalloc::MiMalloc.realloc(pointer, layout, size) }
        } else {
            unsafe { System.realloc(pointer, layout, size) }
        }
    }
}

fn thread_allocations() -> (u64, u64) {
    ALLOCATIONS.with(Cell::get)
}

fn allocator_name() -> &'static str {
    if choice() == MIMALLOC {
        "mimalloc"
    } else {
        "system"
    }
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

fn lines(path: &str) -> Vec<String> {
    std::fs::read_to_string(path)
        .unwrap_or_else(|error| panic!("{path}: {error}"))
        .lines()
        .filter(|line| !line.is_empty())
        .map(str::to_owned)
        .collect()
}

fn files(inputs: &str) -> Vec<(String, String)> {
    lines(inputs)
        .into_iter()
        .map(|path| {
            let source = std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("{path}: {e}"));
            (path, source)
        })
        .collect()
}

fn mode(text: &str) -> Mode {
    match text {
        "rules" => Mode::Rules,
        "product" => Mode::Product,
        _ => panic!("expected the mode `rules` or `product`, found `{text}`"),
    }
}

fn number(text: &str, what: &str) -> usize {
    text.parse()
        .unwrap_or_else(|_| panic!("{what}: expected a number, found `{text}`"))
}

fn json_string(out: &mut String, text: &str) {
    out.push('"');
    for c in text.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            c if u32::from(c) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", u32::from(c));
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

/// One pass over every file on `threads` threads; returns the number of findings.
fn pass<L: Linter>(linter: &L, documents: usize, threads: usize) -> usize {
    if threads == 1 {
        return (0..documents)
            .map(|index| std::hint::black_box(linter.count(index)))
            .sum();
    }
    let next = AtomicUsize::new(0);
    std::thread::scope(|scope| {
        let workers: Vec<_> = (0..threads)
            .map(|_| {
                scope.spawn(|| {
                    let mut findings = 0;
                    loop {
                        let index = next.fetch_add(1, Ordering::Relaxed);
                        if index >= documents {
                            return findings;
                        }
                        findings += std::hint::black_box(linter.count(index));
                    }
                })
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
    let setup = |index: usize| {
        let started = Instant::now();
        let mode = mode(argument(index));
        let rules = lines(argument(index + 1));
        let files = files(argument(index + 2));
        let count = files.len();
        let linter = A::linter(mode, &rules, files).unwrap_or_else(|error| panic!("{error}"));
        (mode, rules, count, linter, started.elapsed().as_nanos())
    };
    match argument(1) {
        "rules" => A::rules(&arguments[2..]),
        "check" => {
            let (_, _, count, linter, _) = setup(2);
            std::panic::set_hook(Box::new(|_| {}));
            let inputs = lines(argument(4));
            for index in 0..count {
                let result =
                    std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| linter.codes(index)));
                let reason = match result {
                    Ok(Ok(_)) => continue,
                    Ok(Err(error)) => error,
                    Err(_) => "panicked".to_owned(),
                };
                println!("{}\t{}", inputs[index], reason.replace(['\n', '\t'], " "));
            }
        }
        "findings" => {
            let (_, _, count, linter, _) = setup(2);
            let mut counts = std::collections::BTreeMap::<String, usize>::new();
            for index in 0..count {
                for code in linter.codes(index).unwrap_or_else(|error| panic!("{error}")) {
                    *counts.entry(code).or_default() += 1;
                }
            }
            for (code, n) in counts {
                println!("{code}\t{n}");
            }
        }
        "files" => {
            let (_, _, count, linter, _) = setup(2);
            let rounds = number(argument(5), "rounds");
            let inputs = lines(argument(4));
            for index in 0..count {
                let fastest = (0..rounds)
                    .map(|_| {
                        let started = Instant::now();
                        std::hint::black_box(linter.count(index));
                        started.elapsed().as_nanos()
                    })
                    .min()
                    .expect("one round");
                println!("{}\t{fastest}", inputs[index]);
            }
        }
        "lint" => {
            let (mode, rules, count, linter, setup_ns) = setup(2);
            let rounds = number(argument(5), "rounds");
            let threads = number(argument(6), "threads").max(1);
            let mut round_ns = Vec::with_capacity(rounds);
            let mut findings = None;
            let mut allocations = (0, 0);
            for _ in 0..rounds {
                let before = thread_allocations();
                let started = Instant::now();
                let found = pass(&linter, count, threads);
                round_ns.push(started.elapsed().as_nanos());
                let after = thread_allocations();
                allocations = (after.0 - before.0, after.1 - before.1);
                assert!(
                    findings.is_none_or(|f| f == found),
                    "a round found {found} findings, another {findings:?}"
                );
                findings = Some(found);
            }
            let mut out = String::new();
            out.push_str("{\"arm\":");
            json_string(&mut out, A::NAME);
            let _ = write!(
                out,
                ",\"mode\":\"{}\",\"allocator\":\"{}\",\"documents\":{count},\"rules\":{},\
                 \"rounds\":{rounds},\"threads\":{threads},\"findings\":{},\"setup_ns\":{setup_ns},\
                 \"round_ns\":{:?},\"peak_resident_bytes\":{}",
                if mode == Mode::Rules { "rules" } else { "product" },
                allocator_name(),
                rules.len(),
                findings.unwrap_or(0),
                round_ns,
                peak_resident_bytes(),
            );
            // Other threads' allocations are not counted, so only one thread gives a count.
            if threads == 1 && rounds > 0 {
                let _ = write!(
                    out,
                    ",\"allocations\":{},\"allocated_bytes\":{}",
                    allocations.0, allocations.1
                );
            } else {
                out.push_str(",\"allocations\":null,\"allocated_bytes\":null");
            }
            out.push('}');
            println!("{out}");
        }
        _ => panic!("{}", USAGE),
    }
}

const USAGE: &str = "expected `rules …`, `check <mode> <rules.txt> <inputs.txt>`, `findings <mode> \
                     <rules.txt> <inputs.txt>`, `files <mode> <rules.txt> <inputs.txt> <rounds>` \
                     or `lint <mode> <rules.txt> <inputs.txt> <rounds> <threads>`";
