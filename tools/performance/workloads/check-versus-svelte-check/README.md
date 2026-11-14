# Check versus svelte-check

Times the type check of whole Svelte projects. `.github/workflows/check-versus-svelte-check.yml`
runs it on x86_64 Linux, three jobs per project, and writes the report to the run's summary.

| Arm                 | What runs                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `svelte-check-ts6`  | The released svelte-check with TypeScript 6                                                                 |
| `svelte-check-tsgo` | svelte-check `--experimental-ts7` of `sveltejs/language-tools#3193`: tsgo and its svelte2tsx content mapper |
| `svelte-check-tsrs` | The same, with the TypeScript 7.1 API that `tsrs` ships in place of tsgo's                                  |
| `rsvelte-tsgo`      | `rsvelte check --task ts.check/default` with the Rust content mapper, on tsgo                               |
| `rsvelte-tsrs`      | The same on `tsrs`                                                                                          |
| `rsvelte-tsrs-fast` | The same with `TSRS_FAST=1`                                                                                 |

The workflow pins every version. Every arm reports TypeScript diagnostics only
(`--diagnostic-sources js`); rsvelte's check runs no compiler or CSS diagnostics either. The rsvelte
arms find their own files: the checker selects them from the project's `tsconfig.json`, and
`rsvelte-svelte-content-mapper` projects any other component the program reads, such as a
package's. The report counts the components of the program that tsgo builds with the official
mapper.

- `prepare.ts` fetches a project at a pinned commit and installs it from its `pnpm-lock.yaml`, or writes
  `synthetic-<N>` with `synthetic.ts`.
- `measure.ts` runs warm-up rounds, measured rounds in a shuffled order and cold rounds. It records
  the wall time, and the CPU time and peak memory of the whole process tree (`tree-usage.py`).
- A run that does not finish, or whose errors differ from its arm's first run, counts as broken and
  is not timed. On a synthetic project, every arm must report exactly the injected TS2322 errors.
- `report.ts` pairs arms by round, and reports the median ratio with a bootstrap 95% interval. It
  lists the errors that only one arm of a pair reports, by code.

```sh
W=tools/performance/workloads/check-versus-svelte-check
node $W/prepare.ts synthetic-100 <work>
node $W/measure.ts --id synthetic-100 --project <work>/synthetic-100 --tsconfig tsconfig.json \
  --language-tools <language-tools> --tools <tools> --rsvelte <rsvelte> --mapper <rsvelte-svelte-content-mapper> \
  --expect-synthetic 100 --out <results>/synthetic-100.json
node $W/report.ts <results> report.md report.json
```

`<tools>/node_modules` holds `svelte-check`, `typescript` 6, `ts7` (TypeScript 7.1) and `tsrs`.
`measure.ts` needs Python with `psutil` (`BENCH_PYTHON`). Cold rounds need Linux and `sudo`.
