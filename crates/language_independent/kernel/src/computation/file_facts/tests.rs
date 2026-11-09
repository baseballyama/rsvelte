use std::path::Path;
use std::sync::atomic::{AtomicUsize, Ordering};

use super::{FileFact, FileFacts};

/// The path itself, counting reads in `READS`.
struct Echo;

static READS: AtomicUsize = AtomicUsize::new(0);

impl FileFact for Echo {
    type Output = String;

    const NAME: &'static str = "echo";

    fn read(path: &Path) -> String {
        READS.fetch_add(1, Ordering::SeqCst);
        path.display().to_string()
    }
}

/// The path's length, so a second fact of one path is a second answer.
struct Length;

impl FileFact for Length {
    type Output = usize;

    const NAME: &'static str = "length";

    fn read(path: &Path) -> usize {
        path.as_os_str().len()
    }
}

/// `READS` is shared by tests that run at once, so every read of [`Echo`] happens under this lock.
static COUNTING: std::sync::Mutex<()> = std::sync::Mutex::new(());

fn reads_of(work: impl FnOnce()) -> usize {
    let _counting = COUNTING
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner);
    let before = READS.load(Ordering::SeqCst);
    work();
    READS.load(Ordering::SeqCst) - before
}

#[test]
fn a_fact_is_read_once_per_path() {
    let facts = FileFacts::default();
    let reads = reads_of(|| {
        assert_eq!(
            *facts.get::<Echo>(Path::new("/p/package.json")),
            "/p/package.json"
        );
        assert_eq!(
            *facts.get::<Echo>(Path::new("/p/package.json")),
            "/p/package.json"
        );
        assert_eq!(
            *facts.get::<Echo>(Path::new("/q/package.json")),
            "/q/package.json"
        );
    });
    assert_eq!(reads, 2);
    assert_eq!(*facts.get::<Length>(Path::new("/p/package.json")), 15);
}

#[test]
fn threads_that_ask_at_once_share_one_read() {
    let facts = FileFacts::default();
    let reads = reads_of(|| {
        std::thread::scope(|scope| {
            for _ in 0..8 {
                scope.spawn(|| facts.get::<Echo>(Path::new("/shared/package.json")));
            }
        });
    });
    assert_eq!(reads, 1);
}

#[test]
fn a_change_drops_the_facts_that_could_have_read_it() {
    let facts = FileFacts::default();
    reads_of(|| {
        for path in [
            "/p/package.json",
            "/p/node_modules/kit",
            "/p/src/package.json",
            "/q/package.json",
        ] {
            facts.get::<Echo>(Path::new(path));
        }
    });
    facts.get::<Length>(Path::new("/p/package.json"));
    // A sibling file is no fact's input.
    assert_eq!(facts.invalidate(Path::new("/p/src/a.svelte")), 0);
    // The file itself, of every fact.
    assert_eq!(facts.invalidate(Path::new("/p/package.json")), 2);
    // A file below a directory a fact read.
    assert_eq!(
        facts.invalidate(Path::new("/p/node_modules/kit/package.json")),
        1
    );
    // A directory that held a fact's file.
    assert_eq!(facts.invalidate(Path::new("/p/src")), 1);
    let reads = reads_of(|| {
        facts.get::<Echo>(Path::new("/q/package.json"));
        facts.get::<Echo>(Path::new("/p/package.json"));
    });
    assert_eq!(reads, 1, "only the dropped fact is read again");
}
