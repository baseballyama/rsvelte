import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Main($$renderer) {
	let value = 'hello';
	let innerComp = void 0;

	// Reads Inner's derived value from outside the {#if} block, keeping it
	// connected in the reactive graph even after the branch is destroyed.
	const externalView = $.derived(() => innerComp?.getProcessed() ?? '');

	if (value) {
		$$renderer.push('<!--[0-->');

		const result = value;

		Inner($$renderer, { data: result });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>clear</button> <p>${$.escape(externalView())}</p>`);
}