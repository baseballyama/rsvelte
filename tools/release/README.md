# Release

A release publishes the `rsvelte` command to npm. Pushing the tag `v<version>` starts
[the release workflow](../../.github/workflows/release.yml), where `<version>` is
`[workspace.package] version` in `Cargo.toml`:

```sh
git tag v0.1.0 && git push origin v0.1.0
```

Each platform builds `rsvelte` and `rsvelte-svelte-content-mapper`. Then
`node tools/release/release.ts stage` writes the packages:

- `@rsvelte/cli-<platform>` for each platform in `stage.ts`, with its two programs.
- `rsvelte`, which depends on every platform package. npm installs only the one for the
  machine. The package's `rsvelte` command is `launcher.js`, which starts that program.

The workflow publishes the platform packages first, and `rsvelte` last. It skips a package
whose version is already published, so running it again finishes a partial release. Run it by
hand (`workflow_dispatch`) to build and stage without publishing.

npm trusted publishing cannot create a package. Before the first release, publish each
package once by hand, then add this repository's release workflow as its trusted publisher on
npmjs.com.
