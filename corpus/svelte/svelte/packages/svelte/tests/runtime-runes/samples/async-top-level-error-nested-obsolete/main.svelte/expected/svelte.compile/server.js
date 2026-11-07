import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export let route = { current: 'home' };

export default function Main($$renderer) {
	// reset from earlier tests
	route.current = 'home';

	$$renderer.push(`<button>reject</button> `);
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending</p>`);
	}

	$$renderer.push(`<!--]-->`);
}