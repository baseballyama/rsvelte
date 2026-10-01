// The server render, in a worker thread: the main thread holds a DOM as globals for the client
// traces, and server code must run where `window` and `document` do not exist, as on a server.
import { parentPort } from 'node:worker_threads';
import { loadComponent, message, provideRuntimes } from './modules.ts';

export interface Request {
	runtime: 'svelte' | 'vue';
	file: string;
	props: Record<string, unknown>;
}
export type Response = { html: string } | { error: string };

provideRuntimes('server');

async function render({ runtime, file, props }: Request): Promise<Response> {
	let component: unknown;
	try {
		component = await loadComponent(file);
	} catch (e) {
		return { error: `load: ${message(e)}` };
	}
	try {
		if (runtime === 'svelte') {
			const { render } = await import('svelte/server');
			return { html: render(component as never, { props } as never).body };
		}
		const vue = await import('vue');
		const { renderToString } = await import('vue/server-renderer');
		const app = vue.createSSRApp(component as never, props);
		app.config.warnHandler = () => {};
		return { html: await renderToString(app) };
	} catch (e) {
		return { error: `render: ${message(e)}` };
	}
}

parentPort!.on('message', async (req: Request) => parentPort!.postMessage(await render(req)));
