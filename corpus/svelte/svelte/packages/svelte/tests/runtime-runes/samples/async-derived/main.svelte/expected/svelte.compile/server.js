import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let deferred = Promise.withResolvers();
	let num = 1;

	$$renderer.push(`<button>resolve a</button> <button>resolve b</button> <button>reset</button> <button>increment</button> `);
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending</p>`);
	}

	$$renderer.push(`<!--]-->`);
	$$renderer.push(` ${$.escape(console.log(`outside boundary ${num}`))}`);
}