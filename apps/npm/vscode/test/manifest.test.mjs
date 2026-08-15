import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestText = readFileSync(join(root, "package.json"), "utf8");
const manifest = JSON.parse(manifestText);

test("keeps singleton extension metadata unique", () => {
  for (const key of ["activationEvents", "icon", "engines", "capabilities"]) {
    assert.equal(manifestText.split(`\n  "${key}":`).length - 1, 1, key);
  }
});

test("ships every contributed grammar, snippet and language configuration", () => {
  const paths = [
    ...manifest.contributes.grammars.map(({ path }) => path),
    ...manifest.contributes.snippets.map(({ path }) => path),
    ...manifest.contributes.languages.flatMap(({ configuration }) =>
      configuration ? [configuration] : [],
    ),
  ];
  for (const relative of paths) {
    assert.equal(existsSync(join(root, relative)), true, relative);
  }
  assert.equal(
    manifest.contributes.grammars.some(({ scopeName }) => scopeName === "source.svelte"),
    true,
  );
  assert.deepEqual(
    manifest.contributes.languages.map(({ id }) => id),
    ["svelte", "svelte-start-tag"],
  );
  assert.deepEqual(manifest.contributes.breakpoints, [{ language: "svelte" }]);
  assert.equal(existsSync(join(root, manifest.icon)), true, manifest.icon);
});

test("activates for the full proxy surface and supports restricted workspaces", () => {
  assert.equal(manifest.engines.vscode, "^1.85.0");
  assert.deepEqual(new Set(manifest.activationEvents), new Set([
    "onLanguage:svelte",
    "onLanguage:typescript",
    "onLanguage:javascript",
    "onLanguage:typescriptreact",
    "onLanguage:javascriptreact",
    "onLanguage:json",
    "onLanguage:jsonc",
    "onLanguage:css",
    "onLanguage:scss",
    "onLanguage:less",
  ]));
  assert.equal(manifest.capabilities.untrustedWorkspaces.supported, "limited");
  assert.deepEqual(manifest.capabilities.untrustedWorkspaces.restrictedConfigurations, [
    "rsvelte.languageServer.path",
  ]);
});

test("contributes official svelte plugin settings for migration-free replacement", () => {
  const properties = manifest.contributes.configuration.properties;
  const upstream = [
    "svelte.plugin.css.colorPresentations.enable",
    "svelte.plugin.css.completions.emmet",
    "svelte.plugin.css.completions.enable",
    "svelte.plugin.css.diagnostics.enable",
    "svelte.plugin.css.documentColors.enable",
    "svelte.plugin.css.documentSymbols.enable",
    "svelte.plugin.css.enable",
    "svelte.plugin.css.globals",
    "svelte.plugin.css.hover.enable",
    "svelte.plugin.css.selectionRange.enable",
    "svelte.plugin.html.completions.emmet",
    "svelte.plugin.html.completions.enable",
    "svelte.plugin.html.documentSymbols.enable",
    "svelte.plugin.html.enable",
    "svelte.plugin.html.hover.enable",
    "svelte.plugin.html.linkedEditing.enable",
    "svelte.plugin.html.tagComplete.enable",
    "svelte.plugin.svelte.codeActions.enable",
    "svelte.plugin.svelte.compilerWarnings",
    "svelte.plugin.svelte.completions.enable",
    "svelte.plugin.svelte.defaultScriptLanguage",
    "svelte.plugin.svelte.diagnostics.enable",
    "svelte.plugin.svelte.documentHighlight.enable",
    "svelte.plugin.svelte.enable",
    "svelte.plugin.svelte.format.config.printWidth",
    "svelte.plugin.svelte.format.config.singleQuote",
    "svelte.plugin.svelte.format.config.svelteAllowShorthand",
    "svelte.plugin.svelte.format.config.svelteBracketNewLine",
    "svelte.plugin.svelte.format.config.svelteIndentScriptAndStyle",
    "svelte.plugin.svelte.format.config.svelteSortOrder",
    "svelte.plugin.svelte.format.config.svelteStrictMode",
    "svelte.plugin.svelte.format.enable",
    "svelte.plugin.svelte.hover.enable",
    "svelte.plugin.svelte.rename.enable",
    "svelte.plugin.svelte.runesLegacyModeCodeLens.enable",
    "svelte.plugin.svelte.selectionRange.enable",
    "svelte.plugin.typescript.codeActions.enable",
    "svelte.plugin.typescript.completions.enable",
    "svelte.plugin.typescript.diagnostics.enable",
    "svelte.plugin.typescript.documentSymbols.enable",
    "svelte.plugin.typescript.enable",
    "svelte.plugin.typescript.hover.enable",
    "svelte.plugin.typescript.selectionRange.enable",
    "svelte.plugin.typescript.semanticTokens.enable",
    "svelte.plugin.typescript.signatureHelp.enable",
    "svelte.plugin.typescript.workspaceSymbols.enable",
  ];
  assert.deepEqual(
    Object.keys(properties)
      .filter((key) => key.startsWith("svelte.plugin."))
      .sort(),
    upstream,
  );
  for (const family of ["typescript", "css", "html", "svelte"]) {
    assert.equal(properties[`svelte.plugin.${family}.enable`].default, true);
  }
});

test("every command referenced by a menu is contributed", () => {
  const commands = new Set(manifest.contributes.commands.map(({ command }) => command));
  for (const entries of Object.values(manifest.contributes.menus)) {
    for (const entry of entries) {
      if (entry.command) assert.equal(commands.has(entry.command), true, entry.command);
    }
  }
  for (const command of [
    "rsvelte.restartLanguageServer",
    "rsvelte.showCompiledCodeToSide",
    "rsvelte.showCompiledCSSToSide",
    "rsvelte.extractComponent",
    "rsvelte.typescript.findAllFileReferences",
    "rsvelte.typescript.findComponentReferences",
    "rsvelte.kit.generateMultipleFiles",
  ]) {
    assert.equal(commands.has(command), true, command);
  }
});

test("build stages platform servers into the runtime path", () => {
  const build = readFileSync(join(root, "build.mjs"), "utf8");
  const extension = readFileSync(join(root, "src", "extension.ts"), "utf8");
  assert.match(build, /cpSync\(nativeDir, join\(distDir, "bin"\)/);
  assert.match(extension, /path\.join\("dist", "bin", triple, binary\)/);
  assert.match(extension, /RSVELTE_PREPROCESS_NODE/);
  assert.match(extension, /ELECTRON_RUN_AS_NODE/);
});
