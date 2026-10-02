import * as $ from 'svelte/internal/server';
import { fork } from 'svelte';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let x = 'world';

		$$renderer.push(`<button>fork</button> `);

		if (x === 'universe') {
			$$renderer.push('<!--[0-->');
			Child($$renderer, { x });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}