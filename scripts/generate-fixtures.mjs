#!/usr/bin/env node
/**
 * Generate expected fixtures from official Svelte compiler.
 *
 * Usage:
 *   npm run generate-fixtures                    # Generate all fixtures
 *   npm run generate-fixtures -- --category=css # Generate specific category
 *   npm run generate-fixtures -- --sample=basic # Generate specific sample
 *   npm run generate-fixtures -- --force        # Overwrite existing fixtures
 *   npm run generate-fixtures -- --verbose      # Show detailed progress
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Svelte compiler functions
import { parse } from '../submodules/svelte/packages/svelte/src/compiler/index.js';
import pkg from '../submodules/svelte/packages/svelte/compiler/index.js';
const { compile, compileModule } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SVELTE_TESTS = path.join(ROOT, 'submodules/svelte/packages/svelte/tests');

// Get Svelte commit hash
function getSvelteCommitHash() {
  return execSync('git rev-parse HEAD', {
    cwd: path.join(ROOT, 'submodules/svelte'),
    encoding: 'utf-8',
  }).trim();
}

// Category definitions with their specific handlers
const CATEGORIES = {
  'parser-modern': {
    mainFile: 'input.svelte',
    handler: generateParserFixture,
  },
  'parser-legacy': {
    mainFile: 'input.svelte',
    handler: generateParserLegacyFixture,
  },
  snapshot: {
    mainFile: 'index.svelte',
    handler: generateSnapshotFixture,
  },
  css: {
    mainFile: 'input.svelte',
    handler: generateCssFixture,
  },
  validator: {
    mainFile: 'input.svelte',
    altMainFile: 'input.svelte.js',
    handler: generateValidatorFixture,
  },
  'compiler-errors': {
    mainFile: 'main.svelte',
    altMainFile: 'main.svelte.js',
    handler: generateCompilerErrorFixture,
  },
  hydration: {
    mainFile: 'main.svelte',
    handler: generateRuntimeFixture,
  },
  'runtime-runes': {
    mainFile: 'main.svelte',
    handler: generateRuntimeFixture,
  },
  'runtime-legacy': {
    mainFile: 'main.svelte',
    handler: generateRuntimeFixture,
  },
  'runtime-browser': {
    mainFile: 'main.svelte',
    handler: generateRuntimeBrowserFixture,
  },
  'server-side-rendering': {
    mainFile: 'main.svelte',
    handler: generateSsrFixture,
  },
  preprocess: {
    mainFile: 'input.svelte',
    handler: generatePreprocessFixture,
  },
  print: {
    mainFile: 'input.svelte',
    handler: generatePrintFixture,
  },
  sourcemaps: {
    mainFile: 'input.svelte',
    handler: generateSourcemapsFixture,
  },
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    category: null,
    sample: null,
    force: false,
    verbose: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    } else if (arg.startsWith('--sample=')) {
      options.sample = arg.split('=')[1];
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return options;
}

// Load _config.js from sample directory
async function loadConfig(sampleDir) {
  const configPath = path.join(sampleDir, '_config.js');
  if (fs.existsSync(configPath)) {
    try {
      const config = await import(configPath);
      return config.default || {};
    } catch {
      // Config files often have test-specific imports that won't work.
      // Fall back to text-based parsing of common config values.
      return parseConfigText(configPath);
    }
  }
  return {};
}

// Parse common config values from _config.js text when dynamic import fails.
// Only parses top-level fields that our test runner also supports.
function parseConfigText(configPath) {
  try {
    const text = fs.readFileSync(configPath, 'utf-8');
    const config = {};

    // Parse top-level accessors: true/false (not inside compileOptions block)
    // This is the main field that affects fixture generation for runtime-legacy tests
    const accessorsMatch = text.match(/^\s*accessors\s*:\s*(true|false)\b/m);
    if (accessorsMatch) {
      config.accessors = accessorsMatch[1] === 'true';
    }

    // Propagate `compileOptions: { hmr: true }` so HMR-specific fixtures are
    // generated with HMR-aware official output. The test runner
    // (tests/compatibility_report.rs) already passes `hmr` based on the same
    // marker. We deliberately do NOT propagate `dev: true` here — the dev-mode
    // SSR codegen still has small divergences from the official compiler that
    // would cause many cross-suite regressions.
    const hmrMatch = text.match(/compileOptions\s*:\s*\{[^}]*\bhmr\s*:\s*(true|false)\b/);
    if (hmrMatch) {
      config.compileOptions = { hmr: hmrMatch[1] === 'true' };
    }

    // Propagate `compileOptions.experimental.async`. New snapshot fixtures
    // (e.g. async-top-level-group-sync-run) opt into top-level await via
    // `experimental: { async: true }` and would otherwise fail to compile.
    const asyncMatch = text.match(/experimental\s*:\s*\{[^}]*\basync\s*:\s*(true|false)\b/);
    if (asyncMatch) {
      config.compileOptions = {
        ...(config.compileOptions ?? {}),
        experimental: { async: asyncMatch[1] === 'true' },
      };
    }

    return config;
  } catch {
    return {};
  }
}

// Clean AST by removing internal metadata
function cleanAst(ast) {
  return JSON.parse(
    JSON.stringify(ast, (key, value) => {
      if (key === 'metadata') return undefined;
      return value;
    })
  );
}

// === Category Handlers ===

async function generateParserFixture(sampleDir, outputDir, _config) {
  const inputPath = path.join(sampleDir, 'input.svelte');
  const source = fs.readFileSync(inputPath, 'utf-8');

  try {
    const ast = parse(source, { modern: true });
    const cleanedAst = cleanAst(ast);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'ast.json'), JSON.stringify(cleanedAst, null, 2));

    return { success: true };
  } catch (e) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      path.join(outputDir, 'error.json'),
      JSON.stringify({ code: e.code ?? 'parse_error', message: e.message }, null, 2)
    );
    return { success: true, isError: true };
  }
}

async function generateParserLegacyFixture(sampleDir, outputDir, _config) {
  const inputPath = path.join(sampleDir, 'input.svelte');
  const source = fs.readFileSync(inputPath, 'utf-8');

  try {
    const ast = parse(source, { modern: false });
    const cleanedAst = cleanAst(ast);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'ast.json'), JSON.stringify(cleanedAst, null, 2));

    return { success: true };
  } catch (e) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      path.join(outputDir, 'error.json'),
      JSON.stringify({ code: e.code ?? 'parse_error', message: e.message }, null, 2)
    );
    return { success: true, isError: true };
  }
}

async function generateSnapshotFixture(sampleDir, outputDir, config) {
  const inputPath = path.join(sampleDir, 'index.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No index.svelte found' };
  }
  const source = fs.readFileSync(inputPath, 'utf-8');

  // Extract sample name from directory path for correct component naming
  const sampleName = path.basename(sampleDir);

  const compileOptions = {
    dev: config.compileOptions?.dev ?? false,
    css: config.compileOptions?.css ?? 'external',
    ...config.compileOptions,
  };

  const results = {};

  // Client compilation
  try {
    const clientResult = compile(source, {
      ...compileOptions,
      generate: 'client',
      // Use sample_name/index.svelte to match official Svelte test expectations
      // This ensures correct component naming (e.g., "Bind_component_snippet" instead of "Index")
      filename: `${sampleName}/index.svelte`,
    });
    results.client = {
      js: clientResult.js.code,
      css: clientResult.css?.code ?? null,
      warnings: clientResult.warnings.map(normalizeWarning),
    };
  } catch (e) {
    results.client = { error: e.message };
  }

  // Server compilation
  try {
    const serverResult = compile(source, {
      ...compileOptions,
      generate: 'server',
      // Use sample_name/index.svelte to match official Svelte test expectations
      filename: `${sampleName}/index.svelte`,
    });
    results.server = {
      js: serverResult.js.code,
      warnings: serverResult.warnings.map(normalizeWarning),
    };
  } catch (e) {
    results.server = { error: e.message };
  }

  // Write outputs
  fs.mkdirSync(outputDir, { recursive: true });

  if (results.client?.js) {
    fs.writeFileSync(path.join(outputDir, 'client.js'), results.client.js);
  }
  if (results.server?.js) {
    fs.writeFileSync(path.join(outputDir, 'server.js'), results.server.js);
  }
  if (results.client?.css) {
    fs.writeFileSync(path.join(outputDir, 'css.css'), results.client.css);
  }

  const allWarnings = [...(results.client?.warnings ?? []), ...(results.server?.warnings ?? [])];
  fs.writeFileSync(path.join(outputDir, 'warnings.json'), JSON.stringify(allWarnings, null, 2));

  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(
      {
        compileOptions,
        errors: {
          client: results.client?.error,
          server: results.server?.error,
        },
      },
      null,
      2
    )
  );

  return { success: true };
}

async function generateCssFixture(sampleDir, outputDir, config) {
  const inputPath = path.join(sampleDir, 'input.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No input.svelte found' };
  }
  const source = fs.readFileSync(inputPath, 'utf-8');

  const compileOptions = {
    dev: false,
    css: 'external',
    ...config.compileOptions,
  };

  try {
    const result = compile(source, {
      ...compileOptions,
      generate: 'client',
      filename: 'input.svelte',
    });

    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'css.css'), result.css?.code ?? '');

    fs.writeFileSync(
      path.join(outputDir, 'warnings.json'),
      JSON.stringify(result.warnings.map(normalizeWarning), null, 2)
    );

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify({ compileOptions }, null, 2)
    );

    return { success: true };
  } catch (e) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      path.join(outputDir, 'error.json'),
      JSON.stringify({ code: e.code ?? 'compile_error', message: e.message }, null, 2)
    );
    return { success: true, isError: true };
  }
}

async function generateValidatorFixture(sampleDir, outputDir, config) {
  let inputPath = path.join(sampleDir, 'input.svelte');
  let isModule = false;

  if (!fs.existsSync(inputPath)) {
    inputPath = path.join(sampleDir, 'input.svelte.js');
    isModule = true;
  }

  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No input file found' };
  }

  const source = fs.readFileSync(inputPath, 'utf-8');

  fs.mkdirSync(outputDir, { recursive: true });

  try {
    let result;
    if (isModule) {
      result = compileModule(source, { filename: 'input.svelte.js' });
    } else {
      result = compile(source, {
        generate: 'client',
        filename: 'input.svelte',
      });
    }

    fs.writeFileSync(
      path.join(outputDir, 'warnings.json'),
      JSON.stringify(result.warnings.map(normalizeWarning), null, 2)
    );

    fs.writeFileSync(path.join(outputDir, 'errors.json'), '[]');

    return { success: true };
  } catch (e) {
    fs.writeFileSync(path.join(outputDir, 'warnings.json'), '[]');

    fs.writeFileSync(
      path.join(outputDir, 'errors.json'),
      JSON.stringify(
        [
          {
            code: e.code ?? 'unknown',
            message: e.message,
            start: e.start,
            end: e.end,
          },
        ],
        null,
        2
      )
    );

    return { success: true };
  }
}

async function generateCompilerErrorFixture(sampleDir, outputDir, config) {
  let inputPath = path.join(sampleDir, 'main.svelte');
  let isModule = false;

  if (!fs.existsSync(inputPath)) {
    inputPath = path.join(sampleDir, 'main.svelte.js');
    isModule = true;
  }

  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No input file found' };
  }

  const source = fs.readFileSync(inputPath, 'utf-8');

  fs.mkdirSync(outputDir, { recursive: true });

  const compileOptions = {
    dev: config.compileOptions?.dev ?? false,
    ...config.compileOptions,
  };

  try {
    if (isModule) {
      compileModule(source, { ...compileOptions, filename: 'main.svelte.js' });
    } else {
      compile(source, {
        ...compileOptions,
        generate: 'client',
        filename: 'main.svelte',
      });
    }

    // Should not reach here - we expect an error
    fs.writeFileSync(
      path.join(outputDir, 'error.json'),
      JSON.stringify({ unexpected: 'Compilation succeeded when error expected' }, null, 2)
    );

    return { success: false, error: 'Expected compilation error' };
  } catch (e) {
    fs.writeFileSync(
      path.join(outputDir, 'error.json'),
      JSON.stringify(
        {
          code: e.code ?? 'unknown',
          message: e.message,
          start: e.start,
          end: e.end,
          position: e.position,
        },
        null,
        2
      )
    );

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify({ compileOptions }, null, 2)
    );

    return { success: true };
  }
}

async function generateRuntimeFixture(sampleDir, outputDir, config) {
  const inputPath = path.join(sampleDir, 'main.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No main.svelte found' };
  }

  const source = fs.readFileSync(inputPath, 'utf-8');

  // Determine if this is a runtime-runes test based on the output path
  const isRuntimeRunes = outputDir.includes('/runtime-runes/');
  const isRuntimeLegacy = outputDir.includes('/runtime-legacy/');

  // For runtime-legacy tests, accessors defaults to true (matching official test runner behavior)
  // See svelte/packages/svelte/tests/runtime-legacy/shared.ts line 224:
  //   accessors: 'accessors' in config ? config.accessors : true
  const accessorsDefault = isRuntimeLegacy
    ? ('accessors' in config ? config.accessors : true)
    : undefined;

  const compileOptions = {
    dev: config.compileOptions?.dev ?? false,
    css: config.compileOptions?.css ?? 'external',
    // Enable experimental.async for runtime-runes tests
    // This matches the official Svelte compiler behavior and test configuration
    ...(isRuntimeRunes ? { experimental: { async: true } } : {}),
    // Apply accessors default for runtime-legacy tests
    ...(accessorsDefault !== undefined ? { accessors: accessorsDefault } : {}),
    ...config.compileOptions,
  };

  fs.mkdirSync(outputDir, { recursive: true });

  const results = {};

  // Client compilation
  try {
    const clientResult = compile(source, {
      ...compileOptions,
      generate: 'client',
      filename: 'main.svelte',
    });
    results.client = clientResult;
    fs.writeFileSync(path.join(outputDir, 'client.js'), clientResult.js.code);
    if (clientResult.css?.code) {
      fs.writeFileSync(path.join(outputDir, 'css.css'), clientResult.css.code);
    }
  } catch (e) {
    results.clientError = e.message;
  }

  // Server compilation
  try {
    const serverResult = compile(source, {
      ...compileOptions,
      generate: 'server',
      filename: 'main.svelte',
    });
    results.server = serverResult;
    fs.writeFileSync(path.join(outputDir, 'server.js'), serverResult.js.code);
  } catch (e) {
    results.serverError = e.message;
  }

  const allWarnings = [
    ...(results.client?.warnings?.map(normalizeWarning) ?? []),
    ...(results.server?.warnings?.map(normalizeWarning) ?? []),
  ];
  fs.writeFileSync(path.join(outputDir, 'warnings.json'), JSON.stringify(allWarnings, null, 2));

  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(
      {
        compileOptions,
        clientError: results.clientError,
        serverError: results.serverError,
      },
      null,
      2
    )
  );

  return { success: true };
}

async function generateRuntimeBrowserFixture(sampleDir, outputDir, config) {
  const inputPath = path.join(sampleDir, 'main.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No main.svelte found' };
  }

  const source = fs.readFileSync(inputPath, 'utf-8');

  const compileOptions = {
    dev: config.compileOptions?.dev ?? false,
    css: config.compileOptions?.css ?? 'external',
    ...config.compileOptions,
  };

  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const result = compile(source, {
      ...compileOptions,
      generate: 'client',
      filename: 'main.svelte',
    });

    fs.writeFileSync(path.join(outputDir, 'client.js'), result.js.code);
    if (result.css?.code) {
      fs.writeFileSync(path.join(outputDir, 'css.css'), result.css.code);
    }

    fs.writeFileSync(
      path.join(outputDir, 'warnings.json'),
      JSON.stringify(result.warnings.map(normalizeWarning), null, 2)
    );

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify({ compileOptions }, null, 2)
    );

    return { success: true };
  } catch (e) {
    fs.writeFileSync(
      path.join(outputDir, 'error.json'),
      JSON.stringify({ code: e.code ?? 'compile_error', message: e.message }, null, 2)
    );
    return { success: true, isError: true };
  }
}

async function generateSsrFixture(sampleDir, outputDir, config) {
  const inputPath = path.join(sampleDir, 'main.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No main.svelte found' };
  }

  const source = fs.readFileSync(inputPath, 'utf-8');

  const compileOptions = {
    dev: config.compileOptions?.dev ?? false,
    ...config.compileOptions,
  };

  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const result = compile(source, {
      ...compileOptions,
      generate: 'server',
      filename: 'main.svelte',
    });

    fs.writeFileSync(path.join(outputDir, 'server.js'), result.js.code);

    fs.writeFileSync(
      path.join(outputDir, 'warnings.json'),
      JSON.stringify(result.warnings.map(normalizeWarning), null, 2)
    );

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify({ compileOptions }, null, 2)
    );

    return { success: true };
  } catch (e) {
    fs.writeFileSync(
      path.join(outputDir, 'error.json'),
      JSON.stringify({ code: e.code ?? 'compile_error', message: e.message }, null, 2)
    );
    return { success: true, isError: true };
  }
}

async function generatePreprocessFixture(sampleDir, outputDir, config) {
  // Preprocess requires specific preprocessor functions from _config.js
  // These often have complex dependencies, so we skip if no valid config
  if (!config.preprocess) {
    return { success: false, error: 'No preprocess config' };
  }

  const inputPath = path.join(sampleDir, 'input.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No input.svelte found' };
  }

  // Skip for now - preprocess configs are complex
  return { success: false, error: 'Preprocess tests require manual handling' };
}

async function generatePrintFixture(sampleDir, outputDir, _config) {
  const inputPath = path.join(sampleDir, 'input.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No input.svelte found' };
  }

  // Note: print() function may not be exported from compiler
  // This would require direct import from src/compiler/print/
  return { success: false, error: 'Print tests require direct src import' };
}

async function generateSourcemapsFixture(sampleDir, outputDir, config) {
  const inputPath = path.join(sampleDir, 'input.svelte');
  if (!fs.existsSync(inputPath)) {
    return { success: false, error: 'No input.svelte found' };
  }

  const source = fs.readFileSync(inputPath, 'utf-8');

  const compileOptions = {
    dev: false,
    ...config.compileOptions,
  };

  fs.mkdirSync(outputDir, { recursive: true });

  // Client with sourcemap
  try {
    const clientResult = compile(source, {
      ...compileOptions,
      generate: 'client',
      filename: 'input.svelte',
    });

    fs.writeFileSync(path.join(outputDir, 'client.js'), clientResult.js.code);
    if (clientResult.js.map) {
      fs.writeFileSync(
        path.join(outputDir, 'client.js.map'),
        JSON.stringify(clientResult.js.map, null, 2)
      );
    }
  } catch {
    // Skip on error
  }

  // Server with sourcemap
  try {
    const serverResult = compile(source, {
      ...compileOptions,
      generate: 'server',
      filename: 'input.svelte',
    });

    fs.writeFileSync(path.join(outputDir, 'server.js'), serverResult.js.code);
    if (serverResult.js.map) {
      fs.writeFileSync(
        path.join(outputDir, 'server.js.map'),
        JSON.stringify(serverResult.js.map, null, 2)
      );
    }
  } catch {
    // Skip on error
  }

  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify({ compileOptions }, null, 2)
  );

  return { success: true };
}

// Normalize warning for JSON output
function normalizeWarning(w) {
  return {
    code: w.code,
    message: w.message,
    start: w.start,
    end: w.end,
  };
}

// === Main Generation Logic ===

async function generateFixtures(options) {
  const commitHash = getSvelteCommitHash();
  const shortHash = commitHash.slice(0, 12);
  const fixturesDir = path.join(ROOT, 'fixtures', shortHash);

  console.log(`Generating fixtures for Svelte commit: ${shortHash}`);
  console.log(`Output directory: ${fixturesDir}`);

  if (fs.existsSync(fixturesDir) && !options.force) {
    console.log('Fixtures already exist. Use --force to regenerate.');
    return;
  }

  fs.mkdirSync(fixturesDir, { recursive: true });

  // Write manifest
  const manifest = {
    commitHash,
    shortHash,
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    categories: {},
  };

  const categoriesToProcess = options.category
    ? { [options.category]: CATEGORIES[options.category] }
    : CATEGORIES;

  for (const [categoryId, category] of Object.entries(categoriesToProcess)) {
    if (!category) {
      console.log(`Unknown category: ${categoryId}`);
      continue;
    }

    const samplesDir = path.join(SVELTE_TESTS, categoryId, 'samples');

    if (!fs.existsSync(samplesDir)) {
      console.log(`Skipping ${categoryId}: samples directory not found`);
      continue;
    }

    console.log(`\nProcessing ${categoryId}...`);

    const samples = fs
      .readdirSync(samplesDir)
      .filter((name) => {
        const fullPath = path.join(samplesDir, name);
        return fs.statSync(fullPath).isDirectory() && !name.startsWith('.');
      })
      .filter((name) => !options.sample || name === options.sample)
      .sort();

    const categoryStats = { total: 0, success: 0, failed: 0, errors: 0 };

    for (const sampleName of samples) {
      const sampleDir = path.join(samplesDir, sampleName);
      const outputDir = path.join(fixturesDir, categoryId, sampleName);

      const config = await loadConfig(sampleDir);

      if (options.verbose) {
        process.stdout.write(`  ${sampleName}... `);
      }

      try {
        const result = await category.handler(sampleDir, outputDir, config);
        categoryStats.total++;

        if (result.success) {
          if (result.isError) {
            categoryStats.errors++;
            if (options.verbose) console.log('OK (error case)');
          } else {
            categoryStats.success++;
            if (options.verbose) console.log('OK');
          }
        } else {
          categoryStats.failed++;
          if (options.verbose) console.log(`SKIP: ${result.error}`);
        }
      } catch (e) {
        categoryStats.total++;
        categoryStats.failed++;
        if (options.verbose) console.log(`ERROR: ${e.message}`);
      }
    }

    manifest.categories[categoryId] = categoryStats;
    console.log(
      `  ${categoryStats.success}/${categoryStats.total} succeeded, ${categoryStats.errors} error cases, ${categoryStats.failed} skipped`
    );
  }

  // Write manifest
  fs.writeFileSync(path.join(fixturesDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('\nFixture generation complete!');
  console.log(`Manifest written to: ${path.join(fixturesDir, 'manifest.json')}`);
}

// Run
const options = parseArgs();
generateFixtures(options).catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
