import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { calibrationView, normalizeResponse } from "./normalize.mjs";

test("workspace URIs and filesystem paths are machine-independent", () => {
  const workspace = path.resolve("/tmp/lsp workspace");
  const result = normalizeResponse(
    "textDocument/completion",
    {
      result: {
        uri: `${pathToFileURL(workspace).href}/App.svelte`,
        fileName: path.join(workspace, ".rsvelte-language-server", "App.tsx"),
      },
    },
    workspace,
  );
  assert.deepEqual(result, {
    fileName: path.join(
      "<workspacePath>",
      ".rsvelte-language-server",
      "App.tsx",
    ),
    uri: "<workspaceUri>/App.svelte",
  });
});

test("the calibration view keeps only the snapshot's own diagnostic population", () => {
  const expected = { items: [{ code: 2322, source: "ts" }], kind: "full" };
  const live = {
    items: [
      { code: 2322, source: "ts" },
      { code: "unused-export-let", source: "svelte" },
      { code: 7006, source: "js" },
    ],
    kind: "full",
  };
  assert.deepEqual(calibrationView(expected, live), {
    items: [
      { code: 2322, source: "ts" },
      { code: 7006, source: "js" },
    ],
    kind: "full",
  });
});

test("an absent live result reads as the provider's empty list", () => {
  assert.deepEqual(calibrationView([], null), []);
  assert.equal(calibrationView({ items: [] }, null), null);
});
