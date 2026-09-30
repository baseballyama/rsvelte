import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import type * as TS from 'typescript';
import * as core from '@vue/language-core';
import { sourceDir } from '../paths.ts';
import type { Task } from '../types.ts';

// vue-tsc is `tsc` with its source patched by @volar/typescript's `runTsc`: `.vue` added to the
// supported extensions, `createProgram` wrapped in a language-plugin proxy. Its command-line output
// has no end positions, so this applies the same patch to the TypeScript library instead of the
// CLI and reads the diagnostics from the program. Both packages are pinned to vue-tsc's versions.
const require = createRequire(import.meta.url);
const runTsc = require('@volar/typescript/lib/quickstart/runTsc') as {
	getLanguagePlugins: unknown;
	transformTscContent(code: string, proxyApiPath: string, exts: string[], remove: string[]): string;
};
runTsc.getLanguagePlugins = (ts: typeof TS, options: TS.CreateProgramOptions) => {
	const configFilePath = options.options.configFilePath as string;
	const vueOptions = core.createParsedCommandLine(ts, ts.sys, configFilePath).vueOptions;
	return { languagePlugins: [core.createVueLanguagePlugin(ts, options.options, vueOptions, (id: string) => id)] };
};
const ts: typeof TS = (() => {
	const file = require.resolve('typescript');
	const code = runTsc.transformTscContent(fs.readFileSync(file, 'utf8'), require.resolve('@volar/typescript/lib/node/proxyCreateProgram'), ['vue'], []);
	const m = new Module(file) as Module & { _compile(code: string, file: string): void };
	m.filename = file;
	m.paths = (Module as unknown as { _nodeModulePaths(dir: string): string[] })._nodeModulePaths(path.dirname(file));
	m._compile(code, file);
	return m.exports as typeof TS;
})();

const NODE_MODULES = path.resolve(import.meta.dirname, '../../node_modules');

// The project configuration is the source directory's tsconfig.json, the same file rsv reads; the
// workspace links this package's node_modules so `vue` resolves as in a real project.
const task: Task = {
	id: 'vue.check',
	storage: 'committed',
	oracles: ['vue-tsc', '@vue/language-core', '@volar/typescript', 'typescript', 'vue'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'vue' && unit.source === 'rsvelte',
	run(unit, src) {
		const ws = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'vue-check-')));
		try {
			const tsconfig = path.join(ws, 'tsconfig.json');
			fs.copyFileSync(path.join(sourceDir(unit.family, unit.source), 'tsconfig.json'), tsconfig);
			fs.symlinkSync(NODE_MODULES, path.join(ws, 'node_modules'));
			const file = path.join(ws, unit.path);
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, src);
			const parsed = ts.parseJsonConfigFileContent(ts.readConfigFile(tsconfig, ts.sys.readFile).config, ts.sys, ws, undefined, tsconfig, undefined, [
				{ extension: 'vue', isMixedContent: true, scriptKind: ts.ScriptKind.Deferred }
			]);
			const options = { ...parsed.options, configFilePath: tsconfig };
			const program = ts.createProgram({ rootNames: [file], options, host: ts.createCompilerHost(options) });
			const findings = ts.getPreEmitDiagnostics(program).map((d) => {
				if (!d.file || d.start === undefined || d.length === undefined) throw new Error(`a diagnostic without a position: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
				if (path.resolve(d.file.fileName) !== file) throw new Error(`diagnostic for another file: ${d.file.fileName}`);
				const start = d.file.getLineAndCharacterOfPosition(d.start);
				const end = d.file.getLineAndCharacterOfPosition(d.start + d.length);
				return { code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n'), start, end };
			});
			return { findings: { text: JSON.stringify(findings, null, '\t') + '\n', ext: 'json', compare: 'json' } };
		} finally {
			fs.rmSync(ws, { recursive: true, force: true });
		}
	}
};
export default task;
