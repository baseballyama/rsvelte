// A behaviour trace: a compiled component module mounted on its runtime, driven through a unit's
// steps, with the normalized DOM recorded after each (client), or its server-rendered HTML
// normalized the same way (server). The same function traces the official toolchain's modules
// (expected) and rsvelte's (actual), so the two sides differ only in the code under test.
//
// The work runs in worker threads, never here: the client trace needs a DOM installed as globals
// (./client.ts), which would leak into every other task sharing this process, and the server
// render must run where no DOM exists at all (./server.ts).
import type { Target } from './modules.ts';
import { rpc } from './worker.ts';

export { moduleFile } from './modules.ts';

export type Runtime = 'svelte' | 'vue';

export type Step =
	| { click: string }
	| { input: [string, string] }
	| { change: string }
	| { select: [string, string] }
	| { key: [string, string] }
	| { submit: string };

export interface Behaviour {
	props?: Record<string, unknown>;
	steps?: Step[];
}

export interface ClientStep {
	do: 'mount' | Step;
	dom?: string[];
	error?: string;
	errors?: string[];
}
export type Trace = { steps: ClientStep[] } | { html: string[] } | { error: string };

export interface TraceRequest {
	runtime: Runtime;
	target: Target;
	file: string;
	behaviour: Behaviour;
}

const call = rpc<TraceRequest, Trace>(new URL('./client.ts', import.meta.url), (m) => ({ error: `worker: ${m}` }));

/** The behaviour trace of the component module `file` exports, on `runtime`, for one build target. */
export const trace = (runtime: Runtime, target: Target, file: string, behaviour: Behaviour): Promise<Trace> => call({ runtime, target, file, behaviour });

/** Errors a trace carries; the official toolchain's trace must have none. */
export function traceErrors(t: Trace): string[] {
	if ('error' in t) return [t.error];
	if ('html' in t) return [];
	return t.steps.flatMap((s) => [...(s.error ? [s.error] : []), ...(s.errors ?? [])]);
}

/** Where two traces first differ, in words, or null when they are equal. */
export function traceDiff(expected: Trace, actual: Trace): string | null {
	if (JSON.stringify(expected) === JSON.stringify(actual)) return null;
	if ('error' in actual) return actual.error;
	if ('html' in expected && 'html' in actual) return `server html: ${linesDiff(expected.html, actual.html)}`;
	if (!('steps' in expected) || !('steps' in actual)) return 'different trace kinds';
	for (let i = 0; i < Math.max(expected.steps.length, actual.steps.length); i++) {
		const e = expected.steps[i];
		const a = actual.steps[i];
		if (JSON.stringify(e) === JSON.stringify(a)) continue;
		const at = `step ${i} ${JSON.stringify((e ?? a)!.do)}`;
		if (!a) return `${at}: the actual trace ends before it`;
		if (!e) return `${at}: the actual trace has an extra step`;
		if (a.error) return `${at}: ${a.error}`;
		if (JSON.stringify(e.errors) !== JSON.stringify(a.errors)) return `${at}: listener errors ${JSON.stringify(a.errors ?? [])}, expected ${JSON.stringify(e.errors ?? [])}`;
		return `${at}: ${linesDiff(e.dom ?? [], a.dom ?? [])}`;
	}
	return 'traces differ';
}

function linesDiff(expected: string[], actual: string[]): string {
	let i = 0;
	while (i < expected.length && expected[i] === actual[i]) i++;
	const show = (l: string | undefined) => (l === undefined ? '<end>' : l.trim());
	return `line ${i + 1}: expected ${show(expected[i])}, actual ${show(actual[i])}`;
}
