import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { normalizeResponse } from "./normalize.mjs";

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
