//! Load-independent counters for the legacy destructuring-assignment scanner.
//!
//! The scanner rewrites one assignment then starts again on the new statement,
//! so counting its walks and their sizes is more useful than a wall-clock
//! comparison below the code-layout floor.

use std::cell::Cell;

const BUCKETS: usize = 10;

#[derive(Clone, Copy, Debug, Default)]
pub struct Snapshot {
    pub entries: u64,
    pub quick_skips: u64,
    pub scan_calls: u64,
    pub scan_bytes: u64,
    pub max_scan_bytes: u64,
    pub candidate_closers: u64,
    pub assignment_closers: u64,
    pub helper_calls: u64,
    pub helper_code_bytes: u64,
    pub max_helper_code_bytes: u64,
    pub accepted_candidates: u64,
    pub rewrites: u64,
    pub scan_size_buckets: [u64; BUCKETS],
    pub helper_size_buckets: [u64; BUCKETS],
}

thread_local! {
    static STATS: Cell<Snapshot> = const { Cell::new(Snapshot {
        entries: 0,
        quick_skips: 0,
        scan_calls: 0,
        scan_bytes: 0,
        max_scan_bytes: 0,
        candidate_closers: 0,
        assignment_closers: 0,
        helper_calls: 0,
        helper_code_bytes: 0,
        max_helper_code_bytes: 0,
        accepted_candidates: 0,
        rewrites: 0,
        scan_size_buckets: [0; BUCKETS],
        helper_size_buckets: [0; BUCKETS],
    }) };
}

fn bucket(bytes: usize) -> usize {
    let mut upper = 16usize;
    for i in 0..BUCKETS - 1 {
        if bytes <= upper {
            return i;
        }
        upper *= 4;
    }
    BUCKETS - 1
}

fn update(f: impl FnOnce(&mut Snapshot)) {
    STATS.with(|cell| {
        let mut stats = cell.get();
        f(&mut stats);
        cell.set(stats);
    });
}

pub fn record_entry() {
    update(|stats| stats.entries += 1);
}

pub fn record_quick_skip() {
    update(|stats| stats.quick_skips += 1);
}

pub fn record_scan(bytes: usize) {
    update(|stats| {
        stats.scan_calls += 1;
        stats.scan_bytes += bytes as u64;
        stats.max_scan_bytes = stats.max_scan_bytes.max(bytes as u64);
        stats.scan_size_buckets[bucket(bytes)] += 1;
    });
}

pub fn record_candidate_closer() {
    update(|stats| stats.candidate_closers += 1);
}

pub fn record_assignment_closer() {
    update(|stats| stats.assignment_closers += 1);
}

pub fn record_helper(code_bytes: usize) {
    update(|stats| {
        stats.helper_calls += 1;
        stats.helper_code_bytes += code_bytes as u64;
        stats.max_helper_code_bytes = stats.max_helper_code_bytes.max(code_bytes as u64);
        stats.helper_size_buckets[bucket(code_bytes)] += 1;
    });
}

pub fn record_accepted_candidate() {
    update(|stats| stats.accepted_candidates += 1);
}

pub fn record_rewrite() {
    update(|stats| stats.rewrites += 1);
}

pub fn reset() {
    STATS.with(|cell| cell.set(Snapshot::default()));
}

pub fn snapshot() -> Snapshot {
    STATS.with(Cell::get)
}

pub fn bucket_labels() -> [&'static str; BUCKETS] {
    [
        "<=16 B",
        "17-64 B",
        "65-256 B",
        "257 B-1 KiB",
        "1-4 KiB",
        "4-16 KiB",
        "16-64 KiB",
        "64-256 KiB",
        "256 KiB-1 MiB",
        ">1 MiB",
    ]
}
