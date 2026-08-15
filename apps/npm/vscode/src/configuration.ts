import { Uri, workspace, type WorkspaceConfiguration } from "vscode";
import type { Middleware } from "vscode-languageclient";

type JsonObject = Record<string, unknown>;

const upstreamMappings = [
  ["plugin.svelte.format", "format"],
  ["plugin.svelte.diagnostics", "lint"],
  ["plugin.svelte.completions", "completion"],
  ["plugin.svelte.hover", "hover"],
  ["plugin.svelte.selectionRange", "selectionRange"],
  ["plugin.svelte.runesLegacyModeCodeLens", "runesLegacyModeCodeLens"],
] as const;

function json(configuration: WorkspaceConfiguration): JsonObject {
  return JSON.parse(JSON.stringify(configuration)) as JsonObject;
}

function explicitlyConfigured(configuration: WorkspaceConfiguration, key: string): boolean {
  const value = configuration.inspect(key);
  return Boolean(
    value &&
    [
      value.globalValue,
      value.workspaceValue,
      value.workspaceFolderValue,
      value.globalLanguageValue,
      value.workspaceLanguageValue,
      value.workspaceFolderLanguageValue,
    ].some((entry) => entry !== undefined),
  );
}

function setPath(target: JsonObject, path: string, value: unknown): void {
  const parts = path.split(".");
  let current = target;
  for (const part of parts.slice(0, -1)) {
    const existing = current[part];
    if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
      current[part] = {};
    }
    current = current[part] as JsonObject;
  }
  current[parts.at(-1)!] = value;
}

function mergeRsvelteConfiguration(scopeUri?: string): JsonObject {
  const scope = scopeUri ? Uri.parse(scopeUri) : undefined;
  const rsvelte = workspace.getConfiguration("rsvelte", scope);
  const svelte = workspace.getConfiguration("svelte", scope);
  const merged = { ...json(svelte), ...json(rsvelte) };

  for (const [upstream, native] of upstreamMappings) {
    if (explicitlyConfigured(rsvelte, `${native}.enable`)) continue;
    const value = svelte.get<boolean>(`${upstream}.enable`);
    if (value !== undefined) setPath(merged, `${native}.enable`, value);
  }
  if (!explicitlyConfigured(rsvelte, "compilerWarnings")) {
    const warnings = svelte.get<JsonObject>("plugin.svelte.compilerWarnings");
    if (warnings) merged.compilerWarnings = warnings;
  }

  return merged;
}

export const configurationMiddleware: NonNullable<
  NonNullable<Middleware["workspace"]>["configuration"]
> = async (params, token, next) => {
  const values = await next(params, token);
  if (!Array.isArray(values)) return values;
  return values.map((value, index) =>
    params.items[index]?.section === "rsvelte"
      ? { ...(value as JsonObject), ...mergeRsvelteConfiguration(params.items[index]?.scopeUri) }
      : value,
  );
};

export function initialConfiguration(): JsonObject {
  return {
    rsvelte: mergeRsvelteConfiguration(),
    svelte: json(workspace.getConfiguration("svelte")),
  };
}
