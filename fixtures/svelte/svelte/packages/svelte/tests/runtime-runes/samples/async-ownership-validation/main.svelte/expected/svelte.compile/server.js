import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let object = { count: 0 };

	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>loading...</p>`);
	}

	$$renderer.push(`<!--]-->`);
}