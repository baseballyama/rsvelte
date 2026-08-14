# Publishing the rsvelte Rust crates

This document owns the crates.io release policy for `rsvelte_core`,
`rsvelte_projection`, and `rsvelte`. Publishing is permanent:
an uploaded version cannot be overwritten or deleted, so the release process
fails closed.

The Cargo Book's
[publishing guide](https://doc.rust-lang.org/cargo/reference/publishing.html)
and [manifest reference](https://doc.rust-lang.org/cargo/reference/manifest.html)
are the normative references. Trusted Publishing follows the
[crates.io documentation](https://crates.io/docs/trusted-publishing).

## Published boundary

The dependency and publication order is:

1. `rsvelte_core` — compiler implementation.
2. `rsvelte_projection` — Svelte-to-TypeScript projection engine, with an exact
   dependency on `rsvelte_core`.
3. `rsvelte` — stable, compiler-neutral toolchain facade, with exact
   dependencies on `rsvelte_core` and the optional `rsvelte_projection`.

`rsvelte_core` does not publish binaries or own CLI parsing, filesystem
traversal, file watching, module resolution, JavaScript/Wasm bindings,
allocator selection, profiling, or benchmarks.

All three crates:

- require Rust 1.95 or newer;
- have an empty default feature set;
- explicitly allow publication only to the `crates-io` registry;
- carry crate-local README and LICENSE files;
- declare repository, homepage, documentation, description, keywords, and
  categories;
- package only files required to build and document the library.

Integration tests stay auto-discovered in the workspace but are excluded from
published archives. Cargo therefore prints `ignoring test ... is not included`
warnings while normalizing these manifests. This is intentional: setting
`autotests = false` would silently remove the repository's regression targets.
The package-policy guard verifies that no test payload enters an archive.

Run the policy guard before any package command:

```sh
node scripts/ci/check-crates-io-packages.mjs
bash scripts/ci/verify-registry-dependency-surface.sh
```

## Release candidate verification

Use a clean, reviewed commit from `main`. Never publish with `--allow-dirty`,
`--no-verify`, or from a developer branch.

```sh
git status --short
node scripts/ci/check-crates-io-packages.mjs

cargo check --locked -p rsvelte_core --all-features --lib
cargo test --locked -p rsvelte_core --all-features --lib
RUSTDOCFLAGS="-D warnings" cargo doc --locked -p rsvelte_core \
  --all-features --no-deps

cargo check --locked -p rsvelte_projection --all-features --lib
cargo test --locked -p rsvelte_projection --all-features --lib
RUSTDOCFLAGS="-D warnings" cargo doc --locked -p rsvelte_projection \
  --all-features --no-deps

cargo check --locked -p rsvelte --all-features --lib
cargo test --locked -p rsvelte --all-features
RUSTDOCFLAGS="-D warnings" cargo doc --locked -p rsvelte \
  --all-features --no-deps
```

Inspect both `cargo package --list -p <crate>` and the generated `.crate`
archive. The compressed archive must remain below crates.io's 10 MiB limit.
The CI package-policy job runs the policy, registry-surface, MSRV, test, and
documentation checks on Rust 1.95. It verifies normalized dependent archives
whenever their exact versions already exist on crates.io. For a new release
set, the protected publish workflow performs those final package dry-runs in
dependency order after each prerequisite becomes visible in the registry.

The workspace's `[patch.crates-io]` entries are not available to downstream
users. The final check must therefore use the generated package and registry
dependencies, not only workspace path dependencies. Before each preceding
internal dependency exists in the registry, a complete package verification of
its dependent cannot resolve. That is an explicit first-release gate, not a
reason to use `--no-verify`.

The registry-surface script copies only production crate inputs into a
temporary workspace with no OXC patch and runs the public crates against
registry OXC. This catches source compatibility and MSRV mistakes before the
bootstrap publication. It complements, but does not replace, the final
`cargo publish --dry-run` over each normalized package after its exact internal
dependency is visible on crates.io.

## First publication

The first version of each crate must be published manually because a Trusted
Publisher cannot be configured until the crate exists. Consume and merge the
Version Packages PR first, then create the protected
`rsvelte-crates-v<toolchain-version>` tag at that reviewed `main` commit.
`rsvelte_core`, `rsvelte_projection`, and `rsvelte` must have the same version;

1. Sign in to crates.io with the maintainer account, verify its email address,
   enable strong account security, and create a short-lived API token.
2. Store the token with `cargo login`. Never paste it into an issue, PR, shell
   transcript, repository file, or GitHub secret.
3. Re-run the release candidate checks from the exact reviewed commit.
4. Verify and publish `rsvelte_core`:

   ```sh
   cargo publish --dry-run --locked -p rsvelte_core --all-features
   cargo publish --locked -p rsvelte_core --all-features
   cargo info rsvelte_core@<version>
   ```

5. Wait for `rsvelte_core@<version>` to resolve, then verify and publish
   `rsvelte_projection`:

   ```sh
   cargo publish --dry-run --locked -p rsvelte_projection --all-features
   cargo publish --locked -p rsvelte_projection --all-features
   cargo info rsvelte_projection@<version>
   ```

6. Verify and publish the stable `rsvelte` facade:

   ```sh
   cargo publish --dry-run --locked -p rsvelte --all-features
   cargo publish --locked -p rsvelte --all-features
   cargo info rsvelte@<version>
   ```

7. Build new throwaway consumers outside this workspace with exact `=version`
   requirements for both the runtime-only default surface and
   `features = ["projection"]`. Their lockfiles must contain registry sources
   only for all three published rsvelte crates.
8. Revoke the bootstrap API token and run `cargo logout`.
9. Add at least one additional crate owner so releases do not depend on one
    account.

If the uploaded artifact is broken, yank the version and release a new patch.
Do not attempt to reuse the version.

## Trusted Publishing after bootstrap

After bootstrap, configure a Trusted Publisher separately on the crates.io
settings page for all three crates. Restrict it to this repository,
`.github/workflows/publish-crates.yml`, and the `crates-io` GitHub Environment.
Configure that Environment with required reviewers, prevent self-review, and
restrict deployment branches/tags to `rsvelte-crates-v*`. Protect that tag
pattern with a repository ruleset so release tags cannot be moved or deleted.

The publish job must:

- run only for an immutable reviewed tag or explicit manual dispatch;
- use a GitHub Environment named `crates-io` with required reviewers;
- grant only `contents: read` and `id-token: write`;
- pin third-party Actions to reviewed commit SHAs;
- obtain a fresh short-lived token from
  `rust-lang/crates-io-auth-action` immediately before each publish;
- verify the checked-out commit, Cargo versions, clean tree, package policy,
  tests, documentation, and `.crate` contents before authentication;
- publish in dependency order, waiting for each exact registry version before
  publishing its dependent;
- set `CARGO_REGISTRY_TOKEN` only on the individual `cargo publish` steps;
- serialize releases with a concurrency group and never cancel an in-progress
  publish.

Dispatch `Publish crates.io` from the protected release tag and enter the
toolchain release-set version. The workflow
checks that the tag name, input versions, manifests, exact dependency edges,
lockfile, and checked-out SHA agree; it also requires the tag commit to be an
ancestor of `main`. The preflight job has read-only permissions and records a
publish/skip plan. The publishing job starts only after Environment approval.

The workflow is retry-safe for a partially completed release: an exact version
already visible in the registry is skipped, while missing dependents are still
dry-run and published in order. A failed upload is checked against the index
before a retry is attempted. After all three versions are visible, a throwaway
registry-only consumer builds the facade with `features = ["projection"]`.

Do not add a long-lived crates.io token to repository or environment secrets
after Trusted Publishing is enabled.

## Versioning

The Rust toolchain release set is intentionally coupled to
`@rsvelte/compiler`: the Version Packages workflow mirrors that npm version
into `rsvelte_core`, `rsvelte_projection`, and `rsvelte`, then updates their
exact internal requirements and lockfiles. Merging that PR creates a release
candidate; it does not publish Cargo packages. Create the protected release tag
and run the separately approved crates.io workflow promptly after the version
merge.

A release change must update every exact internal dependency requirement in

While the crates are pre-1.0, breaking public API and MSRV changes require a
minor release. Removing a feature, removing a feature from another feature, or
moving public API behind a feature is compatibility-sensitive and must not be
smuggled into a patch release.
