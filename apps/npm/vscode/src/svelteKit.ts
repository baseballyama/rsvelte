import * as path from "node:path";
import {
  Position,
  ProgressLocation,
  Uri,
  WorkspaceEdit,
  commands,
  window,
  workspace,
  type ExtensionContext,
} from "vscode";

type Kind = {
  withTs: boolean;
  withSatisfies: boolean;
  withRunes: boolean;
  withProps: boolean;
  withAppState: boolean;
};

const resources = {
  page: ["+page.svelte", pageTemplate],
  pageLoad: ["+page", pageLoadTemplate],
  pageServer: ["+page.server", pageServerTemplate],
  layout: ["+layout.svelte", layoutTemplate],
  layoutLoad: ["+layout", layoutLoadTemplate],
  layoutServer: ["+layout.server", layoutServerTemplate],
  server: ["+server", serverTemplate],
  error: ["+error.svelte", errorTemplate],
} as const;

type ResourceName = keyof typeof resources;

const commandsByResource: Record<string, ResourceName> = {
  "rsvelte.kit.generatePage": "page",
  "rsvelte.kit.generatePageLoad": "pageLoad",
  "rsvelte.kit.generatePageServerLoad": "pageServer",
  "rsvelte.kit.generateLayout": "layout",
  "rsvelte.kit.generateLayoutLoad": "layoutLoad",
  "rsvelte.kit.generateLayoutServerLoad": "layoutServer",
  "rsvelte.kit.generateServer": "server",
  "rsvelte.kit.generateError": "error",
};

export function registerSvelteKit(context: ExtensionContext): void {
  for (const [command, resource] of Object.entries(commandsByResource)) {
    context.subscriptions.push(
      commands.registerCommand(command, (uri?: Uri) => generate(uri, [resource])),
    );
  }
  context.subscriptions.push(
    commands.registerCommand("rsvelte.kit.generateMultipleFiles", async (uri?: Uri) => {
      const choices = (Object.keys(resources) as ResourceName[]).map((resource) => ({
        label: resources[resource][0],
        resource,
      }));
      const selected = await window.showQuickPick(choices, { canPickMany: true });
      if (selected?.length)
        await generate(
          uri,
          selected.map(({ resource }) => resource),
        );
    }),
    workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("rsvelte.svelteKitFilesContextMenu.enable") ||
        event.affectsConfiguration("svelte.ui.svelteKitFilesContextMenu.enable")
      ) {
        void updateContext();
      }
    }),
  );
  void updateContext();
}

async function updateContext(): Promise<void> {
  const rsvelte = workspace.getConfiguration("rsvelte");
  const configured = rsvelte.inspect("svelteKitFilesContextMenu.enable");
  const hasRsvelteOverride = [
    configured?.globalValue,
    configured?.workspaceValue,
    configured?.workspaceFolderValue,
  ].some((value) => value !== undefined);
  const mode = hasRsvelteOverride
    ? rsvelte.get<string>("svelteKitFilesContextMenu.enable", "auto")
    : workspace
        .getConfiguration("svelte.ui.svelteKitFilesContextMenu")
        .get<string>("enable", "auto");
  let detected = mode === "always";
  if (mode === "auto") {
    for (const uri of await workspace.findFiles("**/package.json", "**/node_modules/**")) {
      const pkg = await packageJson(uri.fsPath);
      if (pkg?.dependencies?.["@sveltejs/kit"] || pkg?.devDependencies?.["@sveltejs/kit"]) {
        detected = true;
        break;
      }
    }
  }
  await commands.executeCommand(
    "setContext",
    "rsvelte.uiContext.svelteKitFilesContextMenu.enable",
    detected,
  );
}

async function generate(uri: Uri | undefined, names: ResourceName[]): Promise<void> {
  const root = await resourceRoot(uri);
  if (!root) {
    await window.showErrorMessage("rsvelte: open a folder before creating SvelteKit files.");
    return;
  }
  const relative = await window.showInputBox({
    prompt: "Route path relative to the selected folder",
    value: "",
  });
  if (relative === undefined) return;
  const target = path.resolve(root, relative);
  const targetRelative = path.relative(root, target);
  if (
    targetRelative === ".." ||
    targetRelative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(targetRelative)
  ) {
    await window.showErrorMessage("rsvelte: the route must stay inside the selected folder.");
    return;
  }

  const kind = await projectKind(target);
  const edit = new WorkspaceEdit();
  const files = names.map((name) => {
    const [base, template] = resources[name];
    const filename = base.endsWith(".svelte") ? base : `${base}.${kind.withTs ? "ts" : "js"}`;
    return { file: Uri.file(path.join(target, filename)), content: `${template(kind)}\n` };
  });
  for (const { file } of files) {
    try {
      await workspace.fs.stat(file);
      await window.showErrorMessage(`rsvelte: ${path.basename(file.fsPath)} already exists.`);
      return;
    } catch {
      // Expected for every file this command is about to create.
    }
  }
  for (const { file, content } of files) {
    edit.createFile(file);
    edit.insert(file, new Position(0, 0), content);
  }
  await workspace.fs.createDirectory(Uri.file(target));
  await workspace.applyEdit(edit);
  const document = await workspace.openTextDocument(files[0].file);
  await document.save();
  await window.showTextDocument(document);
}

async function resourceRoot(uri?: Uri): Promise<string | undefined> {
  if (uri) {
    try {
      return (await workspace.fs.stat(uri)).type & 2 ? uri.fsPath : path.dirname(uri.fsPath);
    } catch {
      return path.dirname(uri.fsPath);
    }
  }
  return window.activeTextEditor
    ? path.dirname(window.activeTextEditor.document.fileName)
    : workspace.workspaceFolders?.length === 1
      ? workspace.workspaceFolders[0].uri.fsPath
      : undefined;
}

