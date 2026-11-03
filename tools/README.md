# tools

Each directory here is one tool: a package of the pnpm workspace that Node 26 runs directly.
Every tool follows the same layout.

| Rule        | What it says                                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Package     | `tools/<name>/` is the package `@rsvelte-experimental/<name>`, with a `description`.                                                                                                                                                 |
| Files       | Every tool has `README.md`, `package.json`, `tsconfig.json` (the same in every tool) and `<name>.ts`.                                                                                                                                |
| Entry       | `<name>.ts` is the only file Node runs. Its header lists every command with its options.                                                                                                                                             |
| Commands    | A tool with several commands runs `node tools/<name>/<name>.ts <command>`. Command `x` is `x.ts`, which exports `main(args)` and reads its own options. A library exports `<name>.ts` and has no commands.                           |
| Names       | File names are kebab-case and say what the file holds. A directory groups the modules of one part (`behaviour/`, `semantic/`, `tasks/`, `workloads/`), and a module that lists them sits next to it with the same name (`tasks.ts`). |
| Tests       | `x.test.ts` tests `x.ts` and sits next to it. A test of something outside the tool (a crate, the repository) is named for that thing. Test inputs go in `tests/` next to the test.                                                   |
| Other files | A non-TypeScript file that a module uses is named for that module (`macos-cycles.c`, `linux.Dockerfile`). Committed data is JSON at the tool's root, named for what it holds (`baseline.json`).                                      |
| Output      | A tool writes local output to `generated/`, which Git ignores. Type checks and tests do not read it.                                                                                                                                 |
| Scripts     | `package.json` has `<name>` (`node <name>.ts`) when the tool has commands, `test` (`node --test '*.test.ts' '*/*.test.ts'`) when it has tests, and `typecheck`.                                                                      |
