import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let show = false;

	$$renderer.push(`<button>show</button> `);
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending</p>`);
	}

	$$renderer.push(`<!--]-->`);
}