async function projectKind(start: string): Promise<Kind> {
  const tsconfig = await findUp(start, "tsconfig.json");
  const jsconfig = await findUp(start, "jsconfig.json");
  const packageFile = await findUp(start, "package.json");
  const pkg = packageFile ? await packageJson(packageFile) : undefined;
  const dependencies = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const svelte = version(dependencies.svelte);
  const kit = version(dependencies["@sveltejs/kit"]);
  const typescript = version(dependencies.typescript);
  const withTs = Boolean(tsconfig && (!jsconfig || tsconfig.length >= jsconfig.length));
  return {
    withTs,
    withSatisfies:
      withTs &&
      (!typescript || typescript.major > 4 || (typescript.major === 4 && typescript.minor >= 9)),
    withRunes: !svelte || svelte.major >= 5,
    withProps: !kit || kit.major > 2 || (kit.major === 2 && kit.minor >= 16),
    withAppState: !kit || kit.major > 2 || (kit.major === 2 && kit.minor >= 12),
  };
}

async function findUp(start: string, filename: string): Promise<string | undefined> {
  for (let directory = start; ; directory = path.dirname(directory)) {
    const candidate = path.join(directory, filename);
    try {
      await workspace.fs.stat(Uri.file(candidate));
      return candidate;
    } catch {
      if (path.dirname(directory) === directory) return undefined;
    }
  }
}

async function packageJson(filename: string): Promise<any | undefined> {
  try {
    return JSON.parse(new TextDecoder().decode(await workspace.fs.readFile(Uri.file(filename))));
  } catch {
    return undefined;
  }
}

function version(value: unknown): { major: number; minor: number } | undefined {
  const match = typeof value === "string" ? value.match(/(\d+)\.(\d+)/) : undefined;
  return match ? { major: Number(match[1]), minor: Number(match[2]) } : undefined;
}

function pageTemplate(kind: Kind): string {
  if (!kind.withRunes)
    return kind.withTs
      ? `<script lang="ts">\n  import type { PageData } from './$types';\n  export let data: PageData;\n</script>`
      : `<script>\n  /** @type {import('./$types').PageData} */\n  export let data;\n</script>`;
  if (kind.withProps)
    return kind.withTs
      ? `<script lang="ts">\n  import type { PageProps } from './$types';\n  let { data }: PageProps = $props();\n</script>`
      : `<script>\n  /** @type {import('./$types').PageProps} */\n  let { data } = $props();\n</script>`;
  return kind.withTs
    ? `<script lang="ts">\n  import type { PageData } from './$types';\n  let { data }: { data: PageData } = $props();\n</script>`
    : `<script>\n  /** @type {{ data: import('./$types').PageData }} */\n  let { data } = $props();\n</script>`;
}

function layoutTemplate(kind: Kind): string {
  if (!kind.withRunes)
    return kind.withTs
      ? `<script lang="ts">\n  import type { LayoutData } from './$types';\n  export let data: LayoutData;\n</script>\n\n<slot />`
      : `<script>\n  /** @type {import('./$types').LayoutData} */\n  export let data;\n</script>\n\n<slot />`;
  if (kind.withProps)
    return kind.withTs
      ? `<script lang="ts">\n  import type { LayoutProps } from './$types';\n  let { data, children }: LayoutProps = $props();\n</script>\n\n{@render children()}`
      : `<script>\n  /** @type {import('./$types').LayoutProps} */\n  let { data, children } = $props();\n</script>\n\n{@render children()}`;
  return kind.withTs
    ? `<script lang="ts">\n  import type { Snippet } from 'svelte';\n  import type { LayoutData } from './$types';\n  let { data, children }: { data: LayoutData; children: Snippet } = $props();\n</script>\n\n{@render children()}`
    : `<script>\n  /** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */\n  let { data, children } = $props();\n</script>\n\n{@render children()}`;
}

function loadTemplate(kind: Kind, type: string): string {
  if (!kind.withTs) {
    return `/** @type {import('./$types').${type}} */\nexport async function load() {\n  return {};\n}`;
  }
  return kind.withSatisfies
    ? `import type { ${type} } from './$types';\n\nexport const load = (async () => {\n  return {};\n}) satisfies ${type};`
    : `import type { ${type} } from './$types';\n\nexport const load: ${type} = async () => {\n  return {};\n};`;
}
function pageLoadTemplate(kind: Kind): string {
  return loadTemplate(kind, "PageLoad");
}
function pageServerTemplate(kind: Kind): string {
  return loadTemplate(kind, "PageServerLoad");
}
function layoutLoadTemplate(kind: Kind): string {
  return loadTemplate(kind, "LayoutLoad");
}
function layoutServerTemplate(kind: Kind): string {
  return loadTemplate(kind, "LayoutServerLoad");
}
function serverTemplate(kind: Kind): string {
  return kind.withTs
    ? `import type { RequestHandler } from './$types';\n\nexport const GET: RequestHandler = async () => new Response();`
    : `/** @type {import('./$types').RequestHandler} */\nexport async function GET() {\n  return new Response();\n}`;
}
function errorTemplate(kind: Kind): string {
  return `<script${kind.withTs ? ' lang="ts"' : ""}>\n  import { page } from '${kind.withAppState ? "$app/state" : "$app/stores"}';\n</script>\n\n<h1>{${kind.withAppState ? "page" : "$page"}.status}: {${kind.withAppState ? "page" : "$page"}.error${kind.withTs ? "?" : ""}.message}</h1>`;
}
