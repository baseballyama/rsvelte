import * as $ from 'svelte/internal/server';

export default function Ts_$state01_type_output($$renderer) {
	let count = 0; // count: number, $state(0): 0
	let name = void 0; // name: unknown, $state(): unknown

	$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
}