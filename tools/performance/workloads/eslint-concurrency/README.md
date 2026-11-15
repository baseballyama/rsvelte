# ESLint concurrency

Measures the peak memory and wall time of the ESLint CLI with each `--concurrency`, on the
components and rules of the ESLint arm of [lint-versus-main](../lint-versus-main/README.md). That
arm runs one `Linter` per worker thread; this runs `eslint` itself.
`.github/workflows/eslint-concurrency.yml` runs it on x86_64 Linux, arm64 Linux and macOS, one job
for each runner and value.

- The components are those of tree `9c43cd8ed0`, staged by its `stage.ts`, less `excluded.tsv`.
  `excluded.tsv` and `rules.txt` come from that arm's
  [CI run](https://github.com/baseballyama/rsvelte/actions/runs/42851070520).
- `prepare.ts` writes `eslint.config.mjs` with the arm's rules (each `error`, default options)
  and parsers, and deletes the excluded components.
- `measure.ts run` starts each process under `/usr/bin/time` with `--no-cache` and `count.ts` as
  the formatter, which prints counts only. `measure.ts report` prints a table for each runner.

```sh
W=tools/performance/workloads/eslint-concurrency
node <tree 9c43cd8ed0>/tools/performance/workloads/lint-versus-main/stage.ts <stage>
node $W/prepare.ts <stage>
node $W/measure.ts run <stage> <out> off,1,2,4,8,16,auto 3 <label>
node $W/measure.ts report <out>...
```
