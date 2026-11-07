import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let x = 'x1';
	let y = 'y1';
	const deferred = Promise.withResolvers();

	$$renderer.push(`<button>x</button> <button>y</button> `);
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>loading...</p>`);
	}

	$$renderer.push(`<!--]-->`);
}