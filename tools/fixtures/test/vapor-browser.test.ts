import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { parse } from 'smol-toml';
import { chrome } from '../src/behaviour/chrome.ts';
import { serializeHtml } from '../src/behaviour/serialize.ts';
import { svelteModule } from '../src/behaviour/official.ts';
import type { Behaviour } from '../src/behaviour/runtime.ts';
import { ROOT } from '../src/paths.ts';

const CHROME =
	process.env.RSVELTE_BROWSER ??
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CASES = path.join(
	ROOT,
	'crates/languages/svelte/compile_vapor/tests/fixtures',
);
const SVELTE = fs.realpathSync(
	path.join(import.meta.dirname, '../node_modules/svelte'),
);
const requireSvelte = createRequire(path.join(SVELTE, 'package.json'));
const CLSX = requireSvelte.resolve('clsx').replace(/\.js$/, '.mjs');
const VUE = path.join(
	import.meta.dirname,
	'../node_modules/vue-vapor/dist/vue.runtime-with-vapor.esm-browser.prod.js',
);
const RUNNER = path.join(
	import.meta.dirname,
	'../src/behaviour/browser-runner.js',
);

interface Result {
	steps: {
		html: string;
		observed: number;
		scroll: [number, number];
		shadow: { tag: string; html: string }[];
		computed: string[];
		motion: string[];
	}[];
	errors: string[];
	error?: string;
}

