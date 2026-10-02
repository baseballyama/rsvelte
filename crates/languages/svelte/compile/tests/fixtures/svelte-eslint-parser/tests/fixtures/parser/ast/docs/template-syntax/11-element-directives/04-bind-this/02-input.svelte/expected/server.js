import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function _2_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let canvasElement;

		onMount(() => {
			const ctx = canvasElement.getContext('2d');

			drawStuff(ctx);
		});

		$$renderer.push(`<canvas></canvas>`);
	});
}