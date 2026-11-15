# Tasks versus main

Times this branch against `main` and the official tools on every task: parse, compile for the
client and for the server, format, lint and type check. `run.ts` runs every task on one machine
and writes one report.

| Task           | `main`                  | This branch                             | Official                             |
| -------------- | ----------------------- | --------------------------------------- | ------------------------------------ |
| Parse          | `rsvelte_core::parse`   | `rsvelte_svelte_syntax::parse::parse`   | `parse` of `svelte/compiler`         |
| Client, server | `rsvelte_core::compile` | task `svelte.compile/client`, `/server` | `compile` of `svelte/compiler`       |
| Format         | `rsvelte_formatter`     | task `svelte.format/default`            | Prettier with prettier-plugin-svelte |
| Lint           | `../lint-versus-main`   | `../lint-versus-main`                   | ESLint with eslint-plugin-svelte     |
| Type check     | `svelte_check --tsgo`   | `rsvelte check` on tsgo                 | svelte-check, TypeScript 6 and tsgo  |

- The first four use the harness of `lint-versus-main`. It reads every file first, each arm calls
  its library, and more threads take files from one shared counter. The official tools and
  ESLint run plainly, on one thread only. A task leaves out each component that an arm fails on.
- Compile takes `runes: true` and the file's path, as the corpus's oracle does. Format takes the
  oracle's Prettier options. `main` parses with the options of its public `parse()` and formats
  `<style>` bodies, as Prettier does.
- Lint runs the rules both Rust arms have; see `../lint-versus-main/README.md`.
- Type check times each tool's whole command on one project; see
  `../check-versus-svelte-check/README.md`. It reads the pins of its tools from that workflow.
- Every task but the type check samples the components from real projects: `--every 8` takes
  one in eight, so the official tools' rounds stay short.

It needs a checkout of `main` and these tools:

- Rust (`rust-toolchain.toml`)
- Node, with `pnpm install` in this tree
- `git` and `npx`
- Python 3 with `venv`

```sh
git worktree add --detach ../main origin/main
node tools/performance/workloads/tasks-versus-main/run.ts --main ../main --work <directory>
```

`run.ts` prints how long each step took. Its header lists the options: the thread counts
(`1` and every logical CPU by default), repetitions, rounds, and the type check's project.
