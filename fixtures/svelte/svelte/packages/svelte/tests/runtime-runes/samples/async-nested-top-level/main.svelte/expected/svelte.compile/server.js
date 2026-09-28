import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export let resolve = [];

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = false;

		$$renderer.push(`<button>show</button> <button>resolve</button> `);
		$$renderer.push(`<!--[!-->`);

		{
			$$renderer.push(`<p>initializing...</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}