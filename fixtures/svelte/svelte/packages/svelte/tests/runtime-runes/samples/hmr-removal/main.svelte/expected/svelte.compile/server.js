import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let open = false;

	$$renderer.push(`<button>toggle</button> `);

	if (open) {
		$$renderer.push('<!--[0-->');
		Child($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}