test(
	'Vapor browser fixtures match Svelte layout and release observers',
	{ skip: !fs.existsSync(CHROME), timeout: 240_000 },
	async (context) => {
		const selection = process.env.RSVELTE_VAPOR_BROWSER_CASES;
		const selected =
			selection === undefined ? undefined : new Set(selection.split(','));
		const cases = fs.readdirSync(CASES).filter((name) => {
			if (selected && !selected.has(name)) return false;
			const behaviour = path.join(CASES, name, 'behaviour.toml');
			return (
				fs.existsSync(behaviour) &&
				parse(fs.readFileSync(behaviour, 'utf8')).browser === true
			);
		});
		if (selected)
			assert.equal(
				cases.length,
				selected.size,
				'unknown Vapor browser case names',
			);
		assert.ok(cases.length > 0);
		const names = new Set(cases);
		const scratch = fs.mkdtempSync(
			path.join(os.tmpdir(), 'rsvelte-vapor-browser-'),
		);
		const modules = new Map<string, string>();
		const imports = {
			vue: '/vue.js',
			svelte: '/svelte/src/index-client.js',
			'svelte/transition': '/svelte/src/transition/index.js',
			'svelte/animate': '/svelte/src/animate/index.js',
			'svelte/internal/client': '/svelte/src/internal/client/index.js',
			'svelte/internal/disclose-version':
				'/svelte/src/internal/disclose-version.js',
			'svelte/internal/flags/legacy': '/svelte/src/internal/flags/legacy.js',
			'svelte/internal/flags/async': '/svelte/src/internal/flags/async.js',
			'#client/constants': '/svelte/src/internal/client/constants.js',
			'esm-env': '/environment.js',
			clsx: '/clsx.js',
		};
		const server = http.createServer((request, response) => {
			try {
				const url = new URL(request.url!, 'http://localhost');
				const name = url.searchParams.get('case')!;
				let text: string;
				let type = 'text/javascript';
				if (url.pathname === '/') {
					type = 'text/html';
					text = `<script type="importmap">${JSON.stringify({ imports })}</script><div id="root"></div><pre id="result"></pre><script type="module" src="/runner.js"></script>`;
				} else if (url.pathname === '/component.js') {
					const module = modules.get(
						`${name}:${url.searchParams.get('runtime')}`,
					);
					if (module === undefined) {
						response.writeHead(404).end();
						return;
					}
					text = module;
				} else if (url.pathname === '/behaviour.json') {
					if (!names.has(name)) {
						response.writeHead(404).end();
						return;
					}
					type = 'application/json';
					text = JSON.stringify(
						parse(
							fs.readFileSync(path.join(CASES, name, 'behaviour.toml'), 'utf8'),
						),
					);
				} else if (url.pathname === '/environment.js') {
					text = 'export const DEV=false, BROWSER=true, BUILD=false;';
				} else {
					const file =
						url.pathname === '/runner.js'
							? RUNNER
							: url.pathname === '/vue.js'
								? VUE
								: url.pathname === '/clsx.js'
									? CLSX
									: url.pathname.startsWith('/svelte/')
										? path.join(SVELTE, url.pathname.slice('/svelte/'.length))
										: undefined;
					if (
						!file ||
						(url.pathname.startsWith('/svelte/') &&
							path.relative(SVELTE, file).startsWith('..'))
					) {
						response.writeHead(404).end();
						return;
					}
					text = fs.readFileSync(file, 'utf8');
				}
				response
					.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' })
					.end(text);
			} catch (error) {
				response.writeHead(500).end(String(error));
			}
		});
		await new Promise<void>((resolve) =>
			server.listen(0, '127.0.0.1', resolve),
		);
		const address = server.address();
		assert.ok(address && typeof address !== 'string');
		const browser = await chrome(CHROME, path.join(scratch, 'profile'));
		const trace = async (name: string, runtime: string): Promise<Result> => {
			const url = `http://127.0.0.1:${address.port}/?case=${encodeURIComponent(name)}&runtime=${runtime}`;
			const result = JSON.parse(await browser.trace(url)) as Result;
			assert.equal(
				result.error,
				undefined,
				`${name} ${runtime}: ${JSON.stringify(result)}`,
			);
			assert.deepEqual(result.errors, []);
			return {
				steps: result.steps.map((step) => ({
					html: JSON.stringify(serializeHtml(step.html)),
					observed: step.observed,
					scroll: step.scroll,
					shadow: step.shadow.map((entry) => ({
						tag: entry.tag,
						html: JSON.stringify(serializeHtml(entry.html)),
					})),
					computed: step.computed,
					motion: step.motion,
				})),
				errors: [],
			};
		};
		let positiveControls = 0;
		try {
			for (const name of cases) {
				modules.set(
					`${name}:svelte`,
					svelteModule(
						fs.readFileSync(path.join(CASES, name, 'input.svelte'), 'utf8'),
						`${name}.svelte`,
						'client',
						!!(
							parse(
								fs.readFileSync(
									path.join(CASES, name, 'behaviour.toml'),
									'utf8',
								),
							) as { custom_element?: string }
						).custom_element,
						(
							parse(
								fs.readFileSync(
									path.join(CASES, name, 'behaviour.toml'),
									'utf8',
								),
							) as Behaviour
						).experimental_async,
					),
				);
				const code = fs.readFileSync(
					path.join(CASES, name, 'expected/client.js'),
					'utf8',
				);
				modules.set(`${name}:vapor`, code);
				const expected = await trace(name, 'svelte');
				assert.equal(expected.steps.at(-1)!.observed, 0);
				assert.deepEqual(await trace(name, 'vapor'), expected, name);
				if (name === 'custom-element-options') {
					const reflection = '$$v_renderEffect(() => host.$$reflect());';
					assert.ok(code.includes(reflection));
					modules.set(`${name}:vapor`, code.replace(reflection, ''));
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing reflected props must fail',
					);
					positiveControls++;
				}
				if (name === 'custom-element-spreads') {
					const assignment = "const custom = el.nodeName.includes('-');";
					assert.ok(code.includes(assignment));
					modules.set(
						`${name}:vapor`,
						code.replace(assignment, 'const custom = false;'),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'normal element coercion on custom element spreads must fail',
					);
					positiveControls++;
				}
				if (name === 'custom-element-slots') {
					const assignment = 'named.assignedNodes()';
					assert.ok(code.includes(assignment));
					modules.set(`${name}:vapor`, code.replace(assignment, '[]'));
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing assigned slot content must fail',
					);
					positiveControls++;
				}
				if (name === 'custom-element-properties') {
					const assignment = 'if (property) element[name] = value;';
					assert.ok(code.includes(assignment));
					modules.set(
						`${name}:vapor`,
						code.replace(
							assignment,
							'if (property) element.setAttribute(name, String(value));',
						),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'stringified custom properties must fail',
					);
					positiveControls++;
				}
				if (name === 'custom-element-host') {
					assert.ok(code.includes('$$host().dispatchEvent'));
					modules.set(
						`${name}:vapor`,
						code.replace('$$host().dispatchEvent', '(() => true)'),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing host events must fail',
					);
					assert.ok(code.includes('19px'));
					modules.set(`${name}:vapor`, code.replace('19px', '20px'));
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'wrong custom element styles must fail',
					);
					positiveControls += 2;
				}
				if (name === 'animation') {
					assert.ok(code.includes('(fragment.bu ??= []).push(measure);'));
					modules.set(
						`${name}:vapor`,
						code.replace('(fragment.bu ??= []).push(measure);', ''),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing move measurement must fail',
					);
					positiveControls++;
				}
				if (name === 'transitions-global') {
					assert.ok(code.includes('const parent = initializing ?? owner;'));
					modules.set(
						`${name}:vapor`,
						code.replace(
							'const parent = initializing ?? owner;',
							'const parent = initializing;',
						),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'updates must pause in late nested outro blocks',
					);
					positiveControls++;
				}
				if (name === 'transitions') {
					assert.ok(code.includes('const controllers = [];'));
					modules.set(
						`${name}:vapor`,
						code.replace(
							'const controllers = [];',
							'const controllers = []; root.version++;',
						),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing block removal after outro must fail',
					);
					assert.ok(code.includes('`opacity: ${t}`'));
					modules.set(
						`${name}:vapor`,
						code.replace('`opacity: ${t}`', '`opacity: 1`'),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing animated CSS must fail',
					);
					positiveControls += 2;
				}
				if (name === 'transitions-deferred') {
					const condition = "typeof config === 'function'";
					assert.ok(code.includes(condition));
					modules.set(`${name}:vapor`, code.replace(condition, 'false'));
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing deferred transition resolution must fail',
					);
					positiveControls++;
				}
				if (name === 'static-attribute-whitespace') {
					assert.ok(code.includes(' a  b '));
					modules.set(`${name}:vapor`, code.replaceAll(' a  b ', ' a b '));
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'changed attribute whitespace must fail',
					);
					positiveControls++;
				}
				if (name === 'window-scroll') {
					assert.ok(code.includes('element.scrollTo'));
					modules.set(
						`${name}:vapor`,
						code.replaceAll('element.scrollTo', '(() => {})'),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'missing scroll writes must fail',
					);
					positiveControls++;
				}
				if (name === 'dimensions') {
					positiveControls += 2;
					assert.ok(code.includes('element[name]'));
					modules.set(
						`${name}:vapor`,
						code.replaceAll('element[name]', 'element[name] + 1'),
					);
					assert.notDeepEqual(
						await trace(name, 'vapor'),
						expected,
						'wrong dimensions must fail',
					);
					assert.ok(code.includes('record.observer.unobserve(element)'));
					modules.set(
						`${name}:vapor`,
						code.replace('record.observer.unobserve(element)', 'undefined'),
					);
					assert.notEqual(
						(await trace(name, 'vapor')).steps.at(-1)!.observed,
						0,
						'missing observer cleanup must fail',
					);
				}
			}
			context.diagnostic(
				`${cases.length} browser cases, ${cases.length * 2} client traces; ${positiveControls} positive controls`,
			);
		} finally {
			await browser.close();
			await new Promise<void>((resolve) => server.close(() => resolve()));
			fs.rmSync(scratch, { recursive: true, force: true });
		}
	},
);
