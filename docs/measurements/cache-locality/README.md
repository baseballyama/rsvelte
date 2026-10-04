# Cache locality evidence

See [the result](../../cache-locality.md) and `metadata.json` for scope and limits.

| Artifact | Contents |
|---|---|
| `before-source.json`, `after-source.json`, `sources.zip` | Frozen source hashes, full before tree, changed after files, inputs and license notices |
| `cache-*.json` | All simulation samples, models, tool/input/source/binary hashes and summaries |
| `profiles.zip` | One full raw and annotated sample per native arm, population and model; raw PMU probe |
| `cycles-*.json` | All actual macOS CPU counter samples |
| `allocations-*.json` | Separate instrumented warm-round heap counts |
| `layout.json` | Actual kernel and language type sizes and field offsets |
| `population-*.json`, `output-parity.json` | Input provenance and generated-output comparisons |
| `three-arms.json` | Rewrite, old Rust and official Svelte cache totals on twenty shared inputs |
| `hardware-probe.json` | Unsupported hardware events recorded as `UNMEASURED` |

Raw file paths name the local measurement directories. Representative raw profiles are
in `profiles.zip`; all numerical samples remain in the JSON reports. To read source
lines, restore the archived tree at the recorded `/w` source paths before annotation.
The final layout example is stored separately from the compiler trees in `sources.zip`.
