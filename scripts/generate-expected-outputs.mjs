#!/usr/bin/env node
/**
 * Generates expected compiler outputs for all test samples.
 * This runs the official Svelte compiler and saves the output to JSON.
 */

import pkg from '../submodules/svelte/packages/svelte/compiler/index.js';
const { compile } = pkg;
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVELTE_TESTS = join(__dirname, '../submodules/svelte/packages/svelte/tests');

const TEST_CATEGORIES = [
  { id: 'runtime-runes', mainFile: 'main.svelte' },
  { id: 'runtime-legacy', mainFile: 'main.svelte' },
  { id: 'runtime-browser', mainFile: 'main.svelte' },
  { id: 'hydration', mainFile: 'main.svelte' },
  { id: 'server-side-rendering', mainFile: 'main.svelte' },
  { id: 'print', mainFile: 'input.svelte' },
  { id: 'sourcemaps', mainFile: 'input.svelte' },
];

function getSamples(categoryId) {
  const samplesDir = join(SVELTE_TESTS, categoryId, 'samples');
  if (!existsSync(samplesDir)) return [];

  return readdirSync(samplesDir)
    .filter(name => {
      const fullPath = join(samplesDir, name);
      return statSync(fullPath).isDirectory();
    })
    .sort();
}

function compileWithSvelte(source, filename, mode) {
  try {
    const result = compile(source, {
      generate: mode,
      filename,
      dev: false,
    });
    return {
      success: true,
      js: result.js.code,
      css: result.css?.code || null,
    };
  } catch (e) {
    return {
      success: false,
      error: e.message,
    };
  }
}

function generateExpectedOutputs() {
  const outputs = {};

  for (const category of TEST_CATEGORIES) {
    console.error(`Processing ${category.id}...`);
    const samples = getSamples(category.id);
    outputs[category.id] = {};

    for (const sampleName of samples) {
      const sampleDir = join(SVELTE_TESTS, category.id, 'samples', sampleName);
      const mainPath = join(sampleDir, category.mainFile);
      const altMainPath = join(sampleDir, '_main.svelte');

      let inputPath = mainPath;
      if (!existsSync(mainPath) && existsSync(altMainPath)) {
        inputPath = altMainPath;
      }

      if (!existsSync(inputPath)) continue;

      try {
        const source = readFileSync(inputPath, 'utf-8');
        const filename = `${sampleName}/${category.mainFile}`;

        outputs[category.id][sampleName] = {
          client: compileWithSvelte(source, filename, 'client'),
          server: compileWithSvelte(source, filename, 'server'),
        };
      } catch (e) {
        outputs[category.id][sampleName] = {
          error: e.message,
        };
      }
    }

    console.error(`  ${Object.keys(outputs[category.id]).length} samples processed`);
  }

  return outputs;
}

const outputs = generateExpectedOutputs();
console.log(JSON.stringify(outputs, null, 2));
