import { createRequire } from 'node:module';
import { createInterface } from 'node:readline';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CONFIG_NAMES = [
  'svelte.config.js',
  'svelte.config.mjs',
  'svelte.config.cjs',
  'svelte.config.ts',
  'svelte.config.mts',
];

const configs = new Map();
const compilers = new Map();
const protocolWrite = process.stdout.write.bind(process.stdout);

// Config files routinely log while loading. Keep fd 1 recoverable for framing.
process.stdout.write = function divertedStdout(chunk, encoding, callback) {
  return process.stderr.write(chunk, encoding, callback);
};

function send(value) {
  protocolWrite(`\u001eRSVELTE${JSON.stringify(value)}\n`);
}

function findConfig(filename, workspace) {
  const root = realpathSync(resolve(workspace));
  let current = realpathSync(dirname(resolve(filename)));
  while (current === root || current.startsWith(`${root}/`) || current.startsWith(`${root}\\`)) {
    for (const name of CONFIG_NAMES) {
      const candidate = join(current, name);
      if (!existsSync(candidate)) continue;
      const canonical = realpathSync(candidate);
      const fromRoot = relative(root, canonical);
      const outside =
        fromRoot === '..' ||
        fromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) ||
        isAbsolute(fromRoot);
      if (!outside) {
        return canonical;
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

async function loadConfig(path) {
  if (!path) return null;
  let cached = configs.get(path);
  if (!cached) {
    cached = import(pathToFileURL(path).href).then((module) => module.default ?? module);
    configs.set(path, cached);
  }
  return cached;
}

async function loadCompiler(workspace) {
  let cached = compilers.get(workspace);
  if (!cached) {
    cached = (async () => {
      const require = createRequire(join(resolve(workspace), '__rsvelte_preprocess__.cjs'));
      for (const specifier of ['svelte/compiler', '@rsvelte/vite-plugin-svelte-native']) {
        try {
          const imported = await import(pathToFileURL(require.resolve(specifier)).href);
          // npm ships `svelte/compiler` as a CJS bundle, whose namespace carries
          // `default` alone — reading `preprocess` off it is undefined for every
          // real project, so this loop always fell through to the throw below.
          const module = typeof imported.preprocess === 'function' ? imported : imported.default;
          if (typeof module?.preprocess === 'function') return module;
        } catch {}
      }
      throw new Error(
        `Cannot resolve svelte/compiler or @rsvelte/vite-plugin-svelte-native from ${workspace}`,
      );
    })();
    compilers.set(workspace, cached);
  }
  return cached;
}

function normalizeMap(map) {
  if (!map) return null;
  if (typeof map === 'string') return map;
  if (typeof map.toString === 'function') {
    const stringified = map.toString();
    if (stringified !== '[object Object]') return stringified;
  }
  return JSON.stringify(map);
}

async function preprocess(request) {
  const configPath = findConfig(request.filename, request.workspace);
  if (!configPath) {
    return {
      type: 'result',
      id: request.id,
      filename: request.filename,
      version: request.version,
      code: request.text,
      map: null,
      configPath: null,
      hasPreprocessor: false,
    };
  }

  const config = await loadConfig(configPath);
  const groups = config?.preprocess;
  if (!groups) {
    return {
      type: 'result',
      id: request.id,
      filename: request.filename,
      version: request.version,
      code: request.text,
      map: null,
      configPath,
      hasPreprocessor: false,
    };
  }

  const compiler = await loadCompiler(request.workspace);
  const result = await compiler.preprocess(request.text, groups, {
    filename: request.filename,
  });
  return {
    type: 'result',
    id: request.id,
    filename: request.filename,
    version: request.version,
    code: result?.code ?? String(result ?? ''),
    map: normalizeMap(result?.map),
    dependencies: Array.isArray(result?.dependencies) ? result.dependencies : [],
    configPath,
    hasPreprocessor: true,
  };
}

send({ type: 'ready', pid: process.pid });

let queue = Promise.resolve();
createInterface({ input: process.stdin, crlfDelay: Infinity }).on('line', (line) => {
  queue = queue.then(async () => {
    let request;
    try {
      request = JSON.parse(line);
      if (request?.type !== 'preprocess') return;
      send(await preprocess(request));
    } catch (error) {
      send({
        type: 'error',
        id: request?.id ?? null,
        filename: request?.filename ?? null,
        version: request?.version ?? null,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  });
});
