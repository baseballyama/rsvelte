# Release

A release publishes the `rsvelte` command and `@rsvelte/eslint-plugin` to npm, and the programs
to a GitHub release. [Changesets](https://github.com/changesets/changesets) decides the version:
a pull request that changes what a user sees adds `.changeset/<name>.md`, which names the bump
and the changelog line:

```md
---
'@rsvelte/cli': patch
---

`rsvelte format` keeps a blank line after a comment.
```

[The changeset check](../../.github/workflows/changeset.yml) fails a pull request that changes
the sources of a release, such as `crates/**/src`, but adds no changeset. For a change that users
cannot notice, add an empty one with `pnpm changeset --empty`, or the label `skip-changeset`.

On each push to `main`, [the release workflow](../../.github/workflows/release.yml) opens or
updates the pull request "Release `@rsvelte/cli`". It runs `pnpm run release:version`: Changesets
writes the version and the changelog into [`apps/cli`](../../apps/cli), and
`node tools/release/release.ts version` copies the version into `Cargo.toml` and `Cargo.lock`.
Merging that pull request releases the version, because its tag `v<version>` does not exist
yet.

The workspace and the site run the published `@rsvelte/cli`, pinned to an exact version. Changesets
leaves that pin alone (`bumpVersionsWithWorkspaceProtocolOnly` in
[`.changeset/config.json`](../../.changeset/config.json)): the version it writes is not on npm
yet, so neither `pnpm-lock.yaml` nor a frozen install could resolve it. Renovate moves the pin
once npm has the version.

Each platform builds `rsvelte` and `rsvelte-svelte-content-mapper`. Then
`node tools/release/release.ts stage` writes the packages:

- `@rsvelte/eslint-plugin`, from [`apps/eslint-plugin`](../../apps/eslint-plugin), which turns
  off the ESLint rules `rsvelte lint` runs.
- `@rsvelte/cli-<platform>` for each platform in `stage.ts`, with its two programs.
- `@rsvelte/cli`, which depends on every platform package. npm installs only the one for the
  machine. The package's `rsvelte` command is [`apps/cli/launcher.js`](../../apps/cli/launcher.js),
  which starts that program, and its README is [`apps/cli/README.md`](../../apps/cli/README.md).

The workflow publishes in that order: `@rsvelte/eslint-plugin`, the platform packages and
`@rsvelte/cli`. Last comes the GitHub release with each platform's programs, which makes the tag.
It skips what an earlier attempt already published, so the next push to `main` finishes a
partial release. Run it by hand (`workflow_dispatch`) to build and stage without publishing.

npm refuses the name `rsvelte` as too close to `svelte`, so the command package has a scope.

npm trusted publishing cannot create a package. Before the first release, publish each
package once by hand, then add this repository's release workflow as its trusted publisher on
npmjs.com.
