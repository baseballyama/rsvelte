//! The measuring half of both Rust arms: the same allocator, timing, threads, output checks and
//! reports, so the two arms differ only in the library they call.

use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::Cell;
use std::ffi::CStr;
use std::fmt::Write as _;
use std::io::Write as _;
use std::sync::atomic::{AtomicU8, AtomicUsize, Ordering};
use std::time::Instant;

/// What an arm does to each component.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Task {
    /// `compile(source, { generate: 'client', runes: true })`.
    Client,
    /// `compile(source, { generate: 'server', runes: true })`.
    Server,
    /// Prettier with prettier-plugin-svelte and its default options.
    Format,
}

impl Task {
    fn parse(text: &str) -> Self {
        match text {
            "compile-client" => Self::Client,
            "compile-server" => Self::Server,
            "format" => Self::Format,
            _ => panic!("expected `compile-client`, `compile-server` or `format`, found `{text}`"),
        }
    }
}

/// One component's result: the parts compared with the official output (`js`, `css` or
/// `svelte`), and the size of what is produced but not compared, such as the source map and the
/// warnings.
#[derive(Default)]
pub struct Output {
    pub compared: Vec<(&'static str, String)>,
    pub other_bytes: usize,
}

impl Output {
    fn bytes(&self) -> usize {
        self.compared.iter().map(|(_, text)| text.len()).sum::<usize>() + self.other_bytes
    }
}

/// One arm's library, set up for one task.
pub trait Tool: Sync + Sized {
    const NAME: &'static str;
    /// # Errors
    /// The library rejects the task's options.
    fn new(task: Task) -> Result<Self, String>;
    /// # Errors
    /// The library rejects the component or does not handle it yet.
    fn run(&self, filename: &str, source: &str) -> Result<Output, String>;
}

// The allocator is picked once, from `ARM_ALLOCATOR`, before the first allocation returns.
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
    let value = unsafe { libc::getenv(c"ARM_ALLOCATOR".as_ptr()) };
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

/// The system allocator or mimalloc, as `ARM_ALLOCATOR` says, counting each thread's allocations.
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

/// A deliberate defect, for the check that the measurement catches a broken arm: `corrupt`
/// changes every seventh output, `skip` leaves every second component out of a timed round.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Defect {
    None,
    Corrupt,
    Skip,
}

fn defect() -> Defect {
    match std::env::var("ARM_DEFECT").as_deref() {
        Ok("corrupt") => Defect::Corrupt,
        Ok("skip") => Defect::Skip,
        Ok("") | Err(_) => Defect::None,
        Ok(other) => panic!("unknown ARM_DEFECT `{other}`"),
    }
}

/// Each input's name relative to the staging root, which every arm passes as the filename, and its
/// text, all read before any timing.
fn inputs(list: &str, root: &str) -> Vec<(String, String)> {
    let prefix = format!("{}/", root.trim_end_matches('/'));
    std::fs::read_to_string(list)
        .unwrap_or_else(|error| panic!("{list}: {error}"))
        .lines()
        .filter(|line| !line.is_empty())
        .map(|path| {
            let name = path
                .strip_prefix(&prefix)
                .unwrap_or_else(|| panic!("{path} is not under {root}"));
            let source = std::fs::read_to_string(path).unwrap_or_else(|e| panic!("{path}: {e}"));
            (name.to_owned(), source)
        })
        .collect()
}

fn number(text: &str, what: &str) -> usize {
    text.parse()
        .unwrap_or_else(|_| panic!("{what}: expected a number, found `{text}`"))
}

fn one<T: Tool>(tool: &T, files: &[(String, String)], index: usize, defect: Defect) -> usize {
    if defect == Defect::Skip && index % 2 == 1 {
        return 0;
    }
    let (name, source) = &files[index];
    match tool.run(name, source) {
        Ok(output) => std::hint::black_box(output).bytes(),
        Err(error) => panic!("{name}: {error}"),
    }
}

