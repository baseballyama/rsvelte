# oxc fork

rsvelte builds on [a fork of oxc](https://github.com/baseballyama/oxc).
[`Cargo.toml`](../../Cargo.toml) pins every oxc crate to one fork revision. The fork's patches
are the commits between the oxlint release under that revision and the revision itself. They add
the hooks rsvelte needs, such as the host formatters of oxfmt and the host linters of oxlint.

`node tools/oxc-fork/oxc-fork.ts rebase` replays those patches onto the latest `oxlint_v*` tag
of oxc. Then it runs the tests of the hooks:

- `cargo test -p oxc_linter --lib host::`
- `cargo check -p oxlint -p oxfmt --no-default-features`

It prints one of four results:

- The patches are already on the latest release.
- A patch conflicts. The report names the commit and its files. Resolve the conflict in the fork,
  and push the result.
- The patches apply but a test fails. The report shows the end of the output.
- The patches apply and pass. With `--push`, the rebased patches go to the fork as the branch
  `rsvelte-pin-on-<tag>`. Then pin rsvelte's oxc crates to that branch's head.

By default it fetches into a new temporary repository. `--repo <dir>` reuses an existing clone
of oxc, and `--skip-tests` only checks that the patches apply.

[The oxc fork rebase workflow](../../.github/workflows/oxc-fork-rebase.yml) runs `rebase` each
Monday. While the patches are behind, it keeps one issue open with the latest report. It closes
the issue once rsvelte pins a revision on the latest release. It does not push, because pushing
needs write access to the fork.
