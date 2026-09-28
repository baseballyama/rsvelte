# fixtures

This directory holds test inputs copied from real projects, and the output that the official tools
produce for them. We use this output as the expected result when we test rsvelte.

Each input file is one **unit**. Each unit has its own directory. That directory holds everything
about the unit: the input, the expected output, rsvelte's output, and any manual notes.

For the reasons behind this design, see [docs/fixtures.md](../docs/fixtures.md) (in Japanese).

## Layout

```
fixtures/
├── README.md                  this file
├── _registry/                 shared data for all languages (the "_" keeps it apart from language folders)
│   ├── sources.json
│   ├── oracles.json
│   ├── import-report.json
│   └── licenses/<source>/...
└── <family>/                  a language family: today only "svelte"; later "vue", "html", "css", ...
    └── <source>/              the id of the repository the files came from (see sources.json)
        └── <original path>/   one unit directory, e.g. svelte/bits-ui/src/lib/button.svelte/
            ├── input.svelte
            ├── meta.json
            ├── fixture.toml
            ├── expected/<task>/<variant>.<ext>
            ├── actual/<task>/<variant>.<ext>
            └── cache/<task>/<variant>.<ext>
```

Words used below:

- **source**: a repository that we copied files from.
- **unit**: one copied input file.
- **task**: one thing we test on a unit, for example `svelte.compile`.
- **variant**: one set of options for a task, for example `client` or `server`.
- **oracle**: the official tool that makes the expected output, for example the `svelte` npm package.

## What each file is for

"Written by" tells you who creates or changes the file. "In git" tells you if the file is committed.

### `_registry/`

| File | Purpose | Written by | In git |
|---|---|---|---|
| `sources.json` | The list of source repositories. For each one: id, URL, the exact commit we copied from, where the local checkout is, and the license (SPDX id and license file). Repositories we do **not** use stay in the list with an `excluded` reason. | A person (after checking the license). `import --accept-commit` also updates the commit. | yes |
| `oracles.json` | For each task, the oracle version that made the expected output (for example `svelte` 5.57.1), and the version of the parser we use to compare JavaScript (`acorn`). | `regen` | yes |
| `import-report.json` | For each source: how many files matched a known language, how many we took, how many were duplicates, and how many we skipped for each reason. | `import` | yes |
| `licenses/<source>/...` | Copies of the license files that cover the copied inputs, at their original paths. | `import` | yes |

### Unit directory (`<family>/<source>/<original path>/`)

| File | Purpose | Written by | In git |
|---|---|---|---|
| `input<ext>` | The input file, copied as is from the source. The language decides the extension: `.svelte`, `.svelte.js` or `.svelte.ts`. | `import` | yes |
| `meta.json` | Facts about the unit: `lang` (language), `sha256` (hash of the input), `mode` (the mode we test; for Svelte this is always `runes`), and `inferredMode` (the mode the official compiler picks when we give no option: `runes` or `neutral`). | `import` | yes |
| `fixture.toml` | Manual notes for this unit. `[skip]` lists tasks or variants that do not apply, with a reason. `[[adjust]]` lists small, exact changes to the expected output (see below). **`import` never changes this file.** | A person | yes |
| `expected/<task>/<variant>.js` | The JavaScript that the oracle produced. We compare it as a syntax tree (AST), not as text. | `regen` | yes |
| `expected/<task>/<variant>.css` | The CSS that the oracle produced. We compare it as exact text. | `regen` | yes |
| `expected/<task>/<variant>.warnings.json` | The warnings the oracle reported (code, message, position). Only present if there are warnings. | `regen` | yes |
| `expected/<task>/<variant>.error.json` | If the oracle failed with a compile error, the error itself. In that case this error is the expected result. | `regen` | yes |
| `actual/<task>/<variant>.<ext>` | rsvelte's output, with the same file names as in `expected/`. | the rsvelte test harness | no |
| `cache/<task>/<variant>.<ext>` | Expected output for tasks that are too large to commit (tasks with `storage: 'cached'`). | `regen` | no |

Today there are two tasks: `svelte.compile` (for `.svelte` files) and `svelte.compileModule` (for
`.svelte.js` files). Each has two variants: `client` and `server`.

## How we compare JavaScript

We parse both the expected and the actual JavaScript and compare the syntax trees. The comparison
ignores:

- positions,
- the way a literal is written (`'a'` and `"a"` are equal; `0x10` and `16` are equal),
- comments.

The comparison does **not** ignore `/* @__PURE__ */` comments, because they change what a bundler
may remove.

The exact rules are in `tools/fixtures/src/canonical.ts`.

