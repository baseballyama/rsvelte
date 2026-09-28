import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let d1 = Promise.withResolvers();
	let d2 = Promise.withResolvers();
	let deferred = d1;

	$$renderer.push(`<button>switch to d2</button> <button>resolve d1</button> <button>resolve d2</button> `);
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending</p>`);
	}

	$$renderer.push(`<!--]-->`);
}