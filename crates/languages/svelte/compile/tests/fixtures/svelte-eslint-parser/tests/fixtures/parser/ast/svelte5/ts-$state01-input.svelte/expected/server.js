import * as $ from 'svelte/internal/server';

export default function Ts_$state01_input($$renderer) {
	let count = 0;
	let name = void 0;

	$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
}