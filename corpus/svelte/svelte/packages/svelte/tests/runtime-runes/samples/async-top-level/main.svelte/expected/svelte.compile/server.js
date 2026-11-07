import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let deferred = Promise.withResolvers();

	$$renderer.push(`<button>hello</button> `);
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending</p>`);
	}

	$$renderer.push(`<!--]-->`);
}