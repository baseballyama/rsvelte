// Point the official language server at the Svelte this repository pins.
//
// `importPackage.ts:29-31` pushes the document's own directory onto the
// resolution paths only `if (isTrusted)`, so which Svelte the server loads is
// decided by the run: `verify.mjs` sends `isTrusted` false only for `corpus`,
// and an untrusted run therefore falls back to the Svelte installed beside the
// server — `language-tools`' own lockfile choice, which is Svelte 4. Under
// Svelte 4 the server's svelte2tsx falls back to a Svelte 4 parser,
// `document.isSvelte5` is false, and the oracle answers differently rather than
// failing: those answers then enrol into a shrink-only ratchet and defend the
// degradation. A trusted run never reaches the fallback for a document whose
// own workspace resolves `svelte`, which is why the link below is not on its
// own evidence about what a given run measured — use `svelteForDocument`.
//
// The fix is one symlink. Nothing is installed and no project code runs.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/// Where the official server resolves a bare `svelte` from.
export const OFFICIAL_SVELTE_LINK = path.join(
  ROOT,
  "submodules/language-tools/packages/language-server/node_modules/svelte",
);

/// The Svelte package this repository's own lockfile pins.
export function pinnedSveltePackage(root = ROOT) {
  const require = createRequire(path.join(root, "package.json"));
  return path.dirname(require.resolve("svelte/package.json"));
}

export function packageVersion(directory) {
  if (!directory || !fs.existsSync(path.join(directory, "package.json")))
    return null;
  return JSON.parse(
    fs.readFileSync(path.join(directory, "package.json"), "utf8"),
  ).version;
}

/// The version the official server would load right now. `null` means the
/// language-tools workspace is not installed; a dangling link throws, because
/// reporting it as "absent" is how a half-applied pin reads as a fresh checkout.
export function officialSvelteVersion(root = ROOT) {
  const link = officialSvelteLink(root);
  let entry;
  try {
    entry = fs.lstatSync(link);
  } catch {
    return null;
  }
  if (entry.isSymbolicLink() && !fs.existsSync(link)) {
    throw new Error(
      `${link} is a dangling symlink to ${fs.readlinkSync(link)}`,
    );
  }
  return packageVersion(fs.realpathSync(link));
}

export function officialSvelteLink(root = ROOT) {
  return path.join(
    root,
    "submodules/language-tools/packages/language-server/node_modules/svelte",
  );
}

/// The Svelte the server would load for a document at `fromPath`, resolved the
/// way `importPackage.ts:27-38` does it: the document's own directory first when
/// the run is trusted, then the server's own directory as the fallback. This is
/// the only resolution that answers "what did this run measure" — the fallback
/// alone is what a trusted run does NOT use, and printing it there reads as
/// evidence that the pin took effect when it did not.
export function svelteForDocument(serverScript, fromPath, trusted) {
  const paths = [];
  if (trusted && fromPath) paths.push(fromPath);
  paths.push(path.dirname(path.resolve(serverScript)));
  let manifest;
  try {
    manifest = createRequire(path.resolve(serverScript)).resolve(
      "svelte/package.json",
      { paths },
    );
  } catch {
    return { version: null, path: null };
  }
  return { version: packageVersion(path.dirname(manifest)), path: manifest };
}

export function pinOfficialSvelte(root = ROOT) {
  const target = pinnedSveltePackage(root);
  const pinned = packageVersion(target);
  if (!pinned) throw new Error(`no svelte package.json under ${target}`);
  if (Number(pinned.split(".")[0]) < 5) {
    throw new Error(
      `this repository pins svelte ${pinned}; the gate needs 5.x for the official server to project with a Svelte 5 parser`,
    );
  }
  const link = officialSvelteLink(root);
  let before = null;
  try {
    before = officialSvelteVersion(root);
  } catch {
    before = "(dangling)";
  }
  fs.mkdirSync(path.dirname(link), { recursive: true });
  const entry = fs.lstatSync(link, { throwIfNoEntry: false });
  if (entry && !entry.isSymbolicLink()) {
    // A real directory is an installed copy, not a pnpm link. Deleting one
    // silently would leave a tree only a re-install can explain.
    throw new Error(
      `${link} is a real directory, not a symlink; remove it and re-run, or install with pnpm`,
    );
  }
  if (entry) fs.unlinkSync(link);
  fs.symlinkSync(path.relative(path.dirname(link), target), link, "dir");
  const after = officialSvelteVersion(root);
  if (after !== pinned) {
    throw new Error(`relinked svelte reads ${after}, expected ${pinned}`);
  }
  return { before, after, link, target };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { before, after, link } = pinOfficialSvelte();
  console.log(
    `[pin-official-svelte] ${link}: ${before ?? "(absent)"} -> ${after}`,
  );
}
