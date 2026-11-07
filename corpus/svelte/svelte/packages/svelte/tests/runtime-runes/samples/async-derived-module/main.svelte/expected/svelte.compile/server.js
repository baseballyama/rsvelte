import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let num = 1;
	let deferred = Promise.withResolvers();

	$$renderer.push(`<button>reset</button> <button>a</button> <button>b</button> <button>increment</button> `);
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending</p>`);
	}

	$$renderer.push(`<!--]-->`);
	$$renderer.push(` ${$.escape(console.log(`outside boundary ${num}`))}`);
}