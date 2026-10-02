mod baseline;

use std::hint::black_box;
use std::time::Instant;

use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::hashing;
use sha2::{Digest, Sha256};

#[global_allocator]
static ALLOCATOR: measurement::CountingAllocator = measurement::CountingAllocator;

type Hash = fn(&[u8]) -> [u8; 32];

fn digest(data: &[u8]) -> [u8; 32] {
    Sha256::digest(data).into()
}

fn ring(data: &[u8]) -> [u8; 32] {
    ring::digest::digest(&ring::digest::SHA256, data)
        .as_ref()
        .try_into()
        .expect("SHA-256 has 32 bytes")
}

fn unbatched(data: &[u8]) -> [u8; 32] {
    let mut state = [
        0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB,
        0x5BE0CD19,
    ];
    let (blocks, rest) = data.as_chunks::<64>();
    if !blocks.is_empty() {
        sha2::block_api::compress256(&mut state, blocks);
    }
    let mut tail = [0u8; 128];
    tail[..rest.len()].copy_from_slice(rest);
    tail[rest.len()] = 0x80;
    let len = if rest.len() < 56 { 64 } else { 128 };
    tail[len - 8..len].copy_from_slice(&(data.len() as u64 * 8).to_be_bytes());
    sha2::block_api::compress256(&mut state, tail[..len].as_chunks::<64>().0);
    let mut result = [0u8; 32];
    for (out, word) in result.as_chunks_mut::<4>().0.iter_mut().zip(state) {
        *out = word.to_be_bytes();
    }
    result
}

const ARMS: [(&str, Hash); 5] = [
    ("baseline", baseline::sha256),
    ("current", hashing::sha256),
    ("sha2", digest),
    ("unbatched", unbatched),
    ("ring", ring),
];

fn main() {
    #[cfg(target_arch = "aarch64")]
    eprintln!(
        "aarch64_sha2_detected={}",
        std::arch::is_aarch64_feature_detected!("sha2")
    );
    let args: Vec<_> = std::env::args().collect();
    if args[1] == "verify" {
        for len in (0..=4096).chain([65536, 1048576]) {
            let input: Vec<_> = (0..len)
                .map(|i| (i as u8).wrapping_mul(37).wrapping_add(len as u8))
                .collect();
            let expected = ring(&input);
            for (name, hash) in ARMS {
                let actual = hash(&input);
                assert_eq!(actual, expected, "{name}, length {len}");
                println!("{len},{name},{}", baseline::hex(&actual));
            }
        }
        return;
    }
    let paths = std::fs::read_to_string(&args[2]).expect("path population");
    let paths: Vec<_> = paths.lines().map(|p| p.as_bytes().to_vec()).collect();
    assert!(!paths.is_empty(), "the population must not be empty");
    measurement::track_global(true);
    let control = black_box(Box::new(black_box(1u64)));
    measurement::track_global(false);
    assert!(
        measurement::global().allocations > 0,
        "allocation counter control"
    );
    drop(control);
    let mut groups = vec![("paths".to_owned(), paths)];
    for len in [
        0, 8, 32, 55, 56, 63, 64, 65, 119, 120, 127, 128, 256, 1024, 16384, 1048576,
    ] {
        groups.push((format!("bytes-{len}"), vec![vec![b'x'; len]]));
    }
    println!("group,arm,round,ns_per_hash,iterations,population");
    for (group, inputs) in groups {
        let bytes: usize = inputs.iter().map(Vec::len).sum();
        let repeats = (100000 / inputs.len()).min(64000000 / bytes.max(1)).max(1);
        for (name, hash) in ARMS {
            for input in &inputs {
                black_box(hash(black_box(input)));
            }
            measurement::track_global(true);
            for input in &inputs {
                black_box(hash(black_box(input)));
            }
            measurement::track_global(false);
            let allocations = measurement::global();
            eprintln!(
                "{group},{name},allocations={},bytes={},population={}",
                allocations.allocations,
                allocations.bytes,
                inputs.len()
            );
            assert_eq!(allocations.allocations, 0, "{group},{name}");
        }
        for round in 0..16 {
            let reverse = round % 4 == 1 || round % 4 == 2;
            for offset in 0..ARMS.len() {
                let index = if reverse {
                    ARMS.len() - 1 - offset
                } else {
                    offset
                };
                let (name, hash) = ARMS[index];
                let start = Instant::now();
                for _ in 0..repeats {
                    for input in &inputs {
                        black_box(hash(black_box(input)));
                    }
                }
                let iterations = repeats * inputs.len();
                let ns = start.elapsed().as_nanos() as f64 / iterations as f64;
                println!(
                    "{group},{name},{round},{ns:.3},{iterations},{}",
                    inputs.len()
                );
            }
        }
    }
}
