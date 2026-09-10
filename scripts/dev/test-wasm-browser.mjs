#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { compile, compileModule } from '../../submodules/svelte/packages/svelte/src/compiler/index.js';

const component = '<script>let n = $state(0);</script><button onclick={() => n++}>{n}</button><style>button { color: red }</style>';
const moduleSource = 'export function counter() { let n = $state(0); return () => n++; }';
const options = { filename: 'Browser.svelte', generate: 'client', css: 'injected' };
const moduleOptions = { filename: 'state.svelte.js', generate: 'client', dev: true };
const expected = {
	component: compile(component, { ...options, cssHash: ({ hash, css }) => `custom-${hash(css)}` }).js.code,
	module: compileModule(moduleSource, moduleOptions).js.code,
};
const exercise = `
import init, * as compiler from '/rsvelte_compiler.js';
await init();
const result = {
  component: JSON.parse(compiler.compile(${JSON.stringify(component)}, {
    ...${JSON.stringify(options)}, cssHash: ({ hash, css }) => 'custom-' + hash(css)
  })).js.code,
  module: JSON.parse(compiler.compileModule(${JSON.stringify(moduleSource)}, ${JSON.stringify(moduleOptions)})).js.code
};
if ('lint' in compiler || 'svelte2tsx' in compiler) throw new Error('non-compiler export loaded');
`;
const requests = [];
const server = createServer(async (req, res) => {
	requests.push(req.url);
	try {
		if (req.url === '/') {
			res.setHeader('Content-Type', 'text/html');
			res.end('<!doctype html><title>Compiler wasm browser test</title>');
		} else if (req.url === '/main.js') {
			res.setHeader('Content-Type', 'text/javascript');
			res.end(`${exercise}\nexport default result;`);
		} else if (req.url === '/worker.js') {
			res.setHeader('Content-Type', 'text/javascript');
			res.end(`${exercise}\npostMessage(result);`);
		} else if (['/rsvelte_compiler.js', '/rsvelte_compiler_bg.wasm'].includes(req.url)) {
			res.setHeader('Content-Type', req.url.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
			res.end(await readFile(new URL(`../../pkg${req.url}`, import.meta.url)));
		} else {
			res.writeHead(404).end();
		}
	} catch (error) {
		res.writeHead(500).end(String(error));
	}
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const profile = await mkdtemp(join(tmpdir(), 'rsvelte-wasm-browser-'));
const chromePath = process.env.CHROME_BIN ?? (process.platform === 'darwin'
	? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const chrome = spawn(chromePath, ['--headless=new', '--no-first-run', '--no-default-browser-check',
	'--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = '';
chrome.stderr.on('data', (chunk) => { stderr += chunk; });
let launchError;
chrome.on('error', (error) => { launchError = error; });
let socket;
try {
	let port;
	for (let attempt = 0; attempt < 150; attempt++) {
		if (launchError) throw launchError;
		try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
		catch (error) { if (error.code !== 'ENOENT') throw error; }
		if (chrome.exitCode !== null) throw new Error(`Chrome exited: ${stderr}`);
		await delay(100);
	}
	assert.ok(port, `Chrome did not start: ${stderr}`);
	const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
	const target = targets.find((entry) => entry.type === 'page');
	assert.ok(target, 'Chrome must expose a page target');
	socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
	let nextId = 0;
	const pending = new Map();
	socket.onmessage = ({ data }) => {
		const message = JSON.parse(data);
		if (message.id && pending.has(message.id)) {
			const { resolve, reject, timer } = pending.get(message.id);
			pending.delete(message.id);
			clearTimeout(timer);
			if (message.error) reject(new Error(JSON.stringify(message.error)));
			else resolve(message.result);
		}
	};
	const cdp = (method, params) => new Promise((resolve, reject) => {
		const id = ++nextId;
		const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 60000);
		pending.set(id, { resolve, reject, timer });
		socket.send(JSON.stringify({ id, method, params }));
	});
	const origin = `http://127.0.0.1:${server.address().port}`;
	await cdp('Page.navigate', { url: origin });
	let ready = false;
	for (let attempt = 0; attempt < 100; attempt++) {
		const value = await cdp('Runtime.evaluate', { expression: `location.origin === ${JSON.stringify(origin)} && document.readyState === 'complete'`, returnByValue: true });
		if (value.result.value) { ready = true; break; }
		await delay(50);
	}
	assert.ok(ready, 'test page must finish loading');
	const evaluation = await cdp('Runtime.evaluate', { awaitPromise: true, returnByValue: true,
		expression: `(async () => {
			const main = (await import('/main.js')).default;
			const worker = await new Promise((resolve, reject) => {
				const worker = new Worker('/worker.js', { type: 'module' });
				worker.onmessage = ({ data }) => { worker.terminate(); resolve(data); };
				worker.onerror = (event) => { worker.terminate(); reject(new Error(event.message)); };
			});
			return { main, worker };
		})()` });
	assert.equal(evaluation.exceptionDetails, undefined, JSON.stringify(evaluation.exceptionDetails));
	assert.deepEqual(evaluation.result.value, { main: expected, worker: expected });
	assert.ok(requests.includes('/rsvelte_compiler_bg.wasm'), 'default init must fetch the compiler wasm');
	assert.ok(!requests.some((url) => /playground|rsvelte_lint/.test(url)), 'compiler must not request the fat bundle');
	console.log('PASS: browser main thread and module worker compile components and rune modules against pinned Svelte; default init fetches compiler-only wasm.');
	console.log(JSON.stringify({ requests }));
} finally {
	socket?.close();
	chrome.kill();
	await new Promise((resolve) => { if (chrome.exitCode !== null || launchError) resolve(); else chrome.once('exit', resolve); });
	await new Promise((resolve) => server.close(resolve));
	await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
