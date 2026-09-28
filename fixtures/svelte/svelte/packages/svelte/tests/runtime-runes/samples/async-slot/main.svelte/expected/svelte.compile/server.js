import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>loading...</p>`);
	}

	$$renderer.push(`<!--]-->`);
}