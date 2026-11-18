# Build time

Measures how long the Rust workspace takes to compile, clean and incremental, as a metric of its
own. Each scenario builds in `target/buildtime/<scenario>`, so `./target` is never touched. The
header of `buildtime.ts` lists the options and says how each scenario runs.

```sh
mise run buildtime                                   # every scenario, three rounds
mise run buildtime -- --only check.clean --rounds 1  # one scenario
```

Reports go to `generated/`.
