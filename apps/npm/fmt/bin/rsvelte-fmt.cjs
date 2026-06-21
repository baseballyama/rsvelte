#!/usr/bin/env node
// Loader for the @rsvelte/fmt CLI. Resolves the right
// `@rsvelte/fmt-<triple>` optional dependency for the current platform and
// execs its binary. Before spawning, it tries to resolve the consumer's
// `oxfmt` install so the native formatter can delegate non-`.svelte` files
// (and `<style>` CSS) to it — leaving the oxfmt version entirely up to the
// user (declared here as an optional peer dependency, never pinned).

const { spawnSync } = require("node:child_process");
const { chmodSync, statSync, readFileSync, constants } = require("node:fs");
const path = require("node:path");

function resolveTriple() {
  const { platform, arch } = process;
  if (platform === "darwin") {
    if (arch === "arm64") return "darwin-arm64";
    if (arch === "x64") return "darwin-x64";
  } else if (platform === "linux") {
    // Detect musl vs glibc. Node 18+ exposes the runtime glibc version in
    // `process.report.getReport().header.glibcVersionRuntime`; if it's empty
    // we're almost certainly on musl.
    let isMusl = false;
    try {
      const header = process.report.getReport().header;
      isMusl = !header.glibcVersionRuntime;
    } catch {
      isMusl = false;
    }
    const libc = isMusl ? "musl" : "gnu";
    if (arch === "x64") return `linux-x64-${libc}`;
    if (arch === "arm64") return `linux-arm64-${libc}`;
  } else if (platform === "win32") {
    if (arch === "x64") return "win32-x64-msvc";
  }
  return null;
}

const triple = resolveTriple();
if (!triple) {
  console.error(
    `[@rsvelte/fmt] Unsupported platform: ${process.platform}-${process.arch}.\n` +
      `Open an issue at https://github.com/baseballyama/rsvelte/issues if you'd like this platform supported.`,
  );
  process.exit(1);
}

const pkgName = `@rsvelte/fmt-${triple}`;
const binName = process.platform === "win32" ? "rsvelte-fmt.exe" : "rsvelte-fmt";

let binPath;
try {
  binPath = require.resolve(`${pkgName}/${binName}`);
} catch (err) {
  console.error(
    `[@rsvelte/fmt] Couldn't find the platform binary "${pkgName}".\n` +
      `This usually means npm/pnpm skipped the optional dependency for your platform.\n` +
      `Try reinstalling: npm install --include=optional ${pkgName}\n\n` +
      `Original error: ${err.message}`,
  );
  process.exit(1);
}

// `pnpm pack` (used by `pnpm publish` and therefore `changeset publish` when
// pnpm is detected) normalises file modes to 0644, dropping the execute bit
// the staging script set before pack. On POSIX, re-apply +x best-effort right
// before spawn so the binary can actually run.
if (process.platform !== "win32") {
  try {
    const mode = statSync(binPath).mode;
    if (!(mode & constants.S_IXUSR)) {
      chmodSync(binPath, (mode & 0o777) | 0o111);
    }
  } catch {
    // Read-only filesystems and similar are not fatal here — spawn will
    // surface a clear error below if the binary really isn't executable.
  }
}

const argv = process.argv.slice(2);
const env = { ...process.env };

// Resolve the consumer's `oxfmt` so `rsvelte-fmt` can delegate non-`.svelte`
// files and `<style>` CSS bodies to it. We never pin a version: whatever
// `oxfmt` the user installed (or has on `$PATH`) wins.
//
//   1. If the user already passed `--oxfmt-bin`, leave argv untouched.
//   2. Else resolve `oxfmt/bin/oxfmt` (a Node launcher) and pass it. The
//      native binary runs JS launchers through `node` (it reads the exact
//      interpreter from `RSVELTE_FMT_NODE`), so this works on Windows too.
//   3. Else pass nothing — the binary falls back to `oxfmt` on `$PATH`.
const userSetOxfmtBin = argv.some((a) => a === "--oxfmt-bin" || a.startsWith("--oxfmt-bin="));
if (!userSetOxfmtBin) {
  const oxfmtLauncher = resolveOxfmtLauncher();
  if (oxfmtLauncher) {
    argv.push("--oxfmt-bin", oxfmtLauncher);
    env.RSVELTE_FMT_NODE = process.execPath;
  }
}

function resolveOxfmtLauncher() {
  // Prefer the direct subpath; fall back to reading the package's `bin`
  // field in case `exports` gates subpath resolution.
  try {
    return require.resolve("oxfmt/bin/oxfmt");
  } catch {
    // fall through
  }
  try {
    const pkgJsonPath = require.resolve("oxfmt/package.json");
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    const binRel = typeof pkg.bin === "string" ? pkg.bin : pkg.bin && pkg.bin.oxfmt;
    if (binRel) {
      return path.join(path.dirname(pkgJsonPath), binRel);
    }
  } catch {
    // oxfmt isn't installed — the native binary will look for `oxfmt`
    // on `$PATH` instead.
  }
  return null;
}

const result = spawnSync(binPath, argv, {
  stdio: "inherit",
  windowsHide: true,
  env,
});

if (result.error) {
  console.error(`[@rsvelte/fmt] Failed to exec ${binPath}: ${result.error.message}`);
  process.exit(1);
}

// If the native binary was killed by a signal (e.g. SIGABRT from a Rust
// panic), `result.status` is null and `result.signal` holds the signal
// name. Returning `status ?? 0` here would mask the crash as a clean exit 0,
// hiding panics and any partial/corrupt output from tooling and CI. Propagate
// signal terminations as the conventional 128 + signal-number exit code.
if (result.signal) {
  const signum = require("node:os").constants.signals[result.signal];
  console.error(`[@rsvelte/fmt] ${binPath} was terminated by ${result.signal}.`);
  process.exit(typeof signum === "number" ? 128 + signum : 1);
}
process.exit(result.status ?? 0);
