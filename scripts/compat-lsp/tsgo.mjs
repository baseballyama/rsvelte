import fs from "node:fs";
import path from "node:path";

// The pinned `@typescript/native-preview` binary, not whatever `tsgo` is on PATH:
// upstream publishes dated dev builds and this gate compares exact responses.
export function resolveTsgo(root) {
  if (process.env.TSGO_BIN) return process.env.TSGO_BIN;
  const packageRoot = path.join(
    root,
    "submodules/language-tools/packages/language-server/node_modules/@typescript/native-preview",
  );
  for (const candidate of [
    path.join(root, "submodules/language-tools/node_modules/.bin/tsgo"),
    path.join(
      root,
      "submodules/language-tools/packages/language-server/node_modules/.bin/tsgo",
    ),
    path.join(packageRoot, "lib/tsgo"),
    path.join(packageRoot, "bin/tsgo"),
    path.join(packageRoot, "bin/tsgo.js"),
  ]) {
    if (fs.existsSync(candidate)) return fs.realpathSync(candidate);
  }
  const scope = path.join(
    root,
    "submodules/language-tools/packages/language-server/node_modules/@typescript",
  );
  if (fs.existsSync(scope)) {
    for (const entry of fs.readdirSync(scope)) {
      if (!entry.startsWith("native-preview-")) continue;
      for (const relative of [
        "lib/tsgo",
        "lib/tsgo.exe",
        "bin/tsgo",
        "bin/tsgo.exe",
      ]) {
        const candidate = path.join(scope, entry, relative);
        if (fs.existsSync(candidate)) return fs.realpathSync(candidate);
      }
    }
  }
  throw new Error(
    "pinned @typescript/native-preview tsgo was not found; build/install submodules/language-tools first",
  );
}
