# SHA-256 measurements

Run from the repository root:

```sh
mise exec -- node tools/hashing/hashing.ts benchmark tools/hashing/generated/native
RUSTFLAGS='--cfg sha2_backend="soft"' mise exec -- node tools/hashing/hashing.ts benchmark tools/hashing/generated/soft
```

The driver builds a temporary release crate with thin LTO and one codegen unit. It compares:

- The SHA-256 that Vue compilation uses
- The scalar baseline from a fixed commit (the third argument selects another commit)
- RustCrypto's digest API
- Compression without short-input batching
- The `ring` crate

Cargo runs offline. If a dependency is missing, fetch it with
`cargo fetch --manifest-path <printed manifest path>`, then run again. `ring` is only a
benchmark dependency.

Each run writes the path population, the dependency lock, and the source and binary hashes. It
also writes all timing rounds, the allocation counts, the oracle timings and a summary. Inputs
and outputs pass through `black_box`. The sixteen rounds go in groups of four: forward, then
reverse twice, then forward. Allocation counting runs outside the timed batches. The driver
checks every digest against Node crypto. The digest checker and the allocation counter each
have a positive control.

The soft flag turns off acceleration in `sha2`; ring and Node still use their normal backends.
This does not simulate a CPU without SHA instructions.

To compare complete Vue compilation, first keep the release binaries from before and after the
change, then run:

```sh
mise exec -- node tools/hashing/hashing.ts integration <before binary> <after binary> tools/hashing/generated/integration
```

The integration driver measures the crate's Vue fixture inputs in twelve rounds. In each group
of four rounds, the first and last run the before binary first; the middle two run it second. It
checks that every task runs, and it measures the official Vue task over the same inputs. It
records the binary hashes and every timing round.
