// The server render, in a worker thread: the main thread holds a DOM as globals for the client
// traces, and server code must run where `window` and `document` do not exist, as on a server.
import { parentPort } from 'node:worker_threads';
import { loadComponent, message, provideRuntimes } from './modules.ts';

export interface Request {
	runtime: 'svelte' | 'vue';
	file: string;
	props: Record<string, unknown>;
	include_head?: boolean;
	sourceFile?: string;
	translated?: boolean;
	experimental_async?: boolean;
}
export type Response = { html: string; head?: string } | { error: string };

provideRuntimes('server');

async function render({
	runtime,
	file,
	props,
	include_head,
	sourceFile,
	translated,
	experimental_async,
}: Request): Promise<Response> {
	let component: unknown;
	try {
		component = await loadComponent(
			file,
			false,
			sourceFile,
			translated,
			experimental_async,
		);
	} catch (e) {
		return { error: `load: ${message(e)}` };
	}
	try {
		if (runtime === 'svelte') {
			const { render } = await import('svelte/server');
			const output = render(component as never, { props } as never);
			const result = experimental_async ? await output : output;
			return { html: result.body, ...(include_head && { head: result.head }) };
		}
		const vue = await import('vue');
		const { renderToString } = await import('vue/server-renderer');
		const app = vue.createSSRApp(component as never, props);
		app.config.warnHandler = () => {};
		const context: { head?: string } = {};
		const html = await renderToString(app, context);
		return { html, ...(include_head && { head: context.head ?? '' }) };
	} catch (e) {
		return { error: `render: ${message(e)}` };
	}
}

parentPort!.on('message', async (req: Request) =>
	parentPort!.postMessage(await render(req)),
);
