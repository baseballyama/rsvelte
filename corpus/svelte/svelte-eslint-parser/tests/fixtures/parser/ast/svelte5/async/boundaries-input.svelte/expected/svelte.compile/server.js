import * as $ from 'svelte/internal/server';
import MyApp from './MyApp.svelte';

export default function Boundaries_input($$renderer) {
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>loading...</p>`);
	}

	$$renderer.push(`<!--]-->`);
}