import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Main($$renderer) {
	let show = true;

	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending</p>`);
	}

	$$renderer.push(`<!--]-->`);
}