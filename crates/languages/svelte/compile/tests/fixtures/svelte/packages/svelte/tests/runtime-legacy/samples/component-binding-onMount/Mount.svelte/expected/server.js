import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Mount($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let element;
		let bound = false;

		onMount(() => {
			if (element) bound = true;
		});

		$$renderer.push(`<div></div> <p>Bound? ${$.escape(bound)}</p>`);
	});
}