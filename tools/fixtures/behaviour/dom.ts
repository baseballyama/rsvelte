// The client worker's DOM globals and listener errors.
import { JSDOM, VirtualConsole } from 'jsdom';

const errors: string[] = [];
const virtualConsole = new VirtualConsole();
// An exception thrown by an event listener: jsdom reports it here instead of throwing from
// dispatchEvent, so a step records it.
virtualConsole.on('jsdomError', (e: Error) => errors.push(e.message));

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true, virtualConsole });
const win = dom.window as unknown as Record<string, unknown>;

// Both runtimes read DOM classes and `document` as globals, Vue's runtime-dom once at module
// evaluation; installing them here, before either runtime is imported, makes one window serve both.
// Node's own `Event` family is replaced too: jsdom dispatches only its own events.
for (const key of Object.getOwnPropertyNames(win)) {
	if (key in globalThis && !/Event(Target)?$/.test(key)) continue;
	Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: win[key] });
}
for (const key of ['window', 'document', 'navigator', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle']) {
	Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === 'window' ? win : win[key] });
}

export const document: Document = dom.window.document;

/** Listener exceptions reported since the last call. */
export function takeErrors(): string[] {
	return errors.splice(0);
}

export { serialize, serializeHtml } from './serialize.ts';
