import path from "node:path";
import { pathToFileURL } from "node:url";

function replaceUris(value, workspace) {
  if (typeof value === "string") {
    const workspacePath = path.resolve(workspace);
    const workspaceUri = pathToFileURL(workspacePath).href.replace(/\/$/, "");
    let normalized = value
      .replaceAll(workspaceUri, "<workspaceUri>")
      .replaceAll(workspacePath, "<workspacePath>");
    const slashPath = workspacePath.replaceAll(path.sep, "/");
    if (slashPath !== workspacePath)
      normalized = normalized.replaceAll(slashPath, "<workspacePath>");
    const nodeModules = normalized.lastIndexOf("/node_modules/");
    if (nodeModules >= 0)
      normalized = `<node_modules>${normalized.slice(nodeModules + "/node_modules".length)}`;
    return normalized;
  }
  if (Array.isArray(value))
    return value.map((item) => replaceUris(item, workspace));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      replaceUris(child, workspace),
    ]),
  );
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])]),
  );
}

export function normalizeResponse(method, message, workspace) {
  if (message.error) {
    return sortKeys({
      error: { code: message.error.code, message: message.error.message },
    });
  }
  let result = structuredClone(message.result ?? null);
  if (method === "initialize" && result && typeof result === "object")
    delete result.serverInfo;
  if (
    method === "textDocument/diagnostic" &&
    result &&
    typeof result === "object"
  )
    delete result.resultId;
  return sortKeys(replaceUris(result, path.resolve(workspace)));
}

export function normalizeExpected(method, expected, workspace) {
  const result =
    method === "textDocument/diagnostic"
      ? { kind: "full", items: expected }
      : expected;
  return sortKeys(replaceUris(result, path.resolve(workspace)));
}

// Upstream's snapshot is one provider's return value; the live pull-diagnostic
// response aggregates every plugin the server hosts, and the wire spells "no
// result" as `null` where a provider returns an empty list. Both are
// representation, not behaviour, so the oracle calibration reads through them —
// the ratchet comparison deliberately does not.
export function calibrationView(expected, result) {
  let value = result;
  if (value && Array.isArray(value.items)) {
    value = {
      ...value,
      items: value.items.filter(
        (item) => item.source === "ts" || item.source === "js",
      ),
    };
  }
  if (value === null && Array.isArray(expected)) value = [];
  return value;
}

export function equalJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
