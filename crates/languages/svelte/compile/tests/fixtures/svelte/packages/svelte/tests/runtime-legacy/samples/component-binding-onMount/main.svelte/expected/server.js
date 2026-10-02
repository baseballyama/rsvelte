import * as $ from 'svelte/internal/server';
import Mount from './Mount.svelte';
import { onMount, mount } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			// @ts-ignore
			mount(Mount, { target: document.querySelector('#target') });
		});

		$$renderer.push(`<div id="target"></div>`);
	});
}