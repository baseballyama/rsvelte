// The client trace, in a worker thread that owns the DOM (./dom.ts) both runtimes render into.
// Server requests are normalized here too, after ./server.ts renders them in a DOM-free thread.
import { parentPort } from 'node:worker_threads';
import { document, serialize, serializeHtml, takeErrors } from './dom.ts';
import { loadComponent, message, provideRuntimes } from './modules.ts';
import type { ClientStep, Runtime, Step, Trace, TraceRequest } from './runtime.ts';
import type { Request, Response } from './server.ts';
import { rpc } from './worker.ts';

provideRuntimes('client');

const renderServer = rpc<Request, Response>(new URL('./server.ts', import.meta.url), (m) => ({ error: `worker: ${m}` }));

/** Lets every pending microtask and timer-free update run, so a trace does not see when within the event a runtime renders. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

interface Mounted {
	flush(): Promise<void>;
	unmount(): void;
}

async function mount(runtime: Runtime, component: unknown, props: Record<string, unknown>, target: Element): Promise<Mounted> {
	if (runtime === 'svelte') {
		const svelte = await import('svelte');
		const app = svelte.mount(component as never, { target, props });
		const flush = async () => {
			svelte.flushSync();
			await settle();
			svelte.flushSync();
		};
		await flush();
		return { flush, unmount: () => void svelte.unmount(app) };
	}
	const vue = await import('vue');
	const app = vue.createApp(component as never, props);
	app.config.warnHandler = () => {};
	app.mount(target);
	const flush = async () => {
		await vue.nextTick();
		await settle();
		await vue.nextTick();
	};
	await flush();
	return { flush, unmount: () => app.unmount() };
}

function find(root: Element, selector: string): HTMLElement {
	const el = root.querySelector(selector);
	if (!el) throw new Error(`no element matches ${JSON.stringify(selector)}`);
	return el as HTMLElement;
}

const event = (type: string, init: EventInit = {}) => new Event(type, { bubbles: true, ...init });

// The browser's own event sequence for each user action, dispatched on the first match of the
// step's selector.
function perform(root: Element, step: Step): void {
	const verbs = Object.keys(step);
	if (verbs.length !== 1) throw new Error(`a step has exactly one action: ${JSON.stringify(step)}`);
	if ('click' in step) find(root, step.click).click();
	else if ('input' in step) {
		const el = find(root, step.input[0]) as HTMLInputElement;
		el.value = step.input[1];
		el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: step.input[1] }));
	} else if ('change' in step) find(root, step.change).dispatchEvent(event('change'));
	else if ('select' in step) {
		const el = find(root, step.select[0]) as HTMLSelectElement;
		el.value = step.select[1];
		el.dispatchEvent(event('input'));
		el.dispatchEvent(event('change'));
	} else if ('key' in step) {
		const el = find(root, step.key[0]);
		for (const type of ['keydown', 'keyup']) el.dispatchEvent(new KeyboardEvent(type, { key: step.key[1], bubbles: true, cancelable: true }));
	} else if ('submit' in step) find(root, step.submit).dispatchEvent(event('submit', { cancelable: true }));
	else throw new Error(`unknown step action ${JSON.stringify(verbs[0])}`);
}

async function trace({ runtime, target, file, behaviour }: TraceRequest): Promise<Trace> {
	const props = behaviour.props ?? {};
	if (target === 'server') {
		const r = await renderServer({ runtime, file, props });
		return 'html' in r ? { html: serializeHtml(r.html) } : r;
	}
	let component: unknown;
	try {
		component = await loadComponent(file);
	} catch (e) {
		return { error: `load: ${message(e)}` };
	}
	const root = document.body.appendChild(document.createElement('div'));
	const steps: ClientStep[] = [];
	takeErrors();
	let app: Mounted | undefined;
	try {
		try {
			app = await mount(runtime, component, props, root);
		} catch (e) {
			steps.push({ do: 'mount', error: message(e) });
			return { steps };
		}
		steps.push(record('mount', root));
		for (const step of behaviour.steps ?? []) {
			try {
				perform(root, step);
				await app.flush();
			} catch (e) {
				steps.push({ do: step, error: message(e) });
				return { steps };
			}
			steps.push(record(step, root));
		}
		return { steps };
	} finally {
		try {
			app?.unmount();
		} catch {}
		root.remove();
	}
}

function record(what: ClientStep['do'], root: Element): ClientStep {
	const errors = takeErrors();
	return { do: what, dom: serialize(root), ...(errors.length > 0 && { errors }) };
}


parentPort!.on('message', async (req: TraceRequest) => parentPort!.postMessage(await trace(req)));
