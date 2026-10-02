import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<!--[!-->`);

	{
		$$renderer.push(`<p>pending...</p>`);
	}

	$$renderer.push(`<!--]-->`);
}