/// One pass over every file on `threads` threads; returns the bytes of output.
fn pass<T: Tool>(tool: &T, files: &[(String, String)], threads: usize, defect: Defect) -> usize {
    if threads == 1 {
        return (0..files.len()).map(|i| one(tool, files, i, defect)).sum();
    }
    let next = AtomicUsize::new(0);
    std::thread::scope(|scope| {
        let workers: Vec<_> = (0..threads)
            .map(|_| {
                scope.spawn(|| {
                    let mut bytes = 0;
                    loop {
                        let index = next.fetch_add(1, Ordering::Relaxed);
                        if index >= files.len() {
                            return bytes;
                        }
                        bytes += one(tool, files, index, defect);
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

/// Writes every successful component's compared parts to a pack (`tools/oracle/pack.ts`) and
/// prints each failure as `<path>\t<reason>`.
fn outputs<T: Tool>(tool: &T, files: &[(String, String)], pack: &str) {
    std::panic::set_hook(Box::new(|_| {}));
    let defect = defect();
    let mut out = std::io::BufWriter::new(
        std::fs::File::create(pack).unwrap_or_else(|error| panic!("{pack}: {error}")),
    );
    out.write_all(b"# rsvelte pack 1\n").expect("write the pack");
    let stdout = std::io::stdout();
    let mut failures = stdout.lock();
    for (index, (name, source)) in files.iter().enumerate() {
        let result =
            std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| tool.run(name, source)));
        let mut output = match result {
            Ok(Ok(output)) => output,
            Ok(Err(error)) => {
                let reason = error.replace(['\n', '\t'], " ");
                writeln!(failures, "{name}\t{reason}").expect("write a failure");
                continue;
            }
            Err(_) => {
                writeln!(failures, "{name}\tpanicked").expect("write a failure");
                continue;
            }
        };
        if defect == Defect::Corrupt
            && index % 7 == 0
            && let Some((part, text)) = output.compared.first_mut()
        {
            // A statement more, so the canonical tree changes as well as the text.
            text.push_str(if *part == "js" { "\n0;\n" } else { "\n" });
        }
        for (part, text) in &output.compared {
            writeln!(out, "=== {} {name}\t{part}", text.len()).expect("write the pack");
            out.write_all(text.as_bytes()).expect("write the pack");
            out.write_all(b"\n").expect("write the pack");
        }
    }
    out.flush().expect("write the pack");
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

/// The command line of an arm.
///
/// # Panics
///
/// The arguments are wrong, a file cannot be read, or the arm fails on a timed component.
pub fn main<T: Tool>() {
    let started = Instant::now();
    let arguments: Vec<String> = std::env::args().collect();
    let argument = |index: usize| -> &str {
        arguments
            .get(index)
            .map_or_else(|| panic!("{}", USAGE), String::as_str)
    };
    let task = Task::parse(argument(2));
    let files = inputs(argument(3), argument(4));
    let tool = T::new(task).unwrap_or_else(|error| panic!("{error}"));
    match argument(1) {
        "outputs" => outputs(&tool, &files, argument(5)),
        "run" => {
            let setup_ns = started.elapsed().as_nanos();
            let rounds = number(argument(5), "rounds");
            let threads = number(argument(6), "threads").max(1);
            let defect = defect();
            let mut round_ns = Vec::with_capacity(rounds);
            let mut bytes = None;
            let mut allocations = (0, 0);
            for _ in 0..rounds {
                let before = thread_allocations();
                let begun = Instant::now();
                let produced = pass(&tool, &files, threads, defect);
                round_ns.push(begun.elapsed().as_nanos());
                let after = thread_allocations();
                allocations = (after.0 - before.0, after.1 - before.1);
                assert!(
                    bytes.is_none_or(|b| b == produced),
                    "a round produced {produced} bytes, another {bytes:?}"
                );
                bytes = Some(produced);
            }
            let mut out = String::new();
            out.push_str("{\"arm\":");
            json_string(&mut out, T::NAME);
            let _ = write!(
                out,
                ",\"task\":\"{}\",\"allocator\":\"{}\",\"documents\":{},\"rounds\":{rounds},\
                 \"threads\":{threads},\"output_bytes\":{},\"setup_ns\":{setup_ns},\
                 \"round_ns\":{:?},\"peak_resident_bytes\":{}",
                argument(2),
                allocator_name(),
                files.len(),
                bytes.unwrap_or(0),
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

const USAGE: &str = "expected `outputs <task> <inputs.txt> <root> <output.pack>` or `run <task> \
                     <inputs.txt> <root> <rounds> <threads>`, where <task> is `compile-client`, \
                     `compile-server` or `format`";