## Changing the expected output for one unit (`[[adjust]]`)

Sometimes rsvelte's output is different from the oracle's output but means the same thing, for
example `void 0` and `undefined`. For such a case, add an entry to the unit's `fixture.toml`:

```toml
[[adjust]]
task = "svelte.compile"
variant = "client"          # optional; if you leave it out, the entry applies to all variants
at = "body.5.declaration.body.body.0.declarations.0.init.arguments.0"
expect = "void 0"           # what the oracle has at this place
replace = "undefined"       # what we accept instead
reason = "an absent initial value is undefined either way"
```

- `at` is a path in the syntax tree. The `compare` command prints this path for the first place
  where two trees differ, so you can copy it.
- The change only happens if the oracle really has `expect` at `at`. This check lets us find
  entries that no longer fit after an oracle update.

When the oracle changes, `adjust` gives each entry one of four states:

| State | Meaning | What to do |
|---|---|---|
| `ok` | `expect` is at `at`. | Nothing. |
| `rebased` | `expect` is not at `at`, but it is at exactly one other place. | Run `adjust --write` to update `at`. (If the entry has no `variant`, update it by hand.) |
| `redundant` | `replace` is already at `at`: the oracle now gives the output we wanted. | Delete the entry. |
| `stale` | `expect` is at zero places, or at more than one place. | A person must decide. |

## Skipping a task for one unit (`[skip]`)

```toml
[skip]
"svelte.compile/client" = "svelte 5.57.1 emits invalid JS here"
```

The key is a task id (`svelte.compile`) or a task and a variant (`svelte.compile/client`).

## Original paths that use a reserved name

A unit directory has children with fixed names. So if a part of the original path is one of these
names, we add `~` to the front of that part:

- `expected`, `actual`, `cache`, `meta.json`, `fixture.toml`, or any name that starts with `input.`

We also add `~` to any part that already starts with `~`. Because of this, we can always get the
original path back.

Example: `.../samples/foo/input.svelte` is stored as `.../samples/foo/~input.svelte/input.svelte`.

Tools always pass the **original** path to the compiler as `filename`, because the file name changes
the output (the component name and the CSS hash).

## Commands

The tools are written in TypeScript. Node 26 runs them directly, without a build step. The Node
version is set in `mise.toml` at the repository root.

```sh
(cd tools/fixtures && pnpm install)              # first time only
F=tools/fixtures/bin/fixtures.ts

mise exec -- node $F stats                        # count units, and units per task
mise exec -- node $F compare --task svelte.compile --variant client --report /tmp/report.txt
                                                  # compare actual/ with expected/ (add --family or --source to limit)
mise exec -- node $F adjust                       # check all [[adjust]] entries (add --write to fix "rebased")
mise exec -- node $F regen                        # make expected/ again from the oracles
mise exec -- node $F import --from <checkout>     # copy the inputs again from the source repositories
```

`<checkout>` is a directory that has every source at the path given by `checkout` in
`sources.json` (for example the `main` branch of rsvelte, which has them as git submodules).

In zsh, put only the path in `$F`, as above. zsh does not split a variable into words, so a
variable that also holds `mise exec -- node` does not work.

## Updating an oracle (for example a new Svelte version)

1. Change the version of `svelte` in `tools/fixtures/package.json` and run `pnpm install`.
2. Run `mise exec -- node $F upgrade`. This runs `regen` for all tasks and then checks all
   `[[adjust]]` entries.
3. Look at the changes: `git diff --stat -- ':(glob)fixtures/**/expected/**'`. **Each changed file
   is a change in the official tool's behavior.** Fix the `[[adjust]]` entries (see the table
   above).
4. Commit the expected output, the `fixture.toml` changes, `_registry/oracles.json` and the
   lock file together, in one commit.

Also run `import` again: the new version may accept or reject different input files.

## Adding a language or a task

- **Language** (for example Vue): add an entry to `tools/fixtures/src/languages.ts` with a
  `family` (the top folder, for example `vue`), an input extension, and a rule for which files to
  accept. Then add source repositories to `sources.json`, after you check their licenses.
- **Task** (for example lint or format): add a file to `tools/fixtures/src/tasks/`. A task
  names its oracle packages, its variants, which units it applies to, and how to compare each output
  file. Pin the oracle package to an exact version in `tools/fixtures/package.json`.

## Licenses

We only copy files from repositories with a permissive license (MIT, Apache-2.0, ISC,
BSD-3-Clause, Unlicense). The copyright of each input file stays with its source. The license that
covers each file is in `_registry/licenses/<source>/`. The URL and commit of each source are in
`_registry/sources.json`.
