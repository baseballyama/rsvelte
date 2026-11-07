import * as $ from 'svelte/internal/server';
import { fork } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let s = 1;
		let d = $.derived(() => s * 10);

		$$renderer.push(`<button>++</button>`);
	});
}