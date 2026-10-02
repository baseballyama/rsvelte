# SHA-256 measurements

Run from the repository root:

```sh
mise exec -- node tools/hashing/benchmark.ts target/hashing-native
RUSTFLAGS='--cfg sha2_backend="soft"' mise exec -- node tools/hashing/benchmark.ts target/hashing-soft
```

The driver builds a temporary release crate with thin LTO and one codegen unit.
It compares the real kernel API, the scalar baseline from a fixed commit,
RustCrypto's digest API, compression without short-input batching, and ring.
The third argument can select another baseline commit.

Cargo runs offline. If a dependency is missing, fetch it with
`cargo fetch --manifest-path <printed manifest path>`, then run again.
`ring` is a benchmark dependency only.

Each run writes the path population, dependency lock, source and binary hashes,
all timing rounds, allocation counts, oracle timings, and a summary.
Inputs and outputs pass through `black_box`. Sixteen rounds use forward,
reverse, reverse, forward order. Allocation counting runs outside timed batches.
The driver checks every digest against Node crypto. Both the digest checker
and allocation counter have a positive control.

The soft flag disables acceleration in `sha2`; ring and Node still use their
normal backends. This does not simulate a CPU without SHA instructions.

To compare complete Vue compilation, first preserve release binaries before
and after the change, then run:

```sh
mise exec -- node tools/hashing/integration.ts <before binary> <after binary> target/hashing-integration
```

The integration driver measures the crate's Vue fixture inputs in twelve ABBA
batches, checks that every task runs, and measures the official Vue task over
the same inputs. It records binary hashes and every timing round.

Results: [SHA-256 report](../../docs/measurements/sha256/README.md).
