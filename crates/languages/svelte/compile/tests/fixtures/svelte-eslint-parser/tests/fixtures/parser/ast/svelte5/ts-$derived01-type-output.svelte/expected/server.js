import * as $ from 'svelte/internal/server';

export default function Ts_$derived01_type_output($$renderer) {
	let count = 0; // count: number, $state(0): 0
	const doubled = $.derived(() => count * 2); // doubled: number, $derived(count * 2): number

	$$renderer.push(`<button>${$.escape(doubled())}</button> <p>${$.escape(count)} doubled is ${$.escape(doubled())}</p>`);
}