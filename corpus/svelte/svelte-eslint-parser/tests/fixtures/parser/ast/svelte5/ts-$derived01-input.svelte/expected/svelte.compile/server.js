import * as $ from 'svelte/internal/server';

export default function Ts_$derived01_input($$renderer) {
	let count = 0;
	const doubled = $.derived(() => count * 2);

	$$renderer.push(`<button>${$.escape(doubled())}</button> <p>${$.escape(count)} doubled is ${$.escape(doubled())}</p>`);
}